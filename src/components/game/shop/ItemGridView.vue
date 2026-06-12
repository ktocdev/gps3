<template>
  <div class="item-grid-view">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
// This component provides the grid layout structure
// Content is provided via the default slot
</script>

<style>
.item-grid-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-4);
  inline-size: 100%;
}

/* Responsive adjustments */
@media (min-width: 640px) {
  .item-grid-view {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

@media (min-width: 1024px) {
  .item-grid-view {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }
}

/* Container query support for nested contexts */
@container (min-width: 640px) {
  .item-grid-view {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

@container (min-width: 1024px) {
  .item-grid-view {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }
}
</style>
