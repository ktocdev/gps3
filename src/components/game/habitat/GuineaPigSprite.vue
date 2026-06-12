<template>
  <div
    class="guinea-pig-sprite"
    :class="{
      'guinea-pig-sprite--selected': isSelected,
      'guinea-pig-sprite--walking': isWalking,
      'guinea-pig-sprite--playing': isPlaying,
      'guinea-pig-sprite--chewing': isChewing,
      'guinea-pig-sprite--interacting': isInteracting,
      'guinea-pig-sprite--facing-left': facingLeft,
      'guinea-pig-sprite--paused': !gameController.isGameActive,
      'guinea-pig-sprite--manual-control': isManuallyControlled,
      'guinea-pig-sprite--free-movement': isFreeMovementMode
    }"
    :style="spriteStyle"
    :title="tooltipText"
    @click="handleClick"
  >
    <div class="guinea-pig-sprite__emoji no-select">
      {{ guineaPigEmoji }}
    </div>

    <!-- Manual control indicator -->
    <div v-if="isManuallyControlled" class="guinea-pig-sprite__control-indicator">
      🎯
    </div>

    <!-- Chat bubble for reactions -->
    <GuineaPigChatBubble
      v-if="currentReaction"
      :message="currentReaction.message"
      :emoji="currentReaction.emoji"
      :variant="currentReaction.variant"
      :duration="currentReaction.duration"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { GuineaPig } from '../../../stores/guineaPigStore'
import { useBehaviorStateStore } from '../../../stores/behaviorStateStore'
import { useNeedsController } from '../../../stores/needsController'
import { useGameController } from '../../../stores/gameController'
import { useGuineaPigStore } from '../../../stores/guineaPigStore'
import { useMovementModeStore } from '../../../stores/movementModeStore'
import GuineaPigChatBubble from './GuineaPigChatBubble.vue'
import type { ReactionMessage } from '../../../data/guineaPigMessages'

interface Props {
  guineaPig: GuineaPig
  gridPosition: { row: number; col: number }
  isInteractingWithDepthItem: boolean
  isSelected: boolean
  cellSize: number // Cell size from parent HabitatVisual (responsive)
  isWalking?: boolean // System 18: Movement state
  facingDirection?: 'left' | 'right' // System 18: Direction facing
  offsetX?: number // Pixel offset for visual separation
  offsetY?: number // Pixel offset for visual separation
}

