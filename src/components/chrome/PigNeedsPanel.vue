<template>
  <div class="pig-needs-panel">
    <div
      v-for="key in NEED_KEYS"
      :key="key"
      class="need-row"
      :style="urgencyVars(needs[key])"
    >
      <div class="need-row__head">
        <span class="need-row__label">
          <span>{{ NEED_META[key].emoji }}</span>{{ NEED_META[key].label }}
        </span>
        <span class="need-row__value">{{ Math.round(needs[key]) }}%</span>
      </div>
      <div class="need-row__track">
        <div
          class="need-row__fill"
          :style="{ width: `${needs[key]}%`, background: NEED_META[key].color }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NEED_META, NEED_KEYS, urgencyOf } from './needMeta'
import type { GuineaPigNeeds } from '../../stores/guineaPigStore'

defineProps<{
  needs: GuineaPigNeeds
}>()

const URGENCY_VARS = {
  critical: { '--need-bg': 'rgba(220,38,38,.14)', '--need-border': 'var(--color-red-500)', '--need-text': 'var(--color-red-700)' },
  warning: { '--need-bg': 'rgba(234,88,12,.14)', '--need-border': 'var(--color-gold-500)', '--need-text': 'var(--color-gold-700)' },
  moderate: { '--need-bg': 'rgba(146,64,14,.10)', '--need-border': 'var(--color-yellow-700)', '--need-text': 'var(--color-wood-shadow)' },
  satisfied: { '--need-bg': 'rgba(22,163,74,.14)', '--need-border': 'var(--color-green-500)', '--need-text': 'var(--color-green-800)' }
} as const

function urgencyVars(value: number) {
  return URGENCY_VARS[urgencyOf(value)]
}
</script>

<style>
.pig-needs-panel {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-2);
}

@media (max-width: 480px) {
  .pig-needs-panel {
    grid-template-columns: 1fr;
  }
}
</style>
