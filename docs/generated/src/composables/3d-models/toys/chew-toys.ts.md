---
source: src/composables/3d-models/toys/chew-toys.ts
source_hash: ce775699f2d3defe09c4d2447d3bd49cd9c6cce31d262ab6c745cd367187e8ca
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Chew Toys 3D Model Factory

`src/composables/3d-models/toys/chew-toys.ts`

> A factory function that builds Three.js Group models for pet chew toys, supporting three variants: a woven twig ball, a wooden chew stick, and a fallback placeholder cube. It uses seeded randomness derived from an item ID so models render deterministically without jitter across re-renders.

### Core Logic
The single export `createToyModel(type, itemId)` creates and returns a `THREE.Group`. It first computes a numeric `seed` by summing the char codes of `itemId`, then creates a deterministic `random` function via `seededRandom(seed)`.

### Ball variant
Builds 12 `TorusGeometry` rings (major radius 1.6, tube 0.12) with a matte tan (`0xCD853F`) `MeshStandardMaterial`. Each ring gets a seeded random rotation on all three axes for a woven look, casts/receives shadows, and is added to the group. The group is positioned at `y = 1.75`.

### Stick variant
Creates a closed `CylinderGeometry` (5.6 long) with subtle vertex displacement via `displaceVertices`. Uses a material array (`[side, topCap, bottomCap]`) with saddle-brown sides and burlywood end caps. The stick is rotated 90° on Z. A smaller displaced cylinder "knob" is added, positioned to intersect the stick and rotated (including a seeded random Y rotation). The group is placed at `y = 0.5` with a seeded random Y rotation.

### Fallback variant
For `'other'`, produces a simple orange `BoxGeometry` cube at `y = 0.5` that casts shadows.

All comments note geometry was scaled 2x from earlier values.

## Exports

- **createToyModel** (function) — `createToyModel(type: 'stick' | 'ball' | 'other', itemId?: string): THREE.Group`: Builds and returns a Three.js Group for a chew toy. `type` selects between a woven twig ball (12 torus rings), a displaced wooden stick with a knob, or a placeholder cube. `itemId` (default `'default_toy'`) seeds deterministic random rotations to prevent re-render jitter.

## Internal dependencies

- `three`
- `../shared/geometry (displaceVertices)`
- `../shared/utils (seededRandom)`

## Notes

- The seed is a simple sum of char codes, so anagram itemIds produce identical seeds/models.
- Stick and knob meshes rely on a 3-element material array matching CylinderGeometry group order [side, top cap, bottom cap].
- The placeholder cube only sets castShadow (not receiveShadow), unlike the other variants.
