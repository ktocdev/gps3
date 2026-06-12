<template>
  <div class="supplies-store-view">
    <div class="panel panel--compact">
      <div class="supplies-store-view__header">
        <h2 class="panel__heading">Supplies Store</h2>
        <div class="supplies-store-view__balance">
          <span class="text-label">Balance:</span>
          <span class="supplies-store-view__balance-amount">{{ playerProgression.formattedCurrency }}</span>
        </div>
      </div>

      <div class="panel__section">
        <div v-if="purchaseMessage" :class="['supplies-store-view__message', `supplies-store-view__message--${purchaseMessage.type}`]">
          {{ purchaseMessage.text }}
        </div>
      </div>

      <!-- Department Navigation & View Toggle -->
      <div class="panel__section mb-8">
        <div class="supplies-store-view__controls">
          <div class="supplies-store-view__controls-left">
            <h3 class="panel__subheading">Departments</h3>
            <div class="supplies-store-view__departments">
              <Button
                v-for="dept in departments"
                :key="dept.id"
                :variant="activeDepartment === dept.id ? 'primary' : 'secondary'"
                size="sm"
                @click="activeDepartment = dept.id"
              >
                {{ dept.icon }} {{ dept.label }}
              </Button>
            </div>
          </div>
          <div class="supplies-store-view__controls-right">
            <ItemViewToggle v-model="viewMode" />
          </div>
        </div>
      </div>

      <!-- Food Items - Organized by Subcategory -->
      <div v-if="activeDepartment === 'food'" class="panel__section">
        <h3 class="panel__subheading sr-only">Food Items</h3>
        <SubTabContainer :tabs="foodSubTabs" v-model="activeFoodSubTab">
          <template #greens>
            <!-- Card View -->
            <ItemGridView v-if="viewMode === 'card'">
              <SupplyItemCard
                v-for="item in suppliesStore.greens"
                :key="item.id"
                :item="item"
                :quantity="getPurchaseQuantity(item.id)"
                :current-balance="playerProgression.currency"
                :owned="inventoryStore.getItemQuantity(item.id)"
                :returnable="getItemDetails(item.id).returnable"
                :is-opened="getItemDetails(item.id).isOpened"
                :placed-count="getItemDetails(item.id).placedCount"
                @purchase="handlePurchase"
                @sellback="handleSellBack"
                @update:quantity="setPurchaseQuantity"
              />
            </ItemGridView>

            <!-- List View -->
            <ItemListView
              v-else
              :items="suppliesStore.greens.map(item => ({
                ...item,
                owned: inventoryStore.getItemQuantity(item.id),
                returnable: getItemDetails(item.id).returnable
              }))"
              :show-owned="true"
              @purchase="handlePurchase"
              @sellback="handleSellBack"
            >
              <template #actions="{ item }">
                <Button
                  :variant="item.basePrice * getPurchaseQuantity(item.id) <= playerProgression.currency ? 'primary' : 'secondary'"
                  size="sm"
                  :disabled="item.basePrice * getPurchaseQuantity(item.id) > playerProgression.currency"
                  @click="handlePurchase(item.id)"
                >
                  Buy ${{ (item.basePrice * getPurchaseQuantity(item.id)).toFixed(2) }}
                </Button>
                <Button
                  v-if="item.returnable && item.returnable > 0"
                  variant="danger"
                  size="sm"
                  @click="handleSellBack(item.id)"
                >
                  Sell
                </Button>
              </template>
            </ItemListView>
          </template>

          <template #herbs>
            <!-- Card View -->
            <ItemGridView v-if="viewMode === 'card'">
              <SupplyItemCard
                v-for="item in suppliesStore.herbs"
                :key="item.id"
                :item="item"
                :quantity="getPurchaseQuantity(item.id)"
                :current-balance="playerProgression.currency"
                :owned="inventoryStore.getItemQuantity(item.id)"
                :returnable="getItemDetails(item.id).returnable"
                :is-opened="getItemDetails(item.id).isOpened"
                :placed-count="getItemDetails(item.id).placedCount"
                @purchase="handlePurchase"
                @sellback="handleSellBack"
                @update:quantity="setPurchaseQuantity"
              />
            </ItemGridView>

            <!-- List View -->
            <ItemListView
              v-else
              :items="suppliesStore.herbs.map(item => ({
                ...item,
                owned: inventoryStore.getItemQuantity(item.id),
                returnable: getItemDetails(item.id).returnable
              }))"
              :show-owned="true"
              
            >
              <template #actions="{ item }">
                <Button
                  :variant="item.basePrice * getPurchaseQuantity(item.id) <= playerProgression.currency ? 'primary' : 'secondary'"
                  size="sm"
                  :disabled="item.basePrice * getPurchaseQuantity(item.id) > playerProgression.currency"
                  @click="handlePurchase(item.id)"
                >
                  Buy ${{ (item.basePrice * getPurchaseQuantity(item.id)).toFixed(2) }}
                </Button>
                <Button
                  v-if="item.returnable && item.returnable > 0"
                  variant="danger"
                  size="sm"
                  @click="handleSellBack(item.id)"
                >
                  Sell
                </Button>
              </template>
            </ItemListView>
          </template>

          <template #vegetables>
            <!-- Card View -->
            <ItemGridView v-if="viewMode === 'card'">
              <SupplyItemCard
                v-for="item in suppliesStore.vegetables"
                :key="item.id"
                :item="item"
                :quantity="getPurchaseQuantity(item.id)"
                :current-balance="playerProgression.currency"
                :owned="inventoryStore.getItemQuantity(item.id)"
                :returnable="getItemDetails(item.id).returnable"
                :is-opened="getItemDetails(item.id).isOpened"
                :placed-count="getItemDetails(item.id).placedCount"
                @purchase="handlePurchase"
                @sellback="handleSellBack"
                @update:quantity="setPurchaseQuantity"
              />
            </ItemGridView>

            <!-- List View -->
            <ItemListView
              v-else
              :items="suppliesStore.vegetables.map(item => ({
                ...item,
                owned: inventoryStore.getItemQuantity(item.id),
                returnable: getItemDetails(item.id).returnable
              }))"
              :show-owned="true"
              
            >
              <template #actions="{ item }">
                <Button
                  :variant="item.basePrice * getPurchaseQuantity(item.id) <= playerProgression.currency ? 'primary' : 'secondary'"
                  size="sm"
                  :disabled="item.basePrice * getPurchaseQuantity(item.id) > playerProgression.currency"
                  @click="handlePurchase(item.id)"
                >
                  Buy ${{ (item.basePrice * getPurchaseQuantity(item.id)).toFixed(2) }}
                </Button>
                <Button
                  v-if="item.returnable && item.returnable > 0"
                  variant="danger"
                  size="sm"
                  @click="handleSellBack(item.id)"
                >
                  Sell
                </Button>
              </template>
            </ItemListView>
          </template>

          <template #fruits>
            <!-- Card View -->
            <ItemGridView v-if="viewMode === 'card'">
              <SupplyItemCard
                v-for="item in suppliesStore.fruits"
                :key="item.id"
                :item="item"
                :quantity="getPurchaseQuantity(item.id)"
                :current-balance="playerProgression.currency"
                :owned="inventoryStore.getItemQuantity(item.id)"
                :returnable="getItemDetails(item.id).returnable"
                :is-opened="getItemDetails(item.id).isOpened"
                :placed-count="getItemDetails(item.id).placedCount"
                @purchase="handlePurchase"
                @sellback="handleSellBack"
                @update:quantity="setPurchaseQuantity"
              />
            </ItemGridView>

            <!-- List View -->
            <ItemListView
              v-else
              :items="suppliesStore.fruits.map(item => ({
                ...item,
                owned: inventoryStore.getItemQuantity(item.id),
                returnable: getItemDetails(item.id).returnable
              }))"
              :show-owned="true"
              
            >
              <template #actions="{ item }">
                <Button
                  :variant="item.basePrice * getPurchaseQuantity(item.id) <= playerProgression.currency ? 'primary' : 'secondary'"
                  size="sm"
                  :disabled="item.basePrice * getPurchaseQuantity(item.id) > playerProgression.currency"
                  @click="handlePurchase(item.id)"
                >
                  Buy ${{ (item.basePrice * getPurchaseQuantity(item.id)).toFixed(2) }}
                </Button>
                <Button
                  v-if="item.returnable && item.returnable > 0"
                  variant="danger"
                  size="sm"
                  @click="handleSellBack(item.id)"
                >
                  Sell
                </Button>
              </template>
            </ItemListView>
          </template>

          <template #pellets>
            <!-- Card View -->
            <ItemGridView v-if="viewMode === 'card'">
              <SupplyItemCard
                v-for="item in suppliesStore.pellets"
                :key="item.id"
                :item="item"
                :quantity="getPurchaseQuantity(item.id)"
                :current-balance="playerProgression.currency"
                :owned="inventoryStore.getItemQuantity(item.id)"
                :returnable="getItemDetails(item.id).returnable"
                :is-opened="getItemDetails(item.id).isOpened"
                :placed-count="getItemDetails(item.id).placedCount"
                @purchase="handlePurchase"
                @sellback="handleSellBack"
                @update:quantity="setPurchaseQuantity"
              />
            </ItemGridView>

            <!-- List View -->
            <ItemListView
              v-else
              :items="suppliesStore.pellets.map(item => ({
                ...item,
                owned: inventoryStore.getItemQuantity(item.id),
                returnable: getItemDetails(item.id).returnable
              }))"
              :show-owned="true"
              
            >
              <template #actions="{ item }">
                <Button
                  :variant="item.basePrice * getPurchaseQuantity(item.id) <= playerProgression.currency ? 'primary' : 'secondary'"
                  size="sm"
                  :disabled="item.basePrice * getPurchaseQuantity(item.id) > playerProgression.currency"
                  @click="handlePurchase(item.id)"
                >
                  Buy ${{ (item.basePrice * getPurchaseQuantity(item.id)).toFixed(2) }}
                </Button>
                <Button
                  v-if="item.returnable && item.returnable > 0"
                  variant="danger"
                  size="sm"
                  @click="handleSellBack(item.id)"
                >
                  Sell
                </Button>
              </template>
            </ItemListView>
          </template>

          <template #treats>
            <!-- Card View -->
            <ItemGridView v-if="viewMode === 'card'">
              <SupplyItemCard
                v-for="item in suppliesStore.treats"
                :key="item.id"
                :item="item"
                :quantity="getPurchaseQuantity(item.id)"
                :current-balance="playerProgression.currency"
                :owned="inventoryStore.getItemQuantity(item.id)"
                :returnable="getItemDetails(item.id).returnable"
                :is-opened="getItemDetails(item.id).isOpened"
                :placed-count="getItemDetails(item.id).placedCount"
                @purchase="handlePurchase"
                @sellback="handleSellBack"
                @update:quantity="setPurchaseQuantity"
              />
            </ItemGridView>

            <!-- List View -->
            <ItemListView
              v-else
              :items="suppliesStore.treats.map(item => ({
                ...item,
                owned: inventoryStore.getItemQuantity(item.id),
                returnable: getItemDetails(item.id).returnable
              }))"
              :show-owned="true"
              
            >
              <template #actions="{ item }">
                <Button
                  :variant="item.basePrice * getPurchaseQuantity(item.id) <= playerProgression.currency ? 'primary' : 'secondary'"
                  size="sm"
                  :disabled="item.basePrice * getPurchaseQuantity(item.id) > playerProgression.currency"
                  @click="handlePurchase(item.id)"
                >
                  Buy ${{ (item.basePrice * getPurchaseQuantity(item.id)).toFixed(2) }}
                </Button>
                <Button
                  v-if="item.returnable && item.returnable > 0"
                  variant="danger"
                  size="sm"
                  @click="handleSellBack(item.id)"
                >
                  Sell
                </Button>
              </template>
            </ItemListView>
          </template>
        </SubTabContainer>
      </div>

      <!-- Habitat Items - Organized by Subcategory -->
      <div v-else-if="activeDepartment === 'habitat_item'" class="panel__section">
        <h3 class="panel__subheading sr-only">Habitat Items</h3>
        <SubTabContainer :tabs="habitatSubTabs" v-model="activeHabitatSubTab">
          <template #hideaways>
            <ItemGridView v-if="viewMode === 'card'">
              <SupplyItemCard
                v-for="item in suppliesStore.hideaways"
                :key="item.id"
                :item="item"
                :quantity="getPurchaseQuantity(item.id)"
                :current-balance="playerProgression.currency"
                :owned="inventoryStore.getItemQuantity(item.id)"
                :returnable="getItemDetails(item.id).returnable"
                :is-opened="getItemDetails(item.id).isOpened"
                :placed-count="getItemDetails(item.id).placedCount"
                @purchase="handlePurchase"
                @sellback="handleSellBack"
                @update:quantity="setPurchaseQuantity"
              />
            </ItemGridView>
            <ItemListView
              v-else
              :items="suppliesStore.hideaways.map(item => ({
                ...item,
                owned: inventoryStore.getItemQuantity(item.id),
                returnable: getItemDetails(item.id).returnable
              }))"
              :show-owned="true"
              
            >
              <template #actions="{ item }">
                <Button
                  :variant="item.basePrice * getPurchaseQuantity(item.id) <= playerProgression.currency ? 'primary' : 'secondary'"
                  size="sm"
                  :disabled="item.basePrice * getPurchaseQuantity(item.id) > playerProgression.currency"
                  @click="handlePurchase(item.id)"
                >
                  Buy ${{ (item.basePrice * getPurchaseQuantity(item.id)).toFixed(2) }}
                </Button>
                <Button
                  v-if="item.returnable && item.returnable > 0"
                  variant="danger"
                  size="sm"
                  @click="handleSellBack(item.id)"
                >
                  Sell
                </Button>
              </template>
            </ItemListView>
          </template>

          <template #toys>
            <ItemGridView v-if="viewMode === 'card'">
              <SupplyItemCard
                v-for="item in suppliesStore.toys"
                :key="item.id"
                :item="item"
                :quantity="getPurchaseQuantity(item.id)"
                :current-balance="playerProgression.currency"
                :owned="inventoryStore.getItemQuantity(item.id)"
                :returnable="getItemDetails(item.id).returnable"
                :is-opened="getItemDetails(item.id).isOpened"
                :placed-count="getItemDetails(item.id).placedCount"
                @purchase="handlePurchase"
                @sellback="handleSellBack"
                @update:quantity="setPurchaseQuantity"
              />
            </ItemGridView>
            <ItemListView
              v-else
              :items="suppliesStore.toys.map(item => ({
                ...item,
                owned: inventoryStore.getItemQuantity(item.id),
                returnable: getItemDetails(item.id).returnable
              }))"
              :show-owned="true"
              
            >
              <template #actions="{ item }">
                <Button
                  :variant="item.basePrice * getPurchaseQuantity(item.id) <= playerProgression.currency ? 'primary' : 'secondary'"
                  size="sm"
                  :disabled="item.basePrice * getPurchaseQuantity(item.id) > playerProgression.currency"
                  @click="handlePurchase(item.id)"
                >
                  Buy ${{ (item.basePrice * getPurchaseQuantity(item.id)).toFixed(2) }}
                </Button>
                <Button
                  v-if="item.returnable && item.returnable > 0"
                  variant="danger"
                  size="sm"
                  @click="handleSellBack(item.id)"
                >
                  Sell
                </Button>
              </template>
            </ItemListView>
          </template>

          <template #chews>
            <ItemGridView v-if="viewMode === 'card'">
              <SupplyItemCard
                v-for="item in suppliesStore.chews"
                :key="item.id"
                :item="item"
                :quantity="getPurchaseQuantity(item.id)"
                :current-balance="playerProgression.currency"
                :owned="inventoryStore.getItemQuantity(item.id)"
                :returnable="getItemDetails(item.id).returnable"
                :is-opened="getItemDetails(item.id).isOpened"
                :placed-count="getItemDetails(item.id).placedCount"
                @purchase="handlePurchase"
                @sellback="handleSellBack"
                @update:quantity="setPurchaseQuantity"
              />
            </ItemGridView>
            <ItemListView
              v-else
              :items="suppliesStore.chews.map(item => ({
                ...item,
                owned: inventoryStore.getItemQuantity(item.id),
                returnable: getItemDetails(item.id).returnable
              }))"
              :show-owned="true"
              
            >
              <template #actions="{ item }">
                <Button
                  :variant="item.basePrice * getPurchaseQuantity(item.id) <= playerProgression.currency ? 'primary' : 'secondary'"
                  size="sm"
                  :disabled="item.basePrice * getPurchaseQuantity(item.id) > playerProgression.currency"
                  @click="handlePurchase(item.id)"
                >
                  Buy ${{ (item.basePrice * getPurchaseQuantity(item.id)).toFixed(2) }}
                </Button>
                <Button
                  v-if="item.returnable && item.returnable > 0"
                  variant="danger"
                  size="sm"
                  @click="handleSellBack(item.id)"
                >
                  Sell
                </Button>
              </template>
            </ItemListView>
          </template>

          <template #bowls_bottles>
            <ItemGridView v-if="viewMode === 'card'">
              <SupplyItemCard
                v-for="item in suppliesStore.bowlsAndBottles"
                :key="item.id"
                :item="item"
                :quantity="getPurchaseQuantity(item.id)"
                :current-balance="playerProgression.currency"
                :owned="inventoryStore.getItemQuantity(item.id)"
                :returnable="getItemDetails(item.id).returnable"
                :is-opened="getItemDetails(item.id).isOpened"
                :placed-count="getItemDetails(item.id).placedCount"
                @purchase="handlePurchase"
                @sellback="handleSellBack"
                @update:quantity="setPurchaseQuantity"
              />
            </ItemGridView>
            <ItemListView
              v-else
              :items="suppliesStore.bowlsAndBottles.map(item => ({
                ...item,
                owned: inventoryStore.getItemQuantity(item.id),
                returnable: getItemDetails(item.id).returnable
              }))"
              :show-owned="true"
              
            >
              <template #actions="{ item }">
                <Button
                  :variant="item.basePrice * getPurchaseQuantity(item.id) <= playerProgression.currency ? 'primary' : 'secondary'"
                  size="sm"
                  :disabled="item.basePrice * getPurchaseQuantity(item.id) > playerProgression.currency"
                  @click="handlePurchase(item.id)"
                >
                  Buy ${{ (item.basePrice * getPurchaseQuantity(item.id)).toFixed(2) }}
                </Button>
                <Button
                  v-if="item.returnable && item.returnable > 0"
                  variant="danger"
                  size="sm"
                  @click="handleSellBack(item.id)"
                >
                  Sell
                </Button>
              </template>
            </ItemListView>
          </template>

          <template #enrichment>
            <ItemGridView v-if="viewMode === 'card'">
              <SupplyItemCard
                v-for="item in suppliesStore.enrichment"
                :key="item.id"
                :item="item"
                :quantity="getPurchaseQuantity(item.id)"
                :current-balance="playerProgression.currency"
                :owned="inventoryStore.getItemQuantity(item.id)"
                :returnable="getItemDetails(item.id).returnable"
                :is-opened="getItemDetails(item.id).isOpened"
                :placed-count="getItemDetails(item.id).placedCount"
                @purchase="handlePurchase"
                @sellback="handleSellBack"
                @update:quantity="setPurchaseQuantity"
              />
            </ItemGridView>
            <ItemListView
              v-else
              :items="suppliesStore.enrichment.map(item => ({
                ...item,
                owned: inventoryStore.getItemQuantity(item.id),
                returnable: getItemDetails(item.id).returnable
              }))"
              :show-owned="true"
              
            >
              <template #actions="{ item }">
                <Button
                  :variant="item.basePrice * getPurchaseQuantity(item.id) <= playerProgression.currency ? 'primary' : 'secondary'"
                  size="sm"
                  :disabled="item.basePrice * getPurchaseQuantity(item.id) > playerProgression.currency"
                  @click="handlePurchase(item.id)"
                >
                  Buy ${{ (item.basePrice * getPurchaseQuantity(item.id)).toFixed(2) }}
                </Button>
                <Button
                  v-if="item.returnable && item.returnable > 0"
                  variant="danger"
                  size="sm"
                  @click="handleSellBack(item.id)"
                >
                  Sell
                </Button>
              </template>
            </ItemListView>
          </template>
        </SubTabContainer>
      </div>

      <!-- Other Categories - Simple List -->
      <div v-else class="panel__section">
        <h3 class="panel__subheading sr-only">{{ activeDepartmentLabel }}</h3>
        <ItemGridView v-if="viewMode === 'card'">
          <SupplyItemCard
            v-for="item in filteredItems"
            :key="item.id"
            :item="item"
            :quantity="getPurchaseQuantity(item.id)"
            :current-balance="playerProgression.currency"
            :owned="inventoryStore.getItemQuantity(item.id)"
            :returnable="getItemDetails(item.id).returnable"
            :is-opened="getItemDetails(item.id).isOpened"
            :placed-count="getItemDetails(item.id).placedCount"
            @purchase="handlePurchase"
            @sellback="handleSellBack"
            @update:quantity="setPurchaseQuantity"
          />
        </ItemGridView>
        <ItemListView
          v-else
          :items="filteredItems.map(item => ({
            ...item,
            owned: inventoryStore.getItemQuantity(item.id),
            returnable: getItemDetails(item.id).returnable
          }))"
          :show-owned="true"
          
        >
          <template #actions="{ item }">
            <Button
              :variant="item.basePrice * getPurchaseQuantity(item.id) <= playerProgression.currency ? 'primary' : 'secondary'"
              size="sm"
              :disabled="item.basePrice * getPurchaseQuantity(item.id) > playerProgression.currency"
              @click="handlePurchase(item.id)"
            >
              Buy ${{ (item.basePrice * getPurchaseQuantity(item.id)).toFixed(2) }}
            </Button>
            <Button
              v-if="item.returnable && item.returnable > 0"
              variant="danger"
              size="sm"
              @click="handleSellBack(item.id)"
            >
              Sell
            </Button>
          </template>
        </ItemListView>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSuppliesStore } from '../../../stores/suppliesStore'
