<script setup lang="ts">
import { ref } from 'vue'
import type { DiaperType } from '../types'

const emit = defineEmits<{
  save: [payload: { type: DiaperType; poopColor: string | null; poopTexture: string | null; notes: string }]
  done: []
}>()

const savedType = ref<DiaperType | null>(null)
const poopColor = ref<string | null>(null)
const poopTexture = ref<string | null>(null)
const notes = ref('')

const colorOptions = ['黄色', '金黄', '绿色', '棕色', '偏白', '带血丝']
const textureOptions = ['稀水样', '糊状', '软便', '成形', '干硬']

function pick(type: DiaperType) {
  // 点选即保存；便便类可继续补填性状
  savedType.value = type
  emit('save', { type, poopColor: null, poopTexture: null, notes: '' })
  if (type === 'pee') {
    emit('done')
  }
}

function saveDetail() {
  if (!savedType.value) return
  emit('save', {
    type: savedType.value,
    poopColor: poopColor.value,
    poopTexture: poopTexture.value,
    notes: notes.value.trim(),
  })
  emit('done')
}
</script>

<template>
  <div>
    <template v-if="!savedType">
      <div class="type-grid">
        <button class="type-btn" @click="pick('pee')">💧<span>嘘嘘</span></button>
        <button class="type-btn" @click="pick('poop')">💩<span>便便</span></button>
        <button class="type-btn" @click="pick('both')">💧💩<span>混合</span></button>
      </div>
      <p class="sub-text hint">点选即保存；便便/混合可在下一步补填性状</p>
    </template>

    <template v-else>
      <p class="saved-hint">已保存「{{ savedType === 'poop' ? '便便' : '混合' }}」，可补充性状（都可选）：</p>
      <div class="field">
        <label>颜色</label>
        <div class="chip-row">
          <button
            v-for="c in colorOptions"
            :key="c"
            class="chip"
            :class="{ selected: poopColor === c }"
            @click="poopColor = poopColor === c ? null : c"
          >
            {{ c }}
          </button>
        </div>
      </div>
      <div class="field">
        <label>稀稠</label>
        <div class="chip-row">
          <button
            v-for="t in textureOptions"
            :key="t"
            class="chip"
            :class="{ selected: poopTexture === t }"
            @click="poopTexture = poopTexture === t ? null : t"
          >
            {{ t }}
          </button>
        </div>
      </div>
      <div class="field">
        <label>备注（可选）</label>
        <input v-model="notes" type="text" placeholder="例如：有点奶瓣" />
      </div>
      <div class="actions">
        <button class="btn secondary block" @click="saveDetail">补充保存</button>
        <button class="btn ghost block" @click="emit('done')">不填了，完成</button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.type-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.type-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 18px 8px;
  font-size: 1.8rem;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius);
  background: #fff;
  cursor: pointer;
}

.type-btn span {
  font-size: 1rem;
  color: var(--color-text);
  font-weight: 600;
}

.type-btn:active {
  background: var(--color-primary-soft);
}

.hint {
  margin-top: 12px;
  text-align: center;
}

.saved-hint {
  font-size: 0.95rem;
  margin-bottom: 12px;
  color: var(--color-primary-dark);
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
