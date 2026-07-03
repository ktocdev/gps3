<template>
  <div class="habitat-status-debug">
    <DebugPanelRow :columns="2">
      <DebugPanel title="🏠 Habitat" accent="#d97706">
        <DebugSection title="Conditions">
          <div class="habitat-status-debug__list">
            <DebugSlider
              :model-value="Math.round(habitat.cleanliness)"
              label="Cleanliness"
              accent="var(--color-need-hygiene)"
              @update:model-value="(v: number) => habitat.updateCondition('cleanliness', v)"
            />
            <DebugSlider
              :model-value="Math.round(habitat.beddingFreshness)"
              label="Bedding Freshness"
              accent="var(--color-need-comfort)"
              @update:model-value="(v: number) => habitat.updateCondition('beddingFreshness', v)"
            />
            <DebugSlider
              :model-value="Math.round(habitat.hayFreshness)"
              label="Hay Freshness"
              accent="var(--color-need-hunger)"
              @update:model-value="(v: number) => habitat.updateCondition('hayFreshness', v)"
            />
          </div>
          <div class="habitat-status-debug__actions">
            <Button @click="habitat.resetHabitatConditions()" variant="primary" size="sm">
              ✨ Reset All to 100%
            </Button>
          </div>
        </DebugSection>
      </DebugPanel>

      <DebugPanel title="⏱️ Decay Speed" accent="#a78bfa">
        <DebugSection>
          <div class="decay-speed-control">
            <DebugSlider
              :model-value="habitat.decaySpeedMultiplier"
              label="Habitat"
              :min="1"
              :max="60"
              :step="1"
              suffix="x"
              accent="#a78bfa"
              @update:model-value="(v: number) => habitat.setDecaySpeed(v)"
            />
            <div class="btn-row">
              <Button
                @click="habitat.setDecaySpeed(6)"
                variant="tertiary"
                size="sm"
                :class="{ 'button--active': habitat.decaySpeedMultiplier === 6 }"
              >
                Relaxed (6x)
              </Button>
              <Button
                @click="habitat.setDecaySpeed(12)"
                variant="tertiary"
                size="sm"
                :class="{ 'button--active': habitat.decaySpeedMultiplier === 12 }"
              >
                Normal (12x)
              </Button>
              <Button
                @click="habitat.setDecaySpeed(24)"
                variant="tertiary"
                size="sm"
                :class="{ 'button--active': habitat.decaySpeedMultiplier === 24 }"
              >
                Fast (24x)
              </Button>
            </div>
          </div>
        </DebugSection>
      </DebugPanel>
    </DebugPanelRow>

    <div class="habitat-status-debug__placed-layout">
      <DebugPanel title="📦 Placed Items" accent="#0ea5e9" class="habitat-status-debug__placed-main">
        <DebugSection title="Items in Habitat">
          <div v-if="habitat.habitatItems.length === 0" class="text-label text-label--muted">
            No items placed.
          </div>
          <div v-else class="habitat-items-list">
            <div
              v-for="placementId in habitat.habitatItems"
              :key="placementId"
              class="habitat-item-card"
            >
              <div class="habitat-item-card__header">
                <span class="habitat-item-card__emoji">{{ itemEmoji(placementId) }}</span>
                <span class="habitat-item-card__name">{{ itemName(placementId) }}</span>
                <Button
                  variant="danger"
                  size="sm"
                  @click="habitat.removeItemFromHabitat(placementId)"
                >
                  Remove
                </Button>
              </div>

              <!-- Water bottle -->
              <div v-if="itemType(placementId) === 'water_bottle'" class="habitat-item-card__content">
                <DebugSlider
                  :model-value="Math.round(containers.getWaterBottleLevel(placementId))"
                  label="Water Level"
                  accent="var(--color-need-thirst)"
                  @update:model-value="(v: number) => containers.setWaterBottleLevel(placementId, v)"
                />
                <div class="btn-row">
                  <Button variant="tertiary" size="sm" @click="containers.refillWaterBottle(placementId)">
                    Refill
                  </Button>
                  <Button variant="tertiary" size="sm" @click="containers.setWaterBottleLevel(placementId, 0)">
                    Empty
                  </Button>
                </div>
              </div>

              <!-- Food bowl -->
              <div v-else-if="itemType(placementId) === 'food_bowl'" class="habitat-item-card__content">
                <div v-if="containers.getBowlContents(placementId).length === 0" class="text-label--small text-label--muted">
                  Empty
                </div>
                <ul v-else class="habitat-item-card__contents-list">
                  <li v-for="(food, index) in containers.getBowlContents(placementId)" :key="index">
                    {{ food.emoji }} {{ food.name }} — {{ Math.round(food.freshness) }}% fresh
                  </li>
                </ul>
                <Button
                  variant="tertiary"
                  size="sm"
                  :disabled="containers.getBowlContents(placementId).length === 0"
                  @click="containers.clearBowl(placementId)"
                >
                  Empty Bowl
                </Button>
              </div>

              <!-- Hay rack -->
              <div v-else-if="itemType(placementId) === 'hay_rack'" class="habitat-item-card__content">
                <div v-if="containers.getHayRackContents(placementId).length === 0" class="text-label--small text-label--muted">
                  Empty
                </div>
                <ul v-else class="habitat-item-card__contents-list">
                  <li v-for="(serving, index) in containers.getHayRackContents(placementId)" :key="index">
                    🌾 {{ hayServingName(serving.itemId) }}
                  </li>
                </ul>
                <div v-if="containers.getHayRackFreshness(placementId) !== null" class="text-label--small">
                  Freshness: {{ Math.round(containers.getHayRackFreshness(placementId)!) }}%
                </div>
                <Button
                  variant="tertiary"
                  size="sm"
                  :disabled="containers.getHayRackContents(placementId).length === 0"
                  @click="containers.clearHayRack(placementId)"
                >
                  Empty Rack
                </Button>
              </div>

              <!-- Chew -->
              <div v-else-if="isChewItem(placementId)" class="habitat-item-card__content">
                <DebugSlider
                  :model-value="Math.round(containers.getChewDurability(placementId))"
                  label="Durability"
                  accent="var(--color-need-chew)"
                  @update:model-value="(v: number) => containers.setChewDurability(placementId, v)"
                />
                <Button
                  variant="tertiary"
                  size="sm"
                  @click="containers.setChewDurability(placementId, 100)"
                >
                  Reset Durability
                </Button>
              </div>
            </div>
          </div>
        </DebugSection>
      </DebugPanel>

      <!-- Add Item (Debug) — right-column sidebar, mirrors the Friendship legend -->
      <DebugPanel
        title="➕ Add Item (Debug)"
        accent="#0ea5e9"
        class="habitat-status-debug__add-item"
      >
        <div class="add-item-row">
          <select v-model="selectedAddItemId" class="add-item-row__select">
            <option value="" disabled>Choose an item…</option>
            <optgroup
              v-for="group in habitatItemOptions"
              :key="group.subCategory"
              :label="group.label"
            >
              <option v-for="item in group.items" :key="item.id" :value="item.id">
                {{ item.emoji }} {{ item.name }}
              </option>
            </optgroup>
          </select>
          <Button
            variant="primary"
            size="sm"
            :disabled="!selectedAddItemId"
            @click="addDebugItem"
          >
            ➕ Add to Habitat
          </Button>
        </div>
        <p class="text-label--small text-label--muted">
          Spawns the item directly in the habitat — does not touch inventory.
        </p>
      </DebugPanel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useHabitatConditions } from '../../../stores/habitatConditions'
