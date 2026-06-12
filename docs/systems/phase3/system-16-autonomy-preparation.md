# System 16: Autonomy Preparation - Implementation Plan

**Phase:** 3.16 - Habitat & Environment (Final Phase 3 System)
**Created:** October 19, 2025
**Completed:** October 20, 2025
**Status:** ✅ Complete (All 5 Phases Complete)
**Priority:** HIGH (Required for Phase 4 Guinea Pig Autonomy)

## Overview

System 16 completes Phase 3 by implementing the missing foundational systems required for Phase 4 guinea pig autonomy. These systems enable guinea pigs to autonomously interact with habitat items, consume resources, and navigate the environment.

**Design Philosophy:**
- **Autonomy-Ready** - All systems designed for AI decision-making
- **Resource Tracking** - Track consumption and usage for strategic gameplay
- **Position-Based** - Grid-based positioning enables pathfinding
- **Need-Driven** - Item types map to need satisfaction

## Implementation Approach

This system was built in **5 phases**, each completing one critical autonomy requirement:
1. ✅ **Phase 1: Item Type Metadata** - Enable autonomy to identify item functions *(COMPLETE)*
2. ✅ **Phase 2: Water Consumption System** - Track drinking from water bottles *(COMPLETE)*
3. ✅ **Phase 3: Environmental Decay** - Time-based bedding and cleanliness decay *(COMPLETE)*
4. ✅ **Phase 4: Guinea Pig Position Tracking** - Grid position for movement *(COMPLETE)*
5. ✅ **Phase 5: Item Usage History** - Track item interactions for AI decisions *(COMPLETE)*

---

## Phase 1: Item Type Metadata ✅ COMPLETE

**Status:** ✅ Implemented October 19, 2025
**Implementation Time:** 2 hours

### Goal
Add `itemType` metadata to supplies catalog enabling autonomy system to identify what need each item satisfies.

### Item Type Classification

#### Core Item Types
```typescript
type ItemType =
  | 'water_bottle'      // Satisfies thirst need
  | 'food_bowl'         // Satisfies hunger need
  | 'hay_rack'          // Satisfies hunger need (hay specific)
  | 'shelter'           // Satisfies shelter need
  | 'bed'               // Satisfies energy need (enhanced sleep)
  | 'toy'               // Satisfies happiness need
  | 'chew'              // Satisfies chew need
  | 'platform'          // Satisfies happiness need (exploration)
  | 'tunnel'            // Satisfies happiness need (exploration)
  | 'hideaway'          // Satisfies shelter need (alternative)
  | 'grooming_tool'     // Satisfies cleanliness need (player use)
  | 'nail_clipper'      // Satisfies nails need (player use)
```

#### Need Satisfaction Mapping
```typescript
const ITEM_TYPE_TO_NEED: Record<ItemType, NeedType | null> = {
  water_bottle: 'thirst',
  food_bowl: 'hunger',
  hay_rack: 'hunger',
  shelter: 'shelter',
  bed: 'energy',
  toy: 'happiness',
  chew: 'chew',
  platform: 'happiness',
  tunnel: 'happiness',
  hideaway: 'shelter',
  grooming_tool: null,  // Player-initiated only
  nail_clipper: null    // Player-initiated only
}
```

### Implementation Steps

#### 1. Update Types
**File:** `src/types/supplies.ts`

```typescript
export interface SupplyItemStats {
  // ... existing stats
  itemType?: ItemType  // NEW: Functional classification
  needSatisfied?: NeedType  // NEW: Which need this item affects
  satisfactionAmount?: number  // NEW: How much need is restored (0-100)
  usageDuration?: number  // NEW: How long usage takes (seconds)
}

export type ItemType =
  | 'water_bottle'
  | 'food_bowl'
  | 'hay_rack'
  | 'shelter'
  | 'bed'
  | 'toy'
  | 'chew'
  | 'platform'
  | 'tunnel'
  | 'hideaway'
  | 'grooming_tool'
  | 'nail_clipper'

export type NeedType =
  | 'hunger'
  | 'thirst'
  | 'happiness'
  | 'cleanliness'
  | 'health'
  | 'energy'
  | 'social'
  | 'nails'
  | 'chew'
  | 'shelter'
```

#### 2. Add Item Type Metadata to Supplies Store
**File:** `src/stores/suppliesStore.ts`

Update all habitat items with `itemType` and need satisfaction data:

