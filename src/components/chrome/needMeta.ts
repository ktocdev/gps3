import type { GuineaPigNeeds } from '../../stores/guineaPigStore'

// Single source for need display metadata in the game chrome.
// gps3 has 10 needs (the prototype's 'stimulation' has no game system).
// Colors come from the --color-need-* tokens so themes stay in control.

export type NeedKey = keyof GuineaPigNeeds

export interface NeedMeta {
  label: string
  emoji: string
  color: string
}

export const NEED_META: Record<NeedKey, NeedMeta> = {
  hunger: { label: 'Hunger', emoji: '🍎', color: 'var(--color-need-hunger)' },
  thirst: { label: 'Thirst', emoji: '💧', color: 'var(--color-need-thirst)' },
  energy: { label: 'Energy', emoji: '💤', color: 'var(--color-need-energy)' },
  shelter: { label: 'Shelter', emoji: '🏠', color: 'var(--color-need-shelter)' },
  play: { label: 'Play', emoji: '🎾', color: 'var(--color-need-play)' },
  social: { label: 'Social', emoji: '💕', color: 'var(--color-need-social)' },
  comfort: { label: 'Comfort', emoji: '🛏️', color: 'var(--color-need-comfort)' },
  hygiene: { label: 'Hygiene', emoji: '🧼', color: 'var(--color-need-hygiene)' },
  nails: { label: 'Nails', emoji: '💅', color: 'var(--color-need-nails)' },
  chew: { label: 'Chew', emoji: '🌿', color: 'var(--color-need-chew)' }
}

export const NEED_KEYS = Object.keys(NEED_META) as NeedKey[]

export type Urgency = 'critical' | 'warning' | 'moderate' | 'satisfied'

/** Need values are satisfaction (100 = good): low values are urgent. */
export function urgencyOf(value: number): Urgency {
  if (value <= 20) return 'critical'
  if (value <= 40) return 'warning'
  if (value <= 70) return 'moderate'
  return 'satisfied'
}

export interface PigHealth {
  status: 'ok' | 'warning' | 'critical'
  /** Number of needs at warning level or worse */
  count: number
  /** The lowest need, when any need is at warning level or worse */
  worstNeed: NeedKey | null
}

/** Summarizes a pig's needs for the SimTopBar pill badge. */
export function pigHealth(needs: GuineaPigNeeds): PigHealth {
  let count = 0
  let worstNeed: NeedKey | null = null
  let worstValue = Infinity
  let critical = false

  for (const key of NEED_KEYS) {
    const value = needs[key]
    if (value <= 40) {
      count++
      if (value <= 20) critical = true
      if (value < worstValue) {
        worstValue = value
        worstNeed = key
      }
    }
  }

  return {
    status: critical ? 'critical' : count > 0 ? 'warning' : 'ok',
    count,
    worstNeed
  }
}
