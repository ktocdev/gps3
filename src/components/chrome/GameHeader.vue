<template>
  <header class="game-header wood-bar">
    <div class="wood-bar__grain" aria-hidden="true"></div>

    <div class="game-header__brand">
      <span class="game-header__brand-icon">🐹</span>
      <h1 class="game-header__title">Guinea Pig Simulator</h1>
    </div>

    <nav v-if="!preAdoption" class="game-header__nav">
      <RouterLink
        v-for="tab in tabs"
        :key="tab.path"
        :to="tab.path"
        class="game-header__tab"
        :class="{ 'game-header__tab--active': isActive(tab.path) }"
        :data-tutorial="tab.path === '/store' ? 'supplies-tab' : undefined"
      >{{ tab.label }}</RouterLink>
    </nav>
    <span v-else></span>

    <div class="game-header__util">
      <template v-if="!preAdoption">
        <span class="game-header__coins">
          <span class="game-header__coins-icon">🪙</span>{{ playerProgression.formattedCurrency }}
        </span>
        <button
          class="game-header__help"
          type="button"
          :aria-pressed="themeStore.chromeTheme === 'low-stim'"
          aria-label="Toggle low-stimulation mode"
          :title="themeStore.chromeTheme === 'low-stim' ? 'Low-stimulation mode on' : 'Low-stimulation mode off'"
          @click="toggleLowStim"
        >🌿</button>
        <button
          class="game-header__help"
          type="button"
          aria-label="Open help"
          title="Help"
          @click="showHelp = !showHelp"
        >?</button>
        <button
          class="game-header__pause"
          :class="{ 'game-header__pause--paused': gameController.isPaused }"
          type="button"
          data-tutorial="pause"
          :disabled="!canTogglePause"
          :aria-pressed="gameController.isPaused"
          :title="gameController.isPaused ? 'Resume simulation' : 'Pause simulation'"
          @click="togglePause"
        >
          {{ gameController.isPaused ? '▶ Resume' : '⏸ Pause' }}
        </button>
      </template>
    </div>

    <HelpOverlay v-model="showHelp" />
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import HelpOverlay from './HelpOverlay.vue'
import { useGameController } from '../../stores/gameController'
import { usePetStoreManager } from '../../stores/petStoreManager'
import { usePlayerProgression } from '../../stores/playerProgression'
import { useThemeStore } from '../../stores/themeStore'

const route = useRoute()
const gameController = useGameController()
const petStoreManager = usePetStoreManager()
const playerProgression = usePlayerProgression()
const themeStore = useThemeStore()

function toggleLowStim() {
  themeStore.setChromeTheme(themeStore.chromeTheme === 'low-stim' ? 'default' : 'low-stim')
}

const tabs = [
  { path: '/', label: 'Live Mode' },
  { path: '/store', label: 'Supplies Store' },
  { path: '/debug', label: 'Debug' }
]

const preAdoption = computed(() => !petStoreManager.activeGameSession)
// Pause/resume is available on every tab — the simulation keeps whatever state
// the player set regardless of which view they're on.
const canTogglePause = computed(() => petStoreManager.activeGameSession !== null)

const showHelp = ref(false)

function isActive(path: string): boolean {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

function togglePause() {
  if (gameController.isPaused) {
    gameController.resumeGame()
  } else {
    gameController.pauseGame('manual')
  }
}
</script>
