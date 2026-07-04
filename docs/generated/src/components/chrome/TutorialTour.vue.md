---
source: src/components/chrome/TutorialTour.vue
source_hash: 2b09d0cb4519674bc44b7d463bde0d076736883b799325073fe49b75ac72432d
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# TutorialTour.vue

`src/components/chrome/TutorialTour.vue`

> A first-run guided tour overlay for Live Mode that spotlights UI elements marked with [data-tutorial], dims the surrounding screen, and walks the user through a fixed sequence of steps. Ported from the gps2-design prototype, it coordinates with tutorialStore to auto-open chrome panels, switch the pig drawer tab, and advance based on user interactions.

### Step data
A hard-coded `steps: TutorialStep[]` array defines the tour (welcome, pig pills/info/needs, habitat, cage, inventory, fabs, activity, pause, supplies, done). Each step can target a `[data-tutorial]` key, auto-open a panel, set a drawer tab, define alignment, hole padding, and advance conditions.

### State & measurement
The current step is derived from `tutorial.stepIndex` (from `useTutorialStore`). A `measure()` loop runs every animation frame (via `requestAnimationFrame`), reading the target element's `getBoundingClientRect()`. If the target contains an open `[data-sim-panel]` dropdown, both rects are unioned. Results are stored in `targetRect` only when they change by ≥0.5px to limit churn.

### Rendering
`hole` computes a padded cutout rect (default `HOLE_PAD` 10px, overridable per-step via `holePad`). `dimStyles` produces four dim panels around the hole; when there is no hole (centered intro/outro steps) a single full-screen dim renders. A pulsing ring is drawn around the hole. `cardPos` positions the step card opposite the target using `align` (top/bottom/left/right), clamped inside the viewport; without a hole it centers the card.

### Choreography
A `watch` on `step` (immediate) closes the previous step's auto-opened panel, opens the current one via `tutorial.callPanelHandler(key, true)`, and flips the pig drawer tab via `nextTick` + `callPanelHandler('pig-drawer-tab', tab)`.

### Interaction
A document-level click listener (`onDocumentClick`) advances the tour when a click matches `advanceOnSelector` or lands inside the target (`advanceOnTargetClick`), after a 320ms delay so the target's own handler runs first. Escape closes the tour. Controls: Back (disabled on first step), Skip this step, Next/Done, and a skip-whole-tour ✕ button. On unmount it cancels the RAF loop, removes listeners, and closes any lingering auto-opened panel.

## Exports

- **TutorialTour** (component) — `<TutorialTour @close />`: Vue SFC (script setup) rendered via Teleport to body. No props. Emits `close` (fired on final step's Next/Done, the ✕ skip button, or Escape). Depends entirely on tutorialStore for stepIndex, active state, and panel handlers.

## Internal dependencies

- `../../stores/tutorialStore`

## Notes

- Runs an unthrottled requestAnimationFrame `measure()` loop for the entire lifetime of the component to track layout shifts.
- A global document click listener drives step advancement; the 320ms setTimeout intentionally lets the target's own click handler run first, and re-checks `tutorial.isActive` and unchanged `stepIndex` before advancing.
- Tightly coupled to tutorialStore's `callPanelHandler` contract with specific keys (e.g. 'pig-drawer-tab', 'pig-pill', 'inventory') that components must register.
- Target elements must expose `[data-tutorial="<key>"]` attributes; open dropdowns must use `[data-sim-panel]` to be unioned into the spotlight.
- Card dimensions are hard-coded (380x320) for positioning math and may not match actual rendered size.
- `step` clamps stepIndex to the last step; `close()` only emits — actual teardown of tour state lives in the store/parent.
