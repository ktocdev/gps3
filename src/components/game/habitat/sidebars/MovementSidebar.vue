<template>
  <div class="habitat-sidebar movement-sidebar">
    <div class="habitat-sidebar__header movement-sidebar__header">
      <h3>🎯 Movement</h3>
      <Button
        v-if="selectedGuineaPig && guineaPigStore.activeGuineaPigs.length > 1"
        @click="toggleGuineaPig"
        variant="tertiary"
        size="sm"
      >
        {{ selectedGuineaPig.name }} ({{ currentGuineaPigIndex + 1 }}/{{ guineaPigStore.activeGuineaPigs.length }})
      </Button>
      <span v-else-if="selectedGuineaPig && guineaPigStore.activeGuineaPigs.length === 1" class="movement-sidebar__guinea-pig-name-static">
        {{ selectedGuineaPig.name }}
      </span>
    </div>

    <div class="movement-sidebar__content">
      <!-- No Selection State -->
      <div v-if="!selectedGuineaPig" class="movement-sidebar__no-selection">
        <p>👆 Click a guinea pig in the habitat to control their movement</p>
      </div>

      <template v-else>
        <!-- Movement Mode Toggle -->
        <div class="mode-section">
          <h4 class="mode-section__title">🔄 Movement System</h4>
          <div class="panel panel--compact">
            <div class="mode-toggle">
              <ToggleGroup
                :model-value="movementMode"
                @update:model-value="setMovementMode"
                :options="movementModeOptions"
                size="sm"
              />
            </div>
            <p class="mode-description">
              <template v-if="movementMode === 'grid'">
                Cell-by-cell movement with pathfinding.
              </template>
              <template v-else>
                Smooth, continuous pixel-based movement.
              </template>
            </p>
          </div>
        </div>

        <!-- Manual Control Section -->
        <div class="control-section">
          <h4 class="control-section__title">🎮 Manual Control</h4>
          <div class="panel panel--compact">
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-label">Status:</span>
                <span v-if="isManuallyControlled" class="stat-value text--success">🟢 Manual</span>
                <span v-else class="stat-value">⚪ Autonomous</span>
              </div>
            </div>
            <div class="control-actions">
              <Button
                v-if="!isManuallyControlled"
                @click="takeControl"
                variant="primary"
                size="sm"
                :disabled="!selectedGuineaPig || isGameInactive"
              >
                🎯 Take Control
              </Button>
              <Button
                v-else
                @click="releaseControl"
                variant="secondary"
                size="sm"
              >
                🔄 Release Control
              </Button>
            </div>
            <div v-if="isManuallyControlled" class="control-info">
              <p class="control-info__text">Click anywhere in the habitat to move {{ selectedGuineaPig?.name }}</p>
              <p v-if="timeRemaining > 0" class="control-info__timer">Auto-release in: {{ timeRemaining }}s</p>
            </div>
          </div>
        </div>

        <!-- Guinea Pig Speed (Free Mode Only) -->
        <div v-if="movementMode === 'free'" class="speed-section">
          <h4 class="speed-section__title">🏃 Movement Speed</h4>
          <div class="panel panel--compact">
            <SliderField
              :model-value="movementModeStore.freeMovementSpeed"
              @update:model-value="movementModeStore.setFreeMovementSpeed"
              label="Speed"
              :min="50"
              :max="500"
              :step="25"
              suffix=" px/s"
              :show-value="true"
              size="sm"
            />
            <div class="speed-labels">
              <span>🐢 Slow</span>
              <span>🐇 Fast</span>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import Button from '../../../basic/Button.vue'
import SliderField from '../../../basic/SliderField.vue'
import ToggleGroup from '../../../basic/ToggleGroup.vue'
import { useGuineaPigStore } from '../../../../stores/guineaPigStore'
import { useGameController } from '../../../../stores/gameController'
import { useManualControl } from '../../../../composables/game/useManualControl'
import { useMovementModeStore } from '../../../../stores/movementModeStore'
import type { GuineaPig } from '../../../../stores/guineaPigStore'

interface Props {
  selectedGuineaPig?: GuineaPig | null
}

const props = defineProps<Props>()

const gameController = useGameController()
const guineaPigStore = useGuineaPigStore()
const manualControl = useManualControl()
const movementModeStore = useMovementModeStore()

