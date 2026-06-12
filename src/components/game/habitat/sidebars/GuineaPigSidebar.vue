<template>
  <div class="habitat-sidebar guinea-pig-sidebar">
    <div class="habitat-sidebar__header guinea-pig-sidebar__header">
      <h3>
        <span v-if="displayGuineaPig" class="guinea-pig-sidebar__header-emoji">{{ getGuineaPigEmoji(displayGuineaPig) }}</span>
        <span v-else>🐹</span>
        Guinea Pigs
      </h3>
      <Button
        v-if="guineaPigStore.activeGuineaPigs.length > 1"
        @click="toggleGuineaPig"
        variant="tertiary"
        size="sm"
      >
        {{ displayGuineaPig?.name }} ({{ currentGuineaPigIndex + 1 }}/{{ guineaPigStore.activeGuineaPigs.length }})
      </Button>
      <span v-else-if="guineaPigStore.activeGuineaPigs.length === 1" class="guinea-pig-sidebar__guinea-pig-name-static">
        {{ guineaPigStore.activeGuineaPigs[0]?.name }}
      </span>
    </div>

    <div class="guinea-pig-sidebar__content">
      <!-- Player Friendship -->
      <div class="interaction-section">
        <h4 class="interaction-section__title">👤 Your Friendship</h4>
        <div class="panel panel--compact">
          <div class="friendship-value">
            <span class="friendship-value__label">Friendship:</span>
            <span class="friendship-value__number">{{ Math.round(displayGuineaPig.friendship) }}%</span>
          </div>
          <SliderField
            :model-value="Math.round(displayGuineaPig.friendship)"
            :min="0"
            :max="100"
            :step="1"
            disabled
            size="sm"
            suffix="%"
            @update:model-value="() => {}"
          />
          <div class="bond-stats">
            <span class="bond-stat">{{ getPlayerFriendshipMessage(displayGuineaPig.friendship) }}</span>
          </div>
        </div>
      </div>

      <!-- System 21: Bond Status -->
      <div v-if="companionBonds.length > 0" class="interaction-section">
        <h4 class="interaction-section__title">🤝 Companion Bonds</h4>
        <div v-for="bondInfo in companionBonds" :key="bondInfo.bond.id" class="panel panel--compact">
          <div class="bond-status__header">
            <span class="bond-partner-name">{{ bondInfo.partnerName }}</span>
            <span class="bond-tier" :class="`bond-tier--${bondInfo.bond.bondingTier}`">
              {{ formatTier(bondInfo.bond.bondingTier) }}
            </span>
          </div>
          <div class="friendship-value">
            <span class="friendship-value__label">Bond Level:</span>
            <span class="friendship-value__number">{{ Math.round(bondInfo.bond.bondingLevel) }}%</span>
          </div>
          <SliderField
            :model-value="Math.round(bondInfo.bond.bondingLevel)"
            :min="0"
            :max="100"
            :step="1"
            disabled
            size="sm"
            suffix="%"
            @update:model-value="() => {}"
          />
          <div class="bond-stats">
            <span class="bond-stat">💕 {{ bondInfo.bond.totalInteractions }} interactions</span>
            <span class="bond-stat">{{ getBondStrengthMessage(bondInfo.bond.bondingLevel) }}</span>
          </div>
        </div>
      </div>

      <!-- Interact with Guinea Pig -->
      <div class="interaction-section">
        <h4 class="interaction-section__title">🫱 Interact with Guinea Pig</h4>
        <div class="interaction-buttons">
          <Button
            @click="handleTriggerAction('pet')"
            variant="tertiary"
            size="sm"
            :disabled="isBasicInteractionDisabled"
          >
            🫳 Pet
          </Button>

          <Button
            @click="handleTriggerAction('hold')"
            variant="tertiary"
            size="sm"
            :disabled="isBasicInteractionDisabled"
          >
            🤲 Hold
          </Button>

          <Button
            @click="handleTriggerAction('hand-feed'); showFoodSelectionDialog = true"
            variant="tertiary"
            size="sm"
            :disabled="isHandFeedDisabled"
            :title="handFeedTooltip"
          >
            🥕 Hand Feed{{ handFeedCooldownText }}
          </Button>

          <Button
            @click="handleTriggerAction('gentle-wipe')"
            variant="tertiary"
            size="sm"
            :disabled="isGentleWipeDisabled"
            :title="gentleWipeTooltip"
          >
            🧼 Gentle Wipe
          </Button>

          <Button
            @click="handleTriggerAction('clip-nails')"
            variant="tertiary"
            size="sm"
            :disabled="isClipNailsDisabled"
            :title="clipNailsTooltip"
          >
            ✂️ Clip Nails
          </Button>

          <Button
            @click="handleTriggerAction('talk-to')"
            variant="tertiary"
            size="sm"
            :disabled="isBasicInteractionDisabled"
          >
            💬 Talk To
          </Button>

          <Button
            @click="handleTriggerAction('sing-to')"
            variant="tertiary"
            size="sm"
            :disabled="isBasicInteractionDisabled"
          >
            🎵 Sing To
          </Button>

          <Button
            @click="handleTriggerAction('call-name')"
            variant="tertiary"
            size="sm"
            :disabled="isBasicInteractionDisabled"
          >
            📣 Call Name
          </Button>

          <Button
            @click="handleTriggerAction('peek-a-boo')"
            variant="tertiary"
            size="sm"
            :disabled="isBasicInteractionDisabled"
          >
            👀 Peek-a-Boo
          </Button>

          <Button
            @click="handleTriggerAction('wave-hand')"
            variant="tertiary"
            size="sm"
            :disabled="isBasicInteractionDisabled"
          >
            👋 Wave Hand
          </Button>

          <Button
            @click="handleTriggerAction('show-toy')"
            variant="tertiary"
            size="sm"
            :disabled="isBasicInteractionDisabled"
          >
            🧸 Show Toy
          </Button>
        </div>

      </div>

      <!-- Food Selection Dialog -->
      <FoodSelectionDialog
        v-model="showFoodSelectionDialog"
        :guinea-pig-name="displayGuineaPig?.name || 'guinea pig'"
        @select-food="handleFoodSelected"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onUnmounted } from 'vue'
