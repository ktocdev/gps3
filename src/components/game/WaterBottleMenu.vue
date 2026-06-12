<template>
  <Teleport to="body">
    <div
      ref="floatingEl"
      class="water-bottle-menu"
      :style="floatingStyles"
    >
    <div class="water-bottle-menu__header">
      <span class="water-bottle-menu__title">{{ bottleName || 'Water Bottle' }}</span>
      <button class="water-bottle-menu__close" @click="$emit('close')">×</button>
    </div>

    <div class="water-bottle-menu__content">
      <div class="water-bottle-menu__level">
        <span class="water-bottle-menu__level-label">Water Level</span>
        <div class="water-bottle-menu__level-bar">
          <div
            class="water-bottle-menu__level-fill"
            :class="getLevelColorClass(waterLevel)"
            :style="{ width: waterLevel + '%' }"
          ></div>
        </div>
        <span class="water-bottle-menu__level-value">{{ Math.round(waterLevel) }}%</span>
      </div>
    </div>

    <div class="water-bottle-menu__actions">
      <button
        class="water-bottle-menu__action water-bottle-menu__action--primary"
        :disabled="waterLevel >= 100"
        @click="$emit('refill')"
      >
        💧 Refill Water
      </button>
      <button
        class="water-bottle-menu__action water-bottle-menu__action--remove"
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

const props = defineProps<{
  waterLevel: number
  position: { x: number; y: number }
  bottleName?: string | null
}>()

defineEmits<{
  close: []
  refill: []
  remove: []
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

function getLevelColorClass(level: number): string {
  if (level >= 50) return 'water-bottle-menu__level-fill--high'
  if (level >= 25) return 'water-bottle-menu__level-fill--medium'
  return 'water-bottle-menu__level-fill--low'
}
</script>

<style>
.water-bottle-menu {
  /* Floating UI handles position: absolute and top/left */
  z-index: 1000;
  min-inline-size: 200px;
  max-inline-size: 260px;
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-medium);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  /* transform removed - Floating UI handles positioning */
}

.water-bottle-menu__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-bg-secondary);
  border-block-end: 1px solid var(--color-border-light);
}

.water-bottle-menu__title {
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-md);
  color: var(--color-text-primary);
}

.water-bottle-menu__close {
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

.water-bottle-menu__close:hover {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

.water-bottle-menu__content {
  padding: var(--spacing-md);
}

.water-bottle-menu__level {
  display: grid;
  grid-template-columns: 80px 1fr 40px;
  align-items: center;
  gap: var(--spacing-sm);
}

.water-bottle-menu__level-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.water-bottle-menu__level-bar {
  block-size: 12px;
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.water-bottle-menu__level-fill {
  block-size: 100%;
  border-radius: var(--radius-sm);
  transition: width var(--transition-normal);
}

.water-bottle-menu__level-fill--high {
  background: linear-gradient(180deg, #4da6ff 0%, #0088ff 100%);
}

.water-bottle-menu__level-fill--medium {
  background: linear-gradient(180deg, #ffc107 0%, #ff9800 100%);
}

.water-bottle-menu__level-fill--low {
  background: linear-gradient(180deg, #ff5722 0%, #d32f2f 100%);
}

.water-bottle-menu__level-value {
  font-size: var(--font-size-sm);
  font-family: var(--font-family-mono);
  color: var(--color-text-primary);
  text-align: end;
  font-weight: var(--font-weight-medium);
}

.water-bottle-menu__actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
  border-block-start: 1px solid var(--color-border-light);
}

.water-bottle-menu__action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.water-bottle-menu__action--primary {
  background-color: var(--color-info);
  color: white;
}

.water-bottle-menu__action--primary:hover:not(:disabled) {
  background-color: var(--color-info-hover);
}

.water-bottle-menu__action--primary:active:not(:disabled) {
  transform: scale(0.98);
}

.water-bottle-menu__action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.water-bottle-menu__action--remove {
  background-color: var(--color-accent-blue-100);
  color: var(--color-accent-blue-700);
}

.water-bottle-menu__action--remove:hover {
  background-color: var(--color-accent-blue-200);
}
</style>
