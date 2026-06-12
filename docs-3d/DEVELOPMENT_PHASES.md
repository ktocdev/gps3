# 3D Development Phases

> **Current Phase:** Phase 4 - Movement Polish & Animation (Next)
> **Navigation:** [← Back to Project Plan](PROJECT_PLAN.md)

---

## Phase Status Overview

| Phase | Status | Goal | Milestone |
|-------|--------|------|-----------|
| **Phase 1** | ✅ Complete | Basic 3D scene with guinea pig movement | Guinea pigs move in 3D in real-time |
| **Phase 2** | ✅ Complete | Items & interactions | Full 3D habitat with all items visible |
| **Phase 3** | ⚠️ Partially Complete | Full playability + pathfinding | Complete guinea pig care in 3D |
| **Phase 4** | 🚫 Blocked | Movement polish & animation | Movement quality matches demo |
| **Phase 5** | 📋 Planned | Polish & parity | Full 2D feature parity + polish |

⚠️ **IMPORTANT:** Phase 3 interactions are complete, but **pathfinding & collision** must be finished before Phase 4.
Without fixing fundamental movement issues (clipping through items/walls), adding animations will look broken.

---

## Phase 1: MVP - Basic 3D Scene ✅

**Status:** Complete
**Completed:** November 29, 2025

### Completed Features

- Three.js integration with Vue 3
- Grid-to-3D coordinate mapping (14x10 grid → Vector3)
- Guinea pig 3D model (ported from demo)
- Real-time position sync from `habitatConditions` store
- Camera system (orbit controls: drag, scroll, keyboard)
- Basic environment (floor, walls, lighting, sky)
- Guinea pigs face movement direction
- Floor scaled to match guinea pig proportions (CELL_SIZE: 3.0 units)

### Technical Implementation

**Composables Created:**
- `use3DScene.ts` - Scene, camera, renderer, lighting
- `use3DCamera.ts` - Mouse/keyboard/touch controls
- `use3DSync.ts` - Position sync and rotation
- `use3DGuineaPig.ts` - 3D model creation

**Key Technical Decisions:**
- CELL_SIZE = 3.0 units (increased from 1.0 to match guinea pig scale)
- Camera position: (10, 15, 30) for good viewing angle
- Floor: 42×30 units (14 cols × 10 rows × 3 units/cell)
- Walls: 2.0 units tall
- Shadow map: 2048×2048 for quality

**Documentation:**
- [threejs-integration.md](phase1/threejs-integration.md)
- [coordinate-mapping.md](phase1/coordinate-mapping.md)
- [guinea-pig-model.md](phase1/guinea-pig-model.md)
- [camera-system.md](phase1/camera-system.md)

---

## Phase 2: Items & Interactions ✅

**Status:** Complete
**Started:** November 29, 2025
**Completed:** November 30, 2025

### Goals

Add all habitat items to 3D scene and enable basic interactions:
1. All 2D habitat items have 3D models
2. Items positioned correctly from game state
3. Poop visualization and cleanup
4. Basic raycasting for interactions

### Item Mapping Strategy

| Item Type | 3D Model Source | Notes |
|-----------|----------------|-------|
| Bowls (all types) | Demo bowl model | Reuse for all bowl items |
| Shelters (all types) | Demo igloo model | Reuse for all shelter items |
| Water bottles | Demo water bottle | Mounted on wall/edge |
| Beds | **New flat mat model** | Create simple flat rectangle |
| Toys (stick, ball) | Demo stick/ball | Use existing models |
| Other items | Cube placeholder | Simple colored cubes |
| Poop pellets | Small brown sphere | Click to remove |

### Implementation Tasks

**Priority 1: Camera Controls** ✅ Complete
- [x] Mouse drag to rotate world
- [x] Scroll or Z/X keys for camera up/down
- [x] Arrow keys to pan camera
- [x] Touch support for mobile

**Priority 2: Habitat Items** ✅ Complete
1. **Create `src/composables/use3DItems.ts`:** ✅
   - [x] Watch `habitatConditions.itemPositions`
   - [x] Create/remove 3D models as items change
   - [x] Map item types to appropriate models
   - [x] Handle position updates

