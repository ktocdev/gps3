# System 15: Hay Rack and Serving System

## Overview

Extension of the Food Bowl System to support consumable items with multiple servings. Introduces the Hay Rack for hay storage and updates the Food Bowl system to use a serving-based inventory model.

## Core Concepts

### Serving-Based Inventory
- **Consumable items have serving counts** - Each item provides multiple servings
- **Visual depletion feedback** - Tile background color changes as servings are consumed
- **Drag individual servings** - Users drag one serving at a time from inventory to habitat
- **Counter display** - Shows remaining servings on inventory tile

### Hay Rack System
- **Similar to Food Bowl** - Uses same component architecture pattern
- **Capacity: 4 handfuls** - Standard hay rack holds 4 servings of hay
- **Visual fullness indicator** - Background color gradient from white (empty) to gold (full)
- **Rack locking** - Cannot move rack when hay is present

### Food Bowl Updates
- **Serving restrictions** - Only accepts "handful" servings, not full items
- **Greens**: 1 handful = 1 serving
- **Fruits/Veggies**: 1 piece = 1 serving

## Data Model

### Serving Metadata (supplies)

```typescript
// src/types/supplies.ts
interface SupplyItemStats {
  // ... existing properties

  // NEW: Serving system properties
  servingCount?: number // Total servings in item (e.g., lettuce: 5, carrot: 2, hay bag: 10)
  servingType?: 'handful' | 'piece' // Type of serving
  servingName?: string // Display name (e.g., "handful", "piece", "slice")
}

// Example items with serving metadata
{
  itemId: 'food-lettuce-green-leaf',
  name: 'Green Leaf Lettuce',
  servingCount: 5,
  servingType: 'handful',
  servingName: 'handful',
  // Visual depletion colors (dark → light as servings consumed)
  depletionColors: ['#2d5016', '#3d6b1f', '#4d8628', '#5da131', '#6dbc3a']
}

{
  itemId: 'food-carrot-orange',
  name: 'Orange Carrot',
  servingCount: 2,
  servingType: 'piece',
  servingName: 'piece',
  depletionColors: ['#d2691e', '#ff8c42']
}

{
  itemId: 'hay-timothy-bag',
  name: 'Timothy Hay Bag',
  servingCount: 10,
  servingType: 'handful',
  servingName: 'handful',
  depletionColors: ['#3d2817', '#4a341d', '#574023', '#644c29', '#71582f', '#7e6435', '#8b703b', '#987c41', '#a58847', '#b2944d']
}
```

### Hay Rack Metadata (supplies)

```typescript
// Add to src/stores/suppliesStore.ts
{
  itemId: 'habitat-hay-rack-wall',
  name: 'Wall-Mounted Hay Rack',
  emoji: '🧺',
  category: 'habitat',
  gridSize: { width: 2, height: 2 },
  stats: {
    durability: 10,
    hayCapacity: 4, // NEW: Holds 4 handfuls of hay
    cleanlinessRating: 8
  }
}

{
  itemId: 'habitat-hay-rack-corner',
  name: 'Corner Hay Rack',
  emoji: '📦',
  category: 'habitat',
  gridSize: { width: 2, height: 2 },
  stats: {
    durability: 10,
    hayCapacity: 4,
    cleanlinessRating: 9
  }
}
```

### Serving Inventory State (inventoryStore)

```typescript
// src/stores/inventoryStore.ts

interface InventoryItem {
  itemId: string
  quantity: number // Total units (e.g., 2 lettuce heads)
  servingsRemaining?: Map<number, number> // Maps unit index → servings remaining
  // Example: Map { 0 → 3, 1 → 5 } = first lettuce has 3/5 servings, second has 5/5
}

// NEW FUNCTIONS:

/**
 * Get remaining servings for a specific inventory item unit
 */
function getServingsRemaining(itemId: string, unitIndex: number): number

/**
 * Consume one serving from an item
 * Returns true if serving consumed, false if no servings left
 */
function consumeServing(itemId: string): boolean

/**
 * Get total servings available across all units of an item
 */
function getTotalServings(itemId: string): number

/**
 * Get the current depletion color for an inventory item unit
 */
function getDepletionColor(itemId: string, unitIndex: number): string

/**
 * Check if item has servings available
 */
function hasServings(itemId: string): boolean
```

