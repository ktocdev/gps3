<template>
  <div class="habitat-visual">
    <div class="habitat-visual__scroll-container">
      <div class="habitat-visual__container">
        <div
          class="habitat-visual__grid"
          :style="gridStyle"
        >
        <div
          v-for="cell in gridCells"
          :key="`cell-${cell.x}-${cell.y}`"
          class="grid-cell"
          :class="{
            'grid-cell--occupied': cell.occupied,
            'grid-cell--accessible': cell.accessible,
            'grid-cell--drop-target': (isDragOver || isTouchDragging) && isHoverCell(cell) && (draggedItemId ? canPlaceAt(cell.x, cell.y) : true),
            'grid-cell--drop-invalid': (isDragOver || isTouchDragging) && isHoverCell(cell) && draggedItemId && !canPlaceAt(cell.x, cell.y),
            'grid-cell--placement-preview': placementModeActive && isSelectedCell(cell),
            'grid-cell--placement-valid': placementModeActive && isSelectedCell(cell) && canPlaceAtSelectedCell(),
            'grid-cell--placement-invalid': placementModeActive && isSelectedCell(cell) && !canPlaceAtSelectedCell()
          }"
          :style="{
            gridColumn: cell.x + 1,
            gridRow: cell.y + 1
          }"
          @dragover.prevent="handleDragOver($event, cell)"
          @dragleave="handleDragLeave"
          @drop="handleDrop($event, cell)"
          @click="handleCellClick(cell)"
        />

        <div
          v-for="item in sortedPlacedItems"
          :key="item.instanceId"
          class="grid-item"
          :class="{
            'grid-item--dragging': draggedPlacedItemId === item.itemId,
            'grid-item--placement-mode': placementModeActive
          }"
          :style="{
            gridColumn: `${item.position.x + 1} / span ${item.size.width}`,
            gridRow: `${item.position.y + 1} / span ${item.size.height}`,
            zIndex: item.zIndex
          }"
          :draggable="canDragItem(item)"
          :title="getBowlLockTooltip(item)"
          @dragstart="handlePlacedItemDragStart($event, item)"
          @dragend="handlePlacedItemDragEnd"
          @touchstart="handlePlacedItemTouchStart($event, item)"
          @touchmove="handlePlacedItemTouchMove"
          @touchend="handlePlacedItemTouchEnd"
          @click="selectItem(item.instanceId)"
        >
          <FoodBowl
            v-if="isBowl(item.itemId)"
            :bowl-item-id="item.itemId"
            :bowl-emoji="item.emoji"
            :capacity="getBowlCapacity(item.itemId)"
            :foods="getBowlContents(item.itemId)"
            @add-food="(foodId) => handleAddFoodToBowl(item.itemId, foodId)"
            @remove-food="(foodIndex) => handleRemoveFoodFromBowl(item.itemId, foodIndex)"
          />
          <HayRack
            v-else-if="isHayRack(item.itemId)"
            :hay-rack-item-id="item.itemId"
            :hay-servings="getHayRackContents(item.itemId)"
            :freshness="getHayRackFreshness(item.itemId)"
            :capacity="4"
            @add-hay="(hayId) => handleAddHayToRack(item.itemId, hayId)"
            @clear-rack="handleClearHayRack(item.itemId)"
            @fill-rack="handleFillHayRack(item.itemId)"
          />
          <WaterBottle
            v-else-if="isWaterBottle(item.itemId)"
            :water-level="habitatConditions.waterLevel"
            :bottle-emoji="item.emoji"
          />
          <ChewItem
            v-else-if="isChewItem(item.itemId)"
            :item-emoji="item.emoji"
            :item-name="item.name"
            :durability="getChewDurability(item.itemId)"
            :usage-count="getChewUsageCount(item.itemId)"
            :last-used-at="getChewLastUsedAt(item.itemId)"
            @test-chew="handleTestChew(item.itemId)"
            @remove-chew="handleRemoveChew(item.itemId)"
            @discard-chew="handleDiscardChew(item.itemId)"
          />
          <span
            v-else
            class="grid-item__emoji"
            :class="{
              'grid-item__emoji--large': isShelterOrHideaway(item.itemId)
            }"
          >
            {{ item.emoji }}
          </span>

          <span v-if="getStackCount(item.position) > 1" class="grid-item__stack">
            ×{{ getStackCount(item.position) }}
          </span>
        </div>
      </div>

      <div
        v-if="subgridItems.length > 0"
        class="habitat-visual__subgrid"
        :style="subgridStyle"
      >
        <div
          v-for="item in subgridItems"
          :key="item.id"
          class="subgrid-item"
          :class="`subgrid-item--${item.type}`"
          :style="{
            gridColumn: `${item.position.x + 1}`,
            gridRow: `${item.position.y + 1}`
          }"
        >
          <Poop
            v-if="item.type === 'poop'"
            :poop-id="item.id"
            @remove="handlePoopRemove"
          />
          <span v-else class="no-select">{{ getSubgridEmoji(item.type) }}</span>
        </div>
      </div>

      <!-- Placement mode action buttons -->
      <div v-if="placementModeActive && selectedCell" class="habitat-visual__placement-actions">
        <Button
          v-if="!placementErrorMessage"
          variant="secondary"
          size="md"
          @click="$emit('place-item-at-cell')"
        >
          ✓ Place Here
        </Button>
        <Button
          v-else
          variant="danger"
          size="md"
          disabled
        >
          ✗ {{ placementErrorMessage }}
        </Button>
        <Button
          variant="danger"
          size="md"
          @click="$emit('cancel-placement')"
        >
          Cancel
        </Button>
      </div>

      <div class="habitat-visual__guinea-pigs">
        <GuineaPigSprite
          v-for="guineaPig in activeGuineaPigs"
          :key="guineaPig.id"
          :ref="(el) => registerGuineaPigRef(guineaPig.id, el)"
          :guinea-pig="guineaPig"
          :grid-position="getGuineaPigPosition(guineaPig.id)"
          :cell-size="cellSize"
          :offset-x="getGuineaPigOffset(guineaPig.id).x"
          :offset-y="getGuineaPigOffset(guineaPig.id).y"
          :is-walking="isGuineaPigWalking(guineaPig.id)"
          :facing-direction="getGuineaPigFacingDirection(guineaPig.id)"
          :is-interacting-with-depth-item="isInteractingWithDepthItem(guineaPig.id)"
          :is-selected="selectedGuineaPigId === guineaPig.id"
          @select="handleGuineaPigSelect"
        />
      </div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useHabitatConditions } from '../../../stores/habitatConditions'
