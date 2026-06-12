<template>
  <div class="dbg-slider" :style="{ '--accent': accent ?? 'var(--color-pink-500)', '--pct': pct + '%' }">
    <div class="dbg-slider__head">
      <span class="dbg-slider__label"><slot name="label">{{ label }}</slot></span>
      <span class="dbg-slider__value">{{ modelValue }}{{ suffix ?? '%' }}</span>
    </div>
    <input
      class="dbg-slider__input"
      type="range"
      :min="min ?? 0"
      :max="max ?? 100"
      :step="step ?? 1"
      :value="modelValue"
      @input="emit('update:modelValue', Number(($event.target as HTMLInputElement).value))"
    />
    <div v-if="showMinMax !== false" class="dbg-slider__minmax">
      <span>{{ min ?? 0 }}{{ suffix ?? '%' }}</span>
      <span>{{ max ?? 100 }}{{ suffix ?? '%' }}</span>
    </div>
    <div v-if="hint" class="dbg-slider__hint">{{ hint }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: number
  label?: string
  min?: number
  max?: number
  step?: number
  suffix?: string
  accent?: string
  hint?: string
  showMinMax?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const pct = computed(() => {
  const min = props.min ?? 0
  const max = props.max ?? 100
  return ((props.modelValue - min) / (max - min)) * 100
})
</script>
