<template>
  <BaseDialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" size="sm">
    <div class="game-dialog">
      <div class="game-dialog__header">
        <h2 class="game-dialog__title">Clean Habitat</h2>
      </div>

      <div class="game-dialog__content">
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">Habitat Dirtiness:</span>
            <span class="stat-value">{{ dirtiness.toFixed(2) }}%</span>
          </div>

          <div class="stat-item">
            <span class="stat-label">Bedding Needed:</span>
            <span class="stat-value">{{ beddingNeeded.toFixed(1) }} bags</span>
          </div>
        </div>

        <div class="bedding-selection">
          <label class="bedding-selection__label">Bedding Type:</label>
          <Select
            v-model="selectedBeddingType"
            :options="beddingOptions"
            placeholder="Select bedding type"
            size="sm"
          />
        </div>

        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">Selected Bedding Available:</span>
            <span class="stat-value" :class="{ 'stat-value--warning': selectedBeddingAvailable < beddingNeeded }">
              {{ selectedBeddingAvailable.toFixed(2) }} bags
            </span>
          </div>
        </div>

        <BlockMessage v-if="selectedBeddingAvailable === 0" variant="warning">
          ⚠️ No {{ selectedBeddingLabel }} bedding available! Select a different type or purchase bedding from the shop.
        </BlockMessage>

        <BlockMessage v-else-if="selectedBeddingAvailable < beddingNeeded" variant="warning">
          ⚠️ Not enough bedding for full clean. Will use all {{ selectedBeddingAvailable.toFixed(2) }} bags for partial clean.
        </BlockMessage>

        <BlockMessage v-else variant="success">
          ✅ Enough bedding available for full clean!
        </BlockMessage>
      </div>

      <div class="game-dialog__footer">
        <Button @click="$emit('update:modelValue', false)" variant="tertiary" size="md">
          Cancel
        </Button>
        <Button
          @click="handleConfirm"
          variant="primary"
          size="md"
          :disabled="selectedBeddingAvailable === 0"
        >
          {{ selectedBeddingAvailable >= beddingNeeded ? 'Clean Habitat' : 'Partial Clean' }}
        </Button>
      </div>
    </div>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import BaseDialog from '../../basic/dialogs/BaseDialog.vue'
import Button from '../../basic/Button.vue'
import BlockMessage from '../../basic/BlockMessage.vue'
import Select from '../../basic/Select.vue'
import { useInventoryStore } from '../../../stores/inventoryStore'

interface Props {
  modelValue: boolean
  dirtiness: number
  beddingNeeded: number
  beddingAvailable: number
}

defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm': [beddingType: string]
}>()

const inventoryStore = useInventoryStore()

// Bedding selection
const selectedBeddingType = ref<string>('average')

// Helper function to calculate total amount remaining across all instances
function getBeddingAmountRemaining(beddingId: string): number {
  const inventoryItem = inventoryStore.itemsById.get(beddingId)
  let totalAmount = 0

  if (inventoryItem) {
    for (const instance of inventoryItem.instances) {
      totalAmount += instance.amountRemaining ?? 1 // Default to 1 (full bag) if not set
    }
  }

  return totalAmount
}

const beddingOptions = computed(() => [
  {
    value: 'cheap',
    label: `Cheap (${getBeddingAmountRemaining('bedding_cheap').toFixed(2)} bags)`,
    disabled: !inventoryStore.hasItem('bedding_cheap')
  },
  {
    value: 'average',
    label: `Average (${getBeddingAmountRemaining('bedding_average').toFixed(2)} bags)`,
    disabled: !inventoryStore.hasItem('bedding_average')
  },
  {
    value: 'premium',
    label: `Premium (${getBeddingAmountRemaining('bedding_premium').toFixed(2)} bags)`,
    disabled: !inventoryStore.hasItem('bedding_premium')
  },
  {
    value: 'color_pink',
    label: `🌸 Pink (${getBeddingAmountRemaining('bedding_color_pink').toFixed(2)} bags)`,
    disabled: !inventoryStore.hasItem('bedding_color_pink')
  },
  {
    value: 'color_blue',
    label: `💙 Blue (${getBeddingAmountRemaining('bedding_color_blue').toFixed(2)} bags)`,
    disabled: !inventoryStore.hasItem('bedding_color_blue')
  },
  {
    value: 'color_purple',
    label: `💜 Purple (${getBeddingAmountRemaining('bedding_color_purple').toFixed(2)} bags)`,
    disabled: !inventoryStore.hasItem('bedding_color_purple')
  },
  {
    value: 'color_green',
    label: `💚 Green (${getBeddingAmountRemaining('bedding_color_green').toFixed(2)} bags)`,
    disabled: !inventoryStore.hasItem('bedding_color_green')
  }
])

const selectedBeddingAvailable = computed(() => {
  const itemId = `bedding_${selectedBeddingType.value}`
  return getBeddingAmountRemaining(itemId)
})

const selectedBeddingLabel = computed(() => {
  return selectedBeddingType.value.charAt(0).toUpperCase() + selectedBeddingType.value.slice(1)
})

function handleConfirm() {
  emit('confirm', selectedBeddingType.value)
  emit('update:modelValue', false)
}
</script>

<style>
/* Bedding selection specific styles */
.bedding-selection {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.bedding-selection__label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}
</style>
