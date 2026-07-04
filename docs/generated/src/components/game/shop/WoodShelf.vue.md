---
source: src/components/game/shop/WoodShelf.vue
source_hash: 3e5c467f6a95bc6d1e9ac3897b29a8c7a7f4f96ad085a01d40093984dc1008e9
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# WoodShelf

`src/components/game/shop/WoodShelf.vue`

> A presentational Vue SFC that renders a decorative wooden shelf surface with wood-grain detailing, an underside, brackets, and an optional label tag. It wraps arbitrary slotted content displayed above the shelf board.

### Structure
The root `.wood-shelf` element renders a default `<slot />` for whatever content should sit on the shelf, followed by a `.wood-shelf__board` container marked `aria-hidden="true"` (purely decorative).

### Decorative elements
Inside the board are three grain-line divs (`--1`, `--2`, `--3`), an `__underside`, and two `__bracket` divs (`--start` and `--end`). These are static visual decorations.

### Label
When the `label` prop is provided (truthy), a `.wood-shelf__tag` div is rendered displaying the label text; otherwise it is omitted via `v-if`.

### Script
Uses `<script setup lang="ts">` and declares a single optional prop `label` via `defineProps`. There is no reactive state, emits, or logic beyond prop declaration.

## Exports

- **WoodShelf** (component) — `<WoodShelf :label?="string"><!-- slotted content --></WoodShelf>`: Decorative shelf component. Props: `label?: string` — optional text shown in a tag on the shelf board. Slots: default slot for content placed above the shelf. No emits.

## Notes

- No `<style>` block is present in this file; the referenced BEM classes (wood-shelf__*) must be styled elsewhere (global or parent stylesheet) for the visual appearance to render.
