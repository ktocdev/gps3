# Phase 3: Pathfinding & Collision System [DEFERRED]

> ⚠️ **This approach has been DEFERRED in favor of the Hybrid Pathfinding System**
>
> The pure grid-based approach doesn't translate well to 3D collision detection.
> See [hybrid-pathfinding-system.md](./hybrid-pathfinding-system.md) for the new approach.

**Status:** ❌ DEFERRED
**Priority:** N/A - Replaced by Hybrid System
**Created:** November 30, 2025
**Deferred:** December 6, 2025
**Original Goal:** Fix fundamental movement and positioning issues that break realism

---

## 📋 Overview

This phase addresses critical pathfinding and collision issues that currently break immersion in the 3D view. Guinea pigs must navigate intelligently around items, use shelter entrances properly, align with interactive objects, and stay within habitat boundaries.

**Why This Blocks Phase 4:**
Adding animations and polish to a system where guinea pigs walk through walls and items will make the problems more visible and jarring. These fundamental movement issues must be resolved first.

---

## 🎯 Goals

### Pathfinding & Navigation
- ✅ Guinea pigs navigate around items (not through them)
- ✅ Smart shelter entry/exit (use designated openings only)
- ✅ Item interaction positioning (align with bowls, water bottles)

### Boundary Enforcement
- ✅ Guinea pigs stay within habitat walls
- ✅ Poop spawns only within boundaries
- ✅ Items cannot be placed outside walls

---

## 🚨 Current Issues

### Issue 1: Guinea Pigs Walk Through Items
**Problem:** Guinea pigs move directly through bowls, igloos, and other items
**Impact:** Breaks immersion, looks broken
**Root Cause:** Pathfinding uses 2D grid positions without considering 3D item collisions

### Issue 2: Items Entered Through Walls
**Problem:** Guinea pigs enter igloos and tunnels through any side, not just the opening
**Impact:** Looks unrealistic, defeats purpose of shelter design
**Root Cause:** No entrance/exit point definition for shelters

### Issue 3: Poor Interaction Alignment
**Problem:** Guinea pigs don't face bowls when eating or align with water bottle spout when drinking
**Impact:** Eating/drinking animations will look wrong in Phase 4
**Root Cause:** No alignment logic for interactive positions

### Issue 4: Guinea Pigs Near Edges Appear Outside Walls
**Problem:** Guinea pig models clip through or appear outside habitat walls when positioned near boundaries
**Impact:** Breaks illusion of contained habitat
**Root Cause:** Model position not constrained to safe interior bounds

### Issue 5: Poop Outside Boundaries
**Problem:** Poop can spawn outside habitat walls
**Impact:** Player can't clean it, looks broken
**Root Cause:** No boundary validation on poop spawn positions

---

## 🏗️ Implementation Plan

### 3.1 Enhanced Pathfinding System

**Goal:** Guinea pigs navigate around obstacles intelligently

**Current System:**
- 2D grid-based A* pathfinding
- Only considers grid cells as walkable/blocked
- No awareness of 3D item positions

**Enhanced System:**
- Mark grid cells occupied by items as blocked
- Update pathfinding grid when items are added/removed
- Consider item size (multi-cell blocking)

**Implementation:**

**File:** `src/composables/usePathfinding.ts`

```typescript
import { useHabitatConditions } from '../stores/habitatConditions'

// Track blocked cells based on item positions
const blockedCells = new Set<string>()

function updateBlockedCells(): void {
  const habitatConditions = useHabitatConditions()
  blockedCells.clear()

  // Mark cells occupied by items
  habitatConditions.itemPositions.forEach((position, itemId) => {
    const itemSize = getItemSize(itemId)

    // Block cells based on item footprint
    for (let dx = 0; dx < itemSize.width; dx++) {
      for (let dy = 0; dy < itemSize.height; dy++) {
        const cellKey = `${position.x + dx},${position.y + dy}`
        blockedCells.add(cellKey)
      }
    }
  })
}

function getItemSize(itemId: string): { width: number; height: number } {
  // Item sizes in grid cells
  if (itemId.includes('igloo') || itemId.includes('shelter')) {
    return { width: 2, height: 2 }
  }
  if (itemId.includes('tunnel')) {
    return { width: 3, height: 1 }
  }
  if (itemId.includes('bowl') || itemId.includes('bed')) {
    return { width: 1, height: 1 }
  }
  // Default small item
  return { width: 1, height: 1 }
}

function isCellWalkable(x: number, y: number): boolean {
  const cellKey = `${x},${y}`

  // Check grid bounds
  if (x < 0 || x >= GRID_CONFIG.COLS || y < 0 || y >= GRID_CONFIG.ROWS) {
    return false
  }

  // Check if cell is blocked by item
  if (blockedCells.has(cellKey)) {
    return false
  }

  return true
}

// Watch for item changes and update blocked cells
watch(() => habitatConditions.itemPositions, () => {
  updateBlockedCells()
}, { deep: true, immediate: true })
```

