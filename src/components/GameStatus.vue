<template>
	<div class="game-status">
		<div style="display: flex;">
			<div class="mines-counter">💣 {{ minesLeft }}</div>
			<div class="mines-counter">
				<span class="tool-btn" @click="$emit('useSafeTool')">🛡️</span> {{ safeCount }}
			</div>
		</div>
		<div class="game-controls">
			<button class="restart-btn" @click="$emit('restart')">
				{{ isLost ? '😢重新开始' : '😊新游戏' }}
			</button>
		</div>
		<div class="timer">⏱️ {{ formatTime(time) }}</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'

const props = defineProps<{
	minesLeft: number,
	isLost?: boolean,
	safeCount: number
}>()

const time = ref(0)
let timerInterval: number | null = null

// 计时器控制函数
const startTimer = () => {
	console.log('startTimer')
	if (!timerInterval) {
		timerInterval = setInterval(() => {
			time.value++
		}, 1000)
	}
}

const stopTimer = () => {
	if (timerInterval) {
		clearInterval(timerInterval)
		timerInterval = null
	}
}

const resetTimer = () => {
	stopTimer()
	time.value = 0
}

// 组件卸载时清理定时器
onUnmounted(() => {
	stopTimer()
})

const formatTime = (seconds: number): string => {
	const mins = Math.floor(seconds / 60)
	const secs = seconds % 60
	return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 获取当前时间
const getTime = () => time.value

// 暴露方法给父组件
defineExpose({
	startTimer,
	resetTimer,
	stopTimer,
	getTime
})
</script>

<style scoped>
.game-status {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 16px;
	background: #fff;
	border-radius: 8px;
	margin: 16px 0;
	border: 1px solid rgba(0, 0, 0, 0.1);
}

.mines-counter,
.timer {
	width: 80px;
	font-size: 18px;
	font-weight: 500;
	color: #333;
}

.restart-btn {
	width: 160px;
	background: none;
	border: none;
	font-size: 24px;
	cursor: pointer;
	padding: 8px;
	border-radius: 50%;
	/* transition: transform 0.3s ease; */
}

.restart-btn:hover {
	/* transform: rotate(180deg); */
}

.game-controls {
	display: flex;
	gap: 8px;
	align-items: center;
}

.safe-btn {
	padding: 8px 16px;
	background: #4caf50;
	color: white;
	border: none;
	border-radius: 6px;
	cursor: pointer;
	font-size: 16px;
	transition: all 0.3s ease;
}

.safe-btn:disabled {
	background: #ccc;
	cursor: not-allowed;
}

.safe-btn:not(:disabled):hover {
	background: #388e3c;
}

@media (max-width: 768px) {
	.safe-btn {
		padding: 6px 12px;
		font-size: 14px;
	}
}

@media (max-width: 768px) {
	.game-status {
		padding: 8px;
		margin: 8px 0;
	}

	.mines-counter,
	.timer {
		font-size: 16px;
		width: auto;
	}

	.restart-btn {
		font-size: 20px;
	}
}

.tool-btn {
	cursor: pointer;
	padding: 4px;
	border-radius: 4px;
	transition: all 0.3s ease;
}

.tool-btn:not(.disabled):hover {
	background: #e3f2fd;
	transform: scale(1.1);
}

.tool-btn.disabled {
	cursor: not-allowed;
	opacity: 0.5;
}
</style>