---
source: src/App.vue
source_hash: 5802de9cf75ea57cfe06bebc1edf83caab7450841be43aa020f85d267eb0c970
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# App Root Component

`src/App.vue`

> The root Vue component for the gps3 application. It bootstraps all core Pinia stores in a defined order on mount, wires up the router outlet, syncs the chrome theme to the document element, and manages automatic and manual game pause behavior via a pause overlay.

## Template
Renders a `<RouterView />` for routed pages plus a `<PauseOverlay>` bound with `v-model` to `showPauseOverlay`, passing `pauseReason` and listening for `@resume`.

## Theme sync
Watches `themeStore.chromeTheme` (immediate). When the theme is `'default'` it removes the `data-chrome-theme` attribute from `document.documentElement`; otherwise it sets it to the theme value.

## Store initialization (onMounted)
Initializes stores in a specific order: `usePlayerProgression().initializeStore()`, `useGuineaPigStore().initializeStore()`, `usePetStoreManager().initializeStore()`, then `gameController.initializeStore()`. Afterwards it sets up visibility listeners and the pause watcher.

## Pause handling
- **Visibility API:** `setupVisibilityListeners` registers a `visibilitychange` handler stored in module-level `visibilityChangeHandler`. When `document.hidden` and the game is active, it calls `gameController.pauseGame('visibility')`, sets `pauseReason` to `'visibility'`, and shows the overlay. It intentionally does not auto-resume on becoming visible.
- **Manual pause watcher:** `setupPauseWatcher` watches `gameController.gameState.pauseReason`. If the game is paused and the reason is `'manual'`, `'visibility'`, or `'orientation'`, it updates `pauseReason` and shows the overlay (unless already visible). Navigation pauses are excluded (handled by router).
- **Resume:** `handleResume` calls `gameController.resumeGame()` and hides the overlay.

## Cleanup
`onUnmounted` calls `cleanupVisibilityListeners`, which removes the `visibilitychange` listener and clears the handler reference.

## Local state
`showPauseOverlay` (ref boolean) and `pauseReason` (ref union of `'manual' | 'visibility' | 'orientation' | 'navigation'`).

## Exports

- **App** (component) — `<App />`: Root SFC. No props or emits. Hosts RouterView and PauseOverlay, initializes all core stores, syncs chrome theme to the document element, and manages pause overlay state driven by the Page Visibility API and game controller pause state.

## Internal dependencies

- `vue-router`
- `./stores/guineaPigStore`
- `./stores/gameController`
- `./stores/petStoreManager`
- `./stores/playerProgression`
- `./stores/themeStore`
- `./components/game/dialogs/PauseOverlay.vue`

## Notes

- Store initialization order is significant: playerProgression, guineaPigStore, petStoreManager, then gameController.
- Tab visibility loss pauses the game but never auto-resumes; the user must click resume.
- Navigation pause reason is deliberately excluded from the overlay watcher (handled by the router).
- `visibilityChangeHandler` is a module-scoped mutable variable, not component-scoped; only one App instance is assumed.
