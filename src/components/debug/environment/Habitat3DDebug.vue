<template>
  <div class="habitat-3d-debug debug-view__constrained" :class="{ 'habitat-3d-debug--fullscreen': isFullscreen }">
    <!-- Fullscreen header (only visible in fullscreen mode) -->
    <div v-if="isFullscreen" class="habitat-3d-debug__fullscreen-header">
      <h2 class="habitat-3d-debug__title">3D Habitat</h2>
      <div class="habitat-3d-debug__header-actions">
        <button
          class="utility-nav__button utility-nav__button--primary"
          @click="togglePause()"
        >
          <span class="hide-mobile">{{ gameController.isPaused ? '▶️ Resume' : '⏸️ Pause' }}</span>
          <span class="show-mobile">{{ gameController.isPaused ? '▶️' : '⏸️' }}</span>
        </button>
        <button
          class="utility-nav__button utility-nav__button--primary"
          @click="toggleFullscreen"
        >
          <span class="hide-mobile">Exit</span>
          <span class="show-mobile">✕</span>
        </button>
      </div>
    </div>

    <!-- Normal header (hidden in fullscreen mode) -->
    <div v-if="!isFullscreen" class="habitat-3d-debug__header">
      <h2>3D Habitat View</h2>
      <div v-if="hasActiveSession && !is2DMode" class="habitat-3d-debug__header-actions">
        <button
          class="utility-nav__button utility-nav__button--primary"
          @click="togglePause()"
        >
          {{ gameController.isPaused ? '▶️ Resume' : '⏸️ Pause' }}
        </button>
        <button
          class="utility-nav__button utility-nav__button--primary"
          @click="toggleFullscreen"
        >
          ⛶ Enter Fullscreen
        </button>
      </div>
    </div>

    <!-- No Active Session Message -->
    <div v-if="!hasActiveSession" class="panel panel--compact panel--warning mb-6">
      <div class="panel__content text-center">
        <p class="text-label text-label--muted mb-2">No guinea pigs in game</p>
        <p class="text-label--small">Start a game in the Game Controller view to see the 3D habitat.</p>
      </div>
    </div>

    <!-- Wrong View Mode Message -->
    <div v-else-if="is2DMode" class="panel panel--compact panel--info mb-6">
      <div class="panel__content text-center">
        <p class="text-label text-label--muted mb-2">This game was started in 2D mode</p>
        <p class="text-label--small">Visit the 2D Habitat Debug view to see this game session.</p>
      </div>
    </div>

    <!-- Game View (production game component) -->
    <div v-else class="panel panel--full-width">
      <div class="panel__content">
        <GameView
          :is-fullscreen="isFullscreen"
          @toggle-fullscreen="toggleFullscreen"
          @toggle-pause="handleTogglePause"
        />
      </div>
    </div>

    <!-- Debug Panels (below 3D canvas) -->
    <div v-if="hasActiveSession && !is2DMode && !isFullscreen" class="habitat-3d-debug__panels-row">
      <NeedsPanel />
      <PersonalityPanel />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import GameView from '../../game/GameView.vue'
import NeedsPanel from './NeedsPanel.vue'
import PersonalityPanel from './PersonalityPanel.vue'
import { useGuineaPigStore } from '../../../stores/guineaPigStore'
import { usePetStoreManager } from '../../../stores/petStoreManager'
import { useGameViewStore } from '../../../stores/gameViewStore'
import { useGameController } from '../../../stores/gameController'

// Stores
const guineaPigStore = useGuineaPigStore()
const petStoreManager = usePetStoreManager()
const gameViewStore = useGameViewStore()
const gameController = useGameController()

// State
const isFullscreen = ref(false)

// Computed
const hasActiveSession = computed(() => !!petStoreManager.activeGameSession && guineaPigStore.activeGuineaPigs.length > 0)
const is2DMode = computed(() => gameViewStore.mode === '2d')

/**
 * Toggle fullscreen mode - hides debug header/nav for immersive view
 */
function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value

  if (isFullscreen.value) {
    document.body.classList.add('habitat-fullscreen')
  } else {
    document.body.classList.remove('habitat-fullscreen')
  }
}

