/**
 * Habitat Containers Composable
 * Phase 3 - Bowl and Hay Rack Management
 *
 * Manages food bowls and hay racks in the habitat:
 * - Food bowl contents and capacity
 * - Hay rack contents and serving tracking
 * - Hay freshness tracking per rack with decay
 * - Adding/removing items from containers
 *
 * Note: Uses singleton pattern for shared state to ensure
 * consistent data across all component instances.
 */

import { ref } from 'vue'
import { useSuppliesStore } from '../stores/suppliesStore'
import { useInventoryStore } from '../stores/inventoryStore'
import { CONSUMPTION, CHEW_DEGRADATION } from '../constants/supplies'
import { hasServingSystem, getServingCount } from '../utils/servingSystem'
import { getBaseItemId } from '../utils/placementId'

// Types
interface FoodItem {
  itemId: string
  emoji: string
  name: string
  freshness: number
  addedAt: number
}

interface HayServing {
  itemId: string
  instanceId: string
  addedAt: number
}

interface HayRackData {
  servings: HayServing[]
  freshness: number
  lastDecayUpdate: number
}

interface ChewData {
  durability: number      // 0-100%, physical condition
  usageCount: number      // Times chewed
  lastUsedAt: number      // Timestamp
  degradationRate: number // Per-use degradation %
}

interface WaterBottleData {
  level: number           // 0-100% water level
  lastDrinkAt: number     // Timestamp of last drink
}

// Shared state - singleton pattern to ensure same instance across all uses
const bowlContents = ref<Map<string, FoodItem[]>>(new Map())
const hayRackContents = ref<Map<string, HayRackData>>(new Map())
const chewItems = ref<Map<string, ChewData>>(new Map())
const waterBottles = ref<Map<string, WaterBottleData>>(new Map())

