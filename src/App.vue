<script setup lang="ts">
import { useToast } from './composables/useToast'

const { toasts } = useToast()

const tabs = [
  { to: '/', label: '首页', icon: '🏠' },
  { to: '/records', label: '记录', icon: '📋' },
  { to: '/stats', label: '统计', icon: '📊' },
  { to: '/profile', label: '我的', icon: '👤' },
]
</script>

<template>
  <router-view />
  <transition-group name="toast" tag="div" class="toast-container">
    <div v-for="t in toasts" :key="t.id" class="toast">{{ t.message }}</div>
  </transition-group>
  <nav class="tabbar">
    <router-link
      v-for="tab in tabs"
      :key="tab.to"
      :to="tab.to"
      class="tab"
      :class="{ exact: tab.to === '/' }"
    >
      <span class="tab-icon">{{ tab.icon }}</span>
      <span class="tab-label">{{ tab.label }}</span>
    </router-link>
  </nav>
</template>

<style scoped>
.tabbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: var(--tabbar-height);
  display: flex;
  background: #fff;
  border-top: 1px solid var(--color-border);
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 100;
}

#app .tabbar {
  max-width: 540px;
  margin: 0 auto;
}

.tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  text-decoration: none;
  color: var(--color-text-sub);
  font-size: 0.75rem;
}

.tab-icon {
  font-size: 1.3rem;
  line-height: 1;
}

.tab.router-link-active {
  color: var(--color-primary-dark);
  font-weight: 600;
}

.toast-container {
  position: fixed;
  left: 50%;
  bottom: calc(var(--tabbar-height) + 20px);
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
