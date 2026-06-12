<template>
  <Teleport to="body">
    <div
      v-if="show"
      ref="floatingEl"
      class="item-popover"
      :style="floatingStyles"
    >
      <div class="item-popover__header">
        <span class="item-popover__icon">{{ itemData?.itemEmoji }}</span>
        <span class="item-popover__title">{{ itemData?.itemName }}</span>
        <button class="item-popover__close" @click="$emit('close')">×</button>
      </div>

      <!-- Actions -->
      <div class="item-popover__actions">
        <button
          class="item-popover__action item-popover__action--move"
          @click="$emit('remove')"
        >
          📦 Move to Inventory
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { usePopover } from '../../composables/ui/usePopover'
import type { ItemPopoverData } from '../../composables/3d/use3DItemPopover'

interface Props {
  show: boolean
  position: { x: number; y: number }
  itemData: ItemPopoverData | null
}

const props = defineProps<Props>()

defineEmits<{
  close: []
  remove: []
}>()

// Use Floating UI for smart positioning
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
.item-popover {
  z-index: 1000;
  min-inline-size: 200px;
  max-inline-size: 260px;
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-medium);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.item-popover__header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background-color: var(--color-bg-secondary);
  border-block-end: 1px solid var(--color-border-light);
}

.item-popover__icon {
  font-size: var(--font-size-lg);
}

.item-popover__title {
  flex: 1;
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.item-popover__close {
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

.item-popover__close:hover {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

/* Actions */
.item-popover__actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3);
}

.item-popover__action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: none;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.item-popover__action--move {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

.item-popover__action--move:hover {
  background-color: var(--color-bg-secondary);
}
</style>
