---
source: src/composables/3d-models/food/vegetables.ts
source_hash: 507fe5476bca1114c5b8c57dc4661714a81b7c72c4215a6ab4bc60b4cb7159aa
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Vegetable 3D Models

`src/composables/3d-models/food/vegetables.ts`

> A composable module that provides factory functions to build simple Three.js 3D representations of vegetables (a julienne carrot stick and a cucumber slice) for use in food displays within bowls in the gps3 scene.

This file exports two pure factory functions that each construct and return a `THREE.Group`.

### createCarrotStick
Creates an orange `MeshStandardMaterial` and a `BoxGeometry` (2.5 × 0.3 × 0.3) representing a thick julienne carrot strip. The mesh is positioned at `y = -0.6` to align visually with cucumber slices in bowls, has shadows enabled (cast and receive), and is added to the returned group.

### createCucumberSlice
Builds two materials: a dark green `skinMat` and a light mint-green double-sided `fleshMat`. The main slice is a half `CylinderGeometry` (radius 1.0, thickness 0.2, 32 segments, theta length `Math.PI` for a half circle) using a material array `[skinMat, fleshMat, fleshMat]` to color the curved surface versus the caps. A thin `BoxGeometry` (2.0 × 0.2 × 0.04) is added as the flat cut surface, rotated 90° around Y and slightly offset on X. Both meshes cast/receive shadows and are added to the group.

Both functions are stateless and return fresh geometry/material instances on each call.

## Exports

- **createCarrotStick** (function) — `createCarrotStick(): THREE.Group`: Returns a THREE.Group containing a single orange box mesh representing a julienne carrot stick, positioned at y = -0.6 with shadows enabled.
- **createCucumberSlice** (function) — `createCucumberSlice(): THREE.Group`: Returns a THREE.Group containing a half-cylinder cucumber slice (with green skin and mint flesh materials) plus a thin box representing the flat cut surface, both with shadows enabled.

## Internal dependencies

- `three`

## Notes

- Each call allocates new geometries and materials that are not disposed here; callers are responsible for cleanup to avoid GPU memory leaks.
- The carrot's y = -0.6 offset is hardcoded specifically to align with cucumber slices in bowls, coupling this model's positioning to the bowl display context.
