<template>
	<div class="mine-cell" :class="{
		'is-revealed': isRevealed,
		'is-flagged': isFlagged,
		'mine-1-3': isRevealed && value > 0 && value <= 3,
		'mine-4-6': isRevealed && value >= 4 && value <= 6,
		'mine-7-8': isRevealed && value >= 7 && value <= 8,
	}" @click="handleClick" @contextmenu.prevent="handleRightClick" @touchstart="handleTouchStart"
		@touchend="handleTouchEnd">
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
import { ref } from 'vue'

interface Props {
	value: number
	row: number
	col: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
	(e: 'reveal', row: number, col: number): void
	(e: 'flag', row: number, col: number): void
	(e: 'unflag', row: number, col: number): void
}>()

const isRevealed = ref(false)
const isFlagged = ref(false)
let touchStartTime = 0
const LONG_PRESS_DURATION = 500 // 长按判定时间（毫秒）

// 处理左键点击
const handleClick = () => {
  // 如果已经翻开，不做任何操作
  if (isRevealed.value) return
  
  if (isFlagged.value) {
    // 如果已标记，则取消标记
    isFlagged.value = false
    emit('unflag', props.row, props.col)
  } else {
    // 未翻开且未标记时才能翻开
    isRevealed.value = true
    emit('reveal', props.row, props.col)
  }
}

// 处理右键点击
const handleRightClick = () => {
  // 如果已经翻开，不做任何操作
  if (isRevealed.value) return
  
  isFlagged.value = !isFlagged.value
  if (isFlagged.value) {
    emit('flag', props.row, props.col)
  } else {
    emit('unflag', props.row, props.col)
  }
}

// 处理触摸开始
const handleTouchStart = () => {
	touchStartTime = Date.now()
}

// 处理触摸结束
const handleTouchEnd = (event: TouchEvent) => {
	const touchDuration = Date.now() - touchStartTime

	// 防止触发点击事件
	if (touchDuration >= LONG_PRESS_DURATION) {
		event.preventDefault()
		handleRightClick()
	}
}

// 暴露方法给父组件
const isAutoRevealed = ref(false)

// 修改 reveal 方法
const reveal = () => {
  if (!isFlagged.value && !isRevealed.value) {
    isRevealed.value = true
    isAutoRevealed.value = true
    // 添加延迟重置自动翻开标志
    setTimeout(() => {
      isAutoRevealed.value = false
    }, 500)
  }
}

defineExpose({
	reveal,
	reset: () => {
		isRevealed.value = false
		isFlagged.value = false
	}
})
</script>

<style scoped>
.mine-cell {
	width: 44px;
	height: 44px;
	display: flex;
	justify-content: center;
	align-items: center;
	background: #f0f0f0;
	border-radius: 6px;
	cursor: pointer;
	user-select: none;
	font-weight: bold;
	font-size: 18px;
	transition: all 0.2s ease;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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