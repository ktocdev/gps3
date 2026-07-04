---
source: src/components/chrome/IntroLoadingScreen.vue
source_hash: 269344f5a7ca3685c03aa545ed01465a0c91ef589b32532936d43264431d26a2
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# IntroLoadingScreen.vue

`src/components/chrome/IntroLoadingScreen.vue`

> An animated full-screen intro/loading splash for GPS3 (Guinea Pig Simulator). It runs a scripted sequence of a running pig herd, a drop-in settle, and a wordmark reveal, then emits `done` so the app can dismiss it. Users can click or press keys to skip ahead.

## State & phases
The component is driven by a `phase` ref cycling through `'run' | 'drop' | 'reveal' | 'gone'` plus a `revealing` boolean that toggles CSS reveal classes for the sun, wordmark, tagline, and continue hint.

## Timed sequence
On mount, two timers advance the phases: at 3200ms `run → drop`, and at 4900ms `drop → reveal` (also setting `revealing = true`). Timer IDs are stored in `timers` and cleared on unmount. A `keydown` listener maps Enter/Space/Escape to `skip`.

## Interaction
Clicking the root or pressing a key calls `skip()`: during `run`/`drop` it clears timers and jumps straight to `reveal`; during `reveal` it calls `finish()`. `finish()` sets `phase = 'gone'` (applying the fade-out class) and after 380ms emits `done`.

## Rendering
A static `PIGS` array (7 pigs with colors, optional spots, size, lane, delay, speed) is rendered as `PigSvg` instances — all forced to breed `American`. `pigStyle(p, index)` returns inline styles per phase: in `run` it applies infinite hop plus a lane-based left↔right `scoot` animation; in `drop` it applies a settle-from-above `intro-drop` keyframe using a computed `settledLeft`; in `reveal`/`gone` it holds the settled position. Lane 1 pigs are flipped horizontally and travel right-to-left. `LANE_TOPS` maps lanes to vertical positions.

## Styling
All animation is CSS keyframes (`intro-hop`, `intro-scoot-r/l`, `intro-drop`, `intro-bob`) with a `prefers-reduced-motion` override disabling pig animations.

## Exports

- **IntroLoadingScreen** (component) — `<IntroLoadingScreen @done="..." />`: Full-screen intro splash Vue SFC. No props. Emits `done` (no payload) once the intro sequence completes or is skipped through to dismissal.

## Internal dependencies

- `./PigSvg.vue`

## Notes

- Imports the `SpotKey` type from PigSvg.vue via a second inline `import type` statement inside the script block.
- All pigs are hardcoded to breed `American` regardless of intended breed art (noted as deferred in the template).
- Timers are plain `window.setTimeout` IDs stored in a module-scoped-per-instance `timers` array; skip and unmount both clear them to prevent phase changes firing after dismissal.
- The `--sx` CSS custom property is set in the `drop` style to preserve horizontal flip during the `intro-drop` keyframe.
- `finish()`'s 380ms emit delay is shorter than the CSS opacity transition (540ms), so `done` fires before the fade fully completes.
