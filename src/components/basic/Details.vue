<template>
  <details :class="detailsClasses" :open="defaultOpen" @toggle="handleToggle" ref="detailsRef">
    <summary :class="summaryClasses">
      <span class="details__icon">{{ isOpen ? '▼' : '▶' }}</span>
      <slot name="summary">{{ summary }}</slot>
    </summary>
    <div class="details__content">
      <slot></slot>
    </div>
  </details>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  summary?: string
  defaultOpen?: boolean
  variant?: 'default' | 'compact' | 'bordered'
}

const props = withDefaults(defineProps<Props>(), {
  summary: '',
  defaultOpen: false,
  variant: 'default'
})

const isOpen = ref(props.defaultOpen)
const detailsRef = ref<HTMLDetailsElement | null>(null)

const detailsClasses = computed(() => {
  const base = 'details'
  const variant = `details--${props.variant}`
  return [base, variant].filter(Boolean).join(' ')
})

const summaryClasses = computed(() => {
  return 'details__summary'
})

const handleToggle = () => {
  if (detailsRef.value) {
    isOpen.value = detailsRef.value.open
  }
}
</script>

<style>
/* Details Component - BEM Methodology */
.details {
  margin-block-end: var(--space-3);
  border-radius: var(--radius-md);
}

.details--default {
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border-light);
}

.details--compact {
  background-color: transparent;
  border: none;
}

.details--bordered {
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-medium);
  border-inline-start-width: 3px;
  border-inline-start-color: var(--color-primary);
}

.details__summary {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3);
  cursor: pointer;
  user-select: none;
  list-style: none;
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  transition: background-color 0.2s ease;
}

.details__summary::-webkit-details-marker {
  display: none;
}

.details__summary:hover {
  background-color: var(--color-bg-hover);
}

.details--compact .details__summary {
  padding: var(--space-2);
  font-size: var(--font-size-sm);
}

.details__icon {
  display: inline-block;
  inline-size: 0.75rem;
  font-size: 0.625rem;
  color: var(--color-text-muted);
  transition: transform 0.2s ease;
}

.details[open] .details__icon {
  transform: rotate(0deg);
}

.details__content {
  padding-block-start: var(--space-2);
  padding-block-end: var(--space-3);
  padding-inline: var(--space-3);
}

.details--compact .details__content {
  padding: var(--space-2);
}

/* Mobile-first responsive adjustments */
@media (min-width: 768px) {
  .details__summary {
    padding: var(--space-4);
  }

  .details__content {
    padding-block-start: var(--space-3);
    padding-block-end: var(--space-4);
    padding-inline: var(--space-4);
  }
}
</style>
