---
source: src/components/chrome/IntroLoadingScreen.vue
source_hash: 1bbe198e639b815f4f7185bb92f0741704d7089b79bab65ea45b96535bb9de1f
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# IntroLoadingScreen.vue

`src/components/chrome/IntroLoadingScreen.vue`

> A full-screen animated intro/loading splash for GPS3 (Guinea Pig Simulator). It plays a timed sequence in which a herd of pigs runs across the screen, drops into place, and reveals the wordmark and tagline. Users can click or press a key to skip ahead or dismiss it, at which point it emits a `done` event.

## Phases
The component is driven by a `phase` ref cycling through `'run' → 'drop' → 'reveal' → 'gone'`, plus a `revealing` boolean that toggles CSS reveal states for the sun, wordmark, tagline, and continue text.

## Timed sequence
On mount, two timers are scheduled: at 3200ms phase moves to `'drop'`, and at 4900ms phase moves to `'reveal'` (setting `revealing = true`). Timer IDs are stored in the `timers` array so they can be cleared. A `keydown` listener maps Enter/Space/Escape to `skip`.

## Pig rendering
A static `PIGS` array of 7 `IntroPig` configs (colors, spots, size, lane, startDelay, speed) is rendered via `v-for`. Each pig uses `<PigSvg breed="American" ...>` (breed art is deferred; all pigs render as American shorthair). `pigStyle(p, index)` computes inline styles per phase: during `'run'` it applies hop + horizontal scoot animations (lane 1 runs right-to-left, others left-to-right); during `'drop'` pigs fall from above into settled positions with `intro-drop`; during `'reveal'`/`'gone'` they sit at settled positions. The `intro-bob` animation is applied to inner wrappers only during `'reveal'`.

## Interaction
`skip()`: during `run`/`drop` it clears timers and jumps straight to `reveal`; during `reveal` it calls `finish()`. `finish()` sets phase to `'gone'` and, after a 380ms fade, emits `done`.

## Cleanup
`onUnmounted` clears all timers and removes the keydown listener.

## Internal dependencies

- `./PigSvg.vue`

## Notes

- Emits a single `done` event; the parent is responsible for unmounting the component after receiving it.
- `finish()` emits `done` after a 380ms setTimeout but the CSS opacity transition is 540ms, so the fade may not fully complete before the event fires.
- Timer IDs are stored in the module-level-per-instance `timers` array and cleared on skip and unmount to avoid stale phase transitions.
- All pigs render as the 'American' breed regardless of intended breed — breed-specific art is explicitly deferred.
- `pigStyle` sets a `--sx` CSS custom property (used by the `intro-drop` keyframes) only in the `drop` branch.
- Global (non-scoped) `<style>` block; class names like `.intro`, `.intro-pig`, and keyframes are not scoped and could collide with other global styles.
- Respects `prefers-reduced-motion` by disabling pig/bob animations, but the phase timers and JS transitions still run.