2. **Extract Models from Demo:** ✅
   - [x] Copy bowl, igloo, water bottle, stick, ball model creation
   - [x] Adapt to match composable pattern
   - [x] Enhanced models with hay, food, and wood textures
   - [x] Smart water bottle rotation (corners + edges)

3. **Create Flat Mat Model:** ✅
   - [x] Simple PlaneGeometry with soft material
   - [x] Slightly raised from ground (0.04 units)
   - [x] Scale to match bed size in grid cells

4. **Poop Pellet System:** ✅
   - [x] Small brown SphereGeometry in `use3DPoop.ts`
   - [x] Watch `habitatConditions.poopPellets` Map
   - [x] Add click detection (raycasting)
   - [x] On click → call store's remove poop function

**Priority 3: Code Organization** (Next)
5. **Refactor Item Models for Scalability:**
   - See [3D Item Models Refactoring Plan](phase3/3D-ITEM-MODELS-REFACTORING.md)
   - Current: All models in single 778-line file
   - Goal: Organized folder structure for 100+ items
   - Structure: Separate files by category (food, containers, shelters, toys, bedding)
   - Benefits: Better maintainability, team collaboration, testability

### Testing Checklist

- [x] All item types appear in correct positions
- [x] Items update when added/removed in 2D
- [x] Poop pellets appear and disappear correctly
- [x] Click on poop removes it from scene and store
- [x] Water bottles rotate correctly based on wall position
- [x] Bowl contents render correctly (hay, food)
- [x] Enhanced models with textures and details

### Success Criteria

✅ **Phase 2 Complete** - All criteria met:
1. ✅ All 2D habitat items visible in 3D
2. ✅ Items sync correctly with game state changes
3. ✅ Poop cleanup works by clicking
4. ✅ Enhanced models with realistic details

**Files Created:**
- ✅ `src/composables/use3DItems.ts`
- ✅ `src/composables/use3DPoop.ts`
- ✅ `src/composables/use3DTextures.ts`

**Files Modified:**
- ✅ `src/components/debug/environment/Habitat3DDebug.vue`
- ✅ `src/constants/3d.ts` (added ITEM_CONFIG)

**Documentation:**
- [3D Item Models Refactoring Plan](phase3/3D-ITEM-MODELS-REFACTORING.md) - Future scalability
- `item-models.md` (planned)
- `interactions.md` (planned)

---

## Phase 3: Full Playability ✅ ⭐

**Status:** Complete
**Started:** November 30, 2025
**Completed:** November 30, 2025
**Goal:** Complete playable 3D game with minimal guinea pig care

### Completed Goals

Make the 3D view fully playable:
1. ✅ Click guinea pig to select
2. ✅ Floating action buttons for interactions
3. ✅ Button triggers call existing autonomy functions
4. ✅ Poop cleanup interaction

### Features

#### 3.1 Guinea Pig Selection ✅

**Goal:** Click guinea pig to select, show selection indicator

**Completed Implementation:**
- ✅ Raycasting on canvas click
- ✅ Detect guinea pig model hits
- ✅ Add selection ring to selected model (pulsing green ring)
- ✅ Store selected guinea pig ID in component state
- ✅ Display selected guinea pig name in UI

---

#### 3.2 Floating Action Buttons ✅

**Goal:** Trigger existing autonomy functions from 3D view

**Implemented Buttons:**
- ✅ Feed (opens food selection) - 🥕 icon
- ✅ Give Water - 💧 icon
- ✅ Play - 🎾 icon
- ✅ Pet - 💚 icon
- ✅ Deselect - ❌ icon

**Completed Implementation:**

1. **Using `FloatingActionButton` component:** ✅
   - ✅ Imported from `src/components/basic/FloatingActionButton.vue`
   - ✅ Created multiple instances in `Habitat3DDebug.vue`
   - ✅ Positioned in bottom-right corner
   - ✅ Each button has appropriate icon, label, and variant

2. **Wired to Existing Functions:** ✅
   - ✅ Uses same functions as AutonomyDebug component
   - ✅ Passes selected guinea pig ID
   - ✅ Shows feedback when action triggered
   - ✅ All buttons disabled when no guinea pig selected
   - ✅ Buttons only visible when guinea pig is selected

