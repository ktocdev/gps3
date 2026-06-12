<template>
  <BaseDialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" size="sm">
    <div class="game-dialog">
      <div class="game-dialog__header">
        <h2 class="game-dialog__title">Hay Racks</h2>
      </div>

      <div class="game-dialog__content">
        <!-- Overall Status -->
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">Overall Freshness:</span>
            <span class="stat-value" :class="overallFreshnessClass">
              {{ Math.round(overallFreshness) }}%
            </span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Available Hay:</span>
            <span class="stat-value" :class="{ 'stat-value--warning': totalHayServings === 0 }">
              {{ totalHayServings }} servings
            </span>
          </div>
        </div>

        <!-- Replace All Button -->
        <Button
          v-if="hayRacks.length > 0"
          @click="handleReplaceAll"
          variant="secondary"
          size="sm"
          class="hay-management-dialog__replace-btn"
          :disabled="totalHayServings === 0 || allRacksFullAndFresh"
        >
          Replace All Hay
        </Button>

        <!-- Empty State -->
        <BlockMessage v-if="hayRacks.length === 0" variant="info">
          No hay racks in the habitat. Place a hay rack from your inventory first.
        </BlockMessage>

        <!-- Hay Rack List -->
        <div v-else class="hay-rack-list">
          <div
            v-for="rack in hayRacks"
            :key="rack.id"
            class="hay-rack-item"
          >
            <div class="hay-rack-item__header">
              <span class="hay-rack-item__name">{{ rack.name }}</span>
              <span class="hay-rack-item__freshness" :class="getFreshnessClass(rack.freshness)">
                {{ Math.round(rack.freshness) }}%
              </span>
            </div>

            <div class="hay-rack-item__bar-container">
              <div
                class="hay-rack-item__bar"
                :style="{ width: (rack.servings / rack.capacity * 100) + '%' }"
                :class="getBarClass(rack.servings, rack.capacity)"
              ></div>
            </div>

            <div class="hay-rack-item__footer">
              <span class="hay-rack-item__count">
                {{ rack.servings }}/{{ rack.capacity }} servings
              </span>
              <div class="hay-rack-item__actions">
                <button
                  class="hay-rack-item__btn hay-rack-item__btn--add"
                  @click="handleAddServing(rack.id)"
                  :disabled="rack.servings >= rack.capacity || totalHayServings === 0"
                  title="Add serving"
                >
                  +
                </button>
                <button
                  v-if="rack.servings > 0"
                  class="hay-rack-item__btn hay-rack-item__btn--clear"
                  @click="handleClearRack(rack.id)"
                  title="Clear rack"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- No Hay Warning -->
        <BlockMessage v-if="totalHayServings === 0 && hayRacks.length > 0" variant="warning">
          No hay in inventory. Purchase hay from the shop to fill racks.
        </BlockMessage>
      </div>

      <div class="game-dialog__footer">
        <Button @click="$emit('update:modelValue', false)" variant="primary" size="md">
          Done
        </Button>
      </div>
    </div>
  </BaseDialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseDialog from '../../basic/dialogs/BaseDialog.vue'
import Button from '../../basic/Button.vue'
import BlockMessage from '../../basic/BlockMessage.vue'
import { useHabitatConditions } from '../../../stores/habitatConditions'
import { useInventoryStore } from '../../../stores/inventoryStore'
import { useSuppliesStore } from '../../../stores/suppliesStore'
import { useLoggingStore } from '../../../stores/loggingStore'
import { useGuineaPigStore } from '../../../stores/guineaPigStore'
import { guineaPigMessages } from '../../../data/guineaPigMessages'
import type { ReactionMessage } from '../../../data/guineaPigMessages'
import { CONSUMPTION } from '../../../constants/supplies'

interface Props {
  modelValue: boolean
}

defineProps<Props>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const habitatConditions = useHabitatConditions()
const inventoryStore = useInventoryStore()
const suppliesStore = useSuppliesStore()
const loggingStore = useLoggingStore()
const guineaPigStore = useGuineaPigStore()

/**
 * Show care reaction chat bubble for all active guinea pigs
 */
function showCareReaction() {
  const activeGuineaPigs = guineaPigStore.activeGuineaPigs
  if (activeGuineaPigs.length === 0) return

  const messages = guineaPigMessages.care.hayRackFill

  activeGuineaPigs.forEach(guineaPig => {
    const reaction = messages[Math.floor(Math.random() * messages.length)] as ReactionMessage

    document.dispatchEvent(new CustomEvent('show-chat-bubble', {
      detail: { guineaPigId: guineaPig.id, reaction },
      bubbles: true
    }))
  })
}

// Computed: Get all hay racks with their data
const hayRacks = computed(() => {
  const racks: Array<{
    id: string
    name: string
    servings: number
    capacity: number
    freshness: number
  }> = []

  const capacity = CONSUMPTION.HAY_RACK_MAX_CAPACITY

  // Find all placed hay racks from habitatItems (not just those with contents)
  const placedHayRacks = habitatConditions.habitatItems.filter(
    (itemId: string) => itemId.includes('hay_rack')
  )

  let rackIndex = 1
  for (const rackId of placedHayRacks) {
    // Check hayRackContents for this rack's data (may not exist if empty)
    const data = habitatConditions.hayRackContents.get(rackId)
    racks.push({
      id: rackId,
      name: `Hay Rack #${rackIndex}`,
      servings: data?.servings?.length || 0,
      capacity,
      freshness: data?.freshness ?? 100
    })
    rackIndex++
  }

  return racks
})

