/**
 * Guinea Pig Compatibility Calculation System
 *
 * Calculates compatibility scores between two guinea pigs based on:
 * - Gender compatibility (research-based)
 * - Personality trait alignment
 * - Breed similarity
 *
 * Score Range: 0-100 (hidden from player)
 * Higher scores = faster bonding, more harmonious interactions
 */

import type { GuineaPig } from '../stores/guineaPigStore'

/**
 * Calculate compatibility score between two guinea pigs
 *
 * @param gp1 - First guinea pig
 * @param gp2 - Second guinea pig
 * @returns Compatibility score (0-100)
 */
export function calculateCompatibility(gp1: GuineaPig, gp2: GuineaPig): number {
  let score = 0

  // Gender compatibility (research-based bonding potential)
  score += calculateGenderCompatibility(gp1.gender, gp2.gender)

  // Personality compatibility
  score += calculateFriendlinessCompatibility(gp1.personality.friendliness, gp2.personality.friendliness)
  score += calculateBoldnessCompatibility(gp1.personality.boldness, gp2.personality.boldness)
  score += calculatePlayfulnessCompatibility(gp1.personality.playfulness, gp2.personality.playfulness)
  score += calculateCuriosityCompatibility(gp1.personality.curiosity, gp2.personality.curiosity)
  score += calculateCleanlinessCompatibility(gp1.personality.cleanliness, gp2.personality.cleanliness)

  // Breed compatibility
  score += calculateBreedCompatibility(gp1.breed, gp2.breed)

  // Clamp score to 0-100 range
  return Math.max(0, Math.min(100, score))
}

/**
 * Gender-based compatibility scoring
 * Based on research: Male-Female bonds strongest, Female-Female very good, Male-Male achievable
 */
function calculateGenderCompatibility(gender1: string, gender2: string): number {
  if (gender1 !== gender2) {
    return 25 // Male-Female: Strongest bonding potential
  } else if (gender1 === 'female') {
    return 15 // Female-Female: Get on very well together
  } else {
    return 5  // Male-Male: Achievable with proper space and introduction
  }
}

/**
 * Friendliness trait compatibility
 * Both outgoing works well, complementary works, both too shy struggles
 */
function calculateFriendlinessCompatibility(f1: number, f2: number): number {
  if (f1 >= 7 && f2 >= 7) {
    return 20 // Both outgoing - excellent social chemistry
  } else if ((f1 >= 7 && f2 <= 3) || (f2 >= 7 && f1 <= 3)) {
    return 10 // Complementary - outgoing draws out shy
  } else if (f1 <= 3 && f2 <= 3) {
    return -5 // Both too shy - slower bonding
  }
  return 5 // Moderate - works fine
}

/**
 * Boldness trait compatibility
 * Balanced pairs work best, extreme mismatches can struggle
 */
function calculateBoldnessCompatibility(b1: number, b2: number): number {
  const diff = Math.abs(b1 - b2)

  if (b1 >= 4 && b1 <= 7 && b2 >= 4 && b2 <= 7) {
    return 15 // Both balanced - ideal companionship
  } else if ((b1 >= 8 && b2 <= 3) || (b2 >= 8 && b1 <= 3)) {
    return -10 // Extreme mismatch - very bold vs very timid
  } else if (diff <= 2) {
    return 8 // Similar levels - good compatibility
  }
  return 0 // Some mismatch but manageable
}

/**
 * Playfulness trait compatibility
 * Similar energy levels bond better
 */
function calculatePlayfulnessCompatibility(p1: number, p2: number): number {
  const diff = Math.abs(p1 - p2)

  if (diff <= 3) {
    return 10 // Similar playfulness - enjoy activities together
  } else if (diff >= 7) {
    return -5 // Very different energy - one overwhelms other
  }
  return 3 // Moderate difference - workable
}

/**
 * Curiosity trait compatibility
 * Both curious guinea pigs explore and bond well together
 */
function calculateCuriosityCompatibility(c1: number, c2: number): number {
  if (c1 >= 7 && c2 >= 7) {
    return 10 // Both curious - explore together, shared adventures
  } else if (c1 <= 3 && c2 <= 3) {
    return 3 // Both cautious - bond through familiar routines
  }
  return 5 // Mixed - moderate compatibility
}

