---
source: src/views/GameShellView.vue
source_hash: dcf464467fd73f3256e8131c75e537ab488849ce95561a47585202418299a82d
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# GameShellView

`src/views/GameShellView.vue`

> The persistent application shell view that wraps all routed pages with a shared header and hosts the first-run guided tutorial tour. It exists so the tutorial can survive route changes (e.g. steps that navigate to the supplies store) while the routed content swaps out beneath it.

## Layout
Renders a flex-column shell (`GameHeader` + `<main>` containing `<RouterView />`). The `TutorialTour` component is conditionally rendered when `tutorialStore.isActive`, and emits `close` to `finishTutorial`.

## Tutorial auto-start logic
A computed `inLiveMode` is true only when the route is `/`, there is an `activeGameSession`, and at least one active guinea pig exists — because the tour's spotlight targets only exist in that state.

An `autoStartDone` ref guards against the tour relaunching immediately after closing when the tutorial mode is `always_show`. It resets to `false` whenever `inLiveMode` becomes false.

A watcher on `[inLiveMode, tutorialStore.replayRequested]` (immediate) calls `maybeStartTutorial()`. That function bails if not in Live Mode or the tour is already active. It computes `autoStart` from `gameController.settings.tutorial` (`mode === 'always_show'`, or `mode === 'auto' && !completed`). If neither a replay nor an eligible auto-start applies, it returns. Otherwise it sets `autoStartDone`, then uses a 450ms `setTimeout` to let UI mount before pausing the game (`pauseGame('silent')` if active) and calling `tutorialStore.start()`.

## Finishing
`finishTutorial` stops the tour, marks the tutorial completed via `gameController.setTutorialCompleted(true)`, and navigates back to `/` if the current route is elsewhere.

## Exports

- **GameShellView** (component) — `<GameShellView />`: Vue SFC shell view. No props or emits. Renders GameHeader, a RouterView-containing main region, and a conditionally-shown TutorialTour. Manages first-run/replay tutorial auto-start and completion.

## Internal dependencies

- `../components/chrome/GameHeader.vue`
- `../components/chrome/TutorialTour.vue`
- `../stores/tutorialStore`
- `../stores/gameController`
- `../stores/petStoreManager`
- `../stores/guineaPigStore`
- `vue-router`
- `vue`

## Notes

- The tutorial deliberately lives on the shell rather than GameView so it persists across route navigation (the supplies-store step navigates away from Live Mode).
- The 450ms setTimeout is a load-bearing delay to ensure the top bar, cage, and FABs are mounted and measurable before the spotlight positions itself; it re-checks `inLiveMode`/`isActive` inside the callback.
- `autoStartDone` exists specifically to prevent `always_show` mode from relaunching the tour immediately upon close; it only resets when leaving Live Mode.
