<template>
  <div class="autonomy-debug flex flex-column gap-4">
    <div v-if="hasActiveGuineaPigs" class="panel panel--compact panel--accent panel--overflow-visible">
      <div class="panel__header flex justify-between items-center">
        <h3>🎮 Autonomy Controls</h3>
        <div class="flex items-center gap-2">
          <!-- Toggle between guinea pigs if there are multiple -->
          <Button
            v-if="guineaPigStore.activeGuineaPigs.length > 1"
            @click="toggleGuineaPig"
            variant="tertiary"
            size="sm"
          >
            {{ selectedGuineaPig?.name }} ({{ selectedGuineaPigIndex + 1 }}/{{ guineaPigStore.activeGuineaPigs.length }})
          </Button>
          <InfoButton
            message="Manual behavior triggers temporarily set the guinea pig's need to 0 to force the AI to select that behavior. After execution completes, the need is fully restored to 100% for testing convenience."
            position="bottom"
          />
        </div>
      </div>
      <div v-if="selectedGuineaPig" class="panel__content">
        <!-- Manual Triggers & Current Status -->
        <div class="mb-4">
          <div class="button-row mb-3">
            <button
              class="btn btn--md btn--secondary"
              :disabled="!isGameActive"
              @click="triggerBehavior(selectedGuineaPig!.id, 'eat')"
            >
              🍽️ Trigger Eat
            </button>
            <button
              class="btn btn--md btn--secondary"
              :disabled="!isGameActive"
              @click="triggerBehavior(selectedGuineaPig!.id, 'drink')"
            >
              💧 Trigger Drink
            </button>
            <button
              class="btn btn--md btn--secondary"
              :disabled="!isGameActive"
              @click="triggerBehavior(selectedGuineaPig!.id, 'sleep')"
            >
              😴 Trigger Sleep
            </button>
            <button
              class="btn btn--md btn--secondary"
              :disabled="!isGameActive"
              @click="triggerBehavior(selectedGuineaPig!.id, 'seek_shelter')"
            >
              🏠 Seek Shelter
            </button>
            <button
              class="btn btn--md btn--secondary"
              :disabled="!isGameActive"
              @click="triggerBehavior(selectedGuineaPig!.id, 'groom')"
            >
              🧼 Trigger Groom
            </button>
            <button
              class="btn btn--md btn--secondary"
              :disabled="!isGameActive"
              @click="triggerBehavior(selectedGuineaPig!.id, 'chew')"
            >
              🦷 Trigger Chew
            </button>
            <button
              class="btn btn--md btn--secondary"
              :disabled="!isGameActive"
              @click="triggerBehavior(selectedGuineaPig!.id, 'play')"
            >
              🎾 Trigger Play
            </button>
            <button
              class="btn btn--md btn--secondary"
              :disabled="!isGameActive || !hasCompanion(selectedGuineaPig!.id)"
              @click="triggerBehavior(selectedGuineaPig!.id, 'socialize')"
              :title="hasCompanion(selectedGuineaPig!.id) ? 'Trigger social interaction with companion' : 'Requires 2+ guinea pigs'"
            >
              🤝 Socialize
            </button>
            <button
              class="btn btn--md btn--secondary"
              :disabled="!isGameActive"
              @click="triggerBehavior(selectedGuineaPig!.id, 'wander')"
            >
              🚶 Trigger Wander
            </button>
            <button
              class="btn btn--md btn--warning"
              :disabled="!isGameActive || getCurrentGoal(selectedGuineaPig!.id) === 'none'"
              @click="cancelBehavior(selectedGuineaPig!.id)"
            >
              ❌ Cancel
            </button>
          </div>

          <!-- Current Status -->
          <div class="status-info">
            <div class="status-info__item">
              <span class="status-info__label">Activity:</span>
              <span class="status-info__value">{{ getCurrentActivity(selectedGuineaPig!.id) }}</span>
            </div>
            <div class="status-info__item">
              <span class="status-info__label">Goal:</span>
              <span class="status-info__value">{{ getCurrentGoal(selectedGuineaPig!.id) }}</span>
            </div>
            <div class="status-info__item">
              <span class="status-info__label">Position:</span>
              <span class="status-info__value">{{ getPosition(selectedGuineaPig!.id) }}</span>
            </div>
          </div>
        </div>

        <!-- Behavior Threshold Sliders -->
        <Details summary="Behavior Thresholds" variant="compact" :default-open="false">
          <!-- Hunger Threshold -->
          <div class="threshold-control mb-3">
            <label :for="`${selectedGuineaPig!.id}-hunger-threshold`">
              Hunger Behavior Threshold
            </label>
            <div class="threshold-control__info">
              <span class="threshold-control__value">{{ getHungerThreshold(selectedGuineaPig!.id) }}%</span>
              <span class="threshold-control__note">
                (Will seek food when hunger drops below this)
              </span>
            </div>
            <SliderField
              :id="`${selectedGuineaPig!.id}-hunger-threshold`"
              :modelValue="getHungerThreshold(selectedGuineaPig!.id)"
              :min="10"
              :max="80"
              :step="5"
              prefix=""
              suffix="%"
              :show-min-max="true"
              @update:modelValue="(value: number) => setHungerThreshold(selectedGuineaPig!.id, value)"
            />
          </div>

          <!-- Thirst Threshold -->
          <div class="threshold-control mb-3">
            <label :for="`${selectedGuineaPig!.id}-thirst-threshold`">
              Thirst Behavior Threshold
            </label>
            <div class="threshold-control__info">
              <span class="threshold-control__value">{{ getThirstThreshold(selectedGuineaPig!.id) }}%</span>
              <span class="threshold-control__note">
                (Will seek water when thirst drops below this)
              </span>
            </div>
            <SliderField
              :id="`${selectedGuineaPig!.id}-thirst-threshold`"
              :modelValue="getThirstThreshold(selectedGuineaPig!.id)"
              :min="10"
              :max="80"
              :step="5"
              prefix=""
              suffix="%"
              :show-min-max="true"
              @update:modelValue="(value: number) => setThirstThreshold(selectedGuineaPig!.id, value)"
            />
          </div>

          <!-- Energy Threshold -->
          <div class="threshold-control mb-3">
            <label :for="`${selectedGuineaPig!.id}-energy-threshold`">
              Sleep Behavior Threshold
            </label>
            <div class="threshold-control__info">
              <span class="threshold-control__value">{{ getEnergyThreshold(selectedGuineaPig!.id) }}%</span>
              <span class="threshold-control__note">
                (Will sleep when energy drops below this)
              </span>
            </div>
            <SliderField
              :id="`${selectedGuineaPig!.id}-energy-threshold`"
              :modelValue="getEnergyThreshold(selectedGuineaPig!.id)"
              :min="10"
              :max="80"
              :step="5"
              prefix=""
              suffix="%"
              :show-min-max="true"
              @update:modelValue="(value: number) => setEnergyThreshold(selectedGuineaPig!.id, value)"
            />
          </div>

          <!-- Shelter Threshold -->
          <div class="threshold-control mb-3">
            <label :for="`${selectedGuineaPig!.id}-shelter-threshold`">
              Shelter Behavior Threshold
            </label>
            <div class="threshold-control__info">
              <span class="threshold-control__value">{{ getShelterThreshold(selectedGuineaPig!.id) }}%</span>
              <span class="threshold-control__note">
                (Will seek shelter when shelter drops below this)
              </span>
            </div>
            <SliderField
              :id="`${selectedGuineaPig!.id}-shelter-threshold`"
              :modelValue="getShelterThreshold(selectedGuineaPig!.id)"
              :min="10"
              :max="80"
              :step="5"
              prefix=""
              suffix="%"
              :show-min-max="true"
              @update:modelValue="(value: number) => setShelterThreshold(selectedGuineaPig!.id, value)"
            />
          </div>

          <!-- Hygiene Threshold -->
          <div class="threshold-control mb-3">
            <label :for="`${selectedGuineaPig!.id}-hygiene-threshold`">
              Groom Behavior Threshold
            </label>
            <div class="threshold-control__info">
              <span class="threshold-control__value">{{ getHygieneThreshold(selectedGuineaPig!.id) }}%</span>
              <span class="threshold-control__note">
                (Will groom when hygiene drops below this)
              </span>
            </div>
            <SliderField
              :id="`${selectedGuineaPig!.id}-hygiene-threshold`"
              :modelValue="getHygieneThreshold(selectedGuineaPig!.id)"
              :min="10"
              :max="80"
              :step="5"
              prefix=""
              suffix="%"
              :show-min-max="true"
              @update:modelValue="(value: number) => setHygieneThreshold(selectedGuineaPig!.id, value)"
            />
          </div>

          <!-- Chew Threshold -->
          <div class="threshold-control mb-3">
            <label :for="`${selectedGuineaPig!.id}-chew-threshold`">
              Chew Behavior Threshold
            </label>
            <div class="threshold-control__info">
              <span class="threshold-control__value">{{ getChewThreshold(selectedGuineaPig!.id) }}%</span>
              <span class="threshold-control__note">
                (Will use chew items when chew drops below this)
              </span>
            </div>
            <SliderField
              :id="`${selectedGuineaPig!.id}-chew-threshold`"
              :modelValue="getChewThreshold(selectedGuineaPig!.id)"
              :min="10"
              :max="80"
              :step="5"
              prefix=""
              suffix="%"
              :show-min-max="true"
              @update:modelValue="(value: number) => setChewThreshold(selectedGuineaPig!.id, value)"
            />
          </div>

          <!-- Play Threshold -->
          <div class="threshold-control mb-3">
            <label :for="`${selectedGuineaPig!.id}-play-threshold`">
              Play Behavior Threshold
            </label>
            <div class="threshold-control__info">
              <span class="threshold-control__value">{{ getPlayThreshold(selectedGuineaPig!.id) }}%</span>
              <span class="threshold-control__note">
                (Will use toys when play drops below this)
              </span>
            </div>
            <SliderField
              :id="`${selectedGuineaPig!.id}-play-threshold`"
              :modelValue="getPlayThreshold(selectedGuineaPig!.id)"
              :min="10"
              :max="80"
              :step="5"
              prefix=""
              suffix="%"
              :show-min-max="true"
              @update:modelValue="(value: number) => setPlayThreshold(selectedGuineaPig!.id, value)"
            />
          </div>
        </Details>
      </div>
    </div>

    <!-- Global Autonomy Settings (Bottom Section) -->
    <div class="panel panel--compact panel--overflow-visible mb-4">
      <div class="panel__header flex justify-between items-center">
        <h3>Global Autonomy Settings</h3>
        <InfoButton
          message="Game Loop Speed controls how often the game processes AI decisions and updates. Lower values (e.g., 100ms) mean more frequent updates for faster-paced testing. Higher values (e.g., 30s) slow everything down for easier observation of behaviors."
          position="bottom"
        />
      </div>
      <div class="panel__content">
        <div class="global-controls">
          <div class="control-row">
            <label class="control-label">
              <input
                type="checkbox"
                checked
                disabled
                title="AI is always enabled in game loop"
              />
              <span class="control-label__text">Autonomous AI System</span>
            </label>
            <span class="control-description">
              🟢 AI Always Running
            </span>
          </div>

          <div class="control-row mt-3">
            <label :for="'ai-tick-interval'" class="control-label__text">
              Game Loop Speed
            </label>
            <div class="control-info">
              <span class="control-value">{{ (gameTimingStore.intervalMs / 1000).toFixed(0) }}s</span>
            </div>
            <SliderField
              id="ai-tick-interval"
              :modelValue="gameTimingStore.intervalMs"
              :min="100"
              :max="30000"
              :step="500"
              prefix=""
              suffix="ms"
              :show-min-max="true"
              @update:modelValue="gameTimingStore.setIntervalMs"
            />
          </div>
        </div>
      </div>
    </div>

    <div v-if="!hasActiveGuineaPigs" class="panel panel--compact panel--warning">
      <div class="panel__content text-center">
        <p class="text-label text-label--muted mb-2">No guinea pigs in game</p>
        <p class="text-label--small">Start a game in the Game Controller view to see autonomy data.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useGuineaPigStore } from '../../../stores/guineaPigStore'
