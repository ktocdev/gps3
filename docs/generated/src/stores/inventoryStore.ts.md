---
source: src/stores/inventoryStore.ts
source_hash: 29cb9b2b3a39b8c4a31ff0de4ef7385731ce373bf53c739ea6ffcf8bda516fea
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Inventory Store

`src/stores/inventoryStore.ts`

> A Pinia store (System 11, Phase 3.11) that manages the player's owned items — habitat items, consumables, and food — tracking individual item instances with metadata (opened, placed in habitat, serving counts). It provides queries, add/remove operations, sell-back logic, opened/placed marking, and a serving-based consumption system for consumables like hay.

### State
Holds a single `items` array of `InventoryItem`, where each item has an `itemId`, a `quantity`, and an array of `instances` (each with a unique `instanceId`, `acquiredAt`, and optional flags like `isOpened`, `isPlacedInHabitat`, `servingsRemaining`, `maxServings`).

### Getters
`itemsById` builds a `Map<itemId, InventoryItem>` (only for items with instances) enabling O(1) lookups used by most other getters. Query getters include `getItemQuantity`, `hasItem`, `allItems`, `totalItemCount`. Category getters (`consumables`, `habitatItems`) cross-reference the supplies store's `getItemById` by category. `getInstanceCount` is a generic counter with an optional predicate, wrapped by convenience getters `getOpenedCount`, `getUnopenedCount`, `getPlacedCount`, `getUnplacedCount`. `inventoryWithDetails` joins supply catalog data. Sell-back eligibility is exposed via `getReturnableQuantity` and `canSellBack` (returnable = not opened and not placed).

### Actions
`addItem`/`addMultipleItems` create instances with generated UUIDs. `removeItem`/`useItem` remove instances FIFO (oldest first), pruning empty items. `sellBackItem` grants a 100% refund (basePrice × qty) via `playerProgression.updateCurrency` for returnable instances only, returning a `SellBackResult`. `markAsOpened`, `markAsPlacedInHabitat` (returns first marked instanceId), and `unmarkAsPlacedInHabitat` toggle instance flags affecting sell-back. The serving system (System 15) adds `addConsumableWithServings`, `consumeServing` (decrements and prunes depleted instances), `getTotalServings`, and `getServingDepletion` (percentage for oldest instance). Debug helpers: `clearInventory`, `setItemQuantity`.

### Persistence
The store is persisted; an `afterHydrate` hook migrates instances of serving-system supplies that lack `servingsRemaining`, backfilling default serving counts via `hasServingSystem`/`getServingCount`.

## Exports

- **useInventoryStore** (store) — `useInventoryStore(): Store<'inventory', InventoryState, Getters, Actions>`: Pinia store managing player inventory. State: `items: InventoryItem[]`. Provides getters for querying quantities/counts/categories and actions for adding, removing, selling back, marking, and serving-based consumption of items. Persisted with an afterHydrate migration for serving data.

## Internal dependencies

- `../types/supplies`
- `./suppliesStore`
- `./playerProgression`
- `../utils/servingSystem`

## Notes

- Removal operations (`removeItem`, sell-back, serving consumption) delete instances FIFO/oldest-first, not by any priority.
- `sellBackItem` refunds 100% of basePrice and only for instances that are neither opened nor placed in habitat.
- `itemsById` and `allItems` exclude items with zero instances, but empty items are also actively pruned from `this.items` on removal.
- Serving getters/actions coexist with instance-count flags; a single instance may or may not carry serving fields, and the migration hook backfills missing ones on hydrate.
- `getServingDepletion` returns 100 when the item/instance is absent but 0 when an instance exists without a valid maxServings — inconsistent defaults.
- Uses `crypto.randomUUID()` for instance IDs, requiring a secure context / modern runtime.
- Numerous console.log side effects on nearly every mutation.
