/**
 * Personality-derived need decay modifiers, shared between the read-only guinea
 * pig info view (PetStoreDebug) and the guinea pig editor form (GuineaPigEditor).
 */

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function getSocialDecayModifier(friendliness: number): string {
  const modifier = 1 + (friendliness - 5) * 0.04
  return modifier.toFixed(2)
}

export function getPlayDecayModifier(playfulness: number): string {
  const modifier = 1 + (playfulness - 5) * 0.06
  return modifier.toFixed(2)
}

export function getStimulationDecayModifier(curiosity: number): string {
  const modifier = 1 + (curiosity - 5) * 0.08
  return modifier.toFixed(2)
}

export function getBoldnessDecayModifier(boldness: number): string {
  const modifier = 1 - (boldness - 5) * 0.05
  return modifier.toFixed(2)
}

export function getHygieneDecayModifier(cleanliness: number): string {
  const modifier = 1 - (cleanliness - 5) * 0.06
  return modifier.toFixed(2)
}

export function getDecayModifierClass(modifier: string): string {
  const modifierValue = parseFloat(modifier)
  if (modifierValue < 0.9) return 'decay-modifier--slower'
  if (modifierValue > 1.1) return 'decay-modifier--faster'
  return 'decay-modifier--normal'
}

export function getDecayEffectText(modifier: string): string {
  const modifierValue = parseFloat(modifier)
  const percentChange = ((modifierValue - 1) * 100).toFixed(0)

  if (modifierValue < 1) {
    return `(${percentChange}%)`
  } else if (modifierValue > 1) {
    return `(+${percentChange}%)`
  }
  return '(±0%)'
}
