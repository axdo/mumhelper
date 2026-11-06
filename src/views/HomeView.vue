<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { FeedingRecord } from '../types'
import { feedingRepo } from '../repositories/feedingRepo'
import { useToast } from '../composables/useToast'
import { formatDuration, formatTime, fromDateTimeLocalValue, startOfToday, toDateTimeLocalValue } from '../utils/time'

const { showToast } = useToast()

const startValue = ref(toDateTimeLocalValue(Date.now() - 1800000))
const endValue = ref(toDateTimeLocalValue(Date.now()))
const records = ref<FeedingRecord[]>([])

const startTime = computed(() => fromDateTimeLocalValue(startValue.value))
const endTime = computed(() => fromDateTimeLocalValue(endValue.value))
const invalid = computed(() => !startTime.value || !endTime.value || endTime.value <= startTime.value)
const durationText = computed(() =>
  invalid.value ? '' : formatDuration(endTime.value! - startTime.value!),
)

const totalMinutes = computed(() =>
  Math.round(records.value.reduce((sum, r) => sum + (r.endTime - r.startTime), 0) / 60000),
)

async function refresh() {
  const from = startOfToday()
  records.value = await feedingRepo.listByRange(from, from + 86400000)
}

async function save() {
  if (invalid.value) return
  await feedingRepo.add({ startTime: startTime.value!, endTime: endTime.value! })
  startValue.value = toDateTimeLocalValue(Date.now() - 1800000)
  endValue.value = toDateTimeLocalValue(Date.now())
  showToast('已保存喂奶记录 ✓')
  await refresh()
}

async function remove(id: number) {
  if (!window.confirm('删除这条记录？')) return
  await feedingRepo.remove(id)
  showToast('已删除')
  await refresh()
}

onMounted(refresh)
</script>

<template>
  <div class="page">
    <header class="home-header">
      <h1 class="baby-name">🍼 喂奶记录</h1>
      <p class="sub-text">{{ new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }) }}</p>
    </header>

    <section class="card">
      <div class="field">
        <label>开始时间</label>
        <input v-model="startValue" type="datetime-local" />
      </div>
      <div class="field">
        <label>结束时间</label>
        <input v-model="endValue" type="datetime-local" />
      </div>
      <p v-if="invalid" class="error-hint">结束时间需要晚于开始时间</p>
      <p v-else class="sub-text duration-hint">本次喂奶 {{ durationText }}</p>
      <button class="btn block" :disabled="invalid" @click="save">保存</button>
    </section>

    <section class="card">
      <h2 class="card-title">今日记录</h2>
      <p v-if="records.length" class="sub-text summary">
        共 {{ records.length }} 次 · {{ formatDuration(totalMinutes * 60000) }}
      </p>
      <p v-if="!records.length" class="empty-hint">今天还没有记录</p>
      <ul v-else class="record-list">
        <li v-for="r in records" :key="r.id" class="record-item">
          <span class="record-time">{{ formatTime(r.startTime) }} – {{ formatTime(r.endTime) }}</span>
          <span class="record-duration">{{ formatDuration(r.endTime - r.startTime) }}</span>
          <button class="delete-btn" @click="remove(r.id!)">删除</button>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.home-header {
  margin-bottom: 14px;
}

.baby-name {
  font-size: 1.5rem;
  font-weight: 700;
}

.card-title {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 12px;
}

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

.summary {
  margin-bottom: 10px;
}

.record-list {
  list-style: none;
}

.record-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border);
}

.record-item:last-child {
  border-bottom: none;
}

.record-time {
  font-size: 1.05rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  flex: 1;
}

.record-duration {
  color: var(--color-text-sub);
  font-size: 0.9rem;
}

.delete-btn {
  border: none;
  background: transparent;
  color: #c62828;
  font-size: 0.9rem;
  padding: 6px 8px;
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.5;
}
</style>