interface Emits {
  (e: 'select', guineaPigId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const needsController = useNeedsController()
const gameController = useGameController()
const guineaPigStore = useGuineaPigStore()
const movementModeStore = useMovementModeStore()

// Get centralized behavior state for this guinea pig
const behaviorStateStore = useBehaviorStateStore()
behaviorStateStore.initializeBehaviorState(props.guineaPig.id)

// Chat bubble state
const currentReaction = ref<ReactionMessage | null>(null)

// Expose method for triggering reactions
function showReaction(reaction: ReactionMessage): void {
  currentReaction.value = reaction

  const duration = reaction.duration || 3000
  setTimeout(() => {
    currentReaction.value = null
  }, duration)
}

// Expose for external access (debug panel)
defineExpose({
  showReaction
})

// Get guinea pig emoji - use a simple mapping based on gender for now
const guineaPigEmoji = computed(() => {
  // Future: This could be based on breed, appearance, or stored emoji property
  return props.guineaPig.gender === 'male' ? '🐹' : '🐭'
})

// System 18: Movement state
const isWalking = computed(() => props.isWalking ?? false)
const facingLeft = computed(() => props.facingDirection === 'left')

// System 21: Social state - check if guinea pig is playing/socializing
const isPlaying = computed(() => {
  const behaviorState = behaviorStateStore.getBehaviorState(props.guineaPig.id)
  return behaviorState?.currentActivity === 'playing'
})

// System 22: Chewing state - check if guinea pig is chewing
const isChewing = computed(() => {
  const behaviorState = behaviorStateStore.getBehaviorState(props.guineaPig.id)
  return behaviorState?.currentActivity === 'chewing'
})

// System 23: Player interaction state - check if guinea pig is being interacted with by player
const isInteracting = computed(() => {
  const behaviorState = behaviorStateStore.getBehaviorState(props.guineaPig.id)
  return behaviorState?.currentActivity === 'interacting'
})

// Manual control state
const isManuallyControlled = computed(() => {
  return guineaPigStore.isManuallyControlled(props.guineaPig.id)
})

// Free movement mode - disables CSS transitions for smoother requestAnimationFrame-based animation
const isFreeMovementMode = computed(() => {
  return movementModeStore.mode === 'free'
})

// Tooltip showing guinea pig metadata
const tooltipText = computed(() => {
  const gp = props.guineaPig
  // Age calculation temporarily hidden - will be re-enabled with aging system (Phase 5+)
  // const age = Math.floor((Date.now() - gp.birthDate) / (1000 * 60 * 60 * 24)) // Days old
  const behaviorState = behaviorStateStore.getBehaviorState(gp.id)
  const currentActivity = behaviorState?.currentActivity || 'idle'
  const currentGoal = behaviorState?.currentGoal
  const goalText = currentGoal ? currentGoal.type : 'none'
  const wellness = needsController.calculateWellness(gp.id)

  return `${gp.name} (${gp.gender})
Breed: ${gp.breed}
Level: ${gp.stats.level}
Wellness: ${Math.round(wellness)}%
Friendship: ${Math.round(gp.friendship)}%
Activity: ${currentActivity}
Goal: ${goalText}`
})

// Calculate CSS transform for grid position and dynamic z-index
const spriteStyle = computed(() => {
  const baseX = props.gridPosition.col * props.cellSize
  const baseY = props.gridPosition.row * props.cellSize
  const offsetX = props.offsetX || 0
  const offsetY = props.offsetY || 0

  return {
    transform: `translate(${baseX + offsetX}px, ${baseY + offsetY}px)`,
    zIndex: props.isInteractingWithDepthItem ? 3 : 10
  }
})

function handleClick() {
  emit('select', props.guineaPig.id)
}
</script>

<style>
.guinea-pig-sprite {
  position: absolute;
  inline-size: var(--space-16); /* 64px - slightly larger than cell for visibility */
  block-size: var(--space-16);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer; /* Indicates guinea pig is clickable for selection */
  /* z-index set dynamically via inline style: 3 or 10 */
  /* Default: smooth transition for grid-based movement */
  transition: transform 0.3s ease-in-out, z-index 0s;
  pointer-events: all; /* Enable clicks on guinea pig sprites */
}

/* Free movement mode: disable CSS transition since animation is handled by requestAnimationFrame */
.guinea-pig-sprite--free-movement {
  transition: transform 0s, z-index 0s;
}

.guinea-pig-sprite__emoji {
  font-size: var(--font-size-4xl); /* 36px - Desktop (60px cells) */
  line-height: 1;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

/* Tablet: Scale guinea pig sprite for 45px cells */
@media (max-width: 1023px) {
  .guinea-pig-sprite__emoji {
    font-size: var(--font-size-2xl); /* 24px - ~67% of desktop */
  }
}

/* Mobile: Scale guinea pig sprite for 35px cells */
@media (max-width: 639px) {
  .guinea-pig-sprite__emoji {
    font-size: var(--font-size-xl); /* 20px - ~56% of desktop */
  }
}

/* Selection visual - indicates which guinea pig is selected for interaction */
.guinea-pig-sprite--selected {
  filter: brightness(1.2);
}

.guinea-pig-sprite--selected .guinea-pig-sprite__emoji {
  outline: 3px solid var(--color-primary);
  outline-offset: 4px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.3);
  padding: var(--space-2);
}

/* Hover feedback indicates guinea pig is clickable */
.guinea-pig-sprite:hover .guinea-pig-sprite__emoji {
  filter: brightness(1.15) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.25));
  transform: scale(1.05);
  transition: all var(--transition-fast);
}

