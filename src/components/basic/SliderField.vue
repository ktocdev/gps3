<template>
  <div :class="sliderWrapperClasses">
    <label v-if="label" :for="sliderId" class="slider__label">
      {{ label }}
      <span v-if="showValue" class="slider__value">{{ prefix }}{{ modelValue }}{{ suffix }}</span>
    </label>
    <input
      :id="sliderId"
      type="range"
      :class="sliderClasses"
      :value="modelValue"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      @input="handleInput"
    />
    <div v-if="showMinMax" class="slider__range">
      <span class="slider__min">{{ min }}</span>
      <span class="slider__max">{{ max }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue'

interface Props {
  modelValue: number
  id?: string
  min?: number
  max?: number
  step?: number
  label?: string
  disabled?: boolean
  showValue?: boolean
  showMinMax?: boolean
  size?: 'sm' | 'md' | 'lg'
  prefix?: string
  suffix?: string
  needType?: string
}

interface Emits {
  (e: 'update:modelValue', value: number): void
  (e: 'change', value: number): void
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 100,
  step: 1,
  disabled: false,
  showValue: true,
  showMinMax: false,
  size: 'md',
  prefix: '',
  suffix: ''
})

const emit = defineEmits<Emits>()

const instance = getCurrentInstance()
const sliderId = computed(() => props.id || `slider-${instance?.uid || Math.random().toString(36).substr(2, 9)}`)

const sliderWrapperClasses = computed(() => {
  const base = 'slider'
  const size = `slider--${props.size}`
  const disabled = props.disabled ? 'slider--disabled' : ''

  return [base, size, disabled].filter(Boolean).join(' ')
})

const sliderClasses = computed(() => {
  const classes = ['slider__input']
  if (props.needType) {
    classes.push(`slider__input--${props.needType}`)
  }
  return classes.join(' ')
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = Number(target.value)

  emit('update:modelValue', value)
  emit('change', value)
}
</script>

<style>
.slider {
  display: flex;
  flex-direction: column;
  inline-size: 100%;
}

.slider__label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: var(--font-family-body);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-block-end: var(--space-2);
  line-height: var(--line-height-tight);
}

.slider__value {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.slider__input {
  inline-size: 100%;
  block-size: 6px;
  background: transparent;
  border-radius: var(--radius-full);
  outline: none;
  cursor: pointer;
  transition: all var(--transition-fast);
  appearance: none;
  -webkit-appearance: none;
}

.slider__input::-webkit-slider-runnable-track {
  inline-size: 100%;
  block-size: 6px;
  background: var(--color-neutral-200);
  border-radius: var(--radius-full);
}

.slider__input::-moz-range-track {
  inline-size: 100%;
  block-size: 6px;
  background: var(--color-neutral-200);
  border-radius: var(--radius-full);
  border: none;
}

.slider__input::-webkit-slider-thumb {
  appearance: none;
  -webkit-appearance: none;
  inline-size: 18px;
  block-size: 18px;
  background: var(--color-primary);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-fast);
  margin-block-start: -6px;
}

.slider__input::-moz-range-thumb {
  inline-size: 18px;
  block-size: 18px;
  background: var(--color-primary);
  border-radius: var(--radius-full);
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.slider__input::-webkit-slider-thumb:hover {
  background: var(--color-primary-hover);
  transform: scale(1.1);
}

.slider__input::-moz-range-thumb:hover {
  background: var(--color-primary-hover);
  transform: scale(1.1);
}

.slider__input:focus::-webkit-slider-thumb {
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.2);
}

.slider__input:focus::-moz-range-thumb {
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.2);
}

.slider__input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.slider__input:disabled::-webkit-slider-thumb {
  cursor: not-allowed;
}

.slider__input:disabled::-moz-range-thumb {
  cursor: not-allowed;
}