/**
 * Cleanliness trait compatibility
 * Balanced pairs work well, extreme mismatch causes tension
 */
function calculateCleanlinessCompatibility(cl1: number, cl2: number): number {
  const diff = Math.abs(cl1 - cl2)

  if (cl1 >= 4 && cl1 <= 7 && cl2 >= 4 && cl2 <= 7) {
    return 10 // Both moderate - good balance
  } else if (diff >= 7) {
    return -5 // Extreme mismatch - messy vs picky causes stress
  } else if (diff <= 2) {
    return 5 // Similar standards - works well
  }
  return 0 // Some mismatch but manageable
}

/**
 * Breed compatibility scoring
 * Same breed slightly favors bonding, similar breeds also good
 */
function calculateBreedCompatibility(breed1: string, breed2: string): number {
  if (breed1 === breed2) {
    return 10 // Same breed - familiar body language and behaviors
  } else if (isSimilarBreedFamily(breed1, breed2)) {
    return 5 // Similar breed family - compatible temperaments
  }
  return 0 // Different breeds - no penalty, just no bonus
}

/**
 * Check if two breeds are from similar families
 * Grouped by size and coat type similarities
 */
function isSimilarBreedFamily(breed1: string, breed2: string): boolean {
  const breedFamilies: Record<string, string[]> = {
    // Short-haired, similar size
    'american': ['american', 'abyssinian', 'crested'],
    'abyssinian': ['american', 'abyssinian', 'crested'],
    'crested': ['american', 'abyssinian', 'crested'],

    // Long-haired breeds
    'peruvian': ['peruvian', 'silkie', 'texel', 'coronet'],
    'silkie': ['peruvian', 'silkie', 'texel', 'coronet'],
    'texel': ['peruvian', 'silkie', 'texel', 'coronet'],
    'coronet': ['peruvian', 'silkie', 'texel', 'coronet'],

    // Rex breeds (similar coat texture)
    'teddy': ['teddy', 'rex', 'texel'],
    'rex': ['teddy', 'rex', 'texel']
  }

  const family1 = breedFamilies[breed1.toLowerCase()]
  const family2 = breedFamilies[breed2.toLowerCase()]

  if (!family1 || !family2) return false

  return family1.some(breed => family2.includes(breed))
}

/**
 * Get a human-readable compatibility description (for debug/testing)
 * Note: This is hidden from players in the actual game
 */
export function getCompatibilityDescription(score: number): string {
  if (score >= 75) return 'Excellent compatibility - will bond quickly'
  if (score >= 60) return 'Very good compatibility - smooth bonding'
  if (score >= 45) return 'Good compatibility - steady bonding'
  if (score >= 30) return 'Moderate compatibility - slower bonding'
  if (score >= 15) return 'Fair compatibility - challenging bonding'
  return 'Low compatibility - very slow bonding'
}

/**
 * Get compatibility breakdown for debugging
 */
export function getCompatibilityBreakdown(gp1: GuineaPig, gp2: GuineaPig): {
  total: number
  gender: number
  friendliness: number
  boldness: number
  playfulness: number
  curiosity: number
  cleanliness: number
  breed: number
} {
  return {
    total: calculateCompatibility(gp1, gp2),
    gender: calculateGenderCompatibility(gp1.gender, gp2.gender),
    friendliness: calculateFriendlinessCompatibility(gp1.personality.friendliness, gp2.personality.friendliness),
    boldness: calculateBoldnessCompatibility(gp1.personality.boldness, gp2.personality.boldness),
    playfulness: calculatePlayfulnessCompatibility(gp1.personality.playfulness, gp2.personality.playfulness),
    curiosity: calculateCuriosityCompatibility(gp1.personality.curiosity, gp2.personality.curiosity),
    cleanliness: calculateCleanlinessCompatibility(gp1.personality.cleanliness, gp2.personality.cleanliness),
    breed: calculateBreedCompatibility(gp1.breed, gp2.breed)
  }
}
