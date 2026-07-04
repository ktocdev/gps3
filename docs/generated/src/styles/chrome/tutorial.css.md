---
source: src/styles/chrome/tutorial.css
source_hash: 236b718fd3b151051e09c5e401c51e7996085eefe1618f0c5ad93bb1d6e92404
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Tutorial Tour Styles

`src/styles/chrome/tutorial.css`

> This stylesheet defines the visual appearance of the first-run guided tour rendered by TutorialTour.vue. It provides the spotlight dimming layers, an animated pulsing highlight ring, and a parchment-styled step card with navigation controls, a narrator pig avatar, progress dots, and skip controls.

### Overlay & spotlight
Defines `.tutorial-overlay` as a fixed full-viewport container at `z-index: 1100` (above all chrome). `.tutorial-overlay__dim` renders semi-opaque brown dim panels (positioned/sized inline by the component) that surround a spotlight hole; a `--through` modifier disables pointer events so clicks pass to the underlying UI. `.tutorial-overlay__ring` draws a gold border around the spotlighted element and runs the `tutorial-ring-pulse` keyframe animation (a 1.6s infinite glow via layered box-shadows). Both dim and ring transition their `top/left/width/height` over 220ms for smooth movement between steps.

### Step card
`.tutorial-card` is a fixed, width-constrained container with several sub-elements:
- `__skip-tour`: small close/skip button pinned top-right.
- `__body`, `__counter` / `__counter-chip` / `__counter-sep` / `__counter-total`: step counter chip.
- `__header`, `__pig` (narrator avatar, gradient circle), `__pig-face`, `__sparkle`: shown on pig-voice steps.
- `__title`, `__text` (with `--pig` italic variant), `__hint` (callout box).
- `__dots` / `__dot` with `--active` (widened gradient pill) and `--done` (grey) states for progress indication.
- `__controls`, `__btn` (with `:disabled` state), `__btn--next` (raised primary button), and `__skip-step` (underlined text link).

Colors, spacing, radii, and fonts are all driven by CSS custom properties from tokens.css.

## Exports

- **.tutorial-overlay** (style) — `.tutorial-overlay`: Fixed full-viewport tour container at z-index 1100, pointer-events none.
- **.tutorial-overlay__dim** (style) — `.tutorial-overlay__dim / --through`: Dim panel surrounding the spotlight hole; --through variant passes clicks through.
- **.tutorial-overlay__ring** (style) — `.tutorial-overlay__ring`: Gold pulsing highlight ring around the spotlighted element.
- **.tutorial-card** (style) — `.tutorial-card and children`: Parchment step card with counter, header/pig avatar, title/text/hint, progress dots, and controls (next/prev/skip buttons).
- **tutorial-ring-pulse** (style) — `@keyframes tutorial-ring-pulse`: 1.6s infinite glow animation cycling box-shadow intensity for the highlight ring.

## Internal dependencies

- `primitives.css (parchment-panel)`
- `tokens.css (CSS custom properties)`

## Notes

- Dim panel and ring position/size are set inline by TutorialTour.vue; this file only styles them.
- Uses fixed z-index 1100 to stack above all chrome dropdowns/dialogs.
- Relies on many CSS variables (--color-gold, --panel-*, --space-*, --font-*, --radius-*) defined elsewhere; missing tokens would break styling.