.slider__range {
  display: flex;
  justify-content: space-between;
  margin-block-start: var(--space-1);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.slider--sm .slider__input {
  block-size: 4px;
}

.slider--sm .slider__input::-webkit-slider-runnable-track {
  block-size: 4px;
}

.slider--sm .slider__input::-moz-range-track {
  block-size: 4px;
}

.slider--sm .slider__input::-webkit-slider-thumb {
  inline-size: 14px;
  block-size: 14px;
  margin-block-start: -5px;
}

.slider--sm .slider__input::-moz-range-thumb {
  inline-size: 14px;
  block-size: 14px;
}

.slider--lg .slider__input {
  block-size: 8px;
}

/* Need-specific colors */
.slider__input--hunger::-webkit-slider-thumb {
  background: var(--color-need-hunger);
}
.slider__input--hunger::-moz-range-thumb {
  background: var(--color-need-hunger);
}
.slider__input--hunger::-webkit-slider-thumb:hover {
  background: color-mix(in srgb, var(--color-need-hunger) 85%, black);
}
.slider__input--hunger::-moz-range-thumb:hover {
  background: color-mix(in srgb, var(--color-need-hunger) 85%, black);
}

.slider__input--thirst::-webkit-slider-thumb {
  background: var(--color-need-thirst);
}
.slider__input--thirst::-moz-range-thumb {
  background: var(--color-need-thirst);
}
.slider__input--thirst::-webkit-slider-thumb:hover {
  background: color-mix(in srgb, var(--color-need-thirst) 85%, black);
}
.slider__input--thirst::-moz-range-thumb:hover {
  background: color-mix(in srgb, var(--color-need-thirst) 85%, black);
}

.slider__input--energy::-webkit-slider-thumb {
  background: var(--color-need-energy);
}
.slider__input--energy::-moz-range-thumb {
  background: var(--color-need-energy);
}
.slider__input--energy::-webkit-slider-thumb:hover {
  background: color-mix(in srgb, var(--color-need-energy) 85%, black);
}
.slider__input--energy::-moz-range-thumb:hover {
  background: color-mix(in srgb, var(--color-need-energy) 85%, black);
}

.slider__input--shelter::-webkit-slider-thumb {
  background: var(--color-need-shelter);
}
.slider__input--shelter::-moz-range-thumb {
  background: var(--color-need-shelter);
}
.slider__input--shelter::-webkit-slider-thumb:hover {
  background: color-mix(in srgb, var(--color-need-shelter) 85%, black);
}
.slider__input--shelter::-moz-range-thumb:hover {
  background: color-mix(in srgb, var(--color-need-shelter) 85%, black);
}

.slider__input--play::-webkit-slider-thumb {
  background: var(--color-need-play);
}
.slider__input--play::-moz-range-thumb {
  background: var(--color-need-play);
}
.slider__input--play::-webkit-slider-thumb:hover {
  background: color-mix(in srgb, var(--color-need-play) 85%, black);
}
.slider__input--play::-moz-range-thumb:hover {
  background: color-mix(in srgb, var(--color-need-play) 85%, black);
}

.slider__input--social::-webkit-slider-thumb {
  background: var(--color-need-social);
}
.slider__input--social::-moz-range-thumb {
  background: var(--color-need-social);
}
.slider__input--social::-webkit-slider-thumb:hover {
  background: color-mix(in srgb, var(--color-need-social) 85%, black);
}
.slider__input--social::-moz-range-thumb:hover {
  background: color-mix(in srgb, var(--color-need-social) 85%, black);
}

.slider__input--comfort::-webkit-slider-thumb {
  background: var(--color-need-comfort);
}
.slider__input--comfort::-moz-range-thumb {
  background: var(--color-need-comfort);
}
.slider__input--comfort::-webkit-slider-thumb:hover {
  background: color-mix(in srgb, var(--color-need-comfort) 85%, black);
}
.slider__input--comfort::-moz-range-thumb:hover {
  background: color-mix(in srgb, var(--color-need-comfort) 85%, black);
}

.slider__input--hygiene::-webkit-slider-thumb {
  background: var(--color-need-hygiene);
}
.slider__input--hygiene::-moz-range-thumb {
  background: var(--color-need-hygiene);
}
.slider__input--hygiene::-webkit-slider-thumb:hover {
  background: color-mix(in srgb, var(--color-need-hygiene) 85%, black);
}
.slider__input--hygiene::-moz-range-thumb:hover {
  background: color-mix(in srgb, var(--color-need-hygiene) 85%, black);
}

.slider__input--nails::-webkit-slider-thumb {
  background: var(--color-need-nails);
}
.slider__input--nails::-moz-range-thumb {
  background: var(--color-need-nails);
}
.slider__input--nails::-webkit-slider-thumb:hover {
  background: color-mix(in srgb, var(--color-need-nails) 85%, black);
}
.slider__input--nails::-moz-range-thumb:hover {
  background: color-mix(in srgb, var(--color-need-nails) 85%, black);
}

.slider__input--chew::-webkit-slider-thumb {
  background: var(--color-need-chew);
}
.slider__input--chew::-moz-range-thumb {
  background: var(--color-need-chew);
}
.slider__input--chew::-webkit-slider-thumb:hover {
  background: color-mix(in srgb, var(--color-need-chew) 85%, black);
}
.slider__input--chew::-moz-range-thumb:hover {
  background: color-mix(in srgb, var(--color-need-chew) 85%, black);
}

.slider--lg .slider__input::-webkit-slider-runnable-track {
  block-size: 8px;
}

.slider--lg .slider__input::-moz-range-track {
  block-size: 8px;
}

.slider--lg .slider__input::-webkit-slider-thumb {
  inline-size: 22px;
  block-size: 22px;
  margin-block-start: -7px;
}

.slider--lg .slider__input::-moz-range-thumb {
  inline-size: 22px;
  block-size: 22px;
}

.slider--disabled .slider__label {
  color: var(--color-text-muted);
}

@media (prefers-reduced-motion: reduce) {
  .slider__input,
  .slider__input::-webkit-slider-thumb,
  .slider__input::-moz-range-thumb {
    transition: none;
  }
}
</style>