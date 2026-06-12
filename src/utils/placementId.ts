/**
 * Utility functions for handling placement IDs
 *
 * Placement IDs are unique identifiers for items placed in the habitat.
 * Format: `{itemId}::{instanceId}` (e.g., "habitat_basic_water_bottle::instance_abc123")
 *
 * This allows multiple instances of the same item type to be placed in the habitat.
 */

const PLACEMENT_ID_SEPARATOR = '::'

/**
 * Generate a unique placement ID for an item instance
 */
export function generatePlacementId(itemId: string, instanceId?: string): string {
  const id = instanceId || `inst_${crypto.randomUUID().slice(0, 8)}`
  return `${itemId}${PLACEMENT_ID_SEPARATOR}${id}`
}

/**
 * Extract the base item ID from a placement ID
 * Returns the original ID if it's not a placement ID format
 */
export function getBaseItemId(placementId: string): string {
  const separatorIndex = placementId.indexOf(PLACEMENT_ID_SEPARATOR)
  if (separatorIndex === -1) {
    return placementId
  }
  return placementId.slice(0, separatorIndex)
}

/**
 * Extract the instance ID from a placement ID
 * Returns null if it's not a placement ID format
 */
export function getInstanceId(placementId: string): string | null {
  const separatorIndex = placementId.indexOf(PLACEMENT_ID_SEPARATOR)
  if (separatorIndex === -1) {
    return null
  }
  return placementId.slice(separatorIndex + PLACEMENT_ID_SEPARATOR.length)
}

/**
 * Check if a string is a placement ID (contains the separator)
 */
export function isPlacementId(id: string): boolean {
  return id.includes(PLACEMENT_ID_SEPARATOR)
}
