<template>
  <div class="need-row" :data-need-urgency="urgency">
    <div class="need-row__info">
      <label :for="id" class="need-row__label">
        {{ label }}
      </label>
      <span class="need-row__value">
        {{ value.toFixed(0) }}%
      </span>
    </div>
    <SliderField
      :id="id"
      :modelValue="value"
      :min="0"
      :max="100"
      :step="1"
      prefix=""
      suffix="%"
      :show-min-max="showMinMax"
      :needType="needType"
      @update:modelValue="$emit('update:modelValue', $event)"
      class="need-row__slider"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SliderField from './SliderField.vue'
import type { NeedType } from '../../stores/guineaPigStore'

interface Props {
  id: string
  label: string
  value: number
  needType?: NeedType
  showMinMax?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showMinMax: false
})

defineEmits<{
  'update:modelValue': [value: number]
}>()

/**
 * Calculate urgency level based on need value
 * Value represents satisfaction level: 100 = full/satisfied, 0 = empty/critical
 * Green (60-100) → Grey (40-60) → Yellow (30-40) → Red (0-30)
 */
const urgency = computed(() => {
  if (props.value >= 60) return 'satisfied'  // 60-100: Green
  if (props.value >= 40) return 'good'       // 40-59: Grey
  if (props.value >= 30) return 'medium'     // 30-39: Yellow
  return 'critical'  // 0-29: Red
})
</script>

<style>
/* Need Row Layout */
.need-row {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  transition: background-color var(--transition-fast);
  border-inline-start: 3px solid var(--color-border-medium);
}

.need-row__info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.need-row__label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.need-row__value {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
  min-inline-size: 3rem;
  text-align: end;
  color: var(--color-text-secondary);
}

.need-row__slider {
  flex: 1;
  min-inline-size: 0;
}

/* Urgency-based backgrounds */
.need-row[data-need-urgency="satisfied"] {
  background-color: var(--color-success-bg);
  border-inline-start-color: var(--color-success);
}

.need-row[data-need-urgency="good"] {
  background-color: rgba(100, 116, 139, 0.05);
  border-inline-start-color: var(--color-border-dark);
}

.need-row[data-need-urgency="medium"] {
  background-color: var(--color-warning-bg);
  border-inline-start-color: var(--color-warning);
}

.need-row[data-need-urgency="critical"] {
  background-color: var(--color-error-bg);
  border-inline-start-color: var(--color-error);
}
</style>
