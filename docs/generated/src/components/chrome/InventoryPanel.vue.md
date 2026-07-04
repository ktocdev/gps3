---
source: src/components/chrome/InventoryPanel.vue
source_hash: af7ac75e869b0f1c4a1cb9a1246a6ca26744a1e5603a79dd717bf6e6803c0b07
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# InventoryPanel.vue

`src/components/chrome/InventoryPanel.vue`

> A Vue SFC that renders the player's inventory inside the chrome UI, grouping owned items into consumables (food/hay), habitat items, and bedding. It allows selecting a consumable or habitat item (toggling selection) and emits selection events to the parent, while displaying bedding as read-only.

## Data sources
Uses `useInventoryStore` for owned items (`allItems`) and helper counts, and `useSuppliesStore` (`getItemById`) to resolve item metadata (name, emoji, category, stats).

## Derived state
- `totalItemCount`: sum of all item quantities; when 0 an empty message is shown.
- `consumableItems`: items with category `hay` or `food`; computes `servingsRemaining` via `inventoryStore.getTotalServings` and `maxServings` as `stats.servings * quantity`.
- `habitatItems`: items with category `habitat_item`, showing only the available (unplaced) quantity computed from `invItem.quantity - inventoryStore.getPlacedCount(...)`; items with zero available are omitted.
- `beddingItems`: items with category `bedding`, summing `amountRemaining` (default 1) across instances into a `formattedAmount` string like `"2.0 bags"`.

## Selection & interaction
`selectedItemId` (ref) tracks the currently selected tile. `handleItemClick` toggles: clicking the selected item deselects it and emits `deselect`; otherwise selects it and emits `select` with the itemId. Bedding tiles are non-interactive (read-only). `tileTheme(category)` returns inline CSS custom properties (`--tile-soft`, `--tile-deep`) for color theming per category.

## Exposed API
`defineExpose` provides `clearSelection()` to reset selection from a parent ref.

## Exports

- **InventoryPanel** (component) — `<InventoryPanel @select="(itemId: string)" @deselect="()" />`: Inventory display panel. Emits `select` (payload: itemId string) and `deselect` (no payload). Exposes `clearSelection()` via template ref to reset the internal selection. No props.

## Internal dependencies

- `../../stores/inventoryStore`
- `../../stores/suppliesStore`

## Notes

- Selection state is local to the component; the parent must call the exposed `clearSelection()` to sync deselection, and emitted events do not confirm success.
- `maxServings` for consumables is `stats.servings * total quantity`, while `servingsRemaining` comes from `getTotalServings`, so the displayed ratio depends on both stores staying consistent.
- Habitat items filter out fully-placed items (availableCount <= 0), so a placed item disappears from this list even though it's still owned.
- Bedding amount defaults to 1 per instance when `amountRemaining` is nullish; displayed as a fixed 1-decimal 'bags' string.
