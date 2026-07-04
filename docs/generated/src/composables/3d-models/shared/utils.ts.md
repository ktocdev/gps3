---
source: src/composables/3d-models/shared/utils.ts
source_hash: cf78120da4d3dfd14ebbde2beaea9238f21d7090ed5e51c2736dabc6cf40b4ab
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# 3D Model Shared Utils

`src/composables/3d-models/shared/utils.ts`

> A small utility module providing coordinate conversion between grid space and Three.js world space, plus a deterministic seeded random number generator used by the 3D model composables. It exists to centralize grid/world math and provide consistent randomness so models don't regenerate differently on each render.

This module exports three pure functions built around `GRID_CONFIG` constants and Three.js.

### Coordinate conversion
`gridToWorld(x, y)` maps grid cell coordinates to a `THREE.Vector3`, centering the grid by subtracting half the column/row count and scaling by `CELL_SIZE`. The Y component is always `0` (ground plane); grid Y maps to world Z.

`worldToGrid(worldX, worldZ)` is the inverse, dividing by `CELL_SIZE`, adding the half-grid offset, and rounding to the nearest integer cell, returning `{ x, y }`.

### Seeded randomness
`seededRandom(seed)` returns a closure implementing a linear congruential generator (LCG) with constants `9301`, `49297`, modulus `233280`. Each call advances internal `state` and returns a normalized float in `[0, 1)`. This yields reproducible pseudo-random sequences from a fixed seed to keep model generation stable across renders.

## Exports

- **gridToWorld** (function) — `(x: number, y: number) => THREE.Vector3`: Converts grid cell coordinates to centered 3D world coordinates (Y=0, grid Y mapped to world Z), scaled by GRID_CONFIG.CELL_SIZE.
- **worldToGrid** (function) — `(worldX: number, worldZ: number) => { x: number; y: number }`: Inverse of gridToWorld; converts world X/Z coordinates back to rounded integer grid coordinates.
- **seededRandom** (function) — `(seed: number) => () => number`: Returns an LCG-based generator closure that produces deterministic floats in [0, 1) from the given seed.

## Internal dependencies

- `three`
- `../../../constants/3d`

## Notes

- gridToWorld and worldToGrid assume grid Y corresponds to world Z; the world Y axis is always 0.
- seededRandom relies on mutable closure state, so each returned generator is stateful and independent.
