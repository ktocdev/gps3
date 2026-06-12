/**
 * Centralized Behavior State Store
 * Stores current activity and goal state for all guinea pigs
 * Allows components to access behavior state without creating multiple composable instances
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { BehaviorState } from '../composables/game/useGuineaPigBehavior'

export const useBehaviorStateStore = defineStore('behaviorState', () => {
  // Map of guinea pig ID to their behavior state
  const behaviorStates = ref<Map<string, BehaviorState>>(new Map())
  // Track pending interaction timeouts for cleanup
  const interactionTimeouts = new Map<string, number>()

  /**
   * Initialize behavior state for a guinea pig
   */
  function initializeBehaviorState(guineaPigId: string): void {
    if (!behaviorStates.value.has(guineaPigId)) {
      behaviorStates.value.set(guineaPigId, {
        currentGoal: null,
        currentActivity: 'idle',
        activityStartTime: Date.now(),
        // Add random offset (0-3 seconds) to prevent synchronized decision-making
        lastDecisionTime: Date.now() - Math.random() * 3000,
        behaviorCooldowns: new Map()
      })
    }
  }

  /**
   * Get behavior state for a guinea pig
   */
  function getBehaviorState(guineaPigId: string): BehaviorState | undefined {
    return behaviorStates.value.get(guineaPigId)
  }

  /**
   * Update behavior state for a guinea pig
   */
  function updateBehaviorState(guineaPigId: string, state: Partial<BehaviorState>): void {
    const currentState = behaviorStates.value.get(guineaPigId)
    if (currentState) {
      Object.assign(currentState, state)
    }
  }

  /**
   * Remove behavior state for a guinea pig (cleanup)
   */
  function removeBehaviorState(guineaPigId: string): void {
    // Clear any pending interaction timeout
    const timeoutId = interactionTimeouts.get(guineaPigId)
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
      interactionTimeouts.delete(guineaPigId)
    }
    behaviorStates.value.delete(guineaPigId)
  }

  /**
   * Clear all behavior states
   */
  function clearAll(): void {
    // Clear all pending timeouts
    interactionTimeouts.forEach(timeoutId => clearTimeout(timeoutId))
    interactionTimeouts.clear()
    behaviorStates.value.clear()
  }

  /**
   * Trigger player interaction wiggle animation
   * Sets guinea pig to 'interacting' state temporarily, then returns to idle
   */
  function triggerPlayerInteraction(guineaPigId: string, duration: number = 1500): void {
    const state = behaviorStates.value.get(guineaPigId)
    if (state) {
      state.currentActivity = 'interacting'
      state.activityStartTime = Date.now()

      // Clear any existing timeout for this guinea pig
      const existingTimeout = interactionTimeouts.get(guineaPigId)
      if (existingTimeout !== undefined) {
        clearTimeout(existingTimeout)
      }

      // Return to idle after duration and track timeout for cleanup
      const timeoutId = window.setTimeout(() => {
        const currentState = behaviorStates.value.get(guineaPigId)
        if (currentState && currentState.currentActivity === 'interacting') {
          currentState.currentActivity = 'idle'
        }
        interactionTimeouts.delete(guineaPigId)
      }, duration)

      interactionTimeouts.set(guineaPigId, timeoutId)
    }
  }

  return {
    behaviorStates,
    initializeBehaviorState,
    getBehaviorState,
    updateBehaviorState,
    removeBehaviorState,
    clearAll,
    triggerPlayerInteraction
  }
})
