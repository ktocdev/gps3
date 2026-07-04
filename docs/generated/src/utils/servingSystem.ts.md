---
source: src/utils/servingSystem.ts
source_hash: e6af66610cf77f228e6c3f18859c059927d1acf63f548730535adc35dabe84f0
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Serving System Utilities

`src/utils/servingSystem.ts`

> A small collection of pure utility functions for working with supplies items that use serving-based consumption (e.g. hay, lettuce, carrots). It centralizes the logic for detecting whether an item has servings, counting servings, and identifying consumable items.

This module exports four stateless helper functions operating on a `SuppliesItem` (or `undefined`).

- `hasServingSystem` returns true when `item.stats.servings` is defined and greater than 0.
- `getServingCount` returns `item.stats.servings` or 0 when absent.
- `isConsumable` returns true when the item's `category` is `'food'` or `'hay'`.
- `getServingInfo` aggregates the three above into a single object (`hasServings`, `servingCount`, `isConsumable`).

All functions defensively handle an `undefined` item and rely on optional chaining for `stats`. There is no state, side effects, or external data flow — purely derived values from the passed item.

## Exports

- **hasServingSystem** (function) — `(item: SuppliesItem | undefined) => boolean`: Returns true if the item has a defined `stats.servings` value greater than 0.
- **getServingCount** (function) — `(item: SuppliesItem | undefined) => number`: Returns the item's `stats.servings` count, or 0 if unavailable.
- **isConsumable** (function) — `(item: SuppliesItem | undefined) => boolean`: Returns true if the item's category is 'food' or 'hay'.
- **getServingInfo** (function) — `(item: SuppliesItem | undefined) => { hasServings: boolean; servingCount: number; isConsumable: boolean }`: Aggregates hasServingSystem, getServingCount, and isConsumable into a single info object.

## Internal dependencies

- `../types/supplies`
