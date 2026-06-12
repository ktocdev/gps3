/**
 * Types for 3D Physics System
 * Handles physics simulation for habitat items (ball, stick, etc.)
 */

import type { Vector3D } from './movement3d'

/**
 * Physics state for items:
 * - 'free': Natural physics, items can be pushed by guinea pig, clicked by user
 * - 'controlled': During play behavior, physics constrained to interaction
 * - 'locked': During chewing, physics disabled to keep item in place
 */
export type PhysicsState = 'free' | 'controlled' | 'locked'

/**
 * Roll axis determines how the item rotates when moving:
 * - 'x': Rolls around X axis (like a log rolling sideways)
 * - 'z': Rolls around Z axis
 * - 'perpendicular': Rolls perpendicular to velocity (like a ball)
 */
export type RollAxis = 'x' | 'z' | 'perpendicular'

/**
 * Configuration for initializing a physics item
 */
export interface PhysicsItemConfig {
  damping: number              // Velocity decay per frame (0.90-0.96)
  bounceMultiplier: number     // Velocity multiplier on wall/obstacle bounce (0.5-0.7)
  collisionRadius: number      // Distance at which guinea pig pushes item
  rollAxis: RollAxis           // How the item rolls
  pushStrength: number         // How much velocity added on guinea pig collision
  clickStrength: number        // How much velocity added on user click
}

/**
 * Runtime state for a physics-enabled item
 */
export interface PhysicsItem {
  id: string                   // Unique item ID (matches habitat item)
  velocity: Vector3D           // Current velocity
  state: PhysicsState          // Current physics state
  config: PhysicsItemConfig    // Physics configuration
}

/**
 * Default physics configurations for different item types
 */
export const PHYSICS_PRESETS: Record<string, PhysicsItemConfig> = {
  ball: {
    damping: 0.96,
    bounceMultiplier: 0.7,
    collisionRadius: 1.6,
    rollAxis: 'perpendicular',
    pushStrength: 0.03,
    clickStrength: 0.15
  },
  stick: {
    damping: 0.90,
    bounceMultiplier: 0.5,
    collisionRadius: 1.6,
    rollAxis: 'x',
    pushStrength: 0.02,
    clickStrength: 0.3
  }
}
