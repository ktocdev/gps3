<template>
  <div
    ref="bowlRef"
    class="food-bowl"
    @dragover.prevent="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <span class="food-bowl__emoji no-select">{{ bowlEmoji }}</span>

    <div v-if="foods.length > 0" class="food-bowl__contents">
      <template v-for="(food, index) in foods" :key="`${food.itemId}-${index}`">
        <!-- Pellets: Display using PelletsVisual component -->
        <div
          v-if="isPellets(food)"
          class="food-bowl__food-item food-bowl__pellets-container"
          :class="[
            `food-bowl__food-item--count-${foods.length}`,
            `food-bowl__food-item--index-${index}`
          ]"
          :title="`${food.name}\nServing ${index + 1} of ${foods.length}`"
        >
          <PelletsVisual :pellet-emoji="getPelletEmoji(food)" />
        </div>
        <!-- Regular food items -->
        <span
          v-else
          class="food-bowl__food-item"
          :class="[
            `food-bowl__food-item--count-${foods.length}`,
            `food-bowl__food-item--index-${index}`
          ]"
          :title="`${food.name}\nServing ${index + 1} of ${foods.length}`"
        >
          {{ food.emoji }}
        </span>
      </template>
    </div>

    <HabitatItemPopover
      :title="popoverTitle"
      :metadata="popoverMetadata"
      :actions="popoverActions"
      :is-hovered="isHovered"
      :target-element="bowlRef"
    >
      <!-- Individual food items list -->
      <template v-if="foods.length > 0">
        <div class="food-bowl-items-section">
          <div class="food-bowl-items-section__header">Food Items</div>
          <div v-for="(food, index) in foods" :key="`food-${index}`" class="food-bowl-item">
            <div class="food-bowl-item__info">
              <span class="food-bowl-item__emoji">{{ food.emoji }}</span>
              <span class="food-bowl-item__name">{{ food.name }}</span>
              <span
                class="food-bowl-item__freshness"
                :class="getFreshnessClass(food.freshness)"
              >
                {{ food.freshness.toFixed(0) }}%
              </span>
            </div>
            <button
              class="food-bowl-item__remove-btn"
              :class="{ 'food-bowl-item__remove-btn--stale': food.freshness < STALE_THRESHOLD }"
              @click="handleRemoveFood(index)"
            >
              Remove
            </button>
          </div>
        </div>
      </template>
    </HabitatItemPopover>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import HabitatItemPopover from './HabitatItemPopover.vue'
import PelletsVisual from './PelletsVisual.vue'

interface FoodItem {
  itemId: string
  emoji: string
  name: string
  freshness: number
  addedAt: number
}

