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
import { useGameTimingStore } from './gameTimingStore'
import { useGuineaPigStore } from './guineaPigStore'
import { useNeedsController } from './needsController'

// TypeScript interfaces
interface GameState {
  currentState: 'intro' | 'playing' | 'paused' | 'stopped'
  pauseReason?: 'manual' | 'orientation' | 'navigation' | 'visibility' | 'silent' | null
  hasGuineaPig: boolean
  isFirstTimeUser: boolean
  lastSaveTimestamp: number
}

interface GameSettings {
  tutorial: {
    mode: 'auto' | 'always_show' | 'never_show'
    isGlobalFirstTime: boolean
  }
  performance: {
    mode: 'standard' | 'reduced'
  }
  errorReporting: {
    enabled: boolean
  }
}


export const useGameController = defineStore('gameController', () => {
  // Get stores (lazy initialization to avoid circular dependencies)
  let loggingStore: any = null
  let guineaPigStore: any = null

  const getLoggingStore = () => {
    if (!loggingStore) {
      loggingStore = useLoggingStore()
    }
    return loggingStore
  }

  const getGuineaPigStore = () => {
    if (!guineaPigStore) {
      guineaPigStore = useGuineaPigStore()
    }
    return guineaPigStore
  }

  // Core state
  const gameState = ref<GameState>({
    currentState: 'intro',
    pauseReason: null,
    hasGuineaPig: false,
    isFirstTimeUser: true,
    lastSaveTimestamp: Date.now()
  })

  // Settings with defaults
  const settings = ref<GameSettings>({
    tutorial: {
      mode: 'auto',
      isGlobalFirstTime: true
    },
    performance: {
      mode: 'standard'
    },
    errorReporting: {
      enabled: import.meta.env.DEV
    }
  })

  // Computed properties
  const isGameActive = computed(() => gameState.value.currentState === 'playing')
  const isPaused = computed(() => gameState.value.currentState === 'paused')
  const isManuallyPaused = computed(() =>
    gameState.value.currentState === 'paused' && gameState.value.pauseReason === 'manual'
  )
  const isOrientationPaused = computed(() =>
    gameState.value.currentState === 'paused' && gameState.value.pauseReason === 'orientation'
  )
  const isVisibilityPaused = computed(() =>
    gameState.value.currentState === 'paused' && gameState.value.pauseReason === 'visibility'
  )

  // Guinea pig related computed properties
  const hasGuineaPig = computed(() => {
    const guineaPigStore = getGuineaPigStore()
    return guineaPigStore.hasGuineaPigs
  })

  const activeGuineaPig = computed(() => {
    const guineaPigStore = getGuineaPigStore()
    return guineaPigStore.activeGuineaPig
  })

  // State transition validation
  const isValidTransition = (from: string, to: string): boolean => {
    const validTransitions: Record<string, string[]> = {
      intro: ['playing'],
      playing: ['paused', 'stopped'],
      paused: ['playing', 'stopped'],
      stopped: ['intro', 'playing']
    }
    return validTransitions[from]?.includes(to) || false
  }

  // State management actions
  const setState = (newState: GameState['currentState'], pauseReason?: GameState['pauseReason'], context?: 'start' | 'resume') => {
    if (!isValidTransition(gameState.value.currentState, newState)) {
      // Log to both console and error tracking system
      console.error(`Invalid state transition: ${gameState.value.currentState} -> ${newState}`)
      const logging = getLoggingStore()
      logging.logError(`Invalid state transition: ${gameState.value.currentState} -> ${newState}`, {
        from: gameState.value.currentState,
        to: newState,
        source: 'gameController'
      })
      return false
    }

    const previousState = gameState.value.currentState
    gameState.value.currentState = newState
    gameState.value.pauseReason = newState === 'paused' ? pauseReason : null
    gameState.value.lastSaveTimestamp = Date.now()

    // Log state changes
    const logging = getLoggingStore()
    const stateMessages = {
      intro: 'Game started - Welcome to Guinea Pig Simulator! 🎮',
      playing: context === 'resume'
        ? 'Game resumed - Your guinea pigs are ready for care! 🐹'
        : 'Session started - Your guinea pigs are ready for care! 🐹',
      paused: `Game paused${pauseReason ? ` (${pauseReason})` : ''} ⏸️`,
      stopped: 'Game stopped - See you next time! 👋'
    }

    if (previousState !== newState) {
      logging.addPlayerAction(
        stateMessages[newState] || `Game state changed to ${newState}`,
        '🎮',
        { previousState, newState, pauseReason }
      )
    }

    return true
  }

  const startGame = () => {
    if (hasGuineaPig.value) {
      setState('playing', undefined, 'start')

      // Start the game timing system
      const gameTimingStore = useGameTimingStore()
      gameTimingStore.startGameLoop()
    } else {
      console.error('Cannot start game without guinea pig')
    }
  }

  const pauseGame = (reason: 'manual' | 'orientation' | 'navigation' | 'visibility' | 'silent' = 'manual') => {
    if (gameState.value.currentState === 'playing') {
      setState('paused', reason)

      // Pause the game timing system
      const gameTimingStore = useGameTimingStore()
      gameTimingStore.pauseGameLoop()

      // Pause needs processing (connected to game pause)
      const needsController = useNeedsController()
      needsController.pauseProcessing(false) // Not a manual pause, it's game-driven
    } else if (gameState.value.currentState === 'paused') {
      // Pause reason priority: manual > visibility > navigation > orientation
      const currentReason = gameState.value.pauseReason
      if (reason === 'manual' ||
          (reason === 'visibility' && currentReason !== 'manual') ||
          (reason === 'navigation' && currentReason === 'orientation')) {
        gameState.value.pauseReason = reason
      }
    }
  }

  const resumeGame = () => {
    if (gameState.value.currentState === 'paused') {
      setState('playing', undefined, 'resume')

      // Resume the game timing system (handles movement resume for all guinea pigs)
      const gameTimingStore = useGameTimingStore()
      gameTimingStore.resumeGameLoop()

      // Resume needs processing (connected to game resume)
      const needsController = useNeedsController()
      needsController.resumeProcessing()
    }
  }

  const stopGame = () => {
    if (['playing', 'paused'].includes(gameState.value.currentState)) {
      setState('stopped')

      // Stop the game timing system
      const gameTimingStore = useGameTimingStore()
      gameTimingStore.stopGameLoop()
    }
  }

  const newGame = (clearGuineaPigs: boolean = true) => {
    gameState.value = {
      currentState: 'intro',
      pauseReason: null,
      hasGuineaPig: false,
      isFirstTimeUser: settings.value.tutorial.isGlobalFirstTime,
      lastSaveTimestamp: Date.now()
    }

    // Only clear guinea pig store if explicitly requested (for true new game)
    if (clearGuineaPigs) {
      const guineaPigStore = getGuineaPigStore()
      guineaPigStore.collection.guineaPigs = {}
      guineaPigStore.collection.activeGuineaPigId = null
      guineaPigStore.collection.lastUpdated = Date.now()
    }
  }

  const setGuineaPigCreated = () => {
    gameState.value.hasGuineaPig = true
    gameState.value.isFirstTimeUser = false
    settings.value.tutorial.isGlobalFirstTime = false

    // Transition to playing state after creating guinea pig
    if (gameState.value.currentState === 'intro') {
      setState('playing')
    }

    const logging = getLoggingStore()
    logging.addAchievement('First Guinea Pig Created! 🐹', '🏆', {
      isFirstTimeUser: true,
      timestamp: Date.now()
    })
  }

  // Guinea pig creation helper that integrates with both stores
  const createGuineaPig = (name: string, gender: 'male' | 'female', breed: string): string => {
    const guineaPigStore = getGuineaPigStore()
    const guineaPigId = guineaPigStore.createGuineaPig(name, gender, breed)

    // Update game state to reflect guinea pig creation
    if (!hasGuineaPig.value) {
      setGuineaPigCreated()
    }

    // Sync game state with guinea pig data
    syncGameStateWithGuineaPigs()

    return guineaPigId
  }

  // State synchronization helpers
  const syncGameStateWithGuineaPigs = () => {
    const guineaPigStore = getGuineaPigStore()
    gameState.value.hasGuineaPig = guineaPigStore.hasGuineaPigs
  }

  // For future implementation of save game manager integration
  const syncGameStateWithSaveManager = () => {
    // This will be implemented when we add UI integration
    syncGameStateWithGuineaPigs()
  }



  // Settings management
  const updateSettings = (newSettings: Partial<GameSettings>) => {
    settings.value = { ...settings.value, ...newSettings }
  }

  const setTutorialMode = (mode: 'auto' | 'always_show' | 'never_show') => {
    settings.value.tutorial.mode = mode
  }

  const setPerformanceMode = (mode: 'standard' | 'reduced') => {
    settings.value.performance.mode = mode
  }

  const toggleErrorReporting = () => {
    settings.value.errorReporting.enabled = !settings.value.errorReporting.enabled
  }

  // Initialize store
  const initializeStore = () => {
    const logging = getLoggingStore()
    const guineaPigStore = getGuineaPigStore()

    logging.logInfo('Game Controller initializing...')

    // Guinea pig store is already initialized in App.vue
    // Sync state with guinea pig store
    syncGameStateWithGuineaPigs()

    // Sync state with guinea pig store
    if (guineaPigStore.hasGuineaPigs) {
      // Guinea pig data exists, sync state
      logging.logInfo('Guinea pig data found, syncing state')
      syncGameStateWithGuineaPigs()
    } else {
      // No guinea pig data, start fresh
      logging.logInfo('No guinea pig data found, starting new session')
      newGame(true)
    }

    logging.logInfo('Game Controller initialized successfully')
  }


  return {
    // State
    gameState,
    settings,

    // Computed
    isGameActive,
    isPaused,
    isManuallyPaused,
    isOrientationPaused,
    isVisibilityPaused,
    hasGuineaPig,
    activeGuineaPig,

    // Actions
    setState,
    startGame,
    pauseGame,
    resumeGame,
    stopGame,
    newGame,
    setGuineaPigCreated,
    createGuineaPig,


    // Settings
    updateSettings,
    setTutorialMode,
    setPerformanceMode,
    toggleErrorReporting,

    // Initialization
    initializeStore,

    // State synchronization
    syncGameStateWithGuineaPigs,
    syncGameStateWithSaveManager
  }
}, {
  persist: {
    key: 'gps2-game-controller',
    storage: localStorage
  }
})