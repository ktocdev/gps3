---
source: src/composables/use3DTextures.ts
source_hash: a7eabefdfb5315c2fd37bd2959348d54619a4ba67a5d34da0d3a1045f4f21985
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# use3DTextures

`src/composables/use3DTextures.ts`

> A utility module providing helper functions for generating procedural Three.js textures and modifying geometry vertices. It exists to create natural wood-grain textures and to apply organic displacement to 3D geometries used in the application's 3D scenes.

This module exports two standalone functions built on Three.js.

### createWoodTexture
Creates a 512x512 canvas, fills it with a burlywood base color (`#DEB887`), then draws 100 wavy vertical grain lines using randomized position, thickness, and opacity with a sine-based drift. It adds 5000 randomly placed black/white noise pixels at low opacity for texture variation. The canvas is wrapped in a `THREE.CanvasTexture` with `RepeatWrapping` on both axes and a repeat of `(4, 1)`, then returned.

### displaceVertices
Mutates a `THREE.BufferGeometry` in place by iterating over its position attribute. For each vertex it builds a position key (rounded to 4 decimals) to ensure shared/coincident vertices receive consistent displacement via a `displacementMap` cache. New displacements are random in x and z scaled by `magnitude`, with an optional twist effect applied using sine/cosine of the vertex's y coordinate. After applying displacements, it calls `computeVertexNormals()` to fix lighting.

Both functions rely on browser DOM APIs (canvas) and are intended for client-side/3D rendering contexts.

## Exports

- **createWoodTexture** (function) — `createWoodTexture(): THREE.CanvasTexture`: Generates a procedural wood-grain texture via a 512px canvas (burlywood base, wavy grain lines, noise) and returns a repeating CanvasTexture (repeat 4x1).
- **displaceVertices** (function) — `displaceVertices(geometry: THREE.BufferGeometry, magnitude: number, twist?: number): void`: Displaces geometry vertices in the x/z plane by a random amount scaled by magnitude, with an optional twist effect. Shared vertices at the same position get identical displacement; recomputes vertex normals. Mutates the geometry in place.

## Internal dependencies

- `three`

## Notes

- createWoodTexture depends on the DOM (document.createElement('canvas')); it will fail in non-browser/SSR environments.
- displaceVertices mutates the passed geometry in place rather than returning a copy.
- Only x and z coordinates are displaced; y is preserved. The shared-vertex map keys positions at 4-decimal precision, so vertices must match closely to share displacement.