import Button from '../../../basic/Button.vue'
import SliderField from '../../../basic/SliderField.vue'
import FoodSelectionDialog from '../../dialogs/FoodSelectionDialog.vue'
import { useGuineaPigStore } from '../../../../stores/guineaPigStore'
import { useGameController } from '../../../../stores/gameController'
import type { GuineaPig } from '../../../../stores/guineaPigStore'
import { getBondStrengthMessage, getPlayerFriendshipMessage } from '../../../../utils/friendshipMessages'

interface Props {
  selectedGuineaPig?: GuineaPig | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'pet': []
  'hold': []
  'hand-feed': [foodId: string]
  'gentle-wipe': []
  'clip-nails': []
  'talk-to': []
  'sing-to': []
  'call-name': []
  'peek-a-boo': []
  'wave-hand': []
  'show-toy': []
}>()

const gameController = useGameController()
const guineaPigStore = useGuineaPigStore()

const showFoodSelectionDialog = ref(false)

// Cooldown tracking for interactions
const interactionCooldowns = ref<Map<string, Map<string, number>>>(new Map())
const HAND_FEED_COOLDOWN = 45000 // 45 seconds in milliseconds

function handleFoodSelected(foodId: string) {
  emit('hand-feed', foodId)

  // Track cooldown for this guinea pig's hand-feed action
  if (props.selectedGuineaPig) {
    const gpId = props.selectedGuineaPig.id
    if (!interactionCooldowns.value.has(gpId)) {
      interactionCooldowns.value.set(gpId, new Map())
    }
    interactionCooldowns.value.get(gpId)!.set('hand-feed', Date.now())
  }
}

