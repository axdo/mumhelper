<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { EChartsCoreOption } from 'echarts/core'
import type { DiaperRecord, FeedingRecord, SleepRecord } from '../types'
import { feedingRepo } from '../repositories/feedingRepo'
import { diaperRepo } from '../repositories/diaperRepo'
import { sleepRepo } from '../repositories/sleepRepo'
import { addDays, formatShortDate, startOfDay, startOfToday } from '../utils/time'
import EChart from '../components/EChart.vue'

type Mode = 'day' | 'week'
const mode = ref<Mode>('day')

const feedings = ref<FeedingRecord[]>([])
const diapers = ref<DiaperRecord[]>([])
const sleeps = ref<SleepRecord[]>([])

interface Bucket {
  label: string
  from: number
  to: number
}

const buckets = computed<Bucket[]>(() => {
  const today = startOfToday()
  if (mode.value === 'day') {
    const result: Bucket[] = []
    for (let i = 6; i >= 0; i--) {
      const from = addDays(today, -i)
      result.push({ label: formatShortDate(from), from, to: addDays(from, 1) })
    }
    return result
  }
  // 周视图：最近 8 周，按自然周（周一起）聚合
  const dow = (new Date(today).getDay() + 6) % 7 // 周一 = 0
  const thisMonday = addDays(today, -dow)
  const result: Bucket[] = []
  for (let i = 7; i >= 0; i--) {
    const from = addDays(thisMonday, -7 * i)
    result.push({ label: `${formatShortDate(from)}周`, from, to: addDays(from, 7) })
  }
  return result
})

const feedingTypes: { key: FeedingRecord['type']; label: string; color: string }[] = [
  { key: 'breast_left', label: '亲喂左', color: '#e8836b' },
  { key: 'breast_right', label: '亲喂右', color: '#f2b5a0' },
  { key: 'bottle_breast', label: '瓶喂母乳', color: '#6b9bd8' },
  { key: 'bottle_formula', label: '配方奶', color: '#a8c6e8' },
]

function inBucket(ts: number, b: Bucket) {
  return ts >= b.from && ts < b.to
}

const feedingOption = computed<EChartsCoreOption>(() => {
  const bs = buckets.value
  const countSeries = feedingTypes.map((t) => ({
    name: t.label,
    type: 'bar' as const,
    stack: 'count',
    itemStyle: { color: t.color },
    data: bs.map((b) => feedings.value.filter((f) => f.type === t.key && inBucket(f.startTime, b)).length),
  }))
  const mlData = bs.map((b) =>
    feedings.value.filter((f) => inBucket(f.startTime, b)).reduce((sum, f) => sum + (f.amountMl ?? 0), 0),
  )
  return {
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0, textStyle: { fontSize: 11 }, itemWidth: 12, itemHeight: 8, itemGap: 10 },
    grid: { top: 24, left: 36, right: 44, bottom: 64 },
    xAxis: { type: 'category', data: bs.map((b) => b.label), axisLabel: { margin: 10 } },
    yAxis: [
      { type: 'value', name: '次数', minInterval: 1 },
      { type: 'value', name: 'ml', min: 0 },
    ],
    series: [
      ...countSeries,
      {
        name: '总奶量',
        type: 'line',
        yAxisIndex: 1,
        itemStyle: { color: '#7fb685' },
        smooth: true,
        data: mlData,
      },
    ],
  }
})

const diaperOption = computed<EChartsCoreOption>(() => {
  const bs = buckets.value
  const series = (
    [
      { key: 'pee', label: '嘘嘘', color: '#6b9bd8' },
      { key: 'poop', label: '便便', color: '#c98f4e' },
      { key: 'both', label: '混合', color: '#7fb685' },
    ] as const
  ).map((t) => ({
    name: t.label,
    type: 'bar' as const,
    stack: 'diaper',
    itemStyle: { color: t.color },
    data: bs.map((b) => diapers.value.filter((d) => d.type === t.key && inBucket(d.time, b)).length),
  }))
  return {
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0, textStyle: { fontSize: 11 } },
    grid: { top: 24, left: 36, right: 16, bottom: 44 },
    xAxis: { type: 'category', data: bs.map((b) => b.label) },
    yAxis: { type: 'value', name: '次数', minInterval: 1 },
    series,
  }
})

const sleepOption = computed<EChartsCoreOption>(() => {
  const bs = buckets.value
  const napData = bs.map(
    (b) =>
      Math.round(
        (sleeps.value
          .filter((s) => s.type === 'nap' && inBucket(s.startTime, b))
          .reduce((sum, s) => sum + (s.endTime - s.startTime), 0) /
          3600000) *
          10,
      ) / 10,
  )
  const nightData = bs.map(
    (b) =>
      Math.round(
        (sleeps.value
          .filter((s) => s.type === 'night' && inBucket(s.startTime, b))
          .reduce((sum, s) => sum + (s.endTime - s.startTime), 0) /
          3600000) *
          10,
      ) / 10,
  )
  return {
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0, textStyle: { fontSize: 11 } },
    grid: { top: 24, left: 36, right: 16, bottom: 44 },
    xAxis: { type: 'category', data: bs.map((b) => b.label) },
    yAxis: { type: 'value', name: '小时' },
    series: [
      { name: '小睡', type: 'bar', stack: 'sleep', itemStyle: { color: '#f2c879' }, data: napData },
      { name: '夜睡', type: 'bar', stack: 'sleep', itemStyle: { color: '#7a6fb0' }, data: nightData },
    ],
  }
})

async function refresh() {
  const bs = buckets.value
  const from = bs[0]?.from ?? startOfDay(Date.now())
  const to = bs[bs.length - 1]?.to ?? Date.now()
  ;[feedings.value, diapers.value, sleeps.value] = await Promise.all([
    feedingRepo.listByRange(from, to),
    diaperRepo.listByRange(from, to),
    sleepRepo.listByRange(from, to),
  ])
}

function switchMode(m: Mode) {
  mode.value = m
  void refresh()
}

onMounted(refresh)
</script>

<template>
  <div class="page">
    <div class="stats-header">
      <h1 class="page-title">统计</h1>
      <div class="chip-row">
        <button class="chip" :class="{ selected: mode === 'day' }" @click="switchMode('day')">日</button>
        <button class="chip" :class="{ selected: mode === 'week' }" @click="switchMode('week')">周</button>
      </div>
    </div>

    <section class="card">
      <h2 class="card-title">喂养次数与奶量</h2>
      <EChart :option="feedingOption" />
    </section>

    <section class="card">
      <h2 class="card-title">大小便次数</h2>
      <EChart :option="diaperOption" />
    </section>

    <section class="card">
      <h2 class="card-title">睡眠总时长</h2>
      <EChart :option="sleepOption" />
    </section>
  </div>
</template>

<style scoped>
.stats-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.stats-header .page-title {
  margin-bottom: 0;
}

.card-title {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 8px;
}
</style>
