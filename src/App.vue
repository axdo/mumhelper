<script setup lang="ts">
import HomeView from './views/HomeView.vue'
import { useToast } from './composables/useToast'

const { toasts } = useToast()
</script>

<template>
  <HomeView />
  <transition-group name="toast" tag="div" class="toast-container">
    <div v-for="t in toasts" :key="t.id" class="toast">{{ t.message }}</div>
  </transition-group>
</template>

<style scoped>
.toast-container {
  position: fixed;
  left: 50%;
  bottom: 32px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  z-index: 200;
  pointer-events: none;
  width: max-content;
  max-width: 90vw;
}

.toast {
  background: rgba(74, 59, 53, 0.92);
  color: #fff;
  font-size: 0.95rem;
  padding: 10px 20px;
  border-radius: 999px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
