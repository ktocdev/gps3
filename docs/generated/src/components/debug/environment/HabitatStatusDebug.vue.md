---
source: src/components/debug/environment/HabitatStatusDebug.vue
source_hash: a9565b1b72684dc180f9387183aecb9385f33ea7d665e12f20c050cf1f910fd4
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# HabitatStatusDebug.vue

`src/components/debug/environment/HabitatStatusDebug.vue`

> A debug panel Vue SFC for inspecting and manipulating habitat state during development. It exposes controls for habitat conditions, decay speed, placed container items (water bottles, food bowls, hay racks, chews), and a debug tool to spawn new habitat items directly into the habitat.

## Structure
The component renders three main areas within debug UI wrappers (`DebugPanelRow`, `DebugPanel`, `DebugSection`):

1. **Conditions panel** — three `DebugSlider`s bound (read via `Math.round`) to `habitat.cleanliness`, `habitat.beddingFreshness`, and `habitat.hayFreshness`, each writing back via `habitat.updateCondition(...)`. A button calls `habitat.resetHabitatConditions()`.

2. **Decay Speed panel** — a slider (1–60, step 1, `x` suffix) bound to `habitat.decaySpeedMultiplier` writing via `habitat.setDecaySpeed(v)`, plus preset buttons (6x/12x/24x) that toggle a `button--active` class when matching the current multiplier.

3. **Placed Items layout** — iterates `habitat.habitatItems` (placement IDs). Each card shows emoji/name (resolved via `suppliesStore.getItemById` on the base item ID from `getBaseItemId`) and a Remove button (`habitat.removeItemFromHabitat`). Card content is conditionally rendered by item type using `useHabitatContainers`:
   - `water_bottle`: level slider + Refill/Empty buttons
   - `food_bowl`: contents list + Empty Bowl
   - `hay_rack`: servings list, freshness, Empty Rack
   - chew (matched by `subCategory === 'chews'`): durability slider + Reset

4. **Add Item panel** — a `<select>` bound to `selectedAddItemId`, grouped by habitat subcategory via `habitatItemOptions`, with an Add button calling `habitat.debugAddItemToHabitat`.

## Data flow
On setup it lazily calls `suppliesStore.initializeCatalog()` if `catalogLoaded` is false. Item metadata (name/emoji/type/subcategory) is derived through helper functions that look up the supplies catalog. `habitatItemOptions` is a computed that groups `habitat_item` catalog entries by `subCategory` using `SUBCATEGORY_LABELS` for display labels.

## Exports

- **HabitatStatusDebug** (component) — `<HabitatStatusDebug />`: Debug SFC with no props or emits. Reads/writes global stores directly (habitatConditions store, habitatContainers composable, suppliesStore). Local state: selectedAddItemId (ref). Local helpers: itemName, itemEmoji, itemType, isChewItem, hayServingName, addDebugItem; computed habitatItemOptions.

## Internal dependencies

- `../../../stores/habitatConditions`
- `../../../composables/useHabitatContainers`
- `../../../stores/suppliesStore`
- `../../../utils/placementId`
- `../../basic/Button.vue`
- `../ui/DebugPanel.vue`
- `../ui/DebugPanelRow.vue`
- `../ui/DebugSection.vue`
- `../ui/DebugSlider.vue`

## Notes

- Chew items are identified by `subCategory === 'chews'` rather than `stats.itemType`, matching the convention used elsewhere (use3DBehavior, GameView, useGuineaPigBehavior) — noted in an inline comment.
- Placement IDs must be converted to base item IDs via `getBaseItemId` before catalog lookups; hay serving items use their raw itemId directly.
- Calls `suppliesStore.initializeCatalog()` as a side effect during setup if the catalog is not yet loaded.
- `<style>` block is not scoped, so class names (including generic ones like `.button--active`, `.btn-row`) are global.
