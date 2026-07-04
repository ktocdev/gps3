---
source: src/composables/3d/use3DPhysics.ts
source_hash: fe71ce41fb1a24f6c96f621579f51df738228df3bc2639aa81a5dcde909ca2e1
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# use3DPhysics Composable

`src/composables/3d/use3DPhysics.ts`

> A Vue composable that runs a lightweight 2D (X-Z plane) physics simulation for interactive habitat items (ball, stick, etc.) in a 3D scene. It bridges Three.js mesh objects with the physics and movement Pinia stores, handling velocity integration, guinea pig collisions, wall/obstacle bouncing, rolling animation, and click/push interactions.

### State
Maintains a local `meshRefs` Map keyed by item ID, each holding a `wrapper` (positioned Object3D) and `visual` (rotated Object3D) reference. Physics data (velocity, config, state) lives in `usePhysics3DStore`; world bounds, obstacles, and guinea pig positions come from `useMovement3DStore`.

### Registration
`initializePhysicsItem` adds the item to the physics store with a `PHYSICS_PRESETS` preset and stores its mesh refs. `removePhysicsItem` and `cleanup` reverse this.

### Update loop
`updatePhysics(deltaTime)` iterates all physics items (skipping `locked` ones):
1. Pushes items away from nearby guinea pigs within `collisionRadius` using `pushStrength`.
2. Integrates velocity into wrapper X/Z position.
3. Calls `applyRollingAnimation` to rotate the visual mesh based on velocity and the item's `rollAxis` ('perpendicular', 'x', or 'z').
4. Applies damping via the store.
5. `handleWallCollision` clamps to `worldBounds` minus a 0.8 margin and reflects velocity by `bounceMultiplier`.
6. `handleObstacleCollision` pushes items out of obstacle radii and reflects velocity along the collision normal (with a reduced bounce factor `1 - bounceMultiplier*0.4`).

Note: `deltaTime` (`_deltaTime`) is currently unused — physics is frame-based, not time-based.

### Interaction
`handleClick` adds velocity along a flattened ray direction scaled by `clickStrength`. `pushItem` adds an arbitrary directional velocity (used for guinea pig headbutts). Both skip locked items. `setPhysicsState`, `hasPhysics`, and `getMeshWrapper` are thin store/ref accessors.

### Helpers
`getGuineaPigPositions` collects world positions from movement store guinea pig states; `distance2D` computes X-Z distance; `applyRollingAnimation` uses quaternion-derived side vectors and `rotateOnAxis`/`rotateX`/`rotateZ` for rolling effects.

## Exports

- **use3DPhysics** (composable) — `use3DPhysics(): { initializePhysicsItem, removePhysicsItem, updatePhysics, handleClick, pushItem, setPhysicsState, hasPhysics, getMeshWrapper, cleanup }`: Returns physics control functions. `initializePhysicsItem(itemId, wrapper, visual, preset)` registers an item; `removePhysicsItem(itemId)` unregisters; `updatePhysics(deltaTime)` advances the sim once per frame; `handleClick(itemId, rayDirection)` applies click velocity; `pushItem(itemId, direction, strength=1.0)` applies directional velocity; `setPhysicsState(itemId, state)` sets 'free'|'controlled'|'locked'; `hasPhysics(itemId)` returns boolean; `getMeshWrapper(itemId)` returns the wrapper Object3D; `cleanup()` clears all refs and store items.

## Internal dependencies

- `three`
- `../../stores/physics3DStore`
- `../../stores/movement3DStore`
- `../../types/movement3d`
- `../../types/physics3d`

## Notes

- `deltaTime` parameter is accepted but ignored; physics integration is per-frame, not frame-rate independent.
- Movement is strictly on the X-Z plane; the Y component of velocity/position is never modified by the update loop.
- Wall margin (0.8), item radius (0.8), and rolling divisors (0.8, 0.12, 0.5) are hard-coded magic numbers.
- `meshRefs` is module-local per composable invocation; mesh objects are mutated directly (positions/rotations) as side effects rather than through the store.
- Obstacle collision reflection uses a modified bounce factor `(1 - bounceMultiplier*0.4)` distinct from the direct multiplier used for wall collisions.
