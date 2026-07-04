---
source: src/components/chrome/GameHeader.vue
source_hash: 4c3e59848fe67ced87b82c4ba17ca7d7d093ec4dbe2787a52bc3cace1a8d0d2c
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# GameHeader.vue

`src/components/chrome/GameHeader.vue`

> The persistent top navigation header (wood-bar chrome) for the Guinea Pig Simulator. It shows branding, primary route navigation tabs, the player's currency, and utility controls (low-stimulation theme toggle, help overlay, and pause/resume). It adapts its display depending on whether a game session is active (pre-adoption vs. active play).

## Structure
Renders a `<header>` with brand block (emoji + title), a `<nav>` of `RouterLink` tabs, a utility cluster, and a `HelpOverlay` bound via `v-model`.

## State & stores
Pulls in four Pinia stores: `useGameController`, `usePetStoreManager`, `usePlayerProgression`, and `useThemeStore`, plus `useRoute` from vue-router. Local `showHelp` ref controls the help overlay.

## Data flow
- `tabs` is a static list of three routes (Live Mode, Supplies Store, Debug).
- `preAdoption` is a computed that is true when there is no `activeGameSession`; when pre-adoption, the nav and utility controls are hidden (an empty `<span>` placeholder is rendered for nav).
- `canTogglePause` is true when a game session exists; it disables the pause button otherwise.
- `isActive(path)` marks the active tab: exact match for `/`, prefix match otherwise.
- `togglePause()` calls `gameController.resumeGame()` or `gameController.pauseGame('manual')` based on current paused state.
- `toggleLowStim()` switches `themeStore.chromeTheme` between `'low-stim'` and `'default'`.
- Currency is displayed via `playerProgression.formattedCurrency`.

## Utility buttons
Low-stim toggle (🌿) reflects state via `aria-pressed`; help button (?) toggles `showHelp`; pause button reflects `gameController.isPaused` with label/title changes and a `--paused` class. The store tab and pause button carry `data-tutorial` attributes for tutorial targeting.

## Exports

- **GameHeader** (component) — `<GameHeader />`: Vue SFC (script setup). No props or emits. Renders the app header chrome; internally manages a local showHelp ref and reads from gameController, petStoreManager, playerProgression, and themeStore. Hides navigation and utility controls when no active game session exists.

## Internal dependencies

- `./HelpOverlay.vue`
- `../../stores/gameController`
- `../../stores/petStoreManager`
- `../../stores/playerProgression`
- `../../stores/themeStore`
- `vue-router`

## Notes

- Nav and all utility controls are hidden when preAdoption is true (no activeGameSession); an empty span is rendered in place of nav to preserve layout.
- Pause button is disabled unless a game session exists, but pause/resume is intentionally available on every tab/route.
- data-tutorial attributes ('supplies-tab', 'pause') couple this component to the tutorial system.
