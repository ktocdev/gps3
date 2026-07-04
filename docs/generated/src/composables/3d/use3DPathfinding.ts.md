---
source: src/composables/3d/use3DPathfinding.ts
source_hash: 197a40a78ec5f154eccb4e1ade82b5b85c6bc3972d803dc96d12183694bcd8dd
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# use3DPathfinding Composable

`src/composables/3d/use3DPathfinding.ts`

> A Vue composable that provides circle-based obstacle avoidance pathfinding for guinea pig movement in a 3D (X-Z plane) world. It calculates navigable paths around circular obstacles, checks path clarity, and resolves invalid positions, working against the movement3DStore for obstacle and world-bounds data.

The composable retrieves obstacle and bounds data from `useMovement3DStore`. All calculations operate in the 2D X-Z plane (Y is always set to 0).

### Core geometry
- `distance2D` computes Euclidean distance in the X-Z plane.
- `lineIntersectsCircle` projects an obstacle center onto the start→end line segment, considering only obstacles ahead of start and before end, and reports intersection plus the closest point and projection distance when the perpendicular distance is less than the obstacle radius.

### Path building
- `calculatePath` seeds an empty path, calls `buildPathSegment` recursively, then always appends the final destination.
- `buildPathSegment` finds the closest blocking obstacle along the segment, computes an avoidance waypoint via `getAvoidanceWaypoint`, clamps it to world bounds, and recurses on the two sub-segments (start→waypoint, waypoint→end), pushing the waypoint between them. Recursion is bounded by `maxIterations` (default 10); on exhaustion it returns a direct segment.
- `getAvoidanceWaypoint` pushes a waypoint outward from the obstacle center along the direction to the path's closest point, at radius + margin (1.2). If the closest point coincides with the center, it uses a perpendicular to the travel direction.

### Utilities
- `isPathClear` returns false if any obstacle intersects the direct line.
- `findNearestValidPosition` clamps a point to bounds (with margin), then pushes it out of any overlapping obstacle and re-clamps.

## Exports

- **use3DPathfinding** (composable) — `use3DPathfinding(): { calculatePath, isPathClear, findNearestValidPosition, lineIntersectsCircle, distance2D }`: Returns pathfinding functions: `calculatePath(start, end, maxIterations=10): Vector3D[]` builds a waypoint list avoiding obstacles; `isPathClear(start, end): boolean` checks direct line clarity; `findNearestValidPosition(point, margin=1.2): Vector3D` resolves a valid in-bounds, obstacle-free position; `lineIntersectsCircle(start, end, obstacle): LineCircleIntersection` low-level segment/circle test; `distance2D(a, b): number` X-Z plane distance.

## Internal dependencies

- `../../stores/movement3DStore`
- `../../types/movement3d`

## Notes

- All Y coordinates are forced to 0; pathfinding is strictly 2D in the X-Z plane.
- `buildPathSegment` uses a truthiness check on `intersection.distance`, so a valid intersection with distance exactly 0 would be ignored (though projection>0 makes this unlikely).
- Recursion halves iteration budget on each branch and can produce many waypoints; there is no de-duplication or path simplification.
- `findNearestValidPosition` computes `normDx = dx / distance || 1` — when distance is 0 it defaults the push direction to (1,0), avoiding division-by-zero.
- Depends on `movement3DStore.getObstacles()`, `clampToBounds()` existing and returning current state.