/* System 18: Movement animations */
.guinea-pig-sprite--walking .guinea-pig-sprite__emoji {
  /* Subtle bounce animation while walking */
  animation: guinea-pig-walk 0.6s ease-in-out infinite;
}

@keyframes guinea-pig-walk {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-3px) scale(1.02);
  }
}

/* Face left by flipping horizontally */
.guinea-pig-sprite--facing-left .guinea-pig-sprite__emoji {
  transform: scaleX(-1);
}

.guinea-pig-sprite--facing-left.guinea-pig-sprite--walking .guinea-pig-sprite__emoji {
  /* Preserve animation while flipped */
  animation: guinea-pig-walk-flipped 0.6s ease-in-out infinite;
}

@keyframes guinea-pig-walk-flipped {
  0%, 100% {
    transform: translateY(0) scaleX(-1);
  }
  50% {
    transform: translateY(-3px) scaleX(-1.02);
  }
}

/* System 21: Playing/socializing animation */
.guinea-pig-sprite--playing .guinea-pig-sprite__emoji {
  /* Wiggle animation when playing or socializing - takes priority over walking */
  animation: guinea-pig-wiggle 0.4s ease-in-out infinite !important;
}

/* Pause all animations when game is paused - high specificity to override all animation states */
.guinea-pig-sprite--paused .guinea-pig-sprite__emoji,
.guinea-pig-sprite--paused.guinea-pig-sprite--playing .guinea-pig-sprite__emoji,
.guinea-pig-sprite--paused.guinea-pig-sprite--chewing .guinea-pig-sprite__emoji,
.guinea-pig-sprite--paused.guinea-pig-sprite--interacting .guinea-pig-sprite__emoji,
.guinea-pig-sprite--paused.guinea-pig-sprite--walking .guinea-pig-sprite__emoji,
.guinea-pig-sprite--paused.guinea-pig-sprite--facing-left .guinea-pig-sprite__emoji,
.guinea-pig-sprite--paused.guinea-pig-sprite--playing.guinea-pig-sprite--walking .guinea-pig-sprite__emoji,
.guinea-pig-sprite--paused.guinea-pig-sprite--chewing.guinea-pig-sprite--walking .guinea-pig-sprite__emoji,
.guinea-pig-sprite--paused.guinea-pig-sprite--interacting.guinea-pig-sprite--walking .guinea-pig-sprite__emoji,
.guinea-pig-sprite--paused.guinea-pig-sprite--facing-left.guinea-pig-sprite--playing .guinea-pig-sprite__emoji,
.guinea-pig-sprite--paused.guinea-pig-sprite--facing-left.guinea-pig-sprite--chewing .guinea-pig-sprite__emoji,
.guinea-pig-sprite--paused.guinea-pig-sprite--facing-left.guinea-pig-sprite--interacting .guinea-pig-sprite__emoji,
.guinea-pig-sprite--paused.guinea-pig-sprite--facing-left.guinea-pig-sprite--playing.guinea-pig-sprite--walking .guinea-pig-sprite__emoji,
.guinea-pig-sprite--paused.guinea-pig-sprite--facing-left.guinea-pig-sprite--chewing.guinea-pig-sprite--walking .guinea-pig-sprite__emoji,
.guinea-pig-sprite--paused.guinea-pig-sprite--facing-left.guinea-pig-sprite--interacting.guinea-pig-sprite--walking .guinea-pig-sprite__emoji {
  animation-play-state: paused !important;
}

@keyframes guinea-pig-wiggle {
  0%, 100% {
    transform: rotate(0deg) scale(1);
  }
  25% {
    transform: rotate(-8deg) scale(1.08);
  }
  75% {
    transform: rotate(8deg) scale(1.08);
  }
}

