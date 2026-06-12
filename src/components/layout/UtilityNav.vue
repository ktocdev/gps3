<template>
  <nav class="utility-nav">
    <button
      @click="toggleGamePause"
      class="utility-nav__button utility-nav__button--primary"
      :disabled="!canTogglePause"
      :title="pauseButtonTitle"
    >
      {{ pauseButtonText }}
    </button>
    <button @click="clearAllStorage" class="utility-nav__button utility-nav__button--danger">
      ✨ Clear All Storage
    </button>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameController } from '../../stores/gameController'
import { usePetStoreManager } from '../../stores/petStoreManager'
import { useHabitatConditions } from '../../stores/habitatConditions'
import { useGuineaPigStore } from '../../stores/guineaPigStore'
import { useGameTimingStore } from '../../stores/gameTimingStore'

const gameController = useGameController()
const petStoreManager = usePetStoreManager()
const habitatConditions = useHabitatConditions()
const guineaPigStore = useGuineaPigStore()
const gameTimingStore = useGameTimingStore()

const canTogglePause = computed(() => {
  return petStoreManager.activeGameSession !== null
})

const pauseButtonText = computed(() => {
  if (gameController.isPaused) {
    return '▶️ Resume Game'
  }
  return '⏸️ Pause Game'
})

const pauseButtonTitle = computed(() => {
  if (!petStoreManager.activeGameSession) {
    return 'No active game session'
  }
  if (gameController.isPaused) {
    return 'Resume the game'
  }
  return 'Pause the game'
})

const toggleGamePause = () => {
  if (gameController.isPaused) {
    gameController.resumeGame()
  } else {
    gameController.pauseGame('manual')
  }
}

const clearAllStorage = () => {
  if (confirm('⚠️ This will clear ALL storage (localStorage + sessionStorage) and reload the page. Continue?')) {
    try {
      // 1. Stop game loop and all timers first to prevent state updates during clearing
      gameTimingStore.stopGameLoop()
      if (gameController.isGameActive) {
        gameController.stopGame()
      }

      // 2. Clear all habitat data and guinea pigs manually
      // This ensures the UI updates before the reload
      habitatConditions.habitatItems = []
      habitatConditions.itemPositions.clear()
      habitatConditions.poops = []
      habitatConditions.guineaPigPositions.clear()
      habitatConditions.bowlContents.clear()
      habitatConditions.hayRackContents.clear()

      // Clear all guinea pigs
      guineaPigStore.activeGuineaPigs.forEach(gp => {
        guineaPigStore.deleteGuineaPig(gp.id)
      })

      // 3. Clear localStorage and sessionStorage
      localStorage.clear()
      sessionStorage.clear()

      // 4. Small delay to ensure state updates propagate to UI
      setTimeout(() => {
        // 5. Reload the page to reinitialize everything with fresh state
        window.location.reload()
      }, 100)
    } catch (error) {
      console.error('Error clearing storage:', error)
      // Fallback: just clear and reload immediately
      localStorage.clear()
      sessionStorage.clear()
      window.location.reload()
    }
  }
}
</script>

<style>
/* Mobile-first: Default mobile layout - stacked vertically */
.utility-nav {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--space-2);
  justify-content: flex-end;
}

/* Tablet and up: Horizontal layout */
@media (min-width: 769px) {
  .utility-nav {
    flex-direction: row;
    align-items: center;
  }
}

/* Utility nav buttons - global styles for reuse */
.utility-nav__button {
  padding: var(--space-1) var(--space-3);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: background-color 0.2s ease, opacity 0.2s ease;
}

.utility-nav__button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.utility-nav__button--primary {
  background-color: var(--color-primary);
  color: var(--color-text-on-primary);
}

.utility-nav__button--primary:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
}

.utility-nav__button--danger {
  background-color: var(--color-danger);
  color: var(--color-text-on-danger, white);
}

.utility-nav__button--danger:hover:not(:disabled) {
  background-color: var(--color-danger-hover);
}
</style>
