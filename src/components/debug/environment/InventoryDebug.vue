<template>
  <div class="inventory-view">
    <!-- Header Row: Inventory Panel + Currency Controls -->
    <div class="inventory-view__top-row">
      <!-- Player Inventory Panel (66% width) -->
      <DebugPanel title="🎒 My Inventory" class="inventory-view__inventory-panel">
        <template #header-extra>
          <div class="inventory-view__header-tools">
            <Badge variant="secondary" size="md">{{ inventoryStore.totalItemCount }} Items</Badge>
            <Badge variant="info" size="md">{{ inventoryStore.allItems.length }} Unique</Badge>
            <ItemViewToggle v-model="viewMode" />
          </div>
        </template>

        <div v-if="inventoryStore.allItems.length === 0" class="inventory-view__empty">
          <p>No items in inventory yet. Visit the store to purchase items!</p>
        </div>

        <template v-else>
          <DebugSection title="🥕 Consumables">
            <div v-if="consumablesWithDetails.length === 0" class="inventory-view__empty-section">
              <p>No consumables yet</p>
            </div>

            <!-- Card View -->
            <ItemGridView v-else-if="viewMode === 'card'">
              <div
                v-for="item in consumablesWithDetails"
                :key="item.itemId"
                class="inventory-item-card"
              >
                <div class="inventory-item-card__header">
                  <span v-if="item.item?.emoji" class="inventory-item-card__emoji">{{ item.item.emoji }}</span>
                  <div class="inventory-item-card__name-section">
                    <span class="inventory-item-card__name">{{ item.item?.name }}</span>
                    <span class="inventory-item-card__category">{{ item.item?.category }}</span>
                  </div>
                  <div class="inventory-item-card__quantity">×{{ item.quantity }}</div>
                </div>

                <div class="inventory-item-card__badges">
                  <Badge v-if="inventoryStore.getOpenedCount(item.itemId) > 0" variant="warning" size="sm">
                    Opened: {{ inventoryStore.getOpenedCount(item.itemId) }}
                  </Badge>
                  <Badge v-if="inventoryStore.getUnopenedCount(item.itemId) > 0" variant="success" size="sm">
                    Unopened: {{ inventoryStore.getUnopenedCount(item.itemId) }}
                  </Badge>
                  <Badge v-if="inventoryStore.getReturnableQuantity(item.itemId) > 0" variant="info" size="sm">
                    Returnable: {{ inventoryStore.getReturnableQuantity(item.itemId) }}
                  </Badge>
                </div>

              </div>
            </ItemGridView>

            <!-- List View -->
            <ItemListView
              v-else
              :items="consumablesWithDetails.map(item => ({
                id: item.itemId,
                emoji: item.item?.emoji || '',
                name: item.item?.name || 'Unknown',
                description: item.item?.category || '',
                basePrice: 0,
                owned: item.quantity,
                returnable: inventoryStore.getReturnableQuantity(item.itemId)
              }))"
              :show-price="false"
              :show-owned="true"
              :show-returnable="true"
              :show-status="true"
              :show-actions="false"
            >
              <template #status="{ item }">
                <Badge v-if="inventoryStore.getOpenedCount(item.id) > 0" variant="warning" size="sm">
                  Opened: {{ inventoryStore.getOpenedCount(item.id) }}
                </Badge>
                <Badge v-if="inventoryStore.getUnopenedCount(item.id) > 0" variant="success" size="sm">
                  Unopened: {{ inventoryStore.getUnopenedCount(item.id) }}
                </Badge>
              </template>
            </ItemListView>
          </DebugSection>

          <DebugSection title="🏠 Habitat Items">
            <div v-if="habitatItemsWithDetails.length === 0" class="inventory-view__empty-section">
              <p>No habitat items yet</p>
            </div>

            <!-- Card View -->
            <ItemGridView v-else-if="viewMode === 'card'">
              <div
                v-for="item in habitatItemsWithDetails"
                :key="item.itemId"
                class="inventory-item-card"
              >
                <div class="inventory-item-card__header">
                  <span v-if="item.item?.emoji" class="inventory-item-card__emoji">{{ item.item.emoji }}</span>
                  <div class="inventory-item-card__name-section">
                    <span class="inventory-item-card__name">{{ item.item?.name }}</span>
                    <span class="inventory-item-card__category">{{ item.item?.subCategory }}</span>
                  </div>
                  <div class="inventory-item-card__quantity">×{{ item.quantity }}</div>
                </div>

                <div class="inventory-item-card__badges">
                  <Badge v-if="inventoryStore.getPlacedCount(item.itemId) > 0" variant="info" size="sm">
                    Placed: {{ inventoryStore.getPlacedCount(item.itemId) }}
                  </Badge>
                  <Badge v-if="inventoryStore.getUnplacedCount(item.itemId) > 0" variant="secondary" size="sm">
                    Unplaced: {{ inventoryStore.getUnplacedCount(item.itemId) }}
                  </Badge>
                  <Badge v-if="inventoryStore.getReturnableQuantity(item.itemId) > 0" variant="success" size="sm">
                    Returnable: {{ inventoryStore.getReturnableQuantity(item.itemId) }}
                  </Badge>
                </div>

              </div>
            </ItemGridView>

            <!-- List View -->
            <ItemListView
              v-else
              :items="habitatItemsWithDetails.map(item => ({
                id: item.itemId,
                emoji: item.item?.emoji || '',
                name: item.item?.name || 'Unknown',
                description: item.item?.subCategory || '',
                basePrice: 0,
                owned: item.quantity,
                returnable: inventoryStore.getReturnableQuantity(item.itemId)
              }))"
              :show-price="false"
              :show-owned="true"
              :show-returnable="true"
              :show-status="true"
              :show-actions="false"
            >
              <template #status="{ item }">
                <Badge v-if="inventoryStore.getPlacedCount(item.id) > 0" variant="info" size="sm">
                  Placed: {{ inventoryStore.getPlacedCount(item.id) }}
                </Badge>
                <Badge v-if="inventoryStore.getUnplacedCount(item.id) > 0" variant="secondary" size="sm">
                  Unplaced: {{ inventoryStore.getUnplacedCount(item.id) }}
                </Badge>
              </template>
            </ItemListView>
          </DebugSection>
        </template>
      </DebugPanel>

      <!-- Currency Controls Panel (33% width) -->
      <DebugPanel
        title="🪙 Currency Controls"
        anchor="player wallet"
        accent="#facc15"
        class="inventory-view__currency-panel"
      >
        <DebugSection>
          <div class="stats-grid">
            <DebugStatRow label="Balance" :value="playerProgression.formattedCurrency" />
            <DebugStatRow label="Earned" :value="playerProgression.formattedTotalEarned" />
          </div>
        </DebugSection>

        <DebugSection title="Adjust">
          <div class="form-field inventory-view__amount-field">
            <label class="form-field__label" for="currency-amount">Amount</label>
            <input
              id="currency-amount"
              type="number"
              v-model.number="currencyAmount"
              class="form-field__input"
              placeholder="Enter amount"
              min="1"
              max="10000"
              step="1"
            />
          </div>

          <div class="btn-row">
            <Button
              @click="addCurrency"
              variant="primary"
              size="sm"
              :disabled="!isValidAmount"
            >
              Add
            </Button>
            <Button
              @click="deductCurrency"
              variant="danger"
              size="sm"
              :disabled="!isValidAmount"
            >
              Deduct
            </Button>
          </div>
        </DebugSection>

        <DebugSection title="Quick">
          <div class="btn-row">
            <Button
              @click="addQuickAmount(100)"
              variant="secondary"
              size="sm"
            >
              +$100
            </Button>
            <Button
              @click="addQuickAmount(500)"
              variant="secondary"
              size="sm"
            >
              +$500
            </Button>
            <Button
              @click="addQuickAmount(1000)"
              variant="secondary"
              size="sm"
            >
              +$1000
            </Button>
            <Button
              @click="resetCurrency"
              variant="danger"
              size="sm"
            >
              Reset
            </Button>
          </div>
        </DebugSection>
      </DebugPanel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePlayerProgression } from '../../../stores/playerProgression'