interface Props {
  bowlItemId: string
  bowlEmoji: string
  capacity: number
  foods: FoodItem[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'add-food': [foodItemId: string]
  'remove-food': [foodIndex: number]
}>()

const bowlRef = ref<HTMLElement | null>(null)
const isDragOver = ref(false)
const isHovered = ref(false)

const STALE_THRESHOLD = 40

// Check if food is pellets based on item ID
function isPellets(food: FoodItem): boolean {
  return food.itemId.includes('pellets')
}

// Get single pellet emoji for the PelletsVisual component
function getPelletEmoji(food: FoodItem): string {
  // For fortified pellets, use sparkle emoji
  if (food.itemId.includes('fortified')) {
    return '✨'
  }
  // For all other pellets, use chestnut emoji
  return '🌰'
}

// Popover title
const popoverTitle = computed(() => {
  return 'Food Bowl'
})

// Metadata for the popover
const popoverMetadata = computed(() => {
  if (props.foods.length === 0) {
    return [
      { label: 'Capacity', value: `0/${props.capacity}` }
    ]
  }

  const avgFreshness = props.foods.reduce((sum, food) => sum + food.freshness, 0) / props.foods.length

  return [
    { label: 'Food Items', value: `${props.foods.length}/${props.capacity}` },
    { label: 'Avg. Freshness', value: `${avgFreshness.toFixed(0)}%` }
  ]
})

// Popover actions
const popoverActions = computed(() => {
  return []
})

function getFreshnessClass(freshness: number): string {
  if (freshness >= 80) return 'food-bowl-item__freshness--good'
  if (freshness >= 40) return 'food-bowl-item__freshness--warning'
  return 'food-bowl-item__freshness--critical'
}

function handleRemoveFood(foodIndex: number) {
  emit('remove-food', foodIndex)
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()

  // Only show drop target if dragging food and bowl has capacity
  if (props.foods.length < props.capacity) {
    isDragOver.value = true
    event.dataTransfer!.dropEffect = 'move'
  } else {
    event.dataTransfer!.dropEffect = 'none'
  }
}

function handleDragLeave(event: DragEvent) {
  event.stopPropagation()
  isDragOver.value = false
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()
  isDragOver.value = false

  // Check if we have capacity
  if (props.foods.length >= props.capacity) {
    console.warn(`Bowl is full (${props.capacity} items max)`)
    return
  }

  // Get the dragged food item ID
  const itemData = event.dataTransfer!.getData('text/plain')
  if (!itemData) return

  try {
    const data = JSON.parse(itemData)
    const foodItemId = data.itemId

    // Emit event to add food to bowl
    emit('add-food', foodItemId)
  } catch (error) {
    console.error('Failed to parse drag data:', error)
  }
}
</script>

<style>
.food-bowl {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  inline-size: 100%;
  block-size: 100%;
}

.food-bowl__emoji {
  font-size: 3rem;
  line-height: 1;
  position: relative;
  z-index: 1;
}

.food-bowl__contents {
  position: absolute;
  inset-block-start: 50%;
  inset-inline-start: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  inline-size: 100%;
  block-size: 100%;
  z-index: 2;
  pointer-events: none;
}

.food-bowl__food-item {
  position: absolute;
  line-height: 1;
  pointer-events: none;
  cursor: help;
  transition: filter 0.2s ease;
}

.food-bowl__food-item:hover {
  filter: brightness(1.2);
}

/* 1 food item: centered, full size */
.food-bowl__food-item--count-1 {
  font-size: var(--font-size-xl);
  inset-inline-start: 50%;
  inset-block-start: 50%;
  transform: translate(-50%, -50%);
}

/* 2 food items: half size, left and right */
.food-bowl__food-item--count-2 {
  font-size: var(--font-size-lg);
  inset-block-start: 50%;
}

.food-bowl__food-item--count-2.food-bowl__food-item--index-0 {
  inset-inline-start: 30%;
  transform: translate(-50%, -50%);
}

.food-bowl__food-item--count-2.food-bowl__food-item--index-1 {
  inset-inline-start: 70%;
  transform: translate(-50%, -50%);
}

/* 3 food items: smaller size, left, center, right */
.food-bowl__food-item--count-3 {
  font-size: var(--font-size-base);
  inset-block-start: 50%;
}

.food-bowl__food-item--count-3.food-bowl__food-item--index-0 {
  inset-inline-start: 25%;
  transform: translate(-50%, -50%);
}

.food-bowl__food-item--count-3.food-bowl__food-item--index-1 {
  inset-inline-start: 50%;
  transform: translate(-50%, -50%);
}

.food-bowl__food-item--count-3.food-bowl__food-item--index-2 {
  inset-inline-start: 75%;
  transform: translate(-50%, -50%);
}

/* Pellets: Container for PelletsVisual component */
.food-bowl__pellets-container {
  position: absolute;
  inline-size: 100%;
  block-size: 100%;
}

/* Food items section in popover */
.food-bowl-items-section {
  margin-block-start: var(--space-3);
  padding-block-start: var(--space-3);
  border-block-start: 1px solid var(--color-border);
}

.food-bowl-items-section__header {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-block-end: var(--space-2);
}

.food-bowl-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-3);
  padding-block: var(--space-2);
  border-block-end: 1px solid var(--color-border-subtle);
}

.food-bowl-item:last-child {
  border-block-end: none;
}

.food-bowl-item__info {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex: 1;
  min-inline-size: 0;
}

.food-bowl-item__emoji {
  font-size: var(--font-size-base);
  flex-shrink: 0;
}

.food-bowl-item__name {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  flex: 1;
  min-inline-size: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.food-bowl-item__freshness {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  flex-shrink: 0;
}

.food-bowl-item__freshness--good {
  color: var(--color-success);
}

.food-bowl-item__freshness--warning {
  color: var(--color-warning);
}

.food-bowl-item__freshness--critical {
  color: var(--color-error);
}

.food-bowl-item__remove-btn {
  padding: var(--space-1) var(--space-2);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.food-bowl-item__remove-btn:hover {
  background-color: var(--color-bg-secondary);
  border-color: var(--color-error);
  color: var(--color-error);
}

.food-bowl-item__remove-btn--stale {
  background-color: var(--color-error);
  color: var(--color-text-inverse);
  border-color: var(--color-error);
}

.food-bowl-item__remove-btn--stale:hover {
  background-color: var(--color-error-hover);
}

.food-bowl-item__remove-btn:active {
  transform: scale(0.95);
}
</style>
