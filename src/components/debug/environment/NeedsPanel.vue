<template>
  <div class="needs-panel">
    <DebugPanel v-if="hasActiveGuineaPigs" title="🍎 Needs" accent="var(--color-green-500)">
      <div class="needs-panel__pigs">
        <div
          v-for="guineaPig in guineaPigStore.activeGuineaPigs"
          :key="guineaPig.id"
          class="needs-panel__pig"
        >
          <h4 class="needs-panel__pig-name">{{ guineaPig.name }}</h4>

          <DebugSection title="Critical Needs">
            <div class="needs-panel__list">
              <DebugSlider
                v-for="need in criticalNeeds"
                :key="`${guineaPig.id}-${need}`"
                :model-value="Math.round(guineaPig.needs[need])"
                :label="formatNeedName(need)"
                :accent="`var(--color-need-${need})`"
                @update:model-value="(value: number) => adjustNeed(guineaPig.id, need, value)"
              />
            </div>
          </DebugSection>

          <DebugSection title="Environmental Needs">
            <div class="needs-panel__list">
              <DebugSlider
                v-for="need in environmentalNeeds"
                :key="`${guineaPig.id}-${need}`"
                :model-value="Math.round(guineaPig.needs[need])"
                :label="formatNeedName(need)"
                :accent="`var(--color-need-${need})`"
                @update:model-value="(value: number) => adjustNeed(guineaPig.id, need, value)"
              />
            </div>
          </DebugSection>

          <DebugSection title="Wellness Needs">
            <div class="needs-panel__list">
              <DebugSlider
                v-for="need in wellnessNeeds"
                :key="`${guineaPig.id}-${need}`"
                :model-value="Math.round(guineaPig.needs[need])"
                :label="formatNeedName(need)"
                :accent="`var(--color-need-${need})`"
                @update:model-value="(value: number) => adjustNeed(guineaPig.id, need, value)"
              />
            </div>
          </DebugSection>

          <div class="needs-panel__actions">
            <Button
              @click="replenishAllNeeds(guineaPig.id)"
              variant="primary"
              size="sm"
            >
              ✨ Replenish All Needs
            </Button>
          </div>
        </div>
      </div>
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
import { computed } from 'vue'
import { useGuineaPigStore } from '../../../stores/guineaPigStore'
import Button from '../../basic/Button.vue'
import DebugPanel from '../ui/DebugPanel.vue'
import DebugSection from '../ui/DebugSection.vue'
import DebugSlider from '../ui/DebugSlider.vue'
import type { NeedType } from '../../../stores/guineaPigStore'

const guineaPigStore = useGuineaPigStore()

const hasActiveGuineaPigs = computed(() => guineaPigStore.activeGuineaPigs.length > 0)

// Need categories
const criticalNeeds: NeedType[] = ['hunger', 'thirst', 'energy']
const environmentalNeeds: NeedType[] = ['shelter', 'hygiene', 'chew']
const wellnessNeeds: NeedType[] = ['play', 'social', 'comfort', 'nails']

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
 * Replenish all needs to 100% for a specific guinea pig
 */
function replenishAllNeeds(guineaPigId: string) {
  const guineaPig = guineaPigStore.getGuineaPig(guineaPigId)
  if (!guineaPig) return

  const allNeeds: NeedType[] = [...criticalNeeds, ...environmentalNeeds, ...wellnessNeeds]
  allNeeds.forEach(need => {
    const currentValue = guineaPig.needs[need]
    const delta = 100 - currentValue
    guineaPigStore.adjustNeed(guineaPigId, need, delta)
  })
}
</script>

<style>
.needs-panel {
  container-type: inline-size;
  container-name: needs-panel;
}

.needs-panel__pigs {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.needs-panel__pig {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  min-inline-size: 0;
}

.needs-panel__pig-name {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
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

/* Side-by-side columns once there's room for both */
@container needs-panel (min-width: 640px) {
  .needs-panel__pigs {
    flex-direction: row;
    align-items: stretch;
  }

  .needs-panel__pig {
    flex: 1 1 0;
  }

  .needs-panel__pig:not(:last-child) {
    padding-inline-end: var(--space-6);
    border-inline-end: 1px solid var(--color-border-light);
  }
}
</style>
