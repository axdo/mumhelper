<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { BabyProfile, DiaperType, FeedingType } from '../types'
import { babyRepo } from '../repositories/babyRepo'
import { feedingRepo } from '../repositories/feedingRepo'
import { diaperRepo } from '../repositories/diaperRepo'
import { sleepRepo } from '../repositories/sleepRepo'
import { useActiveTimer, type TimerKind } from '../composables/useActiveTimer'
import { useToast } from '../composables/useToast'
import { babyAgeDays, formatDuration, formatElapsed, startOfToday } from '../utils/time'
import AppModal from '../components/AppModal.vue'
import BottleFeedForm from '../components/BottleFeedForm.vue'
import DiaperForm from '../components/DiaperForm.vue'
import SleepTypePicker from '../components/SleepTypePicker.vue'

const baby = ref<BabyProfile | null>(null)
const feedCount = ref(0)
const totalMl = ref(0)
const diaperCount = ref(0)
const sleepMinutes = ref(0)

const { active, elapsedMs, start, stop, isRunning } = useActiveTimer()
const { showToast } = useToast()

const showBottle = ref(false)
const showDiaper = ref(false)
const showSleepType = ref(false)
let lastDiaperId: number | null = null
const finishedSleep = ref<{ startTime: number; endTime: number } | null>(null)

const babyTitle = computed(() => {
  if (!baby.value) return '妈妈帮手'
  const name = baby.value.name || '宝宝'
  if (baby.value.birthDate) return `${name} · 第 ${babyAgeDays(baby.value.birthDate)} 天`
  return name
})

const elapsedText = computed(() => formatElapsed(elapsedMs.value))

const timerLabel: Record<TimerKind, string> = {
  breast_left: '左侧亲喂中',
  breast_right: '右侧亲喂中',
  sleep: '宝宝睡觉中',
}

async function refresh() {
  const from = startOfToday()
  const to = from + 86400000
  const [feedings, diapers, sleeps] = await Promise.all([
    feedingRepo.listByRange(from, to),
    diaperRepo.listByRange(from, to),
    sleepRepo.listByRange(from, to),
  ])
  feedCount.value = feedings.length
  totalMl.value = feedings.reduce((sum, f) => sum + (f.amountMl ?? 0), 0)
  diaperCount.value = diapers.length
  sleepMinutes.value = Math.round(sleeps.reduce((sum, s) => sum + (s.endTime - s.startTime), 0) / 60000)
}

function toggleTimer(kind: TimerKind) {
  if (isRunning(kind)) {
    void finishTimer()
  } else if (!active.value) {
    start(kind)
  }
}

async function finishTimer() {
  const finished = stop()
  if (!finished) return
  if (finished.kind === 'sleep') {
    finishedSleep.value = { startTime: finished.startTime, endTime: Date.now() }
    showSleepType.value = true
    return
  }
  const minutes = Math.max(1, Math.round((Date.now() - finished.startTime) / 60000))
  await feedingRepo.add({
    type: finished.kind,
    startTime: finished.startTime,
    minutes,
    amountMl: null,
    notes: '',
  })
  showToast('已保存喂奶记录 ✓')
  await refresh()
}

async function saveSleepType(type: 'nap' | 'night') {
  if (finishedSleep.value) {
    await sleepRepo.add({ ...finishedSleep.value, type, notes: '' })
    finishedSleep.value = null
    showToast('已保存睡眠记录 ✓')
  }
  showSleepType.value = false
  await refresh()
}

async function saveBottle(payload: { type: FeedingType; startTime: number; amountMl: number; notes: string }) {
  await feedingRepo.add({
    type: payload.type,
    startTime: payload.startTime,
    minutes: null,
    amountMl: payload.amountMl,
    notes: payload.notes,
  })
  showBottle.value = false
  showToast('已保存瓶喂记录 ✓')
  await refresh()
}

function openDiaper() {
  lastDiaperId = null
  showDiaper.value = true
}

async function onDiaperSave(payload: {
  type: DiaperType
  poopColor: string | null
  poopTexture: string | null
  notes: string
}) {
  if (lastDiaperId == null) {
    lastDiaperId = await diaperRepo.add({ ...payload, time: Date.now() })
    showToast('已保存换尿布记录 ✓')
  } else {
    await diaperRepo.update(lastDiaperId, payload)
    showToast('已补充记录 ✓')
  }
  await refresh()
}

