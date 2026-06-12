/**
 * 3D Physics Composable
 * Handles physics simulation for habitat items (ball, stick, etc.)
 * Based on physics patterns from guinea-pig-sim-demo-backup.html
 */

import * as THREE from 'three'
import { usePhysics3DStore } from '../../stores/physics3DStore'
import { useMovement3DStore } from '../../stores/movement3DStore'
import type { Vector3D } from '../../types/movement3d'
import type { RollAxis } from '../../types/physics3d'
import { PHYSICS_PRESETS } from '../../types/physics3d'

interface PhysicsMesh {
  wrapper: THREE.Object3D    // Wrapper for position
  visual: THREE.Object3D     // Visual mesh for rotation/rolling
}

export function use3DPhysics() {
  const physics3DStore = usePhysics3DStore()
  const movement3DStore = useMovement3DStore()

  // Map of item ID -> mesh references
  const meshRefs = new Map<string, PhysicsMesh>()

  /**
   * Register an item for physics simulation
   */
  function initializePhysicsItem(
    itemId: string,
    wrapper: THREE.Object3D,
    visual: THREE.Object3D,
    preset: keyof typeof PHYSICS_PRESETS
  ): void {
    // Add to store
    physics3DStore.addPhysicsItem(itemId, preset)

    // Store mesh references
    meshRefs.set(itemId, { wrapper, visual })
  }

  /**
   * Remove an item from physics simulation
   */
  function removePhysicsItem(itemId: string): void {
    physics3DStore.removePhysicsItem(itemId)
    meshRefs.delete(itemId)
  }

  /**
   * Main physics update loop - call once per frame
   * Note: deltaTime is available for future frame-rate independent physics
   */
  function updatePhysics(_deltaTime: number): void {
    const items = physics3DStore.getAllPhysicsItems()
    const guineaPigPositions = getGuineaPigPositions()

    for (const item of items) {
      // Skip locked items
      if (item.state === 'locked') continue

      const meshRef = meshRefs.get(item.id)
      if (!meshRef) continue

      const position = meshRef.wrapper.position

      // 1. Guinea pig collision - push items away
      for (const gpPos of guineaPigPositions) {
        const dist = distance2D(position, gpPos)
        if (dist < item.config.collisionRadius && dist > 0.01) {
          const pushDir = {
            x: (position.x - gpPos.x) / dist,
            z: (position.z - gpPos.z) / dist
          }
          physics3DStore.addVelocity(item.id, {
            x: pushDir.x * item.config.pushStrength,
            y: 0,
            z: pushDir.z * item.config.pushStrength
          })
        }
      }

      // 2. Apply velocity to position
      position.x += item.velocity.x
      position.z += item.velocity.z

      // 3. Rolling animation based on velocity
      applyRollingAnimation(meshRef.wrapper, meshRef.visual, item.velocity, item.config.rollAxis)

      // 4. Apply damping
      physics3DStore.applyDamping(item.id)

      // 5. Wall collision (clamp + reflect)
      handleWallCollision(item.id, meshRef.wrapper, item.config.bounceMultiplier)

      // 6. Obstacle collision
      handleObstacleCollision(item.id, meshRef.wrapper, item.config.bounceMultiplier)
    }
  }

  /**
   * Get all guinea pig positions as Vector3D array
   */
  function getGuineaPigPositions(): Vector3D[] {
    const positions: Vector3D[] = []
    for (const state of movement3DStore.guineaPigStates.values()) {
      positions.push(state.worldPosition)
    }
    return positions
  }

  /**
   * Calculate 2D distance (X-Z plane)
   */
  function distance2D(a: { x: number; z: number }, b: { x: number; z: number }): number {
    const dx = a.x - b.x
    const dz = a.z - b.z
    return Math.sqrt(dx * dx + dz * dz)
  }

  /**
   * Apply rolling animation based on velocity
   * Uses wrapper quaternion to calculate proper roll direction
   */
  function applyRollingAnimation(
    wrapper: THREE.Object3D,
    visual: THREE.Object3D,
    velocity: Vector3D,
    rollAxis: RollAxis
  ): void {
    const speed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z)
    if (speed < 0.0001) return

    switch (rollAxis) {
      case 'perpendicular': {
        // Ball: rotate perpendicular to velocity direction
        const axis = new THREE.Vector3(velocity.z, 0, -velocity.x).normalize()
        visual.rotateOnAxis(axis, speed / 0.8)
        break
      }
      case 'x': {
        // Stick: roll around its length axis based on sideways movement
        // Get the wrapper's side vector (perpendicular to stick length)
        const wrapperSideVec = new THREE.Vector3(0, 0, 1).applyQuaternion(wrapper.quaternion)
        // Calculate how much velocity is in the sideways direction
        const sideSpeed = velocity.x * wrapperSideVec.x + velocity.z * wrapperSideVec.z
        // Roll proportionally - smaller divisor = more rolling
        if (Math.abs(sideSpeed) > 0.0001) {
          visual.rotateX(sideSpeed / 0.12)  // Reduced divisor for more rolling
        }
        break
      }
      case 'z': {
        // Roll around Z axis
        visual.rotateZ(speed / 0.5)
        break
      }
    }
  }

  /**
   * Handle wall collision - clamp position and reflect velocity
   */
  function handleWallCollision(
    itemId: string,
    wrapper: THREE.Object3D,
    bounceMultiplier: number
  ): void {
    const item = physics3DStore.getPhysicsItem(itemId)
    if (!item) return

    const bounds = movement3DStore.worldBounds
    const margin = 0.8 // Keep items slightly inside walls

    // X axis walls
    if (wrapper.position.x > bounds.maxX - margin) {
      wrapper.position.x = bounds.maxX - margin
      if (item.velocity.x > 0) {
        physics3DStore.setVelocity(itemId, {
          x: item.velocity.x * -bounceMultiplier,
          y: item.velocity.y,
          z: item.velocity.z
        })
      }
    } else if (wrapper.position.x < bounds.minX + margin) {
      wrapper.position.x = bounds.minX + margin
      if (item.velocity.x < 0) {
        physics3DStore.setVelocity(itemId, {
          x: item.velocity.x * -bounceMultiplier,
          y: item.velocity.y,
          z: item.velocity.z
        })
      }
    }

    // Z axis walls
    if (wrapper.position.z > bounds.maxZ - margin) {
      wrapper.position.z = bounds.maxZ - margin
      if (item.velocity.z > 0) {
        physics3DStore.setVelocity(itemId, {
          x: item.velocity.x,
          y: item.velocity.y,
          z: item.velocity.z * -bounceMultiplier
        })
      }
    } else if (wrapper.position.z < bounds.minZ + margin) {
      wrapper.position.z = bounds.minZ + margin
      if (item.velocity.z < 0) {
        physics3DStore.setVelocity(itemId, {
          x: item.velocity.x,
          y: item.velocity.y,
          z: item.velocity.z * -bounceMultiplier
        })
      }
    }
  }

  /**
   * Handle obstacle collision - push out and reflect velocity
   */
  function handleObstacleCollision(
    itemId: string,
    wrapper: THREE.Object3D,
    bounceMultiplier: number
  ): void {
    const item = physics3DStore.getPhysicsItem(itemId)
    if (!item) return

    const obstacles = movement3DStore.getObstacles()
    const itemRadius = 0.8 // Approximate physics item radius

    for (const obstacle of obstacles) {
      // Skip self (if the physics item is also an obstacle)
      if (obstacle.id === itemId) continue

      const dist = distance2D(wrapper.position, obstacle.center)
      const minSep = obstacle.radius + itemRadius

      if (dist < minSep && dist > 0.01) {
        // Calculate normal from obstacle center to item
        const norm = {
          x: (wrapper.position.x - obstacle.center.x) / dist,
          z: (wrapper.position.z - obstacle.center.z) / dist
        }

        // Push item out of obstacle
        wrapper.position.x = obstacle.center.x + norm.x * minSep
        wrapper.position.z = obstacle.center.z + norm.z * minSep

        // Reflect velocity if moving toward obstacle
        const dotProduct = item.velocity.x * norm.x + item.velocity.z * norm.z
        if (dotProduct < 0) {
          physics3DStore.setVelocity(itemId, {
            x: item.velocity.x - 2 * dotProduct * norm.x * (1 - bounceMultiplier * 0.4),
            y: item.velocity.y,
            z: item.velocity.z - 2 * dotProduct * norm.z * (1 - bounceMultiplier * 0.4)
          })
        }
      }
    }
  }

  /**
   * Handle click on a physics item - add velocity in ray direction
   */
  function handleClick(itemId: string, rayDirection: THREE.Vector3): void {
    const item = physics3DStore.getPhysicsItem(itemId)
    if (!item || item.state === 'locked') return

    // Flatten to X-Z plane and normalize
    const flatDir = rayDirection.clone().setY(0).normalize()

    physics3DStore.addVelocity(itemId, {
      x: flatDir.x * item.config.clickStrength,
      y: 0,
      z: flatDir.z * item.config.clickStrength
    })
  }

  /**
   * Push a physics item with a specific velocity (for guinea pig headbutt)
   * @param itemId - The ID of the item to push
   * @param direction - The direction to push (x, y, z)
   * @param strength - Optional strength multiplier (default 1.0)
   */
  function pushItem(itemId: string, direction: { x: number; y: number; z: number }, strength: number = 1.0): void {
    const item = physics3DStore.getPhysicsItem(itemId)
    if (!item || item.state === 'locked') return

    physics3DStore.addVelocity(itemId, {
      x: direction.x * strength,
      y: direction.y * strength,
      z: direction.z * strength
    })
  }

  /**
   * Set physics state for an item
   */
  function setPhysicsState(itemId: string, state: 'free' | 'controlled' | 'locked'): void {
    physics3DStore.setPhysicsState(itemId, state)
  }

  /**
   * Check if an item has physics enabled
   */
  function hasPhysics(itemId: string): boolean {
    return physics3DStore.hasPhysics(itemId)
  }

  /**
   * Get mesh wrapper for a physics item
   */
  function getMeshWrapper(itemId: string): THREE.Object3D | undefined {
    return meshRefs.get(itemId)?.wrapper
  }

  /**
   * Cleanup - remove all physics items
   */
  function cleanup(): void {
    meshRefs.clear()
    physics3DStore.clearAll()
  }

  return {
    initializePhysicsItem,
    removePhysicsItem,
    updatePhysics,
    handleClick,
    pushItem,
    setPhysicsState,
    hasPhysics,
    getMeshWrapper,
    cleanup
  }
}
