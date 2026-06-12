<template>
  <span :class="badgeClasses">
    <slot></slot>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger' | 'seasonal'
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'secondary',
  size: 'md'
})

const badgeClasses = computed(() => {
  const base = 'badge'
  const variant = `badge--${props.variant}`
  const size = `badge--${props.size}`

  return [base, variant, size].filter(Boolean).join(' ')
})
</script>

<style>
.badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  border-radius: 3px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge--sm {
  padding: 0.125rem 0.5rem;
  font-size: 0.7rem;
}

.badge--md {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.badge--lg {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.badge--primary {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  border: 1px solid transparent;
}

.badge--secondary {
  background-color: var(--color-neutral-300);
  color: var(--color-neutral-900);
  border: 1px solid var(--color-border-medium);
}

.badge--success {
  background-color: var(--color-success);
  color: var(--color-text-inverse);
  border: 1px solid transparent;
}

.badge--info {
  background-color: var(--color-info);
  color: var(--color-text-inverse);
  border: 1px solid transparent;
}

.badge--warning {
  background-color: var(--color-warning);
  color: var(--color-text-primary);
  border: 1px solid transparent;
}

.badge--danger {
  background-color: var(--color-error);
  color: var(--color-text-inverse);
  border: 1px solid transparent;
}

.badge--seasonal {
  background-color: var(--color-need-play);
  color: var(--color-text-inverse);
  border: 1px solid transparent;
}
</style>