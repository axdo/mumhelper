import { db } from '../db/database'
import type { FeedingRecord } from '../types'

export type FeedingInput = Omit<FeedingRecord, 'id' | 'createdAt' | 'updatedAt'>

export const feedingRepo = {
  async add(input: FeedingInput): Promise<number> {
    const now = Date.now()
    return db.feedings.add({ ...input, createdAt: now, updatedAt: now })
  },

  async update(id: number, patch: Partial<FeedingInput>): Promise<void> {
    await db.feedings.update(id, { ...patch, updatedAt: Date.now() })
  },

  async remove(id: number): Promise<void> {
    await db.feedings.delete(id)
  },

  /** 时间范围 [from, to) 内的记录，按开始时间倒序 */
  async listByRange(from: number, to: number): Promise<FeedingRecord[]> {
    return db.feedings.where('startTime').between(from, to, true, false).reverse().toArray()
  },

  async listAll(): Promise<FeedingRecord[]> {
    return db.feedings.orderBy('startTime').reverse().toArray()
  },
}
