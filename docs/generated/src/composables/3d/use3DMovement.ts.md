---
source: src/composables/3d/use3DMovement.ts
source_hash: a0123580fb506e4526e33551b19596ca5d1d2fbb1ca4ea2b16d7bcf8902109f4
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# use3DMovement Composable

`src/composables/3d/use3DMovement.ts`

> A Vue composable that drives guinea pig movement in a 3D world using requestAnimationFrame-based animation. It coordinates pathfinding, waypoint following, smooth rotation, and wandering for a single guinea pig identified by ID, updating reactive state stored in the movement3DStore.

### Setup
The composable takes a `guineaPigId` and wires up `useMovement3DStore`, `useGameController`, and `use3DPathfinding`. It holds local (non-reactive) animation state: `animationFrameId`, `lastTime`, and an `arrivalCallback`, plus a reactive `isAnimating` ref.

### Movement flow
`moveTo` resolves a valid destination via `pathfinding.findNearestValidPosition`, computes an obstacle-avoiding path with `pathfinding.calculatePath`, writes `currentPath`/`targetPosition`/`isMoving` onto the store's guinea pig state, and starts the RAF loop. `moveDirectTo` bypasses pathfinding, setting a single-waypoint path (used for shelter entry/exit). `wander` picks a random angle and distance, clamps to world bounds via `movement3DStore.clampToBounds`, then delegates to `moveTo`.

### Animation loop
`startAnimationLoop` runs `animate` per frame. It computes `deltaTime`, re-fetches state each frame (state is reactive), stops if state is missing or not moving, and if `gameController.isGameActive` is false it keeps the loop alive but skips movement (pause behavior). It follows waypoints in `currentPath`: shifting waypoints once within `ARRIVAL_THRESHOLD` (0.5), moving `MOVE_SPEED` (4.0 units/sec) toward the next waypoint, and setting `rotation` via `Math.atan2(dx, dz)`. On reaching the final waypoint it clears movement state and fires the one-shot `arrivalCallback` (cleared before invocation to allow re-registration).

### Rotation
`rotateTo` returns a Promise, animating rotation with its own RAF loop using cubic ease-out over a configurable `duration` (default 500ms), normalizing the angle difference to -PI..PI.

### Control API
`onArrival` registers the arrival callback. `stopMovement` cancels the RAF and clears path/target state. `pauseMovement`/`resumeMovement` toggle `isMoving` (resume restarts the loop if a path remains). `isMoving` and `getPosition` are read helpers. `cleanup` stops movement and clears callback, and is auto-invoked via `onUnmounted`.

## Exports

- **use3DMovement** (composable) — `use3DMovement(guineaPigId: string): { moveTo, moveDirectTo, rotateTo, wander, onArrival, stopMovement, pauseMovement, resumeMovement, isMoving, getPosition, cleanup, isAnimating }`: Composable managing RAF-based 3D movement for one guinea pig. Returns movement control functions plus the reactive `isAnimating` ref. `moveTo(destination)` and `wander(maxDistance=8)` use pathfinding; `moveDirectTo(destination)` skips it; `rotateTo(targetRotation, duration=500)` returns a Promise; `onArrival(callback)` registers a one-shot arrival callback; `isMoving()` and `getPosition()` are read helpers.

## Internal dependencies

- `../../stores/movement3DStore`
- `../../stores/gameController`
- `./use3DPathfinding`
- `../../types/movement3d`
- `vue`

## Notes

- The RAF loop mutates the store's guinea pig state object directly (worldPosition, rotation, currentPath via shift), relying on reactivity of that object.
- `arrivalCallback` is a single-shot: it is cleared immediately before invocation to permit re-registration during the callback.
- When the game is paused (`gameController.isGameActive` false) the loop keeps running via RAF but performs no movement, so it will not settle until the game resumes.
- `rotateTo` runs an independent RAF loop that is not tracked by `animationFrameId`, so `stopMovement`/`cleanup` will not cancel an in-progress rotation.
- `MOVE_SPEED` and `ARRIVAL_THRESHOLD` are module-level constants shared across all instances.
