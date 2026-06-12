/**
 * Types for 3D Movement System
 * Used for autonomous guinea pig behavior in 3D mode
 */

export interface Vector3D {
  x: number
  y: number
  z: number
}

export interface GuineaPig3DState {
  worldPosition: Vector3D
  targetPosition: Vector3D | null
  rotation: number // Y-axis rotation (radians)
  isMoving: boolean
  currentPath: Vector3D[] // Waypoints to target
}

export interface CircleObstacle {
  id: string
  center: Vector3D
  radius: number
  type: string // 'food_bowl', 'water_bottle', etc.
}

export interface WorldBounds {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}
