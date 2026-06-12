# Phase 3.5: 3D Autonomous Guinea Pig Behavior (Hunger Only MVP)

**Goal:** Implement autonomous behavior for guinea pigs in 3D mode starting with **hunger need only**. Uses continuous world-coordinate movement with circle-based obstacle avoidance (based on `guinea-pig-sim-demo-backup.html`).

---

## MVP Scope: Hunger Only

**What we're building:**
- Guinea pig placed in 3D habitat with world coordinates
- Hunger need decays over time (reuse existing decay logic)
- When hungry, guinea pig navigates to food bowl
- Circle-based obstacle avoidance during movement
- Eating at food bowl satisfies hunger
- Idle wandering when not hungry

**Deferred until hunger works:**
- Thirst, comfort, social, enrichment needs
- Complex behavior selection priorities
- Social interactions between guinea pigs
- Full personality system effects

---

## Architecture Overview

**Reuse from Existing Systems:**
- `guineaPigStore.ts` - Guinea pig data, needs values
- `needsController.ts` - Hunger decay rate calculation
- `habitatConditions.ts` - Food bowl positions (as obstacle + target)
- `GRID_CONFIG` from `constants/3d.ts` - Coordinate conversion

**Create New for 3D:**
- World-coordinate position storage
- Circle-based pathfinding (from demo)
- RAF-based continuous movement
- Simple hunger behavior loop

---

## File Structure

### New Files

```
src/
  stores/
    movement3DStore.ts           # World positions for guinea pigs + obstacles
  composables/
    3d/
      use3DPathfinding.ts        # Circle-based obstacle avoidance
      use3DMovement.ts           # Movement controller (moveTo, wander)
      use3DHungerBehavior.ts     # Hunger-only behavior loop
  types/
    movement3d.ts                # TypeScript interfaces
```

### Files to Modify

```
src/
  composables/
    use3DSync.ts                 # Add option to read from movement3DStore
  components/debug/environment/
    Habitat3DDebug.vue           # Integrate hunger behavior
```

---

## Implementation Phases

### Phase 1: Types + Position Store

**1.1 Create `src/types/movement3d.ts`**
```typescript
export interface Vector3D {
  x: number
  y: number
  z: number
}

export interface GuineaPig3DState {
  worldPosition: Vector3D
  targetPosition: Vector3D | null
  rotation: number              // Y-axis rotation (radians)
  isMoving: boolean
  currentPath: Vector3D[]       // Waypoints to target
}

export interface CircleObstacle {
  id: string
  center: Vector3D
  radius: number
  type: string                  // 'food_bowl', 'water_bottle', etc.
}
```

**1.2 Create `src/stores/movement3DStore.ts`**
```typescript
export const useMovement3DStore = defineStore('movement3D', () => {
  // Guinea pig positions in world coordinates
  const guineaPigStates = ref<Map<string, GuineaPig3DState>>(new Map())

  // Obstacles derived from habitatConditions.itemPositions
  const obstacles = ref<CircleObstacle[]>([])

  // World bounds (from GRID_CONFIG)
  const worldBounds = { minX: -21, maxX: 21, minZ: -15, maxZ: 15 }

  // Coordinate conversion
  function gridToWorld(col: number, row: number): Vector3D
  function worldToGrid(x: number, z: number): { col: number, row: number }

  // Position management
  function initializeGuineaPig(id: string, startPosition: Vector3D): void
  function updatePosition(id: string, position: Vector3D): void
  function setTarget(id: string, target: Vector3D | null): void

  // Obstacle management
  function syncObstaclesFromHabitat(): void  // Read from habitatConditions
})
```

---

### Phase 2: Circle-Based Pathfinding

**2.1 Create `src/composables/3d/use3DPathfinding.ts`**

Port algorithm from `guinea-pig-sim-demo-backup.html` (lines 732-790):

```typescript
export function use3DPathfinding() {
  const movement3DStore = useMovement3DStore()

  // Check if line segment intersects circle
  function lineIntersectsCircle(
    start: Vector3D,
    end: Vector3D,
    circle: CircleObstacle
  ): { intersects: boolean, point?: Vector3D }

  // Find waypoint around obstacle
  function getAvoidanceWaypoint(
    start: Vector3D,
    end: Vector3D,
    obstacle: CircleObstacle
  ): Vector3D

  // Main pathfinding - returns array of waypoints
  function calculatePath(start: Vector3D, end: Vector3D): Vector3D[] {
    // 1. Check direct path for obstacles
    // 2. If blocked, find avoidance waypoint
    // 3. Recursively check path segments
    // 4. Return waypoint array
  }

  return { calculatePath }
}
```

