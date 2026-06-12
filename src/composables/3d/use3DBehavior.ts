/**
 * 3D Unified Behavior Composable
 * Priority-based behavior system for guinea pigs in 3D
 * Follows the 2D pattern from useGuineaPigBehavior.ts
 *
 * - Single movement controller per guinea pig
 * - Evaluates all needs and selects highest priority
 * - Handles: hunger (eat), thirst (drink), wandering
 * - Extensible for future needs (sleep, groom, play, etc.)
 */

import { ref, onUnmounted } from 'vue'
import { useMovement3DStore } from '../../stores/movement3DStore'
import { useGuineaPigStore } from '../../stores/guineaPigStore'
import { useHabitatConditions } from '../../stores/habitatConditions'
import { useSuppliesStore } from '../../stores/suppliesStore'
import { useGameController } from '../../stores/gameController'
import { useLoggingStore } from '../../stores/loggingStore'
import { useHabitatContainers } from '../useHabitatContainers'
import { use3DMovement } from './use3DMovement'
import { use3DSocialActions } from './use3DSocialActions'
import type { Vector3D } from '../../types/movement3d'

// Behavior types (extensible for future needs)
export type Behavior3DType = 'eat' | 'drink' | 'seek_shelter' | 'sleep' | 'groom' | 'play' | 'chew' | 'socialize' | 'wander'

// Goal structure matching 2D pattern
export interface Behavior3DGoal {
  type: Behavior3DType
  target: Vector3D | null
  priority: number
  estimatedDuration: number
  needSatisfied?: 'hunger' | 'thirst' | 'shelter' | 'energy' | 'hygiene' | 'play' | 'chew' | 'social'
  targetItemId?: string
  sourceType?: 'food_bowl' | 'hay_rack' // For eating behavior - tracks what container to consume from
  socialMetadata?: { partnerId: string; bondId: string } // For social behavior
}

// Activity states for UI/animation
export type Activity3DType = 'idle' | 'walking' | 'eating' | 'drinking' | 'sheltering' | 'sleeping' | 'grooming' | 'playing' | 'chewing' | 'popcorning' | 'socializing'

// Configuration
const BEHAVIOR_TICK_INTERVAL = 2000 // Check behavior every 2 seconds

const THRESHOLDS = {
  hunger: 70,   // Seek food when hunger < 70
  thirst: 65,   // Seek water when thirst < 65
  shelter: 50,  // Seek shelter when shelter < 50
  energy: 40,   // Seek sleep when energy < 40
  hygiene: 60,  // Groom when hygiene < 60
  play: 55,     // Play with toys when play < 55
  chew: 60,     // Chew on items when chew < 60
  social: 55    // Socialize with companion when social < 55
}

const COOLDOWNS = {
  eat: 10000,         // 10 seconds after eating
  drink: 8000,        // 8 seconds after drinking
  seek_shelter: 60000, // 1 minute after sheltering
  sleep: 120000,      // 2 minutes after sleeping
  groom: 30000,       // 30 seconds after grooming
  play: 90000,        // 90 seconds after playing
  chew: 60000,        // 60 seconds after chewing
  socialize: 45000,   // 45 seconds after socializing
  wander: 3000        // 3 seconds between wanders
}

const DURATIONS = {
  eat: 3000,          // 3 seconds to eat
  drink: 3000,        // 3 seconds to drink
  seek_shelter: 8000, // 8 seconds in shelter
  sleep: 5000,        // Base 5 seconds to sleep (multiplied by tiredness)
  groom: 4000,        // Base 4 seconds to groom (modified by cleanliness)
  play: 6000,         // 6 seconds to play with toy (shake + headbutt)
  chew: 5000          // 5 seconds to chew on item
}

const RESTORE_AMOUNTS = {
  hunger: 50,    // Restore 50 hunger when eating
  thirst: 35,    // Restore 35 thirst when drinking
  shelter: 30,   // Restore 30 shelter when sheltering
  energy: 25,    // Base 25 energy when sleeping (multiplied by quality)
  hygiene: 15,   // Base 15 hygiene when grooming (modified by cleanliness)
  play: 35,      // Restore 35 play when playing with toys
  chew: 40,      // Restore 40 chew when chewing on items
  social: 25     // Restore 25 social when socializing with companion
}

// Shelter entrance offset (igloo entrance faces +Z direction)
const SHELTER_ENTRANCE_OFFSET = 5.0

// Shelter side offset (left/right positioning for two guinea pigs)
const SHELTER_SIDE_OFFSET = 1.2 // Distance from center to left/right side

// Poop configuration
const POOP_INTERVAL_MS = 30000 // 30 seconds between poops
const SUBGRID_SCALE = 4

