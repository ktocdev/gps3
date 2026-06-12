<template>
  <div class="dbg-panel-row" :class="`dbg-panel-row--${columns ?? 3}`">
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  columns?: 2 | 3
}>()
</script>

<style>
.dbg-panel-row {
  display: grid;
  gap: var(--space-3);
}

.dbg-panel-row--2 {
  grid-template-columns: repeat(2, 1fr);
}

.dbg-panel-row--3 {
  grid-template-columns: repeat(3, 1fr);
}

@media (max-width: 880px) {
  .dbg-panel-row--2,
  .dbg-panel-row--3 {
    grid-template-columns: 1fr;
  }
}
</style>
