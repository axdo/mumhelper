<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { DiaperRecord, FeedingRecord, SleepRecord } from '../types'
import { feedingRepo } from '../repositories/feedingRepo'
import { diaperRepo } from '../repositories/diaperRepo'
import { sleepRepo } from '../repositories/sleepRepo'
import { formatDateTime, formatDuration, formatTime } from '../utils/time'

type FilterKind = 'all' | 'feeding' | 'diaper' | 'sleep'

interface TimelineItem {
  key: string
  kind: Exclude<FilterKind, 'all'>
  time: number
  icon: string
  title: string
  detail: string
  raw: FeedingRecord | DiaperRecord | SleepRecord
}

const filter = ref<FilterKind>('all')
const feedings = ref<FeedingRecord[]>([])
const diapers = ref<DiaperRecord[]>([])
const sleeps = ref<SleepRecord[]>([])

const filterTabs: { key: FilterKind; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'feeding', label: '喂养' },
  { key: 'diaper', label: '尿布' },
  { key: 'sleep', label: '睡眠' },
]

const feedingTypeText: Record<FeedingRecord['type'], string> = {
  breast_left: '亲喂（左）',
  breast_right: '亲喂（右）',
  bottle_breast: '瓶喂母乳',
  bottle_formula: '配方奶',
}

const diaperTypeText: Record<DiaperRecord['type'], string> = {
  pee: '嘘嘘',
  poop: '便便',
  both: '混合',
}

function feedingToItem(f: FeedingRecord): TimelineItem {
  const parts: string[] = []
  if (f.minutes != null) parts.push(`${f.minutes} 分钟`)
  if (f.amountMl != null) parts.push(`${f.amountMl} ml`)
  if (f.notes) parts.push(f.notes)
  return {
    key: `feeding-${f.id}`,
    kind: 'feeding',
    time: f.startTime,
    icon: f.type.startsWith('breast') ? '🤱' : '🍼',
    title: feedingTypeText[f.type],
    detail: parts.join(' · '),
    raw: f,
  }
}

function diaperToItem(d: DiaperRecord): TimelineItem {
  const parts: string[] = []
  if (d.poopColor) parts.push(d.poopColor)
  if (d.poopTexture) parts.push(d.poopTexture)
  if (d.notes) parts.push(d.notes)
  return {
    key: `diaper-${d.id}`,
    kind: 'diaper',
    time: d.time,
    icon: d.type === 'pee' ? '💧' : '💩',
    title: diaperTypeText[d.type],
    detail: parts.join(' · '),
    raw: d,
  }
}

function sleepToItem(s: SleepRecord): TimelineItem {
  return {
    key: `sleep-${s.id}`,
    kind: 'sleep',
    time: s.startTime,
    icon: s.type === 'nap' ? '🌤️' : '🌙',
    title: s.type === 'nap' ? '小睡' : '夜睡',
    detail: `${formatTime(s.startTime)} - ${formatTime(s.endTime)} · ${formatDuration(s.endTime - s.startTime)}${s.notes ? ` · ${s.notes}` : ''}`,
    raw: s,
  }
}

const items = computed<TimelineItem[]>(() => {
  const all: TimelineItem[] = []
  if (filter.value === 'all' || filter.value === 'feeding') all.push(...feedings.value.map(feedingToItem))
  if (filter.value === 'all' || filter.value === 'diaper') all.push(...diapers.value.map(diaperToItem))
  if (filter.value === 'all' || filter.value === 'sleep') all.push(...sleeps.value.map(sleepToItem))
  return all.sort((a, b) => b.time - a.time).slice(0, 200)
})

async function refresh() {
  ;[feedings.value, diapers.value, sleeps.value] = await Promise.all([
    feedingRepo.listAll(),
    diaperRepo.listAll(),
    sleepRepo.listAll(),
  ])
}

async function removeItem(item: TimelineItem) {
  if (!window.confirm(`删除这条「${item.title}」记录？`)) return
  const id = item.raw.id
  if (id == null) return
  if (item.kind === 'feeding') await feedingRepo.remove(id)
  else if (item.kind === 'diaper') await diaperRepo.remove(id)
  else await sleepRepo.remove(id)
  await refresh()
}

onMounted(refresh)
</script>

<template>
  <div class="page">
    <h1 class="page-title">记录</h1>

    <div class="chip-row filter-row">
      <button
        v-for="tab in filterTabs"
        :key="tab.key"
        class="chip"
        :class="{ selected: filter === tab.key }"
        @click="filter = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <p v-if="items.length === 0" class="empty-hint">还没有记录，去首页点一下吧</p>

    <div v-for="item in items" :key="item.key" class="card record-item">
      <span class="record-icon">{{ item.icon }}</span>
      <div class="record-main">
        <div class="record-head">
          <span class="record-title">{{ item.title }}</span>
          <span class="record-time">{{ formatDateTime(item.time) }}</span>
        </div>
        <p v-if="item.detail" class="record-detail">{{ item.detail }}</p>
      </div>
      <button class="delete-btn" title="删除" @click="removeItem(item)">🗑</button>
    </div>
  </div>
</template>

<style scoped>
.filter-row {
  margin-bottom: 14px;
}

.record-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  margin-bottom: 10px;
}

.record-icon {
  font-size: 1.5rem;
}

.record-main {
  flex: 1;
  min-width: 0;
}

.record-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}

.record-title {
  font-weight: 600;
  font-size: 1rem;
}

.record-time {
  font-size: 0.8rem;
  color: var(--color-text-sub);
  white-space: nowrap;
}

.record-detail {
  font-size: 0.9rem;
  color: var(--color-text-sub);
  margin-top: 2px;
  word-break: break-all;
}

.delete-btn {
  border: none;
  background: transparent;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 8px;
  opacity: 0.6;
}

.delete-btn:active {
  opacity: 1;
}
</style>