import { useHabitatContainers } from '../../../composables/useHabitatContainers'
import { useSuppliesStore } from '../../../stores/suppliesStore'
import { useGuineaPigStore } from '../../../stores/guineaPigStore'
import type { SuppliesItem } from '../../../types/supplies'
import { useManualControl } from '../../../composables/game/useManualControl'
import FoodBowl from './FoodBowl.vue'
import HayRack from './HayRack.vue'
import WaterBottle from './WaterBottle.vue'
import ChewItem from './ChewItem.vue'
import Poop from './Poop.vue'
import GuineaPigSprite from './GuineaPigSprite.vue'
import Button from '../../basic/Button.vue'

interface Props {
  habitatSize?: 'small' | 'medium' | 'large'
  showGrid?: boolean
  readOnly?: boolean
  highlightCells?: boolean
  showSubgrid?: boolean
}

interface Emits {
  (e: 'guinea-pig-selected', guineaPigId: string): void
  (e: 'place-item-at-cell'): void
  (e: 'cancel-placement'): void
}

interface GridCell {
  x: number
  y: number
  occupied: boolean
  itemId: string | null
  accessible: boolean
}

interface SubgridItem {
  id: string
  type: 'poop' | 'hay' | 'crumb' | 'footprint'
  position: { x: number; y: number }
  timestamp: number
}

const props = withDefaults(defineProps<Props>(), {
  habitatSize: 'medium',
  showGrid: true,
  readOnly: false,
  highlightCells: true,
  showSubgrid: false
})

const emit = defineEmits<Emits>()

const habitatConditions = useHabitatConditions()
const habitatContainers = useHabitatContainers()
const suppliesStore = useSuppliesStore()
const guineaPigStore = useGuineaPigStore()
const manualControl = useManualControl()

// Responsive cell sizing
const windowWidth = ref(window.innerWidth)

const responsiveCellSize = computed(() => {
  if (windowWidth.value < 640) return 35  // Mobile
  if (windowWidth.value < 1024) return 45 // Tablet
  return 60 // Desktop
})

function updateWindowWidth() {
  windowWidth.value = window.innerWidth
}

const HABITAT_SIZES = {
  small: { width: 10, height: 8 },
  medium: { width: 14, height: 10 },
  large: { width: 18, height: 12 }
}

const gridWidth = computed(() => HABITAT_SIZES[props.habitatSize].width)
const gridHeight = computed(() => HABITAT_SIZES[props.habitatSize].height)
const cellSize = computed(() => responsiveCellSize.value)
const totalCells = computed(() => gridWidth.value * gridHeight.value)

const subgridWidth = computed(() => gridWidth.value * 4)
const subgridHeight = computed(() => gridHeight.value * 4)
const subcellSize = computed(() => cellSize.value / 4)

// Bedding color background gradients
const beddingBackgroundGradient = computed(() => {
  const color = habitatConditions.currentBedding?.color
  if (!color) return 'linear-gradient(135deg, #f5f5dc 0%, #f0e68c 100%)' // Default yellow/beige

  // Map bedding colors to background gradients
  const colorMap: Record<string, string> = {
    'yellow': 'linear-gradient(135deg, #f5f5dc 0%, #f0e68c 100%)', // Regular/average - yellowish
    'beige': 'linear-gradient(135deg, #f5f5dc 0%, #e8d5b7 100%)', // Cheap - light beige
    'white-cyan': 'linear-gradient(135deg, #f0f8ff 0%, #e0f2f7 100%)', // Premium - white with cyan
    'pink': 'linear-gradient(135deg, #ffe0f0 0%, #ffc0e0 100%)', // Pink
    'blue': 'linear-gradient(135deg, #e0f0ff 0%, #c0d8f0 100%)', // Blue
    'green': 'linear-gradient(135deg, #e0f0e0 0%, #c0e0c0 100%)', // Green
    'purple': 'linear-gradient(135deg, #f0e0ff 0%, #e0c0f0 100%)' // Purple
  }

  return colorMap[color] || colorMap['yellow']
})

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${gridWidth.value}, ${cellSize.value}px)`,
  gridTemplateRows: `repeat(${gridHeight.value}, ${cellSize.value}px)`,
  background: beddingBackgroundGradient.value
}))

const subgridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${subgridWidth.value}, ${subcellSize.value}px)`,
  gridTemplateRows: `repeat(${subgridHeight.value}, ${subcellSize.value}px)`
}))

const gridCells = ref<GridCell[]>([])

// Sync poops from habitat conditions store
const subgridItems = computed(() => {
  const items: SubgridItem[] = []

  // Add poops from store
  habitatConditions.poops.forEach(poop => {
    // Convert grid coordinates to subgrid coordinates (x4 scale)
    items.push({
      id: poop.id,
      type: 'poop',
      position: { x: poop.x, y: poop.y },
      timestamp: poop.timestamp
    })
  })

  return items
})

const poopCount = computed(() => habitatConditions.poops.length)

// System 17: Guinea Pig Rendering
const activeGuineaPigs = computed(() => guineaPigStore.activeGuineaPigs)
const guineaPigPositions = computed(() => habitatConditions.guineaPigPositions)
const selectedGuineaPigId = computed(() => guineaPigStore.selectedGuineaPigId)

// Guinea pig sprite refs for chat bubbles
const guineaPigRefs = ref<Map<string, any>>(new Map())

function registerGuineaPigRef(guineaPigId: string, el: any) {
  if (el) {
    guineaPigRefs.value.set(guineaPigId, el)
  }
}

// Chat bubble event handler
function handleShowChatBubble(event: any) {
  const { guineaPigId, reaction } = event.detail
  const spriteRef = guineaPigRefs.value.get(guineaPigId)

  if (spriteRef && spriteRef.showReaction) {
    spriteRef.showReaction(reaction)
  }
}

function handleGuineaPigSelect(guineaPigId: string) {
  // Toggle selection: if clicking same guinea pig, deselect it and release control
  if (selectedGuineaPigId.value === guineaPigId) {
    // Release manual control if active
    if (guineaPigStore.isManuallyControlled(guineaPigId)) {
      guineaPigStore.setManualControl(guineaPigId, false)
      manualControl.releaseControl()
      console.log(`🎯 Released manual control of ${guineaPigId}`)
    }
    guineaPigStore.clearSelection()
  } else {
    // Select guinea pig for interaction
    guineaPigStore.selectGuineaPig(guineaPigId)
    // Emit event for parent to handle sidebar switching
    emit('guinea-pig-selected', guineaPigId)
  }

  // System 20 will display interaction menu when guinea pig is selected
  // TODO: Connect to InteractionMenu component when System 20 is implemented
}

