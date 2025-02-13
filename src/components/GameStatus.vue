<template>
	<div class="game-status">
		<div class="mines-counter">💣 {{ minesLeft }}</div>
		<button class="restart-btn" @click="$emit('restart')">重新开始</button>
		<div class="timer">⏱️ {{ formatTime(time) }}</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'

const props = defineProps<{
	minesLeft: number
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
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin: 16px 0;
}

.mines-counter, .timer {
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.restart-btn {
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

@media (max-width: 768px) {
  .game-status {
    padding: 8px;
    margin: 8px 0;
  }
  
  .mines-counter, .timer {
    font-size: 16px;
  }
  
  .restart-btn {
    font-size: 20px;
  }
}
</style>