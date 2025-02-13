<template>
  <div class="minesweeper">
    <DifficultySelector v-model:currentLevel="gameConfig.level" @level-select="handleLevelSelect" />
    <GameStatus ref="gameStatusRef" @restart="handleRestart" :mines-left="minesLeft" />
    <GameBoard ref="gameBoardRef" :rows="gameConfig.rows" :cols="gameConfig.cols" :mine-field="mineField"
      :cell-states="cellStates" @cell-reveal="handleCellReveal" @cell-flag="handleCellFlag"
      @cell-unflag="handleCellUnflag" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import DifficultySelector from './components/DifficultySelector.vue'
import GameStatus from './components/GameStatus.vue'
import GameBoard from './components/GameBoard.vue'
import { MineGenerator } from './utils/mineGenerator'
import { CellStateEnum, GameStateEnum } from '@/utils/types'

interface GameConfig {
  level: string
  rows: number
  cols: number
  mines: number
}

// 游戏配置
const gameConfig = ref<GameConfig>({
  level: '初级',
  rows: 9,
  cols: 9,
  mines: 10
})

const gameState = ref<GameStateEnum>(GameStateEnum.Ready)
const mineField = ref<number[][]>([])
const cellStates = ref<CellStateEnum[][]>([]) // 新增状态数组
const minesLeft = ref(10)

// 从本地存储加载配置
const loadConfig = () => {
  const savedConfig = localStorage.getItem('minesweeperConfig')
  if (savedConfig) {
    gameConfig.value = JSON.parse(savedConfig)
  }
}

// 保存配置到本地存储
const saveConfig = () => {
  localStorage.setItem('minesweeperConfig', JSON.stringify(gameConfig.value))
}

// 初始化游戏
const initGame = () => {
  const field = MineGenerator.generate({
    rows: gameConfig.value.rows,
    cols: gameConfig.value.cols,
    mineCount: gameConfig.value.mines
  })
  mineField.value = field

  cellStates.value = Array.from({ length: gameConfig.value.rows }, () =>
    Array(gameConfig.value.cols).fill(CellStateEnum.Hidden)
  )

  minesLeft.value = gameConfig.value.mines
  gameState.value = GameStateEnum.Ready

  gameStatusRef.value?.resetTimer()
}

// 处理难度选择
const handleLevelSelect = (level: { name: string, rows: number, cols: number, mines: number }) => {
  gameConfig.value = {
    level: level.name,
    rows: level.rows,
    cols: level.cols,
    mines: level.mines
  }
  saveConfig()
  initGame()
}

const gameStatusRef = ref<InstanceType<typeof GameStatus> | null>(null)
const gameBoardRef = ref<InstanceType<typeof GameBoard> | null>(null)

const handleRestart = initGame

// 添加节流函数工具. 可以用聚合更新
const throttle = <T extends (...args: any[]) => any>(fn: T, delay: number) => {
  let lastTime = 0
  return (...args: Parameters<T>): ReturnType<T> | undefined => {
    const now = Date.now()
    if (now - lastTime >= delay) {
      lastTime = now
      return fn(...args)
    }
  }
}

const handleCellRevealImpl = async (row: number, col: number) => {
  console.log('handleCellReveal', row, col)
  if (gameState.value === GameStateEnum.Lost || gameState.value === GameStateEnum.Won) return

  if (cellStates.value[row][col] !== CellStateEnum.Hidden) return // 已翻开或已标记的格子不处理

  if (gameState.value === GameStateEnum.Ready) { // 第一次点击
    gameState.value = GameStateEnum.Playing
    gameStatusRef.value?.startTimer()

    if (mineField.value[row][col] !== 0) {
      const excludePositions: [number, number][] = [[row, col]]
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          const newRow = row + i
          const newCol = col + j
          if (newRow >= 0 && newRow < gameConfig.value.rows &&
            newCol >= 0 && newCol < gameConfig.value.cols) {
            excludePositions.push([newRow, newCol])
          }
        }
      }

      const field = MineGenerator.generate({
        rows: gameConfig.value.rows,
        cols: gameConfig.value.cols,
        mineCount: gameConfig.value.mines,
        excludePositions,
      })
      mineField.value = field
      console.log('重新生成雷区，状态不变', mineField.value)
      nextTick(() => {
        gameBoardRef.value?.handleReveal(row, col)
      })

      return
    }
  }

  cellStates.value[row][col] = CellStateEnum.Revealed

  if (mineField.value[row][col] === -1) { // 点到地雷，游戏结束
    gameStatusRef.value?.stopTimer()

    gameState.value = GameStateEnum.Lost
    const gameTime = gameStatusRef.value?.getTime() || 0
    const minutes = Math.floor(gameTime / 60)
    const seconds = gameTime % 60
    const timeStr = `${minutes}分${seconds}秒`

    nextTick(async () => {
      await new Promise(resolve => setTimeout(resolve, 100)) // 翻牌子有动画
      if (confirm(`很遗憾，你被炸死了！\n游戏时长：${timeStr}\n\n要再来一局吗？`)) {
        handleRestart()
      }
    })
    return
  }

  const isAllRevealed = cellStates.value.every((row, rowIndex) =>
    row.every((cellState, colIndex) =>
      cellState === CellStateEnum.Revealed || mineField.value[rowIndex][colIndex] === -1
    )
  )
  if (isAllRevealed) {
    gameStatusRef.value?.stopTimer()

    gameState.value = GameStateEnum.Won
    const gameTime = gameStatusRef.value?.getTime() || 0
    const minutes = Math.floor(gameTime / 60)
    const seconds = gameTime % 60
    const timeStr = `${minutes}分${seconds}秒`

    nextTick(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
      if (confirm(`恭喜你，你赢了！\n游戏时长：${timeStr}\n\n要再来一局吗？`)) {
        handleRestart()
      }
    })
    return
  }
}

// 使用节流包装原始函数，设置 100ms 的节流时间
// const handleCellReveal = throttle(handleCellRevealImpl, 168)
const handleCellReveal = handleCellRevealImpl

// 处理标记
const handleCellFlag = (row: number, col: number) => {
  if (cellStates.value[row][col] === CellStateEnum.Hidden) {
    cellStates.value[row][col] = CellStateEnum.Flagged
    minesLeft.value--
  }
}

const handleCellUnflag = (row: number, col: number) => {
  if (cellStates.value[row][col] === CellStateEnum.Flagged) {
    cellStates.value[row][col] = CellStateEnum.Hidden
    minesLeft.value++
  }
}

// 组件挂载时初始化
onMounted(() => {
  loadConfig()
  initGame()
})
</script>

<style>
.minesweeper {
  box-sizing: border-box;
  padding: 20px;
}

@media (max-width: 768px) {
  .minesweeper {
    padding: 10px;
  }
}

/* 全局样式 */
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background: #fafafa;
}
</style>