// 领域模型类型定义（纯类型，不依赖 Dexie，组件可安全引用）
// 所有时间字段统一使用 epoch 毫秒（number）

export interface FeedingRecord {
  id?: number
  /** 喂奶开始时间，epoch ms */
  startTime: number
  /** 喂奶结束时间，epoch ms */
  endTime: number
  createdAt: number
  updatedAt: number
}