function getGuineaPigPosition(guineaPigId: string) {
  const position = guineaPigPositions.value.get(guineaPigId)
  if (!position) {
    // Auto-initialize position if not set
    habitatConditions.initializeGuineaPigPosition(guineaPigId)
    const newPosition = guineaPigPositions.value.get(guineaPigId)
    if (!newPosition) {
      console.error(`Failed to initialize position for ${guineaPigId}`)
      return { row: 0, col: 0 }
    }
    return { row: newPosition.y, col: newPosition.x }
  }
  // Convert habitatConditions position format to grid position format
  return { row: position.y, col: position.x }
}

function getGuineaPigOffset(guineaPigId: string): { x: number; y: number } {
  const position = guineaPigPositions.value.get(guineaPigId)
  if (!position) {
    return { x: 0, y: 0 }
  }
  return {
    x: position.offsetX || 0,
    y: position.offsetY || 0
  }
}

function isGuineaPigWalking(guineaPigId: string): boolean {
  const position = guineaPigPositions.value.get(guineaPigId)
  return position?.isMoving ?? false
}

function getGuineaPigFacingDirection(guineaPigId: string): 'left' | 'right' {
  const position = guineaPigPositions.value.get(guineaPigId)
  return position?.facingDirection ?? 'right'
}

function isInteractingWithDepthItem(guineaPigId: string): boolean {
  const position = getGuineaPigPosition(guineaPigId)

  // Check if there's a depth-triggering item at guinea pig's position
  // Find if any placed item occupies this exact grid cell
  const itemAtPosition = placedItems.value.find(item => {
    const isWithinX = position.col >= item.position.x && position.col < item.position.x + item.size.width
    const isWithinY = position.row >= item.position.y && position.row < item.position.y + item.size.height
    return isWithinX && isWithinY
  })

  if (!itemAtPosition) return false

  // Check if item type requires depth rendering (behind item)
  // For now, check item name/ID for shelter, tunnel, or hideaway keywords
  const depthKeywords = ['shelter', 'tunnel', 'hideaway', 'igloo', 'house', 'hut']
  const itemName = itemAtPosition.name.toLowerCase()
  const itemId = itemAtPosition.itemId.toLowerCase()

  return depthKeywords.some(keyword => itemName.includes(keyword) || itemId.includes(keyword))
}

// Drag-and-drop state
const isDragOver = ref(false)
const draggedItemId = ref<string | null>(null)
const draggedItemSize = ref<{ width: number; height: number }>({ width: 1, height: 1 })
const hoverCell = ref<{ x: number; y: number } | null>(null)
const draggedPlacedItemId = ref<string | null>(null)
const isRepositioning = ref(false)

// Touch state
const isTouchDragging = ref(false)
const touchStartedOnPlacedItem = ref(false)

// Placement mode state (select mode)
const placementModeActive = ref(false)
const selectedCell = ref<{ x: number; y: number } | null>(null)
const selectedItemForPlacement = ref<{
  itemId: string
  instanceId?: string
  isServingBased: boolean
  size: { width: number; height: number }
  emoji: string
  name: string
} | null>(null)

const placementErrorMessage = computed(() => {
  return getPlacementValidationMessage()
})

function initializeGrid() {
  gridCells.value = []
  for (let y = 0; y < gridHeight.value; y++) {
    for (let x = 0; x < gridWidth.value; x++) {
      gridCells.value.push({
        x,
        y,
        occupied: false,
        itemId: null,
        accessible: true
      })
    }
  }
}

function getItemSize(item: SuppliesItem | undefined): { width: number; height: number } {
  if (!item) return { width: 1, height: 1 }

  const size = item.stats?.size
  if (size === 'small') return { width: 1, height: 1 }
  if (size === 'medium') return { width: 2, height: 1 }
  if (size === 'large') return { width: 2, height: 2 }

  return { width: 1, height: 1 }
}

const placedItems = computed(() => {
  // Don't render items until catalog is loaded
  if (!suppliesStore.catalogLoaded) {
    return []
  }

  return habitatConditions.habitatItems.map((itemId, index) => {
    const item = suppliesStore.getItemById(itemId)
    if (!item) {
      console.warn(`[HabitatVisual] Item ${itemId} not found in supplies store`)
    }
    const size = getItemSize(item)

    // Get stored position or default to auto-layout
    const storedPosition = habitatConditions.itemPositions.get(itemId)
    const position = storedPosition || {
      x: (index * 2) % gridWidth.value,
      y: Math.floor((index * 2) / gridWidth.value)
    }

    return {
      itemId,
      instanceId: `${itemId}-${index}`,
      position,
      size,
      zIndex: 0,
      name: item?.name || 'Unknown',
      emoji: item?.emoji || '📦'
    }
  })
})

const sortedPlacedItems = computed(() => {
  return [...placedItems.value].sort((a, b) => a.zIndex - b.zIndex)
})

const placedItemsCount = computed(() => placedItems.value.length)

const occupiedCells = computed(() => {
  return gridCells.value.filter(cell => cell.occupied).length
})

function updateGridCells() {
  gridCells.value.forEach(cell => {
    cell.occupied = false
    cell.itemId = null
  })

  placedItems.value.forEach(item => {
    const { x, y } = item.position
    const { width, height } = item.size

    for (let dy = 0; dy < height; dy++) {
      for (let dx = 0; dx < width; dx++) {
        const targetX = x + dx
        const targetY = y + dy

        if (targetX < gridWidth.value && targetY < gridHeight.value) {
          const cellIndex = targetY * gridWidth.value + targetX
          if (cellIndex < gridCells.value.length) {
            gridCells.value[cellIndex].occupied = true
            gridCells.value[cellIndex].itemId = item.itemId
          }
        }
      }
    }
  })
}

function getStackCount(position: { x: number; y: number }): number {
  return placedItems.value.filter(
    item => item.position.x === position.x && item.position.y === position.y
  ).length
}

function selectItem(_instanceId: string) {
  // Item selection handler (for future interaction menu)
}

function addTestPoop() {
  const randomX = Math.floor(Math.random() * subgridWidth.value)
  const randomY = Math.floor(Math.random() * subgridHeight.value)

  habitatConditions.addPoop(randomX, randomY)
}

function clearAllPoop() {
  // Remove all poops by cleaning the cage
  habitatConditions.cleanCage()
}

function handlePoopRemove(poopId: string) {
  habitatConditions.removePoop(poopId)
}