/* Playing animation when facing left - takes priority over walking-flipped */
.guinea-pig-sprite--facing-left.guinea-pig-sprite--playing .guinea-pig-sprite__emoji {
  animation: guinea-pig-wiggle-flipped 0.4s ease-in-out infinite !important;
}

/* When both playing and walking, use playing animation only */
.guinea-pig-sprite--playing.guinea-pig-sprite--walking .guinea-pig-sprite__emoji {
  animation: guinea-pig-wiggle 0.4s ease-in-out infinite !important;
}

.guinea-pig-sprite--facing-left.guinea-pig-sprite--playing.guinea-pig-sprite--walking .guinea-pig-sprite__emoji {
  animation: guinea-pig-wiggle-flipped 0.4s ease-in-out infinite !important;
}

@keyframes guinea-pig-wiggle-flipped {
  0%, 100% {
    transform: rotate(0deg) scaleX(-1);
  }
  25% {
    transform: rotate(-8deg) scaleX(-1.08);
  }
  75% {
    transform: rotate(8deg) scaleX(-1.08);
  }
}

/* System 22: Chewing animation - vertical chomp motion */
.guinea-pig-sprite--chewing .guinea-pig-sprite__emoji {
  /* Chomp animation when chewing - vertical up/down motion */
  animation: guinea-pig-chomp 0.5s ease-in-out infinite !important;
}

/* System 23: Player interaction animation - wiggle when player interacts */
.guinea-pig-sprite--interacting .guinea-pig-sprite__emoji {
  /* Wiggle animation when player pets, holds, or hand-feeds */
  animation: guinea-pig-wiggle 0.4s ease-in-out infinite !important;
}

.guinea-pig-sprite--facing-left.guinea-pig-sprite--interacting .guinea-pig-sprite__emoji {
  animation: guinea-pig-wiggle-flipped 0.4s ease-in-out infinite !important;
}

/* When both interacting and walking, use interacting animation only */
.guinea-pig-sprite--interacting.guinea-pig-sprite--walking .guinea-pig-sprite__emoji {
  animation: guinea-pig-wiggle 0.4s ease-in-out infinite !important;
}

.guinea-pig-sprite--facing-left.guinea-pig-sprite--interacting.guinea-pig-sprite--walking .guinea-pig-sprite__emoji {
  animation: guinea-pig-wiggle-flipped 0.4s ease-in-out infinite !important;
}

.guinea-pig-sprite--facing-left.guinea-pig-sprite--chewing .guinea-pig-sprite__emoji {
  animation: guinea-pig-chomp-flipped 0.5s ease-in-out infinite !important;
}

/* When both chewing and walking, use chewing animation only */
.guinea-pig-sprite--chewing.guinea-pig-sprite--walking .guinea-pig-sprite__emoji {
  animation: guinea-pig-chomp 0.5s ease-in-out infinite !important;
}

.guinea-pig-sprite--facing-left.guinea-pig-sprite--chewing.guinea-pig-sprite--walking .guinea-pig-sprite__emoji {
  animation: guinea-pig-chomp-flipped 0.5s ease-in-out infinite !important;
}

@keyframes guinea-pig-chomp {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-4px) scaleY(0.95);
  }
}

@keyframes guinea-pig-chomp-flipped {
  0%, 100% {
    transform: translateY(0) scaleX(-1);
  }
  50% {
    transform: translateY(-4px) scaleX(-1) scaleY(0.95);
  }
}

/* Manual control indicator */
.guinea-pig-sprite__control-indicator {
  position: absolute;
  inset-block-start: -12px;
  inset-inline-end: -8px;
  font-size: var(--font-size-lg);
  z-index: 11;
  animation: pulse 1.5s ease-in-out infinite;
}

.guinea-pig-sprite--manual-control .guinea-pig-sprite__emoji {
  filter: drop-shadow(0 0 8px var(--color-primary));
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.8; }
}
</style>
