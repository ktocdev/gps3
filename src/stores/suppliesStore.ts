/**
 * Supplies Store - System 11
 * Phase 3.11 - Habitat & Environment
 *
 * Central catalog of all purchasable items with pricing, descriptions, and availability.
 * Items are loaded from JSON files in src/data/supplies/
 * - Bedding (7 items)
 * - Hay (8 varieties)
 * - Food (41 items, 6 subcategories)
 * - Habitat Items (64 items, 5 subcategories)
 */

import { defineStore } from 'pinia'
import type { SuppliesItem, ItemFilters, ItemSortOptions, PurchaseResult, ItemType, NeedType } from '../types/supplies'
import { usePlayerProgression } from './playerProgression'
import { useInventoryStore } from './inventoryStore'
import { loadCatalog } from '../utils/catalogLoader'
import { QUALITY_ORDER } from '../constants/supplies'
import { hasServingSystem, getServingCount } from '../utils/servingSystem'

interface SuppliesStoreState {
  catalog: SuppliesItem[]
  catalogLoaded: boolean
}

export const useSuppliesStore = defineStore('supplies', {
  state: (): SuppliesStoreState => ({
    catalog: [],
    catalogLoaded: false
  }),

  getters: {
    // ========================================================================
    // Generic Filter Getters
    // ========================================================================

    /**
     * Get all items in a specific category
     * @param category - The category to filter by (bedding, hay, food, habitat_item)
     */
    itemsByCategory: (state) => (category: string): SuppliesItem[] => {
      return state.catalog.filter((item) => item.category === category)
    },

    /**
     * Get all items in a specific subcategory
     * @param subCategory - The subcategory to filter by
     */
    itemsBySubCategory: (state) => (subCategory: string): SuppliesItem[] => {
      return state.catalog.filter((item) => item.subCategory === subCategory)
    },

    // ========================================================================
    // Legacy Convenience Getters (for backward compatibility)
    // ========================================================================

    allBedding(): SuppliesItem[] {
      return this.itemsByCategory('bedding')
    },

    allHay(): SuppliesItem[] {
      return this.itemsByCategory('hay')
    },

    allFood(): SuppliesItem[] {
      return this.itemsByCategory('food')
    },

    allHabitatItems(): SuppliesItem[] {
      return this.itemsByCategory('habitat_item')
    },

    greens(): SuppliesItem[] {
      return this.itemsBySubCategory('greens')
    },

    herbs(): SuppliesItem[] {
      return this.itemsBySubCategory('herbs')
    },

    vegetables(): SuppliesItem[] {
      return this.itemsBySubCategory('vegetables')
    },

    fruits(): SuppliesItem[] {
      return this.itemsBySubCategory('fruits')
    },

    pellets(): SuppliesItem[] {
      return this.itemsBySubCategory('pellets')
    },

    treats(): SuppliesItem[] {
      return this.itemsBySubCategory('treats')
    },

    hideaways(): SuppliesItem[] {
      return this.itemsBySubCategory('hideaways')
    },

    toys(): SuppliesItem[] {
      return this.itemsBySubCategory('toys')
    },

    chews(): SuppliesItem[] {
      return this.itemsBySubCategory('chews')
    },

    bowlsAndBottles(): SuppliesItem[] {
      return this.itemsBySubCategory('bowls_bottles')
    },

    enrichment(): SuppliesItem[] {
      return this.itemsBySubCategory('enrichment')
    }
  },

  actions: {
    // ========================================================================
    // Initialization
    // ========================================================================

    initializeCatalog() {
      if (this.catalogLoaded) return

      // Load catalog from JSON files using catalogLoader utility
      this.catalog = loadCatalog()

      this.catalogLoaded = true
      console.log(`✅ Supplies Store initialized with ${this.catalog.length} items`)
    },

    // ========================================================================
    // Query Methods
    // ========================================================================

    getItemById(itemId: string): SuppliesItem | undefined {
      return this.catalog.find((item) => item.id === itemId)
    },

    getItemsByCategory(category: SuppliesItem['category']): SuppliesItem[] {
      return this.catalog.filter((item) => item.category === category)
    },

    getItemsBySubCategory(subCategory: SuppliesItem['subCategory']): SuppliesItem[] {
      return this.catalog.filter((item) => item.subCategory === subCategory)
    },

    filterItems(filters: ItemFilters): SuppliesItem[] {
      let results = [...this.catalog]

      if (filters.category) {
        results = results.filter((item) => item.category === filters.category)
      }

      if (filters.subCategory) {
        results = results.filter((item) => item.subCategory === filters.subCategory)
      }

      if (filters.minPrice !== undefined) {
        results = results.filter((item) => item.basePrice >= filters.minPrice!)
      }

      if (filters.maxPrice !== undefined) {
        results = results.filter((item) => item.basePrice <= filters.maxPrice!)
      }

      if (filters.quality) {
        results = results.filter((item) => item.quality === filters.quality)
      }

      if (filters.tier) {
        results = results.filter((item) => item.tier === filters.tier)
      }

      if (filters.availability) {
        results = results.filter((item) => item.availability === filters.availability)
      }

      if (filters.tags && filters.tags.length > 0) {
        results = results.filter((item) =>
          filters.tags!.some((tag) => item.tags?.includes(tag))
        )
      }

      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase()
        results = results.filter(
          (item) =>
            item.name.toLowerCase().includes(term) ||
            item.description.toLowerCase().includes(term)
        )
      }

      return results
    },

    sortItems(items: SuppliesItem[], sortOptions: ItemSortOptions): SuppliesItem[] {
      const sorted = [...items]

      sorted.sort((a, b) => {
        let comparison = 0

        switch (sortOptions.field) {
          case 'name':
            comparison = a.name.localeCompare(b.name)
            break
          case 'price':
            comparison = a.basePrice - b.basePrice
            break
          case 'quality':
            comparison =
              (QUALITY_ORDER[a.quality || 'average'] || 0) -
              (QUALITY_ORDER[b.quality || 'average'] || 0)
            break
          case 'tier':
            const tierOrder = { basic: 1, standard: 2, premium: 3 }
            comparison =
              (tierOrder[a.tier || 'standard'] || 0) - (tierOrder[b.tier || 'standard'] || 0)
            break
        }

        return sortOptions.direction === 'asc' ? comparison : -comparison
      })

      return sorted
    },

    // ========================================================================
    // Purchase Methods
    // ========================================================================

    purchaseItem(itemId: string, quantity: number = 1): PurchaseResult {
      const item = this.getItemById(itemId)

      if (!item) {
        return {
          success: false,
          message: `Item not found: ${itemId}`
        }
      }

      const totalCost = item.basePrice * quantity
      const playerProgression = usePlayerProgression()

      // Check if player has enough currency
      if (playerProgression.currency < totalCost) {
        return {
          success: false,
          message: `Insufficient funds. Need $${totalCost.toFixed(2)}, have $${playerProgression.currency.toFixed(2)}`
        }
      }

      // Deduct currency
      playerProgression.deductCurrency(totalCost, `purchase_${itemId}`)

      // Add to inventory
      const inventoryStore = useInventoryStore()

      // Check if item has serving-based system (hay, lettuce, carrots)
      if (hasServingSystem(item)) {
        const servings = getServingCount(item)
        // Add each item with serving tracking
        for (let i = 0; i < quantity; i++) {
          inventoryStore.addConsumableWithServings(itemId, servings)
        }
      } else {
        // Standard inventory addition
        inventoryStore.addItem(itemId, quantity)
      }

      console.log(`🛒 Purchase successful: ${quantity}x ${item.name} for $${totalCost.toFixed(2)}`)

      return {
        success: true,
        message: `Successfully purchased ${quantity}x ${item.name}`,
        itemsPurchased: [{
          itemId,
          quantity,
          totalCost
        }],
        remainingBalance: playerProgression.currency
      }
    },

    purchaseMultipleItems(items: { itemId: string; quantity: number }[]): PurchaseResult {
      const playerProgression = usePlayerProgression()
      let totalCost = 0
      const itemDetails: { itemId: string; quantity: number; totalCost: number; item: SuppliesItem }[] = []

      // Validate all items and calculate total cost
      for (const { itemId, quantity } of items) {
        const item = this.getItemById(itemId)

        if (!item) {
          return {
            success: false,
            message: `Item not found: ${itemId}`
          }
        }

        const itemCost = item.basePrice * quantity
        totalCost += itemCost
        itemDetails.push({ itemId, quantity, totalCost: itemCost, item })
      }

      // Check if player has enough currency
      if (playerProgression.currency < totalCost) {
        return {
          success: false,
          message: `Insufficient funds. Need $${totalCost.toFixed(2)}, have $${playerProgression.currency.toFixed(2)}`
        }
      }

      // Deduct currency
      playerProgression.deductCurrency(totalCost, 'purchase_multiple')

      // Add all items to inventory
      const inventoryStore = useInventoryStore()

      // Process each item - check if it has serving-based system
      for (const { itemId, quantity } of items) {
        const item = this.getItemById(itemId)

        if (hasServingSystem(item)) {
          const servings = getServingCount(item)
          // Add each item with serving tracking
          for (let i = 0; i < quantity; i++) {
            inventoryStore.addConsumableWithServings(itemId, servings)
          }
        } else {
          // Standard inventory addition
          inventoryStore.addItem(itemId, quantity)
        }
      }

      console.log(`🛒 Purchase successful: ${items.length} different items for $${totalCost.toFixed(2)}`)

      return {
        success: true,
        message: `Successfully purchased ${items.length} item(s)`,
        itemsPurchased: itemDetails.map(({ itemId, quantity, totalCost }) => ({
          itemId,
          quantity,
          totalCost
        })),
        remainingBalance: playerProgression.currency
      }
    },

    // ========================================================================
    // Autonomy System Helpers (System 16: Phase 1)
    // ========================================================================

    /**
     * Get all items of a specific type
     * @param itemType - The item type to filter by
     * @returns Array of items matching the type
     */
    getItemsByType(itemType: ItemType): SuppliesItem[] {
      return this.catalog.filter(item => item.stats?.itemType === itemType)
    },

    /**
     * Get the item type for a specific item ID
     * @param itemId - The item ID to look up
     * @returns The item type, or null if not found/no type
     */
    getItemType(itemId: string): ItemType | null {
      const item = this.getItemById(itemId)
      return item?.stats?.itemType || null
    },

    /**
     * Check if an item satisfies a specific need
     * @param itemId - The item ID to check
     * @param need - The need type to check against
     * @returns True if the item satisfies that need
     */
    itemSatisfiesNeed(itemId: string, need: NeedType): boolean {
      const item = this.getItemById(itemId)
      return item?.stats?.needSatisfied === need
    },

    /**
     * Get all items that satisfy a specific need (for autonomy decision-making)
     * @param need - The need type to find items for
     * @returns Array of items that satisfy the need
     */
    getItemsForNeed(need: NeedType): SuppliesItem[] {
      return this.catalog.filter(item => item.stats?.needSatisfied === need)
    }
  }
})
