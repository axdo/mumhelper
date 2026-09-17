<script setup lang="ts">
import type { SleepType } from '../types'

defineProps<{
  durationText: string
}>()

const emit = defineEmits<{
  save: [type: SleepType]
}>()
</script>

<template>
  <div>
    <p class="duration">本次睡眠 {{ durationText }}</p>
    <div class="type-grid">
      <button class="type-btn" @click="emit('save', 'nap')">🌤️<span>小睡</span></button>
      <button class="type-btn" @click="emit('save', 'night')">🌙<span>夜睡</span></button>
    </div>
  </div>
</template>

<style scoped>
.duration {
  text-align: center;
  font-size: 1.05rem;
  font-weight: 600;
  margin-bottom: 14px;
}

.type-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.type-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 18px 8px;
  font-size: 1.8rem;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius);
  background: #fff;
  cursor: pointer;
}

.type-btn span {
  font-size: 1rem;
  color: var(--color-text);
  font-weight: 600;
}

.type-btn:active {
  background: var(--color-primary-soft);
}
</style>
