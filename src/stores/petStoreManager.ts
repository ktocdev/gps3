/**
 * Guinea Pig Simulation Game (GPS2)
 * Copyright (c) 2025 ktocdev. All Rights Reserved.
 *
 * This file is part of the GPS2 proprietary software.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { GuineaPig } from './guineaPigStore'
import { useLoggingStore } from './loggingStore'
import { usePlayerProgression } from './playerProgression'
import { useGuineaPigStore } from './guineaPigStore'
import { useGameController } from './gameController'
import { useNeedsController } from './needsController'
import { useHabitatConditions } from './habitatConditions'
import { useInventoryStore } from './inventoryStore'
import { useSuppliesStore } from './suppliesStore'
import { hasServingSystem, getServingCount } from '../utils/servingSystem'

export interface GameSession {
  id: string
  startedAt: number
  guineaPigIds: string[]
  sessionDuration: number
}

interface PetStoreSettings {
  // Future settings can be added here
}

export const usePetStoreManager = defineStore('petStoreManager', () => {
  let loggingStore: any = null
  const getLoggingStore = () => {
    if (!loggingStore) {
      loggingStore = useLoggingStore()
    }
    return loggingStore
  }

  const availableGuineaPigs = ref<GuineaPig[]>([])
  const activeGameSession = ref<GameSession | null>(null)

  // Phase 3: Stardust Sanctuary
  const sanctuaryGuineaPigs = ref<GuineaPig[]>([])
  const maxSanctuarySlots = ref<number>(10)

  const settings = ref<PetStoreSettings>({
  })


  const activeSessionGuineaPigs = computed(() => {
    if (!activeGameSession.value) return []
    const guineaPigStore = useGuineaPigStore()
    return activeGameSession.value.guineaPigIds
      .map(id => guineaPigStore.getGuineaPig(id))
      .filter(Boolean) as GuineaPig[]
  })

  // Phase 3: Sanctuary computed properties
  const sanctuaryCount = computed(() => sanctuaryGuineaPigs.value.length)

  const availableSanctuarySlots = computed(() =>
    maxSanctuarySlots.value - sanctuaryCount.value
  )

  const canAddToSanctuary = computed(() =>
    sanctuaryCount.value < maxSanctuarySlots.value
  )

  // Phase 4: Store access gating
  const canAccessStore = computed(() => {
    // Can only access store when no active guinea pigs
    return activeGameSession.value?.guineaPigIds.length === 0 || !activeGameSession.value
  })

  function generateGuineaPigId(): string {
    return `gp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  const guineaPigNames = [
    'Peanut', 'Oreo', 'Cocoa', 'Ginger', 'Butterscotch', 'Cinnamon',
    'Pepper', 'Sugar', 'Honey', 'Mocha', 'Caramel', 'Biscuit',
    'Mochi', 'Truffle', 'Cookie', 'Marshmallow', 'Nugget', 'Pickles',
    'Snickers', 'Waffles', 'Toffee', 'Pudding', 'Brownie', 'Cupcake',
    'Popcorn', 'Nacho', 'Cheddar', 'Olive', 'Peaches', 'Pumpkin',
    'Patches', 'Whiskers', 'Fuzzy', 'Squeaky', 'Nibbles', 'Buttons',
    'Snowball', 'Shadow', 'Midnight', 'Dusty', 'Rusty', 'Smokey',
    'Spot', 'Freckles', 'Marble', 'Speckles', 'Domino', 'Checkers',
    'Bubbles', 'Happy', 'Lucky', 'Sunny', 'Joy', 'Sparkle',
    'Zippy', 'Dash', 'Rocket', 'Turbo', 'Flash', 'Zoom',
    'Cuddles', 'Snuggle', 'Buddy', 'Angel', 'Princess', 'Prince',
    'Clover', 'Daisy', 'Poppy', 'Rose', 'Lily', 'Willow',
    'Hazel', 'Maple', 'Cedar', 'Fern', 'Sage', 'Basil'
  ]

  // Simple arrays for UI exports
  const breeds = ['American', 'Abyssinian', 'Peruvian', 'Silkie', 'Teddy', 'Rex', 'Texel', 'Coronet', 'Alpaca', 'Baldwin', 'Merino', 'Skinny Pig', 'White Crested']

  const furColors = [
    'white', 'black', 'brown', 'cream', 'orange', 'gray',
    'red', 'gold', 'beige', 'chocolate', 'lilac', 'buff',
    'tortoiseshell', 'tricolor', 'dalmatian'
  ]

  const furPatterns = [
    'self', 'agouti', 'dutch', 'brindle', 'roan',
    'satin', 'himalayan', 'magpie'
  ]

  // Weighted arrays for rarity system
  interface WeightedItem {
    value: string
    weight: number
    rarity?: 'common' | 'uncommon' | 'rare' | 'very-rare' | 'ultra-rare'
  }

  const weightedBreeds: WeightedItem[] = [
    // Common breeds (American most common at weight 150, Abyssinian at 100)
    { value: 'American', weight: 150, rarity: 'common' },
    { value: 'Abyssinian', weight: 100, rarity: 'common' },
    // Uncommon breeds (weight 50)
    { value: 'Peruvian', weight: 50, rarity: 'uncommon' },
    { value: 'Teddy', weight: 50, rarity: 'uncommon' },
    { value: 'Rex', weight: 50, rarity: 'uncommon' },
    // Rare breeds (weight 20)
    { value: 'Silkie', weight: 20, rarity: 'rare' },
    { value: 'Texel', weight: 20, rarity: 'rare' },
    { value: 'Coronet', weight: 20, rarity: 'rare' },
    { value: 'White Crested', weight: 20, rarity: 'rare' },
    // Very rare breeds (weight 5)
    { value: 'Alpaca', weight: 5, rarity: 'very-rare' },
    { value: 'Merino', weight: 5, rarity: 'very-rare' },
    // Ultra rare breeds (weight 2)
    { value: 'Baldwin', weight: 2, rarity: 'ultra-rare' },
    { value: 'Skinny Pig', weight: 2, rarity: 'ultra-rare' }
  ]

  const weightedFurColors: WeightedItem[] = [
    // Common colors (weight 100)
    { value: 'black', weight: 100, rarity: 'common' },
    { value: 'white', weight: 100, rarity: 'common' },
    { value: 'brown', weight: 100, rarity: 'common' },
    { value: 'cream', weight: 100, rarity: 'common' },
    { value: 'tortoiseshell', weight: 100, rarity: 'common' },
    { value: 'tricolor', weight: 100, rarity: 'common' },
    // Uncommon colors (weight 80)
    { value: 'orange', weight: 80, rarity: 'uncommon' },
    { value: 'gray', weight: 80, rarity: 'uncommon' },
    { value: 'red', weight: 80, rarity: 'uncommon' },
    { value: 'gold', weight: 80, rarity: 'uncommon' },
    { value: 'beige', weight: 80, rarity: 'uncommon' },
    // Rare colors (weight 50)
    { value: 'chocolate', weight: 50, rarity: 'rare' },
    { value: 'lilac', weight: 50, rarity: 'rare' },
    { value: 'buff', weight: 50, rarity: 'rare' },
    { value: 'dalmatian', weight: 50, rarity: 'rare' }
  ]

  const weightedFurPatterns: WeightedItem[] = [
    // Common patterns (weight 100)
    { value: 'self', weight: 100, rarity: 'common' },
    { value: 'agouti', weight: 100, rarity: 'common' },
    // Uncommon patterns (weight 50)
    { value: 'dutch', weight: 50, rarity: 'uncommon' },
    { value: 'brindle', weight: 50, rarity: 'uncommon' },
    { value: 'magpie', weight: 50, rarity: 'uncommon' },
    // Rare patterns (weight 20)
    { value: 'roan', weight: 20, rarity: 'rare' },
    { value: 'satin', weight: 20, rarity: 'rare' },
    { value: 'himalayan', weight: 20, rarity: 'rare' }
  ]

  // Legacy arrays removed - now using Supplies Store dynamically

  const activities = [
    'tunnels', 'climbing', 'hiding_games', 'chewing',
    'exploring', 'puzzle_solving', 'foraging'
  ]

  const habitatFeatures = [
    'quiet_spaces', 'open_spaces', 'multi_level',
    'cozy_corners', 'viewing_platforms'
  ]

  // Weighted random selection function
  function weightedRandom(items: WeightedItem[]): string {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0)
    let random = Math.random() * totalWeight

    for (const item of items) {
      random -= item.weight
      if (random <= 0) {
        return item.value
      }
    }

    // Fallback (should never reach here)
    return items[0].value
  }

  // Helper function to get rarity of a trait
  function getRarity(value: string, weightedArray: WeightedItem[]): string | undefined {
    const item = weightedArray.find(i => i.value === value)
    return item?.rarity
  }

  function randomName(): string {
    return guineaPigNames[Math.floor(Math.random() * guineaPigNames.length)]
  }

  function randomBreed(): string {
    return weightedRandom(weightedBreeds)
  }

  function randomGender(): 'male' | 'female' {
    return Math.random() > 0.5 ? 'female' : 'male'
  }

  function randomFurColor(): string {
    return weightedRandom(weightedFurColors)
  }

  function randomFurPattern(breed?: string): string {
    // Hairless breeds (Baldwin, Skinny Pig) can only have skin pigmentation patterns
    // Exclude fur-specific patterns: agouti, brindle, roan, satin, himalayan
    const hairlessBreeds = ['Baldwin', 'Skinny Pig']
    const furSpecificPatterns = ['agouti', 'brindle', 'roan', 'satin', 'himalayan']

    if (breed && hairlessBreeds.includes(breed)) {
      const hairlessCompatiblePatterns = weightedFurPatterns.filter(
        pattern => !furSpecificPatterns.includes(pattern.value)
      )
      return weightedRandom(hairlessCompatiblePatterns)
    }

    return weightedRandom(weightedFurPatterns)
  }

  function randomEyeColor(furColor: string): string {
    // Light colors that are appropriate for pink/red eyes
    const lightColors = ['white', 'cream', 'beige', 'gray', 'lilac', 'buff']

    if (lightColors.includes(furColor)) {
      // Light colors: 25% pink/red, 20% blue, 55% brown/black
      const random = Math.random()

      if (random < 0.25) {
        // 25% chance of pink/red eyes
        return Math.random() < 0.5 ? 'pink' : 'red'
      } else if (random < 0.45) {
        // 20% chance of blue eyes (25% + 20% = 45%)
        return 'blue'
      } else {
        // 55% chance of brown/black eyes
        return Math.random() < 0.5 ? 'brown' : 'black'
      }
    } else {
      // Dark colors: 10% blue, 90% brown/black, no pink/red
      if (Math.random() < 0.1) {
        // 10% chance of blue eyes (rare)
        return 'blue'
      } else {
        // 90% chance of brown/black eyes
        return Math.random() < 0.5 ? 'brown' : 'black'
      }
    }
  }

  function pickRandomPreferences(items: string[], alreadyPicked: string[] = []): string[] {
    const available = items.filter(item => !alreadyPicked.includes(item))

    if (available.length === 0) return []

    const count = Math.random() < 0.5 ? 1 : 2

    const shuffled = [...available].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, Math.min(count, available.length))
  }

  function generateRandomPreferences() {
    const shuffleArray = (array: string[]) => [...array].sort(() => Math.random() - 0.5)
    const suppliesStore = useSuppliesStore()

    // Ensure catalog is loaded before generating preferences
    if (!suppliesStore.catalogLoaded) {
      console.warn('[generateRandomPreferences] Supplies catalog not loaded yet, returning empty preferences')
      return {
        favoriteFood: [],
        dislikedFood: [],
        favoriteActivity: [],
        habitatPreference: []
      }
    }

    // Get real food item IDs from Supplies Store
    const vegetables = suppliesStore.vegetables.map(item => item.id)
    const fruits = suppliesStore.fruits.map(item => item.id)
    const greens = suppliesStore.greens.map(item => item.id)
    const herbs = suppliesStore.herbs.map(item => item.id)
    const hayTypes = suppliesStore.allHay.map(item => item.id)

    const shuffledVegetables = shuffleArray(vegetables)
    const vegLikes = pickRandomPreferences(shuffledVegetables)
    const vegDislikes = pickRandomPreferences(shuffledVegetables, vegLikes)

    const shuffledFruits = shuffleArray(fruits)
    const fruitLikes = pickRandomPreferences(shuffledFruits)
    const fruitDislikes = pickRandomPreferences(shuffledFruits, fruitLikes)

    const shuffledGreens = shuffleArray(greens)
    const greensLikes = pickRandomPreferences(shuffledGreens)
    const greensDislikes = pickRandomPreferences(shuffledGreens, greensLikes)

    const shuffledHerbs = shuffleArray(herbs)
    const herbsLikes = pickRandomPreferences(shuffledHerbs)
    const herbsDislikes = pickRandomPreferences(shuffledHerbs, herbsLikes)

    const shuffledHay = shuffleArray(hayTypes)
    const hayLikes = pickRandomPreferences(shuffledHay)
    const hayDislikes = pickRandomPreferences(shuffledHay, hayLikes)

    const favoriteFood = [...vegLikes, ...fruitLikes, ...greensLikes, ...herbsLikes, ...hayLikes]
    const dislikedFood = [...vegDislikes, ...fruitDislikes, ...greensDislikes, ...herbsDislikes, ...hayDislikes]

    const shuffledActivities = shuffleArray(activities)
    const favoriteActivity = pickRandomPreferences(shuffledActivities)

    const shuffledHabitat = shuffleArray(habitatFeatures)
    const habitatPreference = pickRandomPreferences(shuffledHabitat)

    return {
      favoriteFood,
      dislikedFood,
      favoriteActivity,
      habitatPreference
    }
  }

  function generateRandomGuineaPig(): GuineaPig {
    const breed = randomBreed()
    const color = randomFurColor()
    const multiColorPatterns = ['tortoiseshell', 'tricolor', 'dalmatian']
    const pattern = multiColorPatterns.includes(color) ? 'self' : randomFurPattern(breed)

    const birthDate = Date.now() - (Math.floor(Math.random() * 730) + 30) * 24 * 60 * 60 * 1000

    return {
      id: generateGuineaPigId(),
      name: randomName(),
      gender: randomGender(),
      breed,
      birthDate,
      lastInteraction: Date.now(),

      personality: {
        friendliness: Math.floor(Math.random() * 10) + 1,
        playfulness: Math.floor(Math.random() * 10) + 1,
        curiosity: Math.floor(Math.random() * 10) + 1,
        boldness: Math.floor(Math.random() * 10) + 1,
        cleanliness: Math.floor(Math.random() * 10) + 1  // 1=tolerant/piggy, 10=picky/sensitive
      },

      preferences: generateRandomPreferences(),

      needs: {
        hunger: 60,  // Start at 60% to trigger food-seeking behavior quickly
        thirst: 80,  // Start at 80% thirst
        energy: 90,  // Start at 90% energy
        shelter: 60, // Start at 60% shelter
        play: 100,
        social: 100,
        comfort: 100,
        hygiene: 100,
        nails: 100,
        chew: 100
      },

      stats: {
        weight: Math.floor(Math.random() * 500) + 700,
        age: Math.floor((Date.now() - birthDate) / (1000 * 60 * 60 * 24)),
        level: 1,
        experience: 0,
        overallMood: 0
      },

      appearance: {
        furColor: color,
        furPattern: pattern,
        eyeColor: randomEyeColor(color),  // Now uses fur color-aware eye color selection
        size: ['small', 'medium', 'large'][Math.floor(Math.random() * 3)] as 'small' | 'medium' | 'large'
      },

      friendship: 0,
      friendshipFrozen: false,
      relationships: {},
      bonds: {},

      // System 2.5: Fulfillment Limitation System
      // All non-hay foods share a combined limit of 5 servings per hunger cycle
      // Hay is unlimited (not tracked)
      consumptionLimits: {
        fruit: { consumed: 0, limit: 5 },
        vegetables: { consumed: 0, limit: 5 },
        pellets: { consumed: 0, limit: 5 },
        treats: { consumed: 0, limit: 5 },
        herbs: { consumed: 0, limit: 5 },
        greens: { consumed: 0, limit: 5 }
      },
      interactionRejection: {
        lastRejectionTime: null,
        cooldownEndTime: null,
        rejectionCount: 0,
        isOnCooldown: false
      },
      lastHungerResetLevel: 100,

      // Phase 0: Interaction cooldowns
      lastPlayTime: null,
      lastSocialTime: null,

      // System 19: Autonomous AI Behaviors
      // Add random offset (0-30 seconds) to prevent all guinea pigs from pooping simultaneously
      lastPoopTime: Date.now() - Math.random() * 30000,

      // Phase 2: Adoption timers
      adoptionTimer: Date.now(),
      adoptionDuration: Math.floor(Math.random() * (5 * 24 * 60 * 60 * 1000 - 2 * 24 * 60 * 60 * 1000) + 2 * 24 * 60 * 60 * 1000), // 2-5 days in ms

      // Phase 7: Observe interaction
      observed: false,

      // Pet Adoption organization
      habitat: null,

      totalInteractions: 0,
      lifetimeHappiness: 100,
      achievementsUnlocked: []
    }
  }

  function generateRandomGuineaPigs(count: number = 10): void {
    const guineaPigs: GuineaPig[] = []

    for (let i = 0; i < count; i++) {
      guineaPigs.push(generateRandomGuineaPig())
    }

    // Assign guinea pigs to habitats (minimum 2 per habitat, prefer 3-4)
    let currentHabitat = 1
    let guineaPigsInCurrentHabitat = 0
    let guineaPigsPerHabitat = Math.floor(Math.random() * 2) + 3 // 3 or 4
    const bonded: number[] = [] // Track which guinea pigs should form bonded pairs

    for (let i = 0; i < guineaPigs.length; i++) {
      const guineaPig = guineaPigs[i]
      const remainingGuineaPigs = guineaPigs.length - i

      // Check if this is the last guinea pig
      const isLastGuineaPig = i === guineaPigs.length - 1

      // If we're about to move to a new habitat but only 1 guinea pig remains,
      // add it to the current habitat instead
      if (guineaPigsInCurrentHabitat >= guineaPigsPerHabitat && isLastGuineaPig) {
        // Keep in current habitat to avoid lone guinea pig
      } else if (guineaPigsInCurrentHabitat >= guineaPigsPerHabitat && remainingGuineaPigs >= 2) {
        // Only start new habitat if at least 2 guinea pigs remain
        currentHabitat++
        guineaPigsInCurrentHabitat = 0
        guineaPigsPerHabitat = Math.floor(Math.random() * 2) + 3 // 3 or 4 for next habitat
      }

      guineaPig.habitat = currentHabitat
      guineaPigsInCurrentHabitat++

      // If this is the start of a new habitat, randomly decide if it should have a bonded pair
      if (guineaPigsInCurrentHabitat === 1 && i + 1 < guineaPigs.length && Math.random() < 0.4) {
        // 40% chance of creating a bonded pair in this habitat
        bonded.push(i) // Mark these two indices as bonded
      }
    }

    // Apply bonded pair timers (give both guinea pigs the same adoption timer)
    for (const firstIndex of bonded) {
      const firstGuineaPig = guineaPigs[firstIndex]
      const secondGuineaPig = guineaPigs[firstIndex + 1]

      if (secondGuineaPig && firstGuineaPig.habitat === secondGuineaPig.habitat) {
        // Use the first guinea pig's timer for both
        secondGuineaPig.adoptionTimer = firstGuineaPig.adoptionTimer
        secondGuineaPig.adoptionDuration = firstGuineaPig.adoptionDuration
      }
    }

    availableGuineaPigs.value = guineaPigs

    const logging = getLoggingStore()
    logging.addPlayerAction(
      `Generated ${count} random guinea pigs for pet store 🏪${bonded.length > 0 ? ` (${bonded.length} bonded pairs)` : ''}`,
      '🏪',
      { count, bondedPairs: bonded.length }
    )
  }

  /**
   * Replenish the available guinea pig pool to maintain 10 guinea pigs
   * Called after guinea pigs are adopted
   */
  function replenishGuineaPigPool(): void {
    const targetCount = 10
    const currentCount = availableGuineaPigs.value.length
    const needed = targetCount - currentCount

    if (needed > 0) {
      const newGuineaPigs: GuineaPig[] = []

      for (let i = 0; i < needed; i++) {
        newGuineaPigs.push(generateRandomGuineaPig())
      }

      // Assign new guinea pigs to habitats (minimum 2 per habitat, prefer 3-4)
      // Find the highest existing habitat number
      const maxHabitat = availableGuineaPigs.value.reduce((max, gp) =>
        Math.max(max, gp.habitat || 1), 0)

      let currentHabitat = maxHabitat
      let guineaPigsInCurrentHabitat = availableGuineaPigs.value.filter(
        gp => gp.habitat === currentHabitat
      ).length

      // Ensure current habitat has at least 2 guinea pigs
      // If current habitat has only 1, add at least one more to it
      const minGuineaPigsNeeded = guineaPigsInCurrentHabitat === 1 ? 1 : 0
      let guineaPigsPerHabitat = Math.max(
        Math.floor(Math.random() * 2) + 3, // 3 or 4
        minGuineaPigsNeeded + guineaPigsInCurrentHabitat
      )

      for (let i = 0; i < newGuineaPigs.length; i++) {
        const guineaPig = newGuineaPigs[i]

        // Check if this is the last guinea pig
        const isLastGuineaPig = i === newGuineaPigs.length - 1

        if (guineaPigsInCurrentHabitat >= guineaPigsPerHabitat) {
          // Don't start a new habitat if this is the last guinea pig
          if (isLastGuineaPig) {
            // Add to previous habitat instead
            currentHabitat = Math.max(1, currentHabitat - 1)
            guineaPigsInCurrentHabitat = availableGuineaPigs.value.filter(
              gp => gp.habitat === currentHabitat
            ).length
          } else if (newGuineaPigs.length - i >= 2) {
            // Only start new habitat if at least 2 guinea pigs remain
            currentHabitat++
            guineaPigsInCurrentHabitat = 0
            guineaPigsPerHabitat = Math.floor(Math.random() * 2) + 3
          }
        }

        guineaPig.habitat = currentHabitat
        guineaPigsInCurrentHabitat++

        availableGuineaPigs.value.push(guineaPig)
      }

      const logging = getLoggingStore()
      logging.logInfo(`Replenished pet store with ${needed} new guinea pig${needed > 1 ? 's' : ''} 🏪`)
    }
  }

  // Phase 3: Stardust Sanctuary Management
  /**
   * Move a guinea pig to Stardust Sanctuary
   * Requires 85% friendship (validation should be done by caller)
   */
  function moveToSanctuary(guineaPigId: string): boolean {
    const guineaPigStore = useGuineaPigStore()
    const guineaPig = guineaPigStore.getGuineaPig(guineaPigId)

    if (!guineaPig) {
      getLoggingStore().logWarn('Guinea pig not found')
      return false
    }

    // Check if already in sanctuary
    const isAlreadyInSanctuary = sanctuaryGuineaPigs.value.some(gp => gp.id === guineaPigId)
    if (isAlreadyInSanctuary) {
      getLoggingStore().logWarn('Guinea pig is already in Stardust Sanctuary')
      return false
    }

    // Check slot availability
    if (!canAddToSanctuary.value) {
      getLoggingStore().logWarn('No available sanctuary slots')
      return false
    }

    // Check friendship threshold (85%)
    if (guineaPig.friendship < 85) {
      getLoggingStore().addPlayerAction(
        `${guineaPig.name} needs ${Math.ceil(85 - guineaPig.friendship)}% more friendship to enter Stardust Sanctuary 💫`,
        '💫',
        { guineaPigId, currentFriendship: guineaPig.friendship, required: 85 }
      )
      return false
    }

    // Find cagemate (the other active guinea pig)
    let cagemate: GuineaPig | null = null
    let cagemateId: string | null = null
    const isActive = activeGameSession.value?.guineaPigIds.includes(guineaPigId) ?? false
    if (isActive && activeGameSession.value) {
      const otherIds = activeGameSession.value.guineaPigIds.filter(id => id !== guineaPigId)
      if (otherIds.length > 0) {
        cagemateId = otherIds[0]
        cagemate = guineaPigStore.collection.guineaPigs[cagemateId]
      }
    }

    // Remove from active session if applicable
    if (isActive && activeGameSession.value) {
      const index = activeGameSession.value.guineaPigIds.indexOf(guineaPigId)
      if (index !== -1) {
        activeGameSession.value.guineaPigIds.splice(index, 1)
      }
      guineaPigStore.removeFromActivePair(guineaPigId)
    }

    // Reset needs to 100%
    guineaPigStore.resetGuineaPigNeeds(guineaPigId)

    // Freeze friendship
    guineaPig.friendshipFrozen = true

    // Phase 5: Save bonds with other sanctuary guinea pigs
    saveBonds(guineaPigId)

    // Add to sanctuary (create copy to avoid reference issues)
    sanctuaryGuineaPigs.value.push({ ...guineaPig })

    // Move cagemate if exists
    if (cagemate && cagemateId) {
      const cagemateIndex = activeGameSession.value!.guineaPigIds.indexOf(cagemateId)
      if (cagemateIndex !== -1) {
        activeGameSession.value!.guineaPigIds.splice(cagemateIndex, 1)
      }
      guineaPigStore.removeFromActivePair(cagemateId)

      // Reset needs to 100%
      guineaPigStore.resetGuineaPigNeeds(cagemateId)

      // Freeze friendship
      cagemate.friendshipFrozen = true

      // Phase 5: Save bonds with other sanctuary guinea pigs
      saveBonds(cagemateId)

      // Add to sanctuary
      sanctuaryGuineaPigs.value.push({ ...cagemate })

      getLoggingStore().addPlayerAction(
        `${guineaPig.name} and ${cagemate.name} have moved to Stardust Sanctuary together! ✨`,
        '✨',
        { guineaPigId, cagemateId, name1: guineaPig.name, name2: cagemate.name }
      )
    } else {
      getLoggingStore().addPlayerAction(
        `${guineaPig.name} has moved to Stardust Sanctuary! ✨`,
        '✨',
        { guineaPigId, name: guineaPig.name, friendship: guineaPig.friendship }
      )
    }

    // End session if all guinea pigs are now in sanctuary
    if (activeGameSession.value && activeGameSession.value.guineaPigIds.length === 0) {
      const gameController = useGameController()
      gameController.stopGame()
      activeGameSession.value = null
      getLoggingStore().addPlayerAction(
        'Game session ended - all guinea pigs in Stardust Sanctuary 🌟',
        '🌟'
      )
    }

    return true
  }

  /**
   * Move a guinea pig from Stardust Sanctuary back to active
   * Automatically brings cagemate if currently active
   */
  function moveFromSanctuary(guineaPigId: string): boolean {
    const index = sanctuaryGuineaPigs.value.findIndex(gp => gp.id === guineaPigId)
    if (index === -1) {
      getLoggingStore().logWarn('Guinea pig not found in sanctuary')
      return false
    }

    const guineaPig = sanctuaryGuineaPigs.value[index]

    // Find if there's a current active guinea pig (cagemate)
    const guineaPigStore = useGuineaPigStore()
    let cagemate: GuineaPig | null = null
    let cagemateId: string | null = null
    const currentActive = activeGameSession.value?.guineaPigIds.length ?? 0

    if (currentActive === 1 && activeGameSession.value) {
      cagemateId = activeGameSession.value.guineaPigIds[0]
      cagemate = guineaPigStore.collection.guineaPigs[cagemateId]
    }

    // Check if can add to active session (max 2)
    // If there's currently 1 active and we're bringing one back, we need to move current to sanctuary
    if (currentActive === 2) {
      getLoggingStore().addPlayerAction(
        `Cannot activate more than 2 guinea pigs at once. Deactivate some first 🚫`,
        '🚫',
        { guineaPigId }
      )
      return false
    }

    // Reset habitat when reactivating from sanctuary (fresh start)
    const habitatConditions = useHabitatConditions()
    habitatConditions.resetHabitatConditions()

    // Remove all poop
    habitatConditions.poops.length = 0

    // Clear all food from bowls
    habitatConditions.clearAllBowls()

    // Set average bedding (free on reactivation)
    habitatConditions.currentBedding = {
      type: 'Average Bedding',
      quality: 'average',
      absorbency: 1.0,
      decayRate: 1.0,
      color: 'yellow'
    }

    // If there's a cagemate, move it to sanctuary first
    if (cagemate && cagemateId && activeGameSession.value) {
      // Remove cagemate from active
      const cagemateIndex = activeGameSession.value.guineaPigIds.indexOf(cagemateId)
      if (cagemateIndex !== -1) {
        activeGameSession.value.guineaPigIds.splice(cagemateIndex, 1)
      }
      guineaPigStore.removeFromActivePair(cagemateId)

      // Reset needs to 100%
      guineaPigStore.resetGuineaPigNeeds(cagemateId)

      // Freeze friendship
      cagemate.friendshipFrozen = true

      // Save bonds
      saveBonds(cagemateId)

      // Add to sanctuary
      sanctuaryGuineaPigs.value.push({ ...cagemate })
    }

    // Remove from sanctuary
    sanctuaryGuineaPigs.value.splice(index, 1)

    // Unfreeze friendship
    guineaPig.friendshipFrozen = false

    // Add to active session
    if (!activeGameSession.value) {
      // Create new session
      startGameSession([guineaPigId])
    } else {
      // Add to existing session
      activeGameSession.value.guineaPigIds.push(guineaPigId)
      guineaPigStore.addToActivePair(guineaPigId)
    }

    // Log the movement
    if (cagemate) {
      getLoggingStore().addPlayerAction(
        `${guineaPig.name} has returned from Stardust Sanctuary! ${cagemate.name} moved to sanctuary 💚✨`,
        '💚',
        { guineaPigId, cagemateId, name1: guineaPig.name, name2: cagemate.name }
      )
    } else {
      getLoggingStore().addPlayerAction(
        `${guineaPig.name} has returned from Stardust Sanctuary! 💚`,
        '💚',
        { guineaPigId, name: guineaPig.name }
      )
    }

    return true
  }

  // Phase 2: Adoption Timer System
  /**
   * Process adoption timers for all store guinea pigs
   * Replaces guinea pigs whose adoption time has expired
   */
  function processAdoptionTimers(): void {
    const now = Date.now()
    const expiredGuineaPigs: string[] = []

    // Check all available guinea pigs for expired timers
    for (const guineaPig of availableGuineaPigs.value) {
      if (guineaPig.adoptionTimer !== null) {
        const expirationTime = guineaPig.adoptionTimer + guineaPig.adoptionDuration

        if (now >= expirationTime) {
          // Skip if guinea pig is in active session or sanctuary
          const isActive = activeGameSession.value?.guineaPigIds.includes(guineaPig.id) ?? false
          const isInSanctuary = sanctuaryGuineaPigs.value.some(gp => gp.id === guineaPig.id)

          if (!isActive && !isInSanctuary) {
            expiredGuineaPigs.push(guineaPig.id)
          }
        }
      }
    }

    // Replace expired guinea pigs with new ones
    for (const expiredId of expiredGuineaPigs) {
      const index = availableGuineaPigs.value.findIndex(gp => gp.id === expiredId)
      if (index !== -1) {
        const oldGuineaPig = availableGuineaPigs.value[index]
        const newGuineaPig = generateRandomGuineaPig()

        availableGuineaPigs.value.splice(index, 1, newGuineaPig)

        getLoggingStore().addPlayerAction(
          `${oldGuineaPig.name} was adopted by another family! ${newGuineaPig.name} has arrived at the store 🏪`,
          '🏪',
          {
            removedId: expiredId,
            removedName: oldGuineaPig.name,
            addedId: newGuineaPig.id,
            addedName: newGuineaPig.name
          }
        )
      }
    }
  }

  /**
   * Get time remaining until adoption for a guinea pig
   */
  function getAdoptionTimeRemaining(guineaPigId: string): number {
    const guineaPig = availableGuineaPigs.value.find(gp => gp.id === guineaPigId)
    if (!guineaPig || guineaPig.adoptionTimer === null) return 0

    const expirationTime = guineaPig.adoptionTimer + guineaPig.adoptionDuration
    const remaining = expirationTime - Date.now()

    return Math.max(0, remaining)
  }

  /**
   * Format adoption timer as human-readable string
   */
  function formatAdoptionTimer(ms: number): string {
    if (ms === 0) return 'Adopted'

    const days = Math.floor(ms / (1000 * 60 * 60 * 24))
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) {
      return `${days}d ${hours}h`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  // Phase 5: Pairing Validation & Bond Preservation
  /**
   * Validate if two guinea pigs can be paired together
   * Rules:
   * - Both new (from store): ✅ ALLOW
   * - Both from Sanctuary: ✅ ALLOW
   * - One new, one from Sanctuary: ❌ BLOCK
   */
  function validatePairing(guineaPigIds: string[]): { valid: boolean, reason?: string } {
    // Single guinea pig is always valid
    if (guineaPigIds.length === 1) {
      return { valid: true }
    }

    if (guineaPigIds.length !== 2) {
      return { valid: false, reason: 'Invalid number of guinea pigs' }
    }

    const [id1, id2] = guineaPigIds

    // Check if guinea pigs are in sanctuary
    const isInSanctuary1 = sanctuaryGuineaPigs.value.some(gp => gp.id === id1)
    const isInSanctuary2 = sanctuaryGuineaPigs.value.some(gp => gp.id === id2)

    // Both new or both from sanctuary is valid
    if (isInSanctuary1 === isInSanctuary2) {
      return { valid: true }
    }

    // One new, one sanctuary is invalid
    const guineaPigStore = useGuineaPigStore()
    const gp1 = guineaPigStore.getGuineaPig(id1) || availableGuineaPigs.value.find(gp => gp.id === id1)
    const gp2 = guineaPigStore.getGuineaPig(id2) || availableGuineaPigs.value.find(gp => gp.id === id2)

    const name1 = gp1?.name || 'Unknown'
    const name2 = gp2?.name || 'Unknown'

    const sanctuaryName = isInSanctuary1 ? name1 : name2
    const newName = isInSanctuary1 ? name2 : name1

    return {
      valid: false,
      reason: `Cannot pair ${sanctuaryName} (Sanctuary) with ${newName} (new). Guinea pigs must start from the same socialization level.`
    }
  }

  /**
   * Save bonds when guinea pig enters Sanctuary
   * Called when a guinea pig is moved to Sanctuary
   */
  function saveBonds(guineaPigId: string): void {
    const guineaPigStore = useGuineaPigStore()
    const guineaPig = guineaPigStore.getGuineaPig(guineaPigId)
    if (!guineaPig) return

    // Save bonds with other sanctuary guinea pigs
    for (const sanctuaryGuineaPig of sanctuaryGuineaPigs.value) {
      if (sanctuaryGuineaPig.id === guineaPigId) continue

      const relationshipLevel = guineaPig.relationships[sanctuaryGuineaPig.id] || 0

      // Only save significant relationships (50+)
      if (relationshipLevel >= 50) {
        guineaPig.bonds[sanctuaryGuineaPig.id] = {
          partnerId: sanctuaryGuineaPig.id,
          relationshipLevel,
          bondedAt: Date.now(),
          timesTogether: (guineaPig.bonds[sanctuaryGuineaPig.id]?.timesTogether || 0) + 1
        }
      }
    }
  }

  /**
   * Restore bonds when activating guinea pigs from Sanctuary
   * Called when starting a session with Sanctuary guinea pigs
   */
  function restoreBondsIfExists(guineaPigIds: string[]): void {
    if (guineaPigIds.length !== 2) return

    const guineaPigStore = useGuineaPigStore()
    const [id1, id2] = guineaPigIds

    const gp1 = guineaPigStore.getGuineaPig(id1)
    const gp2 = guineaPigStore.getGuineaPig(id2)

    if (!gp1 || !gp2) return

    // Check if they have a saved bond with each other
    const bond1 = gp1.bonds[id2]
    const bond2 = gp2.bonds[id1]

    if (bond1 && bond2) {
      // Restore relationship levels from bond
      gp1.relationships[id2] = bond1.relationshipLevel
      gp2.relationships[id1] = bond2.relationshipLevel

      // Update times together
      bond1.timesTogether += 1
      bond2.timesTogether += 1

      getLoggingStore().addPlayerAction(
        `${gp1.name} and ${gp2.name} remember each other! Bond restored 💕`,
        '💕',
        { guineaPigId1: id1, guineaPigId2: id2, bondLevel: bond1.relationshipLevel }
      )
    } else {
      // No previous bond, start fresh
      gp1.relationships[id2] = 0
      gp2.relationships[id1] = 0
    }
  }

  /**
   * Give starter inventory to new players
   * Called on first guinea pig adoption
   */
  function giveStarterInventory(): void {
    const inventoryStore = useInventoryStore()
    const suppliesStore = useSuppliesStore()
    const habitatConditions = useHabitatConditions()
    const logging = getLoggingStore()

    // CRITICAL: Initialize supplies catalog first (required for item lookups)
    if (!suppliesStore.catalogLoaded) {
      suppliesStore.initializeCatalog()
      console.log('📦 Initialized supplies catalog for starter inventory')
    }

    // Starter inventory items (based on item IDs from suppliesStore)
    const starterItems = [
      { itemId: 'hay_timothy', quantity: 3, name: 'Timothy Hay' },
      { itemId: 'bedding_average', quantity: 2, name: 'Average Bedding' },
      { itemId: 'food_pellets_standard', quantity: 1, name: 'Standard Pellets' },
      { itemId: 'food_green_leaf_lettuce', quantity: 1, name: 'Green Leaf Lettuce' },
      { itemId: 'food_carrot', quantity: 1, name: 'Carrot' },
      { itemId: 'habitat_apple_wood_sticks', quantity: 1, name: 'Apple Wood Sticks' },
      { itemId: 'habitat_willow_ball', quantity: 1, name: 'Willow Ball' }
    ]

    // Starter habitat items (items that start in the habitat)
    const starterHabitatItems = [
      { itemId: 'habitat_basic_water_bottle', quantity: 1, name: 'Basic Water Bottle' },
      { itemId: 'habitat_plastic_igloo', quantity: 1, name: 'Plastic Igloo' },
      { itemId: 'habitat_ceramic_bowl', quantity: 1, name: 'Basic Bowl' },
      { itemId: 'habitat_basic_hay_rack', quantity: 1, name: 'Basic Hay Rack' }
    ]

    // Add inventory items
    starterItems.forEach(({ itemId, quantity }) => {
      const item = suppliesStore.getItemById(itemId)

      if (hasServingSystem(item)) {
        const servings = getServingCount(item)
        // Add consumable with serving tracking
        for (let i = 0; i < quantity; i++) {
          inventoryStore.addConsumableWithServings(itemId, servings)
        }
      } else {
        // Standard inventory addition
        inventoryStore.addItem(itemId, quantity)
      }
      console.log(`✨ Added starter item: ${itemId} x${quantity}`)
    })

    // Add habitat items to inventory first
    starterHabitatItems.forEach(({ itemId, quantity }) => {
      inventoryStore.addItem(itemId, quantity)
      console.log(`✨ Added starter habitat item: ${itemId} x${quantity}`)
    })

    // Initialize habitat with starter items
    const habitatItemIds = starterHabitatItems.map(item => item.itemId)
    habitatConditions.initializeStarterHabitat(habitatItemIds)
    console.log(`🏠 Initialized habitat with ${habitatItemIds.length} starter items`)

    logging.addPlayerAction(
      'Received starter supplies and habitat! 🎁',
      '🎁',
      {
        items: starterItems.map(i => i.name),
        habitatItems: starterHabitatItems.map(i => i.name)
      }
    )

    console.log('✅ Starter inventory given to new player:', inventoryStore.allItems.length, 'item types')
  }

  function startGameSession(guineaPigIds: string[]): void {
    if (guineaPigIds.length < 1 || guineaPigIds.length > 2) {
      const logging = getLoggingStore()
      logging.logError('Invalid guinea pig count for game session (must be 1-2)')
      return
    }

    if (activeGameSession.value) {
      const logging = getLoggingStore()
      logging.logWarn('Game session already active')
      return
    }

    // Phase 5: Validate pairing
    const validation = validatePairing(guineaPigIds)
    if (!validation.valid) {
      const logging = getLoggingStore()
      logging.logWarn(validation.reason || 'Invalid pairing')
      return
    }

    const guineaPigStore = useGuineaPigStore()

    // Phase 5: Restore bonds if both guinea pigs are from Sanctuary
    restoreBondsIfExists(guineaPigIds)

    // Add guinea pigs to the guinea pig store collection before setting them as active
    // Guinea pigs come from either available pool or sanctuary
    for (const guineaPigId of guineaPigIds) {
      let guineaPig = availableGuineaPigs.value.find(gp => gp.id === guineaPigId)
      let fromSanctuary = false

      // If not in available pool, check sanctuary
      if (!guineaPig) {
        guineaPig = sanctuaryGuineaPigs.value.find(gp => gp.id === guineaPigId)
        fromSanctuary = true
      }

      if (guineaPig) {
        // Clear adoption timer when guinea pig becomes active
        guineaPig.adoptionTimer = null

        // Unfreeze friendship if coming from sanctuary
        if (fromSanctuary) {
          guineaPig.friendshipFrozen = false
        }

        // Add to guinea pig store collection
        guineaPigStore.collection.guineaPigs[guineaPigId] = { ...guineaPig }

        // Remove from source array
        if (fromSanctuary) {
          const index = sanctuaryGuineaPigs.value.findIndex(gp => gp.id === guineaPigId)
          if (index !== -1) {
            sanctuaryGuineaPigs.value.splice(index, 1)
          }
        } else {
          const index = availableGuineaPigs.value.findIndex(gp => gp.id === guineaPigId)
          if (index !== -1) {
            availableGuineaPigs.value.splice(index, 1)
          }
        }
      }
    }

    // Replenish available guinea pig pool after adoption
    replenishGuineaPigPool()

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    activeGameSession.value = {
      id: sessionId,
      startedAt: Date.now(),
      guineaPigIds: [...guineaPigIds],
      sessionDuration: 0
    }

    guineaPigStore.setActivePair(guineaPigIds)

    // Clear all previous bonds for fresh start with new guinea pigs
    guineaPigStore.clearAllBonds()

    // Initialize needs tracking for the guinea pigs
    const sessionStartTime = Date.now()
    for (const guineaPigId of guineaPigIds) {
      guineaPigStore.needsLastUpdate[guineaPigId] = sessionStartTime
    }

    // Enable needs processing for the session
    const needsController = useNeedsController()
    needsController.resumeProcessing()

    // Reset habitat to starter state (returns all non-default items to inventory)
    const habitatConditions = useHabitatConditions()
    habitatConditions.resetToStarterHabitat()

    const playerProgression = usePlayerProgression()
    playerProgression.incrementGameSessions()
    playerProgression.incrementGuineaPigsAdopted(guineaPigIds.length)

    // Give starter inventory on first guinea pig adoption
    if (playerProgression.guineaPigsAdopted === guineaPigIds.length) {
      giveStarterInventory()
    }

    // Start the game for the new session
    const gameController = useGameController()
    gameController.startGame()

    const logging = getLoggingStore()
    const names = activeSessionGuineaPigs.value.map(gp => gp.name).join(' & ')
    logging.addPlayerAction(
      `Started game session with ${names} ▶️`,
      '▶️',
      { sessionId, guineaPigIds }
    )
  }

  function initializeStore(): void {
    const logging = getLoggingStore()
    const suppliesStore = useSuppliesStore()

    // Ensure catalog is loaded before generating guinea pigs with preferences
    if (!suppliesStore.catalogLoaded) {
      suppliesStore.initializeCatalog()
    }

    if (availableGuineaPigs.value.length === 0) {
      generateRandomGuineaPigs(10)
    } else {
      // Regenerate preferences for any guinea pigs with empty preferences (from before migration)
      let regeneratedCount = 0
      for (const gp of availableGuineaPigs.value) {
        if (!gp.preferences.favoriteFood || gp.preferences.favoriteFood.length === 0) {
          gp.preferences = generateRandomPreferences()
          regeneratedCount++
        }
      }
      if (regeneratedCount > 0) {
        logging.logInfo(`Regenerated preferences for ${regeneratedCount} guinea pigs with empty preferences`)
      }
    }

    logging.logInfo(`Pet Store Manager initialized with ${availableGuineaPigs.value.length} guinea pigs`)
  }

  return {
    availableGuineaPigs,
    activeGameSession,
    settings,

    activeSessionGuineaPigs,

    // Phase 3: Sanctuary state and computed
    sanctuaryGuineaPigs,
    maxSanctuarySlots,
    sanctuaryCount,
    availableSanctuarySlots,
    canAddToSanctuary,

    // Phase 4: Store access gating
    canAccessStore,

    // Data arrays for UI components
    furColors,
    furPatterns,
    breeds,
    eyeColors: ['brown', 'black', 'red', 'blue', 'pink'],
    activities,
    habitatFeatures,

    // Weighted arrays for rarity display
    weightedBreeds,
    weightedFurColors,
    weightedFurPatterns,
    getRarity,

    generateRandomGuineaPigs,
    replenishGuineaPigPool,
    startGameSession,
    initializeStore,

    // Phase 2: Adoption timer methods
    processAdoptionTimers,
    getAdoptionTimeRemaining,
    formatAdoptionTimer,

    // Phase 3: Sanctuary methods
    moveToSanctuary,
    moveFromSanctuary,

    // Phase 5: Pairing validation and bond preservation
    validatePairing,
    saveBonds,
    restoreBondsIfExists
  }
}, {
  persist: {
    key: 'gps2-pet-store-manager',
    storage: localStorage
  }
})