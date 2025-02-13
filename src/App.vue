<template>
  <div class="minesweeper">
    <DifficultySelector v-model:currentLevel="gameConfig.level" @level-select="handleLevelSelect" />
    <GameStatus ref="gameStatusRef" @restart="handleRestart" :mines-left="minesLeft" />
    <GameBoard ref="gameBoardRef" :rows="gameConfig.rows" :cols="gameConfig.cols" :mine-field="mineField"
      @cell-reveal="handleCellReveal" @cell-flag="handleCellFlag" @cell-unflag="handleCellUnflag" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DifficultySelector from './components/DifficultySelector.vue'
import GameStatus from './components/GameStatus.vue'
import GameBoard from './components/GameBoard.vue'
import { MineGenerator } from './utils/mineGenerator'

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

// 游戏状态
const mineField = ref<number[][]>([])
const minesLeft = ref(10)
const isGameStarted = ref(false)
const isGameOver = ref(false)

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
  minesLeft.value = gameConfig.value.mines
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

// 处理重新开始
// 修改 handleRestart
const handleRestart = () => {
  initGame()
  gameBoardRef.value?.resetBoard()
  gameStatusRef.value?.resetTimer()
  isGameStarted.value = false
  isGameOver.value = false
}

// 添加节流函数工具
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

// 修改 handleCellReveal
const handleCellRevealImpl = async (row: number, col: number) => {
  if (isGameOver.value) return

  if (!isGameStarted.value) {
    // 第一次点击
    isGameStarted.value = true
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
      console.log('重新生成雷区', mineField.value)
    }
  } else if (mineField.value[row][col] === -1) {
    // 点到地雷，游戏结束
    isGameOver.value = true
    alert('游戏结束！你踩到地雷了！')
    return
  }

  // 检查是否获胜
  console.log('检查是否获胜')
  const totalCells = gameConfig.value.rows * gameConfig.value.cols
  const revealedCount = gameBoardRef.value?.getRevealedCount() || 0
  const nonMineCount = totalCells - gameConfig.value.mines

  if (revealedCount === nonMineCount) {
    isGameOver.value = true
    alert('恭喜你！扫雷成功！')
  }
}

// 使用节流包装原始函数，设置 100ms 的节流时间
const handleCellReveal = throttle(handleCellRevealImpl, 168)

// 处理标记
const handleCellFlag = (row: number, col: number) => {
  minesLeft.value--
}

// 处理取消标记
const handleCellUnflag = (row: number, col: number) => {
  minesLeft.value++
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