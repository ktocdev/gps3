/**
 * Movement 3D Store
 * Manages guinea pig positions and obstacles in 3D world coordinates
 * for autonomous behavior with circle-based pathfinding
 */

import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import { useHabitatConditions } from './habitatConditions'
import { useSuppliesStore } from './suppliesStore'
import { GRID_CONFIG } from '../constants/3d'
import type { Vector3D, GuineaPig3DState, CircleObstacle, WorldBounds } from '../types/movement3d'

// Obstacle radii by item type (world units)
// These should match or slightly exceed the visual footprint of 3D models
const OBSTACLE_RADII: Record<string, number> = {
  food_bowl: 2.0,      // Increased from 1.5 to match visual bowl size
  water_bottle: 2.5,   // Increased from 1.5 - bottles are taller/wider
  shelter: 4.5,        // Increased from 4.0 for better wall clearance
  igloo: 4.5,          // Increased from 4.0 for better wall clearance
  tunnel: 0,           // Set to 0 - tunnels are passable (guinea pigs walk through)
  hideout: 3.0,        // Increased from 2.5
  bed: 3.0,            // Increased from 2.5
  hay_rack: 2.5,       // Increased from 2.0
  default: 2.0         // Increased from 1.5
}

export const useMovement3DStore = defineStore('movement3D', () => {
  // Guinea pig positions in world coordinates
  const guineaPigStates = ref<Map<string, GuineaPig3DState>>(new Map())

  // Obstacles derived from habitatConditions.itemPositions
  const obstacles = ref<CircleObstacle[]>([])

  // World bounds (from GRID_CONFIG)
  const worldBounds: WorldBounds = reactive({
    minX: -(GRID_CONFIG.COLS * GRID_CONFIG.CELL_SIZE) / 2,
    maxX: (GRID_CONFIG.COLS * GRID_CONFIG.CELL_SIZE) / 2,
    minZ: -(GRID_CONFIG.ROWS * GRID_CONFIG.CELL_SIZE) / 2,
    maxZ: (GRID_CONFIG.ROWS * GRID_CONFIG.CELL_SIZE) / 2
  })

  /**
   * Convert grid position (col, row) to world coordinates
   */
  function gridToWorld(col: number, row: number): Vector3D {
    return {
      x: (col - GRID_CONFIG.COLS / 2) * GRID_CONFIG.CELL_SIZE,
      y: 0,
      z: (row - GRID_CONFIG.ROWS / 2) * GRID_CONFIG.CELL_SIZE
    }
  }

  /**
   * Convert world coordinates to grid position
   */
  function worldToGrid(x: number, z: number): { col: number; row: number } {
    return {
      col: Math.round(x / GRID_CONFIG.CELL_SIZE + GRID_CONFIG.COLS / 2),
      row: Math.round(z / GRID_CONFIG.CELL_SIZE + GRID_CONFIG.ROWS / 2)
    }
  }

  /**
   * Initialize a guinea pig in 3D world
   */
  function initializeGuineaPig(id: string, startPosition: Vector3D): void {
    guineaPigStates.value.set(id, {
      worldPosition: { ...startPosition },
      targetPosition: null,
      rotation: 0,
      isMoving: false,
      currentPath: []
    })
    console.log(`[Movement3D] Guinea pig ${id} initialized at (${startPosition.x.toFixed(1)}, ${startPosition.z.toFixed(1)})`)
  }

  /**
   * Update guinea pig position
   */
  function updatePosition(id: string, position: Vector3D): void {
    const state = guineaPigStates.value.get(id)
    if (state) {
      state.worldPosition = { ...position }
    }
  }

  /**
   * Set target position for guinea pig
   */
  function setTarget(id: string, target: Vector3D | null): void {
    const state = guineaPigStates.value.get(id)
    if (state) {
      state.targetPosition = target ? { ...target } : null
    }
  }

  /**
   * Get guinea pig state
   */
  function getGuineaPigState(id: string): GuineaPig3DState | undefined {
    return guineaPigStates.value.get(id)
  }

  /**
   * Remove guinea pig from 3D tracking
   */
  function removeGuineaPig(id: string): void {
    guineaPigStates.value.delete(id)
    console.log(`[Movement3D] Guinea pig ${id} removed`)
  }

  /**
   * Clear all guinea pigs
   */
  function clearAllGuineaPigs(): void {
    guineaPigStates.value.clear()
    console.log('[Movement3D] All guinea pigs cleared')
  }

  /**
   * Determine obstacle radius from item type
   */
  function getObstacleRadius(itemId: string, itemType?: string): number {
    // Check for specific item type
    if (itemType) {
      for (const [key, radius] of Object.entries(OBSTACLE_RADII)) {
        if (itemType.toLowerCase().includes(key)) {
          return radius
        }
      }
    }

    // Check item ID for keywords
    const idLower = itemId.toLowerCase()
    for (const [key, radius] of Object.entries(OBSTACLE_RADII)) {
      if (idLower.includes(key)) {
        return radius
      }
    }

    return OBSTACLE_RADII.default
  }

  /**
   * Sync obstacles from habitat item positions
   */
  function syncObstaclesFromHabitat(): void {
    const habitatConditions = useHabitatConditions()
    const suppliesStore = useSuppliesStore()

    const newObstacles: CircleObstacle[] = []

    // Iterate through all placed items
    for (const [itemId, gridPos] of habitatConditions.itemPositions.entries()) {
      // Get item details from supplies store
      const item = suppliesStore.getItemById(itemId)
      const itemType = item?.stats?.itemType || ''

      // Convert grid position to world coordinates
      const worldPos = gridToWorld(gridPos.x, gridPos.y)

      // Get appropriate radius for this item type
      const radius = getObstacleRadius(itemId, itemType)

      // Skip items with 0 radius (e.g., tunnels are passable)
      if (radius <= 0) {
        continue
      }

      newObstacles.push({
        id: itemId,
        center: worldPos,
        radius,
        type: itemType || itemId
      })
    }

    obstacles.value = newObstacles
    console.log(`[Movement3D] Synced ${newObstacles.length} obstacles from habitat`)
  }

  /**
   * Get all obstacles
   */
  function getObstacles(): CircleObstacle[] {
    return obstacles.value
  }

  /**
   * Find obstacle by item ID
   */
  function getObstacleById(itemId: string): CircleObstacle | undefined {
    return obstacles.value.find(o => o.id === itemId)
  }

  /**
   * Check if a point is within any obstacle
   */
  function isPointInObstacle(point: Vector3D, margin: number = 0): boolean {
    for (const obstacle of obstacles.value) {
      const dx = point.x - obstacle.center.x
      const dz = point.z - obstacle.center.z
      const distance = Math.sqrt(dx * dx + dz * dz)

      if (distance < obstacle.radius + margin) {
        return true
      }
    }
    return false
  }

  /**
   * Check if a point is within world bounds
   */
  function isInBounds(point: Vector3D, margin: number = 1): boolean {
    return (
      point.x >= worldBounds.minX + margin &&
      point.x <= worldBounds.maxX - margin &&
      point.z >= worldBounds.minZ + margin &&
      point.z <= worldBounds.maxZ - margin
    )
  }

  /**
   * Clamp a point to world bounds
   */
  function clampToBounds(point: Vector3D, margin: number = 1): Vector3D {
    return {
      x: Math.max(worldBounds.minX + margin, Math.min(worldBounds.maxX - margin, point.x)),
      y: point.y,
      z: Math.max(worldBounds.minZ + margin, Math.min(worldBounds.maxZ - margin, point.z))
    }
  }

  return {
    // State
    guineaPigStates,
    obstacles,
    worldBounds,

    // Coordinate conversion
    gridToWorld,
    worldToGrid,

    // Guinea pig management
    initializeGuineaPig,
    updatePosition,
    setTarget,
    getGuineaPigState,
    removeGuineaPig,
    clearAllGuineaPigs,

    // Obstacle management
    syncObstaclesFromHabitat,
    getObstacles,
    getObstacleById,
    isPointInObstacle,

    // Bounds checking
    isInBounds,
    clampToBounds
  }
})
