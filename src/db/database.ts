import Dexie, { type Table } from 'dexie'
import type { BabyProfile, DiaperRecord, FeedingRecord, SleepRecord } from '../types'

class MumHelperDB extends Dexie {
  baby!: Table<BabyProfile, number>
  feedings!: Table<FeedingRecord, number>
  diapers!: Table<DiaperRecord, number>
  sleeps!: Table<SleepRecord, number>

  constructor() {
    super('mumhelper')
    // v2：移除 mother 表（分娩档案功能下线）
    this.version(2).stores({
      mother: null,
      baby: '++id',
      feedings: '++id, startTime, type',
      diapers: '++id, time, type',
      sleeps: '++id, startTime, type',
    })
  }
}

export const db = new MumHelperDB()