import { useGameTimingStore } from '../../../stores/gameTimingStore'
import { useGameController } from '../../../stores/gameController'
import { useHabitatConditions } from '../../../stores/habitatConditions'
import { useAutonomySettingsStore } from '../../../stores/autonomySettingsStore'
import { useBehaviorStateStore } from '../../../stores/behaviorStateStore'
import { useGuineaPigBehavior } from '../../../composables/game/useGuineaPigBehavior'
import type { BehaviorType } from '../../../composables/game/useGuineaPigBehavior'
import SliderField from '../../basic/SliderField.vue'
import Button from '../../basic/Button.vue'
import InfoButton from '../../basic/InfoButton.vue'
import Details from '../../basic/Details.vue'

const guineaPigStore = useGuineaPigStore()
const gameTimingStore = useGameTimingStore()
const gameController = useGameController()
const habitatConditions = useHabitatConditions()
const autonomySettings = useAutonomySettingsStore()
const behaviorStateStore = useBehaviorStateStore()

const hasActiveGuineaPigs = computed(() => guineaPigStore.activeGuineaPigs.length > 0)
const isGameActive = computed(() => gameController.isGameActive)

// Selected guinea pig toggle
const selectedGuineaPigIndex = ref(0)
const selectedGuineaPig = computed(() => {
  if (!hasActiveGuineaPigs.value) return null
  return guineaPigStore.activeGuineaPigs[selectedGuineaPigIndex.value]
})

