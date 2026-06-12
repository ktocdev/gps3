<template>
  <div
    ref="bottleRef"
    class="water-bottle"
    :class="fullnessClass"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <span class="water-bottle__water no-select">💧</span>

    <HabitatItemPopover
      :title="popoverTitle"
      :metadata="popoverMetadata"
      :actions="popoverActions"
      :is-hovered="isHovered"
      :target-element="bottleRef"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import HabitatItemPopover from './HabitatItemPopover.vue'
import { useHabitatConditions } from '../../../stores/habitatConditions'

interface Props {
  waterLevel: number // 0-100
  bottleEmoji: string
}

const props = defineProps<Props>()

const habitatConditions = useHabitatConditions()
const bottleRef = ref<HTMLElement | null>(null)
const isHovered = ref(false)

// Popover title
const popoverTitle = computed(() => {
  return 'Water Bottle'
})

// Metadata for the popover
const popoverMetadata = computed(() => {
  return [
    { label: 'Water Level', value: `${props.waterLevel.toFixed(0)}%` }
  ]
})

// Popover actions
const popoverActions = computed(() => {
  return [
    {
      label: 'Refill Water',
      onClick: handleRefillWater
    }
  ]
})

function handleRefillWater() {
  habitatConditions.refillWater()
}

const fullnessClass = computed(() => {
  const level = props.waterLevel
  console.log('WaterBottle waterLevel:', level)
  if (level === 0) return 'water-bottle--empty'
  if (level <= 25) return 'water-bottle--low'
  if (level <= 50) return 'water-bottle--half'
  if (level <= 75) return 'water-bottle--three-quarters'
  return 'water-bottle--full'
})
</script>

<style>
.water-bottle {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  inline-size: 100%;
  block-size: 100%;
  border-radius: 8px;
  transition: background-color 0.4s ease;
}

.water-bottle__water {
  font-size: 3rem;
  line-height: 1;
  position: absolute;
  inset-block-start: 50%;
  inset-inline-start: 50%;
  transform: translate(-50%, -50%);
  transition: opacity 0.3s ease;
  z-index: 1;
}

/* Background color fades from blue (full) to white (empty) */
.water-bottle--full {
  background-color: rgba(59, 130, 246, 0.5); /* medium blue at 50% opacity */
}

.water-bottle--full .water-bottle__water {
  opacity: 1;
}

.water-bottle--three-quarters {
  background-color: rgba(59, 130, 246, 0.35);
}

.water-bottle--three-quarters .water-bottle__water {
  opacity: 0.95;
}

.water-bottle--half {
  background-color: rgba(59, 130, 246, 0.2);
}

.water-bottle--half .water-bottle__water {
  opacity: 0.85;
}

.water-bottle--low {
  background-color: rgba(59, 130, 246, 0.08);
}

.water-bottle--low .water-bottle__water {
  opacity: 0.7;
}

.water-bottle--empty {
  background-color: rgba(255, 255, 255, 0); /* transparent/white */
}

.water-bottle--empty .water-bottle__water {
  opacity: 0.5; /* emoji still visible but very faded */
}
</style>