### Hay Rack State (habitatConditions)

```typescript
// src/stores/habitatConditions.ts

interface HayServing {
  servingId: string // Unique ID for this serving instance
  itemId: string // Source item (e.g., 'hay-timothy-bag')
  emoji: string
  name: string
}

// NEW STATE:
const hayRackContents = ref<Map<string, HayServing[]>>(new Map())

// NEW FUNCTIONS:

/**
 * Add hay serving to rack
 * Returns true if added successfully
 */
function addHayToRack(rackItemId: string, hayItemId: string): boolean

/**
 * Remove hay serving from rack (by index)
 * Returns true if removed successfully
 */
function removeHayFromRack(rackItemId: string, servingIndex: number): boolean

/**
 * Get hay servings in a rack
 */
function getHayRackContents(rackItemId: string): HayServing[]

/**
 * Clear all hay from rack
 */
function clearHayRack(rackItemId: string): void

/**
 * Get fullness percentage (0-100)
 */
function getHayRackFullness(rackItemId: string): number
```

## Component Architecture

### HayRack.vue (NEW)

Reusable component for hay rack display and interaction.

```vue
<template>
  <div
    class="hay-rack"
    :style="{ backgroundColor: fullnessColor }"
    @dragover.prevent="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <span class="hay-rack__emoji">{{ rackEmoji }}</span>

    <div v-if="hayServings.length > 0" class="hay-rack__contents">
      <span
        v-for="(serving, index) in hayServings"
        :key="`${serving.servingId}-${index}`"
        class="hay-rack__hay-item"
        :class="`hay-rack__hay-item--count-${hayServings.length} hay-rack__hay-item--index-${index}`"
        :title="`${serving.name} (handful)`"
        draggable="true"
        @dragstart="handleHayDragStart($event, serving, index)"
        @dragend="handleHayDragEnd"
      >
        {{ serving.emoji }}
      </span>
    </div>

    <!-- Serving counter badge -->
    <div v-if="hayServings.length > 0" class="hay-rack__counter">
      {{ hayServings.length }}/{{ capacity }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface HayServing {
  servingId: string
  itemId: string
  emoji: string
  name: string
}

interface Props {
  rackItemId: string
  rackEmoji: string
  capacity: number
  hayServings: HayServing[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'add-hay': [hayItemId: string]
  'remove-hay': [servingIndex: number]
}>()

// Compute fullness color (white → gold gradient)
const fullnessColor = computed(() => {
  const percentage = props.hayServings.length / props.capacity

  // White (empty) to gold (full)
  const r = Math.round(255)
  const g = Math.round(255 - (percentage * 40)) // 255 → 215
  const b = Math.round(255 - (percentage * 255)) // 255 → 0

  return `rgb(${r}, ${g}, ${b})`
})

function handleDragOver(event: DragEvent) {
  event.stopPropagation()

  if (props.hayServings.length >= props.capacity) {
    event.dataTransfer!.dropEffect = 'none'
    return
  }

  event.dataTransfer!.dropEffect = 'move'
}

function handleDragLeave(event: DragEvent) {
  event.stopPropagation()
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()

  if (props.hayServings.length >= props.capacity) {
    return
  }

  const data = JSON.parse(event.dataTransfer!.getData('text/plain'))

  // Only accept hay items
  if (!data.itemId.includes('hay')) {
    return
  }

  emit('add-hay', data.itemId)
}

function handleHayDragStart(event: DragEvent, serving: HayServing, index: number) {
  event.stopPropagation()

  const dragData = {
    servingId: serving.servingId,
    itemId: serving.itemId,
    rackItemId: props.rackItemId,
    index,
    isFromRack: true
  }

  event.dataTransfer!.effectAllowed = 'move'
  event.dataTransfer!.setData('text/plain', JSON.stringify(dragData))
}

function handleHayDragEnd(event: DragEvent) {
  event.stopPropagation()
}
</script>

<style>
.hay-rack {
  position: relative;
  inline-size: 100%;
  block-size: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius-base);
  transition: background-color 0.3s ease;
}

.hay-rack__emoji {
  font-size: var(--font-size-2xl);
  user-select: none;
  pointer-events: none;
}

.hay-rack__contents {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.hay-rack__hay-item {
  position: absolute;
  cursor: grab;
  user-select: none;
  pointer-events: auto;
  transition: transform 0.2s ease;
}

.hay-rack__hay-item:active {
  cursor: grabbing;
}

/* Dynamic positioning for 1-4 hay servings */
.hay-rack__hay-item--count-1 {
  font-size: var(--font-size-xl);
  inset-inline-start: 50%;
  inset-block-start: 50%;
  transform: translate(-50%, -50%);
}

.hay-rack__hay-item--count-2 {
  font-size: var(--font-size-lg);
}

.hay-rack__hay-item--count-2.hay-rack__hay-item--index-0 {
  inset-inline-start: 35%;
  inset-block-start: 50%;
  transform: translate(-50%, -50%);
}

.hay-rack__hay-item--count-2.hay-rack__hay-item--index-1 {
  inset-inline-start: 65%;
  inset-block-start: 50%;
  transform: translate(-50%, -50%);
}

.hay-rack__hay-item--count-3 {
  font-size: var(--font-size-base);
}

.hay-rack__hay-item--count-3.hay-rack__hay-item--index-0 {
  inset-inline-start: 30%;
  inset-block-start: 40%;
  transform: translate(-50%, -50%);
}

.hay-rack__hay-item--count-3.hay-rack__hay-item--index-1 {
  inset-inline-start: 70%;
  inset-block-start: 40%;
  transform: translate(-50%, -50%);
}

.hay-rack__hay-item--count-3.hay-rack__hay-item--index-2 {
  inset-inline-start: 50%;
  inset-block-start: 65%;
  transform: translate(-50%, -50%);
}

.hay-rack__hay-item--count-4 {
  font-size: var(--font-size-base);
}

.hay-rack__hay-item--count-4.hay-rack__hay-item--index-0 {
  inset-inline-start: 30%;
  inset-block-start: 35%;
  transform: translate(-50%, -50%);
}

.hay-rack__hay-item--count-4.hay-rack__hay-item--index-1 {
  inset-inline-start: 70%;
  inset-block-start: 35%;
  transform: translate(-50%, -50%);
}

.hay-rack__hay-item--count-4.hay-rack__hay-item--index-2 {
  inset-inline-start: 30%;
  inset-block-start: 65%;
  transform: translate(-50%, -50%);
}

.hay-rack__hay-item--count-4.hay-rack__hay-item--index-3 {
  inset-inline-start: 70%;
  inset-block-start: 65%;
  transform: translate(-50%, -50%);
}

.hay-rack__counter {
  position: absolute;
  inset-block-start: 4px;
  inset-inline-end: 4px;
  background-color: var(--color-accent);
  color: var(--color-bg);
  padding: 2px 6px;
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: 600;
  pointer-events: none;
}
</style>
```

