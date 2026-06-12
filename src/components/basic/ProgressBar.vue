<template>
  <div class="progress-bar" :class="progressBarClasses">
    <div
      v-if="label"
      class="progress-bar__label"
    >
      {{ label }}
    </div>
    <div
      class="progress-bar__track"
      role="progressbar"
      :aria-valuenow="value"
      :aria-valuemin="min"
      :aria-valuemax="max"
      :aria-label="ariaLabel || label || 'Progress'"
    >
      <div
        class="progress-bar__fill"
        :style="{ width: percentage + '%' }"
      />
    </div>
    <div
      v-if="showValue"
      class="progress-bar__value"
    >
      {{ Math.round(value) }}{{ suffix }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  value: number
  min?: number
  max?: number
  label?: string
  suffix?: string
  showValue?: boolean
  variant?: 'critical' | 'warning' | 'medium' | 'good' | 'satisfied' | 'default'
  size?: 'sm' | 'md' | 'lg'
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 100,
  suffix: '',
  showValue: false,
  variant: 'default',
  size: 'md'
})

const percentage = computed(() => {
  const range = props.max - props.min
  const adjusted = props.value - props.min
  return Math.min(100, Math.max(0, (adjusted / range) * 100))
})

const progressBarClasses = computed(() => {
  return [
    `progress-bar--${props.variant}`,
    `progress-bar--${props.size}`
  ]
})
</script>

<style>
.progress-bar {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.progress-bar__label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  min-inline-size: fit-content;
}

.progress-bar__track {
  flex: 1;
  block-size: 8px;
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
  position: relative;
}

.progress-bar__fill {
  block-size: 100%;
  background-color: var(--color-primary);
  border-radius: var(--radius-full);
  transition: width 0.3s ease, background-color 0.3s ease;
}

.progress-bar__value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  min-inline-size: fit-content;
}

/* Size variants */
.progress-bar--sm .progress-bar__track {
  block-size: 6px;
}

.progress-bar--sm .progress-bar__label,
.progress-bar--sm .progress-bar__value {
  font-size: var(--font-size-xs);
}

.progress-bar--md .progress-bar__track {
  block-size: 8px;
}

.progress-bar--lg .progress-bar__track {
  block-size: 12px;
}

.progress-bar--lg .progress-bar__label,
.progress-bar--lg .progress-bar__value {
  font-size: var(--font-size-base);
}

/* Color variants - matching NeedRow urgency levels */
.progress-bar--satisfied .progress-bar__fill {
  background-color: var(--color-green-500);
}

.progress-bar--good .progress-bar__fill {
  background-color: var(--color-gray-500);
}

.progress-bar--medium .progress-bar__fill {
  background-color: var(--color-yellow-500);
}

.progress-bar--warning .progress-bar__fill {
  background-color: var(--color-orange-500);
}

.progress-bar--critical .progress-bar__fill {
  background-color: var(--color-red-500);
}

.progress-bar--default .progress-bar__fill {
  background-color: var(--color-primary);
}
</style>
