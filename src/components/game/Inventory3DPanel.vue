<template>
  <SidePanel3D
    :is-open="isOpen"
    side="right"
    color="pink"
    title="Control Panel"
    icon="☰"
    :tabs="tabs"
    :active-tab="activeTab"
    @toggle="$emit('toggle')"
    @update:active-tab="activeTab = $event"
  >
    <template #header-extra>
      <span v-if="activeTab === 'inventory'" class="inventory-3d-panel__count">{{ totalItemCount }} items</span>
    </template>

    <!-- Inventory Tab Content -->
    <template v-if="activeTab === 'inventory'">
      <!-- Empty state -->
      <div v-if="totalItemCount === 0" class="inventory-3d-panel__empty">
        📦 No items in inventory
      </div>

      <!-- Food & Consumables Section -->
      <div v-if="consumableItems.length > 0" class="inventory-3d-panel__section">
        <div class="inventory-3d-panel__section-header">
          🥬 Food & Consumables
        </div>
        <div class="inventory-3d-panel__items">
          <button
            v-for="item in consumableItems"
            :key="item.itemId"
            class="inventory-3d-panel__item"
            :class="{
              'inventory-3d-panel__item--selected': selectedItemId === item.itemId,
              'inventory-3d-panel__item--hay': item.category === 'hay',
              'inventory-3d-panel__item--food': item.category === 'food'
            }"
            @click="handleItemClick(item)"
            :title="item.name"
          >
            <span class="inventory-3d-panel__item-emoji">{{ item.emoji }}</span>
            <span class="inventory-3d-panel__item-name">{{ item.name }}</span>
            <span class="inventory-3d-panel__item-servings">
              {{ item.servingsRemaining }}/{{ item.maxServings }}
            </span>
          </button>
        </div>
      </div>

      <!-- Habitat Items Section -->
      <div v-if="habitatItems.length > 0" class="inventory-3d-panel__section">
        <div class="inventory-3d-panel__section-header">
          🏠 Habitat Items
        </div>
        <div class="inventory-3d-panel__items">
          <button
            v-for="item in habitatItems"
            :key="item.itemId"
            class="inventory-3d-panel__item"
            :class="{ 'inventory-3d-panel__item--selected': selectedItemId === item.itemId }"
            @click="handleItemClick(item)"
            :title="item.name"
          >
            <span class="inventory-3d-panel__item-emoji">{{ item.emoji }}</span>
            <span class="inventory-3d-panel__item-name">{{ item.name }}</span>
            <span v-if="item.quantity > 1" class="inventory-3d-panel__item-quantity">
              ×{{ item.quantity }}
            </span>
          </button>
        </div>
      </div>

      <!-- Bedding Section (read-only info) -->
      <div v-if="beddingItems.length > 0" class="inventory-3d-panel__section">
        <div class="inventory-3d-panel__section-header">
          🛏️ Bedding
        </div>
        <div class="inventory-3d-panel__items">
          <div
            v-for="item in beddingItems"
            :key="item.itemId"
            class="inventory-3d-panel__item inventory-3d-panel__item--readonly"
            :title="'Used automatically during cleaning'"
          >
            <span class="inventory-3d-panel__item-emoji">{{ item.emoji }}</span>
            <span class="inventory-3d-panel__item-name">{{ item.name }}</span>
            <span class="inventory-3d-panel__item-amount">{{ item.formattedAmount }}</span>
          </div>
        </div>
      </div>
    </template>

    <!-- Guinea Pig Info Tab Content -->
    <template v-else-if="activeTab === 'guinea-pigs'">
      <div class="guinea-pig-info">
        <!-- Empty state -->
        <div v-if="activeGuineaPigs.length === 0" class="guinea-pig-info__empty">
          <p>🐹 No guinea pigs in habitat</p>
          <p class="guinea-pig-info__hint">Start a game to see guinea pig info here.</p>
        </div>

        <!-- Guinea pig content -->
        <div v-else-if="selectedGuineaPig">
          <!-- Toggle button for multiple GPs -->
          <div class="guinea-pig-info__header">
            <Button
              v-if="activeGuineaPigs.length > 1"
              @click="toggleGuineaPig"
              variant="tertiary"
              size="sm"
            >
              {{ selectedGuineaPig.name }} ({{ selectedGuineaPigIndex + 1 }}/{{ activeGuineaPigs.length }})
            </Button>
            <span v-else class="guinea-pig-info__name">{{ selectedGuineaPig.name }}</span>
          </div>

          <!-- Guinea Pig Info Section -->
          <div class="guinea-pig-info__section">
            <div class="guinea-pig-info__section-header">
              🐹 Info
            </div>
            <div class="guinea-pig-info__section-content">
              <div class="guinea-pig-info__stats">
                <div class="guinea-pig-info__stat">
                  <span class="guinea-pig-info__stat-label">Breed:</span>
                  <span class="guinea-pig-info__stat-value">{{ selectedGuineaPig.breed }}</span>
                </div>
                <div class="guinea-pig-info__stat">
                  <span class="guinea-pig-info__stat-label">Gender:</span>
                  <span class="guinea-pig-info__stat-value">{{ formatGender(selectedGuineaPig.gender) }}</span>
                </div>
                <div class="guinea-pig-info__stat">
                  <span class="guinea-pig-info__stat-label">Fur:</span>
                  <span class="guinea-pig-info__stat-value">{{ formatFur(selectedGuineaPig.appearance) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- User Friendship Section -->
          <div class="guinea-pig-info__section">
            <div class="guinea-pig-info__section-header">
              ❤️ User Friendship
            </div>
            <div class="guinea-pig-info__section-content">
              <FriendshipProgress
                :friendship="selectedGuineaPig.friendship"
                :threshold="85"
                :show-message="false"
              />
              <div class="guinea-pig-info__stats">
                <div class="guinea-pig-info__stat">
                  <span class="guinea-pig-info__stat-label">Last interaction:</span>
                  <span class="guinea-pig-info__stat-value">{{ formatTimestamp(selectedGuineaPig.lastInteraction) }}</span>
                </div>
                <div class="guinea-pig-info__stat">
                  <span class="guinea-pig-info__stat-label">Total interactions:</span>
                  <span class="guinea-pig-info__stat-value">{{ selectedGuineaPig.totalInteractions }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- GP-to-GP Bonding Section (only if 2+ GPs) -->
          <div v-if="otherGuineaPig && bondWithOther" class="guinea-pig-info__section">
            <div class="guinea-pig-info__section-header">
              🤝 Bonding with {{ otherGuineaPig.name }}
            </div>
            <div class="guinea-pig-info__section-content">
              <div class="guinea-pig-info__bond-bar">
                <div class="guinea-pig-info__bond-fill" :style="{ width: bondWithOther.bondingLevel + '%' }"></div>
              </div>
              <div class="guinea-pig-info__bond-info">
                <span class="guinea-pig-info__bond-level">{{ Math.round(bondWithOther.bondingLevel) }}%</span>
                <span class="guinea-pig-info__bond-tier" :class="`guinea-pig-info__bond-tier--${bondWithOther.bondingTier}`">
                  {{ formatBondTier(bondWithOther.bondingTier) }}
                </span>
              </div>
            </div>
          </div>

          <!-- No bonding section message when only 1 GP -->
          <div v-else-if="activeGuineaPigs.length === 1" class="guinea-pig-info__section guinea-pig-info__section--muted">
            <div class="guinea-pig-info__section-header">
              🤝 Social Bonding
            </div>
            <p class="guinea-pig-info__hint">Add a second guinea pig to see bonding stats.</p>
          </div>

          <!-- Activity History Section -->
          <div class="guinea-pig-info__section">
            <div class="guinea-pig-info__section-header">
              📜 Recent Activity
            </div>
            <div class="guinea-pig-info__section-content">
              <div v-if="recentActivity.length === 0" class="guinea-pig-info__hint">
                No recent activity
              </div>
              <div v-else class="guinea-pig-info__activity-list">
                <div
                  v-for="activity in recentActivity"
                  :key="activity.id"
                  class="guinea-pig-info__activity-item"
                >
                  <span class="guinea-pig-info__activity-time">{{ formatActivityTime(activity.timestamp) }}</span>
                  <span class="guinea-pig-info__activity-message">{{ activity.message }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </SidePanel3D>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import SidePanel3D, { type TabDefinition } from './SidePanel3D.vue'
import { useInventoryStore } from '../../stores/inventoryStore'
import { useSuppliesStore } from '../../stores/suppliesStore'
import { useGuineaPigStore } from '../../stores/guineaPigStore'
import { useLoggingStore } from '../../stores/loggingStore'
import FriendshipProgress from './ui/FriendshipProgress.vue'
import Button from '../basic/Button.vue'
import type { GuineaPigAppearance } from '../../stores/guineaPigStore'

interface Props {
  isOpen: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  toggle: []
  selectItem: [itemId: string]
  deselectItem: []
}>()

const inventoryStore = useInventoryStore()
const suppliesStore = useSuppliesStore()
const guineaPigStore = useGuineaPigStore()
const loggingStore = useLoggingStore()

const selectedItemId = ref<string | null>(null)

// Guinea pig selection state
const selectedGuineaPigIndex = ref(0)

const activeGuineaPigs = computed(() => guineaPigStore.activeGuineaPigs)

const selectedGuineaPig = computed(() => {
  if (activeGuineaPigs.value.length === 0) return null
  // Clamp index to valid range in case guinea pigs were removed
  const safeIndex = Math.min(selectedGuineaPigIndex.value, activeGuineaPigs.value.length - 1)
  if (safeIndex !== selectedGuineaPigIndex.value) {
    selectedGuineaPigIndex.value = safeIndex
  }
  return activeGuineaPigs.value[safeIndex]
})

// Get the other guinea pig for bonding display
const otherGuineaPig = computed(() => {
  if (activeGuineaPigs.value.length < 2 || !selectedGuineaPig.value) return null
  return activeGuineaPigs.value.find(gp => gp.id !== selectedGuineaPig.value!.id)
})

// Get bond between selected GP and other GP
const bondWithOther = computed(() => {
  if (!selectedGuineaPig.value || !otherGuineaPig.value) return null
  return guineaPigStore.getBond(selectedGuineaPig.value.id, otherGuineaPig.value.id)
})

// Get recent activity messages (last 5)
const recentActivity = computed(() => {
  return [...loggingStore.activityMessages]
    .reverse()
    .slice(0, 5)
})

/**
 * Toggle to next guinea pig
 */
function toggleGuineaPig() {
  const total = activeGuineaPigs.value.length
  if (total <= 1) return
  selectedGuineaPigIndex.value = (selectedGuineaPigIndex.value + 1) % total
  // Update store selection
  if (selectedGuineaPig.value) {
    guineaPigStore.selectGuineaPig(selectedGuineaPig.value.id)
  }
}

/**
 * Sync with guinea pig selection from 3D clicks
 */
watch(
  () => guineaPigStore.selectedGuineaPigId,
  (selectedId) => {
    if (!selectedId) return
    const index = activeGuineaPigs.value.findIndex(gp => gp.id === selectedId)
    if (index !== -1) {
      selectedGuineaPigIndex.value = index
    }
  }
)

/**
 * Format timestamp for display
 */
function formatTimestamp(timestamp: number | null): string {
  if (!timestamp) return 'Never'
  const now = Date.now()
  const diffMs = now - timestamp
  const diffMins = Math.floor(diffMs / (1000 * 60))

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
  return `${Math.floor(diffMins / 1440)}d ago`
}

/**
 * Format bond tier for display
 */
function formatBondTier(tier: string): string {
  return tier.charAt(0).toUpperCase() + tier.slice(1)
}

/**
 * Format gender for display
 */
function formatGender(gender: 'male' | 'female'): string {
  return gender === 'male' ? '♂ Male' : '♀ Female'
}

/**
 * Format fur appearance for display
 */
function formatFur(appearance: GuineaPigAppearance): string {
  const color = appearance.furColor.charAt(0).toUpperCase() + appearance.furColor.slice(1)
  const pattern = appearance.furPattern.charAt(0).toUpperCase() + appearance.furPattern.slice(1)
  return `${color} ${pattern}`
}

/**
 * Format activity timestamp for compact display
 */
function formatActivityTime(timestamp: number): string {
  const now = Date.now()
  const diffMs = now - timestamp
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)

  if (diffSecs < 60) return `${diffSecs}s`
  if (diffMins < 60) return `${diffMins}m`
  return `${Math.floor(diffMins / 60)}h`
}

// Tab definitions
const tabs: TabDefinition[] = [
  { id: 'inventory', label: 'Inventory', icon: '📦' },
  { id: 'guinea-pigs', label: 'Guinea Pigs', icon: '🐹' }
]

const activeTab = ref('inventory')

// Computed: Total item count
const totalItemCount = computed(() => {
  return inventoryStore.allItems.reduce((sum, item) => sum + item.quantity, 0)
})

// Check if an item needs to be placed into a container (bowl/rack)
function isContainerItem(category: string): boolean {
  return category === 'hay' || category === 'food'
}

// Computed: Food & Consumables (hay, food items - all have servings)
const consumableItems = computed(() => {
  const items: Array<{
    itemId: string
    name: string
    emoji: string
    quantity: number
    servingsRemaining: number
    maxServings: number
    category: string
  }> = []

  for (const invItem of inventoryStore.allItems) {
    const supplyItem = suppliesStore.getItemById(invItem.itemId)
    if (!supplyItem) continue

    // Include hay and food categories (all have servings)
    if (isContainerItem(supplyItem.category)) {
      // Get total servings across all instances
      const totalServings = inventoryStore.getTotalServings(invItem.itemId)
      const maxServingsPerItem = supplyItem.stats?.servings || 1

      items.push({
        itemId: invItem.itemId,
        name: supplyItem.name,
        emoji: supplyItem.emoji || '🍽️',
        quantity: invItem.quantity,
        servingsRemaining: totalServings,
        maxServings: maxServingsPerItem * invItem.quantity,
        category: supplyItem.category
      })
    }
  }

  return items
})

// Computed: Habitat items (toys, hideaways, bowls, etc.)
const habitatItems = computed(() => {
  const items: Array<{
    itemId: string
    name: string
    emoji: string
    quantity: number
  }> = []

  for (const invItem of inventoryStore.allItems) {
    const supplyItem = suppliesStore.getItemById(invItem.itemId)
    if (!supplyItem) continue

    if (supplyItem.category === 'habitat_item') {
      // Count items not yet placed in habitat
      const placedCount = inventoryStore.getPlacedCount(invItem.itemId)
      const availableCount = invItem.quantity - placedCount

      if (availableCount > 0) {
        items.push({
          itemId: invItem.itemId,
          name: supplyItem.name,
          emoji: supplyItem.emoji || '📦',
          quantity: availableCount
        })
      }
    }
  }

  return items
})

// Computed: Bedding items (read-only display)
const beddingItems = computed(() => {
  const items: Array<{
    itemId: string
    name: string
    emoji: string
    formattedAmount: string
  }> = []

  for (const invItem of inventoryStore.allItems) {
    const supplyItem = suppliesStore.getItemById(invItem.itemId)
    if (!supplyItem) continue

    if (supplyItem.category === 'bedding') {
      // Calculate total amount remaining across all instances
      let totalAmount = 0
      for (const instance of invItem.instances) {
        totalAmount += instance.amountRemaining ?? 1
      }

      items.push({
        itemId: invItem.itemId,
        name: supplyItem.name,
        emoji: supplyItem.emoji || '🛏️',
        formattedAmount: totalAmount.toFixed(1) + ' bags'
      })
    }
  }

  return items
})

// Handle habitat item click - for direct placement in habitat
function handleItemClick(item: { itemId: string }) {
  if (selectedItemId.value === item.itemId) {
    selectedItemId.value = null
    emit('deselectItem')
  } else {
    selectedItemId.value = item.itemId
    emit('selectItem', item.itemId)
  }
}
</script>

<style>
/* Inventory-specific styles (content only, not panel structure) */
.inventory-3d-panel__count {
  font-size: var(--font-size-xs);
  opacity: 0.8;
}

.inventory-3d-panel__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  block-size: 100%;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

/* Sections */
.inventory-3d-panel__section {
  margin-block-end: var(--spacing-md);
}

.inventory-3d-panel__section-header {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-block-end: var(--spacing-xs);
  padding-block-end: var(--spacing-xs);
  border-block-end: 1px solid var(--color-border);
}

/* Items grid */
.inventory-3d-panel__items {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

/* Individual item */
.inventory-3d-panel__item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--color-bg-secondary);
  border: 2px solid transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
  text-align: start;
  inline-size: 100%;
}

.inventory-3d-panel__item:hover {
  background-color: var(--color-bg-tertiary);
}

.inventory-3d-panel__item--selected {
  border-color: var(--color-accent-violet-500);
  background-color: var(--color-accent-violet-100);
}

.inventory-3d-panel__item--selected .inventory-3d-panel__item-name {
  color: var(--color-accent-violet-800);
}

.inventory-3d-panel__item--selected .inventory-3d-panel__item-servings {
  color: var(--color-accent-violet-700);
}

.inventory-3d-panel__item--selected:hover {
  background-color: var(--color-accent-violet-200);
}

/* Food items - green left border */
.inventory-3d-panel__item--food {
  border-inline-start: 3px solid var(--color-accent-green-500);
}

/* Hay items - yellow left border */
.inventory-3d-panel__item--hay {
  border-inline-start: 3px solid var(--color-accent-yellow-500);
}

/* Read-only items (bedding) - no interaction */
.inventory-3d-panel__item--readonly {
  cursor: default;
}

.inventory-3d-panel__item--readonly:hover {
  background-color: var(--color-bg-secondary);
}

.inventory-3d-panel__item-emoji {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.inventory-3d-panel__item-name {
  flex: 1;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.inventory-3d-panel__item-quantity,
.inventory-3d-panel__item-amount {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.inventory-3d-panel__item-servings {
  font-size: var(--font-size-xs);
  color: var(--color-accent-green-600);
  font-weight: var(--font-weight-medium);
  flex-shrink: 0;
}

/* Guinea Pig Info Tab Styles */
.guinea-pig-info {
  padding: var(--spacing-sm);
}

.guinea-pig-info__empty {
  text-align: center;
  color: var(--color-text-muted);
  padding: var(--spacing-lg) var(--spacing-sm);
}

.guinea-pig-info__empty p {
  margin-block-end: var(--spacing-xs);
}

.guinea-pig-info__header {
  margin-block-end: var(--spacing-md);
  padding-block-end: var(--spacing-sm);
  border-block-end: 1px solid var(--color-border);
}

.guinea-pig-info__name {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.guinea-pig-info__hint {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

/* Sections */
.guinea-pig-info__section {
  margin-block-end: var(--spacing-md);
  padding-block-end: var(--spacing-md);
  border-block-end: 1px solid var(--color-border-light);
}

.guinea-pig-info__section:last-child {
  border-block-end: none;
  margin-block-end: 0;
  padding-block-end: 0;
}

.guinea-pig-info__section--muted {
  opacity: 0.7;
}

.guinea-pig-info__section-header {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  margin-block-end: var(--spacing-sm);
}

.guinea-pig-info__section-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

/* Stats grid */
.guinea-pig-info__stats {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.guinea-pig-info__stat {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-sm);
}

.guinea-pig-info__stat-label {
  color: var(--color-text-muted);
}

.guinea-pig-info__stat-value {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

/* Bond bar */
.guinea-pig-info__bond-bar {
  inline-size: 100%;
  block-size: 8px;
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.guinea-pig-info__bond-fill {
  block-size: 100%;
  background: linear-gradient(90deg, var(--color-accent-pink-400) 0%, var(--color-accent-pink-600) 100%);
  border-radius: var(--radius-full);
  transition: width 0.3s ease;
}

.guinea-pig-info__bond-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.guinea-pig-info__bond-level {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-accent-pink-600);
}

.guinea-pig-info__bond-tier {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.guinea-pig-info__bond-tier--neutral {
  background-color: var(--color-neutral-200);
  color: var(--color-neutral-700);
}

.guinea-pig-info__bond-tier--friends {
  background-color: var(--color-secondary-bg);
  color: var(--color-secondary);
}

.guinea-pig-info__bond-tier--bonded {
  background-color: var(--color-accent-pink-100);
  color: var(--color-accent-pink-700);
}

/* Activity list */
.guinea-pig-info__activity-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  max-block-size: 150px;
  overflow-y: auto;
}

.guinea-pig-info__activity-item {
  display: flex;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
  padding: var(--spacing-xs);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-sm);
}

.guinea-pig-info__activity-time {
  flex-shrink: 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  min-inline-size: 2.5rem;
}

.guinea-pig-info__activity-message {
  color: var(--color-text-primary);
  line-height: 1.3;
}
</style>
