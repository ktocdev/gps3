---
source: src/types/movement3d.ts
source_hash: 7401a7381d428ee042ff27eabc0731033fa5f07f66fdc498ea21a4d9c6319626
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# 3D Movement Types

`src/types/movement3d.ts`

> This file defines the TypeScript interfaces for the 3D movement system used to model autonomous guinea pig behavior in 3D mode. It provides shared type definitions for spatial positioning, entity movement state, obstacles, and world boundaries.

The file is a pure type-declaration module containing no runtime logic. It exports four interfaces plus a supporting `Vector3D` type. `Vector3D` represents a 3D coordinate with `x`, `y`, and `z` numbers. `GuineaPig3DState` tracks a guinea pig's spatial state, including its `worldPosition`, an optional `targetPosition`, Y-axis `rotation` in radians, an `isMoving` flag, and a `currentPath` array of waypoints. `CircleObstacle` models circular obstacles with an `id`, `center`, `radius`, and a `type` string (e.g. `'food_bowl'`, `'water_bottle'`). `WorldBounds` defines the rectangular movement area via `minX`, `maxX`, `minZ`, and `maxZ` (note: no Y bounds, consistent with ground-plane movement).

## Exports

- **Vector3D** (type) — `interface Vector3D { x: number; y: number; z: number }`: A 3D coordinate/vector with x, y, and z components.
- **GuineaPig3DState** (type) — `interface GuineaPig3DState { worldPosition: Vector3D; targetPosition: Vector3D | null; rotation: number; isMoving: boolean; currentPath: Vector3D[] }`: Movement state for a guinea pig, including current and target positions, Y-axis rotation in radians, a moving flag, and an array of path waypoints.
- **CircleObstacle** (type) — `interface CircleObstacle { id: string; center: Vector3D; radius: number; type: string }`: A circular obstacle defined by id, center point, radius, and a type string such as 'food_bowl' or 'water_bottle'.
- **WorldBounds** (type) — `interface WorldBounds { minX: number; maxX: number; minZ: number; maxZ: number }`: Rectangular movement boundaries on the X/Z plane (no Y bounds).

## Notes

- WorldBounds only constrains the X and Z axes; there is no Y-axis boundary, implying ground-plane movement.
- rotation is documented as radians on the Y-axis.
