<template>
	<div class="mine-cell" :class="{
		'is-revealed': isRevealed,
		'is-flagged': isFlagged,
		'mine-1-3': isRevealed && value > 0 && value <= 3,
		'mine-4-6': isRevealed && value >= 4 && value <= 6,
		'mine-7-8': isRevealed && value >= 7 && value <= 8,
	}" @click="handleClick" @contextmenu.prevent="handleRightClick">
		<template v-if="isRevealed">
			<template v-if="value === -1">
				💣
			</template>
			<template v-else-if="value > 0">
				{{ value }}
			</template>
		</template>
		<template v-else-if="isFlagged">
			🚩
		</template>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { CellStateEnum } from '@/utils/types'

interface Props {
	value: number
	row: number
	col: number
	state: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
	(e: 'reveal', row: number, col: number): void
	(e: 'flag', row: number, col: number): void
	(e: 'unflag', row: number, col: number): void
}>()

const isRevealed = computed(() => props.state === CellStateEnum.Revealed)
const isFlagged = computed(() => props.state === CellStateEnum.Flagged)

// 处理左键点击
const handleClick = () => {
	if (props.state === CellStateEnum.Hidden) { // 未翻开状态
		emit('reveal', props.row, props.col)
	} else if (props.state === CellStateEnum.Flagged) { // 已标记状态
		emit('unflag', props.row, props.col)
	}
}

// 处理右键点击
const handleRightClick = () => {
	if (props.state === CellStateEnum.Hidden) { // 未翻开状态
		emit('flag', props.row, props.col)
	} else if (props.state === CellStateEnum.Flagged) { // 已标记状态
    emit('unflag', props.row, props.col)
  }
}

</script>

<style scoped>
.mine-cell {
	width: 44px;
	height: 44px;
	display: flex;
	justify-content: center;
	align-items: center;
	background: rgba(229, 230, 235);
		border: 1px solid rgb(201, 205, 212);
	border-radius: 6px;
	cursor: pointer;
	user-select: none;
	font-weight: bold;
	font-size: 18px;
	transition: all 0.2s ease;
	/* box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); */
		box-sizing: border-box;
}

.mine-cell:hover {
	transform: translateY(-1px);
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.is-revealed {
	background: #fff;
	transform: none !important;
	box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.is-flagged {
	background: #e3f2fd;
}

.mine-1-3 {
	color: #4caf50;
}

.mine-4-6 {
	color: #ff9800;
}

.mine-7-8 {
	color: #f44336;
}

@media (max-width: 768px) {
	.mine-cell {
		width: 40px;
		height: 40px;
		font-size: 16px;
	}
}

/* 在更小的屏幕上进一步缩小 */
@media (max-width: 375px) {
	.mine-cell {
		width: 36px;
		height: 36px;
		font-size: 14px;
	}
}
.mine-cell {
  transition: all 0.2s ease;
}

.is-revealed {
  animation: reveal 0.2s ease-out;
}

.auto-reveal {
  animation: autoReveal 0.15s ease-out;
}

@keyframes reveal {
  from {
    transform: scale(0.95);
    opacity: 0.5;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes autoReveal {
  from {
    transform: scale(0.98);
    opacity: 0.7;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>