function getSubgridEmoji(type: string): string {
  switch (type) {
    case 'poop': return '💩'
    case 'hay': return '🌾'
    case 'crumb': return '🟤'
    case 'footprint': return '👣'
    default: return '·'
  }
}

// Methods to be called from parent
function setDraggedItem(itemId: string, size: { width: number; height: number }) {
  draggedItemId.value = itemId
  draggedItemSize.value = size
}

function clearDraggedItem() {
  draggedItemId.value = null
  draggedItemSize.value = { width: 1, height: 1 }
  isDragOver.value = false
  isTouchDragging.value = false
  hoverCell.value = null
  touchStartedOnPlacedItem.value = false
}

// Touch helper: convert touch coordinates to grid cell
function getTouchGridCell(touch: Touch): { x: number; y: number } | null {
  const grid = document.querySelector('.habitat-visual__grid') as HTMLElement
  if (!grid) return null

  const rect = grid.getBoundingClientRect()
  const relativeX = touch.clientX - rect.left
  const relativeY = touch.clientY - rect.top

  const cellX = Math.floor(relativeX / cellSize.value)
  const cellY = Math.floor(relativeY / cellSize.value)

  if (cellX < 0 || cellX >= gridWidth.value || cellY < 0 || cellY >= gridHeight.value) {
    return null
  }

  return { x: cellX, y: cellY }
}

// Touch handler called from InventorySidebar
function handleTouchMove(event: TouchEvent) {
  if (!isTouchDragging.value) {
    isTouchDragging.value = true
  }

  const touch = event.touches[0]
  const cell = getTouchGridCell(touch)

  if (cell) {
    hoverCell.value = cell
  } else {
    hoverCell.value = null
  }
}

// Touch handler called from InventorySidebar
function handleTouchEnd(event: TouchEvent, touchData: any) {
  const touch = event.changedTouches[0]
  const cell = getTouchGridCell(touch)

  if (!cell) {
    // Touch ended outside grid
    clearDraggedItem()
    return
  }

  // Process the drop using same logic as handleDrop
  const itemId = touchData.itemId
  const isRepos = touchStartedOnPlacedItem.value

  // If dropping food on a bowl, add it to the bowl
  if (isFood(itemId) && !isRepos) {
    const bowlAtPosition = placedItems.value.find(item => {
      if (!isBowl(item.itemId)) return false

      const isWithinBowlX = cell.x >= item.position.x && cell.x < item.position.x + item.size.width
      const isWithinBowlY = cell.y >= item.position.y && cell.y < item.position.y + item.size.height

      return isWithinBowlX && isWithinBowlY
    })

    if (bowlAtPosition) {
      handleAddFoodToBowl(bowlAtPosition.itemId, itemId)
      clearDraggedItem()
      return
    }
  }

  // If dropping hay on a hay rack, add it to the rack
  if (isHay(itemId) && !isRepos) {
    const hayRackAtPosition = placedItems.value.find(item => {
      if (!isHayRack(item.itemId)) return false

      const isWithinRackX = cell.x >= item.position.x && cell.x < item.position.x + item.size.width
      const isWithinRackY = cell.y >= item.position.y && cell.y < item.position.y + item.size.height

      return isWithinRackX && isWithinRackY
    })

    if (hayRackAtPosition) {
      handleAddHayToRack(hayRackAtPosition.itemId, itemId)
      clearDraggedItem()
      return
    }
  }

  if (!canPlaceAt(cell.x, cell.y)) {
    console.warn('Cannot place item at this location')
    clearDraggedItem()
    return
  }

  if (isRepos) {
    repositionItemAt(itemId, cell.x, cell.y)
  } else {
    placeItemAt(itemId, cell.x, cell.y)
  }

  clearDraggedItem()
}

// Handlers for dragging placed items
function handlePlacedItemDragStart(event: DragEvent, item: any) {
  if (props.readOnly) return

  draggedPlacedItemId.value = item.itemId
  draggedItemId.value = item.itemId
  draggedItemSize.value = item.size
  isRepositioning.value = true

  const dragData = {
    itemId: item.itemId,
    size: item.size,
    isRepositioning: true
  }

  event.dataTransfer!.effectAllowed = 'move'
  event.dataTransfer!.setData('text/plain', JSON.stringify(dragData))

  // Visual feedback
  const target = event.currentTarget as HTMLElement
  target.style.opacity = '0.5'
}

function handlePlacedItemDragEnd(event: DragEvent) {
  draggedPlacedItemId.value = null
  isRepositioning.value = false

  const target = event.currentTarget as HTMLElement
  target.style.opacity = '1'
}

// Touch handlers for dragging placed items
function handlePlacedItemTouchStart(event: TouchEvent, item: any) {
  if (props.readOnly) return

  event.preventDefault()

  draggedPlacedItemId.value = item.itemId
  draggedItemId.value = item.itemId
  draggedItemSize.value = item.size
  isRepositioning.value = true
  isTouchDragging.value = true
  touchStartedOnPlacedItem.value = true

  // Visual feedback
  const target = event.currentTarget as HTMLElement
  target.style.opacity = '0.5'
}

function handlePlacedItemTouchMove(event: TouchEvent) {
  if (!isTouchDragging.value) return

  event.preventDefault()

  const touch = event.touches[0]
  const cell = getTouchGridCell(touch)

  if (cell) {
    hoverCell.value = cell
  }
}

function handlePlacedItemTouchEnd(event: TouchEvent) {
  event.preventDefault()

  const target = event.currentTarget as HTMLElement
  target.style.opacity = '1'

  const touch = event.changedTouches[0]
  const cell = getTouchGridCell(touch)

  if (!cell) {
    // Touch ended outside grid - reset
    draggedPlacedItemId.value = null
    clearDraggedItem()
    return
  }

  const itemId = draggedItemId.value
  if (!itemId) {
    clearDraggedItem()
    return
  }

  if (!canPlaceAt(cell.x, cell.y)) {
    console.warn('Cannot place item at this location')
    draggedPlacedItemId.value = null
    clearDraggedItem()
    return
  }

  // Reposition item
  repositionItemAt(itemId, cell.x, cell.y)

  // Reset state
  draggedPlacedItemId.value = null
  clearDraggedItem()
}