/**
 * Toggle to next guinea pig
 */
function toggleGuineaPig() {
  const total = guineaPigStore.activeGuineaPigs.length
  selectedGuineaPigIndex.value = (selectedGuineaPigIndex.value + 1) % total
}

/**
 * Watch for guinea pig selection changes from sprite clicks
 * and update local index to match
 */
watch(
  () => guineaPigStore.selectedGuineaPigId,
  (selectedId) => {
    if (!selectedId) return

    // Find the index of the selected guinea pig in active guinea pigs
    const index = guineaPigStore.activeGuineaPigs.findIndex(gp => gp.id === selectedId)
    if (index !== -1) {
      selectedGuineaPigIndex.value = index
    }
  }
)

// Cache behavior composables (similar to gameTimingStore pattern)
const behaviorComposables = new Map<string, ReturnType<typeof useGuineaPigBehavior>>()

// Getters - use autonomy settings store
function getHungerThreshold(guineaPigId: string): number {
  return autonomySettings.getThresholds(guineaPigId).hunger
}

function getThirstThreshold(guineaPigId: string): number {
  return autonomySettings.getThresholds(guineaPigId).thirst
}

function getEnergyThreshold(guineaPigId: string): number {
  return autonomySettings.getThresholds(guineaPigId).energy
}

