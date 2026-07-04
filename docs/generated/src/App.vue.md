---
source: src/App.vue
source_hash: a9a5ecc26ef4dc7ec254c0b98b4fecf887bcef8ea8c975baf265358d76f93ee6
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# App.vue

`src/App.vue`

> Root application component for the gps3 app. It renders the router outlet and a global pause overlay, initializes all core Pinia stores in a defined order on mount, syncs the chrome theme to the document element, and wires up automatic game pausing via the Page Visibility API.

## Template
Renders `<RouterView />` and a `<PauseOverlay>` bound with `v-model="showPauseOverlay"`, a `:pause-reason` prop, and a `@resume` handler.

## Theme syncing
Watches `themeStore.chromeTheme` (immediate). When the theme is `'default'` it deletes `document.documentElement.dataset.chromeTheme`; otherwise it sets `data-chrome-theme` on `<html>`.

## Local state
- `showPauseOverlay` (ref boolean) controls overlay visibility.
- `pauseReason` (ref) is one of `'manual' | 'visibility' | 'orientation' | 'navigation'`.

## Mount sequence (`onMounted`)
Initializes stores in order: `usePlayerProgression().initializeStore()`, `useGuineaPigStore().initializeStore()`, `usePetStoreManager().initializeStore()`, then `gameController.initializeStore()`. It then calls `setupVisibilityListeners()` and `setupPauseWatcher()`.

## Visibility handling
`setupVisibilityListeners` registers a `visibilitychange` handler stored in `visibilityChangeHandler`. When `document.hidden` and the game is active, it pauses the game with reason `'visibility'` and shows the overlay. It never auto-resumes; the user must click resume. `cleanupVisibilityListeners` (called in `onUnmounted`) removes the listener.

## Pause watcher
`setupPauseWatcher` watches `gameController.gameState.pauseReason`. When paused with a reason of `'manual'`, `'visibility'`, or `'orientation'`, it sets `pauseReason` and shows the overlay (unless already showing). Navigation pauses are intentionally excluded (handled by the router).

## Resume
`handleResume` calls `gameController.resumeGame()` and hides the overlay.

## Exports

- **default** (component) — `App.vue (root SFC, script setup)`: Root component. No props or emits. Renders RouterView and PauseOverlay; manages global store initialization, theme sync, and pause overlay state.

## Internal dependencies

- `vue-router`
- `vue`
- `./stores/guineaPigStore`
- `./stores/gameController`
- `./stores/petStoreManager`
- `./stores/playerProgression`
- `./stores/themeStore`
- `./components/game/dialogs/PauseOverlay.vue`

## Notes

- Store initialization order is intentional and sequential (playerProgression → guineaPig → petStoreManager → gameController).
- Visibility-based pausing never auto-resumes; the overlay resume button is the only path to resume.
- Navigation pause reasons are deliberately excluded from the overlay and expected to be handled by the router.
- The theme watcher mutates the global `document.documentElement.dataset` as a side effect.
- Only gameController is captured at setup scope; the other stores are instantiated locally inside onMounted.
