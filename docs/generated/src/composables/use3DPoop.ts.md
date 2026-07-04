---
source: src/composables/use3DPoop.ts
source_hash: af8dbc63e085dd082e18f29ee52b79a11a1de6ad983b5a214edcc8bd40bf1f5b
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# use3DPoop composable

`src/composables/use3DPoop.ts`

> A Vue composable that synchronizes guinea pig poop pellets from the habitat conditions store into a Three.js scene. It creates, positions, and removes 3D pellet meshes as the store's poop list changes, and provides click detection to identify which poop was clicked.

### Coordinate conversion
`subgridToWorld` converts subgrid coordinates (4× finer than the base grid) into Three.js world coordinates using `GRID_CONFIG` (COLS, ROWS, CELL_SIZE). It divides by a fixed `SUBGRID_TO_GRID_SCALE` of 4, then centers on the grid.

### Model creation
`createPoopModel` builds an elongated `CapsuleGeometry` pellet with a dark-brown `MeshStandardMaterial`, positions it slightly above ground (y=0.1), enables shadows, rotates it to lie horizontally, and applies a random y-rotation for variety.

### Main composable
`use3DPoop(worldGroup)` reads the `useHabitatConditions` store and maintains a `Map<string, THREE.Mesh>` (`poopModels`) keyed by poop ID. A deep, immediate `watch` on `habitatConditions.poops` reconciles the scene: for each new poop ID it creates a model, positions it using `worldX`/`worldZ` when present (3D) or falling back to `subgridToWorld(x, y)` (2D), stores the poop ID in `mesh.userData.poopId`, and adds it to `worldGroup`. Poops no longer present are disposed via `disposeObject3D`, removed from the group, and deleted from the map. Watcher stop handles are collected in `stopWatchers`.

### Click detection & cleanup
`handlePoopClick` returns the `poopId` from a clicked object's `userData` (or its parent's), else null. `cleanup` stops all watchers, disposes and removes all models, and clears the map.

## Exports

- **use3DPoop** (composable) — `use3DPoop(worldGroup: THREE.Group): { poopModels: Map<string, THREE.Mesh>, handlePoopClick: (obj: THREE.Object3D) => string | null, cleanup: () => void }`: Syncs store poop entries to 3D meshes within the given worldGroup. Returns the model registry, a click-detection helper, and a cleanup function.

## Internal dependencies

- `../stores/habitatConditions`
- `../constants/3d`
- `../utils/three-cleanup`
- `three`
- `vue`

## Notes

- The watcher is deep and immediate, so it runs synchronously on setup and re-evaluates the entire poops array on any nested change.
- Poop position uses worldX/worldZ if both are defined; otherwise falls back to converting subgrid x/y coordinates.
- Callers must invoke cleanup() manually to stop watchers and dispose geometries/materials, otherwise meshes leak.
- SUBGRID_TO_GRID_SCALE is hardcoded to 4 inside subgridToWorld.
