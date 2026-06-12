/**
 * Guinea Pig Simulation Game (GPS2)
 * Copyright (c) 2025 ktocdev. All Rights Reserved.
 *
 * This file is part of the GPS2 proprietary software.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 */

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useGuineaPigStore } from './guineaPigStore'
import { useLoggingStore } from './loggingStore'
import { usePetStoreManager } from './petStoreManager'

export const useNeedsController = defineStore('needsController', () => {
  let loggingStore: any = null
  const getLoggingStore = () => {
    if (!loggingStore) {
      loggingStore = useLoggingStore()
    }
    return loggingStore
  }

  const currentWellness = ref<number>(100)
  const wellnessHistory = ref<number[]>([])
  const lastWellnessUpdate = ref<number>(Date.now())

  const isPenaltyActive = ref<boolean>(false)
  const currentPenaltyRate = ref<number>(0)
  const penaltyStartTime = ref<number | null>(null)

  const lastBatchUpdate = ref<number>(Date.now())
  const processingEnabled = ref<boolean>(false)
  const manuallyPausedByUser = ref<boolean>(false)
  const updateIntervalMs = ref<number>(5000)

  const wellnessThresholds = ref({
    penaltyThreshold: 45,
    warningThreshold: 50,
    recoveryThreshold: 55,
    bonusThreshold: 75
  })

  const penaltyRates = ref({
    severe: -1.0,
    high: -0.75,
    medium: -0.5
  })

  // Computed property to check if manually paused
  const isPausedManually = computed(() =>
    !processingEnabled.value && manuallyPausedByUser.value
  )

  function calculateWellness(guineaPigId: string): number {
    const guineaPigStore = useGuineaPigStore()
    const guineaPig = guineaPigStore.getGuineaPig(guineaPigId)
    if (!guineaPig) return 100

    const needs = guineaPig.needs

    // Critical Needs (high weight - 40%)
    const critical = (needs.hunger + needs.thirst + needs.energy + needs.shelter) / 4

    // Environmental Needs (medium weight - 35%)
    const environmental = (needs.play + needs.social + needs.comfort) / 3

    // Maintenance Needs (lower weight - 25%)
    const maintenance = (needs.hygiene + needs.nails + needs.chew) / 3

    const averageNeed = (
      (critical * 0.40) +
      (environmental * 0.35) +
      (maintenance * 0.25)
    )

    // Wellness is the weighted average of need satisfaction levels
    // 100 = fully satisfied (high wellness), 0 = completely unsatisfied (low wellness)
    const wellness = averageNeed

    return Math.max(0, Math.min(100, wellness))
  }

  function getPenaltyRate(wellness: number): number {
    if (wellness < 25) return penaltyRates.value.severe
    if (wellness < 35) return penaltyRates.value.high
    return penaltyRates.value.medium
  }

  function applyFriendshipPenalties(guineaPigId: string): void {
    const wellness = calculateWellness(guineaPigId)

    if (wellness < wellnessThresholds.value.penaltyThreshold) {
      const penaltyRate = getPenaltyRate(wellness)
      const guineaPigStore = useGuineaPigStore()

      guineaPigStore.adjustFriendship(guineaPigId, penaltyRate)

      isPenaltyActive.value = true
      currentPenaltyRate.value = penaltyRate

      if (!penaltyStartTime.value) {
        penaltyStartTime.value = Date.now()
      }

      // Removed friendship_penalty_applied logging to prevent spam
      // This was logging every 5 seconds when wellness was low
    } else if (wellness > wellnessThresholds.value.recoveryThreshold) {
      isPenaltyActive.value = false
      currentPenaltyRate.value = 0
      penaltyStartTime.value = null

      if (wellness > wellnessThresholds.value.bonusThreshold) {
        const guineaPigStore = useGuineaPigStore()
        guineaPigStore.adjustFriendship(guineaPigId, 0.2)

        // Removed friendship_bonus_applied logging to prevent spam
        // This was logging every 5 seconds when wellness was high
      }
    }
  }

  function checkThresholds(guineaPigId: string, wellness: number): void {
    if (wellness < wellnessThresholds.value.warningThreshold) {
      getLoggingStore().logActivity({
        category: 'needs',
        action: 'wellness_warning',
        details: {
          guineaPigId,
          wellness,
          threshold: wellnessThresholds.value.warningThreshold
        }
      })
    }
  }

  function processBatchUpdate(): void {
    if (!processingEnabled.value) return

    // Only process if enough time has passed since last update
    const now = Date.now()
    const timeSinceLastUpdate = now - lastBatchUpdate.value
    if (timeSinceLastUpdate < updateIntervalMs.value) return

    try {
      const guineaPigStore = useGuineaPigStore()
      const petStoreManager = usePetStoreManager()

      // First, process needs decay for all active guinea pigs
      guineaPigStore.processBatchNeedsDecay()

      // Phase 2: Process adoption timers for store guinea pigs
      petStoreManager.processAdoptionTimers()

      // Then calculate wellness and apply friendship effects
      const activeGuineaPigs = guineaPigStore.activeGuineaPigs

      // Defensive check: ensure activeGuineaPigs is an array
      if (!Array.isArray(activeGuineaPigs)) {
        getLoggingStore().logWarn('activeGuineaPigs is not an array in processBatchUpdate')
        return
      }

      activeGuineaPigs.forEach(gp => {
        if (!gp || !gp.id) {
          getLoggingStore().logWarn('Invalid guinea pig in processBatchUpdate')
          return
        }

        const wellness = calculateWellness(gp.id)

        currentWellness.value = wellness
        wellnessHistory.value.push(wellness)
        if (wellnessHistory.value.length > 100) {
          wellnessHistory.value.shift()
        }

        applyFriendshipPenalties(gp.id)

        checkThresholds(gp.id, wellness)
      })

      lastBatchUpdate.value = Date.now()
      lastWellnessUpdate.value = Date.now()
    } catch (error) {
      getLoggingStore().logActivity({
        category: 'error',
        action: 'batch_update_error',
        details: {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        }
      })
    }
  }

  function pauseProcessing(isManual: boolean = false): void {
    processingEnabled.value = false

    // Track if pause was user-initiated
    if (isManual) {
      manuallyPausedByUser.value = true
    }

    getLoggingStore().logActivity({
      category: 'system',
      action: 'needs_processing_paused',
      details: {
        timestamp: Date.now(),
        manual: isManual
      }
    })
  }

  function resumeProcessing(): void {
    processingEnabled.value = true
    manuallyPausedByUser.value = false  // Clear manual flag when resuming
    lastBatchUpdate.value = Date.now()

    // Reset needsLastUpdate timestamps to prevent accumulated time delta
    const guineaPigStore = useGuineaPigStore()
    const currentTime = Date.now()
    guineaPigStore.activeGuineaPigs.forEach(gp => {
      if (gp && gp.id) {
        guineaPigStore.needsLastUpdate[gp.id] = currentTime
      }
    })

    // If decay rate is at 0, reset to default (1x) when resuming
    if (guineaPigStore.settings.needsDecayRate === 0) {
      guineaPigStore.setNeedsDecayRate(1)
    }

    getLoggingStore().logActivity({
      category: 'system',
      action: 'needs_processing_resumed',
      details: { timestamp: Date.now() }
    })
  }

  function resetState(): void {
    currentWellness.value = 100
    wellnessHistory.value = []
    lastWellnessUpdate.value = Date.now()
    isPenaltyActive.value = false
    currentPenaltyRate.value = 0
    penaltyStartTime.value = null
    lastBatchUpdate.value = Date.now()
    processingEnabled.value = false
  }

  // Watch for session end and reset manual pause state
  const petStoreManager = usePetStoreManager()
  watch(
    () => petStoreManager.activeGameSession,
    (newSession, oldSession) => {
      // If session ended (was active, now null) and manually paused, reset
      if (oldSession && !newSession && manuallyPausedByUser.value) {
        resumeProcessing()
        const logging = getLoggingStore()
        logging.logInfo('Session ended - resetting manual pause state')
      }
    }
  )

  // Watch for needsDecayRate changes and sync manual pause state
  const guineaPigStore = useGuineaPigStore()
  watch(
    () => guineaPigStore.settings.needsDecayRate,
    (newRate, oldRate) => {
      // If decay rate is set to 0, mark as manually paused
      if (newRate === 0 && oldRate !== 0) {
        manuallyPausedByUser.value = true
        processingEnabled.value = false
        getLoggingStore().logActivity({
          category: 'system',
          action: 'needs_decay_paused',
          details: {
            reason: 'decay_rate_zero',
            previousRate: oldRate
          }
        })
      }
      // If decay rate is increased from 0, resume and clear manual pause
      else if (oldRate === 0 && newRate > 0) {
        manuallyPausedByUser.value = false
        processingEnabled.value = true
        lastBatchUpdate.value = Date.now()

        // Reset needsLastUpdate timestamps to prevent accumulated time delta
        const currentTime = Date.now()
        guineaPigStore.activeGuineaPigs.forEach(gp => {
          guineaPigStore.needsLastUpdate[gp.id] = currentTime
        })

        getLoggingStore().logActivity({
          category: 'system',
          action: 'needs_decay_resumed',
          details: {
            reason: 'decay_rate_increased',
            newRate: newRate
          }
        })
      }
    }
  )

  return {
    currentWellness,
    wellnessHistory,
    lastWellnessUpdate,
    isPenaltyActive,
    currentPenaltyRate,
    penaltyStartTime,
    lastBatchUpdate,
    processingEnabled,
    manuallyPausedByUser,
    isPausedManually,
    updateIntervalMs,
    wellnessThresholds,
    penaltyRates,
    calculateWellness,
    getPenaltyRate,
    applyFriendshipPenalties,
    checkThresholds,
    processBatchUpdate,
    pauseProcessing,
    resumeProcessing,
    resetState
  }
}, {
  persist: {
    key: 'gps2-needs-controller',
    storage: sessionStorage
  }
})