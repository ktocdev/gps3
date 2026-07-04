---
source: src/stores/gameViewStore.ts
source_hash: 3f6a8e21656276de981fb3dab29f6e201a911c5044c252183ec8beac2ca1ec6c
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Game View Store

`src/stores/gameViewStore.ts`

> A Pinia store that tracks and persists the game's view mode, allowing the application to switch between 2D and 3D rendering. It defaults to 3D and persists the user's choice across sessions.

### State
- `mode`: a `ref<GameViewMode>` initialized to `'3d'`, holding the current view mode.

### Actions
- `setMode(newMode)`: logs the switch to the console and assigns `newMode` to `mode.value`.
- `toggleMode()`: flips between `'2d'` and `'3d'` by calling `setMode`.

### Persistence
The store is defined with `{ persist: true }`, so `mode` is persisted (via a Pinia persistence plugin) and restored on reload. Defined using the Pinia setup-store syntax under the id `'gameView'`.

## Exports

- **GameViewMode** (type) — `type GameViewMode = '2d' | '3d'`: Union type representing the two supported view modes.
- **useGameViewStore** (store) — `useGameViewStore(): { mode: Ref<GameViewMode>, setMode(newMode: GameViewMode): void, toggleMode(): void }`: Pinia store (id 'gameView') exposing the reactive `mode` state and the `setMode`/`toggleMode` actions. Persisted across sessions.

## Internal dependencies

- `pinia`
- `vue`

## Notes

- Relies on a Pinia persistence plugin (e.g. pinia-plugin-persistedstate) being installed for `persist: true` to take effect.
- `setMode` writes to `console.log` on every mode change.
