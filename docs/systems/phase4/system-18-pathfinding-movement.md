# System 18: Pathfinding & Movement

**Phase 4, Stage 2 - Intelligent Navigation & Smooth Movement**

**Time Estimate:** 6-8 hours

## Goal

Implement intelligent pathfinding and smooth movement around the habitat, enabling guinea pigs to navigate from point A to point B while avoiding obstacles.

## Dependencies

**Required Systems:**
- System 17: Visual Presence & Positioning (guinea pigs must be rendered first)
- Habitat grid system
- Habitat items with `blocksMovement` metadata

**Provides Foundation For:**
- System 19: Autonomous AI Behaviors (needs movement to reach items)
- System 21: Social Bonding System (needs movement for social interactions)

## Implementation Tasks

### Task 1: A* Pathfinding Algorithm

Implement efficient pathfinding for guinea pig navigation.

#### Pathfinding Interface

```typescript
interface GridPosition {
  row: number
  col: number
}

interface PathfindingOptions {
  start: GridPosition
  goal: GridPosition
  avoidOccupiedCells: boolean
  maxPathLength?: number
}

interface PathfindingResult {
  path: GridPosition[]
  distance: number
  success: boolean
}

export function findPath(options: PathfindingOptions): PathfindingResult
export function isValidPosition(position: GridPosition): boolean
export function getObstacles(): GridPosition[]
```

#### Core Features

**A* Algorithm:**
- Heuristic optimization (Manhattan distance)
- Priority queue for node exploration
- Efficient path reconstruction

**Obstacle Detection:**
- Habitat items with `blocksMovement: true`
- Habitat boundaries
- Other guinea pig positions (optional avoidance)
- Invalid grid cells

**Optimization:**
- Path caching for frequently used routes
- Dynamic path recalculation when obstacles change
- Early termination for blocked paths

#### Implementation

```typescript
// src/composables/game/usePathfinding.ts
export function usePathfinding() {
  const habitatItems = useHabitatItemsStore()
  const habitatConditions = useHabitatConditionsStore()

  function findPath(options: PathfindingOptions): PathfindingResult {
    // A* implementation
    // ... (full implementation details)
  }

  function isValidPosition(position: GridPosition): boolean {
    // Check boundaries
    // Check obstacles
    // Check occupied cells if needed
  }

  function getObstacles(): GridPosition[] {
    // Return all obstacle positions from habitat items
  }

  return {
    findPath,
    isValidPosition,
    getObstacles
  }
}
```

---

### Task 2: Movement Controller

Manage guinea pig movement along calculated paths.

#### Movement State Machine

```typescript
type MovementState = 'idle' | 'walking' | 'arrived' | 'blocked'

interface MovementController {
  currentPath: GridPosition[]
  currentStep: number
  movementState: MovementState
  targetPosition: GridPosition | null
  movementSpeed: number // cells per second
}

export function useMovement(guineaPigId: string) {
  function startMovement(path: GridPosition[]): void
  function updateMovement(deltaTime: number): void
  function stopMovement(): void
  function onArrival(callback: () => void): void
}
```

#### Features

**Movement Control:**
- Smooth CSS transition-based movement between grid cells
- Movement speed based on personality traits (curiosity affects speed)
- Direction facing (horizontal flip for left/right movement)
- Path following with step-by-step execution

**State Tracking:**
- Current position in path
- Movement progress
- Arrival callbacks

---

### Task 3: Random Wandering Behavior

Implement exploratory movement when no specific goal.

#### Wandering Logic

```typescript
interface WanderingConfig {
  minIdleTime: number      // 5 seconds
  maxIdleTime: number      // 10 seconds
  maxWanderDistance: number // 3-5 cells
  explorationMemory: number // last 5 positions
}

function selectWanderTarget(guineaPig: GuineaPig): GridPosition {
  // Select random valid destination
  // Influenced by curiosity personality trait
  // Avoid recent positions
  // Prefer unexplored areas for high curiosity
}
```

**Personality Influences:**
- High curiosity (7-10): More frequent wandering, longer distances
- Medium curiosity (4-6): Standard wandering frequency
- Low curiosity (1-3): Less frequent movement, shorter distances

---

### Task 4: Movement Animation System

