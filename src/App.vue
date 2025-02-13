<template>
  <div class="minesweeper">
    <DifficultySelector v-model:currentLevel="gameConfig.level" @level-select="handleLevelSelect" />
    <GameStatus @restart="handleRestart" :mines-left="minesLeft" />
    <GameBoard :rows="gameConfig.rows" :cols="gameConfig.cols" :mine-field="mineField" @cell-reveal="handleCellReveal"
      @cell-flag="handleCellFlag" @cell-unflag="handleCellUnflag" />
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

// 处理重新开始
const handleRestart = () => {
  initGame()
}

// 处理格子点击
const handleCellReveal = (row: number, col: number) => {
  // 这里后续添加游戏逻辑
  console.log('揭开格子', row, col)
}

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