### InventoryTileServing.vue (NEW)

Enhanced inventory tile that shows serving counter and depletion color.

```vue
<template>
  <div
    class="inventory-tile-serving"
    :style="{ backgroundColor: depletionColor }"
    :class="{ 'inventory-tile-serving--depleted': !hasServings }"
    draggable="true"
    @dragstart="handleDragStart"
  >
    <span class="inventory-tile-serving__emoji">{{ emoji }}</span>

    <div class="inventory-tile-serving__info">
      <div class="inventory-tile-serving__name">{{ name }}</div>

      <!-- Serving counter -->
      <div v-if="servingCount > 0" class="inventory-tile-serving__servings">
        {{ servingsRemaining }}/{{ servingCount }} {{ servingName }}{{ servingsRemaining !== 1 ? 's' : '' }}
      </div>
    </div>

    <!-- Quantity badge (if multiple units) -->
    <div v-if="quantity > 1" class="inventory-tile-serving__quantity">
      × {{ quantity }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  itemId: string
  emoji: string
  name: string
  quantity: number
  servingCount: number
  servingsRemaining: number
  servingName: string
  depletionColor: string
  hasServings: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'drag-start': [itemId: string]
}>()

function handleDragStart(event: DragEvent) {
  if (!props.hasServings) {
    event.preventDefault()
    return
  }

  const dragData = {
    itemId: props.itemId,
    isServing: true
  }

  event.dataTransfer!.effectAllowed = 'move'
  event.dataTransfer!.setData('text/plain', JSON.stringify(dragData))

  emit('drag-start', props.itemId)
}
</script>

<style>
.inventory-tile-serving {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-sm);
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius-base);
  cursor: grab;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.inventory-tile-serving:hover {
  transform: translateY(-2px);
  border-color: var(--color-accent);
}

.inventory-tile-serving:active {
  cursor: grabbing;
}

.inventory-tile-serving--depleted {
  opacity: 0.5;
  cursor: not-allowed;
}

.inventory-tile-serving__emoji {
  font-size: var(--font-size-2xl);
  margin-block-end: var(--spacing-xs);
}

.inventory-tile-serving__info {
  text-align: center;
  inline-size: 100%;
}

.inventory-tile-serving__name {
  font-size: var(--font-size-sm);
  font-weight: 600;
  margin-block-end: var(--spacing-xs);
}

.inventory-tile-serving__servings {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  font-weight: 500;
}

.inventory-tile-serving__quantity {
  position: absolute;
  inset-block-start: 4px;
  inset-inline-end: 4px;
  background-color: var(--color-primary);
  color: var(--color-bg);
  padding: 2px 6px;
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: 600;
}
</style>
```

