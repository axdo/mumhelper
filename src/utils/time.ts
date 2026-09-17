// 时间工具：全局统一 epoch 毫秒

/** 今天本地 0 点的 epoch ms */
export function startOfToday(): number {
  return startOfDay(Date.now())
}

export function startOfDay(ts: number): number {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function addDays(ts: number, days: number): number {
  const d = new Date(ts)
  d.setDate(d.getDate() + days)
  return d.getTime()
}

/** epoch ms -> 'HH:mm' */
export function formatTime(ts: number): string {
  const d = new Date(ts)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

/** epoch ms -> 'M月D日 HH:mm' */
export function formatDateTime(ts: number): string {
  const d = new Date(ts)
  return `${d.getMonth() + 1}月${d.getDate()}日 ${formatTime(ts)}`
}

/** epoch ms -> 'M/D'（图表坐标用） */
export function formatShortDate(ts: number): string {
  const d = new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

/** 毫秒时长 -> 'H小时M分' 或 'M分' */
export function formatDuration(ms: number): string {
  const totalMin = Math.round(ms / 60000)
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (h <= 0) return `${m}分`
  return m === 0 ? `${h}小时` : `${h}小时${m}分`
}

/** 计时时长 -> 'mm:ss' 或 'hh:mm:ss' */
export function formatElapsed(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${String(h).padStart(2, '0')}:${mm}:${ss}` : `${mm}:${ss}`
}

/** epoch ms -> datetime-local 输入框值 'yyyy-MM-ddTHH:mm' */
export function toDateTimeLocalValue(ts: number): string {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** datetime-local 值 -> epoch ms */
export function fromDateTimeLocalValue(v: string): number | null {
  if (!v) return null
  const ts = new Date(v).getTime()
  return Number.isNaN(ts) ? null : ts
}

/** epoch ms -> date 输入框值 'yyyy-MM-dd' */
export function toDateValue(ts: number): string {
  return toDateTimeLocalValue(ts).slice(0, 10)
}

/** date 输入框值 -> epoch ms（本地 0 点） */
export function fromDateValue(v: string): number | null {
  if (!v) return null
  const ts = new Date(`${v}T00:00:00`).getTime()
  return Number.isNaN(ts) ? null : ts
}

/** 宝宝日龄：出生第 1 天记为第 1 天 */
export function babyAgeDays(birthDate: number): number {
  return Math.floor((startOfToday() - startOfDay(birthDate)) / 86400000) + 1
}
