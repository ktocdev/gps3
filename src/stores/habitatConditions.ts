import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useSuppliesStore } from './suppliesStore'
import { useInventoryStore } from './inventoryStore'
import {
  HABITAT_CONDITIONS,
  CONSUMPTION,
  POOP_CONSTANTS,
  TRACKING,
  DECAY,
  STARTER_HABITAT_POSITIONS,
  clampCondition,
  calculatePoopCleanlinessReduction
} from '../constants/supplies'
import { safeDeserializeMap, serializeMap } from '../utils/mapSerialization'
import { useHabitatContainers } from '../composables/useHabitatContainers'
import { generatePlacementId, getBaseItemId } from '../utils/placementId'

// Types
interface HabitatSnapshot {
  timestamp: number
  cleanliness: number
  beddingFreshness: number
  hayFreshness: number
  waterLevel: number
  dirtiness: number
}

interface CurrentBedding {
  type: string
  quality: 'cheap' | 'average' | 'premium' | 'colorful-premium'
  absorbency: number
  decayRate: number
  color?: string
}

interface CurrentHayBag {
  type: string
  handfulsRemaining: number
  bagId: string
}

interface ConsumptionData {
  beddingUsageRate: number
  hayConsumptionRate: number
  waterConsumptionRate: number
}

interface HabitatAlert {
  id: string
  type: 'warning' | 'critical'
  condition: string
  message: string
  timestamp: number
}

interface Poop {
  id: string
  x: number           // subgrid X (for 2D compatibility)
  y: number           // subgrid Y (for 2D compatibility)
  timestamp: number
  // Optional 3D world coordinates - if present, use these for rendering
  worldX?: number
  worldZ?: number
}

interface AlertPreferences {
  enableAlerts: boolean
  warningThreshold: number
  criticalThreshold: number
}

interface GuineaPigPosition {
  x: number
  y: number
  lastMoved: number
  targetPosition?: { x: number; y: number }
  isMoving: boolean
  facingDirection?: 'left' | 'right' // Direction the guinea pig is facing
  offsetX?: number // Pixel offset for visual separation when multiple guinea pigs share same cell
  offsetY?: number // Pixel offset for visual separation when multiple guinea pigs share same cell
}

interface ItemUsage {
  lastUsedAt: number
  usageCount: number
  lastUsedBy: string
  effectiveness: number
  freshnessBonus: boolean
}

