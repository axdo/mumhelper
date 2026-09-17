import { db } from '../db/database'
import type { BabyProfile } from '../types'

export const babyRepo = {
  async get(): Promise<BabyProfile | undefined> {
    return db.baby.orderBy('id').first()
  },

  async save(profile: Omit<BabyProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    const now = Date.now()
    const existing = await this.get()
    if (existing?.id != null) {
      await db.baby.update(existing.id, { ...profile, updatedAt: now })
    } else {
      await db.baby.add({ ...profile, createdAt: now, updatedAt: now })
    }
  },
}
