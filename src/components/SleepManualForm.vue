<script setup lang="ts">
import { computed, ref } from 'vue'
import type { SleepType } from '../types'
import { formatDuration, fromDateTimeLocalValue, toDateTimeLocalValue } from '../utils/time'

const emit = defineEmits<{
  save: [payload: { startTime: number; endTime: number; type: SleepType }]
}>()

const now = Date.now()
const startValue = ref(toDateTimeLocalValue(now - 3600000))
const endValue = ref(toDateTimeLocalValue(now))
const type = ref<SleepType>('nap')

const startTime = computed(() => fromDateTimeLocalValue(startValue.value))
const endTime = computed(() => fromDateTimeLocalValue(endValue.value))

const invalid = computed(
  () => !startTime.value || !endTime.value || endTime.value <= startTime.value,
)

const durationText = computed(() =>
  invalid.value ? '' : formatDuration(endTime.value! - startTime.value!),
)

function submit() {
  if (invalid.value) return
  emit('save', { startTime: startTime.value!, endTime: endTime.value!, type: type.value })
}
</script>

<template>
  <div>
    <div class="field">
      <label>入睡时间</label>
      <input v-model="startValue" type="datetime-local" />
    </div>
    <div class="field">
      <label>醒来时间</label>
      <input v-model="endValue" type="datetime-local" />
    </div>
    <div class="field">
      <label>类型</label>
      <div class="chip-row">
        <button class="chip" :class="{ selected: type === 'nap' }" @click="type = 'nap'">🌤️ 小睡</button>
        <button class="chip" :class="{ selected: type === 'night' }" @click="type = 'night'">🌙 夜睡</button>
      </div>
    </div>
    <p v-if="invalid" class="error-hint">醒来时间需要晚于入睡时间</p>
    <p v-else class="sub-text duration-hint">本次睡眠 {{ durationText }}</p>
    <button class="btn block" :disabled="invalid" @click="submit">保存</button>
  </div>
</template>

<style scoped>
.duration-hint {
  text-align: center;
  margin-bottom: 12px;
}

.error-hint {
  text-align: center;
  color: #c62828;
  font-size: 0.9rem;
  margin-bottom: 12px;
}

.btn:disabled {
  opacity: 0.5;
}
</style>