---

### 3.2 Shelter Entry/Exit Points

**Goal:** Guinea pigs only enter shelters through designated openings

**Implementation:**

**File:** `src/composables/3d-models/shelters/igloos.ts`

```typescript
export function createShelterModel(): THREE.Group {
  const group = new THREE.Group()

  // ... existing igloo creation code ...

  // Store entrance position and direction in userData
  group.userData.entrancePosition = new THREE.Vector3(0, 0, 2.0) // Front entrance
  group.userData.entranceDirection = new THREE.Vector3(0, 0, 1) // Facing forward
  group.userData.itemType = 'shelter'

  return group
}
```

**File:** `src/composables/usePathfinding.ts`

```typescript
interface ShelterEntrance {
  itemId: string
  gridPosition: { x: number; y: number }
  entranceCell: { x: number; y: number }
  exitCell: { x: number; y: number }
}

const shelterEntrances = new Map<string, ShelterEntrance>()

function registerShelterEntrance(itemId: string, position: { x: number; y: number }): void {
  // Determine entrance and exit cells based on shelter orientation
  const rotation = getItemRotation(itemId) // From habitatConditions

  let entranceCell = { x: position.x, y: position.y }
  let exitCell = { x: position.x, y: position.y }

  if (itemId.includes('igloo')) {
    // Igloo entrance faces forward (south)
    entranceCell = { x: position.x, y: position.y + 2 }
    exitCell = { x: position.x, y: position.y - 1 }
  } else if (itemId.includes('tunnel')) {
    // Tunnel has two openings (east-west)
    entranceCell = { x: position.x - 1, y: position.y }
    exitCell = { x: position.x + 3, y: position.y }
  }

  shelterEntrances.set(itemId, {
    itemId,
    gridPosition: position,
    entranceCell,
    exitCell
  })
}

function getPathToShelter(
  fromX: number,
  fromY: number,
  shelterId: string
): { x: number; y: number }[] | null {
  const entrance = shelterEntrances.get(shelterId)
  if (!entrance) return null

  // Path to entrance cell first
  const pathToEntrance = findPath(fromX, fromY, entrance.entranceCell.x, entrance.entranceCell.y)
  if (!pathToEntrance) return null

  // Then add interior navigation
  pathToEntrance.push(entrance.gridPosition)

  return pathToEntrance
}
```

---

### 3.3 Interaction Alignment

**Goal:** Guinea pigs face bowls when eating and align with water bottle spout when drinking

**Implementation:**

**File:** `src/composables/use3DSync.ts`

```typescript
interface InteractionAlignment {
  targetPosition: THREE.Vector3
  targetRotation: number
}

function getEatingAlignment(bowlId: string): InteractionAlignment | null {
  const habitatConditions = useHabitatConditions()
  const bowlPosition = habitatConditions.itemPositions.get(bowlId)
  if (!bowlPosition) return null

  const worldPos = gridToWorld(bowlPosition.x, bowlPosition.y)

  return {
    targetPosition: worldPos.clone(), // Stand at bowl position
    targetRotation: 0 // Face bowl (adjust based on approach direction)
  }
}

function getDrinkingAlignment(bottleId: string): InteractionAlignment | null {
  const habitatConditions = useHabitatConditions()
  const bottlePosition = habitatConditions.itemPositions.get(bottleId)
  if (!bottlePosition) return null

  const worldPos = gridToWorld(bottlePosition.x, bottlePosition.y)

  // Water bottles are wall-mounted, align to face the wall
  const bottleRotation = getWaterBottleRotation(bottlePosition.x, bottlePosition.y)

  return {
    targetPosition: worldPos.clone(),
    targetRotation: bottleRotation // Face the bottle spout
  }
}

// Apply alignment when guinea pig reaches interaction target
function updateInteractionAlignment(guineaPigId: string): void {
  const guineaPig = guineaPigStore.getGuineaPigById(guineaPigId)
  if (!guineaPig) return

  const activity = guineaPig.currentActivity

  if (activity?.type === 'eating') {
    const alignment = getEatingAlignment(activity.targetItemId)
    if (alignment) {
      applyAlignment(guineaPigId, alignment)
    }
  } else if (activity?.type === 'drinking') {
    const alignment = getDrinkingAlignment(activity.targetItemId)
    if (alignment) {
      applyAlignment(guineaPigId, alignment)
    }
  }
}

function applyAlignment(
  guineaPigId: string,
  alignment: InteractionAlignment
): void {
  const model = guineaPigModels.get(guineaPigId)
  if (!model) return

  // Smoothly rotate to face target
  const targetRotation = targetRotations.get(guineaPigId)
  if (targetRotation !== undefined) {
    targetRotations.set(guineaPigId, alignment.targetRotation)
  }
}
```

