<template>
  <div class="debug-view">
    <div class="debug-view__header">
      <div>
        <h1 class="debug-view__title">GPS2 Debug Dashboard</h1>
        <p class="debug-view__subtitle">Development and testing interface</p>
      </div>
      <UtilityNav />
    </div>

    <!-- Category dropdowns -->
    <div class="debug-view__nav">
      <CategoryDropdown
        v-for="category in tabCategories"
        :key="category.id"
        :category-label="category.label"
        :tabs="category.tabs"
        v-model="activeTab"
      />
    </div>

    <!-- Content panels -->
    <div class="debug-view__content">
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import CategoryDropdown from '../components/layout/CategoryDropdown.vue'
import UtilityNav from '../components/layout/UtilityNav.vue'
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
/* Debug View Styles */
.debug-view {
  display: flex;
  flex-direction: column;
  inline-size: 100%;
  min-block-size: 100vh;
  background-color: var(--color-bg-primary);
  container-type: inline-size;
  container-name: debug-view;
}

/* Mobile-first: Header with compact mobile layout */
.debug-view__header {
  display: flex;
  gap: var(--space-4);
  padding-block: var(--space-3);
  padding-inline: var(--space-3);
  background: linear-gradient(135deg, var(--color-primary-bg), var(--color-secondary-bg));
  border-block-end: 1px solid var(--color-border-light);
}

.debug-view__title {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
  margin-block-end: var(--space-2);
}

.debug-view__subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
  font-weight: var(--font-weight-normal);
}

/* Category dropdowns navigation - Mobile first: inline with wrap */
.debug-view__nav {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: var(--space-3);
  padding-block: var(--space-4);
  padding-inline: var(--space-4);
  background: var(--color-bg-primary);
  border-block-end: 1px solid var(--color-border-light);
}

/* Content area */
.debug-view__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
  padding-block: var(--space-4);
  padding-inline: var(--space-4);
}

/* Content area: constrained width for better readability */
.debug-view__content > * {
  max-inline-size: 1440px;
  inline-size: 100%;
  margin-inline: auto;
}

/* Container query: Adjust spacing for medium containers */
@container debug-view (min-width: 481px) {
  .debug-view__nav {
    padding-block: var(--space-5);
    padding-inline: var(--space-5);
  }
}

/* Mobile-first: Default mobile header layout - horizontal with space-between */
.debug-view__header {
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
}

/* Tablet and up: Enhanced layout with more spacing */
@media (min-width: 769px) {
  .debug-view__header {
    align-items: center;
    padding-block: var(--space-6);
    padding-inline: var(--space-6);
  }

  .debug-view__title {
    font-size: var(--font-size-4xl);
  }

  .debug-view__subtitle {
    font-size: var(--font-size-lg);
  }

  .debug-view__content {
    padding-block: var(--space-6);
    padding-inline: var(--space-6);
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .debug-view__header {
    background: linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(34, 197, 94, 0.1));
  }
}

/* Fullscreen mode for 3D Habitat - hides header and nav */
body.habitat-fullscreen .debug-view__header,
body.habitat-fullscreen .debug-view__nav {
  display: none;
}

body.habitat-fullscreen .debug-view__content {
  padding: 0;
}

body.habitat-fullscreen .debug-view__content > * {
  max-inline-size: none;
}
</style>