<template>
  <div class="habitat-debug debug-view__constrained">
    <h2>
      Habitat Conditions
    </h2>

    <!-- No Active Guinea Pigs -->
    <div v-if="!hasActiveGuineaPigs" class="panel panel--compact panel--warning mb-6">
      <div class="panel__content text-center">
        <p class="text-label text-label--muted mb-2">No guinea pigs in game</p>
        <p class="text-label--small">Start a game in the Game Controller view to see habitat data.</p>
      </div>
    </div>

    <!-- Wrong View Mode Message -->
    <div v-else-if="is3DMode" class="panel panel--compact panel--info mb-6">
      <div class="panel__content text-center">
        <p class="text-label text-label--muted mb-2">This game was started in 3D mode</p>
        <p class="text-label--small">Visit the 3D Habitat view to see this game session.</p>
      </div>
    </div>

    <div v-else class="habitat-debug__content">
    <!-- Visual Habitat with Sidebar -->
    <div class="panel panel--full-width">
      <div class="panel__content">
        <div class="habitat-layout-wrapper">
          <div class="habitat-layout-wrapper__tabs">
            <SubTabContainer :tabs="sidebarTabs" v-model="activeSidebar" align="end" :buttons-only="true" />
          </div>
          <div class="habitat-layout">
            <div class="habitat-layout__main">
              <div class="habitat-visual-header">
                <h3>Habitat Layout (medium - {{ habitatVisualRef?.gridWidth || 0 }}x{{ habitatVisualRef?.gridHeight || 0 }})</h3>
                <div class="habitat-visual-header__stats">
                  <span>{{ habitatVisualRef?.placedItemsCount || 0 }} items placed</span>
                  <span>{{ habitatVisualRef?.occupiedCells || 0 }}/{{ habitatVisualRef?.totalCells || 0 }} cells occupied</span>
                  <span v-if="(habitatVisualRef?.poopCount || 0) > 0">💩 {{ habitatVisualRef?.poopCount }} poops</span>
                </div>
              </div>
              <HabitatVisual
                ref="habitatVisualRef"
                :show-grid="true"
                habitat-size="medium"
                @guinea-pig-selected="handleGuineaPigSelected"
                @place-item-at-cell="handlePlaceItemAtCell"
                @cancel-placement="handleCancelPlacement"
              />
            </div>
            <div class="habitat-layout__sidebar">
            <InventorySidebar
              v-if="activeSidebar === 'inventory'"
              ref="inventorySidebarRef"
              :habitat-visual-ref="habitatVisualRef"
            />
            <HabitatCareSidebar
              v-else-if="activeSidebar === 'care'"
              :can-fill-hay-racks="canFillHayRacks"
              :fill-hay-racks-tooltip="fillHayRacksTooltip"
              :habitat-visual-ref="habitatVisualRef"
              @clean-cage="handleCleanCage"
              @quick-clean="handleQuickClean"
              @refill-water="handleRefillWater"
              @fill-all-hay-racks="handleFillAllHayRacks"
            />
            <ActivityFeedSidebar
              v-else-if="activeSidebar === 'activity'"
              :max-messages="100"
              :auto-scroll="true"
              height="100%"
              :compact="false"
              :categories="['player_action', 'guinea_pig_reaction', 'autonomous_behavior', 'environmental', 'achievement']"
            />
            <GuineaPigSidebar
              v-else-if="activeSidebar === 'socialize'"
              :selected-guinea-pig="selectedGuineaPig"
              @pet="handleInteraction('pet')"
              @hold="handleInteraction('hold')"
              @hand-feed="handleHandFeed"
              @gentle-wipe="handleInteraction('gentle-wipe')"
              @clip-nails="handleInteraction('clip-nails')"
              @talk-to="handleInteraction('talk-to')"
              @sing-to="handleInteraction('sing-to')"
              @call-name="handleInteraction('call-name')"
              @peek-a-boo="handleInteraction('peek-a-boo')"
              @wave-hand="handleInteraction('wave-hand')"
              @show-toy="handleInteraction('show-toy')"
            />
            <BondingSidebar v-else-if="activeSidebar === 'bonding'" />
            <ChatBubbleDebug v-else-if="activeSidebar === 'chatbubble'" />
            <AutonomySidebar
              v-else-if="activeSidebar === 'autonomy'"
              :selected-guinea-pig="selectedGuineaPig"
            />
            <MovementSidebar
              v-else-if="activeSidebar === 'movement'"
              :selected-guinea-pig="selectedGuineaPig"
            />
          </div>
        </div>
        </div>
      </div>
    </div>

    <!-- Habitat Conditions & Test Controls Row -->
    <div class="habitat-debug__conditions-row">
      <!-- Needs Panel -->
      <NeedsPanel />

      <!-- System 19: Poop Debug Panel -->
      <div class="panel panel--compact panel--accent">
        <div class="panel__header">
          <h3>💩 Poop System</h3>
        </div>
        <div class="panel__content">
          <PoopDebug />
        </div>
      </div>

      <!-- Decay Speed Panel -->
      <div class="panel panel--compact">
        <div class="panel__header">
          <h3>Decay Speed</h3>
        </div>
        <div class="panel__content">
          <!-- Habitat Decay -->
          <div class="decay-speed-control mb-4">
            <div class="decay-speed-control__header">
              <label for="habitat-decay-speed">Habitat</label>
              <span class="decay-speed-control__value">{{ habitat.decaySpeedMultiplier }}x</span>
            </div>
            <SliderField
              id="habitat-decay-speed"
              :modelValue="habitat.decaySpeedMultiplier"
              :min="1"
              :max="60"
              :step="1"
              prefix=""
              suffix="x"
              @update:modelValue="(v: number) => habitat.setDecaySpeed(v)"
            />
            <div class="decay-speed-presets">
              <Button
                @click="habitat.setDecaySpeed(6)"
                variant="tertiary"
                size="sm"
                :class="{ 'button--active': habitat.decaySpeedMultiplier === 6 }"
              >
                Relaxed (6x)
              </Button>
              <Button
                @click="habitat.setDecaySpeed(12)"
                variant="tertiary"
                size="sm"
                :class="{ 'button--active': habitat.decaySpeedMultiplier === 12 }"
              >
                Normal (12x)
              </Button>
              <Button
                @click="habitat.setDecaySpeed(24)"
                variant="tertiary"
                size="sm"
                :class="{ 'button--active': habitat.decaySpeedMultiplier === 24 }"
              >
                Fast (24x)
              </Button>
            </div>
          </div>

          <!-- Needs Decay -->
          <div class="decay-speed-control">
            <div class="decay-speed-control__header">
              <label for="needs-decay-speed">Needs</label>
              <span class="decay-speed-control__value">{{ guineaPigStore.settings.needsDecayRate.toFixed(1) }}x</span>
            </div>
            <SliderField
              id="needs-decay-speed"
              :modelValue="guineaPigStore.settings.needsDecayRate"
              :min="0"
              :max="2"
              :step="0.05"
              prefix=""
              suffix="x"
              @update:modelValue="(v: number) => guineaPigStore.setNeedsDecayRate(v)"
            />
            <div class="decay-speed-presets">
              <Button
                @click="guineaPigStore.setNeedsDecayRate(0)"
                variant="tertiary"
                size="sm"
                :class="{ 'button--active': guineaPigStore.settings.needsDecayRate === 0 }"
              >
                Paused (0x)
              </Button>
              <Button
                @click="guineaPigStore.setNeedsDecayRate(0.1)"
                variant="tertiary"
                size="sm"
                :class="{ 'button--active': guineaPigStore.settings.needsDecayRate === 0.1 }"
              >
                Very Slow (0.1x)
              </Button>
              <Button
                @click="guineaPigStore.setNeedsDecayRate(0.5)"
                variant="tertiary"
                size="sm"
                :class="{ 'button--active': guineaPigStore.settings.needsDecayRate === 0.5 }"
              >
                Slow (0.5x)
              </Button>
              <Button
                @click="guineaPigStore.setNeedsDecayRate(1)"
                variant="tertiary"
                size="sm"
                :class="{ 'button--active': guineaPigStore.settings.needsDecayRate === 1 }"
              >
                Normal (1x)
              </Button>
              <Button
                @click="guineaPigStore.setNeedsDecayRate(2)"
                variant="tertiary"
                size="sm"
                :class="{ 'button--active': guineaPigStore.settings.needsDecayRate === 2 }"
              >
                Fast (2x)
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    </div>

    <!-- Clean Cage Dialog -->
    <CleanCageDialog
      v-model="showCleanCageDialog"
      :dirtiness="habitat.dirtiness"
      :bedding-needed="habitat.calculateBeddingNeeded()"
      :bedding-available="habitat.getTotalBeddingAvailable()"
      @confirm="(beddingType) => confirmCleanCage(beddingType)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useHabitatConditions } from '../../../stores/habitatConditions'
