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
  background: linear-gradient(180deg, var(--panel-bg-top) 0%, var(--panel-bg-bot) 100%);
  border: 3px solid var(--panel-border);
  border-radius: var(--panel-radius);
  box-shadow: var(--panel-shadow);
  color: var(--color-wood-border);
  overflow: hidden;
}

/* Striped awning across the top of the notice-board */
.item-popover::before {
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

.item-popover__header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-block-end: 2px solid var(--color-wood-amber);
}

.item-popover__icon {
  font-size: var(--font-size-lg);
}

.item-popover__title {
  flex: 1;
  font-family: var(--font-family-heading);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-lg);
  color: var(--color-gold-800);
}

.item-popover__close {
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

.item-popover__close:hover {
  filter: brightness(1.06);
  transform: translateY(-1px);
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
  border: 2px solid var(--color-wood-dark);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  font-weight: 700;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.item-popover__action--move {
  background: linear-gradient(180deg, var(--color-gold-50), var(--color-gold-200));
  color: var(--color-gold-800);
  box-shadow: var(--shadow-confirm);
}

.item-popover__action--move:hover {
  filter: brightness(1.05);
  transform: translateY(-1px);
}
</style>
