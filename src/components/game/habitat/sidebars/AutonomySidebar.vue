<template>
  <div class="habitat-sidebar autonomy-sidebar">
    <div class="habitat-sidebar__header autonomy-sidebar__header">
      <h3>🎮 Autonomy</h3>
      <Button
        v-if="selectedGuineaPig && guineaPigStore.activeGuineaPigs.length > 1"
        @click="toggleGuineaPig"
        variant="tertiary"
        size="sm"
      >
        {{ selectedGuineaPig.name }} ({{ currentGuineaPigIndex + 1 }}/{{ guineaPigStore.activeGuineaPigs.length }})
      </Button>
      <span v-else-if="selectedGuineaPig && guineaPigStore.activeGuineaPigs.length === 1" class="autonomy-sidebar__guinea-pig-name-static">
        {{ selectedGuineaPig.name }}
      </span>
    </div>

    <div class="autonomy-sidebar__content">
      <!-- No Selection State -->
      <div v-if="!selectedGuineaPig" class="autonomy-sidebar__no-selection">
        <p>👆 Click a guinea pig in the habitat to control their autonomy</p>
      </div>

      <template v-else>

        <!-- Current Status -->
        <div class="status-section">
          <h4 class="status-section__title">📊 Current Status</h4>
          <div class="panel panel--compact flex flex-column gap-2">
            <div class="status-item">
              <span class="status-item__label">Activity:</span>
              <span class="status-item__value">{{ getCurrentActivity(selectedGuineaPig.id) }}</span>
            </div>
            <div class="status-item">
              <span class="status-item__label">Goal:</span>
              <span class="status-item__value">{{ getCurrentGoal(selectedGuineaPig.id) }}</span>
            </div>
            <div class="status-item">
              <span class="status-item__label">Position:</span>
              <span class="status-item__value">{{ getPosition(selectedGuineaPig.id) }}</span>
            </div>
          </div>
        </div>

        <!-- Manual Triggers -->
        <div class="triggers-section">
          <h4 class="triggers-section__title">⚡ Manual Triggers</h4>

          <div class="triggers-section__buttons">
            <Button
              @click="triggerBehavior(selectedGuineaPig.id, 'eat')"
              variant="tertiary"
              size="sm"
              :disabled="!isGameActive"
            >
              🍽️ Eat
            </Button>

            <Button
              @click="triggerBehavior(selectedGuineaPig.id, 'drink')"
              variant="tertiary"
              size="sm"
              :disabled="!isGameActive"
            >
              💧 Drink
            </Button>

            <Button
              @click="triggerBehavior(selectedGuineaPig.id, 'sleep')"
              variant="tertiary"
              size="sm"
              :disabled="!isGameActive"
            >
              😴 Sleep
            </Button>

            <Button
              @click="triggerBehavior(selectedGuineaPig.id, 'seek_shelter')"
              variant="tertiary"
              size="sm"
              :disabled="!isGameActive"
            >
              🏠 Shelter
            </Button>

            <Button
              @click="triggerBehavior(selectedGuineaPig.id, 'groom')"
              variant="tertiary"
              size="sm"
              :disabled="!isGameActive"
            >
              🧼 Groom
            </Button>

            <Button
              @click="triggerBehavior(selectedGuineaPig.id, 'chew')"
              variant="tertiary"
              size="sm"
              :disabled="!isGameActive"
            >
              🦷 Chew
            </Button>

            <Button
              @click="triggerBehavior(selectedGuineaPig.id, 'play')"
              variant="tertiary"
              size="sm"
              :disabled="!isGameActive"
            >
              🎾 Play
            </Button>

            <Button
              @click="triggerBehavior(selectedGuineaPig.id, 'socialize')"
              variant="tertiary"
              size="sm"
              :disabled="!isGameActive || !hasCompanion(selectedGuineaPig.id)"
              :title="hasCompanion(selectedGuineaPig.id) ? 'Social interaction with companion' : 'Requires 2+ guinea pigs'"
            >
              🤝 Socialize
            </Button>

            <Button
              @click="triggerBehavior(selectedGuineaPig.id, 'wander')"
              variant="tertiary"
              size="sm"
              :disabled="!isGameActive"
            >
              🚶 Wander
            </Button>
          </div>

          <Button
            @click="cancelBehavior(selectedGuineaPig.id)"
            variant="secondary"
            size="sm"
            full-width
            :disabled="!isGameActive || getCurrentGoal(selectedGuineaPig.id) === 'none'"
          >
            ❌ Cancel Current Action
          </Button>
        </div>

        <!-- Behavior Thresholds -->
        <Details summary="Behavior Thresholds" variant="compact" :default-open="false">
          <div class="thresholds-list">
            <!-- Hunger -->
            <div class="threshold-item">
              <label :for="`${selectedGuineaPig.id}-hunger-threshold`" class="threshold-item__label">
                Hunger Behavior
              </label>
              <div class="threshold-item__value">{{ getHungerThreshold(selectedGuineaPig.id) }}%</div>
              <SliderField
                :id="`${selectedGuineaPig.id}-hunger-threshold`"
                :modelValue="getHungerThreshold(selectedGuineaPig.id)"
                :min="10"
                :max="80"
                :step="5"
                size="sm"
                suffix="%"
                @update:modelValue="(value: number) => selectedGuineaPig && setHungerThreshold(selectedGuineaPig.id, value)"
              />
            </div>

            <!-- Thirst -->
            <div class="threshold-item">
              <label :for="`${selectedGuineaPig.id}-thirst-threshold`" class="threshold-item__label">
                Thirst Behavior
              </label>
              <div class="threshold-item__value">{{ getThirstThreshold(selectedGuineaPig.id) }}%</div>
              <SliderField
                :id="`${selectedGuineaPig.id}-thirst-threshold`"
                :modelValue="getThirstThreshold(selectedGuineaPig.id)"
                :min="10"
                :max="80"
                :step="5"
                size="sm"
                suffix="%"
                @update:modelValue="(value: number) => selectedGuineaPig && setThirstThreshold(selectedGuineaPig.id, value)"
              />
            </div>

            <!-- Energy -->
            <div class="threshold-item">
              <label :for="`${selectedGuineaPig.id}-energy-threshold`" class="threshold-item__label">
                Sleep Behavior
              </label>
              <div class="threshold-item__value">{{ getEnergyThreshold(selectedGuineaPig.id) }}%</div>
              <SliderField
                :id="`${selectedGuineaPig.id}-energy-threshold`"
                :modelValue="getEnergyThreshold(selectedGuineaPig.id)"
                :min="10"
                :max="80"
                :step="5"
                size="sm"
                suffix="%"
                @update:modelValue="(value: number) => selectedGuineaPig && setEnergyThreshold(selectedGuineaPig.id, value)"
              />
            </div>

            <!-- Shelter -->
            <div class="threshold-item">
              <label :for="`${selectedGuineaPig.id}-shelter-threshold`" class="threshold-item__label">
                Shelter Behavior
              </label>
              <div class="threshold-item__value">{{ getShelterThreshold(selectedGuineaPig.id) }}%</div>
              <SliderField
                :id="`${selectedGuineaPig.id}-shelter-threshold`"
                :modelValue="getShelterThreshold(selectedGuineaPig.id)"
                :min="10"
                :max="80"
                :step="5"
                size="sm"
                suffix="%"
                @update:modelValue="(value: number) => selectedGuineaPig && setShelterThreshold(selectedGuineaPig.id, value)"
              />
            </div>

            <!-- Hygiene -->
            <div class="threshold-item">
              <label :for="`${selectedGuineaPig.id}-hygiene-threshold`" class="threshold-item__label">
                Groom Behavior
              </label>
              <div class="threshold-item__value">{{ getHygieneThreshold(selectedGuineaPig.id) }}%</div>
              <SliderField
                :id="`${selectedGuineaPig.id}-hygiene-threshold`"
                :modelValue="getHygieneThreshold(selectedGuineaPig.id)"
                :min="10"
                :max="80"
                :step="5"
                size="sm"
                suffix="%"
                @update:modelValue="(value: number) => selectedGuineaPig && setHygieneThreshold(selectedGuineaPig.id, value)"
              />
            </div>

            <!-- Chew -->
            <div class="threshold-item">
              <label :for="`${selectedGuineaPig.id}-chew-threshold`" class="threshold-item__label">
                Chew Behavior
              </label>
              <div class="threshold-item__value">{{ getChewThreshold(selectedGuineaPig.id) }}%</div>
              <SliderField
                :id="`${selectedGuineaPig.id}-chew-threshold`"
                :modelValue="getChewThreshold(selectedGuineaPig.id)"
                :min="10"
                :max="80"
                :step="5"
                size="sm"
                suffix="%"
                @update:modelValue="(value: number) => selectedGuineaPig && setChewThreshold(selectedGuineaPig.id, value)"
              />
            </div>

            <!-- Play -->
            <div class="threshold-item">
              <label :for="`${selectedGuineaPig.id}-play-threshold`" class="threshold-item__label">
                Play Behavior
              </label>
              <div class="threshold-item__value">{{ getPlayThreshold(selectedGuineaPig.id) }}%</div>
              <SliderField
                :id="`${selectedGuineaPig.id}-play-threshold`"
                :modelValue="getPlayThreshold(selectedGuineaPig.id)"
                :min="10"
                :max="80"
                :step="5"
                size="sm"
                suffix="%"
                @update:modelValue="(value: number) => selectedGuineaPig && setPlayThreshold(selectedGuineaPig.id, value)"
              />
            </div>
          </div>
        </Details>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Button from '../../../basic/Button.vue'
