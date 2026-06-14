import type { GuineaPig } from '../../stores/guineaPigStore'
import { FUR_COLORS } from './PigSvg.vue'

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

/** PigSvg `colors` array for a game guinea pig. */
export function pigColors(pig: GuineaPig): string[] {
  return [toPigColorName(pig.appearance.furColor)]
}

/** Hex for a furColor name, for swatches. */
export function furHex(furColor: string): string {
  const name = toPigColorName(furColor)
  return FUR_COLORS[name] ?? '#cbd5e1'
}
