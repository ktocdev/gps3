<template>
  <div
    v-if="isVisible"
    class="chat-bubble-3d"
    :class="chatBubbleModifierClass"
    :style="positionStyle"
  >
    <div class="chat-bubble-3d__content">
      <span v-if="emoji" class="chat-bubble-3d__emoji">{{ emoji }}</span>
      <span class="chat-bubble-3d__text">{{ message }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  message: string
  emoji?: string
  variant?: 'positive' | 'neutral' | 'negative' | 'warning' | 'critical'
  position: { x: number; y: number }
  isVisible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'neutral',
  isVisible: true
})

const chatBubbleModifierClass = computed(() =>
  props.variant ? `chat-bubble-3d--${props.variant}` : ''
)

const positionStyle = computed(() => ({
  left: `${props.position.x}px`,
  top: `${props.position.y}px`
}))
</script>

<style>
/* 3D Chat Bubble - positioned absolutely within canvas wrapper */
.chat-bubble-3d {
  position: absolute;
  transform: translate(-50%, -100%);
  z-index: 100;
  pointer-events: none;

  padding-block: var(--spacing-2xs);
  padding-inline: var(--spacing-xs);

  background-color: var(--color-surface-elevated);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);

  box-shadow: var(--shadow-md);

  animation: chat-bubble-3d-enter 0.2s ease-out;
}

/* Tail/pointer pointing down toward guinea pig */
.chat-bubble-3d::after {
  content: '';
  position: absolute;
  inset-block-start: 100%;
  inset-inline-start: 50%;
  transform: translateX(-50%);

  inline-size: 0;
  block-size: 0;
  border-inline: 6px solid transparent;
  border-block-start: 6px solid var(--color-surface-elevated);
}

@keyframes chat-bubble-3d-enter {
  0% {
    opacity: 0;
    transform: translate(-50%, -100%) translateY(8px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -100%) translateY(0) scale(1);
  }
}

/* Content layout */
.chat-bubble-3d__content {
  display: flex;
  align-items: center;
  gap: var(--spacing-2xs);
  white-space: nowrap;
}

.chat-bubble-3d__emoji {
  font-size: var(--font-size-md);
  line-height: 1;
}

.chat-bubble-3d__text {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-neutral-800);
}

/* Variant colors - Neutral */
.chat-bubble-3d--neutral {
  background-color: var(--color-neutral-100);
  border-color: var(--color-neutral-300);
}

.chat-bubble-3d--neutral::after {
  border-block-start-color: var(--color-neutral-100);
}

.chat-bubble-3d--neutral .chat-bubble-3d__text {
  color: var(--color-neutral-800);
}

/* Variant colors - Positive */
.chat-bubble-3d--positive {
  background-color: var(--color-success-surface);
  border-color: var(--color-success-border);
}

.chat-bubble-3d--positive::after {
  border-block-start-color: var(--color-success-surface);
}

.chat-bubble-3d--positive .chat-bubble-3d__text {
  color: var(--color-accent-green-800);
}

/* Variant colors - Negative */
.chat-bubble-3d--negative {
  background-color: var(--color-danger-surface);
  border-color: var(--color-danger-border);
}

.chat-bubble-3d--negative::after {
  border-block-start-color: var(--color-danger-surface);
}

.chat-bubble-3d--negative .chat-bubble-3d__text {
  color: var(--color-error-800);
}

/* Variant colors - Warning */
.chat-bubble-3d--warning {
  background-color: var(--color-warning-surface);
  border-color: var(--color-warning-border);
}

.chat-bubble-3d--warning::after {
  border-block-start-color: var(--color-warning-surface);
}

.chat-bubble-3d--warning .chat-bubble-3d__text {
  color: var(--color-warning-800);
}

/* Variant colors - Critical */
.chat-bubble-3d--critical {
  background-color: var(--color-critical-surface);
  border-color: var(--color-critical-border);
}

.chat-bubble-3d--critical::after {
  border-block-start-color: var(--color-critical-surface);
}

.chat-bubble-3d--critical .chat-bubble-3d__text {
  color: var(--color-error-900);
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .chat-bubble-3d {
    animation: none;
  }
}

/* Mobile responsive sizing */
@media (max-width: 480px) {
  .chat-bubble-3d {
    padding-block: var(--spacing-3xs);
    padding-inline: var(--spacing-2xs);
    max-inline-size: 150px;
  }

  .chat-bubble-3d__content {
    flex-wrap: wrap;
    justify-content: center;
    white-space: normal;
    text-align: center;
  }

  .chat-bubble-3d__emoji {
    font-size: var(--font-size-sm);
  }

  .chat-bubble-3d__text {
    font-size: var(--font-size-xs);
  }
}
</style>