```typescript
// Water Bottles
{
  id: 'habitat_basic_water_bottle',
  stats: {
    itemType: 'water_bottle',
    needSatisfied: 'thirst',
    satisfactionAmount: 100,  // Drinking restores thirst fully
    usageDuration: 5,  // Takes 5 seconds to drink
    // ... existing stats
  }
}

// Food Bowls
{
  id: 'habitat_ceramic_bowl',
  stats: {
    itemType: 'food_bowl',
    needSatisfied: 'hunger',
    satisfactionAmount: 0,  // Varies by food in bowl
    usageDuration: 10,  // Takes 10 seconds to eat
    // ... existing stats
  }
}

// Hay Racks
{
  id: 'habitat_basic_hay_rack',
  stats: {
    itemType: 'hay_rack',
    needSatisfied: 'hunger',
    satisfactionAmount: 20,  // Each hay serving restores 20 hunger
    usageDuration: 15,  // Takes 15 seconds to eat hay
    // ... existing stats
  }
}

// Shelters
{
  id: 'habitat_plastic_igloo',
  stats: {
    itemType: 'shelter',
    needSatisfied: 'shelter',
    satisfactionAmount: 30,  // Hiding restores 30 shelter per use
    usageDuration: 60,  // Stays hidden for 60 seconds
    // ... existing stats
  }
}

// Beds
{
  id: 'habitat_fleece_bed',
  stats: {
    itemType: 'bed',
    needSatisfied: 'energy',
    satisfactionAmount: 25,  // Sleep on bed restores energy faster
    usageDuration: 120,  // Sleeps for 2 minutes
    // ... existing stats
  }
}

// Toys
{
  id: 'habitat_chew_stick',
  stats: {
    itemType: 'chew',
    needSatisfied: 'chew',
    satisfactionAmount: 15,  // Chewing restores 15 chew need
    usageDuration: 20,  // Chews for 20 seconds
    // ... existing stats
  }
}
```

#### 3. Add Helper Functions
**File:** `src/stores/suppliesStore.ts`

```typescript
// Get all items of a specific type
getItemsByType(itemType: ItemType): SuppliesItem[] {
  return this.catalog.filter(item => item.stats?.itemType === itemType)
}

// Get item type by item ID
getItemType(itemId: string): ItemType | null {
  const item = this.getItemById(itemId)
  return item?.stats?.itemType || null
}

// Check if item satisfies a specific need
itemSatisfiesNeed(itemId: string, need: NeedType): boolean {
  const item = this.getItemById(itemId)
  return item?.stats?.needSatisfied === need
}

// Get items that satisfy a specific need (for autonomy)
getItemsForNeed(need: NeedType): SuppliesItem[] {
  return this.catalog.filter(item => item.stats?.needSatisfied === need)
}
```

### Phase 1 Acceptance Criteria
- ✅ All habitat items have `itemType` metadata
- ✅ All items specify `needSatisfied` and `satisfactionAmount`
- ✅ Helper functions work correctly
- ✅ Autonomy system can query items by need type

### Implementation Notes
- **Files Modified:**
  - `src/types/supplies.ts` - Added ItemType and NeedType definitions
  - `src/data/supplies/habitat/bowls_bottles.json` - Added metadata to 12 items
  - `src/data/supplies/habitat/hideaways.json` - Added metadata to 13 items
  - `src/stores/suppliesStore.ts` - Added 4 helper functions
- **Key Changes:**
  - Fixed need types to match actual implementation (play, comfort needs - stimulation later removed as redundant)
  - Removed deprecated needs (happiness, cleanliness)
  - Updated to match GuineaPigNeeds interface (hygiene not cleanliness)
- **Testing:** Console tests added to HabitatDebug component

---

## Phase 2: Water Consumption System ✅ COMPLETE

**Status:** ✅ Implemented October 19, 2025
**Implementation Time:** 1.5 hours

### Goal
Enable guinea pigs to drink from water bottles, reducing water level in habitat conditions.

### Water Consumption Mechanics

#### Water Level Tracking
- **Initial water level:** 100% when refilled
- **Consumption per drink:** 10-15 units (randomized)
- **Empty bottle threshold:** < 5% (guinea pig cannot drink)
- **Low water warning:** < 25%

#### Consumption Triggers
1. **Autonomous drinking** - Guinea pig seeks water when thirst < 40%
2. **Manual feeding** - Player can trigger drinking (debug/testing)
3. **Thirst satisfaction** - Drinking restores 100% thirst

### Implementation Steps

#### 1. Add Water Consumption to Habitat Conditions
**File:** `src/stores/habitatConditions.ts`

