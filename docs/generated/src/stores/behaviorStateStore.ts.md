---
source: src/stores/behaviorStateStore.ts
source_hash: ef4d7cae2c00b7d0c89b7a5bd12b29861c012999d84e7cf7d63f7d6703b42b36
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Behavior State Store

`src/stores/behaviorStateStore.ts`

> A Pinia store that centralizes the current activity and goal state for all guinea pigs, keyed by guinea pig ID. It exists so that multiple components can share access to behavior state without instantiating separate copies of the useGuineaPigBehavior composable, and it manages interaction animation timeouts.

### State
- `behaviorStates`: a reactive `Map<string, BehaviorState>` mapping each guinea pig ID to its behavior state.
- `interactionTimeouts`: a non-reactive `Map<string, number>` tracking pending `setTimeout` IDs for interaction animations, used for cleanup.

### Data flow
Components call `initializeBehaviorState` to seed a guinea pig's state with defaults (`currentGoal: null`, `currentActivity: 'idle'`, timestamps, empty cooldowns Map). A random 0–3s offset is subtracted from `lastDecisionTime` to desynchronize decision-making across guinea pigs. `getBehaviorState` returns the state (or undefined), and `updateBehaviorState` mutates an existing state in place via `Object.assign` with a partial object.

### Lifecycle / cleanup
`removeBehaviorState` clears any pending interaction timeout and deletes the entry. `clearAll` clears all timeouts and empties both maps.

### Interaction animation
`triggerPlayerInteraction` sets `currentActivity` to `'interacting'`, records the start time, clears any existing timeout for that guinea pig, then schedules a `window.setTimeout` (default 1500ms) that returns the activity to `'idle'` only if it is still `'interacting'`. The timeout ID is stored in `interactionTimeouts`.

## Exports

- **useBehaviorStateStore** (store) — `defineStore('behaviorState', setup)`: Pinia setup store exposing `behaviorStates` (ref Map), `initializeBehaviorState(guineaPigId)`, `getBehaviorState(guineaPigId): BehaviorState | undefined`, `updateBehaviorState(guineaPigId, state: Partial<BehaviorState>)`, `removeBehaviorState(guineaPigId)`, `clearAll()`, and `triggerPlayerInteraction(guineaPigId, duration = 1500)`.

## Internal dependencies

- `../composables/game/useGuineaPigBehavior (BehaviorState type)`
- `pinia`
- `vue`

## Notes

- `interactionTimeouts` is a plain Map declared outside `ref`, so it is intentionally non-reactive; timeouts must be cleaned via `removeBehaviorState` or `clearAll` to avoid leaks.
- `updateBehaviorState` silently does nothing if no state exists for the given ID.
- `triggerPlayerInteraction` only reverts to idle if the activity is still 'interacting' at timeout expiry, so an intervening activity change is preserved.
- State mutations use `Object.assign` on the existing object rather than replacing it, relying on Vue's deep reactivity of the Map contents.
