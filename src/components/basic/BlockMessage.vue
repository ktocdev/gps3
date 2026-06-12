<template>
  <div :class="messageClasses">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'error' | 'warning' | 'success' | 'info' | 'pink' | 'green' | 'dark' | 'light'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'info'
})

const messageClasses = computed(() => {
  const base = 'block-message'
  const variant = `block-message--${props.variant}`
  return [base, variant].join(' ')
})
</script>

<style>
.block-message {
  padding: var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  margin-block-end: var(--space-4);
  border: 1px solid transparent;
}

/* Semantic variants */
.block-message--error {
  background-color: var(--color-error-bg);
  color: var(--color-text-primary);
  border-color: var(--color-error);
}

.block-message--warning {
  background-color: var(--color-warning-bg);
  color: var(--color-text-primary);
  border-color: var(--color-warning);
}

.block-message--success {
  background-color: var(--color-success-bg);
  color: var(--color-text-primary);
  border-color: var(--color-success);
}

.block-message--info {
  background-color: var(--color-info-bg);
  color: var(--color-text-primary);
  border-color: var(--color-info);
}

/* Themed variants */
.block-message--pink {
  background-color: var(--color-primary-bg);
  color: var(--color-text-primary);
  border-color: var(--color-primary);
}

.block-message--green {
  background-color: var(--color-success-bg);
  color: var(--color-text-primary);
  border-color: var(--color-success);
}

.block-message--dark {
  background-color: var(--color-neutral-800);
  color: var(--color-text-inverse);
  border-color: var(--color-neutral-700);
}

.block-message--light {
  background-color: var(--color-neutral-100);
  color: var(--color-text-primary);
  border-color: var(--color-neutral-300);
}
</style>