---

### 3.4 Boundary Enforcement

**Goal:** Prevent guinea pigs and poop from appearing outside habitat walls

**Current Habitat Dimensions:**
- Grid: 14 columns × 10 rows
- World space: Centered at origin
- Walls define playable area boundaries

**Implementation:**

**File:** `src/constants/3d.ts`

```typescript
export const HABITAT_CONFIG = {
  // Grid dimensions
  GRID_COLS: 14,
  GRID_ROWS: 10,
  CELL_SIZE: 4.0,

  // Safe boundaries (account for guinea pig model size)
  // Guinea pigs are ~1.5 units in radius, so inset by 2 units
  SAFE_BOUNDS: {
    minX: -26.0, // (-14/2 * 4.0) + 2.0
    maxX: 26.0,  // (14/2 * 4.0) - 2.0
    minZ: -18.0, // (-10/2 * 4.0) + 2.0
    maxZ: 18.0   // (10/2 * 4.0) - 2.0
  }
}
```

**File:** `src/composables/use3DSync.ts`

```typescript
import { HABITAT_CONFIG } from '../constants/3d'

function clampToSafeBounds(position: THREE.Vector3): THREE.Vector3 {
  const clamped = position.clone()

  clamped.x = Math.max(
    HABITAT_CONFIG.SAFE_BOUNDS.minX,
    Math.min(HABITAT_CONFIG.SAFE_BOUNDS.maxX, clamped.x)
  )

  clamped.z = Math.max(
    HABITAT_CONFIG.SAFE_BOUNDS.minZ,
    Math.min(HABITAT_CONFIG.SAFE_BOUNDS.maxZ, clamped.z)
  )

  return clamped
}

// Apply to guinea pig positions
export function updateGuineaPigPositions(deltaTime: number): void {
  guineaPigModels.forEach((model, guineaPigId) => {
    const target = targetPositions.get(guineaPigId)
    const current = currentPositions.get(guineaPigId)

    if (target && current) {
      // Clamp target to safe bounds
      const clampedTarget = clampToSafeBounds(target)
      targetPositions.set(guineaPigId, clampedTarget)

      // Smooth lerp
      current.lerp(clampedTarget, 0.15)

      // Double-check current position is within bounds
      const clampedCurrent = clampToSafeBounds(current)
      currentPositions.set(guineaPigId, clampedCurrent)

      model.position.copy(clampedCurrent)
    }
  })
}
```

**File:** `src/composables/use3DPoop.ts`

```typescript
function isPositionWithinBounds(x: number, y: number): boolean {
  const worldPos = gridToWorld(x, y)

  return (
    worldPos.x >= HABITAT_CONFIG.SAFE_BOUNDS.minX &&
    worldPos.x <= HABITAT_CONFIG.SAFE_BOUNDS.maxX &&
    worldPos.z >= HABITAT_CONFIG.SAFE_BOUNDS.minZ &&
    worldPos.z <= HABITAT_CONFIG.SAFE_BOUNDS.maxZ
  )
}

// Watch for poop additions
watch(() => habitatConditions.poopPellets, (pellets) => {
  pellets.forEach((pellet) => {
    // Validate poop is within bounds
    if (!isPositionWithinBounds(pellet.position.col, pellet.position.row)) {
      console.warn(`Poop pellet ${pellet.id} outside bounds, skipping render`)
      return
    }

    // Only render if within valid area
    if (!poopModels.has(pellet.id)) {
      const worldPos = gridToWorld(pellet.position.col, pellet.position.row)
      const clampedPos = clampToSafeBounds(worldPos)
      // ... create poop model at clamped position
    }
  })
})
```

