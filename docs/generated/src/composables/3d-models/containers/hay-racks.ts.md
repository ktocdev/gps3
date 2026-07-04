---
source: src/composables/3d-models/containers/hay-racks.ts
source_hash: 94cde3f12dca9caa5b3225aadaebb0f437265b4504e62a58bc240e4224443618
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Hay Rack 3D Model

`src/composables/3d-models/containers/hay-racks.ts`

> This composable builds a procedurally-generated Three.js model of a cylindrical wooden hay rack, including its wooden structural parts (base, top ring, vertical dowels) and instanced hay strands whose density and appearance depend on the rack's current contents from the habitat conditions store.

### Structure
The primary export `createHayRackModel(hayRackItemId)` returns a `THREE.Group`. It defines a hardcoded `config` object (radii, height, thickness, dowel count/radius, wood color) and creates a single shared `MeshStandardMaterial` using `createWoodTexture()`.

It assembles three wooden parts:
- **Base disc** — a `CylinderGeometry` positioned at half its thickness.
- **Top ring** — a `TorusGeometry` rotated horizontal at `config.height`.
- **Vertical dowels** — `config.dowelCount` (10) cylinder meshes arranged evenly around the base circle, reusing one geometry.

All meshes cast and receive shadows.

### Hay contents
It calls `habitatConditions.getHayRackContents(hayRackItemId)` to get the list of hay servings. If `servingCount > 0`, it delegates to the private `createHayRackHay(servings, hayRackItemId, config)` helper.

`createHayRackHay` derives a numeric seed by summing char codes of `hayRackItemId` and creates a deterministic `seededRandom` generator so a given rack always looks the same. `fillLevel` is `min(servings/5, 1)` and drives all counts and heights. It builds up to three `InstancedMesh` groups of box-geometry hay strands (geometry pivoted at bottom via `translate`):
- **Interior hay** — ~150·fillLevel mostly-upright strands distributed within the cylinder.
- **Poking-out hay** — ~80·fillLevel shorter strands at the rack edge pointing outward between dowels.
- **Top overflow hay** — only when `fillLevel > 0.5`, ~40·(fillLevel−0.5)·2 strands sticking up from the top.

Each instance gets a per-instance matrix (position/rotation/scale via a shared `Object3D` dummy) and a random color from `ITEM_CONFIG.HAY.COLORS`. Instance matrix/color buffers are flagged `needsUpdate`.

## Exports

- **createHayRackModel** (function) — `createHayRackModel(hayRackItemId: string): THREE.Group`: Builds and returns a Three.js group representing a cylindrical wooden hay rack with base, top ring, dowels, and (if the rack has contents per the habitat store) instanced hay strands.

## Internal dependencies

- `three`
- `../../../stores/habitatConditions`
- `../shared/textures`
- `../shared/utils`
- `../../../constants/3d`

## Notes

- Reads live rack contents via useHabitatConditions().getHayRackContents(); the model reflects state at call time only and is not reactive.
- Hay appearance is deterministic per hayRackItemId because the seed is derived by summing character codes; different IDs with equal char-code sums would produce identical hay.
- fillLevel saturates at 5 servings; hay density/height do not increase beyond that.
- createHayRackHay is private (not exported) and assumes config contains baseRadius, height, and baseThickness.
- Creates geometries and materials but performs no disposal; caller is responsible for cleanup to avoid GPU memory leaks.