// Movement mode from store
const movementMode = computed(() => movementModeStore.mode)

const movementModeOptions = [
  { value: 'grid', label: '📐 Grid' },
  { value: 'free', label: '🌊 Free' }
]

function setMovementMode(mode: string) {
  movementModeStore.setMode(mode as 'grid' | 'free')
}

// Manual Control
const isManuallyControlled = computed(() => {
  if (!props.selectedGuineaPig) return false
  return manualControl.isControlled(props.selectedGuineaPig.id)
})

const timeRemaining = computed(() => manualControl.timeRemaining.value)

const isGameInactive = computed(() => !gameController.isGameActive)

function takeControl() {
  if (!props.selectedGuineaPig) return

  // If there's a currently controlled guinea pig, clear its store state first
  const previouslyControlledId = manualControl.controlledGuineaPigId.value
  if (previouslyControlledId && previouslyControlledId !== props.selectedGuineaPig.id) {
    guineaPigStore.setManualControl(previouslyControlledId, false)
  }

  // Take control (this will call releaseControl internally if switching)
  manualControl.takeControl(props.selectedGuineaPig.id)

  // Update store state for new guinea pig
  guineaPigStore.setManualControl(props.selectedGuineaPig.id, true)
}

function releaseControl() {
  if (!props.selectedGuineaPig) return

  // Update store state first
  guineaPigStore.setManualControl(props.selectedGuineaPig.id, false)

  // Then release control
  manualControl.releaseControl()
}

// Guinea pig toggle
function toggleGuineaPig() {
  const activeGuineaPigs = guineaPigStore.activeGuineaPigs
  if (activeGuineaPigs.length <= 1) return

  const currentIndex = activeGuineaPigs.findIndex(gp => gp.id === props.selectedGuineaPig?.id)
  const nextIndex = (currentIndex + 1) % activeGuineaPigs.length
  const nextGuineaPig = activeGuineaPigs[nextIndex]

  guineaPigStore.selectGuineaPig(nextGuineaPig.id)
}

const currentGuineaPigIndex = computed(() => {
  if (!props.selectedGuineaPig) return 0
  return guineaPigStore.activeGuineaPigs.findIndex(gp => gp.id === props.selectedGuineaPig!.id)
})

// Watch for guinea pig selection changes and sync composable state
watch(() => props.selectedGuineaPig?.id, (newId, oldId) => {
  // If we switched to a different guinea pig while one was controlled, release the composable's control
  if (oldId && newId !== oldId && manualControl.controlledGuineaPigId.value === oldId) {
    manualControl.releaseControl()
  }
})
</script>

<style>
/* Component-specific styles (shared layout from .habitat-sidebar) */
.movement-sidebar__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-2);
}

.movement-sidebar__header h3 {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.movement-sidebar__content {
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.movement-sidebar__guinea-pig-name-static {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-semibold);
}

.movement-sidebar__no-selection {
  text-align: center;
  padding: var(--space-6) var(--space-4);
  color: var(--color-text-tertiary);
}

/* Mode Section */
.mode-section,
.control-section,
.info-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.mode-section__title,
.control-section__title,
.info-section__title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  margin: 0;
}

.mode-toggle {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.mode-toggle__label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: var(--font-weight-medium);
}

.mode-toggle {
  display: flex;
  justify-content: center;
  margin-block-end: var(--space-3);
}

.mode-description {
  margin-block-start: var(--space-2);
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  margin: 0;
  text-align: center;
}

.control-actions {
  display: flex;
  justify-content: center;
  margin-block-start: var(--space-3);
}

.control-info {
  margin-block-start: var(--space-3);
  padding-block-start: var(--space-3);
  border-block-start: 1px solid var(--color-border-subtle);
}

.control-info__text {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-block-end: var(--space-2);
}

.control-info__timer {
  font-size: var(--font-size-sm);
  color: var(--color-warning);
  font-weight: var(--font-weight-medium);
}

/* Speed Section */
.speed-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.speed-section__title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  margin: 0;
}

.speed-labels {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  margin-block-start: var(--space-1);
}

/* Mobile: Full width layout */
@media (max-width: 768px) {
  .movement-sidebar {
    inline-size: 100%;
    max-block-size: 300px;
    border-inline-start: none;
    border-block-start: 1px solid var(--color-border);
  }
}
</style>
