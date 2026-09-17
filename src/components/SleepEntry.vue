<script setup lang="ts">
import { ref } from 'vue'
import type { SleepType } from '../types'
import { fromDateTimeLocalValue, toDateTimeLocalValue } from '../utils/time'
import SleepManualForm from './SleepManualForm.vue'

const emit = defineEmits<{
  start: [startTime: number]
  manualSave: [payload: { startTime: number; endTime: number; type: SleepType }]
}>()

type Mode = 'timer' | 'start' | 'manual'
const mode = ref<Mode>('timer')
const startValue = ref(toDateTimeLocalValue(Date.now()))

function switchMode(m: Mode) {
  mode.value = m
  if (m === 'start') startValue.value = toDateTimeLocalValue(Date.now())
}

function startTimer() {
  const t = mode.value === 'start' ? (fromDateTimeLocalValue(startValue.value) ?? Date.now()) : Date.now()
  emit('start', t)
}
</script>

<template>
  <div>
    <div class="chip-row mode-row">
      <button class="chip" :class="{ selected: mode === 'timer' }" @click="switchMode('timer')">⏱️ 计时</button>
      <button class="chip" :class="{ selected: mode === 'start' }" @click="switchMode('start')">🕐 设入睡时间</button>
      <button class="chip" :class="{ selected: mode === 'manual' }" @click="switchMode('manual')">✏️ 已睡醒补录</button>
    </div>

    <template v-if="mode === 'timer'">
      <p class="sub-text hint">从现在开始计时，宝宝醒来后回到首页点「宝宝醒了」结束</p>
      <button class="btn block" @click="startTimer">开始计时</button>
    </template>

    <template v-else-if="mode === 'start'">
      <div class="field">
        <label>入睡时间</label>
        <input v-model="startValue" type="datetime-local" />
      </div>
      <p class="sub-text hint">从所选时间开始计时，醒来后点「宝宝醒了」结束</p>
      <button class="btn block" @click="startTimer">开始计时</button>
    </template>

    <template v-else>
      <SleepManualForm @save="emit('manualSave', $event)" />
    </template>
  </div>
</template>

<style scoped>
.mode-row {
  margin-bottom: 16px;
}

.hint {
  text-align: center;
  margin-bottom: 12px;
}
</style>
