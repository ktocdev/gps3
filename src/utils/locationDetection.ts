/**
 * Utilities for detecting nearby habitat items based on position
 */

import { useHabitatConditions } from '../stores/habitatConditions'
import { useSuppliesStore } from '../stores/suppliesStore'

type HabitatConditions = ReturnType<typeof useHabitatConditions>
type SuppliesStore = ReturnType<typeof useSuppliesStore>

// Constants for proximity detection
const PROXIMITY_THRESHOLD_GRID_CELLS = 1 // Items within this many grid cells are "nearby"
const SUBGRID_TO_GRID_SCALE = 4 // Subgrid is 4x finer than main grid

/**
 * Detect nearby items within proximity threshold of a given position
 *
 * @param currentPos - Current position in grid coordinates {row, col}
 * @param habitatConditions - Habitat conditions store containing item positions
 * @param suppliesStore - Supplies store to look up item details by ID
 * @returns Name of the first nearby meaningful item found, or undefined if none
 */
export function detectNearbyLocation(
  currentPos: { row: number; col: number },
  habitatConditions: HabitatConditions,
  suppliesStore: SuppliesStore
): string | undefined {
  // Only detect meaningful locations (water bottle, food bowl, shelter, etc.)
  const meaningfulKeywords = ['water', 'bottle', 'food', 'bowl', 'shelter', 'hideaway', 'hideout', 'igloo', 'bed']

  // Check items within proximity threshold of current position
  for (const itemId of habitatConditions.habitatItems) {
    const itemPos = habitatConditions.itemPositions.get(itemId)
    if (itemPos) {
      // Item positions use x/y format where x=col, y=row
      const itemRow = itemPos.y
      const itemCol = itemPos.x

      // Calculate Manhattan distance (sum of absolute differences)
      const distance = Math.abs(itemRow - currentPos.row) + Math.abs(itemCol - currentPos.col)

      if (distance <= PROXIMITY_THRESHOLD_GRID_CELLS) {
        // Get item name from supplies store
        const item = suppliesStore.getItemById(itemId)
        if (item) {
          // Only return if it's a meaningful location
          const itemNameLower = item.name.toLowerCase()
          if (meaningfulKeywords.some(keyword => itemNameLower.includes(keyword))) {
            return item.name
          }
        }
      }
    }
  }

  return undefined
}

/**
 * Convert grid position to subgrid position with random offset
 * Used for precise poop placement within a grid cell
 *
 * @param gridPos - Position in grid coordinates {row, col}
 * @returns Subgrid position {x, y} with random offset
 */
export function gridToSubgridWithOffset(gridPos: { row: number; col: number }): { x: number; y: number } {
  const subgridX = gridPos.col * SUBGRID_TO_GRID_SCALE + Math.floor(Math.random() * SUBGRID_TO_GRID_SCALE)
  const subgridY = gridPos.row * SUBGRID_TO_GRID_SCALE + Math.floor(Math.random() * SUBGRID_TO_GRID_SCALE)

  return { x: subgridX, y: subgridY }
}

/**
 * Convert position from {x, y} format to {row, col} format
 * Position coordinate system uses x=col, y=row
 *
 * @param position - Position in {x, y} format
 * @returns Position in {row, col} format
 */
export function positionToGridCoords(position: { x: number; y: number }): { row: number; col: number } {
  return { row: position.y, col: position.x }
}