---

#### 3.3 Poop Cleanup Interaction ✅

**Goal:** Click poop to remove (same as 2D)

**Completed Implementation:**
- ✅ Raycasting on canvas click
- ✅ Detect poop pellet hits
- ✅ Call `habitatConditions.removePoop(poopId)`
- ✅ Visual feedback (pellet disappears)

**Integration:**
- ✅ Added to click handler in Habitat3DDebug.vue
- ✅ Checks if ray intersects poop model first, then guinea pig

---

### Testing Checklist

- [x] Click on guinea pig shows selection indicator
- [x] Action buttons appear when guinea pig selected (Feed, Water, Play, Pet, Deselect)
- [x] Feed button triggers food selection (same as 2D)
- [x] Other action buttons trigger correct behaviors
- [x] Buttons disabled when no selection
- [x] Click on poop removes it from scene and store

### Phase 3A: Interactions ✅ COMPLETE

**Success Criteria Met:**
1. ✅ Can select guinea pig and trigger basic care actions
2. ✅ All floating action buttons work (Feed, Water, Play, Pet, Deselect)
3. ✅ 3D view remains fully synced with 2D state changes
4. ✅ Poop cleanup works by clicking

**Files Modified:**
- ✅ `src/components/debug/environment/Habitat3DDebug.vue` - Added FloatingActionButton instances
- ✅ Raycasting for guinea pig and poop selection
- ✅ Selection ring with pulsing animation

**Components Used:**
- ✅ `src/components/basic/FloatingActionButton.vue` - Used for all action buttons

**Documentation:**
- [3D Item Models Refactoring](phase3/item-models-refactoring.md) - Scalability for 100+ items
- [UI Controls Plan](phase3/ui-controls-plan.md) - Floating action button UI system

---

### Phase 3B: Pathfinding & Collision 🚨 HIGH PRIORITY

**Status:** Not Started
**Priority:** HIGH - Blocks Phase 4
**Goal:** Fix fundamental movement and positioning issues

**Critical Issues:**
- ❌ Guinea pigs walk through items (bowls, igloos, etc.)
- ❌ Guinea pigs enter shelters through walls instead of openings
- ❌ Guinea pigs don't align with bowls/water bottles during interactions
- ❌ Guinea pigs appear outside habitat walls when near edges
- ❌ Poop can spawn outside habitat boundaries

**Why This Blocks Phase 4:**
Adding smooth animations to guinea pigs that walk through walls will make the problems MORE visible and jarring. These fundamental issues must be fixed first.

**Detailed Documentation:** [Pathfinding & Collision System](phase3/pathfinding-and-collision.md)

**Success Criteria:**
1. ✅ Guinea pigs navigate around all items (no clipping)
2. ✅ Shelters only entered through designated openings
3. ✅ Guinea pigs face bowls while eating
4. ✅ Guinea pigs align with water bottle spout while drinking
5. ✅ Guinea pigs always stay within habitat walls
6. ✅ Poop only spawns within valid interior area
7. ✅ Item placement validates boundaries

**Files to Modify:**
- `src/composables/usePathfinding.ts` - Enhanced obstacle avoidance
- `src/composables/use3DSync.ts` - Position clamping, interaction alignment
- `src/composables/use3DPoop.ts` - Poop boundary validation
- `src/constants/3d.ts` - Habitat bounds and item sizes
- Model files - Add entrance metadata to shelters

---

## Phase 4: Movement Polish & Animation 🚫

**Status:** Blocked by Phase 3B (Pathfinding & Collision)
**Goal:** Smooth guinea pig movement like demo + visual enhancements

**Detailed Documentation:**
- [Movement & Visual Polish](phase4/movement-and-visual-polish.md) - Smooth movement + environment
- [Interaction Animations](phase4/interaction-animations.md) - Reactive animations for actions/conditions

### Current Issue

Movement is jerky (directly synced to 2D grid-based position updates). Need smooth interpolation like the demo.

### Features

#### 4.1 Position Interpolation (Lerping)

