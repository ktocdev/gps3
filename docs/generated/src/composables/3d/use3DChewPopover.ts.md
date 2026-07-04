---
source: src/composables/3d/use3DChewPopover.ts
source_hash: 20a466f2b82db1edea55d321634a02291e189d4086e36f3b35867ea599c0bd1d
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# use3DChewPopover

`src/composables/3d/use3DChewPopover.ts`

> A Vue composable that manages the state and actions for the chew-item popover menu in the 3D habitat view. It tracks which placed chew item is selected, computes its durability status/appearance, and handles discarding unsafe chews.

## State
- `selectedPlacementId` (ref<string|null>): the full placement ID of the currently selected chew.
- `showChewPopover` (ref<boolean>): whether the popover is visible.
- `menuPosition` (ref<{x,y}>): screen position for rendering the popover.

## Computed
- `currentChewData`: looks up chew tracking data via `habitatContainers.getChewData(placementId)`, derives the base item ID via `getBaseItemId`, fetches item metadata from `suppliesStore.getItemById`, and returns a `ChewPopoverData` object (or null if any lookup fails). Emoji defaults to 🪵.
- `isUnsafe`: true when durability is below `CHEW_DEGRADATION.UNSAFE_THRESHOLD`.
- `durabilityStatus`: string tier — Unsafe / Degraded / Worn / Good — based on threshold constants.
- `durabilityColorClass`: corresponding CSS class name (`chew-popover__bar--*`).

## Functions
- `openChewPopover(placementId, position)`: sets the selected ID, position, and shows the popover (logs to console).
- `closeChewPopover()`: hides popover and clears selection.
- `handleDiscardChew()`: for the selected chew, removes it from the habitat (`habitatConditions.removeItemFromHabitat`), removes 1 from inventory by base item ID (`inventoryStore.removeItem`), removes chew tracking (`habitatContainers.removeChewItem`), logs a player action, and closes the popover.
- `isOpen()`: returns the current visibility boolean.

The composable returns state (with `selectedPlacementId` aliased as `selectedChewId` for API compatibility), computed properties, and functions.

## Exports

- **ChewPopoverData** (type) — `interface ChewPopoverData { placementId: string; itemId: string; itemName: string; itemEmoji: string; durability: number; usageCount: number; lastUsedAt: number }`: Shape of the data returned for a selected chew item, combining placement ID, base item metadata, and durability tracking fields.
- **use3DChewPopover** (composable) — `function use3DChewPopover(): { selectedChewId, showChewPopover, menuPosition, currentChewData, isUnsafe, durabilityStatus, durabilityColorClass, openChewPopover, closeChewPopover, handleDiscardChew, isOpen }`: Composable managing the 3D chew popover: selection state, position, durability computeds, and open/close/discard actions.

## Internal dependencies

- `../useHabitatContainers`
- `../../stores/loggingStore`
- `../../stores/suppliesStore`
- `../../stores/inventoryStore`
- `../../stores/habitatConditions`
- `../../constants/supplies`
- `../../utils/placementId`

## Notes

- Chew data is keyed by full placement ID, but metadata and inventory operations use the base item ID derived via getBaseItemId.
- Discard is the only action — chews cannot be returned to inventory; handleDiscardChew both removes from habitat and deducts 1 from inventory.
- Returned key `selectedChewId` is intentionally an alias of the internal `selectedPlacementId` ref for backward API compatibility.
- Contains console.log side effects on open and discard.
