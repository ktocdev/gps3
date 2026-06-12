/**
 * Guinea Pig Simulation Game (GPS2)
 * Copyright (c) 2025 ktocdev. All Rights Reserved.
 *
 * This file is part of the GPS2 proprietary software.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useLoggingStore } from './loggingStore'
import { useNeedsController } from './needsController'
import { useGameController } from './gameController'
import { useGameViewStore } from './gameViewStore'
import { useHabitatConditions } from './habitatConditions'
import { useGuineaPigStore } from './guineaPigStore'
import { useAutonomySettingsStore } from './autonomySettingsStore'
import { useGuineaPigBehavior } from '../composables/game/useGuineaPigBehavior'
import { processAllBonds } from '../utils/bondingProgression'

export const useGameTimingStore = defineStore('gameTiming', () => {
  let loggingStore: any = null
  const getLoggingStore = () => {
    if (!loggingStore) {
      loggingStore = useLoggingStore()
    }
    return loggingStore
  }

  // Core timing state
  const isRunning = ref<boolean>(false)
  const gameLoopInterval = ref<number | null>(null)
  const lastUpdate = ref<number>(Date.now())
  const totalGameTime = ref<number>(0) // Total milliseconds of game time

  // Timing configuration
  const intervalMs = ref<number>(1000) // 1 second for smooth autonomous behavior (was 5000)
  const maxDeltaTime = ref<number>(30000) // 30 seconds max delta to prevent large jumps

  // System 16: Phase 5 - Item effectiveness recovery timing
  const lastEffectivenessRecovery = ref<number>(Date.now())

  // System 19: Cache behavior composables to avoid recreating them every tick
  const behaviorComposables = new Map<string, ReturnType<typeof useGuineaPigBehavior>>()

  // Performance tracking
  const updateCount = ref<number>(0)
  const averageUpdateTime = ref<number>(0)
  const lastUpdateDuration = ref<number>(0)

  // Game loop statistics
  const stats = computed(() => ({
    isRunning: isRunning.value,
    intervalMs: intervalMs.value,
    updateCount: updateCount.value,
    totalGameTime: totalGameTime.value,
    averageUpdateTime: averageUpdateTime.value,
    lastUpdateDuration: lastUpdateDuration.value,
    uptime: Date.now() - (lastUpdate.value - totalGameTime.value)
  }))

  const startGameLoop = (): void => {
    if (isRunning.value) {
      getLoggingStore().logWarn('Game loop already running')
      return
    }

    // On game start, add small random offset to each guinea pig's lastPoopTime
    // to prevent synchronized pooping when game loads from save
    const guineaPigStore = useGuineaPigStore()
    const currentTime = Date.now()
    guineaPigStore.activeGuineaPigs.forEach(gp => {
      // Add random offset (0-30 seconds) to desynchronize
      // Only if lastPoopTime is very recent (within last minute), meaning it's likely from a save
      const timeSince = currentTime - gp.lastPoopTime
      if (timeSince < 60000) {  // If last poop was less than 1 minute ago
        gp.lastPoopTime = currentTime - Math.random() * 30000
      }
    })

    isRunning.value = true
    lastUpdate.value = Date.now()

    gameLoopInterval.value = setInterval(() => {
      processGameTick()
    }, intervalMs.value) as unknown as number

    getLoggingStore().logActivity({
      category: 'system',
      action: 'game_loop_started',
      details: {
        intervalMs: intervalMs.value,
        timestamp: Date.now()
      }
    })
  }

  const stopGameLoop = (): void => {
    if (!isRunning.value) return

    isRunning.value = false

    if (gameLoopInterval.value) {
      clearInterval(gameLoopInterval.value)
      gameLoopInterval.value = null
    }

    getLoggingStore().logActivity({
      category: 'system',
      action: 'game_loop_stopped',
      details: {
        totalUpdates: updateCount.value,
        totalGameTime: totalGameTime.value,
        timestamp: Date.now()
      }
    })
  }

  const pauseGameLoop = (): void => {
    if (!isRunning.value) return

    stopGameLoop()

    getLoggingStore().logActivity({
      category: 'system',
      action: 'game_loop_paused',
      details: {
        timestamp: Date.now()
      }
    })
  }

  const resumeGameLoop = (): void => {
    if (isRunning.value) return

    // Reset timing to prevent large delta jumps after pause
    lastUpdate.value = Date.now()

    // Resume movement for all guinea pigs that were walking when paused (System 18)
    behaviorComposables.forEach((behavior) => {
      behavior.resumeMovement()
    })

    startGameLoop()

    getLoggingStore().logActivity({
      category: 'system',
      action: 'game_loop_resumed',
      details: {
        timestamp: Date.now()
      }
    })
  }

  const processGameTick = (): void => {
    const updateStartTime = Date.now()
    const currentTime = updateStartTime
    let deltaTime = currentTime - lastUpdate.value

    // Prevent excessive delta times (e.g., after computer sleep)
    if (deltaTime > maxDeltaTime.value) {
      deltaTime = maxDeltaTime.value
      getLoggingStore().logActivity({
        category: 'system',
        action: 'delta_time_clamped',
        details: {
          originalDelta: currentTime - lastUpdate.value,
          clampedDelta: deltaTime
        }
      })
    }

    try {
      // Get the game controller to check if game is active
      const gameController = useGameController()

      // Only process game systems if game is in playing state
      if (gameController.isGameActive) {
        // Convert delta time to seconds for game systems
        const deltaSeconds = deltaTime / 1000

        // Process needs system
        const needsController = useNeedsController()
        needsController.processBatchUpdate()

        // System 19: Process autonomous AI behaviors for each guinea pig
        // Skip 2D behavior in 3D mode - use3DBehavior handles everything there
        const gameViewStore = useGameViewStore()
        const guineaPigStore = useGuineaPigStore()

        if (gameViewStore.mode !== '3d') {
          const autonomySettings = useAutonomySettingsStore()

          for (const guineaPig of guineaPigStore.activeGuineaPigs) {
            // Get or create cached behavior composable for this guinea pig
            let behavior = behaviorComposables.get(guineaPig.id)
            if (!behavior) {
              behavior = useGuineaPigBehavior(guineaPig.id)
              behaviorComposables.set(guineaPig.id, behavior)
            }

            // Get custom thresholds for this guinea pig (or defaults if not set)
            const thresholds = autonomySettings.getThresholds(guineaPig.id)

            // Call tick with custom thresholds from debug panel
            behavior.tick(thresholds).catch(error => {
              getLoggingStore().logWarn(`AI tick error for ${guineaPig.name}: ${error}`)
            })
          }
        }

        // Clean up behavior composables for guinea pigs that are no longer active
        const activeIds = new Set(guineaPigStore.activeGuineaPigs.map(gp => gp.id))
        for (const [id, _behavior] of behaviorComposables.entries()) {
          if (!activeIds.has(id)) {
            behaviorComposables.delete(id)
          }
        }

        // System 16: Phase 3 - Apply environmental decay
        const habitatConditions = useHabitatConditions()
        habitatConditions.applyEnvironmentalDecay(deltaSeconds)

        // System 16: Phase 5 - Apply effectiveness recovery once per hour
        if (currentTime - lastEffectivenessRecovery.value > 3600000) {  // 1 hour
          habitatConditions.applyEffectivenessRecovery()
          lastEffectivenessRecovery.value = currentTime
        }

        // System 21: Process bonding progression
        processAllBonds(deltaTime)

        // Update timing stats
        totalGameTime.value += deltaTime
        updateCount.value += 1
        lastUpdate.value = currentTime

        // Calculate performance metrics
        const updateDuration = Date.now() - updateStartTime
        lastUpdateDuration.value = updateDuration

        // Update rolling average of update times
        const weight = 0.1 // 10% weight for new sample
        averageUpdateTime.value = (averageUpdateTime.value * (1 - weight)) + (updateDuration * weight)

        // Log performance warnings if updates are taking too long
        if (updateDuration > 100) { // 100ms threshold
          getLoggingStore().logActivity({
            category: 'performance',
            action: 'slow_game_tick',
            details: {
              duration: updateDuration,
              deltaTime,
              updateCount: updateCount.value
            }
          })
        }

      } else {
        // Game is paused, just update the last update time to prevent delta accumulation
        lastUpdate.value = currentTime
      }

    } catch (error) {
      getLoggingStore().logActivity({
        category: 'error',
        action: 'game_tick_error',
        details: {
          error: error instanceof Error ? error.message : String(error),
          timestamp: currentTime
        }
      })
    }
  }

  const setIntervalMs = (newInterval: number): void => {
    if (newInterval < 1000 || newInterval > 60000) {
      getLoggingStore().logWarn(`Invalid interval: ${newInterval}ms. Must be between 1000-60000ms`)
      return
    }

    const wasRunning = isRunning.value

    if (wasRunning) {
      stopGameLoop()
    }

    intervalMs.value = newInterval

    if (wasRunning) {
      startGameLoop()
    }

    getLoggingStore().logActivity({
      category: 'system',
      action: 'interval_changed',
      details: {
        newInterval,
        wasRunning
      }
    })
  }

  const resetStats = (): void => {
    updateCount.value = 0
    totalGameTime.value = 0
    averageUpdateTime.value = 0
    lastUpdateDuration.value = 0
    lastUpdate.value = Date.now()

    getLoggingStore().logActivity({
      category: 'system',
      action: 'timing_stats_reset',
      details: {
        timestamp: Date.now()
      }
    })
  }

  const getGameTime = (): number => {
    return totalGameTime.value
  }

  const getGameTimeFormatted = (): string => {
    const seconds = Math.floor(totalGameTime.value / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  }

  return {
    // State
    isRunning,
    intervalMs,
    lastUpdate,
    totalGameTime,
    updateCount,
    averageUpdateTime,
    lastUpdateDuration,
    maxDeltaTime,

    // Computed
    stats,

    // Game loop control
    startGameLoop,
    stopGameLoop,
    pauseGameLoop,
    resumeGameLoop,

    // Configuration
    setIntervalMs,

    // Utilities
    resetStats,
    getGameTime,
    getGameTimeFormatted
  }
}, {
  persist: {
    key: 'gps2-game-timing',
    storage: sessionStorage
  }
})