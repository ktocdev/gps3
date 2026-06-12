/**
 * Basic interaction effects for System 20
 * Defines need impacts, friendship gains, and cooldowns for player interactions
 */

import type { NeedType } from '../stores/guineaPigStore'

export interface InteractionEffect {
  needsImpact: Partial<Record<NeedType, number>>
  friendshipGain: number
  cooldownTime: number // seconds
  duration?: number // interaction animation duration (future use)
}

/**
 * Basic interaction effects map
 * Based on System 20 documentation
 */
export const interactionEffects = new Map<string, InteractionEffect>([
  // Basic Interactions
  ['pet', {
    needsImpact: { social: 15, comfort: 10 },
    friendshipGain: 2,
    cooldownTime: 30
  }],
  ['hold', {
    needsImpact: { social: 20, comfort: 8 },
    friendshipGain: 3,
    cooldownTime: 60
  }],
  ['hand-feed', {
    needsImpact: { hunger: 10, social: 15 },
    friendshipGain: 3,
    cooldownTime: 45
  }],
  ['gentle-wipe', {
    needsImpact: { hygiene: 18, comfort: 5 },
    friendshipGain: 2,
    cooldownTime: 300 // 5 minutes - longer cooldown to prevent spam
  }],
  ['clip-nails', {
    needsImpact: { nails: 100, comfort: -5 },
    friendshipGain: 1,
    cooldownTime: 600 // 10 minutes - longer cooldown, should only be needed occasionally
  }],

  // Communication
  ['talk-to', {
    needsImpact: { social: 10 },
    friendshipGain: 1,
    cooldownTime: 20
  }],
  ['sing-to', {
    needsImpact: { social: 12, comfort: 5 },
    friendshipGain: 2,
    cooldownTime: 30
  }],
  ['call-name', {
    needsImpact: { social: 8 },
    friendshipGain: 1,
    cooldownTime: 15
  }],

  // Play
  ['peek-a-boo', {
    needsImpact: { play: 15, social: 10 },
    friendshipGain: 2,
    cooldownTime: 25
  }],
  ['wave-hand', {
    needsImpact: { play: 10, social: 8 },
    friendshipGain: 1,
    cooldownTime: 20
  }],
  ['show-toy', {
    needsImpact: { play: 20, social: 12 },
    friendshipGain: 3,
    cooldownTime: 40
  }]
])

/**
 * Get interaction effect data
 */
export function getInteractionEffect(interactionType: string): InteractionEffect | undefined {
  return interactionEffects.get(interactionType)
}

/**
 * Get friendly interaction name for activity feed
 */
export function getInteractionName(interactionType: string): string {
  const names: Record<string, string> = {
    'pet': 'Pet',
    'hold': 'Hold',
    'hand-feed': 'Hand Feed',
    'gentle-wipe': 'Gentle Wipe',
    'clip-nails': 'Clip Nails',
    'talk-to': 'Talk To',
    'sing-to': 'Sing To',
    'call-name': 'Call Name',
    'peek-a-boo': 'Peek-a-Boo',
    'wave-hand': 'Wave Hand',
    'show-toy': 'Show Toy'
  }
  return names[interactionType] || interactionType
}

/**
 * Get emoji for interaction type
 */
export function getInteractionEmoji(interactionType: string): string {
  const emojis: Record<string, string> = {
    'pet': '🫳',
    'hold': '🤲',
    'hand-feed': '🥕',
    'gentle-wipe': '🧼',
    'clip-nails': '✂️',
    'talk-to': '💬',
    'sing-to': '🎵',
    'call-name': '📣',
    'peek-a-boo': '👀',
    'wave-hand': '👋',
    'show-toy': '🧸'
  }
  return emojis[interactionType] || '🤝'
}
