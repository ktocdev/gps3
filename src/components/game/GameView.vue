<template>
  <div class="game-view" :class="{ 'game-view--fullscreen': isFullscreen }">
    <div class="game-view__canvas-wrapper">
      <!-- Activity Feed Panel (overlay with integrated tab) -->
      <SidePanel3D
        :is-open="showActivityFeed"
        side="left"
        color="yellow"
        title="Activity Log"
        icon="📓"
        @toggle="toggleActivityFeed"
      >
        <div v-if="activityMessages.length === 0" class="activity-feed__empty">
          💭 No activity yet...
        </div>
        <div v-else class="activity-feed__messages">
          <div
            v-for="msg in activityMessages.slice(0, 50)"
            :key="msg.id"
            class="activity-feed__message"
            :class="`activity-feed__message--${msg.category}`"
          >
            <span class="activity-feed__emoji">{{ msg.emoji || '📝' }}</span>
            <span class="activity-feed__text">{{ msg.message }}</span>
            <span class="activity-feed__time">{{ formatTime(msg.timestamp) }}</span>
          </div>
        </div>
      </SidePanel3D>

      <!-- Inventory Panel (overlay on right side) -->
      <Inventory3DPanel
        :is-open="showInventory"
        @toggle="toggleInventory"
        @select-item="handleInventorySelect"
        @deselect-item="handleInventoryDeselect"
      />

      <!-- Interaction Instruction Overlay -->
      <InstructionOverlay
        v-if="interactionInstruction"
        :message="interactionInstruction.message"
        :theme="interactionInstruction.theme"
      />

      <canvas
        ref="canvasRef"
        :class="{
          'game-view__canvas--placing': placement.isActive(),
          'game-view__canvas--petting': pendingInteraction === 'pet'
        }"
        @click="handleCanvasClick"
        @mousemove="handleCanvasMouseMove"
      ></canvas>

      <!-- 3D Chat Bubbles (overlay positioned relative to canvas) -->
      <ChatBubble3D
        v-for="bubble in chatBubbles.getBubbles()"
        :key="bubble.guineaPigId"
        :message="bubble.message"
        :emoji="bubble.emoji"
        :variant="bubble.variant"
        :position="bubble.screenPosition"
        :is-visible="bubble.isVisible"
      />

      <!-- Guinea Pig Info Menu (replaces floating action buttons) -->
      <GuineaPigInfoMenu
        v-if="selectedGuineaPigId && selectedGuineaPig"
        :guinea-pig="selectedGuineaPig"
        :position="guineaPigMenuPosition"
        :is-controlled="controlledGuineaPigId === selectedGuineaPigId"
        :time-remaining="controlTimeRemaining"
        @close="handleDeselect"
        @take-control="handleTakeControl"
        @release-control="releaseControl"
      />

      <!-- Container Contents Menu (shows what's in bowl/rack) -->
      <ContainerContentsMenu
        :show="containerMenu.showContainerMenu.value"
        :position="containerMenu.menuPosition.value"
        :container-type="containerMenu.selectedContainerType.value || 'bowl'"
        :container-name="containerMenu.currentContainerName.value"
        :foods="containerMenu.currentBowlContents.value"
        :bowl-capacity="containerMenu.currentBowlCapacity.value"
        :hay-servings="containerMenu.currentHayServings.value"
        :hay-capacity="4"
        :freshness="containerMenu.currentHayFreshness.value"
        @close="containerMenu.closeContainerMenu"
        @fill="containerMenu.handleContainerFill"
        @clear="containerMenu.handleContainerClear"
        @remove="containerMenu.handleRemoveContainer"
        @remove-food="containerMenu.handleRemoveFood"
      />

      <!-- Floating Inventory Menu (for adding items to containers) -->
      <InventoryItemMenu
        :show="containerMenu.showInventoryMenu.value"
        :position="containerMenu.menuPosition.value"
        :title="containerMenu.menuTitle.value"
        :items="containerMenu.currentMenuItems.value"
        :empty-message="containerMenu.menuEmptyMessage.value"
        @close="containerMenu.closeInventoryMenu"
        @select="containerMenu.handleAddItemToContainer"
      />

      <!-- Chew Item Popover (shows durability, discard when unsafe) -->
      <ChewPopover3D
        :show="chewPopover.showChewPopover.value"
        :position="chewPopover.menuPosition.value"
        :chew-data="chewPopover.currentChewData.value"
        @close="chewPopover.closeChewPopover"
        @discard="handleDiscardChew"
      />

      <!-- General Item Popover (for removing hideaways, toys, enrichment) -->
      <ItemPopover3D
        :show="itemPopover.showItemPopover.value"
        :position="itemPopover.menuPosition.value"
        :item-data="itemPopover.currentItemData.value"
        @close="itemPopover.closeItemPopover"
        @remove="handleRemoveItem"
      />

      <!-- Water Bottle Menu -->
      <WaterBottleMenu
        v-if="waterBottle.showWaterBottleMenu.value"
        :water-level="waterBottle.currentBottleWaterLevel.value"
        :position="waterBottle.waterBottleMenuPosition.value"
        :bottle-name="waterBottle.currentBottleName.value"
        @close="waterBottle.closeMenu"
        @refill="waterBottle.handleRefill"
        @remove="waterBottle.handleRemoveWaterBottle"
      />

      <!-- Clean Cage Dialog -->
      <CleanCageDialog
        v-model="habitatCare.showCleanCageDialog.value"
        :dirtiness="habitatCare.habitatDirtiness.value"
        :bedding-needed="habitatCare.beddingNeeded.value"
        :bedding-available="habitatCare.beddingAvailable.value"
        @confirm="habitatCare.handleCleanCageConfirm"
      />

      <!-- Hay Management Dialog -->
      <HayManagementDialog v-model="habitatCare.showHayManagementDialog.value" />

      <!-- Action Result Dialog (water refill, quick clean, etc.) -->
      <ActionResultDialog
        v-model="habitatCare.showActionResultDialog.value"
        :icon="habitatCare.actionResultIcon.value"
        :title="habitatCare.actionResultTitle.value"
        :message="habitatCare.actionResultMessage.value"
        :stats="habitatCare.actionResultStats.value"
      />

      <!-- Food Selection Dialog for Hand Feed -->
      <FoodSelectionDialog
        v-model="showFoodSelectionDialog"
        guinea-pig-name="your guinea pig"
        @select-food="handleFoodSelected"
      />

      <!-- Right FABs - Actions -->
      <div class="game-fab-container">
        <!-- GP-to-GP Social FAB with popover menu -->
        <div class="game-fab-row">
          <button
            ref="socialFabRef"
            class="game-fab game-fab--red-orange"
            :class="{ 'game-fab--active': showSocialMenu || pendingSocialAction }"
            @click="handleSocialFabClick"
            title="Social Interactions"
          >
            👯
          </button>
        </div>

        <!-- Social popover menu -->
        <FabSubnavMenu
          :show="showSocialMenu"
          :anchor-x="socialMenuPosition.x"
          :anchor-y="socialMenuPosition.y"
          :actions="socialActions"
          theme="orange"
          @select="handleSocialAction"
          @close="showSocialMenu = false"
        />

        <!-- Interact FAB with popover menu -->
        <div class="game-fab-row">
          <button
            ref="interactFabRef"
            class="game-fab game-fab--violet"
            :class="{ 'game-fab--active': showInteractMenu || pendingInteraction }"
            @click="handleInteractFabClick"
            title="Interact"
          >
            💛
          </button>
        </div>

        <!-- Interact popover menu -->
        <FabSubnavMenu
          :show="showInteractMenu"
          :anchor-x="interactMenuPosition.x"
          :anchor-y="interactMenuPosition.y"
          :actions="interactActions"
          theme="violet"
          @select="handleInteractAction"
          @close="showInteractMenu = false"
        />

        <!-- Habitat Care FAB -->
        <div class="game-fab-row">
          <button
            ref="habitatCareFabRef"
            class="game-fab game-fab--cyan"
            :class="{ 'game-fab--active': showHabitatCareMenu }"
            @click="handleHabitatCareFabClick"
            title="Habitat Care"
          >
            🏠
          </button>
        </div>

        <!-- Habitat Care popover menu -->
        <FabSubnavMenu
          :show="showHabitatCareMenu"
          :anchor-x="habitatCareMenuPosition.x"
          :anchor-y="habitatCareMenuPosition.y"
          :actions="habitatCareActions"
          theme="cyan"
          @select="handleHabitatCareAction"
          @close="showHabitatCareMenu = false"
        />
      </div>

      <!-- Left FAB - Help -->
      <div class="game-fab-container game-fab-container--left">
        <div class="game-fab-row">
          <button
            class="game-fab game-fab--cyan"
            :class="{ 'game-fab--active': showHelp }"
            @click="showHelp = !showHelp"
            title="Help & Controls"
          >
            💡
          </button>
        </div>
      </div>

      <!-- Help Dialog -->
      <HelpDialog v-model="showHelp" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { use3DScene } from '../../composables/use3DScene'
import { use3DCamera } from '../../composables/use3DCamera'
import { use3DSync } from '../../composables/use3DSync'
import { updateGuineaPigAnimation } from '../../composables/use3DGuineaPig'
import { use3DItems } from '../../composables/use3DItems'
import { use3DPoop } from '../../composables/use3DPoop'
import { use3DBehavior } from '../../composables/3d/use3DBehavior'
import { use3DMovement } from '../../composables/3d/use3DMovement'
import {
  updateWaterBottleLevel,
  startWaterBottleBubbles,
  stopWaterBottleBubbles,
  updateWaterBottleBubbles
} from '../../composables/3d-models/containers/water-bottles'
import GuineaPigInfoMenu from './GuineaPigInfoMenu.vue'
import WaterBottleMenu from './WaterBottleMenu.vue'
import InventoryItemMenu from '../basic/InventoryItemMenu.vue'
import ContainerContentsMenu from '../basic/ContainerContentsMenu.vue'
import CleanCageDialog from './dialogs/CleanCageDialog.vue'
import HayManagementDialog from './dialogs/HayManagementDialog.vue'
import ActionResultDialog from './dialogs/ActionResultDialog.vue'
import HelpDialog from './dialogs/HelpDialog.vue'
import FoodSelectionDialog from './dialogs/FoodSelectionDialog.vue'
import Inventory3DPanel from './Inventory3DPanel.vue'
import SidePanel3D from './SidePanel3D.vue'
import FabSubnavMenu, { type FabSubnavAction } from './FabSubnavMenu.vue'
import InstructionOverlay from './InstructionOverlay.vue'
import { useGuineaPigStore } from '../../stores/guineaPigStore'
import { useHabitatConditions } from '../../stores/habitatConditions'
import { useMovement3DStore } from '../../stores/movement3DStore'
import { useInventoryStore } from '../../stores/inventoryStore'
import { useSuppliesStore } from '../../stores/suppliesStore'
import { useGameController } from '../../stores/gameController'
import { useLoggingStore } from '../../stores/loggingStore'
import { GRID_CONFIG, ENVIRONMENT_CONFIG, ANIMATION_CONFIG, CLOUD_CONFIG } from '../../constants/3d'
import { disposeObject3D } from '../../utils/three-cleanup'
import { getBaseItemId } from '../../utils/placementId'
import { use3DInteractions } from '../../composables/3d/use3DInteractions'
import { use3DContainerMenu } from '../../composables/3d/use3DContainerMenu'
import { use3DPlacement } from '../../composables/3d/use3DPlacement'
import { use3DHabitatCare } from '../../composables/3d/use3DHabitatCare'
import { use3DWaterBottle } from '../../composables/3d/use3DWaterBottle'
import { use3DChatBubbles } from '../../composables/3d/use3DChatBubbles'
import { use3DChewPopover } from '../../composables/3d/use3DChewPopover'
import { use3DItemPopover } from '../../composables/3d/use3DItemPopover'
import { useHabitatContainers } from '../../composables/useHabitatContainers'
import { useSocialBehaviors } from '../../composables/game/useSocialBehaviors'
import { use3DSocialActions } from '../../composables/3d/use3DSocialActions'
import ChatBubble3D from './ChatBubble3D.vue'
import ChewPopover3D from './ChewPopover3D.vue'
import ItemPopover3D from './ItemPopover3D.vue'
import * as THREE from 'three'

// Props
const props = defineProps<{
  isFullscreen: boolean
}>()

// Emits
const emit = defineEmits<{
  'toggle-fullscreen': []
  'toggle-pause': [silent?: boolean]
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const interactFabRef = ref<HTMLButtonElement | null>(null)
const socialFabRef = ref<HTMLButtonElement | null>(null)
const habitatCareFabRef = ref<HTMLButtonElement | null>(null)
const selectedGuineaPigId = ref<string | null>(null)
const guineaPigMenuPosition = ref({ x: 0, y: 0 })

// Activity Feed panel state
const showActivityFeed = ref(false)

// Inventory panel state
const showInventory = ref(false)

// Help panel state
const showHelp = ref(false)

// Interact popover state
const showInteractMenu = ref(false)
const interactMenuPosition = ref({ x: 0, y: 0 })
const pendingInteraction = ref<string | null>(null)

// Social (GP-to-GP) popover state
const showSocialMenu = ref(false)
const socialMenuPosition = ref({ x: 0, y: 0 })
const pendingSocialAction = ref<string | null>(null)

// Habitat care popover state
const showHabitatCareMenu = ref(false)
const habitatCareMenuPosition = ref({ x: 0, y: 0 })

// Hand feed state
const showFoodSelectionDialog = ref(false)
const selectedFoodForFeeding = ref<string | null>(null)

// Interaction animations composable
const interactions = use3DInteractions()

// Container menu composable
const containerMenu = use3DContainerMenu()

// Placement mode composable
const placement = use3DPlacement()

// Habitat care composable
const habitatCare = use3DHabitatCare()

// Water bottle composable
const waterBottle = use3DWaterBottle()

// Chat bubbles composable
const chatBubbles = use3DChatBubbles()

// Chew popover composable
const chewPopover = use3DChewPopover()

// Item popover composable (for general habitat items)
const itemPopover = use3DItemPopover()

// Habitat containers for chew data
const habitatContainers = useHabitatContainers()

// Social behaviors for GP-to-GP interactions
const socialBehaviors = useSocialBehaviors()
const socialActions3D = use3DSocialActions()

// Interact actions for FAB subnav
const interactActions: FabSubnavAction[] = [
  { id: 'pet', icon: '🫳', label: 'Pet' },
  { id: 'hand-feed', icon: '🥕', label: 'Hand Feed' },
  { id: 'talk-to', icon: '💬', label: 'Talk To' },
  { id: 'show-toy', icon: '🧸', label: 'Show Toy' },
  { id: 'hold', icon: '🫴', label: 'Hold' },
  { id: 'gentle-wipe', icon: '🧼', label: 'Gentle Wipe' },
  { id: 'trim-nails', icon: '✂️', label: 'Trim Nails' },
]

// Social (GP-to-GP) actions for FAB subnav
const socialActions: FabSubnavAction[] = [
  { id: 'approach', icon: '🚶', label: 'Approach Companion' },
  { id: 'play-together', icon: '🎾', label: 'Play Together' },
  { id: 'groom', icon: '✨', label: 'Groom Partner' },
  { id: 'share-food', icon: '🥬', label: 'Share Food' },
  { id: 'greet', icon: '👋', label: 'Greet' },
]

// Social action instruction messages
const socialActionMessages: Record<string, string> = {
  'approach': 'Select a guinea pig to initiate socialization!',
  'play-together': 'Select a guinea pig to start playing!',
  'groom': 'Select a guinea pig to groom their companion!',
  'share-food': 'Select a guinea pig to share food!',
  'greet': 'Select a guinea pig to greet their companion!'
}

// Habitat care actions for FAB subnav
const habitatCareActions: FabSubnavAction[] = [
  { id: 'fill-hay', icon: '🌾', label: 'Fill Hay Racks' },
  { id: 'refill-water', icon: '💧', label: 'Refill Water' },
  { id: 'quick-clean', icon: '🧹', label: 'Quick Clean' },
  { id: 'deep-clean', icon: '🧽', label: 'Deep Clean' },
]

// Computed instruction message based on current interaction mode
const interactionInstruction = computed(() => {
  // U2G interactions
  if (pendingInteraction.value === 'pet') {
    return { message: 'Click the guinea pig you want to pet!', theme: 'pink' as const }
  }
  if (pendingInteraction.value === 'hand-feed' && selectedFoodForFeeding.value) {
    const foodItem = suppliesStore.getItemById(selectedFoodForFeeding.value)
    const foodName = foodItem?.name || 'food'
    return { message: `Click the guinea pig you want to feed! (${foodName})`, theme: 'pink' as const }
  }
  // G2G social interactions
  if (pendingSocialAction.value) {
    const message = socialActionMessages[pendingSocialAction.value] || 'Select a guinea pig!'
    return { message, theme: 'orange' as const }
  }
  // Placement mode
  const currentPlacement = placement.getPlacementMode()
  if (currentPlacement) {
    return { message: `Click to place ${currentPlacement.itemName}`, theme: 'green' as const }
  }
  return null
})

// Hover state for interaction targeting
const hoveredGuineaPigId = ref<string | null>(null)

// Take Control mode state
const controlledGuineaPigId = ref<string | null>(null)
const CONTROL_AUTO_RELEASE_MS = 30000 // 30 seconds
let controlReleaseTimer: number | null = null
let controlCountdownInterval: number | null = null
const controlTimeRemaining = ref(0) // seconds remaining

// Stores
const guineaPigStore = useGuineaPigStore()
const habitatConditions = useHabitatConditions()
const loggingStore = useLoggingStore()
const movement3DStore = useMovement3DStore()
const inventoryStore = useInventoryStore()
const suppliesStore = useSuppliesStore()
const gameController = useGameController()

// Computed
const selectedGuineaPig = computed(() => {
  if (!selectedGuineaPigId.value) return null
  return guineaPigStore.activeGuineaPigs.find(gp => gp.id === selectedGuineaPigId.value)
})

// Activity Feed computed properties (reversed so newest messages appear first)
const activityMessages = computed(() => [...loggingStore.activityMessages].reverse())

// Unified 3D behavior composables registry (for autonomous behavior)
const behaviors = new Map<string, ReturnType<typeof use3DBehavior>>()
const playingState = new Map<string, { isPlaying: boolean; isHeadbutting: boolean; toyItemId: string | null }>()
const chewingState = new Map<string, { isChewing: boolean; chewItemId: string | null }>()

/**
 * Initialize guinea pigs in movement3DStore and start hunger behaviors
 */
function initializeGuineaPigBehaviors() {
  watch(
    () => guineaPigStore.activeGuineaPigs,
    (activeGuineaPigs, oldGuineaPigs) => {
      // Sync obstacles from habitat items
      movement3DStore.syncObstaclesFromHabitat()

      // Initialize new guinea pigs
      for (const gp of activeGuineaPigs) {
        if (!movement3DStore.getGuineaPigState(gp.id)) {
          // Initialize position at random location within bounds
          const startPos = {
            x: (Math.random() - 0.5) * 20,
            y: 0,
            z: (Math.random() - 0.5) * 14
          }

          const validPos = movement3DStore.clampToBounds(startPos)
          movement3DStore.initializeGuineaPig(gp.id, validPos)

          // Create and start unified behavior
          const behavior = use3DBehavior(gp.id)
          behaviors.set(gp.id, behavior)

          // Hook up bubble animation to drinking events
          behavior.onDrinkingStart(() => {
            const waterBottleModel = waterBottle.findWaterBottleModel()
            if (waterBottleModel) {
              startWaterBottleBubbles(waterBottleModel)
            }
          })
          behavior.onDrinkingEnd(() => {
            const waterBottleModel = waterBottle.findWaterBottleModel()
            if (waterBottleModel) {
              stopWaterBottleBubbles(waterBottleModel)
            }
          })

          // Shelter event logging
          behavior.onShelteringStart(() => {
            console.log(`[GameView] Guinea pig ${gp.id} settled in shelter`)
          })
          behavior.onShelteringEnd(() => {
            console.log(`[GameView] Guinea pig ${gp.id} exited shelter`)
          })

          // Sleep event logging
          behavior.onSleepingStart(() => {
            console.log(`[GameView] Guinea pig ${gp.id} fell asleep`)
          })
          behavior.onSleepingEnd(() => {
            console.log(`[GameView] Guinea pig ${gp.id} woke up`)
          })

          // Groom event logging
          behavior.onGroomingStart(() => {
            console.log(`[GameView] Guinea pig ${gp.id} started grooming`)
          })
          behavior.onGroomingEnd(() => {
            console.log(`[GameView] Guinea pig ${gp.id} finished grooming`)
          })

          // Play event handling
          behavior.onPlayingStart((_toyPosition, toyItemId) => {
            console.log(`[GameView] Guinea pig ${gp.id} started playing with ${toyItemId}`)
            if (physics3D) {
              physics3D.setPhysicsState(toyItemId, 'locked')
            }
            playingState.set(gp.id, { isPlaying: true, isHeadbutting: false, toyItemId })
          })
          behavior.onPlayingEnd(() => {
            console.log(`[GameView] Guinea pig ${gp.id} finished playing`)
            const state = playingState.get(gp.id)
            if (state?.toyItemId && physics3D) {
              physics3D.setPhysicsState(state.toyItemId, 'free')
            }
            playingState.delete(gp.id)
          })
          behavior.onHeadbutt((toyItemId: string) => {
            console.log(`[GameView] Guinea pig ${gp.id} headbutting toy ${toyItemId}`)
            playingState.set(gp.id, { isPlaying: true, isHeadbutting: true, toyItemId: null })
            if (physics3D) {
              physics3D.setPhysicsState(toyItemId, 'free')
              const gpState = movement3DStore.getGuineaPigState(gp.id)
              if (gpState) {
                const rotation = gpState.rotation ?? 0
                const pushDirection = {
                  x: Math.sin(rotation) * 0.6,
                  y: 0.1,
                  z: Math.cos(rotation) * 0.6
                }
                physics3D.pushItem(toyItemId, pushDirection, 1.0)
              }
            }
            setTimeout(() => {
              const state = playingState.get(gp.id)
              if (state) {
                playingState.set(gp.id, { ...state, isHeadbutting: false })
              }
            }, 400)
          })

          // Chew event handling
          behavior.onChewingStart((_chewItemPosition, chewItemId) => {
            if (physics3D) {
              physics3D.setPhysicsState(chewItemId, 'locked')
            }
            chewingState.set(gp.id, { isChewing: true, chewItemId })
          })
          behavior.onChewingEnd(() => {
            const state = chewingState.get(gp.id)
            if (state?.chewItemId && physics3D) {
              physics3D.setPhysicsState(state.chewItemId, 'free')
            }
            chewingState.delete(gp.id)
          })

          // Popcorn event handling
          behavior.onPopcornStart(() => {
            const gpModel = guineaPigModels?.get(gp.id)
            if (gpModel?.userData.animation) {
              gpModel.userData.animation.popcornPhase = 0
            }
          })

          behavior.start()
          console.log(`[GameView] Initialized guinea pig ${gp.id} with unified behavior`)
        }
      }

      // Cleanup removed guinea pigs
      const oldIds = (oldGuineaPigs || []).map(gp => gp.id)
      const newIds = activeGuineaPigs.map(gp => gp.id)

      for (const oldId of oldIds) {
        if (!newIds.includes(oldId)) {
          const behavior = behaviors.get(oldId)
          if (behavior) {
            behavior.stop()
            behaviors.delete(oldId)
          }
          movement3DStore.removeGuineaPig(oldId)
          console.log(`[GameView] Removed guinea pig ${oldId}`)
        }
      }
    },
    { immediate: true }
  )
}

// Initialize 3D scene
const { scene, camera, worldGroup, initRenderer, handleResize, cleanup: cleanupScene, getRenderer } = use3DScene(canvasRef)

// Camera controls cleanup function
let cleanupCamera: (() => void) | null = null
let updateCameraPosition: (() => void) | null = null
let animationId: number | null = null
let lastAnimationTime: number = 0

// Guinea pig models registry
let guineaPigModels: Map<string, THREE.Group> | null = null
let cleanupSync: (() => void) | null = null

// Items and poop cleanup
let cleanupItems: (() => void) | null = null
let cleanupPoop: (() => void) | null = null
let handlePoopClick: ((clickedObject: THREE.Object3D) => string | null) | null = null

// Selection ring
let selectionRing: THREE.Mesh | null = null
const SELECTION_RING_COLOR_DEFAULT = 0x00ff00
const SELECTION_RING_COLOR_CONTROLLED = 0x0088ff

// Hover ring
let hoverRing: THREE.Mesh | null = null
const HOVER_RING_COLOR_DEFAULT = 0x22c55e
const HOVER_RING_COLOR_PET_MODE = 0xff69b4

// Control mode movement controller
let controlMovement: ReturnType<typeof use3DMovement> | null = null

// Environment objects
let environmentObjects: THREE.Object3D[] = []
let beddingTexture: THREE.CanvasTexture | null = null

// Cloud objects
let cloudObjects: THREE.Group[] = []

// Item models registry
let itemModels: Map<string, THREE.Group> | null = null

// Physics composable
let physics3D: ReturnType<typeof import('../../composables/3d/use3DPhysics').use3DPhysics> | null = null

onMounted(() => {
  if (!canvasRef.value) return

  const renderer = initRenderer()
  if (!renderer) return

  // Setup camera controls
  const cameraControls = use3DCamera(camera, worldGroup, canvasRef.value, {
    disableArrowKeys: () => !!controlledGuineaPigId.value
  })
  updateCameraPosition = cameraControls.updateCameraPosition
  cleanupCamera = cameraControls.cleanup

  // Setup position sync with 3D movement mode
  const syncResult = use3DSync(worldGroup, { use3DMovement: true })
  guineaPigModels = syncResult.guineaPigModels
  cleanupSync = syncResult.cleanup

  // Initialize guinea pigs and start hunger behaviors
  initializeGuineaPigBehaviors()

  // Setup habitat items (includes physics for ball/stick)
  const itemsResult = use3DItems(worldGroup)
  itemModels = itemsResult.itemModels
  physics3D = itemsResult.physics3D
  cleanupItems = itemsResult.cleanup

  // Setup poop pellets
  const poopResult = use3DPoop(worldGroup)
  cleanupPoop = poopResult.cleanup
  handlePoopClick = poopResult.handlePoopClick

  // Add basic environment
  addEnvironment()

  // Create clouds in the sky
  createClouds()

  // Initialize interaction system
  interactions.init(scene, guineaPigModels, () => {
    pendingInteraction.value = null
  })

  // Initialize placement system
  placement.init(worldGroup)

  // Initialize water bottle system
  waterBottle.init(itemModels, habitatCare)

  // Initialize chat bubbles system
  chatBubbles.init(camera, guineaPigModels, canvasRef.value)

  // Create selection ring
  createSelectionRing()

  // Create hover ring
  createHoverRing()

  // Add window resize listener
  window.addEventListener('resize', handleResize)

  // Add keyboard listener
  window.addEventListener('keydown', handleKeyDown)

  // Start animation loop
  animate()
})

onUnmounted(() => {
  if (animationId !== null) {
    cancelAnimationFrame(animationId)
  }

  if (cleanupSync) cleanupSync()
  if (cleanupItems) cleanupItems()
  if (cleanupPoop) cleanupPoop()
  if (cleanupCamera) cleanupCamera()

  if (selectionRing) {
    disposeObject3D(selectionRing)
    selectionRing = null
  }

  environmentObjects.forEach(obj => disposeObject3D(obj))
  environmentObjects = []

  if (beddingTexture) {
    beddingTexture.dispose()
    beddingTexture = null
  }

  cloudObjects.forEach(cloud => {
    worldGroup.remove(cloud)
    disposeObject3D(cloud)
  })
  cloudObjects = []

  interactions.dispose()

  behaviors.forEach(behavior => behavior.stop())
  behaviors.clear()

  if (controlMovement) {
    controlMovement.cleanup()
    controlMovement = null
  }
  if (controlReleaseTimer !== null) {
    clearTimeout(controlReleaseTimer)
    controlReleaseTimer = null
  }
  if (controlCountdownInterval !== null) {
    clearInterval(controlCountdownInterval)
    controlCountdownInterval = null
  }
  controlledGuineaPigId.value = null
  controlTimeRemaining.value = 0

  placement.dispose()
  waterBottle.dispose()
  chatBubbles.dispose()

  movement3DStore.clearAllGuineaPigs()
  cleanupScene()

  window.removeEventListener('resize', handleResize)
  window.removeEventListener('keydown', handleKeyDown)
})

// Animation loop
function animate(currentTime: number = 0) {
  animationId = requestAnimationFrame(animate)

  const deltaTime = lastAnimationTime ? (currentTime - lastAnimationTime) / 1000 : 0.016
  lastAnimationTime = currentTime

  if (updateCameraPosition) updateCameraPosition()

  // Update guinea pig animations
  if (guineaPigModels) {
    guineaPigModels.forEach((model, guineaPigId) => {
      const state = movement3DStore.getGuineaPigState(guineaPigId)
      const isMoving = state?.isMoving ?? false

      const behavior = behaviors.get(guineaPigId)
      const isSleeping = behavior?.currentActivity.value === 'sleeping'
      const isGrooming = behavior?.currentActivity.value === 'grooming'
      const isPlaying = behavior?.currentActivity.value === 'playing'
      const gpPlayState = playingState.get(guineaPigId)
      const isHeadbutting = gpPlayState?.isHeadbutting ?? false
      const isChewing = behavior?.currentActivity.value === 'chewing'
      const isPopcorning = behavior?.currentActivity.value === 'popcorning'

      updateGuineaPigAnimation(model, isMoving, deltaTime, gameController.isPaused, isSleeping, isGrooming, isPlaying, isHeadbutting, isChewing, isPopcorning)

      // Pin toy to guinea pig's nose while playing
      if (gpPlayState?.isPlaying && gpPlayState.toyItemId && !gpPlayState.isHeadbutting && state && itemModels) {
        const toyMesh = itemModels.get(gpPlayState.toyItemId)
        if (toyMesh) {
          const noseOffset = 1.8
          const heightOffset = 1.2
          const rotation = state.rotation ?? 0

          const playPhase = model.userData.animation?.playPhase || 0
          const shakeMotion = Math.sin(playPhase) * 0.4
          const bobAmount = Math.abs(Math.sin(playPhase)) * 0.08

          const newX = state.worldPosition.x + Math.sin(rotation + shakeMotion * 0.3) * noseOffset
          const newZ = state.worldPosition.z + Math.cos(rotation + shakeMotion * 0.3) * noseOffset

          toyMesh.position.set(newX, heightOffset + bobAmount, newZ)
        }
      }

      // Pin chew item to guinea pig's mouth while chewing
      const gpChewState = chewingState.get(guineaPigId)
      if (gpChewState?.isChewing && gpChewState.chewItemId && state && itemModels) {
        const chewMesh = itemModels.get(gpChewState.chewItemId)
        if (chewMesh) {
          const mouthOffset = 1.6
          const heightOffset = 0.9
          const rotation = state.rotation ?? 0

          const chewPhase = model.userData.animation?.chewPhase || 0
          const shakeAmount = Math.sin(chewPhase) * 0.15
          const bobAmount = Math.abs(Math.sin(chewPhase * 1.5)) * 0.05

          const newX = state.worldPosition.x + Math.sin(rotation) * mouthOffset
          const newZ = state.worldPosition.z + Math.cos(rotation) * mouthOffset

          chewMesh.position.set(newX, heightOffset + bobAmount, newZ)
          chewMesh.rotation.y = rotation + Math.PI / 2 + shakeAmount
        }
      }
    })
  }

  // Update clouds
  if (!gameController.isPaused) {
    updateClouds(deltaTime)
  }

  // Update interaction animations
  interactions.update()

  // Update physics
  if (!gameController.isPaused && physics3D) {
    physics3D.updatePhysics(deltaTime)
  }

  // Update all water bottles with per-bottle water levels
  const allBottles = waterBottle.getAllWaterBottles()
  for (const { placementId, model } of allBottles) {
    const bottleLevel = habitatConditions.getWaterBottleLevel(placementId)
    updateWaterBottleLevel(model, bottleLevel)
    if (!gameController.isPaused) {
      updateWaterBottleBubbles(model, deltaTime)
    }
  }

  updateSelectionRing()
  updateHoverRing()

  // Update chat bubble screen positions
  chatBubbles.updatePositions()

  const renderer = getRenderer()
  if (renderer) {
    renderer.render(scene, camera)
  }
}

// Ring creation helpers
function createRingMesh(color: number, yOffset: number, opacity = 0.7): THREE.Mesh {
  const ringGeometry = new THREE.RingGeometry(
    ANIMATION_CONFIG.SELECTION_RING.INNER_RADIUS,
    ANIMATION_CONFIG.SELECTION_RING.OUTER_RADIUS,
    32
  )
  const ringMaterial = new THREE.MeshBasicMaterial({
    color,
    side: THREE.DoubleSide,
    transparent: true,
    opacity
  })
  const ring = new THREE.Mesh(ringGeometry, ringMaterial)
  ring.rotation.x = -Math.PI / 2
  ring.position.y = yOffset
  ring.visible = false
  worldGroup.add(ring)
  return ring
}

function createSelectionRing() {
  selectionRing = createRingMesh(
    ANIMATION_CONFIG.SELECTION_RING.COLOR,
    ANIMATION_CONFIG.SELECTION_RING.Y_OFFSET,
    ANIMATION_CONFIG.SELECTION_RING.OPACITY
  )
}

function updateSelectionRing() {
  if (!selectionRing || !guineaPigModels) return

  const targetId = selectedGuineaPigId.value || controlledGuineaPigId.value
  if (!targetId) {
    selectionRing.visible = false
    return
  }

  const targetModel = guineaPigModels.get(targetId)
  if (targetModel) {
    selectionRing.position.x = targetModel.position.x
    selectionRing.position.z = targetModel.position.z
    selectionRing.visible = true

    const time = Date.now() * ANIMATION_CONFIG.SELECTION_RING.PULSE_SPEED
    const pulseAmount = ANIMATION_CONFIG.SELECTION_RING.PULSE_AMPLITUDE
    selectionRing.scale.set(1 + Math.sin(time) * pulseAmount, 1, 1 + Math.sin(time) * pulseAmount)
  } else {
    selectionRing.visible = false
  }
}

function createHoverRing() {
  hoverRing = createRingMesh(
    HOVER_RING_COLOR_DEFAULT,
    ANIMATION_CONFIG.SELECTION_RING.Y_OFFSET + 0.01
  )
}

function updateHoverRing() {
  if (!hoverRing || !guineaPigModels) return

  const isAnimating = interactions.isAnimating()
  const shouldShow = hoveredGuineaPigId.value || isAnimating
  const targetId = isAnimating ? interactions.getTargetId() : hoveredGuineaPigId.value

  if (!shouldShow || !targetId) {
    hoverRing.visible = false
    return
  }

  const material = hoverRing.material as THREE.MeshBasicMaterial
  const isPetMode = pendingInteraction.value === 'pet' || pendingInteraction.value === 'hand-feed' || isAnimating
  const targetColor = isPetMode ? HOVER_RING_COLOR_PET_MODE : HOVER_RING_COLOR_DEFAULT
  if (material.color.getHex() !== targetColor) {
    material.color.setHex(targetColor)
  }

  const targetModel = guineaPigModels.get(targetId)
  if (targetModel) {
    hoverRing.position.x = targetModel.position.x
    hoverRing.position.z = targetModel.position.z
    hoverRing.visible = true

    const time = Date.now() * 0.003
    const pulseAmount = 0.12
    hoverRing.scale.set(1 + Math.sin(time) * pulseAmount, 1, 1 + Math.sin(time) * pulseAmount)
  } else {
    hoverRing.visible = false
  }
}

// Canvas click handler
function handleCanvasClick(event: MouseEvent) {
  if (!canvasRef.value || !guineaPigModels) return

  // Placement mode
  if (placement.isActive()) {
    if (placement.isCurrentPlacementValid()) {
      placement.placeItem()
    }
    return
  }

  const canvas = canvasRef.value
  const rect = canvas.getBoundingClientRect()

  const mouse = new THREE.Vector2()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(mouse, camera)

  const intersects = raycaster.intersectObjects(worldGroup.children, true)

  if (intersects.length > 0) {
    // Check for poop click
    if (handlePoopClick) {
      for (const intersection of intersects) {
        const poopId = handlePoopClick(intersection.object)
        if (poopId) {
          habitatConditions.removePoop(poopId)
          console.log('Removed poop:', poopId)
          return
        }
      }
    }

    const clickedObject = intersects[0].object

    // Check for container click
    if (itemModels) {
      let clickedContainerId: string | null = null
      let clickedContainerType: 'bowl' | 'hay_rack' | null = null

      itemModels.forEach((model, itemId) => {
        let current: THREE.Object3D | null = clickedObject
        while (current) {
          if (current === model) {
            const item = suppliesStore.getItemById(getBaseItemId(itemId))
            if (item?.stats?.itemType === 'food_bowl') {
              clickedContainerId = itemId
              clickedContainerType = 'bowl'
            } else if (item?.stats?.itemType === 'hay_rack' || (getBaseItemId(itemId).includes('hay') && getBaseItemId(itemId).includes('rack'))) {
              clickedContainerId = itemId
              clickedContainerType = 'hay_rack'
            }
            break
          }
          current = current.parent
        }
      })

      if (clickedContainerId && clickedContainerType) {
        if (containerFillMode.value) {
          const { itemId, category } = containerFillMode.value
          let success = false

          if (clickedContainerType === 'bowl') {
            success = habitatConditions.addFoodToBowl(clickedContainerId, itemId)
          } else if (clickedContainerType === 'hay_rack' && category === 'hay') {
            success = habitatConditions.addHayToRack(clickedContainerId, itemId)
          }

          if (success) {
            console.log(`Added ${itemId} to ${clickedContainerType} ${clickedContainerId}`)
            const remainingServings = inventoryStore.getTotalServings(itemId)
            if (remainingServings <= 0) {
              exitContainerFillMode()
            }
            return
          }
          exitContainerFillMode()
        }

        containerMenu.openContainerMenu(
          clickedContainerId,
          clickedContainerType,
          { x: event.clientX, y: event.clientY }
        )
        return
      }

      // Check for water bottle click
      let clickedWaterBottleId: string | null = null
      itemModels.forEach((model, itemId) => {
        let current: THREE.Object3D | null = clickedObject
        while (current) {
          if (current === model) {
            const item = suppliesStore.getItemById(getBaseItemId(itemId))
            if (item?.stats?.itemType === 'water_bottle') {
              clickedWaterBottleId = itemId
            }
            break
          }
          current = current.parent
        }
      })

      if (clickedWaterBottleId) {
        waterBottle.openMenu(clickedWaterBottleId, { x: event.clientX, y: event.clientY })
        return
      }

      // Check for chew item click (regular click = popover, shift+click = physics push)
      let clickedChewId: string | null = null
      itemModels.forEach((model, itemId) => {
        if (clickedChewId) return
        let current: THREE.Object3D | null = clickedObject
        while (current) {
          if (current === model) {
            const item = suppliesStore.getItemById(getBaseItemId(itemId))
            if (item?.subCategory === 'chews') {
              clickedChewId = itemId
            }
            break
          }
          current = current.parent
        }
      })

      if (clickedChewId) {
        // Shift+click = physics push
        if (event.shiftKey && physics3D?.hasPhysics(clickedChewId)) {
          physics3D.handleClick(clickedChewId, raycaster.ray.direction)
          return
        }

        // Regular click = show popover
        // Initialize chew tracking if not already initialized
        if (!habitatContainers.getChewData(clickedChewId)) {
          habitatContainers.initializeChewItem(clickedChewId)
        }
        chewPopover.openChewPopover(clickedChewId, { x: event.clientX, y: event.clientY })
        return
      }

      // Check for general removable item click (hideaways, toys, enrichment)
      // Regular click = popover, Shift+click = physics push
      let clickedRemovableId: string | null = null
      itemModels.forEach((model, itemId) => {
        if (clickedRemovableId) return
        let current: THREE.Object3D | null = clickedObject
        while (current) {
          if (current === model) {
            if (itemPopover.canRemoveItem(itemId)) {
              clickedRemovableId = itemId
            }
            break
          }
          current = current.parent
        }
      })

      if (clickedRemovableId) {
        // Shift+click = physics push
        if (event.shiftKey && physics3D?.hasPhysics(clickedRemovableId)) {
          physics3D.handleClick(clickedRemovableId, raycaster.ray.direction)
          return
        }

        // Regular click = show item popover
        itemPopover.openItemPopover(clickedRemovableId, { x: event.clientX, y: event.clientY })
        return
      }

      // Check for physics item click (remaining items like food containers)
      if (physics3D) {
        let clickedPhysicsItem = false
        itemModels.forEach((model, itemId) => {
          if (clickedPhysicsItem) return
          let current: THREE.Object3D | null = clickedObject
          while (current) {
            if (current === model && physics3D!.hasPhysics(itemId)) {
              physics3D!.handleClick(itemId, raycaster.ray.direction)
              clickedPhysicsItem = true
              break
            }
            current = current.parent
          }
        })

        if (clickedPhysicsItem) return
      }
    }

    // Check for guinea pig click
    let clickedModel: THREE.Group | null = null
    let clickedGuineaPigId: string | null = null

    guineaPigModels.forEach((model, id) => {
      if (clickedObject.parent === model || clickedObject.parent?.parent === model) {
        clickedModel = model
        clickedGuineaPigId = id
      }
    })

    if (clickedModel && clickedGuineaPigId) {
      if (pendingInteraction.value) {
        const action = pendingInteraction.value

        if (action === 'pet') {
          if (interactions.startPetting(clickedGuineaPigId)) {
            pendingInteraction.value = null
          }
          return
        }

        if (action === 'hand-feed' && selectedFoodForFeeding.value) {
          if (interactions.startHandFeed(clickedGuineaPigId, selectedFoodForFeeding.value)) {
            pendingInteraction.value = null
            selectedFoodForFeeding.value = null
          }
          return
        }

        // Other interactions
        console.log(`[GameView] Executing ${action} on guinea pig ${clickedGuineaPigId}`)
        const gp = guineaPigStore.allGuineaPigs.find((g: { id: string }) => g.id === clickedGuineaPigId)
        const gpName = gp?.name || 'Guinea pig'

        const actionLabels: Record<string, { label: string; emoji: string }> = {
          'hold': { label: 'Held', emoji: '🫴' },
          'gentle-wipe': { label: 'Wiped', emoji: '🧼' },
          'show-toy': { label: 'Showed toy to', emoji: '🧸' },
          'peek-a-boo': { label: 'Played peek-a-boo with', emoji: '👀' },
          'talk-to': { label: 'Talked to', emoji: '💬' },
        }
        const actionInfo = actionLabels[action] || { label: action, emoji: '❓' }
        loggingStore.addPlayerAction(`${actionInfo.label} ${gpName}`, actionInfo.emoji)

        pendingInteraction.value = null
        return
      }

      // Handle GP-to-GP social actions
      if (pendingSocialAction.value) {
        const action = pendingSocialAction.value
        const initiator = guineaPigStore.allGuineaPigs.find((g: { id: string }) => g.id === clickedGuineaPigId)

        if (!initiator) {
          console.warn('[GameView] Social action failed: initiator not found')
          pendingSocialAction.value = null
          return
        }

        // Find the partner (the other GP)
        const partner = guineaPigStore.allGuineaPigs.find((g: { id: string }) => g.id !== clickedGuineaPigId)

        if (!partner) {
          console.warn('[GameView] Social action failed: no partner GP found')
          loggingStore.addPlayerAction('No companion to interact with!', '❌')
          pendingSocialAction.value = null
          return
        }

        // Get the bond between them
        const bond = guineaPigStore.getBond(initiator.id, partner.id)

        if (!bond) {
          console.warn('[GameView] Social action failed: no bond found between GPs')
          pendingSocialAction.value = null
          return
        }

        console.log(`[GameView] Executing social action: ${action} from ${initiator.name} to ${partner.name}`)

        // Special handling for 'approach' - use 3D animated movement
        if (action === 'approach') {
          // Get behavior controllers for pausing during social action
          const initiatorBehavior = behaviors.get(initiator.id)
          const partnerBehavior = behaviors.get(partner.id)

          socialActions3D.executeApproach(
            initiator.id,
            partner.id,
            initiator.name,
            partner.name,
            initiatorBehavior && partnerBehavior
              ? { initiator: initiatorBehavior, partner: partnerBehavior }
              : undefined
          ).then(success => {
            if (success) {
              // Increase bonding for approaching
              guineaPigStore.increaseBonding(bond.id, 1, 'proximity', `${initiator.name} approaches ${partner.name}`)
            } else {
              loggingStore.addPlayerAction(`${initiator.name} couldn't approach ${partner.name}`, '❌')
            }
          })

          pendingSocialAction.value = null
          return
        }

        // Execute other social behaviors
        const socialActionMap: Record<string, () => Promise<boolean>> = {
          'play-together': () => socialBehaviors.playTogether(initiator, partner, bond),
          'groom': () => socialBehaviors.groomPartner(initiator, partner, bond),
          'share-food': () => socialBehaviors.shareFood(initiator, partner, bond),
          'greet': () => socialBehaviors.greetCompanion(initiator, partner, bond),
        }

        const behaviorFn = socialActionMap[action]
        if (behaviorFn) {
          behaviorFn().then(success => {
            if (success) {
              const actionLabels: Record<string, { label: string; emoji: string }> = {
                'play-together': { label: `${initiator.name} played with`, emoji: '🎾' },
                'groom': { label: `${initiator.name} groomed`, emoji: '✨' },
                'share-food': { label: `${initiator.name} shared food with`, emoji: '🥬' },
                'greet': { label: `${initiator.name} greeted`, emoji: '👋' },
              }
              const info = actionLabels[action] || { label: action, emoji: '👯' }
              loggingStore.addPlayerAction(`${info.label} ${partner.name}`, info.emoji)
            } else {
              loggingStore.addPlayerAction(`${initiator.name} couldn't ${action.replace('-', ' ')}`, '❌')
            }
          })
        }

        pendingSocialAction.value = null
        return
      }

      selectedGuineaPigId.value = clickedGuineaPigId
      guineaPigMenuPosition.value = { x: event.clientX, y: event.clientY }

      if (controlledGuineaPigId.value && selectedGuineaPigId.value !== controlledGuineaPigId.value) {
        releaseControl()
      }
      return
    }

    // Floor click in control mode
    if (controlledGuineaPigId.value && controlMovement) {
      const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
      const worldIntersection = new THREE.Vector3()
      raycaster.ray.intersectPlane(floorPlane, worldIntersection)

      if (worldIntersection) {
        const targetPos = { x: worldIntersection.x, y: 0, z: worldIntersection.z }
        if (movement3DStore.isInBounds(targetPos)) {
          controlMovement.moveTo(targetPos)
          return
        }
      }
    }
  }

  // Deselect
  selectedGuineaPigId.value = null
  containerMenu.closeAllMenus()
  if (waterBottle.isMenuOpen()) {
    waterBottle.closeMenu()
  }
  if (chewPopover.isOpen()) {
    chewPopover.closeChewPopover()
  }
}

// Guinea pig menu handlers
function handleDeselect() {
  selectedGuineaPigId.value = null
}

// Chew popover handler (discard only - chews can't be moved to inventory)
function handleDiscardChew() {
  const chewId = chewPopover.selectedChewId.value
  if (!chewId) return

  // Remove 3D model from scene
  if (itemModels) {
    const model = itemModels.get(chewId)
    if (model && worldGroup) {
      worldGroup.remove(model)
      disposeObject3D(model)
      itemModels.delete(chewId)
    }
  }

  // Remove physics if applicable
  if (physics3D?.hasPhysics(chewId)) {
    physics3D.removePhysicsItem(chewId)
  }

  // Handle the discard (updates stores and logs)
  chewPopover.handleDiscardChew()
}

// Item popover handler (for general habitat items)
function handleRemoveItem() {
  const itemId = itemPopover.selectedItemId.value
  if (!itemId) return

  // Remove 3D model from scene
  if (itemModels) {
    const model = itemModels.get(itemId)
    if (model && worldGroup) {
      worldGroup.remove(model)
      disposeObject3D(model)
      itemModels.delete(itemId)
    }
  }

  // Remove physics if applicable
  if (physics3D?.hasPhysics(itemId)) {
    physics3D.removePhysicsItem(itemId)
  }

  // Handle the removal (updates stores and logs)
  itemPopover.handleRemoveItem()
}

function handleTakeControl() {
  if (!selectedGuineaPigId.value) return

  const gpId = selectedGuineaPigId.value

  if (controlledGuineaPigId.value && controlledGuineaPigId.value !== gpId) {
    releaseControl()
  }

  controlledGuineaPigId.value = gpId

  const behavior = behaviors.get(gpId)
  if (behavior) {
    behavior.pause()
  }

  controlMovement = use3DMovement(gpId)
  updateSelectionRingColor(SELECTION_RING_COLOR_CONTROLLED)

  controlTimeRemaining.value = Math.floor(CONTROL_AUTO_RELEASE_MS / 1000)

  if (controlCountdownInterval !== null) {
    clearInterval(controlCountdownInterval)
  }
  controlCountdownInterval = window.setInterval(() => {
    controlTimeRemaining.value = Math.max(0, controlTimeRemaining.value - 1)
  }, 1000)

  if (controlReleaseTimer !== null) {
    clearTimeout(controlReleaseTimer)
  }
  controlReleaseTimer = window.setTimeout(() => {
    releaseControl()
  }, CONTROL_AUTO_RELEASE_MS)
}

function releaseControl() {
  if (!controlledGuineaPigId.value) return

  const gpId = controlledGuineaPigId.value

  if (controlMovement) {
    controlMovement.cleanup()
    controlMovement = null
  }

  const behavior = behaviors.get(gpId)
  if (behavior) {
    behavior.resume()
  }

  controlledGuineaPigId.value = null
  controlTimeRemaining.value = 0

  if (controlReleaseTimer !== null) {
    clearTimeout(controlReleaseTimer)
    controlReleaseTimer = null
  }

  if (controlCountdownInterval !== null) {
    clearInterval(controlCountdownInterval)
    controlCountdownInterval = null
  }

  updateSelectionRingColor(SELECTION_RING_COLOR_DEFAULT)
}

function updateSelectionRingColor(color: number) {
  if (selectionRing) {
    const material = selectionRing.material as THREE.MeshBasicMaterial
    material.color.setHex(color)
  }
}

const KEYBOARD_MOVE_DISTANCE = 3.0

function handleKeyDown(event: KeyboardEvent) {
  // Space to toggle pause
  if (event.code === 'Space') {
    event.preventDefault()
    emit('toggle-pause', event.shiftKey)
    return
  }

  // Escape handling
  if (event.key === 'Escape') {
    if (showInventory.value) {
      showInventory.value = false
    } else if (placement.isActive()) {
      placement.exitPlacementMode()
    } else if (containerFillMode.value) {
      exitContainerFillMode()
    } else if (controlledGuineaPigId.value) {
      releaseControl()
    } else if (props.isFullscreen) {
      emit('toggle-fullscreen')
    }
    return
  }

  // Arrow keys for control mode
  if (controlledGuineaPigId.value && controlMovement) {
    const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
    if (arrowKeys.includes(event.key)) {
      event.preventDefault()

      const state = movement3DStore.getGuineaPigState(controlledGuineaPigId.value)
      if (!state) return

      let targetX = state.worldPosition.x
      let targetZ = state.worldPosition.z

      switch (event.key) {
        case 'ArrowUp': targetZ -= KEYBOARD_MOVE_DISTANCE; break
        case 'ArrowDown': targetZ += KEYBOARD_MOVE_DISTANCE; break
        case 'ArrowLeft': targetX -= KEYBOARD_MOVE_DISTANCE; break
        case 'ArrowRight': targetX += KEYBOARD_MOVE_DISTANCE; break
      }

      const targetPos = { x: targetX, y: 0, z: targetZ }
      if (movement3DStore.isInBounds(targetPos)) {
        controlMovement.moveTo(targetPos)
      }
    }
  }
}

// Interact FAB handlers
function handleInteractFabClick() {
  if (!interactFabRef.value) return
  const rect = interactFabRef.value.getBoundingClientRect()
  interactMenuPosition.value = { x: rect.left + rect.width / 2, y: rect.top }
  showInteractMenu.value = !showInteractMenu.value
}

function handleInteractAction(actionId: string) {
  if (actionId === 'hand-feed') {
    showFoodSelectionDialog.value = true
    return
  }
  pendingInteraction.value = actionId
}

function handleFoodSelected(foodId: string) {
  selectedFoodForFeeding.value = foodId
  pendingInteraction.value = 'hand-feed'
  showFoodSelectionDialog.value = false
}

// Social FAB handlers
function handleSocialFabClick() {
  if (!socialFabRef.value) return
  const rect = socialFabRef.value.getBoundingClientRect()
  socialMenuPosition.value = { x: rect.left + rect.width / 2, y: rect.top }
  showSocialMenu.value = !showSocialMenu.value
}

function handleSocialAction(actionId: string) {
  console.log('[GameView] Social action selected:', actionId)
  showSocialMenu.value = false
  pendingSocialAction.value = actionId
}

// Habitat Care FAB handlers
function handleHabitatCareFabClick() {
  if (!habitatCareFabRef.value) return
  const rect = habitatCareFabRef.value.getBoundingClientRect()
  habitatCareMenuPosition.value = { x: rect.left + rect.width / 2, y: rect.top }
  showHabitatCareMenu.value = !showHabitatCareMenu.value
}

function handleHabitatCareAction(actionId: string) {
  console.log('[GameView] Habitat care action selected:', actionId)
  showHabitatCareMenu.value = false

  switch (actionId) {
    case 'fill-hay':
      habitatCare.fabFillHay()
      break
    case 'refill-water':
      habitatCare.fabRefillWater()
      break
    case 'quick-clean':
      habitatCare.fabQuickClean()
      break
    case 'deep-clean':
      habitatCare.fabCleanHabitat()
      break
  }
}

// Side panels
function toggleActivityFeed() {
  showActivityFeed.value = !showActivityFeed.value
}

function toggleInventory() {
  showInventory.value = !showInventory.value
}

function handleInventorySelect(itemId: string) {
  const supplyItem = suppliesStore.getItemById(itemId)
  if (!supplyItem) return

  if (supplyItem.category === 'habitat_item') {
    placement.enterPlacementMode(itemId)
  } else if (supplyItem.category === 'food' || supplyItem.category === 'hay') {
    enterContainerFillMode(itemId, supplyItem.category)
  }
}

function handleInventoryDeselect() {
  if (containerFillMode.value) exitContainerFillMode()
  if (placement.isActive()) placement.exitPlacementMode()
}

// Container fill mode
const containerFillMode = ref<{ itemId: string; category: string } | null>(null)

function enterContainerFillMode(itemId: string, category: string) {
  if (placement.isActive()) placement.exitPlacementMode()
  containerFillMode.value = { itemId, category }
}

function exitContainerFillMode() {
  containerFillMode.value = null
}

// Mouse move handler
function handleCanvasMouseMove(event: MouseEvent) {
  if (!canvasRef.value) return

  const canvas = canvasRef.value
  const rect = canvas.getBoundingClientRect()

  const mouse = new THREE.Vector2()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(mouse, camera)

  if (placement.isActive()) {
    const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
    const intersection = new THREE.Vector3()
    raycaster.ray.intersectPlane(floorPlane, intersection)
    if (intersection) {
      placement.updatePreviewPosition(intersection)
    }
    return
  }

  // Guinea pig hover detection
  if (guineaPigModels) {
    const intersects = raycaster.intersectObjects(worldGroup.children, true)

    let foundGpId: string | null = null
    for (const intersect of intersects) {
      let current: THREE.Object3D | null = intersect.object
      while (current && current !== worldGroup) {
        if (current.userData?.guineaPigId) {
          foundGpId = current.userData.guineaPigId
          break
        }
        current = current.parent
      }
      if (foundGpId) break
    }

    hoveredGuineaPigId.value = foundGpId
  }
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
}

// Environment setup
function addEnvironment() {
  beddingTexture = createBeddingTexture()

  const floorWidth = GRID_CONFIG.WIDTH
  const floorDepth = GRID_CONFIG.DEPTH

  const floorGeo = new THREE.PlaneGeometry(floorWidth, floorDepth)
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: beddingTexture,
    roughness: 1.0,
    metalness: 0.0,
  })
  const floor = new THREE.Mesh(floorGeo, floorMat)
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  worldGroup.add(floor)
  environmentObjects.push(floor)

  const wallHeight = ENVIRONMENT_CONFIG.WALL_HEIGHT
  const wallThickness = ENVIRONMENT_CONFIG.WALL_THICKNESS

  const wallGeoH = new THREE.BoxGeometry(floorWidth + wallThickness * 2, wallHeight, wallThickness)
  const wallGeoV = new THREE.BoxGeometry(wallThickness, wallHeight, floorDepth)

  const wall1 = new THREE.Mesh(wallGeoH, floorMat)
  wall1.position.set(0, wallHeight / 2, -floorDepth / 2 - wallThickness / 2)
  wall1.receiveShadow = true
  worldGroup.add(wall1)
  environmentObjects.push(wall1)

  const wall2 = new THREE.Mesh(wallGeoH, floorMat)
  wall2.position.set(0, wallHeight / 2, floorDepth / 2 + wallThickness / 2)
  wall2.receiveShadow = true
  worldGroup.add(wall2)
  environmentObjects.push(wall2)

  const wall3 = new THREE.Mesh(wallGeoV, floorMat)
  wall3.position.set(-floorWidth / 2 - wallThickness / 2, wallHeight / 2, 0)
  wall3.receiveShadow = true
  worldGroup.add(wall3)
  environmentObjects.push(wall3)

  const wall4 = new THREE.Mesh(wallGeoV, floorMat)
  wall4.position.set(floorWidth / 2 + wallThickness / 2, wallHeight / 2, 0)
  wall4.receiveShadow = true
  worldGroup.add(wall4)
  environmentObjects.push(wall4)
}

