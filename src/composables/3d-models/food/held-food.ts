import * as THREE from 'three'

/**
 * Food category colors for held food representation
 */
const FOOD_CATEGORY_COLORS = {
  vegetables: 0x4CAF50, // Green
  greens: 0x66BB6A,     // Light green
  herbs: 0x2E7D32,      // Dark green
  fruits: 0xE53935,     // Red
  pellets: 0x795548,    // Brown
  treats: 0xFFD700,     // Gold
} as const

export type FoodCategory = keyof typeof FOOD_CATEGORY_COLORS

/**
 * Create a simple ball representation of held food for hand feeding animation.
 * Positioned at the gripping hand's fingertips.
 * @param colorOrCategory - Hex color string (e.g. "#FF6B00") or food category for fallback
 * @param category - Food category used as fallback if no color provided
 */
export function createHeldFoodBall(
  colorOrCategory?: string | FoodCategory,
  category: FoodCategory = 'vegetables'
): THREE.Group {
  const group = new THREE.Group()

  // Determine color: use hex string if provided, otherwise use category color
  let color: number | string
  if (typeof colorOrCategory === 'string' && colorOrCategory.startsWith('#')) {
    color = colorOrCategory
  } else if (typeof colorOrCategory === 'string' && colorOrCategory in FOOD_CATEGORY_COLORS) {
    color = FOOD_CATEGORY_COLORS[colorOrCategory as FoodCategory]
  } else {
    color = FOOD_CATEGORY_COLORS[category] || FOOD_CATEGORY_COLORS.vegetables
  }

  // Simple sphere for held food
  const ballGeo = new THREE.SphereGeometry(0.4, 16, 12)
  const ballMat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.6,
    metalness: 0.1,
  })

  const ball = new THREE.Mesh(ballGeo, ballMat)
  ball.castShadow = true
  group.add(ball)

  return group
}
