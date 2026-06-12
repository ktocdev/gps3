/**
 * Guinea Pig Simulation Game (GPS2)
 * Copyright (c) 2025 ktocdev. All Rights Reserved.
 *
 * This file is part of the GPS2 proprietary software.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useLoggingStore } from './loggingStore'
import { useNeedsController } from './needsController'
import { useHabitatConditions } from './habitatConditions'
import { MessageGenerator } from '../utils/messageGenerator'
import { calculateCompatibility } from '../utils/compatibility'
import { getBondingTierBenefits } from '../utils/bondingProgression'

// Core guinea pig entity interfaces
export interface GuineaPigPersonality {
  friendliness: number    // 1-10: How social/friendly they are
  playfulness: number     // 1-10: How much they enjoy activities
  curiosity: number       // 1-10: How much they explore
  boldness: number        // 1-10: How confident/brave they are
  cleanliness: number     // 1-10: How sensitive to mess/habitat conditions (1=tolerant, 10=picky)
}

export interface GuineaPigPreferences {
  favoriteFood: string[]     // Array of food items they prefer (up to 2 per category)
  dislikedFood: string[]     // Array of food items they dislike (up to 2 per category)
  favoriteActivity: string[] // Array of activities they enjoy (up to 2)
  habitatPreference: string[] // Preferred habitat features (up to 2)
}

// System 2.5: Fulfillment Limitation System
export type FoodType = 'fruit' | 'vegetables' | 'pellets' | 'treats' | 'hay' | 'greens' | 'herbs'
export type InteractionType = 'play' | 'social'

export interface ConsumptionLimit {
  consumed: number
  limit: number
}

export interface ConsumptionLimits {
  // All non-hay foods share a combined limit of 5 servings per hunger cycle
  fruit: ConsumptionLimit
  vegetables: ConsumptionLimit
  pellets: ConsumptionLimit
  treats: ConsumptionLimit
  herbs: ConsumptionLimit
  greens: ConsumptionLimit
  // Note: hay is unlimited and not tracked
}

export interface InteractionRejection {
  lastRejectionTime: number | null
  cooldownEndTime: number | null
  rejectionCount: number
  isOnCooldown: boolean
}

export interface FeedResult {
  success: boolean
  message: string
  hungerGained?: number
  remainingServings?: number
}

export interface InteractionResult {
  success: boolean
  rejected: boolean
  message: string
  cooldownSeconds?: number
  friendshipPenalty?: number
}

export type NeedType =
  | 'hunger' | 'thirst' | 'energy' | 'shelter'
  | 'play' | 'social' | 'comfort'
  | 'hygiene' | 'nails' | 'chew'

export interface GuineaPigNeeds {
  // Critical Needs (high decay, high weight)
  hunger: number        // 0-100: Food satisfaction (100 = fully fed, 0 = very hungry)
  thirst: number        // 0-100: Water satisfaction (100 = hydrated, 0 = very thirsty)
  energy: number        // 0-100: Rest satisfaction (100 = well-rested, 0 = tired)
  shelter: number       // 0-100: Security satisfaction (100 = secure, 0 = needs shelter)

  // Environmental Needs (medium decay, medium weight)
  play: number          // 0-100: Play satisfaction (100 = entertained, 0 = needs play)
  social: number        // 0-100: Social satisfaction (100 = fulfilled, 0 = needs attention)
  comfort: number       // 0-100: Comfort satisfaction (100 = cozy, 0 = needs comfort)

  // Maintenance Needs (low decay, medium weight)
  hygiene: number       // 0-100: Cleanliness (100 = clean, 0 = needs grooming)
  nails: number         // 0-100: Nail condition (100 = trimmed, 0 = needs trimming)
  chew: number          // 0-100: Dental care (100 = good dental health, 0 = needs chew items)
}

export interface GuineaPigStats {
  weight: number        // In grams, realistic guinea pig weight range
  age: number           // In days since creation
  level: number         // Experience/growth level
  experience: number    // Experience points toward next level
  overallMood: number   // 0-100: Calculated mood based on needs and interactions
}

export interface GuineaPigAppearance {
  furColor: string      // Primary fur color
  furPattern: string    // Fur pattern type
  eyeColor: string      // Eye color
  size: 'small' | 'medium' | 'large' // Relative size
}

// Phase 5: Bond preservation system
export interface GuineaPigBond {
  partnerId: string         // ID of bonded guinea pig
  relationshipLevel: number // 0-100: Strength of bond
  bondedAt: number          // Timestamp when bond was created
  timesTogether: number     // Number of sessions together
}

// System 21: Active Social Bonding System
export interface ActiveBond {
  id: string
  guineaPig1Id: string
  guineaPig2Id: string
  bondingLevel: number // 0-100 (hidden from player)
  bondingTier: 'neutral' | 'friends' | 'bonded'
  compatibilityScore: number // Base compatibility (hidden)
  createdAt: number
  lastInteraction: number
  totalInteractions: number
  proximityTime: number // minutes spent near each other
  bondingHistory: BondingEvent[]
}

export interface BondingEvent {
  id: string
  timestamp: number
  type: 'interaction' | 'proximity' | 'shared_experience' | 'wellness_bonus'
  bondingChange: number // Always positive
  description: string
  details?: any
}

export interface GuineaPig {
  id: string
  name: string
  gender: 'male' | 'female'
  breed: string
  birthDate: number           // Timestamp when created
  lastInteraction: number     // Timestamp of last interaction

  // Core attributes
  personality: GuineaPigPersonality
  preferences: GuineaPigPreferences
  needs: GuineaPigNeeds
  stats: GuineaPigStats
  appearance: GuineaPigAppearance

  // Relationship data
  friendship: number          // 0-100: Relationship with player
  friendshipFrozen: boolean   // True when in Stardust Sanctuary (Phase 4)
  relationships: Record<string, number> // guinea pig ID -> friendship level (0-100)
  bonds: Record<string, GuineaPigBond> // Phase 5: Preserved bonds with Sanctuary guinea pigs
  observationMessage?: string // Message from observing the guinea pig

  // System 2.5: Fulfillment Limitation System
  consumptionLimits: ConsumptionLimits
  interactionRejection: InteractionRejection
  lastHungerResetLevel: number

  // Phase 0: Interaction cooldowns
  lastPlayTime: number | null        // Timestamp of last play interaction
  lastSocialTime: number | null      // Timestamp of last social interaction

  // System 19: Autonomous AI Behaviors
  lastPoopTime: number               // Timestamp of last poop drop (for autonomous pooping)

  // Phase 2: Adoption timers (for store guinea pigs)
  adoptionTimer: number | null       // Timestamp when guinea pig entered store
  adoptionDuration: number           // How long available in store (ms)

  // Phase 7: Observe interaction
  observed: boolean                  // True if player has used Observe on this guinea pig

  // Pet Adoption organization
  habitat: number | null          // Habitat assignment in pet adoption (null if not in adoption center)

  // Manual control state
  isManuallyControlled?: boolean     // True when player has manual control
  manualControlTarget?: { x: number; y: number } | null  // Current movement target

  // Tracking data
  totalInteractions: number
  lifetimeHappiness: number   // Average happiness over lifetime
  achievementsUnlocked: string[]
}

// Store state interfaces
interface GuineaPigCollection {
  guineaPigs: Record<string, GuineaPig>
  activeGuineaPigIds: string[]  // Array to support up to 2 active guinea pigs
  lastUpdated: number
}

interface GuineaPigSettings {
  autoNeedsDecay: boolean
  needsDecayRate: number      // How fast needs decay (multiplier)
  maxGuineaPigs: number       // Limit for collection size
  enableBreeding: boolean     // Future feature toggle
}

export const useGuineaPigStore = defineStore('guineaPigStore', () => {
  // Get logging store for activity tracking
  let loggingStore: any = null
  const getLoggingStore = () => {
    if (!loggingStore) {
      loggingStore = useLoggingStore()
    }
    return loggingStore
  }

  // Core state
  const collection = ref<GuineaPigCollection>({
    guineaPigs: {},
    activeGuineaPigIds: [],
    lastUpdated: Date.now()
  })

  const settings = ref<GuineaPigSettings>({
    autoNeedsDecay: true,
    needsDecayRate: 1.0,
    maxGuineaPigs: 10, // Allow creating multiple guinea pigs in collection
    enableBreeding: false // Disabled for now
  })

  // System 17: Guinea Pig Selection for Interaction
  const selectedGuineaPigId = ref<string | null>(null)

  // System 21: Active Social Bonding System
  const activeBonds = ref<Map<string, ActiveBond>>(new Map())

  /**
   * Ensure activeBonds is a Map (fixes deserialization from storage)
   */
  const ensureActiveBondsIsMap = (): void => {
    if (!(activeBonds.value instanceof Map)) {
      const bondsMap = new Map<string, ActiveBond>()
      if (activeBonds.value && typeof activeBonds.value === 'object') {
        Object.entries(activeBonds.value).forEach(([key, value]) => {
          bondsMap.set(key, value as ActiveBond)
        })
      }
      activeBonds.value = bondsMap
    }
  }

  // Computed properties
  const allGuineaPigs = computed(() => {
    const activeIds = collection.value.activeGuineaPigIds || []
    return Object.values(collection.value.guineaPigs).map(gp => ({
      ...gp,
      isActive: activeIds.includes(gp.id)
    }))
  })
  const guineaPigCount = computed(() => Object.keys(collection.value.guineaPigs).length)
  const hasGuineaPigs = computed(() => guineaPigCount.value > 0)
  const canAddMoreGuineaPigs = computed(() => guineaPigCount.value < settings.value.maxGuineaPigs)

  const activeGuineaPigs = computed(() => {
    const activeIds = collection.value.activeGuineaPigIds || []
    return activeIds
      .map(id => collection.value.guineaPigs[id])
      .filter(Boolean)
  })

  const activeGuineaPig = computed(() => {
    // For backward compatibility - returns the first active guinea pig
    return activeGuineaPigs.value[0] || null
  })

  const activeGuineaPigPair = computed(() => {
    return activeGuineaPigs.value.length === 2 ? activeGuineaPigs.value : null
  })

  const canAddActiveGuineaPig = computed(() => {
    const activeIds = collection.value.activeGuineaPigIds || []
    return activeIds.length < 2
  })



  const getGuineaPig = (id: string): GuineaPig | null => {
    return collection.value.guineaPigs[id] || null
  }

  const updateGuineaPig = (id: string, updates: Partial<GuineaPig>): boolean => {
    const guineaPig = collection.value.guineaPigs[id]
    if (!guineaPig) return false

    // Prevent changing immutable properties
    const { id: _, birthDate: __, ...allowedUpdates } = updates

    collection.value.guineaPigs[id] = { ...guineaPig, ...allowedUpdates }
    collection.value.lastUpdated = Date.now()

    return true
  }

  const deleteGuineaPig = (id: string): boolean => {
    if (!collection.value.guineaPigs[id]) return false

    const guineaPig = collection.value.guineaPigs[id]
    delete collection.value.guineaPigs[id]

    // Remove from active guinea pigs if needed
    if (!collection.value.activeGuineaPigIds) {
      collection.value.activeGuineaPigIds = []
    }
    const activeIndex = collection.value.activeGuineaPigIds.indexOf(id)
    if (activeIndex !== -1) {
      collection.value.activeGuineaPigIds.splice(activeIndex, 1)
    }

    collection.value.lastUpdated = Date.now()

    // Debug message for deletion (debug mode only)
    console.log(`[DEBUG] Deleted guinea pig: ${guineaPig.name} (ID: ${id})`)

    return true
  }

  // Active guinea pig pair management
  const addToActivePair = (id: string): boolean => {
    if (!collection.value.guineaPigs[id]) return false
    if (!collection.value.activeGuineaPigIds) {
      collection.value.activeGuineaPigIds = []
    }
    if (collection.value.activeGuineaPigIds.includes(id)) return false
    if (collection.value.activeGuineaPigIds.length >= 2) return false

    collection.value.activeGuineaPigIds.push(id)
    collection.value.lastUpdated = Date.now()

    // System 16: Phase 4 - Initialize guinea pig position in habitat
    const habitatConditions = useHabitatConditions()
    habitatConditions.initializeGuineaPigPosition(id)

    const logging = getLoggingStore()
    const guineaPig = collection.value.guineaPigs[id]
    logging.addPlayerAction(
      `Added ${guineaPig.name} to active pair 🐹`,
      '➕',
      { guineaPigId: id, name: guineaPig.name }
    )

    // System 21: Auto-create bonds when 2nd guinea pig added
    ensureBondsExist()

    return true
  }

  const removeFromActivePair = (id: string): boolean => {
    if (!collection.value.activeGuineaPigIds) {
      collection.value.activeGuineaPigIds = []
    }
    const index = collection.value.activeGuineaPigIds.indexOf(id)
    if (index === -1) return false

    collection.value.activeGuineaPigIds.splice(index, 1)
    collection.value.lastUpdated = Date.now()

    const logging = getLoggingStore()
    const guineaPig = collection.value.guineaPigs[id]
    logging.addPlayerAction(
      `Removed ${guineaPig.name} from active pair 🐹`,
      '➖',
      { guineaPigId: id, name: guineaPig.name }
    )

    return true
  }

  const setActivePair = (ids: string[]): boolean => {
    if (ids.length > 2) return false

    // Validate all IDs exist
    for (const id of ids) {
      if (!collection.value.guineaPigs[id]) return false
    }

    collection.value.activeGuineaPigIds = [...ids]
    collection.value.lastUpdated = Date.now()

    const logging = getLoggingStore()
    if (ids.length === 0) {
      logging.addPlayerAction('Cleared active guinea pig pair', '🔄', {})
    } else {
      const names = ids.map(id => collection.value.guineaPigs[id].name).join(' & ')
      logging.addPlayerAction(
        `Set active pair: ${names} 🐹🐹`,
        '🔄',
        { guineaPigIds: ids, names }
      )
    }

    // System 21: Auto-create bonds when setting active pair
    if (ids.length >= 2) {
      ensureBondsExist()
    }

    return true
  }

  // Backward compatibility function
  const setActiveGuineaPig = (id: string | null): boolean => {
    if (id === null) {
      return setActivePair([])
    }
    return setActivePair([id])
  }

  // Utility functions
  const generateGuineaPigId = (): string => {
    return `gp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Save/Load functionality
  const getState = () => {
    return {
      collection: collection.value,
      settings: settings.value
    }
  }

  const loadState = (state: any) => {
    if (state.collection) {
      collection.value = state.collection
    }
    if (state.settings) {
      settings.value = state.settings
    }
  }

  // Needs decay system
  const needsDecayRates = ref({
    // Critical Needs (decay rates calibrated for 1-second ticks)
    // Formula: decayRate * (1000ms / 60000ms) = points per second
    hunger: 10,       // ~0.17 points/sec = 10 minutes from 100 to 0
    thirst: 8,        // ~0.13 points/sec = 12.5 minutes from 100 to 0
    energy: 7,        // ~0.12 points/sec = 14 minutes from 100 to 0
    shelter: 9,       // ~0.15 points/sec = 11 minutes from 100 to 0

    // Environmental Needs (medium decay)
    play: 5,          // ~0.08 points/sec = 20 minutes from 100 to 0
    social: 4,        // ~0.07 points/sec = 25 minutes from 100 to 0
    comfort: 3,       // ~0.05 points/sec = 33 minutes from 100 to 0

    // Maintenance Needs (low decay)
    hygiene: 3,       // ~0.05 points/sec = 33 minutes from 100 to 0
    nails: 0.5,       // ~0.008 points/sec = 200 minutes from 100 to 0
    chew: 2.5         // ~0.042 points/sec = 40 minutes from 100 to 0
  })

  const needsLastUpdate = ref<Record<string, number>>({})

  /**
   * Calculate personality trait modifier for need decay rate
   * Based on Phase 2.5 - System 1: Personality Trait Influences
   */
  const getPersonalityDecayModifier = (guineaPig: GuineaPig, needType: keyof GuineaPigNeeds): number => {
    const personality = guineaPig.personality
    let modifier = 1.0

    switch (needType) {
      case 'social':
        // Friendliness: higher = faster decay (needs more social interaction)
        // Modifier: 1 + (friendliness - 5) * 0.04
        // Friendliness 10: 1.20x (+20%), Friendliness 1: 0.84x (-16%)
        modifier = 1 + (personality.friendliness - 5) * 0.04
        break

      case 'play':
        // Playfulness: higher = faster decay (needs more activity)
        // Modifier: 1 + (playfulness - 5) * 0.06
        // Playfulness 10: 1.30x (+30%), Playfulness 1: 0.76x (-24%)
        modifier = 1 + (personality.playfulness - 5) * 0.06
        break

      case 'comfort':
        // Boldness: higher = slower decay (less stressed, more confident)
        // Modifier: 1 - (boldness - 5) * 0.05
        // Boldness 10: 0.75x (-25%), Boldness 1: 1.20x (+20%)
        modifier = 1 - (personality.boldness - 5) * 0.05
        break

      case 'hygiene':
        // Cleanliness: higher (picky) = slower decay (stays cleaner naturally)
        // Modifier: 1 - (cleanliness - 5) * 0.06
        // Cleanliness 10 (picky): 0.70x (-30%), Cleanliness 1 (piggy): 1.24x (+24%)
        modifier = 1 - (personality.cleanliness - 5) * 0.06
        break

      default:
        // No personality modifier for other needs
        modifier = 1.0
    }

    // Clamp modifier to reasonable range (0.5x to 2.0x)
    return Math.max(0.5, Math.min(2.0, modifier))
  }

  /**
   * System 21: Calculate social need decay modifier based on bonding tier
   * Returns the best (lowest) modifier from all active bonds
   */
  const getSocialDecayModifierFromBonding = (guineaPigId: string): number => {
    ensureActiveBondsIsMap()
    const bonds = Array.from(activeBonds.value.values()).filter(
      bond => bond.guineaPig1Id === guineaPigId || bond.guineaPig2Id === guineaPigId
    )

    if (bonds.length === 0) {
      return 1.0 // No bonds, no modifier
    }

    // Get the best (lowest) social decay modifier from all bonds
    const modifiers = bonds.map(bond => {
      const benefits = getBondingTierBenefits(bond.bondingLevel)
      return benefits.socialDecayModifier
    })

    return Math.min(...modifiers)
  }

  /**
   * Calculate interaction cooldown based on personality, friendship, and wellness
   * Phase 0: Interaction Cooldowns
   */
  const calculateInteractionCooldown = (guineaPig: GuineaPig, interactionType: 'play' | 'social'): number => {
    const needsController = useNeedsController()
    const wellness = needsController.calculateWellness(guineaPig.id)

    // Base cooldowns (in seconds)
    const baseCooldowns = {
      play: 60,    // 1 minute base
      social: 45   // 45 seconds base
    }

    let cooldown = baseCooldowns[interactionType]

    // Personality modifier
    const relevantTrait = interactionType === 'play' ? guineaPig.personality.playfulness : guineaPig.personality.friendliness
    // High trait (8-10): 0.5x cooldown, Medium (4-7): 1.0x, Low (1-3): 1.5x
    let personalityMod = 1.0
    if (relevantTrait >= 8) {
      personalityMod = 0.5
    } else if (relevantTrait <= 3) {
      personalityMod = 1.5
    }

    // Friendship modifier
    const friendship = guineaPig.friendship
    let friendshipMod = 1.0
    if (friendship >= 71) {
      friendshipMod = 0.7  // High friendship: 30% faster cooldown
    } else if (friendship <= 40) {
      friendshipMod = 1.5  // Low friendship: 50% longer cooldown
    }

    // Wellness modifier
    let wellnessMod = 1.0
    if (wellness > 70) {
      wellnessMod = 0.8  // High wellness: 20% faster cooldown
    } else if (wellness < 30) {
      wellnessMod = 2.0  // Low wellness: 100% longer cooldown (needs rest)
    }

    // Apply all modifiers
    cooldown = cooldown * personalityMod * friendshipMod * wellnessMod

    // Clamp to reasonable range: 30s minimum, 180s (3 min) maximum
    return Math.max(30, Math.min(180, Math.round(cooldown)))
  }

  /**
   * Check if interaction is currently on cooldown
   * Phase 0: Interaction Cooldowns
   */
  const checkInteractionCooldown = (guineaPigId: string, interactionType: 'play' | 'social'): { onCooldown: boolean, remainingSeconds: number } => {
    const guineaPig = collection.value.guineaPigs[guineaPigId]
    if (!guineaPig) return { onCooldown: false, remainingSeconds: 0 }

    const lastTime = interactionType === 'play' ? guineaPig.lastPlayTime : guineaPig.lastSocialTime
    if (lastTime === null) return { onCooldown: false, remainingSeconds: 0 }

    const cooldownMs = calculateInteractionCooldown(guineaPig, interactionType) * 1000
    const elapsed = Date.now() - lastTime
    const remaining = cooldownMs - elapsed

    if (remaining > 0) {
      return { onCooldown: true, remainingSeconds: Math.ceil(remaining / 1000) }
    }

    return { onCooldown: false, remainingSeconds: 0 }
  }

  const processNeedsDecay = (guineaPigId: string, deltaTimeMs: number): boolean => {
    const guineaPig = collection.value.guineaPigs[guineaPigId]
    if (!guineaPig || !settings.value.autoNeedsDecay) return false

    const deltaTimeMinutes = deltaTimeMs / (1000 * 60) // Convert to minutes
    const decayMultiplier = settings.value.needsDecayRate

    let needsChanged = false

    // Process each need with its specific decay rate
    Object.keys(needsDecayRates.value).forEach(needKey => {
      const currentValue = guineaPig.needs[needKey as keyof GuineaPigNeeds]
      const baseDecayRate = needsDecayRates.value[needKey as keyof typeof needsDecayRates.value]

      // Start with base decay rate and global multiplier
      let finalDecayRate = baseDecayRate * decayMultiplier

      // Apply personality trait modifiers only (Phase 2.5 - System 1)
      // These are stable and don't cause death spirals
      finalDecayRate *= getPersonalityDecayModifier(guineaPig, needKey as keyof GuineaPigNeeds)

      // System 21: Apply bonding tier modifiers to social need decay
      if (needKey === 'social') {
        finalDecayRate *= getSocialDecayModifierFromBonding(guineaPig.id)
      }

      // Happiness has special boredom mechanics - handle in separate function
      if (needKey === 'happiness') {
        finalDecayRate = processHappinessDecay(guineaPig, deltaTimeMinutes, finalDecayRate)
      }

      // Calculate decay amount (needs decay downward from 100 to 0)
      // No age/health modifiers to prevent unfair death spirals
      const decayAmount = finalDecayRate * deltaTimeMinutes
      const newValue = Math.max(0, Math.min(100, currentValue - decayAmount))

      if (Math.abs(newValue - currentValue) > 0.01) {
        guineaPig.needs[needKey as keyof GuineaPigNeeds] = newValue
        needsChanged = true
      }
    })

    if (needsChanged) {
      collection.value.lastUpdated = Date.now()
      needsLastUpdate.value[guineaPigId] = Date.now()

      // Removed excessive needs_decay_processed logging to prevent message spam
      // This was logging every 5 seconds per guinea pig, creating 100+ messages quickly
    }

    return needsChanged
  }

  const processHappinessDecay = (guineaPig: GuineaPig, _deltaTimeMinutes: number, baseDecayRate: number): number => {
    // Happiness decay is affected by variety and boredom
    // This is a simplified version - full boredom system would track interaction history

    const timeSinceLastInteraction = Date.now() - guineaPig.lastInteraction
    const hoursSinceInteraction = timeSinceLastInteraction / (1000 * 60 * 60)

    // Accelerate happiness decay if no recent interaction
    let boredomMultiplier = 1.0
    if (hoursSinceInteraction > 2) {
      boredomMultiplier = 1.5 // 50% faster decay after 2 hours
    }
    if (hoursSinceInteraction > 6) {
      boredomMultiplier = 2.0 // 100% faster decay after 6 hours
    }

    return baseDecayRate * boredomMultiplier
  }

  const processBatchNeedsDecay = (): void => {
    const currentTime = Date.now()

    // Defensive check: ensure activeGuineaPigs is an array
    if (!Array.isArray(activeGuineaPigs.value)) {
      getLoggingStore().logWarn('activeGuineaPigs is not an array in processBatchNeedsDecay')
      return
    }

    activeGuineaPigs.value.forEach(guineaPig => {
      if (!guineaPig || !guineaPig.id) {
        getLoggingStore().logWarn('Invalid guinea pig in activeGuineaPigs during batch needs decay')
        return
      }

      // Initialize needsLastUpdate if not set with random offset to desynchronize guinea pigs
      // Random offset 0-5 seconds to prevent all guinea pigs from decaying needs simultaneously
      if (!needsLastUpdate.value[guineaPig.id]) {
        needsLastUpdate.value[guineaPig.id] = currentTime - Math.random() * 5000
      }

      const lastUpdate = needsLastUpdate.value[guineaPig.id]
      const deltaTime = currentTime - lastUpdate

      // Process decay based on actual time elapsed (minimum 1 second to avoid micro-updates)
      if (deltaTime >= 1000) {
        processNeedsDecay(guineaPig.id, deltaTime)

        // Phase 0: Passive friendship gain/loss based on wellness
        const needsController = useNeedsController()
        const wellness = needsController.calculateWellness(guineaPig.id)

        if (wellness > 50) {
          // Good care: passive friendship gain
          adjustFriendship(guineaPig.id, 0.1)
        } else if (wellness < 50) {
          // Poor care: friendship loss
          // Scale loss based on how bad wellness is
          if (wellness < 30) {
            adjustFriendship(guineaPig.id, -2) // Very poor care: -2 per tick
          } else {
            adjustFriendship(guineaPig.id, -1) // Poor care: -1 per tick
          }
        }

        // Phase 0: Additional friendship loss for critically low needs
        // Check individual needs below 30%
        const criticalNeeds = Object.entries(guineaPig.needs).filter(([_, value]) => value < 30)
        if (criticalNeeds.length > 0) {
          // -0.5 friendship per critically low need (stacks with wellness penalty)
          adjustFriendship(guineaPig.id, -0.5 * criticalNeeds.length)
        }
      }
    })
  }

  const adjustNeed = (guineaPigId: string, needType: keyof GuineaPigNeeds, amount: number): boolean => {
    const guineaPig = collection.value.guineaPigs[guineaPigId]
    if (!guineaPig) return false

    const oldValue = guineaPig.needs[needType]
    const newValue = Math.max(0, Math.min(100, oldValue + amount))

    guineaPig.needs[needType] = newValue
    collection.value.lastUpdated = Date.now()

    // System 2.5: Reset consumption limits when hunger fulfilled to 100%
    if (needType === 'hunger' && newValue === 100 && oldValue < 100) {
      guineaPig.consumptionLimits.fruit.consumed = 0
      guineaPig.consumptionLimits.vegetables.consumed = 0
      guineaPig.consumptionLimits.pellets.consumed = 0
      guineaPig.consumptionLimits.treats.consumed = 0
      guineaPig.consumptionLimits.herbs.consumed = 0
      guineaPig.consumptionLimits.greens.consumed = 0
      guineaPig.lastHungerResetLevel = 100

      getLoggingStore().logInfo(`Consumption limits reset for ${guineaPig.name} (hunger cycle complete)`)
    }

    // Removed need_adjusted logging to prevent spam when using debug sliders
    // Each slider adjustment was creating a system message

    return true
  }

  const satisfyNeed = (guineaPigId: string, needType: keyof GuineaPigNeeds, amount: number): boolean => {
    // Satisfy means increase the satisfaction level (needs are 100=satisfied, 0=empty)
    const guineaPig = collection.value.guineaPigs[guineaPigId]
    if (!guineaPig) return false

    const oldValue = guineaPig.needs[needType]
    const success = adjustNeed(guineaPigId, needType, amount)

    if (success && amount > 0) {
      // Phase 0: Friendship gain from need fulfillment
      // Calculate friendship based on how much the need was satisfied
      // Scale: +0.5 for small satisfaction (5-15 points), +2 for large satisfaction (30+ points)
      const actualSatisfaction = Math.min(100, oldValue + amount) - oldValue
      let friendshipGain = 0

      if (actualSatisfaction >= 30) {
        friendshipGain = 2
      } else if (actualSatisfaction >= 20) {
        friendshipGain = 1.5
      } else if (actualSatisfaction >= 10) {
        friendshipGain = 1
      } else if (actualSatisfaction >= 5) {
        friendshipGain = 0.5
      }

      if (friendshipGain > 0) {
        adjustFriendship(guineaPigId, friendshipGain)
      }
    }

    return success
  }

  // Needs satisfaction mechanics for user interactions
  const feedGuineaPig = (guineaPigId: string, foodType: FoodType = 'pellets'): boolean => {
    const guineaPig = collection.value.guineaPigs[guineaPigId]
    if (!guineaPig) return false

    // System 2.5: Check consumption limits (hay is unlimited)
    if (foodType !== 'hay') {
      // All non-hay foods share a combined limit of 5 servings per hunger cycle
      const totalConsumed =
        guineaPig.consumptionLimits.fruit.consumed +
        guineaPig.consumptionLimits.vegetables.consumed +
        guineaPig.consumptionLimits.pellets.consumed +
        guineaPig.consumptionLimits.treats.consumed +
        guineaPig.consumptionLimits.herbs.consumed +
        guineaPig.consumptionLimits.greens.consumed

      if (totalConsumed >= 5) {
        getLoggingStore().addPlayerAction(
          `${guineaPig.name} has already eaten 5 servings of food this hunger cycle 🚫`,
          '🚫',
          {
            guineaPigId,
            foodType,
            totalConsumed,
            limit: 5,
            reason: 'food_limit_reached'
          }
        )
        return false
      }
    }

    // Base satisfaction amounts
    const feedingAmounts: Record<FoodType, number> = {
      pellets: 25,     // Basic nutrition
      hay: 15,         // Continuous munching
      vegetables: 30,  // High nutrition + happiness
      treats: 35,      // High satisfaction but should be limited
      fruit: 30,       // High nutrition + happiness (similar to vegetables)
      greens: 25,      // Leafy greens - good nutrition
      herbs: 20        // Fresh herbs - lower satisfaction but tasty
    }

    let hungerSatisfaction = feedingAmounts[foodType]
    let happinessChange = 0

    // Phase 2.5 - System 2: Preferences (Likes & Dislikes)
    // Check if this food type is a favorite or disliked
    const isFavorite = guineaPig.preferences.favoriteFood.includes(foodType)
    const isDisliked = guineaPig.preferences.dislikedFood.includes(foodType)

    // Phase 0: Friendship gain calculation
    let friendshipGain = 1 // Base friendship gain for normal food

    if (isFavorite) {
      // Favorite: +50% satisfaction, +15 happiness
      hungerSatisfaction *= 1.5
      happinessChange = 15
      friendshipGain = 5 // +5 friendship for favorite food
    } else if (isDisliked) {
      // Disliked: 50% chance of rejection
      if (Math.random() < 0.5) {
        // Rejection - guinea pig refuses the food
        guineaPig.lastInteraction = Date.now()
        guineaPig.totalInteractions += 1

        getLoggingStore().addPlayerAction(
          `${guineaPig.name} turns away from the ${foodType} with disinterest 😐`,
          '🚫',
          {
            guineaPigId,
            foodType,
            wasRejected: true,
            reason: 'disliked_food'
          }
        )
        return false // Feeding failed
      }

      // Accepted but with penalty: -30% satisfaction, -8 happiness
      hungerSatisfaction *= 0.7
      happinessChange = -8
      friendshipGain = 0 // No friendship gain for disliked food
    }

    // Feed the guinea pig
    satisfyNeed(guineaPigId, 'hunger', hungerSatisfaction)

    // Vegetables and fruit provide slight thirst relief
    if (foodType === 'vegetables' || foodType === 'fruit') {
      satisfyNeed(guineaPigId, 'thirst', 5)
    }

    // Phase 0: Apply friendship gain
    adjustFriendship(guineaPigId, friendshipGain)

    // System 2.5: Track consumption (except hay)
    if (foodType !== 'hay') {
      const limit = guineaPig.consumptionLimits[foodType as keyof ConsumptionLimits]
      if (limit) {
        limit.consumed += 1
      }
    }

    // Update interaction tracking
    guineaPig.lastInteraction = Date.now()
    guineaPig.totalInteractions += 1

    // Generate preference-aware message
    const { message, emoji } = MessageGenerator.generateFeedMessage(guineaPig.name, foodType, isFavorite, isDisliked)

    getLoggingStore().addPlayerAction(
      message,
      emoji,
      {
        guineaPigId,
        foodType,
        hungerSatisfaction,
        happinessChange,
        friendshipGain,
        wasFavorite: isFavorite,
        wasDisliked: isDisliked
      }
    )

    return true
  }

  const giveWater = (guineaPigId: string): boolean => {
    const guineaPig = collection.value.guineaPigs[guineaPigId]
    if (!guineaPig) return false

    // Water fully satisfies thirst
    satisfyNeed(guineaPigId, 'thirst', 40)

    // Update interaction tracking
    guineaPig.lastInteraction = Date.now()
    guineaPig.totalInteractions += 1

    const { message, emoji } = MessageGenerator.generateWaterMessage(guineaPig.name)

    getLoggingStore().addPlayerAction(
      message,
      emoji,
      {
        guineaPigId,
        thirstReduction: 40
      }
    )

    return true
  }

  const cleanGuineaPig = (guineaPigId: string): boolean => {
    const guineaPig = collection.value.guineaPigs[guineaPigId]
    if (!guineaPig) return false

    // Cleaning improves hygiene
    satisfyNeed(guineaPigId, 'hygiene', 35)

    // Phase 0: Friendship gain for grooming
    adjustFriendship(guineaPigId, 2)

    // Update interaction tracking
    guineaPig.lastInteraction = Date.now()
    guineaPig.totalInteractions += 1

    const { message, emoji} = MessageGenerator.generateCleanMessage(guineaPig.name)

    getLoggingStore().addPlayerAction(
      message,
      emoji,
      {
        guineaPigId,
        hygieneImprovement: 35,
        friendshipGain: 2
      }
    )

    return true
  }

  const playWithGuineaPig = (guineaPigId: string, activityType: string = 'general_play'): boolean => {
    const guineaPig = collection.value.guineaPigs[guineaPigId]
    if (!guineaPig) return false

    // Phase 0: Check cooldown
    const cooldownCheck = checkInteractionCooldown(guineaPigId, 'play')
    if (cooldownCheck.onCooldown) {
      getLoggingStore().addPlayerAction(
        `${guineaPig.name} needs a break from playing. Try again in ${cooldownCheck.remainingSeconds}s ⏱️`,
        '⏱️',
        {
          guineaPigId,
          interactionType: 'play',
          remainingSeconds: cooldownCheck.remainingSeconds
        }
      )
      return false
    }

    // Base satisfaction values (Phase 2.5 - System 2)
    let playGain = 20
    const energyCost = 5 // Playing can be slightly tiring
    let preferenceLevel: 'favorite' | 'neutral' | 'disliked' = 'neutral'

    // Check preferences (Phase 2.5 - System 2)
    const isFavorite = guineaPig.preferences.favoriteActivity.includes(activityType)

    if (isFavorite) {
      // FAVORITE ACTIVITY: +50% satisfaction (happiness bonus removed - not in Phase 2)
      preferenceLevel = 'favorite'
      playGain = Math.floor(playGain * 1.5) // 30 instead of 20
    }

    // Apply effects
    satisfyNeed(guineaPigId, 'play', playGain)

    // Only tire them if they're not already tired
    if (guineaPig.needs.energy < 70) {
      adjustNeed(guineaPigId, 'energy', energyCost)
    }

    // Phase 0: Friendship gain for play
    adjustFriendship(guineaPigId, 3)

    // Phase 0: Update play cooldown timestamp
    guineaPig.lastPlayTime = Date.now()

    // Update interaction tracking
    guineaPig.lastInteraction = Date.now()
    guineaPig.totalInteractions += 1

    const { message, emoji } = MessageGenerator.generatePlayMessage(
      guineaPig.name,
      activityType,
      isFavorite,
      false // not rejected
    )

    getLoggingStore().addPlayerAction(
      message,
      emoji,
      {
        guineaPigId,
        activityType,
        playGain,
        preferenceLevel,
        friendshipGain: 3
      }
    )

    return true
  }

  const socializeWithGuineaPig = (guineaPigId: string): boolean => {
    const guineaPig = collection.value.guineaPigs[guineaPigId]
    if (!guineaPig) return false

    // Phase 0: Check cooldown
    const cooldownCheck = checkInteractionCooldown(guineaPigId, 'social')
    if (cooldownCheck.onCooldown) {
      getLoggingStore().addPlayerAction(
        `${guineaPig.name} needs some alone time. Try again in ${cooldownCheck.remainingSeconds}s ⏱️`,
        '⏱️',
        {
          guineaPigId,
          interactionType: 'social',
          remainingSeconds: cooldownCheck.remainingSeconds
        }
      )
      return false
    }

    // Socializing improves social need
    const socialGain = 25

    // Apply effects
    satisfyNeed(guineaPigId, 'social', socialGain)

    // Phase 0: Friendship gain for socializing (petting/handling)
    adjustFriendship(guineaPigId, 2)

    // Phase 0: Update social cooldown timestamp
    guineaPig.lastSocialTime = Date.now()

    // Update interaction tracking
    guineaPig.lastInteraction = Date.now()
    guineaPig.totalInteractions += 1

    const { message, emoji } = MessageGenerator.generateSocializeMessage(guineaPig.name)

    getLoggingStore().addPlayerAction(
      message,
      emoji,
      {
        guineaPigId,
        socialGain,
        friendshipGain: 2
      }
    )

    return true
  }

  const rearrangeCage = (guineaPigId: string): boolean => {
    const guineaPig = collection.value.guineaPigs[guineaPigId]
    if (!guineaPig) return false

    // Rearranging cage improves play
    const playGain = 30

    satisfyNeed(guineaPigId, 'play', playGain)

    // Update interaction tracking
    guineaPig.lastInteraction = Date.now()
    guineaPig.totalInteractions += 1

    const { message, emoji } = MessageGenerator.generateRearrangeCageMessage(guineaPig.name)

    getLoggingStore().addPlayerAction(
      message,
      emoji,
      {
        guineaPigId,
        playGain
      }
    )

    return true
  }

  const provideBedding = (guineaPigId: string): boolean => {
    const guineaPig = collection.value.guineaPigs[guineaPigId]
    if (!guineaPig) return false

    // Providing fresh bedding improves comfort
    const comfortGain = 35

    satisfyNeed(guineaPigId, 'comfort', comfortGain)

    // Update interaction tracking
    guineaPig.lastInteraction = Date.now()
    guineaPig.totalInteractions += 1

    const { message, emoji } = MessageGenerator.generateProvideBeddingMessage(guineaPig.name)

    getLoggingStore().addPlayerAction(
      message,
      emoji,
      {
        guineaPigId,
        comfortGain
      }
    )

    return true
  }

  const provideChewToy = (guineaPigId: string, toyType: string = 'wooden_block'): boolean => {
    const guineaPig = collection.value.guineaPigs[guineaPigId]
    if (!guineaPig) return false

    // Chew toys satisfy chew needs
    let chewSatisfaction = 30

    // Check preferences
    if (guineaPig.preferences.favoriteActivity.includes('chewing') ||
        guineaPig.preferences.favoriteActivity.includes(toyType)) {
      chewSatisfaction += 10
    }

    satisfyNeed(guineaPigId, 'chew', chewSatisfaction)

    // Update interaction tracking
    guineaPig.lastInteraction = Date.now()
    guineaPig.totalInteractions += 1

    const { message, emoji } = MessageGenerator.generateChewToyMessage(guineaPig.name)

    getLoggingStore().addPlayerAction(
      message,
      emoji,
      {
        guineaPigId,
        toyType,
        chewSatisfaction
      }
    )

    return true
  }

  const trimNails = (guineaPigId: string): boolean => {
    const guineaPig = collection.value.guineaPigs[guineaPigId]
    if (!guineaPig) return false

    // Nail trimming success depends on friendship and wellness
    const friendship = guineaPig.friendship

    // Get wellness from needs controller
    const needsController = useNeedsController()
    const wellness = needsController.calculateWellness(guineaPigId)

    const successRate = 40 + (friendship * 0.3) + (wellness * 0.2)
    const isSuccess = Math.random() * 100 < successRate

    let nailImprovement = 0
    let stressIncrease = 0

    if (isSuccess) {
      if (successRate >= 70) {
        // Complete success
        nailImprovement = 50
        stressIncrease = 0
      } else {
        // Partial success
        nailImprovement = 25
        stressIncrease = 5
      }
    } else {
      // Failed attempt
      nailImprovement = 5
      stressIncrease = 10
    }

    satisfyNeed(guineaPigId, 'nails', nailImprovement)
    if (stressIncrease > 0) {
      adjustNeed(guineaPigId, 'comfort', stressIncrease) // Stress reduces comfort
    }

    // Update interaction tracking
    guineaPig.lastInteraction = Date.now()
    guineaPig.totalInteractions += 1

    const { message, emoji } = MessageGenerator.generateTrimNailsMessage(guineaPig.name, isSuccess)

    getLoggingStore().addPlayerAction(
      message,
      emoji,
      {
        guineaPigId,
        successRate: Math.round(successRate),
        isSuccess,
        nailImprovement,
        stressIncrease
      }
    )

    return true
  }

  const provideShelter = (guineaPigId: string, shelterType: string = 'basic_hideout'): boolean => {
    const guineaPig = collection.value.guineaPigs[guineaPigId]
    if (!guineaPig) return false

    // Shelter improves security needs
    let shelterSatisfaction = 25
    let happinessBonus = 5

    // Check habitat preferences
    if (guineaPig.preferences.habitatPreference.includes(shelterType) ||
        guineaPig.preferences.habitatPreference.includes('hideouts')) {
      shelterSatisfaction += 15
      happinessBonus += 10
    }

    satisfyNeed(guineaPigId, 'shelter', shelterSatisfaction)
    // Happiness bonus removed - happiness is now derived from wellness

    // Update interaction tracking
    guineaPig.lastInteraction = Date.now()
    guineaPig.totalInteractions += 1

    const { message, emoji } = MessageGenerator.generateShelterMessage(guineaPig.name)

    getLoggingStore().addPlayerAction(
      message,
      emoji,
      {
        guineaPigId,
        shelterType,
        shelterSatisfaction,
        happinessBonus
      }
    )

    return true
  }

  const sootheToSleep = (guineaPigId: string): boolean => {
    const guineaPig = collection.value.guineaPigs[guineaPigId]
    if (!guineaPig) return false

    // Soothing to sleep restores energy
    satisfyNeed(guineaPigId, 'energy', 40)

    // Resting with good shelter provides bonus
    if (guineaPig.needs.shelter < 30) { // Low shelter need means good shelter
      satisfyNeed(guineaPigId, 'energy', 10) // Extra energy bonus
    }

    const { message, emoji } = MessageGenerator.generateSootheToSleepMessage(guineaPig.name)

    getLoggingStore().addPlayerAction(
      message,
      emoji,
      {
        guineaPigId,
        energyRestored: guineaPig.needs.shelter < 30 ? 50 : 40
      }
    )

    return true
  }

  // Store initialization
  const initializeStore = () => {
    const logging = getLoggingStore()

    // Validate existing data
    validateCollection()

    logging.logInfo(`Guinea Pig Store initialized with ${guineaPigCount.value} guinea pigs`)
  }

  const validateCollection = () => {
    // Ensure activeGuineaPigIds is always initialized
    if (!collection.value.activeGuineaPigIds) {
      collection.value.activeGuineaPigIds = []
    }

    // Migrate from old single active guinea pig to new pair system
    if ((collection.value as any).activeGuineaPigId) {
      const oldActiveId = (collection.value as any).activeGuineaPigId
      if (oldActiveId && collection.value.guineaPigs[oldActiveId]) {
        collection.value.activeGuineaPigIds = [oldActiveId]
      }
      delete (collection.value as any).activeGuineaPigId
      console.log('Migrated from single active guinea pig to pair system')
    }

    // Ensure active guinea pigs exist and clean up invalid IDs
    collection.value.activeGuineaPigIds = collection.value.activeGuineaPigIds.filter(id => {
      if (!collection.value.guineaPigs[id]) {
        console.warn(`Active guinea pig ${id} not found, removing from active list`)
        return false
      }
      return true
    })

    // Validate guinea pig data integrity
    for (const [id, guineaPig] of Object.entries(collection.value.guineaPigs)) {
      if (!guineaPig.id || !guineaPig.name || !guineaPig.birthDate) {
        console.warn(`Invalid guinea pig data for ${id}, removing`)
        delete collection.value.guineaPigs[id]
        // Also remove from active list if present
        const activeIndex = collection.value.activeGuineaPigIds.indexOf(id)
        if (activeIndex !== -1) {
          collection.value.activeGuineaPigIds.splice(activeIndex, 1)
        }
      }
    }
  }

  // Pet store integration methods
  const resetGuineaPigNeeds = (id: string): boolean => {
    const guineaPig = collection.value.guineaPigs[id]
    if (!guineaPig) return false

    guineaPig.needs = {
      // Critical Needs
      hunger: 100,
      thirst: 100,
      energy: 100,
      shelter: 100,
      // Environmental Needs
      play: 100,
      social: 100,
      comfort: 100,
      // Maintenance Needs
      hygiene: 100,
      nails: 100,
      chew: 100
    }

    guineaPig.stats.overallMood = 0

    collection.value.lastUpdated = Date.now()

    const logging = getLoggingStore()
    logging.logInfo(`Reset needs for guinea pig: ${guineaPig.name}`)

    return true
  }

  const returnToStore = (id: string): boolean => {
    const guineaPig = collection.value.guineaPigs[id]
    if (!guineaPig) return false

    // Guinea pigs are always in the collection, this is just for metadata/logging
    const logging = getLoggingStore()
    logging.logInfo(`Guinea pig ${guineaPig.name} returned to store`)

    return true
  }

  const adjustFriendship = (id: string, amount: number): boolean => {
    const guineaPig = collection.value.guineaPigs[id]
    if (!guineaPig) return false

    // Phase 4: Don't adjust friendship if frozen (in Stardust Sanctuary)
    if (guineaPig.friendshipFrozen) return false

    guineaPig.friendship = Math.max(0, Math.min(100, guineaPig.friendship + amount))
    collection.value.lastUpdated = Date.now()

    // Removed friendship change logging to prevent spam
    // This was being called every 5 seconds by wellness penalty/bonus system
    // Creating dozens of messages per minute

    return true
  }

  // Helper to map food subCategory to FoodType
  const getFoodTypeFromSubCategory = (subCategory: string): FoodType | null => {
    const mapping: Record<string, FoodType> = {
      'fruits': 'fruit',
      'vegetables': 'vegetables',
      'pellets': 'pellets',
      'treats': 'treats',
      'greens': 'greens',
      'herbs': 'herbs'
    }
    return mapping[subCategory] || null
  }

  // System 2.5: Consumption tracking helpers
  const checkConsumptionLimit = (guineaPigId: string, foodType: FoodType): boolean => {
    const guineaPig = collection.value.guineaPigs[guineaPigId]
    if (!guineaPig) return false

    if (foodType === 'hay') return true // Hay is unlimited

    // All non-hay foods share a combined limit of 5 servings
    const totalConsumed =
      guineaPig.consumptionLimits.fruit.consumed +
      guineaPig.consumptionLimits.vegetables.consumed +
      guineaPig.consumptionLimits.pellets.consumed +
      guineaPig.consumptionLimits.treats.consumed +
      guineaPig.consumptionLimits.herbs.consumed +
      guineaPig.consumptionLimits.greens.consumed

    return totalConsumed < 5
  }

  const getRemainingServings = (guineaPigId: string, foodType: FoodType): number => {
    const guineaPig = collection.value.guineaPigs[guineaPigId]
    if (!guineaPig) return 0

    if (foodType === 'hay') return -1 // Unlimited indicator

    // All non-hay foods share a combined limit of 5 servings
    const totalConsumed =
      guineaPig.consumptionLimits.fruit.consumed +
      guineaPig.consumptionLimits.vegetables.consumed +
      guineaPig.consumptionLimits.pellets.consumed +
      guineaPig.consumptionLimits.treats.consumed +
      guineaPig.consumptionLimits.herbs.consumed +
      guineaPig.consumptionLimits.greens.consumed

    return Math.max(0, 5 - totalConsumed)
  }

  const resetConsumptionLimits = (guineaPigId: string): void => {
    const guineaPig = collection.value.guineaPigs[guineaPigId]
    if (!guineaPig) return

    guineaPig.consumptionLimits.fruit.consumed = 0
    guineaPig.consumptionLimits.vegetables.consumed = 0
    guineaPig.consumptionLimits.pellets.consumed = 0
    guineaPig.consumptionLimits.treats.consumed = 0
    guineaPig.consumptionLimits.herbs.consumed = 0
    guineaPig.consumptionLimits.greens.consumed = 0
    guineaPig.lastHungerResetLevel = guineaPig.needs.hunger

    collection.value.lastUpdated = Date.now()
  }

  // System 2.5: Interaction rejection mechanics
  const calculateRejectionProbability = (guineaPigId: string): number => {
    const guineaPig = collection.value.guineaPigs[guineaPigId]
    if (!guineaPig) return 0

    const needsController = useNeedsController()
    const wellness = needsController.calculateWellness(guineaPigId)
    const friendliness = guineaPig.personality.friendliness
    const friendship = guineaPig.friendship

    // Base rejection rate
    let baseRate = 0
    if (friendship < 30) {
      if (friendliness <= 3) {
        baseRate = 75
      } else if (friendliness >= 8) {
        baseRate = 50
      } else {
        // Linear interpolation for mid-range friendliness
        baseRate = 75 - ((friendliness - 3) / 5) * 25
      }
    } else if (friendship >= 70) {
      baseRate = 10 // Minimal rejection for high friendship
    } else {
      // Linear interpolation for mid-range friendship
      const friendshipFactor = (friendship - 30) / 40
      const lowFriendlinessRate = friendliness <= 3 ? 75 : 50
      baseRate = lowFriendlinessRate - (friendshipFactor * (lowFriendlinessRate - 10))
    }

    // Wellness modifiers
    let wellnessModifier = 0
    if (wellness < 30) {
      wellnessModifier = 30 // Too tired, wants to rest
    } else if (wellness < 50) {
      wellnessModifier = 15 // Low energy, not feeling well
    } else if (wellness > 70) {
      wellnessModifier = -30 // Healthy, in good mood
    }

    const finalRate = Math.max(0, Math.min(100, baseRate + wellnessModifier))
    return finalRate
  }

  const calculateRejectionCooldown = (guineaPigId: string): number => {
    const guineaPig = collection.value.guineaPigs[guineaPigId]
    if (!guineaPig) return 30

    const needsController = useNeedsController()
    const wellness = needsController.calculateWellness(guineaPigId)
    const friendship = guineaPig.friendship

    // Base cooldown: 30s + friendship factor (0-90s)
    const friendshipFactor = (100 - friendship) * 0.9
    let cooldown = 30 + friendshipFactor

    // Wellness modifier
    if (wellness > 70) {
      cooldown -= 15 // Recovers faster, in good mood
    } else if (wellness < 30) {
      cooldown += 15 // Needs more recovery time
    }

    return Math.max(30, Math.min(120, cooldown))
  }

  const applyRejectionPenalty = (guineaPigId: string): number => {
    const guineaPig = collection.value.guineaPigs[guineaPigId]
    if (!guineaPig) return 0

    // Random penalty between -1% and -5%
    const penalty = -(1 + Math.random() * 4)
    adjustFriendship(guineaPigId, penalty)

    return penalty
  }

  // System 17: Guinea Pig Selection Methods
  const selectGuineaPig = (guineaPigId: string): boolean => {
    const guineaPig = collection.value.guineaPigs[guineaPigId]
    if (!guineaPig) return false

    // If we're selecting a different guinea pig, release control of the currently controlled one
    const previousSelection = selectedGuineaPigId.value
    if (previousSelection && previousSelection !== guineaPigId) {
      // Release manual control of the previously selected guinea pig
      const previousGP = collection.value.guineaPigs[previousSelection]
      if (previousGP?.isManuallyControlled) {
        previousGP.isManuallyControlled = false
        previousGP.manualControlTarget = null
      }
    }

    selectedGuineaPigId.value = guineaPigId
    return true
  }

  const clearSelection = (): void => {
    selectedGuineaPigId.value = null
  }

  // System 21: Bond Management Functions

  /**
   * Create a bond between two guinea pigs
   * Automatically calculates compatibility score
   */
  const createBond = (gp1Id: string, gp2Id: string): ActiveBond | null => {
    ensureActiveBondsIsMap()
    const gp1 = collection.value.guineaPigs[gp1Id]
    const gp2 = collection.value.guineaPigs[gp2Id]

    if (!gp1 || !gp2) {
      console.error('Cannot create bond: One or both guinea pigs not found')
      return null
    }

    // Check if bond already exists
    const existingBond = getBond(gp1Id, gp2Id)
    if (existingBond) {
      return existingBond
    }

    const compatibilityScore = calculateCompatibility(gp1, gp2)

    const bondId = `bond_${gp1Id}_${gp2Id}_${Date.now()}`
    const bond: ActiveBond = {
      id: bondId,
      guineaPig1Id: gp1Id,
      guineaPig2Id: gp2Id,
      bondingLevel: 0,
      bondingTier: 'neutral',
      compatibilityScore,
      createdAt: Date.now(),
      lastInteraction: Date.now(),
      totalInteractions: 0,
      proximityTime: 0,
      bondingHistory: []
    }

    // Create new Map to trigger reactivity
    const newBonds = new Map(activeBonds.value)
    newBonds.set(bondId, bond)
    activeBonds.value = newBonds

    getLoggingStore().logInfo(`Bond created between ${gp1.name} and ${gp2.name} (compatibility: ${compatibilityScore})`)
    return bond
  }

  /**
   * Get bond between two specific guinea pigs
   */
  const getBond = (gp1Id: string, gp2Id: string): ActiveBond | null => {
    ensureActiveBondsIsMap()
    for (const bond of activeBonds.value.values()) {
      if (
        (bond.guineaPig1Id === gp1Id && bond.guineaPig2Id === gp2Id) ||
        (bond.guineaPig1Id === gp2Id && bond.guineaPig2Id === gp1Id)
      ) {
        return bond
      }
    }
    return null
  }

  /**
   * Get the active bond for a guinea pig (if any)
   */
  const getActiveBond = (guineaPigId: string): ActiveBond | null => {
    ensureActiveBondsIsMap()
    for (const bond of activeBonds.value.values()) {
      if (bond.guineaPig1Id === guineaPigId || bond.guineaPig2Id === guineaPigId) {
        return bond
      }
    }
    return null
  }

  /**
   * Get bond by ID
   */
  const getBondById = (bondId: string): ActiveBond | null => {
    ensureActiveBondsIsMap()
    return activeBonds.value.get(bondId) || null
  }

  /**
   * Get the partner guinea pig ID from a bond
   */
  const getPartnerGuineaPig = (guineaPigId: string, bond: ActiveBond): GuineaPig | null => {
    const partnerId = bond.guineaPig1Id === guineaPigId ? bond.guineaPig2Id : bond.guineaPig1Id
    return collection.value.guineaPigs[partnerId] || null
  }

  /**
   * Update bonding level (positive only)
   */
  const updateBondingLevel = (bondId: string, increase: number): boolean => {
    ensureActiveBondsIsMap()
    const bond = activeBonds.value.get(bondId)
    if (!bond) return false

    const previousTier = bond.bondingTier

    // Increase bonding level (clamped to 100)
    bond.bondingLevel = Math.min(100, bond.bondingLevel + increase)

    // Update tier based on new level
    bond.bondingTier = getBondingTier(bond.bondingLevel)

    // Create new Map to trigger reactivity
    const newBonds = new Map(activeBonds.value)
    newBonds.set(bondId, { ...bond })
    activeBonds.value = newBonds

    // Log tier changes
    if (bond.bondingTier !== previousTier) {
      const gp1 = collection.value.guineaPigs[bond.guineaPig1Id]
      const gp2 = collection.value.guineaPigs[bond.guineaPig2Id]
      getLoggingStore().logInfo(`${gp1?.name} and ${gp2?.name} bonding tier changed: ${previousTier} → ${bond.bondingTier}`)
    }

    return true
  }

  /**
   * Calculate bonding tier from bonding level
   */
  const getBondingTier = (bondingLevel: number): 'neutral' | 'friends' | 'bonded' => {
    if (bondingLevel >= 71) return 'bonded'
    if (bondingLevel >= 31) return 'friends'
    return 'neutral'
  }

  /**
   * Add a bonding event to history
   */
  const addBondingEvent = (bondId: string, event: BondingEvent): boolean => {
    ensureActiveBondsIsMap()
    const bond = activeBonds.value.get(bondId)
    if (!bond) return false

    bond.bondingHistory.push(event)
    bond.lastInteraction = event.timestamp
    bond.totalInteractions++

    // Create new Map to trigger reactivity
    const newBonds = new Map(activeBonds.value)
    newBonds.set(bondId, { ...bond })
    activeBonds.value = newBonds

    return true
  }

  /**
   * Increase bonding through interaction
   */
  const increaseBonding = (bondId: string, amount: number, eventType: BondingEvent['type'], description: string): boolean => {
    ensureActiveBondsIsMap()
    const bond = activeBonds.value.get(bondId)
    if (!bond) return false

    // Create bonding event
    const event: BondingEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type: eventType,
      bondingChange: amount,
      description
    }

    addBondingEvent(bondId, event)
    return updateBondingLevel(bondId, amount)
  }

  /**
   * Update proximity time for a bond
   */
  const updateProximityTime = (bondId: string, minutesToAdd: number): boolean => {
    ensureActiveBondsIsMap()
    const bond = activeBonds.value.get(bondId)
    if (!bond) return false

    // Update proximity time (stored in minutes)
    bond.proximityTime += minutesToAdd

    // Create new Map to trigger reactivity
    const newBonds = new Map(activeBonds.value)
    newBonds.set(bondId, { ...bond })
    activeBonds.value = newBonds

    return true
  }

  /**
   * Get all active bonds
   */
  const getAllBonds = (): ActiveBond[] => {
    ensureActiveBondsIsMap()
    // Auto-create bonds if they don't exist yet
    if (activeBonds.value.size === 0 && activeGuineaPigs.value.length >= 2) {
      ensureBondsExist()
    }
    return Array.from(activeBonds.value.values())
  }

  /**
   * Get bonds for a specific guinea pig (optimized - avoids getAllBonds filter)
   */
  const getBondsForGuineaPig = (guineaPigId: string): ActiveBond[] => {
    ensureActiveBondsIsMap()

    // Auto-create bonds if they don't exist yet
    if (activeBonds.value.size === 0 && activeGuineaPigs.value.length >= 2) {
      ensureBondsExist()
    }

    const bonds: ActiveBond[] = []

    for (const bond of activeBonds.value.values()) {
      if (bond.guineaPig1Id === guineaPigId || bond.guineaPig2Id === guineaPigId) {
        bonds.push(bond)
      }
    }

    return bonds
  }

  /**
   * Auto-create bonds for active guinea pigs
   * Called when guinea pigs are activated
   */
  const ensureBondsExist = (): void => {
    ensureActiveBondsIsMap()
    const activeIds = collection.value.activeGuineaPigIds || []

    // Need at least 2 active guinea pigs for bonding
    if (activeIds.length < 2) return

    // Create bonds for all pairs of active guinea pigs
    for (let i = 0; i < activeIds.length; i++) {
      for (let j = i + 1; j < activeIds.length; j++) {
        const gp1Id = activeIds[i]
        const gp2Id = activeIds[j]

        // Create bond if it doesn't exist
        if (!getBond(gp1Id, gp2Id)) {
          createBond(gp1Id, gp2Id)
        }
      }
    }
  }

  /**
   * Get personality-based habitat sensitivity thresholds
   * Sprint: Personality-Based Habitat Sensitivity
   *
   * Cleanliness trait affects how sensitive guinea pig is to habitat conditions:
   * - Picky (7-10): Won't eat hay <60% fresh, stressed by mess (higher thresholds)
   * - Moderate (4-6): Baseline 40% thresholds
   * - Piggy (1-3): Tolerates mess, eats hay down to 20% fresh (lower thresholds)
   */
  const getHabitatSensitivityThresholds = (guineaPigId: string) => {
    const guineaPig = collection.value.guineaPigs[guineaPigId]
    if (!guineaPig) {
      // Default moderate thresholds
      return {
        hayFreshnessMin: 40,
        cleanlinessMin: 40,
        beddingMin: 40
      }
    }

    const cleanliness = guineaPig.personality.cleanliness

    // Picky guinea pigs (7-10) - High sensitivity
    if (cleanliness >= 7) {
      return {
        hayFreshnessMin: 60,  // Won't eat hay below 60% fresh
        cleanlinessMin: 60,   // Stressed by mess below 60%
        beddingMin: 60        // Needs fresh bedding above 60%
      }
    }

    // Piggy guinea pigs (1-3) - Low sensitivity, very tolerant
    if (cleanliness <= 3) {
      return {
        hayFreshnessMin: 20,  // Will eat hay down to 20% fresh
        cleanlinessMin: 20,   // Tolerates mess down to 20%
        beddingMin: 20        // Fine with bedding down to 20%
      }
    }

    // Moderate guinea pigs (4-6) - Baseline thresholds
    return {
      hayFreshnessMin: 40,
      cleanlinessMin: 40,
      beddingMin: 40
    }
  }

  /**
   * Clear all bonds (called when starting a new game session)
   */
  const clearAllBonds = (): void => {
    ensureActiveBondsIsMap()
    activeBonds.value.clear()
    console.log('🧹 Cleared all social bonds')
  }

  /**
   * Check if guinea pig will accept current habitat conditions
   * Returns true if habitat meets their personality-based thresholds
   */
  const willAcceptHabitatConditions = (guineaPigId: string, habitatConditions: {
    hayFreshness: number
    cleanliness: number
    beddingFreshness: number
  }): boolean => {
    const thresholds = getHabitatSensitivityThresholds(guineaPigId)

    return (
      habitatConditions.hayFreshness >= thresholds.hayFreshnessMin &&
      habitatConditions.cleanliness >= thresholds.cleanlinessMin &&
      habitatConditions.beddingFreshness >= thresholds.beddingMin
    )
  }

  const isInteractionOnCooldown = (guineaPigId: string): boolean => {
    const guineaPig = collection.value.guineaPigs[guineaPigId]
    if (!guineaPig) return false

    if (!guineaPig.interactionRejection.isOnCooldown) return false

    const now = Date.now()
    if (guineaPig.interactionRejection.cooldownEndTime && now >= guineaPig.interactionRejection.cooldownEndTime) {
      // Cooldown expired, clear it
      guineaPig.interactionRejection.isOnCooldown = false
      guineaPig.interactionRejection.cooldownEndTime = null
      collection.value.lastUpdated = Date.now()
      return false
    }

    return true
  }

  const getRemainingCooldown = (guineaPigId: string): number => {
    const guineaPig = collection.value.guineaPigs[guineaPigId]
    if (!guineaPig || !guineaPig.interactionRejection.cooldownEndTime) return 0

    const now = Date.now()
    const remaining = Math.max(0, guineaPig.interactionRejection.cooldownEndTime - now)
    return Math.ceil(remaining / 1000) // Convert to seconds
  }

  const attemptInteraction = (guineaPigId: string, interactionType: InteractionType): InteractionResult => {
    const guineaPig = collection.value.guineaPigs[guineaPigId]
    if (!guineaPig) {
      return {
        success: false,
        rejected: false,
        message: 'Guinea pig not found'
      }
    }

    // Check if on cooldown
    if (isInteractionOnCooldown(guineaPigId)) {
      const remainingSeconds = getRemainingCooldown(guineaPigId)
      return {
        success: false,
        rejected: false,
        message: `${guineaPig.name} needs some space. Try again in ${remainingSeconds}s`,
        cooldownSeconds: remainingSeconds
      }
    }

    // Calculate rejection probability
    const rejectionChance = calculateRejectionProbability(guineaPigId)
    const roll = Math.random() * 100

    if (roll < rejectionChance) {
      // Rejected!
      const cooldownSeconds = calculateRejectionCooldown(guineaPigId)
      const penalty = applyRejectionPenalty(guineaPigId)

      const now = Date.now()
      guineaPig.interactionRejection.lastRejectionTime = now
      guineaPig.interactionRejection.cooldownEndTime = now + (cooldownSeconds * 1000)
      guineaPig.interactionRejection.isOnCooldown = true
      guineaPig.interactionRejection.rejectionCount += 1
      collection.value.lastUpdated = Date.now()

      const interactionVerb = interactionType === 'play' ? 'play' : 'socialize'
      getLoggingStore().addPlayerAction(
        `${guineaPig.name} ran away! Not interested in ${interactionVerb}ing right now 🏃`,
        '🚫',
        {
          guineaPigId,
          interactionType,
          rejectionChance: rejectionChance.toFixed(1),
          cooldownSeconds,
          friendshipPenalty: penalty.toFixed(2)
        }
      )

      return {
        success: false,
        rejected: true,
        message: `${guineaPig.name} ran away! Try again in ${cooldownSeconds}s`,
        cooldownSeconds,
        friendshipPenalty: penalty
      }
    }

    // Accepted!
    return {
      success: true,
      rejected: false,
      message: `${guineaPig.name} accepts the ${interactionType} interaction`
    }
  }

  /**
   * Set needs decay rate multiplier (capped at 2x)
   */
  const setNeedsDecayRate = (multiplier: number) => {
    settings.value.needsDecayRate = Math.max(0, Math.min(2, multiplier))
  }

  /**
   * Manual Control System Methods
   */
  const setManualControl = (guineaPigId: string, controlled: boolean) => {
    const guineaPig = collection.value.guineaPigs[guineaPigId]
    if (!guineaPig) return false

    guineaPig.isManuallyControlled = controlled
    if (!controlled) {
      guineaPig.manualControlTarget = null
    }

    collection.value.lastUpdated = Date.now()
    return true
  }

  const setManualControlTarget = (guineaPigId: string, target: { x: number; y: number } | null) => {
    const guineaPig = collection.value.guineaPigs[guineaPigId]
    if (!guineaPig || !guineaPig.isManuallyControlled) return false

    guineaPig.manualControlTarget = target
    collection.value.lastUpdated = Date.now()
    return true
  }

  const isManuallyControlled = (guineaPigId: string): boolean => {
    const guineaPig = collection.value.guineaPigs[guineaPigId]
    return guineaPig?.isManuallyControlled || false
  }

  const getManualControlTarget = (guineaPigId: string): { x: number; y: number } | null => {
    const guineaPig = collection.value.guineaPigs[guineaPigId]
    return guineaPig?.manualControlTarget || null
  }

  return {
    // State
    collection,
    settings,

    // Computed
    allGuineaPigs,
    guineaPigCount,
    hasGuineaPigs,
    canAddMoreGuineaPigs,
    activeGuineaPig,        // For backward compatibility
    activeGuineaPigs,       // New: Array of active guinea pigs
    activeGuineaPigPair,    // New: Pair when exactly 2 are active
    canAddActiveGuineaPig,  // New: Can add more to active pair

    // System 17: Selection
    selectedGuineaPigId,
    selectGuineaPig,
    clearSelection,

    // System 21: Bonding
    activeBonds,
    createBond,
    getBond,
    getActiveBond,
    getBondById,
    getPartnerGuineaPig,
    getBondsForGuineaPig,
    updateBondingLevel,
    updateProximityTime,
    getBondingTier,
    addBondingEvent,
    increaseBonding,
    getAllBonds,
    ensureBondsExist,
    clearAllBonds,

    // Personality-Based Habitat Sensitivity
    getHabitatSensitivityThresholds,
    willAcceptHabitatConditions,

    // CRUD Operations
    getGuineaPig,
    updateGuineaPig,
    deleteGuineaPig,

    // Active management
    setActiveGuineaPig,     // For backward compatibility
    addToActivePair,        // New: Add guinea pig to active pair
    removeFromActivePair,   // New: Remove guinea pig from active pair
    setActivePair,          // New: Set the entire active pair

    // Utility
    generateGuineaPigId,

    // Save/Load
    getState,
    loadState,

    // Initialization
    initializeStore,

    // Pet store integration
    resetGuineaPigNeeds,
    returnToStore,

    // Relationship management
    adjustFriendship,

    // Needs system
    needsDecayRates,
    needsLastUpdate,
    setNeedsDecayRate,
    processNeedsDecay,
    processBatchNeedsDecay,
    adjustNeed,
    satisfyNeed,

    // System 2.5: Consumption tracking
    getFoodTypeFromSubCategory,
    checkConsumptionLimit,
    getRemainingServings,
    resetConsumptionLimits,

    // System 2.5: Interaction rejection
    calculateRejectionProbability,
    calculateRejectionCooldown,
    applyRejectionPenalty,
    getRemainingCooldown,
    attemptInteraction,

    // Phase 0: Interaction cooldowns
    calculateInteractionCooldown,
    checkInteractionCooldown,

    // Manual Control System
    setManualControl,
    setManualControlTarget,
    isManuallyControlled,
    getManualControlTarget,

    // Interaction methods
    feedGuineaPig,
    giveWater,
    cleanGuineaPig,
    playWithGuineaPig,
    socializeWithGuineaPig,
    rearrangeCage,
    provideBedding,
    provideChewToy,
    trimNails,
    provideShelter,
    sootheToSleep
  }
}, {
  persist: {
    key: 'gps2-guinea-pig-store',
    storage: localStorage,
    serializer: {
      serialize: (state: any) => {
        // Convert activeBonds Map to array for serialization
        const serializedState = {
          ...state,
          activeBonds: Array.from(state.activeBonds.entries())
        }
        return JSON.stringify(serializedState)
      },
      deserialize: (value: string) => {
        const state = JSON.parse(value)
        // Convert activeBonds array back to Map
        if (Array.isArray(state.activeBonds)) {
          state.activeBonds = new Map(state.activeBonds)
        } else {
          state.activeBonds = new Map()
        }
        return state
      }
    }
  }
})