// displayGuineaPig: Always show a guinea pig (selectedGuineaPig or first available)
const displayGuineaPig = computed(() => {
  return props.selectedGuineaPig || guineaPigStore.activeGuineaPigs[0]
})

function toggleGuineaPig() {
  const activeGuineaPigs = guineaPigStore.activeGuineaPigs
  if (activeGuineaPigs.length <= 1) return

  const currentIndex = activeGuineaPigs.findIndex(gp => gp.id === (props.selectedGuineaPig?.id || displayGuineaPig.value?.id))
  const nextIndex = (currentIndex + 1) % activeGuineaPigs.length
  const nextGuineaPig = activeGuineaPigs[nextIndex]

  guineaPigStore.selectGuineaPig(nextGuineaPig.id)
}

// handleTriggerAction: Auto-select guinea pig and emit event
function handleTriggerAction(action: string) {
  // Auto-select the display guinea pig if no guinea pig is currently selected
  if (!props.selectedGuineaPig && displayGuineaPig.value) {
    guineaPigStore.selectGuineaPig(displayGuineaPig.value.id)
  }

  // Emit the appropriate event
  emit(action as any)
}

// Reactive timestamp for cooldown updates (updates every second only when cooldown active)
const currentTime = ref(Date.now())
let cooldownInterval: number | null = null

// Calculate remaining cooldown time
const handFeedRemainingCooldown = computed(() => {
  if (!displayGuineaPig.value) return 0

  const gpCooldowns = interactionCooldowns.value.get(displayGuineaPig.value.id)
  if (!gpCooldowns) return 0

  const lastHandFeedTime = gpCooldowns.get('hand-feed')
  if (!lastHandFeedTime) return 0

  const elapsed = currentTime.value - lastHandFeedTime
  const remaining = HAND_FEED_COOLDOWN - elapsed

  return remaining > 0 ? remaining : 0
})

const isHandFeedOnCooldown = computed(() => handFeedRemainingCooldown.value > 0)

const isHandFeedDisabled = computed(() => {
  if (gameController.isPaused) return true
  if (!displayGuineaPig.value) return true
  if (displayGuineaPig.value.needs.hunger >= 95) return true
  return isHandFeedOnCooldown.value
})

const handFeedCooldownText = computed(() => {
  if (!isHandFeedOnCooldown.value) return ''

  const seconds = Math.ceil(handFeedRemainingCooldown.value / 1000)
  return ` (${seconds}s)`
})

const handFeedTooltip = computed(() => {
  if (!displayGuineaPig.value) return 'No guinea pig available'
  if (displayGuineaPig.value.needs.hunger >= 95) {
    return 'Guinea pig is not hungry (hunger above 95%)'
  }
  if (isHandFeedOnCooldown.value) {
    return 'Hand-feed is on cooldown'
  }
  return 'Hand-feed a food item to your guinea pig'
})

// Gentle wipe disabled state
const isGentleWipeDisabled = computed(() => {
  if (gameController.isPaused) return true
  if (!displayGuineaPig.value) return true
  return displayGuineaPig.value.needs.hygiene >= 75
})

const gentleWipeTooltip = computed(() => {
  if (!displayGuineaPig.value) return 'No guinea pig available'
  if (displayGuineaPig.value.needs.hygiene >= 75) {
    return 'Guinea pig is clean (hygiene above 75%)'
  }
  return 'Gently wipe your guinea pig clean'
})

// Clip nails disabled state
const isClipNailsDisabled = computed(() => {
  if (gameController.isPaused) return true
  if (!displayGuineaPig.value) return true
  return displayGuineaPig.value.needs.nails >= 75
})

const clipNailsTooltip = computed(() => {
  if (!displayGuineaPig.value) return 'No guinea pig available'
  if (displayGuineaPig.value.needs.nails >= 75) {
    return 'Nails are still good (wait until below 75%)'
  }
  return 'Clip your guinea pig\'s nails'
})

