<template>
  <div
    class="habitat-sidebar inventory-sidebar"
    @dragover.prevent="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
    @touchmove="!isSelectMode && handleTouchMoveOnSidebar($event)"
    @touchend="!isSelectMode && handleTouchEndOnSidebar($event)"
    :class="{ 'inventory-sidebar--drop-target': isDragOver || isTouchOver }"
  >
    <div class="inventory-sidebar__header">
      <h3>🎒 Inventory</h3>
      <Button
        v-if="showToggleButton"
        variant="primary"
        size="sm"
        @click="togglePlacementMode"
        :title="'Switch between drag-and-drop and tap-to-place'"
      >
        {{ placementModeLabel }}
      </Button>
    </div>

    <!-- Placement instruction banner (always shown on touch devices) -->
    <BlockMessage v-if="isSelectMode" variant="info" class="inventory-sidebar__placement-instruction">
      <div class="inventory-sidebar__instruction-content">
        <span class="no-select">
          {{ placementInstructionText }}
        </span>
        <Button v-if="isSelectMode && selectedItemForPlacement" variant="danger" size="sm" @click="cancelItemSelection">Cancel</Button>
      </div>
    </BlockMessage>
    <div class="inventory-sidebar__items">
      <!-- Serving-based consumables -->
      <InventoryTileServing
        v-for="item in servingBasedItems"
        :key="item.itemId"
        :item-id="item.itemId"
        :name="item.name"
        :emoji="item.emoji"
        :category="item.category"
        :servings-remaining="item.servingsRemaining"
        :max-servings="item.maxServings"
        :instance-count="item.instanceCount"
        :is-disabled="item.isDisabled"
        :tooltip-message="item.tooltipMessage"
        :draggable="!isSelectMode"
        :is-selected="isSelectMode && selectedItemForPlacement?.itemId === item.itemId"
        @dragstart="!isSelectMode && ((_itemId: string, event: DragEvent) => handleServingDragStart(event, item))"
        @dragend="!isSelectMode && handleDragEnd"
        @touchstart="!isSelectMode && ((_itemId: string, event: TouchEvent) => handleServingTouchStart(event, item))"
        @touchmove="!isSelectMode && ((_itemId: string, event: TouchEvent) => handleServingTouchMove(event, item))"
        @touchend="!isSelectMode && ((_itemId: string, event: TouchEvent) => handleServingTouchEnd(event, item))"
        @click="(_itemId, _event) => handleServingItemClick(item)"
      />

      <!-- Bedding (read-only) -->
      <div
        v-for="bedding in beddingItems"
        :key="bedding.id"
        class="inventory-sidebar__item-card inventory-sidebar__item-card--readonly"
        :title="'Bedding is used automatically during habitat cleaning'"
      >
        <span class="inventory-sidebar__item-emoji no-select">{{ bedding.emoji }}</span>
        <span class="inventory-sidebar__item-name no-select">{{ bedding.name }}</span>
        <span class="inventory-sidebar__item-quantity no-select">{{ bedding.formattedQuantity }}</span>
      </div>

      <!-- Regular habitat items and food -->
      <div
        v-for="item in regularItems"
        :key="item.id"
        class="inventory-sidebar__item-card"
        :class="{
          'inventory-sidebar__item-card--selected': isSelectMode && selectedItemForPlacement?.itemId === item.id,
          'inventory-sidebar__item-card--select-mode': isSelectMode
        }"
        :draggable="!isSelectMode"
        @dragstart="!isSelectMode && handleDragStart($event, item)"
        @dragend="handleDragEnd"
        @touchstart="!isSelectMode && handleRegularTouchStart($event, item)"
        @touchmove="!isSelectMode && handleRegularTouchMove($event, item)"
        @touchend="!isSelectMode && handleRegularTouchEnd($event, item)"
        @click="handleRegularItemClick(item)"
      >
        <span class="inventory-sidebar__item-emoji no-select">{{ item.emoji }}</span>
        <span class="inventory-sidebar__item-name no-select">{{ item.name }}</span>
        <span v-if="item.availableCount > 1" class="inventory-sidebar__item-count no-select">×{{ item.availableCount }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useHabitatConditions } from '../../../../stores/habitatConditions'
