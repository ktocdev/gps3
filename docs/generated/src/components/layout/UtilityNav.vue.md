---
source: src/components/layout/UtilityNav.vue
source_hash: 3ed8e73b4a0899bddbce57ee312da00271cb22ec7a46845bfb0870f8e87030ab
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# UtilityNav.vue

`src/components/layout/UtilityNav.vue`

> A layout navigation component providing utility controls for the game: a pause/resume toggle button and a destructive 'Clear All Storage' button that wipes persisted state and reloads the page. It exists to give players/developers quick access to game control and full reset functionality.

## Structure
Renders a `<nav>` with two buttons: a primary pause/resume toggle and a danger-styled clear-storage button.

## State & Computed
Pulls from five Pinia stores: `gameController`, `petStoreManager`, `habitatConditions`, `guineaPigStore`, and `gameTimingStore`.

- `canTogglePause`: true when `petStoreManager.activeGameSession` is not null; controls the pause button's disabled state.
- `pauseButtonText`: shows '▶️ Resume Game' or '⏸️ Pause Game' based on `gameController.isPaused`.
- `pauseButtonTitle`: tooltip reflecting session presence and pause state.

## Behavior
- `toggleGamePause()`: calls `gameController.resumeGame()` when paused, otherwise `gameController.pauseGame('manual')`.
- `clearAllStorage()`: after a `confirm()` prompt, it (1) stops the game loop via `gameTimingStore.stopGameLoop()` and calls `gameController.stopGame()` if active; (2) manually resets `habitatConditions` collections (`habitatItems`, `itemPositions`, `poops`, `guineaPigPositions`, `bowlContents`, `hayRackContents`); (3) deletes each guinea pig via `guineaPigStore.deleteGuineaPig(gp.id)`; (4) clears `localStorage` and `sessionStorage`; (5) reloads the page after a 100ms `setTimeout`. On error, it falls back to clearing storage and reloading immediately.

## Styling
Mobile-first: stacked column by default, switching to a horizontal row at min-width 769px. Uses CSS custom properties for spacing, colors, and typography. Styles are global (non-scoped) for button reuse.

## Internal dependencies

- `../../stores/gameController`
- `../../stores/petStoreManager`
- `../../stores/habitatConditions`
- `../../stores/guineaPigStore`
- `../../stores/gameTimingStore`