function getShelterThreshold(guineaPigId: string): number {
  return autonomySettings.getThresholds(guineaPigId).shelter
}

function getHygieneThreshold(guineaPigId: string): number {
  return autonomySettings.getThresholds(guineaPigId).hygiene
}

function getChewThreshold(guineaPigId: string): number {
  return autonomySettings.getThresholds(guineaPigId).chew
}

function getPlayThreshold(guineaPigId: string): number {
  return autonomySettings.getThresholds(guineaPigId).play
}

// Setters - use autonomy settings store
function setHungerThreshold(guineaPigId: string, value: number) {
  autonomySettings.setThreshold(guineaPigId, 'hunger', value)
}

function setThirstThreshold(guineaPigId: string, value: number) {
  autonomySettings.setThreshold(guineaPigId, 'thirst', value)
}

function setEnergyThreshold(guineaPigId: string, value: number) {
  autonomySettings.setThreshold(guineaPigId, 'energy', value)
}

function setShelterThreshold(guineaPigId: string, value: number) {
  autonomySettings.setThreshold(guineaPigId, 'shelter', value)
}

function setHygieneThreshold(guineaPigId: string, value: number) {
  autonomySettings.setThreshold(guineaPigId, 'hygiene', value)
}

function setChewThreshold(guineaPigId: string, value: number) {
  autonomySettings.setThreshold(guineaPigId, 'chew', value)
}

function setPlayThreshold(guineaPigId: string, value: number) {
  autonomySettings.setThreshold(guineaPigId, 'play', value)
}

/**
 * Get or create behavior composable for a guinea pig
 */
function getBehaviorComposable(guineaPigId: string) {
  let behavior = behaviorComposables.get(guineaPigId)
  if (!behavior) {
    behavior = useGuineaPigBehavior(guineaPigId)
    behaviorComposables.set(guineaPigId, behavior)
  }
  return behavior
}

/**
 * Cancel current behavior
 */
function cancelBehavior(guineaPigId: string) {
  const behavior = getBehaviorComposable(guineaPigId)
  const guineaPig = guineaPigStore.activeGuineaPigs.find(gp => gp.id === guineaPigId)

  if (!guineaPig) {
    console.warn(`Guinea pig ${guineaPigId} not found`)
    return
  }

  if (behavior.behaviorState.value.currentGoal) {
    console.log(`Canceling ${behavior.behaviorState.value.currentGoal.type} behavior for ${guineaPig.name}`)
    behavior.behaviorState.value.currentGoal = null
    behavior.behaviorState.value.currentActivity = 'idle'
    // Stop any current movement
    behavior.stopMovement()
  }
}