import { useInventoryStore } from '../../../../stores/inventoryStore'
import { useSuppliesStore } from '../../../../stores/suppliesStore'
import { useGuineaPigStore } from '../../../../stores/guineaPigStore'
import { useUiPreferencesStore } from '../../../../stores/uiPreferencesStore'
import { useHabitatContainers } from '../../../../composables/useHabitatContainers'
import { isTouchDevice } from '../../../../utils/deviceDetection'
import InventoryTileServing from '../../shop/InventoryTileServing.vue'
import Button from '../../../basic/Button.vue'
import BlockMessage from '../../../basic/BlockMessage.vue'
import type HabitatVisual from '../HabitatVisual.vue'

interface Props {
  habitatVisualRef?: InstanceType<typeof HabitatVisual> | null
}

const props = defineProps<Props>()

const habitat = useHabitatConditions()
const habitatContainers = useHabitatContainers()
const inventoryStore = useInventoryStore()
const suppliesStore = useSuppliesStore()
const guineaPigStore = useGuineaPigStore()
const uiPreferencesStore = useUiPreferencesStore()

// Use storeToRefs to make store state reactive
const { itemPlacementMode } = storeToRefs(uiPreferencesStore)

// Detect if this is a touch device
const isTouchOnly = isTouchDevice()

const isDragOver = ref(false)
const isTouchOver = ref(false)

// Touch state
const activeTouchItem = ref<{
  itemId: string
  instanceId?: string
  isServingBased: boolean
  size: { width: number; height: number }
} | null>(null)

// Select mode state
const selectedItemForPlacement = ref<{
  itemId: string
  instanceId?: string
  isServingBased: boolean
  size: { width: number; height: number }
  emoji: string
  name: string
} | null>(null)

// Computed: Check if we're in select mode (touch devices are always in select mode)
const isSelectMode = computed(() => {
  return isTouchOnly || itemPlacementMode.value === 'select'
})

// Computed: Show toggle button (hide on touch-only devices)
const showToggleButton = computed(() => {
  return !isTouchOnly
})

// Computed: Label for toggle button
const placementModeLabel = computed(() => {
  return itemPlacementMode.value === 'drag' ? '🖱️ Drag' : '👆 Select'
})

// Helper functions for item type checking
function isFood(itemId: string): boolean {
  const item = suppliesStore.getItemById(itemId)
  return item?.category === 'food'
}

function isHay(itemId: string): boolean {
  const item = suppliesStore.getItemById(itemId)
  return item?.category === 'hay'
}

function isBowl(itemId: string): boolean {
  return itemId.includes('bowl')
}

function isHayRack(itemId: string): boolean {
  return itemId.includes('hay_rack')
}

// Computed: Check if all bowls are full
const allBowlsFull = computed(() => {
  const bowls = habitat.habitatItems.filter(itemId => isBowl(itemId))
  if (bowls.length === 0) return false

  return bowls.every(bowlId => {
    const contents = habitatContainers.getBowlContents(bowlId)
    const bowlItem = suppliesStore.getItemById(bowlId)
    const capacity = bowlItem?.stats?.foodCapacity || 3
    return contents.length >= capacity
  })
})

// Computed: Check if all hay racks are full
const allHayRacksFull = computed(() => {
  const hayRacks = habitat.habitatItems.filter(itemId => isHayRack(itemId))
  if (hayRacks.length === 0) return false

  return hayRacks.every(rackId => {
    const contents = habitatContainers.getHayRackContents(rackId)
    const maxCapacity = 4
    return contents.length >= maxCapacity
  })
})

// Computed: Instruction text based on mode and selection
const placementInstructionText = computed(() => {
  if (isSelectMode.value) {
    if (selectedItemForPlacement.value) {
      const itemId = selectedItemForPlacement.value.itemId

      // Check if food and all bowls are full
      if (isFood(itemId)) {
        const bowls = habitat.habitatItems.filter(id => isBowl(id))
        if (bowls.length === 0) {
          return 'No Bowls Available'
        }
        if (allBowlsFull.value) {
          return 'All Bowls Are Full'
        }
      }

      // Check if hay and all hay racks are full
      if (isHay(itemId)) {
        const hayRacks = habitat.habitatItems.filter(id => isHayRack(id))
        if (hayRacks.length === 0) {
          return 'No Hay Racks Available'
        }
        if (allHayRacksFull.value) {
          return 'All Hay Racks Are Full'
        }
      }

      return `Tap grid to place ${selectedItemForPlacement.value.emoji}`
    }
    return 'Tap item to select for placement'
  } else {
    // Drag mode
    return 'Drag an item to the habitat. Food must go in food containers.'
  }
})

