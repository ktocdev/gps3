---
source: src/composables/game/usePathfinding.ts
source_hash: 25344e7c7b70e94d3c62fdf9a508eab8236fbd941eceaa7ef4594f09881fecee
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# usePathfinding Composable

`src/composables/game/usePathfinding.ts`

> A Vue composable implementing A* pathfinding for guinea pig navigation across a fixed grid habitat. It computes walkable paths between grid positions while accounting for habitat items, shelters (with entrances), and other guinea pigs as obstacles. It is System 18 of the game's movement subsystem.

### Grid model
The composable operates on a fixed grid of `GRID_WIDTH = 14` by `GRID_HEIGHT = 10` cells. Positions use `{ row, col }` (`GridPosition`), while habitat item/guinea pig positions from the store use `{ x, y }` (x maps to col, y maps to row).

### Obstacle logic
`getItemSize(itemId)` infers footprint from substrings in the item ID (igloo/shelter = 2x2, tunnel = 3x1, bed/hideout = 2x1, else 1x1). `itemBlocksMovement(itemId)` treats water bottles, igloos, shelters, and tunnels as non-blocking. `isBlocked(pos)` iterates `habitatConditions.habitatItems` and their `itemPositions`; for shelters it allows movement through designated entrance cells (`isShelterEntrance`) but blocks interior cells (`isInsideShelter`); for other blocking items it blocks any cell within the footprint. `isOccupiedByGuineaPig` checks `habitatConditions.guineaPigPositions`, optionally excluding one ID.

### A* search
`findPath(options)` validates start/goal are in bounds (both may sit on items), returns a trivial path if identical, then runs A* using Manhattan distance heuristic and 4-directional neighbors (`getNeighbors`). It uses an array-based open set (linear scan for lowest `f`) and a string-keyed closed set. The goal cell is always allowed as a neighbor even if blocked (guinea pigs walk TO items). Search is capped at 200 iterations and `maxPathLength` (default 100). On success it reconstructs the path via parent pointers.

### State/data flow
All obstacle data is read live from the `habitatConditions` store on each call; there is no cached state. `getObstacles()` enumerates every cell occupied by blocking items for external rendering/debugging.

## Exports

- **usePathfinding** (composable) — `usePathfinding(): { findPath, isValidPosition, isInBounds, getObstacles, GRID_WIDTH, GRID_HEIGHT }`: Main composable. Returns `findPath(options: PathfindingOptions): PathfindingResult`, `isValidPosition(pos, opts)`, `isInBounds(pos)`, `getObstacles(): GridPosition[]`, and grid constants `GRID_WIDTH` (14) and `GRID_HEIGHT` (10). Internally reads the habitatConditions store.
- **GridPosition** (type) — `interface GridPosition { row: number; col: number }`: A cell coordinate in the habitat grid.
- **PathfindingOptions** (type) — `interface PathfindingOptions { start: GridPosition; goal: GridPosition; avoidOccupiedCells?: boolean; maxPathLength?: number }`: Input options for findPath. `maxPathLength` defaults to 100, `avoidOccupiedCells` defaults to false.
- **PathfindingResult** (type) — `interface PathfindingResult { path: GridPosition[]; distance: number; success: boolean }`: Result of a pathfinding search: ordered path cells, path cost/distance, and success flag.

## Internal dependencies

- `../../stores/habitatConditions`

## Notes

- Coordinate systems differ: store positions use `{x, y}` where x=col and y=row, requiring manual mapping throughout.
- Item classification (size, blocking, shelter type) is derived from substring matching on the item ID rather than authoritative stats — renaming items could break behavior.
- Shelters/tunnels/water bottles are intentionally non-blocking; a TODO notes proper entrance-only shelter access is not yet implemented (guinea pigs can effectively pass through shelter footprints only at entrances, but the non-blocking check short-circuits for water bottles entirely).
- The goal cell is always treated as reachable even when blocked, so paths can terminate on top of items.
- Contains several `console.log`/`console.warn` debug statements that fire during normal operation (e.g. on first iteration and on failure).
- Search has hard caps: 200 iterations and maxPathLength; large or obstructed grids may abandon and return failure.
- Open set uses linear scans rather than a priority queue, so performance is O(n²)-ish but acceptable for this small grid.