// All other interactions disabled when paused
const isBasicInteractionDisabled = computed(() => {
  if (gameController.isPaused) return true
  if (!displayGuineaPig.value) return true
  return false
})

// Update timestamp only when cooldown is active (efficient)
function updateCooldownTimer() {
  if (isHandFeedOnCooldown.value) {
    currentTime.value = Date.now()

    // Continue interval while cooldown active
    if (!cooldownInterval) {
      cooldownInterval = window.setInterval(() => {
        currentTime.value = Date.now()

        // Stop interval when cooldown expires
        if (!isHandFeedOnCooldown.value && cooldownInterval) {
          clearInterval(cooldownInterval)
          cooldownInterval = null
        }
      }, 1000)
    }
  }
}

// Watch for cooldown activation (side effect triggers timer)
computed(() => {
  updateCooldownTimer()
  return isHandFeedOnCooldown.value
})

onUnmounted(() => {
  if (cooldownInterval) {
    clearInterval(cooldownInterval)
    cooldownInterval = null
  }
})

// Get current guinea pig index for display
const currentGuineaPigIndex = computed(() => {
  if (!displayGuineaPig.value) return 0
  return guineaPigStore.activeGuineaPigs.findIndex(gp => gp.id === displayGuineaPig.value!.id)
})

// System 21: Get bonds for displayed guinea pig (optimized)
const companionBonds = computed(() => {
  if (!displayGuineaPig.value) return []

  const bonds = guineaPigStore.getBondsForGuineaPig(displayGuineaPig.value.id)
  return bonds.map(bond => {
    const partnerId = bond.guineaPig1Id === displayGuineaPig.value!.id
      ? bond.guineaPig2Id
      : bond.guineaPig1Id
    const partner = guineaPigStore.getGuineaPig(partnerId)
    return {
      bond,
      partnerName: partner?.name || 'Unknown'
    }
  })
})

function formatTier(tier: string): string {
  return tier.charAt(0).toUpperCase() + tier.slice(1)
}

// Get guinea pig emoji based on gender
function getGuineaPigEmoji(guineaPig: typeof displayGuineaPig.value): string {
  if (!guineaPig) return '🐹'
  return guineaPig.gender === 'male' ? '🐹' : '🐭'
}
</script>

<style>
/* Component-specific styles (shared layout from .habitat-sidebar) */
.guinea-pig-sidebar__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-2);
}

.guinea-pig-sidebar__header h3 {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.guinea-pig-sidebar__header-emoji {
  font-size: var(--font-size-xl);
  line-height: 1;
}

.guinea-pig-sidebar__content {
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.guinea-pig-sidebar__guinea-pig-name-static {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-semibold);
}

.interaction-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.interaction-section__title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  margin: 0;
  margin-block-end: var(--space-1);
}

/* System 21: Bond Status Styles - Now uses .panel .panel--compact for container */
.bond-status__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-block-end: var(--space-2);
}

.bond-partner-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.bond-tier {
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.bond-tier--neutral {
  background: var(--color-gray-200);
  color: var(--color-gray-700);
}

.bond-tier--friends {
  background: var(--color-blue-100);
  color: var(--color-blue-700);
}

.bond-tier--bonded {
  background: var(--color-pink-100);
  color: var(--color-pink-700);
}

.bond-stats {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.friendship-value {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-block-end: var(--space-2);
  font-size: var(--font-size-sm);
}

.friendship-value__label {
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}

.friendship-value__number {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-base);
}

.bond-stat {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

/* Status items */
.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-item__label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}

.status-item__value {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-semibold);
}

/* Interaction buttons: Natural width, wrap as needed */
.interaction-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

/* Mobile: Full width layout */
@media (max-width: 768px) {
  .guinea-pig-sidebar {
    inline-size: 100%;
    max-block-size: 300px;
    border-inline-start: none;
    border-block-start: 1px solid var(--color-border);
  }
}
</style>
