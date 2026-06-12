/**
 * Manual Control System for Guinea Pigs
 * Allows players to temporarily take control of guinea pig movement
 */

import { ref, computed, watch } from 'vue'

// Types
export interface ManualControlState {
  enabled: boolean
  controlledGuineaPigId: string | null
  startTime: number
  lastActivityTime: number
  autoReleaseTimeout: number // milliseconds
}

export interface ControlTarget {
  x: number
  y: number
  timestamp: number
}

// Constants
const DEFAULT_TIMEOUT = 30000 // 30 seconds
const STRESS_THRESHOLD = 80 // Release control if stress > 80

// Global state (shared across components)
const controlState = ref<ManualControlState>({
  enabled: false,
  controlledGuineaPigId: null,
  startTime: 0,
  lastActivityTime: 0,
  autoReleaseTimeout: DEFAULT_TIMEOUT
})

const targetPosition = ref<ControlTarget | null>(null)
const pathQueue = ref<ControlTarget[]>([])

export function useManualControl() {
  // Computed properties
  const isControlActive = computed(() => controlState.value.enabled)
  const controlledGuineaPigId = computed(() => controlState.value.controlledGuineaPigId)
  const timeRemaining = computed(() => {
    if (!controlState.value.enabled) return 0
    const elapsed = Date.now() - controlState.value.lastActivityTime
    const remaining = controlState.value.autoReleaseTimeout - elapsed
    return Math.max(0, Math.floor(remaining / 1000)) // Return seconds
  })

  /**
   * Take control of a guinea pig
   */
  function takeControl(guineaPigId: string) {
    // Release any existing control
    if (controlState.value.enabled && controlState.value.controlledGuineaPigId !== guineaPigId) {
      releaseControl()
    }

    // Take control of new guinea pig
    controlState.value = {
      enabled: true,
      controlledGuineaPigId: guineaPigId,
      startTime: Date.now(),
      lastActivityTime: Date.now(),
      autoReleaseTimeout: DEFAULT_TIMEOUT
    }

    // Clear any existing targets
    targetPosition.value = null
    pathQueue.value = []

    console.log(`[Manual Control] Took control of guinea pig: ${guineaPigId}`)
  }

  /**
   * Release control of current guinea pig
   */
  function releaseControl() {
    if (!controlState.value.enabled) return

    const gpId = controlState.value.controlledGuineaPigId

    // Reset state
    controlState.value = {
      enabled: false,
      controlledGuineaPigId: null,
      startTime: 0,
      lastActivityTime: 0,
      autoReleaseTimeout: DEFAULT_TIMEOUT
    }

    // Clear targets
    targetPosition.value = null
    pathQueue.value = []

    console.log(`[Manual Control] Released control of guinea pig: ${gpId}`)
  }

  /**
   * Check if a specific guinea pig is being controlled
   */
  function isControlled(guineaPigId: string): boolean {
    return controlState.value.enabled && controlState.value.controlledGuineaPigId === guineaPigId
  }

  /**
   * Set movement target for controlled guinea pig
   */
  function setTarget(x: number, y: number) {
    if (!controlState.value.enabled) return

    targetPosition.value = {
      x,
      y,
      timestamp: Date.now()
    }

    // Update activity time
    controlState.value.lastActivityTime = Date.now()

    console.log(`[Manual Control] Set target: (${x.toFixed(0)}, ${y.toFixed(0)})`)
  }

  /**
   * Add a waypoint to the path queue (future feature)
   */
  function addWaypoint(x: number, y: number) {
    if (!controlState.value.enabled) return

    pathQueue.value.push({
      x,
      y,
      timestamp: Date.now()
    })

    // Update activity time
    controlState.value.lastActivityTime = Date.now()
  }

  /**
   * Get current target position
   */
  function getTargetPosition(): ControlTarget | null {
    return targetPosition.value
  }

  /**
   * Get next waypoint from queue
   */
  function getNextWaypoint(): ControlTarget | null {
    if (pathQueue.value.length === 0) return null
    return pathQueue.value[0]
  }

  /**
   * Remove completed waypoint from queue
   */
  function completeWaypoint() {
    if (pathQueue.value.length > 0) {
      pathQueue.value.shift()
    }
  }

  /**
   * Clear all targets and waypoints
   */
  function clearTargets() {
    targetPosition.value = null
    pathQueue.value = []
  }

  /**
   * Check if control should be automatically released
   */
  function checkAutoRelease(guineaPigStress?: number): boolean {
    if (!controlState.value.enabled) return false

    // Check timeout
    const elapsed = Date.now() - controlState.value.lastActivityTime
    if (elapsed > controlState.value.autoReleaseTimeout) {
      console.log('[Manual Control] Auto-release: timeout')
      releaseControl()
      return true
    }

    // Check stress level
    if (guineaPigStress !== undefined && guineaPigStress > STRESS_THRESHOLD) {
      console.log('[Manual Control] Auto-release: high stress')
      releaseControl()
      return true
    }

    return false
  }

  /**
   * Update activity timestamp (call when user interacts)
   */
  function updateActivity() {
    if (controlState.value.enabled) {
      controlState.value.lastActivityTime = Date.now()
    }
  }

  /**
   * Set custom timeout duration
   */
  function setAutoReleaseTimeout(milliseconds: number) {
    controlState.value.autoReleaseTimeout = milliseconds
  }

  /**
   * Toggle control for a guinea pig
   */
  function toggleControl(guineaPigId: string) {
    if (isControlled(guineaPigId)) {
      releaseControl()
    } else {
      takeControl(guineaPigId)
    }
  }

  // Auto-release watcher
  let autoReleaseInterval: number | null = null

  function startAutoReleaseChecker() {
    if (autoReleaseInterval) return

    autoReleaseInterval = window.setInterval(() => {
      if (controlState.value.enabled) {
        checkAutoRelease()
      }
    }, 1000) // Check every second
  }

  function stopAutoReleaseChecker() {
    if (autoReleaseInterval) {
      clearInterval(autoReleaseInterval)
      autoReleaseInterval = null
    }
  }

  // Watch for control state changes
  watch(isControlActive, (active) => {
    if (active) {
      startAutoReleaseChecker()
    } else {
      stopAutoReleaseChecker()
    }
  })

  return {
    // State
    isControlActive,
    controlledGuineaPigId,
    timeRemaining,

    // Actions
    takeControl,
    releaseControl,
    toggleControl,
    isControlled,

    // Movement
    setTarget,
    addWaypoint,
    getTargetPosition,
    getNextWaypoint,
    completeWaypoint,
    clearTargets,

    // Configuration
    setAutoReleaseTimeout,
    updateActivity,
    checkAutoRelease
  }
}