---
source: src/composables/3d/use3DItemPopover.ts
source_hash: 9df503c8b4af21953e4d969dfe143c372e715ea37d10ed6ffe2740ff9dce52f9
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# use3DItemPopover

`src/composables/3d/use3DItemPopover.ts`

> A Vue composable that manages the state and actions for a general item popover menu in the 3D habitat view. It enables removing certain habitat items (hideaways, toys, enrichment, bowls/bottles) back to inventory, exposing reactive state and handler functions for a popover UI.

## State
Maintains three reactive refs: `selectedPlacementId` (the full placement ID of the selected item), `showItemPopover` (visibility boolean), and `menuPosition` (`{x, y}` screen coordinates).

## Data flow
`currentItemData` is a computed that derives display data from `selectedPlacementId`. It extracts the base item ID via `getBaseItemId`, looks up metadata through `suppliesStore.getItemById`, and returns an `ItemPopoverData` object (placementId, itemId, name, emoji defaulting to 📦, subCategory) or `null`.

`canRemoveItem` checks whether a given ID (placement or base) belongs to one of the `REMOVABLE_SUBCATEGORIES` (`hideaways`, `toys`, `enrichment`, `bowls_bottles`).

`openItemPopover` guards with `canRemoveItem`; if allowed, sets the selected ID, position, and shows the popover, returning `true` (or `false` if not removable). `closeItemPopover` hides the popover and clears selection.

`handleRemoveItem` calls `habitatConditions.removeItemFromHabitat(placementId)`, logs a player action via `loggingStore.addPlayerAction`, then closes the popover. `isOpen` returns the current visibility state.

The composable returns `selectedPlacementId` aliased as `selectedItemId` for API compatibility.

## Exports

- **use3DItemPopover** (composable) — `function use3DItemPopover(): { selectedItemId: Ref<string|null>, showItemPopover: Ref<boolean>, menuPosition: Ref<{x,y}>, currentItemData: ComputedRef<ItemPopoverData|null>, canRemoveItem, openItemPopover, closeItemPopover, handleRemoveItem, isOpen }`: Manages popover state and item removal for removable habitat items. Returns reactive state, the `currentItemData` computed, and functions `canRemoveItem`, `openItemPopover`, `closeItemPopover`, `handleRemoveItem`, `isOpen`.
- **ItemPopoverData** (type) — `interface ItemPopoverData { placementId: string; itemId: string; itemName: string; itemEmoji: string; subCategory: string }`: Shape of data describing the currently selected popover item, distinguishing full placement ID from base item ID.

## Internal dependencies

- `../../stores/loggingStore`
- `../../stores/suppliesStore`
- `../../stores/habitatConditions`
- `../../utils/placementId`
- `vue`

## Notes

- `selectedPlacementId` ref is exposed under the name `selectedItemId` for backward API compatibility, but stores the full placement ID, not a base item ID.
- Only items whose subCategory is in `REMOVABLE_SUBCATEGORIES` can be opened/removed; `openItemPopover` silently returns false otherwise.
- `habitatConditions.removeItemFromHabitat` is expected to handle inventory unmarking internally.
- Contains console.log side effects on open/remove/reject.
