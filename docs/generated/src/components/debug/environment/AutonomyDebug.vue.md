---
source: src/components/debug/environment/AutonomyDebug.vue
source_hash: b820d23e7bbd0746529e487b11558402545de1b9ffb551e48513b74aa6619648
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# AutonomyDebug.vue

`src/components/debug/environment/AutonomyDebug.vue`

> A debug/development panel component that provides manual controls for testing guinea pig AI autonomy behaviors. It allows developers to trigger specific behaviors, adjust per-guinea-pig behavior thresholds, observe current activity/goal/position status, and tune the global game loop speed.

## Structure
The component renders three main sections inside a flex column:

1. **Autonomy Controls panel** (shown when `hasActiveGuineaPigs`): includes a guinea pig selector toggle (when multiple exist), an `InfoButton`, a row of behavior trigger buttons (eat, drink, sleep, seek_shelter, groom, chew, play, socialize, wander) plus a Cancel button, a live status display (Activity, Goal, Position), and a collapsible `Details` section with `SliderField` threshold controls for hunger, thirst, energy, shelter, hygiene, chew, and play.
2. **Global Autonomy Settings panel**: a disabled always-checked AI toggle and a `SliderField` bound to `gameTimingStore.intervalMs` (100–30000ms) for game loop speed.
3. **Empty state panel** (shown when no active guinea pigs).

## State & Data Flow
- `selectedGuineaPigIndex` (ref) drives `selectedGuineaPig`. `toggleGuineaPig` cycles through active guinea pigs. A `watch` on `guineaPigStore.selectedGuineaPigId` syncs the local index when a sprite is clicked elsewhere.
- Threshold getters/setters delegate to `autonomySettingsStore` (`getThresholds`/`setThreshold`).
- Behavior composables (`useGuineaPigBehavior`) are lazily created and cached per guinea pig ID in a `Map` via `getBehaviorComposable`.
- Status getters read from `behaviorStateStore` (activity/goal) and `habitatConditions.guineaPigPositions` (position).

## Behavior triggering
`triggerBehavior` is the core logic: it stores original needs, then for most behaviors temporarily drops the relevant need by 100 to force the AI to select that goal via `behavior.selectBehaviorGoal(thresholds)`, executes it with `behavior.executeBehavior`, and on success fully restores/satisfies the need to 100% for testing convenience. If the goal doesn't match or fails, original needs are restored. `socialize` is special-cased: it bypasses AI goal selection, finds the highest-bonded active partner via `getAllBonds`, constructs a manual socialize goal, and executes it directly. `cancelBehavior` clears the current goal/activity and stops movement.

## Exports

- **AutonomyDebug** (component) — `Vue SFC <script setup>, no props, no emits`: Debug panel for manually triggering and tuning guinea pig autonomy behaviors. Takes no props and emits no events. Uses defineExpose to expose getHungerThreshold, getThirstThreshold, and getEnergyThreshold for external access.

## Internal dependencies

- `../../../stores/guineaPigStore`
- `../../../stores/gameTimingStore`
- `../../../stores/gameController`
- `../../../stores/habitatConditions`
- `../../../stores/autonomySettingsStore`
- `../../../stores/behaviorStateStore`
- `../../../composables/game/useGuineaPigBehavior`
- `../../basic/SliderField.vue`
- `../../basic/Button.vue`
- `../../basic/InfoButton.vue`
- `../../basic/Details.vue`

## Notes

- Manual triggers temporarily set a need to 0 to force AI behavior selection, then restore it to 100% on success — this is a testing-only side effect and mutates real guinea pig need state.
- Behavior composables are cached in a module-level-like `Map` keyed by guinea pig ID; they are never invalidated when guinea pigs are removed, which could leak stale composables.
- The 'eat' trigger accepts either an 'eat' or 'eat_hay' goal type as a match.
- The socialize button is disabled unless there are 2+ active guinea pigs (`hasCompanion` only checks count, not actual bonds), but the execution logic further requires actual bonds via `getAllBonds`.
- The global AI checkbox is hardcoded as checked and disabled — AI is always running; only the game loop interval is adjustable.
- Heavy use of console.log/warn/error for debugging throughout triggerBehavior.
- Position getter reads from a `Map` (`habitatConditions.guineaPigPositions`), returning 'unknown' if absent.