/**
 * Manual behavior triggers - Force execute specific behaviors for testing
 * Temporarily lowers the guinea pig's needs to trigger the behavior
 */
async function triggerBehavior(guineaPigId: string, behaviorType: BehaviorType) {
  const behavior = getBehaviorComposable(guineaPigId)
  const guineaPig = guineaPigStore.activeGuineaPigs.find(gp => gp.id === guineaPigId)

  if (!guineaPig) {
    console.warn(`Guinea pig ${guineaPigId} not found`)
    return
  }

  // Store original need values
  const originalNeeds = { ...guineaPig.needs }

  try {
    // Special handling for socialize: bypass AI goal selection and execute directly
    if (behaviorType === 'socialize') {
      const bonds = guineaPigStore.getAllBonds()
      if (bonds.length === 0) {
        console.warn(`❌ No bonds exist for ${guineaPig.name} to socialize with`)
        return
      }

      // Find bonds involving this guinea pig and sort by bonding level
      // Also verify that the partner guinea pig exists and is active
      const myBonds = bonds
        .filter(bond => {
          const isMyBond = bond.guineaPig1Id === guineaPigId || bond.guineaPig2Id === guineaPigId
          if (!isMyBond) return false

          // Verify partner exists and is active
          const partnerId = bond.guineaPig1Id === guineaPigId ? bond.guineaPig2Id : bond.guineaPig1Id
          const partner = guineaPigStore.getGuineaPig(partnerId)
          return partner && guineaPigStore.activeGuineaPigs.some(gp => gp.id === partnerId)
        })
        .sort((a, b) => b.bondingLevel - a.bondingLevel)

      if (myBonds.length === 0) {
        console.warn(`❌ ${guineaPig.name} has no companion bonds`)
        return
      }

      const topBond = myBonds[0]
      const partnerId = topBond.guineaPig1Id === guineaPigId ? topBond.guineaPig2Id : topBond.guineaPig1Id
      const partner = guineaPigStore.getGuineaPig(partnerId)

      if (!partner) {
        console.warn(`❌ Partner guinea pig not found`)
        return
      }

      console.log(`[Manual Socialize] ${guineaPig.name} will socialize with ${partner.name} (bond level: ${topBond.bondingLevel.toFixed(1)}%)`)

      // Create socialize goal manually
      const goal = {
        type: 'socialize' as const,
        target: null,
        priority: 100,
        estimatedDuration: 8000,
        needSatisfied: 'social' as const,
        metadata: { partnerId, bondId: topBond.id }
      }

      // Execute the behavior directly
      const success = await behavior.executeBehavior(goal)
      if (success) {
        console.log(`✅ Successfully triggered socialize behavior for ${guineaPig.name} with ${partner.name}`)
        // Fully satisfy social need - verify guinea pig still exists
        const gpAfterBehavior = guineaPigStore.getGuineaPig(guineaPigId)
        if (gpAfterBehavior) {
          guineaPigStore.adjustNeed(guineaPigId, 'social', 100 - gpAfterBehavior.needs.social)
        }
      } else {
        console.warn(`❌ Failed to execute socialize behavior for ${guineaPig.name}`)
      }
      return
    }

    // Temporarily lower the relevant need to force behavior selection
    switch (behaviorType) {
      case 'eat':
        guineaPigStore.adjustNeed(guineaPigId, 'hunger', -100) // Drop hunger to near 0
        break
      case 'drink':
        guineaPigStore.adjustNeed(guineaPigId, 'thirst', -100) // Drop thirst to near 0
        break
      case 'sleep':
        guineaPigStore.adjustNeed(guineaPigId, 'energy', -100) // Drop energy to near 0
        break
      case 'seek_shelter':
        guineaPigStore.adjustNeed(guineaPigId, 'shelter', -100) // Drop shelter to near 0
        break
      case 'groom':
        guineaPigStore.adjustNeed(guineaPigId, 'hygiene', -100) // Drop hygiene to near 0
        break
      case 'chew':
        guineaPigStore.adjustNeed(guineaPigId, 'chew', -100) // Drop chew to near 0
        break
      case 'play':
        guineaPigStore.adjustNeed(guineaPigId, 'play', -100) // Drop play to near 0
        break
    }

    // Small delay to ensure need update propagates
    await new Promise(resolve => setTimeout(resolve, 10))

    console.log(`[Manual Trigger] ${guineaPig.name} needs after adjustment:`, {
      hunger: guineaPig.needs.hunger,
      thirst: guineaPig.needs.thirst,
      energy: guineaPig.needs.energy
    })

    // Get custom thresholds from autonomy settings store
    const thresholds = autonomySettings.getThresholds(guineaPigId)

    console.log(`[Manual Trigger] Thresholds:`, thresholds)
    console.log(`[Manual Trigger] Checking cooldown for ${behaviorType}:`, behavior.isOnCooldown(behaviorType))

    // Let the AI select the appropriate goal (now that need is low)
    const goal = behavior.selectBehaviorGoal(thresholds)

    console.log(`[Manual Trigger] Selected goal:`, goal)

    // Check if goal matches requested behavior type
    // Note: 'eat' can result in 'eat' or 'eat_hay' depending on what's available
    const isMatchingGoal = goal && (
      goal.type === behaviorType ||
      (behaviorType === 'eat' && goal.type === 'eat_hay') // Accept hay when triggering eat
    )

    if (isMatchingGoal && goal) {
      // Check if already executing a behavior
      if (behavior.behaviorState.value.currentGoal) {
        console.warn(`❌ ${guineaPig.name} is already executing behavior: ${behavior.behaviorState.value.currentGoal.type}`)

        // Restore original needs since behavior didn't execute
        guineaPigStore.adjustNeed(guineaPigId, 'hunger', originalNeeds.hunger - guineaPig.needs.hunger)
        guineaPigStore.adjustNeed(guineaPigId, 'thirst', originalNeeds.thirst - guineaPig.needs.thirst)
        guineaPigStore.adjustNeed(guineaPigId, 'energy', originalNeeds.energy - guineaPig.needs.energy)
        guineaPigStore.adjustNeed(guineaPigId, 'social', originalNeeds.social - guineaPig.needs.social)
        return
      }

      // Execute the behavior
      const success = await behavior.executeBehavior(goal)
      if (success) {
        console.log(`✅ Triggered ${goal.type} behavior for ${guineaPig.name} (requested: ${behaviorType})`)

        // For manual triggers, fully satisfy the need to 100% for testing convenience
        switch (behaviorType) {
          case 'eat':
            guineaPigStore.adjustNeed(guineaPigId, 'hunger', 100 - guineaPig.needs.hunger)
            break
          case 'drink':
            guineaPigStore.adjustNeed(guineaPigId, 'thirst', 100 - guineaPig.needs.thirst)
            break
          case 'sleep':
            guineaPigStore.adjustNeed(guineaPigId, 'energy', 100 - guineaPig.needs.energy)
            break
          case 'seek_shelter':
            guineaPigStore.adjustNeed(guineaPigId, 'shelter', 100 - guineaPig.needs.shelter)
            break
          case 'groom':
            guineaPigStore.adjustNeed(guineaPigId, 'hygiene', 100 - guineaPig.needs.hygiene)
            break
          case 'chew':
            guineaPigStore.adjustNeed(guineaPigId, 'chew', 100 - guineaPig.needs.chew)
            break
          case 'play':
            guineaPigStore.adjustNeed(guineaPigId, 'play', 100 - guineaPig.needs.play)
            break
        }

        console.log(`[Manual Trigger] Needs after manual satisfaction:`, {
          hunger: guineaPig.needs.hunger,
          thirst: guineaPig.needs.thirst,
          energy: guineaPig.needs.energy
        })
      } else {
        console.warn(`❌ Failed to trigger ${goal.type} behavior for ${guineaPig.name} - execution returned false`)
      }
    } else if (goal) {
      console.warn(`❌ Goal created but wrong type. Expected: ${behaviorType}, Got: ${goal.type}`)

      // Restore original needs since behavior didn't execute
      guineaPigStore.adjustNeed(guineaPigId, 'hunger', originalNeeds.hunger - guineaPig.needs.hunger)
      guineaPigStore.adjustNeed(guineaPigId, 'thirst', originalNeeds.thirst - guineaPig.needs.thirst)
      guineaPigStore.adjustNeed(guineaPigId, 'energy', originalNeeds.energy - guineaPig.needs.energy)
      guineaPigStore.adjustNeed(guineaPigId, 'shelter', originalNeeds.shelter - guineaPig.needs.shelter)
    } else {
      console.warn(`❌ No goal created. Check: cooldown status, habitat items (bowls/water/etc)`)

      // Restore original needs since behavior didn't execute
      guineaPigStore.adjustNeed(guineaPigId, 'hunger', originalNeeds.hunger - guineaPig.needs.hunger)
      guineaPigStore.adjustNeed(guineaPigId, 'thirst', originalNeeds.thirst - guineaPig.needs.thirst)
      guineaPigStore.adjustNeed(guineaPigId, 'energy', originalNeeds.energy - guineaPig.needs.energy)
      guineaPigStore.adjustNeed(guineaPigId, 'shelter', originalNeeds.shelter - guineaPig.needs.shelter)
    }
  } catch (error) {
    console.error(`❌ Error triggering ${behaviorType}:`, error)

    // Restore original needs on error
    guineaPigStore.adjustNeed(guineaPigId, 'hunger', originalNeeds.hunger - guineaPig.needs.hunger)
    guineaPigStore.adjustNeed(guineaPigId, 'thirst', originalNeeds.thirst - guineaPig.needs.thirst)
    guineaPigStore.adjustNeed(guineaPigId, 'energy', originalNeeds.energy - guineaPig.needs.energy)
    guineaPigStore.adjustNeed(guineaPigId, 'shelter', originalNeeds.shelter - guineaPig.needs.shelter)
  }
}

