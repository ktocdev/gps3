import { watch } from 'vue'
import * as THREE from 'three'
import { useHabitatConditions } from '../stores/habitatConditions'
import { disposeObject3D } from '../utils/three-cleanup'
import { createItemModel, getWaterBottleRotation, gridToWorld } from './3d-models'
import { use3DPhysics } from './3d/use3DPhysics'
import { getBaseItemId } from '../utils/placementId'

/**
 * Sync habitat items with 3D scene
 */
export function use3DItems(worldGroup: THREE.Group) {
  const habitatConditions = useHabitatConditions()
  const physics3D = use3DPhysics()

  // Registry of item 3D models
  const itemModels = new Map<string, THREE.Group>()

  // Store watcher stop handles for cleanup
  const stopWatchers: (() => void)[] = []

  /**
   * Check if an item should have physics enabled
   * Uses base itemId for type detection
   */
  function shouldHavePhysics(placementId: string): 'ball' | 'stick' | null {
    const baseId = getBaseItemId(placementId).toLowerCase()
    if (baseId.includes('ball')) return 'ball'
    if (baseId.includes('stick') || baseId.includes('chew')) return 'stick'
    return null
  }

  /**
   * Initialize physics for a model if applicable
   */
  function initializePhysicsForItem(placementId: string, model: THREE.Group): void {
    const preset = shouldHavePhysics(placementId)
    if (preset) {
      // For physics items, the wrapper is the group and visual is the first mesh child
      const visual = model.children.find(child => child instanceof THREE.Mesh) || model
      physics3D.initializePhysicsItem(placementId, model, visual as THREE.Object3D, preset)
    }
  }

  // Watch for item position changes
  stopWatchers.push(watch(
    () => habitatConditions.itemPositions,
    (positions) => {
      // Get all placement IDs from positions map
      const positionedItemIds = new Set(positions.keys())

      // Add models for items that have positions
      positionedItemIds.forEach((placementId) => {
        if (!itemModels.has(placementId)) {
          // Use placement ID for model creation (contains base ID for type detection + unique ID for content lookup)
          const baseItemId = getBaseItemId(placementId)
          const model = createItemModel(placementId)
          // Store creation-time offsets in userData BEFORE any position updates
          // This prevents the offset from being compounded on each watcher run
          model.userData.creationOffsetX = model.position.x
          model.userData.creationOffsetY = model.position.y
          model.userData.creationOffsetZ = model.position.z
          // Store base itemId for later reference (e.g., rotation checks)
          model.userData.baseItemId = baseItemId
          itemModels.set(placementId, model)
          worldGroup.add(model)
          // Initialize physics for applicable items
          initializePhysicsForItem(placementId, model)
        }

        // Update position
        const position = positions.get(placementId)
        if (position) {
          const worldPos = gridToWorld(position.x, position.y)
          const model = itemModels.get(placementId)
          if (model) {
            // Use stored creation-time offsets (not current position which compounds)
            const offsetX = model.userData.creationOffsetX ?? 0
            const offsetY = model.userData.creationOffsetY ?? 0
            const offsetZ = model.userData.creationOffsetZ ?? 0
            model.position.copy(worldPos)
            model.position.x += offsetX
            model.position.y = offsetY
            model.position.z += offsetZ

            // Apply smart rotation for water bottles based on wall position
            const baseId = model.userData.baseItemId || getBaseItemId(placementId)
            if (baseId.includes('bottle')) {
              model.rotation.y = getWaterBottleRotation(position.x, position.y)
            }
          }
        }
      })

      // Remove models for items that no longer have positions
      itemModels.forEach((model, placementId) => {
        if (!positionedItemIds.has(placementId)) {
          // Remove physics if applicable
          physics3D.removePhysicsItem(placementId)
          disposeObject3D(model)
          worldGroup.remove(model)
          itemModels.delete(placementId)
        }
      })
    },
    { deep: true, immediate: true }
  ))

  // Watch for bowl contents changes and re-render affected bowls
  stopWatchers.push(watch(
    () => habitatConditions.bowlContents,
    () => {
      // Re-render all bowl models when contents change
      itemModels.forEach((model, placementId) => {
        const baseItemId = getBaseItemId(placementId)
        if (baseItemId.includes('bowl')) {
          // Get current position
          const position = habitatConditions.itemPositions.get(placementId)
          if (position) {
            // Remove old model
            disposeObject3D(model)
            worldGroup.remove(model)

            // Create new model with updated contents (use placement ID for content lookup)
            const newModel = createItemModel(placementId)
            // Store creation-time offsets in userData
            newModel.userData.creationOffsetX = newModel.position.x
            newModel.userData.creationOffsetY = newModel.position.y
            newModel.userData.creationOffsetZ = newModel.position.z
            newModel.userData.baseItemId = baseItemId
            const worldPos = gridToWorld(position.x, position.y)
            // Use stored creation-time offsets
            const offsetX = newModel.userData.creationOffsetX ?? 0
            const offsetY = newModel.userData.creationOffsetY ?? 0
            const offsetZ = newModel.userData.creationOffsetZ ?? 0
            newModel.position.copy(worldPos)
            newModel.position.x += offsetX
            newModel.position.y = offsetY
            newModel.position.z += offsetZ

            // Update registry and add to scene
            itemModels.set(placementId, newModel)
            worldGroup.add(newModel)
          }
        }
      })
    },
    { deep: true }
  ))

  // Watch for hay rack contents changes and re-render affected hay racks
  stopWatchers.push(watch(
    () => habitatConditions.hayRackContents,
    () => {
      // Re-render all hay rack models when contents change
      itemModels.forEach((model, placementId) => {
        const baseItemId = getBaseItemId(placementId)
        if (baseItemId.includes('hay') && baseItemId.includes('rack')) {
          // Get current position
          const position = habitatConditions.itemPositions.get(placementId)
          if (position) {
            // Remove old model
            disposeObject3D(model)
            worldGroup.remove(model)

            // Create new model with updated contents (use placement ID for content lookup)
            const newModel = createItemModel(placementId)
            // Store creation-time offsets in userData
            newModel.userData.creationOffsetX = newModel.position.x
            newModel.userData.creationOffsetY = newModel.position.y
            newModel.userData.creationOffsetZ = newModel.position.z
            newModel.userData.baseItemId = baseItemId
            const worldPos = gridToWorld(position.x, position.y)
            // Use stored creation-time offsets
            const offsetX = newModel.userData.creationOffsetX ?? 0
            const offsetY = newModel.userData.creationOffsetY ?? 0
            const offsetZ = newModel.userData.creationOffsetZ ?? 0
            newModel.position.copy(worldPos)
            newModel.position.x += offsetX
            newModel.position.y = offsetY
            newModel.position.z += offsetZ

            // Update registry and add to scene
            itemModels.set(placementId, newModel)
            worldGroup.add(newModel)
          }
        }
      })
    },
    { deep: true }
  ))

  /**
   * Cleanup function - stops watchers and disposes models
   */
  function cleanup() {
    // Stop all watchers
    stopWatchers.forEach(stop => stop())

    // Cleanup physics
    physics3D.cleanup()

    // Dispose all item models
    itemModels.forEach(model => {
      disposeObject3D(model)
      worldGroup.remove(model)
    })
    itemModels.clear()
  }

  return {
    itemModels,
    physics3D,
    cleanup,
  }
}
