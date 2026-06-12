/**
 * 3D Pathfinding Composable
 * Circle-based obstacle avoidance for guinea pig movement
 * Based on algorithm from guinea-pig-sim-demo-backup.html
 */

import { useMovement3DStore } from '../../stores/movement3DStore'
import type { Vector3D, CircleObstacle } from '../../types/movement3d'

interface LineCircleIntersection {
  intersects: boolean
  closestPoint?: Vector3D
  distance?: number
}

export function use3DPathfinding() {
  const movement3DStore = useMovement3DStore()

  /**
   * Calculate distance between two points in X-Z plane
   */
  function distance2D(a: Vector3D, b: Vector3D): number {
    const dx = b.x - a.x
    const dz = b.z - a.z
    return Math.sqrt(dx * dx + dz * dz)
  }

  /**
   * Check if a line segment from start to end intersects a circle obstacle
   * Returns intersection info if blocked
   */
  function lineIntersectsCircle(
    start: Vector3D,
    end: Vector3D,
    obstacle: CircleObstacle
  ): LineCircleIntersection {
    // Direction vector from start to end
    const dirX = end.x - start.x
    const dirZ = end.z - start.z
    const totalDist = Math.sqrt(dirX * dirX + dirZ * dirZ)

    if (totalDist < 0.01) {
      return { intersects: false }
    }

    // Normalize direction
    const normDirX = dirX / totalDist
    const normDirZ = dirZ / totalDist

    // Vector from start to obstacle center
    const toObsX = obstacle.center.x - start.x
    const toObsZ = obstacle.center.z - start.z

    // Project obstacle center onto the line
    const projection = toObsX * normDirX + toObsZ * normDirZ

    // Only consider obstacles ahead of start and before end
    if (projection <= 0 || projection >= totalDist) {
      return { intersects: false }
    }

    // Closest point on line to obstacle center
    const closestX = start.x + normDirX * projection
    const closestZ = start.z + normDirZ * projection

    // Distance from closest point to obstacle center
    const distToCenter = Math.sqrt(
      (closestX - obstacle.center.x) ** 2 + (closestZ - obstacle.center.z) ** 2
    )

    // Check if line passes through obstacle
    if (distToCenter < obstacle.radius) {
      return {
        intersects: true,
        closestPoint: { x: closestX, y: 0, z: closestZ },
        distance: projection
      }
    }

    return { intersects: false }
  }

  /**
   * Calculate a waypoint to go around an obstacle
   */
  function getAvoidanceWaypoint(
    start: Vector3D,
    closestPoint: Vector3D,
    obstacle: CircleObstacle
  ): Vector3D {
    // Direction from obstacle center to closest point on path
    let pushDirX = closestPoint.x - obstacle.center.x
    let pushDirZ = closestPoint.z - obstacle.center.z
    const pushLength = Math.sqrt(pushDirX * pushDirX + pushDirZ * pushDirZ)

    // If closest point is at center (rare), use perpendicular to travel direction
    if (pushLength < 0.001) {
      const dirX = closestPoint.x - start.x
      const dirZ = closestPoint.z - start.z
      // Perpendicular: rotate 90 degrees
      pushDirX = -dirZ
      pushDirZ = dirX
    } else {
      // Normalize push direction
      pushDirX /= pushLength
      pushDirZ /= pushLength
    }

    // Place waypoint at obstacle edge plus margin for guinea pig body size
    const margin = 1.2  // Increased from 0.5 to account for guinea pig body
    const waypointX = obstacle.center.x + pushDirX * (obstacle.radius + margin)
    const waypointZ = obstacle.center.z + pushDirZ * (obstacle.radius + margin)

    return {
      x: waypointX,
      y: 0,
      z: waypointZ
    }
  }

  /**
   * Calculate a path from start to end, avoiding obstacles
   * Returns array of waypoints (including final destination)
   */
  function calculatePath(start: Vector3D, end: Vector3D, maxIterations: number = 10): Vector3D[] {
    const path: Vector3D[] = []
    const obstacles = movement3DStore.getObstacles()

    // Use recursive helper to build path
    buildPathSegment(start, end, obstacles, path, maxIterations)

    // Always include the final destination
    path.push({ ...end })

    return path
  }

  /**
   * Recursively build path segment, adding waypoints as needed
   */
  function buildPathSegment(
    start: Vector3D,
    end: Vector3D,
    obstacles: CircleObstacle[],
    path: Vector3D[],
    remainingIterations: number
  ): void {
    if (remainingIterations <= 0) {
      // Max iterations reached, just go direct
      return
    }

    // Find closest blocking obstacle
    let closestBlock: {
      obstacle: CircleObstacle
      closestPoint: Vector3D
      distance: number
    } | null = null

    for (const obstacle of obstacles) {
      const intersection = lineIntersectsCircle(start, end, obstacle)

      if (intersection.intersects && intersection.closestPoint && intersection.distance) {
        if (!closestBlock || intersection.distance < closestBlock.distance) {
          closestBlock = {
            obstacle,
            closestPoint: intersection.closestPoint,
            distance: intersection.distance
          }
        }
      }
    }

    if (closestBlock) {
      // Calculate waypoint around obstacle
      const waypoint = getAvoidanceWaypoint(start, closestBlock.closestPoint, closestBlock.obstacle)

      // Clamp waypoint to world bounds
      const clampedWaypoint = movement3DStore.clampToBounds(waypoint)

      // Recursively build path to waypoint, then from waypoint to end
      buildPathSegment(start, clampedWaypoint, obstacles, path, remainingIterations - 1)
      path.push(clampedWaypoint)
      buildPathSegment(clampedWaypoint, end, obstacles, path, remainingIterations - 1)
    }
    // If no obstacle blocks the path, we're done with this segment
  }

  /**
   * Check if a direct path is clear (no obstacles blocking)
   */
  function isPathClear(start: Vector3D, end: Vector3D): boolean {
    const obstacles = movement3DStore.getObstacles()

    for (const obstacle of obstacles) {
      const intersection = lineIntersectsCircle(start, end, obstacle)
      if (intersection.intersects) {
        return false
      }
    }

    return true
  }

  /**
   * Find the nearest valid position from a point (outside obstacles and in bounds)
   * margin accounts for guinea pig body size
   */
  function findNearestValidPosition(point: Vector3D, margin: number = 1.2): Vector3D {
    // First clamp to bounds
    let result = movement3DStore.clampToBounds(point, margin)

    // Check if in any obstacle
    const obstacles = movement3DStore.getObstacles()

    for (const obstacle of obstacles) {
      const dx = result.x - obstacle.center.x
      const dz = result.z - obstacle.center.z
      const distance = Math.sqrt(dx * dx + dz * dz)

      if (distance < obstacle.radius + margin) {
        // Push out of obstacle
        const pushDist = obstacle.radius + margin - distance + 0.1
        const normDx = dx / distance || 1
        const normDz = dz / distance || 0

        result = {
          x: result.x + normDx * pushDist,
          y: 0,
          z: result.z + normDz * pushDist
        }

        // Re-clamp to bounds
        result = movement3DStore.clampToBounds(result, margin)
      }
    }

    return result
  }

  return {
    calculatePath,
    isPathClear,
    findNearestValidPosition,
    lineIntersectsCircle,
    distance2D
  }
}
