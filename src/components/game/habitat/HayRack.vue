<template>
  <div
    ref="hayRackRef"
    class="hay-rack"
    :class="fullnessClass"
    @dragover.prevent="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <span class="hay-rack__ladder no-select">🪜</span>
    <span class="hay-rack__emoji no-select">🌾</span>

    <div v-if="hayServings.length > 0" class="hay-rack__contents">
      <span
        v-for="(serving, index) in hayServings"
        :key="`${serving.instanceId}`"
        class="hay-rack__hay-item"
        :class="`hay-rack__hay-item--count-${hayServings.length} hay-rack__hay-item--index-${index}`"
      >
        🌾
      </span>
    </div>

    <HabitatItemPopover
      :title="popoverTitle"
      :metadata="popoverMetadata"
      :actions="popoverActions"
      :is-hovered="isHovered"
      :target-element="hayRackRef"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSuppliesStore } from '../../../stores/suppliesStore'
import HabitatItemPopover from './HabitatItemPopover.vue'

interface HayServing {
  itemId: string
  instanceId: string
}

interface Props {
  hayRackItemId: string
  hayServings: HayServing[]
  capacity: number
  freshness?: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'add-hay': [hayItemId: string]
  'clear-rack': []
  'fill-rack': []
}>()

const suppliesStore = useSuppliesStore()

const hayRackRef = ref<HTMLElement | null>(null)
const isDragOver = ref(false)
const isHovered = ref(false)

const STALE_THRESHOLD = 40 // Show clear button when freshness < 40%

const popoverTitle = computed(() => 'Hay Rack')

const popoverMetadata = computed(() => {
  const currentFreshness = props.freshness ?? 100
  return [
    { label: 'Servings', value: `${props.hayServings.length}/${props.capacity}` },
    { label: 'Freshness', value: `${currentFreshness.toFixed(0)}%` }
  ]
})

const popoverActions = computed(() => {
  const currentFreshness = props.freshness ?? 100
  const actions: Array<{ label: string; variant: 'default' | 'warning'; onClick: () => void; disabled?: boolean; title?: string }> = []

  // Show fill button if rack has empty slots
  const hasEmptySlots = props.hayServings.length < props.capacity
  if (hasEmptySlots) {
    actions.push({
      label: '🌾 Fill Rack',
      variant: 'default',
      onClick: () => emit('fill-rack')
    })
  }

  // Show empty button if there are any hay servings
  if (props.hayServings.length > 0) {
    // Use warning variant if hay is stale, otherwise default
    const label = currentFreshness < STALE_THRESHOLD ? '🗑️ Clear Stale Hay' : '🗑️ Empty Hay Rack'
    const variant = currentFreshness < STALE_THRESHOLD ? 'warning' : 'default'

    actions.push({
      label,
      variant,
      onClick: () => emit('clear-rack')
    })
  }

  return actions
})

const fullnessClass = computed(() => {
  const count = props.hayServings.length
  if (count === 0) return 'hay-rack--empty'
  if (count === 1) return 'hay-rack--quarter'
  if (count === 2) return 'hay-rack--half'
  if (count === 3) return 'hay-rack--three-quarters'
  return 'hay-rack--full'
})

function handleDragOver(event: DragEvent) {
  event.preventDefault()
  // Don't stop propagation - let HabitatVisual handle the drop logic

  // Check capacity - show not-allowed cursor if full
  if (props.hayServings.length >= props.capacity) {
    event.dataTransfer!.dropEffect = 'none'
    isDragOver.value = false
    return
  }

  // Check if dragged item is hay by looking for custom MIME type
  const isHay = event.dataTransfer?.types.includes('application/x-item-category-hay')

  if (!isHay) {
    // Not hay - show not-allowed cursor
    event.dataTransfer!.dropEffect = 'none'
    isDragOver.value = false
    return
  }

  // Valid hay item with capacity - allow drop
  isDragOver.value = true
  event.dataTransfer!.dropEffect = 'move'
}

