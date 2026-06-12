<template>
  <Teleport to="body">
    <div
      v-if="show"
      ref="floatingEl"
      class="inventory-item-menu"
      :style="floatingStyles"
    >
      <div class="inventory-item-menu__header">
        <span class="inventory-item-menu__title">{{ title }}</span>
        <button class="inventory-item-menu__close" @click="$emit('close')">×</button>
      </div>
      <div class="inventory-item-menu__items">
        <button
          v-for="item in items"
          :key="item.itemId"
          class="inventory-item-menu__item"
          @click="$emit('select', item.itemId)"
        >
          <span class="inventory-item-menu__emoji">{{ item.emoji }}</span>
          <span class="inventory-item-menu__name">{{ item.name }}</span>
          <span class="inventory-item-menu__quantity">×{{ item.quantity }}</span>
        </button>
        <div v-if="items.length === 0" class="inventory-item-menu__empty">
          {{ emptyMessage }}
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { usePopover } from '../../composables/ui/usePopover'

export interface InventoryMenuItem {
  itemId: string
  name: string
  emoji: string
  quantity: number
}

const props = defineProps<{
  show: boolean
  position: { x: number; y: number }
  title: string
  items: InventoryMenuItem[]
  emptyMessage?: string
}>()

defineEmits<{
  close: []
  select: [itemId: string]
}>()

// Use Floating UI for smart positioning
// floatingEl is used as template ref (ref="floatingEl")
const { floatingEl, floatingStyles, updatePosition } = usePopover({ offset: 10 })
void floatingEl // Prevent unused variable warning - used in template

// Update position when props change
watch(
  () => props.position,
  (pos) => {
    if (pos) {
      updatePosition(pos.x, pos.y)
    }
  },
  { immediate: true }
)
</script>

<style>
.inventory-item-menu {
  /* Floating UI handles position: absolute and top/left */
  z-index: 1000;
  min-inline-size: 200px;
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-medium);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  /* transform removed - Floating UI handles positioning */
}

.inventory-item-menu__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-bg-secondary);
  border-block-end: 1px solid var(--color-border-light);
}

.inventory-item-menu__title {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.inventory-item-menu__close {
  display: flex;
  align-items: center;
  justify-content: center;
  inline-size: 24px;
  block-size: 24px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: var(--font-size-lg);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.inventory-item-menu__close:hover {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

.inventory-item-menu__items {
  display: flex;
  flex-direction: column;
  padding: var(--spacing-xs);
}

.inventory-item-menu__item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  background: transparent;
  text-align: start;
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.inventory-item-menu__item:hover {
  background-color: var(--color-primary-light);
}

.inventory-item-menu__emoji {
  font-size: var(--font-size-lg);
}

.inventory-item-menu__name {
  flex: 1;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.inventory-item-menu__quantity {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  font-weight: var(--font-weight-medium);
}

.inventory-item-menu__empty {
  padding: var(--spacing-md);
  text-align: center;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}
</style>