import { useHabitatContainers } from '../../../composables/useHabitatContainers'
import { useSuppliesStore } from '../../../stores/suppliesStore'
import { getBaseItemId } from '../../../utils/placementId'
import Button from '../../basic/Button.vue'
import DebugPanel from '../ui/DebugPanel.vue'
import DebugPanelRow from '../ui/DebugPanelRow.vue'
import DebugSection from '../ui/DebugSection.vue'
import DebugSlider from '../ui/DebugSlider.vue'

const habitat = useHabitatConditions()
const containers = useHabitatContainers()
const suppliesStore = useSuppliesStore()

if (!suppliesStore.catalogLoaded) {
  suppliesStore.initializeCatalog()
}

function itemName(placementId: string): string {
  const baseId = getBaseItemId(placementId)
  return suppliesStore.getItemById(baseId)?.name || baseId
}

function itemEmoji(placementId: string): string {
  const baseId = getBaseItemId(placementId)
  return suppliesStore.getItemById(baseId)?.emoji || '📦'
}

function itemType(placementId: string): string | undefined {
  const baseId = getBaseItemId(placementId)
  return suppliesStore.getItemById(baseId)?.stats?.itemType
}

function isChewItem(placementId: string): boolean {
  // Chew items in the catalog don't set stats.itemType — the rest of the
  // codebase (use3DBehavior, GameView, useGuineaPigBehavior) identifies
  // them by subCategory instead, so match that convention here too.
  const baseId = getBaseItemId(placementId)
  return suppliesStore.getItemById(baseId)?.subCategory === 'chews'
}

