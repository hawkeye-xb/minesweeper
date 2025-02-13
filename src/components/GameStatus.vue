<template>
  <div class="game-status">
    <div class="mines-counter">💣 {{ minesLeft }}</div>
    <button class="restart-btn" @click="$emit('restart')">🔄</button>
    <div class="timer">⏱️ {{ formatTime(time) }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const minesLeft = ref(10)
const time = ref(0)

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}
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
  transition: transform 0.3s ease;
}

.restart-btn:hover {
  transform: rotate(180deg);
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