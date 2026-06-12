<template>
  <div :class="selectWrapperClasses">
    <label v-if="label" :for="selectId" class="select__label">
      {{ label }}
    </label>
    <div class="select__container">
      <select
        :id="selectId"
        :class="selectClasses"
        :value="modelValue"
        :disabled="disabled"
        :aria-label="ariaLabel"
        @change="handleChange"
      >
        <option v-if="placeholder" value="" disabled>
          {{ placeholder }}
        </option>
        <option
          v-for="option in options"
          :key="getOptionValue(option)"
          :value="getOptionValue(option)"
          :disabled="getOptionDisabled(option)"
        >
          {{ getOptionLabel(option) }}
        </option>
      </select>
      <div class="select__icon">
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
    </div>
    <div v-if="error" class="select__error">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue'

type SelectOption = string | number | { label: string; value: string | number; disabled?: boolean }

interface Props {
  modelValue: string | number
  options: SelectOption[]
  id?: string
  label?: string
  ariaLabel?: string
  placeholder?: string
  disabled?: boolean
  error?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'bordered'
}

interface Emits {
  (e: 'update:modelValue', value: string | number): void
  (e: 'change', value: string | number): void
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  size: 'md',
  variant: 'default'
})

const emit = defineEmits<Emits>()

// Generate unique ID for the select element
const instance = getCurrentInstance()
const selectId = computed(() => props.id || `select-${instance?.uid || Math.random().toString(36).substr(2, 9)}`)

const selectWrapperClasses = computed(() => {
  const base = 'select'
  const size = `select--${props.size}`
  const variant = `select--${props.variant}`
  const disabled = props.disabled ? 'select--disabled' : ''
  const hasError = props.error ? 'select--error' : ''

  return [base, size, variant, disabled, hasError].filter(Boolean).join(' ')
})

const selectClasses = computed(() => {
  return 'select__input'
})

const getOptionValue = (option: SelectOption): string | number => {
  if (typeof option === 'object' && option !== null) {
    return option.value
  }
  return option
}

const getOptionLabel = (option: SelectOption): string => {
  if (typeof option === 'object' && option !== null) {
    return option.label
  }
  return String(option)
}

const getOptionDisabled = (option: SelectOption): boolean => {
  if (typeof option === 'object' && option !== null && 'disabled' in option) {
    return option.disabled === true
  }
  return false
}

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const value = target.value

  // Convert to number if original value was number
  const convertedValue = isNaN(Number(value)) ? value : Number(value)

  emit('update:modelValue', convertedValue)
  emit('change', convertedValue)
}
</script>

<style>
/* Select Component - BEM Methodology */

/* Base Select Styles */
.select {
  position: relative;
  display: flex;
  flex-direction: column;
  inline-size: 100%;
}

.select__label {
  font-family: var(--font-family-heading);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-xl);
  color: var(--color-text-primary);
  margin-block-end: var(--space-2);
  line-height: var(--line-height-tight);
}

.select__container {
  position: relative;
  display: flex;
  align-items: center;
}

.select__input {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  inline-size: 100%;
  font-family: var(--font-family-body);
  font-weight: var(--font-weight-normal);
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-medium);
  border-start-start-radius: var(--radius-md);
  border-start-end-radius: var(--radius-md);
  border-end-start-radius: var(--radius-md);
  border-end-end-radius: var(--radius-md);
  transition: all var(--transition-fast);
  cursor: pointer;
  line-height: var(--line-height-normal);
  padding-inline-end: var(--space-10); /* Space for icon */
}

.select__input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
}

.select__input:disabled {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-muted);
  cursor: not-allowed;
  opacity: 0.6;
}

.select__icon {
  position: absolute;
  inset-inline-end: var(--space-3);
  inset-block-start: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--color-text-tertiary);
  transition: color var(--transition-fast);
}

.select__error {
  font-size: var(--font-size-sm);
  color: var(--color-error);
  margin-block-start: var(--space-1);
  line-height: var(--line-height-tight);
}

/* Select Variants */

/* Default Variant */
.select--default .select__input {
  background-color: var(--color-bg-primary);
  border-color: var(--color-border-medium);
}

.select--default .select__input:hover:not(:disabled) {
  border-color: var(--color-border-dark);
}

/* Bordered Variant */
.select--bordered .select__input {
  background-color: var(--color-bg-secondary);
  border-color: var(--color-border-light);
}

.select--bordered .select__input:hover:not(:disabled) {
  background-color: var(--color-bg-primary);
  border-color: var(--color-border-medium);
}

/* Select Sizes */

/* Small Size - Mobile First */
.select--sm .select__input {
  padding-block: var(--space-2);
  padding-inline: var(--space-3);
  font-size: var(--font-size-sm);
  min-block-size: 40px; /* iOS minimum touch target */
  border-start-start-radius: var(--radius-base);
  border-start-end-radius: var(--radius-base);
  border-end-start-radius: var(--radius-base);
  border-end-end-radius: var(--radius-base);
  padding-inline-end: var(--space-8);
}

.select--sm .select__icon {
  inset-inline-end: var(--space-2);
  inline-size: 16px;
  block-size: 16px;
}

/* Medium Size (Default) - Mobile First */
.select--md .select__input {
  padding-block: var(--space-3);
  padding-inline: var(--space-4);
  font-size: var(--font-size-base);
  min-block-size: 44px; /* iOS minimum touch target */
}

/* Large Size - Mobile First */
.select--lg .select__input {
  padding-block: var(--space-4);
  padding-inline: var(--space-5);
  font-size: var(--font-size-lg);
  min-block-size: 48px; /* iOS minimum touch target */
  border-start-start-radius: var(--radius-lg);
  border-start-end-radius: var(--radius-lg);
  border-end-start-radius: var(--radius-lg);
  border-end-end-radius: var(--radius-lg);
  padding-inline-end: var(--space-12);
}

.select--lg .select__icon {
  inset-inline-end: var(--space-4);
  inline-size: 24px;
  block-size: 24px;
}

/* Select State Modifiers */

/* Error State */
.select--error .select__input {
  border-color: var(--color-error);
  background-color: var(--color-error-bg);
}

.select--error .select__input:focus {
  border-color: var(--color-error);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.select--error .select__icon {
  color: var(--color-error);
}

/* Disabled State */
.select--disabled .select__label {
  color: var(--color-text-muted);
}

.select--disabled .select__icon {
  color: var(--color-text-muted);
}

/* Focus States for Better Accessibility */
.select__input:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Hover effect for icon */
.select__container:hover:not(.select--disabled) .select__icon {
  color: var(--color-text-secondary);
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .select__input {
    background-color: var(--color-bg-secondary);
  }

  .select--bordered .select__input {
    background-color: var(--color-bg-tertiary);
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .select__input {
    border-width: 2px;
  }

  .select__input:focus {
    border-width: 2px;
    box-shadow: 0 0 0 2px var(--color-primary);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .select__input,
  .select__icon {
    transition: none;
  }
}

/* Enhanced styling for larger screens */
@media (min-width: 641px) {
  /* Add any larger screen enhancements here if needed */
}</style>