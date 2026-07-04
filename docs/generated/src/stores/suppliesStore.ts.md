---
source: src/stores/suppliesStore.ts
source_hash: d50f76fae21200dcf32c88b7387d3e77494ae5f865f7298f02f364e88bcee52f
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Supplies Store

`src/stores/suppliesStore.ts`

> A Pinia store (System 11, Phase 3.11) that serves as the central catalog of all purchasable items — bedding, hay, food, and habitat items — loaded from JSON files. It exposes filtering, sorting, and querying getters/actions, handles purchasing (deducting player currency and adding to inventory), and provides helpers for the autonomy system to look up item types and needs.

### State
- `catalog: SuppliesItem[]` — all catalog items
- `catalogLoaded: boolean` — guards against re-initialization

### Getters
Generic filters `itemsByCategory(category)` and `itemsBySubCategory(subCategory)` return filtered arrays. Numerous legacy convenience getters (`allBedding`, `allHay`, `allFood`, `allHabitatItems`, `greens`, `herbs`, `vegetables`, `fruits`, `pellets`, `treats`, `hideaways`, `toys`, `chews`, `bowlsAndBottles`, `enrichment`) delegate to those two.

### Actions
- `initializeCatalog()` — loads catalog via `loadCatalog()` once, sets `catalogLoaded`.
- Query methods: `getItemById`, `getItemsByCategory`, `getItemsBySubCategory`.
- `filterItems(filters)` — applies category, subCategory, price range, quality, tier, availability, tags (any-match), and search-term (name/description) filters.
- `sortItems(items, sortOptions)` — sorts by name, price, quality (via `QUALITY_ORDER`), or tier (local basic/standard/premium order), respecting asc/desc direction.

### Purchasing
`purchaseItem(itemId, quantity=1)` and `purchaseMultipleItems(items[])` validate items exist, check `usePlayerProgression().currency` against total cost, call `deductCurrency`, then add to `useInventoryStore()`. Items with a serving system (via `hasServingSystem`) are added per-unit with `addConsumableWithServings(itemId, servings)`; others use `addItem`. Both return a `PurchaseResult` with success flag, message, purchased items, and remaining balance.

### Autonomy helpers
`getItemsByType`, `getItemType`, `itemSatisfiesNeed`, and `getItemsForNeed` read `item.stats.itemType` / `item.stats.needSatisfied` to support autonomy decision-making (System 16).

## Exports

- **useSuppliesStore** (store) — `useSuppliesStore(): Store<'supplies', SuppliesStoreState, Getters, Actions>`: Pinia store holding the item catalog with filtering/sorting getters, catalog initialization, query methods, purchase actions, and autonomy helper methods.

## Internal dependencies

- `../types/supplies`
- `./playerProgression`
- `./inventoryStore`
- `../utils/catalogLoader`
- `../constants/supplies`
- `../utils/servingSystem`

## Notes

- `initializeCatalog()` is idempotent via `catalogLoaded`; catalog is empty until it is called.
- Purchases mutate two other stores as side effects: deducts currency from playerProgression and adds items to inventoryStore.
- Serving-based items (hay, lettuce, carrots per `hasServingSystem`) are added one entry per unit via `addConsumableWithServings`, unlike standard items which use a single `addItem` call with quantity.
- `filterItems` tag matching is OR-based (any tag matches); currency checks use plain `<` comparison on floating-point prices.