function createBeddingTexture(): THREE.CanvasTexture {
  const size = ENVIRONMENT_CONFIG.BEDDING_TEXTURE_SIZE
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#fdfbf7'
  ctx.fillRect(0, 0, size, size)

  for (let i = 0; i < ENVIRONMENT_CONFIG.BEDDING_PIECES; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const w = 15 + Math.random() * 25
    const h = 15 + Math.random() * 25
    const rotation = Math.random() * Math.PI
    const val = 230 + Math.floor(Math.random() * 25)

    ctx.fillStyle = `rgb(${val}, ${val}, ${val})`
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rotation)
    ctx.beginPath()
    ctx.moveTo(-w / 2, -h / 2)
    ctx.lineTo(w / 2, -h / 2 + Math.random() * 5)
    ctx.lineTo(w / 2, h / 2)
    ctx.lineTo(-w / 2 + Math.random() * 5, h / 2)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(6, 6)
  return texture
}

function createCloud(): THREE.Group {
  const cloud = new THREE.Group()

  const cloudMaterial = new THREE.MeshBasicMaterial({
    color: CLOUD_CONFIG.COLOR,
    transparent: true,
    opacity: CLOUD_CONFIG.OPACITY,
  })

  const puffCount = CLOUD_CONFIG.PUFF_COUNT_MIN +
    Math.floor(Math.random() * (CLOUD_CONFIG.PUFF_COUNT_MAX - CLOUD_CONFIG.PUFF_COUNT_MIN))

  const puffGeo = new THREE.SphereGeometry(CLOUD_CONFIG.PUFF_RADIUS, 12, 10)

  for (let i = 0; i < puffCount; i++) {
    const puff = new THREE.Mesh(puffGeo, cloudMaterial)

    puff.position.set(
      (Math.random() - 0.5) * CLOUD_CONFIG.CLUSTER_SPREAD_X,
      (Math.random() - 0.5) * CLOUD_CONFIG.CLUSTER_SPREAD_Y,
      (Math.random() - 0.5) * CLOUD_CONFIG.CLUSTER_SPREAD_Z
    )

    const scale = CLOUD_CONFIG.PUFF_SCALE_MIN +
      Math.random() * (CLOUD_CONFIG.PUFF_SCALE_MAX - CLOUD_CONFIG.PUFF_SCALE_MIN)
    puff.scale.set(scale, scale * 0.7, scale)

    cloud.add(puff)
  }

  return cloud
}

