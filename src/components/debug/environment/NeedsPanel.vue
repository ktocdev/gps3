<template>
  <div class="needs-panel">
    <DebugPanel v-if="hasActiveGuineaPigs" title="🍎 Needs" accent="var(--color-green-500)">
      <template #header-extra>
        <Button
          v-if="guineaPigStore.activeGuineaPigs.length > 1"
          @click="toggleGuineaPig"
          variant="tertiary"
          size="sm"
        >
          {{ selectedGuineaPig?.name }} ({{ selectedGuineaPigIndex + 1 }}/{{ guineaPigStore.activeGuineaPigs.length }})
        </Button>
      </template>

      <template v-if="selectedGuineaPig" #default>
        <DebugSection title="Critical Needs">
          <div class="needs-panel__list">
            <DebugSlider
              v-for="need in criticalNeeds"
              :key="`${selectedGuineaPig!.id}-${need}`"
              :model-value="Math.round(selectedGuineaPig!.needs[need])"
              :label="formatNeedName(need)"
              :accent="`var(--color-need-${need})`"
              @update:model-value="(value: number) => adjustNeed(selectedGuineaPig!.id, need, value)"
            />
          </div>
        </DebugSection>

        <DebugSection title="Environmental Needs">
          <div class="needs-panel__list">
            <DebugSlider
              v-for="need in environmentalNeeds"
              :key="`${selectedGuineaPig!.id}-${need}`"
              :model-value="Math.round(selectedGuineaPig!.needs[need])"
              :label="formatNeedName(need)"
              :accent="`var(--color-need-${need})`"
              @update:model-value="(value: number) => adjustNeed(selectedGuineaPig!.id, need, value)"
            />
          </div>
        </DebugSection>

        <DebugSection title="Wellness Needs">
          <div class="needs-panel__list">
            <DebugSlider
              v-for="need in wellnessNeeds"
              :key="`${selectedGuineaPig!.id}-${need}`"
              :model-value="Math.round(selectedGuineaPig!.needs[need])"
              :label="formatNeedName(need)"
              :accent="`var(--color-need-${need})`"
              @update:model-value="(value: number) => adjustNeed(selectedGuineaPig!.id, need, value)"
            />
          </div>
        </DebugSection>

        <div class="needs-panel__actions">
          <Button
            @click="replenishAllNeeds"
            variant="primary"
            size="sm"
          >
            ✨ Replenish All Needs
          </Button>
        </div>
      </template>
    </DebugPanel>

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
import Button from '../../basic/Button.vue'
import DebugPanel from '../ui/DebugPanel.vue'
import DebugSection from '../ui/DebugSection.vue'
import DebugSlider from '../ui/DebugSlider.vue'
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

<style>
.needs-panel {
  container-type: inline-size;
  container-name: needs-panel;
}

.needs-panel__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.needs-panel__actions {
  display: flex;
  justify-content: center;
  margin-block-start: var(--space-4);
}
</style>