```typescript
// Consume water from bottle (called when guinea pig drinks)
function consumeWater(waterBottleItemId: string): boolean {
  // Check if water bottle exists in habitat
  if (!habitatItems.value.includes(waterBottleItemId)) {
    console.warn(`Water bottle ${waterBottleItemId} not in habitat`)
    return false
  }

  // Check if item is actually a water bottle
  const suppliesStore = useSuppliesStore()
  const item = suppliesStore.getItemById(waterBottleItemId)
  if (item?.stats?.itemType !== 'water_bottle') {
    console.warn(`Item ${waterBottleItemId} is not a water bottle`)
    return false
  }

  // Check if water level is sufficient
  if (waterLevel.value < 5) {
    console.warn('Water bottle is empty - cannot drink')
    return false
  }

  // Consume water (10-15 units)
  const consumption = Math.floor(Math.random() * 6) + 10
  waterLevel.value = Math.max(0, waterLevel.value - consumption)

  console.log(`Water consumed: ${consumption} units. Remaining: ${waterLevel.value}%`)
  recordSnapshot()
  return true
}

// Check if water is available for drinking
function hasWaterAvailable(): boolean {
  // Check if any water bottle is placed in habitat
  const waterBottle = habitatItems.value.find(itemId => {
    const item = useSuppliesStore().getItemById(itemId)
    return item?.stats?.itemType === 'water_bottle'
  })

  return waterBottle !== undefined && waterLevel.value >= 5
}
```

#### 2. Add Water Bottle Finding Helper
**File:** `src/stores/habitatConditions.ts`

```typescript
// Find water bottle position for autonomy pathfinding
function getWaterBottlePosition(): { x: number; y: number } | null {
  const suppliesStore = useSuppliesStore()

  // Find first water bottle in habitat
  const waterBottleId = habitatItems.value.find(itemId => {
    const item = suppliesStore.getItemById(itemId)
    return item?.stats?.itemType === 'water_bottle'
  })

  if (!waterBottleId) {
    return null
  }

  // Return stored position
  return itemPositions.value.get(waterBottleId) || null
}
```

#### 3. Expose New Functions
**File:** `src/stores/habitatConditions.ts`

```typescript
return {
  // ... existing exports
  consumeWater,
  hasWaterAvailable,
  getWaterBottlePosition
}
```

### Phase 2 Acceptance Criteria
- ✅ `consumeWater()` reduces water level correctly
- ✅ Empty water bottle prevents drinking
- ✅ Guinea pig can find water bottle position
- ✅ Water level persists across sessions

### Implementation Notes
- **Files Modified:**
  - `src/stores/habitatConditions.ts` - Added 3 water functions (consumeWater, hasWaterAvailable, getWaterBottlePosition)
  - `src/components/game/habitat/WaterBottle.vue` - Improved visual feedback (blue background fade)
  - `src/components/debug/environment/HabitatDebug.vue` - Added test button
- **Key Features:**
  - Automatic water bottle detection (finds first water bottle if none specified)
  - Item type validation using Phase 1 metadata
  - Consumption range: 10-15 units per drink
  - Empty threshold: <5% prevents drinking
  - Visual feedback: Blue background (50% opacity) fades to white as water depletes
  - Emoji visibility: Always visible, slight fade when empty (50% opacity minimum)
- **Testing:** "Test Water Consumption" button in HabitatDebug Test Controls panel

---

## Phase 3: Environmental Decay System

### Goal
Implement time-based decay for bedding freshness and cleanliness to create ongoing maintenance pressure.

### Decay Mechanics

#### Bedding Freshness Decay
- **Base decay rate:** -1 point per 5 minutes (real-time)
- **Quality modifiers:**
  - Cheap bedding: 1.2x decay rate
  - Average bedding: 1.0x decay rate (baseline)
  - Premium bedding: 0.8x decay rate
- **Accelerated decay:** Guinea pig activity increases decay rate
- **Empty bedding:** Freshness drops to 0, requires replacement

#### Cleanliness Decay
- **Base decay rate:** -1 point per 10 minutes (real-time)
- **Activity modifiers:**
  - Guinea pig movement: +0.5 decay per movement
  - Eating food: +1 decay per meal (crumbs)
  - Each poop: -2 to -5 cleanliness (already implemented)
- **Minimum cleanliness:** 0% (requires cleaning)

### Implementation Steps

#### 1. Add Decay System to Habitat Conditions
**File:** `src/stores/habitatConditions.ts`

