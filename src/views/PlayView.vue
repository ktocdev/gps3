<template>
  <GameView v-if="hasActiveSession" :is-fullscreen="false" />

  <template v-else>
    <!-- No bonded pair yet: pick one in the pet store... -->
    <PetStorePicker />
    <!-- ...behind the intro splash, which plays once per page load. -->
    <IntroLoadingScreen v-if="showIntro" @done="markIntroSeen" />
  </template>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import GameView from '../components/game/GameView.vue'
import PetStorePicker from '../components/chrome/PetStorePicker.vue'
import IntroLoadingScreen from '../components/chrome/IntroLoadingScreen.vue'
import { useIntroFlow } from '../composables/useIntroFlow'
import { usePetStoreManager } from '../stores/petStoreManager'
import { useGuineaPigStore } from '../stores/guineaPigStore'

const petStoreManager = usePetStoreManager()
const guineaPigStore = useGuineaPigStore()
const { introSeen, markIntroSeen } = useIntroFlow()

const hasActiveSession = computed(
  () => !!petStoreManager.activeGameSession && guineaPigStore.activeGuineaPigs.length > 0
)

// Intro only matters in the no-session branch; play it until dismissed.
const showIntro = computed(() => !introSeen.value)
</script>
