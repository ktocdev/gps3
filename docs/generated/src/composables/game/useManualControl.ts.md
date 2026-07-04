---
source: src/composables/game/useManualControl.ts
source_hash: d6d746e458976ce12ee4a8d81e7d2766770145478c74080db78ef57de72ed5e7
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# useManualControl composable

`src/composables/game/useManualControl.ts`

> A Vue composable that lets players temporarily take direct control of a guinea pig's movement. It manages a module-level shared control state (which guinea pig is controlled, movement targets, and a path queue) plus auto-release logic based on inactivity timeout and stress level.

## State
Uses module-level refs shared across all consumers:
- `controlState` — `ManualControlState` holding `enabled`, `controlledGuineaPigId`, `startTime`, `lastActivityTime`, and `autoReleaseTimeout`.
- `targetPosition` — current single `ControlTarget` or null.
- `pathQueue` — array of `ControlTarget` waypoints (described as a future feature).

## Computed
- `isControlActive` — whether control is enabled.
- `controlledGuineaPigId` — the controlled guinea pig id.
- `timeRemaining` — seconds left before timeout, derived from `lastActivityTime` vs `autoReleaseTimeout`.

## Control flow
`takeControl(id)` releases any existing different control, sets state fresh, and clears targets. `releaseControl()` resets state and targets. `toggleControl(id)` switches based on `isControlled(id)`.

## Movement
`setTarget(x,y)` sets `targetPosition` (only when enabled) and bumps activity time. `addWaypoint`, `getNextWaypoint`, `completeWaypoint` (shifts queue), `getTargetPosition`, and `clearTargets` manage targets. Most mutating movement actions also refresh `lastActivityTime`.

## Auto-release
`checkAutoRelease(stress?)` releases control when elapsed inactivity exceeds `autoReleaseTimeout` (default 30s) or when `stress > STRESS_THRESHOLD` (80). A `watch` on `isControlActive` starts/stops a 1-second `setInterval` (`startAutoReleaseChecker`/`stopAutoReleaseChecker`) that calls `checkAutoRelease` while active. `setAutoReleaseTimeout` and `updateActivity` allow tuning.

All significant actions log to the console with a `[Manual Control]` prefix.

## Exports

- **useManualControl** (composable) — `useManualControl(): { isControlActive, controlledGuineaPigId, timeRemaining, takeControl, releaseControl, toggleControl, isControlled, setTarget, addWaypoint, getTargetPosition, getNextWaypoint, completeWaypoint, clearTargets, setAutoReleaseTimeout, updateActivity, checkAutoRelease }`: Main composable exposing manual control state (computed refs) and action functions. Note: internal functions startAutoReleaseChecker/stopAutoReleaseChecker are not returned.
- **ManualControlState** (type) — `interface ManualControlState { enabled: boolean; controlledGuineaPigId: string | null; startTime: number; lastActivityTime: number; autoReleaseTimeout: number }`: Shape of the control state object.
- **ControlTarget** (type) — `interface ControlTarget { x: number; y: number; timestamp: number }`: A movement target or waypoint with a timestamp.

## Internal dependencies

- `vue`

## Notes

- State (`controlState`, `targetPosition`, `pathQueue`) is declared at module scope, so it is a singleton shared across every call of the composable.
- `autoReleaseInterval` is declared inside the composable function, meaning each invocation gets its own interval variable and its own `watch`; multiple consumers can create multiple 1-second intervals all mutating the same shared state.
- `startAutoReleaseChecker` uses `window.setInterval` and is never automatically stopped on component unmount — only when `isControlActive` becomes false.
- Constants `DEFAULT_TIMEOUT` (30000ms) and `STRESS_THRESHOLD` (80) are hardcoded and not exported.