// Drag-and-drop handlers
function handleDragOver(event: DragEvent, cell: GridCell) {
  if (props.readOnly) return

  event.preventDefault()
  isDragOver.value = true
  hoverCell.value = { x: cell.x, y: cell.y }

  // For food items dragged from bowls, we need to set draggedItemId
  // so canPlaceAt() doesn't reject them
  const itemData = event.dataTransfer?.types.includes('text/plain')
  if (itemData && !draggedItemId.value) {
    try {
      // Try to peek at the drag data to set draggedItemId for validation
      // Note: getData() only works in drop event, but we can check types
      // For now, allow all drops when draggedItemId is not set (food from bowls)
    } catch (e) {
      // Ignore parsing errors
    }
  }

  // Set drop effect based on validity
  // Allow drops for food items from bowls (when draggedItemId is not set)
  const isValidDrop = draggedItemId.value ? canPlaceAt(cell.x, cell.y) : true

  if (isValidDrop) {
    event.dataTransfer!.dropEffect = 'move'
  } else {
    event.dataTransfer!.dropEffect = 'none'
  }
}

function handleDragLeave() {
  isDragOver.value = false
  hoverCell.value = null
}

function handleDrop(event: DragEvent, cell: GridCell) {
  if (props.readOnly) return

  event.preventDefault()
  isDragOver.value = false
  hoverCell.value = null

  const itemData = event.dataTransfer!.getData('text/plain')
  if (!itemData) return

  let itemId: string
  let isRepos = false

  try {
    const data = JSON.parse(itemData)
    itemId = data.itemId
    isRepos = data.isRepositioning || false
  } catch {
    itemId = itemData
  }

  // Food bowl and hay rack drop handling is done by the respective components via events
  // FoodBowl emits @add-food and HayRack emits @add-hay
  // No need to handle drops on these items here - their drop handlers will emit the events

  if (!canPlaceAt(cell.x, cell.y)) {
    console.warn('Cannot place item at this location')
    return
  }

  if (isRepos) {
    // Repositioning existing item
    repositionItemAt(itemId, cell.x, cell.y)
  } else {
    // Adding new item from inventory
    placeItemAt(itemId, cell.x, cell.y)
  }

  // Reset drag state
  draggedItemId.value = null
  draggedItemSize.value = { width: 1, height: 1 }
  draggedPlacedItemId.value = null
  isRepositioning.value = false
}

function isHoverCell(cell: GridCell): boolean {
  if (!hoverCell.value) return false
  return cell.x === hoverCell.value.x && cell.y === hoverCell.value.y
}

function canPlaceAt(x: number, y: number): boolean {
  if (!draggedItemId.value) return false

  const size = draggedItemSize.value

  // Check bounds
  if (x + size.width > gridWidth.value || y + size.height > gridHeight.value) {
    return false
  }

  // Food items can only be placed in bowls (not directly on habitat floor)
  if (isFood(draggedItemId.value)) {
    // Check if there's a bowl at this position
    const bowlAtPosition = placedItems.value.find(item => {
      if (!isBowl(item.itemId)) return false

      // Check if the hover cell (x, y) is within the bowl's occupied area
      const isWithinBowlX = x >= item.position.x && x < item.position.x + item.size.width
      const isWithinBowlY = y >= item.position.y && y < item.position.y + item.size.height

      return isWithinBowlX && isWithinBowlY
    })

    if (!bowlAtPosition) return false

    // Check if bowl is full
    const bowlContents = getBowlContents(bowlAtPosition.itemId)
    const bowlItem = suppliesStore.getItemById(bowlAtPosition.itemId)
    const capacity = bowlItem?.stats?.foodCapacity || 3
    return bowlContents.length < capacity
  }

  // Hay items can only be placed in hay racks (not directly on habitat floor)
  if (isHay(draggedItemId.value)) {
    // Check if there's a hay rack at this position
    const hayRackAtPosition = placedItems.value.find(item => {
      if (!isHayRack(item.itemId)) return false

      // Check if the hover cell (x, y) is within the hay rack's occupied area
      const isWithinRackX = x >= item.position.x && x < item.position.x + item.size.width
      const isWithinRackY = y >= item.position.y && y < item.position.y + item.size.height

      return isWithinRackX && isWithinRackY
    })

    if (!hayRackAtPosition) return false

    // Check if hay rack is full
    const rackContents = getHayRackContents(hayRackAtPosition.itemId)
    const maxCapacity = 4 // CONSUMPTION.HAY_RACK_MAX_CAPACITY
    return rackContents.length < maxCapacity
  }

  // Water bottles can only be on edges (left, right, top, or bottom)
  if (draggedItemId.value.includes('water_bottle')) {
    const isLeftEdge = x === 0
    const isRightEdge = x === gridWidth.value - size.width
    const isTopEdge = y === 0
    const isBottomEdge = y === gridHeight.value - size.height

    if (!isLeftEdge && !isRightEdge && !isTopEdge && !isBottomEdge) {
      return false
    }
  }

  // With stacking anarchy, we allow placement anywhere within bounds
  // No collision detection needed for Phase 2
  return true
}

function placeItemAt(itemId: string, x: number, y: number) {
  // Add item to habitat from inventory with position
  const success = habitatConditions.addItemToHabitat(itemId, { x, y })

  if (success) {
    // Initialize chew item if it's a chew type
    if (isChewItem(itemId)) {
      habitatContainers.initializeChewItem(itemId)
    }
    updateGridCells()
  } else {
    console.warn(`Failed to place ${itemId} at (${x}, ${y})`)
  }
}

function repositionItemAt(itemId: string, x: number, y: number) {
  // Update the position of an already-placed item
  habitatConditions.itemPositions.set(itemId, { x, y })
  updateGridCells()
}

// Bowl helper functions
function isBowl(itemId: string): boolean {
  return itemId.includes('bowl') || itemId.includes('dish')
}

function isFood(itemId: string): boolean {
  const item = suppliesStore.getItemById(itemId)
  return item?.category === 'food'
}

function getBowlCapacity(itemId: string): number {
  const item = suppliesStore.getItemById(itemId)
  return item?.stats?.foodCapacity || 2
}

function getBowlContents(itemId: string) {
  return habitatConditions.getBowlContents(itemId)
}

function canDragItem(_item: any): boolean {
  // All items can be dragged (bowls and hay racks can be moved even with contents)
  return true
}

