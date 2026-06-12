<template>
  <div class="habitat-sidebar chat-bubble-debug">
    <div class="habitat-sidebar__header chat-bubble-debug__header">
      <h3>💬 Chat Bubble</h3>
      <Button
        v-if="activeGuineaPigs.length > 1"
        @click="toggleGuineaPig"
        variant="tertiary"
        size="sm"
      >
        {{ selectedGuineaPig?.name || 'Select GP' }} ({{ currentGuineaPigIndex + 1 }}/{{ activeGuineaPigs.length }})
      </Button>
      <span v-else-if="activeGuineaPigs.length === 1" class="chat-bubble-debug__guinea-pig-name-static">
        {{ activeGuineaPigs[0]?.name }}
      </span>
    </div>

    <div class="chat-bubble-debug__controls">
      <!-- Interaction Type -->
      <Select
        v-model="interactionType"
        :options="interactionTypeOptions"
        label="Interaction Type"
        size="sm"
      />

      <!-- Wellness Tier -->
      <Select
        v-model="wellnessTier"
        :options="wellnessTierOptions"
        label="Wellness Tier"
        size="sm"
      />

      <!-- Preference Level (for feeding) -->
      <Select
        v-if="interactionType === 'feed'"
        v-model="preferenceLevel"
        :options="preferenceLevelOptions"
        label="Preference"
        size="sm"
      />

      <!-- Rejection Reason -->
      <Select
        v-model="rejectionReason"
        :options="rejectionReasonOptions"
        label="Rejection Reason (optional)"
        placeholder="None (success)"
        size="sm"
      />

      <!-- Custom Message -->
      <div class="input-field">
        <label for="custom-message" class="input-field__label">Custom Message (optional)</label>
        <input
          id="custom-message"
          v-model="customMessage"
          type="text"
          class="input-field__input"
          placeholder="Type custom message..."
        />
      </div>

      <!-- Custom Emoji -->
      <div class="input-field">
        <label for="custom-emoji" class="input-field__label">Custom Emoji (optional)</label>
        <input
          id="custom-emoji"
          v-model="customEmoji"
          type="text"
          class="input-field__input"
          placeholder="✨"
          maxlength="2"
        />
      </div>

      <!-- Variant -->
      <Select
        v-model="variant"
        :options="variantOptions"
        label="Variant"
        size="sm"
      />

      <!-- Action Buttons -->
      <div class="chat-bubble-debug__actions">
        <button
          class="button button--primary button--sm"
          :disabled="!selectedGuineaPigId"
          @click="showGeneratedReaction"
        >
          Show Generated Reaction
        </button>
        <button
          class="button button--secondary button--sm"
          :disabled="!selectedGuineaPigId || !customMessage"
          @click="showCustomReaction"
        >
          Show Custom Reaction
        </button>
      </div>

      <!-- Quick Test Buttons -->
      <div class="chat-bubble-debug__quick-tests">
        <h4>Quick Tests</h4>
        <div class="button-group">
          <button
            class="button button--secondary button--sm"
            :disabled="!selectedGuineaPigId"
            @click="testPositive"
          >
            ✨ Positive
          </button>
          <button
            class="button button--secondary button--sm"
            :disabled="!selectedGuineaPigId"
            @click="testNegative"
          >
            ❌ Negative
          </button>
          <button
            class="button button--secondary button--sm"
            :disabled="!selectedGuineaPigId"
            @click="testWarning"
          >
            ⚠️ Warning
          </button>
          <button
            class="button button--secondary button--sm"
            :disabled="!selectedGuineaPigId"
            @click="testCritical"
          >
            🚨 Critical
          </button>
        </div>
      </div>

      <!-- Need Warning Tester -->
      <div class="chat-bubble-debug__need-warnings">
        <h4>Need Warnings</h4>
        <Select
          v-model="needType"
          :options="needTypeOptions"
          label="Need Type"
          size="sm"
          style="margin-block-end: var(--space-3)"
        />
        <div class="button-group">
          <button
            class="button button--secondary button--sm"
            :disabled="!selectedGuineaPigId"
            @click="showNeedWarning('warning')"
          >
            Warning (20-30%)
          </button>
          <button
            class="button button--secondary button--sm"
            :disabled="!selectedGuineaPigId"
            @click="showNeedWarning('critical')"
          >
            Critical (≤15%)
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useGuineaPigStore } from '../../../stores/guineaPigStore'
import { generateReactionMessage, generateNeedWarning } from '../../../data/guineaPigMessages'
import type { MessageContext, ReactionMessage } from '../../../data/guineaPigMessages'
import Button from '../../basic/Button.vue'
import Select from '../../basic/Select.vue'

