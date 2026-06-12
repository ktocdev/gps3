<template>
  <div class="habitat-sidebar habitat-care-sidebar">
    <div class="habitat-sidebar__header">
      <h3>🏠 Habitat Care</h3>
    </div>

    <div class="habitat-care-sidebar__content">
      <!-- Overall Condition -->
      <BlockMessage :variant="getOverallConditionVariant(habitat.overallCondition)" class="overall-condition">
        <div class="overall-condition__content">
          <span class="overall-condition__label">Overall Condition:</span>
          <span class="overall-condition__value">{{ habitat.overallCondition }}%</span>
        </div>
      </BlockMessage>

      <!-- Core Care Actions -->
      <div class="care-section">
        <h4 class="care-section__title">Care Actions</h4>

        <Button
          @click="$emit('clean-cage')"
          :disabled="isGamePaused"
          :title="isGamePaused ? 'Unpause the game to clean habitat' : undefined"
          variant="tertiary"
          size="sm"
          full-width
          class="habitat-care-button--clean-habitat"
        >
          🧽 Clean Habitat
        </Button>

        <Button
          @click="$emit('quick-clean')"
          :disabled="isGamePaused"
          :title="isGamePaused ? 'Unpause the game to quick clean' : 'Remove poop without using bedding'"
          variant="tertiary"
          size="sm"
          full-width
          class="habitat-care-button--quick-clean"
        >
          🧹 Quick Clean
        </Button>

        <Button
          @click="$emit('refill-water')"
          :disabled="isGamePaused"
          :title="isGamePaused ? 'Unpause the game to refill water' : undefined"
          variant="tertiary"
          size="sm"
          full-width
          class="habitat-care-button--refill-water"
        >
          💧 Refill Water
        </Button>

        <Button
          @click="$emit('fill-all-hay-racks')"
          :disabled="!canFillHayRacks || isGamePaused"
          :title="isGamePaused ? 'Unpause the game to fill hay racks' : fillHayRacksTooltip"
          variant="tertiary"
          size="sm"
          full-width
          class="habitat-care-button--fill-hay"
        >
          🌾 Fill All Hay Racks
        </Button>
      </div>

      <!-- Core Conditions -->
      <div class="care-section">
        <h4 class="care-section__title">Core Conditions</h4>

        <!-- Cleanliness -->
        <div class="condition-item">
          <div class="condition-item__header">
            <label for="cleanliness">Cleanliness</label>
            <span class="condition-item__value" :class="getConditionClass(habitat.cleanliness)">
              {{ habitat.cleanliness.toFixed(0) }}%
            </span>
          </div>
          <SliderField
            id="cleanliness"
            :model-value="habitat.cleanliness"
            :min="0"
            :max="100"
            :step="1"
            size="sm"
            suffix="%"
            @update:model-value="(v: number) => habitat.updateCondition('cleanliness', v)"
          />
        </div>

        <!-- Bedding Freshness -->
        <div class="condition-item">
          <div class="condition-item__header">
            <label for="bedding">Bedding Freshness</label>
            <span class="condition-item__value" :class="getConditionClass(habitat.beddingFreshness)">
              {{ habitat.beddingFreshness.toFixed(0) }}%
            </span>
          </div>
          <SliderField
            id="bedding"
            :model-value="habitat.beddingFreshness"
            :min="0"
            :max="100"
            :step="1"
            size="sm"
            suffix="%"
            @update:model-value="(v: number) => habitat.updateCondition('beddingFreshness', v)"
          />
        </div>

        <!-- Water Level -->
        <div class="condition-item">
          <div class="condition-item__header">
            <label for="water">Water Level</label>
            <span class="condition-item__value" :class="getConditionClass(habitat.waterLevel)">
              {{ habitat.waterLevel.toFixed(0) }}%
            </span>
          </div>
          <SliderField
            id="water"
            :model-value="habitat.waterLevel"
            :min="0"
            :max="100"
            :step="1"
            size="sm"
            suffix="%"
            @update:model-value="(v: number) => habitat.updateCondition('waterLevel', v)"
          />
        </div>
      </div>

      <!-- Chew Items -->
      <div v-if="chewItemsList.length > 0" class="care-section">
        <h4 class="care-section__title">Chew Items</h4>
        <div v-for="chew in chewItemsList" :key="chew.itemId" class="condition-item">
          <div class="condition-item__header">
            <label :for="`chew-${chew.itemId}`">
              {{ chew.emoji }} {{ chew.name }}
            </label>
            <span class="condition-item__value" :class="getChewDurabilityClass(chew.durability)">
              {{ chew.durability.toFixed(0) }}%
            </span>
          </div>
          <SliderField
            :id="`chew-${chew.itemId}`"
            :model-value="chew.durability"
            :min="0"
            :max="100"
            :step="1"
            size="sm"
            suffix="%"
            @update:model-value="(v: number) => updateChewDurability(chew.itemId, v)"
          />
          <div class="condition-item__metadata">
            🦷 Used {{ chew.usageCount }} times
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHabitatConditions } from '../../../../stores/habitatConditions'
import { useHabitatContainers } from '../../../../composables/useHabitatContainers'
import { useSuppliesStore } from '../../../../stores/suppliesStore'
import { useGameTimingStore } from '../../../../stores/gameTimingStore'
import { CHEW_DEGRADATION } from '../../../../constants/supplies'
import Button from '../../../basic/Button.vue'
import BlockMessage from '../../../basic/BlockMessage.vue'
import SliderField from '../../../basic/SliderField.vue'

