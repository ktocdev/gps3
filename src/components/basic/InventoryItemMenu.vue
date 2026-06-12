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
  background: linear-gradient(180deg, var(--panel-bg-top) 0%, var(--panel-bg-bot) 100%);
  border: 3px solid var(--panel-border);
  border-radius: var(--panel-radius);
  box-shadow: var(--panel-shadow);
  color: var(--color-wood-border);
  overflow: hidden;
  /* transform removed - Floating UI handles positioning */
}

/* Striped awning */
.inventory-item-menu::before {
  content: '';
  display: block;
  block-size: 12px;
  background: repeating-linear-gradient(
    90deg,
    var(--color-gold) 0 14px,
    var(--color-gold-50) 14px 28px
  );
  border-block-end: 2px solid var(--panel-border);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    inset 0 -1px 0 rgba(0, 0, 0, 0.18);
}

.inventory-item-menu__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  border-block-end: 2px solid var(--color-wood-amber);
}

.inventory-item-menu__title {
  font-family: var(--font-family-heading);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-lg);
  color: var(--color-gold-800);
}

.inventory-item-menu__close {
  display: flex;
  align-items: center;
  justify-content: center;
  inline-size: 24px;
  block-size: 24px;
  padding: 0;
  border: 2px solid var(--color-wood-dark);
  background: linear-gradient(180deg, var(--color-gold-50) 0%, var(--color-gold-200) 100%);
  color: var(--color-gold-800);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  line-height: 1;
  cursor: pointer;
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-confirm);
  transition: all var(--transition-fast);
}

.inventory-item-menu__close:hover {
  filter: brightness(1.06);
  transform: translateY(-1px);
}

.inventory-item-menu__items {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs);
}

.inventory-item-menu__item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1.5px solid var(--chrome-entry-border);
  background-color: var(--chrome-entry-bg);
  color: var(--color-wood-border);
  font-family: inherit;
  text-align: start;
  cursor: pointer;
  border-radius: 8px;
  transition: all var(--transition-fast);
}

.inventory-item-menu__item:hover {
  border-color: var(--color-wood-dark);
  filter: brightness(1.03);
  transform: translateY(-1px);
}

.inventory-item-menu__emoji {
  font-size: var(--font-size-lg);
}

.inventory-item-menu__name {
  flex: 1;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-wood-border);
}

.inventory-item-menu__quantity {
  font-size: var(--font-size-xs);
  color: var(--color-wood-dark);
  font-weight: var(--font-weight-bold);
}

.inventory-item-menu__empty {
  padding: var(--spacing-md);
  text-align: center;
  color: var(--color-wood-shadow);
  font-style: italic;
  font-size: var(--font-size-sm);
}
</style>