const guineaPigStore = useGuineaPigStore()

// Form state
const interactionType = ref<'feed' | 'play' | 'socialize' | 'general'>('feed')
const wellnessTier = ref<'excellent' | 'good' | 'fair' | 'poor' | 'critical'>('excellent')
const preferenceLevel = ref<'favorite' | 'neutral' | 'disliked'>('favorite')
const rejectionReason = ref<'' | 'tired' | 'stressed' | 'full' | 'limit_reached' | 'low_friendship'>('')
const customMessage = ref('')
const customEmoji = ref('')
const variant = ref<'positive' | 'neutral' | 'negative' | 'warning' | 'critical'>('positive')
const needType = ref('hunger')

// Get active guinea pigs
const activeGuineaPigs = computed(() => guineaPigStore.activeGuineaPigs)

// Selected guinea pig (computed from store)
const selectedGuineaPig = computed(() => {
  if (!guineaPigStore.selectedGuineaPigId) return null
  return guineaPigStore.activeGuineaPigs.find(gp => gp.id === guineaPigStore.selectedGuineaPigId) || null
})

// Get selected guinea pig ID for functions
const selectedGuineaPigId = computed(() => selectedGuineaPig.value?.id || '')

// Get current guinea pig index for display
const currentGuineaPigIndex = computed(() => {
  if (!selectedGuineaPig.value) return 0
  return activeGuineaPigs.value.findIndex(gp => gp.id === selectedGuineaPig.value!.id)
})

// Auto-select first guinea pig if none selected
watch(activeGuineaPigs, (newGuineaPigs) => {
  if (newGuineaPigs.length > 0 && !guineaPigStore.selectedGuineaPigId) {
    guineaPigStore.selectGuineaPig(newGuineaPigs[0].id)
  }
}, { immediate: true })

function toggleGuineaPig() {
  if (activeGuineaPigs.value.length <= 1) return

  const currentIndex = activeGuineaPigs.value.findIndex(gp => gp.id === selectedGuineaPig.value?.id)
  const nextIndex = (currentIndex + 1) % activeGuineaPigs.value.length
  const nextGuineaPig = activeGuineaPigs.value[nextIndex]

  guineaPigStore.selectGuineaPig(nextGuineaPig.id)
}

const interactionTypeOptions = [
  { label: 'Feed', value: 'feed' },
  { label: 'Play', value: 'play' },
  { label: 'Socialize', value: 'socialize' },
  { label: 'General', value: 'general' }
]

const wellnessTierOptions = [
  { label: 'Excellent (80-100%)', value: 'excellent' },
  { label: 'Good (60-79%)', value: 'good' },
  { label: 'Fair (40-59%)', value: 'fair' },
  { label: 'Poor (20-39%)', value: 'poor' },
  { label: 'Critical (<20%)', value: 'critical' }
]

const preferenceLevelOptions = [
  { label: 'Favorite', value: 'favorite' },
  { label: 'Neutral', value: 'neutral' },
  { label: 'Disliked', value: 'disliked' }
]

const rejectionReasonOptions = [
  { label: 'None (success)', value: '', disabled: true },
  { label: 'Tired', value: 'tired' },
  { label: 'Stressed', value: 'stressed' },
  { label: 'Full', value: 'full' },
  { label: 'Limit Reached', value: 'limit_reached' },
  { label: 'Low Friendship', value: 'low_friendship' }
]

const variantOptions = [
  { label: 'Positive (Green)', value: 'positive' },
  { label: 'Neutral (Gray)', value: 'neutral' },
  { label: 'Negative (Red)', value: 'negative' },
  { label: 'Warning (Orange)', value: 'warning' },
  { label: 'Critical (Dark Red)', value: 'critical' }
]

const needTypeOptions = [
  { label: 'Hunger', value: 'hunger' },
  { label: 'Thirst', value: 'thirst' },
  { label: 'Energy', value: 'energy' },
  { label: 'Social', value: 'social' },
  { label: 'Hygiene', value: 'hygiene' },
  { label: 'Shelter', value: 'shelter' },
  { label: 'Play', value: 'play' },
  { label: 'Comfort', value: 'comfort' },
  { label: 'Nails', value: 'nails' },
  { label: 'Chew', value: 'chew' }
]

