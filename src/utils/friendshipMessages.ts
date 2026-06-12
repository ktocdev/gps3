/**
 * Friendship & Bonding Message Utilities
 * Shared functions for displaying qualitative friendship/bond strength messages
 */

interface FriendshipThreshold {
  min: number
  message: string
}

/**
 * Get qualitative bond strength message based on bonding level percentage
 * Used for companion-to-companion bonds
 */
export function getBondStrengthMessage(bondingLevel: number): string {
  const thresholds: FriendshipThreshold[] = [
    { min: 95, message: '💖 Inseparable companions' },
    { min: 85, message: '💕 Very close bond' },
    { min: 71, message: '💗 Strong bond' },
    { min: 60, message: '💚 Good friends' },
    { min: 45, message: '😊 Growing friendship' },
    { min: 31, message: '🌱 Becoming friends' },
    { min: 20, message: '👋 Getting to know each other' },
    { min: 10, message: '👀 Cautiously curious' },
    { min: 0, message: '🆕 New companions' }
  ]

  for (const threshold of thresholds) {
    if (bondingLevel >= threshold.min) {
      return threshold.message
    }
  }

  return thresholds[thresholds.length - 1].message
}

/**
 * Get qualitative player friendship message based on friendship percentage
 * Used for player-to-guinea pig relationships
 */
export function getPlayerFriendshipMessage(friendship: number): string {
  const thresholds: FriendshipThreshold[] = [
    { min: 90, message: '💖 Best friends forever' },
    { min: 80, message: '💕 Very close friends' },
    { min: 70, message: '💗 Trusts you deeply' },
    { min: 60, message: '💚 Good friends' },
    { min: 50, message: '😊 Likes you' },
    { min: 40, message: '🌱 Warming up to you' },
    { min: 30, message: '👋 Getting comfortable' },
    { min: 20, message: '👀 A bit cautious' },
    { min: 10, message: '😐 Unsure about you' },
    { min: 0, message: '😟 Needs more care' }
  ]

  for (const threshold of thresholds) {
    if (friendship >= threshold.min) {
      return threshold.message
    }
  }

  return thresholds[thresholds.length - 1].message
}