import SliderField from '../../../basic/SliderField.vue'
import Details from '../../../basic/Details.vue'
import { useGuineaPigStore } from '../../../../stores/guineaPigStore'
import { useGameController } from '../../../../stores/gameController'
import { useHabitatConditions } from '../../../../stores/habitatConditions'
import { useAutonomySettingsStore } from '../../../../stores/autonomySettingsStore'
import { useBehaviorStateStore } from '../../../../stores/behaviorStateStore'
import { useGuineaPigBehavior } from '../../../../composables/game/useGuineaPigBehavior'
import type { GuineaPig } from '../../../../stores/guineaPigStore'
import type { BehaviorType } from '../../../../composables/game/useGuineaPigBehavior'

interface Props {
  selectedGuineaPig?: GuineaPig | null
}

const props = defineProps<Props>()

const guineaPigStore = useGuineaPigStore()
const gameController = useGameController()
const habitatConditions = useHabitatConditions()
const autonomySettings = useAutonomySettingsStore()
const behaviorStateStore = useBehaviorStateStore()

const isGameActive = computed(() => gameController.isGameActive)

// Get current guinea pig index for display
const currentGuineaPigIndex = computed(() => {
  if (!props.selectedGuineaPig) return 0
  return guineaPigStore.activeGuineaPigs.findIndex(gp => gp.id === props.selectedGuineaPig!.id)
})