export const useHabitatConditions = defineStore('habitatConditions', () => {
  // Core conditions (0-100)
  const cleanliness = ref<number>(HABITAT_CONDITIONS.DEFAULT_CLEANLINESS)
  const beddingFreshness = ref<number>(HABITAT_CONDITIONS.DEFAULT_BEDDING_FRESHNESS)
  const hayFreshness = ref<number>(HABITAT_CONDITIONS.DEFAULT_HAY_FRESHNESS)
  // Note: waterLevel is now computed from per-bottle levels (see computed section below)
  const dirtiness = ref<number>(0) // 0-100, inverse of cleanliness

  // Tracking and history
  const lastCleaningTime = ref(Date.now())
  const lastBeddingRefresh = ref(Date.now())
  const lastHayRefill = ref(Date.now())
  const lastWaterRefill = ref(Date.now())
  const conditionHistory = ref<HabitatSnapshot[]>([])

  // Resource management (now connected to Supplies Store & Inventory)
  const currentBedding = ref<CurrentBedding>({
    type: 'None',
    quality: 'average',
    absorbency: CONSUMPTION.DEFAULT_ABSORBENCY,
    decayRate: CONSUMPTION.DEFAULT_DECAY_RATE
  })

  const currentHayBag = ref<CurrentHayBag | null>(null)

  const consumptionRates = ref<ConsumptionData>({
    beddingUsageRate: 0,
    hayConsumptionRate: 0,
    waterConsumptionRate: 0
  })

  // Alerts and notifications
  const activeAlerts = ref<HabitatAlert[]>([])
  const notificationSettings = ref<AlertPreferences>({
    enableAlerts: true,
    warningThreshold: HABITAT_CONDITIONS.WARNING_THRESHOLD,
    criticalThreshold: HABITAT_CONDITIONS.CRITICAL_THRESHOLD
  })

  // Habitat Items (items currently placed in the habitat)
  const habitatItems = ref<string[]>([])

  // Item positions (Map of itemId -> grid position)
  const itemPositions = ref<Map<string, { x: number; y: number }>>(new Map())

  // Bowl, Hay Rack, and Water Bottle Management (using composable)
  const containers = useHabitatContainers()
  const {
    bowlContents,
    hayRackContents,
    waterBottles,
    addFoodToBowl,
    removeFoodFromBowl,
    getBowlContents,
    clearBowl,
    clearAllBowls,
    setFoodFreshness,
    addHayToRack,
    removeHayFromRack,
    getHayRackContents,
    getHayRackFreshness,
    clearHayRack,
    clearAllHayRacks,
    fillAllHayRacks,
    // Water bottle methods
    initializeWaterBottle,
    getWaterBottleLevel,
    setWaterBottleLevel,
    refillWaterBottle,
    consumeWaterFromBottle,
    getAllWaterBottles,
    getAggregateWaterLevel,
    findAvailableWaterBottle,
    removeWaterBottle,
    clearAllWaterBottles: _clearAllWaterBottles
  } = containers
  void _clearAllWaterBottles // Reserved for future use

  // Poop tracking
  const poops = ref<Poop[]>([])

  // Guinea pig position tracking (System 16: Phase 4)
  const guineaPigPositions = ref<Map<string, GuineaPigPosition>>(new Map())

  // Habitat grid dimensions (medium habitat default)
  const gridWidth = 14
  const gridHeight = 10

  // Item usage history (System 16: Phase 5)
  const itemUsageHistory = ref<Map<string, ItemUsage>>(new Map())

  // Decay speed multiplier (System 16: Phase 3 Enhancement)
  const decaySpeedMultiplier = ref<number>(DECAY.DEFAULT_SPEED)

  // Computed properties

  // Water level is now computed from per-bottle levels
  const waterLevel = computed(() => {
    return getAggregateWaterLevel()
  })

  const overallCondition = computed(() => {
    // Calculate average freshness from all hay racks
    let hayRackAvgFreshness = 100
    const hayRacks = Array.from(hayRackContents.value.values())
    if (hayRacks.length > 0) {
      const totalFreshness = hayRacks.reduce((sum, rack) => sum + rack.freshness, 0)
      hayRackAvgFreshness = totalFreshness / hayRacks.length
    }

    // Calculate average freshness from all food bowls
    let foodBowlAvgFreshness = 100
    const allFoods: number[] = []
    bowlContents.value.forEach(foods => {
      foods.forEach(food => allFoods.push(food.freshness))
    })
    if (allFoods.length > 0) {
      const totalFoodFreshness = allFoods.reduce((sum, f) => sum + f, 0)
      foodBowlAvgFreshness = totalFoodFreshness / allFoods.length
    }

    // Factor in all conditions: bedding, cleanliness, water, hay rack freshness, food freshness
    return Math.floor(
      (cleanliness.value + beddingFreshness.value + waterLevel.value + hayRackAvgFreshness + foodBowlAvgFreshness) / 5
    )
  })

  const needsAttention = computed(() => {
    return (
      cleanliness.value < HABITAT_CONDITIONS.WARNING_THRESHOLD ||
      beddingFreshness.value < HABITAT_CONDITIONS.WARNING_THRESHOLD ||
      hayFreshness.value < HABITAT_CONDITIONS.WARNING_THRESHOLD ||
      waterLevel.value < HABITAT_CONDITIONS.WARNING_THRESHOLD
    )
  })

  const criticalConditions = computed(() => {
    const critical: string[] = []
    if (cleanliness.value < HABITAT_CONDITIONS.CRITICAL_THRESHOLD) critical.push('Cleanliness')
    if (beddingFreshness.value < HABITAT_CONDITIONS.CRITICAL_THRESHOLD) critical.push('Bedding')
    if (hayFreshness.value < HABITAT_CONDITIONS.CRITICAL_THRESHOLD) critical.push('Hay')
    if (waterLevel.value < HABITAT_CONDITIONS.CRITICAL_THRESHOLD) critical.push('Water')
    return critical
  })

  // Actions

  /**
   * Calculate bedding needed based on current dirtiness
   * @returns Fraction of bedding bag needed (0-1)
   */
  function calculateBeddingNeeded(): number {
    return dirtiness.value / 100
  }

  /**
   * Get total bedding available across all bedding items in inventory
   * @returns Total bedding amount (in bag units, can be fractional like 2.5)
   */
  function getTotalBeddingAvailable(): number {
    const inventoryStore = useInventoryStore()
    const suppliesStore = useSuppliesStore()

    let total = 0
    for (const invItem of inventoryStore.consumables) {
      const supplyItem = suppliesStore.getItemById(invItem.itemId)
      if (supplyItem?.category === 'bedding') {
        for (const instance of invItem.instances) {
          total += instance.amountRemaining ?? 1 // Default to 1 (full bag) if not set
        }
      }
    }
    return total
  }

  /**
   * Consume bedding from inventory
   * Uses partial bags first, then opens new bags as needed
   * @param amount - Amount of bedding to consume (in bag units)
   * @param beddingType - Optional bedding type to use (cheap, average, premium). If not specified, uses any available.
   * @returns Success boolean
   */
  function consumeBedding(amount: number, beddingType?: string): boolean {
    if (amount <= 0) return true

    const inventoryStore = useInventoryStore()
    const suppliesStore = useSuppliesStore()

    let remaining = amount

    // Get all bedding items sorted by amountRemaining (use partial bags first)
    const beddingItems: Array<{ itemId: string, instance: any, amount: number }> = []

    const targetItemId = beddingType ? `bedding_${beddingType}` : null

    for (const invItem of inventoryStore.consumables) {
      const supplyItem = suppliesStore.getItemById(invItem.itemId)
      if (supplyItem?.category === 'bedding') {
        // If beddingType specified, only use that type
        if (targetItemId && invItem.itemId !== targetItemId) continue

        for (const instance of invItem.instances) {
          const amt = instance.amountRemaining ?? 1
          beddingItems.push({ itemId: invItem.itemId, instance, amount: amt })
        }
      }
    }

    // Sort: partial bags first, then full bags
    beddingItems.sort((a, b) => a.amount - b.amount)

    // Track instances to remove (empty bags)
    const instancesToRemove: Array<{ itemId: string, instanceId: string }> = []

    // Consume from bags
    for (const item of beddingItems) {
      if (remaining <= 0) break

      const canUse = Math.min(item.amount, remaining)
      item.instance.amountRemaining = item.amount - canUse
      item.instance.isOpened = true
      remaining -= canUse

      // If bag is empty, mark for removal
      if (item.instance.amountRemaining <= 0.001) { // Use small threshold for floating point
        instancesToRemove.push({ itemId: item.itemId, instanceId: item.instance.instanceId })
      }
    }

    // Remove empty bags from inventory
    for (const { itemId, instanceId } of instancesToRemove) {
      const invItem = inventoryStore.items.find(item => item.itemId === itemId)
      if (invItem) {
        const index = invItem.instances.findIndex(inst => inst.instanceId === instanceId)
        if (index !== -1) {
          invItem.instances.splice(index, 1)
          invItem.quantity = invItem.instances.length

          // Remove inventory item if no instances left
          if (invItem.instances.length === 0) {
            const itemIndex = inventoryStore.items.findIndex(item => item.itemId === itemId)
            if (itemIndex !== -1) {
              inventoryStore.items.splice(itemIndex, 1)
            }
          }
        }
      }
    }

    // Update currentBedding to track the bedding type used (for color effects)
    if (beddingType && beddingItems.length > 0) {
      const usedItemId = beddingItems[0].itemId // Use the first item's ID since they're all the same type
      const beddingItem = suppliesStore.getItemById(usedItemId)
      if (beddingItem) {
        // Extract color from bedding ID (e.g., "bedding_color_pink" → "pink")
        let color: string | undefined
        if (usedItemId.startsWith('bedding_color_')) {
          color = usedItemId.replace('bedding_color_', '') // "pink", "blue", etc.
        } else if (beddingType === 'cheap') {
          color = 'beige'
        } else if (beddingType === 'premium') {
          color = 'white-cyan'
        } else {
          color = 'yellow' // average/regular
        }

        currentBedding.value = {
          type: beddingItem.name,
          quality: beddingItem.quality as 'cheap' | 'average' | 'premium' | 'colorful-premium',
          absorbency: beddingItem.stats?.absorbency || CONSUMPTION.DEFAULT_ABSORBENCY,
          decayRate: beddingItem.stats?.decayRate || CONSUMPTION.DEFAULT_DECAY_RATE,
          color
        }
      }
    }

    return remaining <= 0.001 // Success if we consumed all needed
  }

  /**
   * Clean cage with proportional bedding consumption
   * @param beddingType - Bedding type to use (cheap, average, premium)
   * @returns Object with success status and message
   */
  function cleanCage(beddingType: string = 'average'): { success: boolean; message: string; beddingUsed?: number; beddingRemaining?: number } {
    const beddingNeeded = calculateBeddingNeeded()
    const inventoryStore = useInventoryStore()
    const beddingAvailable = inventoryStore.getItemQuantity(`bedding_${beddingType}`)

    if (beddingNeeded === 0) {
      // Already clean
      return {
        success: true,
        message: 'Habitat is already clean!'
      }
    }

    if (beddingAvailable === 0) {
      return {
        success: false,
        message: 'No bedding available! Purchase bedding from the shop.'
      }
    }

    if (beddingAvailable < beddingNeeded) {
      // Partial clean - use all available bedding
      const cleaningPercent = (beddingAvailable / beddingNeeded) * 100
      const success = consumeBedding(beddingAvailable, beddingType)

      if (success) {
        dirtiness.value = Math.max(0, dirtiness.value - cleaningPercent)
        cleanliness.value = Math.min(100, 100 - dirtiness.value)
        beddingFreshness.value = Math.min(100, beddingFreshness.value + cleaningPercent)
        lastCleaningTime.value = Date.now()
        poops.value = [] // Remove all poops
        recordSnapshot()

        const remaining = inventoryStore.getItemQuantity(`bedding_${beddingType}`)

        return {
          success: true,
          message: `Partially cleaned habitat (used all ${beddingAvailable.toFixed(1)} ${beddingType} bags). Habitat is still ${dirtiness.value.toFixed(2)}% dirty. ${remaining.toFixed(1)} ${beddingType} bags remaining.`,
          beddingUsed: beddingAvailable,
          beddingRemaining: remaining
        }
      }
    }

    // Full clean - have enough bedding
    const success = consumeBedding(beddingNeeded, beddingType)

    if (success) {
      dirtiness.value = 0
      cleanliness.value = HABITAT_CONDITIONS.RESET_VALUE
      beddingFreshness.value = HABITAT_CONDITIONS.RESET_VALUE
      lastCleaningTime.value = Date.now()
      poops.value = [] // Remove all poops
      recordSnapshot()

      const remaining = inventoryStore.getItemQuantity(`bedding_${beddingType}`)

      return {
        success: true,
        message: `Habitat fully cleaned! Used ${beddingNeeded.toFixed(1)} ${beddingType} bags. ${remaining.toFixed(1)} ${beddingType} bags remaining.`,
        beddingUsed: beddingNeeded,
        beddingRemaining: remaining
      }
    }

    return {
      success: false,
      message: 'Failed to clean habitat'
    }
  }

  /**
   * Quick clean - removes all poop without consuming bedding
   * Quick maintenance action between full cleans
   */
  function quickClean(): { success: boolean; message: string; poopsRemoved: number } {
    const poopCount = poops.value.length

    if (poopCount === 0) {
      return {
        success: true,
        message: 'No poop to remove!',
        poopsRemoved: 0
      }
    }

    // Remove all poops
    poops.value = []

    // Slightly improve cleanliness (but not as much as full clean)
    // Each poop removal adds back a small amount of cleanliness
    const cleanlinessImprovement = Math.min(20, poopCount * 5)
    cleanliness.value = Math.min(100, cleanliness.value + cleanlinessImprovement)
    dirtiness.value = Math.max(0, 100 - cleanliness.value)

    recordSnapshot()

    return {
      success: true,
      message: `Removed ${poopCount} poop${poopCount > 1 ? 's' : ''}! Habitat is a bit cleaner.`,
      poopsRemoved: poopCount
    }
  }

  function addPoop(x: number, y: number, worldX?: number, worldZ?: number) {
    const poop: Poop = {
      id: `poop_${crypto.randomUUID()}`,
      x,
      y,
      timestamp: Date.now(),
      ...(worldX !== undefined && { worldX }),
      ...(worldZ !== undefined && { worldZ })
    }
    poops.value.push(poop)

    // Reduce cleanliness based on poop count
    const reduction = calculatePoopCleanlinessReduction()
    cleanliness.value = Math.max(HABITAT_CONDITIONS.CONDITION_MIN, cleanliness.value - reduction)
    dirtiness.value = Math.min(100, 100 - cleanliness.value)
    recordSnapshot()
  }

  function removePoop(poopId: string) {
    const index = poops.value.findIndex(p => p.id === poopId)
    if (index === -1) {
      return false
    }

    poops.value.splice(index, 1)

    // Slightly improve cleanliness when removing poop
    cleanliness.value = Math.min(
      HABITAT_CONDITIONS.CONDITION_MAX,
      cleanliness.value + POOP_CONSTANTS.CLEANLINESS_RECOVERY_PER_REMOVAL
    )
    dirtiness.value = Math.max(0, 100 - cleanliness.value)
    recordSnapshot()
    return true
  }

  function refreshBedding(itemId: string) {
    const inventoryStore = useInventoryStore()
    const suppliesStore = useSuppliesStore()

    // Check if supplies catalog is loaded
    if (!suppliesStore.catalogLoaded) {
      suppliesStore.initializeCatalog()
    }

    // Get bedding item from supplies store
    const beddingItem = suppliesStore.getItemById(itemId)
    if (!beddingItem || beddingItem.category !== 'bedding') {
      console.warn(`Invalid bedding item: ${itemId}`)
      return false
    }

    // Check inventory
    if (inventoryStore.getItemQuantity(itemId) <= 0) {
      console.warn(`No ${beddingItem.name} in inventory`)
      return false
    }

    // Mark bedding as opened (cannot be returned)
    inventoryStore.markAsOpened(itemId, 1)

    // Use one bedding from inventory
    inventoryStore.useItem(itemId, 1)

    // Apply bedding stats from supplies store
    const stats = beddingItem.stats
    currentBedding.value = {
      type: beddingItem.name,
      quality: beddingItem.quality as 'cheap' | 'average' | 'premium' | 'colorful-premium',
      absorbency: stats?.absorbency || CONSUMPTION.DEFAULT_ABSORBENCY,
      decayRate: stats?.decayRate || CONSUMPTION.DEFAULT_DECAY_RATE,
      color: beddingItem.quality === 'premium' && beddingItem.tags?.includes('color') ? beddingItem.name.toLowerCase() : undefined
    }

    beddingFreshness.value = HABITAT_CONDITIONS.RESET_VALUE
    lastBeddingRefresh.value = Date.now()
    recordSnapshot()
    return true
  }

  function refillHay(itemId: string) {
    const inventoryStore = useInventoryStore()
    const suppliesStore = useSuppliesStore()

    // Check if supplies catalog is loaded
    if (!suppliesStore.catalogLoaded) {
      suppliesStore.initializeCatalog()
    }

    // Get hay item from supplies store
    const hayItem = suppliesStore.getItemById(itemId)
    if (!hayItem || hayItem.category !== 'hay') {
      console.warn(`Invalid hay item: ${itemId}`)
      return false
    }

    // Check inventory
    if (inventoryStore.getItemQuantity(itemId) <= 0) {
      console.warn(`No ${hayItem.name} in inventory`)
      return false
    }

    // Mark hay as opened (cannot be returned)
    inventoryStore.markAsOpened(itemId, 1)

    // Use one hay bag from inventory
    inventoryStore.useItem(itemId, 1)

    // All hay bags have standard handfuls per bag
    const handfuls = CONSUMPTION.HAY_HANDFULS_PER_BAG

    if (!currentHayBag.value) {
      currentHayBag.value = {
        type: hayItem.name,
        handfulsRemaining: handfuls,
        bagId: `${itemId}-${Date.now()}`
      }
    } else {
      // No limit - can add unlimited handfuls
      currentHayBag.value.handfulsRemaining += handfuls
      currentHayBag.value.type = hayItem.name
    }

    hayFreshness.value = HABITAT_CONDITIONS.RESET_VALUE
    lastHayRefill.value = Date.now()
    recordSnapshot()
    return true
  }

  /**
   * Refill a specific water bottle to 100%
   * @param bottlePlacementId - The placement ID of the bottle to refill
   * @returns The amount of water added (0-100)
   */
  function refillWater(bottlePlacementId?: string): number {
    if (!bottlePlacementId) {
      // If no bottle specified, refill all bottles
      let totalAdded = 0
      waterBottles.value.forEach((_, id) => {
        totalAdded += refillWaterBottle(id)
      })
      lastWaterRefill.value = Date.now()
      recordSnapshot()
      return totalAdded
    }

    const amountAdded = refillWaterBottle(bottlePlacementId)
    lastWaterRefill.value = Date.now()
    recordSnapshot()
    return amountAdded
  }

  function consumeHayHandful() {
    if (!currentHayBag.value || currentHayBag.value.handfulsRemaining <= 0) {
      return false
    }

    currentHayBag.value.handfulsRemaining--
    if (currentHayBag.value.handfulsRemaining === 0) {
      // Bag depleted
      currentHayBag.value = null
    }
    return true
  }

  function recordSnapshot() {
    const snapshot: HabitatSnapshot = {
      timestamp: Date.now(),
      cleanliness: cleanliness.value,
      beddingFreshness: beddingFreshness.value,
      hayFreshness: hayFreshness.value,
      waterLevel: waterLevel.value,
      dirtiness: dirtiness.value
    }

    conditionHistory.value.push(snapshot)

    // Keep only last N snapshots
    if (conditionHistory.value.length > TRACKING.CONDITION_HISTORY_MAX) {
      conditionHistory.value.shift()
    }
  }

  function updateCondition(condition: string, value: number) {
    value = clampCondition(value)

    switch (condition) {
      case 'cleanliness':
        cleanliness.value = value
        dirtiness.value = Math.max(0, 100 - value)
        break
      case 'beddingFreshness':
        beddingFreshness.value = value
        break
      case 'hayFreshness':
        hayFreshness.value = value
        break
      case 'waterLevel':
        // Set all water bottles to this level
        getAllWaterBottles().forEach(bottleId => {
          setWaterBottleLevel(bottleId, value)
        })
        break
      case 'dirtiness':
        dirtiness.value = value
        cleanliness.value = Math.max(0, 100 - value)
        break
    }

    recordSnapshot()
  }

  function resetHabitatConditions() {
    // Reset all conditions to 100%
    cleanliness.value = HABITAT_CONDITIONS.RESET_VALUE
    beddingFreshness.value = HABITAT_CONDITIONS.RESET_VALUE
    hayFreshness.value = HABITAT_CONDITIONS.RESET_VALUE
    // Refill all water bottles to 100%
    getAllWaterBottles().forEach(bottleId => {
      refillWaterBottle(bottleId)
    })
    dirtiness.value = 0

    // Update all timestamps
    const now = Date.now()
    lastCleaningTime.value = now
    lastBeddingRefresh.value = now
    lastHayRefill.value = now
    lastWaterRefill.value = now

    // Clear condition history
    conditionHistory.value = []

    // Record initial snapshot
    recordSnapshot()
  }

  /**
   * Reset habitat to default starter state for a new game session
   * Returns all non-starter items to inventory and clears all contents
   */
  function resetToStarterHabitat() {
    const inventoryStore = useInventoryStore()

    // Define starter item IDs (default items that should remain)
    const starterItemIds = [
      'habitat_basic_water_bottle',
      'habitat_plastic_igloo',
      'habitat_ceramic_bowl',
      'habitat_basic_hay_rack'
    ]

    // Return all non-starter items to inventory
    const itemsToRemove = habitatItems.value.filter(itemId => !starterItemIds.includes(itemId))

    for (const itemId of itemsToRemove) {
      // Remove placement flag
      inventoryStore.unmarkAsPlacedInHabitat(itemId, 1)

      // Remove position tracking
      itemPositions.value.delete(itemId)

      // Remove from habitat
      const index = habitatItems.value.indexOf(itemId)
      if (index !== -1) {
        habitatItems.value.splice(index, 1)
      }

      console.log(`📦 Returned ${itemId} to inventory`)
    }

    // Reset habitat items to only starter items
    habitatItems.value = [...starterItemIds]

    // Reset positions to default
    starterItemIds.forEach(itemId => {
      if (itemId in STARTER_HABITAT_POSITIONS) {
        const position = STARTER_HABITAT_POSITIONS[itemId as keyof typeof STARTER_HABITAT_POSITIONS]
        itemPositions.value.set(itemId, position)
      }
    })

    // Clear all bowls
    clearAllBowls()

    // Clear all hay racks
    clearAllHayRacks()

    // Remove all poop
    poops.value.length = 0

    // Reset all guinea pig positions
    guineaPigPositions.value.clear()

    // Clear item usage history for non-starter items
    for (const itemId of itemsToRemove) {
      itemUsageHistory.value.delete(itemId)
    }

    // Reset conditions to 100%
    resetHabitatConditions()

    console.log(`🏠 Habitat reset to starter state with ${starterItemIds.length} default items`)
  }

  /**
   * Add an item to the habitat
   * @param itemId - The base item ID (e.g., "habitat_basic_water_bottle")
   * @param position - Optional grid position
   * @returns The placement ID if successful, or null if failed
   */
  function addItemToHabitat(itemId: string, position?: { x: number; y: number }): string | null {
    const inventoryStore = useInventoryStore()

    // Check if item is in inventory
    if (!inventoryStore.hasItem(itemId)) {
      console.warn(`Item ${itemId} not found in inventory`)
      return null
    }

    // Check if there's an unplaced instance available
    const unplacedCount = inventoryStore.getUnplacedCount(itemId)
    if (unplacedCount <= 0) {
      console.warn(`No unplaced instances of ${itemId} available`)
      return null
    }

    // Mark as placed in habitat and get the instanceId
    const instanceId = inventoryStore.markAsPlacedInHabitat(itemId, 1)
    if (!instanceId) {
      console.warn(`Failed to mark ${itemId} as placed`)
      return null
    }

    // Generate unique placement ID for this instance
    const placementId = generatePlacementId(itemId, instanceId)

    // Add to habitat with unique placement ID
    habitatItems.value.push(placementId)

    // Store position if provided
    if (position) {
      itemPositions.value.set(placementId, position)
    }

    // System 16: Phase 5 - Initialize item usage tracking with freshness bonus
    if (!itemUsageHistory.value.has(placementId)) {
      itemUsageHistory.value.set(placementId, {
        lastUsedAt: Date.now(),
        usageCount: 0,
        lastUsedBy: '',
        effectiveness: 100,
        freshnessBonus: true
      })
    }

    // Initialize water bottle tracking if this is a water bottle
    const suppliesStore = useSuppliesStore()
    const item = suppliesStore.getItemById(itemId)
    if (item?.stats?.itemType === 'water_bottle') {
      initializeWaterBottle(placementId, HABITAT_CONDITIONS.DEFAULT_WATER_LEVEL)
    }

    console.log(`🏠 Added ${itemId} to habitat as ${placementId}`)
    return placementId
  }

  /**
   * Remove an item from the habitat
   * @param placementId - The placement ID (can be base itemId for legacy or full placement ID)
   */
  function removeItemFromHabitat(placementId: string) {
    const index = habitatItems.value.indexOf(placementId)
    if (index === -1) {
      console.warn(`Item ${placementId} not found in habitat`)
      return false
    }

    const inventoryStore = useInventoryStore()

    // Extract base itemId for inventory operations
    const baseItemId = getBaseItemId(placementId)

    // Remove placement flag from inventory
    inventoryStore.unmarkAsPlacedInHabitat(baseItemId, 1)

    // Remove from habitat
    habitatItems.value.splice(index, 1)

    // Remove position tracking
    itemPositions.value.delete(placementId)

    // Clear bowl contents if it's a bowl
    if (bowlContents.value.has(placementId)) {
      bowlContents.value.delete(placementId)
    }

    // Clear water bottle tracking if it's a water bottle
    if (waterBottles.value.has(placementId)) {
      removeWaterBottle(placementId)
    }

    // System 16: Phase 5 - Reset effectiveness when item is removed (rotation benefit)
    resetItemEffectiveness(placementId)

    console.log(`🏠 Removed ${placementId} from habitat`)
    return true
  }

  // Note: Bowl and hay rack functions are now provided by useHabitatContainers composable

  // ============================================================================
  // Environmental Decay System (System 16: Phase 3)
  // ============================================================================

  /**
   * Apply environmental decay to bedding, cleanliness, and hay racks
   * @param deltaSeconds - Time elapsed since last update in seconds
   */
  function applyEnvironmentalDecay(deltaSeconds: number) {
    // 1. Apply bedding decay (quality-modified + speed multiplier)
    const qualityMultiplier = DECAY.QUALITY_MULTIPLIERS[currentBedding.value.quality] || 1.0
    const beddingDecay = DECAY.BEDDING_BASE_DECAY_PER_SECOND * qualityMultiplier * decaySpeedMultiplier.value * deltaSeconds
    beddingFreshness.value = clampCondition(beddingFreshness.value - beddingDecay)

    // 2. Apply cleanliness decay (with speed multiplier)
    const cleanlinessDecay = DECAY.CLEANLINESS_BASE_DECAY_PER_SECOND * decaySpeedMultiplier.value * deltaSeconds
    cleanliness.value = clampCondition(cleanliness.value - cleanlinessDecay)
    dirtiness.value = Math.max(0, 100 - cleanliness.value)

    // 3. Apply hay freshness decay per hay rack (with speed multiplier) - hay oxidizes and loses nutritional value
    const hayDecay = DECAY.HAY_BASE_DECAY_PER_SECOND * decaySpeedMultiplier.value * deltaSeconds
    const { applyHayRackDecay, applyFoodBowlDecay } = useHabitatContainers()
    applyHayRackDecay(hayDecay)

    // 4. Apply food freshness decay per bowl (with speed multiplier) - food spoils over time
    const foodDecay = DECAY.FOOD_BASE_DECAY_PER_SECOND * decaySpeedMultiplier.value * deltaSeconds
    applyFoodBowlDecay(foodDecay)

    // Note: Activity-based decay will be recorded via recordGuineaPigActivity()
  }

  /**
   * Set decay speed multiplier
   */
  function setDecaySpeed(multiplier: number) {
    decaySpeedMultiplier.value = Math.max(0.1, Math.min(100, multiplier))
  }

  /**
   * Record guinea pig activity to accelerate decay
   * @param activityType - Type of activity ('movement', 'eating', 'drinking')
   */
  function recordGuineaPigActivity(activityType: 'movement' | 'eating' | 'drinking') {
    const activityDecay = DECAY.ACTIVITY_DECAY[activityType]

    // Activity primarily affects bedding freshness
    beddingFreshness.value = clampCondition(beddingFreshness.value - activityDecay)

    // Eating also affects cleanliness (food crumbs)
    if (activityType === 'eating') {
      cleanliness.value = clampCondition(cleanliness.value - (activityDecay * 0.5))
    }
  }

  // ============================================================================
  // Water Consumption System (System 16: Phase 2)
  // ============================================================================

  /**
   * Consume water from bottle (called when guinea pig drinks)
   * @param bottlePlacementId - Placement ID of the water bottle to drink from (optional)
   * @returns True if water was consumed successfully
   */
  function consumeWater(bottlePlacementId?: string): boolean {
    // If no specific bottle provided, find any water bottle with available water
    let targetBottleId: string | undefined = bottlePlacementId

    if (!targetBottleId) {
      targetBottleId = findAvailableWaterBottle() ?? undefined
    }

    if (!targetBottleId) {
      console.warn('No water bottle with available water found')
      return false
    }

    // Check if water bottle exists in habitat
    if (!habitatItems.value.includes(targetBottleId)) {
      console.warn(`Water bottle ${targetBottleId} not in habitat`)
      return false
    }

    // Check if this bottle has water
    const bottleLevel = getWaterBottleLevel(targetBottleId)
    if (bottleLevel < CONSUMPTION.WATER_MINIMUM_LEVEL) {
      console.warn(`Water bottle ${targetBottleId} is empty - cannot drink`)
      return false
    }

    // Consume water (random amount between min and max)
    const range = CONSUMPTION.WATER_CONSUMPTION_MAX - CONSUMPTION.WATER_CONSUMPTION_MIN + 1
    const consumption = Math.floor(Math.random() * range) + CONSUMPTION.WATER_CONSUMPTION_MIN

    const success = consumeWaterFromBottle(targetBottleId, consumption)
    if (success) {
      recordSnapshot()
    }
    return success
  }

  /**
   * Check if water is available for drinking
   * @returns True if any water bottle has sufficient water
   */
  function hasWaterAvailable(): boolean {
    return findAvailableWaterBottle() !== null
  }

  /**
   * Find water bottle position for autonomy pathfinding
   * @returns Position of first available water bottle, or null if none found
   */
  function getWaterBottlePosition(): { x: number; y: number } | null {
    // Find first water bottle with available water
    const availableBottleId = findAvailableWaterBottle()

    if (!availableBottleId) {
      return null
    }

    // Return stored position
    return itemPositions.value.get(availableBottleId) || null
  }

  function initializeStarterHabitat(starterItemIds: string[]) {
    // Add starter items to habitat without checking inventory
    habitatItems.value = [...starterItemIds]

    // Apply default positions from constants
    starterItemIds.forEach(itemId => {
      if (itemId in STARTER_HABITAT_POSITIONS) {
        const position = STARTER_HABITAT_POSITIONS[itemId as keyof typeof STARTER_HABITAT_POSITIONS]
        itemPositions.value.set(itemId, position)
        console.log(`Setting starter position for ${itemId}:`, position)
      } else {
        console.warn(`No default position defined for ${itemId}`)
      }
    })
    console.log('Item positions after init:', itemPositions.value)

    // Mark them as placed in habitat
    const inventoryStore = useInventoryStore()
    starterItemIds.forEach(itemId => {
      inventoryStore.markAsPlacedInHabitat(itemId, 1)
    })
  }

  // ============================================================================
  // Guinea Pig Position Tracking (System 16: Phase 4)
  // ============================================================================

  /**
   * Find an empty cell not occupied by items
   */
  function findEmptyCell(): { x: number; y: number } | null {
    const occupiedCells = new Set<string>()

    // Mark cells occupied by items
    habitatItems.value.forEach(itemId => {
      const position = itemPositions.value.get(itemId)
      if (position) {
        // For now, assume all items are 1x1 (gridSize will be added to item metadata in future)
        // const suppliesStore = useSuppliesStore()
        // const item = suppliesStore.getItemById(itemId)
        const width = 1
        const height = 1

        for (let dy = 0; dy < height; dy++) {
          for (let dx = 0; dx < width; dx++) {
            occupiedCells.add(`${position.x + dx},${position.y + dy}`)
          }
        }
      }
    })

    // Find random empty cell
    const attempts = 50
    for (let i = 0; i < attempts; i++) {
      const x = Math.floor(Math.random() * gridWidth)
      const y = Math.floor(Math.random() * gridHeight)
      const key = `${x},${y}`

      if (!occupiedCells.has(key)) {
        return { x, y }
      }
    }

    return null // No empty cells found
  }

  /**
   * Initialize guinea pig position (called when guinea pig becomes active)
   */
  function initializeGuineaPigPosition(guineaPigId: string) {
    // Don't re-initialize if position already exists
    if (guineaPigPositions.value.has(guineaPigId)) {
      console.log(`Guinea pig ${guineaPigId} already has a position`)
      return
    }

    // Find random unoccupied cell
    const emptyCell = findEmptyCell()

    let x: number
    let y: number

    if (emptyCell) {
      x = emptyCell.x
      y = emptyCell.y
    } else {
      // Default to center if no empty cells (shouldn't happen)
      x = Math.floor(gridWidth / 2)
      y = Math.floor(gridHeight / 2)
    }

    // Check if another guinea pig is already at this position
    let offsetX = 0
    let offsetY = 0

    for (const [otherId, otherPos] of guineaPigPositions.value.entries()) {
      if (otherId !== guineaPigId && otherPos.x === x && otherPos.y === y) {
        // Another guinea pig is at this position - apply offset for visual separation
        offsetX = 12
        offsetY = 8
        console.log(`🐹 Guinea pig ${guineaPigId} sharing position with ${otherId}, applying offset`)
        break
      }
    }

    guineaPigPositions.value.set(guineaPigId, {
      x,
      y,
      lastMoved: Date.now(),
      isMoving: false,
      offsetX,
      offsetY
    })
    console.log(`🐹 Guinea pig ${guineaPigId} placed at (${x}, ${y})${offsetX ? ` with offset (${offsetX}, ${offsetY})` : ''}`)
  }

  /**
   * Move guinea pig to new position
   */
  function moveGuineaPigTo(guineaPigId: string, x: number, y: number): boolean {
    const currentPosition = guineaPigPositions.value.get(guineaPigId)
    if (!currentPosition) {
      console.warn(`Guinea pig ${guineaPigId} has no position`)
      return false
    }

    // Bounds check
    if (x < 0 || x >= gridWidth || y < 0 || y >= gridHeight) {
      console.warn(`Invalid position (${x}, ${y}) - out of bounds`)
      return false
    }

    // Check if another guinea pig is already at this position
    let offsetX = 0
    let offsetY = 0

    for (const [otherId, otherPos] of guineaPigPositions.value.entries()) {
      if (otherId !== guineaPigId && otherPos.x === x && otherPos.y === y) {
        // Another guinea pig is at this position - apply offset for visual separation
        // Offset by 12px to the right and slightly down for a "cuddling" appearance
        offsetX = 12
        offsetY = 8
        break
      }
    }

    // Update position with offset
    guineaPigPositions.value.set(guineaPigId, {
      x,
      y,
      lastMoved: Date.now(),
      isMoving: false,
      offsetX,
      offsetY
    })

    // Record movement activity (increases decay)
    recordGuineaPigActivity('movement')

    return true
  }

  /**
   * Get guinea pig position
   */
  function getGuineaPigPosition(guineaPigId: string): GuineaPigPosition | null {
    return guineaPigPositions.value.get(guineaPigId) || null
  }

  /**
   * Check if position is occupied by a guinea pig
   */
  function isPositionOccupiedByGuineaPig(x: number, y: number): boolean {
    for (const position of guineaPigPositions.value.values()) {
      if (position.x === x && position.y === y) {
        return true
      }
    }
    return false
  }

  // ============================================================================
  // Item Usage History (System 16: Phase 5)
  // ============================================================================

  /**
   * Record item usage by a guinea pig
   */
  function recordItemUsage(itemId: string, guineaPigId: string) {
    const now = Date.now()
    const existing = itemUsageHistory.value.get(itemId)

    if (existing) {
      // Update existing usage
      const effectivenessDecay = Math.floor(Math.random() * 4) + 2  // 2-5 points

      itemUsageHistory.value.set(itemId, {
        lastUsedAt: now,
        usageCount: existing.usageCount + 1,
        lastUsedBy: guineaPigId,
        effectiveness: Math.max(50, existing.effectiveness - effectivenessDecay),
        freshnessBonus: existing.freshnessBonus  // Freshness bonus check happens in getItemEffectiveness
      })
    } else {
      // First time usage - record initial placement time
      itemUsageHistory.value.set(itemId, {
        lastUsedAt: now,
        usageCount: 1,
        lastUsedBy: guineaPigId,
        effectiveness: 100,
        freshnessBonus: true
      })
    }

    console.log(`📊 Item ${itemId} used by ${guineaPigId}. Effectiveness: ${itemUsageHistory.value.get(itemId)?.effectiveness}%`)
  }

  /**
   * Get item effectiveness (0-100)
   */
  function getItemEffectiveness(itemId: string): number {
    const usage = itemUsageHistory.value.get(itemId)
    if (!usage) return 100  // New item, full effectiveness

    // Check for freshness bonus
    const now = Date.now()
    const hoursSinceFirstUse = (now - usage.lastUsedAt) / (1000 * 60 * 60)

    if (usage.freshnessBonus && hoursSinceFirstUse < 24) {
      return 100  // Freshness bonus active
    }

    return usage.effectiveness
  }

  /**
   * Apply daily effectiveness recovery (called periodically from game loop)
   */
  function applyEffectivenessRecovery() {
    const now = Date.now()
    const oneDayAgo = now - 86400000  // 24 hours

    itemUsageHistory.value.forEach((usage, itemId) => {
      // If item hasn't been used in 24 hours, recover 10% effectiveness
      if (usage.lastUsedAt < oneDayAgo && usage.effectiveness < 100) {
        usage.effectiveness = Math.min(100, usage.effectiveness + 10)
        console.log(`🔄 Item ${itemId} effectiveness recovered to ${usage.effectiveness}%`)
      }

      // Disable freshness bonus after 24 hours
      if (usage.freshnessBonus && (now - usage.lastUsedAt > 86400000)) {
        usage.freshnessBonus = false
      }
    })
  }

  /**
   * Reset effectiveness when item is rotated (removed and re-added)
   */
  function resetItemEffectiveness(itemId: string) {
    const existing = itemUsageHistory.value.get(itemId)
    if (existing) {
      itemUsageHistory.value.set(itemId, {
        ...existing,
        effectiveness: Math.min(100, existing.effectiveness + 50),  // Restore 50%
        freshnessBonus: true  // Re-enable freshness bonus
      })
      console.log(`🔄 Item ${itemId} rotated - effectiveness reset to ${itemUsageHistory.value.get(itemId)?.effectiveness}%`)
    }
  }

  /**
   * Get usage statistics for debug/display
   */
  function getItemUsageStats(itemId: string): ItemUsage | null {
    return itemUsageHistory.value.get(itemId) || null
  }

  /**
   * Get items sorted by effectiveness (for rotation suggestions)
   */
  function getItemsByEffectiveness(): Array<{ itemId: string; effectiveness: number }> {
    const items: Array<{ itemId: string; effectiveness: number }> = []

    habitatItems.value.forEach(itemId => {
      const effectiveness = getItemEffectiveness(itemId)
      items.push({ itemId, effectiveness })
    })

    return items.sort((a, b) => a.effectiveness - b.effectiveness)
  }

  return {
    // State
    cleanliness,
    beddingFreshness,
    hayFreshness,
    waterLevel,
    dirtiness,
    lastCleaningTime,
    lastBeddingRefresh,
    lastHayRefill,
    lastWaterRefill,
    conditionHistory,
    currentBedding,
    currentHayBag,
    consumptionRates,
    activeAlerts,
    notificationSettings,
    habitatItems,
    itemPositions,
    bowlContents,
    hayRackContents,
    waterBottles,
    poops,
    guineaPigPositions,
    itemUsageHistory,
    decaySpeedMultiplier,

    // Computed
    overallCondition,
    needsAttention,
    criticalConditions,

    // Actions
    cleanCage,
    quickClean,
    calculateBeddingNeeded,
    getTotalBeddingAvailable,
    addPoop,
    removePoop,
    refreshBedding,
    refillHay,
    refillWater,
    consumeHayHandful,
    updateCondition,
    recordSnapshot,
    resetHabitatConditions,
    resetToStarterHabitat,
    addItemToHabitat,
    removeItemFromHabitat,
    initializeStarterHabitat,
    addFoodToBowl,
    removeFoodFromBowl,
    getBowlContents,
    clearBowl,
    clearAllBowls,
    setFoodFreshness,
    addHayToRack,
    removeHayFromRack,
    getHayRackContents,
    getHayRackFreshness,
    clearHayRack,
    clearAllHayRacks,
    fillAllHayRacks,

    // System 16: Phase 2 - Water Consumption (per-bottle)
    getWaterBottleLevel,
    refillWaterBottle,
    consumeWater,
    hasWaterAvailable,
    getWaterBottlePosition,

    // System 16: Phase 3 - Environmental Decay
    applyEnvironmentalDecay,
    recordGuineaPigActivity,
    setDecaySpeed,

    // System 16: Phase 4 - Guinea Pig Position Tracking
    initializeGuineaPigPosition,
    moveGuineaPigTo,
    getGuineaPigPosition,
    isPositionOccupiedByGuineaPig,

    // System 16: Phase 5 - Item Usage History
    recordItemUsage,
    getItemEffectiveness,
    applyEffectivenessRecovery,
    resetItemEffectiveness,
    getItemUsageStats,
    getItemsByEffectiveness
  }
}, {
  persist: {
    key: 'gps2-habitat-conditions',
    storage: localStorage,
    afterHydrate: (ctx) => {
      // Sync deserialized Maps back to composable singleton refs
      // This fixes the bug where composable refs point to empty Maps after page refresh
      const containers = useHabitatContainers()
      if (ctx.store.bowlContents instanceof Map) {
        containers.bowlContents.value = ctx.store.bowlContents
      }
      if (ctx.store.hayRackContents instanceof Map) {
        containers.hayRackContents.value = ctx.store.hayRackContents
      }
      if (ctx.store.waterBottles instanceof Map) {
        containers.waterBottles.value = ctx.store.waterBottles
      }
    },
    serializer: {
      serialize: (state) => {
        // Convert Maps to arrays for serialization
        const serialized = {
          ...state,
          itemPositions: serializeMap(state.itemPositions as Map<string, { x: number; y: number }>),
          bowlContents: serializeMap(state.bowlContents as Map<string, any[]>),
          hayRackContents: serializeMap(state.hayRackContents as Map<string, any[]>),
          waterBottles: serializeMap(state.waterBottles as Map<string, any>),
          poops: state.poops || [],
          guineaPigPositions: serializeMap(state.guineaPigPositions as Map<string, GuineaPigPosition>),
          itemUsageHistory: serializeMap(state.itemUsageHistory as Map<string, ItemUsage>)
        }
        return JSON.stringify(serialized)
      },
      deserialize: (value) => {
        const parsed = JSON.parse(value)
        // Safely convert arrays back to Maps with fallback
        parsed.itemPositions = safeDeserializeMap<string, { x: number; y: number }>(
          parsed.itemPositions,
          new Map()
        )
        parsed.bowlContents = safeDeserializeMap<string, any[]>(
          parsed.bowlContents,
          new Map()
        )
        parsed.hayRackContents = safeDeserializeMap<string, any[]>(
          parsed.hayRackContents,
          new Map()
        )
        parsed.waterBottles = safeDeserializeMap<string, any>(
          parsed.waterBottles,
          new Map()
        )
        parsed.poops = parsed.poops || []
        parsed.guineaPigPositions = safeDeserializeMap<string, GuineaPigPosition>(
          parsed.guineaPigPositions,
          new Map()
        )
        parsed.itemUsageHistory = safeDeserializeMap<string, ItemUsage>(
          parsed.itemUsageHistory,
          new Map()
        )
        return parsed
      }
    }
  }
})