**Obstacle Radii (world units):**
| Item Type | Radius |
|-----------|--------|
| Food bowl | 1.5 |
| Water bottle | 1.5 |
| Shelter/Igloo | 4.0 |
| Tunnel | 3.0 |
| Bed/Hideout | 2.5 |
| Default | 1.5 |

---

### Phase 3: Movement Controller

**3.1 Create `src/composables/3d/use3DMovement.ts`**

```typescript
export function use3DMovement(guineaPigId: string) {
  const movement3DStore = useMovement3DStore()
  const pathfinding = use3DPathfinding()
  const gameController = useGameController()

  let animationFrameId: number | null = null
  let arrivalCallback: (() => void) | null = null

  const MOVE_SPEED = 4.0  // World units per second

  // Move to destination with pathfinding
  function moveTo(destination: Vector3D): boolean {
    const state = movement3DStore.guineaPigStates.get(guineaPigId)
    if (!state) return false

    const path = pathfinding.calculatePath(state.worldPosition, destination)
    state.currentPath = path
    state.targetPosition = destination
    state.isMoving = true

    startAnimationLoop()
    return true
  }

  // Wander to random nearby point
  function wander(maxDistance = 8): boolean {
    const state = movement3DStore.guineaPigStates.get(guineaPigId)
    if (!state) return false

    const angle = Math.random() * Math.PI * 2
    const distance = Math.random() * maxDistance + 2
    const target: Vector3D = {
      x: clamp(state.worldPosition.x + Math.cos(angle) * distance, -21, 21),
      y: 0,
      z: clamp(state.worldPosition.z + Math.sin(angle) * distance, -15, 15)
    }

    return moveTo(target)
  }

  // RAF animation loop
  function startAnimationLoop() {
    let lastTime = performance.now()

    function animate(currentTime: number) {
      if (!gameController.isGameActive) {
        animationFrameId = requestAnimationFrame(animate)
        return
      }

      const deltaTime = (currentTime - lastTime) / 1000
      lastTime = currentTime

      const state = movement3DStore.guineaPigStates.get(guineaPigId)
      if (!state || !state.isMoving) return

      // Move toward current waypoint
      const waypoint = state.currentPath[0]
      if (waypoint) {
        const dx = waypoint.x - state.worldPosition.x
        const dz = waypoint.z - state.worldPosition.z
        const distance = Math.sqrt(dx * dx + dz * dz)

        if (distance < 0.5) {
          // Reached waypoint, move to next
          state.currentPath.shift()
          if (state.currentPath.length === 0) {
            // Reached destination
            state.isMoving = false
            state.targetPosition = null
            arrivalCallback?.()
            return
          }
        } else {
          // Move toward waypoint
          const moveDistance = MOVE_SPEED * deltaTime
          const ratio = Math.min(moveDistance / distance, 1)
          state.worldPosition.x += dx * ratio
          state.worldPosition.z += dz * ratio
          state.rotation = Math.atan2(dx, dz)
        }
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    animationFrameId = requestAnimationFrame(animate)
  }

  function onArrival(callback: () => void) {
    arrivalCallback = callback
  }

  function stopMovement() {
    if (animationFrameId) cancelAnimationFrame(animationFrameId)
    const state = movement3DStore.guineaPigStates.get(guineaPigId)
    if (state) state.isMoving = false
  }

  function cleanup() {
    stopMovement()
    arrivalCallback = null
  }

  return { moveTo, wander, onArrival, stopMovement, cleanup }
}
```

---

### Phase 4: Hunger Behavior Loop

**4.1 Create `src/composables/3d/use3DHungerBehavior.ts`**

```typescript
export function use3DHungerBehavior(guineaPigId: string) {
  const movement = use3DMovement(guineaPigId)
  const guineaPigStore = useGuineaPigStore()
  const habitatConditions = useHabitatConditions()
  const movement3DStore = useMovement3DStore()
  const gameController = useGameController()

  const HUNGER_THRESHOLD = 70  // Seek food when hunger drops below this
  const EATING_TIME = 3000     // ms to eat

  let behaviorInterval: number | null = null
  let isEating = false

  function getGuineaPig() {
    return guineaPigStore.collection.guineaPigs[guineaPigId]
  }

  function findFoodBowl(): Vector3D | null {
    const foodItems = Object.values(habitatConditions.itemPositions)
      .filter(item => item.item?.category === 'food')

    if (foodItems.length === 0) return null

    const item = foodItems[0]
    return movement3DStore.gridToWorld(item.position.col, item.position.row)
  }

  function tick() {
    if (!gameController.isGameActive) return
    if (isEating) return

    const gp = getGuineaPig()
    if (!gp) return

    const state = movement3DStore.guineaPigStates.get(guineaPigId)
    if (!state) return

    // Already moving? Wait for arrival
    if (state.isMoving) return

    // Check hunger
    if (gp.needs.hunger < HUNGER_THRESHOLD) {
      // Find and go to food
      const foodPosition = findFoodBowl()
      if (foodPosition) {
        movement.moveTo(foodPosition)
        movement.onArrival(() => {
          // Eat when arrived
          isEating = true
          setTimeout(() => {
            guineaPigStore.updateNeed(guineaPigId, 'hunger', 100)
            isEating = false
          }, EATING_TIME)
        })
      }
    } else {
      // Not hungry, wander randomly
      movement.wander()
    }
  }

  function start() {
    behaviorInterval = window.setInterval(tick, 2000)  // Check every 2 seconds
  }

  function stop() {
    if (behaviorInterval) clearInterval(behaviorInterval)
    movement.cleanup()
  }

  return { start, stop, tick }
}
```