function createClouds() {
  const highLayer = CLOUD_CONFIG.HIGH_LAYER
  const lowLayer = CLOUD_CONFIG.LOW_LAYER

  for (let i = 0; i < highLayer.COUNT; i++) {
    const cloud = createCloud()

    const angle = Math.random() * Math.PI * 2
    const distance = highLayer.MIN_DISTANCE +
      Math.random() * (highLayer.MAX_DISTANCE - highLayer.MIN_DISTANCE)
    const height = highLayer.MIN_HEIGHT +
      Math.random() * (highLayer.MAX_HEIGHT - highLayer.MIN_HEIGHT)

    cloud.position.set(Math.cos(angle) * distance, height, Math.sin(angle) * distance)
    cloud.lookAt(0, height, 0)

    cloud.userData.angle = angle
    cloud.userData.distance = distance
    cloud.userData.height = height
    cloud.userData.driftOffset = Math.random() * Math.PI * 2

    worldGroup.add(cloud)
    cloudObjects.push(cloud)
  }

  for (let i = 0; i < lowLayer.COUNT; i++) {
    const cloud = createCloud()

    const angle = Math.random() * Math.PI * 2
    const distance = lowLayer.MIN_DISTANCE +
      Math.random() * (lowLayer.MAX_DISTANCE - lowLayer.MIN_DISTANCE)
    const height = lowLayer.MIN_HEIGHT +
      Math.random() * (lowLayer.MAX_HEIGHT - lowLayer.MIN_HEIGHT)

    cloud.position.set(Math.cos(angle) * distance, height, Math.sin(angle) * distance)
    cloud.scale.setScalar(lowLayer.SCALE)
    cloud.lookAt(0, height, 0)

    cloud.userData.angle = angle
    cloud.userData.distance = distance
    cloud.userData.height = height
    cloud.userData.driftOffset = Math.random() * Math.PI * 2

    worldGroup.add(cloud)
    cloudObjects.push(cloud)
  }
}

function updateClouds(deltaTime: number) {
  cloudObjects.forEach(cloud => {
    cloud.userData.angle += deltaTime * CLOUD_CONFIG.DRIFT_SPEED * 0.02
    const bob = Math.sin(cloud.userData.angle * 2 + cloud.userData.driftOffset) * 0.5

    cloud.position.x = Math.cos(cloud.userData.angle) * cloud.userData.distance
    cloud.position.z = Math.sin(cloud.userData.angle) * cloud.userData.distance
    cloud.position.y = cloud.userData.height + bob
  })
}
</script>