**Implementation:**
- Track target position (from 2D game state)
- Track current rendered position (interpolated)
- Lerp from current to target each frame
- Use appropriate lerp speed (e.g., 0.1-0.2)

**Changes to `use3DSync.ts`:**
```typescript
// Store both target and current positions
const targetPositions = new Map<string, THREE.Vector3>()
const currentPositions = new Map<string, THREE.Vector3>()

// In animation loop (called from Habitat3DDebug):
export function updateGuineaPigPositions(deltaTime: number) {
  guineaPigModels.forEach((model, guineaPigId) => {
    const target = targetPositions.get(guineaPigId)
    const current = currentPositions.get(guineaPigId)
    if (target && current) {
      // Lerp position
      current.lerp(target, 0.15) // Smooth interpolation
      model.position.copy(current)
    }
  })
}
```

### Visual Enhancements

In addition to movement polish, Phase 4 includes visual improvements:

1. **Sky with Clouds** - Gradient sky shader with animated cloud puffs
2. **Water Bottle Bubbles** - Rising bubbles when guinea pigs drink
3. **Hay Rack Model** - Proper 3D model based on reference image
4. **Wooden Tunnel Verification** - Ensure archway tunnel displays correctly

### Interaction & Condition Animations

Phase 4 also includes reactive animations for player actions and environmental changes:

1. **Guinea Pig Popcorn** - Jumping animation when excited
2. **Water Level Decrease** - Visible consumption as guinea pigs drink
3. **Hay Particle Effects** - Floating hay strands when eating
4. **Bedding Fluff Animation** - Puff effect when refreshing bedding
5. **Bedding Visual Quality** - Appearance changes based on freshness
6. **Cleaning Sparkles** - Visual feedback for cleaning actions

**See full details:**
- [Movement & Visual Polish](phase4/movement-and-visual-polish.md)
- [Interaction Animations](phase4/interaction-animations.md)

---

#### 4.2 Rotation Interpolation (Slerping)

**Implementation:**
- Track target rotation (from movement direction)
- Track current rotation
- Slerp rotation smoothly instead of instant snap
- Prevents jerky turning

**Changes to `use3DSync.ts`:**
```typescript
// Store target and current rotations
const targetRotations = new Map<string, number>()
const currentRotations = new Map<string, number>()

// Smooth rotation lerping
function lerpAngle(current: number, target: number, amount: number): number {
  // Handle angle wrapping (-π to π)
  let diff = target - current
  if (diff > Math.PI) diff -= Math.PI * 2
  if (diff < -Math.PI) diff += Math.PI * 2
  return current + diff * amount
}
```

---

#### 4.3 Walking Animation

**Goal:** Animate guinea pig body parts while moving (like demo)

**Animations to Add:**
1. **Feet Movement:**
   - Front feet alternate up/down while walking
   - Back feet alternate up/down (offset from front)
   - Feet stay still when guinea pig is idle

2. **Body Bobbing:**
   - Slight up/down movement while walking
   - Synchronized with foot movement
   - Adds weight/realism

3. **Nose Wiggle:**
   - Continuous subtle animation
   - Independent of movement
   - Already have nose in model (userData)

**Implementation:**

Add to `use3DSync.ts`:
```typescript
// Animation state per guinea pig
const animationStates = new Map<string, {
  walkCycle: number // 0 to 2π
  isMoving: boolean
}>()

// Update in animation loop
export function updateGuineaPigAnimations(deltaTime: number) {
  guineaPigModels.forEach((model, guineaPigId) => {
    const state = animationStates.get(guineaPigId)
    if (!state) return

    const { body, feet, nose } = model.userData

    if (state.isMoving) {
      // Increment walk cycle
      state.walkCycle += deltaTime * 8 // Walking speed

      // Feet movement (alternate)
      const footHeight = Math.abs(Math.sin(state.walkCycle)) * 0.15
      feet.frontLeft.position.y = footHeight
      feet.backRight.position.y = footHeight
      feet.frontRight.position.y = Math.abs(Math.sin(state.walkCycle + Math.PI)) * 0.15
      feet.backLeft.position.y = Math.abs(Math.sin(state.walkCycle + Math.PI)) * 0.15

      // Body bobbing
      body.position.y = Math.abs(Math.sin(state.walkCycle * 2)) * 0.05
    } else {
      // Reset feet when idle
      feet.frontLeft.position.y = 0
      feet.frontRight.position.y = 0
      feet.backLeft.position.y = 0
      feet.backRight.position.y = 0
      body.position.y = 0
    }

    // Nose wiggle (always active)
    nose.rotation.y = Math.sin(Date.now() * 0.003) * 0.1
  })
}
```

