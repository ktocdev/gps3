---
source: src/components/debug/ui/DebugHeader.vue
source_hash: 510b8dc50aa9d78b2a0e63e70febefa7591b983cc1b3970ca07f26e7b3382f58
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# DebugHeader.vue

`src/components/debug/ui/DebugHeader.vue`

> A header component for the GPS3 debug dashboard. It displays the dashboard title, a live/paused status pill, and utility controls for toggling the debug theme, clearing all browser storage, and navigating back to the game.

## Template
Renders a `<header>` with an awning strip, a title/subtitle block, and a utility row. The utility row contains:
- A status pill that reads `gameController.isPaused` to show 'Paused' (with `dbg-pill--paused` modifier) or 'Live'.
- A theme toggle `Button` that calls `themeStore.toggleDebugTheme()` and shows '☀️ Light' or '🌙 Dark' based on `themeStore.debugTheme`.
- A 'Clear Storage' `Button` invoking `clearAllStorage`.
- A 'Back to game' `Button` calling `router.push('/')`.

## Script
Instantiates the router and five Pinia stores. The core logic is `clearAllStorage`, which prompts the user with `confirm()`, then: stops the game loop via `gameTimingStore.stopGameLoop()`, stops the game if active, resets numerous `habitatConditions` collections (arrays and Maps), deletes all active guinea pigs, clears both `localStorage` and `sessionStorage`, and reloads the page after a 100ms delay. Errors during cleanup are caught, logged, and followed by a fallback storage clear and immediate reload.

## Exports

- **DebugHeader** (component) — `<DebugHeader />`: Vue SFC debug dashboard header. No props or emits. Reads reactive state from gameController and themeStore, and provides the internal clearAllStorage handler.

## Internal dependencies

- `../../basic/Button.vue`
- `../../../stores/gameController`
- `../../../stores/habitatConditions`
- `../../../stores/guineaPigStore`
- `../../../stores/gameTimingStore`
- `../../../stores/themeStore`
- `vue-router`

## Notes

- clearAllStorage mutates habitatConditions state directly (assigning to arrays and calling .clear() on Maps), bypassing store actions.
- It performs a full page reload via window.location.reload(), so any unsaved state is lost.
- The 100ms setTimeout before reload is intended to let cleanup settle; the error fallback reloads immediately without delay.
