---
source: src/composables/game/useMovement.ts
source_hash: 61a18a7eac65e018ce54d92fffc5e6c640b054edffdf6e249e49f11d7be23984
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# useMovement Composable

`src/composables/game/useMovement.ts`

> A Vue composable implementing System 18 (Pathfinding & Movement) that provides a per-guinea-pig movement controller. It drives step-by-step grid movement along paths, updates positions in the habitat conditions store, handles facing direction and visual offsets for overlapping guinea pigs, and integrates with pathfinding for goal-directed movement and random wandering.

### State
`useMovement(guineaPigId)` creates a reactive `controller` ref holding `currentPath`, `currentStep`, `movementState` ('idle' | 'walking' | 'arrived' | 'blocked'), `targetPosition`, `movementSpeed` (base 2 cells/sec), and `facingDirection`. Computed `isMoving` reflects the walking state; computed `currentPosition` reads the guinea pig's `{x,y}` from `habitatConditions.guineaPigPositions` (mapped to `{row,col}`), warning and defaulting to `{row:0,col:0}` if absent.

### Movement loop
`startMovement(path)` trims the starting cell if it matches current position, sets state to walking, computes speed via `calculateMovementSpeed()` (base 2 + curiosity/10*0.5), and kicks off `moveToNextStep()`. `moveToNextStep()` recursively walks the path: it updates facing direction based on column delta, checks other guinea pigs' positions to apply a visual offset (12,8) on collision, writes the new position into the store with `lastMoved`, `isMoving`, `facingDirection`, and offsets, then schedules the next step via `setTimeout` (1000/speed ms). The scheduled callback only advances if `gameController.isGameActive` and still walking, so pausing halts progression.

### Control functions
`stopMovement()` resets the controller to idle and clears path, marking store position `isMoving:false`. `resumeMovement()` restarts `moveToNextStep()` if still walking with a remaining path. `onArrival(cb)` registers callbacks fired once by `triggerArrivalCallbacks()` (which also clears them and marks not moving) when the path completes.

### Pathfinding integration
`moveTo(destination, {avoidOccupiedCells})` calls `pathfinding.findPath` and starts movement on success, else sets state to 'blocked'. `wander({maxDistance, avoidRecent})` adjusts max distance by curiosity, then makes up to 10 attempts at a random in-bounds, non-recent destination, calling `moveTo` with `avoidOccupiedCells:true`.

## Exports

- **useMovement** (composable) — `useMovement(guineaPigId: string): { controller, isMoving, currentPosition, startMovement, stopMovement, resumeMovement, moveTo, wander, onArrival }`: Creates a movement controller for a single guinea pig. Returns reactive `controller` and `isMoving`/`currentPosition` computeds plus movement control methods (`startMovement`, `stopMovement`, `resumeMovement`, `moveTo`, `wander`, `onArrival`).
- **MovementState** (type) — `type MovementState = 'idle' | 'walking' | 'arrived' | 'blocked'`: Enumerates the possible movement states of the controller.

## Internal dependencies

- `../../stores/habitatConditions`
- `../../stores/guineaPigStore`
- `../../stores/gameController`
- `./usePathfinding`

## Notes

- Movement advances via chained `setTimeout` calls rather than a game tick loop; there is no clearing of pending timeouts on `stopMovement`, so an in-flight timeout can still fire (though it no-ops if state isn't 'walking').
- When paused, the code comment claims movement resumes automatically, but resumption actually requires an external call to `resumeMovement()`.
- Arrival callbacks are one-shot: `triggerArrivalCallbacks` clears the array after firing, so callbacks must be re-registered per movement.
- Coordinate systems are mixed: store positions use `{x,y}` while the composable and pathfinding use `{row,col}` (row=y, col=x).
- Collision offset only applies a fixed (12,8) shift for the first overlapping guinea pig found; it does not resolve chained overlaps.
- `currentPosition` logs warnings/available keys to console on every access when a position is missing.
