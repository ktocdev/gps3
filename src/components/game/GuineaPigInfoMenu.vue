<template>
  <Teleport to="body">
    <div
      ref="floatingEl"
      class="guinea-pig-info-menu"
      :style="floatingStyles"
    >
    <div class="guinea-pig-info-menu__header">
      <span class="guinea-pig-info-menu__name">{{ guineaPig.name }}</span>
      <button class="guinea-pig-info-menu__close" @click="$emit('close')">×</button>
    </div>
    <div class="guinea-pig-info-menu__needs">
      <div
        v-for="need in needsList"
        :key="need.key"
        class="guinea-pig-info-menu__need"
      >
        <span class="guinea-pig-info-menu__need-label">{{ need.label }}</span>
        <div class="guinea-pig-info-menu__need-bar">
          <div
            class="guinea-pig-info-menu__need-fill"
            :class="getNeedColorClass(need.value)"
            :style="{ width: need.value + '%' }"
          ></div>
        </div>
        <span class="guinea-pig-info-menu__need-value">{{ Math.round(need.value) }}</span>
      </div>
    </div>

    <div class="guinea-pig-info-menu__actions">
      <button
        v-if="!isControlled"
        class="guinea-pig-info-menu__action guinea-pig-info-menu__action--primary"
        @click="$emit('take-control')"
      >
        🎯 Take Control
      </button>
      <template v-else>
        <div class="guinea-pig-info-menu__control-info">
          <span class="guinea-pig-info-menu__control-status">🟢 Controlling</span>
          <span class="guinea-pig-info-menu__control-hint">Click in habitat to move</span>
        </div>
        <button
          class="guinea-pig-info-menu__action guinea-pig-info-menu__action--secondary"
          @click="$emit('release-control')"
        >
          🔄 Release ({{ timeRemaining }}s)
        </button>
      </template>
    </div>
  </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import type { GuineaPig } from '../../stores/guineaPigStore'
import { usePopover } from '../../composables/ui/usePopover'

const props = defineProps<{
  guineaPig: GuineaPig
  position: { x: number; y: number }
  isControlled?: boolean
  timeRemaining?: number
}>()

defineEmits<{
  close: []
  'take-control': []
  'release-control': []
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

// Define which needs to display and their labels
// Organized by category: Critical > Environmental > Maintenance
const needsList = computed(() => [
  // Critical Needs
  { key: 'hunger', label: 'Hunger', value: props.guineaPig.needs.hunger },
  { key: 'thirst', label: 'Thirst', value: props.guineaPig.needs.thirst },
  { key: 'energy', label: 'Energy', value: props.guineaPig.needs.energy },
  { key: 'shelter', label: 'Shelter', value: props.guineaPig.needs.shelter },
  // Environmental Needs
  { key: 'play', label: 'Play', value: props.guineaPig.needs.play },
  { key: 'social', label: 'Social', value: props.guineaPig.needs.social },
  { key: 'comfort', label: 'Comfort', value: props.guineaPig.needs.comfort },
  // Maintenance Needs
  { key: 'hygiene', label: 'Hygiene', value: props.guineaPig.needs.hygiene },
  { key: 'nails', label: 'Nails', value: props.guineaPig.needs.nails },
  { key: 'chew', label: 'Chew', value: props.guineaPig.needs.chew },
])

/**
 * Get color class based on need value
 * Matches NeedRow thresholds: Green (60-100) → Grey (40-59) → Yellow (30-39) → Red (0-29)
 */
function getNeedColorClass(value: number): string {
  if (value >= 60) return 'guinea-pig-info-menu__need-fill--satisfied'
  if (value >= 40) return 'guinea-pig-info-menu__need-fill--good'
  if (value >= 30) return 'guinea-pig-info-menu__need-fill--medium'
  return 'guinea-pig-info-menu__need-fill--critical'
}
</script>

<style>
.guinea-pig-info-menu {
  /* Floating UI handles position: absolute and top/left */
  z-index: 1000;
  min-inline-size: 220px;
  max-inline-size: 280px;
  background: linear-gradient(180deg, var(--panel-bg-top) 0%, var(--panel-bg-bot) 100%);
  border: 3px solid var(--panel-border);
  border-radius: var(--panel-radius);
  box-shadow: var(--panel-shadow);
  color: var(--color-wood-border);
  overflow: hidden;
  /* transform removed - Floating UI handles positioning */
}

/* Striped awning in the pig pink accent */
.guinea-pig-info-menu::before {
  content: '';
  display: block;
  block-size: 12px;
  background: repeating-linear-gradient(
    90deg,
    var(--color-pink) 0 14px,
    var(--color-gold-50) 14px 28px
  );
  border-block-end: 2px solid var(--panel-border);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    inset 0 -1px 0 rgba(0, 0, 0, 0.18);
}

.guinea-pig-info-menu__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  border-block-end: 2px solid var(--color-wood-amber);
}