// Computed: Check if all racks are full and fresh (no need to replace)
const allRacksFullAndFresh = computed(() => {
  if (hayRacks.value.length === 0) return false
  return hayRacks.value.every(rack => rack.servings >= rack.capacity && rack.freshness >= 100)
})

// Computed: Overall freshness (average of all racks with hay)
const overallFreshness = computed(() => {
  const racksWithHay = hayRacks.value.filter(rack => rack.servings > 0)
  if (racksWithHay.length === 0) return 100

  const total = racksWithHay.reduce((sum, rack) => sum + rack.freshness, 0)
  return total / racksWithHay.length
})

// Computed: Total available hay servings in inventory
const totalHayServings = computed(() => {
  let total = 0

  for (const invItem of inventoryStore.allItems) {
    const supplyItem = suppliesStore.getItemById(invItem.itemId)
    if (supplyItem?.category === 'hay') {
      total += inventoryStore.getTotalServings(invItem.itemId)
    }
  }

  return total
})

// Get first available hay item ID
function getFirstHayItemId(): string | null {
  for (const invItem of inventoryStore.allItems) {
    const supplyItem = suppliesStore.getItemById(invItem.itemId)
    if (supplyItem?.category === 'hay') {
      const servings = inventoryStore.getTotalServings(invItem.itemId)
      if (servings > 0) {
        return invItem.itemId
      }
    }
  }
  return null
}

// Freshness class helper for individual hay rack items
function getFreshnessClass(freshness: number): string {
  if (freshness >= 80) return 'hay-rack-item__freshness--good'
  if (freshness >= 40) return 'hay-rack-item__freshness--warning'
  return 'hay-rack-item__freshness--critical'
}

// Overall freshness class for stats grid (uses global stat-value modifiers)
const overallFreshnessClass = computed(() => {
  const freshness = overallFreshness.value
  if (freshness >= 80) return 'stat-value--success'
  if (freshness >= 40) return 'stat-value--warning'
  return 'stat-value--error'
})

// Bar class helper
function getBarClass(servings: number, capacity: number): string {
  const ratio = servings / capacity
  if (ratio >= 0.75) return 'hay-rack-item__bar--full'
  if (ratio >= 0.25) return 'hay-rack-item__bar--medium'
  return 'hay-rack-item__bar--low'
}

// Handlers
function handleAddServing(rackId: string) {
  const hayItemId = getFirstHayItemId()
  if (!hayItemId) return

  const success = habitatConditions.addHayToRack(rackId, hayItemId)
  if (success) {
    loggingStore.addPlayerAction('Added hay to hay rack', '🌾')
    showCareReaction()
  }
}

function handleClearRack(rackId: string) {
  habitatConditions.clearHayRack(rackId)
  loggingStore.addPlayerAction('Cleared hay rack', '🌾')
}

function handleReplaceAll() {
  const hayItemId = getFirstHayItemId()
  if (!hayItemId) return

  // Clear all racks first
  for (const rack of hayRacks.value) {
    if (rack.servings > 0) {
      habitatConditions.clearHayRack(rack.id)
    }
  }

  // Fill all racks with fresh hay
  const rackIds = hayRacks.value.map(rack => rack.id)
  const result = habitatConditions.fillAllHayRacks(rackIds)

  if (result.totalAdded > 0) {
    loggingStore.addPlayerAction(
      `Replaced hay in ${result.racksFilled} rack${result.racksFilled > 1 ? 's' : ''} with ${result.totalAdded} fresh serving${result.totalAdded > 1 ? 's' : ''}`,
      '🌾'
    )
    showCareReaction()
  }
}
</script>

<style>
/* Replace button centering */
.hay-management-dialog__replace-btn {
  align-self: center;
}

/* Hay Rack List */
.hay-rack-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  max-block-size: 300px;
  overflow-y: auto;
}

.hay-rack-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-light);
}

.hay-rack-item__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hay-rack-item__name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.hay-rack-item__freshness {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.hay-rack-item__freshness--good {
  color: var(--color-accent-green-600);
}

.hay-rack-item__freshness--warning {
  color: var(--color-accent-yellow-600);
}

.hay-rack-item__freshness--critical {
  color: var(--color-error);
}

/* Progress Bar */
.hay-rack-item__bar-container {
  block-size: 8px;
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.hay-rack-item__bar {
  block-size: 100%;
  border-radius: var(--radius-full);
  transition: width var(--transition-normal);
}

.hay-rack-item__bar--full {
  background-color: var(--color-accent-green-500);
}

.hay-rack-item__bar--medium {
  background-color: var(--color-accent-yellow-500);
}

.hay-rack-item__bar--low {
  background-color: var(--color-error);
}

.hay-rack-item__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hay-rack-item__count {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.hay-rack-item__actions {
  display: flex;
  gap: var(--space-1);
}

.hay-rack-item__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  inline-size: 24px;
  block-size: 24px;
  padding: 0;
  border: none;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.hay-rack-item__btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.hay-rack-item__btn--add {
  background-color: var(--color-accent-green-100);
  color: var(--color-accent-green-700);
}

.hay-rack-item__btn--add:hover:not(:disabled) {
  background-color: var(--color-accent-green-200);
}

.hay-rack-item__btn--clear {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-muted);
}

.hay-rack-item__btn--clear:hover {
  background-color: var(--color-error-light);
  color: var(--color-error);
}
</style>
