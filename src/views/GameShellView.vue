<template>
  <div class="game-shell">
    <GameHeader />
    <main class="game-shell__main">
      <RouterView />
    </main>

    <!-- First-run guided tour. Lives on the shell (not GameView) so it
         survives the supplies-store step navigating away from Live Mode. -->
    <TutorialTour v-if="tutorialStore.isActive" @close="finishTutorial" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import GameHeader from '../components/chrome/GameHeader.vue'
import TutorialTour from '../components/chrome/TutorialTour.vue'
import { useTutorialStore } from '../stores/tutorialStore'
import { useGameController } from '../stores/gameController'
import { usePetStoreManager } from '../stores/petStoreManager'
import { useGuineaPigStore } from '../stores/guineaPigStore'

const route = useRoute()
const router = useRouter()
const tutorialStore = useTutorialStore()
const gameController = useGameController()
const petStoreManager = usePetStoreManager()
const guineaPigStore = useGuineaPigStore()

// The tour's spotlight targets only exist in Live Mode with an active session.
const inLiveMode = computed(
  () =>
    route.path === '/' &&
    !!petStoreManager.activeGameSession &&
    guineaPigStore.activeGuineaPigs.length > 0
)

// One auto-start per visit to Live Mode — otherwise 'always_show' would
// relaunch the tour the instant it closes.
const autoStartDone = ref(false)

watch(inLiveMode, (live) => {
  if (!live) autoStartDone.value = false
})

watch(
  [inLiveMode, () => tutorialStore.replayRequested],
  () => maybeStartTutorial(),
  { immediate: true }
)

function maybeStartTutorial() {
  if (!inLiveMode.value || tutorialStore.isActive) return
  const replay = tutorialStore.replayRequested
  const { mode, completed } = gameController.settings.tutorial
  const autoStart = mode === 'always_show' || (mode === 'auto' && !completed)
  if (!replay && (!autoStart || autoStartDone.value)) return
  autoStartDone.value = true
  // Defer slightly so the top bar, cage and FABs have mounted and can be
  // measured under the spotlight.
  window.setTimeout(() => {
    if (!inLiveMode.value || tutorialStore.isActive) return
    // The welcome step promises paused time; entering Live Mode already
    // pauses, but a replay can be triggered while the game is running.
    if (gameController.isGameActive) {
      gameController.pauseGame('silent')
    }
    tutorialStore.start()
  }, 450)
}

function finishTutorial() {
  tutorialStore.stop()
  gameController.setTutorialCompleted(true)
  // The supplies-store step navigates away; land the player back in Live Mode.
  if (route.path !== '/') {
    router.push('/')
  }
}
</script>

<style>
.game-shell {
  display: flex;
  flex-direction: column;
  block-size: 100vh;
  block-size: 100dvh;
  overflow: hidden;
}

.game-shell__main {
  flex: 1;
  min-block-size: 0;
  position: relative;
  display: flex;
  flex-direction: column;
}

/* Inside the shell, the game fills the available area (the debug embed
   keeps GameView's default 70vh canvas height) */
.game-shell__main .game-view {
  flex: 1;
  min-block-size: 0;
  display: flex;
  flex-direction: column;
}

.game-shell__main .game-view__canvas-wrapper {
  flex: 1;
  min-block-size: 0;
  block-size: auto;
}
</style>