export function use3DBehavior(guineaPigId: string) {
  const movement3DStore = useMovement3DStore()
  const guineaPigStore = useGuineaPigStore()
  const habitatConditions = useHabitatConditions()
  const suppliesStore = useSuppliesStore()
  const gameController = useGameController()
  const loggingStore = useLoggingStore()
  const habitatContainers = useHabitatContainers()
  const socialActions = use3DSocialActions()

  // Single movement controller for all behaviors
  const movement = use3DMovement(guineaPigId)

  // Behavior state
  const currentActivity = ref<Activity3DType>('idle')
  const currentGoal = ref<Behavior3DGoal | null>(null)
  const behaviorCooldowns = new Map<Behavior3DType, number>()

  // Interval handles
  let behaviorInterval: number | null = null
  let actionTimeout: number | null = null

  // Callbacks for external notification (bubbles, animations)
  let onDrinkingStartCallback: (() => void) | null = null
  let onDrinkingEndCallback: (() => void) | null = null
  let onEatingStartCallback: (() => void) | null = null
  let onEatingEndCallback: (() => void) | null = null
  let onShelteringStartCallback: ((shelterPosition: Vector3D) => void) | null = null
  let onShelteringEndCallback: (() => void) | null = null
  let onSocializingStartCallback: ((partnerId: string) => void) | null = null
  let onSocializingEndCallback: (() => void) | null = null

  /**
   * Get the guinea pig data
   */
  function getGuineaPig() {
    return guineaPigStore.collection.guineaPigs[guineaPigId]
  }

  /**
   * Check if behavior is on cooldown
   */
  function isOnCooldown(behaviorType: Behavior3DType): boolean {
    const cooldownEnd = behaviorCooldowns.get(behaviorType)
    if (!cooldownEnd) return false
    return Date.now() < cooldownEnd
  }

  /**
   * Set behavior cooldown
   */
  function setCooldown(behaviorType: Behavior3DType, durationMs: number): void {
    behaviorCooldowns.set(behaviorType, Date.now() + durationMs)
  }

  /**
   * Calculate priority for a need-based behavior (2D pattern)
   * Lower need value = higher urgency = higher priority
   */
  function calculateNeedPriority(needValue: number, threshold: number, baseWeight: number): number {
    if (needValue >= threshold) return 0
    const urgency = (threshold - needValue) / threshold
    return baseWeight * urgency
  }

  /**
   * Find the position of a food source (food bowl or hay rack) in world coordinates
   * Priority: Food bowl with food > Hay rack with hay > Empty bowl > Empty hay rack
   */
  function findFoodSourcePosition(): { position: Vector3D; itemId: string; sourceType: 'food_bowl' | 'hay_rack' } | null {
    const itemPositions = habitatConditions.itemPositions

    // First priority: Find a food bowl with food in it
    for (const [itemId, gridPos] of itemPositions.entries()) {
      const item = suppliesStore.getItemById(itemId)

      if (item?.stats?.itemType === 'food_bowl') {
        const bowlContents = habitatConditions.getBowlContents(itemId)

        if (bowlContents && bowlContents.length > 0) {
          return {
            position: movement3DStore.gridToWorld(gridPos.x, gridPos.y),
            itemId,
            sourceType: 'food_bowl'
          }
        }
      }
    }

    // Second priority: Find a hay rack with hay in it
    for (const [itemId, gridPos] of itemPositions.entries()) {
      const item = suppliesStore.getItemById(itemId)

      if (item?.stats?.itemType === 'hay_rack') {
        const hayServings = habitatConditions.getHayRackContents(itemId)

        if (hayServings && hayServings.length > 0) {
          return {
            position: movement3DStore.gridToWorld(gridPos.x, gridPos.y),
            itemId,
            sourceType: 'hay_rack'
          }
        }
      }
    }

    // Third priority: Find any food bowl (even if empty, for wandering to it)
    for (const [itemId, gridPos] of itemPositions.entries()) {
      const item = suppliesStore.getItemById(itemId)

      if (item?.stats?.itemType === 'food_bowl') {
        return {
          position: movement3DStore.gridToWorld(gridPos.x, gridPos.y),
          itemId,
          sourceType: 'food_bowl'
        }
      }
    }

    // Fourth priority: Find any hay rack
    for (const [itemId, gridPos] of itemPositions.entries()) {
      const item = suppliesStore.getItemById(itemId)

      if (item?.stats?.itemType === 'hay_rack') {
        return {
          position: movement3DStore.gridToWorld(gridPos.x, gridPos.y),
          itemId,
          sourceType: 'hay_rack'
        }
      }
    }

    return null
  }

  /**
   * Find the position of a water bottle in world coordinates
   */
  function findWaterBottlePosition(): { position: Vector3D; itemId: string } | null {
    if (!habitatConditions.hasWaterAvailable()) {
      return null
    }

    const gridPos = habitatConditions.getWaterBottlePosition()
    if (!gridPos) {
      return null
    }

    return {
      position: movement3DStore.gridToWorld(gridPos.x, gridPos.y),
      itemId: 'water-bottle'
    }
  }

  /**
   * Find the position of a shelter (igloo) in world coordinates
   * Returns the entrance position (in front of the shelter)
   */
  function findShelterPosition(): { entrancePosition: Vector3D; shelterCenter: Vector3D; itemId: string } | null {
    const itemPositions = habitatConditions.itemPositions

    // Find shelter items (igloo, hideout, shelter)
    for (const [itemId, gridPos] of itemPositions.entries()) {
      const item = suppliesStore.getItemById(itemId)
      const itemType = item?.stats?.itemType || ''
      const itemIdLower = itemId.toLowerCase()

      const isShelter =
        itemType === 'shelter' ||
        itemIdLower.includes('igloo') ||
        itemIdLower.includes('shelter') ||
        itemIdLower.includes('hideout')

      if (isShelter) {
        const shelterCenter = movement3DStore.gridToWorld(gridPos.x, gridPos.y)

        // Entrance is in front of the shelter (+Z direction)
        const entrancePosition: Vector3D = {
          x: shelterCenter.x,
          y: 0,
          z: shelterCenter.z + SHELTER_ENTRANCE_OFFSET
        }

        return {
          entrancePosition,
          shelterCenter,
          itemId
        }
      }
    }

    return null
  }

  /**
   * Find the position to sleep in world coordinates
   * Priority: Bed > Shelter > null (sleep in place)
   * Returns sleep location info with flags for quality calculation
   */
  function findSleepPosition(): {
    position: Vector3D
    entrancePosition?: Vector3D
    itemId: string | null
    isBed: boolean
    isShelter: boolean
  } | null {
    const itemPositions = habitatConditions.itemPositions

    // First priority: Find a bed
    for (const [itemId, gridPos] of itemPositions.entries()) {
      const item = suppliesStore.getItemById(itemId)
      const itemType = item?.stats?.itemType || ''
      const itemIdLower = itemId.toLowerCase()

      const isBed =
        itemType === 'bed' ||
        itemIdLower.includes('bed') ||
        itemIdLower.includes('sleeping')

      if (isBed) {
        return {
          position: movement3DStore.gridToWorld(gridPos.x, gridPos.y),
          itemId,
          isBed: true,
          isShelter: false
        }
      }
    }

    // Second priority: Find a shelter (igloo, hideout)
    const shelter = findShelterPosition()
    if (shelter) {
      return {
        position: shelter.entrancePosition,
        entrancePosition: shelter.entrancePosition,
        itemId: shelter.itemId,
        isBed: false,
        isShelter: true
      }
    }

    // No bed or shelter found - will sleep in place
    return null
  }

  /**
   * Calculate sleep quality multiplier based on sleep location
   */
  function calculateSleepQuality(itemId: string | null): number {
    if (!itemId) return 1.0 // Floor sleeping

    let quality = 1.35 // Base item bonus

    const itemIdLower = itemId.toLowerCase()

    // Shelter synergy bonus
    if (
      itemIdLower.includes('shelter') ||
      itemIdLower.includes('igloo') ||
      itemIdLower.includes('hideout') ||
      itemIdLower.includes('tunnel')
    ) {
      quality += 0.30
    }

    // Bed preference bonus (beds are optimal for sleep)
    if (itemIdLower.includes('bed') || itemIdLower.includes('sleeping')) {
      quality += 0.20
    }

    return quality // Max: 1.85x
  }

  /**
   * Calculate sleep duration based on energy level
   */
  function calculateSleepDuration(energyLevel: number): number {
    const baseDuration = DURATIONS.sleep

    let multiplier = 1.2
    if (energyLevel < 20) {
      multiplier = 2.0 // Very tired = longer sleep
    } else if (energyLevel < 40) {
      multiplier = 1.5
    }

    return Math.min(baseDuration * multiplier, 15000) // Max 15 seconds
  }

  /**
   * Find the position of a toy (ball or small toy) in world coordinates
   * Returns the toy position and its item ID for physics interaction
   */
  function findToyPosition(): { position: Vector3D; itemId: string } | null {
    const itemPositions = habitatConditions.itemPositions

    // Find toy items (ball, toy)
    for (const [itemId, gridPos] of itemPositions.entries()) {
      const item = suppliesStore.getItemById(itemId)
      const itemIdLower = itemId.toLowerCase()
      const subCategory = item?.subCategory

      // Check if it's a toy by subCategory or ID
      const isToy =
        subCategory === 'toys' ||
        itemIdLower.includes('ball') ||
        itemIdLower.includes('toy')

      if (isToy) {
        return {
          position: movement3DStore.gridToWorld(gridPos.x, gridPos.y),
          itemId
        }
      }
    }

    return null
  }

  /**
   * Find the position of a chew item (stick, chew toy) in world coordinates
   * Returns the chew item position and its item ID for physics interaction
   */
  function findChewItemPosition(): { position: Vector3D; itemId: string } | null {
    const itemPositions = habitatConditions.itemPositions

    // Find chew items (sticks, chews)
    for (const [itemId, gridPos] of itemPositions.entries()) {
      const item = suppliesStore.getItemById(itemId)
      const itemIdLower = itemId.toLowerCase()
      const subCategory = item?.subCategory

      // Check if it's a chew item by subCategory or ID
      const isChew =
        subCategory === 'chews' ||
        itemIdLower.includes('stick') ||
        itemIdLower.includes('chew')

      if (isChew) {
        return {
          position: movement3DStore.gridToWorld(gridPos.x, gridPos.y),
          itemId
        }
      }
    }

    return null
  }

  /**
   * Select the highest priority behavior goal (2D pattern)
   */
  function selectBehaviorGoal(): Behavior3DGoal | null {
    const gp = getGuineaPig()
    if (!gp) return null

    const needs = gp.needs
    const goals: Behavior3DGoal[] = []

    // CRITICAL NEEDS (Priority 80-100)

    // Hunger < threshold
    if (needs.hunger < THRESHOLDS.hunger && !isOnCooldown('eat')) {
      const target = findFoodSourcePosition()
      if (target) {
        goals.push({
          type: 'eat',
          target: target.position,
          targetItemId: target.itemId,
          sourceType: target.sourceType,
          priority: calculateNeedPriority(needs.hunger, THRESHOLDS.hunger, 100),
          estimatedDuration: DURATIONS.eat,
          needSatisfied: 'hunger'
        })
      }
    }

    // Thirst < threshold
    if (needs.thirst < THRESHOLDS.thirst && !isOnCooldown('drink')) {
      const target = findWaterBottlePosition()
      if (target) {
        goals.push({
          type: 'drink',
          target: target.position,
          targetItemId: target.itemId,
          priority: calculateNeedPriority(needs.thirst, THRESHOLDS.thirst, 100),
          estimatedDuration: DURATIONS.drink,
          needSatisfied: 'thirst'
        })
      }
    }

    // MODERATE NEEDS (Priority 40-70)

    // Shelter < threshold
    if (needs.shelter < THRESHOLDS.shelter && !isOnCooldown('seek_shelter')) {
      const shelter = findShelterPosition()
      if (shelter) {
        goals.push({
          type: 'seek_shelter',
          target: shelter.entrancePosition,
          targetItemId: shelter.itemId,
          priority: calculateNeedPriority(needs.shelter, THRESHOLDS.shelter, 70),
          estimatedDuration: DURATIONS.seek_shelter,
          needSatisfied: 'shelter'
        })
      }
    }

    // Energy < threshold (sleep)
    if (needs.energy < THRESHOLDS.energy && !isOnCooldown('sleep')) {
      const sleepLocation = findSleepPosition()
      goals.push({
        type: 'sleep',
        target: sleepLocation?.position ?? null,
        targetItemId: sleepLocation?.itemId ?? undefined,
        priority: calculateNeedPriority(needs.energy, THRESHOLDS.energy, 80),
        estimatedDuration: calculateSleepDuration(needs.energy),
        needSatisfied: 'energy'
      })
    }

    // Hygiene < threshold (groom in place)
    if (needs.hygiene < THRESHOLDS.hygiene && !isOnCooldown('groom')) {
      goals.push({
        type: 'groom',
        target: null, // Groom in place, no movement needed
        priority: calculateNeedPriority(needs.hygiene, THRESHOLDS.hygiene, 50),
        estimatedDuration: DURATIONS.groom,
        needSatisfied: 'hygiene'
      })
    }

    // Play < threshold (play with toys)
    if (needs.play < THRESHOLDS.play && !isOnCooldown('play')) {
      const toy = findToyPosition()
      if (toy) {
        goals.push({
          type: 'play',
          target: toy.position,
          targetItemId: toy.itemId,
          priority: calculateNeedPriority(needs.play, THRESHOLDS.play, 60),
          estimatedDuration: DURATIONS.play,
          needSatisfied: 'play'
        })
      }
    }

    // Chew < threshold (chew on items)
    if (needs.chew < THRESHOLDS.chew && !isOnCooldown('chew')) {
      const chewItem = findChewItemPosition()
      if (chewItem) {
        goals.push({
          type: 'chew',
          target: chewItem.position,
          targetItemId: chewItem.itemId,
          priority: calculateNeedPriority(needs.chew, THRESHOLDS.chew, 55),
          estimatedDuration: DURATIONS.chew,
          needSatisfied: 'chew'
        })
      }
    }

    // Social < threshold (socialize with companion)
    if (needs.social < THRESHOLDS.social && !isOnCooldown('socialize')) {
      const bonds = guineaPigStore.getAllBonds()

      if (bonds.length > 0) {
        // Get a partner to socialize with (prioritize by bonding level)
        const sortedBonds = bonds.sort((a, b) => b.bondingLevel - a.bondingLevel)
        const topBond = sortedBonds[0]
        const partnerId = topBond.guineaPig1Id === guineaPigId ? topBond.guineaPig2Id : topBond.guineaPig1Id

        goals.push({
          type: 'socialize',
          target: null, // Will be determined by partner position
          priority: calculateNeedPriority(needs.social, THRESHOLDS.social, 50),
          estimatedDuration: 8000, // ~8 seconds for social interaction
          needSatisfied: 'social',
          socialMetadata: { partnerId, bondId: topBond.id }
        })
      }
    }

    // LOW PRIORITY (Priority 20-30)

    // Wandering when content
    if (!isOnCooldown('wander')) {
      goals.push({
        type: 'wander',
        target: null,
        priority: 25,
        estimatedDuration: 5000
      })
    }

    // Sort by priority (highest first)
    goals.sort((a, b) => b.priority - a.priority)

    // Add natural variation: if top goals within 15 priority points, pick randomly
    if (goals.length > 0) {
      const topPriority = goals[0].priority
      const topGoals = goals.filter(g => g.priority >= topPriority - 15)

      if (topGoals.length > 1) {
        return topGoals[Math.floor(Math.random() * topGoals.length)]
      }

      return goals[0]
    }

    return null
  }

  /**
   * Execute a behavior goal
   */
  function executeBehavior(goal: Behavior3DGoal): void {
    currentGoal.value = goal

    switch (goal.type) {
      case 'eat':
        executeEatBehavior(goal)
        break
      case 'drink':
        executeDrinkBehavior(goal)
        break
      case 'seek_shelter':
        executeShelterBehavior(goal)
        break
      case 'sleep':
        executeSleepBehavior(goal)
        break
      case 'groom':
        executeGroomBehavior()
        break
      case 'play':
        executePlayBehavior(goal)
        break
      case 'chew':
        executeChewBehavior(goal)
        break
      case 'socialize':
        executeSocializeBehavior(goal)
        break
      case 'wander':
        executeWanderBehavior()
        break
    }
  }

  /**
   * Execute eat behavior
   */
  function executeEatBehavior(goal: Behavior3DGoal): void {
    if (!goal.target) return

    currentActivity.value = 'walking'
    console.log(`[Behavior3D] Guinea pig ${guineaPigId} hungry, seeking food`)

    movement.moveTo(goal.target)
    movement.onArrival(() => {
      startEating()
    })
  }

  /**
   * Start eating at food bowl
   */
  function startEating(): void {
    currentActivity.value = 'eating'
    console.log(`[Behavior3D] Guinea pig ${guineaPigId} started eating`)

    if (onEatingStartCallback) {
      onEatingStartCallback()
    }

    actionTimeout = window.setTimeout(() => {
      finishEating()
    }, DURATIONS.eat)
  }

  /**
   * Finish eating and restore hunger
   */
  function finishEating(): void {
    // Save goal info before clearing (need it for food consumption)
    const targetItemId = currentGoal.value?.targetItemId
    const sourceType = currentGoal.value?.sourceType

    currentActivity.value = 'idle'
    currentGoal.value = null

    // Consume food from the appropriate container
    if (targetItemId && sourceType) {
      if (sourceType === 'food_bowl') {
        // Remove first food item from bowl
        habitatConditions.removeFoodFromBowl(targetItemId, 0)
        console.log(`[Behavior3D] Guinea pig ${guineaPigId} consumed food from bowl ${targetItemId}`)
      } else if (sourceType === 'hay_rack') {
        // Remove first hay serving from rack
        habitatConditions.removeHayFromRack(targetItemId, 0)
        console.log(`[Behavior3D] Guinea pig ${guineaPigId} consumed hay from rack ${targetItemId}`)
      }
    }

    guineaPigStore.satisfyNeed(guineaPigId, 'hunger', RESTORE_AMOUNTS.hunger)
    setCooldown('eat', COOLDOWNS.eat)

    // Log activity
    const gp = getGuineaPig()
    const gpName = gp?.name || 'Guinea pig'
    const foodType = sourceType === 'hay_rack' ? 'hay' : 'food'
    const emoji = sourceType === 'hay_rack' ? '🌾' : '🥗'
    loggingStore.addAutonomousBehavior(
      `${gpName} finished eating ${foodType}`,
      emoji,
      { guineaPigId, behavior: 'eating' }
    )

    if (onEatingEndCallback) {
      onEatingEndCallback()
    }

    console.log(`[Behavior3D] Guinea pig ${guineaPigId} finished eating`)

    // Trigger next behavior tick
    tick()
  }

  /**
   * Execute drink behavior
   */
  function executeDrinkBehavior(goal: Behavior3DGoal): void {
    if (!goal.target) return

    currentActivity.value = 'walking'
    console.log(`[Behavior3D] Guinea pig ${guineaPigId} thirsty, seeking water`)

    movement.moveTo(goal.target)
    movement.onArrival(() => {
      startDrinking()
    })
  }

  /**
   * Start drinking at water bottle
   */
  function startDrinking(): void {
    currentActivity.value = 'drinking'
    console.log(`[Behavior3D] Guinea pig ${guineaPigId} started drinking`)

    if (onDrinkingStartCallback) {
      onDrinkingStartCallback()
    }

    actionTimeout = window.setTimeout(() => {
      finishDrinking()
    }, DURATIONS.drink)
  }

  /**
   * Finish drinking and restore thirst
   */
  function finishDrinking(): void {
    currentActivity.value = 'idle'
    currentGoal.value = null

    // Consume water from bottle
    habitatConditions.consumeWater()

    guineaPigStore.satisfyNeed(guineaPigId, 'thirst', RESTORE_AMOUNTS.thirst)
    setCooldown('drink', COOLDOWNS.drink)

    // Log activity
    const gp = getGuineaPig()
    const gpName = gp?.name || 'Guinea pig'
    loggingStore.addAutonomousBehavior(
      `${gpName} finished drinking water`,
      '💧',
      { guineaPigId, behavior: 'drinking' }
    )

    if (onDrinkingEndCallback) {
      onDrinkingEndCallback()
    }

    console.log(`[Behavior3D] Guinea pig ${guineaPigId} finished drinking`)

    // Trigger next behavior tick
    tick()
  }

  /**
   * Execute wander behavior
   */
  function executeWanderBehavior(): void {
    currentActivity.value = 'walking'
    currentGoal.value = null

    const success = movement.wander()
    if (success) {
      setCooldown('wander', COOLDOWNS.wander)
      movement.onArrival(() => {
        currentActivity.value = 'idle'
      })
    } else {
      currentActivity.value = 'idle'
    }
  }

  // Groom callbacks
  let onGroomingStartCallback: (() => void) | null = null
  let onGroomingEndCallback: (() => void) | null = null

  /**
   * Execute groom behavior - guinea pig grooms itself in place
   * Personality cleanliness trait affects duration and restoration
   */
  function executeGroomBehavior(): void {
    currentActivity.value = 'grooming'
    console.log(`[Behavior3D] Guinea pig ${guineaPigId} started grooming`)

    // Get personality cleanliness trait for duration/restoration modifiers
    const gp = getGuineaPig()
    const cleanliness = gp?.personality?.cleanliness ?? 5 // Default to 5 if not set

    // Cleanliness 1-10 affects:
    // - Higher cleanliness = more thorough grooming = more hygiene restored
    // - Higher cleanliness = longer grooming sessions
    const cleanlinessMultiplier = 0.5 + (cleanliness / 20) // Range: 0.55 to 1.0
    const durationMultiplier = 0.7 + (cleanliness / 20) // Range: 0.75 to 1.2

    const adjustedDuration = Math.floor(DURATIONS.groom * durationMultiplier)

    if (onGroomingStartCallback) {
      onGroomingStartCallback()
    }

    actionTimeout = window.setTimeout(() => {
      finishGrooming(cleanlinessMultiplier)
    }, adjustedDuration)
  }

  /**
   * Finish grooming and restore hygiene
   */
  function finishGrooming(cleanlinessMultiplier: number): void {
    currentActivity.value = 'idle'
    currentGoal.value = null

    // Calculate hygiene restoration based on cleanliness personality
    // Base restoration: 15, personality range: ~8 to 15
    const hygieneRestored = Math.floor(RESTORE_AMOUNTS.hygiene * cleanlinessMultiplier)
    guineaPigStore.satisfyNeed(guineaPigId, 'hygiene', hygieneRestored)
    setCooldown('groom', COOLDOWNS.groom)

    // Log activity
    const gp = getGuineaPig()
    const gpName = gp?.name || 'Guinea pig'
    loggingStore.addAutonomousBehavior(
      `${gpName} finished grooming`,
      '✨',
      { guineaPigId, behavior: 'grooming' }
    )

    if (onGroomingEndCallback) {
      onGroomingEndCallback()
    }

    console.log(`[Behavior3D] Guinea pig ${guineaPigId} finished grooming (restored ${hygieneRestored} hygiene)`)

    // Trigger next behavior tick
    tick()
  }

  // Play callbacks and state
  let onPlayingStartCallback: ((toyPosition: Vector3D, toyItemId: string) => void) | null = null
  let onPlayingEndCallback: (() => void) | null = null
  let onHeadbuttCallback: ((toyItemId: string, direction: Vector3D) => void) | null = null
  let onPopcornStartCallback: (() => void) | null = null
  let onPopcornEndCallback: (() => void) | null = null
  let currentToyItemId: string | null = null

  /**
   * Execute play behavior - guinea pig plays with toy (ball, etc.)
   * Sequence: walk to toy -> shake animation -> headbutt -> toy rolls away
   */
  function executePlayBehavior(goal: Behavior3DGoal): void {
    if (!goal.target || !goal.targetItemId) return

    currentActivity.value = 'walking'
    currentToyItemId = goal.targetItemId
    console.log(`[Behavior3D] Guinea pig ${guineaPigId} seeking toy to play with`)

    movement.moveTo(goal.target)
    movement.onArrival(() => {
      startPlaying(goal.target!, goal.targetItemId!)
    })
  }

  /**
   * Start playing with toy - shake animation then headbutt
   */
  function startPlaying(toyPosition: Vector3D, toyItemId: string): void {
    currentActivity.value = 'playing'
    console.log(`[Behavior3D] Guinea pig ${guineaPigId} started playing with toy`)

    if (onPlayingStartCallback) {
      onPlayingStartCallback(toyPosition, toyItemId)
    }

    // Play sequence: shake for 3 seconds, then headbutt
    actionTimeout = window.setTimeout(() => {
      // Headbutt the toy!
      performHeadbutt(toyItemId)
    }, 3000) // 3 seconds of shaking/playing
  }

  /**
   * Perform headbutt - push toy with physics
   */
  function performHeadbutt(toyItemId: string): void {
    console.log(`[Behavior3D] Guinea pig ${guineaPigId} headbutting toy!`)

    // Get current guinea pig position and facing direction
    const state = movement3DStore.getGuineaPigState(guineaPigId)
    if (state) {
      // Calculate push direction (forward from guinea pig's facing)
      const pushDirection: Vector3D = {
        x: Math.sin(state.rotation) * 0.8,
        y: 0,
        z: Math.cos(state.rotation) * 0.8
      }

      if (onHeadbuttCallback) {
        onHeadbuttCallback(toyItemId, pushDirection)
      }
    }

    // Wait for headbutt animation, then finish
    actionTimeout = window.setTimeout(() => {
      finishPlaying()
    }, 1500) // 1.5 seconds for headbutt
  }

  /**
   * Finish playing and start popcorning (happy jump)
   */
  function finishPlaying(): void {
    guineaPigStore.satisfyNeed(guineaPigId, 'play', RESTORE_AMOUNTS.play)
    setCooldown('play', COOLDOWNS.play)

    // Log activity
    const gp = getGuineaPig()
    const gpName = gp?.name || 'Guinea pig'
    const toyName = currentToyItemId?.replace(/_/g, ' ').replace(/^habitat\s+/, '') || 'a toy'
    loggingStore.addAutonomousBehavior(
      `${gpName} had fun playing with ${toyName}`,
      '🎾',
      { guineaPigId, behavior: 'playing' }
    )

    if (onPlayingEndCallback) {
      onPlayingEndCallback()
    }

    console.log(`[Behavior3D] Guinea pig ${guineaPigId} finished playing, starting popcorn!`)
    currentToyItemId = null

    // Start popcorning (happy jump after playing)
    startPopcorning()
  }

  /**
   * Start popcorning - happy jump after playing
   */
  function startPopcorning(): void {
    currentActivity.value = 'popcorning'
    console.log(`[Behavior3D] Guinea pig ${guineaPigId} is popcorning!`)

    if (onPopcornStartCallback) {
      onPopcornStartCallback()
    }

    // Popcorn for 500ms then finish
    actionTimeout = window.setTimeout(() => {
      finishPopcorning()
    }, 500)
  }

  /**
   * Finish popcorning and return to idle
   */
  function finishPopcorning(): void {
    currentActivity.value = 'idle'
    currentGoal.value = null

    if (onPopcornEndCallback) {
      onPopcornEndCallback()
    }

    console.log(`[Behavior3D] Guinea pig ${guineaPigId} finished popcorning`)

    // Trigger next behavior tick
    tick()
  }

  // Chew callbacks and state
  let onChewingStartCallback: ((chewItemPosition: Vector3D, chewItemId: string) => void) | null = null
  let onChewingEndCallback: (() => void) | null = null
  let currentChewItemId: string | null = null

  /**
   * Execute chew behavior - guinea pig chews on a stick or chew item
   * Sequence: walk to item -> pick it up (pin to mouth) -> gnaw animation -> finish
   */
  function executeChewBehavior(goal: Behavior3DGoal): void {
    if (!goal.target || !goal.targetItemId) return

    currentActivity.value = 'walking'
    currentChewItemId = goal.targetItemId
    console.log(`[Behavior3D] Guinea pig ${guineaPigId} seeking chew item`)

    movement.moveTo(goal.target)
    movement.onArrival(() => {
      startChewing(goal.target!, goal.targetItemId!)
    })
  }

  /**
   * Start chewing on item - pin to mouth and gnaw animation
   */
  function startChewing(chewItemPosition: Vector3D, chewItemId: string): void {
    currentActivity.value = 'chewing'
    console.log(`[Behavior3D] Guinea pig ${guineaPigId} started chewing on ${chewItemId}`)

    if (onChewingStartCallback) {
      onChewingStartCallback(chewItemPosition, chewItemId)
    }

    // Chew for the full duration
    actionTimeout = window.setTimeout(() => {
      finishChewing()
    }, DURATIONS.chew)
  }

  /**
   * Finish chewing and restore chew need
   */
  function finishChewing(): void {
    currentActivity.value = 'idle'
    currentGoal.value = null

    // Degrade the chew item durability
    if (currentChewItemId) {
      // Initialize chew tracking if not already tracked
      if (!habitatContainers.getChewData(currentChewItemId)) {
        habitatContainers.initializeChewItem(currentChewItemId)
      }
      // Reduce durability
      habitatContainers.chewItem(currentChewItemId)
    }

    guineaPigStore.satisfyNeed(guineaPigId, 'chew', RESTORE_AMOUNTS.chew)
    setCooldown('chew', COOLDOWNS.chew)

    // Log activity
    const gp = getGuineaPig()
    const gpName = gp?.name || 'Guinea pig'
    const chewItemName = currentChewItemId?.replace(/_/g, ' ').replace(/^habitat\s+/, '') || 'a stick'
    loggingStore.addAutonomousBehavior(
      `${gpName} finished chewing on ${chewItemName}`,
      '🪵',
      { guineaPigId, behavior: 'chewing' }
    )

    if (onChewingEndCallback) {
      onChewingEndCallback()
    }

    console.log(`[Behavior3D] Guinea pig ${guineaPigId} finished chewing`)
    currentChewItemId = null

    // Trigger next behavior tick
    tick()
  }

  /**
   * Execute socialize behavior - guinea pig approaches companion when social need is low
   */
  function executeSocializeBehavior(goal: Behavior3DGoal): void {
    if (!goal.socialMetadata) {
      console.warn(`[Behavior3D] Social goal missing metadata for guinea pig ${guineaPigId}`)
      return
    }

    const { partnerId, bondId } = goal.socialMetadata

    currentActivity.value = 'socializing'
    console.log(`[Behavior3D] Guinea pig ${guineaPigId} initiating social interaction with ${partnerId}`)

    // Get guinea pig names for logging
    const gp = getGuineaPig()
    const gpName = gp?.name || 'Guinea pig'
    const partner = guineaPigStore.collection.guineaPigs[partnerId]
    const partnerName = partner?.name || 'companion'

    if (onSocializingStartCallback) {
      onSocializingStartCallback(partnerId)
    }

    // Execute the approach using 3D social actions
    // Note: We don't pass behavior controllers here since this is autonomous
    // (the guinea pig will pause itself via currentActivity state)
    socialActions.executeApproach(
      guineaPigId,
      partnerId,
      gpName,
      partnerName
    ).then(success => {
      finishSocializing(success, partnerId, bondId)
    }).catch(() => {
      finishSocializing(false, partnerId, bondId)
    })
  }

  /**
   * Finish socializing and restore social need
   */
  function finishSocializing(success: boolean, partnerId: string, bondId: string): void {
    currentActivity.value = 'idle'
    currentGoal.value = null

    if (success) {
      // Restore social need for this guinea pig
      guineaPigStore.satisfyNeed(guineaPigId, 'social', RESTORE_AMOUNTS.social)

      // Also slightly restore partner's social need
      guineaPigStore.satisfyNeed(partnerId, 'social', Math.floor(RESTORE_AMOUNTS.social * 0.7))

      // Increase bonding
      guineaPigStore.increaseBonding(
        bondId,
        1,
        'proximity',
        'Autonomous social approach'
      )

      // Log activity
      const gp = getGuineaPig()
      const gpName = gp?.name || 'Guinea pig'
      const partner = guineaPigStore.collection.guineaPigs[partnerId]
      const partnerName = partner?.name || 'companion'
      loggingStore.addAutonomousBehavior(
        `${gpName} socialized with ${partnerName}`,
        '🐹',
        { guineaPigId, behavior: 'socializing' }
      )

      console.log(`[Behavior3D] Guinea pig ${guineaPigId} finished socializing`)
    } else {
      console.log(`[Behavior3D] Guinea pig ${guineaPigId} social interaction failed`)
    }

    setCooldown('socialize', COOLDOWNS.socialize)

    if (onSocializingEndCallback) {
      onSocializingEndCallback()
    }

    // Trigger next behavior tick
    tick()
  }

  // Store shelter positions for exit animation
  let currentShelterCenter: Vector3D | null = null
  let currentShelterEntrance: Vector3D | null = null
  let shelterSide: 'left' | 'right' = 'left' // Which side of shelter this guinea pig uses

  /**
   * Check if another guinea pig is already inside the shelter
   * Returns true if another guinea pig is within shelter radius of center
   */
  function isAnotherGuineaPigInShelter(shelterCenter: Vector3D): boolean {
    const SHELTER_RADIUS = 3.5 // Igloo radius

    // Check all guinea pig positions
    for (const gp of guineaPigStore.activeGuineaPigs) {
      if (gp.id === guineaPigId) continue // Skip self

      const otherState = movement3DStore.getGuineaPigState(gp.id)
      if (!otherState) continue

      // Calculate distance from shelter center
      const dx = otherState.worldPosition.x - shelterCenter.x
      const dz = otherState.worldPosition.z - shelterCenter.z
      const distance = Math.sqrt(dx * dx + dz * dz)

      if (distance < SHELTER_RADIUS) {
        return true
      }
    }

    return false
  }

  /**
   * Get the position inside shelter with left/right offset
   */
  function getShelterSlotPosition(shelterCenter: Vector3D, side: 'left' | 'right'): Vector3D {
    const xOffset = side === 'left' ? -SHELTER_SIDE_OFFSET : SHELTER_SIDE_OFFSET
    return {
      x: shelterCenter.x + xOffset,
      y: 0,
      z: shelterCenter.z
    }
  }

  /**
   * Execute shelter behavior - guinea pig seeks shelter when shelter need is low
   */
  function executeShelterBehavior(goal: Behavior3DGoal): void {
    if (!goal.target) return

    currentActivity.value = 'walking'
    console.log(`[Behavior3D] Guinea pig ${guineaPigId} seeking shelter`)

    // Find and store shelter positions for the full animation sequence
    const shelter = findShelterPosition()
    if (shelter) {
      currentShelterCenter = shelter.shelterCenter
      currentShelterEntrance = shelter.entrancePosition
    }

    // Walk to entrance using pathfinding (avoids obstacles on the way)
    movement.moveTo(goal.target)
    movement.onArrival(() => {
      // Now at entrance, begin enter sequence
      enterShelter()
    })
  }

  /**
   * Enter the shelter - walk from entrance to center, then rotate to face entrance
   */
  async function enterShelter(): Promise<void> {
    if (!currentShelterCenter) {
      finishSheltering()
      return
    }

    currentActivity.value = 'sheltering'

    // Determine which side to use (left if first, right if another is already inside)
    shelterSide = isAnotherGuineaPigInShelter(currentShelterCenter) ? 'right' : 'left'
    const slotPosition = getShelterSlotPosition(currentShelterCenter, shelterSide)

    console.log(`[Behavior3D] Guinea pig ${guineaPigId} entering shelter (${shelterSide} side)`)

    // Walk directly into shelter slot position (bypass pathfinding - we're intentionally entering)
    movement.moveDirectTo(slotPosition)

    // Wait for arrival at center
    await new Promise<void>(resolve => {
      movement.onArrival(() => resolve())
    })

    // Rotate to face the entrance (+Z direction, which is rotation 0)
    // The guinea pig is facing -Z (toward center) so needs to turn around
    await movement.rotateTo(0, 600) // 0 radians = facing +Z

    console.log(`[Behavior3D] Guinea pig ${guineaPigId} settled in shelter`)

    // Notify external components
    if (onShelteringStartCallback) {
      onShelteringStartCallback(currentShelterCenter)
    }

    // Stay in shelter for duration, then exit
    actionTimeout = window.setTimeout(() => {
      exitShelter()
    }, DURATIONS.seek_shelter)
  }

  /**
   * Exit the shelter - walk from center to entrance
   */
  async function exitShelter(): Promise<void> {
    if (!currentShelterEntrance) {
      finishSheltering()
      return
    }

    console.log(`[Behavior3D] Guinea pig ${guineaPigId} exiting shelter`)

    // Walk directly out to entrance
    movement.moveDirectTo(currentShelterEntrance)

    // Wait for arrival at entrance
    await new Promise<void>(resolve => {
      movement.onArrival(() => resolve())
    })

    // Notify external components
    if (onShelteringEndCallback) {
      onShelteringEndCallback()
    }

    finishSheltering()
  }

  /**
   * Finish sheltering and restore shelter need
   */
  function finishSheltering(): void {
    currentActivity.value = 'idle'
    currentGoal.value = null

    guineaPigStore.satisfyNeed(guineaPigId, 'shelter', RESTORE_AMOUNTS.shelter)
    setCooldown('seek_shelter', COOLDOWNS.seek_shelter)

    // Also restore comfort slightly when sheltering
    guineaPigStore.satisfyNeed(guineaPigId, 'comfort', 15)

    // Log activity
    const gp = getGuineaPig()
    const gpName = gp?.name || 'Guinea pig'
    loggingStore.addAutonomousBehavior(
      `${gpName} left the shelter`,
      '🏠',
      { guineaPigId, behavior: 'sheltering' }
    )

    // Clear shelter positions
    currentShelterCenter = null
    currentShelterEntrance = null

    console.log(`[Behavior3D] Guinea pig ${guineaPigId} finished sheltering`)

    // Trigger next behavior tick
    tick()
  }

  // Store sleep location info for the sleep sequence
  let currentSleepLocation: {
    position: Vector3D
    entrancePosition?: Vector3D
    itemId: string | null
    isBed: boolean
    isShelter: boolean
  } | null = null
  let sleepQuality = 1.0

  // Callbacks for sleep
  let onSleepingStartCallback: ((position: Vector3D) => void) | null = null
  let onSleepingEndCallback: (() => void) | null = null

  /**
   * Execute sleep behavior - guinea pig seeks sleep when energy is low
   */
  function executeSleepBehavior(goal: Behavior3DGoal): void {
    currentActivity.value = 'walking'
    console.log(`[Behavior3D] Guinea pig ${guineaPigId} tired, seeking sleep`)

    // Find sleep location
    currentSleepLocation = findSleepPosition()
    sleepQuality = calculateSleepQuality(goal.targetItemId ?? null)

    if (!currentSleepLocation) {
      // Sleep in place (on the floor)
      console.log(`[Behavior3D] Guinea pig ${guineaPigId} will sleep on the floor`)
      startSleeping()
      return
    }

    if (currentSleepLocation.isShelter) {
      // Sleeping in shelter - use shelter entry animation
      const shelter = findShelterPosition()
      if (shelter) {
        currentShelterCenter = shelter.shelterCenter
        currentShelterEntrance = shelter.entrancePosition
      }
      movement.moveTo(currentSleepLocation.position)
      movement.onArrival(() => {
        enterShelterForSleep()
      })
    } else {
      // Sleeping in bed - just walk to it
      movement.moveTo(currentSleepLocation.position)
      movement.onArrival(() => {
        startSleeping()
      })
    }
  }

  /**
   * Enter shelter for sleeping - reuses shelter animation sequence
   */
  async function enterShelterForSleep(): Promise<void> {
    if (!currentShelterCenter) {
      startSleeping()
      return
    }

    // Determine which side to use (left if first, right if another is already inside)
    shelterSide = isAnotherGuineaPigInShelter(currentShelterCenter) ? 'right' : 'left'
    const slotPosition = getShelterSlotPosition(currentShelterCenter, shelterSide)

    console.log(`[Behavior3D] Guinea pig ${guineaPigId} entering shelter to sleep (${shelterSide} side)`)

    // Walk directly into shelter slot position (bypass pathfinding)
    movement.moveDirectTo(slotPosition)

    // Wait for arrival at center
    await new Promise<void>(resolve => {
      movement.onArrival(() => resolve())
    })

    // Rotate to face the entrance
    await movement.rotateTo(0, 600)

    // Now start sleeping
    startSleeping()
  }

  /**
   * Start sleeping at current location
   */
  function startSleeping(): void {
    currentActivity.value = 'sleeping'
    const gp = getGuineaPig()
    const sleepDuration = gp ? calculateSleepDuration(gp.needs.energy) : DURATIONS.sleep

    console.log(`[Behavior3D] Guinea pig ${guineaPigId} started sleeping for ${sleepDuration}ms`)

    // Get current position for callback
    const state = movement3DStore.getGuineaPigState(guineaPigId)
    const sleepPosition = state?.worldPosition ?? { x: 0, y: 0, z: 0 }

    if (onSleepingStartCallback) {
      onSleepingStartCallback(sleepPosition)
    }

    actionTimeout = window.setTimeout(() => {
      finishSleeping()
    }, sleepDuration)
  }

  /**
   * Finish sleeping and restore energy
   */
  async function finishSleeping(): Promise<void> {
    console.log(`[Behavior3D] Guinea pig ${guineaPigId} waking up`)

    // If sleeping in shelter, exit first
    if (currentSleepLocation?.isShelter && currentShelterEntrance) {
      // Walk directly out to entrance
      movement.moveDirectTo(currentShelterEntrance)

      // Wait for arrival at entrance
      await new Promise<void>(resolve => {
        movement.onArrival(() => resolve())
      })
    }

    currentActivity.value = 'idle'
    currentGoal.value = null

    // Restore energy with quality multiplier
    const energyRestored = Math.floor(RESTORE_AMOUNTS.energy * sleepQuality)
    guineaPigStore.satisfyNeed(guineaPigId, 'energy', energyRestored)
    setCooldown('sleep', COOLDOWNS.sleep)

    // Log activity
    const gp = getGuineaPig()
    const gpName = gp?.name || 'Guinea pig'
    loggingStore.addAutonomousBehavior(
      `${gpName} woke up`,
      '😴',
      { guineaPigId, behavior: 'sleeping' }
    )

    console.log(`[Behavior3D] Guinea pig ${guineaPigId} finished sleeping (restored ${energyRestored} energy)`)

    if (onSleepingEndCallback) {
      onSleepingEndCallback()
    }

    // Clear sleep state
    currentSleepLocation = null
    currentShelterCenter = null
    currentShelterEntrance = null
    sleepQuality = 1.0

    // Trigger next behavior tick
    tick()
  }

  /**
   * Check and handle autonomous poop dropping
   */
  function checkAutonomousPooping(): void {
    const gp = getGuineaPig()
    if (!gp) return

    const timeSinceLastPoop = Date.now() - gp.lastPoopTime

    if (timeSinceLastPoop > POOP_INTERVAL_MS) {
      const state = movement3DStore.getGuineaPigState(guineaPigId)
      if (!state) return

      // Get world position directly for accurate 3D placement
      const worldX = state.worldPosition.x
      const worldZ = state.worldPosition.z

      // Calculate subgrid for 2D backward compatibility
      const gridPos = movement3DStore.worldToGrid(worldX, worldZ)
      const subgridX = gridPos.col * SUBGRID_SCALE
      const subgridY = gridPos.row * SUBGRID_SCALE

      // Pass both subgrid AND world coordinates
      habitatConditions.addPoop(subgridX, subgridY, worldX, worldZ)

      // Log activity
      const gpName = gp.name || 'Guinea pig'
      loggingStore.addEnvironmentalEvent(
        `${gpName} pooped`,
        '💩',
        { guineaPigId }
      )

      // Random offset to desync multiple guinea pigs
      const randomOffset = -Math.random() * 10000
      gp.lastPoopTime = Date.now() + randomOffset

      console.log(`[Behavior3D] Guinea pig ${guineaPigId} pooped at world (${worldX.toFixed(2)}, ${worldZ.toFixed(2)})`)
    }
  }

  /**
   * Main behavior tick - decides what the guinea pig should do
   */
  function tick(): void {
    // Don't tick if game is paused
    if (!gameController.isGameActive) {
      return
    }

    // Check for autonomous pooping
    checkAutonomousPooping()

    // Don't interrupt active behaviors (eating, drinking, sheltering, sleeping, grooming, playing, chewing, popcorning)
    if (currentActivity.value === 'eating' || currentActivity.value === 'drinking' || currentActivity.value === 'sheltering' || currentActivity.value === 'sleeping' || currentActivity.value === 'grooming' || currentActivity.value === 'playing' || currentActivity.value === 'chewing' || currentActivity.value === 'popcorning' || currentActivity.value === 'socializing') {
      return
    }

    // Get movement state
    const state = movement3DStore.getGuineaPigState(guineaPigId)
    if (!state) {
      console.warn(`[Behavior3D] Guinea pig ${guineaPigId} has no movement state`)
      return
    }

    // If already moving, wait for arrival
    if (state.isMoving) {
      return
    }

    // Select and execute highest priority behavior
    const goal = selectBehaviorGoal()
    if (goal) {
      executeBehavior(goal)
    }
  }

  /**
   * Start the behavior loop
   */
  function start(): void {
    if (behaviorInterval !== null) {
      console.warn(`[Behavior3D] Behavior already running for ${guineaPigId}`)
      return
    }

    console.log(`[Behavior3D] Starting behavior loop for guinea pig ${guineaPigId}`)

    // Run first tick immediately
    tick()

    // Start interval for subsequent ticks
    behaviorInterval = window.setInterval(tick, BEHAVIOR_TICK_INTERVAL)
  }

  /**
   * Stop the behavior loop
   */
  function stop(): void {
    console.log(`[Behavior3D] Stopping behavior loop for guinea pig ${guineaPigId}`)

    if (behaviorInterval !== null) {
      clearInterval(behaviorInterval)
      behaviorInterval = null
    }

    if (actionTimeout !== null) {
      clearTimeout(actionTimeout)
      actionTimeout = null
    }

    currentActivity.value = 'idle'
    currentGoal.value = null

    movement.cleanup()
  }

  /**
   * Pause behavior (for game pause or Take Control mode)
   */
  function pause(): void {
    movement.pauseMovement()
  }

  /**
   * Resume behavior (after game resume)
   */
  function resume(): void {
    movement.resumeMovement()
  }

  /**
   * Set callback for when drinking starts (for bubble animation)
   */
  function onDrinkingStart(callback: () => void): void {
    onDrinkingStartCallback = callback
  }

  /**
   * Set callback for when drinking ends
   */
  function onDrinkingEnd(callback: () => void): void {
    onDrinkingEndCallback = callback
  }

  /**
   * Set callback for when eating starts
   */
  function onEatingStart(callback: () => void): void {
    onEatingStartCallback = callback
  }

  /**
   * Set callback for when eating ends
   */
  function onEatingEnd(callback: () => void): void {
    onEatingEndCallback = callback
  }

  /**
   * Set callback for when sheltering starts (to hide guinea pig in igloo)
   */
  function onShelteringStart(callback: (shelterPosition: Vector3D) => void): void {
    onShelteringStartCallback = callback
  }

  /**
   * Set callback for when sheltering ends (to show guinea pig again)
   */
  function onShelteringEnd(callback: () => void): void {
    onShelteringEndCallback = callback
  }

  /**
   * Set callback for when sleeping starts (for sleep pose animation)
   */
  function onSleepingStart(callback: (position: Vector3D) => void): void {
    onSleepingStartCallback = callback
  }

  /**
   * Set callback for when sleeping ends (to resume normal pose)
   */
  function onSleepingEnd(callback: () => void): void {
    onSleepingEndCallback = callback
  }

  /**
   * Set callback for when grooming starts (for groom animation)
   */
  function onGroomingStart(callback: () => void): void {
    onGroomingStartCallback = callback
  }

  /**
   * Set callback for when grooming ends (to resume normal pose)
   */
  function onGroomingEnd(callback: () => void): void {
    onGroomingEndCallback = callback
  }

  /**
   * Set callback for when playing starts (for play animation)
   */
  function onPlayingStart(callback: (toyPosition: Vector3D, toyItemId: string) => void): void {
    onPlayingStartCallback = callback
  }

  /**
   * Set callback for when playing ends (to resume normal pose)
   */
  function onPlayingEnd(callback: () => void): void {
    onPlayingEndCallback = callback
  }

  /**
   * Set callback for when headbutt occurs (to push toy with physics)
   */
  function onHeadbutt(callback: (toyItemId: string, direction: Vector3D) => void): void {
    onHeadbuttCallback = callback
  }

  /**
   * Set callback for when popcorning starts (happy jump animation)
   */
  function onPopcornStart(callback: () => void): void {
    onPopcornStartCallback = callback
  }

  /**
   * Set callback for when popcorning ends
   */
  function onPopcornEnd(callback: () => void): void {
    onPopcornEndCallback = callback
  }

  /**
   * Set callback for when chewing starts (for chew animation, item pinning)
   */
  function onChewingStart(callback: (chewItemPosition: Vector3D, chewItemId: string) => void): void {
    onChewingStartCallback = callback
  }

  /**
   * Set callback for when chewing ends (to resume normal pose, unpin item)
   */
  function onChewingEnd(callback: () => void): void {
    onChewingEndCallback = callback
  }

  /**
   * Set callback for when socializing starts (approaching companion)
   */
  function onSocializingStart(callback: (partnerId: string) => void): void {
    onSocializingStartCallback = callback
  }

  /**
   * Set callback for when socializing ends
   */
  function onSocializingEnd(callback: () => void): void {
    onSocializingEndCallback = callback
  }

  // Auto-cleanup on unmount
  onUnmounted(() => {
    stop()
  })

  return {
    start,
    stop,
    pause,
    resume,
    tick,
    currentActivity,
    currentGoal,
    onDrinkingStart,
    onDrinkingEnd,
    onEatingStart,
    onEatingEnd,
    onShelteringStart,
    onShelteringEnd,
    onSleepingStart,
    onSleepingEnd,
    onGroomingStart,
    onGroomingEnd,
    onPlayingStart,
    onPlayingEnd,
    onHeadbutt,
    onPopcornStart,
    onPopcornEnd,
    onChewingStart,
    onChewingEnd,
    onSocializingStart,
    onSocializingEnd
  }
}
