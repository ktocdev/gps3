---
source: src/composables/3d-models/shared/textures.ts
source_hash: 45658f278bcb34c2962f66a99493a41caa22d172970a72b16fbadbe2aae88cfb
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Wood Texture Generator

`src/composables/3d-models/shared/textures.ts`

> This file provides a utility to procedurally generate a wood-grain texture using the HTML canvas API, returning a Three.js CanvasTexture for use in 3D models. It exists to give 3D scenes a natural wood appearance without loading external image assets.

The module exports a single function, `createWoodTexture`, which creates a 512x512 canvas and draws a procedural wood pattern.

### Drawing steps
1. Fills the canvas with a burlywood base color (`#DEB887`).
2. Draws 100 vertical grain lines with randomized x-position, thickness (1-4px), and opacity (0.1-0.3), using a dark brown stroke. Each line is made wavy by applying a sine-based horizontal drift over the vertical axis.
3. Adds 5000 random black/white pixels at low opacity (0.05) for noise/texture variation.

### Texture output
The canvas is wrapped in a `THREE.CanvasTexture` configured with `RepeatWrapping` on both axes and a repeat of `(4, 1)`, then returned.

## Exports

- **createWoodTexture** (function) — `createWoodTexture(): THREE.CanvasTexture`: Generates a procedural wood-grain texture on a 512x512 canvas and returns it as a Three.js CanvasTexture with horizontal 4x tiling.

## Internal dependencies

- `three`

## Notes

- Uses `document.createElement('canvas')`, so it requires a browser/DOM environment and cannot run in a pure server-side context.
- The 2D context is retrieved with a non-null assertion (`getContext('2d')!`); it assumes the context is always available.
- Output is non-deterministic since grain lines and noise use `Math.random()`, so each call produces a unique texture.