function hayServingName(itemId: string): string {
  return suppliesStore.getItemById(itemId)?.name || itemId
}

// Debug "Add Item" picker — grouped by habitat subcategory
const SUBCATEGORY_LABELS: Record<string, string> = {
  bowls_bottles: 'Bowls & Bottles',
  hideaways: 'Hideaways',
  toys: 'Toys',
  chews: 'Chews',
  enrichment: 'Enrichment'
}

const habitatItemOptions = computed(() => {
  const items = suppliesStore.getItemsByCategory('habitat_item')
  const groups = new Map<string, typeof items>()

  items.forEach(item => {
    const key = item.subCategory || 'other'
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(item)
  })

  return Array.from(groups.entries()).map(([subCategory, groupItems]) => ({
    subCategory,
    label: SUBCATEGORY_LABELS[subCategory] || subCategory,
    items: groupItems
  }))
})

const selectedAddItemId = ref('')

function addDebugItem() {
  if (!selectedAddItemId.value) return
  habitat.debugAddItemToHabitat(selectedAddItemId.value)
}
</script>

<style>
.habitat-status-debug {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.habitat-status-debug__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.habitat-status-debug__actions {
  display: flex;
  justify-content: center;
  margin-block-start: var(--space-4);
}

.decay-speed-control {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.button--active {
  background: var(--color-primary);
  color: var(--color-text-inverse);
}

.habitat-status-debug__placed-layout {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: var(--space-4);
}

.habitat-status-debug__placed-main {
  flex: 1;
  min-inline-size: 0;
}

.habitat-status-debug__add-item {
  flex: 1 1 100%;
}

@media (min-width: 768px) {
  .habitat-status-debug__add-item {
    flex: 0 0 320px;
  }
}

.add-item-row {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  align-items: stretch;
}

.add-item-row__select {
  flex: none;
  min-inline-size: 0;
  padding-block: var(--space-2);
  padding-inline: var(--space-2);
  border-radius: var(--radius-base);
  border: 1px solid var(--color-border-medium);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-family: inherit;
  font-size: var(--font-size-sm);
}

.habitat-items-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--space-3);
}

.habitat-item-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  background: var(--color-bg-secondary);
}

.habitat-item-card__header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.habitat-item-card__emoji {
  font-size: var(--font-size-xl);
  line-height: 1;
}

.habitat-item-card__name {
  flex: 1;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.habitat-item-card__content {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.habitat-item-card__contents-list {
  margin: 0;
  padding-inline-start: var(--space-4);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}
</style>