function showGeneratedReaction() {
  if (!selectedGuineaPigId.value) return

  const context: MessageContext = {
    interactionType: interactionType.value,
    wellnessTier: wellnessTier.value,
    preferenceLevel: interactionType.value === 'feed' ? preferenceLevel.value : undefined,
    rejectionReason: rejectionReason.value || undefined
  }

  const reaction = generateReactionMessage(context)

  // Emit event with reaction data
  const event = new CustomEvent('show-chat-bubble', {
    detail: {
      guineaPigId: selectedGuineaPigId.value,
      reaction
    },
    bubbles: true
  })
  document.dispatchEvent(event)
}

function showCustomReaction() {
  if (!selectedGuineaPigId.value || !customMessage.value) return

  const reaction: ReactionMessage = {
    message: customMessage.value,
    emoji: customEmoji.value || undefined,
    variant: variant.value
  }

  const event = new CustomEvent('show-chat-bubble', {
    detail: {
      guineaPigId: selectedGuineaPigId.value,
      reaction
    },
    bubbles: true
  })
  document.dispatchEvent(event)
}

// Quick test functions
function testPositive() {
  if (!selectedGuineaPigId.value) return

  const reaction: ReactionMessage = {
    message: 'Wheek! I love this!',
    emoji: '✨',
    variant: 'positive'
  }

  const event = new CustomEvent('show-chat-bubble', {
    detail: {
      guineaPigId: selectedGuineaPigId.value,
      reaction
    },
    bubbles: true
  })
  document.dispatchEvent(event)
}

function testNegative() {
  if (!selectedGuineaPigId.value) return

  const reaction: ReactionMessage = {
    message: 'No thanks!',
    emoji: '❌',
    variant: 'negative'
  }

  const event = new CustomEvent('show-chat-bubble', {
    detail: {
      guineaPigId: selectedGuineaPigId.value,
      reaction
    },
    bubbles: true
  })
  document.dispatchEvent(event)
}

function testWarning() {
  if (!selectedGuineaPigId.value) return

  const reaction: ReactionMessage = {
    message: "I'm hungry...",
    emoji: '⚠️',
    variant: 'warning'
  }

  const event = new CustomEvent('show-chat-bubble', {
    detail: {
      guineaPigId: selectedGuineaPigId.value,
      reaction
    },
    bubbles: true
  })
  document.dispatchEvent(event)
}

function testCritical() {
  if (!selectedGuineaPigId.value) return

  const reaction: ReactionMessage = {
    message: 'HELP ME!!',
    emoji: '🚨',
    variant: 'critical'
  }

  const event = new CustomEvent('show-chat-bubble', {
    detail: {
      guineaPigId: selectedGuineaPigId.value,
      reaction
    },
    bubbles: true
  })
  document.dispatchEvent(event)
}

function showNeedWarning(severity: 'warning' | 'critical') {
  if (!selectedGuineaPigId.value) return

  const reaction = generateNeedWarning(needType.value, severity)
  if (!reaction) return

  const event = new CustomEvent('show-chat-bubble', {
    detail: {
      guineaPigId: selectedGuineaPigId.value,
      reaction
    },
    bubbles: true
  })
  document.dispatchEvent(event)
}
</script>

<style>
/* Component-specific styles (shared layout from .habitat-sidebar) */
.chat-bubble-debug__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-2);
}

.chat-bubble-debug__guinea-pig-name-static {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-semibold);
}

.chat-bubble-debug h4 {
  margin-block-end: var(--space-2);
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
}

.chat-bubble-debug__controls {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  max-inline-size: 100%;
}

.chat-bubble-debug__actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-block-start: var(--space-2);
}

.chat-bubble-debug__quick-tests,
.chat-bubble-debug__need-warnings {
  padding-block-start: var(--space-3);
  border-block-start: 1px solid var(--color-border-light);
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

/* Input field styling to match Select component */
.input-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.input-field__label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.input-field__input {
  inline-size: 100%;
  max-inline-size: 100%;
  min-inline-size: 0;
  padding-block: var(--space-2);
  padding-inline: var(--space-3);

  font-family: var(--font-family-body);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);

  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);

  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.input-field__input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
}

.input-field__input::placeholder {
  color: var(--color-text-muted);
}

.input-field__input:disabled {
  background-color: var(--color-bg-secondary);
  color: var(--color-text-muted);
  cursor: not-allowed;
}
</style>