import { usePlayerProgression } from '../../../stores/playerProgression'
import { useInventoryStore } from '../../../stores/inventoryStore'
import Button from '../../basic/Button.vue'
import ItemViewToggle from '../../game/shop/ItemViewToggle.vue'
import SubTabContainer from '../../layout/SubTabContainer.vue'
import SupplyItemCard from '../../game/shop/SupplyItemCard.vue'
import ItemListView from '../../game/shop/ItemListView.vue'
import ItemGridView from '../../game/shop/ItemGridView.vue'

const suppliesStore = useSuppliesStore()
const playerProgression = usePlayerProgression()
const inventoryStore = useInventoryStore()

// Purchase state
const purchaseQuantities = ref<Record<string, number>>({})
const purchaseMessage = ref<{ text: string; type: 'success' | 'error' } | null>(null)

const getPurchaseQuantity = (itemId: string): number => {
  return purchaseQuantities.value[itemId] || 1
}

const setPurchaseQuantity = (itemId: string, quantity: number) => {
  purchaseQuantities.value[itemId] = Math.max(1, Math.min(99, quantity))
}

const handlePurchase = (itemId: string) => {
  const quantity = getPurchaseQuantity(itemId)
  const result = suppliesStore.purchaseItem(itemId, quantity)

  purchaseMessage.value = {
    text: result.message,
    type: result.success ? 'success' : 'error'
  }

  // Clear message after 3 seconds
  setTimeout(() => {
    purchaseMessage.value = null
  }, 3000)

  // Reset quantity to 1 after successful purchase
  if (result.success) {
    purchaseQuantities.value[itemId] = 1
  }
}