function handleDragLeave(_event: DragEvent) {
  // Don't stop propagation - let it bubble up
  isDragOver.value = false
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  // Don't stop propagation - let HabitatVisual handle the drop logic
  isDragOver.value = false

  // Check if we have capacity
  if (props.hayServings.length >= props.capacity) {
    console.warn(`Hay rack is full (${props.capacity} servings max)`)
    return
  }

  // Get the dragged item ID
  const itemData = event.dataTransfer!.getData('text/plain')
  if (!itemData) return

  try {
    const data = JSON.parse(itemData)
    const itemId = data.itemId

    // Validate that this is a hay item
    const item = suppliesStore.getItemById(itemId)
    if (!item || item.category !== 'hay') {
      console.warn(`Cannot add ${item?.name || itemId} to hay rack - only hay is allowed`)
      return
    }

    // Emit event to add hay to rack
    emit('add-hay', itemId)
  } catch (error) {
    console.error('Failed to parse drag data:', error)
  }
}
</script>

<style>
.hay-rack {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  inline-size: 100%;
  block-size: 100%;
  transition: filter 0.3s ease;
}

.hay-rack__ladder {
  font-size: 2rem;
  line-height: 1;
  position: absolute;
  inset-block-start: 50%;
  inset-inline-start: 50%;
  transform: translate(-50%, -50%);
  z-index: 0;
  opacity: 0.6;
}

.hay-rack__emoji {
  font-size: 3rem;
  line-height: 1;
  position: relative;
  z-index: 1;
  transition: filter 0.3s ease, opacity 0.3s ease;
}

/* Fullness opacity and color shifts: fade out hay when empty, white → gold when full */
.hay-rack--empty .hay-rack__emoji {
  opacity: 0;
  filter: brightness(2) saturate(0);
}

.hay-rack--quarter .hay-rack__emoji {
  opacity: 1;
  filter: brightness(1.6) saturate(0.3);
}

.hay-rack--half .hay-rack__emoji {
  opacity: 1;
  filter: brightness(1.3) saturate(0.6);
}

.hay-rack--three-quarters .hay-rack__emoji {
  opacity: 1;
  filter: brightness(1.1) saturate(0.85);
}

.hay-rack--full .hay-rack__emoji {
  opacity: 1;
  filter: brightness(1) saturate(1);
}

.hay-rack__contents {
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

.hay-rack__hay-item {
  position: absolute;
  line-height: 1;
  pointer-events: none;
  cursor: help;
  transition: filter 0.2s ease;
}

.hay-rack__hay-item:hover {
  filter: brightness(1.2);
}

/* 1 hay serving: centered, full size */
.hay-rack__hay-item--count-1 {
  font-size: var(--font-size-xl);
  inset-inline-start: 50%;
  inset-block-start: 50%;
  transform: translate(-50%, -50%);
}

/* 2 hay servings: half size, left and right */
.hay-rack__hay-item--count-2 {
  font-size: var(--font-size-lg);
  inset-block-start: 50%;
}

.hay-rack__hay-item--count-2.hay-rack__hay-item--index-0 {
  inset-inline-start: 35%;
  transform: translate(-50%, -50%);
}

.hay-rack__hay-item--count-2.hay-rack__hay-item--index-1 {
  inset-inline-start: 65%;
  transform: translate(-50%, -50%);
}

/* 3 hay servings: smaller size, left, center, right */
.hay-rack__hay-item--count-3 {
  font-size: var(--font-size-base);
  inset-block-start: 50%;
}

.hay-rack__hay-item--count-3.hay-rack__hay-item--index-0 {
  inset-inline-start: 25%;
  transform: translate(-50%, -50%);
}

.hay-rack__hay-item--count-3.hay-rack__hay-item--index-1 {
  inset-inline-start: 50%;
  transform: translate(-50%, -50%);
}

.hay-rack__hay-item--count-3.hay-rack__hay-item--index-2 {
  inset-inline-start: 75%;
  transform: translate(-50%, -50%);
}

/* 4 hay servings: smallest size, grid layout */
.hay-rack__hay-item--count-4 {
  font-size: var(--font-size-sm);
}

.hay-rack__hay-item--count-4.hay-rack__hay-item--index-0 {
  inset-inline-start: 30%;
  inset-block-start: 40%;
  transform: translate(-50%, -50%);
}

.hay-rack__hay-item--count-4.hay-rack__hay-item--index-1 {
  inset-inline-start: 70%;
  inset-block-start: 40%;
  transform: translate(-50%, -50%);
}

.hay-rack__hay-item--count-4.hay-rack__hay-item--index-2 {
  inset-inline-start: 30%;
  inset-block-start: 60%;
  transform: translate(-50%, -50%);
}

.hay-rack__hay-item--count-4.hay-rack__hay-item--index-3 {
  inset-inline-start: 70%;
  inset-block-start: 60%;
  transform: translate(-50%, -50%);
}
</style>