/**
 * Handle pause toggle from GameView
 */
function handleTogglePause(silent?: boolean) {
  togglePause(silent)
}

/**
 * Toggle game pause state
 */
function togglePause(silent = false) {
  if (gameController.isPaused) {
    gameController.resumeGame()
  } else {
    gameController.pauseGame(silent ? 'silent' : 'manual')
  }
}

// Cleanup fullscreen mode on unmount
onUnmounted(() => {
  if (isFullscreen.value) {
    document.body.classList.remove('habitat-fullscreen')
  }
})
</script>

<style>
/* Debug wrapper styles - kept separate from GameView */

/* Header row (debug-specific) */
.habitat-3d-debug__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-block-end: var(--spacing-md);
}

.habitat-3d-debug__header h2 {
  margin: 0;
}

.habitat-3d-debug__header-actions {
  display: flex;
  gap: var(--spacing-xs);
  flex-shrink: 0;
}

/* Mobile-first responsive text helpers */
.habitat-3d-debug__header-actions .show-mobile {
  display: inline;
}

.habitat-3d-debug__header-actions .hide-mobile {
  display: none;
}

@media (min-width: 400px) {
  .habitat-3d-debug__header-actions {
    gap: var(--spacing-sm);
  }

  .habitat-3d-debug__header-actions .show-mobile {
    display: none;
  }

  .habitat-3d-debug__header-actions .hide-mobile {
    display: inline;
  }
}

/* Fullscreen mode header */
.habitat-3d-debug__fullscreen-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  block-size: 52px; /* Fixed height to match canvas calc */
  padding-inline: var(--spacing-sm);
  /* Safe area for mobile notches/status bars */
  padding-block-start: env(safe-area-inset-top, 0);
  background-color: var(--color-bg-secondary);
  border-block-end: 1px solid var(--color-border-light);
}

/* Mobile-first: compact buttons */
.habitat-3d-debug__fullscreen-header .utility-nav__button {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-sm);
  white-space: nowrap;
}

@media (min-width: 400px) {
  .habitat-3d-debug__fullscreen-header {
    padding-inline: var(--spacing-md);
  }

  .habitat-3d-debug__fullscreen-header .utility-nav__button {
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: var(--font-size-base);
  }
}

.habitat-3d-debug__title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

@media (min-width: 400px) {
  .habitat-3d-debug__title {
    font-size: var(--font-size-xl);
  }
}

/* Debug panels row (below game view) */
.habitat-3d-debug__panels-row {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-block-start: var(--spacing-md);
}

@media (min-width: 768px) {
  .habitat-3d-debug__panels-row {
    flex-direction: row;
    align-items: flex-start;
  }

  .habitat-3d-debug__panels-row > * {
    flex: 1;
    max-inline-size: 400px;
  }
}

/* Body fullscreen class - prevents page scrolling */
body.habitat-fullscreen {
  overflow: hidden;
  block-size: 100vh; /* Fallback */
  block-size: 100dvh; /* Dynamic viewport height for mobile browsers */
}

/* Fullscreen mode adjustments */
.habitat-3d-debug--fullscreen {
  position: fixed;
  inset: 0;
  z-index: 1000;
  max-inline-size: none;
  background-color: #111;
  /* Prevent scrollbars - content must fit exactly */
  /* Use dvh for mobile browsers that have dynamic address bar */
  block-size: 100dvh;
  overflow: hidden;
}

/* Remove panel styling in fullscreen mode */
.habitat-3d-debug--fullscreen .panel {
  padding: 0;
  border: none;
  border-radius: 0;
  background-color: transparent;
  box-shadow: none;
}

.habitat-3d-debug--fullscreen .panel__content {
  padding: 0;
}

/* Landscape mobile optimizations */
@media (max-height: 500px) and (orientation: landscape) {
  .habitat-3d-debug__fullscreen-header {
    block-size: 40px; /* Smaller header on mobile landscape */
    padding-inline: var(--spacing-sm);
  }

  .habitat-3d-debug__title {
    font-size: var(--font-size-md);
  }

  .habitat-3d-debug__header-actions .utility-nav__button {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--font-size-xs);
  }
}
</style>