### Testing Checklist

- [ ] Position transitions are smooth (no jerky jumps)
- [ ] Rotation transitions are smooth (no instant snaps)
- [ ] Guinea pigs walk smoothly across the habitat
- [ ] Front feet alternate properly while walking
- [ ] Back feet alternate properly while walking
- [ ] Body bobs subtly while walking
- [ ] Feet/body reset when guinea pig stops
- [ ] Nose wiggles continuously
- [ ] Animations match demo quality

### Success Criteria

✅ **Phase 4 Complete** when:
1. Guinea pig position transitions are smooth (lerped)
2. Guinea pig rotation transitions are smooth (lerped angles)
3. Feet animate up/down while walking
4. Body bobs slightly while walking
5. Nose wiggles continuously
6. Movement quality matches demo smoothness

**Files to Modify:**
- `src/composables/use3DSync.ts` - Add interpolation and animation
- `src/composables/use3DGuineaPig.ts` - Store feet in userData
- `src/components/debug/environment/Habitat3DDebug.vue` - Call update functions in animation loop

---

## Phase 5: Polish & Parity 📋

**Status:** Not Started
**Goal:** Full feature parity with 2D game + polish

### Features

#### Advanced Animations
- Popcorn jump (vertical leap)
- Zoomies (fast running in circles)
- Social interactions (nose touch, grooming, following)
- Play animations (toy interactions)
- Eating animation (head down to bowl, chewing)
- Drinking animation (approach water bottle, head tilt)
- Sleeping animation (lie down, eyes close)

#### Particle Effects
- Dust clouds during movement
- Food particles when eating
- Hay strands falling
- Water droplets

#### Sound System
- Wheeks (guinea pig vocalizations)
- Chewing/crunching sounds
- Movement sounds (patter of feet)
- Ambient habitat sounds

#### Performance Optimization
- Instanced meshes for repeated objects
- Level of Detail (LOD) system
- Occlusion culling
- Texture atlases
- Efficient shadow maps

#### UI Overlays
- Selected guinea pig stats overlay
- Activity feed integration
- Inventory quick-access
- Time controls (pause/play/speed)

#### Mobile Refinement
- Touch gesture improvements
- Performance mode toggle
- Simplified graphics option
- Battery-saving mode

### Testing Checklist

- [ ] All 18 autonomous behaviors have animations
- [ ] Particle system implemented
- [ ] Sound system integrated
- [ ] Performance optimized for mobile
- [ ] Full 2D feature parity achieved

### Success Criteria

✅ **Phase 5 Complete** when:
1. All behaviors have appropriate animations
2. Particle effects enhance visual feedback
3. Sound system provides audio feedback
4. Performance is smooth on mobile devices
5. Full feature parity with 2D game achieved

---

## Implementation Notes

### General Principles

- Keep implementation simple - no over-engineering
- Reuse demo models where possible
- Use cube placeholders for unknown items
- All game logic remains in existing Pinia stores
- 3D view is pure visualization + input layer
- TypeScript strict mode must pass
- Build before committing changes

### Architecture

**Shared Components (2D + 3D):**
- Pinia stores: `guineaPigStore`, `habitatConditions`, `inventoryStore`, `gameController`, `needsController`
- Composables: `usePathfinding`, `useMovement`, `useGuineaPigBehavior`

**3D-Specific Components:**
- Composables: `use3DScene`, `use3DSync`, `use3DGuineaPig`, `use3DItems`, `use3DCamera`
- Views: `Habitat3DDebug.vue`
- Components: `Habitat3DControls.vue`

---

**Last Updated:** November 30, 2025 (Phase 3 Complete - Sprint Resume Milestone Achieved!)
