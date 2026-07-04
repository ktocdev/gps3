---
source: src/composables/3d-models/bedding/beds.ts
source_hash: 9cd567bbc6f6e546f21e6e5f86ca5301f6c4ae83457069dc1d8f52e4b055bc72
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Bed Model Factory

`src/composables/3d-models/bedding/beds.ts`

> A composable module that builds a simple 3D bed/mat model using Three.js. It provides a single factory function returning a THREE.Group representing a flat bedding mat, intended for use in the application's 3D scene rendering.

This file exports one function, `createBedModel`, which constructs and returns a `THREE.Group`.

### Logic
- Creates an empty `THREE.Group` container.
- Builds a `PlaneGeometry` of 3.0 x 3.0 units (noted as scaled up 2x).
- Applies a `MeshStandardMaterial` with a brownish color (`0x8B7355`), high roughness (0.9), and `DoubleSide` rendering.
- Creates a `Mesh` from the geometry and material, rotates it flat (`rotation.x = -PI/2`) to lie on the ground plane, and offsets it slightly upward (`position.y = 0.04`).
- Enables `receiveShadow` on the mesh so it can display shadows cast by other objects.
- Adds the mesh to the group and returns the group.

There is no state, reactivity, or side effects beyond object construction; each call produces a fresh independent group.

## Exports

- **createBedModel** (function) — `createBedModel(): THREE.Group`: Constructs and returns a THREE.Group containing a single flat plane mesh styled as a bedding mat, rotated to lie horizontally and positioned slightly above ground with shadow receiving enabled.

## Internal dependencies

- `three`

## Notes

- The mesh receives shadows but does not cast them (castShadow is not set).
