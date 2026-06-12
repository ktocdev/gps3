<template>
  <GameView v-if="hasActiveSession" :is-fullscreen="false" />

  <div v-else class="play-view__empty">
    <ParchmentPanel accent="var(--color-pink)" style="max-inline-size: 420px;">
      <div class="play-view__empty-content">
        <span class="play-view__empty-icon">🐹</span>
        <h2 class="play-view__empty-title">No guinea pigs yet!</h2>
        <p class="play-view__empty-text">
          Adopt your guinea pigs from the debug dashboard to start the simulation.
        </p>
        <RouterLink to="/debug" class="game-header__tab">Open Debug</RouterLink>
      </div>
    </ParchmentPanel>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import GameView from '../components/game/GameView.vue'
import ParchmentPanel from '../components/chrome/ParchmentPanel.vue'
import { usePetStoreManager } from '../stores/petStoreManager'
import { useGuineaPigStore } from '../stores/guineaPigStore'

const petStoreManager = usePetStoreManager()
const guineaPigStore = useGuineaPigStore()

const hasActiveSession = computed(
  () => !!petStoreManager.activeGameSession && guineaPigStore.activeGuineaPigs.length > 0
)
</script>

<style>
.play-view__empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #87ceeb; /* sim sky */
  padding: var(--space-6);
}

.play-view__empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  text-align: center;
  padding: var(--space-4);
}

.play-view__empty-icon {
  font-size: 3rem;
}

.play-view__empty-title {
  font-family: var(--font-family-heading);
  color: var(--color-gold-800);
  margin: 0;
}

.play-view__empty-text {
  color: var(--color-wood-shadow);
  margin: 0;
}
</style>