```typescript
// Decay rates (points per second)
const BEDDING_DECAY_RATE = {
  cheap: 1.2 / 300,      // 1.2 points per 5 minutes
  average: 1.0 / 300,    // 1.0 points per 5 minutes
  premium: 0.8 / 300,    // 0.8 points per 5 minutes
  'colorful-premium': 0.8 / 300
}

const CLEANLINESS_DECAY_RATE = 1.0 / 600  // 1 point per 10 minutes

// Apply decay over time
function applyEnvironmentalDecay(deltaSeconds: number) {
  // Bedding freshness decay
  if (currentBedding.value && currentBedding.value.type !== 'None') {
    const quality = currentBedding.value.quality
    const decayRate = BEDDING_DECAY_RATE[quality] || BEDDING_DECAY_RATE.average
    const decay = decayRate * deltaSeconds

    beddingFreshness.value = Math.max(0, beddingFreshness.value - decay)
  }

  // Cleanliness decay
  const cleanlinessDecay = CLEANLINESS_DECAY_RATE * deltaSeconds
  cleanliness.value = Math.max(0, cleanliness.value - cleanlinessDecay)

  recordSnapshot()
}

// Track guinea pig activity for accelerated decay
function recordGuineaPigActivity(activityType: 'movement' | 'eating' | 'drinking') {
  switch (activityType) {
    case 'movement':
      // Slight cleanliness decay from movement
      cleanliness.value = Math.max(0, cleanliness.value - 0.5)
      break
    case 'eating':
      // Food crumbs reduce cleanliness
      cleanliness.value = Math.max(0, cleanliness.value - 1.0)
      break
    case 'drinking':
      // Water spills (minimal impact)
      cleanliness.value = Math.max(0, cleanliness.value - 0.2)
      break
  }

  recordSnapshot()
}
```

#### 2. Integrate with Game Loop
**File:** `src/stores/gameController.ts`

```typescript
function gameTick() {
  const now = Date.now()
  const deltaSeconds = (now - lastTickTime.value) / 1000

  // ... existing needs updates

  // NEW: Environmental decay
  const habitatConditions = useHabitatConditions()
  habitatConditions.applyEnvironmentalDecay(deltaSeconds)

  lastTickTime.value = now
}
```

#### 3. Expose Functions
**File:** `src/stores/habitatConditions.ts`

```typescript
return {
  // ... existing exports
  applyEnvironmentalDecay,
  recordGuineaPigActivity
}
```

### Phase 3 Acceptance Criteria
- ✅ Bedding freshness decays over time based on quality
- ✅ Cleanliness decays gradually
- ✅ Guinea pig activity accelerates decay
- ✅ Decay integrates with game loop
- ✅ Decay rates are balanced and realistic

---

## Phase 4: Guinea Pig Position Tracking

### Goal
Track guinea pig position on habitat grid to enable autonomous movement and pathfinding.

### Position Tracking System

#### Position Data Structure
```typescript
interface GuineaPigPosition {
  x: number  // Grid X coordinate (0-13 for medium habitat)
  y: number  // Grid Y coordinate (0-9 for medium habitat)
  lastMoved: number  // Timestamp of last movement
  targetPosition?: { x: number; y: number }  // Destination for pathfinding
  isMoving: boolean  // Currently moving to target
}
```

#### Position Rules
- **Initial position:** Random unoccupied cell on first placement
- **Bounds checking:** Position must be within habitat grid
- **Collision detection:** Cannot occupy same cell as large items (2x2)
- **Multiple guinea pigs:** Can share same cell

### Implementation Steps

#### 1. Add Position Tracking to Habitat Conditions
**File:** `src/stores/habitatConditions.ts`

```typescript
// Guinea pig positions (Map of guineaPigId -> position)
const guineaPigPositions = ref<Map<string, GuineaPigPosition>>(new Map())

// Initialize guinea pig position (called when guinea pig becomes active)
function initializeGuineaPigPosition(guineaPigId: string) {
  // Find random unoccupied cell
  const emptyCell = findEmptyCell()

  if (emptyCell) {
    guineaPigPositions.value.set(guineaPigId, {
      x: emptyCell.x,
      y: emptyCell.y,
      lastMoved: Date.now(),
      isMoving: false
    })
    console.log(`Guinea pig ${guineaPigId} placed at (${emptyCell.x}, ${emptyCell.y})`)
  } else {
    // Default to center if no empty cells (shouldn't happen)
    const centerX = Math.floor(gridWidth / 2)
    const centerY = Math.floor(gridHeight / 2)
    guineaPigPositions.value.set(guineaPigId, {
      x: centerX,
      y: centerY,
      lastMoved: Date.now(),
      isMoving: false
    })
  }
}

// Find an empty cell (not occupied by items)
function findEmptyCell(): { x: number; y: number } | null {
  const occupiedCells = new Set<string>()

  // Mark cells occupied by items
  habitatItems.value.forEach(itemId => {
    const position = itemPositions.value.get(itemId)
    const item = useSuppliesStore().getItemById(itemId)
    const size = getItemSize(item)

    if (position) {
      for (let dy = 0; dy < size.height; dy++) {
        for (let dx = 0; dx < size.width; dx++) {
          occupiedCells.add(`${position.x + dx},${position.y + dy}`)
        }
      }
    }
  })

  // Find random empty cell
  const attempts = 50
  for (let i = 0; i < attempts; i++) {
    const x = Math.floor(Math.random() * gridWidth)
    const y = Math.floor(Math.random() * gridHeight)
    const key = `${x},${y}`

    if (!occupiedCells.has(key)) {
      return { x, y }
    }
  }

  return null  // No empty cells found
}

// Move guinea pig to new position
function moveGuineaPigTo(guineaPigId: string, x: number, y: number) {
  const currentPosition = guineaPigPositions.value.get(guineaPigId)
  if (!currentPosition) {
    console.warn(`Guinea pig ${guineaPigId} has no position`)
    return false
  }

  // Bounds check
  if (x < 0 || x >= gridWidth || y < 0 || y >= gridHeight) {
    console.warn(`Invalid position (${x}, ${y}) - out of bounds`)
    return false
  }

  // Update position
  guineaPigPositions.value.set(guineaPigId, {
    x,
    y,
    lastMoved: Date.now(),
    isMoving: false
  })

  // Record movement activity (increases cleanliness decay)
  recordGuineaPigActivity('movement')

  return true
}

// Get guinea pig position
function getGuineaPigPosition(guineaPigId: string): GuineaPigPosition | null {
  return guineaPigPositions.value.get(guineaPigId) || null
}

// Check if position is occupied by a guinea pig
function isPositionOccupiedByGuineaPig(x: number, y: number): boolean {
  for (const position of guineaPigPositions.value.values()) {
    if (position.x === x && position.y === y) {
      return true
    }
  }
  return false
}
```

