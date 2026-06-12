<template>
  <div class="chat-bubble" :class="chatBubbleModifierClass">
    <div class="chat-bubble__content">
      <span v-if="emoji" class="chat-bubble__emoji">{{ emoji }}</span>
      <span class="chat-bubble__text">{{ message }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  message: string
  emoji?: string
  variant?: 'positive' | 'neutral' | 'negative' | 'warning' | 'critical'
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'neutral',
  duration: 3000
})

const chatBubbleModifierClass = computed(() =>
  props.variant ? `chat-bubble--${props.variant}` : ''
)
</script>

<style>
/* Chat bubble base styles */
.chat-bubble {
  position: absolute;
  inset-block-end: calc(100% + var(--spacing-xs));
  inset-inline-start: 50%;
  transform: translateX(-50%);
  z-index: 100;

  padding-block: var(--spacing-2xs);
  padding-inline: var(--spacing-xs);

  background-color: var(--color-surface-elevated);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);

  box-shadow: var(--shadow-md);

  animation: chat-bubble-enter 0.2s ease-out;
}

/* Tail/pointer */
.chat-bubble::after {
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

@keyframes chat-bubble-enter {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(8px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
}

/* Exit animation (applied via JS before removal) */
.chat-bubble--exiting {
  animation: chat-bubble-exit 0.2s ease-in forwards;
}

@keyframes chat-bubble-exit {
  0% {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateX(-50%) translateY(-8px) scale(0.95);
  }
}

/* Content layout */
.chat-bubble__content {
  display: flex;
  align-items: center;
  gap: var(--spacing-2xs);
  white-space: nowrap;
}

.chat-bubble__emoji {
  font-size: var(--font-size-md);
  line-height: 1;
}

.chat-bubble__text {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-neutral-800);
}

/* Variant colors */
.chat-bubble--neutral {
  background-color: var(--color-neutral-100);
  border-color: var(--color-neutral-300);
}

.chat-bubble--neutral::after {
  border-block-start-color: var(--color-neutral-100);
}

.chat-bubble--neutral .chat-bubble__text {
  color: var(--color-neutral-800);
}

.chat-bubble--positive {
  background-color: var(--color-success-surface);
  border-color: var(--color-success-border);
}

.chat-bubble--positive::after {
  border-block-start-color: var(--color-success-surface);
}

.chat-bubble--positive .chat-bubble__text {
  color: var(--color-accent-green-800);
}

.chat-bubble--negative {
  background-color: var(--color-danger-surface);
  border-color: var(--color-danger-border);
}

.chat-bubble--negative::after {
  border-block-start-color: var(--color-danger-surface);
}

.chat-bubble--negative .chat-bubble__text {
  color: var(--color-error-800);
}

.chat-bubble--warning {
  background-color: var(--color-warning-surface);
  border-color: var(--color-warning-border);
}

.chat-bubble--warning::after {
  border-block-start-color: var(--color-warning-surface);
}

.chat-bubble--warning .chat-bubble__text {
  color: var(--color-warning-800);
}

.chat-bubble--critical {
  background-color: var(--color-critical-surface);
  border-color: var(--color-critical-border);
}

.chat-bubble--critical::after {
  border-block-start-color: var(--color-critical-surface);
}

.chat-bubble--critical .chat-bubble__text {
  color: var(--color-error-900);
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .chat-bubble {
    animation: none;
  }

  .chat-bubble--exiting {
    animation: none;
    opacity: 0;
  }
}
</style>
