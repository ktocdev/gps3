<template>
  <label :for="checkboxId" :class="checkboxClasses">
    <input
      :id="checkboxId"
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      :name="name"
      class="checkbox-field__input"
      @change="handleChange"
    />
    <span class="checkbox-field__label">{{ label }}</span>
  </label>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue'

interface Props {
  modelValue: boolean
  label: string
  id?: string
  disabled?: boolean
  name?: string
  size?: 'sm' | 'md' | 'lg'
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'change', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  size: 'md'
})

const emit = defineEmits<Emits>()

const instance = getCurrentInstance()
const checkboxId = computed(() => props.id || `checkbox-${instance?.uid || Math.random().toString(36).substr(2, 9)}`)

const checkboxClasses = computed(() => {
  const base = 'checkbox-field'
  const size = props.size !== 'md' ? `checkbox-field--${props.size}` : ''
  const disabled = props.disabled ? 'checkbox-field--disabled' : ''

  return [base, size, disabled].filter(Boolean).join(' ')
})

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.checked

  emit('update:modelValue', value)
  emit('change', value)
}
</script>

<style>
/* CheckboxField Component - BEM Methodology */

/* Base CheckboxField - extends existing .checkbox-label from forms.css */
.checkbox-field {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
  user-select: none;
}

.checkbox-field__input {
  inline-size: 18px;
  block-size: 18px;
  cursor: pointer;
  accent-color: var(--color-primary);
  margin: 0;
}

.checkbox-field__input:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

.checkbox-field__input:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.checkbox-field__label {
  font-family: var(--font-family-body);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  line-height: var(--line-height-tight);
}

/* Size Variants */
.checkbox-field--sm .checkbox-field__input {
  inline-size: 14px;
  block-size: 14px;
}

.checkbox-field--sm .checkbox-field__label {
  font-size: var(--font-size-sm);
}

.checkbox-field--lg .checkbox-field__input {
  inline-size: 22px;
  block-size: 22px;
}

.checkbox-field--lg .checkbox-field__label {
  font-size: var(--font-size-lg);
}

/* Disabled State */
.checkbox-field--disabled {
  cursor: not-allowed;
}

.checkbox-field--disabled .checkbox-field__label {
  color: var(--color-text-muted);
}

.checkbox-field--disabled .checkbox-field__input {
  cursor: not-allowed;
}

/* Focus-visible for better accessibility */
.checkbox-field__input:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .checkbox-field__input {
    border: 2px solid currentColor;
  }

  .checkbox-field__input:focus {
    outline-width: 3px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .checkbox-field__input {
    transition: none;
  }
}
</style>
