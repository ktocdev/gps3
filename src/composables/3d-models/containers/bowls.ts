import * as THREE from 'three'
import { useHabitatConditions } from '../../../stores/habitatConditions'
import { createHayPile } from '../food/hay'
import { createCucumberSlice, createCarrotStick } from '../food/vegetables'
import { createPelletPile } from '../food/pellets'
import { createLettucePile } from '../food/greens'
import { ITEM_CONFIG } from '../../../constants/3d'

/**
 * Create a 3D model for a food item based on its ID
 * Falls back to cucumber slice for items without custom models
 */
function createFoodModel(itemId: string): THREE.Group {
  if (itemId.includes('carrot')) {
    return createCarrotStick()
  }
  if (itemId.includes('cucumber')) {
    return createCucumberSlice()
  }
  if (itemId.includes('pellet')) {
    return createPelletPile()
  }
  if (itemId.includes('lettuce')) {
    return createLettucePile()
  }
  // Default fallback - cucumber slice for items without custom models
  return createCucumberSlice()
}

export function createBowlModel(bowlItemId: string): THREE.Group {
  const group = new THREE.Group()
  const habitatConditions = useHabitatConditions()

  // Simple bowl - cylinder (scaled up 2x)
  const bowlGeo = new THREE.CylinderGeometry(1.8, 1.6, 1.0, 32, 1, true)
  const bowlMat = new THREE.MeshStandardMaterial({
    color: 0x2196F3,
    roughness: 0.4,
    side: THREE.DoubleSide
  })
  const bowl = new THREE.Mesh(bowlGeo, bowlMat)
  bowl.position.y = 0.5
  bowl.castShadow = true
  bowl.receiveShadow = true
  group.add(bowl)

  // Base
  const baseGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.1, 32)
  const base = new THREE.Mesh(baseGeo, bowlMat)
  base.position.y = 0.05
  base.receiveShadow = true
  group.add(base)

  // Get bowl contents and render accordingly
  const contents = habitatConditions.getBowlContents(bowlItemId)

  if (contents.length > 0) {
    // Separate hay from food items
    const hayItems = contents.filter(item => item.itemId.includes('hay'))
    const foodItems = contents.filter(item => !item.itemId.includes('hay'))

    // Render hay if present (always at bottom)
    if (hayItems.length > 0) {
      // Generate consistent seed from bowlItemId to prevent animation
      const seed = bowlItemId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      const hayPile = createHayPile(hayItems.length, seed)

      // Scale and position based on serving count
      if (hayItems.length >= 2) {
        // Two servings: taller pile, positioned higher
        hayPile.scale.set(0.8, 1.3, 0.8) // X, Y, Z - taller in Y
        hayPile.position.y = 0.6
      } else {
        // One serving: smaller pile
        hayPile.scale.set(0.8, 0.8, 0.8)
        hayPile.position.y = 0.6
      }

      group.add(hayPile)
    }

    // Render food items on top
    if (foodItems.length === 1) {
      // Single food item - centered
      const foodModel = createFoodModel(foodItems[0].itemId)
      foodModel.position.set(
        ITEM_CONFIG.FOOD_POSITION.SINGLE.x,
        ITEM_CONFIG.FOOD_POSITION.SINGLE.y,
        ITEM_CONFIG.FOOD_POSITION.SINGLE.z
      )
      group.add(foodModel)
    } else if (foodItems.length >= 2) {
      // Two food items - render first two with their actual models
      const foodLeft = createFoodModel(foodItems[0].itemId)
      foodLeft.position.set(
        ITEM_CONFIG.FOOD_POSITION.LEFT.x,
        ITEM_CONFIG.FOOD_POSITION.LEFT.y,
        ITEM_CONFIG.FOOD_POSITION.LEFT.z
      )
      group.add(foodLeft)

      const foodRight = createFoodModel(foodItems[1].itemId)
      foodRight.position.set(
        ITEM_CONFIG.FOOD_POSITION.RIGHT.x,
        ITEM_CONFIG.FOOD_POSITION.RIGHT.y,
        ITEM_CONFIG.FOOD_POSITION.RIGHT.z
      )
      group.add(foodRight)
    }
  }

  return group
}