#### 2. Integrate with Guinea Pig Store
**File:** `src/stores/guineaPigStore.ts`

```typescript
// When guinea pig becomes active, initialize position
function activateGuineaPig(guineaPigId: string) {
  const gp = guineaPigs.value.find(g => g.id === guineaPigId)
  if (!gp) return

  gp.isActive = true
  activeGuineaPigs.value.push(gp)

  // NEW: Initialize position in habitat
  const habitatConditions = useHabitatConditions()
  habitatConditions.initializeGuineaPigPosition(guineaPigId)
}
```

#### 3. Add Position Persistence
**File:** `src/stores/habitatConditions.ts`

```typescript
// In persist serializer
serialize: (state) => {
  const serialized = {
    ...state,
    itemPositions: Array.from((state.itemPositions as Map<string, any>).entries()),
    bowlContents: Array.from((state.bowlContents as Map<string, any>).entries()),
    hayRackContents: Array.from((state.hayRackContents as Map<string, any>).entries()),
    poops: state.poops || [],
    guineaPigPositions: Array.from((state.guineaPigPositions as Map<string, any>).entries())  // NEW
  }
  return JSON.stringify(serialized)
}

// In persist deserializer
deserialize: (value) => {
  const parsed = JSON.parse(value)
  // ... existing conversions
  if (parsed.guineaPigPositions && Array.isArray(parsed.guineaPigPositions)) {
    parsed.guineaPigPositions = new Map(parsed.guineaPigPositions)
  } else {
    parsed.guineaPigPositions = new Map()
  }
  return parsed
}
```

#### 4. Expose Functions
**File:** `src/stores/habitatConditions.ts`

```typescript
return {
  // ... existing exports
  guineaPigPositions,
  initializeGuineaPigPosition,
  moveGuineaPigTo,
  getGuineaPigPosition,
  isPositionOccupiedByGuineaPig
}
```

### Phase 4 Acceptance Criteria
- ✅ Guinea pig positions tracked on grid
- ✅ Initial position set when guinea pig becomes active
- ✅ Movement updates position and records activity
- ✅ Position persists across sessions
- ✅ Multiple guinea pigs can have positions

---

## Phase 5: Item Usage History

### Goal
Track when items were last used by guinea pigs to enable autonomy decision-making and item rotation mechanics.

### Usage Tracking System

#### Usage Data Structure
```typescript
interface ItemUsage {
  lastUsedAt: number  // Timestamp of last use
  usageCount: number  // Total times used
  lastUsedBy: string  // Guinea pig ID that last used it
  effectiveness: number  // Current effectiveness (0-100, decays with overuse)
  freshnessBonus: boolean  // True if recently introduced (< 24 hours)
}
```

#### Usage Tracking Rules
- **New item bonus:** Newly placed items have 100% effectiveness for 24 hours
- **Effectiveness decay:** Each use reduces effectiveness by 2-5 points
- **Minimum effectiveness:** 50% (never drops below)
- **Recovery:** Items regain 10% effectiveness per day when not used
- **Rotation benefit:** Removing and re-placing an item restores 50% effectiveness

### Implementation Steps

#### 1. Add Usage Tracking to Habitat Conditions
**File:** `src/stores/habitatConditions.ts`

