---
source: src/stores/movement3DStore.ts
source_hash: bd2ae6e08dffce42873475e6ee6e3c6df4c734d1c5f99c71b01676e21efd3600
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Movement 3D Store

`src/stores/movement3DStore.ts`

> A Pinia store that tracks guinea pig positions in 3D world coordinates and manages circle-based obstacles derived from habitat item placements, providing coordinate conversion and spatial queries to support autonomous movement and pathfinding.

## State
- `guineaPigStates`: a `ref<Map<string, GuineaPig3DState>>` mapping guinea pig IDs to their world position, target, rotation, movement flag, and current path.
- `obstacles`: a `ref<CircleObstacle[]>` of circle obstacles synced from habitat items.
- `worldBounds`: a reactive `WorldBounds` computed from `GRID_CONFIG` (COLS/ROWS × CELL_SIZE, centered on origin).

## Coordinate conversion
`gridToWorld(col, row)` and `worldToGrid(x, z)` translate between grid cells and centered world coordinates using `GRID_CONFIG.CELL_SIZE` and grid dimensions.

## Guinea pig management
`initializeGuineaPig`, `updatePosition`, `setTarget`, `getGuineaPigState`, `removeGuineaPig`, and `clearAllGuineaPigs` operate on the map. Position/target setters clone the incoming Vector3D. Several functions log to the console.

## Obstacle management
`getObstacleRadius(itemId, itemType)` looks up a radius from the module-level `OBSTACLE_RADII` table by matching keywords in the item type first, then the item ID, falling back to `default`. `syncObstaclesFromHabitat()` pulls `itemPositions` from `useHabitatConditions`, resolves item details via `useSuppliesStore.getItemById`, converts grid positions to world coords, assigns radii, skips items with radius ≤ 0 (e.g. tunnels), and replaces `obstacles.value`. `getObstacles`, `getObstacleById`, and `isPointInObstacle(point, margin)` provide obstacle queries.

## Bounds checking
`isInBounds(point, margin)` and `clampToBounds(point, margin)` test/clamp a point against `worldBounds` with a configurable margin (default 1).

## Internal dependencies

- `./habitatConditions`
- `./suppliesStore`
- `../constants/3d`
- `../types/movement3d`
- `pinia`
- `vue`

## Notes

- `OBSTACLE_RADII` is a module-level constant; `tunnel` is intentionally 0 so tunnels are treated as passable and skipped during obstacle sync.
- `getObstacleRadius` uses substring keyword matching on lowercased item type/ID, so item naming conventions affect which radius is chosen.
- `syncObstaclesFromHabitat` fully replaces `obstacles.value` each call and must be invoked manually to reflect habitat changes; it calls `useHabitatConditions`/`useSuppliesStore` inside the function (must run within an active Pinia context).
- `gridToWorld` is called with `gridPos.x` and `gridPos.y` (grid col/row stored as x/y) during obstacle sync.