function getBowlLockTooltip(item: any): string {
  // Show helpful metadata tooltips
  if (isBowl(item.itemId)) {
    const contents = getBowlContents(item.itemId)
    const capacity = getBowlCapacity(item.itemId)
    if (contents.length > 0) {
      const foodNames = contents.map((f: any) => f.name).join(', ')
      return `${item.name}\nContents: ${foodNames}\nCapacity: ${contents.length}/${capacity}`
    }
    return `${item.name}\nEmpty bowl\nCapacity: ${capacity} servings`
  }
  if (isHayRack(item.itemId)) {
    const contents = getHayRackContents(item.itemId)
    const freshness = getHayRackFreshness(item.itemId)
    if (contents.length > 0) {
      return `${item.name}\nHay servings: ${contents.length}/4\nFreshness: ${freshness.toFixed(0)}%`
    }
    return `${item.name}\nEmpty hay rack\nCapacity: 4 servings`
  }
  if (isChewItem(item.itemId)) {
    const durability = getChewDurability(item.itemId)
    const usageCount = getChewUsageCount(item.itemId)
    return `${item.name}\nDurability: ${durability.toFixed(0)}%\nUsed ${usageCount} times`
  }
  return item.name
}

function handleAddFoodToBowl(bowlItemId: string, foodItemId: string) {
  habitatConditions.addFoodToBowl(bowlItemId, foodItemId)
}

function handleRemoveFoodFromBowl(bowlItemId: string, foodIndex: number) {
  habitatConditions.removeFoodFromBowl(bowlItemId, foodIndex)
}

// Hay rack helper functions
function isHayRack(itemId: string): boolean {
  return itemId.includes('hay_rack')
}

function isHay(itemId: string): boolean {
  const item = suppliesStore.getItemById(itemId)
  return item?.category === 'hay'
}

function getHayRackContents(itemId: string) {
  return habitatConditions.getHayRackContents(itemId)
}

function getHayRackFreshness(itemId: string): number {
  return habitatConditions.getHayRackFreshness(itemId)
}

function handleAddHayToRack(hayRackItemId: string, hayItemId: string) {
  habitatConditions.addHayToRack(hayRackItemId, hayItemId)
}

function handleClearHayRack(hayRackItemId: string) {
  habitatConditions.clearHayRack(hayRackItemId)
}

function handleFillHayRack(hayRackItemId: string) {
  const result = habitatConditions.fillAllHayRacks([hayRackItemId])
  if (result.totalAdded > 0) {
    console.log(`✅ Added ${result.totalAdded} hay serving${result.totalAdded > 1 ? 's' : ''} to rack`)
  } else {
    console.warn('No hay was added - check inventory or rack capacity')
  }
}

// Water bottle helper function
function isWaterBottle(itemId: string): boolean {
  return itemId.includes('water_bottle')
}

// Shelter/Hideaway helper function
function isShelterOrHideaway(itemId: string): boolean {
  const item = suppliesStore.getItemById(itemId)
  return item?.subCategory === 'hideaways'
}

// Chew item helper functions
function isChewItem(itemId: string): boolean {
  const item = suppliesStore.getItemById(itemId)
  return item?.subCategory === 'chews'
}

function getChewDurability(itemId: string): number {
  return habitatContainers.getChewDurability(itemId)
}

function getChewUsageCount(itemId: string): number {
  const chewData = habitatContainers.getChewData(itemId)
  return chewData?.usageCount ?? 0
}

function getChewLastUsedAt(itemId: string): number {
  const chewData = habitatContainers.getChewData(itemId)
  return chewData?.lastUsedAt ?? Date.now()
}

function handleTestChew(itemId: string) {
  habitatContainers.chewItem(itemId)
}

function handleRemoveChew(itemId: string) {
  // Find the item in placedItems to remove it from habitat and return to inventory
  const itemToRemove = placedItems.value.find(item => item.itemId === itemId)
  if (itemToRemove) {
    // Remove from placed items array
    const index = placedItems.value.indexOf(itemToRemove)
    if (index > -1) {
      placedItems.value.splice(index, 1)
    }
    // Remove from habitat conditions (returns to inventory)
    habitatConditions.removeItemFromHabitat(itemId)
    habitatContainers.removeChewItem(itemId)
  }
}

function handleDiscardChew(itemId: string) {
  // Find the item and permanently discard it (no return to inventory)
  const itemToRemove = placedItems.value.find(item => item.itemId === itemId)
  if (itemToRemove) {
    // Remove from placed items array
    const index = placedItems.value.indexOf(itemToRemove)
    if (index > -1) {
      placedItems.value.splice(index, 1)
    }
    // Remove from habitat conditions but DON'T return to inventory (permanent discard)
    // We only remove from the habitat list, the inventory item is lost
    const habitatIndex = habitatConditions.habitatItems.indexOf(itemId)
    if (habitatIndex > -1) {
      habitatConditions.habitatItems.splice(habitatIndex, 1)
    }
    habitatContainers.removeChewItem(itemId)
  }
}

onMounted(() => {
  // Initialize supplies catalog if not already loaded
  if (!suppliesStore.catalogLoaded) {
    suppliesStore.initializeCatalog()
  }

  initializeGrid()
  updateGridCells()

  // Listen for chat bubble events from debug panel
  document.addEventListener('show-chat-bubble', handleShowChatBubble as EventListener)

  // Initialize chew items that are already in the habitat
  habitatConditions.habitatItems.forEach(itemId => {
    if (isChewItem(itemId)) {
      // Only initialize if not already initialized
      const chewData = habitatContainers.getChewData(itemId)
      if (!chewData) {
        habitatContainers.initializeChewItem(itemId)
      }
    }
  })

  // Add window resize listener for responsive cell sizing
  window.addEventListener('resize', updateWindowWidth)
})

onUnmounted(() => {
  // Clean up resize listener
  window.removeEventListener('resize', updateWindowWidth)
  // Clean up chat bubble event listener
  document.removeEventListener('show-chat-bubble', handleShowChatBubble as EventListener)
})

watch(
  () => habitatConditions.habitatItems,
  () => updateGridCells(),
  { deep: true }
)

// Placement mode functions (select mode)
function enterPlacementMode(itemData: any) {
  placementModeActive.value = true
  selectedItemForPlacement.value = itemData
  draggedItemId.value = itemData.itemId
  draggedItemSize.value = itemData.size
  selectedCell.value = null

  console.log(`🎯 Entered placement mode for: ${itemData.name}`)
}

function exitPlacementMode() {
  placementModeActive.value = false
  selectedItemForPlacement.value = null
  selectedCell.value = null
  draggedItemId.value = null
  draggedItemSize.value = { width: 1, height: 1 }

  console.log('🎯 Exited placement mode')
}

