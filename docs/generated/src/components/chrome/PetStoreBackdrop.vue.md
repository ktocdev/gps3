---
source: src/components/chrome/PetStoreBackdrop.vue
source_hash: d0dc7222381b6c1558da28bee9069f8eaee208cc01d8da9df795a75773ae06a0
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# PetStoreBackdrop.vue

`src/components/chrome/PetStoreBackdrop.vue`

> A purely decorative Vue SFC that renders inline-SVG pet-shop scenery (window, shelf of empty cages, two potted plants, a wooden chair, and a treats box) as a full-bleed background layer behind the "Pick your bonded pair" picker screen. It exists to add ambient atmosphere without competing with foreground content, using low opacity and a desaturated palette.

### Structure
The component is a single root `<div class="psbk" aria-hidden="true">` containing six absolutely positioned `.psbk__slot` children, each holding one inline SVG illustration: `.psbk__window`, `.psbk__habitats` (three cages on a shelf), `.psbk__plant-1`, `.psbk__chair`, `.psbk__treats`, and `.psbk__plant-2`. All artwork is inline SVG with no external assets.

### Logic & State
None. The `<script setup>` block is empty — no props, emits, or reactive state. It is entirely static markup and scoped CSS.

### Layout / Data Flow
The `.psbk` layer is `position: absolute` with `inset-block: 0`, `inline-size: 100vw`, and `transform: translateX(-50%)` from `inset-inline-start: 50%`, making it full-bleed and centered. `z-index: 0` places it below foreground content (`.petstore__content` at z-index 1), `pointer-events: none` makes it click-through, and `overflow: hidden` clips decorations hanging past screen edges. Each slot is positioned via `inset-block`/`inset-inline` offsets, given a fixed `opacity` (0.5–0.6), and most are slightly rotated (or scaled, for plant-2). SVGs use scoped gradient/clipPath defs with `psbk-` prefixed IDs (`psbk-pot-a`, `psbk-pot-b`, `psbk-seat`, `psbk-treats-front`, `psbk-treats-side`, `psbk-treats-clip`).

## Exports

- **PetStoreBackdrop** (component) — `<PetStoreBackdrop />`: Decorative backdrop component with no props and no emits. Renders static SVG pet-shop scenery as an absolutely-positioned background layer.

## Notes

- Must be placed as the first child of a `position: relative` ancestor (e.g. `.petstore__inner`) so `inset-block: 0` spans the full scroll height; it relies on foreground content sitting at a higher z-index (documented as `.petstore__content` z-index 1).
- SVG def IDs are prefixed with `psbk-` to avoid collisions, but these are global document IDs (not scoped by Vue's style scoping), so rendering multiple instances of this component on one page could cause ID conflicts.
- The treats box uses a clipPath (`psbk-treats-clip`) to occlude items behind the box walls; the TREATS label text depends on the 'Gaegu' font being loaded.
