---
source: src/composables/3d-models/food/pellets.ts
source_hash: c091f553e2a583810938c6a3c2a0277565d399f21bfb2183db97e599cf9e712b
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Food Pellet Pile Model

`src/composables/3d-models/food/pellets.ts`

> A composable factory that builds a 3D model of a pile of guinea pig food pellets using Three.js. It renders many small golden-beige cylinders via instanced meshing for efficient, deterministic placement inside a food bowl scene.

### Structure
Exports a single function `createPelletPile` that returns a `THREE.Group` containing one `THREE.InstancedMesh`.

### Logic
- Uses `seededRandom(seed)` to produce deterministic random values so the pile looks identical across renders for a given seed.
- Defines a shared `CylinderGeometry` (radius 0.08, height 0.22, 8 radial segments for octagonal flat-ended pellets) and a `MeshStandardMaterial` in golden beige (`0xC9A66B`, roughness 0.7, no metalness).
- Creates an `InstancedMesh` of `count` instances with shadow casting/receiving enabled.
- Iterates over each instance, using a `THREE.Object3D` dummy to compute a transform matrix:
  - **Position**: circular distribution via `sqrt(random) * 0.6` radius and random angle, clustering toward center. Vertical `y` is layered (`floor(i/5)` groups of 5) starting at -0.5 to sit low in a bowl, with per-instance jitter.
  - **Rotation**: uses `YXZ` euler order — random Y direction, X of `PI/2` (plus tilt jitter) to lay pellets flat, and slight Z roll jitter.
- Each dummy matrix is applied via `setMatrixAt`, then `instanceMatrix.needsUpdate` is set true before adding the mesh to the group.

## Exports

- **createPelletPile** (function) — `createPelletPile(count?: number, seed?: number): THREE.Group`: Builds a group containing an InstancedMesh of food pellets. `count` defaults to 15, `seed` defaults to 54321. Returns a THREE.Group ready to add to a scene.

## Internal dependencies

- `three`
- `../shared/utils`

## Notes

- Placement assumes ~3 layers of 5 pellets (floor(i/5)); non-multiples of 5 or different counts will alter layer distribution.
- Y base offset of -0.5 is tuned to sit inside a bowl relative to other food items (comment references carrot at -0.6).
- Geometry and material are created per call (not shared across invocations); disposal is the caller's responsibility to avoid GPU memory leaks.