---

### Phase 5: Sync + Integration

**5.1 Modify `src/composables/use3DSync.ts`**

Add option to read from movement3DStore:

```typescript
export function use3DSync(worldGroup, options: { use3DMovement?: boolean } = {}) {
  const movement3DStore = useMovement3DStore()

  if (options.use3DMovement) {
    // Watch movement3DStore positions
    watch(
      () => Array.from(movement3DStore.guineaPigStates.entries()),
      (states) => {
        for (const [id, state] of states) {
          const model = guineaPigModels.get(id)
          if (model) {
            model.position.set(state.worldPosition.x, 0, state.worldPosition.z)
            model.rotation.y = state.rotation
          }
        }
      },
      { deep: true }
    )
  }
  // ... existing grid-based sync code
}
```

**5.2 Update `Habitat3DDebug.vue`**

```typescript
// In setup
const movement3DStore = useMovement3DStore()

// When guinea pigs become active
watch(() => guineaPigStore.activeGuineaPigs, (guineaPigs) => {
  for (const gp of guineaPigs) {
    // Initialize position at random location
    const startPos = {
      x: Math.random() * 20 - 10,
      y: 0,
      z: Math.random() * 14 - 7
    }
    movement3DStore.initializeGuineaPig(gp.id, startPos)

    // Start hunger behavior
    const behavior = use3DHungerBehavior(gp.id)
    behavior.start()
  }

  // Sync obstacles from habitat items
  movement3DStore.syncObstaclesFromHabitat()
})

// Call use3DSync with option
use3DSync(worldGroup, { use3DMovement: true })
```

---

## Coordinate System

From `GRID_CONFIG`:
- Grid: 14 columns x 10 rows
- Cell size: 3.0 world units
- World X range: -21 to +21
- World Z range: -15 to +15
- Origin: grid center (col 7, row 5)

**Conversion:**
```typescript
function gridToWorld(col: number, row: number): Vector3D {
  return {
    x: (col - 7) * 3.0,
    y: 0,
    z: (row - 5) * 3.0
  }
}
```

---

## Critical Files

| File | Purpose |
|------|---------|
| `src/guinea-pig-sim-demo-backup.html` | Reference for pathfinding (lines 732-790) |
| `src/composables/use3DSync.ts` | Needs modification for 3D positions |
| `src/constants/3d.ts` | GRID_CONFIG for coordinate conversion |
| `src/stores/habitatConditions.ts` | Item positions for food bowl + obstacles |
| `src/stores/guineaPigStore.ts` | Guinea pig needs data |

---

## Implementation Order

**Step 0: Documentation**
- Create `docs-3d/phase3.5/` folder
- Save this plan as `README.md` in that folder

**Step 1: Types + Store**
- Create `src/types/movement3d.ts`
- Create `src/stores/movement3DStore.ts`

**Step 2: Pathfinding**
- Create `src/composables/3d/use3DPathfinding.ts`

**Step 3: Movement**
- Create `src/composables/3d/use3DMovement.ts`

**Step 4: Hunger Behavior**
- Create `src/composables/3d/use3DHungerBehavior.ts`

**Step 5: Integration**
- Modify `src/composables/use3DSync.ts`
- Modify `src/components/debug/environment/Habitat3DDebug.vue`

---

## Testing Checklist

1. [X] Guinea pig appears in 3D habitat on game start
2. [X] Guinea pig wanders randomly when not hungry
3. [ ] Hunger decreases over time (existing decay)
4. [ ] When hunger < 70, guinea pig navigates to food bowl
5. [ ] Path goes around obstacles, not through them
6. [ ] Guinea pig eats at food bowl (3 seconds)
7. [ ] After eating, hunger resets to 100
8. [X] Game pause stops movement, resume continues
9. [X] Multiple guinea pigs move independently