```typescript
// Item usage history (Map of itemId -> usage data)
const itemUsageHistory = ref<Map<string, ItemUsage>>(new Map())

// Record item usage
function recordItemUsage(itemId: string, guineaPigId: string) {
  const now = Date.now()
  const existing = itemUsageHistory.value.get(itemId)

  if (existing) {
    // Update existing usage
    const effectivenessDecay = Math.floor(Math.random() * 4) + 2  // 2-5 points

    itemUsageHistory.value.set(itemId, {
      lastUsedAt: now,
      usageCount: existing.usageCount + 1,
      lastUsedBy: guineaPigId,
      effectiveness: Math.max(50, existing.effectiveness - effectivenessDecay),
      freshnessBonus: existing.freshnessBonus && (now - existing.lastUsedAt < 86400000)  // 24 hours
    })
  } else {
    // First time usage
    itemUsageHistory.value.set(itemId, {
      lastUsedAt: now,
      usageCount: 1,
      lastUsedBy: guineaPigId,
      effectiveness: 100,
      freshnessBonus: true
    })
  }

  console.log(`Item ${itemId} used by ${guineaPigId}. Effectiveness: ${itemUsageHistory.value.get(itemId)?.effectiveness}%`)
}

// Get item effectiveness
function getItemEffectiveness(itemId: string): number {
  const usage = itemUsageHistory.value.get(itemId)
  if (!usage) return 100  // New item, full effectiveness

  // Check for freshness bonus
  const now = Date.now()
  const hoursSinceFirstUse = (now - usage.lastUsedAt) / (1000 * 60 * 60)

  if (usage.freshnessBonus && hoursSinceFirstUse < 24) {
    return 100  // Freshness bonus active
  }

  return usage.effectiveness
}

// Apply daily effectiveness recovery
function applyEffectivenessRecovery() {
  const now = Date.now()
  const oneDayAgo = now - 86400000  // 24 hours

  itemUsageHistory.value.forEach((usage, itemId) => {
    // If item hasn't been used in 24 hours, recover 10% effectiveness
    if (usage.lastUsedAt < oneDayAgo && usage.effectiveness < 100) {
      usage.effectiveness = Math.min(100, usage.effectiveness + 10)
      console.log(`Item ${itemId} effectiveness recovered to ${usage.effectiveness}%`)
    }

    // Disable freshness bonus after 24 hours
    if (usage.freshnessBonus && (now - usage.lastUsedAt > 86400000)) {
      usage.freshnessBonus = false
    }
  })
}

// Reset effectiveness when item is rotated (removed and re-added)
function resetItemEffectiveness(itemId: string) {
  const existing = itemUsageHistory.value.get(itemId)
  if (existing) {
    itemUsageHistory.value.set(itemId, {
      ...existing,
      effectiveness: Math.min(100, existing.effectiveness + 50),  // Restore 50%
      freshnessBonus: true  // Re-enable freshness bonus
    })
    console.log(`Item ${itemId} rotated - effectiveness reset to ${itemUsageHistory.value.get(itemId)?.effectiveness}%`)
  }
}

// Get usage statistics for debug/display
function getItemUsageStats(itemId: string): ItemUsage | null {
  return itemUsageHistory.value.get(itemId) || null
}

// Get items sorted by effectiveness (for rotation suggestions)
function getItemsByEffectiveness(): Array<{ itemId: string; effectiveness: number }> {
  const items: Array<{ itemId: string; effectiveness: number }> = []

  habitatItems.value.forEach(itemId => {
    const effectiveness = getItemEffectiveness(itemId)
    items.push({ itemId, effectiveness })
  })

  return items.sort((a, b) => a.effectiveness - b.effectiveness)
}
```

#### 2. Integrate Effectiveness Recovery with Game Loop
**File:** `src/stores/gameController.ts`

```typescript
let lastEffectivenessRecovery = Date.now()

function gameTick() {
  const now = Date.now()
  const deltaSeconds = (now - lastTickTime.value) / 1000

  // ... existing tick logic

  // Apply effectiveness recovery once per hour
  if (now - lastEffectivenessRecovery > 3600000) {  // 1 hour
    habitatConditions.applyEffectivenessRecovery()
    lastEffectivenessRecovery = now
  }

  lastTickTime.value = now
}
```

#### 3. Update Item Removal to Trigger Rotation Reset
**File:** `src/stores/habitatConditions.ts`

```typescript
function removeItemFromHabitat(itemId: string) {
  const index = habitatItems.value.indexOf(itemId)
  if (index === -1) {
    console.warn(`Item ${itemId} not found in habitat`)
    return false
  }

  const inventoryStore = useInventoryStore()

  // Remove placement flag
  inventoryStore.unmarkAsPlacedInHabitat(itemId, 1)

  // Remove from habitat
  habitatItems.value.splice(index, 1)

  // Remove position tracking
  itemPositions.value.delete(itemId)

  // Clear bowl/hay rack contents
  if (bowlContents.value.has(itemId)) {
    bowlContents.value.delete(itemId)
  }
  if (hayRackContents.value.has(itemId)) {
    hayRackContents.value.delete(itemId)
  }

  // NEW: Reset effectiveness when item is removed (rotation benefit)
  resetItemEffectiveness(itemId)

  return true
}
```