Create smooth visual transitions for movement.

#### CSS Animation

```css
.guinea-pig-sprite {
  transition: transform 0.5s ease-in-out;
}

.guinea-pig-sprite--walking {
  /* Walking state visual - subtle bounce or animation */
}

.guinea-pig-sprite--facing-left {
  transform: scaleX(-1);
}
```

#### Animation Features

- CSS transforms for position changes
- Transition timing based on distance
- Walking state visual indicator
- Direction facing (flip horizontally for left movement)
- Arrival animation/state

---

### Task 5: Multi-Guinea Pig Coordination

Handle movement with multiple guinea pigs.

#### Coordination Features

**Collision Avoidance:**
- Detect when guinea pigs would collide
- Path adjustment when another guinea pig blocks route
- Wait behavior if destination temporarily occupied

**Priority System:**
- Urgent needs get movement priority
- Stagger movement start times to reduce conflicts
- Social proximity preferences (for bonded pairs - Stage 5)

---

## Files to Create/Modify

### New Files

```
src/composables/game/usePathfinding.ts - A* pathfinding implementation
src/composables/game/useMovement.ts - Movement controller logic
```

### Modified Files

```
src/components/game/habitat/GuineaPigSprite.vue - Add movement animation states
src/stores/habitatConditionsStore.ts - Track movement state, update positions
src/stores/gameTimingStore.ts - Add movement tick (optional)
```

---

## Testing & Validation

### Pathfinding Tests

- [x] Correctly finds paths around obstacles
- [x] Handles blocked paths gracefully (returns `success: false`)
- [x] Recalculates when obstacles change
- [x] Efficient performance with complex layouts
- [x] Path length is reasonable (not excessively long)

### Movement Tests

- [x] Smooth movement animation
- [x] Correct direction facing based on movement direction
- [x] Multiple guinea pigs don't overlap positions
- [x] Movement speed feels natural (not too fast/slow)
- [x] Arrival detection works correctly

### Wandering Tests

- [x] Random wandering creates natural exploration patterns
- [x] Guinea pigs don't get stuck in corners
- [x] Personality affects wandering frequency
- [x] Avoids repetitive back-and-forth movement

---

## Success Criteria

**Core Functionality:**
- [x] A* pathfinding correctly navigates around obstacles
- [x] Guinea pigs move smoothly between grid positions
- [x] Direction facing updates correctly during movement
- [x] Multiple guinea pigs avoid overlapping positions
- [x] Random wandering creates natural exploration patterns
- [x] Movement performance is smooth and efficient (60fps)

**Quality Standards:**
- [x] Pathfinding performance < 10ms for typical habitat
- [x] Movement animations smooth (CSS transitions)
- [x] Code follows project conventions
- [x] No visual glitches during movement

---

## Implementation Notes

### Movement Speed Calculation

```typescript
function calculateMovementSpeed(guineaPig: GuineaPig): number {
  const baseSp eed = 2 // cells per second
  const curiosityBonus = (guineaPig.personality.curiosity / 10) * 0.5
  return baseSpeed + curiosityBonus
}
```

### Direction Facing Logic

```typescript
function getDirectionFacing(from: GridPosition, to: GridPosition): 'left' | 'right' {
  return to.col < from.col ? 'left' : 'right'
}
```

### Position Update Timing

Two options for updating positions:
1. **Game timing tick** - Update every tick (consistent with game loop)
2. **requestAnimationFrame** - Smooth 60fps updates (recommended)

---

## Next Steps

After completing System 18:

1. **Test pathfinding** with complex habitat layouts
2. **Test movement** with 2 guinea pigs simultaneously
3. **Verify random wandering** feels natural
4. **Move to System 19:** [Autonomous AI Behaviors](system-19-autonomous-ai-behaviors.md)

System 19 will use pathfinding and movement to implement need-based autonomous behaviors.

---

## Related Documentation

- **Master Plan:** [phase-4-guinea-pig-integration-plan-full.md](phase-4-guinea-pig-integration-plan-full.md)
- **Previous System:** [system-17-visual-presence-positioning.md](system-17-visual-presence-positioning.md)
- **Next System:** [system-19-autonomous-ai-behaviors.md](system-19-autonomous-ai-behaviors.md)
