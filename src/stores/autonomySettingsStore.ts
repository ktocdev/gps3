/**
 * Guinea Pig Simulation Game (GPS2)
 * Copyright (c) 2025 ktocdev. All Rights Reserved.
 *
 * This file is part of the GPS2 proprietary software.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * Behavior thresholds per guinea pig
 * When a need drops below its threshold, the AI will prioritize satisfying that need
 */
export interface BehaviorThresholds {
  hunger: number   // Seek food when hunger < threshold
  thirst: number   // Seek water when thirst < threshold
  energy: number   // Sleep when energy < threshold
  hygiene: number  // Groom when hygiene < threshold
  shelter: number  // Seek shelter when shelter < threshold
  chew: number     // Use chew items when chew < threshold
  play: number     // Use toys when play < threshold
  social: number   // Socialize with companion when social < threshold
}

/**
 * Default behavior thresholds (matches useGuineaPigBehavior defaults)
 */
export const DEFAULT_THRESHOLDS: BehaviorThresholds = {
  hunger: 65,  // Seek food when hunger satisfaction < 65%
  thirst: 60,  // Seek water when thirst satisfaction < 60%
  energy: 60,  // Seek rest when energy < 60%
  hygiene: 55, // Groom when hygiene < 55%
  shelter: 65, // Seek shelter when shelter < 65%
  chew: 75,    // Use chew items when chew < 75%
  play: 75,    // Use toys when play < 75%
  social: 50   // Socialize with companion when social < 50%
}

/**
 * Autonomy Settings Store
 * Stores per-guinea-pig behavior thresholds for the autonomous AI system
 */
export const useAutonomySettingsStore = defineStore('autonomySettings', () => {
  // Store thresholds per guinea pig (keyed by guinea pig ID)
  const behaviorThresholds = ref<Record<string, BehaviorThresholds>>({})

  /**
   * Get behavior thresholds for a guinea pig
   * Returns default thresholds if none have been set
   */
  function getThresholds(guineaPigId: string): BehaviorThresholds {
    if (!behaviorThresholds.value[guineaPigId]) {
      // Initialize with defaults if not present
      behaviorThresholds.value[guineaPigId] = { ...DEFAULT_THRESHOLDS }
    }
    return behaviorThresholds.value[guineaPigId]
  }

  /**
   * Set a specific threshold for a guinea pig
   */
  function setThreshold(
    guineaPigId: string,
    needType: keyof BehaviorThresholds,
    value: number
  ): void {
    // Ensure guinea pig has threshold record
    if (!behaviorThresholds.value[guineaPigId]) {
      behaviorThresholds.value[guineaPigId] = { ...DEFAULT_THRESHOLDS }
    }

    // Update specific threshold
    behaviorThresholds.value[guineaPigId][needType] = value
  }

  /**
   * Reset a guinea pig's thresholds to defaults
   */
  function resetThresholds(guineaPigId: string): void {
    behaviorThresholds.value[guineaPigId] = { ...DEFAULT_THRESHOLDS }
  }

  /**
   * Reset all thresholds to defaults
   */
  function resetAllThresholds(): void {
    behaviorThresholds.value = {}
  }

  /**
   * Remove thresholds for a guinea pig (cleanup when guinea pig is removed)
   */
  function removeGuineaPig(guineaPigId: string): void {
    delete behaviorThresholds.value[guineaPigId]
  }

  return {
    // State
    behaviorThresholds,

    // Actions
    getThresholds,
    setThreshold,
    resetThresholds,
    resetAllThresholds,
    removeGuineaPig
  }
}, {
  persist: {
    key: 'gps2-autonomy-settings',
    storage: sessionStorage
  }
})
