<template>
  <div class="supply-item-card">
    <div class="supply-item-card__header justify-between items-center">
      <div class="supply-item-card__name-badges">
        <span class="supply-item-card__name">{{ item.name }}</span>
        <Badge v-if="item.isEssential" variant="warning" size="sm">Essential</Badge>
        <Badge v-if="item.availability === 'seasonal'" variant="seasonal" size="sm">
          Seasonal
        </Badge>
        <Badge v-else-if="item.availability === 'limited'" variant="info" size="sm">
          Limited
        </Badge>
      </div>
      <div class="supply-item-card__price-section">
        <span v-if="item.emoji" class="supply-item-card__emoji">{{ item.emoji }}</span>
        <div class="supply-item-card__price">${{ item.basePrice.toFixed(2) }}</div>
      </div>
    </div>

    <div class="supply-item-card__description">{{ item.description }}</div>

    <div v-if="owned > 0" class="supply-item-card__owned">
      <Badge variant="secondary" size="sm">Owned: {{ owned }}</Badge>
      <Badge v-if="returnable > 0" variant="success" size="sm">
        Returnable: {{ returnable }}
      </Badge>
      <Badge v-if="owned > 0 && returnable === 0" variant="warning" size="sm">
        {{ nonReturnableReason }}
      </Badge>
    </div>

    <div class="supply-item-card__purchase">
      <div class="supply-item-card__quantity">
        <label :for="`qty-${item.id}`" class="supply-item-card__quantity-label">Qty:</label>
        <input
          :id="`qty-${item.id}`"
          type="number"
          :value="quantity"
          @input="handleQuantityChange"
          min="1"
          max="99"
          class="supply-item-card__quantity-input"
        />
      </div>

      <Button
        :variant="canAfford ? 'primary' : 'secondary'"
        size="sm"
        :disabled="!canAfford"
        @click="$emit('purchase', item.id)"
      >
        Buy ${{ totalCost.toFixed(2) }}
      </Button>

      <Button
        v-if="returnable > 0"
        variant="danger"
        size="sm"
        :disabled="!canSellBack"
        @click="$emit('sellback', item.id)"
      >
        Sell ${{ sellBackTotal.toFixed(2) }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SuppliesItem } from '../../../types/supplies'
import Button from '../../basic/Button.vue'
import Badge from '../../basic/Badge.vue'

interface Props {
  item: SuppliesItem
  quantity: number
  currentBalance: number
  owned?: number
  returnable?: number
  isOpened?: boolean
  placedCount?: number
}

interface Emits {
  (e: 'purchase', itemId: string): void
  (e: 'sellback', itemId: string): void
  (e: 'update:quantity', itemId: string, quantity: number): void
}

const props = withDefaults(defineProps<Props>(), {
  owned: 0,
  returnable: 0,
  isOpened: false,
  placedCount: 0
})

const emit = defineEmits<Emits>()

const totalCost = computed(() => {
  return props.item.basePrice * props.quantity
})

const canAfford = computed(() => {
  return props.currentBalance >= totalCost.value
})

const sellBackTotal = computed(() => {
  // 100% refund
  return props.item.basePrice * props.quantity
})

const canSellBack = computed(() => {
  return props.returnable >= props.quantity
})

const nonReturnableReason = computed(() => {
  if (props.isOpened && (props.item.category === 'hay' || props.item.category === 'bedding')) {
    return 'Opened'
  }
  if (props.placedCount > 0) {
    return 'Placed'
  }
  return 'Non-returnable'
})

const handleQuantityChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = parseInt(target.value) || 1
  const clamped = Math.max(1, Math.min(99, value))
  emit('update:quantity', props.item.id, clamped)
}
</script>

<style>
.supply-item-card {
  padding: var(--space-3);
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.supply-item-card__header {
  display: flex;
  margin-block-end: var(--space-2);
}

.supply-item-card__name-badges {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.supply-item-card__name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.supply-item-card__price-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  flex-shrink: 0;
}

.supply-item-card__emoji {
  font-size: var(--font-size-3xl);
  line-height: 1;
}

.supply-item-card__price {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  font-family: var(--font-family-heading);
  color: var(--color-primary);
}

.supply-item-card__description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
}

.supply-item-card__owned {
  margin-block-start: var(--space-1);
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.supply-item-card__purchase {
  display: flex;
  gap: var(--space-2);
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  margin-block-start: var(--space-2);
  padding-block-start: var(--space-2);
  border-block-start: 1px solid var(--color-border-light);
}

.supply-item-card__quantity {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}

.supply-item-card__quantity-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.supply-item-card__quantity-input {
  inline-size: 4rem;
  padding: var(--space-1) var(--space-2);
  font-size: var(--font-size-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
}

.supply-item-card__quantity-input:focus {
  outline: none;
  border-color: var(--color-primary);
}
</style>
