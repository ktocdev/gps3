# Phase 3: Hybrid Pathfinding System

**Status:** 📋 Planning
**Priority:** HIGH - Critical for proper 3D movement
**Created:** December 6, 2025
**Goal:** Implement a hybrid pathfinding system that works naturally in both 2D and 3D views

---

## 📋 Overview

After analyzing the HTML demo (`src/guinea-pig-sim-demo-backup.html`) and comparing it with our current grid-based system, we've identified a fundamental mismatch:

- **2D View:** Works well with discrete grid cells (14×10)
- **3D View:** Needs continuous world coordinates with radius-based collision
- **HTML Demo Success:** Used invisible collision spheres with gaps for entrances

The solution is a **hybrid approach** that maintains the 2D grid for game logic while adding proper 3D collision detection for visual realism.

---

## 🔍 Problem Analysis

### Current System Issues

1. **Grid-Based Pathfinding Limitations**
   - Shelters are treated as rectangular blocks
   - No way to represent curved walls or circular obstacles
   - Entrance logic is cell-based, not directional
   - Movement looks "blocky" in 3D

2. **HTML Demo Success Factors**
   ```javascript
   // From guinea-pig-sim-demo-backup.html (lines 756-757)
   const obstacles = [
     { pos: bowlPos, radius: avoidanceRadius },
     { pos: iglooPos, radius: iglooAvoidanceRadius },
     ...archObstacles  // Ring of collision spheres
   ];
   ```
   - Radius-based collision detection
   - Invisible collision spheres around walls
   - Natural gaps for entrances
   - Smooth waypoint navigation

3. **Scale Mismatches**
   - 3D models are 2× scaled from original
   - Grid cells (3.0 units) vs model sizes
   - Guinea pig emoji vs 3D model proportions

---

## 🎯 Hybrid Solution Design

### Core Principle
**"Grid for Logic, Spheres for Physics"**

Keep the 2D grid system for:
- Game state and behavior logic
- Item placement validation
- High-level pathfinding (A*)
- Save/load consistency

Add 3D collision layer for:
- Smooth movement in 3D view
- Realistic obstacle avoidance
- Natural entrance/exit behavior
- Visual polish

### Architecture

```
┌─────────────────────────────────────────┐
│         Behavior System (2D)            │
│    (Motivation, Needs, Decisions)       │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│      Grid Pathfinding (A* Algorithm)    │
│         14×10 Grid Cells                │
└────────────────┬────────────────────────┘
                 │
        ┌────────┴────────┐
        ▼                 ▼
┌──────────────┐  ┌──────────────────────┐
│   2D View    │  │   Path Converter     │
│   (Emojis)   │  │  (Grid → Waypoints)  │
└──────────────┘  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │  3D Collision Layer  │
                  │ (Radius-based checks)│
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │   3D View Animation  │
                  │  (Smooth movement)   │
                  └──────────────────────┘
```

---

## 📐 Implementation Plan

### Phase 1: Item Collision Definitions

**New file:** `src/constants/itemCollisions.ts`

```typescript
interface CollisionSphere {
  offset: THREE.Vector3  // Relative to item position
  radius: number         // Collision radius
}

interface ItemCollisionData {
  id: string

  // For 2D grid
  gridSize: { width: number; height: number }
  blockedCells: GridPosition[]  // Which cells block movement

  // For 3D collision
  collisionSpheres: CollisionSphere[]

  // Entrances (for shelters)
  entrances?: {
    gridCells: GridPosition[]           // For 2D pathfinding
    worldPoint: THREE.Vector3           // For 3D approach
    approachDirection: THREE.Vector3    // Direction to face
  }[]
}

// Example: Igloo definition
const IGLOO_COLLISION: ItemCollisionData = {
  id: 'habitat_plastic_igloo',
  gridSize: { width: 2, height: 2 },
  blockedCells: [
    { col: 0, row: 0 }, { col: 1, row: 0 },
    { col: 0, row: 1 }, { col: 1, row: 1 }
  ],

  // Ring of collision spheres around dome
  collisionSpheres: [
    // Leave gap at front for entrance
    { offset: new Vector3(-1.5, 0, 0), radius: 0.8 },
    { offset: new Vector3(-1.0, 0, -1.5), radius: 0.8 },
    { offset: new Vector3(0, 0, -2.0), radius: 0.8 },
    { offset: new Vector3(1.0, 0, -1.5), radius: 0.8 },
    { offset: new Vector3(1.5, 0, 0), radius: 0.8 },
    // Gap here for entrance (south side)
  ],

  entrances: [{
    gridCells: [{ col: 0, row: 2 }],  // Cell south of igloo
    worldPoint: new Vector3(0, 0, 2.5),
    approachDirection: new Vector3(0, 0, -1)
  }]
}
```

