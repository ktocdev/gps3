<template>
  <div class="friendship-progress">
    <div class="friendship-progress__header">
      <span class="friendship-progress__label">Friendship</span>
      <span class="friendship-progress__value">{{ friendshipPercentage }}%</span>
    </div>
    <div class="friendship-progress__bar-container">
      <div
        class="friendship-progress__bar"
        :class="friendshipBarClass"
        :style="{ width: friendshipPercentage + '%' }"
      >
        <div class="friendship-progress__bar-shine"></div>
      </div>
      <div class="friendship-progress__threshold-marker" :style="{ left: thresholdPercentage + '%' }">
        <div class="friendship-progress__threshold-line"></div>
        <div class="friendship-progress__threshold-label">{{ thresholdPercentage }}%</div>
      </div>
    </div>
    <div class="friendship-progress__message" v-if="message">
      {{ message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  friendship: number
  threshold?: number
  showMessage?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  threshold: 85,
  showMessage: true
})

const friendshipPercentage = computed(() => Math.round(props.friendship))
const thresholdPercentage = computed(() => props.threshold)

const friendshipBarClass = computed(() => {
  const percentage = friendshipPercentage.value
  if (percentage >= props.threshold) {
    return 'friendship-progress__bar--complete'
  } else if (percentage >= 70) {
    return 'friendship-progress__bar--high'
  } else if (percentage >= 50) {
    return 'friendship-progress__bar--medium'
  } else if (percentage >= 30) {
    return 'friendship-progress__bar--low'
  } else {
    return 'friendship-progress__bar--very-low'
  }
})

const message = computed(() => {
  if (!props.showMessage) return null

  const percentage = friendshipPercentage.value
  const remaining = props.threshold - percentage

  if (percentage >= props.threshold) {
    return '✨ Ready for Stardust Sanctuary!'
  } else if (remaining <= 5) {
    return `Almost there! ${remaining}% to Stardust Sanctuary`
  } else if (remaining <= 15) {
    return `${remaining}% to Stardust Sanctuary`
  } else {
    return `Build friendship to ${props.threshold}% for Stardust Sanctuary`
  }
})
</script>

<style>
.friendship-progress {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.friendship-progress__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.friendship-progress__label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text);
}

.friendship-progress__value {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-primary);
}

.friendship-progress__bar-container {
  position: relative;
  inline-size: 100%;
  block-size: 24px;
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-full);
  border: 2px solid var(--color-border-medium);
  overflow: visible;
}

.friendship-progress__bar {
  block-size: 100%;
  border-radius: var(--radius-full);
  transition: width 0.5s ease, background-color 0.3s ease;
  position: relative;
  overflow: hidden;
}

.friendship-progress__bar--very-low {
  background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);
}

.friendship-progress__bar--low {
  background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
}

.friendship-progress__bar--medium {
  background: linear-gradient(90deg, #eab308 0%, #ca8a04 100%);
}

.friendship-progress__bar--high {
  background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
}

.friendship-progress__bar--complete {
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  animation: pulse-glow 2s ease-in-out infinite;
}

.friendship-progress__bar-shine {
  position: absolute;
  inset-block-start: 0;
  inset-inline-start: -100%;
  inline-size: 100%;
  block-size: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 100%
  );
  animation: shine 2s ease-in-out infinite;
}

@keyframes shine {
  0% {
    inset-inline-start: -100%;
  }
  100% {
    inset-inline-start: 200%;
  }
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.8);
  }
}

.friendship-progress__threshold-marker {
  position: absolute;
  inset-block-start: -8px;
  block-size: calc(100% + 16px);
  inline-size: 2px;
  transform: translateX(-50%);
  pointer-events: none;
}

.friendship-progress__threshold-line {
  inline-size: 100%;
  block-size: 100%;
  background-color: var(--color-text-muted);
  opacity: 0.6;
  border-radius: var(--radius-sm);
}

.friendship-progress__threshold-label {
  position: absolute;
  inset-block-start: -20px;
  inset-inline-start: 50%;
  transform: translateX(-50%);
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.friendship-progress__message {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  text-align: center;
  font-weight: 500;
}
</style>
