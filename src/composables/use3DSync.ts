import { watch } from 'vue'
import * as THREE from 'three'
import { useHabitatConditions } from '../stores/habitatConditions'
import { useGuineaPigStore } from '../stores/guineaPigStore'
import { useMovement3DStore } from '../stores/movement3DStore'
import { createGuineaPigModel, disposeGuineaPigModel } from './use3DGuineaPig'
import { GRID_CONFIG, ANIMATION_CONFIG } from '../constants/3d'
import { getGuineaPig3DColors } from '../constants/guineaPigColors'

/**
 * Options for 3D sync behavior
 */
export interface Use3DSyncOptions {
  /**
   * If true, use world-coordinate positions from movement3DStore
   * for autonomous 3D movement. If false (default), use grid positions
   * from habitatConditions.
   */
  use3DMovement?: boolean
}

/**
 * Convert 2D grid position to 3D world coordinates
 */
export function gridToWorld(col: number, row: number): THREE.Vector3 {
  // Center the grid (col 7, row 5 → world 0, 0)
  const worldX = (col - GRID_CONFIG.COLS / 2) * GRID_CONFIG.CELL_SIZE
  const worldZ = (row - GRID_CONFIG.ROWS / 2) * GRID_CONFIG.CELL_SIZE
  const worldY = 0 // Ground level

  return new THREE.Vector3(worldX, worldY, worldZ)
}

/**
 * Convert 2D grid position with pixel offsets to 3D world coordinates
 */
export function gridToWorldWithOffset(pos: {
  x: number
  y: number
  offsetX?: number
  offsetY?: number
}): THREE.Vector3 {
  // Base world position (x and y in the store correspond to col and row)
  const worldX = (pos.x - GRID_CONFIG.COLS / 2) * GRID_CONFIG.CELL_SIZE
  const worldZ = (pos.y - GRID_CONFIG.ROWS / 2) * GRID_CONFIG.CELL_SIZE

  // Convert pixel offsets to world offsets
  const offsetX = ((pos.offsetX || 0) / GRID_CONFIG.PIXELS_PER_CELL) * GRID_CONFIG.CELL_SIZE
  const offsetZ = ((pos.offsetY || 0) / GRID_CONFIG.PIXELS_PER_CELL) * GRID_CONFIG.CELL_SIZE

  return new THREE.Vector3(worldX + offsetX, 0, worldZ + offsetZ)
}

/**
 * Sync guinea pig positions and create/remove models as needed
 * @param worldGroup - The THREE.Group to add models to
 * @param options - Configuration options for sync behavior
 */
export function use3DSync(worldGroup: THREE.Group, options: Use3DSyncOptions = {}) {
  const habitatConditions = useHabitatConditions()
  const guineaPigStore = useGuineaPigStore()
  const movement3DStore = useMovement3DStore()

  const { use3DMovement = false } = options

  // Registry of guinea pig 3D models and their previous positions
  const guineaPigModels = new Map<string, THREE.Group>()
  const previousPositions = new Map<string, THREE.Vector3>()

  // Store watcher stop handles for cleanup
  const stopWatchers: (() => void)[] = []

  // Watch for guinea pig additions/removals
  stopWatchers.push(watch(
    () => guineaPigStore.collection.activeGuineaPigIds,
    (activeIds) => {
      // Add models for active guinea pigs
      activeIds.forEach((guineaPigId) => {
        if (!guineaPigModels.has(guineaPigId)) {
          // Get guinea pig appearance data and map to 3D colors
          const guineaPig = guineaPigStore.getGuineaPig(guineaPigId)
          const colors = guineaPig
            ? getGuineaPig3DColors(guineaPig.appearance.furColor, guineaPig.appearance.eyeColor)
            : undefined

          const model = createGuineaPigModel(colors)
          model.userData.guineaPigId = guineaPigId // For raycasting/click detection
          guineaPigModels.set(guineaPigId, model)
          worldGroup.add(model)

          console.log(`[3DSync] Created model for ${guineaPig?.name || guineaPigId} with fur color: ${guineaPig?.appearance.furColor}`)
        }
      })

      // Remove models for inactive guinea pigs
      guineaPigModels.forEach((model, guineaPigId) => {
        if (!activeIds.includes(guineaPigId)) {
          disposeGuineaPigModel(model)
          worldGroup.remove(model)
          guineaPigModels.delete(guineaPigId)
          previousPositions.delete(guineaPigId)
        }
      })
    },
    { immediate: true },
  ))

  // Watch guinea pig positions and update 3D models
  if (use3DMovement) {
    // Use world-coordinate positions from movement3DStore
    stopWatchers.push(watch(
      () => {
        // Create a snapshot of current states to trigger reactivity
        const states: Array<[string, { x: number; z: number; rotation: number }]> = []
        movement3DStore.guineaPigStates.forEach((state, id) => {
          states.push([id, {
            x: state.worldPosition.x,
            z: state.worldPosition.z,
            rotation: state.rotation
          }])
        })
        return states
      },
      (stateSnapshots) => {
        for (const [guineaPigId, snapshot] of stateSnapshots) {
          const model = guineaPigModels.get(guineaPigId)
          if (model) {
            // Update position directly from world coordinates
            model.position.set(snapshot.x, 0, snapshot.z)

            // Update rotation from stored rotation
            model.rotation.y = snapshot.rotation
          }
        }
      },
      { deep: true }
    ))
  } else {
    // Use grid-based positions from habitatConditions (default)
    stopWatchers.push(watch(
      () => habitatConditions.guineaPigPositions,
      (positions) => {
        positions.forEach((pos: { x: number; y: number; offsetX?: number; offsetY?: number }, guineaPigId: string) => {
          const worldPos = gridToWorldWithOffset(pos)

          // Update 3D model position and rotation
          const model = guineaPigModels.get(guineaPigId)
          if (model) {
            // Get previous position to calculate movement direction
            const prevPos = previousPositions.get(guineaPigId)

            if (prevPos) {
              // Calculate movement direction
              const deltaX = worldPos.x - prevPos.x
              const deltaZ = worldPos.z - prevPos.z
              const distanceMoved = Math.sqrt(deltaX * deltaX + deltaZ * deltaZ)

              // Only update rotation if guinea pig actually moved
              if (distanceMoved > ANIMATION_CONFIG.MOVEMENT_THRESHOLD) {
                // Calculate angle to face movement direction
                // atan2 gives angle from positive X axis, rotating counter-clockwise
                const angle = Math.atan2(deltaX, deltaZ)
                model.rotation.y = angle
              }
            }

            // Update position
            model.position.copy(worldPos)

            // Store current position as previous for next update
            previousPositions.set(guineaPigId, worldPos.clone())
          }
        })
      },
      { deep: true },
    ))
  }

  /**
   * Cleanup function - stops watchers and disposes models
   */
  function cleanup() {
    // Stop all watchers
    stopWatchers.forEach(stop => stop())

    // Dispose all guinea pig models
    guineaPigModels.forEach(model => {
      disposeGuineaPigModel(model)
      worldGroup.remove(model)
    })
    guineaPigModels.clear()
    previousPositions.clear()
  }

  return {
    guineaPigModels,
    gridToWorld,
    gridToWorldWithOffset,
    cleanup,
  }
}
