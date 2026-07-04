---
source: src/composables/3d/use3DPlacement.ts
source_hash: d3d0dcec35f3e399b5062f2e98622e3b470923e97ada1f3b496054b881184cad
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# use3DPlacement composable

`src/composables/3d/use3DPlacement.ts`

> A Vue composable that manages interactive item placement within the 3D habitat scene. It handles entering/exiting placement mode, rendering a ghost preview mesh that follows the cursor, validating placement positions against grid bounds and occupancy, and committing placed items to the habitat store.

## State
Exposes one reactive ref `placementMode` (`PlacementModeState | null`). Internally holds non-reactive references: `worldGroup` (the THREE.Group the preview is added to), `placementPreview` (the ghost THREE.Group), and `isPlacementValid` (boolean flag).

## Lifecycle
`init(worldGroupRef)` stores the world group reference. `dispose()` removes and disposes the preview via `disposeObject3D`, clears placement mode and the world group reference.

## Placement flow
`enterPlacementMode(itemId)` looks up the supply item from `suppliesStore`, exits any existing mode, determines if the item is a water bottle (by string matching `water` and `bottle` in the id), sets `placementMode`, and builds a semi-transparent green-emissive box preview mesh added to `worldGroup` (initially hidden).

`updatePreviewPosition(intersection)` positions the preview at the intersection's x/z (y=0), makes it visible, runs `validatePlacement`, stores the result in `isPlacementValid`, and recolors the preview green/red via `updatePreviewColor`.

`validatePlacement(worldX, worldZ, mode)` checks bounds using `GRID_CONFIG` width/depth with a 2.0 margin. Water bottles must be on edges; regular items must be inside bounds. Then converts to grid coords via `worldToGrid` and rejects positions overlapping existing `habitatConditions.itemPositions`.

`placeItem()` requires an active, valid placement. It converts the preview position to grid coords, calls `habitatConditions.addItemToHabitat` (getting a placement id), and checks `inventoryStore.getUnplacedCount`. If none remain it exits placement mode; otherwise it stays active for repeated placements.

`exitPlacementMode()` removes/disposes the preview and clears state.

## Queries
`isActive()`, `isCurrentPlacementValid()`, and `getPlacementMode()` expose current status.

## Exports

- **use3DPlacement** (composable) — `function use3DPlacement(): { placementMode, init, dispose, enterPlacementMode, exitPlacementMode, updatePreviewPosition, placeItem, isActive, isCurrentPlacementValid, getPlacementMode }`: Composable managing 3D item placement mode, preview mesh, validation, and committing items to the habitat. Returns a reactive `placementMode` ref plus lifecycle (`init`, `dispose`), action (`enterPlacementMode`, `exitPlacementMode`, `updatePreviewPosition`, `placeItem`), and query (`isActive`, `isCurrentPlacementValid`, `getPlacementMode`) functions.
- **PlacementModeState** (type) — `interface PlacementModeState { itemId: string; itemName: string; isWaterBottle: boolean }`: Describes the currently active placement session: the item being placed, its display name, and whether it is a water bottle (which is placed on edges).

## Internal dependencies

- `../../stores/habitatConditions`
- `../../stores/inventoryStore`
- `../../stores/suppliesStore`
- `../../constants/3d`
- `../../utils/three-cleanup`
- `../3d-models/shared/utils`
- `vue`
- `three`

## Notes

- `init` must be called with a valid worldGroup before `enterPlacementMode`, otherwise placement is refused.
- The preview mesh is a hardcoded 2×1.5×2 box placeholder, not the actual item model.
- Water bottle detection relies on fragile string matching (`itemId.includes('water') && itemId.includes('bottle')`).
- `isPlacementValid` is non-reactive internal state; `updatePreviewPosition` must run before `placeItem` for placement to succeed.
- `placeItem` stays in placement mode when more unplaced instances remain, enabling repeated placements without re-entering mode.