onMounted(async () => {
  baby.value = (await babyRepo.get()) ?? null
  await refresh()
})
</script>

<template>
  <div class="page">
    <header class="home-header">
      <h1 class="baby-name">{{ babyTitle }}</h1>
      <p class="sub-text">{{ new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }) }}</p>
    </header>

    <section class="card overview">
      <h2 class="card-title">今日概览</h2>
      <div class="stats-grid">
        <div class="stat">
          <span class="stat-value">{{ feedCount }}</span>
          <span class="stat-label">喂奶次数</span>
          <span v-if="totalMl > 0" class="stat-extra">{{ totalMl }} ml</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ diaperCount }}</span>
          <span class="stat-label">换尿布</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ formatDuration(sleepMinutes * 60000) }}</span>
          <span class="stat-label">睡眠时长</span>
        </div>
      </div>
    </section>

    <section v-if="active" class="card timer-card">
      <div class="timer-info">
        <span class="timer-dot" />
        <span class="timer-label">{{ timerLabel[active.kind] }}</span>
        <span class="timer-value">{{ elapsedText }}</span>
      </div>
      <button class="btn block" @click="finishTimer">
        {{ active.kind === 'sleep' ? '宝宝醒了' : '结束喂奶' }}
      </button>
    </section>

    <section class="card">
      <h2 class="card-title">喂奶</h2>
      <div class="btn-grid">
        <button
          class="btn feed-btn"
          :class="{ running: isRunning('breast_left'), secondary: !!active && !isRunning('breast_left') }"
          :disabled="!!active && !isRunning('breast_left')"
          @click="toggleTimer('breast_left')"
        >
          🤱 亲喂左
        </button>
        <button
          class="btn feed-btn"
          :class="{ running: isRunning('breast_right'), secondary: !!active && !isRunning('breast_right') }"
          :disabled="!!active && !isRunning('breast_right')"
          @click="toggleTimer('breast_right')"
        >
          🤱 亲喂右
        </button>
        <button class="btn secondary feed-btn" :disabled="!!active" @click="showBottle = true">🍼 瓶喂</button>
      </div>
    </section>

    <section class="quick-row">
      <button class="btn secondary quick-btn" :disabled="!!active" @click="openDiaper">🧷 换尿布</button>
      <button
        class="btn secondary quick-btn"
        :class="{ running: isRunning('sleep') }"
        :disabled="!!active && !isRunning('sleep')"
        @click="toggleTimer('sleep')"
      >
        {{ isRunning('sleep') ? '😴 睡眠中' : '😴 宝宝睡着了' }}
      </button>
    </section>

    <AppModal :open="showBottle" title="瓶喂记录" @close="showBottle = false">
      <BottleFeedForm @save="saveBottle" />
    </AppModal>

    <AppModal :open="showDiaper" title="换尿布" @close="showDiaper = false">
      <DiaperForm @save="onDiaperSave" @done="showDiaper = false" />
    </AppModal>

    <AppModal :open="showSleepType" title="这次算哪种睡眠？" @close="showSleepType = false">
      <SleepTypePicker
        :duration-text="finishedSleep ? formatDuration(finishedSleep.endTime - finishedSleep.startTime) : ''"
        @save="saveSleepType"
      />
    </AppModal>
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  text-align: center;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-value {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--color-primary-dark);
}

.stat-label {
  font-size: 0.85rem;
  color: var(--color-text-sub);
}

.stat-extra {
  font-size: 0.8rem;
  color: var(--color-text-sub);
}

.timer-card {
  border: 2px solid var(--color-primary);
}

.timer-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.timer-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-primary);
  animation: pulse 1.2s infinite;
}

@keyframes pulse {
  50% {
    opacity: 0.3;
  }
}

.timer-label {
  font-weight: 600;
  flex: 1;
}

.timer-value {
  font-size: 1.4rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--color-primary-dark);
}

.btn-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.feed-btn {
  padding: 14px 6px;
  font-size: 0.95rem;
}

.btn.running {
  background: var(--color-primary-dark);
  animation: pulse 1.2s infinite;
}

.btn:disabled {
  opacity: 0.45;
}

.quick-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.quick-btn {
  font-size: 1.05rem;
}
</style>
