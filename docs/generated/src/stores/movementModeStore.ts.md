---
source: src/stores/movementModeStore.ts
source_hash: 6bebcf784ea5f44055edd5f84172e44ae672ae009c1fc092240b24985bd64cab
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Movement Mode Store

`src/stores/movementModeStore.ts`

> A Pinia store that manages the guinea pig movement system, tracking whether movement is grid-based or free, along with the speed used during free movement. State is persisted across sessions.

### State
- `mode`: a `MovementMode` ref (`'grid' | 'free'`), defaulting to `'grid'`.
- `freeMovementSpeed`: a numeric ref defaulting to `300` pixels per second, intended to stay within a 50–500 range.

### Actions
- `setMode(newMode)`: sets `mode.value` to the provided mode and logs the switch to the console.
- `toggleMode()`: flips between `'grid'` and `'free'` by calling `setMode`.
- `setFreeMovementSpeed(speed)`: clamps the input to the 50–500 range via `Math.max`/`Math.min` before storing it.

### Persistence
The store is defined with `{ persist: true }`, so its state is persisted (via a Pinia persistence plugin) across page reloads.

## Exports

- **MovementMode** (type) — `type MovementMode = 'grid' | 'free'`: Union type representing the two supported movement modes.
- **useMovementModeStore** (store) — `useMovementModeStore(): Store`: Pinia store exposing state (`mode`, `freeMovementSpeed`) and actions (`setMode`, `toggleMode`, `setFreeMovementSpeed`). Persisted.

## Internal dependencies

- `pinia`
- `vue`

## Notes

- Requires a Pinia persistence plugin to be installed for `persist: true` to have any effect.
- `setMode` logs to the console on every mode change.
