<template>
  <div class="minesweeper">

    <div class="game-header">
      <DifficultySelector v-model:currentLevel="gameConfig.level" @level-select="handleLevelSelect" />
      <button class="rule-btn" @click="showRules = true">📖 规则</button>
    </div>
    <GameStatus ref="gameStatusRef" @restart="handleRestart" :mines-left="minesLeft"
      :is-lost="gameState === GameStateEnum.Lost" :safe-count="safeToolCount" @use-safe-tool="handleUseSafeTool" />
    <GameBoard ref="gameBoardRef" :rows="gameConfig.rows" :cols="gameConfig.cols" :mine-field="mineField"
      :cell-states="cellStates" @cell-reveal="handleCellReveal" @cell-flag="handleCellFlag"
      @cell-unflag="handleCellUnflag" />

    <div v-if="showTip" class="tip-message">
      {{ msg }}
    </div>
    <RuleDialog :visible="showRules" @close="showRules = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import DifficultySelector from './components/DifficultySelector.vue'
import GameStatus from './components/GameStatus.vue'
import GameBoard from './components/GameBoard.vue'
import RuleDialog from './components/RuleDialog.vue'
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

const msg = ref('')
const gameState = ref<GameStateEnum>(GameStateEnum.Ready)
const mineField = ref<number[][]>([])
const cellStates = ref<CellStateEnum[][]>([]) // 新增状态数组
const minesLeft = ref(10)
const showRules = ref(false)
// 添加安全格道具数量
const safeToolCount = ref(1)
// 使用安全格道具
const handleUseSafeTool = () => {
  if (safeToolCount.value <= 0) return

  // 查找未翻开的空格子
  const safePositions: [number, number][] = []
  mineField.value.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell === 0 && cellStates.value[rowIndex][colIndex] === CellStateEnum.Hidden) {
        safePositions.push([rowIndex, colIndex])
      }
    })
  })

  if (safePositions.length === 0) {
    showTipMessage('已经不存在安全格了！')
    return
  }

  // 随机选择一个安全格
  const randomIndex = Math.floor(Math.random() * safePositions.length)
  const [row, col] = safePositions[randomIndex]

  // 使用道具
  safeToolCount.value--
  gameBoardRef.value?.handleReveal(row, col)
}

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
  try {
    safeToolCount.value = 1
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
  } catch (error: any) {
    showTipMessage(error)
  }
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

// 所有格子都翻开
const handleAllReveal = () => {
  cellStates.value.forEach((row, rowIndex) => {
    row.forEach((cellState, colIndex) => cellStates.value[rowIndex][colIndex] = CellStateEnum.Revealed)
  })
}

const handleCellRevealImpl = async (row: number, col: number) => {
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
    handleAllReveal()

    gameState.value = GameStateEnum.Lost
    const gameTime = gameStatusRef.value?.getTime() || 0
    const minutes = Math.floor(gameTime / 60)
    const seconds = gameTime % 60
    const timeStr = `${minutes}分${seconds}秒`

    nextTick(async () => {
      await new Promise(resolve => setTimeout(resolve, 100)) // 翻牌子有动画
      if (confirm(`很遗憾，游戏结束！\n游戏时长：${timeStr}\n\n要再来一局吗？`)) {
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
    handleAllReveal()

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
const showTip = ref(false)
const tipTimer = ref<number | null>(null)

// 显示提示
const showTipMessage = (str: string) => {
  msg.value = str
  showTip.value = true
  // 清除之前的定时器
  if (tipTimer.value) {
    clearTimeout(tipTimer.value)
  }
  // 3秒后自动隐藏
  tipTimer.value = setTimeout(() => {
    showTip.value = false
  }, 3000)
}

const handleCellFlag = (row: number, col: number) => {
  if (cellStates.value[row][col] === CellStateEnum.Hidden) {
    if (minesLeft.value <= 0) {
      showTipMessage('已达到最大标记数量！')
      return
    }

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

onUnmounted(() => {
  if (tipTimer.value) {
    clearTimeout(tipTimer.value)
  }
})
</script>

<style>
.minesweeper {
  box-sizing: border-box;
  padding: 20px;
}

.tip-message {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -20px);
  }

  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
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
    Ubuntu,
      Cantarell,
      'Open Sans',
      'Helvetica Neue',
      sans-serif;
}
.game-header {
  display: flex;
  gap: 16px;
  align-items: center;
  width: 100%;
  justify-content: space-between;
}

.rule-btn {
  padding: 8px 16px;
  background: #f0f0f0;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
}

.rule-btn:hover {
  background: #e0e0e0;
}

@media (max-width: 768px) {
  .game-header {
    gap: 8px;
  }

  .rule-btn {
    padding: 6px 12px;
    font-size: 14px;
  }
}
</style>