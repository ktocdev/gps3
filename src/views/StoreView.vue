<template>
  <div class="storefront">
    <!-- Wooden beam the awnings hang from -->
    <div class="storefront__beam" aria-hidden="true">
      <div class="storefront__beam-grain"></div>
      <div class="storefront__beam-rivet storefront__beam-rivet--start"></div>
      <div class="storefront__beam-rivet storefront__beam-rivet--end"></div>
    </div>

    <!-- Storefront window with the awning department nav hung over it -->
    <div class="storefront__window">
      <StorefrontWindow />
      <nav class="storefront__awnings" aria-label="Store departments">
        <AwningTab
          v-for="dept in departments"
          :key="dept.id"
          :label="dept.label"
          :icon="dept.icon"
          :accent="dept.accent"
          :soft="dept.soft"
          :active="activeDept === dept.id"
          @click="activeDept = dept.id"
        />
      </nav>
    </div>

    <!-- Purchase feedback -->
    <Transition name="storefront-toast">
      <div v-if="toast" class="storefront__toast">
        <ParchmentPanel :accent="toast.success ? 'var(--color-green)' : 'var(--color-red-500)'">
          <div class="storefront__toast-message">{{ toast.message }}</div>
        </ParchmentPanel>
      </div>
    </Transition>

    <!-- Aisle header: plaque · title · divider rule · coin badge -->
    <div class="storefront__aisle">
      <div class="aisle-plaque">
        <div class="aisle-plaque__grain" aria-hidden="true"></div>
        <div class="aisle-plaque__rivet aisle-plaque__rivet--start" aria-hidden="true"></div>
        <div class="aisle-plaque__rivet aisle-plaque__rivet--end" aria-hidden="true"></div>
        AISLE {{ aisleNumber }}
      </div>
      <h2 class="storefront__aisle-title">{{ activeDepartment.label }}</h2>
      <div class="storefront__aisle-rule" aria-hidden="true"></div>
      <div class="storefront__coins">🪙 {{ playerProgression.formattedCurrency }}</div>
    </div>
    <div class="storefront__tagline">{{ activeDepartment.tagline }}</div>

    <!-- Shelves of crates -->
    <div v-if="shelves.length === 0" class="storefront__empty">Nothing in stock right now.</div>
    <div v-else class="storefront__shelves">
      <div v-for="(row, rowIndex) in shelves" :key="rowIndex" class="storefront__shelf-row">
        <WoodShelf>
          <div class="storefront__shelf-items">
            <SupplyCrateCard
              v-for="(item, itemIndex) in row"
              :key="item.id"
              :item="item"
              :owned="ownedCount(item.id)"
              :returnable="returnableCount(item.id)"
              :affordable="canAfford(item)"
              :tilt="crateTilt(rowIndex * shelfSize + itemIndex)"
              :fallback-emoji="activeDepartment.icon"
              @buy="buy"
              @sell="sell"
            />
          </div>
        </WoodShelf>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import AwningTab from '../components/game/shop/AwningTab.vue'
import StorefrontWindow from '../components/game/shop/StorefrontWindow.vue'
import WoodShelf from '../components/game/shop/WoodShelf.vue'
import SupplyCrateCard from '../components/game/shop/SupplyCrateCard.vue'
import ParchmentPanel from '../components/chrome/ParchmentPanel.vue'
import { useSuppliesStore } from '../stores/suppliesStore'
import { useInventoryStore } from '../stores/inventoryStore'
import { usePlayerProgression } from '../stores/playerProgression'
import type { SuppliesItem } from '../types/supplies'

const suppliesStore = useSuppliesStore()
const inventoryStore = useInventoryStore()
const playerProgression = usePlayerProgression()

type DepartmentId = SuppliesItem['category'] | 'featured'

interface Department {
  id: DepartmentId
  label: string
  icon: string
  accent: string
  soft: string
  tagline: string
}

const departments: Department[] = [
  {
    id: 'featured',
    label: "Today's Picks",
    icon: '⭐',
    accent: 'var(--color-gold)',
    soft: 'var(--color-gold-100)',
    tagline: 'Hand-picked goodies. Fresh batch every visit.'
  },
  {
    id: 'hay',
    label: 'Hay Loft',
    icon: '🌾',
    accent: 'var(--color-ivy)',
    soft: 'var(--color-ivy-soft)',
    tagline: 'The good stuff. Long-stem, fragrant, crunchable.'
  },
  {
    id: 'food',
    label: 'Grocery',
    icon: '🥗',
    accent: 'var(--color-pink)',
    soft: 'var(--color-pink-100)',
    tagline: 'Fresh greens, herbs & treats. The grocery aisle.'
  },
  {
    id: 'bedding',
    label: 'Bedding',
    icon: '🛏️',
    accent: 'var(--color-violet-mid)',
    soft: 'var(--color-violet-100)',
    tagline: 'Soft floors. Cozy naps. Maximum snuggle.'
  },
  {
    id: 'habitat_item',
    label: 'Habitat',
    icon: '🏠',
    accent: 'var(--color-sky)',
    soft: 'var(--color-sky-soft)',
    tagline: 'Houses, tunnels, toys. Build the dream pad.'
  }
]

const shelfSize = 4

const activeDept = ref<DepartmentId>('featured')
const activeDepartment = computed(() => departments.find(d => d.id === activeDept.value)!)
const aisleNumber = computed(() => departments.findIndex(d => d.id === activeDept.value) + 1)

const featuredItems = computed<SuppliesItem[]>(() => {
  const popular = suppliesStore.catalog.filter(item => item.tags?.includes('popular'))
  if (popular.length > 0) return popular.slice(0, shelfSize)
  // Fallback: first item of each category
  return departments
    .filter(d => d.id !== 'featured')
    .map(d => suppliesStore.getItemsByCategory(d.id as SuppliesItem['category'])[0])
    .filter((item): item is SuppliesItem => item !== undefined)
})

const items = computed<SuppliesItem[]>(() =>
  activeDept.value === 'featured'
    ? featuredItems.value
    : suppliesStore.getItemsByCategory(activeDept.value)
)

const shelves = computed<SuppliesItem[][]>(() => {
  const rows: SuppliesItem[][] = []
  for (let i = 0; i < items.value.length; i += shelfSize) {
    rows.push(items.value.slice(i, i + shelfSize))
  }
  return rows
})

const crateTilts = [-1.5, 1, -0.5, 1.5]

function crateTilt(index: number): number {
  return crateTilts[index % crateTilts.length]
}

const toast = ref<{ success: boolean; message: string } | null>(null)
let toastTimer: number | null = null

function showToast(success: boolean, message: string) {
  toast.value = { success, message }
  if (toastTimer !== null) window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => {
    toast.value = null
  }, 2500)
}

function ownedCount(itemId: string): number {
  const inv = inventoryStore.allItems.find(i => i.itemId === itemId)
  return inv?.quantity ?? 0
}

function returnableCount(itemId: string): number {
  const inv = inventoryStore.allItems.find(i => i.itemId === itemId)
  if (!inv) return 0
  return inv.instances.filter(inst => !inst.isOpened && !inst.isPlacedInHabitat).length
}

function canAfford(item: SuppliesItem): boolean {
  return playerProgression.currency >= item.basePrice
}

function buy(item: SuppliesItem) {
  const result = suppliesStore.purchaseItem(item.id, 1)
  showToast(result.success, result.message)
}

function sell(item: SuppliesItem) {
  const result = inventoryStore.sellBackItem(item.id, 1)
  showToast(result.success, result.message)
}
</script>
