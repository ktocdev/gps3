/**
 * Guinea Pig Color Palettes
 *
 * Defines realistic color palettes for guinea pig 3D models.
 * Each fur color has an associated palette with:
 * - fur: Main body fur color
 * - ear: Ear color (usually darker or pinker)
 * - skin: Skin color for nose, mouth, and feet
 *
 * Eye colors are defined separately as they can vary independently.
 */

export interface GuineaPigColorPalette {
  fur: number      // Main body fur color
  ear: number      // Ear color
  skin: number     // Skin color (nose, mouth, feet)
}

export interface GuineaPig3DColors extends GuineaPigColorPalette {
  eye: number      // Eye color
}

/**
 * Fur color palettes mapped by fur color name
 * Each palette provides harmonious fur, ear, and skin colors
 */
export const FUR_COLOR_PALETTES: Record<string, GuineaPigColorPalette> = {
  // Common colors
  white: {
    fur: 0xffffff,
    ear: 0xffc0cb,    // Pink ears for white guinea pigs
    skin: 0xffd6d6,   // Light pink skin
  },
  black: {
    fur: 0x1a1a1a,
    ear: 0x2d2d2d,    // Slightly lighter black
    skin: 0x3d3d3d,   // Dark gray skin
  },
  brown: {
    fur: 0x8b4513,
    ear: 0x5d3a1a,    // Darker brown
    skin: 0xd4a574,   // Tan skin
  },
  cream: {
    fur: 0xfffdd0,
    ear: 0xffc0cb,    // Pink tinted ears
    skin: 0xffe4e1,   // Light pink skin
  },
  tortoiseshell: {
    fur: 0xd2691e,    // Orange-brown base
    ear: 0x4a3728,    // Dark brown
    skin: 0xdaa06d,   // Warm tan
  },
  tricolor: {
    fur: 0xe8cd9a,    // Mixed tan base
    ear: 0x3b2918,    // Dark brown
    skin: 0xffdcd6,   // Light pink
  },

  // Uncommon colors
  orange: {
    fur: 0xff8c00,
    ear: 0xcc6600,    // Darker orange
    skin: 0xffdab9,   // Peach skin
  },
  gray: {
    fur: 0x808080,
    ear: 0x666666,    // Darker gray
    skin: 0xa9a9a9,   // Light gray skin
  },
  red: {
    fur: 0xdb3a00,    // Bright rust/ginger
    ear: 0x9a2900,    // Darker rust
    skin: 0xcd853f,   // Peru/tan skin
  },
  gold: {
    fur: 0xdaa520,
    ear: 0xb8860b,    // Dark goldenrod
    skin: 0xf5deb3,   // Wheat skin
  },
  beige: {
    fur: 0xf5f5dc,
    ear: 0xdeb887,    // Burlywood
    skin: 0xffefd5,   // Papaya whip
  },

  // Rare colors
  chocolate: {
    fur: 0x5c3317,
    ear: 0x3b2918,    // Very dark brown
    skin: 0x8b7355,   // Burly wood
  },
  lilac: {
    fur: 0xc8a2c8,
    ear: 0xdda0dd,    // Plum
    skin: 0xffe4f0,   // Light pink
  },
  buff: {
    fur: 0xf0dc82,
    ear: 0xdaa06d,    // Sandy
    skin: 0xffecd0,   // Light buff
  },
  dalmatian: {
    fur: 0xf5f5f5,    // Off-white with spots
    ear: 0xffc0cb,    // Pink
    skin: 0xffdad6,   // Light pink
  },
}

/**
 * Eye color values mapped by eye color name
 */
export const EYE_COLORS: Record<string, number> = {
  brown: 0x5c4033,
  black: 0x111111,
  red: 0x8b0000,
  blue: 0x4169e1,
  pink: 0xffc0cb,
}

/**
 * Get a random eye color that's appropriate for the given fur color
 * Light fur colors have a chance for pink/red/blue eyes
 */
export function getRandomEyeColor(furColorName: string): number {
  const lightColors = ['white', 'cream', 'beige', 'gray', 'lilac', 'buff']

  if (lightColors.includes(furColorName)) {
    // Light colors: 25% pink/red, 20% blue, 55% brown/black
    const random = Math.random()

    if (random < 0.25) {
      return Math.random() < 0.5 ? EYE_COLORS.pink : EYE_COLORS.red
    } else if (random < 0.45) {
      return EYE_COLORS.blue
    }
  }

  // Default: brown or black
  return Math.random() < 0.6 ? EYE_COLORS.brown : EYE_COLORS.black
}

/**
 * Convert eye color name to hex value
 */
export function eyeColorNameToHex(eyeColorName: string): number {
  return EYE_COLORS[eyeColorName] ?? EYE_COLORS.brown
}

/**
 * Get the full 3D color palette for a guinea pig based on appearance data
 */
export function getGuineaPig3DColors(
  furColorName: string,
  eyeColorName: string
): GuineaPig3DColors {
  // Get fur palette (fallback to tricolor if not found)
  const furPalette = FUR_COLOR_PALETTES[furColorName] ?? FUR_COLOR_PALETTES.tricolor

  // Get eye color
  const eyeColor = eyeColorNameToHex(eyeColorName)

  return {
    fur: furPalette.fur,
    ear: furPalette.ear,
    skin: furPalette.skin,
    eye: eyeColor,
  }
}

/**
 * Default colors (used as fallback)
 */
export const DEFAULT_GUINEA_PIG_COLORS: GuineaPig3DColors = {
  fur: 0xe8cd9a,    // Tan
  ear: 0x3b2918,    // Dark brown
  skin: 0xffdcd6,   // Light pink
  eye: 0x111111,    // Black
}