import { useGuineaPigStore } from '../../../stores/guineaPigStore'
import { useInventoryStore } from '../../../stores/inventoryStore'
import { useSuppliesStore } from '../../../stores/suppliesStore'
// import { useUiPreferencesStore } from '../../../stores/uiPreferencesStore'
import { useLoggingStore } from '../../../stores/loggingStore'
import { useBehaviorStateStore } from '../../../stores/behaviorStateStore'
import { useNeedsController } from '../../../stores/needsController'
import { useGameViewStore } from '../../../stores/gameViewStore'
import { getInteractionEffect, getInteractionName, getInteractionEmoji } from '../../../utils/interactionEffects'
import Button from '../../basic/Button.vue'
import SliderField from '../../basic/SliderField.vue'
import SubTabContainer from '../../layout/SubTabContainer.vue'
import HabitatVisual from '../../game/habitat/HabitatVisual.vue'
import InventorySidebar from '../../game/habitat/sidebars/InventorySidebar.vue'
import HabitatCareSidebar from '../../game/habitat/sidebars/HabitatCareSidebar.vue'
import ActivityFeedSidebar from '../../game/habitat/sidebars/ActivityFeedSidebar.vue'
import GuineaPigSidebar from '../../game/habitat/sidebars/GuineaPigSidebar.vue'
import BondingSidebar from '../../game/habitat/sidebars/BondingSidebar.vue'
import AutonomySidebar from '../../game/habitat/sidebars/AutonomySidebar.vue'
import MovementSidebar from '../../game/habitat/sidebars/MovementSidebar.vue'
import ChatBubbleDebug from './ChatBubbleDebug.vue'
import NeedsPanel from './NeedsPanel.vue'
import PoopDebug from './PoopDebug.vue'
import CleanCageDialog from '../../game/dialogs/CleanCageDialog.vue'

