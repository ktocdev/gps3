/**
 * UI Preferences Store
 *
 * Phase 5, System 28: Settings & Preferences Enhancement System (Foundation)
 *
 * Manages user interface preferences and customization options.
 * This store will expand as new UI features are added throughout development.
 *
 * Current preferences:
 * - Item placement mode (drag vs select/tap)
 *
 * Future preferences (as features are added):
 * - Theme/color scheme
 * - Animation quality
 * - Sound settings
 * - Accessibility options
 * - etc.
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getDefaultPlacementMode } from '../utils/deviceDetection'

export type PlacementMode = 'drag' | 'select'

export const useUiPreferencesStore = defineStore('uiPreferences', () => {
  /**
   * Item Placement Mode
   * Controls how inventory items are placed in the habitat.
   * - 'drag': Traditional drag-and-drop (better for mouse/desktop)
   * - 'select': Tap item, tap cell, tap place button (better for touch devices)
   */
  const itemPlacementMode = ref<PlacementMode>(getDefaultPlacementMode())

  // Track if user has manually changed the mode
  const hasManuallySetMode = ref(false)

  /**
   * Initialize preferences
   * Auto-detects best placement mode on first load if not manually set
   */
  function initializePreferences() {
    // If user hasn't manually set a preference, use auto-detection
    if (!hasManuallySetMode.value) {
      const autoDetectedMode = getDefaultPlacementMode()
      if (itemPlacementMode.value !== autoDetectedMode) {
        itemPlacementMode.value = autoDetectedMode
        console.log(`🎯 Auto-detected placement mode: ${itemPlacementMode.value}`)
      }
    }
  }

  /**
   * Toggle placement mode between drag and select
   */
  function togglePlacementMode() {
    hasManuallySetMode.value = true
    itemPlacementMode.value = itemPlacementMode.value === 'drag' ? 'select' : 'drag'
    console.log(`🎯 Placement mode switched to: ${itemPlacementMode.value}`)
  }

  /**
   * Set placement mode explicitly
   */
  function setPlacementMode(mode: PlacementMode) {
    hasManuallySetMode.value = true
    itemPlacementMode.value = mode
    console.log(`🎯 Placement mode set to: ${mode}`)
  }

  /**
   * Reset all preferences to defaults
   */
  function resetPreferences() {
    hasManuallySetMode.value = false
    itemPlacementMode.value = getDefaultPlacementMode()
    console.log('🔄 UI preferences reset to defaults')
  }

  return {
    // State
    itemPlacementMode,
    hasManuallySetMode,

    // Actions
    initializePreferences,
    togglePlacementMode,
    setPlacementMode,
    resetPreferences
  }
}, {
  persist: {
    key: 'uiPreferences',
    storage: localStorage
  }
})