// Toggle between drag and select mode
function togglePlacementMode() {
  console.log(`[InventorySidebar] Toggle clicked! Current mode: ${itemPlacementMode.value}`)
  uiPreferencesStore.togglePlacementMode()
  console.log(`[InventorySidebar] After toggle: ${itemPlacementMode.value}`)
}

// Get the first active guinea pig for consumption limit checks
const activeGuineaPig = computed(() => {
  const activeIds = guineaPigStore.collection.activeGuineaPigIds
  if (activeIds.length === 0) return null
  return guineaPigStore.getGuineaPig(activeIds[0])
})

// Serving-based consumables (hay, lettuce, carrots)
const servingBasedItems = computed(() => {
  return inventoryStore.items
    .filter(invItem => {
      const item = suppliesStore.getItemById(invItem.itemId)
      // Only show items with serving metadata
      return item?.stats?.servings !== undefined
    })
    .map(invItem => {
      const item = suppliesStore.getItemById(invItem.itemId)
      // Filter instances with servings remaining
      const availableInstances = invItem.instances.filter(
        inst => inst.servingsRemaining !== undefined && inst.servingsRemaining > 0
      )

      // Use first instance for display, but show count of all instances
      const firstInstance = availableInstances[0]

      // Check food consumption limits
      const subCategory = item?.subCategory || ''
      const foodType = guineaPigStore.getFoodTypeFromSubCategory(subCategory)
      let isDisabled = false
      let tooltipMessage = ''

      if (activeGuineaPig.value && foodType && item?.category === 'food') {
        const canFeed = guineaPigStore.checkConsumptionLimit(activeGuineaPig.value.id, foodType)
        if (!canFeed) {
          isDisabled = true
          tooltipMessage = `Food limit reached (5 servings per hunger cycle)`
        }
      }

      return {
        instanceId: firstInstance?.instanceId || '',
        itemId: invItem.itemId,
        name: item?.name || 'Unknown',
        emoji: item?.emoji || '📦',
        category: item?.category || '',
        servingsRemaining: firstInstance?.servingsRemaining || 0,
        maxServings: firstInstance?.maxServings || 0,
        instanceCount: availableInstances.length,
        isDisabled,
        tooltipMessage
      }
    })
    .filter(item => item.instanceCount > 0) // Only show if at least one instance exists
})

// Regular habitat items and non-serving food
const regularItems = computed(() => {
  return inventoryStore.items
    .filter(invItem => {
      const item = suppliesStore.getItemById(invItem.itemId)
      // Show habitat items and food WITHOUT serving metadata
      const isPlaceable = item?.category === 'habitat_item' || item?.category === 'food'
      const hasNoServings = item?.stats?.servings === undefined
      return isPlaceable && hasNoServings
    })
    .map(invItem => {
      const item = suppliesStore.getItemById(invItem.itemId)
      // Count how many are in habitat vs available
      const inHabitatCount = habitat.habitatItems.filter((id: string) => id === invItem.itemId).length
      const availableCount = invItem.quantity - inHabitatCount

      return {
        id: invItem.itemId,
        name: item?.name || 'Unknown',
        emoji: item?.emoji || '📦',
        size: getItemSize(item),
        quantity: invItem.quantity,
        availableCount
      }
    })
    .filter(item => item.availableCount > 0) // Only show if at least one is available
})

// Bedding items (read-only display with exact quantities)
const beddingItems = computed(() => {
  // Get all bedding items from inventory
  return inventoryStore.items
    .filter(invItem => {
      const item = suppliesStore.getItemById(invItem.itemId)
      return item?.category === 'bedding'
    })
    .map(invItem => {
      // Calculate total amount remaining across all instances (bags) of this type
      let totalAmount = 0

      for (const instance of invItem.instances) {
        totalAmount += instance.amountRemaining ?? 1 // Default to 1 (full bag) if not set
      }

      const item = suppliesStore.getItemById(invItem.itemId)

      return {
        id: invItem.itemId,
        name: item?.name || 'Bedding',
        emoji: item?.emoji || '🛏️',
        quantity: totalAmount,
        formattedQuantity: totalAmount > 0 ? `${totalAmount.toFixed(2)} bags` : '0 bags'
      }
    })
    .filter(item => item.quantity > 0) // Only show bedding types that are owned
})