export function useHabitatContainers() {

  // ========================================================================
  // Bowl Management
  // ========================================================================

  function addFoodToBowl(bowlPlacementId: string, foodItemId: string): boolean {
    const suppliesStore = useSuppliesStore()
    const inventoryStore = useInventoryStore()

    // Check if food item is in inventory
    if (!inventoryStore.hasItem(foodItemId)) {
      console.warn(`Food item ${foodItemId} not in inventory`)
      return false
    }

    // Get bowl item to check capacity (use base ID for supplies lookup)
    const baseItemId = getBaseItemId(bowlPlacementId)
    const bowlItem = suppliesStore.getItemById(baseItemId)
    if (!bowlItem) {
      console.warn(`Bowl ${baseItemId} not found`)
      return false
    }

    // Validate bowl is actually a bowl/bottle container
    if (bowlItem.subCategory !== 'bowls_bottles') {
      console.warn(`Item ${baseItemId} is not a food bowl`)
      return false
    }

    const capacity = bowlItem.stats?.foodCapacity || CONSUMPTION.DEFAULT_FOOD_CAPACITY
    const currentContents = bowlContents.value.get(bowlPlacementId) || []

    // Check if bowl is full
    if (currentContents.length >= capacity) {
      console.warn(`Bowl is full (capacity: ${capacity})`)
      return false
    }

    // Get food item details
    const foodItem = suppliesStore.getItemById(foodItemId)
    if (!foodItem) {
      console.warn(`Food item ${foodItemId} not found`)
      return false
    }

    // Validate food type compatibility - bowls accept food and hay
    if (foodItem.category !== 'food' && foodItem.category !== 'hay') {
      console.warn(`Item ${foodItemId} is not food or hay - bowls only accept food and hay items`)
      return false
    }

    // Remove food from inventory (consume it)
    let removed = false

    if (hasServingSystem(foodItem)) {
      // Consume one serving
      removed = inventoryStore.consumeServing(foodItemId)
    } else {
      // Remove entire item (old system)
      removed = inventoryStore.removeItem(foodItemId, 1)
    }

    if (!removed) {
      console.warn(`Failed to remove ${foodItemId} from inventory`)
      return false
    }

    // Add food to bowl
    const updatedContents = [
      ...currentContents,
      {
        itemId: foodItemId,
        emoji: foodItem.emoji || '🍽️',
        name: foodItem.name,
        freshness: 100,
        addedAt: Date.now()
      }
    ]

    // Create new Map to trigger reactivity
    const newMap = new Map(bowlContents.value)
    newMap.set(bowlPlacementId, updatedContents)
    bowlContents.value = newMap
    return true
  }

  function removeFoodFromBowl(bowlPlacementId: string, foodIndex: number): boolean {
    const inventoryStore = useInventoryStore()
    const suppliesStore = useSuppliesStore()
    const currentContents = bowlContents.value.get(bowlPlacementId)
    if (!currentContents) {
      console.warn(`Bowl ${bowlPlacementId} has no contents`)
      return false
    }

    if (foodIndex < 0 || foodIndex >= currentContents.length) {
      console.warn(`Invalid food index ${foodIndex} for bowl ${bowlPlacementId}`)
      return false
    }

    const foodItem = currentContents[foodIndex]
    const supplyItem = suppliesStore.getItemById(foodItem.itemId)

    // Add food back to inventory with proper serving tracking
    if (hasServingSystem(supplyItem)) {
      const servings = getServingCount(supplyItem)
      inventoryStore.addConsumableWithServings(foodItem.itemId, servings)
    } else {
      inventoryStore.addItem(foodItem.itemId, 1)
    }

    // Remove food from bowl - create new array to trigger reactivity
    const updatedContents = currentContents.filter((_, index) => index !== foodIndex)

    // Create new Map to trigger Vue reactivity
    const newMap = new Map(bowlContents.value)
    if (updatedContents.length === 0) {
      newMap.delete(bowlPlacementId)
    } else {
      newMap.set(bowlPlacementId, updatedContents)
    }
    bowlContents.value = newMap
    return true
  }

  function getBowlContents(bowlPlacementId: string): FoodItem[] {
    return bowlContents.value.get(bowlPlacementId) || []
  }

  function clearBowl(bowlPlacementId: string): void {
    bowlContents.value.delete(bowlPlacementId)
  }

  function clearAllBowls(): void {
    bowlContents.value.clear()
  }

  function setFoodFreshness(bowlPlacementId: string, foodIndex: number, freshness: number): void {
    const currentContents = bowlContents.value.get(bowlPlacementId)
    if (!currentContents || foodIndex >= currentContents.length) {
      console.warn(`Invalid bowl or food index`)
      return
    }

    const updatedContents = currentContents.map((food, index) => {
      if (index === foodIndex) {
        return {
          ...food,
          freshness: Math.max(0, Math.min(100, freshness))
        }
      }
      return food
    })

    // Create new Map to trigger reactivity
    const newMap = new Map(bowlContents.value)
    newMap.set(bowlPlacementId, updatedContents)
    bowlContents.value = newMap
  }

  function applyFoodBowlDecay(decayAmount: number): void {
    const newMap = new Map(bowlContents.value)

    newMap.forEach((foods, bowlId) => {
      const updatedFoods = foods.map(food => ({
        ...food,
        freshness: Math.max(0, Math.min(100, food.freshness - decayAmount))
      }))

      newMap.set(bowlId, updatedFoods)
    })

    // Assign new Map to trigger Vue reactivity
    bowlContents.value = newMap
  }

  // ========================================================================
  // Hay Rack Management
  // ========================================================================

  function addHayToRack(hayRackPlacementId: string, hayItemId: string): boolean {
    const inventoryStore = useInventoryStore()
    const suppliesStore = useSuppliesStore()

    // Validate hay rack is actually a hay rack (use base ID for supplies lookup)
    const baseItemId = getBaseItemId(hayRackPlacementId)
    const hayRackItem = suppliesStore.getItemById(baseItemId)
    if (!hayRackItem || hayRackItem.subCategory !== 'bowls_bottles') {
      console.warn(`Item ${baseItemId} is not a hay rack`)
      return false
    }

    // Validate that this is actually a hay item
    const item = suppliesStore.getItemById(hayItemId)
    if (!item || item.category !== 'hay') {
      console.warn(`Item ${hayItemId} is not hay - hay racks only accept hay`)
      return false
    }

    // Check if hay item is in inventory
    const totalServings = inventoryStore.getTotalServings(hayItemId)
    if (totalServings <= 0) {
      console.warn(`No servings of ${hayItemId} in inventory`)
      return false
    }

    const currentData = hayRackContents.value.get(hayRackPlacementId) || {
      servings: [],
      freshness: 100,
      lastDecayUpdate: Date.now()
    }

    // Check if hay rack is full
    if (currentData.servings.length >= CONSUMPTION.HAY_RACK_MAX_CAPACITY) {
      console.warn(`Hay rack is full (capacity: ${CONSUMPTION.HAY_RACK_MAX_CAPACITY})`)
      return false
    }

    // Consume one serving from inventory
    const consumed = inventoryStore.consumeServing(hayItemId)
    if (!consumed) {
      console.warn(`Failed to consume serving of ${hayItemId}`)
      return false
    }

    // Add hay serving to rack
    const updatedServings = [
      ...currentData.servings,
      {
        itemId: hayItemId,
        instanceId: `hay_${crypto.randomUUID()}`,
        addedAt: Date.now()
      }
    ]

    hayRackContents.value.set(hayRackPlacementId, {
      servings: updatedServings,
      freshness: currentData.freshness,
      lastDecayUpdate: currentData.lastDecayUpdate
    })
    return true
  }

  function removeHayFromRack(hayRackPlacementId: string, servingIndex: number): boolean {
    const currentData = hayRackContents.value.get(hayRackPlacementId)
    if (!currentData || servingIndex >= currentData.servings.length) {
      console.warn(`Invalid hay rack or serving index`)
      return false
    }

    // Remove serving from rack (when guinea pig eats hay)
    // NOTE: This does NOT add hay back to inventory - eating consumes the hay entirely
    const updatedServings = currentData.servings.filter((_, index) => index !== servingIndex)

    if (updatedServings.length === 0) {
      hayRackContents.value.delete(hayRackPlacementId)
    } else {
      hayRackContents.value.set(hayRackPlacementId, {
        servings: updatedServings,
        freshness: currentData.freshness,
        lastDecayUpdate: currentData.lastDecayUpdate
      })
    }

    return true
  }

  function getHayRackContents(hayRackPlacementId: string): HayServing[] {
    const data = hayRackContents.value.get(hayRackPlacementId)
    return data?.servings || []
  }

  function getHayRackFreshness(hayRackPlacementId: string): number {
    const data = hayRackContents.value.get(hayRackPlacementId)
    return data?.freshness ?? 100
  }

  function setHayRackFreshness(hayRackPlacementId: string, freshness: number): void {
    const data = hayRackContents.value.get(hayRackPlacementId)

    // If hay rack doesn't exist in the map yet, initialize it
    const rackData = data || {
      servings: [],
      freshness: 100,
      lastDecayUpdate: Date.now()
    }

    // Create a new Map to trigger Vue reactivity
    const newMap = new Map(hayRackContents.value)
    newMap.set(hayRackPlacementId, {
      servings: rackData.servings,
      freshness: Math.max(0, Math.min(100, freshness)),
      lastDecayUpdate: rackData.lastDecayUpdate
    })
    hayRackContents.value = newMap
  }

  function clearHayRack(hayRackPlacementId: string): void {
    // Keep the rack entry but clear its servings and reset freshness
    // This ensures the rack is still tracked in the system
    const newMap = new Map(hayRackContents.value)
    newMap.set(hayRackPlacementId, {
      servings: [],
      freshness: 100,
      lastDecayUpdate: Date.now()
    })
    hayRackContents.value = newMap
  }

  function clearAllHayRacks(): void {
    hayRackContents.value.clear()
  }

  function applyHayRackDecay(decayAmount: number): void {
    const now = Date.now()
    const newMap = new Map(hayRackContents.value)

    newMap.forEach((data, rackId) => {
      // Apply decay
      const newFreshness = Math.max(0, Math.min(100, data.freshness - decayAmount))

      newMap.set(rackId, {
        servings: data.servings,
        freshness: newFreshness,
        lastDecayUpdate: now
      })
    })

    // Assign new Map to trigger Vue reactivity
    hayRackContents.value = newMap
  }

  function fillAllHayRacks(hayRackInstanceIds: string[]): { totalAdded: number, racksFilled: number } {
    const inventoryStore = useInventoryStore()
    const suppliesStore = useSuppliesStore()

    // Find available hay in inventory
    const hayItems = inventoryStore.items.filter(invItem => {
      const item = suppliesStore.getItemById(invItem.itemId)
      return item?.category === 'hay'
    })

    if (hayItems.length === 0) {
      return { totalAdded: 0, racksFilled: 0 }
    }

    // Get first hay type with servings available
    const hayItemId = hayItems[0].itemId
    let remainingHay = inventoryStore.getTotalServings(hayItemId)
    let totalAdded = 0
    let racksFilled = 0

    for (const rackId of hayRackInstanceIds) {
      if (remainingHay === 0) break

      const currentData = hayRackContents.value.get(rackId) || {
        servings: [],
        freshness: 100,
        lastDecayUpdate: Date.now()
      }

      const emptySlots = CONSUMPTION.HAY_RACK_MAX_CAPACITY - currentData.servings.length
      const servingsToAdd = Math.min(emptySlots, remainingHay)

      if (servingsToAdd > 0) {
        // Add servings to rack
        for (let i = 0; i < servingsToAdd; i++) {
          if (addHayToRack(rackId, hayItemId)) {
            totalAdded++
            remainingHay--
          }
        }
        racksFilled++
      }
    }

    return { totalAdded, racksFilled }
  }

  // ========================================================================
  // Chew Item Management
  // ========================================================================

  /**
   * Initialize chew item tracking when placed in habitat
   */
  function initializeChewItem(chewPlacementId: string): void {
    const suppliesStore = useSuppliesStore()
    const baseItemId = getBaseItemId(chewPlacementId)
    const chewItem = suppliesStore.getItemById(baseItemId)

    if (!chewItem) {
      console.warn(`Chew item ${baseItemId} not found`)
      return
    }

    // Determine degradation rate based on chew type
    let degradationRate: number = CHEW_DEGRADATION.APPLE_WOOD // Default
    const itemName = chewItem.name.toLowerCase()

    if (itemName.includes('willow')) {
      degradationRate = CHEW_DEGRADATION.WILLOW_STICK
    } else if (itemName.includes('apple')) {
      degradationRate = CHEW_DEGRADATION.APPLE_WOOD
    } else if (itemName.includes('mineral') || itemName.includes('stone')) {
      degradationRate = CHEW_DEGRADATION.MINERAL_CHEW
    }

    // Initialize fresh chew data
    const newMap = new Map(chewItems.value)
    newMap.set(chewPlacementId, {
      durability: 100,
      usageCount: 0,
      lastUsedAt: Date.now(),
      degradationRate
    })
    chewItems.value = newMap
  }

  /**
   * Use/chew an item, reducing its durability
   */
  function chewItem(chewPlacementId: string): boolean {
    const chewData = chewItems.value.get(chewPlacementId)

    if (!chewData) {
      console.warn(`Chew item ${chewPlacementId} not initialized`)
      return false
    }

    // Don't allow using unsafe chews
    if (chewData.durability < CHEW_DEGRADATION.UNSAFE_THRESHOLD) {
      console.warn(`Chew item ${chewPlacementId} is unsafe to use (durability: ${chewData.durability}%)`)
      return false
    }

    // Reduce durability and update usage
    const newDurability = Math.max(0, chewData.durability - chewData.degradationRate)
    const newMap = new Map(chewItems.value)
    newMap.set(chewPlacementId, {
      ...chewData,
      durability: newDurability,
      usageCount: chewData.usageCount + 1,
      lastUsedAt: Date.now()
    })
    chewItems.value = newMap

    return true
  }

  /**
   * Get chew item data
   */
  function getChewData(chewPlacementId: string): ChewData | undefined {
    return chewItems.value.get(chewPlacementId)
  }

  /**
   * Get durability of a chew item
   */
  function getChewDurability(chewPlacementId: string): number {
    const data = chewItems.value.get(chewPlacementId)
    return data?.durability ?? 100
  }

  /**
   * Set chew durability (for debug controls)
   */
  function setChewDurability(chewPlacementId: string, durability: number): void {
    const chewData = chewItems.value.get(chewPlacementId)
    if (!chewData) {
      console.warn(`Chew item ${chewPlacementId} not found`)
      return
    }

    const newMap = new Map(chewItems.value)
    newMap.set(chewPlacementId, {
      ...chewData,
      durability: Math.max(0, Math.min(100, durability))
    })
    chewItems.value = newMap
  }

  /**
   * Remove chew item tracking when removed from habitat
   */
  function removeChewItem(chewPlacementId: string): void {
    const newMap = new Map(chewItems.value)
    newMap.delete(chewPlacementId)
    chewItems.value = newMap
  }

  /**
   * Get all chew items with unsafe durability
   */
  function getUnsafeChews(): string[] {
    const unsafeChews: string[] = []
    chewItems.value.forEach((data, itemId) => {
      if (data.durability < CHEW_DEGRADATION.UNSAFE_THRESHOLD) {
        unsafeChews.push(itemId)
      }
    })
    return unsafeChews
  }

  // ========================================================================
  // Water Bottle Management
  // ========================================================================

  /**
   * Initialize water bottle tracking when placed in habitat
   */
  function initializeWaterBottle(bottlePlacementId: string, initialLevel: number = 100): void {
    const newMap = new Map(waterBottles.value)
    newMap.set(bottlePlacementId, {
      level: Math.max(0, Math.min(100, initialLevel)),
      lastDrinkAt: Date.now()
    })
    waterBottles.value = newMap
    console.log(`[useHabitatContainers] Initialized water bottle: ${bottlePlacementId} at ${initialLevel}%`)
  }

  /**
   * Get water level for a specific bottle
   */
  function getWaterBottleLevel(bottlePlacementId: string): number {
    const data = waterBottles.value.get(bottlePlacementId)
    return data?.level ?? 100
  }

  /**
   * Set water level for a specific bottle
   */
  function setWaterBottleLevel(bottlePlacementId: string, level: number): void {
    const data = waterBottles.value.get(bottlePlacementId)
    const bottleData = data || { level: 100, lastDrinkAt: Date.now() }

    const newMap = new Map(waterBottles.value)
    newMap.set(bottlePlacementId, {
      ...bottleData,
      level: Math.max(0, Math.min(100, level))
    })
    waterBottles.value = newMap
  }

  /**
   * Refill a specific water bottle to 100%
   */
  function refillWaterBottle(bottlePlacementId: string): number {
    const currentLevel = getWaterBottleLevel(bottlePlacementId)
    const amountFilled = 100 - currentLevel

    setWaterBottleLevel(bottlePlacementId, 100)
    console.log(`[useHabitatContainers] Refilled water bottle: ${bottlePlacementId} (+${amountFilled}%)`)

    return amountFilled
  }

  /**
   * Consume water from a specific bottle
   * Returns true if water was consumed, false if bottle is empty
   */
  function consumeWaterFromBottle(bottlePlacementId: string, amount: number): boolean {
    const currentLevel = getWaterBottleLevel(bottlePlacementId)

    if (currentLevel < CONSUMPTION.WATER_MINIMUM_LEVEL) {
      console.log(`[useHabitatContainers] Water bottle ${bottlePlacementId} is empty`)
      return false
    }

    const newLevel = Math.max(0, currentLevel - amount)

    const newMap = new Map(waterBottles.value)
    newMap.set(bottlePlacementId, {
      level: newLevel,
      lastDrinkAt: Date.now()
    })
    waterBottles.value = newMap

    console.log(`💧 Water consumed from ${bottlePlacementId}: ${amount}%. Remaining: ${newLevel}%`)
    return true
  }

  /**
   * Get all water bottle placement IDs
   */
  function getAllWaterBottles(): string[] {
    return Array.from(waterBottles.value.keys())
  }

  /**
   * Get aggregate water level (average of all bottles)
   */
  function getAggregateWaterLevel(): number {
    if (waterBottles.value.size === 0) return 0

    let total = 0
    waterBottles.value.forEach(data => {
      total += data.level
    })
    return total / waterBottles.value.size
  }

  /**
   * Find a water bottle with available water for drinking
   * Returns null if no bottles have water
   */
  function findAvailableWaterBottle(): string | null {
    for (const [placementId, data] of waterBottles.value.entries()) {
      if (data.level >= CONSUMPTION.WATER_MINIMUM_LEVEL) {
        return placementId
      }
    }
    return null
  }

  /**
   * Remove water bottle tracking when removed from habitat
   */
  function removeWaterBottle(bottlePlacementId: string): void {
    const newMap = new Map(waterBottles.value)
    newMap.delete(bottlePlacementId)
    waterBottles.value = newMap
    console.log(`[useHabitatContainers] Removed water bottle tracking: ${bottlePlacementId}`)
  }

  /**
   * Clear all water bottle tracking
   */
  function clearAllWaterBottles(): void {
    waterBottles.value = new Map()
  }

  // ========================================================================
  // Return API
  // ========================================================================

  return {
    // State
    bowlContents,
    hayRackContents,
    chewItems,
    waterBottles,

    // Bowl methods
    addFoodToBowl,
    removeFoodFromBowl,
    getBowlContents,
    clearBowl,
    clearAllBowls,
    setFoodFreshness,
    applyFoodBowlDecay,

    // Hay rack methods
    addHayToRack,
    removeHayFromRack,
    getHayRackContents,
    getHayRackFreshness,
    setHayRackFreshness,
    clearHayRack,
    clearAllHayRacks,
    applyHayRackDecay,
    fillAllHayRacks,

    // Chew item methods
    initializeChewItem,
    chewItem,
    getChewData,
    getChewDurability,
    setChewDurability,
    removeChewItem,
    getUnsafeChews,

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
    clearAllWaterBottles
  }
}

// Export types for external use
export type { FoodItem, HayServing, HayRackData, ChewData, WaterBottleData }
