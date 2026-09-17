<script setup lang="ts">
defineProps<{
  open: boolean
  title: string
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <teleport to="body">
    <div v-if="open" class="overlay" @click.self="emit('close')">
      <div class="sheet">
        <div class="sheet-header">
          <span class="sheet-title">{{ title }}</span>
          <button class="sheet-close" @click="emit('close')">✕</button>
        </div>
        <div class="sheet-body">
          <slot />
        </div>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(60, 40, 35, 0.45);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 200;
}

.sheet {
  width: 100%;
  max-width: 540px;
  background: #fff;
  border-radius: 20px 20px 0 0;
  padding: 16px 16px calc(16px + env(safe-area-inset-bottom));
  max-height: 85vh;
  overflow-y: auto;
}

.sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.sheet-title {
  font-size: 1.1rem;
  font-weight: 700;
}

.sheet-close {
  border: none;
  background: var(--color-primary-soft);
  color: var(--color-primary-dark);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 1rem;
  cursor: pointer;
}
</style>