function getItemSize(item: any): { width: number; height: number } {
  const size = item.stats?.size
  if (size === 'small') return { width: 1, height: 1 }
  if (size === 'medium') return { width: 2, height: 1 }
  if (size === 'large') return { width: 2, height: 2 }
  return { width: 1, height: 1 }
}

// Drag handlers
function handleServingDragStart(event: DragEvent, item: any) {
  if (!event.dataTransfer) return

  // Get item category for drag validation
  const suppliesItem = suppliesStore.getItemById(item.itemId)
  const category = suppliesItem?.category || 'unknown'

  // Store serving data for drop handler
  const dragData = {
    itemId: item.itemId,
    instanceId: item.instanceId,
    isServingBased: true,
    size: { width: 1, height: 1 } // Servings are always 1x1
  }

  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', JSON.stringify(dragData))
  // Add category as custom MIME type so we can check it during dragover
  event.dataTransfer.setData(`application/x-item-category-${category}`, '')

  // Create custom drag ghost with emoji
  const dragGhost = document.createElement('div')
  dragGhost.className = 'inventory-drag-ghost'
  dragGhost.textContent = item.emoji || '📦'
  dragGhost.style.position = 'absolute'
  dragGhost.style.top = '-1000px'
  document.body.appendChild(dragGhost)
  event.dataTransfer.setDragImage(dragGhost, 20, 20)

  // Clean up after a short delay
  setTimeout(() => {
    if (document.body.contains(dragGhost)) {
      document.body.removeChild(dragGhost)
    }
  }, 0)

  // Notify HabitatVisual about the drag
  if (props.habitatVisualRef) {
    props.habitatVisualRef.setDraggedItem(item.itemId, { width: 1, height: 1 })
  }
}

function handleDragStart(event: DragEvent, item: any) {
  if (!event.dataTransfer) return

  // Get item category for drag validation
  const suppliesItem = suppliesStore.getItemById(item.id)
  const category = suppliesItem?.category || 'unknown'

  // Store item data for drop handler
  const dragData = {
    itemId: item.id,
    size: item.size
  }

  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', JSON.stringify(dragData))
  // Add category as custom MIME type so we can check it during dragover
  event.dataTransfer.setData(`application/x-item-category-${category}`, '')

  // Create custom drag image with only the emoji
  const dragImage = document.createElement('div')
  dragImage.textContent = item.emoji || '📦'
  dragImage.style.fontSize = '2rem'
  dragImage.style.position = 'absolute'
  dragImage.style.top = '-1000px'
  document.body.appendChild(dragImage)
  event.dataTransfer.setDragImage(dragImage, 16, 16)

  // Clean up after a short delay
  setTimeout(() => {
    document.body.removeChild(dragImage)
  }, 0)

  // Notify HabitatVisual about the drag
  if (props.habitatVisualRef) {
    props.habitatVisualRef.setDraggedItem(item.id, item.size)
  }

  // Visual feedback
  const target = event.target as HTMLElement
  target.style.opacity = '0.5'
}

function handleDragEnd(event: DragEvent) {
  const target = event.target as HTMLElement
  target.style.opacity = '1'

  // Clear dragged item
  if (props.habitatVisualRef) {
    props.habitatVisualRef.clearDraggedItem()
  }
}