## Integration Points

### HabitatVisual.vue Updates

```typescript
// Add hay rack detection
function isHayRack(itemId: string): boolean {
  return itemId.includes('hay-rack')
}

function isHay(itemId: string): boolean {
  return itemId.includes('hay')
}

// Add hay rack capacity getter
function getHayRackCapacity(itemId: string): number {
  const item = suppliesStore.getItemById(itemId)
  return item?.stats?.hayCapacity || 4
}

// Add hay rack locking
function canDragItem(item: any): boolean {
  // Bowls with food cannot be dragged
  if (isBowl(item.itemId)) {
    return getBowlContents(item.itemId).length === 0
  }

  // Hay racks with hay cannot be dragged
  if (isHayRack(item.itemId)) {
    return getHayRackContents(item.itemId).length === 0
  }

  return true
}

// Update canPlaceAt for hay restrictions
function canPlaceAt(x: number, y: number): boolean {
  if (!draggedItemId.value) return false

  // Food items can only be placed in bowls
  if (isFood(draggedItemId.value)) {
    const bowlAtPosition = findBowlAtPosition(x, y)
    return bowlAtPosition !== undefined
  }

  // Hay items can only be placed in hay racks
  if (isHay(draggedItemId.value)) {
    const rackAtPosition = findHayRackAtPosition(x, y)
    return rackAtPosition !== undefined
  }

  // ... other constraints
}

// Add hay rack handlers
function handleAddHayToRack(rackItemId: string, hayItemId: string) {
  const success = habitatConditionsStore.addHayToRack(rackItemId, hayItemId)

  if (!success) {
    console.warn('Failed to add hay to rack')
  }
}

function handleRemoveHayFromRack(rackItemId: string, servingIndex: number) {
  habitatConditionsStore.removeHayFromRack(rackItemId, servingIndex)
}
```

### Template Integration

```vue
<!-- Add HayRack component rendering -->
<HayRack
  v-if="isHayRack(item.itemId)"
  :rack-item-id="item.itemId"
  :rack-emoji="item.emoji"
  :capacity="getHayRackCapacity(item.itemId)"
  :hay-servings="getHayRackContents(item.itemId)"
  @add-hay="(hayId) => handleAddHayToRack(item.itemId, hayId)"
  @remove-hay="(index) => handleRemoveHayFromRack(item.itemId, index)"
/>

<!-- Update grid item classes for hay rack locking -->
<div
  :class="{
    'grid-item--bowl-locked': isBowl(item.itemId) && getBowlContents(item.itemId).length > 0,
    'grid-item--rack-locked': isHayRack(item.itemId) && getHayRackContents(item.itemId).length > 0
  }"
>
```

## Food Bowl System Updates

### Serving Restrictions

Update `addFoodToBowl()` to only accept serving-based food:

```typescript
function addFoodToBowl(bowlItemId: string, foodItemId: string): boolean {
  const inventoryStore = useInventoryStore()
  const suppliesStore = useSuppliesStore()

  const foodItem = suppliesStore.getItemById(foodItemId)

  // Check if food item has servings
  if (!inventoryStore.hasServings(foodItemId)) {
    return false
  }

  // Consume one serving from inventory
  const consumed = inventoryStore.consumeServing(foodItemId)
  if (!consumed) return false

  // Add to bowl (use serving emoji/name)
  const servingName = foodItem.stats?.servingName || 'serving'

  // ... rest of bowl logic
}
```