const habitat = useHabitatConditions()
const guineaPigStore = useGuineaPigStore()
const inventoryStore = useInventoryStore()
const suppliesStore = useSuppliesStore()
// const uiPreferencesStore = useUiPreferencesStore()
const loggingStore = useLoggingStore()
const behaviorStateStore = useBehaviorStateStore()
const needsController = useNeedsController()
const gameViewStore = useGameViewStore()

// Ref to HabitatVisual component
const habitatVisualRef = ref<InstanceType<typeof HabitatVisual> | null>(null)
// Ref to InventorySidebar component
const inventorySidebarRef = ref<any>(null)

// Active sidebar state
const activeSidebar = ref<'inventory' | 'care' | 'activity' | 'socialize' | 'bonding' | 'chatbubble' | 'autonomy' | 'movement'>('care')

// Sidebar tabs for SubTabContainer
const sidebarTabs = [
  { id: 'care', label: 'Habitat Conditions', icon: '🏠' },
  { id: 'inventory', label: 'Inventory', icon: '🎒' },
  { id: 'socialize', label: 'Guinea Pigs', icon: '🐹' },
  { id: 'bonding', label: 'Bonding', icon: '💕' },
  { id: 'movement', label: 'Movement', icon: '🎯' },
  { id: 'activity', label: 'Activity Feed', icon: '📜' },
  { id: 'autonomy', label: 'Autonomy', icon: '🎮' },
  { id: 'chatbubble', label: 'Chat Bubble', icon: '💬' }
]

// Clean cage dialog state
const showCleanCageDialog = ref(false)

