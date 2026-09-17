<script setup lang="ts">
import { ref } from 'vue'
import type { FeedingType } from '../types'
import { fromDateTimeLocalValue, toDateTimeLocalValue } from '../utils/time'

const emit = defineEmits<{
  save: [payload: { type: FeedingType; startTime: number; amountMl: number; notes: string }]
}>()

const type = ref<FeedingType>('bottle_breast')
const timeValue = ref(toDateTimeLocalValue(Date.now()))
const amountMl = ref<number | null>(120)
const notes = ref('')

const amountOptions = [30, 60, 90, 120, 150, 180, 210]

function submit() {
  if (!amountMl.value || amountMl.value <= 0) return
  const startTime = fromDateTimeLocalValue(timeValue.value) ?? Date.now()
  emit('save', { type: type.value, startTime, amountMl: amountMl.value, notes: notes.value.trim() })
}
</script>

<template>
  <div>
    <div class="field">
      <label>类型</label>
      <div class="chip-row">
        <button
          class="chip"
          :class="{ selected: type === 'bottle_breast' }"
          @click="type = 'bottle_breast'"
        >
          母乳瓶喂
        </button>
        <button
          class="chip"
          :class="{ selected: type === 'bottle_formula' }"
          @click="type = 'bottle_formula'"
        >
          配方奶
        </button>
      </div>
    </div>
    <div class="field">
      <label>时间</label>
      <input v-model="timeValue" type="datetime-local" />
    </div>
    <div class="field">
      <label>奶量（ml）</label>
      <div class="chip-row amount-row">
        <button
          v-for="opt in amountOptions"
          :key="opt"
          class="chip"
          :class="{ selected: amountMl === opt }"
          @click="amountMl = opt"
        >
          {{ opt }}
        </button>
      </div>
      <input v-model.number="amountMl" type="number" min="1" inputmode="numeric" placeholder="手动输入奶量" />
    </div>
    <div class="field">
      <label>备注（可选）</label>
      <input v-model="notes" type="text" placeholder="例如：剩了 20ml" />
    </div>
    <button class="btn block" :disabled="!amountMl || amountMl <= 0" @click="submit">保存</button>
  </div>
</template>

<style scoped>
.amount-row {
  margin-bottom: 8px;
}

input[type='number'],
input[type='datetime-local'] {
  width: 100%;
  border: 1.5px solid var(--color-border);
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 1rem;
  box-sizing: border-box;
}

.btn:disabled {
  opacity: 0.5;
}
</style>
