<template>
  <Teleport to="body">
    <div
      v-if="show"
      ref="floatingEl"
      class="container-contents-menu"
      :style="floatingStyles"
    >
    <div class="container-contents-menu__header">
      <span class="container-contents-menu__title">{{ title }}</span>
      <button class="container-contents-menu__close" @click="$emit('close')">×</button>
    </div>

    <!-- Metadata row -->
    <div class="container-contents-menu__metadata">
      <span class="container-contents-menu__count">
        {{ itemCount }}/{{ capacity }}
      </span>
      <span
        v-if="showFreshness"
        class="container-contents-menu__freshness"
        :class="freshnessClass"
      >
        {{ Math.round(freshness) }}% fresh
      </span>
    </div>

    <!-- Food Bowl Contents -->
    <div v-if="containerType === 'bowl' && foods.length > 0" class="container-contents-menu__items">
      <div
        v-for="(food, index) in foods"
        :key="`food-${index}`"
        class="container-contents-menu__item"
      >
        <span class="container-contents-menu__item-emoji">{{ food.emoji }}</span>
        <span class="container-contents-menu__item-name">{{ food.name }}</span>
        <span
          class="container-contents-menu__item-freshness"
          :class="getFreshnessClass(food.freshness)"
        >
          {{ Math.round(food.freshness) }}%
        </span>
        <button
          class="container-contents-menu__remove-btn"
          :class="{ 'container-contents-menu__remove-btn--stale': food.freshness < 40 }"
          @click="$emit('remove-food', index)"
          title="Remove"
        >
          ×
        </button>
      </div>
    </div>

    <!-- Hay Rack Servings (simpler display) -->
    <div v-if="containerType === 'hay_rack' && hayServings > 0" class="container-contents-menu__hay-info">
      <span class="container-contents-menu__hay-icon">🌾</span>
      <span class="container-contents-menu__hay-text">{{ hayServings }} serving{{ hayServings !== 1 ? 's' : '' }} of hay</span>
    </div>

    <!-- Empty State -->
    <div v-if="isEmpty" class="container-contents-menu__empty">
      {{ emptyMessage }}
    </div>

    <!-- Actions -->
    <div class="container-contents-menu__actions">
      <button
        v-if="canFill"
        class="container-contents-menu__action container-contents-menu__action--fill"
        @click="$emit('fill')"
      >
        {{ containerType === 'bowl' ? '🍽️ Add Food' : '🌾 Fill Rack' }}
      </button>
      <button
        v-if="!isEmpty"
        class="container-contents-menu__action container-contents-menu__action--clear"
        :class="{ 'container-contents-menu__action--warning': isStale }"
        @click="$emit('clear')"
      >
        {{ clearButtonLabel }}
      </button>
      <button
        class="container-contents-menu__action container-contents-menu__action--remove"
        @click="$emit('remove')"
      >
        📦 Move to Inventory
      </button>
    </div>
  </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { usePopover } from '../../composables/ui/usePopover'

interface FoodItem {
  itemId: string
  emoji: string
  name: string
  freshness: number
}

interface Props {
  show: boolean
  position: { x: number; y: number }
  containerType: 'bowl' | 'hay_rack'
  containerName?: string | null
  // Food bowl props
  foods?: FoodItem[]
  bowlCapacity?: number
  // Hay rack props
  hayServings?: number
  hayCapacity?: number
  freshness?: number
}

const props = withDefaults(defineProps<Props>(), {
  foods: () => [],
  bowlCapacity: 3,
  hayServings: 0,
  hayCapacity: 4,
  freshness: 100
})

defineEmits<{
  close: []
  fill: []
  clear: []
  remove: []
  'remove-food': [index: number]
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

const STALE_THRESHOLD = 40

const title = computed(() => {
  return props.containerName || 'Container'
})

const itemCount = computed(() => {
  return props.containerType === 'bowl' ? props.foods.length : props.hayServings
})

const capacity = computed(() => {
  return props.containerType === 'bowl' ? props.bowlCapacity : props.hayCapacity
})

const isEmpty = computed(() => {
  return itemCount.value === 0
})

const canFill = computed(() => {
  return itemCount.value < capacity.value
})

const showFreshness = computed(() => {
  // Only show freshness for hay rack or if bowl has items
  return props.containerType === 'hay_rack' ? props.hayServings > 0 : props.foods.length > 0
})

const freshness = computed(() => {
  if (props.containerType === 'hay_rack') {
    return props.freshness
  }
  // Calculate average freshness for food bowl
  if (props.foods.length === 0) return 100
  const total = props.foods.reduce((sum, f) => sum + f.freshness, 0)
  return total / props.foods.length
})

const isStale = computed(() => {
  return freshness.value < STALE_THRESHOLD
})

const freshnessClass = computed(() => {
  return getFreshnessClass(freshness.value)
})

const emptyMessage = computed(() => {
  return props.containerType === 'bowl' ? 'No food in bowl' : 'No hay in rack'
})

const clearButtonLabel = computed(() => {
  if (props.containerType === 'bowl') {
    return isStale.value ? '🗑️ Clear Stale Food' : '🗑️ Empty Bowl'
  }
  return isStale.value ? '🗑️ Clear Stale Hay' : '🗑️ Empty Rack'
})

function getFreshnessClass(value: number): string {
  if (value >= 80) return 'container-contents-menu__freshness--good'
  if (value >= 40) return 'container-contents-menu__freshness--warning'
  return 'container-contents-menu__freshness--critical'
}
</script>

<style>
.container-contents-menu {
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

/* Striped awning in the food-container amber accent */
.container-contents-menu::before {
  content: '';
  display: block;
  block-size: 12px;
  background: repeating-linear-gradient(
    90deg,
    var(--color-item-food-container) 0 14px,
    var(--color-gold-50) 14px 28px
  );
  border-block-end: 2px solid var(--panel-border);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    inset 0 -1px 0 rgba(0, 0, 0, 0.18);
}

.container-contents-menu__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  border-block-end: 2px solid var(--color-wood-amber);
}

.container-contents-menu__title {
  font-family: var(--font-family-heading);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-lg);
  color: var(--color-gold-800);
}