function handleCellClick(cell: GridCell) {
  // Check for manual control mode first
  const controlledGuineaPigId = manualControl.controlledGuineaPigId.value
  if (controlledGuineaPigId && manualControl.isControlActive.value) {
    // In manual control mode - set movement target
    const cellCenterX = (cell.x + 0.5) * responsiveCellSize.value
    const cellCenterY = (cell.y + 0.5) * responsiveCellSize.value

    manualControl.setTarget(cellCenterX, cellCenterY)
    guineaPigStore.setManualControlTarget(controlledGuineaPigId, {
      x: cellCenterX,
      y: cellCenterY
    })

    console.log(`🎯 Manual control: Moving ${controlledGuineaPigId} to (${cell.x}, ${cell.y})`)
    return
  }

  console.log(`🖱️ Cell clicked: (${cell.x}, ${cell.y})`, {
    placementModeActive: placementModeActive.value,
    hasSelectedItem: !!selectedItemForPlacement.value,
    selectedItem: selectedItemForPlacement.value?.name
  })

  // If not in placement mode and there's a selected guinea pig with manual control, release it
  if (!placementModeActive.value && selectedGuineaPigId.value) {
    const selectedId = selectedGuineaPigId.value
    if (guineaPigStore.isManuallyControlled(selectedId)) {
      guineaPigStore.setManualControl(selectedId, false)
      manualControl.releaseControl()
      guineaPigStore.clearSelection()
      console.log(`🎯 Released manual control of ${selectedId} by clicking empty cell`)
      return
    }
  }

  if (!placementModeActive.value || !selectedItemForPlacement.value) {
    console.log('❌ Not in placement mode or no item selected')
    return
  }

  // Update selected cell
  selectedCell.value = { x: cell.x, y: cell.y }

  console.log(`📍 Cell selected: (${cell.x}, ${cell.y})`)
}

function placementItemAtSelectedCell(inventorySidebarRef: any) {
  if (!selectedCell.value || !selectedItemForPlacement.value) return

  const itemId = selectedItemForPlacement.value.itemId
  const cell = selectedCell.value

  // Handle serving-based items (food, hay) - special validation
  if (selectedItemForPlacement.value.isServingBased) {
    // Check if it's food - must go in a bowl
    if (isFood(itemId)) {
      const bowlAtPosition = placedItems.value.find(item => {
        if (!isBowl(item.itemId)) return false

        const isWithinBowlX = cell.x >= item.position.x && cell.x < item.position.x + item.size.width
        const isWithinBowlY = cell.y >= item.position.y && cell.y < item.position.y + item.size.height

        return isWithinBowlX && isWithinBowlY
      })

      if (bowlAtPosition) {
        handleAddFoodToBowl(bowlAtPosition.itemId, itemId)
        console.log(`✓ Added food to bowl: ${itemId} at (${cell.x}, ${cell.y})`)

        if (inventorySidebarRef) {
          inventorySidebarRef.onItemPlaced()
        }
        exitPlacementMode()
        return
      } else {
        console.warn('❌ Food can only be placed in bowls')
        return
      }
    }

    // Check if it's hay - must go in a hay rack
    const item = suppliesStore.getItemById(itemId)
    if (item?.category === 'hay') {
      const hayRackAtPosition = placedItems.value.find(item => {
        if (!isHayRack(item.itemId)) return false

        const isWithinRackX = cell.x >= item.position.x && cell.x < item.position.x + item.size.width
        const isWithinRackY = cell.y >= item.position.y && cell.y < item.position.y + item.size.height

        return isWithinRackX && isWithinRackY
      })

      if (hayRackAtPosition) {
        handleAddHayToRack(hayRackAtPosition.itemId, itemId)
        console.log(`✓ Added hay to rack: ${itemId} at (${cell.x}, ${cell.y})`)

        if (inventorySidebarRef) {
          inventorySidebarRef.onItemPlaced()
        }
        exitPlacementMode()
        return
      } else {
        console.warn('❌ Hay can only be placed in hay racks')
        return
      }
    }
  }

  // Handle regular item placement (non-serving items)
  // Check if placement is valid
  const canPlace = canPlaceAt(selectedCell.value.x, selectedCell.value.y)

  if (!canPlace) {
    console.warn('❌ Cannot place item at selected cell')
    return
  }

  const success = habitatConditions.addItemToHabitat(itemId, {
    x: selectedCell.value.x,
    y: selectedCell.value.y
  })

  if (success) {
    console.log(`✓ Placed item: ${itemId} at (${selectedCell.value.x}, ${selectedCell.value.y})`)

    // Notify inventory sidebar
    if (inventorySidebarRef) {
      inventorySidebarRef.onItemPlaced()
    }

    exitPlacementMode()
  } else {
    console.warn('❌ Failed to place item')
  }
}

function isSelectedCell(cell: GridCell): boolean {
  if (!selectedCell.value) return false
  return cell.x === selectedCell.value.x && cell.y === selectedCell.value.y
}

function getPlacementValidationMessage(): string | null {
  if (!selectedCell.value || !selectedItemForPlacement.value) {
    return null
  }

  const cell = selectedCell.value
  const itemId = selectedItemForPlacement.value.itemId

  // For serving-based items, check if they can go in their container
  if (selectedItemForPlacement.value.isServingBased) {
    // Food must be placed in a bowl
    if (isFood(itemId)) {
      const bowlAtPosition = placedItems.value.find(item => {
        if (!isBowl(item.itemId)) return false
        const isWithinBowlX = cell.x >= item.position.x && cell.x < item.position.x + item.size.width
        const isWithinBowlY = cell.y >= item.position.y && cell.y < item.position.y + item.size.height
        return isWithinBowlX && isWithinBowlY
      })

      if (!bowlAtPosition) {
        return 'No Bowl Here'
      }

      // Check if bowl is full
      const bowlContents = getBowlContents(bowlAtPosition.itemId)
      const bowlItem = suppliesStore.getItemById(bowlAtPosition.itemId)
      const capacity = bowlItem?.stats?.foodCapacity || 3
      const isFull = bowlContents.length >= capacity

      if (isFull) {
        return 'Bowl Is Full'
      }

      return null // Valid placement
    }

    // Hay must be placed in a hay rack
    const item = suppliesStore.getItemById(itemId)
    if (item?.category === 'hay') {
      const hayRackAtPosition = placedItems.value.find(item => {
        if (!isHayRack(item.itemId)) return false
        const isWithinRackX = cell.x >= item.position.x && cell.x < item.position.x + item.size.width
        const isWithinRackY = cell.y >= item.position.y && cell.y < item.position.y + item.size.height
        return isWithinRackX && isWithinRackY
      })

      if (!hayRackAtPosition) {
        return 'No Hay Rack Here'
      }

      // Check if hay rack is full
      const rackContents = getHayRackContents(hayRackAtPosition.itemId)
      const maxCapacity = 4 // CONSUMPTION.HAY_RACK_MAX_CAPACITY
      const isFull = rackContents.length >= maxCapacity

      if (isFull) {
        return 'Hay Rack Is Full'
      }

      return null // Valid placement
    }
  }

  // For regular items, use standard placement check
  if (!canPlaceAt(cell.x, cell.y)) {
    return 'Invalid Location'
  }

  return null // Valid placement
}

