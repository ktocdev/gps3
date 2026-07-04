---
source: src/composables/3d-models/shelters/tunnels.ts
source_hash: 0563a1c02beeea12d55187cf650d454415c5180731eaf431c88b10ff17fd2552
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Wooden Tunnel 3D Model

`src/composables/3d-models/shelters/tunnels.ts`

> Provides a factory function that builds a purchasable wooden archway tunnel as a Three.js Group, used for shelter models in the 3D scene. It constructs a hollow arch cross-section, extrudes it into a tunnel, and applies wood textures/materials.

The file exports a single function `createWoodenTunnelModel` that returns a `THREE.Group`.

### Geometry
It builds a 2D `THREE.Shape` representing a hollow arch (outer and inner radii, with straight legs and no floor), using `moveTo`, `lineTo`, and `absarc` calls. All dimensions are documented as reduced 15% from earlier values (legHeight 1.785, outerRadius 3.4, innerRadius 2.72). The shape is extruded via `THREE.ExtrudeGeometry` with bevel enabled and a depth of 6.8.

### Materials
A wood texture is obtained from `createWoodTexture()`. Two `MeshStandardMaterial`s are created — a darker side material (0x8B4513) and a lighter end/cap material (0xDEB887) — both using the wood texture as color map and bump map. These are passed as a material array so the extruded sides and caps get different materials.

### Assembly
A single `THREE.Mesh` is created from the geometry and material array, positioned at `y = 1.785` (matching legHeight), rotated 90° around Y, and set to cast and receive shadows. The mesh is added to the group, which is returned.

## Exports

- **createWoodenTunnelModel** (function) — `createWoodenTunnelModel(): THREE.Group`: Creates and returns a Three.js Group containing a single extruded wooden archway tunnel mesh with wood side/end materials, shadow casting enabled, rotated 90° on Y and positioned at y=1.785.

## Internal dependencies

- `three`
- `../shared/textures`

## Notes

- Position y and legHeight are coupled (both 1.785); comments indicate all dimensions were uniformly reduced 15% from prior values.
- The arch shape intentionally has no floor — only the wall thickness connects the two legs.
- Materials are supplied as an array so ExtrudeGeometry's side (index 0) and cap (index 1) groups receive different materials.
