import Dexie, { type Table } from 'dexie'
import type { FeedingRecord } from '../types'

class MumHelperDB extends Dexie {
  feedings!: Table<FeedingRecord, number>

  constructor() {
    super('mumhelper')
    // v3：只保留喂奶记录（开始/结束时间），移除 baby/diapers/sleeps 表
    this.version(3).stores({
      baby: null,
      diapers: null,
      sleeps: null,
      feedings: '++id, startTime',
    })
  }
}

export const db = new MumHelperDB()