import { useInventoryStore } from '../../../stores/inventoryStore'
import { useSuppliesStore } from '../../../stores/suppliesStore'
import Button from '../../basic/Button.vue'
import Badge from '../../basic/Badge.vue'
import DebugPanel from '../ui/DebugPanel.vue'
import DebugSection from '../ui/DebugSection.vue'
import DebugStatRow from '../ui/DebugStatRow.vue'
import ItemViewToggle from '../../game/shop/ItemViewToggle.vue'
import ItemListView from '../../game/shop/ItemListView.vue'
import ItemGridView from '../../game/shop/ItemGridView.vue'

const playerProgression = usePlayerProgression()
const inventoryStore = useInventoryStore()
const suppliesStore = useSuppliesStore()

// View mode toggle
const viewMode = ref<'card' | 'list'>('list')

// Initialize supplies catalog on mount to fix empty inventory on first load
onMounted(() => {
  if (!suppliesStore.catalogLoaded) {
    suppliesStore.initializeCatalog()
  }
})

// Get inventory items with details
const consumablesWithDetails = computed(() => {
  return inventoryStore.consumables.map((invItem) => ({
    ...invItem,
    item: suppliesStore.getItemById(invItem.itemId)
  }))
})

const habitatItemsWithDetails = computed(() => {
  return inventoryStore.habitatItems.map((invItem) => ({
    ...invItem,
    item: suppliesStore.getItemById(invItem.itemId)
  }))
})

