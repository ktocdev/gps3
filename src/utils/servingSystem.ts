/**
 * Serving System Utilities
 * Phase 3 - Centralized logic for items that use serving-based consumption
 *
 * Items with servings system: hay, lettuce, carrots, etc.
 */

import type { SuppliesItem } from '../types/supplies'

/**
 * Check if an item uses the serving-based system
 * @param item - The supplies item to check
 * @returns true if item has serving system enabled
 */
export function hasServingSystem(item: SuppliesItem | undefined): boolean {
  if (!item) return false
  return item.stats?.servings !== undefined && item.stats.servings > 0
}

/**
 * Get the number of servings for an item
 * @param item - The supplies item
 * @returns Number of servings, or 0 if item doesn't use serving system
 */
export function getServingCount(item: SuppliesItem | undefined): number {
  if (!item || !item.stats?.servings) return 0
  return item.stats.servings
}

/**
 * Check if an item is a consumable (food or hay)
 * @param item - The supplies item to check
 * @returns true if item is consumable
 */
export function isConsumable(item: SuppliesItem | undefined): boolean {
  if (!item) return false
  return item.category === 'food' || item.category === 'hay'
}

/**
 * Get serving info for an item
 * @param item - The supplies item
 * @returns Serving information object
 */
export function getServingInfo(item: SuppliesItem | undefined): {
  hasServings: boolean
  servingCount: number
  isConsumable: boolean
} {
  return {
    hasServings: hasServingSystem(item),
    servingCount: getServingCount(item),
    isConsumable: isConsumable(item)
  }
}
