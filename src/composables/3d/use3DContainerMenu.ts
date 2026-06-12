import { ref, computed } from 'vue'
import { useHabitatConditions } from '../../stores/habitatConditions'
import { useLoggingStore } from '../../stores/loggingStore'
import { useSuppliesStore } from '../../stores/suppliesStore'
import { useInventoryStore } from '../../stores/inventoryStore'
import { useGuineaPigStore } from '../../stores/guineaPigStore'
import { CONSUMPTION } from '../../constants/supplies'
import { getBaseItemId } from '../../utils/placementId'
import type { InventoryMenuItem } from '../../components/basic/InventoryItemMenu.vue'
import { guineaPigMessages } from '../../data/guineaPigMessages'
import type { ReactionMessage } from '../../data/guineaPigMessages'

export type ContainerType = 'bowl' | 'hay_rack'

/**
 * Composable for managing container menus (food bowls and hay racks)
 * Handles opening/closing menus, filling, clearing, and adding items
 */
export function use3DContainerMenu() {
  // Stores
  const habitatConditions = useHabitatConditions()
  const loggingStore = useLoggingStore()
  const suppliesStore = useSuppliesStore()
  const inventoryStore = useInventoryStore()
  const guineaPigStore = useGuineaPigStore()

  /**
   * Show care reaction chat bubble for all active guinea pigs
   */
  function showCareReaction(careType: 'hayRackFill' | 'bowlFill') {
    const activeGuineaPigs = guineaPigStore.activeGuineaPigs
    if (activeGuineaPigs.length === 0) return

    const messages = guineaPigMessages.care[careType]

    activeGuineaPigs.forEach(guineaPig => {
      const reaction = messages[Math.floor(Math.random() * messages.length)] as ReactionMessage

      document.dispatchEvent(new CustomEvent('show-chat-bubble', {
        detail: { guineaPigId: guineaPig.id, reaction },
        bubbles: true
      }))
    })
  }

  // State refs (reactive for UI)
  const selectedContainerId = ref<string | null>(null)
  const selectedContainerType = ref<ContainerType | null>(null)
  const showContainerMenu = ref(false)
  const showInventoryMenu = ref(false)
  const menuPosition = ref({ x: 0, y: 0 })

  // ============================================================================
  // Computed Properties
  // ============================================================================

  // Available food items from inventory for adding to bowl
  const availableFoodItems = computed((): InventoryMenuItem[] => {
    const items: InventoryMenuItem[] = []

    // Define the food item IDs we're looking for
    const foodItemIds = ['hay_timothy', 'food_pellets_standard', 'food_green_leaf_lettuce', 'food_carrot']

    for (const itemId of foodItemIds) {
      const quantity = inventoryStore.getItemQuantity(itemId)
      if (quantity > 0) {
        const supplyItem = suppliesStore.getItemById(itemId)
        if (supplyItem) {
          items.push({
            itemId,
            name: supplyItem.name,
            emoji: supplyItem.emoji || '🍽️',
            quantity
          })
        }
      }
    }

    return items
  })

  // Available hay items from inventory for adding to hay rack
  const availableHayItems = computed((): InventoryMenuItem[] => {
    const items: InventoryMenuItem[] = []

    // Get hay items - check for serving-based quantities
    const hayItemId = 'hay_timothy'
    const totalServings = inventoryStore.getTotalServings(hayItemId)

    if (totalServings > 0) {
      const supplyItem = suppliesStore.getItemById(hayItemId)
      if (supplyItem) {
        items.push({
          itemId: hayItemId,
          name: supplyItem.name,
          emoji: supplyItem.emoji || '🌾',
          quantity: totalServings
        })
      }
    }

    return items
  })

  // Get items based on selected container type
  const currentMenuItems = computed((): InventoryMenuItem[] => {
    if (selectedContainerType.value === 'bowl') {
      return availableFoodItems.value
    } else if (selectedContainerType.value === 'hay_rack') {
      return availableHayItems.value
    }
    return []
  })

  // Get menu title based on container type
  const menuTitle = computed(() => {
    if (selectedContainerType.value === 'bowl') {
      return 'Add Food'
    } else if (selectedContainerType.value === 'hay_rack') {
      return 'Add Hay'
    }
    return 'Add Item'
  })

  // Get empty message based on container type
  const menuEmptyMessage = computed(() => {
    if (selectedContainerType.value === 'bowl') {
      return 'No food in inventory'
    } else if (selectedContainerType.value === 'hay_rack') {
      return 'No hay in inventory'
    }
    return 'No items available'
  })

  // Container contents computed properties
  const currentBowlContents = computed(() => {
    if (!selectedContainerId.value || selectedContainerType.value !== 'bowl') {
      return []
    }
    return habitatConditions.getBowlContents(selectedContainerId.value)
  })

  const currentBowlCapacity = computed(() => {
    if (!selectedContainerId.value) return 3
    const baseItemId = getBaseItemId(selectedContainerId.value)
    const bowlItem = suppliesStore.getItemById(baseItemId)
    return bowlItem?.stats?.foodCapacity || 3
  })

  // Get the name of the currently selected container from supplies store
  const currentContainerName = computed(() => {
    if (!selectedContainerId.value) return null
    const baseItemId = getBaseItemId(selectedContainerId.value)
    const item = suppliesStore.getItemById(baseItemId)
    return item?.name || null
  })

  const currentHayServings = computed(() => {
    if (!selectedContainerId.value || selectedContainerType.value !== 'hay_rack') {
      return 0
    }
    return habitatConditions.getHayRackContents(selectedContainerId.value).length
  })

  const currentHayFreshness = computed(() => {
    if (!selectedContainerId.value || selectedContainerType.value !== 'hay_rack') {
      return 100
    }
    return habitatConditions.getHayRackFreshness(selectedContainerId.value)
  })

  // ============================================================================
  // Functions
  // ============================================================================

  /**
   * Open the container menu at the specified position
   */
  function openContainerMenu(
    containerId: string,
    containerType: ContainerType,
    position: { x: number; y: number }
  ) {
    selectedContainerId.value = containerId
    selectedContainerType.value = containerType
    showContainerMenu.value = true
    menuPosition.value = position
    console.log(`[use3DContainerMenu] Opened ${containerType}: ${containerId}`)
  }

  /**
   * Close the container contents menu
   */
  function closeContainerMenu() {
    showContainerMenu.value = false
    selectedContainerId.value = null
    selectedContainerType.value = null
  }

  /**
   * Close the inventory menu
   */
  function closeInventoryMenu() {
    showInventoryMenu.value = false
    selectedContainerId.value = null
    selectedContainerType.value = null
  }

  /**
   * Close all menus
   */
  function closeAllMenus() {
    if (showContainerMenu.value) {
      closeContainerMenu()
    }
    if (showInventoryMenu.value) {
      closeInventoryMenu()
    }
  }

  /**
   * Get first available hay item ID from inventory
   */
  function getFirstAvailableHayItemId(): string | null {
    for (const invItem of inventoryStore.allItems) {
      const supplyItem = suppliesStore.getItemById(invItem.itemId)
      if (supplyItem?.category === 'hay') {
        const servings = inventoryStore.getTotalServings(invItem.itemId)
        if (servings > 0) {
          return invItem.itemId
        }
      }
    }
    return null
  }

  /**
   * Handle fill button - for hay racks, fill directly; for bowls, show inventory menu
   */
  function handleContainerFill() {
    if (!selectedContainerId.value || !selectedContainerType.value) return

    if (selectedContainerType.value === 'hay_rack') {
      // Fill hay rack directly to capacity (or as much as available)
      const rackId = selectedContainerId.value
      const hayItemId = getFirstAvailableHayItemId()

      if (!hayItemId) {
        console.log('[use3DContainerMenu] No hay available in inventory')
        return
      }

      // Fill until rack is full or we run out of hay
      let added = 0
      const maxCapacity = CONSUMPTION.HAY_RACK_MAX_CAPACITY
      const currentServings = habitatConditions.getHayRackContents(rackId).length
      const slotsToFill = maxCapacity - currentServings

      for (let i = 0; i < slotsToFill; i++) {
        if (habitatConditions.addHayToRack(rackId, hayItemId)) {
          added++
        } else {
          break // No more hay available
        }
      }

      if (added > 0) {
        console.log(`[use3DContainerMenu] Filled hay rack with ${added} servings`)
        loggingStore.addPlayerAction(
          `Filled hay rack with ${added} serving${added > 1 ? 's' : ''}`,
          '🌾'
        )
        showCareReaction('hayRackFill')
      }
      // Don't close the menu - let user see the updated state
    } else {
      // For food bowls, show inventory menu to select food type
      showContainerMenu.value = false
      showInventoryMenu.value = true
    }
  }

  /**
   * Handle clear button - empty the container
   */
  function handleContainerClear() {
    if (!selectedContainerId.value || !selectedContainerType.value) return

    if (selectedContainerType.value === 'bowl') {
      habitatConditions.clearBowl(selectedContainerId.value)
      console.log(`[use3DContainerMenu] Cleared bowl ${selectedContainerId.value}`)
      loggingStore.addPlayerAction('Cleared food bowl', '🥗')
    } else if (selectedContainerType.value === 'hay_rack') {
      habitatConditions.clearHayRack(selectedContainerId.value)
      console.log(`[use3DContainerMenu] Cleared hay rack ${selectedContainerId.value}`)
      loggingStore.addPlayerAction('Cleared hay rack', '🌾')
    }

    closeContainerMenu()
  }

  /**
   * Handle removing individual food item from bowl
   */
  function handleRemoveFood(foodIndex: number) {
    if (!selectedContainerId.value || selectedContainerType.value !== 'bowl') return

    const success = habitatConditions.removeFoodFromBowl(selectedContainerId.value, foodIndex)
    if (success) {
      console.log(`[use3DContainerMenu] Removed food at index ${foodIndex} from bowl ${selectedContainerId.value}`)
    }
  }

  /**
   * Handle adding an item to the selected container
   */
  function handleAddItemToContainer(itemId: string) {
    if (!selectedContainerId.value || !selectedContainerType.value) return

    let success = false

    if (selectedContainerType.value === 'bowl') {
      success = habitatConditions.addFoodToBowl(selectedContainerId.value, itemId)
      if (success) {
        console.log(`[use3DContainerMenu] Added ${itemId} to bowl ${selectedContainerId.value}`)
        const supplyItem = suppliesStore.getItemById(itemId)
        const foodName = supplyItem?.name || 'food'
        const emoji = supplyItem?.emoji || '🥗'
        loggingStore.addPlayerAction(`Added ${foodName} to food bowl`, emoji)
        showCareReaction('bowlFill')
      } else {
        console.warn(`[use3DContainerMenu] Failed to add ${itemId} to bowl`)
      }
    } else if (selectedContainerType.value === 'hay_rack') {
      success = habitatConditions.addHayToRack(selectedContainerId.value, itemId)
      if (success) {
        console.log(`[use3DContainerMenu] Added ${itemId} to hay rack ${selectedContainerId.value}`)
        loggingStore.addPlayerAction('Added hay to hay rack', '🌾')
        showCareReaction('hayRackFill')
      } else {
        console.warn(`[use3DContainerMenu] Failed to add ${itemId} to hay rack`)
      }
    }

    // Close menu after adding
    closeInventoryMenu()
  }

  /**
   * Handle removing container from habitat (return to inventory)
   */
  function handleRemoveContainer() {
    if (!selectedContainerId.value || !selectedContainerType.value) return

    const placementId = selectedContainerId.value
    const baseItemId = getBaseItemId(placementId)
    const containerType = selectedContainerType.value
    const supplyItem = suppliesStore.getItemById(baseItemId)
    const itemName = supplyItem?.name || 'container'
    const emoji = supplyItem?.emoji || '📦'

    // Clear contents first (don't waste food/hay)
    if (containerType === 'bowl') {
      habitatConditions.clearBowl(placementId)
    } else if (containerType === 'hay_rack') {
      habitatConditions.clearHayRack(placementId)
    }

    // Remove from habitat (handles inventory unmark internally)
    habitatConditions.removeItemFromHabitat(placementId)

    loggingStore.addPlayerAction(
      `Removed ${itemName} from habitat`,
      emoji
    )

    console.log(`[use3DContainerMenu] Removed container: ${placementId}`)
    closeContainerMenu()
  }

  /**
   * Check if any menu is open
   */
  function isAnyMenuOpen(): boolean {
    return showContainerMenu.value || showInventoryMenu.value
  }

  return {
    // State
    selectedContainerId,
    selectedContainerType,
    showContainerMenu,
    showInventoryMenu,
    menuPosition,

    // Computed
    currentMenuItems,
    menuTitle,
    menuEmptyMessage,
    currentContainerName,
    currentBowlContents,
    currentBowlCapacity,
    currentHayServings,
    currentHayFreshness,

    // Functions
    openContainerMenu,
    closeContainerMenu,
    closeInventoryMenu,
    closeAllMenus,
    handleContainerFill,
    handleContainerClear,
    handleRemoveFood,
    handleAddItemToContainer,
    handleRemoveContainer,
    isAnyMenuOpen
  }
}