// Initialize supplies catalog on mount
onMounted(() => {
  if (!suppliesStore.catalogLoaded) {
    suppliesStore.initializeCatalog()
  }

  // System 16 Phase 1 Test - Log item type metadata
  console.log('=== System 16: Phase 1 - Item Type Metadata Test ===')
  console.log('Water bottles:', suppliesStore.getItemsByType('water_bottle').map(i => i.name))
  console.log('Food bowls:', suppliesStore.getItemsByType('food_bowl').map(i => i.name))
  console.log('Hay racks:', suppliesStore.getItemsByType('hay_rack').map(i => i.name))
  console.log('Beds:', suppliesStore.getItemsByType('bed').map(i => i.name))
  console.log('Shelters:', suppliesStore.getItemsByType('shelter').map(i => i.name))
  console.log('Hideaways:', suppliesStore.getItemsByType('hideaway').map(i => i.name))
  console.log('Tunnels:', suppliesStore.getItemsByType('tunnel').map(i => i.name))

  // Test getItemsForNeed (using actual implemented needs)
  console.log('\n=== Items by Need (Critical) ===')
  console.log('Thirst:', suppliesStore.getItemsForNeed('thirst').map(i => i.name))
  console.log('Hunger:', suppliesStore.getItemsForNeed('hunger').map(i => i.name))
  console.log('Energy:', suppliesStore.getItemsForNeed('energy').map(i => i.name))
  console.log('Shelter:', suppliesStore.getItemsForNeed('shelter').map(i => i.name))

  console.log('\n=== Items by Need (Environmental) ===')
  console.log('Play:', suppliesStore.getItemsForNeed('play').map(i => i.name))
  console.log('Social:', suppliesStore.getItemsForNeed('social').map(i => i.name))
  console.log('Comfort:', suppliesStore.getItemsForNeed('comfort').map(i => i.name))

  // Test individual item lookup
  const basicBottle = 'habitat_basic_water_bottle'
  console.log(`\n${basicBottle} type:`, suppliesStore.getItemType(basicBottle))
  console.log(`${basicBottle} satisfies thirst:`, suppliesStore.itemSatisfiesNeed(basicBottle, 'thirst'))
  console.log('==============================================')
})

// Container management handlers
// function clearAllBowls() {
//   habitat.clearAllBowls()
// }

// function clearAllHayRacks() {
//   habitat.clearAllHayRacks()
// }

function handleFillAllHayRacks() {
  const hayRacks = habitat.habitatItems.filter((itemId: string) => itemId.includes('hay_rack'))
  const result = habitat.fillAllHayRacks(hayRacks)

  if (result.totalAdded > 0) {
    loggingStore.addPlayerAction(
      `Filled ${result.racksFilled} hay rack${result.racksFilled > 1 ? 's' : ''} with ${result.totalAdded} serving${result.totalAdded > 1 ? 's' : ''}`,
      '🌾'
    )
    showCareReaction('hayRackFill')
  } else {
    console.warn('No hay was added to racks')
  }
}

const canFillHayRacks = computed(() => {
  const hayRacks = habitat.habitatItems.filter((itemId: string) => itemId.includes('hay_rack'))
  if (hayRacks.length === 0) return false

  // Check if any rack has empty slots
  const hasEmptySlots = hayRacks.some((rackId: string) => {
    const contents = habitat.getHayRackContents(rackId)
    return contents.length < 10 // HAY_RACK_MAX_CAPACITY
  })

  if (!hasEmptySlots) return false

  // Check if hay is available in inventory
  const hayItems = inventoryStore.items.filter(invItem => {
    const item = suppliesStore.getItemById(invItem.itemId)
    return item?.category === 'hay' && inventoryStore.getTotalServings(invItem.itemId) > 0
  })

  return hayItems.length > 0
})

const fillHayRacksTooltip = computed(() => {
  const hayRacks = habitat.habitatItems.filter((itemId: string) => itemId.includes('hay_rack'))

  if (hayRacks.length === 0) {
    return 'No hay racks in habitat'
  }

  const hasEmptySlots = hayRacks.some((rackId: string) => {
    const contents = habitat.getHayRackContents(rackId)
    return contents.length < 10
  })

  if (!hasEmptySlots) {
    return 'All hay racks are full'
  }

  const hayItems = inventoryStore.items.filter(invItem => {
    const item = suppliesStore.getItemById(invItem.itemId)
    return item?.category === 'hay' && inventoryStore.getTotalServings(invItem.itemId) > 0
  })

  if (hayItems.length === 0) {
    return 'No hay in inventory'
  }

  return 'Fill all hay racks with available hay'
})

