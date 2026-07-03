<template>
  <div class="debug-view">
    <GameHeader class="debug-view__chrome" />

    <DebugHeader class="debug-view__header" />

    <DebugNav class="debug-view__nav" :categories="tabCategories" v-model="activeTab" />

    <!-- Content panels -->
    <main class="dbg-main">
      <section class="dbg-panels">
        <GameControllerView v-if="activeTab === 'controller'" />
        <PetStoreDebugView v-if="activeTab === 'pet-store'" />
        <StardustSanctuaryDebug v-if="activeTab === 'sanctuary'" />
        <FriendshipDebug v-if="activeTab === 'friendship'" />
        <BondingDebug v-if="activeTab === 'bonding'" />
        <InventoryDebugView v-if="activeTab === 'inventory'" />
        <HabitatToolsDebug v-if="activeTab === 'habitat'" />
        <HabitatStatusDebug v-if="activeTab === 'habitat-status'" />
        <ModelViewerDebug v-if="activeTab === 'model-viewer'" />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import GameHeader from '../components/chrome/GameHeader.vue'
import DebugHeader from '../components/debug/ui/DebugHeader.vue'
import DebugNav from '../components/debug/ui/DebugNav.vue'
import { useDebugTheme } from '../composables/useDebugTheme'
import type { Tab } from '../components/layout/TabContainer.vue'
import GameControllerView from './GameControllerView.vue'
import PetStoreDebugView from './PetStoreDebugView.vue'
import InventoryDebugView from './InventoryDebugView.vue'
import FriendshipDebug from '../components/debug/gameplay/FriendshipDebug.vue'
import BondingDebug from '../components/debug/gameplay/BondingDebug.vue'
import StardustSanctuaryDebug from '../components/debug/core/StardustSanctuaryDebug.vue'
import HabitatToolsDebug from '../components/debug/environment/HabitatToolsDebug.vue'
import HabitatStatusDebug from '../components/debug/environment/HabitatStatusDebug.vue'
import ModelViewerDebug from '../components/debug/prototypes/ModelViewerDebug.vue'
import { useGameController } from '../stores/gameController'

const gameController = useGameController()

// Apply light/dark debug theme on <html> while this view is mounted
useDebugTheme()

// State - Default to Game Controller
const activeTab = ref('controller')

// Category interface
interface TabCategory {
  id: string
  label: string
  tabs: Tab[]
}

// Organized tab categories for dropdown navigation
const tabCategories: TabCategory[] = [
  {
    id: 'core',
    label: 'Core Systems',
    tabs: [
      {
        id: 'controller',
        label: 'Game Controller',
        icon: '🎮',
        panelClass: 'tab-container__panel--constrained'
      },
      {
        id: 'pet-store',
        label: 'Guinea Pigs',
        icon: '🏪',
        panelClass: 'tab-container__panel--constrained'
      }
    ]
  },
  {
    id: 'gameplay',
    label: 'Gameplay Systems',
    tabs: [
      {
        id: 'friendship',
        label: 'Friendship',
        icon: '💖',
        panelClass: 'tab-container__panel--constrained'
      },
      {
        id: 'bonding',
        label: 'Social Bonding',
        icon: '🤝',
        panelClass: 'tab-container__panel--constrained'
      },
      {
        id: 'sanctuary',
        label: 'Stardust Sanctuary',
        icon: '✨',
        panelClass: 'tab-container__panel--constrained'
      }
    ]
  },
  {
    id: 'environment',
    label: 'Environment Systems',
    tabs: [
      {
        id: 'habitat',
        label: 'Needs',
        icon: '🍎',
        panelClass: 'tab-container__panel--constrained'
      },
      {
        id: 'habitat-status',
        label: 'Habitat',
        icon: '🏠',
        panelClass: 'tab-container__panel--constrained'
      },
      {
        id: 'inventory',
        label: 'Inventory',
        icon: '🎒',
        panelClass: 'tab-container__panel--constrained'
      }
    ]
  },
  {
    id: 'prototypes',
    label: 'Prototypes',
    tabs: [
      {
        id: 'model-viewer',
        label: '3D Model Viewer',
        icon: '🎨',
        panelClass: 'tab-container__panel--constrained'
      }
    ]
  }
]

// Page lifecycle management for automatic pause
onMounted(() => {
  // Auto-pause game when entering debug panel
  // User must manually resume if they want the game to run
  gameController.pauseGame('navigation')
})

onUnmounted(() => {
  // Auto-pause when leaving debug panel if game is active
  if (gameController.isGameActive) {
    gameController.pauseGame('navigation')
  }
})
</script>

<style>
/* Debug View Styles — visual skin lives in styles/debug.css */
.debug-view {
  display: flex;
  flex-direction: column;
  inline-size: 100%;
  min-block-size: 100vh;
}

.debug-view .dbg-main {
  flex: 1;
}

/* Constrained content width for readability */
.debug-view .dbg-panels {
  max-inline-size: 1440px;
  inline-size: 100%;
}
</style>