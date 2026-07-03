<template>
  <div class="habitat-tools-debug">
    <NeedsPanel />

    <DebugPanelRow :columns="2">
      <DebugPanel title="💩 Poop System" accent="#84cc16">
        <PoopDebug />
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

        <DebugSection>
          <div class="decay-speed-control">
            <DebugSlider
              :model-value="guineaPigStore.settings.needsDecayRate"
              label="Needs"
              :min="0"
              :max="2"
              :step="0.05"
              suffix="x"
              accent="#a78bfa"
              @update:model-value="(v: number) => guineaPigStore.setNeedsDecayRate(v)"
            />
            <div class="btn-row">
              <Button
                @click="guineaPigStore.setNeedsDecayRate(0)"
                variant="tertiary"
                size="sm"
                :class="{ 'button--active': guineaPigStore.settings.needsDecayRate === 0 }"
              >
                Paused (0x)
              </Button>
              <Button
                @click="guineaPigStore.setNeedsDecayRate(0.1)"
                variant="tertiary"
                size="sm"
                :class="{ 'button--active': guineaPigStore.settings.needsDecayRate === 0.1 }"
              >
                Very Slow (0.1x)
              </Button>
              <Button
                @click="guineaPigStore.setNeedsDecayRate(0.5)"
                variant="tertiary"
                size="sm"
                :class="{ 'button--active': guineaPigStore.settings.needsDecayRate === 0.5 }"
              >
                Slow (0.5x)
              </Button>
              <Button
                @click="guineaPigStore.setNeedsDecayRate(1)"
                variant="tertiary"
                size="sm"
                :class="{ 'button--active': guineaPigStore.settings.needsDecayRate === 1 }"
              >
                Normal (1x)
              </Button>
              <Button
                @click="guineaPigStore.setNeedsDecayRate(2)"
                variant="tertiary"
                size="sm"
                :class="{ 'button--active': guineaPigStore.settings.needsDecayRate === 2 }"
              >
                Fast (2x)
              </Button>
            </div>
          </div>
        </DebugSection>
      </DebugPanel>
    </DebugPanelRow>
  </div>
</template>

<script setup lang="ts">
import { useHabitatConditions } from '../../../stores/habitatConditions'
import { useGuineaPigStore } from '../../../stores/guineaPigStore'
import Button from '../../basic/Button.vue'
import DebugPanel from '../ui/DebugPanel.vue'
import DebugPanelRow from '../ui/DebugPanelRow.vue'
import DebugSection from '../ui/DebugSection.vue'
import DebugSlider from '../ui/DebugSlider.vue'
import NeedsPanel from './NeedsPanel.vue'
import PoopDebug from './PoopDebug.vue'

const habitat = useHabitatConditions()
const guineaPigStore = useGuineaPigStore()
</script>

<style>
.habitat-tools-debug {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
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
</style>