const hasActiveGuineaPigs = computed(() => {
  return guineaPigStore.activeGuineaPigs.length > 0
})

const is3DMode = computed(() => gameViewStore.mode === '3d')

// Selected guinea pig for interactions (based on user click in habitat)
const selectedGuineaPig = computed(() => {
  if (!guineaPigStore.selectedGuineaPigId) return null
  return guineaPigStore.getGuineaPig(guineaPigStore.selectedGuineaPigId)
})

// Auto-select first guinea pig when switching to Guinea Pigs, Autonomy, or Movement sidebar
watch(activeSidebar, (newSidebar) => {
  if (newSidebar === 'socialize' || newSidebar === 'autonomy' || newSidebar === 'movement') {
    // If no guinea pig is selected and there are active guinea pigs, select the first one
    if (!guineaPigStore.selectedGuineaPigId && guineaPigStore.activeGuineaPigs.length > 0) {
      guineaPigStore.selectGuineaPig(guineaPigStore.activeGuineaPigs[0].id)
    }
  }
})

// Placement mode (select mode)
// const placementModeLabel = computed(() => {
//   const mode = uiPreferencesStore.itemPlacementMode
//   console.log(`[HabitatDebug] Current placement mode: ${mode}`)
//   return mode === 'drag' ? '🖱️ Drag Mode' : '👆 Select Mode'
// })

// function togglePlacementMode() {
//   console.log(`[HabitatDebug] Toggle button clicked! Current mode: ${uiPreferencesStore.itemPlacementMode}`)
//   uiPreferencesStore.togglePlacementMode()
//   console.log(`[HabitatDebug] After toggle, mode is now: ${uiPreferencesStore.itemPlacementMode}`)
// }

function handlePlaceItemAtCell() {
  if (habitatVisualRef.value && inventorySidebarRef.value) {
    habitatVisualRef.value.placementItemAtSelectedCell(inventorySidebarRef.value)
  }
}

function handleCancelPlacement() {
  if (habitatVisualRef.value && inventorySidebarRef.value) {
    habitatVisualRef.value.exitPlacementMode()
    inventorySidebarRef.value.cancelItemSelection()
  }
}

// Handle guinea pig click - switch to socialize sidebar unless on autonomy, bonding, or movement
function handleGuineaPigSelected(_guineaPigId: string) {
  // If on autonomy, bonding, or movement sidebar, stay on current sidebar and just update selection (already handled by store)
  if (activeSidebar.value === 'autonomy' || activeSidebar.value === 'bonding' || activeSidebar.value === 'movement') {
    return
  }

  // Otherwise, switch to socialize (Guinea Pig) sidebar
  activeSidebar.value = 'socialize'
}

async function showCareReaction(careType: 'cageClean' | 'beddingRefresh' | 'waterRefill' | 'hayRackFill' | 'bowlFill') {
  // Show chat bubble for all active guinea pigs
  const activeGuineaPigs = guineaPigStore.activeGuineaPigs
  if (activeGuineaPigs.length === 0) return

  const { guineaPigMessages } = await import('../../../data/guineaPigMessages')
  const messages = guineaPigMessages.care[careType]

  activeGuineaPigs.forEach(guineaPig => {
    const reaction = messages[Math.floor(Math.random() * messages.length)]

    const event = new CustomEvent('show-chat-bubble', {
      detail: {
        guineaPigId: guineaPig.id,
        reaction
      },
      bubbles: true
    })
    document.dispatchEvent(event)
  })
}

function handleRefillWater() {
  habitat.refillWater()
  showCareReaction('waterRefill')
}

function handleCleanCage() {
  // Show confirmation dialog with bedding info
  showCleanCageDialog.value = true
}

function confirmCleanCage(beddingType: string) {
  const result = habitat.cleanCage(beddingType)
  if (result.success) {
    loggingStore.addPlayerAction(result.message, '🧹')
    showCareReaction('cageClean')
  } else {
    console.warn(result.message)
  }
}

function handleQuickClean() {
  const result = habitat.quickClean()
  if (result.success) {
    loggingStore.addPlayerAction(result.message, '🧽')
    if (result.poopsRemoved > 0) {
      showCareReaction('cageClean')
    }
  }
}

