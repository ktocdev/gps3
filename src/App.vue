<template>
  <RouterView />
  <PauseOverlay
    v-model="showPauseOverlay"
    :pause-reason="pauseReason"
    @resume="handleResume"
  />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useGuineaPigStore } from './stores/guineaPigStore'
import { useGameController } from './stores/gameController'
import { usePetStoreManager } from './stores/petStoreManager'
import { usePlayerProgression } from './stores/playerProgression'
import PauseOverlay from './components/game/dialogs/PauseOverlay.vue'

const gameController = useGameController()
const showPauseOverlay = ref(false)
const pauseReason = ref<'manual' | 'visibility' | 'orientation' | 'navigation'>('manual')

onMounted(() => {
  // Initialize stores in correct order

  // 1. Initialize Player Progression (persistent state)
  const playerProgression = usePlayerProgression()
  playerProgression.initializeStore()

  // 2. Initialize Guinea Pig Store
  const guineaPigStore = useGuineaPigStore()
  guineaPigStore.initializeStore()

  // 3. Initialize Pet Store Manager
  const petStoreManager = usePetStoreManager()
  petStoreManager.initializeStore()

  // 4. Initialize Game Controller
  gameController.initializeStore()

  // 5. Set up Page Visibility API for automatic pause
  setupVisibilityListeners()

  // 6. Watch for manual pause state changes
  setupPauseWatcher()
})

onUnmounted(() => {
  cleanupVisibilityListeners()
})

// Page Visibility API - pause game when tab/window loses focus
let visibilityChangeHandler: (() => void) | null = null

function setupVisibilityListeners() {
  visibilityChangeHandler = () => {
    if (document.hidden) {
      // Tab/window lost focus - pause the game
      if (gameController.isGameActive) {
        gameController.pauseGame('visibility')
        pauseReason.value = 'visibility'
        showPauseOverlay.value = true
      }
    }
    // Note: We don't auto-resume when tab becomes visible
    // User must click the resume button
  }

  document.addEventListener('visibilitychange', visibilityChangeHandler)
}

function cleanupVisibilityListeners() {
  if (visibilityChangeHandler) {
    document.removeEventListener('visibilitychange', visibilityChangeHandler)
    visibilityChangeHandler = null
  }
}

// Watch for manual pause from UI controls (pause button, etc.)
function setupPauseWatcher() {
  watch(
    () => gameController.gameState.pauseReason,
    (newReason) => {
      // Only show overlay for manual, visibility, and orientation pauses
      // Navigation pauses are handled by router, not overlay
      if (gameController.isPaused && newReason) {
        if (newReason === 'manual' || newReason === 'visibility' || newReason === 'orientation') {
          pauseReason.value = newReason
          // Don't show overlay again if it's already showing
          if (!showPauseOverlay.value) {
            showPauseOverlay.value = true
          }
        }
      }
    }
  )
}

function handleResume() {
  gameController.resumeGame()
  showPauseOverlay.value = false
}
</script>