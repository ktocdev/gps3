<template>
  <BaseDialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    size="md"
    :close-on-backdrop="false"
    :close-on-escape="false"
  >
    <div class="pause-overlay">
      <div class="pause-overlay__header">
        <div class="pause-overlay__icon">⏸️</div>
        <h2 class="pause-overlay__title">Game Paused</h2>
        <p class="pause-overlay__subtitle">{{ subtitle }}</p>
      </div>

      <div class="pause-overlay__content">
        <p class="pause-overlay__message">
          {{ message }}
        </p>
        <p class="pause-overlay__hint">
          {{ hint }}
        </p>
      </div>

      <div class="pause-overlay__footer">
        <Button
          @click="handleClose"
          variant="tertiary"
          size="lg"
        >
          Close and Pause
        </Button>
        <Button
          @click="handleResume"
          variant="primary"
          size="lg"
        >
          ▶️ Resume Game
        </Button>
      </div>
    </div>
  </BaseDialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseDialog from '../../basic/dialogs/BaseDialog.vue'
import Button from '../../basic/Button.vue'

interface Props {
  modelValue: boolean
  pauseReason?: 'manual' | 'visibility' | 'orientation' | 'navigation'
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'resume'): void
}

const props = withDefaults(defineProps<Props>(), {
  pauseReason: 'manual'
})
const emit = defineEmits<Emits>()

// Configurable content based on pause reason
const subtitle = computed(() => {
  switch (props.pauseReason) {
    case 'visibility':
      return 'Your guinea pigs are waiting for you!'
    case 'manual':
      return 'Take a break and come back anytime!'
    case 'orientation':
      return 'Rotate your device to continue'
    case 'navigation':
      return 'Game paused while browsing'
    default:
      return 'Your guinea pigs are waiting for you!'
  }
})

const message = computed(() => {
  switch (props.pauseReason) {
    case 'visibility':
      return 'The game has been paused because you switched to another tab or window.'
    case 'manual':
      return 'You have manually paused the game. Your guinea pigs will wait patiently for you to return.'
    case 'orientation':
      return 'The game is paused because your device is in portrait mode. Please rotate to landscape orientation.'
    case 'navigation':
      return 'The game was paused when you navigated away from the game view.'
    default:
      return 'The game is currently paused.'
  }
})

const hint = computed(() => {
  switch (props.pauseReason) {
    case 'visibility':
      return 'Resume to continue playing, or close this dialog to keep the game paused.'
    case 'manual':
      return 'Click Resume Game when you\'re ready to continue caring for your guinea pigs.'
    case 'orientation':
      return 'Once you rotate your device, click Resume Game to continue.'
    case 'navigation':
      return 'Resume to continue playing, or close this dialog to keep the game paused.'
    default:
      return 'Resume to continue playing, or close this dialog to keep the game paused.'
  }
})

function handleResume() {
  emit('resume')
  emit('update:modelValue', false)
}

function handleClose() {
  // Just close the dialog, keep game paused
  emit('update:modelValue', false)
}
</script>

<style>
.pause-overlay {
  display: flex;
  flex-direction: column;
  min-block-size: 300px;
}

.pause-overlay__header {
  padding: var(--space-8);
  text-align: center;
  border-block-end: 1px solid var(--color-border);
}

.pause-overlay__icon {
  font-size: 3rem;
  line-height: 1;
  margin-block-end: var(--space-4);
}

.pause-overlay__title {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.pause-overlay__subtitle {
  margin: var(--space-2) 0 0 0;
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
}

.pause-overlay__content {
  padding: var(--space-6);
  flex: 1;
  text-align: center;
}

.pause-overlay__message {
  margin: 0 0 var(--space-4) 0;
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  line-height: 1.6;
}

.pause-overlay__hint {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  line-height: 1.5;
}

.pause-overlay__footer {
  padding: var(--space-6);
  border-block-start: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--space-3);
}

/* Tablet and larger - horizontal button layout */
@media (min-width: 641px) {
  .pause-overlay__icon {
    font-size: 4rem;
  }

  .pause-overlay__title {
    font-size: var(--font-size-2xl);
  }

  .pause-overlay__footer {
    flex-direction: row;
  }
}
</style>