/**
 * Get current activity from behavior state store
 */
function getCurrentActivity(guineaPigId: string): string {
  const state = behaviorStateStore.getBehaviorState(guineaPigId)
  if (!state) return 'idle'

  return state.currentActivity
}

/**
 * Get current goal from behavior state store
 */
function getCurrentGoal(guineaPigId: string): string {
  const state = behaviorStateStore.getBehaviorState(guineaPigId)
  if (!state) return 'none'

  const goal = state.currentGoal
  if (!goal) return 'none'

  return goal.type
}

/**
 * Get guinea pig position
 */
function getPosition(guineaPigId: string): string {
  const pos = habitatConditions.guineaPigPositions.get(guineaPigId)
  if (!pos) return 'unknown'

  return `(${pos.x}, ${pos.y})`
}

function hasCompanion(_guineaPigId: string): boolean {
  // Check if there are at least 2 guinea pigs (current one + at least one other)
  return guineaPigStore.activeGuineaPigs.length >= 2
}

// Export getters for external access (if needed)
defineExpose({
  getHungerThreshold,
  getThirstThreshold,
  getEnergyThreshold
})
</script>

<style scoped>
.global-controls {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.control-row {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.control-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
}

.control-label__text {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

.control-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-sm);
}

.control-value {
  font-weight: var(--font-weight-semibold);
  font-family: var(--font-mono);
  color: var(--color-text-primary);
}