## Visual Design

### Depletion Color Examples

**Hay Bag (10 servings):**
- 10/10: `#3d2817` (dark brown) ← unopened
- 5/10: `#71582f` (medium brown)
- 1/10: `#b2944d` (light brown)

**Green Leaf Lettuce (5 servings):**
- 5/5: `#2d5016` (dark green)
- 3/5: `#4d8628` (medium green)
- 1/5: `#6dbc3a` (light green)

**Orange Carrot (2 servings):**
- 2/2: `#d2691e` (dark orange)
- 1/2: `#ff8c42` (light orange)

### Hay Rack Fullness Colors

- 0/4 (empty): `rgb(255, 255, 255)` (white)
- 1/4: `rgb(255, 245, 191)`
- 2/4: `rgb(255, 235, 128)`
- 3/4: `rgb(255, 225, 64)`
- 4/4 (full): `rgb(255, 215, 0)` (gold)

## Implementation Checklist

### Phase 1: Data Layer
- [ ] Add serving metadata to types/supplies.ts
- [ ] Update suppliesStore with hay items and depletion colors
- [ ] Add hayRackContents Map to habitatConditions store
- [ ] Implement hay rack management functions (add/remove/get)
- [ ] Add servingsRemaining Map to inventoryStore
- [ ] Implement serving inventory functions (consume/get/check)
- [ ] Add custom serialization for hayRackContents Map
- [ ] Update bowlContents to use serving system

### Phase 2: Components
- [ ] Create HayRack.vue component
- [ ] Create InventoryTileServing.vue component
- [ ] Add fullness color computation to HayRack
- [ ] Add depletion color computation to InventoryTileServing
- [ ] Implement drag-and-drop for hay servings
- [ ] Add serving counter display to both components

### Phase 3: Integration
- [ ] Import HayRack component in HabitatVisual
- [ ] Add hay rack detection helpers (isHayRack, isHay)
- [ ] Add hay rack capacity getter
- [ ] Update canDragItem for hay rack locking
- [ ] Update canPlaceAt for hay placement restrictions
- [ ] Add hay rack handlers (add/remove)
- [ ] Update template with HayRack rendering
- [ ] Add hay rack lock styling

### Phase 4: Inventory Updates
- [ ] Replace food inventory tiles with InventoryTileServing
- [ ] Add hay bag to purchasable inventory
- [ ] Update inventory drag logic for servings
- [ ] Add serving counter to all consumables

### Phase 5: Food Bowl Updates
- [ ] Update addFoodToBowl to use serving system
- [ ] Update removeFoodFromBowl to restore servings
- [ ] Update FoodBowl component to show serving info
- [ ] Test serving restrictions (handful vs piece)

### Phase 6: Testing & Polish
- [ ] Test hay rack with 1-4 servings
- [ ] Test fullness color transitions
- [ ] Test depletion color transitions
- [ ] Test serving counter accuracy
- [ ] Test persistence across refresh
- [ ] Test drag constraints (hay only to rack)
- [ ] Test rack locking when hay present
- [ ] Test inventory depletion and removal

## Success Criteria

- ✅ Hay bags show depletion color as servings are consumed
- ✅ Hay can only be placed in hay racks, not on habitat floor
- ✅ Hay racks show fullness with white → gold gradient
- ✅ Hay racks locked when hay present
- ✅ Serving counter shows "X/Y handfuls" on inventory tiles
- ✅ Food items show serving counts (lettuce: 5, carrot: 2)
- ✅ Food bowls only accept one serving at a time
- ✅ Depleted items become non-draggable and visually muted
- ✅ All serving states persist across page refresh
- ✅ System is extensible for future consumable items

## Future Extensions

- **Water bottles** with serving system (ounces remaining)
- **Treat bags** with piece count
- **Vitamin supplements** with dose count
- **Bedding bags** with handful count for bedding changes
- **Toy wear** progression (new → worn → needs replacement)
- **Automatic serving suggestions** based on guinea pig needs