---

### 3.5 Item Placement Validation

**Goal:** Prevent items from being placed outside walls (when UI controls are implemented)

**Implementation:**

**File:** `src/stores/habitatConditions.ts`

```typescript
function validateItemPlacement(
  itemId: string,
  x: number,
  y: number
): { valid: boolean; reason?: string } {
  // Check grid bounds
  if (x < 0 || x >= GRID_CONFIG.COLS || y < 0 || y >= GRID_CONFIG.ROWS) {
    return { valid: false, reason: 'Outside grid boundaries' }
  }

  // Check if cells are within safe area
  const itemSize = getItemSize(itemId)
  for (let dx = 0; dx < itemSize.width; dx++) {
    for (let dy = 0; dy < itemSize.height; dy++) {
      const worldPos = gridToWorld(x + dx, y + dy)
      const clamped = clampToSafeBounds(worldPos)

      if (clamped.x !== worldPos.x || clamped.z !== worldPos.z) {
        return { valid: false, reason: 'Too close to walls' }
      }
    }
  }

  // Check for overlap with other items
  for (const [existingId, existingPos] of this.itemPositions) {
    if (itemsOverlap(itemId, x, y, existingId, existingPos.x, existingPos.y)) {
      return { valid: false, reason: 'Overlaps with another item' }
    }
  }

  return { valid: true }
}

function itemsOverlap(
  item1Id: string, x1: number, y1: number,
  item2Id: string, x2: number, y2: number
): boolean {
  const size1 = getItemSize(item1Id)
  const size2 = getItemSize(item2Id)

  // AABB collision detection
  return !(
    x1 + size1.width <= x2 ||
    x2 + size2.width <= x1 ||
    y1 + size1.height <= y2 ||
    y2 + size2.height <= y1
  )
}
```

---

## 📋 Implementation Checklist

### Pathfinding
- [ ] Implement blocked cells tracking
- [ ] Update pathfinding to consider item positions
- [ ] Add item size definitions
- [ ] Watch for item position changes
- [ ] Test navigation around obstacles

### Shelter Entry/Exit
- [ ] Define entrance points for igloos
- [ ] Define entrance/exit for tunnels
- [ ] Update pathfinding for shelter navigation
- [ ] Test guinea pigs only use designated openings
- [ ] Verify smooth entry/exit animations

### Interaction Alignment
- [ ] Implement eating alignment (face bowl)
- [ ] Implement drinking alignment (face spout)
- [ ] Apply alignment during interactions
- [ ] Test guinea pigs face correct direction
- [ ] Ensure smooth rotation transitions

### Boundary Enforcement
- [ ] Define safe bounds constants
- [ ] Implement position clamping function
- [ ] Apply bounds to guinea pig positions
- [ ] Apply bounds to poop spawning
- [ ] Test edge cases (corners, near walls)

### Item Placement Validation
- [ ] Implement placement validation function
- [ ] Check grid boundaries
- [ ] Check safe area boundaries
- [ ] Check item overlap
- [ ] Integrate with UI controls (Phase 3 UI)

### Testing
- [ ] Guinea pigs never walk through items
- [ ] Guinea pigs only enter shelters via openings
- [ ] Guinea pigs face bowls when eating
- [ ] Guinea pigs align with water bottles when drinking
- [ ] Guinea pigs never appear outside walls
- [ ] Poop never spawns outside walls
- [ ] Items cannot be placed outside walls
- [ ] Items cannot overlap with each other

---

## 🎯 Success Criteria

✅ **Phase 3 Pathfinding Complete when:**

### Navigation
1. ✅ Guinea pigs navigate around all items (no clipping)
2. ✅ Shelters only entered through designated openings
3. ✅ Pathfinding updates when items added/removed

### Alignment
4. ✅ Guinea pigs face bowls while eating
5. ✅ Guinea pigs align with water bottle spout while drinking
6. ✅ Smooth rotation to interaction positions

