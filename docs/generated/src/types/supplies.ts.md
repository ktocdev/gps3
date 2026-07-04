---
source: src/types/supplies.ts
source_hash: 652e7d38a4fc47016cbafae88f489905a75c6480e8f4c0fd7e1204887425fb74
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Supplies Store Type Definitions

`src/types/supplies.ts`

> This file declares all TypeScript types for the game's Supplies Store system (System 11) and the item metadata needed by the guinea pig autonomy system (System 16). It defines the shape of purchasable items, their category-specific variants, shopping cart structures, filtering/sorting options, inventory representation, and the results of purchase and sell-back operations.

The file is purely declarative TypeScript types with no runtime logic.

### Autonomy types
`ItemType` is a string-literal union classifying items functionally (e.g. `water_bottle`, `food_bowl`, `toy`, `nail_clipper`). `NeedType` enumerates guinea pig needs an item can satisfy, grouped as critical, environmental, and maintenance needs.

### Core item
`SuppliesItem` is the central interface. It has identity fields (`id`, `name`, `description`), a required `category` (`bedding | hay | food | habitat_item`), an optional `subCategory` covering both food and habitat subcategories, pricing, and a large optional `stats` object. The `stats` object mixes autonomy fields (`itemType`, `needSatisfied`, `satisfactionAmount`, `usageDuration`) with legacy per-category stats (bedding absorbency/decay, food nutrition/servings, habitat durability/boosts, bowls/bottles capacity, chews, toys, hideaways, and a pathfinding `blocksMovement` flag). Additional optional fields cover premium visual effects, badge unlocks, availability, and display metadata (emoji, quality, tier, tags).

### Category variants
`BeddingItem`, `HayItem`, `FoodItem`, and `HabitatItem` are intersection types narrowing `SuppliesItem` by pinning `category` (and `subCategory` for food/habitat) and, for bedding/food, redefining `stats`.

### Supporting structures
`CartItem`/`ShoppingCart` model the shopping cart. `ItemFilters` and `ItemSortOptions` describe query parameters (deriving field types from `SuppliesItem`). `ItemInstance`, `InventoryItem`, and `InventoryState` model owned inventory with per-instance tracking of servings, opened state, placement, and fractional bedding amounts. `PurchaseResult` and `SellBackResult` describe operation outcomes.

## Exports

- **ItemType** (type) — `type ItemType = 'water_bottle' | 'food_bowl' | ... | 'nail_clipper'`: String-literal union classifying items functionally for the autonomy system.
- **NeedType** (type) — `type NeedType = 'hunger' | 'thirst' | ... | 'chew'`: Union of guinea pig need types items can satisfy; intended to match the GuineaPigNeeds interface.
- **SuppliesItem** (type) — `interface SuppliesItem { id; name; category; stats?; ... }`: Central interface for any purchasable item, including pricing, optional category-dependent stats, visual effects, badge unlocks, availability, and metadata.
- **BeddingItem** (type) — `type BeddingItem = SuppliesItem & { category: 'bedding'; stats: {...} }`: SuppliesItem narrowed to bedding with required absorbency/decayRate stats.
- **HayItem** (type) — `type HayItem = SuppliesItem & { category: 'hay' }`: SuppliesItem narrowed to the hay category.
- **FoodItem** (type) — `type FoodItem = SuppliesItem & { category: 'food'; subCategory: ...; stats?: {...} }`: SuppliesItem narrowed to food with a required food subCategory and food-specific stats.
- **HabitatItem** (type) — `type HabitatItem = SuppliesItem & { category: 'habitat_item'; subCategory: ... }`: SuppliesItem narrowed to habitat items with a required habitat subCategory.
- **CartItem** (type) — `interface CartItem { itemId; quantity; addedAt }`: A single line in the shopping cart with quantity and add timestamp.
- **ShoppingCart** (type) — `interface ShoppingCart { items; totalCost; itemCount }`: Aggregate cart state holding cart items and computed totals.
- **ItemFilters** (type) — `interface ItemFilters { category?; subCategory?; minPrice?; ... searchTerm? }`: Optional filter criteria for querying items, deriving field types from SuppliesItem.
- **ItemSortOptions** (type) — `interface ItemSortOptions { field: 'name'|'price'|'quality'|'tier'; direction: 'asc'|'desc' }`: Sort configuration for item lists.
- **ItemInstance** (type) — `interface ItemInstance { instanceId; acquiredAt; ... amountRemaining? }`: A single owned item instance tracking usage, opened/placed state, servings, and fractional bedding amount.
- **InventoryItem** (type) — `interface InventoryItem { itemId; instances; quantity }`: Groups all instances of one item type; quantity is computed from instances length.
- **InventoryState** (type) — `interface InventoryState { items: InventoryItem[] }`: Top-level inventory container.
- **PurchaseResult** (type) — `interface PurchaseResult { success; message; itemsPurchased?; remainingBalance? }`: Result object returned from a purchase operation.
- **SellBackResult** (type) — `interface SellBackResult { success; message; itemsSold?; newBalance? }`: Result object returned from a sell-back operation.

## Notes

- `FoodItem` and `BeddingItem` redefine `stats` via intersection; the bedding `stats` becomes required while the base `SuppliesItem.stats` is optional.
- `NeedType` is documented as matching a separate `GuineaPigNeeds` interface but is not enforced or imported here — keeping them in sync is manual.
- `InventoryItem.quantity` is described as computed from `instances.length` but nothing in this file enforces that; it must be maintained by consuming code.
- `stats` mixes autonomy fields and many legacy category-specific fields all as optional, so type safety does not guarantee the correct fields are present for a given category.
