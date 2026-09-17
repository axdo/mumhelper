import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

export type TimerKind = 'breast_left' | 'breast_right' | 'sleep'

interface ActiveTimer {
  kind: TimerKind
  startTime: number
}

const STORAGE_KEY = 'mumhelper:active-timer'

const active = ref<ActiveTimer | null>(load())
const now = ref(Date.now())
let tickHandle: number | null = null
let subscribers = 0

function load(): ActiveTimer | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ActiveTimer
    if (typeof parsed.startTime !== 'number' || !parsed.kind) return null
    return parsed
  } catch {
    return null
  }
}

function persist() {
  if (active.value) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(active.value))
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
}

/** 全局单例计时器：同一时间只允许一个计时，状态持久化到 localStorage，刷新后继续走 */
export function useActiveTimer() {
  onMounted(() => {
    subscribers++
    if (tickHandle === null) {
      now.value = Date.now()
      tickHandle = window.setInterval(() => {
        now.value = Date.now()
      }, 1000)
    }
  })
  onBeforeUnmount(() => {
    subscribers--
    if (subscribers <= 0 && tickHandle !== null) {
      clearInterval(tickHandle)
      tickHandle = null
      subscribers = 0
    }
  })

  const elapsedMs = computed(() => (active.value ? now.value - active.value.startTime : 0))

  function start(kind: TimerKind) {
    active.value = { kind, startTime: Date.now() }
    persist()
  }

  /** 结束计时并返回计时数据；无进行中计时时返回 null */
  function stop(): ActiveTimer | null {
    const finished = active.value
    active.value = null
    persist()
    return finished
  }

  function isRunning(kind: TimerKind): boolean {
    return active.value?.kind === kind
  }

  return { active, elapsedMs, start, stop, isRunning }
}
