import { ref, computed } from 'vue'
import * as THREE from 'three'
import { useHabitatConditions } from '../../stores/habitatConditions'
import { useLoggingStore } from '../../stores/loggingStore'
import { useSuppliesStore } from '../../stores/suppliesStore'
import { getBaseItemId } from '../../utils/placementId'
import type { use3DHabitatCare } from './use3DHabitatCare'

/**
 * Composable for managing water bottle menu and interactions
 * Handles opening/closing menu and refill actions
 */
export function use3DWaterBottle() {
  // Stores
  const habitatConditions = useHabitatConditions()
  const loggingStore = useLoggingStore()
  const suppliesStore = useSuppliesStore()

  // State refs (reactive for UI)
  const showWaterBottleMenu = ref(false)
  const waterBottleMenuPosition = ref({ x: 0, y: 0 })
  const selectedBottlePlacementId = ref<string | null>(null)

  // Internal state (non-reactive)
  let itemModels: Map<string, THREE.Group> | null = null
  let habitatCare: ReturnType<typeof use3DHabitatCare> | null = null

  // Get the name of the currently selected water bottle from supplies store
  const currentBottleName = computed(() => {
    if (!selectedBottlePlacementId.value) return null
    const baseItemId = getBaseItemId(selectedBottlePlacementId.value)
    const item = suppliesStore.getItemById(baseItemId)
    return item?.name || null
  })

  // Get the water level for the currently selected bottle
  const currentBottleWaterLevel = computed(() => {
    if (!selectedBottlePlacementId.value) return 100
    return habitatConditions.getWaterBottleLevel(selectedBottlePlacementId.value)
  })

  // ============================================================================
  // Lifecycle
  // ============================================================================

  /**
   * Initialize the water bottle system with THREE.js references
   */
  function init(
    itemModelsRef: Map<string, THREE.Group>,
    habitatCareRef: ReturnType<typeof use3DHabitatCare>
  ) {
    itemModels = itemModelsRef
    habitatCare = habitatCareRef
    console.log('[use3DWaterBottle] Initialized')
  }

  /**
   * Dispose the water bottle system
   */
  function dispose() {
    showWaterBottleMenu.value = false
    itemModels = null
    habitatCare = null
    console.log('[use3DWaterBottle] Disposed')
  }

  // ============================================================================
  // Functions
  // ============================================================================

  /**
   * Find the first water bottle model in the scene (legacy - use getAllWaterBottles for multi-bottle support)
   */
  function findWaterBottleModel(): THREE.Group | null {
    if (!itemModels) return null

    for (const [placementId, model] of itemModels.entries()) {
      const baseItemId = getBaseItemId(placementId)
      const item = suppliesStore.getItemById(baseItemId)
      if (item?.stats?.itemType === 'water_bottle') {
        return model
      }
    }
    return null
  }

  /**
   * Get all water bottle models with their placement IDs
   * Used for per-bottle water level updates in animation loop
   */
  function getAllWaterBottles(): Array<{ placementId: string; model: THREE.Group }> {
    if (!itemModels) return []

    const bottles: Array<{ placementId: string; model: THREE.Group }> = []
    for (const [placementId, model] of itemModels.entries()) {
      const baseItemId = getBaseItemId(placementId)
      const item = suppliesStore.getItemById(baseItemId)
      if (item?.stats?.itemType === 'water_bottle') {
        bottles.push({ placementId, model })
      }
    }
    return bottles
  }

  /**
   * Open the water bottle menu at the specified position
   */
  function openMenu(placementId: string, position: { x: number; y: number }) {
    selectedBottlePlacementId.value = placementId
    showWaterBottleMenu.value = true
    waterBottleMenuPosition.value = position
    console.log(`[use3DWaterBottle] Opened menu for: ${placementId}`)
  }

  /**
   * Close the water bottle menu
   */
  function closeMenu() {
    showWaterBottleMenu.value = false
    selectedBottlePlacementId.value = null
  }

  /**
   * Handle refilling the water bottle
   */
  function handleRefill() {
    if (!habitatCare) {
      console.warn('[use3DWaterBottle] Cannot refill - habitatCare not initialized')
      return
    }

    if (!selectedBottlePlacementId.value) {
      console.warn('[use3DWaterBottle] No bottle selected')
      return
    }

    const amountFilled = habitatConditions.refillWater(selectedBottlePlacementId.value)
    console.log(`[use3DWaterBottle] Water bottle ${selectedBottlePlacementId.value} refilled (+${amountFilled}%)`)
    closeMenu()

    // Log player action
    if (amountFilled >= 1) {
      loggingStore.addPlayerAction(`Refilled water bottle (+${amountFilled.toFixed(0)}%)`, '💧')
    }

    // Show result dialog (using habitatCare composable's dialog)
    habitatCare.actionResultIcon.value = '💧'
    habitatCare.actionResultTitle.value = 'Water Refilled!'
    habitatCare.actionResultMessage.value = amountFilled < 1
      ? 'The water bottle was already full!'
      : ''
    habitatCare.actionResultStats.value = amountFilled >= 1
      ? [
          { label: 'Water Added', value: `${amountFilled.toFixed(0)}%` },
          { label: 'Water Level', value: '100%' }
        ]
      : [{ label: 'Water Level', value: '100%' }]
    habitatCare.showActionResultDialog.value = true
  }

  /**
   * Handle removing the water bottle from habitat (return to inventory)
   */
  function handleRemoveWaterBottle() {
    if (!selectedBottlePlacementId.value) return

    const placementId = selectedBottlePlacementId.value
    const baseItemId = getBaseItemId(placementId)
    const supplyItem = suppliesStore.getItemById(baseItemId)
    const itemName = supplyItem?.name || 'water bottle'
    const emoji = supplyItem?.emoji || '🍼'

    // Remove from habitat (handles inventory unmark internally)
    habitatConditions.removeItemFromHabitat(placementId)

    loggingStore.addPlayerAction(
      `Removed ${itemName} from habitat`,
      emoji
    )

    console.log(`[use3DWaterBottle] Removed water bottle: ${placementId}`)
    closeMenu()
  }

  /**
   * Check if menu is currently open
   */
  function isMenuOpen(): boolean {
    return showWaterBottleMenu.value
  }

  return {
    // State
    showWaterBottleMenu,
    waterBottleMenuPosition,
    selectedBottlePlacementId,

    // Computed
    currentBottleName,
    currentBottleWaterLevel,

    // Lifecycle
    init,
    dispose,

    // Functions
    findWaterBottleModel,
    getAllWaterBottles,
    openMenu,
    closeMenu,
    handleRefill,
    handleRemoveWaterBottle,
    isMenuOpen
  }
}
