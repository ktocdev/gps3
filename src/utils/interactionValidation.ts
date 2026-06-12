import type { GuineaPig } from '../stores/guineaPigStore'
import { generateReactionMessage } from '../data/guineaPigMessages'
import type { MessageContext, ReactionMessage } from '../data/guineaPigMessages'

export interface InteractionValidation {
  canInteract: boolean
  successRate: number
  wellnessTier: 'excellent' | 'good' | 'fair' | 'poor' | 'critical'
  rejectionReason?: 'tired' | 'stressed' | 'full' | 'limit_reached' | 'low_friendship' | 'low_wellness' | 'dirty_habitat' | 'too_shy' | 'not_bold_enough'
  reactionMessage?: ReactionMessage
}

export interface InteractionAttempt {
  success: boolean
  reactionMessage: ReactionMessage
  cooldownMs?: number
}

/**
 * Get wellness tier from wellness percentage
 */
export function getWellnessTier(wellness: number): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' {
  if (wellness >= 80) return 'excellent'
  if (wellness >= 60) return 'good'
  if (wellness >= 40) return 'fair'
  if (wellness >= 20) return 'poor'
  return 'critical'
}

/**
 * Calculate interaction success rate based on wellness tier
 * From System 22 spec
 */
export function getSuccessRateForWellness(wellnessTier: string): number {
  switch (wellnessTier) {
    case 'excellent': return 0.95
    case 'good': return 0.85
    case 'fair': return 0.70
    case 'poor': return 0.50
    case 'critical': return 0.20
    default: return 0.70
  }
}

/**
 * Get interaction type modifier
 * From System 22 spec
 */
export function getInteractionTypeModifier(interactionType: string): number {
  // Essential care interactions (feeding, water, cleaning) get +15% success
  if (['feed', 'hand-feed', 'water', 'clean'].includes(interactionType)) {
    return 0.15
  }

  // Physical handling interactions (hold, pick-up, weigh) get -10% success
  if (['hold', 'pick-up', 'weigh'].includes(interactionType)) {
    return -0.10
  }

  // Comfort interactions (pet, talk-to, sing-to) get +10% success
  if (['pet', 'talk-to', 'sing-to', 'gentle-wipe'].includes(interactionType)) {
    return 0.10
  }

  // Default: no modifier
  return 0
}

/**
 * Calculate personality modifier for interaction success
 * Boldness affects interaction acceptance
 */
export function getPersonalityModifier(guineaPig: GuineaPig): number {
  const boldness = guineaPig.personality.boldness

  // Boldness 1-3: Shy (-10% success)
  if (boldness <= 3) return -0.10

  // Boldness 8-10: Bold (+10% success)
  if (boldness >= 8) return 0.10

  // Boldness 4-7: Neutral (no modifier)
  return 0
}

/**
 * Calculate friendship modifier for interaction success
 */
export function getFriendshipModifier(friendship: number): number {
  if (friendship >= 80) return 0.15  // Best friends: +15%
  if (friendship >= 60) return 0.10  // Close: +10%
  if (friendship >= 40) return 0.05  // Friendly: +5%
  if (friendship >= 20) return 0     // Acquaintances: no modifier
  return -0.15                        // Strangers: -15%
}

/**
 * Validate if an interaction can proceed based on wellness, habitat quality, and personality
 */
