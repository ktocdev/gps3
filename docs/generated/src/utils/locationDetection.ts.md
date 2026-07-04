---
source: src/utils/locationDetection.ts
source_hash: ceaf3346cf5e4e349210e3384c46a258fdbd7db37f64286b4606191cdfa864c9
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Location Detection Utilities

`src/utils/locationDetection.ts`

> Provides helper functions for detecting nearby habitat items relative to a position and for converting between grid, subgrid, and coordinate formats. It supports proximity-based location awareness (e.g. identifying when a pet is near meaningful items like water or food) and precise poop placement within grid cells.

The file exports three pure utility functions plus internal constants.

### Proximity detection
`detectNearbyLocation` iterates over `habitatConditions.habitatItems`, looking up each item's position via `habitatConditions.itemPositions` (a Map keyed by itemId, storing `{x, y}` where `x=col`, `y=row`). It computes the Manhattan distance from `currentPos` and, if within `PROXIMITY_THRESHOLD_GRID_CELLS` (1), resolves the item via `suppliesStore.getItemById`. It only returns an item's name if that name (lowercased) contains one of a fixed set of `meaningfulKeywords` (water, bottle, food, bowl, shelter, hideaway, hideout, igloo, bed). Returns the first match or `undefined`.

### Coordinate conversions
`gridToSubgridWithOffset` scales a `{row, col}` grid position by `SUBGRID_TO_GRID_SCALE` (4) into finer subgrid `{x, y}` coordinates, adding a random offset within the cell for placement variety. `positionToGridCoords` swaps between the `{x, y}` and `{row, col}` conventions (x=col, y=row).

The store type aliases are derived from the store composables' return types, so the functions accept live store instances passed by callers.

## Exports

- **detectNearbyLocation** (function) — `(currentPos: {row: number; col: number}, habitatConditions: HabitatConditions, suppliesStore: SuppliesStore) => string | undefined`: Returns the name of the first 'meaningful' habitat item within Manhattan distance 1 of the given position, filtered by keyword matching; otherwise undefined.
- **gridToSubgridWithOffset** (function) — `(gridPos: {row: number; col: number}) => {x: number; y: number}`: Converts a grid cell to a subgrid coordinate (4x finer) with a random per-cell offset, used for precise poop placement.
- **positionToGridCoords** (function) — `(position: {x: number; y: number}) => {row: number; col: number}`: Converts a position from {x, y} to {row, col} format (x=col, y=row).

## Internal dependencies

- `../stores/habitatConditions`
- `../stores/suppliesStore`

## Notes

- Coordinate systems are mixed: item positions and subgrid use {x, y} where x=col and y=row, while grid coordinates use {row, col}. Confusing these causes swapped axes.
- Meaningful-item filtering relies on hardcoded keyword substring matching against item names; renamed items may silently stop being detected.
- gridToSubgridWithOffset is non-deterministic due to Math.random().