### Phase 2: 3D Collision Detection

**New file:** `src/composables/use3DCollision.ts`

Port the collision detection from HTML demo:

```typescript
export function use3DCollision() {
  const obstacles: CollisionObstacle[] = []

  // Build obstacle list from item positions
  function updateObstacles() {
    obstacles.length = 0

    // Add collision spheres for each item
    for (const [itemId, position] of itemPositions) {
      const collisionData = getItemCollisionData(itemId)

      for (const sphere of collisionData.collisionSpheres) {
        obstacles.push({
          pos: gridToWorld(position).add(sphere.offset),
          radius: sphere.radius,
          itemId
        })
      }
    }
  }

  // Check if a world position collides
  function checkCollision(worldPos: Vector3, radius = 0.5): boolean {
    for (const obstacle of obstacles) {
      const dist = worldPos.distanceTo(obstacle.pos)
      if (dist < obstacle.radius + radius) {
        return true
      }
    }
    return false
  }

  // Find safe waypoint around obstacle
  function getWaypointAround(
    start: Vector3,
    end: Vector3,
    obstacle: CollisionObstacle
  ): Vector3 {
    // Port logic from HTML demo lines 778-784
    const toObstacle = obstacle.pos.clone().sub(start)
    const perpendicular = new Vector3(-toObstacle.z, 0, toObstacle.x)
    perpendicular.normalize()

    return obstacle.pos.clone()
      .add(perpendicular.multiplyScalar(obstacle.radius + 0.5))
  }
}
```

### Phase 3: Path Conversion & Smoothing

**Update:** `src/composables/use3DSync.ts`

```typescript
// Convert grid path to smooth world waypoints
function gridPathToWorldWaypoints(gridPath: GridPosition[]): Vector3[] {
  const waypoints: Vector3[] = []

  for (let i = 0; i < gridPath.length; i++) {
    const worldPos = gridToWorld(gridPath[i])

    // Check if we need to navigate around obstacles
    if (i > 0) {
      const prevWorld = gridToWorld(gridPath[i - 1])
      const obstacle = findBlockingObstacle(prevWorld, worldPos)

      if (obstacle) {
        // Add waypoint to navigate around
        const waypoint = getWaypointAround(prevWorld, worldPos, obstacle)
        waypoints.push(waypoint)
      }
    }

    waypoints.push(worldPos)
  }

  // Apply bezier smoothing for natural movement
  return applySmoothingCurve(waypoints)
}
```

### Phase 4: Entrance Mechanics

Special handling for shelter entrances:

```typescript
function handleShelterApproach(
  guineaPigPos: Vector3,
  shelter: ItemCollisionData,
  targetInside: boolean
): Vector3[] {
  const entrance = shelter.entrances[0]
  const waypoints: Vector3[] = []

  if (targetInside) {
    // Approach entrance from outside
    waypoints.push(entrance.worldPoint.clone()
      .add(entrance.approachDirection.multiplyScalar(2)))

    // Move to entrance
    waypoints.push(entrance.worldPoint)

    // Enter shelter
    waypoints.push(entrance.worldPoint.clone()
      .sub(entrance.approachDirection.multiplyScalar(2)))
  } else {
    // Exit through entrance
    waypoints.push(entrance.worldPoint)

    // Move away from entrance
    waypoints.push(entrance.worldPoint.clone()
      .add(entrance.approachDirection.multiplyScalar(2)))
  }

  return waypoints
}
```