// Handle social interactions
async function handleInteraction(interactionType: string) {
  if (!selectedGuineaPig.value) {
    console.warn('No guinea pig selected for interaction')
    return
  }

  const guineaPig = selectedGuineaPig.value
  const effect = getInteractionEffect(interactionType)

  if (!effect) {
    console.warn(`No effect data found for interaction: ${interactionType}`)
    return
  }

  // System 22: Calculate wellness and validate interaction
  const wellness = needsController.calculateWellness(guineaPig.id)
  const { attemptInteraction } = await import('../../../utils/interactionValidation')

  const attempt = attemptInteraction(
    guineaPig,
    wellness,
    'socialize' // Map most interactions to 'socialize'
  )

  // Show reaction chat bubble
  const event = new CustomEvent('show-chat-bubble', {
    detail: {
      guineaPigId: guineaPig.id,
      reaction: attempt.reactionMessage
    },
    bubbles: true
  })
  document.dispatchEvent(event)

  // If interaction failed, don't apply effects
  if (!attempt.success) {
    const interactionName = getInteractionName(interactionType)
    loggingStore.addPlayerAction(
      `${guineaPig.name} rejected the ${interactionName.toLowerCase()} (wellness too low)`,
      '❌'
    )
    console.log(`❌ ${interactionName} rejected: ${guineaPig.name} | Wellness: ${Math.round(wellness)}%`)
    return
  }

  // System 23: Trigger wiggle animation for player interaction
  behaviorStateStore.triggerPlayerInteraction(guineaPig.id, 1500)

  // Apply need impacts
  Object.entries(effect.needsImpact).forEach(([need, value]) => {
    if (value && value > 0) {
      guineaPigStore.satisfyNeed(guineaPig.id, need as any, value)
    }
  })

  // Apply friendship gain
  if (effect.friendshipGain > 0) {
    guineaPigStore.adjustFriendship(guineaPig.id, effect.friendshipGain)
  }

  // Log to activity feed
  const emoji = getInteractionEmoji(interactionType)
  const interactionName = getInteractionName(interactionType)
  loggingStore.addPlayerAction(
    `${emoji} ${interactionName} - ${guineaPig.name} enjoyed the interaction!`,
    emoji
  )

  console.log(`🤝 ${interactionName}: ${guineaPig.name} | Success | Friendship +${effect.friendshipGain} | Wellness: ${Math.round(wellness)}%`)
}

// Handle hand-feed with food selection
async function handleHandFeed(foodId: string) {
  if (!selectedGuineaPig.value) {
    console.warn('No guinea pig selected for hand-feed')
    return
  }

  const guineaPig = selectedGuineaPig.value
  const foodItem = suppliesStore.getItemById(foodId)

  if (!foodItem) {
    console.warn(`Food item ${foodId} not found`)
    return
  }

  // Get hand-feed interaction effect
  const effect = getInteractionEffect('hand-feed')
  if (!effect) {
    console.warn('No effect data found for hand-feed interaction')
    return
  }

  // System 22: Calculate wellness and validate interaction
  const wellness = needsController.calculateWellness(guineaPig.id)
  const { attemptInteraction } = await import('../../../utils/interactionValidation')

  // Determine preference level based on guinea pig's actual preferences
  let preferenceLevel: 'favorite' | 'neutral' | 'disliked' = 'neutral'
  if (guineaPig.preferences.favoriteFood.includes(foodId)) {
    preferenceLevel = 'favorite'
  } else if (guineaPig.preferences.dislikedFood.includes(foodId)) {
    preferenceLevel = 'disliked'
  }

  const attempt = attemptInteraction(
    guineaPig,
    wellness,
    'feed',
    preferenceLevel
  )

  // Show reaction chat bubble
  const event = new CustomEvent('show-chat-bubble', {
    detail: {
      guineaPigId: guineaPig.id,
      reaction: attempt.reactionMessage
    },
    bubbles: true
  })
  document.dispatchEvent(event)

  // If interaction failed, don't apply effects
  if (!attempt.success) {
    loggingStore.addPlayerAction(
      `${guineaPig.name} rejected the ${foodItem.name} (wellness too low)`,
      '❌'
    )
    console.log(`❌ Hand-feed rejected: ${guineaPig.name} | Wellness: ${Math.round(wellness)}%`)
    return
  }

  // System 23: Trigger wiggle animation for player interaction
  behaviorStateStore.triggerPlayerInteraction(guineaPig.id, 1500)

  // Apply need impacts (hunger from food + social from hand-feeding)
  Object.entries(effect.needsImpact).forEach(([need, value]) => {
    if (value && value > 0) {
      guineaPigStore.satisfyNeed(guineaPig.id, need as any, value)
    }
  })

  // Apply friendship gain
  if (effect.friendshipGain > 0) {
    guineaPigStore.adjustFriendship(guineaPig.id, effect.friendshipGain)
  }

  // Log to activity feed with food name
  loggingStore.addPlayerAction(
    `🥕 Hand Fed ${foodItem.name} - ${guineaPig.name} enjoyed it!`,
    '🥕'
  )

  console.log(`🥕 Hand Fed ${foodItem.name}: ${guineaPig.name} | Success | Friendship +${effect.friendshipGain} | Wellness: ${Math.round(wellness)}%`)
}

