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
  background: linear-gradient(180deg, var(--panel-bg-top) 0%, var(--panel-bg-bot) 100%);
  border: 3px solid var(--panel-border);
  border-radius: var(--panel-radius);
  box-shadow: var(--panel-shadow);
  color: var(--color-wood-border);
  overflow: hidden;
  /* transform removed - Floating UI handles positioning */
}

/* Striped awning in the water accent */
.water-bottle-menu::before {
  content: '';
  display: block;
  block-size: 12px;
  background: repeating-linear-gradient(
    90deg,
    var(--color-item-water) 0 14px,
    var(--color-gold-50) 14px 28px
  );
  border-block-end: 2px solid var(--panel-border);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    inset 0 -1px 0 rgba(0, 0, 0, 0.18);
}

.water-bottle-menu__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  border-block-end: 2px solid var(--color-wood-amber);
}

.water-bottle-menu__title {
  font-family: var(--font-family-heading);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-lg);
  color: var(--color-gold-800);
}

.water-bottle-menu__close {
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

.water-bottle-menu__close:hover {
  filter: brightness(1.06);
  transform: translateY(-1px);
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
  font-weight: var(--font-weight-semibold);
  color: var(--color-wood-dark);
}

.water-bottle-menu__level-bar {
  block-size: 12px;
  background: linear-gradient(180deg, var(--color-wood-shadow), var(--color-wood-dark));
  border: 1.5px solid var(--color-wood-border);
  border-radius: var(--radius-full);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.4);
  overflow: hidden;
}

.water-bottle-menu__level-fill {
  block-size: 100%;
  border-radius: var(--radius-full);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3);
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
  color: var(--color-wood-border);
  text-align: end;
  font-weight: var(--font-weight-bold);
}

.water-bottle-menu__actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
  border-block-start: 1px solid rgba(146, 64, 14, 0.28);
}

.water-bottle-menu__action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border: 2px solid var(--color-wood-dark);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  font-weight: 700;
  cursor: pointer;
  box-shadow: var(--shadow-confirm);
  transition: all var(--transition-fast);
}

.water-bottle-menu__action--primary {
  background: linear-gradient(180deg, var(--color-pink-500), var(--color-pink-600));
  border-color: var(--color-pink-600);
  color: #ffffff;
  text-shadow: 0 1px 0 rgba(69, 26, 3, 0.25);
}

.water-bottle-menu__action--primary:hover:not(:disabled) {
  filter: brightness(1.06);
}

.water-bottle-menu__action--primary:active:not(:disabled) {
  transform: scale(0.98);
}

.water-bottle-menu__action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.water-bottle-menu__action--remove {
  background: linear-gradient(180deg, var(--color-gold-50), var(--color-gold-200));
  color: var(--color-gold-800);
}

.water-bottle-menu__action--remove:hover {
  filter: brightness(1.05);
  transform: translateY(-1px);
}
</style>