### Phase 5: Scale Reconciliation

Standardize sizing across 2D and 3D:

```typescript
// Constants for unified scale
const SCALE_CONFIG = {
  GRID_CELL_SIZE: 3.0,      // World units per grid cell
  GUINEA_PIG_RADIUS: 0.5,   // Collision radius
  EMOJI_SCALE: 1.0,         // 1 emoji = 1 grid cell
  MODEL_SCALE: 0.5,         // Scale down 3D models by half
}

// Item sizes in grid cells (matching 3D proportions)
const ITEM_SIZES = {
  'igloo': { width: 2, height: 2 },     // Dome takes 2×2
  'tunnel': { width: 3, height: 1 },    // Archway takes 3×1
  'bowl': { width: 1, height: 1 },      // Single cell
  'water_bottle': { width: 1, height: 1 } // Wall-mounted
}
```

---

## 🚀 Migration Strategy

### Step 1: Parallel Implementation
- Keep existing grid pathfinding working
- Add collision layer alongside
- Test in development with feature flag

### Step 2: Gradual Integration
- Start with simple items (bowls)
- Add igloos with entrances
- Implement tunnels
- Test each item type thoroughly

### Step 3: Polish & Optimization
- Fine-tune collision radii
- Adjust movement speeds
- Add animation transitions
- Performance profiling

---

## 📊 Comparison with Previous Approaches

| Aspect | Pure Grid | Pure 3D Physics | Hybrid (This) |
|--------|-----------|-----------------|---------------|
| **2D View Quality** | ✅ Perfect | ❌ Overkill | ✅ Perfect |
| **3D View Quality** | ❌ Blocky | ✅ Perfect | ✅ Natural |
| **Code Complexity** | ✅ Simple | ❌ Very Complex | ⭐ Moderate |
| **Performance** | ✅ Excellent | ❌ Heavy | ✅ Good |
| **Maintenance** | ✅ Easy | ❌ Hard | ⭐ Reasonable |
| **Entrance Handling** | ❌ Cell-based | ✅ Natural | ✅ Natural |
| **Future Extensibility** | ❌ Limited | ✅ Unlimited | ✅ Good |

---

## ✅ Success Criteria

1. **Guinea pigs navigate naturally in 3D**
   - Smooth curves around obstacles
   - No walking through walls
   - Natural entrance/exit from shelters

2. **2D view remains unchanged**
   - Grid movement still works
   - Behavior logic unaffected
   - Performance maintained

3. **Maintainable codebase**
   - Clear separation of concerns
   - Well-documented collision data
   - Easy to add new items

4. **Consistent scale**
   - Items proportional in both views
   - Guinea pig size matches
   - Collision bounds accurate

---

## 🔗 References

- [HTML Demo Analysis](../../src/guinea-pig-sim-demo-backup.html) - Lines 732-790 (calculatePath), 608-624 (obstacles)
- [Current Grid Pathfinding](../../src/composables/game/usePathfinding.ts)
- [3D Position Sync](../../src/composables/use3DSync.ts)
- [Deferred Grid-Only Approach](./pathfinding-and-collision-DEFERRED.md)

---

## 📅 Timeline Estimate

- **Phase 1:** Item Collision Definitions - 2 hours
- **Phase 2:** 3D Collision Detection - 3 hours
- **Phase 3:** Path Conversion - 2 hours
- **Phase 4:** Entrance Mechanics - 3 hours
- **Phase 5:** Scale Reconciliation - 1 hour
- **Testing & Polish:** 3 hours
- **Total:** ~14 hours

---

**Last Updated:** December 6, 2025