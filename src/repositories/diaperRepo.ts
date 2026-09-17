import { db } from '../db/database'
import type { DiaperRecord } from '../types'

export type DiaperInput = Omit<DiaperRecord, 'id' | 'createdAt' | 'updatedAt'>

export const diaperRepo = {
  async add(input: DiaperInput): Promise<number> {
    const now = Date.now()
    return db.diapers.add({ ...input, createdAt: now, updatedAt: now })
  },

  async update(id: number, patch: Partial<DiaperInput>): Promise<void> {
    await db.diapers.update(id, { ...patch, updatedAt: Date.now() })
  },

  async remove(id: number): Promise<void> {
    await db.diapers.delete(id)
  },

  /** 时间范围 [from, to) 内的记录，按时间倒序 */
  async listByRange(from: number, to: number): Promise<DiaperRecord[]> {
    return db.diapers.where('time').between(from, to, true, false).reverse().toArray()
  },

  async listAll(): Promise<DiaperRecord[]> {
    return db.diapers.orderBy('time').reverse().toArray()
  },
}