.guinea-pig-info-menu__name {
  font-family: var(--font-family-heading);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-xl);
  color: var(--color-gold-800);
}

.guinea-pig-info-menu__close {
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

.guinea-pig-info-menu__close:hover {
  filter: brightness(1.06);
  transform: translateY(-1px);
}

.guinea-pig-info-menu__needs {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  max-block-size: 200px;
  overflow-y: auto;
}

.guinea-pig-info-menu__need {
  display: grid;
  grid-template-columns: 60px 1fr 30px;
  align-items: center;
  gap: var(--spacing-xs);
}

.guinea-pig-info-menu__need-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--color-gold-800);
}

.guinea-pig-info-menu__need-bar {
  block-size: 8px;
  background: linear-gradient(180deg, var(--color-wood-shadow), var(--color-wood-dark));
  border: 1.5px solid var(--color-wood-border);
  border-radius: var(--radius-full);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.4);
  overflow: hidden;
}

.guinea-pig-info-menu__need-fill {
  block-size: 100%;
  border-radius: var(--radius-full);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3);
  transition: width var(--transition-normal);
}

.guinea-pig-info-menu__need-fill--satisfied {
  background-color: var(--color-success);
}

.guinea-pig-info-menu__need-fill--good {
  background-color: var(--color-text-muted);
}

.guinea-pig-info-menu__need-fill--medium {
  background-color: var(--color-warning);
}

.guinea-pig-info-menu__need-fill--critical {
  background-color: var(--color-danger);
}

.guinea-pig-info-menu__need-value {
  font-size: var(--font-size-xs);
  font-family: var(--font-family-mono);
  font-weight: var(--font-weight-bold);
  color: var(--color-wood-dark);
  text-align: end;
}

.guinea-pig-info-menu__actions {
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-block-start: 1px solid rgba(146, 64, 14, 0.28);
}

.guinea-pig-info-menu__action {
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 2px solid var(--color-wood-dark);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  font-weight: 700;
  cursor: pointer;
  box-shadow: var(--shadow-confirm);
  transition: all var(--transition-fast);
}

.guinea-pig-info-menu__action--primary {
  background: linear-gradient(180deg, var(--color-pink-500), var(--color-pink-600));
  border-color: var(--color-pink-600);
  color: #ffffff;
  text-shadow: 0 1px 0 rgba(69, 26, 3, 0.25);
}

.guinea-pig-info-menu__action--primary:hover {
  filter: brightness(1.06);
}

.guinea-pig-info-menu__action--primary:active {
  transform: scale(0.98);
}

.guinea-pig-info-menu__action--secondary {
  background: linear-gradient(180deg, var(--color-gold-50), var(--color-gold-200));
  color: var(--color-gold-800);
}

.guinea-pig-info-menu__action--secondary:hover {
  filter: brightness(1.05);
}

.guinea-pig-info-menu__action--secondary:active {
  transform: scale(0.98);
}

.guinea-pig-info-menu__control-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-block-end: var(--spacing-sm);
  text-align: center;
}

.guinea-pig-info-menu__control-status {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-success);
}

.guinea-pig-info-menu__control-hint {
  font-size: var(--font-size-xs);
  color: var(--color-wood-dark);
}
</style>
