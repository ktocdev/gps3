<template>
  <div class="item-view-toggle">
    <button
      class="item-view-toggle__button"
      :class="{ 'item-view-toggle__button--active': modelValue === 'list' }"
      @click="$emit('update:modelValue', 'list')"
      :aria-label="'List view'"
      :aria-pressed="modelValue === 'list'"
    >
      <span class="item-view-toggle__icon">☰</span>
      <span class="item-view-toggle__label">List</span>
    </button>
    <button
      class="item-view-toggle__button"
      :class="{ 'item-view-toggle__button--active': modelValue === 'card' }"
      @click="$emit('update:modelValue', 'card')"
      :aria-label="'Card view'"
      :aria-pressed="modelValue === 'card'"
    >
      <span class="item-view-toggle__icon">▦</span>
      <span class="item-view-toggle__label">Cards</span>
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: 'card' | 'list'
}

defineProps<Props>()

defineEmits<{
  'update:modelValue': [value: 'card' | 'list']
}>()
</script>

<style>
.item-view-toggle {
  display: inline-flex;
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 2px;
  gap: 2px;
}

.item-view-toggle__button {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}

.item-view-toggle__button:hover {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
}

.item-view-toggle__button:focus-visible {
  box-shadow: 0 0 0 2px var(--color-primary);
}

.item-view-toggle__button--active {
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-semibold);
  box-shadow: var(--shadow-sm);
}

.item-view-toggle__icon {
  font-size: var(--font-size-lg);
  line-height: 1;
}

.item-view-toggle__label {
  line-height: 1;
}

/* Hide labels on small screens */
@media (max-width: 640px) {
  .item-view-toggle__label {
    display: none;
  }

  .item-view-toggle__button {
    padding: var(--space-2);
  }
}
</style>