const handleSellBack = (itemId: string) => {
  const quantity = getPurchaseQuantity(itemId)
  const result = inventoryStore.sellBackItem(itemId, quantity)

  purchaseMessage.value = {
    text: result.message,
    type: result.success ? 'success' : 'error'
  }

  // Clear message after 3 seconds
  setTimeout(() => {
    purchaseMessage.value = null
  }, 3000)

  // Reset quantity to 1 after successful sell
  if (result.success) {
    purchaseQuantities.value[itemId] = 1
  }
}

const getItemDetails = (itemId: string) => {
  return {
    returnable: inventoryStore.getReturnableQuantity(itemId),
    isOpened: inventoryStore.getOpenedCount(itemId) > 0,
    placedCount: inventoryStore.getPlacedCount(itemId)
  }
}

// View mode toggle
const viewMode = ref<'card' | 'list'>('list')

// Department navigation
const activeDepartment = ref<'featured' | 'bedding' | 'hay' | 'food' | 'habitat_item' | 'all'>('featured')

const departments = [
  { id: 'featured' as const, label: 'Featured', icon: '⭐' },
  { id: 'bedding' as const, label: 'Bedding', icon: '🛏️' },
  { id: 'hay' as const, label: 'Hay', icon: '🌾' },
  { id: 'food' as const, label: 'Food', icon: '🥗' },
  { id: 'habitat_item' as const, label: 'Habitat Items', icon: '🏠' },
  { id: 'all' as const, label: 'All Items', icon: '🛍️' }
]

