---
source: src/components/chrome/ParchmentPanel.vue
source_hash: 2009590fa43474c71863a12add1781910a92bc90dbedad7d229f2e87a4130136
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# ParchmentPanel

`src/components/chrome/ParchmentPanel.vue`

> A presentational Vue SFC that renders a decorative parchment-styled panel wrapper with awning, corner studs, sheen, and optional grain overlays. It provides a themed container slot for other chrome UI content.

## Structure
The component renders a root `.parchment-panel` div with conditional modifier classes and an `--accent` CSS custom property. Inside it places several decorative, `aria-hidden` elements: an awning bar, four corner studs (`--tl`, `--tr`, `--bl`, `--br`), a sheen overlay, and an optional grain overlay.

## Slot rendering
Content is provided via the default `<slot />`. When `noPadding` is true the slot is rendered directly; otherwise it is wrapped in a `.parchment-panel__body` div.

## Reactive class/style logic
- `parchment-panel--animate` is applied unless `animate` is explicitly `false` (i.e. animation is on by default).
- `parchment-panel--flex-col` is applied when `flexCol` is truthy.
- The `--accent` inline CSS variable falls back to `var(--color-gold)` when `accent` is not provided.
- The grain overlay renders only when `showGrain` is truthy.

There is no script logic beyond `defineProps`; the file contains no `<style>` block, so styling is defined elsewhere via the referenced classes and CSS variables.

## Exports

- **ParchmentPanel** (component) — `<ParchmentPanel :accent? :noPadding? :animate? :flexCol? :showGrain?>`: Decorative panel wrapper component. Props: `accent?: string` (accent color, defaults to `var(--color-gold)`), `noPadding?: boolean` (renders slot without body padding wrapper), `animate?: boolean` (animation enabled unless explicitly false), `flexCol?: boolean` (adds flex-column modifier), `showGrain?: boolean` (renders grain overlay). Exposes a default slot for content.

## Notes

- Animation is enabled by default; the `--animate` modifier is only removed when `animate` is explicitly `false`.
- No `<style>` block exists in this file — all `parchment-panel__*` classes and CSS variables like `--color-gold` must be defined globally elsewhere.
