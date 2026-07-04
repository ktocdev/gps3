---
source: src/composables/useHabitatContainers.ts
source_hash: 57d1f00e92a0199014e0125b03da8f24787ea4d52245058f702c57eb0dc9c071
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# useHabitatContainers Composable

`src/composables/useHabitatContainers.ts`

> A Vue composable that manages the state of habitat containers in the guinea pig simulation: food bowls, hay racks, chew items, and water bottles. It tracks contents, capacity, freshness/durability decay, and coordinates with the supplies and inventory stores when items are added or removed. It uses module-level singleton refs so all component instances share the same container state.

### State
Four module-level `ref<Map>` singletons hold all container state keyed by placement ID:
- `bowlContents`: Map of placementId → `FoodItem[]`
- `hayRackContents`: Map of placementId → `HayRackData` (servings, freshness, lastDecayUpdate)
- `chewItems`: Map of placementId → `ChewData` (durability, usageCount, etc.)
- `waterBottles`: Map of placementId → `WaterBottleData` (level, lastDrinkAt)

Because these are declared outside the composable function, they persist and are shared across all `useHabitatContainers()` calls.

### Data flow
Many operations reconcile with `useSuppliesStore` (item metadata lookup via `getItemById`, using `getBaseItemId` to strip placement suffixes) and `useInventoryStore` (checking, consuming, and returning servings/items). `hasServingSystem`/`getServingCount` determine whether inventory operations use the serving system or whole-item add/remove.

### Bowls
`addFoodToBowl` validates inventory presence, bowl subCategory (`bowls_bottles`), capacity, and food category (`food`/`hay`) before consuming from inventory and appending a fresh (freshness 100) item. `removeFoodFromBowl` returns items to inventory. Decay via `applyFoodBowlDecay` reduces each item's freshness.

### Hay racks
`addHayToRack` validates hay category and rack, consumes a serving, and appends a serving with a UUID instanceId. `removeHayFromRack` does NOT return hay to inventory (eating consumes it). `fillAllHayRacks` bulk-fills racks from the first available hay type. Freshness is tracked per-rack with `applyHayRackDecay`.

### Chews
Lazily initialized via `initializeChewItem`, which sets degradationRate based on item name (willow/apple/mineral). `chewItem` reduces durability per use and blocks use below `UNSAFE_THRESHOLD`. `setChewDurability` self-heals by initializing if missing.

### Water bottles
Track a 0-100 level per bottle. Includes init, get/set, refill to 100, consume (blocked below `WATER_MINIMUM_LEVEL`), aggregate average, and `findAvailableWaterBottle`.

Most mutations create a new `Map` before assignment to trigger Vue reactivity.

## Exports

- **useHabitatContainers** (composable) — `useHabitatContainers(): { bowlContents, hayRackContents, chewItems, waterBottles, ...methods }`: Returns shared reactive state refs and methods for managing bowls, hay racks, chew items, and water bottles. State is singleton (module-scoped) so all callers share the same data.
- **FoodItem** (type) — `interface FoodItem { itemId, emoji, name, freshness, addedAt }`: A food item stored in a bowl.
- **HayServing** (type) — `interface HayServing { itemId, instanceId, addedAt }`: A single hay serving in a rack, with unique instanceId.
- **HayRackData** (type) — `interface HayRackData { servings: HayServing[], freshness, lastDecayUpdate }`: State of a hay rack including servings and freshness decay tracking.
- **ChewData** (type) — `interface ChewData { durability, usageCount, lastUsedAt, degradationRate }`: Durability/usage tracking for a chew item.
- **WaterBottleData** (type) — `interface WaterBottleData { level, lastDrinkAt }`: Water level tracking for a bottle.

## Internal dependencies

- `vue`
- `../stores/suppliesStore`
- `../stores/inventoryStore`
- `../constants/supplies`
- `../utils/servingSystem`
- `../utils/placementId`

## Notes

- State refs are module-level singletons shared across every composable instance — mutations affect all consumers globally.
- `removeHayFromRack` intentionally does NOT return hay to inventory (eating consumes it), unlike `removeFoodFromBowl` which does return items.
- Both bowls and hay racks validate against the same `bowls_bottles` subCategory; there is no distinct subCategory for hay racks in this file.
- Some mutations (`clearBowl`, `clearAllBowls`, `addHayToRack`, `removeHayFromRack`, `clearAllHayRacks`) mutate the Map in place rather than reassigning, which may not trigger reactivity consistently compared to the new-Map pattern used elsewhere.
- Chew items are lazily initialized; `setChewDurability` self-heals missing entries by calling `initializeChewItem`.
- Uses `crypto.randomUUID()` for hay serving instance IDs (requires a secure context).
- Multiple methods log warnings/info to the console as side effects.