#### 4. Add Persistence
**File:** `src/stores/habitatConditions.ts`

```typescript
// In serialize
itemUsageHistory: Array.from((state.itemUsageHistory as Map<string, any>).entries())

// In deserialize
if (parsed.itemUsageHistory && Array.isArray(parsed.itemUsageHistory)) {
  parsed.itemUsageHistory = new Map(parsed.itemUsageHistory)
} else {
  parsed.itemUsageHistory = new Map()
}
```

#### 5. Expose Functions
**File:** `src/stores/habitatConditions.ts`

```typescript
return {
  // ... existing exports
  itemUsageHistory,
  recordItemUsage,
  getItemEffectiveness,
  applyEffectivenessRecovery,
  resetItemEffectiveness,
  getItemUsageStats,
  getItemsByEffectiveness
}
```

### Phase 5 Acceptance Criteria
- ✅ Item usage tracked when guinea pig uses item
- ✅ Effectiveness decays with use
- ✅ Effectiveness recovers over time
- ✅ Rotation resets effectiveness
- ✅ Usage history persists across sessions

---

## Integration Points

### Existing Systems
- **Supplies Store** - Item type metadata and need satisfaction data
- **Habitat Conditions** - Water consumption, decay, positions, usage
- **Game Controller** - Time-based decay and recovery loops
- **Guinea Pig Store** - Position initialization on activation
- **Inventory Store** - Item placement and removal

### Autonomy System (Phase 4)
This system provides all data required for Phase 4 Guinea Pig Autonomy:
- **Item types** - AI knows what each item does
- **Water consumption** - AI can drink from water bottles
- **Environmental decay** - Creates ongoing maintenance needs
- **Position tracking** - Enables pathfinding and movement
- **Usage history** - Enables intelligent item selection

---

## Development Order

### Recommended Implementation Sequence
1. **Phase 1: Item Type Metadata** (1-2 hours)
   - Foundation for all autonomy decisions
   - No dependencies
   - Can be tested immediately

2. **Phase 2: Water Consumption** (1-2 hours)
   - Depends on Phase 1 (item types)
   - Testable via debug controls

3. **Phase 3: Environmental Decay** (2-3 hours)
   - Depends on game loop integration
   - Balance testing required

4. **Phase 4: Position Tracking** (2-3 hours)
   - Depends on habitat conditions
   - Visual testing via HabitatDebug

5. **Phase 5: Usage History** (2-3 hours)
   - Depends on Phases 1 and 4
   - Statistical tracking and display

**Total Estimated Time:** 8-13 hours

---

## Testing Strategy

### Phase 1 Testing
- ✅ All habitat items have itemType
- ✅ getItemsByType() returns correct items
- ✅ itemSatisfiesNeed() validates correctly

### Phase 2 Testing
- ✅ consumeWater() reduces water level
- ✅ Empty bottle prevents drinking
- ✅ getWaterBottlePosition() returns correct position

### Phase 3 Testing
- ✅ Bedding decay rate matches quality
- ✅ Cleanliness decays over time
- ✅ Activity accelerates decay appropriately

### Phase 4 Testing
- ✅ Guinea pig position initialized on activation
- ✅ moveGuineaPigTo() updates position correctly
- ✅ Position persists across refresh

### Phase 5 Testing
- ✅ recordItemUsage() tracks correctly
- ✅ Effectiveness decays with use
- ✅ Recovery system works
- ✅ Rotation resets effectiveness

---

## Debug Integration

### HabitatDebug Panel Additions

#### Item Type Display
```vue
<!-- Show item type for each habitat item -->
<div class="item-type-display">
  <h4>Habitat Items by Type</h4>
  <div v-for="(items, type) in itemsByType" :key="type">
    <strong>{{ type }}:</strong> {{ items.length }} items
  </div>
</div>
```

#### Water Consumption Controls
```vue
<Button @click="testWaterConsumption">
  Test Water Consumption
</Button>
<div>Current Water Level: {{ habitat.waterLevel }}%</div>
```

#### Decay Rate Display
```vue
<div class="decay-display">
  <p>Bedding Decay Rate: {{ beddingDecayRate }}/sec</p>
  <p>Cleanliness Decay Rate: {{ cleanlinessDecayRate }}/sec</p>
</div>
```

#### Position Visualization
```vue
<!-- Show guinea pig positions on HabitatVisual grid -->
<div
  v-for="(position, gpId) in guineaPigPositions"
  :key="gpId"
  class="guinea-pig-marker"
  :style="{
    gridColumn: position.x + 1,
    gridRow: position.y + 1
  }"
>
  🐹
</div>
```

