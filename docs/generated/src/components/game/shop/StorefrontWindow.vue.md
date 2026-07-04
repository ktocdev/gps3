---
source: src/components/game/shop/StorefrontWindow.vue
source_hash: cd1d1da31c7dbea907764e367fff6b7ea5b1d90dda8b36c9882e0417ceee8d28
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# StorefrontWindow

`src/components/game/shop/StorefrontWindow.vue`

> A presentational Vue SFC that renders a static decorative panoramic storefront window as inline SVG for the game's shop UI. It is a pure visual decoration ported from gps2-design's SuppliesStore.jsx, depicting a wooden window frame with sky, clouds, sun, birds, an OPEN sign, and a potted plant.

### Structure
The component is a single static `<svg>` element (viewBox `0 0 1100 190`, height 190) with an empty `<script setup lang="ts">` block — no props, emits, state, or logic.

### Rendering
A `<defs>` block defines one vertical `linearGradient` (`storefrontWinFrame`) used to color the window frame and sill. The scene is composed of literal SVG primitives: a rounded outer frame rect, a sill rect, a sky-blue inner pane, several white cloud ellipses, a sun (two circles), two bird paths, an OPEN sign group (translated/rotated with rect, dots, and `Gaegu` cursive text), and a detailed potted-plant group of leaf ellipses and pot paths.

The root SVG is marked `aria-hidden="true"` and uses `preserveAspectRatio="xMidYMid meet"`. All colors and coordinates are hardcoded to match the documented GPS2 design palette.

## Exports

- **StorefrontWindow** (component) — `<StorefrontWindow />`: Static decorative SVG storefront window. No props, no emits, no slots. Root element carries class `storefront-window__svg` and `aria-hidden="true"`.

## Notes

- Purely decorative and static — no props, emits, reactivity, or scoped styles; the `storefront-window__svg` class must be styled by a parent/global stylesheet.
- Text element depends on the `Gaegu` cursive font being loaded elsewhere; falls back to generic cursive otherwise.
- Decoration colors and coordinates are intentionally literal, matching the GPS2 Design Elements palette.
