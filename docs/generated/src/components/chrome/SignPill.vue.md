---
source: src/components/chrome/SignPill.vue
source_hash: 2f91a0405ffbd0be759b5dd74099662337ebfe72f085e777df537044bb40d7f7
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# SignPill

`src/components/chrome/SignPill.vue`

> A presentational Vue SFC that renders a stylized "road sign" pill button with decorative rivets, an optional icon disc, a label, an optional numeric badge, and a dropdown caret. It exists as a reusable chrome UI element that can be themed via accent colors and tilted, and emits a click event.

## Structure
The component is a single `<button>` with class `sign-pill`, toggling `sign-pill--active` when the `active` prop is truthy. Theming is applied via inline CSS custom properties bound from props: `--tilt` (from `tilt`, defaulting to `0deg`), `--accent`, `--accent-deep` (falls back to `accent`), and `--badge-color`.

## Content
- Four decorative rivet spans (top-left/right, bottom-left/right), all `aria-hidden`.
- An `icon` named slot; its default fallback renders a `sign-pill__disc` span containing the `icon` prop only when `icon` is set.
- A `sign-pill__label` span showing the `label` prop.
- A default slot for arbitrary content.
- A badge span shown only when `badge != null && badge > 0`, displaying the number or `99+` when greater than 99.
- A `suffix` named slot.
- A caret span (`▾`), `aria-hidden`.

## Behavior
Clicking the button emits a `click` event with no payload. All styling/theming is driven purely by props; the component holds no internal state. Note the `<style>` block is not present in this file, so class-based visual styling is expected to be defined elsewhere or globally.

## Exports

- **SignPill** (component) — `<SignPill label icon? accent? accentDeep? badge? badgeColor? active? tilt? @click />`: Road-sign styled pill button. Props: label (string, required), icon (string, optional), accent (string), accentDeep (string, defaults to accent), badge (number), badgeColor (string), active (boolean), tilt (number, degrees). Emits: click (no payload). Slots: icon (default shows disc with icon prop), default, suffix.

## Notes

- Badge only renders when badge != null && badge > 0; values over 99 display as '99+'.
- No <style> block in this file — the sign-pill CSS classes and consumed CSS custom properties (--tilt, --accent, --accent-deep, --badge-color) must be styled externally.
