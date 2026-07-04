---
source: src/composables/3d-models/shared/geometry.ts
source_hash: c5c3693e39311b353f3bc578df397b324ee44152c21d500d750db6dacf16c063
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Geometry Displacement Utility

`src/composables/3d-models/shared/geometry.ts`

> A shared utility for 3D model composables that displaces the vertices of a Three.js BufferGeometry to create an organic, natural appearance. It exists to add randomized (and optionally twisted) deformation to geometry while keeping shared vertices consistent so seams don't tear apart.

The file exports a single function, `displaceVertices`, that mutates a `THREE.BufferGeometry` in place.

### Logic
It reads the geometry's `position` attribute and iterates over every vertex. For each vertex it builds a string key from the x/y/z coordinates rounded to 4 decimal places. A `displacementMap` keyed by this string caches the computed `dx`/`dz` offsets, so vertices sharing the same position receive identical displacement (preventing gaps between shared vertices).

For a new position, it generates random offsets in the range `[-magnitude/2, +magnitude/2]` for both x and z. If a non-zero `twist` value is provided, it adds `sin(y*3)*twist` to `dx` and `cos(y*3)*twist` to `dz`, producing a height-dependent twisting effect. The offsets are applied to x and z only (y is left unchanged) and written back via `posAttr.setXYZ`.

After processing all vertices, it calls `geometry.computeVertexNormals()` so lighting reflects the new shape.

## Exports

- **displaceVertices** (function) — `displaceVertices(geometry: THREE.BufferGeometry, magnitude: number, twist?: number): void`: Mutates the given geometry's vertex positions by applying cached random (and optional twist) displacement on the X and Z axes, then recomputes vertex normals. `twist` defaults to 0. Returns nothing; modifies the geometry in place.

## Internal dependencies

- `three`

## Notes

- Mutates the passed geometry in place rather than returning a copy.
- Only X and Z coordinates are displaced; Y is preserved.
- Vertex matching relies on toFixed(4) string keys, so positions that differ beyond 4 decimals are treated as distinct.
- Uses Math.random(), so results are non-deterministic across calls.
