/**
 * System 19: Autonomous AI Behaviors
 * Core AI decision-making and behavior selection for guinea pigs
 */

import { computed } from 'vue'
import { useGuineaPigStore } from '../../stores/guineaPigStore'
import { useHabitatConditions } from '../../stores/habitatConditions'
import { useLoggingStore } from '../../stores/loggingStore'
import { useBehaviorStateStore } from '../../stores/behaviorStateStore'
import { useHabitatContainers } from '../../composables/useHabitatContainers'
import { useSuppliesStore } from '../../stores/suppliesStore'
import { useMovement } from './useMovement'
import { usePathfinding } from './usePathfinding'
import { useSocialBehaviors } from './useSocialBehaviors'
import { MessageGenerator } from '../../utils/messageGenerator'
import { detectNearbyLocation, gridToSubgridWithOffset } from '../../utils/locationDetection'
import { pausableDelay } from '../../utils/pausableTimer'
import type { NeedType } from '../../stores/guineaPigStore'
import type { GridPosition } from './usePathfinding'

export type BehaviorType =
  | 'eat'
  | 'eat_hay'
  | 'drink'
  | 'sleep'
  | 'wander'
  | 'groom'
  | 'seek_shelter'
  | 'chew'
  | 'play'
  | 'socialize'
  | 'popcorn'
  | 'zoomies'
  | 'watch_player'
  | 'hide'
  | 'idle'

export interface BehaviorGoal {
  type: BehaviorType
  target: GridPosition | null
  priority: number
  estimatedDuration: number // milliseconds
  needSatisfied?: NeedType
  targetItemId?: string
  metadata?: any // For social behaviors and other contextual data
}

export interface BehaviorState {
  currentGoal: BehaviorGoal | null
  currentActivity: 'idle' | 'walking' | 'eating' | 'drinking' | 'sleeping' | 'grooming' | 'hiding' | 'playing' | 'chewing' | 'interacting'
  activityStartTime: number
  lastDecisionTime: number
  behaviorCooldowns: Map<BehaviorType, number>
}

// Debug flags - set to false in production
const DEBUG_SOCIALIZE = false
const DEBUG_BEHAVIOR = false // Set to true to enable eat/hay behavior logging

// Environmental behavior intervals
const POOP_INTERVAL_MS = 30000 // 30 seconds - guinea pigs poop frequently for realism

// Default behavior thresholds (seek behavior when need drops below this %)
const DEFAULT_THRESHOLDS = {
  hunger: 70,  // Seek food when hunger < 70%
  thirst: 75,  // Seek water when thirst < 75%
  energy: 60,  // Sleep when energy < 60%
  hygiene: 40, // Groom when hygiene < 40%
  shelter: 50, // Seek shelter when shelter < 50%
  chew: 60,    // Use chew items when chew < 60%
  play: 55,    // Use toys when play < 55%
  social: 65   // Socialize with companion when social < 65%
}

