<template>
  <div class="chrome-inv">
    <div v-if="totalItemCount === 0" class="chrome-inv__empty">📦 No items in inventory</div>

    <div v-if="consumableItems.length > 0" class="chrome-inv__section">
      <div class="chrome-inv__section-title">🥬 Food &amp; Consumables</div>
      <div class="chrome-inv__grid">
        <button
          v-for="item in consumableItems"
          :key="item.itemId"
          class="chrome-inv__tile"
          :class="{ 'chrome-inv__tile--selected': selectedItemId === item.itemId }"
          :style="tileTheme(item.category)"
          :title="item.name"
          @click="handleItemClick(item.itemId)"
        >
          <span class="chrome-inv__tile-emoji">{{ item.emoji }}</span>
          <span class="chrome-inv__tile-name">{{ item.name }}</span>
          <span class="chrome-inv__tile-count">{{ item.servingsRemaining }}/{{ item.maxServings }}</span>
        </button>
      </div>
    </div>

    <div v-if="habitatItems.length > 0" class="chrome-inv__section">
      <div class="chrome-inv__section-title">🏠 Habitat Items</div>
      <div class="chrome-inv__grid">
        <button
          v-for="item in habitatItems"
          :key="item.itemId"
          class="chrome-inv__tile"
          :class="{ 'chrome-inv__tile--selected': selectedItemId === item.itemId }"
          :style="tileTheme('habitat_item')"
          :title="item.name"
          @click="handleItemClick(item.itemId)"
        >
          <span class="chrome-inv__tile-emoji">{{ item.emoji }}</span>
          <span class="chrome-inv__tile-name">{{ item.name }}</span>
          <span v-if="item.quantity > 1" class="chrome-inv__tile-count">×{{ item.quantity }}</span>
        </button>
      </div>
    </div>

    <div v-if="beddingItems.length > 0" class="chrome-inv__section">
      <div class="chrome-inv__section-title">🛏️ Bedding</div>
      <div class="chrome-inv__grid">
        <div
          v-for="item in beddingItems"
          :key="item.itemId"
          class="chrome-inv__tile chrome-inv__tile--readonly"
          title="Used automatically during cleaning"
        >
          <span class="chrome-inv__tile-emoji">{{ item.emoji }}</span>
          <span class="chrome-inv__tile-name">{{ item.name }}</span>
          <span class="chrome-inv__tile-count">{{ item.formattedAmount }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useInventoryStore } from '../../stores/inventoryStore'
import { useSuppliesStore } from '../../stores/suppliesStore'

const emit = defineEmits<{
  select: [itemId: string]
  deselect: []
}>()

const inventoryStore = useInventoryStore()
const suppliesStore = useSuppliesStore()

const selectedItemId = ref<string | null>(null)

const totalItemCount = computed(() =>
  inventoryStore.allItems.reduce((sum, item) => sum + item.quantity, 0)
)

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

    if (supplyItem.category === 'hay' || supplyItem.category === 'food') {
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

const habitatItems = computed(() => {
  const items: Array<{ itemId: string; name: string; emoji: string; quantity: number }> = []

  for (const invItem of inventoryStore.allItems) {
    const supplyItem = suppliesStore.getItemById(invItem.itemId)
    if (!supplyItem) continue

    if (supplyItem.category === 'habitat_item') {
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

const beddingItems = computed(() => {
  const items: Array<{ itemId: string; name: string; emoji: string; formattedAmount: string }> = []

  for (const invItem of inventoryStore.allItems) {
    const supplyItem = suppliesStore.getItemById(invItem.itemId)
    if (!supplyItem) continue

    if (supplyItem.category === 'bedding') {
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

function tileTheme(category: string) {
  switch (category) {
    case 'hay':
      return { '--tile-soft': '#ecfccb', '--tile-deep': 'var(--color-green)' }
    case 'food':
      return { '--tile-soft': 'var(--color-pink-100)', '--tile-deep': 'var(--color-pink-deep)' }
    default:
      return { '--tile-soft': 'var(--color-cyan-100)', '--tile-deep': 'var(--color-cyan-700)' }
  }
}

function handleItemClick(itemId: string) {
  if (selectedItemId.value === itemId) {
    selectedItemId.value = null
    emit('deselect')
  } else {
    selectedItemId.value = itemId
    emit('select', itemId)
  }
}

defineExpose({
  clearSelection: () => {
    selectedItemId.value = null
  }
})
</script>