.control-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.threshold-control {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.threshold-control label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

.threshold-control__info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-sm);
}

.threshold-control__value {
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.threshold-control__note {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}

.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.btn {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border-medium);
  border-radius: var(--radius-md);
  background: var(--color-bg-primary);
  cursor: pointer;
  font-size: var(--font-size-sm);
  transition: all var(--transition-fast);
}

.btn:hover {
  background: var(--color-bg-secondary);
  border-color: var(--color-primary);
}

.btn--sm {
  padding: var(--space-1) var(--space-2);
  font-size: var(--font-size-xs);
}

.btn--secondary {
  background: rgba(34, 197, 94, 0.15);
  border-color: var(--color-accent-green-400);
  color: var(--color-accent-green-400);
}

.btn--secondary:hover {
  background: var(--color-accent-green-400);
  color: var(--color-neutral-900);
}

.btn--warning {
  background: var(--color-warning-bg);
  border-color: var(--color-warning);
  color: var(--color-warning);
}

.btn--warning:hover {
  background: var(--color-warning);
  color: white;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn:disabled:hover {
  background: var(--color-bg-primary);
  border-color: var(--color-border-medium);
}

.btn--secondary:disabled:hover {
  background: rgba(34, 197, 94, 0.15);
  border-color: var(--color-accent-green-400);
  color: var(--color-accent-green-400);
}

.btn--warning:disabled:hover {
  background: var(--color-warning-bg);
  border-color: var(--color-warning);
  color: var(--color-warning);
}

.status-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.status-info__item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-2);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
}

.status-info__label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.status-info__value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}
</style>
