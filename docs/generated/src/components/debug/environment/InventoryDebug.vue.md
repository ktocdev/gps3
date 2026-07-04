---
source: src/components/debug/environment/InventoryDebug.vue
source_hash: 8d518fd548e827a6c3d35eac94f320d3bbf6bb6c70639a684a0dca55d38d56c9
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# InventoryDebug.vue

`src/components/debug/environment/InventoryDebug.vue`

> A debug/developer panel that displays the player's inventory (consumables and habitat items) with card and list view modes, and provides controls to manipulate the player's currency. Used within the environment debug UI to inspect and adjust game state.

## Layout
Renders a two-panel top row: a wide inventory panel (~66%) and a narrower currency controls panel (~34%, stacked on mobile via a 768px breakpoint).

## Inventory Panel
Header shows total item count and unique item count badges plus an `ItemViewToggle` bound to local `viewMode` ref ('card' | 'list', defaults to 'list'). When `inventoryStore.allItems` is empty, shows an empty message. Otherwise renders two `DebugSection`s: Consumables and Habitat Items.

Each section computes an enriched list (`consumablesWithDetails` / `habitatItemsWithDetails`) by mapping the store's items and attaching catalog detail via `suppliesStore.getItemById(itemId)`. In card view it renders custom `.inventory-item-card` markup with emoji, name, category/subCategory, quantity, and status badges (opened/unopened/returnable for consumables; placed/unplaced/returnable for habitat items). In list view it maps items to a normalized shape passed to `ItemListView`, overriding the `status` slot with the same badges.

## Currency Panel
Shows balance and total earned via `DebugStatRow` reading from `playerProgression`. Provides a numeric input bound to `currencyAmount` (default 100) with an `isValidAmount` computed (positive integer). Buttons: Add (`updateCurrency`), Deduct (`deductCurrency` with reason 'debug_deduction'), quick add buttons (+100/+500/+1000), and Reset which computes the delta to bring balance to 1000.

## Lifecycle
`onMounted` initializes the supplies catalog if `suppliesStore.catalogLoaded` is false, to fix an empty inventory on first load.

## Exports

- **InventoryDebug** (component) — `Vue SFC <script setup>, no props, no emits`: Debug inventory viewer and currency control panel. Reads from playerProgression, inventoryStore, and suppliesStore. Local state: viewMode ('card'|'list'), currencyAmount (number). No props or emitted events.

## Internal dependencies

- `../../../stores/playerProgression`
- `../../../stores/inventoryStore`
- `../../../stores/suppliesStore`
- `../../basic/Button.vue`
- `../../basic/Badge.vue`
- `../ui/DebugPanel.vue`
- `../ui/DebugSection.vue`
- `../ui/DebugStatRow.vue`
- `../../game/shop/ItemViewToggle.vue`
- `../../game/shop/ItemListView.vue`
- `../../game/shop/ItemGridView.vue`

## Notes

- onMounted lazily initializes the supplies catalog only when not already loaded; item names/emojis rely on this catalog being populated.
- List view maps items with hardcoded basePrice: 0 and show-price=false since inventory items have no price context here.
- resetCurrency computes a delta (1000 - currentBalance) and passes it to updateCurrency, so it can pass a negative amount to reduce balance to 1000.
- Card status badges call multiple store getters (getOpenedCount, getUnopenedCount, getPlacedCount, etc.) per item render.
