// 领域模型类型定义（纯类型，不依赖 Dexie，组件可安全引用）
// 所有时间字段统一使用 epoch 毫秒（number）

export type BabyGender = 'girl' | 'boy' | 'secret'

export interface BabyProfile {
  id?: number
  name: string
  /** 出生日期，epoch ms（当天本地 0 点） */
  birthDate: number | null
  gender: BabyGender
  birthWeightGrams: number | null
  birthLengthCm: number | null
  createdAt: number
  updatedAt: number
}

export type FeedingType = 'breast_left' | 'breast_right' | 'bottle_breast' | 'bottle_formula'

export interface FeedingRecord {
  id?: number
  type: FeedingType
  /** 开始时间，epoch ms */
  startTime: number
  /** 亲喂时长（分钟），瓶喂为 null */
  minutes: number | null
  /** 瓶喂奶量（ml），亲喂为 null */
  amountMl: number | null
  notes: string
  createdAt: number
  updatedAt: number
}

export type DiaperType = 'pee' | 'poop' | 'both'

export interface DiaperRecord {
  id?: number
  type: DiaperType
  /** 时间，epoch ms */
  time: number
  /** 便便颜色（可选，仅 poop/both） */
  poopColor: string | null
  /** 便便稀稠（可选，仅 poop/both） */
  poopTexture: string | null
  notes: string
  createdAt: number
  updatedAt: number
}

export type SleepType = 'nap' | 'night'

export interface SleepRecord {
  id?: number
  /** 入睡时间，epoch ms */
  startTime: number
  /** 醒来时间，epoch ms */
  endTime: number
  type: SleepType
  notes: string
  createdAt: number
  updatedAt: number
}