const activeDepartmentLabel = computed(() => {
  const dept = departments.find((d) => d.id === activeDepartment.value)
  if (!dept) return 'All Items'
  // Don't add "Items" suffix to "All Items" or "Featured"
  if (dept.id === 'all' || dept.id === 'featured') {
    return dept.label
  }
  return `${dept.label} Items`
})

const filteredItems = computed(() => {
  if (activeDepartment.value === 'all') {
    return suppliesStore.catalog
  }
  if (activeDepartment.value === 'featured') {
    // Show 12 featured items: treats, seasonal items, and select toys/hideouts
    const treats = suppliesStore.treats.slice(0, 3)
    const seasonal = suppliesStore.catalog.filter((item) => item.availability === 'seasonal').slice(0, 3)
    const toys = suppliesStore.toys.slice(0, 3)
    const hideaways = suppliesStore.hideaways.slice(0, 3)

    return [...treats, ...seasonal, ...toys, ...hideaways].slice(0, 12)
  }
  return suppliesStore.catalog.filter((item) => item.category === activeDepartment.value)
})

// Food subcategory tabs
const activeFoodSubTab = ref('greens')
const foodSubTabs = [
  { id: 'greens', label: 'Greens', icon: '🥬' },
  { id: 'herbs', label: 'Herbs', icon: '🌿' },
  { id: 'vegetables', label: 'Veggies', icon: '🥕' },
  { id: 'fruits', label: 'Fruits', icon: '🍓' },
  { id: 'pellets', label: 'Pellets', icon: '🌾' },
  { id: 'treats', label: 'Treats', icon: '🍪' }
]

