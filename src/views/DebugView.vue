<template>
  <div class="debug-view">
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
        <HabitatDebugView v-if="activeTab === 'habitat'" />
        <Habitat3DDebug v-if="activeTab === 'habitat-3d'" />
        <SuppliesStoreDebug v-if="activeTab === 'supplies-store'" />
        <LoggingSystemView v-if="activeTab === 'logging'" />
        <FreeMovement2DDebug v-if="activeTab === 'free-movement-2d'" />
        <HtmlDemoDebug v-if="activeTab === 'html-demo'" />
        <ModelViewerDebug v-if="activeTab === 'model-viewer'" />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
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
import HabitatDebugView from './HabitatDebugView.vue'
import SuppliesStoreDebug from '../components/debug/environment/SuppliesStoreDebug.vue'
import Habitat3DDebug from '../components/debug/environment/Habitat3DDebug.vue'
import LoggingSystemView from './LoggingSystemView.vue'
import FreeMovement2DDebug from '../components/debug/prototypes/FreeMovement2DDebug.vue'
import HtmlDemoDebug from '../components/debug/prototypes/HtmlDemoDebug.vue'
import ModelViewerDebug from '../components/debug/prototypes/ModelViewerDebug.vue'
import { useGameController } from '../stores/gameController'

const gameController = useGameController()

// Apply light/dark debug theme on <html> while this view is mounted
useDebugTheme()

// State - Default to 3D Habitat view
const activeTab = ref('habitat-3d')

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
      },
      {
        id: 'logging',
        label: 'Activity Feed',
        icon: '📝',
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
        label: '2D Habitat',
        icon: '🏠',
        panelClass: 'tab-container__panel--constrained'
      },
      {
        id: 'habitat-3d',
        label: '3D Habitat',
        icon: '🎲',
        panelClass: 'tab-container__panel--constrained'
      },
      {
        id: 'supplies-store',
        label: 'Supplies Store',
        icon: '🛒',
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
        id: 'free-movement-2d',
        label: '2D Free Movement',
        icon: '🎯',
        panelClass: 'tab-container__panel--constrained'
      },
      {
        id: 'html-demo',
        label: 'HTML Demo (Original)',
        icon: '🌐',
        panelClass: 'tab-container__panel--constrained'
      },
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
  margin-inline: auto;
}

/* Fullscreen mode for 3D Habitat - hides header and nav */
body.habitat-fullscreen .debug-view__header,
body.habitat-fullscreen .debug-view__nav {
  display: none;
}

body.habitat-fullscreen .dbg-main {
  padding: 0;
}

body.habitat-fullscreen .dbg-panels {
  max-inline-size: none;
}
</style>