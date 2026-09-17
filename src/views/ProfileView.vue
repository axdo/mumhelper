<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { BabyGender } from '../types'
import { babyRepo } from '../repositories/babyRepo'
import { fromDateValue, toDateValue } from '../utils/time'
import { useToast } from '../composables/useToast'

const { showToast } = useToast()

const babyName = ref('')
const birthDateStr = ref('')
const gender = ref<BabyGender>('secret')
const birthWeightGrams = ref<number | null>(null)
const birthLengthCm = ref<number | null>(null)
const saved = ref(false)

async function saveBaby() {
  await babyRepo.save({
    name: babyName.value.trim(),
    birthDate: fromDateValue(birthDateStr.value),
    gender: gender.value,
    birthWeightGrams: birthWeightGrams.value,
    birthLengthCm: birthLengthCm.value,
  })
  saved.value = true
  setTimeout(() => (saved.value = false), 2000)
  showToast('宝宝信息已保存 ✓')
}

onMounted(async () => {
  const baby = await babyRepo.get()
  if (baby) {
    babyName.value = baby.name
    birthDateStr.value = baby.birthDate ? toDateValue(baby.birthDate) : ''
    gender.value = baby.gender
    birthWeightGrams.value = baby.birthWeightGrams
    birthLengthCm.value = baby.birthLengthCm
  }
})
</script>

<template>
  <div class="page">
    <h1 class="page-title">我的</h1>

    <section class="card">
      <h2 class="card-title">👶 宝宝信息</h2>
      <div class="field">
        <label>姓名 / 小名</label>
        <input v-model="babyName" type="text" placeholder="宝宝的名字" />
      </div>
      <div class="field">
        <label>出生日期</label>
        <input v-model="birthDateStr" type="date" />
      </div>
      <div class="field">
        <label>性别</label>
        <div class="chip-row">
          <button class="chip" :class="{ selected: gender === 'girl' }" @click="gender = 'girl'">女宝</button>
          <button class="chip" :class="{ selected: gender === 'boy' }" @click="gender = 'boy'">男宝</button>
          <button class="chip" :class="{ selected: gender === 'secret' }" @click="gender = 'secret'">保密</button>
        </div>
      </div>
      <div class="field-pair">
        <div class="field">
          <label>出生体重（g）</label>
          <input v-model.number="birthWeightGrams" type="number" inputmode="numeric" placeholder="如 3200" />
        </div>
        <div class="field">
          <label>身长（cm）</label>
          <input v-model.number="birthLengthCm" type="number" inputmode="decimal" placeholder="如 50" />
        </div>
      </div>
      <button class="btn block" @click="saveBaby">{{ saved ? '已保存 ✓' : '保存宝宝信息' }}</button>
    </section>
  </div>
</template>

<style scoped>
.card-title {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 14px;
}

.field-pair {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
</style>