function canPlaceAtSelectedCell(): boolean {
  return getPlacementValidationMessage() === null
}

// Expose functions and data for parent component
defineExpose({
  addTestPoop,
  clearAllPoop,
  poopCount,
  setDraggedItem,
  clearDraggedItem,
  handleTouchMove,
  handleTouchEnd,
  placedItems,
  gridWidth,
  gridHeight,
  totalCells,
  occupiedCells,
  placedItemsCount,
  // Placement mode functions
  enterPlacementMode,
  exitPlacementMode,
  handleCellClick,
  placementItemAtSelectedCell,
  isSelectedCell,
  canPlaceAtSelectedCell
})
</script>

<style>
.habitat-visual {
  block-size: 100%;
}

/* Mobile-first: Default scroll container - no padding/margin to avoid covering tabs */
.habitat-visual__scroll-container {
  overflow-x: auto;
  overflow-y: visible;
  max-inline-size: 100%;
  max-block-size: 100%;
  -webkit-overflow-scrolling: touch;
  border-radius: var(--radius-lg);
  padding-block-start: 0;
  margin-block-start: 0;
}

/* Desktop: Remove scrollbar if content fits */
@media (min-width: 1024px) {
  .habitat-visual__scroll-container {
    overflow-y: visible;
    max-block-size: none;
  }
}

/* Mobile-first: Container defaults */
.habitat-visual__container {
  position: relative;
  inline-size: fit-content;
  margin-inline: 0;
}

/* Tablet and up: Add padding for chat bubbles and center container */
@media (min-width: 769px) {
  .habitat-visual__scroll-container {
    padding-block-start: 40px; /* Space for chat bubbles at top */
  }

  .habitat-visual__container {
    margin-inline: auto;
  }
}

.habitat-visual__grid {
  display: grid;
  gap: 1px;
  /* background set dynamically via gridStyle computed property based on bedding color */
  border: 3px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-3);
  box-shadow: var(--shadow-lg);
}

.grid-cell {
  background: rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(160, 82, 45, 0.2);
  border-radius: var(--radius-sm);
  position: relative;
  transition: all 0.2s ease;
}

.grid-cell--occupied {
  background: rgba(255, 255, 255, 0.5);
}

.grid-cell--accessible {
  cursor: default;
}

.grid-cell--drop-target {
  background: rgba(16, 185, 129, 0.3);
  border-color: var(--color-success);
  border-width: 2px;
  box-shadow: inset 0 0 10px rgba(16, 185, 129, 0.3);
}

.grid-cell--drop-invalid {
  background: rgba(239, 68, 68, 0.3);
  border-color: var(--color-error);
  border-width: 2px;
  cursor: not-allowed;
}

.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  padding: var(--space-2);
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: grab;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}

.grid-item:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-md);
  border-color: var(--color-primary);
}

.grid-item:active {
  cursor: grabbing;
}

.grid-item--dragging {
  opacity: 0.5;
  cursor: grabbing;
}

/* In placement mode, items don't block clicks - allow clicks to pass through to grid cells */
.grid-item--placement-mode {
  pointer-events: none;
  cursor: default;
}

/* Mobile-first: Default emoji sizes for mobile (35px cells) */
.grid-item__emoji {
  font-size: var(--font-size-base); /* 16px - Mobile */
  line-height: 1;
}

.grid-item__emoji--bowl {
  font-size: 1.5rem; /* 24px - Mobile */
}

.grid-item__emoji--large {
  font-size: 1.5rem; /* 24px - Mobile */
}

/* Tablet and up: Scale emojis up for 45px cells */
@media (min-width: 640px) {
  .grid-item__emoji {
    font-size: var(--font-size-lg); /* 18px - Tablet */
  }

  .grid-item__emoji--bowl {
    font-size: 2rem; /* 32px - Tablet */
  }

  .grid-item__emoji--large {
    font-size: 2rem; /* 32px - Tablet */
  }
}

/* Desktop and up: Scale emojis to full size for 60px cells */
@media (min-width: 1024px) {
  .grid-item__emoji {
    font-size: var(--font-size-2xl); /* 24px - Desktop */
  }

  .grid-item__emoji--bowl {
    font-size: 3rem; /* 48px - Desktop */
  }

  .grid-item__emoji--large {
    font-size: 3rem; /* 48px - Desktop */
  }
}

.grid-item__stack {
  position: absolute;
  inset-block-start: var(--space-1);
  inset-inline-end: var(--space-1);
  background: var(--color-primary);
  color: white;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  line-height: 1;
}

.habitat-visual__subgrid {
  position: absolute;
  inset-block-start: 0;
  inset-inline-start: 0;
  inline-size: 100%;
  block-size: 100%;
  display: grid;
  pointer-events: none;
}

.subgrid-item {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-sm);
  pointer-events: all;
  cursor: pointer;
  transition: transform 0.1s ease;
}

.subgrid-item:hover {
  transform: scale(1.3);
}

.subgrid-item--poop {
  opacity: 0.9;
}

.habitat-visual__guinea-pigs {
  position: absolute;
  inset-block-start: 0;
  inset-inline-start: 0;
  inline-size: 100%;
  block-size: 100%;
  pointer-events: none;
}

/* Placement mode styles */
.grid-cell--placement-preview {
  outline: 3px solid var(--color-info);
  outline-offset: -3px;
  z-index: 10;
  cursor: pointer;
}

.grid-cell--placement-valid {
  outline-color: var(--color-success);
  background-color: rgba(16, 185, 129, 0.15);
}

.grid-cell--placement-invalid {
  outline-color: var(--color-danger);
  background-color: rgba(239, 68, 68, 0.15);
}

/* Mobile-first: Placement actions positioning */
.habitat-visual__placement-actions {
  position: absolute;
  inset-block-start: var(--space-2); /* Mobile default */
  inset-inline-start: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: var(--space-2);
  z-index: 100;
  pointer-events: all;
}

/* Tablet and up: More spacing from top */
@media (min-width: 641px) {
  .habitat-visual__placement-actions {
    inset-block-start: var(--space-4);
  }
}
</style>
