---
source: src/components/chrome/GameHeader.vue
source_hash: 3c72d38ff7dc8ff1f6c6962d45ee0f1be5a689aaeea0bc1fd1404f5e51dfefd6
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# GameHeader.vue

`src/components/chrome/GameHeader.vue`

> The top navigation/chrome bar for the Guinea Pig Simulator. It renders the app branding, tab navigation, player currency, and utility controls (low-stimulation theme toggle, help, pause/resume), adapting its content based on whether an active game session exists.

## Layout
Renders a `<header>` styled as a wood bar with a grain overlay, brand icon/title, a navigation `<nav>`, a utility cluster, and an embedded `HelpOverlay`.

## Session-dependent rendering
`preAdoption` is a computed derived from `petStoreManager.activeGameSession` being falsy. When pre-adoption (no active session), the nav and utility controls are hidden (replaced by an empty `<span>`). Otherwise tabs and utility buttons render.

## Navigation
`tabs` is a static array of three routes: `/` (Live Mode), `/store` (Supplies Store), `/debug` (Debug). Each renders a `RouterLink`. `isActive(path)` marks the active tab — exact match for `/`, prefix match (`startsWith`) for others. The `/store` tab receives a `data-tutorial="supplies-tab"` attribute.

## Utility controls
- Currency display bound to `playerProgression.formattedCurrency`.
- Low-stim toggle button: `toggleLowStim()` flips `themeStore.chromeTheme` between `'low-stim'` and `'default'` via `setChromeTheme`; `aria-pressed`/title reflect current state.
- Help button toggles the local `showHelp` ref, which is v-model bound to `HelpOverlay`.
- Pause/resume button: `togglePause()` calls `gameController.resumeGame()` or `gameController.pauseGame('manual')` based on `gameController.isPaused`. Disabled when `canTogglePause` is false (no active session). Label/aria reflect paused state.

## Data flow
Reads from four Pinia stores and the current route; writes only via theme toggle and pause/resume actions.

## Exports

- **GameHeader** (component) — `<GameHeader />`: Vue SFC (script setup). No props or emits. Renders the app header chrome; internally consumes gameController, petStoreManager, playerProgression, and themeStore stores plus the current route. Manages local `showHelp` ref for the HelpOverlay.

## Internal dependencies

- `./HelpOverlay.vue`
- `../../stores/gameController`
- `../../stores/petStoreManager`
- `../../stores/playerProgression`
- `../../stores/themeStore`
- `vue-router`

## Notes

- Nav and all utility controls are entirely hidden during pre-adoption (when there is no active game session).
- `isActive` uses `startsWith` for non-root paths, so any sub-route of a tab path is highlighted as active.
- Pause action always passes the reason string `'manual'` to `pauseGame`.
