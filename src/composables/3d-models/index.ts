import * as THREE from 'three'
import { createBowlModel } from './containers/bowls'
import { createWaterBottleModel } from './containers/water-bottles'
import { createHayRackModel } from './containers/hay-racks'
import { createShelterModel } from './shelters/igloos'
import { createWoodenTunnelModel } from './shelters/tunnels'
import { createBedModel } from './bedding/beds'
import { createToyModel } from './toys/chew-toys'

/**
 * Factory function to create 3D models for habitat items
 * Routes to appropriate model creator based on item ID
 */
export function createItemModel(itemId: string): THREE.Group {
  // Containers
  if (itemId.includes('bowl')) return createBowlModel(itemId)
  // All items with 'bottle' in ID are water bottles (basic, large_capacity, wellness, refreshing)
  if (itemId.includes('bottle')) return createWaterBottleModel()
  if (itemId.includes('hay') && itemId.includes('rack')) return createHayRackModel(itemId)

  // Shelters
  if (itemId.includes('shelter') || itemId.includes('igloo') || itemId.includes('hideout')) {
    return createShelterModel()
  }
  if (itemId.includes('tunnel') && itemId.includes('archway')) {
    return createWoodenTunnelModel()
  }

  // Bedding
  if (itemId.includes('bed') || itemId.includes('mat')) return createBedModel()

  // Toys
  if (itemId.includes('ball')) return createToyModel('ball', itemId)
  if (itemId.includes('stick') || itemId.includes('chew')) return createToyModel('stick', itemId)

  // Default fallback
  return createToyModel('other', itemId)
}

// Re-export all model creators for direct access if needed
export { createBowlModel } from './containers/bowls'
export { createWaterBottleModel, getWaterBottleRotation } from './containers/water-bottles'
export { createHayRackModel } from './containers/hay-racks'
export { createShelterModel } from './shelters/igloos'
export { createWoodenTunnelModel } from './shelters/tunnels'
export { createBedModel } from './bedding/beds'
export { createToyModel } from './toys/chew-toys'
export { createHayPile } from './food/hay'
export { createCucumberSlice, createCarrotStick } from './food/vegetables'
export { createPelletPile } from './food/pellets'
export { createLettucePile } from './food/greens'

// Re-export shared utilities
export { createWoodTexture } from './shared/textures'
export { displaceVertices } from './shared/geometry'
export { gridToWorld, seededRandom } from './shared/utils'
