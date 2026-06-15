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
  /* Parchment fill used by the bubble body and the inner tail triangle */
  --bubble-fill: var(--panel-bg-bot);

  position: absolute;
  transform: translate(-50%, -100%);
  z-index: 100;
  pointer-events: none;

  padding-block: var(--spacing-2xs);
  padding-inline: var(--spacing-xs);

  background: linear-gradient(180deg, var(--panel-bg-top) 0%, var(--bubble-fill) 100%);
  border: 3px solid var(--panel-border);
  border-radius: 12px;
  color: var(--color-wood-border);

  box-shadow:
    0 6px 10px -2px rgba(69, 26, 3, 0.4),
    0 2px 4px -1px rgba(69, 26, 3, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.6),
    inset 0 -1px 0 rgba(146, 64, 14, 0.2);

  animation: chat-bubble-3d-enter 0.2s ease-out;
}

/* Tail/pointer pointing down toward guinea pig — wood-border outline */
.chat-bubble-3d::after {
  content: '';
  position: absolute;
  inset-block-start: 100%;
  inset-inline-start: 50%;
  transform: translateX(-50%);

  inline-size: 0;
  block-size: 0;
  border-inline: 9px solid transparent;
  border-block-start: 10px solid var(--panel-border);
}

/* Tail fill — parchment cream, sits inside the outline */
.chat-bubble-3d::before {
  content: '';
  position: absolute;
  inset-block-start: calc(100% - 2px);
  inset-inline-start: 50%;
  transform: translateX(-50%);
  z-index: 1;

  inline-size: 0;
  block-size: 0;
  border-inline: 7px solid transparent;
  border-block-start: 8px solid var(--bubble-fill);
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
  font-family: var(--font-family-heading);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.2px;
  color: var(--color-wood-border);
}

/* Variant colors - Neutral (plain parchment) */
.chat-bubble-3d--neutral .chat-bubble-3d__text {
  color: var(--color-wood-border);
}

/* Variant colors - Positive (parchment, green ink) */
.chat-bubble-3d--positive .chat-bubble-3d__text {
  color: var(--color-green-800);
}

/* Variant colors - Negative (red-tinted parchment) */
.chat-bubble-3d--negative {
  --bubble-fill: var(--color-danger);
  background: var(--color-danger);
}

.chat-bubble-3d--negative .chat-bubble-3d__text {
  color: var(--color-red-800);
}

/* Variant colors - Warning (parchment, amber ink) */
.chat-bubble-3d--warning .chat-bubble-3d__text {
  color: var(--color-gold-700);
}

/* Variant colors - Critical (deeper red-tinted parchment) */
.chat-bubble-3d--critical {
  --bubble-fill: var(--color-critical);
  background: var(--color-critical);
}

.chat-bubble-3d--critical .chat-bubble-3d__text {
  color: var(--color-red-900);
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