const currencyAmount = ref<number>(100)

const isValidAmount = computed(() => {
  return currencyAmount.value > 0 && Number.isInteger(currencyAmount.value)
})

const addCurrency = () => {
  if (isValidAmount.value) {
    playerProgression.updateCurrency(currencyAmount.value)
  }
}

const deductCurrency = () => {
  if (isValidAmount.value) {
    playerProgression.deductCurrency(currencyAmount.value, 'debug_deduction')
  }
}

const addQuickAmount = (amount: number) => {
  playerProgression.updateCurrency(amount)
}

const resetCurrency = () => {
  const currentBalance = playerProgression.currency
  const resetAmount = 1000 - currentBalance
  playerProgression.updateCurrency(resetAmount)
}

</script>

<style>
.inventory-view {
  container-type: inline-size;
  container-name: inventory-view;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.inventory-view__top-row {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  align-items: stretch;
}

@media (min-width: 768px) {
  .inventory-view__top-row {
    flex-direction: row;
  }

  .inventory-view__inventory-panel {
    flex: 0 0 66%;
  }

  .inventory-view__currency-panel {
    flex: 0 0 calc(34% - var(--space-4));
  }
}

.inventory-view__header-tools {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.inventory-view__empty {
  text-align: center;
  padding: var(--space-6);
  color: var(--color-text-muted);
}

.inventory-view__empty-section {
  padding: var(--space-4);
  text-align: center;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.inventory-view__amount-field {
  margin-block-end: var(--space-3);
}

/* Inventory Item Card Styles - Different from Supply Item Card */
.inventory-item-card {
  padding: var(--space-3);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  transition: all var(--transition-fast);
}

.inventory-item-card:hover {
  border-color: var(--color-pink-500);
  box-shadow: var(--shadow-sm);
}

.inventory-item-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-3);
}

.inventory-item-card__emoji {
  font-size: var(--font-size-2xl);
  line-height: 1;
  flex-shrink: 0;
}

.inventory-item-card__name-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  flex: 1;
}

.inventory-item-card__name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.inventory-item-card__category {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.inventory-item-card__quantity {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  font-family: var(--font-family-stats);
  color: var(--color-text-primary);
  flex-shrink: 0;
}

.inventory-item-card__badges {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}
</style>
