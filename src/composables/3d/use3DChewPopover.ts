import { ref, computed } from 'vue'
import { useHabitatContainers } from '../useHabitatContainers'
import { useLoggingStore } from '../../stores/loggingStore'
import { useSuppliesStore } from '../../stores/suppliesStore'
import { useInventoryStore } from '../../stores/inventoryStore'
import { useHabitatConditions } from '../../stores/habitatConditions'
import { CHEW_DEGRADATION } from '../../constants/supplies'
import { getBaseItemId } from '../../utils/placementId'

export interface ChewPopoverData {
  placementId: string  // Full placement ID
  itemId: string       // Base item ID
  itemName: string
  itemEmoji: string
  durability: number
  usageCount: number
  lastUsedAt: number
}

/**
 * Composable for managing chew item popover menu in 3D view
 * Handles opening/closing menu, showing durability info, and remove/discard actions
 */
export function use3DChewPopover() {
  // Stores
  const habitatContainers = useHabitatContainers()
  const habitatConditions = useHabitatConditions()
  const loggingStore = useLoggingStore()
  const suppliesStore = useSuppliesStore()
  const inventoryStore = useInventoryStore()

  // State - stores the full placement ID
  const selectedPlacementId = ref<string | null>(null)
  const showChewPopover = ref(false)
  const menuPosition = ref({ x: 0, y: 0 })

  // ============================================================================
  // Computed Properties
  // ============================================================================

  /**
   * Get data for the currently selected chew item
   */
  const currentChewData = computed((): ChewPopoverData | null => {
    if (!selectedPlacementId.value) return null

    // Chew data is stored by placement ID
    const chewData = habitatContainers.getChewData(selectedPlacementId.value)
    if (!chewData) return null

    // Use base itemId for metadata lookup
    const baseItemId = getBaseItemId(selectedPlacementId.value)
    const item = suppliesStore.getItemById(baseItemId)
    if (!item) return null

    return {
      placementId: selectedPlacementId.value,
      itemId: baseItemId,
      itemName: item.name,
      itemEmoji: item.emoji || '🪵',
      durability: chewData.durability,
      usageCount: chewData.usageCount,
      lastUsedAt: chewData.lastUsedAt
    }
  })

  /**
   * Check if current chew is unsafe (needs discarding)
   */
  const isUnsafe = computed(() => {
    if (!currentChewData.value) return false
    return currentChewData.value.durability < CHEW_DEGRADATION.UNSAFE_THRESHOLD
  })

  /**
   * Get durability status text
   */
  const durabilityStatus = computed(() => {
    if (!currentChewData.value) return 'Unknown'
    const durability = currentChewData.value.durability
    if (durability < CHEW_DEGRADATION.UNSAFE_THRESHOLD) return 'Unsafe'
    if (durability < CHEW_DEGRADATION.DEGRADED_THRESHOLD) return 'Degraded'
    if (durability < CHEW_DEGRADATION.WORN_THRESHOLD) return 'Worn'
    return 'Good'
  })

  /**
   * Get durability bar color class
   */
  const durabilityColorClass = computed(() => {
    if (!currentChewData.value) return ''
    const durability = currentChewData.value.durability
    if (durability < CHEW_DEGRADATION.UNSAFE_THRESHOLD) return 'chew-popover__bar--unsafe'
    if (durability < CHEW_DEGRADATION.DEGRADED_THRESHOLD) return 'chew-popover__bar--degraded'
    if (durability < CHEW_DEGRADATION.WORN_THRESHOLD) return 'chew-popover__bar--worn'
    return 'chew-popover__bar--good'
  })

  // ============================================================================
  // Functions
  // ============================================================================

  /**
   * Open chew popover for a specific item
   * @param placementId - The full placement ID (e.g., "habitat_chew_stick::instance_abc")
   */
  function openChewPopover(
    placementId: string,
    position: { x: number; y: number }
  ) {
    selectedPlacementId.value = placementId
    menuPosition.value = position
    showChewPopover.value = true
    console.log(`[use3DChewPopover] Opened popover for: ${placementId}`)
  }

  /**
   * Close the chew popover
   */
  function closeChewPopover() {
    showChewPopover.value = false
    selectedPlacementId.value = null
  }

  /**
   * Discard unsafe chew (permanently delete)
   * Note: Chews cannot be moved to inventory - they can only be discarded when unsafe
   */
  function handleDiscardChew() {
    if (!selectedPlacementId.value || !currentChewData.value) return

    const placementId = selectedPlacementId.value
    const baseItemId = currentChewData.value.itemId
    const itemName = currentChewData.value.itemName

    // Remove from habitat items (handles inventory unmark internally)
    habitatConditions.removeItemFromHabitat(placementId)

    // Remove from inventory entirely (use base itemId)
    inventoryStore.removeItem(baseItemId, 1)

    // Remove chew tracking data
    habitatContainers.removeChewItem(placementId)

    loggingStore.addPlayerAction(
      `Discarded unsafe ${itemName}`,
      '🗑️'
    )

    console.log(`[use3DChewPopover] Discarded unsafe chew: ${placementId}`)
    closeChewPopover()
  }

  /**
   * Check if popover is currently open
   */
  function isOpen(): boolean {
    return showChewPopover.value
  }

  return {
    // State
    selectedChewId: selectedPlacementId, // Keep same name for API compatibility
    showChewPopover,
    menuPosition,

    // Computed
    currentChewData,
    isUnsafe,
    durabilityStatus,
    durabilityColorClass,

    // Functions
    openChewPopover,
    closeChewPopover,
    handleDiscardChew,
    isOpen
  }
}
