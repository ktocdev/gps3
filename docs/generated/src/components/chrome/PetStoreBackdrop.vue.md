---
source: src/components/chrome/PetStoreBackdrop.vue
source_hash: 9796f4111826aca6e9eb3722d9ee939b969ce453c04846c05dd954b90688ffc6
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# PetStoreBackdrop

`src/components/chrome/PetStoreBackdrop.vue`

> A purely decorative Vue SFC that renders pet-shop scenery (window, shelf of empty starter cages, two potted plants, a wooden chair, and a treats box) as inline SVG behind the "Pick your bonded pair" picker screen. It has no props, state, or logic — it exists solely to add atmospheric background art without external image assets.

The component is a single `aria-hidden="true"` root `<div class="psbk">` containing six absolutely-positioned `.psbk__slot` children, each holding one inline `<svg>` shape: `.psbk__window`, `.psbk__habitats`, `.psbk__plant-1`, `.psbk__chair`, `.psbk__treats`, and `.psbk__plant-2`. All artwork is hand-drawn SVG primitives (rects, ellipses, paths, gradients). The treats box uses an oblique projection with a `clipPath` (`psbk-treats-clip`) so the box walls occlude the treats/items drawn inside. Gradient/`clipPath` IDs are namespaced with `psbk-` prefixes.

### Layout & styling
All positioning and opacity live in scoped CSS. `.psbk` is `position: absolute`, full-bleed (`inline-size: 100vw`, centred via `inset-inline-start: 50%` + `translateX(-50%)`), spans the full block height (`inset-block: 0`), is `pointer-events: none`, `overflow: hidden` (clips overhang), and sits at `z-index: 0`. Each slot is `position: absolute` and placed with logical inset properties, given a reduced opacity (0.5–0.6) and small rotations/scales for a scattered, low-key look.

### Script
The `<script setup lang="ts">` block is intentionally empty aside from a comment — no props, emits, or reactive state.

## Notes

- Must be the first child of a `position: relative` ancestor (documented as `.petstore__inner`); its `inset-block: 0` and z-index 0 assume it sits below `.petstore__content` (z-index 1).
- SVG `id`s (`psbk-pot-a`, `psbk-pot-b`, `psbk-seat`, `psbk-treats-front`, `psbk-treats-side`, `psbk-treats-clip`) are global to the document; rendering multiple instances of this component would create duplicate IDs.
- The treats text uses the 'Gaegu' cursive font, which must be provided elsewhere for the intended appearance.
- Marked `aria-hidden="true"` and `pointer-events: none` — decorative only, invisible to assistive tech and non-interactive.
