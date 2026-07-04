---
source: src/components/chrome/ParchmentPanel.vue
source_hash: 8af1fedd636e3df7980429e379617af5d7dd116956e461b3995c9deb2aeda982
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# ParchmentPanel

`src/components/chrome/ParchmentPanel.vue`

> A presentational Vue SFC that renders a decorative parchment-styled container panel with an awning, corner studs, sheen, and optional grain overlay. It wraps arbitrary slot content and is used as a themed chrome/panel wrapper throughout the UI.

## Structure

The component renders a root `div.parchment-panel` whose classes and CSS custom property are driven by props:

- `parchment-panel--animate` is applied unless `animate === false` (so animation is on by default).
- `parchment-panel--flex-col` is applied when `flexCol` is truthy.
- The inline style sets `--accent` to the `accent` prop, falling back to `var(--color-gold)`.

## Decorative layers

Several purely decorative, `aria-hidden` elements are rendered inside: an `__awning` bar, four corner `__stud` spans (`--tl`, `--tr`, `--bl`, `--br`), a `__sheen` overlay, and a conditional `__grain` overlay shown only when `showGrain` is truthy.

## Content slotting

The default slot is rendered either directly (when `noPadding` is true) or wrapped in a `.parchment-panel__body` div (default), which provides padding.

No reactive state, emits, or logic beyond prop-driven class/style binding. Styling classes referenced here are defined elsewhere (no `<style>` block in this file).

## Exports

- **ParchmentPanel** (component) — `<ParchmentPanel :accent? :noPadding? :animate? :flexCol? :showGrain?><slot/></ParchmentPanel>`: Decorative parchment panel wrapper. Props: `accent?: string` (sets `--accent` CSS var, defaults to `var(--color-gold)`), `noPadding?: boolean` (renders slot without the padded body wrapper), `animate?: boolean` (animation enabled unless explicitly false), `flexCol?: boolean` (adds column-flex modifier class), `showGrain?: boolean` (renders the grain overlay). No emits. Exposes a default slot for content.

## Notes

- `animate` defaults to on: the animate modifier is applied unless `animate` is strictly `false`, so passing `undefined` still animates.
- Styling for all `.parchment-panel*` classes is not defined in this file and must be provided by global/external CSS.
- All decorative sub-elements are `aria-hidden`, so only slot content is exposed to assistive tech.
