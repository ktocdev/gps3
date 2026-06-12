<template>
  <div class="store-view">
    <div class="store-view__inner">
      <h2 class="store-view__heading">🛒 Supplies Store</h2>

      <!-- Department tabs -->
      <div class="store-view__departments">
        <SignPill
          v-for="dept in departments"
          :key="dept.id"
          :label="dept.label"
          :icon="dept.icon"
          :accent="dept.accent"
          :accent-deep="dept.accentDeep"
          :active="activeDept === dept.id"
          :tilt="dept.tilt"
          @click="activeDept = dept.id"
        />
      </div>

      <!-- Purchase feedback -->
      <Transition name="store-toast">
        <div v-if="toast" class="store-view__toast">
          <ParchmentPanel :accent="toast.success ? 'var(--color-green)' : 'var(--color-red-500)'">
            <div class="store-view__toast-message">{{ toast.message }}</div>
          </ParchmentPanel>
        </div>
      </Transition>

      <!-- Item grid -->
      <ParchmentPanel :accent="activeDepartment.accent" :animate="false" show-grain>
        <div class="parchment-panel__title">{{ activeDepartment.icon }} {{ activeDepartment.label }}</div>
        <div v-if="items.length === 0" class="chrome-inv__empty">Nothing in stock right now.</div>
        <div v-else class="store-view__grid">
          <div v-for="item in items" :key="item.id" class="store-view__card">
            <span class="chrome-inv__tile-emoji">{{ itemEmoji(item) }}</span>
            <span class="store-view__card-name">{{ item.name }}</span>
            <span class="store-view__card-price">🪙 {{ item.basePrice }}</span>
            <span v-if="ownedCount(item.id) > 0" class="store-view__card-owned">
              owned ×{{ ownedCount(item.id) }}
            </span>
            <button
              class="store-view__buy"
              :disabled="!canAfford(item)"
              @click="buy(item)"
            >Buy</button>
          </div>
        </div>
      </ParchmentPanel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import SignPill from '../components/chrome/SignPill.vue'
import ParchmentPanel from '../components/chrome/ParchmentPanel.vue'
import { useSuppliesStore } from '../stores/suppliesStore'
import { useInventoryStore } from '../stores/inventoryStore'
import { usePlayerProgression } from '../stores/playerProgression'
import type { SuppliesItem } from '../types/supplies'

const suppliesStore = useSuppliesStore()
const inventoryStore = useInventoryStore()
const playerProgression = usePlayerProgression()

interface Department {
  id: SuppliesItem['category']
  label: string
  icon: string
  accent: string
  accentDeep: string
  tilt: number
}

const departments: Department[] = [
  { id: 'hay', label: 'Hay Loft', icon: '🌾', accent: 'var(--color-lime)', accentDeep: 'var(--color-green)', tilt: -1 },
  { id: 'food', label: 'Grocery', icon: '🥕', accent: 'var(--color-pink)', accentDeep: 'var(--color-pink-deep)', tilt: 0.6 },
  { id: 'bedding', label: 'Bedding', icon: '🛏️', accent: 'var(--color-violet-mid)', accentDeep: 'var(--color-violet-deep)', tilt: -0.5 },
  { id: 'habitat_item', label: 'Habitat', icon: '🏠', accent: 'var(--color-sky)', accentDeep: 'var(--color-cyan-700)', tilt: 1 }
]

const activeDept = ref<SuppliesItem['category']>('hay')
const activeDepartment = computed(() => departments.find(d => d.id === activeDept.value)!)
const items = computed(() => suppliesStore.getItemsByCategory(activeDept.value))

const toast = ref<{ success: boolean; message: string } | null>(null)
let toastTimer: number | null = null

function itemEmoji(item: SuppliesItem): string {
  return (item as SuppliesItem & { emoji?: string }).emoji || activeDepartment.value.icon
}

function ownedCount(itemId: string): number {
  const inv = inventoryStore.allItems.find(i => i.itemId === itemId)
  return inv?.quantity ?? 0
}

function canAfford(item: SuppliesItem): boolean {
  return playerProgression.currency >= item.basePrice
}

function buy(item: SuppliesItem) {
  const result = suppliesStore.purchaseItem(item.id, 1)
  toast.value = { success: result.success, message: result.message }
  if (toastTimer !== null) window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => {
    toast.value = null
  }, 2500)
}
</script>

<style>
.store-view {
  flex: 1;
  min-block-size: 0;
  overflow-y: auto;
  background: #87ceeb; /* sim sky */
  padding: var(--space-6);
}

.store-view__inner {
  max-inline-size: 960px;
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.store-view__heading {
  font-family: var(--font-family-heading);
  color: var(--color-gold-50);
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.45), 0 2px 4px rgba(0, 0, 0, 0.3);
  margin: 0;
}

.store-view__departments {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.store-view__toast {
  position: fixed;
  inset-block-start: 80px;
  inset-inline-start: 50%;
  transform: translateX(-50%);
  z-index: 100;
  min-inline-size: 280px;
}

.store-view__toast-message {
  font-weight: var(--font-weight-bold);
  color: var(--color-wood-border);
  text-align: center;
}

.store-toast-enter-active,
.store-toast-leave-active {
  transition: opacity 200ms ease, transform 200ms ease;
}

.store-toast-enter-from,
.store-toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-8px);
}

.store-view__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: var(--space-3);
}

.store-view__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-3);
  background: linear-gradient(180deg, var(--color-gold-50) 0%, var(--color-gold-100) 100%);
  border: 2.5px solid var(--color-wood-dark);
  border-radius: 10px;
  box-shadow:
    0 4px 6px rgba(69, 26, 3, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

.store-view__card-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-gold-800);
  text-align: center;
}

.store-view__card-price {
  font-family: var(--font-family-stats);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-wood-border);
}

.store-view__card-owned {
  font-size: var(--font-size-2xs);
  color: var(--color-wood-dark);
  font-weight: var(--font-weight-semibold);
}

.store-view__buy {
  margin-block-start: var(--space-1);
  padding-block: var(--space-1);
  padding-inline: var(--space-4);
  border-radius: var(--radius-full);
  border: 2px solid var(--color-gold-800);
  background: linear-gradient(180deg, var(--color-pink-500) 0%, var(--color-pink-600) 100%);
  color: #ffffff;
  font-weight: var(--font-weight-bold);
  font-family: inherit;
  cursor: pointer;
  box-shadow: var(--shadow-cta);
  transition: transform 100ms ease, filter 140ms ease;
}

.store-view__buy:hover:not(:disabled) {
  transform: translateY(-1px);
  filter: brightness(1.05);
}

.store-view__buy:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
