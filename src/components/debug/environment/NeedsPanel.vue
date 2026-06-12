<template>
  <div class="needs-panel">
    <div v-if="hasActiveGuineaPigs" class="panel panel--compact panel--accent">
      <div class="panel__header">
        <h3>🍎 Needs</h3>
        <!-- Toggle between guinea pigs if there are multiple -->
        <Button
          v-if="guineaPigStore.activeGuineaPigs.length > 1"
          @click="toggleGuineaPig"
          variant="tertiary"
          size="sm"
        >
          {{ selectedGuineaPig?.name }} ({{ selectedGuineaPigIndex + 1 }}/{{ guineaPigStore.activeGuineaPigs.length }})
        </Button>
      </div>
      <div v-if="selectedGuineaPig" class="panel__content">
        <!-- Critical Needs -->
        <div class="needs-category mb-4">
          <h4 class="needs-category__title">Critical Needs</h4>
          <div class="needs-list">
            <NeedRow
              v-for="need in criticalNeeds"
              :key="need"
              :id="`${selectedGuineaPig!.id}-${need}`"
              :label="formatNeedName(need)"
              :value="selectedGuineaPig!.needs[need]"
              :needType="need"
              @update:modelValue="(value: number) => adjustNeed(selectedGuineaPig!.id, need, value)"
            />
          </div>
        </div>

        <!-- Environmental Needs -->
        <div class="needs-category mb-4">
          <h4 class="needs-category__title">Environmental Needs</h4>
          <div class="needs-list">
            <NeedRow
              v-for="need in environmentalNeeds"
              :key="need"
              :id="`${selectedGuineaPig!.id}-${need}`"
              :label="formatNeedName(need)"
              :value="selectedGuineaPig!.needs[need]"
              :needType="need"
              @update:modelValue="(value: number) => adjustNeed(selectedGuineaPig!.id, need, value)"
            />
          </div>
        </div>

        <!-- Wellness Needs -->
        <div class="needs-category">
          <h4 class="needs-category__title">Wellness Needs</h4>
          <div class="needs-list">
            <NeedRow
              v-for="need in wellnessNeeds"
              :key="need"
              :id="`${selectedGuineaPig!.id}-${need}`"
              :label="formatNeedName(need)"
              :value="selectedGuineaPig!.needs[need]"
              :needType="need"
              @update:modelValue="(value: number) => adjustNeed(selectedGuineaPig!.id, need, value)"
            />
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="needs-actions mt-4">
          <Button
            @click="replenishAllNeeds"
            variant="primary"
            size="sm"
          >
            Replenish All Needs
          </Button>
        </div>
      </div>
    </div>

    <div v-else class="panel panel--compact panel--warning">
      <div class="panel__content text-center">
        <p class="text-label text-label--muted mb-2">No guinea pigs in game</p>
        <p class="text-label--small">Start a game in the Game Controller view to see needs data.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useGuineaPigStore } from '../../../stores/guineaPigStore'
import NeedRow from '../../basic/NeedRow.vue'
import Button from '../../basic/Button.vue'
import type { NeedType } from '../../../stores/guineaPigStore'

const guineaPigStore = useGuineaPigStore()

// Track which guinea pig is selected (for multi-pig scenarios)
const selectedGuineaPigIndex = ref(0)

const hasActiveGuineaPigs = computed(() => guineaPigStore.activeGuineaPigs.length > 0)

const selectedGuineaPig = computed(() => {
  if (!hasActiveGuineaPigs.value) return null
  return guineaPigStore.activeGuineaPigs[selectedGuineaPigIndex.value]
})

// Need categories
const criticalNeeds: NeedType[] = ['hunger', 'thirst', 'energy']
const environmentalNeeds: NeedType[] = ['shelter', 'hygiene', 'chew']
const wellnessNeeds: NeedType[] = ['play', 'social', 'comfort', 'nails']

/**
 * Toggle to next guinea pig
 */
function toggleGuineaPig() {
  const total = guineaPigStore.activeGuineaPigs.length
  selectedGuineaPigIndex.value = (selectedGuineaPigIndex.value + 1) % total
}

/**
 * Watch for guinea pig selection changes from sprite clicks
 * and update local index to match
 */
watch(
  () => guineaPigStore.selectedGuineaPigId,
  (selectedId) => {
    if (!selectedId) return

    // Find the index of the selected guinea pig in active guinea pigs
    const index = guineaPigStore.activeGuineaPigs.findIndex(gp => gp.id === selectedId)
    if (index !== -1) {
      selectedGuineaPigIndex.value = index
    }
  }
)

/**
 * Format need name for display
 */
function formatNeedName(need: NeedType): string {
  return need.charAt(0).toUpperCase() + need.slice(1)
}

/**
 * Adjust a need value (absolute set, not delta)
 */
function adjustNeed(guineaPigId: string, need: NeedType, newValue: number) {
  const guineaPig = guineaPigStore.getGuineaPig(guineaPigId)
  if (!guineaPig) return

  const currentValue = guineaPig.needs[need]
  const delta = newValue - currentValue
  guineaPigStore.adjustNeed(guineaPigId, need, delta)
}

/**
 * Replenish all needs to 100%
 */
function replenishAllNeeds() {
  if (!selectedGuineaPig.value) return

  const allNeeds: NeedType[] = [...criticalNeeds, ...environmentalNeeds, ...wellnessNeeds]
  allNeeds.forEach(need => {
    const currentValue = selectedGuineaPig.value!.needs[need]
    const delta = 100 - currentValue
    guineaPigStore.adjustNeed(selectedGuineaPig.value!.id, need, delta)
  })
}
</script>

<style scoped>
.needs-panel {
  container-type: inline-size;
  container-name: needs-panel;
}

.needs-category {
  margin-block-end: var(--space-4);
}

.needs-category:last-child {
  margin-block-end: 0;
}

.needs-category__title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  margin-block-end: var(--space-3);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.needs-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

/* Need item styles now in NeedRow.vue component */

.needs-actions {
  display: flex;
  justify-content: center;
  padding-block-start: var(--space-4);
  border-block-start: 1px solid var(--color-border-light);
}
</style>
