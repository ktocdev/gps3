<template>
  <div
    ref="itemRef"
    class="chew-item"
    :class="durabilityClass"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <span class="chew-item__emoji no-select" :style="durabilityStyle">{{ itemEmoji }}</span>

    <HabitatItemPopover
      :title="itemName"
      :metadata="popoverMetadata"
      :actions="popoverActions"
      :is-hovered="isHovered"
      :target-element="itemRef"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { CHEW_DEGRADATION } from '../../../constants/supplies'
import HabitatItemPopover from './HabitatItemPopover.vue'

interface Props {
  itemEmoji: string
  itemName: string
  durability: number
  usageCount: number
  lastUsedAt: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'test-chew': []
  'remove-chew': []
  'discard-chew': []
}>()

const itemRef = ref<HTMLElement | null>(null)
const isHovered = ref(false)

const popoverMetadata = computed(() => {
  const timeSinceUse = Date.now() - props.lastUsedAt
  const minutesAgo = Math.floor(timeSinceUse / 60000)
  const hoursAgo = Math.floor(minutesAgo / 60)

  let lastUsedText = 'Just now'
  if (hoursAgo > 0) {
    lastUsedText = `${hoursAgo}h ago`
  } else if (minutesAgo > 0) {
    lastUsedText = `${minutesAgo}m ago`
  }

  return [
    { label: 'Durability', value: `${props.durability.toFixed(0)}%` },
    { label: 'Usage Count', value: props.usageCount.toString() },
    { label: 'Last Used', value: lastUsedText }
  ]
})

const popoverActions = computed(() => {
  const actions: Array<{ label: string; variant: 'default' | 'warning' | 'danger'; onClick: () => void }> = []

  // Test chew button (for debugging)
  if (props.durability >= CHEW_DEGRADATION.UNSAFE_THRESHOLD) {
    actions.push({
      label: '🦷 Test Chew',
      variant: 'default',
      onClick: () => emit('test-chew')
    })
  }

  // Remove chew button - always visible (returns to inventory at current durability)
  actions.push({
    label: '📦 Remove Chew',
    variant: 'default',
    onClick: () => emit('remove-chew')
  })

  // Discard button - only shows when durability < 20% (safety hazard)
  if (props.durability < CHEW_DEGRADATION.UNSAFE_THRESHOLD) {
    actions.push({
      label: '🗑️ Discard Unsafe Chew',
      variant: 'danger',
      onClick: () => emit('discard-chew')
    })
  }

  return actions
})

// Visual feedback based on durability
const durabilityClass = computed(() => {
  if (props.durability < CHEW_DEGRADATION.UNSAFE_THRESHOLD) return 'chew-item--unsafe'
  if (props.durability < CHEW_DEGRADATION.DEGRADED_THRESHOLD) return 'chew-item--degraded'
  if (props.durability < CHEW_DEGRADATION.WORN_THRESHOLD) return 'chew-item--worn'
  return 'chew-item--fresh'
})

// Reduce opacity as durability decreases
const durabilityStyle = computed(() => {
  const minOpacity = 0.4
  const maxOpacity = 1.0
  const opacity = minOpacity + (props.durability / 100) * (maxOpacity - minOpacity)
  return { opacity: opacity.toString() }
})
</script>

<style>
.chew-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  inline-size: 100%;
  block-size: 100%;
  transition: filter 0.3s ease;
}

.chew-item__emoji {
  font-size: 2.5rem;
  line-height: 1;
  transition: opacity 0.3s ease, filter 0.3s ease;
}

/* Durability states */
.chew-item--fresh .chew-item__emoji {
  filter: brightness(1) saturate(1);
}

.chew-item--worn .chew-item__emoji {
  filter: brightness(0.95) saturate(0.85);
}

.chew-item--degraded .chew-item__emoji {
  filter: brightness(0.85) saturate(0.6) sepia(0.2);
}

.chew-item--unsafe .chew-item__emoji {
  filter: brightness(0.7) saturate(0.4) sepia(0.4);
  animation: unsafe-pulse 2s ease-in-out infinite;
}

/* Pulse animation for unsafe chews */
@keyframes unsafe-pulse {
  0%, 100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.7;
  }
}
</style>
