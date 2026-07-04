---
source: src/composables/3d/use3DWaterBottle.ts
source_hash: 9c18116ddf3c39fb6473e89d3175234337404ac0cc64fe6ae2fd93ac2b89a726
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# use3DWaterBottle Composable

`src/composables/3d/use3DWaterBottle.ts`

> A Vue composable that manages the interactive water bottle menu and refill/removal actions for water bottle items placed in a 3D habitat scene. It bridges Three.js item models with the habitat conditions, supplies, and logging stores to allow players to refill or remove water bottles.

### State
Exposes reactive refs `showWaterBottleMenu` (menu visibility), `waterBottleMenuPosition` (`{x, y}` screen coordinates), and `selectedBottlePlacementId` (currently targeted bottle). It also holds two non-reactive internal references: `itemModels` (a `Map<string, THREE.Group>` of placed models) and `habitatCare` (the result of `use3DHabitatCare`), both assigned via `init` and cleared in `dispose`.

### Computed
`currentBottleName` derives the bottle's display name from the supplies store using the base item ID of the selected placement. `currentBottleWaterLevel` returns the water level via `habitatConditions.getWaterBottleLevel`, defaulting to 100 when nothing is selected.

### Functions
- `init` / `dispose`: wire up and tear down the Three.js model map and habitat care references.
- `findWaterBottleModel`: returns the first model whose supply item `stats.itemType === 'water_bottle'`.
- `getAllWaterBottles`: returns all water bottle models paired with their placement IDs (for per-bottle animation updates).
- `openMenu` / `closeMenu`: toggle the menu, set position, and set/clear the selected placement.
- `handleRefill`: calls `habitatConditions.refillWater`, logs a player action (if ≥1% filled), and populates the shared action-result dialog on `habitatCare` (icon, title, message, stats) before showing it.
- `handleRemoveWaterBottle`: removes the item from the habitat via `habitatConditions.removeItemFromHabitat`, logs the removal with the item's emoji, and closes the menu.
- `isMenuOpen`: returns the current menu visibility.

### Data flow
Placement IDs are converted to base item IDs via `getBaseItemId` before lookups in the supplies store. Water levels and refill/removal operations flow through the habitat conditions store; user-facing feedback flows through the logging store and the habitatCare dialog refs.

## Exports

- **use3DWaterBottle** (composable) — `function use3DWaterBottle(): { showWaterBottleMenu, waterBottleMenuPosition, selectedBottlePlacementId, currentBottleName, currentBottleWaterLevel, init, dispose, findWaterBottleModel, getAllWaterBottles, openMenu, closeMenu, handleRefill, handleRemoveWaterBottle, isMenuOpen }`: Composable returning reactive menu state, computed bottle name/water level, lifecycle methods (init/dispose), and action handlers for refilling and removing water bottles in a 3D habitat.

## Internal dependencies

- `../../stores/habitatConditions`
- `../../stores/loggingStore`
- `../../stores/suppliesStore`
- `../../utils/placementId`
- `./use3DHabitatCare`
- `vue`
- `three`

## Notes

- `init` must be called with `itemModels` and `habitatCare` before `handleRefill` and model-finding functions work; otherwise they warn/return empty.
- `handleRefill` mutates the shared `habitatCare` dialog refs (actionResultIcon/Title/Message/Stats, showActionResultDialog), coupling this composable to the internal ref shape of use3DHabitatCare.
- Water bottle detection relies on the supply item's `stats.itemType === 'water_bottle'`; placement IDs are resolved to base item IDs via getBaseItemId.
- `handleRemoveWaterBottle` relies on habitatConditions.removeItemFromHabitat to also unmark inventory internally.