.container-contents-menu__close {
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

.container-contents-menu__close:hover {
  filter: brightness(1.06);
  transform: translateY(-1px);
}

.container-contents-menu__metadata {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-md);
  border-block-end: 1.5px dashed rgba(146, 64, 14, 0.4);
  font-size: var(--font-size-xs);
}

.container-contents-menu__count {
  color: var(--color-wood-dark);
  font-weight: var(--font-weight-semibold);
}

.container-contents-menu__freshness {
  font-weight: var(--font-weight-medium);
}

.container-contents-menu__freshness--good {
  color: var(--color-green-600);
}

.container-contents-menu__freshness--warning {
  color: var(--color-yellow-600);
}

.container-contents-menu__freshness--critical {
  color: var(--color-error);
}

/* Food items list */
.container-contents-menu__items {
  display: flex;
  flex-direction: column;
  padding: var(--spacing-xs);
  max-block-size: 200px;
  overflow-y: auto;
}

.container-contents-menu__item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 8px;
  background-color: var(--chrome-entry-bg);
  border: 1.5px solid var(--chrome-entry-border);
  border-inline-start: 4px solid var(--color-wood-dark);
  margin-block-end: var(--spacing-xs);
}

.container-contents-menu__item:last-child {
  margin-block-end: 0;
}

.container-contents-menu__item-emoji {
  font-size: var(--font-size-base);
  flex-shrink: 0;
}

.container-contents-menu__item-name {
  flex: 1;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--color-wood-border);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.container-contents-menu__item-freshness {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  flex-shrink: 0;
}

.container-contents-menu__remove-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  inline-size: 20px;
  block-size: 20px;
  padding: 0;
  border: 1.5px solid var(--color-wood-dark);
  background: linear-gradient(180deg, var(--color-gold-50) 0%, var(--color-gold-200) 100%);
  color: var(--color-gold-800);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  line-height: 1;
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.container-contents-menu__remove-btn:hover {
  background: var(--color-red-50);
  border-color: var(--color-red-500);
  color: var(--color-red-500);
}

.container-contents-menu__remove-btn--stale {
  background: var(--color-red-50);
  border-color: var(--color-red-500);
  color: var(--color-red-500);
}

/* Hay rack info */
.container-contents-menu__hay-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
}

.container-contents-menu__hay-icon {
  font-size: var(--font-size-lg);
}

.container-contents-menu__hay-text {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-wood-border);
}

/* Empty state */
.container-contents-menu__empty {
  padding: var(--spacing-md);
  text-align: center;
  color: var(--color-wood-shadow);
  font-style: italic;
  font-size: var(--font-size-sm);
}

/* Actions */
.container-contents-menu__actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
  border-block-start: 1px solid rgba(146, 64, 14, 0.28);
}

.container-contents-menu__action {
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

.container-contents-menu__action--fill {
  background: linear-gradient(180deg, var(--color-pink-500), var(--color-pink-600));
  border-color: var(--color-pink-600);
  color: #ffffff;
  text-shadow: 0 1px 0 rgba(69, 26, 3, 0.25);
}

.container-contents-menu__action--fill:hover {
  filter: brightness(1.06);
  transform: translateY(-1px);
}

.container-contents-menu__action--clear {
  background: linear-gradient(180deg, var(--color-gold-50), var(--color-gold-200));
  color: var(--color-gold-800);
}

.container-contents-menu__action--clear:hover {
  filter: brightness(1.05);
  transform: translateY(-1px);
}

.container-contents-menu__action--warning {
  background: var(--color-red-50);
  border-color: var(--color-red-500);
  color: var(--color-red-500);
}

.container-contents-menu__action--warning:hover {
  background: var(--color-red-100);
  filter: none;
}

.container-contents-menu__action--remove {
  background: linear-gradient(180deg, var(--color-gold-50), var(--color-gold-200));
  color: var(--color-gold-800);
}

.container-contents-menu__action--remove:hover {
  filter: brightness(1.05);
  transform: translateY(-1px);
}
</style>
