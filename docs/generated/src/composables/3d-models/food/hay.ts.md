---
source: src/composables/3d-models/food/hay.ts
source_hash: 79039e9b1f77e4737724b999e1471cf61455709f2506bcdddb0bc307ac3e5217
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Hay Pile 3D Model

`src/composables/3d-models/food/hay.ts`

> A composable factory function that builds a simplified 3D hay pile mesh for food bowls using Three.js. It produces deterministic, seed-based hay strand placement so the pile appears static rather than animated on re-renders.

### Structure
Exports a single function `createHayPile` that returns a `THREE.Group` containing two `InstancedMesh` objects: upright strands and flat strands.

### Serving scaling
The `servings` argument controls density via `servingMultiplier` — 2+ servings yields 100% of configured instance counts, 1 serving yields 50%. Counts come from `ITEM_CONFIG.HAY.INSTANCES_UPRIGHT` and `INSTANCES_FLAT`.

### Determinism
A `seededRandom(seed)` generator is used for all random placement so output is reproducible for a given seed, preventing visual flicker/animation.

### Upright strands
Built from a `BoxGeometry` sized by `HAY.STRAND_WIDTH`/`STRAND_THICKNESS`, translated so its pivot is at the bottom. Strands are distributed in a circle (radius up to 1.25 via `sqrt` for even area distribution), positioned with height variation, and rotated to lean outward from center for an "exploding" look, with random spin and length scaling. Each instance gets a random color from `HAY.COLORS`.

### Flat strands
Built from a slightly wider/thinner box, distributed in a larger circle (radius up to 1.35), positioned with more vertical variation, and rotated to be mostly horizontal (near `PI/2` on X) with slight roll and random spin. Also randomly colored.

### Rendering flags
Both meshes have `castShadow`/`receiveShadow` enabled, `matrixAutoUpdate = false`, and their `instanceMatrix`/`instanceColor` buffers flagged `needsUpdate` after population. A shared `THREE.Object3D` dummy computes per-instance matrices.

## Exports

- **createHayPile** (function) — `createHayPile(servings?: number, seed?: number): THREE.Group`: Creates a hay pile Group with two InstancedMeshes (upright and flat strands). `servings` (default 2) scales instance density (>=2 = full, else 50%); `seed` (default 12345) seeds deterministic random placement.

## Internal dependencies

- `three`
- `../../../constants/3d (ITEM_CONFIG)`
- `../shared/utils (seededRandom)`

## Notes

- Relies on ITEM_CONFIG.HAY having INSTANCES_UPRIGHT, INSTANCES_FLAT, STRAND_WIDTH, STRAND_THICKNESS, and COLORS defined.
- matrixAutoUpdate is disabled on both meshes, so transforms are fixed at creation; callers must not rely on automatic matrix recomputation.
- Geometries and materials are created fresh per call and are not disposed here — callers are responsible for disposal to avoid GPU memory leaks.
