import { db } from '../db/database'
import type { SleepRecord } from '../types'

export type SleepInput = Omit<SleepRecord, 'id' | 'createdAt' | 'updatedAt'>

export const sleepRepo = {
  async add(input: SleepInput): Promise<number> {
    const now = Date.now()
    return db.sleeps.add({ ...input, createdAt: now, updatedAt: now })
  },

  async update(id: number, patch: Partial<SleepInput>): Promise<void> {
    await db.sleeps.update(id, { ...patch, updatedAt: Date.now() })
  },

  async remove(id: number): Promise<void> {
    await db.sleeps.delete(id)
  },

  /** 入睡时间落在 [from, to) 内的记录，按入睡时间倒序 */
  async listByRange(from: number, to: number): Promise<SleepRecord[]> {
    return db.sleeps.where('startTime').between(from, to, true, false).reverse().toArray()
  },

  async listAll(): Promise<SleepRecord[]> {
    return db.sleeps.orderBy('startTime').reverse().toArray()
  },
}