export function validateInteraction(
  guineaPig: GuineaPig,
  wellness: number,
  interactionType: string,
  habitatQuality?: number
): InteractionValidation {
  const wellnessTier = getWellnessTier(wellness)
  const boldness = guineaPig.personality.boldness
  const friendship = guineaPig.friendship
  const habitat = habitatQuality ?? 100 // Default to perfect if not provided

  // Categorize interaction types
  const isPhysicalInteraction = ['pet', 'hold', 'pick-up', 'weigh'].includes(interactionType)
  const isCareInteraction = ['hand-feed', 'gentle-wipe', 'clean', 'water'].includes(interactionType)

  // Base success rate from wellness
  let successRate = getSuccessRateForWellness(wellnessTier)

  // Apply modifiers
  successRate += getInteractionTypeModifier(interactionType)
  successRate += getPersonalityModifier(guineaPig)
  successRate += getFriendshipModifier(friendship)

  // Habitat quality modifier (poor habitat = stressed guinea pig)
  if (habitat < 50) {
    successRate -= 0.20 // -20% for dirty/uncomfortable habitat
  } else if (habitat < 70) {
    successRate -= 0.10 // -10% for somewhat dirty habitat
  }

  // Clamp between 0 and 1
  successRate = Math.max(0, Math.min(1, successRate))

  // Determine rejection reason based on three-factor system
  let rejectionReason: InteractionValidation['rejectionReason']

  // Factor 1: Wellness-Based Rejection (< 50% wellness)
  // Physical interactions rejected, but care interactions ALWAYS accepted
  if (wellness < 50 && isPhysicalInteraction) {
    rejectionReason = 'low_wellness'
    successRate = 0 // Force rejection for physical interactions when unwell
  }

  // Factor 2: Habitat Conditions-Based Rejection (< 50% habitat quality)
  // Stressed guinea pig in dirty environment
  if (habitat < 50 && !rejectionReason) {
    rejectionReason = 'dirty_habitat'
    // Don't force rejection, but success rate already reduced above
  }

  // Factor 3: Personality-Based Rejection
  // Shy/not bold guinea pigs with low friendship reject physical interactions
  if (isPhysicalInteraction && boldness <= 3 && friendship < 40 && !rejectionReason) {
    rejectionReason = 'too_shy'
    successRate = Math.min(successRate, 0.20) // Max 20% success when shy and unfamiliar
  }

  // Legacy: Very low wellness = tired
  if (wellness < 30 && !rejectionReason) {
    rejectionReason = 'tired'
  }

  // Care interactions ALWAYS accepted when wellness < 50
  if (isCareInteraction && wellness < 50) {
    successRate = Math.max(successRate, 0.90) // Ensure 90%+ success for care interactions
    rejectionReason = undefined // Clear rejection reason for care
  }

  return {
    canInteract: true, // Always allow attempt, but may fail
    successRate,
    wellnessTier,
    rejectionReason
  }
}

/**
 * Attempt an interaction and generate appropriate reaction
 */
export function attemptInteraction(
  guineaPig: GuineaPig,
  wellness: number,
  interactionType: 'feed' | 'play' | 'socialize' | 'general',
  preferenceLevel?: 'favorite' | 'liked' | 'neutral' | 'disliked',
  habitatQuality?: number
): InteractionAttempt {
  const validation = validateInteraction(guineaPig, wellness, interactionType, habitatQuality)

  // Roll for success
  const roll = Math.random()
  const success = roll <= validation.successRate

  // Generate reaction message
  const context: MessageContext = {
    interactionType,
    wellnessTier: validation.wellnessTier,
    preferenceLevel,
    rejectionReason: success ? undefined : validation.rejectionReason
  }

  const reactionMessage = generateReactionMessage(context)

  // Calculate cooldown if rejected
  let cooldownMs: number | undefined
  if (!success) {
    // Cooldown based on wellness (worse wellness = longer cooldown)
    switch (validation.wellnessTier) {
      case 'excellent': cooldownMs = 30000; break   // 30s
      case 'good': cooldownMs = 45000; break        // 45s
      case 'fair': cooldownMs = 60000; break        // 1min
      case 'poor': cooldownMs = 90000; break        // 1.5min
      case 'critical': cooldownMs = 120000; break   // 2min
    }
  }

  return {
    success,
    reactionMessage,
    cooldownMs
  }
}

/**
 * Check if a need is at warning or critical level
 */
export function checkNeedWarning(needValue: number): 'warning' | 'critical' | null {
  if (needValue <= 15) return 'critical'
  if (needValue <= 30) return 'warning'
  return null
}
