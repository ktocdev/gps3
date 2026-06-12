<template>
  <div class="toggle-group" :class="toggleGroupClasses">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      :class="['toggle-group__option', { 'toggle-group__option--selected': modelValue === option.value }]"
      @click="selectOption(option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface ToggleOption {
  value: string
  label: string
}

interface Props {
  modelValue: string
  options: ToggleOption[]
  size?: 'sm' | 'md'
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  size: 'sm'
})

const emit = defineEmits<Emits>()

const toggleGroupClasses = computed(() => {
  return [`toggle-group--${props.size}`]
})

function selectOption(value: string) {
  emit('update:modelValue', value)
}
</script>

<style>
.toggle-group {
  display: inline-flex;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
}

.toggle-group__option {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-family-body);
  font-weight: var(--font-weight-medium);
  border: none;
  background: var(--color-neutral-800);
  color: var(--color-neutral-300);
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.toggle-group__option:not(:last-child) {
  border-inline-end: 1px solid var(--color-border);
}

.toggle-group__option--selected {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  font-weight: var(--font-weight-semibold);
}

.toggle-group__option--selected:hover {
  background: var(--color-primary-hover);
}

/* Size: sm */
.toggle-group--sm .toggle-group__option {
  padding-block: var(--space-2);
  padding-inline: var(--space-3);
  font-size: var(--font-size-sm);
  min-block-size: 36px;
}

/* Size: md */
.toggle-group--md .toggle-group__option {
  padding-block: var(--space-3);
  padding-inline: var(--space-4);
  font-size: var(--font-size-base);
  min-block-size: 44px;
}

/* Focus styles */
.toggle-group__option:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
  z-index: 1;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .toggle-group__option {
    transition: none;
  }
}
</style>
