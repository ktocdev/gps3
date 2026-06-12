import { ref } from 'vue'
import * as THREE from 'three'
import { useHabitatConditions } from '../../stores/habitatConditions'
import { useInventoryStore } from '../../stores/inventoryStore'
import { useSuppliesStore } from '../../stores/suppliesStore'
import { GRID_CONFIG } from '../../constants/3d'
import { disposeObject3D } from '../../utils/three-cleanup'
import { worldToGrid } from '../3d-models/shared/utils'

export interface PlacementModeState {
  itemId: string
  itemName: string
  isWaterBottle: boolean
}

/**
 * Composable for managing item placement in the 3D habitat
 * Handles placement mode, preview mesh, validation, and placing items
 */
export function use3DPlacement() {
  // Stores
  const habitatConditions = useHabitatConditions()
  const inventoryStore = useInventoryStore()
  const suppliesStore = useSuppliesStore()

  // State refs (reactive for UI)
  const placementMode = ref<PlacementModeState | null>(null)

  // Internal state (non-reactive)
  let worldGroup: THREE.Group | null = null
  let placementPreview: THREE.Group | null = null
  let isPlacementValid = false

  // ============================================================================
  // Lifecycle
  // ============================================================================

  /**
   * Initialize the placement system with THREE.js references
   */
  function init(worldGroupRef: THREE.Group) {
    worldGroup = worldGroupRef
    console.log('[use3DPlacement] Initialized')
  }

  /**
   * Dispose the placement system
   */
  function dispose() {
    if (placementPreview && worldGroup) {
      worldGroup.remove(placementPreview)
      disposeObject3D(placementPreview)
      placementPreview = null
    }
    placementMode.value = null
    isPlacementValid = false
    worldGroup = null
    console.log('[use3DPlacement] Disposed')
  }

  // ============================================================================
  // Functions
  // ============================================================================

  /**
   * Enter placement mode for an item
   */
  function enterPlacementMode(itemId: string): boolean {
    if (!worldGroup) {
      console.warn('[use3DPlacement] Cannot enter placement mode - not initialized')
      return false
    }

    const supplyItem = suppliesStore.getItemById(itemId)
    if (!supplyItem) return false

    // Exit any existing placement mode
    if (placementMode.value) {
      exitPlacementMode()
    }

    const isWaterBottle = itemId.includes('water') && itemId.includes('bottle')
    placementMode.value = {
      itemId,
      itemName: supplyItem.name,
      isWaterBottle
    }

    // Create ghost preview - simple box placeholder for now
    const previewGeometry = new THREE.BoxGeometry(2, 1.5, 2)
    const previewMaterial = new THREE.MeshStandardMaterial({
      color: 0x888888,
      transparent: true,
      opacity: 0.5,
      emissive: 0x00ff00,
      emissiveIntensity: 0.3
    })
    const previewMesh = new THREE.Mesh(previewGeometry, previewMaterial)
    previewMesh.position.y = 0.75 // Half height above ground

    placementPreview = new THREE.Group()
    placementPreview.add(previewMesh)
    placementPreview.visible = false
    worldGroup.add(placementPreview)

    console.log(`[use3DPlacement] Entered placement mode for: ${supplyItem.name}`)
    return true
  }

  /**
   * Exit placement mode and clean up preview
   */
  function exitPlacementMode() {
    if (placementPreview && worldGroup) {
      worldGroup.remove(placementPreview)
      disposeObject3D(placementPreview)
      placementPreview = null
    }
    placementMode.value = null
    isPlacementValid = false
    console.log('[use3DPlacement] Exited placement mode')
  }

  /**
   * Validate if a position is valid for placement
   */
  function validatePlacement(
    worldX: number,
    worldZ: number,
    mode: PlacementModeState
  ): boolean {
    const halfWidth = GRID_CONFIG.WIDTH / 2
    const halfDepth = GRID_CONFIG.DEPTH / 2
    const margin = 2.0 // Keep items away from edge (except water bottles)

    // Check if within bounds
    const inBoundsX = worldX >= -halfWidth + margin && worldX <= halfWidth - margin
    const inBoundsZ = worldZ >= -halfDepth + margin && worldZ <= halfDepth - margin

    // Water bottles: must be on edge
    if (mode.isWaterBottle) {
      const onLeftRight = Math.abs(worldX) > halfWidth - margin
      const onTopBottom = Math.abs(worldZ) > halfDepth - margin
      if (!onLeftRight && !onTopBottom) {
        return false // Water bottles must be on edges
      }
      // Water bottles can be outside normal bounds (on edges)
    } else {
      // Regular items must be within bounds
      if (!inBoundsX || !inBoundsZ) {
        return false
      }
    }

    // Check overlap with existing items (grid cell level)
    const gridPos = worldToGrid(worldX, worldZ)
    for (const [, pos] of habitatConditions.itemPositions) {
      if (pos.x === gridPos.x && pos.y === gridPos.y) {
        return false // Cell occupied
      }
    }

    return true
  }

  /**
   * Update the preview mesh color based on validity
   */
  function updatePreviewColor(valid: boolean) {
    if (!placementPreview) return

    const color = valid ? 0x00ff00 : 0xff0000 // Green or red
    placementPreview.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
        child.material.emissive.setHex(color)
      }
    })
  }

  /**
   * Update placement preview position based on mouse intersection
   * Returns true if preview was updated
   */
  function updatePreviewPosition(intersection: THREE.Vector3): boolean {
    if (!placementMode.value || !placementPreview) return false

    // Free placement - use exact world coordinates
    placementPreview.position.set(intersection.x, 0, intersection.z)
    placementPreview.visible = true

    // Validate and update preview color
    isPlacementValid = validatePlacement(intersection.x, intersection.z, placementMode.value)
    updatePreviewColor(isPlacementValid)

    return true
  }

  /**
   * Place the current item at the preview position
   * Returns true if item was placed successfully
   */
  function placeItem(): boolean {
    if (!placementMode.value || !placementPreview || !isPlacementValid) return false

    const position = {
      x: placementPreview.position.x,
      z: placementPreview.position.z
    }

    // Convert to grid coords for storage
    const gridPos = worldToGrid(position.x, position.z)

    // Add item to habitat (returns unique placement ID or null)
    const placementId = habitatConditions.addItemToHabitat(placementMode.value.itemId, gridPos)
    if (!placementId) {
      console.warn(`[use3DPlacement] Failed to place ${placementMode.value.itemName}`)
      return false
    }
    console.log(`[use3DPlacement] Placed ${placementMode.value.itemName} as ${placementId} at grid (${gridPos.x}, ${gridPos.y})`)

    // Check if more of this item available (unplaced instances)
    const remaining = inventoryStore.getUnplacedCount(placementMode.value.itemId)

    if (remaining <= 0) {
      exitPlacementMode()
      return true
    }

    // Otherwise stay in placement mode for more placements
    return true
  }

  /**
   * Check if placement is currently active
   */
  function isActive(): boolean {
    return placementMode.value !== null
  }

  /**
   * Check if current placement position is valid
   */
  function isCurrentPlacementValid(): boolean {
    return isPlacementValid
  }

  /**
   * Get the current placement mode state
   */
  function getPlacementMode(): PlacementModeState | null {
    return placementMode.value
  }

  return {
    // State
    placementMode,

    // Lifecycle
    init,
    dispose,

    // Functions
    enterPlacementMode,
    exitPlacementMode,
    updatePreviewPosition,
    placeItem,

    // Queries
    isActive,
    isCurrentPlacementValid,
    getPlacementMode
  }
}
