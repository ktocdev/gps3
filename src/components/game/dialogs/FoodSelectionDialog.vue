<template>
  <BaseDialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    size="md"
  >
    <div class="food-selection-dialog">
      <div class="food-selection-dialog__header">
        <h2 class="food-selection-dialog__title">Select Food to Hand-Feed</h2>
        <p class="food-selection-dialog__subtitle">Choose a food item from your inventory to feed {{ guineaPigName }}</p>
      </div>

      <div class="food-selection-dialog__content">
        <!-- Food Categories -->
        <div class="food-categories">
          <button
            v-for="category in foodCategories"
            :key="category.id"
            class="food-category-btn"
            :class="{ 'food-category-btn--active': selectedCategory === category.id }"
            @click="selectedCategory = category.id"
          >
            {{ category.emoji }} {{ category.label }}
          </button>
        </div>

        <!-- Food Items Grid -->
        <div class="food-items">
          <div
            v-for="item in filteredFoodItems"
            :key="item.id"
            class="food-item"
            :class="{
              'food-item--disabled': item.quantity === 0,
              'food-item--selected': selectedFoodId === item.id
            }"
            @click="selectFood(item)"
          >
            <div class="food-item__emoji">{{ item.emoji }}</div>
            <div class="food-item__info">
              <div class="food-item__name">{{ item.name }}</div>
              <div class="food-item__quantity">{{ item.quantity }} available</div>
            </div>
          </div>

          <div v-if="filteredFoodItems.length === 0" class="food-items__empty">
            <p>No {{ selectedCategoryLabel }} in inventory</p>
            <p class="food-items__empty-hint">Purchase food from the store to hand-feed your guinea pig</p>
          </div>
        </div>
      </div>

      <div class="food-selection-dialog__footer">
        <Button
          @click="$emit('update:modelValue', false)"
          variant="tertiary"
          size="md"
        >
          Cancel
        </Button>
        <Button
          @click="confirmFeed"
          variant="primary"
          size="md"
          :disabled="!selectedFoodId"
        >
          Feed
        </Button>
      </div>
    </div>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import BaseDialog from '../../basic/dialogs/BaseDialog.vue'
import Button from '../../basic/Button.vue'
import { useInventoryStore } from '../../../stores/inventoryStore'
import { useSuppliesStore } from '../../../stores/suppliesStore'

interface Props {
  modelValue: boolean
  guineaPigName: string
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'select-food', foodId: string): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const inventoryStore = useInventoryStore()
const suppliesStore = useSuppliesStore()

const selectedCategory = ref<string>('vegetables')
const selectedFoodId = ref<string | null>(null)

// Reset food selection when category changes
watch(selectedCategory, () => {
  selectedFoodId.value = null
})

const foodCategories = [
  { id: 'vegetables', label: 'Vegetables', emoji: '🥕' },
  { id: 'greens', label: 'Greens', emoji: '🥬' },
  { id: 'fruits', label: 'Fruits', emoji: '🍓' },
  { id: 'herbs', label: 'Herbs', emoji: '🌿' },
  { id: 'pellets', label: 'Pellets', emoji: '🟤' },
  { id: 'treats', label: 'Treats', emoji: '🍪' }
]

const selectedCategoryLabel = computed(() => {
  return foodCategories.find(c => c.id === selectedCategory.value)?.label || 'food'
})

const filteredFoodItems = computed(() => {
  // Get all food items from supplies for the selected category
  const categoryItems = suppliesStore.itemsBySubCategory(selectedCategory.value)

  // Filter and map efficiently - check inventory first before creating objects
  const items: Array<{ id: string, name: string, emoji: string, quantity: number }> = []

  for (const item of categoryItems) {
    const inventoryItem = inventoryStore.consumables.find(inv => inv.itemId === item.id)
    const quantity = inventoryItem?.quantity || 0

    // Only create object if player has this item
    if (quantity > 0) {
      items.push({
        id: item.id,
        name: item.name,
        emoji: item.emoji || '🍽️', // Fallback emoji
        quantity
      })
    }
  }

  return items
})

function selectFood(item: { id: string, quantity: number }) {
  if (item.quantity === 0) return
  selectedFoodId.value = item.id
}

function confirmFeed() {
  if (!selectedFoodId.value) return

  emit('select-food', selectedFoodId.value)
  emit('update:modelValue', false)

  // Reset selection for next time
  selectedFoodId.value = null
}
</script>

<style>
.food-selection-dialog {
  display: flex;
  flex-direction: column;
  min-block-size: 400px;
}

.food-selection-dialog__header {
  padding: var(--space-6);
  border-block-end: 1px solid var(--color-border);
}

.food-selection-dialog__title {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.food-selection-dialog__subtitle {
  margin-block-start: var(--space-2);
  margin-block-end: 0;
  margin-inline: 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.food-selection-dialog__content {
  padding: var(--space-6);
  flex: 1;
  overflow-y: auto;
}

.food-categories {
  display: flex;
  gap: var(--space-2);
  margin-block-end: var(--space-6);
  flex-wrap: wrap;
}

.food-category-btn {
  padding: var(--space-2) var(--space-4);
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.food-category-btn:hover {
  background-color: var(--color-bg-tertiary);
  border-color: var(--color-primary);
}

.food-category-btn--active {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-bg-primary);
}

.food-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--space-3);
}

.food-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  background-color: var(--color-bg-secondary);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.food-item:hover {
  border-color: var(--color-primary);
  background-color: var(--color-bg-tertiary);
}

.food-item--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.food-item--disabled:hover {
  border-color: var(--color-border);
  background-color: var(--color-bg-secondary);
}

.food-item--selected {
  border-color: var(--color-primary);
  background-color: var(--color-primary-bg);
}

.food-item--selected:hover {
  border-color: var(--color-primary-hover);
}

.food-item__emoji {
  font-size: var(--font-size-3xl);
  line-height: 1;
}

.food-item__info {
  flex: 1;
  min-inline-size: 0;
}

.food-item__name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.food-item__quantity {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin-block-start: var(--space-1);
}

.food-items__empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: var(--space-8) var(--space-4);
  color: var(--color-text-muted);
}

.food-items__empty p {
  margin-block: 0;
  margin-inline: 0;
}

.food-items__empty-hint {
  font-size: var(--font-size-sm);
  margin-block-start: var(--space-2);
}

.food-selection-dialog__footer {
  padding: var(--space-4) var(--space-6);
  border-block-start: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
}

/* Mobile responsive */
@media (max-width: 640px) {
  .food-items {
    grid-template-columns: 1fr;
  }

  .food-categories {
    justify-content: center;
  }
}
</style>
