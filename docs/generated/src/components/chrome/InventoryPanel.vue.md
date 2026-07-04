---
source: src/components/chrome/InventoryPanel.vue
source_hash: ce1a5c9f54ae04e431b4d1df8c52af4d05d550470fc6d114ecbf04717b7bf7b7
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# InventoryPanel.vue

`src/components/chrome/InventoryPanel.vue`

> A Vue SFC that renders the player's inventory inside the chrome UI, grouping items into consumables (food/hay), habitat items, and bedding. It lets the user select a consumable or habitat item to act on (e.g., feed or place) and reports selection changes to the parent via events.

## Data sources
Uses `useInventoryStore` for owned item instances/quantities and `useSuppliesStore` (via `getItemById`) to resolve display metadata (name, emoji, category, stats).

## Derived state
- `totalItemCount`: sum of all item quantities; shows an empty-state message when 0.
- `consumableItems`: items with category `hay` or `food`. Computes `servingsRemaining` from `inventoryStore.getTotalServings` and `maxServings` as `stats.servings * quantity`.
- `habitatItems`: items with category `habitat_item`, reduced by `getPlacedCount` so only un-placed (available) quantity is shown; hidden when availableCount ≤ 0.
- `beddingItems`: items with category `bedding`, summing `amountRemaining` across each item's `instances` (defaulting to 1) and formatting as `"X.X bags"`.

## Selection
Local `selectedItemId` ref tracks the currently selected tile. `handleItemClick` toggles: clicking the selected item clears it and emits `deselect`; otherwise sets it and emits `select` with the itemId. Consumable and habitat tiles are clickable buttons; bedding tiles are read-only (used automatically during cleaning).

## Styling
`tileTheme(category)` returns CSS custom properties (`--tile-soft`, `--tile-deep`) bound inline per category (hay/food/default).

## Exposed API
`defineExpose` provides `clearSelection()` so a parent can reset the selection imperatively.

## Exports

- **InventoryPanel** (component) — `<InventoryPanel @select="(itemId: string)" @deselect="()" ref />`: Inventory display component. Emits `select` (itemId string) when a consumable/habitat tile is chosen and `deselect` when deselected. Exposes `clearSelection()` to reset local selection. No props.

## Internal dependencies

- `../../stores/inventoryStore`
- `../../stores/suppliesStore`

## Notes

- Bedding tiles are intentionally non-interactive (read-only) and never emit selection events.
- Habitat items are filtered out when all copies are already placed (availableCount ≤ 0), so placed items won't appear.
- `clearSelection` (exposed) only resets local `selectedItemId` and does NOT emit `deselect`, unlike clicking a selected tile.
- `maxServings` is derived as per-item servings times total quantity, while `servingsRemaining` comes from the store's aggregate `getTotalServings`.