export function useGuineaPigBehavior(guineaPigId: string) {
  const guineaPigStore = useGuineaPigStore()
  const habitatConditions = useHabitatConditions()
  const loggingStore = useLoggingStore()
  const behaviorStateStore = useBehaviorStateStore()
  const habitatContainers = useHabitatContainers()
  const suppliesStore = useSuppliesStore()
  const movement = useMovement(guineaPigId)
  const pathfinding = usePathfinding()
  const socialBehaviors = useSocialBehaviors()

  // Initialize centralized behavior state for this guinea pig
  behaviorStateStore.initializeBehaviorState(guineaPigId)

  // Use centralized behavior state instead of local ref
  const behaviorState = computed({
    get: () => behaviorStateStore.getBehaviorState(guineaPigId)!,
    set: (value) => behaviorStateStore.updateBehaviorState(guineaPigId, value)
  })

  const guineaPig = computed(() => guineaPigStore.getGuineaPig(guineaPigId))

  /**
   * Check if behavior is on cooldown
   */
  function isOnCooldown(behaviorType: BehaviorType): boolean {
    const cooldownEnd = behaviorState.value.behaviorCooldowns.get(behaviorType)
    if (!cooldownEnd) return false
    return Date.now() < cooldownEnd
  }

  /**
   * Set behavior cooldown
   */
  function setCooldown(behaviorType: BehaviorType, durationMs: number): void {
    behaviorState.value.behaviorCooldowns.set(behaviorType, Date.now() + durationMs)
  }

  /**
   * Calculate priority for a need-based behavior
   */
  function calculateNeedPriority(needValue: number, threshold: number, baseWeight: number): number {
    if (needValue >= threshold) return 0 // Need not urgent

    // Calculate urgency: lower need value = higher urgency
    const urgency = (threshold - needValue) / threshold // 0-1 scale
    return baseWeight * urgency
  }

  /**
   * Find nearest item by need type
   * @param needType - The need to satisfy
   * @param preferAnchor - If true, prefer anchor position over adjacent (e.g., sleep on top of shelter)
   */
  function findNearestItemForNeed(needType: NeedType, preferAnchor: boolean = false): { position: GridPosition; itemId: string } | null {
    const currentPos = movement.currentPosition.value
    const items = habitatConditions.habitatItems
    const itemPositions = habitatConditions.itemPositions

    // Map need types to item keywords
    const itemKeywords: Record<NeedType, string[]> = {
      hunger: ['bowl', 'dish', 'food'],
      thirst: ['water', 'bottle'],
      energy: ['bed', 'sleeping'], // Will use floor if no bed
      shelter: ['shelter', 'hideaway', 'igloo', 'house'],
      hygiene: [], // Self-groom, no item needed
      play: ['toy', 'tunnel'],
      social: [], // Handled separately
      comfort: ['bed', 'hideaway'],
      nails: [], // Player action
      chew: ['chew', 'wood']
    }

    const keywords = itemKeywords[needType] || []
    if (keywords.length === 0) return null

    let nearest: { position: GridPosition; itemId: string; distance: number } | null = null

    for (const itemId of items) {
      const position = itemPositions.get(itemId)
      if (!position) continue

      // Check if item matches need type by keyword OR subCategory
      let matchesNeed = keywords.some(keyword => itemId.toLowerCase().includes(keyword))

      // Special handling for play and chew needs - check subCategory
      if (!matchesNeed && (needType === 'play' || needType === 'chew')) {
        const item = suppliesStore.getItemById(itemId)
        if (needType === 'play' && item?.subCategory === 'toys') {
          matchesNeed = true
        } else if (needType === 'chew' && item?.subCategory === 'chews') {
          matchesNeed = true
        }
      }

      if (!matchesNeed) continue

      // Calculate Manhattan distance
      const distance = Math.abs(currentPos.row - position.y) + Math.abs(currentPos.col - position.x)

      if (!nearest || distance < nearest.distance) {
        nearest = {
          position: { row: position.y, col: position.x },
          itemId,
          distance
        }
      }
    }

    if (!nearest) return null

    const targetPos = nearest.position
    const itemId = nearest.itemId.toLowerCase()

    // Determine if this is a shelter/bed/tunnel item
    const isShelterLikeItem =
      itemId.includes('shelter') ||
      itemId.includes('hideaway') ||
      itemId.includes('igloo') ||
      itemId.includes('house') ||
      itemId.includes('bed') ||
      itemId.includes('sleeping') ||
      itemId.includes('tunnel')

    // For shelters/beds: positioning depends on use case
    // - preferAnchor=true: Sleep ON TOP of shelter (anchor position)
    // - preferAnchor=false: Hide INSIDE shelter (adjacent position)
    if (isShelterLikeItem && !preferAnchor) {
      // Check adjacent cells (including diagonals for better accessibility)
      const adjacentOffsets = [
        { row: -1, col: 0 }, { row: 1, col: 0 }, // up, down
        { row: 0, col: -1 }, { row: 0, col: 1 }, // left, right
        { row: -1, col: -1 }, { row: -1, col: 1 }, // diagonals
        { row: 1, col: -1 }, { row: 1, col: 1 }
      ]

      for (const offset of adjacentOffsets) {
        const adjacentPos = {
          row: targetPos.row + offset.row,
          col: targetPos.col + offset.col
        }

        // Check if position is valid (in bounds and not blocked)
        if (pathfinding.isValidPosition(adjacentPos)) {
          return { position: adjacentPos, itemId: nearest.itemId }
        }
      }

      // No valid adjacent cells found - shelter is completely blocked
      return null
    }

    // For shelters/beds with preferAnchor=true OR other items (bowls, bottles, etc)
    // Try anchor first, then adjacent
    if (pathfinding.isValidPosition(targetPos)) {
      return { position: targetPos, itemId: nearest.itemId }
    }

    // If anchor blocked, check adjacent cells (fallback for non-accessible anchors)
    const adjacentOffsets = [
      { row: -1, col: 0 }, { row: 1, col: 0 }, // up, down
      { row: 0, col: -1 }, { row: 0, col: 1 }, // left, right
      { row: -1, col: -1 }, { row: -1, col: 1 }, // diagonals
      { row: 1, col: -1 }, { row: 1, col: 1 }
    ]

    for (const offset of adjacentOffsets) {
      const adjacentPos = {
        row: targetPos.row + offset.row,
        col: targetPos.col + offset.col
      }

      // Check if position is valid (in bounds and not blocked)
      if (pathfinding.isValidPosition(adjacentPos)) {
        return { position: adjacentPos, itemId: nearest.itemId }
      }
    }

    // No valid position found - item is completely inaccessible
    return null
  }

  /**
   * Select highest priority behavior goal
   */
  function selectBehaviorGoal(thresholds = DEFAULT_THRESHOLDS): BehaviorGoal | null {
    const gp = guineaPig.value
    if (!gp) return null

    const needs = gp.needs
    const goals: BehaviorGoal[] = []

    // URGENT NEEDS (Priority 80-100)

    // Hunger < threshold - prioritize food bowls, but also consider hay racks
    if (needs.hunger < thresholds.hunger) {
      // Try food bowl first (only if it has food)
      if (!isOnCooldown('eat')) {
        const target = findNearestItemForNeed('hunger')
        if (target) {
          const bowlContents = habitatConditions.getBowlContents(target.itemId)
          // Only add eat goal if bowl has food
          if (bowlContents && bowlContents.length > 0) {
            goals.push({
              type: 'eat',
              target: target.position,
              targetItemId: target.itemId,
              priority: calculateNeedPriority(needs.hunger, thresholds.hunger, 100),
              estimatedDuration: 5000, // 5 seconds to eat
              needSatisfied: 'hunger'
            })
          }
        }
      }

      // Hay racks as secondary option (or primary if bowl is empty)
      if (!isOnCooldown('eat_hay')) {
        const hayRacks = habitatConditions.habitatItems.filter(id =>
          id.toLowerCase().includes('hay') && id.toLowerCase().includes('rack')
        )

        if (hayRacks.length > 0) {
          const hayRackId = hayRacks[0]
          const hayRackContents = habitatConditions.getHayRackContents(hayRackId)
          // Only add eat_hay goal if hay rack has hay
          if (hayRackContents && hayRackContents.length > 0) {
            const position = habitatConditions.itemPositions.get(hayRackId)
            if (position) {
              goals.push({
                type: 'eat_hay',
                target: { row: position.y, col: position.x },
                targetItemId: hayRackId,
                priority: calculateNeedPriority(needs.hunger, thresholds.hunger, 98), // High priority (same as bowl when bowl is empty)
                estimatedDuration: 6000, // 6 seconds to eat hay
                needSatisfied: 'hunger'
              })
            }
          }
        }
      }
    }

    // Thirst < threshold
    if (needs.thirst < thresholds.thirst && !isOnCooldown('drink')) {
      const target = findNearestItemForNeed('thirst')
      if (target) {
        goals.push({
          type: 'drink',
          target: target.position,
          targetItemId: target.itemId,
          priority: calculateNeedPriority(needs.thirst, thresholds.thirst, 100),
          estimatedDuration: 3000, // 3 seconds to drink
          needSatisfied: 'thirst'
        })
      }
    }

    // Energy < threshold (sleep) - Enhanced bed selection
    if (needs.energy < thresholds.energy && !isOnCooldown('sleep')) {
      // Try to find preferred bed/shelter first
      // preferAnchor=true: guinea pig sleeps ON TOP of shelter/bed
      const bed = findNearestItemForNeed('energy', true)
      const shelter = findNearestItemForNeed('shelter', true)

      // Prefer bed if available, otherwise use shelter, fallback to floor
      let target = bed || shelter
      let targetItemId = target?.itemId

      goals.push({
        type: 'sleep',
        target: target?.position || null, // Sleep at bed/shelter or in place
        targetItemId,
        priority: calculateNeedPriority(needs.energy, thresholds.energy, 80),
        estimatedDuration: 10000, // Base duration, actual varies by energy level
        needSatisfied: 'energy'
      })
    }

    // MODERATE NEEDS (Priority 40-70)

    // Shelter < threshold
    if (needs.shelter < thresholds.shelter && !isOnCooldown('seek_shelter')) {
      // preferAnchor=true: guinea pig goes ON TOP of shelter (same as sleep)
      const target = findNearestItemForNeed('shelter', true)
      if (target) {
        goals.push({
          type: 'seek_shelter',
          target: target.position,
          targetItemId: target.itemId,
          priority: calculateNeedPriority(needs.shelter, thresholds.shelter, 70),
          estimatedDuration: 8000, // 8 seconds in shelter
          needSatisfied: 'shelter'
        })
      }
    }

    // Hygiene < threshold (self-groom)
    if (needs.hygiene < thresholds.hygiene && !isOnCooldown('groom')) {
      goals.push({
        type: 'groom',
        target: null, // Groom in place
        priority: calculateNeedPriority(needs.hygiene, thresholds.hygiene, 50),
        estimatedDuration: 4000, // 4 seconds grooming
        needSatisfied: 'hygiene'
      })
    }

    // Chew < threshold (use chew items)
    if (needs.chew < thresholds.chew && !isOnCooldown('chew')) {
      const chewItem = findNearestItemForNeed('chew')
      if (chewItem) {
        goals.push({
          type: 'chew',
          target: chewItem.position,
          targetItemId: chewItem.itemId,
          priority: calculateNeedPriority(needs.chew, thresholds.chew, 75),
          estimatedDuration: 5000, // 5 seconds chewing
          needSatisfied: 'chew'
        })
      }
    }

    // Play < threshold (use toys)
    if (needs.play < thresholds.play && !isOnCooldown('play')) {
      const toy = findNearestItemForNeed('play')
      if (toy) {
        goals.push({
          type: 'play',
          target: toy.position,
          targetItemId: toy.itemId,
          priority: calculateNeedPriority(needs.play, thresholds.play, 75),
          estimatedDuration: 6000, // 6 seconds playing
          needSatisfied: 'play'
        })
      }
    }

    // System 21: Social < threshold (social behaviors with companion)
    if (needs.social < thresholds.social && !isOnCooldown('socialize')) {
      const guineaPigStore = useGuineaPigStore()
      const bonds = guineaPigStore.getAllBonds()

      if (bonds.length > 0) {
        // Get a partner to socialize with (prioritize by bonding level)
        const sortedBonds = bonds.sort((a, b) => b.bondingLevel - a.bondingLevel)
        const topBond = sortedBonds[0]
        const partnerId = topBond.guineaPig1Id === gp.id ? topBond.guineaPig2Id : topBond.guineaPig1Id

        goals.push({
          type: 'socialize',
          target: null, // Will be determined by social behavior type
          priority: calculateNeedPriority(needs.social, thresholds.social, 55),
          estimatedDuration: 8000, // 8 seconds for social interaction
          needSatisfied: 'social',
          metadata: { partnerId, bondId: topBond.id }
        })
      }
    }

    // FRIENDSHIP BEHAVIORS (Priority 15-50)

    // Check friendship level for spontaneous behaviors
    const friendship = gp.friendship || 50

    // High Friendship (70-100%): Spontaneous positive behaviors
    if (friendship >= 70) {
      // 5% chance to popcorn (excited jumps)
      if (Math.random() < 0.05 && !isOnCooldown('popcorn')) {
        goals.push({
          type: 'popcorn',
          target: null,
          priority: 50,
          estimatedDuration: 2000 // 2 seconds of popcorning
        })
      }

      // 3% chance for zoomies (excited running)
      if (Math.random() < 0.03 && !isOnCooldown('zoomies')) {
        goals.push({
          type: 'zoomies',
          target: null,
          priority: 45,
          estimatedDuration: 4000 // 4 seconds of zoomies
        })
      }

      // 8% chance to watch player lovingly
      if (Math.random() < 0.08 && !isOnCooldown('watch_player')) {
        goals.push({
          type: 'watch_player',
          target: null,
          priority: 35,
          estimatedDuration: 3000 // 3 seconds watching
        })
      }
    }

    // Medium Friendship (40-70%): Neutral curious behaviors
    else if (friendship >= 40) {
      // 5% chance to watch player
      if (Math.random() < 0.05 && !isOnCooldown('watch_player')) {
        goals.push({
          type: 'watch_player',
          target: null,
          priority: 30,
          estimatedDuration: 2000 // 2 seconds watching
        })
      }
    }

    // Low Friendship (0-40%): Avoidance behaviors
    else {
      // 10% chance to hide when friendship is low
      if (Math.random() < 0.10 && !isOnCooldown('hide')) {
        // preferAnchor=true: guinea pig goes ON TOP of shelter (same as sleep/seek_shelter)
        const shelter = findNearestItemForNeed('shelter', true)
        if (shelter) {
          goals.push({
            type: 'hide',
            target: shelter.position,
            targetItemId: shelter.itemId,
            priority: 55, // Higher priority when scared
            estimatedDuration: 5000 // 5 seconds hiding
          })
        }
      }
    }

    // LOW PRIORITY (Priority 10-30)

    // Wandering when content
    if (!isOnCooldown('wander')) {
      goals.push({
        type: 'wander',
        target: null, // Random destination
        priority: 25,
        estimatedDuration: 5000 // 5 seconds wandering
      })
    }

    // Sort by priority (highest first)
    goals.sort((a, b) => b.priority - a.priority)

    // Add natural variation: if top goals are within 15 priority points, pick randomly
    // This prevents identical guinea pigs from always making identical choices
    // Wider threshold (15 instead of 5) allows more behavioral variety
    if (goals.length > 0) {
      const topPriority = goals[0].priority
      const topGoals = goals.filter(g => g.priority >= topPriority - 15)

      if (topGoals.length > 1) {
        // Multiple similar-priority goals - pick randomly for natural variation
        return topGoals[Math.floor(Math.random() * topGoals.length)]
      }

      return goals[0]
    }

    return null
  }

  /**
   * Execute a behavior goal
   */
  async function executeBehavior(goal: BehaviorGoal): Promise<boolean> {
    const gp = guineaPig.value
    if (!gp) return false

    behaviorState.value.currentGoal = goal

    switch (goal.type) {
      case 'eat':
        return await executeEatBehavior(goal)

      case 'eat_hay':
        return await executeEatHayBehavior(goal)

      case 'drink':
        return await executeDrinkBehavior(goal)

      case 'sleep':
        return await executeSleepBehavior(goal)

      case 'wander':
        return await executeWanderBehavior()

      case 'groom':
        return await executeGroomBehavior(goal)

      case 'chew':
        return await executeChewBehavior(goal)

      case 'play':
        return await executePlayBehavior(goal)

      case 'socialize':
        return await executeSocializeBehavior(goal)

      case 'seek_shelter':
        return await executeShelterBehavior(goal)

      case 'popcorn':
        return await executePopcornBehavior(goal)

      case 'zoomies':
        return await executeZoomiesBehavior(goal)

      case 'watch_player':
        return await executeWatchPlayerBehavior(goal)

      case 'hide':
        return await executeHideBehavior(goal)

      default:
        return false
    }
  }

  /**
   * Execute eat behavior with preference-based food selection
   */
  async function executeEatBehavior(goal: BehaviorGoal): Promise<boolean> {
    if (DEBUG_BEHAVIOR) console.log('[executeEatBehavior] Starting eat behavior', { goal, guineaPigId })

    if (!goal.target) {
      if (DEBUG_BEHAVIOR) console.error('[executeEatBehavior] No target specified in goal')
      return false
    }
    if (!guineaPig.value) {
      if (DEBUG_BEHAVIOR) console.error('[executeEatBehavior] Guinea pig not found')
      return false
    }

    const currentPos = movement.currentPosition.value
    if (DEBUG_BEHAVIOR) {
      console.log('[executeEatBehavior] Guinea pig current position:', currentPos)
      console.log('[executeEatBehavior] Initiating movement to food bowl at', goal.target)
    }

    // Navigate to food bowl
    let success = false
    try {
      success = movement.moveTo(goal.target, { avoidOccupiedCells: true })
      if (DEBUG_BEHAVIOR) console.log('[executeEatBehavior] moveTo returned:', success)
    } catch (error) {
      if (DEBUG_BEHAVIOR) console.error('[executeEatBehavior] moveTo threw an error:', error)
      return false
    }

    if (!success) {
      if (DEBUG_BEHAVIOR) console.warn('[executeEatBehavior] Movement to food bowl FAILED - pathfinding could not find route from', currentPos, 'to', goal.target)
      return false
    }

    if (DEBUG_BEHAVIOR) console.log('[executeEatBehavior] Movement initiated successfully, waiting for arrival...')

    // Wait for arrival
    await new Promise<void>(resolve => {
      movement.onArrival(() => {
        if (DEBUG_BEHAVIOR) console.log('[executeEatBehavior] Arrived at food bowl!')
        resolve()
      })
    })

    // Select food from bowl based on preferences
    let hungerRestored = 40 // Base restoration (enough to get above 30% threshold)
    let foodQuality = 1.0 // Quality multiplier
    let eatenFoodName: string | undefined = undefined

    if (DEBUG_BEHAVIOR) console.log('[executeEatBehavior] Checking bowl contents for', goal.targetItemId)

    if (goal.targetItemId) {
      const bowlContents = habitatConditions.getBowlContents(goal.targetItemId)
      if (DEBUG_BEHAVIOR) console.log('[executeEatBehavior] Bowl contents:', bowlContents)

      if (bowlContents && bowlContents.length > 0) {
        // Find preferred food if available
        const preferredFood = bowlContents.find(food =>
          guineaPig.value!.preferences.favoriteFood.some(fav =>
            food.itemId.toLowerCase().includes(fav.toLowerCase())
          )
        )

        // Find disliked food
        const dislikedFood = bowlContents.find(food =>
          guineaPig.value!.preferences.dislikedFood.some(dislike =>
            food.itemId.toLowerCase().includes(dislike.toLowerCase())
          )
        )

        const selectedFood = preferredFood || bowlContents[0]
        eatenFoodName = selectedFood.name

        // Apply preference modifiers
        if (preferredFood) {
          foodQuality = 1.25 // +25% effectiveness for favorite foods
        } else if (dislikedFood && !preferredFood && bowlContents.length === 1) {
          foodQuality = 0.75 // -25% effectiveness for disliked foods
        }

        // Apply freshness modifier
        const freshness = selectedFood.freshness / 100
        foodQuality *= (0.5 + freshness * 0.5) // 50-100% based on freshness

        // Consume food from bowl (by index)
        const foodIndex = bowlContents.indexOf(selectedFood)
        if (foodIndex >= 0) {
          habitatConditions.removeFoodFromBowl(goal.targetItemId, foodIndex)
        }
      }
    }

    // Set eating state
    behaviorState.value.currentActivity = 'eating'
    behaviorState.value.activityStartTime = Date.now()

    // Show chat bubble for food preference
    if (goal.targetItemId) {
      const bowlContents = habitatConditions.getBowlContents(goal.targetItemId)
      if (bowlContents && bowlContents.length > 0) {
        const { guineaPigMessages } = await import('../../data/guineaPigMessages')

        // Determine preference level
        let preferenceLevel: 'favorite' | 'neutral' | 'disliked' = 'neutral'
        const selectedFood = bowlContents.find(food =>
          guineaPig.value!.preferences.favoriteFood.some(fav =>
            food.itemId.toLowerCase().includes(fav.toLowerCase())
          )
        ) || bowlContents[0]

        if (guineaPig.value!.preferences.favoriteFood.some(fav =>
          selectedFood.itemId.toLowerCase().includes(fav.toLowerCase())
        )) {
          preferenceLevel = 'favorite'
        } else if (guineaPig.value!.preferences.dislikedFood.some(dislike =>
          selectedFood.itemId.toLowerCase().includes(dislike.toLowerCase())
        )) {
          preferenceLevel = 'disliked'
        }

        // Select random message
        const messages = guineaPigMessages.autonomous.eating[preferenceLevel]
        const reaction = messages[Math.floor(Math.random() * messages.length)]

        // Dispatch chat bubble event
        const event = new CustomEvent('show-chat-bubble', {
          detail: {
            guineaPigId: guineaPig.value.id,
            reaction
          },
          bubbles: true
        })
        document.dispatchEvent(event)
      }
    }

    // Log to activity feed BEFORE eating starts (so message appears during activity)
    const msg = MessageGenerator.generateAutonomousEatMessage(guineaPig.value.name, eatenFoodName)
    loggingStore.addAutonomousBehavior(msg.message, msg.emoji)

    if (DEBUG_BEHAVIOR) console.log('[executeEatBehavior] Starting eating animation, duration:', goal.estimatedDuration)

    // Simulate eating duration
    await new Promise(resolve => setTimeout(resolve, goal.estimatedDuration))

    if (DEBUG_BEHAVIOR) console.log('[executeEatBehavior] Eating complete, restoring hunger')

    // Satisfy hunger need with quality multiplier
    if (guineaPig.value) {
      hungerRestored = Math.floor(hungerRestored * foodQuality)
      guineaPigStore.adjustNeed(guineaPigId, 'hunger', hungerRestored)

      if (DEBUG_BEHAVIOR) console.log('[executeEatBehavior] Restored', hungerRestored, 'hunger points')
    }

    // Set cooldown and return to idle
    setCooldown('eat', 60000) // 1 minute cooldown
    behaviorState.value.currentActivity = 'idle'
    behaviorState.value.currentGoal = null

    if (DEBUG_BEHAVIOR) console.log('[executeEatBehavior] Eat behavior completed successfully')

    return true
  }

  /**
   * Execute drink behavior
   */
  async function executeDrinkBehavior(goal: BehaviorGoal): Promise<boolean> {
    if (!goal.target) return false

    // Navigate to water bottle
    const success = movement.moveTo(goal.target, { avoidOccupiedCells: true })
    if (!success) return false

    // Wait for arrival
    await new Promise<void>(resolve => {
      movement.onArrival(() => resolve())
    })

    // Set drinking state
    behaviorState.value.currentActivity = 'drinking'
    behaviorState.value.activityStartTime = Date.now()

    // Log to activity feed BEFORE drinking starts
    if (guineaPig.value) {
      const msg = MessageGenerator.generateAutonomousDrinkMessage(guineaPig.value.name)
      loggingStore.addAutonomousBehavior(msg.message, msg.emoji)
    }

    // Simulate drinking duration
    await new Promise(resolve => setTimeout(resolve, goal.estimatedDuration))

    // Satisfy thirst need
    if (guineaPig.value) {
      guineaPigStore.adjustNeed(guineaPigId, 'thirst', 35) // Restore 35%
    }

    // Consume water from habitat
    if (goal.targetItemId) {
      habitatConditions.consumeWater(goal.targetItemId)
    }

    // Set cooldown and return to idle
    setCooldown('drink', 45000) // 45 second cooldown
    behaviorState.value.currentActivity = 'idle'
    behaviorState.value.currentGoal = null

    return true
  }

  /**
   * Execute sleep behavior with enhanced bed selection and quality mechanics
   */
  async function executeSleepBehavior(goal: BehaviorGoal): Promise<boolean> {
    if (!guineaPig.value) return false

    // Navigate to bed/shelter if target specified
    if (goal.target) {
      const success = movement.moveTo(goal.target, { avoidOccupiedCells: true })
      if (!success) {
        // Fall back to sleeping in place if can't reach bed
        goal.targetItemId = undefined
      } else {
        // Wait for arrival with timeout
        await new Promise<void>(resolve => {
          movement.onArrival(() => resolve())
          // Timeout after 10 seconds to prevent infinite waiting
          setTimeout(() => resolve(), 10000)
        })
      }
    }

    // Calculate sleep quality multiplier based on location
    let sleepQuality = 1.0 // Base quality (floor)

    if (goal.targetItemId) {
      // Sleeping in/near a bed or shelter - calculate bonuses
      const itemId = goal.targetItemId.toLowerCase()

      // Base bed effectiveness (1.25x - 1.5x depending on bed type)
      sleepQuality = 1.35

      // Preference bonus: +20% if this bed type is preferred
      const preferenceMatch = guineaPig.value.preferences.habitatPreference.some(pref =>
        itemId.includes(pref.toLowerCase())
      )
      if (preferenceMatch) {
        sleepQuality += 0.20
      }

      // Shelter synergy: +30% if bed is in/near shelter (enhances security)
      if (itemId.includes('shelter') || itemId.includes('tunnel') || itemId.includes('hideaway') || itemId.includes('igloo')) {
        sleepQuality += 0.30
      }
    }

    // Set sleeping state
    behaviorState.value.currentActivity = 'sleeping'
    behaviorState.value.activityStartTime = Date.now()

    // Log to activity feed BEFORE sleeping starts (with location)
    let location = 'a cozy spot'
    if (goal.targetItemId) {
      // Convert ID to readable name (e.g., "habitat_banana_bed" -> "banana bed")
      location = goal.targetItemId
        .replace(/_/g, ' ')
        .replace(/^habitat\s+/, '') // Remove "habitat " prefix
    }
    const msg = MessageGenerator.generateAutonomousSleepMessage(guineaPig.value.name, location)
    loggingStore.addAutonomousBehavior(msg.message, msg.emoji)

    // Calculate sleep duration based on energy level (lower energy = longer sleep)
    const energyLevel = guineaPig.value.needs.energy
    const baseDuration = 5000 // 5 seconds base (reduced for better UX)
    const durationMultiplier = energyLevel < 20 ? 2 : energyLevel < 40 ? 1.5 : 1.2
    const sleepDuration = Math.min(baseDuration * durationMultiplier, 15000) // Max 15 seconds

    // Sleep in interruptible chunks (check for cancellation frequently)
    const startTime = Date.now()
    const checkInterval = 250 // Check every 250ms for responsive cancellation

    while (Date.now() - startTime < sleepDuration) {
      // Check if behavior was cancelled
      if (behaviorState.value.currentGoal?.type !== 'sleep') {
        console.log('[Sleep] Interrupted by cancel')
        behaviorState.value.currentActivity = 'idle'
        return false
      }

      // Sleep for check interval or remaining time, whichever is shorter
      const remainingTime = sleepDuration - (Date.now() - startTime)
      const waitTime = Math.min(checkInterval, remainingTime)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }

    // Satisfy energy need with quality multiplier
    if (guineaPig.value) {
      const energyRestored = Math.floor(25 * sleepQuality)
      guineaPigStore.adjustNeed(guineaPigId, 'energy', energyRestored)
    }

    // System 24: Check for sleeping together bonding bonus
    if (guineaPig.value) {
      const myPosition = habitatConditions.getGuineaPigPosition(guineaPigId)
      if (myPosition) {
        // Find other guinea pigs at the same position
        const otherGuineaPigs = guineaPigStore.activeGuineaPigs.filter(gp => {
          if (gp.id === guineaPigId) return false
          const theirPosition = habitatConditions.getGuineaPigPosition(gp.id)
          return theirPosition && theirPosition.x === myPosition.x && theirPosition.y === myPosition.y
        })

        // For each companion at same position, increase bonding
        otherGuineaPigs.forEach(companion => {
          // Check if the companion is also sleeping
          const companionBehaviorState = behaviorStateStore.getBehaviorState(companion.id)
          if (companionBehaviorState?.currentActivity === 'sleeping') {
            // Find bond between these two guinea pigs
            const allBonds = guineaPigStore.getAllBonds()
            const bond = allBonds.find(b =>
              (b.guineaPig1Id === guineaPigId && b.guineaPig2Id === companion.id) ||
              (b.guineaPig1Id === companion.id && b.guineaPig2Id === guineaPigId)
            )

            if (bond) {
              // Increase bonding for sleeping together
              const bondingIncrease = 2 // Small but meaningful increase
              guineaPigStore.increaseBonding(
                bond.id,
                bondingIncrease,
                'interaction',
                `${guineaPig.value!.name} and ${companion.name} cuddled together while sleeping`
              )

              // Log to activity feed
              const cuddleMsg = `${guineaPig.value!.name} and ${companion.name} cuddle together in the ${location} 💕`
              loggingStore.addAutonomousBehavior(cuddleMsg, '💤')
            }
          }
        })
      }
    }

    // Set cooldown and return to idle
    setCooldown('sleep', 120000) // 2 minute cooldown
    behaviorState.value.currentActivity = 'idle'
    behaviorState.value.currentGoal = null

    return true
  }

  /**
   * Execute wander behavior
   */
  async function executeWanderBehavior(): Promise<boolean> {
    // Random wander
    const success = movement.wander({ maxDistance: 5 })
    if (!success) return false

    // Wait for arrival
    await new Promise<void>(resolve => {
      movement.onArrival(() => resolve())
      // Timeout after 10 seconds
      setTimeout(() => resolve(), 10000)
    })

    // Set cooldown
    setCooldown('wander', 10000) // 10 second cooldown
    behaviorState.value.currentGoal = null

    return true
  }

  /**
   * Execute groom behavior
   */
  async function executeGroomBehavior(goal: BehaviorGoal): Promise<boolean> {
    if (!guineaPig.value) return false

    // Set grooming state
    behaviorState.value.currentActivity = 'grooming'
    behaviorState.value.activityStartTime = Date.now()

    // Log to activity feed BEFORE grooming starts
    const msg = MessageGenerator.generateAutonomousGroomMessage(guineaPig.value.name)
    loggingStore.addAutonomousBehavior(msg.message, msg.emoji)

    // Personality affects grooming thoroughness and duration
    const cleanliness = guineaPig.value.personality.cleanliness

    // Cleanliness 1-10 affects:
    // - Higher cleanliness = more thorough grooming = more hygiene restored
    // - Higher cleanliness = longer grooming sessions
    const cleanlinessMultiplier = 0.5 + (cleanliness / 20) // Range: 0.55 to 1.0
    const durationMultiplier = 0.7 + (cleanliness / 20) // Range: 0.75 to 1.2

    // Adjust grooming duration based on personality
    const adjustedDuration = Math.floor(goal.estimatedDuration * durationMultiplier)

    // Simulate grooming duration
    await new Promise(resolve => setTimeout(resolve, adjustedDuration))

    // Calculate hygiene restoration based on cleanliness personality
    // Base restoration: 15%, personality range: 10.5% to 20%
    const hygieneRestored = Math.floor(15 * cleanlinessMultiplier)

    // Satisfy hygiene need with personality modifier
    guineaPigStore.adjustNeed(guineaPigId, 'hygiene', hygieneRestored)

    // Set cooldown and return to idle
    setCooldown('groom', 90000) // 90 second cooldown
    behaviorState.value.currentActivity = 'idle'
    behaviorState.value.currentGoal = null

    return true
  }

  /**
   * Execute eat hay behavior (from hay rack)
   */
  async function executeEatHayBehavior(goal: BehaviorGoal): Promise<boolean> {
    if (DEBUG_BEHAVIOR) console.log('[executeEatHayBehavior] Starting eat hay behavior', { goal, guineaPigId })

    if (!goal.target || !guineaPig.value) {
      if (DEBUG_BEHAVIOR) console.error('[executeEatHayBehavior] Missing target or guinea pig')
      return false
    }

    if (DEBUG_BEHAVIOR) console.log('[executeEatHayBehavior] Initiating movement to hay rack at', goal.target)

    // Navigate to hay rack
    const success = movement.moveTo(goal.target, { avoidOccupiedCells: true })
    if (!success) {
      if (DEBUG_BEHAVIOR) console.warn('[executeEatHayBehavior] Movement to hay rack FAILED')
      return false
    }

    if (DEBUG_BEHAVIOR) console.log('[executeEatHayBehavior] Movement initiated, waiting for arrival...')

    // Wait for arrival
    await new Promise<void>(resolve => {
      movement.onArrival(() => {
        if (DEBUG_BEHAVIOR) console.log('[executeEatHayBehavior] Arrived at hay rack!')
        resolve()
      })
    })

    if (DEBUG_BEHAVIOR) console.log('[executeEatHayBehavior] Checking hay rack contents')

    // Calculate hay quality based on freshness
    let hungerRestored = 35 // Base hay restoration (enough to get above 30% threshold, slightly less than food bowl)
    let hayQuality = 1.0

    if (goal.targetItemId) {
      const hayServings = habitatConditions.getHayRackContents(goal.targetItemId)
      if (DEBUG_BEHAVIOR) console.log('[executeEatHayBehavior] Hay servings:', hayServings)

      if (hayServings && hayServings.length > 0) {
        const freshness = habitatConditions.getHayRackFreshness(goal.targetItemId) / 100
        hayQuality = 0.6 + freshness * 0.4 // 60-100% based on freshness

        if (DEBUG_BEHAVIOR) console.log('[executeEatHayBehavior] Removing hay serving, freshness:', freshness)

        // Remove first hay serving from rack (index 0)
        habitatConditions.removeHayFromRack(goal.targetItemId, 0)
      } else {
        if (DEBUG_BEHAVIOR) console.warn('[executeEatHayBehavior] Hay rack is empty!')
      }
    }

    // Set eating state
    behaviorState.value.currentActivity = 'eating'
    behaviorState.value.activityStartTime = Date.now()

    // Show chat bubble for hay eating (check if hay is liked)
    if (guineaPig.value && goal.targetItemId) {
      const hayServings = habitatConditions.getHayRackContents(goal.targetItemId)
      if (hayServings && hayServings.length > 0) {
        const { guineaPigMessages } = await import('../../data/guineaPigMessages')

        // Check if hay is in favorite foods (could be Timothy hay, Orchard grass, etc.)
        const likesHay = guineaPig.value.preferences.favoriteFood.some(fav =>
          fav.toLowerCase().includes('hay') || fav.toLowerCase().includes('grass')
        )
        const dislikesHay = guineaPig.value.preferences.dislikedFood.some(dislike =>
          dislike.toLowerCase().includes('hay') || dislike.toLowerCase().includes('grass')
        )

        const preferenceLevel: 'favorite' | 'neutral' | 'disliked' =
          likesHay ? 'favorite' : dislikesHay ? 'disliked' : 'neutral'

        // Select random message
        const messages = guineaPigMessages.autonomous.eating[preferenceLevel]
        const reaction = messages[Math.floor(Math.random() * messages.length)]

        // Dispatch chat bubble event
        const event = new CustomEvent('show-chat-bubble', {
          detail: {
            guineaPigId: guineaPig.value.id,
            reaction
          },
          bubbles: true
        })
        document.dispatchEvent(event)
      }
    }

    // Log to activity feed BEFORE eating starts
    if (guineaPig.value) {
      const msg = MessageGenerator.generateAutonomousEatHayMessage(guineaPig.value.name)
      loggingStore.addAutonomousBehavior(msg.message, msg.emoji)
    }

    if (DEBUG_BEHAVIOR) console.log('[executeEatHayBehavior] Starting eating animation, duration:', goal.estimatedDuration)

    // Simulate eating duration
    await new Promise(resolve => setTimeout(resolve, goal.estimatedDuration))

    if (DEBUG_BEHAVIOR) console.log('[executeEatHayBehavior] Eating complete, restoring hunger')

    // Satisfy hunger need with quality multiplier
    if (guineaPig.value) {
      hungerRestored = Math.floor(hungerRestored * hayQuality)
      guineaPigStore.adjustNeed(guineaPigId, 'hunger', hungerRestored)

      if (DEBUG_BEHAVIOR) console.log('[executeEatHayBehavior] Restored', hungerRestored, 'hunger points')
    }

    // Set cooldown and return to idle
    setCooldown('eat_hay', 90000) // 90 second cooldown
    behaviorState.value.currentActivity = 'idle'
    behaviorState.value.currentGoal = null

    if (DEBUG_BEHAVIOR) console.log('[executeEatHayBehavior] Eat hay behavior completed successfully')

    return true
  }

  /**
   * Execute chew behavior (use chew items for dental health)
   */
  async function executeChewBehavior(goal: BehaviorGoal): Promise<boolean> {
    if (!goal.target || !guineaPig.value) return false

    // Navigate to chew item
    const success = movement.moveTo(goal.target, { avoidOccupiedCells: true })
    if (!success) return false

    // Wait for arrival
    await new Promise<void>(resolve => {
      movement.onArrival(() => resolve())
    })

    // Set chewing state with chomp animation
    behaviorState.value.currentActivity = 'chewing'
    behaviorState.value.activityStartTime = Date.now()

    // Show chat bubble for chewing activity (check if chewing is liked)
    if (guineaPig.value && goal.targetItemId) {
      const { guineaPigMessages } = await import('../../data/guineaPigMessages')

      // Check if chewing is in favorite activities
      const likesChewing = guineaPig.value.preferences.favoriteActivity.some(activity =>
        activity.toLowerCase().includes('chew')
      )

      const preferenceLevel: 'favorite' | 'neutral' = likesChewing ? 'favorite' : 'neutral'

      // Select random message
      const messages = guineaPigMessages.autonomous.activity[preferenceLevel]
      const reaction = messages[Math.floor(Math.random() * messages.length)]

      // Dispatch chat bubble event
      const event = new CustomEvent('show-chat-bubble', {
        detail: {
          guineaPigId: guineaPig.value.id,
          reaction
        },
        bubbles: true
      })
      document.dispatchEvent(event)
    }

    // Log to activity feed BEFORE chewing starts (with chew item name)
    if (guineaPig.value) {
      let chewItemName: string | undefined
      if (goal.targetItemId) {
        chewItemName = goal.targetItemId.replace(/_/g, ' ').replace(/^habitat\s+/, '')
      }
      const msg = MessageGenerator.generateAutonomousChewMessage(guineaPig.value.name, chewItemName)
      loggingStore.addAutonomousBehavior(msg.message, msg.emoji)
    }

    // Simulate chewing duration
    await new Promise(resolve => setTimeout(resolve, goal.estimatedDuration))

    // Use chew item durability system if chew item target is specified
    if (goal.targetItemId) {
      // Degrade the chew item durability
      habitatContainers.chewItem(goal.targetItemId)
    }

    // Satisfy chew need
    if (guineaPig.value) {
      guineaPigStore.adjustNeed(guineaPigId, 'chew', 30) // Restore 30%
    }

    // Set cooldown and return to idle
    setCooldown('chew', 120000) // 2 minute cooldown
    behaviorState.value.currentActivity = 'idle'
    behaviorState.value.currentGoal = null

    return true
  }

  /**
   * Execute play behavior (use toys for entertainment)
   */
  async function executePlayBehavior(goal: BehaviorGoal): Promise<boolean> {
    if (!goal.target || !guineaPig.value) return false

    // Navigate to toy
    const success = movement.moveTo(goal.target, { avoidOccupiedCells: true })
    if (!success) return false

    // Wait for arrival
    await new Promise<void>(resolve => {
      movement.onArrival(() => resolve())
    })

    // Set playing state
    behaviorState.value.currentActivity = 'playing'
    behaviorState.value.activityStartTime = Date.now()

    // Show chat bubble for playing activity (check if play is liked)
    if (guineaPig.value && goal.targetItemId) {
      const { guineaPigMessages } = await import('../../data/guineaPigMessages')

      // Check if play/toys are in favorite activities
      const likesPlaying = guineaPig.value.preferences.favoriteActivity.some(activity =>
        activity.toLowerCase().includes('play') || activity.toLowerCase().includes('toy')
      )

      const preferenceLevel: 'favorite' | 'neutral' = likesPlaying ? 'favorite' : 'neutral'

      // Select random message
      const messages = guineaPigMessages.autonomous.activity[preferenceLevel]
      const reaction = messages[Math.floor(Math.random() * messages.length)]

      // Dispatch chat bubble event
      const event = new CustomEvent('show-chat-bubble', {
        detail: {
          guineaPigId: guineaPig.value.id,
          reaction
        },
        bubbles: true
      })
      document.dispatchEvent(event)
    }

    // Log to activity feed BEFORE playing starts (with toy name)
    let toyName: string | undefined
    if (goal.targetItemId) {
      toyName = goal.targetItemId.replace(/_/g, ' ').replace(/^habitat\s+/, '')
    }
    const msg = MessageGenerator.generateAutonomousPlayMessage(guineaPig.value.name, toyName)
    loggingStore.addAutonomousBehavior(msg.message, msg.emoji)

    // Personality affects play intensity and duration
    const playfulness = guineaPig.value.personality.playfulness

    // Playfulness 1-10 affects:
    // - Higher playfulness = more enthusiastic play = more play need satisfied
    // - Higher playfulness = longer play sessions
    const playfulnessMultiplier = 0.6 + (playfulness / 20) // Range: 0.65 to 1.1
    const durationMultiplier = 0.8 + (playfulness / 25) // Range: 0.84 to 1.2

    // Adjust play duration based on personality
    const adjustedDuration = Math.floor(goal.estimatedDuration * durationMultiplier)

    // Simulate playing duration (pause-aware)
    await pausableDelay(adjustedDuration)

    // Calculate play restoration based on playfulness personality
    // Base restoration: 35%, personality range: 22.75% to 38.5%
    const playRestored = Math.floor(35 * playfulnessMultiplier)

    // Satisfy play need with personality modifier
    guineaPigStore.adjustNeed(guineaPigId, 'play', playRestored)

    // Set cooldown and return to idle
    setCooldown('play', 90000) // 90 second cooldown
    behaviorState.value.currentActivity = 'idle'
    behaviorState.value.currentGoal = null

    return true
  }

  /**
   * System 21: Execute social behavior with companion
   * Intelligently selects from 10 social behaviors based on bonding tier and personality
   * Supports manual player-requested interactions via metadata.requestedInteraction
   */
  async function executeSocializeBehavior(goal: BehaviorGoal): Promise<boolean> {
    const SOCIALIZE_COOLDOWN_MS = 120000 // 2 minutes

    if (!guineaPig.value || !goal.metadata) return false

    const { partnerId, bondId, requestedInteraction } = goal.metadata
    const partner = guineaPigStore.getGuineaPig(partnerId)
    const bond = guineaPigStore.getBondById(bondId)

    if (!partner || !bond) {
      if (DEBUG_SOCIALIZE) {
        console.warn('[Socialize] Partner or bond not found', { partnerId, bondId, partner, bond })
      }
      return false
    }

    if (DEBUG_SOCIALIZE) {
      console.log(`[Socialize] ${guineaPig.value.name} socializing with ${partner.name}${requestedInteraction ? ` (requested: ${requestedInteraction})` : ''}`)
    }

    // If player requested a specific interaction, execute it directly
    if (requestedInteraction) {
      let success = false

      switch (requestedInteraction) {
        case 'greet':
          success = await socialBehaviors.greetCompanion(guineaPig.value, partner, bond)
          break
        case 'inspect':
          success = await socialBehaviors.inspectCompanion(guineaPig.value, partner, bond)
          break
        case 'play':
          success = await socialBehaviors.playTogether(guineaPig.value, partner, bond)
          break
        case 'groom':
          success = await socialBehaviors.groomPartner(guineaPig.value, partner, bond)
          break
        case 'follow':
          success = await socialBehaviors.followCompanion(guineaPig.value, partner, bond)
          break
        case 'sleep':
          success = await socialBehaviors.sleepTogether(guineaPig.value, partner, bond)
          break
        default:
          console.warn(`[Socialize] Unknown requested interaction: ${requestedInteraction}`)
          // Fall through to weighted selection
      }

      if (success) {
        // Set cooldown
        setCooldown('socialize', SOCIALIZE_COOLDOWN_MS)

        // Reset to idle
        behaviorState.value.currentActivity = 'idle'
        behaviorState.value.currentGoal = null

        return true
      }
      // If requested interaction failed, fall through to weighted selection
    }

    // Select social behavior based on bonding tier and personality (autonomous or fallback)
    const behaviors: Array<{ name: string; fn: () => Promise<boolean>; weight: number }> = []

    // Greet (all tiers, always available)
    behaviors.push({
      name: 'greet',
      fn: () => socialBehaviors.greetCompanion(guineaPig.value!, partner, bond),
      weight: 15
    })

    // Inspect (curiosity-based, all tiers)
    if (guineaPig.value.personality.curiosity >= 5) {
      behaviors.push({
        name: 'inspect',
        fn: () => socialBehaviors.inspectCompanion(guineaPig.value!, partner, bond),
        weight: 10
      })
    }

    // Play Together (all tiers, higher weight for bonded)
    behaviors.push({
      name: 'play',
      fn: () => socialBehaviors.playTogether(guineaPig.value!, partner, bond),
      weight: bond.bondingTier === 'bonded' ? 25 : bond.bondingTier === 'friends' ? 20 : 10
    })

    // Explore Together (all tiers, higher weight for bonded)
    behaviors.push({
      name: 'explore',
      fn: () => socialBehaviors.exploreTogether(guineaPig.value!, partner, bond),
      weight: bond.bondingTier === 'bonded' ? 20 : bond.bondingTier === 'friends' ? 15 : 8
    })

    // Friends/Bonded tier behaviors
    if (bond.bondingTier === 'friends' || bond.bondingTier === 'bonded') {
      // Groom Partner (Friends/Bonded only)
      behaviors.push({
        name: 'groom',
        fn: () => socialBehaviors.groomPartner(guineaPig.value!, partner, bond),
        weight: bond.bondingTier === 'bonded' ? 30 : 20
      })

      // Sleep Together (Friends/Bonded only)
      behaviors.push({
        name: 'sleep',
        fn: () => socialBehaviors.sleepTogether(guineaPig.value!, partner, bond),
        weight: bond.bondingTier === 'bonded' ? 15 : 10
      })

      // Follow (Friends/Bonded only, friendliness check)
      if (bond.bondingTier === 'bonded' || guineaPig.value.personality.friendliness >= 6) {
        behaviors.push({
          name: 'follow',
          fn: () => socialBehaviors.followCompanion(guineaPig.value!, partner, bond),
          weight: bond.bondingTier === 'bonded' ? 12 : 8
        })
      }

      // Share Food (if food available)
      const bowls = habitatConditions.habitatItems.filter(id => id.includes('bowl'))
      if (bowls.length > 0) {
        behaviors.push({
          name: 'shareFood',
          fn: () => socialBehaviors.shareFood(guineaPig.value!, partner, bond, bowls[0]),
          weight: 10
        })
      }
    }

    // Neutral tier behaviors
    if (bond.bondingTier === 'neutral') {
      // Kick (Neutral only, personality-based)
      const isBold = guineaPig.value.personality.boldness >= 8
      const isUnfriendly = guineaPig.value.personality.friendliness <= 3
      if (isBold || isUnfriendly) {
        behaviors.push({
          name: 'kick',
          fn: () => socialBehaviors.kickCompanion(guineaPig.value!, partner, bond),
          weight: 5 // Low weight since it's negative
        })
      }
    }

    // Select behavior based on weighted random selection
    const totalWeight = behaviors.reduce((sum, b) => sum + b.weight, 0)
    let random = Math.random() * totalWeight
    let selectedBehavior = behaviors[0]

    for (const behavior of behaviors) {
      random -= behavior.weight
      if (random <= 0) {
        selectedBehavior = behavior
        break
      }
    }

    if (DEBUG_SOCIALIZE) {
      console.log(`[Socialize] Selected behavior: ${selectedBehavior.name}`)
    }

    // Execute the selected behavior
    const success = await selectedBehavior.fn()

    // Set cooldown
    setCooldown('socialize', SOCIALIZE_COOLDOWN_MS)

    // Reset to idle
    behaviorState.value.currentActivity = 'idle'
    behaviorState.value.currentGoal = null

    return success
  }

  /**
   * Execute proactive shelter behavior with comfort zone development
   */
  async function executeShelterBehavior(goal: BehaviorGoal): Promise<boolean> {
    if (!goal.target) return false

    // Navigate to shelter
    const success = movement.moveTo(goal.target, { avoidOccupiedCells: true })
    if (!success) return false

    // Wait for arrival with timeout
    await new Promise<void>(resolve => {
      movement.onArrival(() => resolve())
      // Timeout after 10 seconds to prevent infinite waiting
      setTimeout(() => resolve(), 10000)
    })

    // Set sheltering/hiding state
    behaviorState.value.currentActivity = 'hiding'
    behaviorState.value.activityStartTime = Date.now()

    // Show chat bubble for shelter/habitat preference
    if (guineaPig.value && goal.targetItemId) {
      const { guineaPigMessages } = await import('../../data/guineaPigMessages')

      // Check if this shelter type is in habitat preferences
      const itemId = goal.targetItemId.toLowerCase()
      const likesShelter = guineaPig.value.preferences.habitatPreference.some(pref =>
        itemId.includes(pref.toLowerCase()) || pref.toLowerCase().includes('hideout')
      )

      const preferenceLevel: 'favorite' | 'neutral' = likesShelter ? 'favorite' : 'neutral'

      // Select random message
      const messages = guineaPigMessages.autonomous.habitat[preferenceLevel]
      const reaction = messages[Math.floor(Math.random() * messages.length)]

      // Dispatch chat bubble event
      const event = new CustomEvent('show-chat-bubble', {
        detail: {
          guineaPigId: guineaPig.value.id,
          reaction
        },
        bubbles: true
      })
      document.dispatchEvent(event)
    }

    // Log to activity feed BEFORE sheltering starts (with shelter name)
    if (guineaPig.value) {
      let shelterName: string | undefined
      if (goal.targetItemId) {
        shelterName = goal.targetItemId.replace(/_/g, ' ').replace(/^habitat\s+/, '')
      }
      const msg = MessageGenerator.generateAutonomousShelterMessage(guineaPig.value.name, shelterName)
      loggingStore.addAutonomousBehavior(msg.message, msg.emoji)
    }

    // Calculate shelter quality based on preferences
    let shelterEffectiveness = 1.0

    if (goal.targetItemId && guineaPig.value) {
      const itemId = goal.targetItemId.toLowerCase()

      // Preference bonus: +25% if shelter type is preferred
      const preferenceMatch = guineaPig.value.preferences.habitatPreference.some(pref =>
        itemId.includes(pref.toLowerCase())
      )
      if (preferenceMatch) {
        shelterEffectiveness += 0.25
      }

      // Boldness modifier: less bold guinea pigs get more comfort from shelters
      const boldness = guineaPig.value.personality.boldness
      if (boldness <= 4) {
        shelterEffectiveness += 0.20 // Shy guinea pigs love their hidey holes
      }
    }

    // Stay in shelter (duration based on need severity)
    const shelterNeed = guineaPig.value?.needs.shelter || 50
    const duration = shelterNeed < 30 ? goal.estimatedDuration * 1.5 : goal.estimatedDuration

    // Shelter in interruptible chunks (check for cancellation frequently)
    const startTime = Date.now()
    const checkInterval = 250 // Check every 250ms for responsive cancellation

    while (Date.now() - startTime < duration) {
      // Check if behavior was cancelled
      if (behaviorState.value.currentGoal?.type !== 'seek_shelter') {
        console.log('[Shelter] Interrupted by cancel')
        behaviorState.value.currentActivity = 'idle'
        return false
      }

      // Wait for check interval or remaining time, whichever is shorter
      const remainingTime = duration - (Date.now() - startTime)
      const waitTime = Math.min(checkInterval, remainingTime)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }

    // Satisfy shelter need with effectiveness multiplier
    if (guineaPig.value) {
      const shelterRestored = Math.floor(30 * shelterEffectiveness)
      guineaPigStore.adjustNeed(guineaPigId, 'shelter', shelterRestored)

      // Also restore comfort when in shelter
      guineaPigStore.adjustNeed(guineaPigId, 'comfort', 15)
    }

    // Set cooldown and return to idle
    setCooldown('seek_shelter', 60000) // 1 minute cooldown
    behaviorState.value.currentActivity = 'idle'
    behaviorState.value.currentGoal = null

    return true
  }

  /**
   * Execute popcorn behavior (excited jumping - high friendship)
   */
  async function executePopcornBehavior(goal: BehaviorGoal): Promise<boolean> {
    // Set activity (for future animation support)
    behaviorState.value.currentActivity = 'idle' // Will be 'popcorning' when animations added

    // Log to activity feed BEFORE popcorning starts
    if (guineaPig.value) {
      const msg = MessageGenerator.generateAutonomousPopcornMessage(guineaPig.value.name)
      loggingStore.addAutonomousBehavior(msg.message, msg.emoji)
    }

    // Simulate popcorning duration
    await new Promise(resolve => setTimeout(resolve, goal.estimatedDuration))

    // Popcorning slightly increases happiness
    if (guineaPig.value) {
      guineaPigStore.adjustNeed(guineaPigId, 'play', 5)
    }

    // Set cooldown
    setCooldown('popcorn', 30000) // 30 second cooldown
    behaviorState.value.currentGoal = null

    return true
  }

  /**
   * Execute zoomies behavior (excited running - high friendship)
   */
  async function executeZoomiesBehavior(_goal: BehaviorGoal): Promise<boolean> {
    // Log to activity feed BEFORE zoomies starts
    if (guineaPig.value) {
      const msg = MessageGenerator.generateAutonomousZoomiesMessage(guineaPig.value.name)
      loggingStore.addAutonomousBehavior(msg.message, msg.emoji)
    }

    // Do 2-3 quick random movements
    const zoomCount = Math.floor(Math.random() * 2) + 2 // 2-3 zooms

    for (let i = 0; i < zoomCount; i++) {
      const success = movement.wander({ maxDistance: 3 })
      if (success) {
        await new Promise<void>(resolve => {
          movement.onArrival(() => resolve())
          setTimeout(() => resolve(), 2000) // Quick timeout
        })
      }
      await new Promise(resolve => setTimeout(resolve, 500)) // Brief pause between zooms
    }

    // Zoomies increase happiness and satisfy play need
    if (guineaPig.value) {
      guineaPigStore.adjustNeed(guineaPigId, 'play', 10)
    }

    // Set cooldown
    setCooldown('zoomies', 45000) // 45 second cooldown
    behaviorState.value.currentGoal = null

    return true
  }

  /**
   * Execute watch player behavior (curious/friendly watching)
   */
  async function executeWatchPlayerBehavior(goal: BehaviorGoal): Promise<boolean> {
    // Guinea pig stops and watches (no movement)
    behaviorState.value.currentActivity = 'idle'

    // Log to activity feed BEFORE watching starts
    if (guineaPig.value) {
      const msg = MessageGenerator.generateAutonomousWatchMessage(guineaPig.value.name)
      loggingStore.addAutonomousBehavior(msg.message, msg.emoji)
    }

    // Simulate watching duration
    await new Promise(resolve => setTimeout(resolve, goal.estimatedDuration))

    // Watching slightly satisfies social need
    if (guineaPig.value) {
      guineaPigStore.adjustNeed(guineaPigId, 'social', 5)
    }

    // Set cooldown
    setCooldown('watch_player', 20000) // 20 second cooldown
    behaviorState.value.currentGoal = null

    return true
  }

  /**
   * Execute hide behavior (avoidance - low friendship)
   */
  async function executeHideBehavior(goal: BehaviorGoal): Promise<boolean> {
    if (!goal.target) return false

    // Navigate to shelter quickly (scared)
    const success = movement.moveTo(goal.target, { avoidOccupiedCells: true })
    if (!success) return false

    // Wait for arrival with timeout
    await new Promise<void>(resolve => {
      movement.onArrival(() => resolve())
      // Timeout after 10 seconds to prevent infinite waiting
      setTimeout(() => resolve(), 10000)
    })

    // Set hiding state
    behaviorState.value.currentActivity = 'hiding'
    behaviorState.value.activityStartTime = Date.now()

    // Log to activity feed BEFORE hiding starts
    if (guineaPig.value) {
      const msg = MessageGenerator.generateAutonomousHideMessage(guineaPig.value.name)
      loggingStore.addAutonomousBehavior(msg.message, msg.emoji)
    }

    // Stay hidden in interruptible chunks
    const startTime = Date.now()
    const checkInterval = 250 // Check every 250ms for responsive cancellation
    const duration = goal.estimatedDuration

    while (Date.now() - startTime < duration) {
      // Check if behavior was cancelled
      if (behaviorState.value.currentGoal?.type !== 'hide') {
        console.log('[Hide] Interrupted by cancel')
        behaviorState.value.currentActivity = 'idle'
        return false
      }

      // Wait for check interval or remaining time, whichever is shorter
      const remainingTime = duration - (Date.now() - startTime)
      const waitTime = Math.min(checkInterval, remainingTime)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }

    // Hiding satisfies shelter need but decreases social
    if (guineaPig.value) {
      guineaPigStore.adjustNeed(guineaPigId, 'shelter', 20)
      guineaPigStore.adjustNeed(guineaPigId, 'social', -10) // Being scared reduces social
    }

    // Set cooldown and return to idle
    setCooldown('hide', 40000) // 40 second cooldown
    behaviorState.value.currentActivity = 'idle'
    behaviorState.value.currentGoal = null

    return true
  }

  /**
   * Check and handle autonomous poop dropping (environmental interaction)
   * Guinea pigs poop naturally every 30 seconds (for testing/demo purposes)
   */
  function checkAutonomousPooping(): void {
    const gp = guineaPig.value
    if (!gp) return

    const timeSinceLastPoop = Date.now() - gp.lastPoopTime

    if (timeSinceLastPoop > POOP_INTERVAL_MS) {
      // Drop poop at current position
      const currentPos = movement.currentPosition.value

      // Convert grid coordinates to subgrid coordinates with random offset
      const subgridPos = gridToSubgridWithOffset(currentPos)
      habitatConditions.addPoop(subgridPos.x, subgridPos.y)

      // Update last poop time with random offset backwards (-0 to -10 seconds)
      // This makes each guinea pig's next poop happen 20-30 seconds from now
      // Prevents all guinea pigs from pooping at the same time
      const randomOffset = -Math.random() * 10000 // -0s to -10s
      gp.lastPoopTime = Date.now() + randomOffset

      // Detect nearby items for location context
      const suppliesStore = useSuppliesStore()
      const nearbyLocation = detectNearbyLocation(currentPos, habitatConditions, suppliesStore)

      // Log to activity feed with location context
      const msg = MessageGenerator.generateAutonomousPoopMessage(gp.name, nearbyLocation)
      loggingStore.addEnvironmentalEvent(msg.message, msg.emoji)
    }
  }

  /**
   * Main AI decision tick - should be called every 3-5 seconds
   */
  async function tick(thresholds = DEFAULT_THRESHOLDS): Promise<void> {
    const gp = guineaPig.value
    if (!gp) return

    // Check for autonomous pooping (environmental behavior)
    checkAutonomousPooping()

    // Skip if guinea pig is manually controlled
    if (guineaPigStore.isManuallyControlled(guineaPigId)) {
      // Check for manual control target
      const target = guineaPigStore.getManualControlTarget(guineaPigId)
      if (target) {
        // Convert pixel coordinates to grid position
        const cellSize = 60 // TODO: Get this from habitat configuration
        const gridX = Math.floor(target.x / cellSize)
        const gridY = Math.floor(target.y / cellSize)

        // Move to target
        const success = movement.moveTo({ row: gridY, col: gridX }, { avoidOccupiedCells: false })
        if (success) {
          // Clear target after initiating movement
          guineaPigStore.setManualControlTarget(guineaPigId, null)
        }
      }
      return
    }

    // Skip if already executing a behavior
    if (behaviorState.value.currentGoal) return

    // Skip if still on cooldown from last decision
    // Add random jitter (0-2 seconds) to prevent synchronized decision-making
    const randomJitter = Math.random() * 2000
    const timeSinceLastDecision = Date.now() - behaviorState.value.lastDecisionTime
    if (timeSinceLastDecision < (3000 + randomJitter)) return

    behaviorState.value.lastDecisionTime = Date.now()

    // Select next behavior
    const goal = selectBehaviorGoal(thresholds)
    if (!goal) {
      // No goal selected - guinea pig is satisfied or all behaviors on cooldown
      return
    }

    // Execute behavior (non-blocking)
    executeBehavior(goal).catch(err => {
      console.error(`[Behavior] Error executing ${goal.type}:`, err)
      behaviorState.value.currentGoal = null
      behaviorState.value.currentActivity = 'idle'
    })
  }

  return {
    behaviorState,
    selectBehaviorGoal,
    executeBehavior,
    tick,
    isOnCooldown,
    stopMovement: movement.stopMovement,
    resumeMovement: movement.resumeMovement
  }
}
