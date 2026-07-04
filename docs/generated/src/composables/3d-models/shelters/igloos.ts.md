---
source: src/composables/3d-models/shelters/igloos.ts
source_hash: 5ff8719ef243159fd930034be2a19eb4130d87af8adeba86d8d65a3f09804db1
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Igloo Shelter 3D Model

`src/composables/3d-models/shelters/igloos.ts`

> This file provides a factory function that builds a Three.js group representing an igloo-style shelter model, used as a 3D shelter representation in the gps3 application. It constructs a translucent pink dome with a carved-out entrance and an attached tunnel.

## Structure

The module exports a single function `createShelterModel()` that returns a `THREE.Group`.

### Material & clipping
A horizontal floor clipping plane (`THREE.Plane` at y=0, normal up) is created and attached to a shared `MeshPhysicalMaterial` (`shelterMat`) — pink (`0xFF69B4`), 50% opacity, transparent, double-sided, low roughness, no metalness, with `depthWrite: false`. The clipping plane prevents geometry from rendering below ground.

### Dome with entrance cutout
A high-resolution hemisphere (`SphereGeometry`, radius 3.5, 256×128 segments, capped at PI/2 for a dome) is built. The code iterates over the geometry's index buffer in groups of 3 (triangles). For each triangle it reads the three vertex positions and computes each vertex's squared distance from the y-axis in the x/y plane. Triangles where all three vertices have `z > 2.2` and lie within a cutout radius (~1.85) are skipped, carving an entrance opening. The remaining indices are reassembled via `setIndex`. The resulting dome mesh has shadows disabled and is added to the group.

### Entrance tunnel
An open-ended cylinder (`CylinderGeometry`, radius 2.0, height 1.6, 64 radial segments) is created, rotated to horizontal (`-PI/2` on X), and positioned at z=3.8 to overlap the dome's entrance edge, hiding jagged cutout edges. It uses the same material and is added to the group.

The assembled group is returned.

## Internal dependencies

- `three`

## Notes

- The cutout logic depends on the sphere geometry being indexed; if `domeGeo.index` is null the cutout is silently skipped.
- The dome and tunnel share the same material instance including the floor clipping plane, so renderer local clipping must be enabled for clipping to take effect.
- Cutout removal only skips triangles where ALL three vertices fall in the cutout area, intentionally leaving a rougher edge that the tunnel is positioned to hide.
- Vertices created with the shared material use `depthWrite: false`, which can cause transparency sorting artifacts depending on scene composition.