</script>

<style>
.habitat-debug__content {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  container-type: inline-size;
  container-name: habitat-debug;
}

.habitat-debug__content .panel__header {
  margin-block-end: var(--space-2);
  padding-block-end: 0;
}


/* Habitat Layout Wrapper - Contains tabs + layout */
.habitat-layout-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* Tabs positioned at top on desktop, between visual and sidebar on mobile */
.habitat-layout-wrapper__tabs {
  order: 1;
}

/* Habitat Layout with Sidebar */
.habitat-layout {
  display: flex;
  gap: var(--space-4);
  align-items: stretch;
  order: 2;
}

.habitat-layout__main {
  flex: 1;
  min-inline-size: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.habitat-layout__sidebar {
  max-block-size: 670px;
  overflow-y: auto;
  border-radius: var(--radius-xl);
}

.habitat-layout__sidebar::-webkit-scrollbar {
  inline-size: 8px;
}

.habitat-layout__sidebar::-webkit-scrollbar-track {
  background: var(--color-bg-tertiary);
}

.habitat-layout__sidebar::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: var(--radius-sm);
}

.habitat-layout__sidebar::-webkit-scrollbar-thumb:hover {
  background: var(--color-border-medium);
}

/* Firefox scrollbar */
.habitat-layout__sidebar {
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) var(--color-bg-tertiary);
}

.habitat-visual-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.habitat-visual-header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.habitat-visual-header__stats {
  display: flex;
  gap: var(--space-4);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.habitat-debug__mode-toggle {
  padding: var(--space-2) var(--space-3);
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.habitat-debug__mode-toggle:hover {
  background-color: var(--color-primary-600);
  box-shadow: var(--shadow-sm);
  transform: translateY(-1px);
}

.habitat-debug__mode-toggle:active {
  background-color: var(--color-primary-700);
  transform: translateY(0);
}

/* Mobile-first: Default mobile layout - stacked vertically */
.habitat-layout-wrapper {
  display: grid;
  grid-template-areas:
    "visual"
    "tabs"
    "sidebar";
  grid-template-columns: minmax(0, 1fr);
}

.habitat-layout-wrapper__tabs {
  grid-area: tabs;
  overflow-x: auto;
  min-inline-size: 0;
}

.habitat-layout {
  grid-area: visual;
  flex-direction: column;
}

.habitat-layout__sidebar {
  grid-area: sidebar;
  max-block-size: 350px;
}

/* Tablet and up: Horizontal layout */
@media (min-width: 769px) {
  .habitat-layout-wrapper {
    display: block;
  }

  .habitat-layout {
    flex-direction: row;
  }

  .habitat-layout__sidebar {
    max-block-size: none;
  }
}

/* Mobile-first: Habitat conditions row - default 1 column */
.habitat-debug__conditions-row {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: 1fr;
}

/* Tablet and up: 2 columns */
@media (min-width: 768px) {
  .habitat-debug__conditions-row {
    grid-template-columns: 1fr 1fr;
  }
}

/* Desktop and up: 3 columns */
@media (min-width: 1200px) {
  .habitat-debug__conditions-row {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

.decay-speed-control {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.decay-speed-control__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.decay-speed-control__header label {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-base);
}

.decay-speed-control__value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.decay-speed-presets {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-2);
}

.button--active {
  background: var(--color-primary);
  color: var(--color-text-inverse);
}

</style>
