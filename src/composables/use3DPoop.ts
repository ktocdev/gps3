import { watch } from 'vue'
import * as THREE from 'three'
import { useHabitatConditions } from '../stores/habitatConditions'
import { GRID_CONFIG } from '../constants/3d'
import { disposeObject3D } from '../utils/three-cleanup'

/**
 * Convert subgrid position to 3D world coordinates
 * Poop positions are stored in subgrid coordinates (4x finer than grid)
 * Grid: 14 cols × 10 rows | Subgrid: 56 cols × 40 rows
 */
function subgridToWorld(subgridX: number, subgridY: number): THREE.Vector3 {
  const SUBGRID_TO_GRID_SCALE = 4

  // Convert subgrid to grid coordinates
  const gridX = subgridX / SUBGRID_TO_GRID_SCALE
  const gridY = subgridY / SUBGRID_TO_GRID_SCALE

  // Convert grid to world coordinates
  const worldX = (gridX - GRID_CONFIG.COLS / 2) * GRID_CONFIG.CELL_SIZE
  const worldZ = (gridY - GRID_CONFIG.ROWS / 2) * GRID_CONFIG.CELL_SIZE

  return new THREE.Vector3(worldX, 0, worldZ)
}

/**
 * Create a poop pellet model (realistic guinea pig poop pellet)
 */
function createPoopModel(): THREE.Mesh {
  // Create an elongated pellet shape (capsule/oval)
  // Guinea pig poop is oval-shaped, dark brown pellets
  const poopGeo = new THREE.CapsuleGeometry(0.1, 0.25, 8, 16)

  // Dark brown color for realistic poop
  const poopMat = new THREE.MeshStandardMaterial({
    color: 0x3d2817, // Darker brown for realism
    roughness: 0.95,
    metalness: 0.0
  })

  const poop = new THREE.Mesh(poopGeo, poopMat)
  poop.position.y = 0.1 // Slightly above ground
  poop.castShadow = true
  poop.receiveShadow = true

  // Rotate to lay horizontally (capsule is vertical by default)
  poop.rotation.z = Math.PI / 2
  // Add slight random rotation for natural look
  poop.rotation.y = Math.random() * Math.PI * 2

  return poop
}

/**
 * Sync poop pellets with 3D scene and handle click detection
 */
export function use3DPoop(worldGroup: THREE.Group) {
  const habitatConditions = useHabitatConditions()

  // Registry of poop 3D models - maps poop ID to mesh
  const poopModels = new Map<string, THREE.Mesh>()

  // Store watcher stop handles for cleanup
  const stopWatchers: (() => void)[] = []

  // Watch for poop changes
  stopWatchers.push(watch(
    () => habitatConditions.poops,
    (poops) => {
      // Get current poop IDs
      const currentPoopIds = new Set(poops.map(p => p.id))

      // Add models for new poops
      poops.forEach((poop) => {
        if (!poopModels.has(poop.id)) {
          const model = createPoopModel()

          // Use world coordinates if available (3D), otherwise convert from subgrid (2D fallback)
          if (poop.worldX !== undefined && poop.worldZ !== undefined) {
            model.position.x = poop.worldX
            model.position.z = poop.worldZ
          } else {
            const worldPos = subgridToWorld(poop.x, poop.y)
            model.position.x = worldPos.x
            model.position.z = worldPos.z
          }
          // Keep y at 0.1 (set in createPoopModel)

          // Store poop ID in userData for click detection
          model.userData.poopId = poop.id

          poopModels.set(poop.id, model)
          worldGroup.add(model)
        }
      })

      // Remove models for deleted poops
      poopModels.forEach((model, poopId) => {
        if (!currentPoopIds.has(poopId)) {
          disposeObject3D(model)
          worldGroup.remove(model)
          poopModels.delete(poopId)
        }
      })
    },
    { deep: true, immediate: true }
  ))

  /**
   * Check if a clicked object is a poop pellet
   * Returns poop ID if clicked, null otherwise
   */
  function handlePoopClick(clickedObject: THREE.Object3D): string | null {
    // Check if the clicked object is a poop mesh
    if (clickedObject.userData.poopId) {
      return clickedObject.userData.poopId as string
    }

    // Check parent (in case mesh is part of a group)
    if (clickedObject.parent && clickedObject.parent.userData.poopId) {
      return clickedObject.parent.userData.poopId as string
    }

    return null
  }

  /**
   * Cleanup function - stops watchers and disposes models
   */
  function cleanup() {
    // Stop all watchers
    stopWatchers.forEach(stop => stop())

    // Dispose all poop models
    poopModels.forEach(model => {
      disposeObject3D(model)
      worldGroup.remove(model)
    })
    poopModels.clear()
  }

  return {
    poopModels,
    handlePoopClick,
    cleanup,
  }
}
