---
source: src/composables/3d-models/food/greens.ts
source_hash: 52c86a15f6d006d45dbe808147fd3d33097429fb2e24f49e4abf2a2a837850c4
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Lettuce Pile 3D Model

`src/composables/3d-models/food/greens.ts`

> A composable factory function that procedurally generates a 3D model of torn green lettuce leaves using Three.js. It produces a ruffled, multi-colored pile of leaf pieces intended to sit inside a bowl in the food rendering system, with deterministic placement driven by a seed.

### Geometry
Builds a single shared `PlaneGeometry` (0.8 x 0.6, subdivided 8x6) and displaces each vertex's Z coordinate to create wavy, ruffled leaf edges. Displacement combines sine waves with an `edgeFactor` so edges ruffle more than centers, then recomputes vertex normals.

### Coloring
Defines 5 light-green color variants. The requested `count` is divided across colors via `piecesPerColor = ceil(count / 5)`. For each color it computes how many pieces remain for that group and skips groups with zero.

### Instancing
Each color group is rendered as a single `InstancedMesh` sharing the leaf geometry and a `MeshStandardMaterial` (roughness 0.7, double-sided, no metalness). Instances are positioned using a seeded RNG: circular distribution (`sqrt(random)` radius for center clustering), stacked vertically with an incremental `layerHeight` plus a base Y offset of -0.4 to sit in a bowl, and given mostly-horizontal rotations with slight tilt/spin/roll and scale variation. All meshes cast and receive shadows.

### Output
Returns a `THREE.Group` containing one InstancedMesh per active color group. A shared `THREE.Object3D` dummy is reused to compute per-instance matrices.

## Exports

- **createLettucePile** (function) — `createLettucePile(count?: number, seed?: number): THREE.Group`: Creates a THREE.Group of ruffled lettuce leaves. `count` (default 12) is the number of pieces; `seed` (default 98765) drives deterministic placement. Returns a group of InstancedMeshes.

## Internal dependencies

- `three`
- `../shared/utils`

## Notes

- The `leafGeo` PlaneGeometry is shared across all InstancedMeshes and never disposed here; callers are responsible for disposal to avoid GPU memory leaks.
- Layer height uses `(colorIndex * piecesPerColor + i)` which relies on `piecesPerColor` being the ceil value, not the actual per-group count, so stacking is consistent but the final group may have fewer pieces than `piecesPerColor`.
- Deterministic output depends entirely on `seededRandom` from shared utils; same seed yields identical placement.