// Inventory drop zone handlers
function handleDragOver(event: DragEvent) {
  event.preventDefault()
  isDragOver.value = true

  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

function handleDragLeave() {
  isDragOver.value = false
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  isDragOver.value = false

  const itemData = event.dataTransfer?.getData('text/plain')
  if (!itemData) return

  try {
    const data = JSON.parse(itemData)
    const itemId = data.itemId
    const isRepos = data.isRepositioning || false

    // Only handle items being dragged FROM the habitat (repositioning = true)
    if (!isRepos) {
      console.log('Item is from inventory, not habitat. Ignoring drop.')
      return
    }

    // Check if item is a bowl or hay rack with contents
    const isBowl = itemId.includes('bowl') || itemId.includes('dish')
    const isHayRack = itemId.includes('hay_rack')

    if (isBowl && habitat.getBowlContents(itemId).length > 0) {
      console.warn('Cannot remove bowl with food. Clear it first.')
      return
    }

    if (isHayRack && habitat.getHayRackContents(itemId).length > 0) {
      console.warn('Cannot remove hay rack with hay. Clear it first.')
      return
    }

    // Remove item from habitat and return to inventory
    const success = habitat.removeItemFromHabitat(itemId)
    if (success) {
      console.log(`Removed ${itemId} from habitat and returned to inventory`)
    }
  } catch (e) {
    console.error('Error parsing drag data:', e)
  }
}

// Touch handlers for serving-based items
function handleServingTouchStart(_event: TouchEvent, item: any) {
  activeTouchItem.value = {
    itemId: item.itemId,
    instanceId: item.instanceId,
    isServingBased: true,
    size: { width: 1, height: 1 }
  }

  // Notify HabitatVisual about the touch drag
  if (props.habitatVisualRef) {
    props.habitatVisualRef.setDraggedItem(item.itemId, { width: 1, height: 1 })
  }
}

function handleServingTouchMove(event: TouchEvent, _item: any) {
  if (!activeTouchItem.value) return

  // Notify HabitatVisual to update hover cell based on touch position
  if (props.habitatVisualRef) {
    props.habitatVisualRef.handleTouchMove(event)
  }
}

function handleServingTouchEnd(event: TouchEvent, _item: any) {
  if (!activeTouchItem.value) return

  // Notify HabitatVisual to complete the drop
  if (props.habitatVisualRef) {
    props.habitatVisualRef.handleTouchEnd(event, activeTouchItem.value)
  }

  // Clear touch state
  activeTouchItem.value = null
  if (props.habitatVisualRef) {
    props.habitatVisualRef.clearDraggedItem()
  }
}

// Touch handlers for regular items
function handleRegularTouchStart(_event: TouchEvent, item: any) {
  activeTouchItem.value = {
    itemId: item.id,
    isServingBased: false,
    size: item.size
  }

  // Notify HabitatVisual about the touch drag
  if (props.habitatVisualRef) {
    props.habitatVisualRef.setDraggedItem(item.id, item.size)
  }
}

function handleRegularTouchMove(event: TouchEvent, _item: any) {
  if (!activeTouchItem.value) return

  // Notify HabitatVisual to update hover cell based on touch position
  if (props.habitatVisualRef) {
    props.habitatVisualRef.handleTouchMove(event)
  }
}

function handleRegularTouchEnd(event: TouchEvent, _item: any) {
  if (!activeTouchItem.value) return

  // Notify HabitatVisual to complete the drop
  if (props.habitatVisualRef) {
    props.habitatVisualRef.handleTouchEnd(event, activeTouchItem.value)
  }

  // Clear touch state
  activeTouchItem.value = null
  if (props.habitatVisualRef) {
    props.habitatVisualRef.clearDraggedItem()
  }
}

// Touch handlers for sidebar drop zone
function handleTouchMoveOnSidebar(event: TouchEvent) {
  if (!activeTouchItem.value) return

  // Check if touch is over sidebar
  const sidebar = event.currentTarget as HTMLElement
  const rect = sidebar.getBoundingClientRect()
  const touch = event.touches[0]

  if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
      touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
    isTouchOver.value = true
  } else {
    isTouchOver.value = false
  }
}

function handleTouchEndOnSidebar(_event: TouchEvent) {
  if (!isTouchOver.value || !activeTouchItem.value) {
    isTouchOver.value = false
    return
  }

  isTouchOver.value = false

  // Only handle items being dragged FROM the habitat (not from inventory)
  // This is determined in HabitatVisual - if the touch originated from
  // a placed item, it will have repositioning metadata
  // For now, we'll let HabitatVisual handle the drop logic
}

// Select mode handlers
function handleServingItemClick(item: any) {
  if (!isSelectMode.value) return

  // Select this item for placement
  selectedItemForPlacement.value = {
    itemId: item.itemId,
    instanceId: item.instanceId,
    isServingBased: true,
    size: { width: 1, height: 1 },
    emoji: item.emoji,
    name: item.name
  }

  // Notify HabitatVisual to enter placement mode
  if (props.habitatVisualRef) {
    props.habitatVisualRef.enterPlacementMode(selectedItemForPlacement.value)
  }

  console.log(`📦 Selected for placement: ${item.name}`)
}

