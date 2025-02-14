<template>
  <div v-if="visible" class="rule-dialog-overlay" @click.self="$emit('close')">
    <div class="rule-dialog">
      <h2>游戏规则</h2>
      <div class="rule-content">
        <h3>基本规则：</h3>
        <ul>
          <li>点击方块揭开格子</li>
          <li>数字表示周围8个格子中的地雷数量</li>
          <li>右键或长按可标记地雷位置</li>
          <li>标记所有地雷并揭开所有安全格子即为胜利</li>
        </ul>

        <h3>操作说明：</h3>
        <ul>
          <li>左键点击：揭开格子</li>
          <li>右键点击/长按：标记地雷</li>
          <li>再次右键/长按：取消标记</li>
        </ul>

        <h3>难度说明：</h3>
        <ul>
          <li>初级：9×9 格子，10 个地雷</li>
          <li>中级：16×16 格子，40 个地雷</li>
          <li>高级：16×30 格子，99 个地雷</li>
          <li>自定义：自定义行列数和地雷数</li>
        </ul>
      </div>
      <button class="close-btn" @click="$emit('close')">关闭</button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean
}>()
</script>

<style scoped>
.rule-dialog-overlay {
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
  padding: 20px;
}

.rule-dialog {
  background: white;
  border-radius: 8px;
  padding: 20px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

h3 {
  color: #2196f3;
  margin: 16px 0 8px;
}

.rule-content {
  margin-bottom: 20px;
}

ul {
  padding-left: 20px;
  margin: 8px 0;
}

li {
  margin: 8px 0;
  line-height: 1.5;
}

.close-btn {
  width: 100%;
  padding: 10px;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 16px;
}

.close-btn:hover {
  background: #1976d2;
}

@media (max-width: 768px) {
  .rule-dialog {
    padding: 16px;
    font-size: 14px;
  }

  h2 {
    font-size: 18px;
  }

  h3 {
    font-size: 16px;
  }
}
</style>