#### Usage Stats Display
```vue
<div class="usage-stats">
  <h4>Item Effectiveness</h4>
  <div v-for="item in itemsByEffectiveness" :key="item.itemId">
    {{ item.itemId }}: {{ item.effectiveness }}%
  </div>
</div>
```

---

## Success Metrics

### Phase 1 Success ✅ ACHIEVED
- ✅ All habitat items classified by type
- ✅ Autonomy can query items by need
- ✅ Helper functions operational
- ✅ Need types corrected to match implementation

### Phase 2 Success ✅ ACHIEVED
- ✅ Water consumption functional
- ✅ Water level tracking accurate
- ✅ Empty bottle handling works
- ✅ Improved visual feedback (blue background fade)

### Phase 3 Success
- Decay rates balanced and realistic
- Activity tracking functional
- Integration with game loop smooth

### Phase 4 Success
- Positions tracked reliably
- Movement system operational
- Persistence working

### Phase 5 Success
- Usage tracking accurate
- Effectiveness decay balanced
- Rotation system beneficial

### Overall Progress
- ✅ **2 of 5 phases complete** (40% complete)
- ⏳ Phases 3-5 remaining
- ✅ Foundation for autonomy established
- ✅ Debug tools operational
- ✅ No performance issues detected

---

## Next Steps

After completing System 16, Phase 3 will be complete and the codebase will be ready for:

**Phase 4: Guinea Pig Autonomy System**
- Need-based behavior triggers
- Pathfinding and movement
- Autonomous item usage
- AI decision-making
- Friendship-influenced behaviors

**Documentation:** [Guinea Pig Autonomy System](../phase4/guinea-pig-autonomy-system.md)

---

## File Structure

### Files to Create
```
src/types/
  └── itemTypes.ts              ❌ NEW - Item type definitions

src/stores/
  └── habitatConditions.ts      ✅ MODIFY - Add all 5 phases
  └── gameController.ts          ✅ MODIFY - Integrate decay and recovery

src/components/debug/
  └── HabitatDebug.vue          ✅ MODIFY - Add testing controls
```

### Files Modified (Phases 1-2)
```
src/types/supplies.ts                           ✅ Added ItemType and NeedType (Phase 1)
src/stores/suppliesStore.ts                     ✅ Added helper functions (Phase 1)
src/data/supplies/habitat/bowls_bottles.json    ✅ Added metadata to 12 items (Phase 1)
src/data/supplies/habitat/hideaways.json        ✅ Added metadata to 13 items (Phase 1)
src/stores/habitatConditions.ts                 ✅ Added water functions (Phase 2)
src/components/game/habitat/WaterBottle.vue     ✅ Improved visual feedback (Phase 2)
src/components/debug/environment/HabitatDebug.vue ✅ Added test controls (Phases 1-2)
```

### Files Remaining (Phases 3-5)
```
src/stores/guineaPigStore.ts                    ⏳ Initialize positions (Phase 4)
src/stores/gameController.ts                    ⏳ Integrate decay/recovery (Phases 3, 5)
src/components/game/HabitatVisual.vue           ⏳ Display guinea pig positions (Phase 4)
src/data/supplies/habitat/chews.json            ⏳ Add metadata (Phase 1 optional)
src/data/supplies/habitat/toys.json             ⏳ Add metadata (Phase 1 optional)
src/data/supplies/habitat/enrichment.json       ⏳ Add metadata (Phase 1 optional)
```

---

## Design Decisions

### Item Type Classification ✅ **DECIDED**
- Use functional classification (what it does) vs category
- Map directly to need satisfaction
- Extensible for future item types

### Decay Rates ✅ **DECIDED**
- Bedding: 1 point per 5 minutes (quality modified)
- Cleanliness: 1 point per 10 minutes
- Activity-based acceleration for realism

### Position System ✅ **DECIDED**
- Grid-based (matches HabitatVisual)
- Multiple guinea pigs can share cells
- Stored in habitatConditions (not guineaPigStore)

### Usage Tracking ✅ **DECIDED**
- Per-item tracking (not per guinea pig)
- Effectiveness decay encourages rotation
- 50% minimum effectiveness (always usable)

### Performance Optimization
- Decay calculated per game tick (not per frame)
- Position stored in Map for O(1) lookup
- Usage history lazy-loaded
- Minimal computational overhead

---

## Documentation References

- [Phase 3 Overview](../../DEVELOPMENT_PHASES.md#phase-3-habitat--environment)
- [Guinea Pig Autonomy System](../phase4/guinea-pig-autonomy-system.md)
- [Habitat UI Implementation](system-14.1-habitat-ui-implementation-plan.md)
- [Needs System](../phase2/system-7-needs-system.md)