interface Props {
  canFillHayRacks: boolean
  fillHayRacksTooltip: string
  habitatVisualRef: any
}

const props = defineProps<Props>()

defineEmits<{
  'clean-cage': []
  'quick-clean': []
  'refill-water': []
  'fill-all-hay-racks': []
}>()

const habitat = useHabitatConditions()
const suppliesStore = useSuppliesStore()
const gameTimingStore = useGameTimingStore()
const { getChewData, setChewDurability } = useHabitatContainers()

const isGamePaused = computed(() => !gameTimingStore.isRunning)

// Chew Items Management
const chewItemsList = computed(() => {
  if (!props.habitatVisualRef) return []

  const items = props.habitatVisualRef.placedItems
  if (!items) return []

  const chews = items
    .filter((item: any) => {
      const itemData = suppliesStore.getItemById(item.itemId)
      return itemData?.stats?.itemType === 'chew'
    })
    .map((item: any) => {
      const itemData = suppliesStore.getItemById(item.itemId)
      const chewData = getChewData(item.itemId)

      return {
        itemId: item.itemId,
        name: itemData?.name || 'Chew Item',
        emoji: itemData?.emoji || '🦷',
        durability: chewData?.durability ?? 100,
        usageCount: chewData?.usageCount ?? 0,
        lastUsedAt: chewData?.lastUsedAt ?? Date.now()
      }
    })

  return chews
})

function updateChewDurability(chewItemId: string, durability: number) {
  setChewDurability(chewItemId, durability)
}

function getChewDurabilityClass(durability: number): string {
  if (durability < CHEW_DEGRADATION.UNSAFE_THRESHOLD) return 'text-label--danger'
  if (durability < CHEW_DEGRADATION.DEGRADED_THRESHOLD) return 'text-label--warning'
  if (durability < CHEW_DEGRADATION.WORN_THRESHOLD) return 'text-label--muted'
  return 'text-label--success'
}

function getConditionClass(value: number): string {
  if (value >= 75) return 'text-label--success'
  if (value >= 50) return 'text-label--warning'
  return 'text-label--danger'
}

function getOverallConditionVariant(value: number): 'success' | 'warning' | 'error' {
  if (value >= 75) return 'success'
  if (value >= 50) return 'warning'
  return 'error'
}
</script>

<style>
/* Component-specific styles (shared layout from .habitat-sidebar) */
.habitat-care-sidebar__content {
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.care-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.care-section__title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  margin: 0;
  margin-block-end: var(--space-1);
}

/* Overall Condition */
.overall-condition {
  margin-block-end: 0;
}

.overall-condition__content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.overall-condition__label {
  font-weight: var(--font-weight-semibold);
}

.overall-condition__value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
}

/* Condition Items */
.condition-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.condition-item__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.condition-item__header label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.condition-item__value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
}

.condition-item__metadata {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  text-align: center;
}

/* Color-coded habitat care buttons */
.habitat-care-button--clean-habitat {
  background-color: var(--color-accent-green-300);
  color: #1e293b;
}

.habitat-care-button--clean-habitat:hover:not(:disabled) {
  background-color: var(--color-accent-green-400);
}

.habitat-care-button--quick-clean {
  background-color: #d4b896;
  color: #1e293b;
}

.habitat-care-button--quick-clean:hover:not(:disabled) {
  background-color: #c4a886;
}

.habitat-care-button--refill-water {
  background-color: #7dd3fc;
  color: #1e293b;
}

.habitat-care-button--refill-water:hover:not(:disabled) {
  background-color: #38bdf8;
}

.habitat-care-button--fill-hay {
  background-color: var(--color-warning-400);
  color: #1e293b;
}

.habitat-care-button--fill-hay:hover:not(:disabled) {
  background-color: var(--color-warning-500);
}

/* Disabled state reduces opacity */
.habitat-care-button--clean-habitat:disabled,
.habitat-care-button--quick-clean:disabled,
.habitat-care-button--refill-water:disabled,
.habitat-care-button--fill-hay:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
