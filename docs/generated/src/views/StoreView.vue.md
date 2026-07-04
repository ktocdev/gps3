---
source: src/views/StoreView.vue
source_hash: ba23b053e8ea8b199a8aa637203fb28e71f0d2a0738c5b666563798a1af9239e
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# StoreView

`src/views/StoreView.vue`

> A full-page store view (route component) that presents the in-game supply shop as a themed storefront with awning-style department tabs, shelves of crate cards, and purchase/sell feedback toasts. It ties together the supplies catalog, player inventory, and player currency to let the player browse and transact items by category.

## Layout
The template renders decorative storefront chrome (wooden beam, `StorefrontWindow`), a nav of `AwningTab` components for department selection, a transitioned toast panel, an aisle header (plaque, title, coin badge), a tagline, and the shelves of items.

## Departments
A static `departments` array defines five departments: a synthetic `featured` department plus one per `SuppliesItem` category (`hay`, `food`, `bedding`, `habitat_item`). Each has label, icon, accent/soft colors, and tagline. `activeDept` (ref, default `'featured'`) tracks selection; clicking an `AwningTab` sets it. `activeDepartment` and `aisleNumber` are derived from it.

## Item data flow
`featuredItems` pulls catalog items tagged `popular` (first `shelfSize`), falling back to the first item of each real category. `items` returns either featured items or `suppliesStore.getItemsByCategory(activeDept)`. `shelves` chunks `items` into rows of `shelfSize` (4). `crateTilt` cycles a fixed tilt array for visual variety.

## Per-item state
Each `SupplyCrateCard` receives computed props: `ownedCount` (quantity from inventory), `returnableCount` (instances not opened and not placed in habitat), and `canAfford` (currency vs basePrice).

## Transactions & toasts
`buy` calls `suppliesStore.purchaseItem(id, 1)`; `sell` calls `inventoryStore.sellBackItem(id, 1)`. Both feed `showToast`, which sets `toast` and auto-clears after 2500ms via a managed `toastTimer`.

## Exports

- **StoreView** (component) — `Vue SFC (<script setup>), no props or emits`: Route-level store page component. Consumes suppliesStore, inventoryStore, and playerProgression stores. Renders department tabs and shelves; handles buy/sell actions with toast feedback. Has no props and emits no events.

## Internal dependencies

- `../components/game/shop/AwningTab.vue`
- `../components/game/shop/StorefrontWindow.vue`
- `../components/game/shop/WoodShelf.vue`
- `../components/game/shop/SupplyCrateCard.vue`
- `../components/chrome/ParchmentPanel.vue`
- `../stores/suppliesStore`
- `../stores/inventoryStore`
- `../stores/playerProgression`
- `../types/supplies`

## Notes

- `activeDepartment` uses a non-null assertion (`!`); it assumes `activeDept` always matches a department in the array.
- `toastTimer` is a module-level (non-reactive) variable using `window.setTimeout`; multiple toasts reset the same timer so only the latest message shows for 2500ms.
- `returnableCount` depends on inventory instance flags `isOpened` and `isPlacedInHabitat` — only unopened, unplaced instances are considered sellable/returnable.
- No `<style>` block is present in this file; all `storefront__*`/`aisle-plaque__*` classes are styled elsewhere (global or scoped CSS not shown).