function toggleGuineaPig() {
  const activeGuineaPigs = guineaPigStore.activeGuineaPigs
  if (activeGuineaPigs.length <= 1) return

  const currentIndex = activeGuineaPigs.findIndex(gp => gp.id === props.selectedGuineaPig?.id)
  const nextIndex = (currentIndex + 1) % activeGuineaPigs.length
  const nextGuineaPig = activeGuineaPigs[nextIndex]

  guineaPigStore.selectGuineaPig(nextGuineaPig.id)
}

// Cache behavior composables
const behaviorComposables = new Map<string, ReturnType<typeof useGuineaPigBehavior>>()

function getBehaviorComposable(guineaPigId: string) {
  let behavior = behaviorComposables.get(guineaPigId)
  if (!behavior) {
    behavior = useGuineaPigBehavior(guineaPigId)
    behaviorComposables.set(guineaPigId, behavior)
  }
  return behavior
}

// Threshold getters
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

// Threshold setters
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
    behavior.stopMovement()
  }
}

async function triggerBehavior(guineaPigId: string, behaviorType: BehaviorType) {
  const behavior = getBehaviorComposable(guineaPigId)
  const guineaPig = guineaPigStore.activeGuineaPigs.find(gp => gp.id === guineaPigId)

  if (!guineaPig) {
    console.warn(`Guinea pig ${guineaPigId} not found`)
    return
  }

  const originalNeeds = { ...guineaPig.needs }

  try {
    if (behaviorType === 'socialize') {
      const bonds = guineaPigStore.getAllBonds()
      if (bonds.length === 0) {
        console.warn(`❌ No bonds exist for ${guineaPig.name} to socialize with`)
        return
      }

      const myBonds = bonds
        .filter(bond => {
          const isMyBond = bond.guineaPig1Id === guineaPigId || bond.guineaPig2Id === guineaPigId
          if (!isMyBond) return false

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

      const goal = {
        type: 'socialize' as const,
        target: null,
        priority: 100,
        estimatedDuration: 8000,
        needSatisfied: 'social' as const,
        metadata: { partnerId, bondId: topBond.id }
      }

      const success = await behavior.executeBehavior(goal)
      if (success) {
        console.log(`✅ Successfully triggered socialize behavior for ${guineaPig.name} with ${partner.name}`)
        const gpAfterBehavior = guineaPigStore.getGuineaPig(guineaPigId)
        if (gpAfterBehavior) {
          guineaPigStore.adjustNeed(guineaPigId, 'social', 100 - gpAfterBehavior.needs.social)
        }
      } else {
        console.warn(`❌ Failed to execute socialize behavior for ${guineaPig.name}`)
      }
      return
    }

    switch (behaviorType) {
      case 'eat':
        guineaPigStore.adjustNeed(guineaPigId, 'hunger', -100)
        break
      case 'drink':
        guineaPigStore.adjustNeed(guineaPigId, 'thirst', -100)
        break
      case 'sleep':
        guineaPigStore.adjustNeed(guineaPigId, 'energy', -100)
        break
      case 'seek_shelter':
        guineaPigStore.adjustNeed(guineaPigId, 'shelter', -100)
        break
      case 'groom':
        guineaPigStore.adjustNeed(guineaPigId, 'hygiene', -100)
        break
      case 'chew':
        guineaPigStore.adjustNeed(guineaPigId, 'chew', -100)
        break
      case 'play':
        guineaPigStore.adjustNeed(guineaPigId, 'play', -100)
        break
    }

    await new Promise(resolve => setTimeout(resolve, 10))

    const thresholds = autonomySettings.getThresholds(guineaPigId)
    const goal = behavior.selectBehaviorGoal(thresholds)

    const isMatchingGoal = goal && (
      goal.type === behaviorType ||
      (behaviorType === 'eat' && goal.type === 'eat_hay')
    )

    if (isMatchingGoal && goal) {
      if (behavior.behaviorState.value.currentGoal) {
        console.warn(`❌ ${guineaPig.name} is already executing behavior: ${behavior.behaviorState.value.currentGoal.type}`)
        guineaPigStore.adjustNeed(guineaPigId, 'hunger', originalNeeds.hunger - guineaPig.needs.hunger)
        guineaPigStore.adjustNeed(guineaPigId, 'thirst', originalNeeds.thirst - guineaPig.needs.thirst)
        guineaPigStore.adjustNeed(guineaPigId, 'energy', originalNeeds.energy - guineaPig.needs.energy)
        guineaPigStore.adjustNeed(guineaPigId, 'social', originalNeeds.social - guineaPig.needs.social)
        return
      }

      const success = await behavior.executeBehavior(goal)
      if (success) {
        console.log(`✅ Triggered ${goal.type} behavior for ${guineaPig.name} (requested: ${behaviorType})`)

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
      } else {
        console.warn(`❌ Failed to trigger ${goal.type} behavior for ${guineaPig.name}`)
      }
    } else {
      console.warn(`❌ Could not create goal for ${behaviorType}`)
      guineaPigStore.adjustNeed(guineaPigId, 'hunger', originalNeeds.hunger - guineaPig.needs.hunger)
      guineaPigStore.adjustNeed(guineaPigId, 'thirst', originalNeeds.thirst - guineaPig.needs.thirst)
      guineaPigStore.adjustNeed(guineaPigId, 'energy', originalNeeds.energy - guineaPig.needs.energy)
      guineaPigStore.adjustNeed(guineaPigId, 'shelter', originalNeeds.shelter - guineaPig.needs.shelter)
    }
  } catch (error) {
    console.error(`❌ Error triggering ${behaviorType}:`, error)
    guineaPigStore.adjustNeed(guineaPigId, 'hunger', originalNeeds.hunger - guineaPig.needs.hunger)
    guineaPigStore.adjustNeed(guineaPigId, 'thirst', originalNeeds.thirst - guineaPig.needs.thirst)
    guineaPigStore.adjustNeed(guineaPigId, 'energy', originalNeeds.energy - guineaPig.needs.energy)
    guineaPigStore.adjustNeed(guineaPigId, 'shelter', originalNeeds.shelter - guineaPig.needs.shelter)
  }
}

function getCurrentActivity(guineaPigId: string): string {
  const state = behaviorStateStore.getBehaviorState(guineaPigId)
  return state?.currentActivity || 'idle'
}

function getCurrentGoal(guineaPigId: string): string {
  const state = behaviorStateStore.getBehaviorState(guineaPigId)
  return state?.currentGoal?.type || 'none'
}

function getPosition(guineaPigId: string): string {
  const pos = habitatConditions.guineaPigPositions.get(guineaPigId)
  if (!pos) return 'unknown'
  return `(${pos.x}, ${pos.y})`
}

function hasCompanion(_guineaPigId: string): boolean {
  return guineaPigStore.activeGuineaPigs.length >= 2
}
</script>

<style>
/* Component-specific styles (shared layout from .habitat-sidebar) */
.autonomy-sidebar__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.autonomy-sidebar__content {
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.autonomy-sidebar__no-selection {
  text-align: center;
  padding: var(--space-4);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.autonomy-sidebar__guinea-pig-name-static {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-semibold);
}

.status-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.triggers-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.triggers-section__buttons {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.status-section__title,
.triggers-section__title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  margin: 0;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-2);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
}

.status-item__label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.status-item__value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

.thresholds-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.threshold-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.threshold-item__label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

.threshold-item__value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}
</style>
