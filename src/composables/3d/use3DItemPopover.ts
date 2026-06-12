import { ref, computed } from 'vue'
import { useLoggingStore } from '../../stores/loggingStore'
import { useSuppliesStore } from '../../stores/suppliesStore'
import { useHabitatConditions } from '../../stores/habitatConditions'
import { getBaseItemId } from '../../utils/placementId'

export interface ItemPopoverData {
  placementId: string  // Full placement ID (used for habitat operations)
  itemId: string       // Base item ID (used for metadata lookup)
  itemName: string
  itemEmoji: string
  subCategory: string
}

// Item subcategories that can be removed via this popover
const REMOVABLE_SUBCATEGORIES = ['hideaways', 'toys', 'enrichment', 'bowls_bottles']

/**
 * Composable for managing general item popover menu in 3D view
 * Handles removal of habitat items (toys, hideaways, enrichment, bowls, bottles, hay racks) back to inventory
 */
export function use3DItemPopover() {
  // Stores
  const habitatConditions = useHabitatConditions()
  const loggingStore = useLoggingStore()
  const suppliesStore = useSuppliesStore()

  // State - stores the full placement ID
  const selectedPlacementId = ref<string | null>(null)
  const showItemPopover = ref(false)
  const menuPosition = ref({ x: 0, y: 0 })

  /**
   * Get data for the currently selected item
   */
  const currentItemData = computed((): ItemPopoverData | null => {
    if (!selectedPlacementId.value) return null

    // Extract base itemId for metadata lookup
    const baseItemId = getBaseItemId(selectedPlacementId.value)
    const item = suppliesStore.getItemById(baseItemId)
    if (!item) return null

    return {
      placementId: selectedPlacementId.value,
      itemId: baseItemId,
      itemName: item.name,
      itemEmoji: item.emoji || '📦',
      subCategory: item.subCategory || ''
    }
  })

  /**
   * Check if an item can be removed via this popover
   * Accepts either a placement ID or base item ID
   */
  function canRemoveItem(placementId: string): boolean {
    const baseItemId = getBaseItemId(placementId)
    const item = suppliesStore.getItemById(baseItemId)
    if (!item) return false

    // Only handle specific subcategories
    return REMOVABLE_SUBCATEGORIES.includes(item.subCategory || '')
  }

  /**
   * Open item popover for a specific item
   * @param placementId - The full placement ID (e.g., "habitat_igloo::instance_abc")
   */
  function openItemPopover(
    placementId: string,
    position: { x: number; y: number }
  ) {
    if (!canRemoveItem(placementId)) {
      console.log(`[use3DItemPopover] Item ${placementId} not removable via this popover`)
      return false
    }

    selectedPlacementId.value = placementId
    menuPosition.value = position
    showItemPopover.value = true
    console.log(`[use3DItemPopover] Opened popover for: ${placementId}`)
    return true
  }

  /**
   * Close the item popover
   */
  function closeItemPopover() {
    showItemPopover.value = false
    selectedPlacementId.value = null
  }

  /**
   * Remove item from habitat (return to inventory)
   */
  function handleRemoveItem() {
    if (!selectedPlacementId.value || !currentItemData.value) return

    const placementId = selectedPlacementId.value
    const itemName = currentItemData.value.itemName
    const emoji = currentItemData.value.itemEmoji

    // Remove from habitat items (handles inventory unmark internally)
    habitatConditions.removeItemFromHabitat(placementId)

    loggingStore.addPlayerAction(
      `Removed ${itemName} from habitat`,
      emoji
    )

    console.log(`[use3DItemPopover] Removed item: ${placementId}`)
    closeItemPopover()
  }

  /**
   * Check if popover is currently open
   */
  function isOpen(): boolean {
    return showItemPopover.value
  }

  return {
    // State
    selectedItemId: selectedPlacementId, // Keep same name for API compatibility
    showItemPopover,
    menuPosition,

    // Computed
    currentItemData,

    // Functions
    canRemoveItem,
    openItemPopover,
    closeItemPopover,
    handleRemoveItem,
    isOpen
  }
}
