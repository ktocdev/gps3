---
source: src/stores/tutorialStore.ts
source_hash: 57761acba2b3b0f0a4932ee69740dd3f6e1f9202ffd7fecad036d570332c5c6d
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Tutorial Store

`src/stores/tutorialStore.ts`

> A Pinia store holding session-only state for the first-run guided tour (TutorialTour.vue). It tracks whether the tour is active and which step is showing, coordinates a replay request flow, and provides a registry mechanism so chrome components can expose local panel controls (open/close, tab selection) for tour steps to choreograph the real UI.

## State

- `isActive` (ref boolean): whether the tour is currently running.
- `stepIndex` (ref number): the current tour step, reset to 0 on `start()`.
- `replayRequested` (ref boolean): set by the debug panel's Replay button and consumed by GameShellView's auto-start watcher once the user is back in Live Mode with a session.

## Panel handler registry

A non-reactive `Map<string, TutorialPanelHandler>` lets chrome components (SimTopBar's dropdown, PigDrawer's tab) register handlers by key on mount instead of lifting their local open/close state up.

- `registerPanelHandler(key, handler)` stores a handler.
- `unregisterPanelHandler(key, handler?)` removes it; when an optional `handler` is passed, it only deletes if the stored handler matches — preventing an outgoing component instance from clobbering an incoming one's registration during swaps.
- `callPanelHandler(key, value)` invokes the registered handler (if any) with a boolean (open/close) or string (tab select).

## Actions

- `start()` resets `stepIndex` to 0, clears `replayRequested`, and sets `isActive` true.
- `stop()` sets `isActive` false.
- `requestReplay()` sets `replayRequested` true.

Completion/mode settings are stored separately in `gameController.settings.tutorial` (persisted); this store is intentionally session-only.

## Exports

- **TutorialPanelHandler** (type) — `type TutorialPanelHandler = (value: boolean | string) => void`: Callback signature for panel handlers; a boolean opens/closes a panel while a string selects a tab.
- **useTutorialStore** (store) — `useTutorialStore(): Store`: Pinia setup store 'tutorial'. Exposes refs isActive, stepIndex, replayRequested and functions registerPanelHandler, unregisterPanelHandler, callPanelHandler, start, stop, requestReplay.

## Internal dependencies

- `pinia`
- `vue`

## Notes

- The `panelHandlers` Map is not reactive and is not returned from the store; it is only accessed via the register/unregister/call functions.
- `unregisterPanelHandler` intentionally no-ops when given a handler that doesn't match the currently registered one, to handle component swap ordering safely.
- This store is session-only and does not persist; completion/mode settings live in gameController.settings.tutorial.
