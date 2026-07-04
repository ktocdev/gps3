---
source: src/composables/use3DSync.ts
source_hash: b06cdce64633ea55a494800faf65a092ba80b9829b0d8ce1b0e0795b7577bce5
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# use3DSync composable

`src/composables/use3DSync.ts`

> A Vue composable that synchronizes guinea pig game state with a Three.js scene. It creates, positions, rotates, and disposes 3D guinea pig models inside a THREE.Group based on the active guinea pig collection and their positions, supporting both grid-based positioning (from habitatConditions) and world-coordinate autonomous movement (from movement3DStore).

### Coordinate helpers
`gridToWorld(col, row)` and `gridToWorldWithOffset(pos)` convert 2D grid coordinates into `THREE.Vector3` world coordinates. The grid is centered by subtracting half the column/row count and scaling by `GRID_CONFIG.CELL_SIZE`; offsets are converted from pixels via `PIXELS_PER_CELL`. Y is always 0 (ground level), and grid row maps to world Z.

### use3DSync(worldGroup, options)
Instantiates the `habitatConditions`, `guineaPigStore`, and `movement3DStore` Pinia stores. It maintains two Maps: `guineaPigModels` (id → THREE.Group) and `previousPositions` (id → Vector3), plus an array of watcher stop handles.

**Model lifecycle watcher** — watches `guineaPigStore.collection.activeGuineaPigIds` (immediate). For newly active IDs it fetches the guinea pig, maps appearance to 3D colors via `getGuineaPig3DColors`, creates a model with `createGuineaPigModel`, tags `userData.guineaPigId` for raycasting, stores it, and adds it to `worldGroup`. For models no longer active it disposes, removes from group, and deletes registry entries.

**Position watcher** — branch depends on `options.use3DMovement`:
- When `true`: watches a snapshot array built from `movement3DStore.guineaPigStates` (x, z, rotation) with `deep`, and sets each model's position and `rotation.y` directly from world coordinates.
- When `false` (default): watches `habitatConditions.guineaPigPositions` deeply, converts each position with `gridToWorldWithOffset`, computes movement delta against the stored previous position, and updates `rotation.y` via `atan2(deltaX, deltaZ)` only when distance exceeds `ANIMATION_CONFIG.MOVEMENT_THRESHOLD`. Position is copied and cached as previous.

**cleanup()** stops all watchers, disposes and removes all models, and clears both Maps.

Returns `{ guineaPigModels, gridToWorld, gridToWorldWithOffset, cleanup }`.

## Exports

- **Use3DSyncOptions** (type) — `interface Use3DSyncOptions { use3DMovement?: boolean }`: Options controlling sync behavior; use3DMovement selects world-coordinate movement (movement3DStore) vs grid positions (habitatConditions, default).
- **gridToWorld** (function) — `(col: number, row: number) => THREE.Vector3`: Converts a 2D grid cell to centered 3D world coordinates (Y=0).
- **gridToWorldWithOffset** (function) — `(pos: { x: number; y: number; offsetX?: number; offsetY?: number }) => THREE.Vector3`: Converts a grid position with optional pixel offsets to 3D world coordinates.
- **use3DSync** (composable) — `(worldGroup: THREE.Group, options?: Use3DSyncOptions) => { guineaPigModels: Map<string, THREE.Group>; gridToWorld; gridToWorldWithOffset; cleanup: () => void }`: Sets up watchers that create/remove/position guinea pig 3D models in worldGroup, syncing with game stores. Returns the model registry, coordinate helpers, and a cleanup function.

## Internal dependencies

- `../stores/habitatConditions`
- `../stores/guineaPigStore`
- `../stores/movement3DStore`
- `./use3DGuineaPig`
- `../constants/3d`
- `../constants/guineaPigColors`
- `three`
- `vue`

## Notes

- Callers must invoke the returned cleanup() to stop watchers and dispose Three.js models, otherwise GPU resources and reactive watchers leak.
- The use3DMovement branch is chosen once at setup time and cannot switch at runtime.
- In grid mode, rotation only updates when movement exceeds ANIMATION_CONFIG.MOVEMENT_THRESHOLD; in 3D-movement mode rotation is applied directly with no threshold.
- Grid row (pos.y) maps to world Z, not world Y; Y is always ground level (0).
- Emits console.log on every model creation.
- Mutates the passed-in worldGroup by adding/removing children as a side effect.
