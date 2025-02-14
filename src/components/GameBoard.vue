<template>
	<div class="game-board-outside">
		<div class="game-board">
			<div v-for="(row, rowIndex) in mineField" :key="rowIndex" class="board-row" :style="boardStyle">
				<MineCell v-for="(cell, colIndex) in row" :key="`${rowIndex}-${colIndex}`" :value="cell" :row="rowIndex"
					:col="colIndex" :state="cellStates[rowIndex][colIndex]" @reveal="handleReveal" @flag="handleFlag"
					@unflag="handleUnflag" />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import MineCell from './MineCell.vue'
import { CellStateEnum } from '@/utils/types'

const props = defineProps<{
  rows: number
  cols: number
  mineField: number[][]
	cellStates: number[][]
}>()

console.log(props)

const emit = defineEmits<{
  (e: 'cellReveal', row: number, col: number): void
  (e: 'cellFlag', row: number, col: number): void
  (e: 'cellUnflag', row: number, col: number): void
}>()

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

const handleReveal = async (row: number, col: number, revealed = new Set<string>()) => {
	const cellKey = `${row}-${col}`
	if (revealed.has(cellKey) || props.cellStates[row][col] !== CellStateEnum.Hidden) return
	revealed.add(cellKey)

	emit('cellReveal', row, col)

	if (props.mineField[row][col] === 0) {
		const neighbors = getNeighbors(row, col)
		await Promise.all(
			neighbors.map(async ([r, c]) => {
				await new Promise(resolve => setTimeout(resolve, 50))
				handleReveal(r, c, revealed)
			})
		)
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

defineExpose({
	handleReveal
})
</script>

<style scoped>
.game-board-outside {
	width: 100%;
	background: #f5f5f5;
	overflow: auto;
	border-radius: 8px;
}

.game-board {
	gap: 4px;
		background: #f5f5f5;
		border-radius: 8px;
		margin: 0 auto;
			padding: 8px;
			width: fit-content;
}

.board-row {
	display: grid;
}
@media (max-width: 768px) {
  .game-board {
    width: 100%;
		padding: 0;
    gap: 2px;
  }
}
</style>