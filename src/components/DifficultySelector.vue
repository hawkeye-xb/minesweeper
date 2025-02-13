<template>
  <div class="difficulty-selector">
    <button 
      v-for="level in levels" 
      :key="level.name" 
      @click="handleLevelClick(level)"
      :class="{ active: currentLevel === level.name }"
    >
      {{ level.name }}
    </button>

    <!-- 自定义难度弹窗 -->
    <div v-if="showCustomDialog" class="custom-dialog-overlay">
      <div class="custom-dialog">
        <h3>自定义难度</h3>
        <div class="input-group">
          <label>
            行数:
            <input 
              type="number" 
              v-model="customConfig.rows" 
              min="1" 
              max="50"
            >
          </label>
          <label>
            列数:
            <input 
              type="number" 
              v-model="customConfig.cols" 
              min="1" 
              max="50"
            >
          </label>
          <label>
            地雷数:
            <input 
              type="number" 
              v-model="customConfig.mines" 
              min="1"
              :max="customConfig.rows * customConfig.cols - 1"
            >
          </label>
        </div>
        <div class="dialog-buttons">
          <button @click="confirmCustom">确认</button>
          <button @click="showCustomDialog = false">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, toRef } from 'vue'

interface Level {
  name: string
  rows: number
  cols: number
  mines: number
}

const levels: Level[] = [
  { name: '初级', rows: 9, cols: 9, mines: 10 },
  { name: '中级', rows: 16, cols: 16, mines: 40 },
  { name: '高级', rows: 16, cols: 30, mines: 99 },
  { name: '自定义', rows: 0, cols: 0, mines: 0 },
]

// 添加 props
const props = defineProps<{
  currentLevel: string
}>()

// 现在可以正确使用 toRef
const currentLevel = toRef(props, 'currentLevel')
const showCustomDialog = ref(false)
const customConfig = ref({
  rows: 12,
  cols: 12,
  mines: 20
})

const emit = defineEmits<{
  (e: 'levelSelect', level: Level): void
}>()

const handleLevelClick = (level: Level) => {
  if (level.name === '自定义') {
    showCustomDialog.value = true
    return
  }
  currentLevel.value = level.name
  emit('levelSelect', level)
}

const confirmCustom = () => {
  const { rows, cols, mines } = customConfig.value
  
  // 验证输入
  if (!rows || !cols || !mines) {
    alert('请填写所有字段')
    return
  }
  
  if (mines >= rows * cols) {
    alert('地雷数量不能大于或等于格子总数')
    return
  }

  currentLevel.value = '自定义'
  emit('levelSelect', {
    name: '自定义',
    rows,
    cols,
    mines
  })
  showCustomDialog.value = false
}
</script>

<style scoped>
.difficulty-selector {
	display: flex;
	gap: 8px;
	justify-content: center;
	padding: 16px;
}

button {
	padding: 8px 16px;
	border: none;
	border-radius: 6px;
	background: #f0f0f0;
	color: #333;
	font-size: 14px;
	cursor: pointer;
	transition: all 0.3s ease;
}

button:hover {
	background: #e0e0e0;
}

button.active {
	background: #2196f3;
	color: white;
}

@media (max-width: 768px) {
	.difficulty-selector {
		padding: 8px;
	}

	button {
		padding: 6px 12px;
		font-size: 12px;
	}
}

.custom-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.custom-dialog {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 400px;
}

.custom-dialog h3 {
  margin: 0 0 20px;
  color: #333;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.input-group label {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.input-group input {
  width: 100px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.dialog-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.dialog-buttons button {
  min-width: 80px;
}

@media (max-width: 768px) {
  .custom-dialog {
    width: 95%;
    padding: 15px;
  }

  .input-group input {
    width: 80px;
  }
}
</style>