### Boundaries
7. ✅ Guinea pigs always stay within habitat walls
8. ✅ Guinea pig models never clip through walls
9. ✅ Poop only spawns within valid interior area
10. ✅ Item placement validates boundaries
11. ✅ Items cannot be placed overlapping each other

### Polish
12. ✅ Navigation looks natural and realistic
13. ✅ No visual glitches or clipping
14. ✅ Ready for Phase 4 animation work

---

## 📁 Files to Modify

### Pathfinding System
- `src/composables/usePathfinding.ts` - Enhanced obstacle avoidance
- `src/constants/3d.ts` - Habitat bounds and item sizes

### Model Updates
- `src/composables/3d-models/shelters/igloos.ts` - Add entrance metadata
- `src/composables/3d-models/shelters/tunnels.ts` - Add entrance/exit metadata

### Position & Alignment
- `src/composables/use3DSync.ts` - Position clamping, interaction alignment
- `src/composables/use3DPoop.ts` - Poop boundary validation

### Store Updates
- `src/stores/habitatConditions.ts` - Item placement validation

---

## 🔗 Dependencies

**Blocked by:** None (can start immediately)

**Blocks:**
- Phase 4: Movement & Visual Polish
- Phase 3: UI Controls (item placement validation needed)

---

## 🔍 Additional Complexity Discovered

### Issue 3: Eating & Drinking Alignment - Deferred

**Problem:** Guinea pigs need precise positioning and rotation to align nose with bowls and water bottle nozzles.

**Attempted Solution:**
- Added rotation field to `GuineaPigPosition` interface
- Created alignment calculation functions (`calculateEatingAlignment`, `calculateDrinkingAlignment`)
- Applied pixel offsets and rotation during eating/drinking behaviors
- Updated 3D rendering to use custom rotation when set

**Why It Didn't Work:**
The alignment system is more complex than anticipated and requires fundamental changes to how guinea pigs move and animate during interactions:

1. **Animation System Missing:** Guinea pigs need smooth animation transitions when:
   - Approaching items (walking animation)
   - Entering interaction stance (position/rotation adjustment)
   - Performing interaction (eating/drinking animation)
   - Exiting interaction (return to idle)

2. **State Machine Required:** Need distinct animation states:
   - `walking` → `approaching` → `interacting` → `idle`
   - Each state needs entry/exit transitions
   - Rotation changes must be gradual, not instant

3. **Coordinate System Complexity:**
   - Mixing grid positions, pixel offsets, and world coordinates
   - `PIXELS_PER_UNIT` scaling factor was approximate (10 pixels/unit)
   - Need precise mapping between 2D grid alignment and 3D world positions
   - Water bottle rotation based on wall position adds extra complexity

4. **Multiple Shelter Types/Sizes:**
   - Current implementation only handles one igloo size (2×2) and one tunnel size (3×1)
   - Different shelter types will have different entrance positions and orientations
   - Entrance detection logic (`isShelterEntrance`) is too simplistic for variety
   - Need flexible entrance definition system that scales to multiple shelter models

5. **Directional Movement Blocking:**
   - Shelters currently allow walking through them (temporary workaround)
   - Proper entrance-only access requires tracking movement direction, not just position
   - Guinea pig approaching from wrong side should be blocked
   - Requires pathfinding to understand directional constraints

**Recommendation:**
Defer this issue to **Phase 4: Animation & Polish** where it can be implemented alongside:
- Walking/idle animation system
- Smooth rotation transitions
- Interaction animation states
- Proper animation state machine

For now, guinea pigs will simply position themselves on the same grid cell as bowls/bottles, which is functional but not visually perfect.

**Files That Would Need Changes:**
- `src/composables/use3DGuineaPig.ts` - Add animation state machine
- `src/composables/use3DSync.ts` - Smooth rotation interpolation
- `src/composables/game/useGuineaPigBehavior.ts` - Interaction state management
- `src/stores/habitatConditions.ts` - Precise coordinate mapping
- Phase 4 animation system integration

---

## 📚 References

- [usePathfinding.ts](../../src/composables/usePathfinding.ts) - Current A* implementation
- [use3DSync.ts](../../src/composables/use3DSync.ts) - Position syncing system
- [habitatConditions.ts](../../src/stores/habitatConditions.ts) - Item position store

---

**Last Updated:** December 6, 2025
