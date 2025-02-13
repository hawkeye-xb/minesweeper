<template>
  <div class="game-board" :style="boardStyle">
    <div v-for="(row, rowIndex) in mineField" :key="rowIndex" class="board-row">
      <MineCell
        v-for="(cell, colIndex) in row"
        :key="`${rowIndex}-${colIndex}`"
        :value="cell"
        :row="rowIndex"
        :col="colIndex"
        :ref="el => setCellRef(rowIndex, colIndex, el)"
        @reveal="handleReveal"
        @flag="handleFlag"
        @unflag="handleUnflag"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import MineCell from './MineCell.vue'

const props = defineProps<{
  rows: number
  cols: number
  mineField: number[][]
}>()

const emit = defineEmits<{
  (e: 'cellReveal', row: number, col: number): void
  (e: 'cellFlag', row: number, col: number): void
  (e: 'cellUnflag', row: number, col: number): void
}>()

// 存储所有格子的引用
const cellRefs = ref<Map<string, any>>(new Map())

// 设置格子引用
const setCellRef = (row: number, col: number, el: any) => {
  if (el) {
    cellRefs.value.set(`${row}-${col}`, el)
  }
}

// 获取格子引用
const getCellRef = (row: number, col: number) => {
  return cellRefs.value.get(`${row}-${col}`)
}

// 检查坐标是否有效
const isValidPosition = (row: number, col: number): boolean => {
  return row >= 0 && row < props.rows && col >= 0 && col < props.cols
}

// 获取周围格子的坐标
const getNeighbors = (row: number, col: number): [number, number][] => {
  const neighbors: [number, number][] = []
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue
      const newRow = row + i
      const newCol = col + j
      if (isValidPosition(newRow, newCol)) {
        neighbors.push([newRow, newCol])
      }
    }
  }
  return neighbors
}

// 自动翻开空白格子
const autoReveal = async (row: number, col: number, revealed = new Set<string>()) => {
  const cellKey = `${row}-${col}`
  if (revealed.has(cellKey)) return
  
  const cell = getCellRef(row, col)
  if (!cell || cell.isRevealed || cell.isFlagged) return

  // 记录当前格子已被翻开
  revealed.add(cellKey)
  
  // 翻开当前格子
  cell.reveal()
  emit('cellReveal', row, col)

  // 如果是空格子，继续翻开周围的格子
  if (props.mineField[row][col] === 0) {
    const neighbors = getNeighbors(row, col)
    // 使用 Promise.all 和延迟来创建连锁动画效果
    await Promise.all(
      neighbors.map(async ([r, c]) => {
        await new Promise(resolve => setTimeout(resolve, 50))
        await autoReveal(r, c, revealed)
      })
    )
  }
}

const handleReveal = async (row: number, col: number) => {
  emit('cellReveal', row, col)
  
  // 如果点击的是空格子，触发自动翻开
  if (props.mineField[row][col] === 0) {
    await autoReveal(row, col)
  }
}

const handleFlag = (row: number, col: number) => {
  emit('cellFlag', row, col)
}

const handleUnflag = (row: number, col: number) => {
  emit('cellUnflag', row, col)
}

const boardStyle = computed(() => ({
  gridTemplateColumns: `repeat(${props.cols}, 1fr)`,
}))
</script>

<style scoped>
.game-board {
  display: grid;
  gap: 4px;
  background: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin: 0 auto;
  padding: 8px;
  width: fit-content;
}

@media (max-width: 768px) {
  .game-board {
    width: 100%;
    padding: 4px;
    gap: 2px;
  }
}
</style>