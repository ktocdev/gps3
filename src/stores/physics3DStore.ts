/**
 * Physics 3D Store
 * Manages physics state for habitat items (ball, stick, etc.)
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { PhysicsItem, PhysicsState, PhysicsItemConfig } from '../types/physics3d'
import { PHYSICS_PRESETS } from '../types/physics3d'

export const usePhysics3DStore = defineStore('physics3D', () => {
  // Map of item ID -> PhysicsItem
  const physicsItems = ref<Map<string, PhysicsItem>>(new Map())

  /**
   * Register an item for physics simulation
   */
  function addPhysicsItem(
    id: string,
    configOrPreset: PhysicsItemConfig | keyof typeof PHYSICS_PRESETS
  ): void {
    // Get config from preset or use provided config
    const config = typeof configOrPreset === 'string'
      ? PHYSICS_PRESETS[configOrPreset]
      : configOrPreset

    if (!config) {
      console.warn(`[Physics3D] Unknown preset: ${configOrPreset}`)
      return
    }

    physicsItems.value.set(id, {
      id,
      velocity: { x: 0, y: 0, z: 0 },
      state: 'free',
      config
    })

    console.log(`[Physics3D] Added physics item: ${id}`)
  }

  /**
   * Remove an item from physics simulation
   */
  function removePhysicsItem(id: string): void {
    if (physicsItems.value.delete(id)) {
      console.log(`[Physics3D] Removed physics item: ${id}`)
    }
  }

  /**
   * Get a physics item by ID
   */
  function getPhysicsItem(id: string): PhysicsItem | undefined {
    return physicsItems.value.get(id)
  }

  /**
   * Get all physics items
   */
  function getAllPhysicsItems(): PhysicsItem[] {
    return Array.from(physicsItems.value.values())
  }

  /**
   * Set physics state for an item
   * - 'free': Normal physics
   * - 'controlled': During play behavior
   * - 'locked': During chewing (no physics)
   */
  function setPhysicsState(id: string, state: PhysicsState): void {
    const item = physicsItems.value.get(id)
    if (item) {
      item.state = state
      // Reset velocity when locking
      if (state === 'locked') {
        item.velocity = { x: 0, y: 0, z: 0 }
      }
      console.log(`[Physics3D] Set state for ${id}: ${state}`)
    }
  }

  /**
   * Set velocity for an item
   */
  function setVelocity(id: string, velocity: { x: number; y: number; z: number }): void {
    const item = physicsItems.value.get(id)
    if (item && item.state !== 'locked') {
      item.velocity = { ...velocity }
    }
  }

  /**
   * Add velocity to an item (accumulate)
   */
  function addVelocity(id: string, delta: { x: number; y: number; z: number }): void {
    const item = physicsItems.value.get(id)
    if (item && item.state !== 'locked') {
      item.velocity.x += delta.x
      item.velocity.y += delta.y
      item.velocity.z += delta.z
    }
  }

  /**
   * Apply damping to an item's velocity
   */
  function applyDamping(id: string): void {
    const item = physicsItems.value.get(id)
    if (item && item.state !== 'locked') {
      item.velocity.x *= item.config.damping
      item.velocity.y *= item.config.damping
      item.velocity.z *= item.config.damping
    }
  }

  /**
   * Check if an item has physics enabled
   */
  function hasPhysics(id: string): boolean {
    return physicsItems.value.has(id)
  }

  /**
   * Clear all physics items
   */
  function clearAll(): void {
    physicsItems.value.clear()
    console.log('[Physics3D] Cleared all physics items')
  }

  return {
    // State
    physicsItems,

    // Item management
    addPhysicsItem,
    removePhysicsItem,
    getPhysicsItem,
    getAllPhysicsItems,
    hasPhysics,
    clearAll,

    // State management
    setPhysicsState,

    // Velocity management
    setVelocity,
    addVelocity,
    applyDamping
  }
})