function handleRegularItemClick(item: any) {
  if (!isSelectMode.value) return

  // Select this item for placement
  selectedItemForPlacement.value = {
    itemId: item.id,
    isServingBased: false,
    size: item.size,
    emoji: item.emoji,
    name: item.name
  }

  // Notify HabitatVisual to enter placement mode
  if (props.habitatVisualRef) {
    props.habitatVisualRef.enterPlacementMode(selectedItemForPlacement.value)
  }

  console.log(`📦 Selected for placement: ${item.name}`)
}

function cancelItemSelection() {
  selectedItemForPlacement.value = null

  // Notify HabitatVisual to exit placement mode
  if (props.habitatVisualRef) {
    props.habitatVisualRef.exitPlacementMode()
  }

  console.log('❌ Item selection cancelled')
}

// Called by HabitatVisual when item is successfully placed
function onItemPlaced() {
  selectedItemForPlacement.value = null
  console.log('✓ Item placed successfully')
}

// Expose methods for HabitatVisual to call
defineExpose({
  onItemPlaced,
  cancelItemSelection
})
</script>

<style>
/* Component-specific styles (shared layout from .habitat-sidebar) */
.inventory-sidebar {
  transition: background 0.2s ease, border-color 0.2s ease;
}

.inventory-sidebar--drop-target {
  background: rgba(16, 185, 129, 0.15);
  border-color: var(--color-success);
  box-shadow: inset 0 2px 8px rgba(16, 185, 129, 0.2), 0 0 0 2px var(--color-success);
}

.inventory-sidebar__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  border-block-end: 1px solid var(--color-border);
  background-color: var(--color-bg-primary);
}

.inventory-sidebar__header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.inventory-sidebar__items {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  padding: var(--space-3);
}

.inventory-sidebar__item-card {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  border: 2px solid var(--color-border);
  cursor: grab;
  transition: all 0.2s ease;
  flex: 0 0 auto;
  min-inline-size: 0;
}

.inventory-sidebar__item-card:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.inventory-sidebar__item-card:active {
  cursor: grabbing;
}

.inventory-sidebar__item-emoji {
  font-size: var(--font-size-xl);
  flex-shrink: 0;
}

.inventory-sidebar__item-name {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.inventory-sidebar__item-count {
  position: absolute;
  inset-block-start: calc(var(--space-1) * -0.5);
  inset-inline-end: var(--space-1);
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  padding: 2px 6px;
  border-radius: var(--radius-full);
  line-height: 1;
  box-shadow: var(--shadow-sm);
}

/* Read-only items (bedding) */
.inventory-sidebar__item-card--readonly {
  cursor: not-allowed;
  background-color: var(--color-bg-tertiary);
  border-color: var(--color-border-medium);
  border-style: solid;
}

.inventory-sidebar__item-card--readonly:hover {
  transform: none;
  border-color: var(--color-border-medium);
  box-shadow: none;
}

.inventory-sidebar__item-quantity {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-inline-start: auto;
}

/* Select mode styles */
.inventory-sidebar__placement-instruction {
  margin-block-end: 0;
  border-radius: 0;
  border-inline: none;
  border-block-start: none;
}

.inventory-sidebar__instruction-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}

/* Select mode item styling */
.inventory-sidebar__item-card--select-mode {
  cursor: pointer;
}

.inventory-sidebar__item-card--select-mode:not(.inventory-sidebar__item-card--selected):hover {
  border-color: var(--color-info);
}

.inventory-sidebar__item-card--selected {
  background-color: var(--color-primary-100);
  border-color: var(--color-primary);
  border-width: 3px;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
}

.inventory-sidebar__item-card--selected:hover {
  border-color: var(--color-primary);
  transform: none;
}

/* Drag ghost visual */
.inventory-drag-ghost {
  font-size: 2.5rem;
  opacity: 0.7;
  transform: rotate(-5deg);
  padding: var(--space-2);
  background-color: var(--color-bg-primary);
  border: 2px dashed var(--color-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  pointer-events: none;
}
</style>