// Habitat subcategory tabs
const activeHabitatSubTab = ref('hideaways')
const habitatSubTabs = [
  { id: 'hideaways', label: 'Hideaways', icon: '🏠' },
  { id: 'toys', label: 'Toys', icon: '🎾' },
  { id: 'chews', label: 'Chews', icon: '🦷' },
  { id: 'bowls_bottles', label: 'Bowls & Bottles', icon: '🍽️' },
  { id: 'enrichment', label: 'Enrichment', icon: '🎨' }
]

// Initialize catalog on mount
onMounted(() => {
  if (!suppliesStore.catalogLoaded) {
    suppliesStore.initializeCatalog()
  }
})
</script>

<style>
/* Supplies Store Debug Styles */
.supplies-store-view {
  container-type: inline-size;
  container-name: supplies-store-view;
}

.supplies-store-view__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
}

.supplies-store-view__header .panel__heading {
  margin-block-end: 0;
}

.supplies-store-view__controls {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.supplies-store-view__controls-left {
  flex: 1;
  min-inline-size: 0;
}

.supplies-store-view__controls-right {
  flex-shrink: 0;
}

.supplies-store-view__departments {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-block-start: var(--space-2);
}

.supplies-store-view__balance {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: linear-gradient(135deg, var(--color-primary-bg) 0%, var(--color-secondary-bg) 100%);
  border: 2px solid var(--color-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  white-space: nowrap;
}

.supplies-store-view__balance-amount {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  font-family: var(--font-family-heading);
  color: var(--color-primary);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.supplies-store-view__message {
  margin-block-start: var(--space-3);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.supplies-store-view__message--success {
  background-color: var(--color-success-bg);
  color: var(--color-success);
  border: 1px solid var(--color-success);
}

.supplies-store-view__message--error {
  background-color: var(--color-danger-bg);
  color: var(--color-danger);
  border: 1px solid var(--color-danger);
}
</style>
