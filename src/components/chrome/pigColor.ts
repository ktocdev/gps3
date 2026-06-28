import type { GuineaPig } from '../../stores/guineaPigStore'
import { FUR_COLORS } from './PigSvg.vue'

const SPOT_COLOR_NAMES = ['White', 'Black', 'Brown', 'Cream'] as const
const SPOT_LOCATIONS = ['back', 'belly', 'face', 'neck'] as const

/** Cheap deterministic hash of a pig's id string → stable spot appearance. */
export function h32(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  return Math.abs(h)
}

// Map the game's lowercase furColor names onto PigSvg's capitalized FUR_COLORS keys.
const FUR_NAME_OVERRIDES: Record<string, string> = {
  tortoiseshell: 'Tortoise'
}

/** A furColor name PigSvg understands (its `colors` prop). */
export function toPigColorName(furColor: string): string {
  if (!furColor) return 'Cream'
  if (FUR_NAME_OVERRIDES[furColor]) return FUR_NAME_OVERRIDES[furColor]
  return furColor.charAt(0).toUpperCase() + furColor.slice(1)
}

// Multi-color types: the color name arrays PigSvg will render as c0/c1/c2 patches.
const MULTI_COLOR_NAMES: Record<string, string[]> = {
  Tortoise:  ['Tortoise', 'Black', 'Cream'],
  Tricolor:  ['White', 'Black', 'Orange'],
  Dalmatian: ['Dalmatian', 'Black'],
}

/** PigSvg `colors` array for a game guinea pig — multi-color types return 2-3 patch colors. */
export function pigColors(pig: GuineaPig): string[] {
  const name = toPigColorName(pig.appearance.furColor)
  return MULTI_COLOR_NAMES[name] ?? [name]
}

/**
 * Deterministic spot map: ~40% no spots, ~40% one spot, ~20% two spots.
 * Spot color contrasts the base fur; location/count are stable per pig id.
 */
export function pigSpots(pig: GuineaPig): Partial<Record<'face' | 'neck' | 'back' | 'belly', string>> | undefined {
  const n = h32(pig.id)
  if (n % 10 < 4) return undefined

  const baseName = toPigColorName(pig.appearance.furColor)
  const available = SPOT_COLOR_NAMES.filter(c => c !== baseName)
  const color = available[(n >> 4) % available.length]

  const spots: Partial<Record<'face' | 'neck' | 'back' | 'belly', string>> = {}
  const idx1 = (n >> 8) % 4
  spots[SPOT_LOCATIONS[idx1]] = color

  if (n % 10 >= 8) {
    const idx2 = (idx1 + (n >> 12) % 3 + 1) % 4
    spots[SPOT_LOCATIONS[idx2]] = color
  }

  return spots
}

/** Hex for a furColor name, for swatches. */
export function furHex(furColor: string): string {
  const name = toPigColorName(furColor)
  return FUR_COLORS[name] ?? '#cbd5e1'
}

/** One or more hex swatches — exactly the colors that appear on the pig SVG. */
export function pigSwatches(pig: GuineaPig): string[] {
  const hexes = pigColors(pig).map(c => FUR_COLORS[c] ?? '#cbd5e1')
  const spots = pigSpots(pig)
  if (spots) {
    const seen = new Set(hexes)
    for (const name of new Set(Object.values(spots))) {
      const hex = FUR_COLORS[name]
      if (hex && !seen.has(hex)) { hexes.push(hex); seen.add(hex) }
    }
  }
  return hexes
}