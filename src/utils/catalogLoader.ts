/**
 * Catalog Loader Utility
 * Loads and validates all supplies items from JSON files
 */

import type { SuppliesItem } from '../types/supplies'

// Import all JSON files
import beddingData from '../data/supplies/bedding.json'
import hayData from '../data/supplies/hay.json'
import greensData from '../data/supplies/food/greens.json'
import herbsData from '../data/supplies/food/herbs.json'
import vegetablesData from '../data/supplies/food/vegetables.json'
import fruitsData from '../data/supplies/food/fruits.json'
import pelletsData from '../data/supplies/food/pellets.json'
import treatsData from '../data/supplies/food/treats.json'
import hideawaysData from '../data/supplies/habitat/hideaways.json'
import toysData from '../data/supplies/habitat/toys.json'
import chewsData from '../data/supplies/habitat/chews.json'
import bowlsBottlesData from '../data/supplies/habitat/bowls_bottles.json'
import enrichmentData from '../data/supplies/habitat/enrichment.json'

/**
 * Validates that an item has all required fields
 */
function validateItem(item: any, source: string): item is SuppliesItem {
  const requiredFields = ['id', 'name', 'description', 'category', 'basePrice', 'currency', 'availability']

  for (const field of requiredFields) {
    if (!(field in item)) {
      console.error(`❌ Item missing required field '${field}' in ${source}:`, item)
      return false
    }
  }

  // Validate category-specific requirements
  if (item.category === 'bedding' && !item.stats?.absorbency) {
    console.error(`❌ Bedding item missing absorbency stat in ${source}:`, item)
    return false
  }

  if (item.category === 'food' && !item.subCategory) {
    console.error(`❌ Food item missing subCategory in ${source}:`, item)
    return false
  }

  if (item.category === 'habitat_item' && !item.subCategory) {
    console.error(`❌ Habitat item missing subCategory in ${source}:`, item)
    return false
  }

  return true
}

/**
 * Loads all catalog items from JSON files with validation
 */
export function loadCatalog(): SuppliesItem[] {
  const catalog: SuppliesItem[] = []
  const itemIds = new Set<string>()

  // Define all data sources
  const dataSources = [
    { name: 'bedding', data: beddingData },
    { name: 'hay', data: hayData },
    { name: 'food/greens', data: greensData },
    { name: 'food/herbs', data: herbsData },
    { name: 'food/vegetables', data: vegetablesData },
    { name: 'food/fruits', data: fruitsData },
    { name: 'food/pellets', data: pelletsData },
    { name: 'food/treats', data: treatsData },
    { name: 'habitat/hideaways', data: hideawaysData },
    { name: 'habitat/toys', data: toysData },
    { name: 'habitat/chews', data: chewsData },
    { name: 'habitat/bowls_bottles', data: bowlsBottlesData },
    { name: 'habitat/enrichment', data: enrichmentData }
  ]

  // Load and validate items from each source
  for (const source of dataSources) {
    if (!Array.isArray(source.data)) {
      console.error(`❌ Invalid data format in ${source.name}: expected array`)
      continue
    }

    for (const item of source.data) {
      // Validate item structure
      if (!validateItem(item, source.name)) {
        continue
      }

      // Check for duplicate IDs
      if (itemIds.has(item.id)) {
        console.error(`❌ Duplicate item ID '${item.id}' found in ${source.name}`)
        continue
      }

      itemIds.add(item.id)
      catalog.push(item as SuppliesItem)
    }
  }

  console.log(`✅ Catalog loaded: ${catalog.length} items from ${dataSources.length} sources`)

  // Log breakdown by category
  const breakdown = {
    bedding: catalog.filter(i => i.category === 'bedding').length,
    hay: catalog.filter(i => i.category === 'hay').length,
    food: catalog.filter(i => i.category === 'food').length,
    habitat_item: catalog.filter(i => i.category === 'habitat_item').length
  }

  console.log('  - Bedding:', breakdown.bedding)
  console.log('  - Hay:', breakdown.hay)
  console.log('  - Food:', breakdown.food)
  console.log('  - Habitat Items:', breakdown.habitat_item)

  return catalog
}

/**
 * Get catalog statistics
 */
export function getCatalogStats(catalog: SuppliesItem[]) {
  const stats = {
    total: catalog.length,
    byCategory: {} as Record<string, number>,
    bySubCategory: {} as Record<string, number>,
    byAvailability: {} as Record<string, number>,
    byTier: {} as Record<string, number>
  }

  for (const item of catalog) {
    // Count by category
    stats.byCategory[item.category] = (stats.byCategory[item.category] || 0) + 1

    // Count by subcategory
    if (item.subCategory) {
      stats.bySubCategory[item.subCategory] = (stats.bySubCategory[item.subCategory] || 0) + 1
    }

    // Count by availability
    stats.byAvailability[item.availability] = (stats.byAvailability[item.availability] || 0) + 1

    // Count by tier
    if (item.tier) {
      stats.byTier[item.tier] = (stats.byTier[item.tier] || 0) + 1
    }
  }

  return stats
}
