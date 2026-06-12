# System 22: Interaction Enhancement System

**Phase:** 5 - Polish & Enhancement
**Status:** 🚧 In Progress (Component 1 Complete)
**Dependencies:** System 10.1 (Personality), System 10.2 (Preferences), System 7 (Needs), System 21 (Social Bonding)

## Overview

Comprehensive interaction feedback system that creates meaningful consequences for guinea pig care through wellness-based reactions, context-aware activity messages, and safety net mechanics. Consolidates Phase 2.5 Systems 10.3, 10.4, and 10.5 into a cohesive interaction enhancement framework.

**Core Philosophy:**
- **Visible consequences**: Low wellness creates observable behavioral changes
- **Realistic responses**: Unwell animals are less social and more withdrawn
- **Recovery motivation**: Players want to restore wellness to regain full interaction
- **Graduated severity**: Effects worsen progressively as wellness declines
- **Educational feedback**: Messages teach players about wellness importance
- **Safety net**: Prevents permanent loss while maintaining meaningful stakes

---

## Component 1: Wellness-Based Interaction Reactions ✅ COMPLETE
_(From Phase 2.5 System 10.3)_

### GuineaPigChatBubble Component ✅

**Purpose:** Display guinea pig reactions and vocalizations as chat bubbles above the guinea pig, preventing activity feed clutter

**Visual Design:**
```
┌─────────────────────┐
│ "Wheek! I'm hungry!"│  ← Chat bubble
└─────────┬───────────┘
          │
        [🐹]  ← Guinea pig emoji
```

**Component Specification:**
```vue
<!-- GuineaPigChatBubble.vue -->
<template>
  <div class="chat-bubble" :class="chatBubbleModifierClass">
    <div class="chat-bubble__content">
      <span class="chat-bubble__emoji" v-if="emoji">{{ emoji }}</span>
      <span class="chat-bubble__text">{{ message }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  message: string
  emoji?: string
  variant?: 'positive' | 'neutral' | 'negative' | 'warning' | 'critical'
  duration?: number // Auto-dismiss after X milliseconds (default: 3000)
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'neutral',
  duration: 3000
})

const chatBubbleModifierClass = computed(() =>
  props.variant ? `chat-bubble--${props.variant}` : ''
)
</script>
```

**CSS Styling:**
```css
/* Chat bubble base styles */
.chat-bubble {
  position: absolute;
  inset-block-end: calc(100% + var(--spacing-xs)); /* Above guinea pig */
  inset-inline-start: 50%;
  transform: translateX(-50%);
  z-index: var(--z-chat-bubble); /* Above habitat items */

  padding-block: var(--spacing-2xs);
  padding-inline: var(--spacing-xs);

  background-color: var(--color-surface-elevated);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);

  box-shadow: var(--shadow-md);

  /* Tail/pointer */
  &::after {
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

  /* Entrance animation */
  animation: chat-bubble-enter 0.2s ease-out;
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
  color: var(--color-text-primary);
}

/* Variant colors */
.chat-bubble--positive {
  background-color: var(--color-success-surface);
  border-color: var(--color-success-border);

  &::after {
    border-block-start-color: var(--color-success-surface);
  }
}

.chat-bubble--negative {
  background-color: var(--color-danger-surface);
  border-color: var(--color-danger-border);

  &::after {
    border-block-start-color: var(--color-danger-surface);
  }
}

.chat-bubble--warning {
  background-color: var(--color-warning-surface);
  border-color: var(--color-warning-border);

  &::after {
    border-block-start-color: var(--color-warning-surface);
  }
}

.chat-bubble--critical {
  background-color: var(--color-critical-surface);
  border-color: var(--color-critical-border);

  &::after {
    border-block-start-color: var(--color-critical-surface);
  }
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
```

**Usage in GuineaPig.vue:**
```vue
<template>
  <div class="guinea-pig" :data-guinea-pig-id="guineaPig.id">
    <!-- Guinea pig emoji display -->
    <div class="guinea-pig__emoji">{{ guineaPig.emoji }}</div>

    <!-- Chat bubble (conditionally rendered) -->
    <GuineaPigChatBubble
      v-if="currentReaction"
      :message="currentReaction.message"
      :emoji="currentReaction.emoji"
      :variant="currentReaction.variant"
      :duration="currentReaction.duration"
      @dismissed="currentReaction = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import GuineaPigChatBubble from '@/components/game/habitat/GuineaPigChatBubble.vue'

interface GuineaPigReaction {
  message: string
  emoji?: string
  variant: 'positive' | 'neutral' | 'negative' | 'warning' | 'critical'
  duration?: number
}

const currentReaction = ref<GuineaPigReaction | null>(null)

// Show reaction function (called by interaction handlers)
function showReaction(reaction: GuineaPigReaction): void {
  currentReaction.value = reaction

  const duration = reaction.duration || 3000
  setTimeout(() => {
    // Apply exit animation
    const bubbleEl = document.querySelector('.chat-bubble')
    bubbleEl?.classList.add('chat-bubble--exiting')

    // Remove after animation completes
    setTimeout(() => {
      currentReaction.value = null
    }, 200) // Match animation duration
  }, duration)
}
</script>
```

**Reaction Message Types:**

**Positive Reactions (variant: 'positive'):**
- "Wheek! I love this!" (favorite food)
- "Popcorn! So happy!" (successful play)
- "Purr purr~" (content/comfortable)
- "Yum yum yum!" (eating favorite)

**Neutral Reactions (variant: 'neutral'):**
- "Munch munch" (eating neutral food)
- "Sniff sniff" (investigating)
- "Okay..." (accepting interaction)
- "Chirp?" (curious)

**Negative Reactions (variant: 'negative'):**
- "No thanks!" (rejecting interaction)
- "Too tired..." (low wellness)
- "Leave me alone!" (stressed)
- "Not hungry!" (full/at limit)

**Warning Reactions (variant: 'warning'):**
- "I'm hungry..." (hunger 20-30%)
- "Need water..." (thirst 20-30%)
- "So tired..." (energy 20-30%)

**Critical Reactions (variant: 'critical'):**
- "HUNGRY!!" (hunger ≤15%)
- "WATER!!" (thirst ≤15%)
- "HELP!" (wellness critical)

**Activity Feed Integration:**
- Chat bubbles display **immediate reactions** (3-5 seconds)
- Activity feed logs **permanent records** of actions
- **Rule:** Guinea pig reactions → chat bubble only (not logged to feed)
- **Rule:** Player actions → activity feed (e.g., "You fed Squeaky some carrots")
- **Rule:** Important events → both (e.g., "⚠️ Squeaky's wellness is critical!" shows in bubble + logged to feed)

**Timing & Throttling:**
- Maximum 1 chat bubble per guinea pig at a time
- New reactions replace existing bubble (smooth transition)
- Critical warnings can interrupt neutral reactions
- Positive reactions have priority over neutral
- Duration adjustable per reaction type (3-5 seconds typical)

**Positioning Logic:**
```typescript
function calculateBubblePosition(guineaPigPosition: GridPosition): Position {
  // Bubble appears above guinea pig
  // Check if bubble would overflow viewport top
  // If overflow, reposition to side or below

  const bubbleHeight = 40 // Approximate bubble height
  const gpY = guineaPigPosition.y * CELL_SIZE

  if (gpY < bubbleHeight + 10) {
    // Too close to top, show below instead
    return { placement: 'below' }
  }

  return { placement: 'above' }
}
```

**Accessibility:**
- `role="status"` for announcements
- `aria-live="polite"` for non-critical messages
- `aria-live="assertive"` for critical warnings
- Screen reader announces message content

**Performance Considerations:**
- Use CSS transforms for animations (GPU-accelerated)
- Lazy render (only when active)
- Auto-cleanup after dismissal
- Throttle rapid-fire reactions (min 500ms between bubbles)

---

### Reaction Message System ✅

**Purpose:** Centralized storage and generation of context-aware guinea pig reaction messages

**Implementation Status:** Complete - `src/data/guineaPigMessages.ts` includes:
- ✅ Feeding reactions (favorite, neutral, disliked)
- ✅ Play reactions (success, rejected)
- ✅ Socialize reactions (all interaction types)
- ✅ Need warnings (all 11 needs)
- ✅ Autonomous action messages (eating, activities, habitat)
- ✅ Care action reactions (cage clean, bedding, water, hay, bowls)

**File Location:** `src/data/guineaPigMessages.ts`

**Message Structure:**
```typescript
// src/data/guineaPigMessages.ts

export interface ReactionMessage {
  message: string
  emoji?: string
  variant: 'positive' | 'neutral' | 'negative' | 'warning' | 'critical'
  duration?: number
}

export interface MessageContext {
  interactionType: 'feed' | 'play' | 'socialize' | 'groom' | 'sleep' | 'general'
  wellnessTier: 'excellent' | 'good' | 'fair' | 'poor' | 'critical'
  preferenceLevel?: 'favorite' | 'liked' | 'neutral' | 'disliked'
  needLevel?: number // 0-100
  rejectionReason?: 'tired' | 'stressed' | 'full' | 'limit_reached' | 'low_friendship'
}

// Message database organized by context
export const guineaPigMessages = {
  // Feeding reactions
  feeding: {
    favorite: {
      excellent: [
        { message: "Wheek! I love this!", emoji: "✨", variant: "positive" },
        { message: "Yum yum yum!", emoji: "😋", variant: "positive" },
        { message: "Popcorn! So happy!", emoji: "🎉", variant: "positive" },
        { message: "My favorite!!", emoji: "❤️", variant: "positive" }
      ],
      good: [
        { message: "Munch munch~", emoji: "😊", variant: "positive" },
        { message: "This is good!", emoji: "👍", variant: "positive" },
        { message: "Nom nom nom", emoji: "🥰", variant: "positive" }
      ],
      fair: [
        { message: "Thanks...", emoji: "😌", variant: "neutral" },
        { message: "Okay...", emoji: "", variant: "neutral" }
      ],
      poor: [
        { message: "Too tired...", emoji: "😓", variant: "negative" },
        { message: "Not now...", emoji: "", variant: "negative" }
      ],
      critical: [
        { message: "Can't...", emoji: "😰", variant: "negative" },
        { message: "Too weak...", emoji: "", variant: "critical" }
      ]
    },
    neutral: {
      excellent: [
        { message: "Munch munch", emoji: "🍽️", variant: "neutral" },
        { message: "Not bad!", emoji: "", variant: "neutral" },
        { message: "Okay!", emoji: "", variant: "neutral" }
      ],
      good: [
        { message: "Okay...", emoji: "", variant: "neutral" },
        { message: "I'll eat this", emoji: "", variant: "neutral" }
      ],
      fair: [
        { message: "If I must...", emoji: "😐", variant: "neutral" },
        { message: "Fine...", emoji: "", variant: "neutral" }
      ]
    },
    disliked: {
      excellent: [
        { message: "Not my favorite...", emoji: "😕", variant: "neutral" },
        { message: "Sniff... okay", emoji: "", variant: "neutral" }
      ],
      good: [
        { message: "Ugh...", emoji: "😒", variant: "negative" },
        { message: "Really?", emoji: "", variant: "negative" }
      ],
      fair: [
        { message: "No thanks!", emoji: "❌", variant: "negative" },
        { message: "Don't want it!", emoji: "", variant: "negative" }
      ]
    },
    rejected: {
      full: [
        { message: "I'm full!", emoji: "🤚", variant: "negative" },
        { message: "Not hungry!", emoji: "", variant: "negative" },
        { message: "Can't eat more!", emoji: "😓", variant: "negative" }
      ],
      limit_reached: [
        { message: "Had enough!", emoji: "🛑", variant: "negative" },
        { message: "No more!", emoji: "", variant: "negative" }
      ],
      tired: [
        { message: "Too tired...", emoji: "😴", variant: "negative" },
        { message: "Need rest...", emoji: "💤", variant: "negative" }
      ]
    }
  },

  // Play reactions
  play: {
    success: {
      excellent: [
        { message: "Wheee!", emoji: "🎉", variant: "positive" },
        { message: "Fun fun fun!", emoji: "🎮", variant: "positive" },
        { message: "Let's go!", emoji: "⚡", variant: "positive" }
      ],
      good: [
        { message: "Okay!", emoji: "👍", variant: "positive" },
        { message: "Sure!", emoji: "", variant: "positive" }
      ],
      fair: [
        { message: "A bit tired...", emoji: "😌", variant: "neutral" },
        { message: "Quick game...", emoji: "", variant: "neutral" }
      ]
    },
    rejected: {
      tired: [
        { message: "Too tired...", emoji: "😴", variant: "negative" },
        { message: "Need sleep...", emoji: "💤", variant: "negative" },
        { message: "Maybe later...", emoji: "", variant: "negative" }
      ],
      stressed: [
        { message: "Not feeling it...", emoji: "😓", variant: "negative" },
        { message: "Leave me alone!", emoji: "🚫", variant: "negative" }
      ],
      low_friendship: [
        { message: "I don't know you...", emoji: "😐", variant: "negative" },
        { message: "No thanks!", emoji: "", variant: "negative" }
      ]
    }
  },

  // Need warnings
  needWarnings: {
    hunger: {
      warning: [
        { message: "I'm hungry...", emoji: "🍽️", variant: "warning" },
        { message: "Sniff sniff... food?", emoji: "👃", variant: "warning" }
      ],
      critical: [
        { message: "HUNGRY!!", emoji: "🚨", variant: "critical" },
        { message: "NEED FOOD!!", emoji: "⚠️", variant: "critical" }
      ]
    },
    thirst: {
      warning: [
        { message: "Need water...", emoji: "💧", variant: "warning" },
        { message: "So thirsty...", emoji: "", variant: "warning" }
      ],
      critical: [
        { message: "WATER!!", emoji: "🚨", variant: "critical" },
        { message: "THIRSTY!!", emoji: "⚠️", variant: "critical" }
      ]
    },
    energy: {
      warning: [
        { message: "Yawn~", emoji: "😴", variant: "warning" },
        { message: "So sleepy...", emoji: "💤", variant: "warning" }
      ],
      critical: [
        { message: "EXHAUSTED!!", emoji: "🚨", variant: "critical" },
        { message: "NEED SLEEP!!", emoji: "⚠️", variant: "critical" }
      ]
    },
    social: {
      warning: [
        { message: "Lonely...", emoji: "😢", variant: "warning" },
        { message: "Wheek... anyone?", emoji: "🔊", variant: "warning" }
      ],
      critical: [
        { message: "SO LONELY!!", emoji: "🚨", variant: "critical" },
        { message: "WHERE IS EVERYONE?!", emoji: "⚠️", variant: "critical" }
      ]
    },
    hygiene: {
      warning: [
        { message: "I need a bath...", emoji: "🛁", variant: "warning" },
        { message: "Feel dirty...", emoji: "", variant: "warning" }
      ],
      critical: [
        { message: "VERY DIRTY!!", emoji: "🚨", variant: "critical" },
        { message: "NEED CLEANING!!", emoji: "⚠️", variant: "critical" }
      ]
    }
    // ... (11 needs total)
  },

  // General wellness messages
  wellness: {
    excellent: [
      { message: "I feel great!", emoji: "😄", variant: "positive", duration: 4000 },
      { message: "Life is good!", emoji: "✨", variant: "positive", duration: 4000 },
      { message: "Popcorn!", emoji: "🎉", variant: "positive", duration: 3000 }
    ],
    good: [
      { message: "Feeling good", emoji: "😊", variant: "neutral", duration: 4000 },
      { message: "Content~", emoji: "", variant: "neutral", duration: 4000 }
    ],
    fair: [
      { message: "Could be better...", emoji: "😐", variant: "neutral", duration: 4000 },
      { message: "Not great...", emoji: "", variant: "neutral", duration: 4000 }
    ],
    poor: [
      { message: "Not feeling well...", emoji: "😞", variant: "warning", duration: 5000 },
      { message: "Need help...", emoji: "⚠️", variant: "warning", duration: 5000 }
    ],
    critical: [
      { message: "HELP ME!!", emoji: "🚨", variant: "critical", duration: 6000 },
      { message: "URGENT!!", emoji: "⚠️", variant: "critical", duration: 6000 }
    ]
  },

  // Companion interactions
  companion: {
    play: [
      { message: "Let's play!", emoji: "🎮", variant: "positive" },
      { message: "Zoom zoom!", emoji: "💨", variant: "positive" }
    ],
    groom: [
      { message: "Groom groom~", emoji: "✨", variant: "positive" },
      { message: "Looking good!", emoji: "😊", variant: "positive" }
    ],
    cuddle: [
      { message: "Cozy~", emoji: "🥰", variant: "positive" },
      { message: "Warm!", emoji: "❤️", variant: "positive" }
    ],
    sniff: [
      { message: "Sniff sniff", emoji: "👃", variant: "neutral" },
      { message: "Hello!", emoji: "👋", variant: "neutral" }
    ]
  }
} as const

// Message generator function
export function generateReactionMessage(context: MessageContext): ReactionMessage {
  const { interactionType, wellnessTier, preferenceLevel, rejectionReason } = context

  // Handle rejections
  if (rejectionReason) {
    const rejectionMessages = guineaPigMessages[interactionType]?.rejected?.[rejectionReason]
    if (rejectionMessages) {
      return selectRandomMessage(rejectionMessages)
    }
  }

  // Handle preference-based reactions (feeding)
  if (interactionType === 'feed' && preferenceLevel) {
    const preferenceMessages = guineaPigMessages.feeding[preferenceLevel]?.[wellnessTier]
    if (preferenceMessages) {
      return selectRandomMessage(preferenceMessages)
    }
  }

  // Handle success reactions
  const successMessages = guineaPigMessages[interactionType]?.success?.[wellnessTier]
  if (successMessages) {
    return selectRandomMessage(successMessages)
  }

  // Fallback to generic wellness message
  const wellnessMessages = guineaPigMessages.wellness[wellnessTier]
  return selectRandomMessage(wellnessMessages)
}

function selectRandomMessage(messages: ReactionMessage[]): ReactionMessage {
  return messages[Math.floor(Math.random() * messages.length)]
}

// Usage in interaction handlers
export function showFeedingReaction(
  guineaPig: GuineaPig,
  foodItem: FoodItem,
  success: boolean
): void {
  const wellness = calculateWellness(guineaPig.id)
  const wellnessTier = getWellnessTier(wellness)
  const preferenceLevel = guineaPig.preferences.favoriteFood.includes(foodItem.id)
    ? 'favorite'
    : guineaPig.preferences.dislikedFood.includes(foodItem.id)
    ? 'disliked'
    : 'neutral'

  const context: MessageContext = {
    interactionType: 'feed',
    wellnessTier,
    preferenceLevel,
    rejectionReason: !success ? 'limit_reached' : undefined
  }

  const reaction = generateReactionMessage(context)
  showChatBubble(guineaPig.id, reaction)
}
```

**File Organization:**
```
src/
├── data/
│   ├── guineaPigMessages.ts         ← Main message database
│   └── messageGenerators.ts         ← Helper functions for message selection
├── utils/
│   └── reactionHelpers.ts          ← showChatBubble, wellness tier calculation
└── components/
    └── game/
        └── habitat/
            └── GuineaPigChatBubble.vue  ← Chat bubble component
```

**Benefits:**
- **Centralized:** All messages in one location, easy to edit/expand
- **Type-safe:** TypeScript interfaces ensure correct usage
- **Context-aware:** Messages adapt to wellness, preferences, situation
- **Randomization:** Multiple messages per context prevent repetition
- **Extensible:** Easy to add new message types and contexts
- **Maintainable:** Clear structure for adding translations later

### Wellness Tiers

#### 🌟 Excellent (80-100%)
**Behavioral State**: Thriving
- **Responsiveness**: Maximum, eager to interact
- **Base success rate**: **95%**
- **Social behavior**: Actively seeks companion interactions
- **Movement**: Full habitat exploration, curious
- **Vocalizations**: Frequent wheeks, chirps, purrs

#### 😊 Good (60-79%)
**Behavioral State**: Content
- **Responsiveness**: Normal baseline behavior
- **Base success rate**: **85%**
- **Social behavior**: Normal companion interaction frequency
- **Movement**: Regular habitat movement
- **Vocalizations**: Moderate, situation-appropriate

#### 😐 Fair (40-59%)
**Behavioral State**: Stressed
- **Responsiveness**: Subdued, cautious
- **Base success rate**: **65%**
- **Social behavior**: Reduced companion seeking (30% less)
- **Movement**: Limited to safe zones
- **Vocalizations**: Quiet, infrequent

#### 😟 Poor (20-39%)
**Behavioral State**: Withdrawn
- **Responsiveness**: Low, often avoids contact
- **Base success rate**: **40%**
- **Social behavior**: Minimal companion interaction (60% less)
- **Movement**: Stays in shelter, minimal movement
- **Rejection cooldown**: 30-60 seconds before retry
- **Vocalizations**: Rare, quiet distress sounds

#### 😰 Critical (<20%)
**Behavioral State**: Survival Mode
- **Responsiveness**: Minimal, hiding constantly
- **Base success rate**: **20%**
- **Social behavior**: Isolates from companions (80% less)
- **Movement**: None, remains in shelter
- **Rejection cooldown**: 60 seconds minimum
- **Warning**: Rescue system approaching (wellness < 15%)
- **Vocalizations**: Silent or distressed squeaks

### Interaction Type Modifiers

#### Essential Care (Higher Success)
- **feedGuineaPig()**: +15% bonus (survival instinct, min 50% success even at critical)
- **giveWater()**: +15% bonus (thirst drives acceptance, min 50% success)

#### Physical Handling (Lower Success)
- **trimNails()**: No modifier (uses friendship + wellness formula already)
- **cleanGuineaPig()**: -10% penalty (dislikes handling when unwell)
- **performHealthCheck()**: -10% penalty (stressful examination when sick)

#### Social Interactions (Wellness-Dependent)
- **socializeWithGuineaPig()**: Standard rate (0%)
- **playWithGuineaPig()**: -5% penalty (requires energy and good mood)

#### Comfort Activities (Higher Success When Unwell)
- **sootheToSleep()**: +10% bonus (seeks comfort when stressed)
- **provideShelter()**: +10% bonus (anxious animals seek hiding spots)

#### Enrichment Activities
- **rearrangeCage()**: -8% penalty (change is stressful when already stressed)
- **provideBedding()**: +5% bonus (comfort-seeking when unwell)
- **provideChewToy()**: -5% penalty (less interest in enrichment when stressed)

### Interaction Outcomes

#### Full Success
**Conditions**: Random roll < success rate
**Effects:**
- 100% interaction benefit applied
- Full need satisfaction amount
- Positive friendship gain (if applicable)
- Enthusiastic reaction message
- No cooldown timer

#### Partial Success
**Conditions**: Wellness 40-60%, failed primary roll but in partial window
**Effects:**
- 50% interaction benefit applied
- Reduced need satisfaction
- No friendship change
- Neutral/subdued reaction message
- No cooldown

#### Complete Rejection
**Conditions**: Failed roll, wellness < 60%
**Effects:**
- 0% interaction benefit
- No need satisfaction
- No friendship change
- Negative/avoidant reaction message
- **Cooldown timer**: 30-60 seconds before retry allowed

### Rejection Cooldown System

```typescript
interface InteractionCooldown {
  guineaPigId: string
  interactionType: string
  rejectedAt: number
  cooldownMs: number
  consecutiveRejections: number
}

function calculateCooldownDuration(wellness: number, consecutive: number): number {
  let baseCooldown = 30000 // 30 seconds

  // Longer cooldown at lower wellness
  if (wellness < 20) baseCooldown = 60000 // 1 minute
  else if (wellness < 40) baseCooldown = 45000 // 45 seconds

  // Increase for consecutive rejections (player pushing too hard)
  baseCooldown += consecutive * 15000 // +15s per consecutive rejection

  return Math.min(baseCooldown, 120000) // Max 2 minutes
}
```

### Pre-Bonded Pairs & Solo Guinea Pigs

**Adoption Constraints:** Some guinea pigs have social requirements that affect adoption

**Bond Status Types:**

#### Pre-Bonded Pairs (Must Adopt Together)
```typescript
interface PreBondedPair {
  guineaPig1Id: string
  guineaPig2Id: string
  bondStrength: number // 80-100 (inseparable)
  canSeparate: false
  adoptionRequirement: 'must_adopt_together'
}
```

**Characteristics:**
- **Display Badge**: "🤝 Bonded Pair" in adoption interface
- **Adoption Cost**: Combined cost (both guinea pigs purchased together)
- **Separation Prevention**: Cannot adopt just one guinea pig from pair
- **Visual Indicator**: Heart icon (❤️) linking the two guinea pigs in store
- **Description Text**: "This guinea pig is deeply bonded with [Name] and must be adopted together"

**Benefits for Player:**
- Pre-existing friendship (starts at 80-90%)
- Reduced social need decay (-20% for both)
- More frequent autonomous pair interactions
- Lower stress from separation anxiety

**Store Availability:**
- 20-30% of available guinea pigs are in bonded pairs
- Pairs count as 2 of max 10 favorites
- Cannot place only one member in favorites

#### Solo-Preferring Guinea Pigs (Can Adopt Alone)
```typescript
interface SoloGuineaPig {
  guineaPigId: string
  soloPreference: true
  companionTolerance: 'low' | 'none'
  adoptionRequirement: 'can_adopt_alone' | 'must_adopt_alone'
}
```

**Types:**

**Type A - Can Live Alone (Tolerates Others):**
- **Badge**: "🌟 Independent" in adoption interface
- **Behavior**: Can be adopted solo OR with a companion
- **Social Need**: Normal decay rate
- **Companion Compatibility**: 60% (some tension, but manageable)
- **Personality**: Often high boldness (7+), low friendliness (3-5)

**Type B - Must Live Alone (Aggressive/Territorial):**
- **Badge**: "⚠️ Solo Only" in adoption interface
- **Behavior**: CANNOT be adopted with another guinea pig
- **Social Need**: Reduced base requirement (-40%)
- **Companion Compatibility**: 0% (will fight if paired)
- **Personality**: Very high boldness (9+), very low friendliness (1-2)
- **Warning Dialog**: "This guinea pig is territorial and must live alone"

**Store Availability:**
- Type A (Independent): 10-15% of guinea pigs
- Type B (Solo Only): 5-10% of guinea pigs
- Rare trait, provides variety in adoption decisions

**Adoption Interface Changes:**

```typescript
// Store listing display
interface StoreGuineaPig {
  id: string
  name: string
  emoji: string
  price: number
  bondStatus?: 'bonded_pair' | 'independent' | 'solo_only'
  bondedWith?: string // Partner ID for pairs
  adoptionConstraint?: string // User-facing description
}

// Adoption validation
function canAdoptGuineaPig(
  guineaPigId: string,
  currentActiveCount: number
): AdoptionResult {
  const gp = getStoreGuineaPig(guineaPigId)

  // Check max capacity (2 guinea pigs active at once)
  if (currentActiveCount >= 2) {
    return { canAdopt: false, reason: 'Maximum 2 guinea pigs active' }
  }

  // Bonded pair check
  if (gp.bondStatus === 'bonded_pair') {
    if (currentActiveCount >= 1) {
      return {
        canAdopt: false,
        reason: 'Bonded pairs must be adopted together (need 2 free slots)'
      }
    }
    return {
      canAdopt: true,
      requiresBoth: true,
      partnerId: gp.bondedWith,
      totalCost: gp.price + getStoreGuineaPig(gp.bondedWith).price
    }
  }

  // Solo Only check
  if (gp.bondStatus === 'solo_only' && currentActiveCount >= 1) {
    return {
      canAdopt: false,
      reason: 'This guinea pig must live alone'
    }
  }

  return { canAdopt: true }
}
```

**UI Indicators:**
- Bonded pairs: Visual connection line in store grid
- Solo Only: Red border + warning icon
- Independent: Gold border + star icon
- Tooltip on hover explains constraints

### Guinea Pig Pair Interactions

**Both Guinea Pigs' Wellness Matters:**
```typescript
function getPairInteractionSuccess(
  wellness1: number,
  wellness2: number,
  interactionType: string
): number {
  const avgWellness = (wellness1 + wellness2) / 2
  const wellnessDifference = Math.abs(wellness1 - wellness2)

  // Base rate from average wellness
  let baseRate = getInteractionSuccessRate(avgWellness, interactionType)

  // Large wellness gap reduces success
  if (wellnessDifference > 30) {
    baseRate -= 15
  }

  // If either is critical, very low success
  if (wellness1 < 20 || wellness2 < 20) {
    baseRate *= 0.3 // 70% reduction
  }

  return Math.max(5, Math.min(95, baseRate))
}
```

**Pair Interaction Types:**
- **Play**: Play + Social for both (bouncing, chasing, tug-of-war with toys)
- **Sniff/Investigate**: Social + Play (nose-to-nose greeting, exploring each other)
- **Groom**: Hygiene + Social for both (mutual grooming, cleaning companion)
- **Huddle/Cuddle**: Comfort + Social (sleeping together, sitting close for warmth)

---

## Component 1.5: Enhanced Visual Interactions

### Pushable Toys System

**Mechanic:** Guinea pigs can interact with certain toys by moving them across the habitat grid

**Pushable Item Types:**
- Small balls (1 grid cell)
- Wooden blocks (1 grid cell)
- Cardboard tubes (2 grid cells, rotatable)
- Toy vehicles (1-2 grid cells)

**Movement Behavior:**
```typescript
interface PushableItem {
  id: string
  type: string
  position: { x: number; y: number }
  orientation?: 'horizontal' | 'vertical' // For multi-cell items
  isPushable: true
  lastMovedAt?: number
}

function attemptPushItem(
  guineaPigId: string,
  itemId: string,
  direction: 'up' | 'down' | 'left' | 'right'
): boolean {
  const guineaPig = getGuineaPig(guineaPigId)
  const item = getHabitatItem(itemId)

  // Wellness affects push success (must be 40%+ to push items)
  const wellness = calculateWellness(guineaPigId)
  if (wellness < 40) return false // Too weak/unwell to play

  // Calculate target position
  const targetPos = calculateNewPosition(item.position, direction, item.orientation)

  // Check if target space is valid and empty
  if (!isValidPosition(targetPos) || isOccupied(targetPos)) return false

  // Personality affects frequency (bold guinea pigs push more)
  const pushChance = 0.3 + (guineaPig.personality.boldness / 10) * 0.4
  if (Math.random() > pushChance) return false

  // Move the item
  moveItem(itemId, targetPos)

  // Activity feed message
  loggingStore.addGuineaPigActivity(
    `${guineaPig.name} pushes the ${item.name} ${direction}!`,
    '🎾'
  )

  // Small play + social satisfaction
  satisfyNeed(guineaPigId, 'play', 3)

  return true
}
```

**Autonomous Behavior:**
- Guinea pigs randomly push items during play behavior
- Frequency: Every 2-5 minutes if wellness > 60%
- More common with bold personality (boldness 7+)
- Paired guinea pigs may push items toward each other

**Visual Feedback:**
- Smooth CSS transition when item moves (300ms)
- Subtle bounce animation on push
- Guinea pig briefly moves adjacent to pushed item

### Special Treat Visual Effects

**Mechanic:** Favorite treats trigger enhanced visual feedback when eaten

**Effect Types:**

#### Glow Effect (Favorite Foods)
```css
/* Applied when guinea pig eats favorite treat */
.guinea-pig--glowing {
  animation: favorite-glow 2s ease-in-out;
  filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.6));
}

@keyframes favorite-glow {
  0%, 100% { filter: drop-shadow(0 0 4px rgba(255, 215, 0, 0.3)); }
  50% { filter: drop-shadow(0 0 12px rgba(255, 215, 0, 0.8)); }
}
```

#### Emoji Transformation
**Trigger:** Eating ultra-favorite treats (happiness boost > 15)

**Animation Sequence:**
1. Guinea pig emoji briefly scales up (1.2x)
2. Sparkle emojis (✨) appear in 4 corners around guinea pig
3. Brief color pulse effect
4. Small confetti burst of food-related emojis

```typescript
function playTreatReaction(guineaPigId: string, treatType: string): void {
  const element = document.querySelector(`[data-guinea-pig-id="${guineaPigId}"]`)
  if (!element) return

  // Add glow class
  element.classList.add('guinea-pig--glowing')

  // Generate sparkles
  const sparkleEmojis = ['✨', '⭐', '💫']
  createEmojiBurst(element, sparkleEmojis, 8, 'sparkle')

  // Food-specific confetti
  const foodEmojis = getTreatEmojis(treatType) // e.g., ['🥕', '🍎', '🌿']
  setTimeout(() => {
    createEmojiBurst(element, foodEmojis, 6, 'confetti')
  }, 500)

  // Remove glow after animation
  setTimeout(() => {
    element.classList.remove('guinea-pig--glowing')
  }, 2000)
}
```

**Treat Categories & Effects:**
- **Premium Treats** (favorite + high value): Full animation (glow + sparkles + confetti)
- **Regular Favorites**: Glow + sparkles only
- **Liked Foods**: Brief glow only
- **Neutral/Disliked**: No special effects

**Performance Considerations:**
- Effects only trigger if performance mode is OFF
- Animations use CSS transforms (GPU-accelerated)
- Throttled to 1 effect per guinea pig every 3 seconds
- Auto-cleanup of emoji elements after animation

---

## Component 2: Guinea Pig Rescue System
_(From Phase 2.5 System 10.4)_

### Trigger Conditions

**Wellness Threshold**: When any active guinea pig's wellness drops below **15%**

**Rescue Actions:**
1. **Immediate session end**: Game automatically ends active session
2. **Both guinea pigs rescued**: If 2 guinea pigs are active, BOTH return to store
3. **Needs fully restored**: All rescued guinea pigs have all 11 needs reset to 100%
4. **Financial penalty**: Money deducted (default: $200)
5. **Balance floor**: Balance cannot go negative (caps at $0 if can't afford penalty)
6. **Needs processing paused**: System automatically pauses needs processing
7. **Rescue notification**: Modal dialog explains what happened and offers choices

### Warning System

**Level 1 - Warning** (Wellness 20-30%):
- **Message**: "Guinea pig needs urgent care! If wellness drops below 15%, the store will rescue them."
- **Frequency**: Every 60 seconds (throttled)
- **Category**: `environmental` with warning severity
- **Visual**: ⚠️ emoji, yellow border in activity feed

**Level 2 - Critical** (Wellness 15-20%):
- **Message**: "⚠️ CRITICAL: Guinea pig will be rescued if wellness drops below 15%!"
- **Frequency**: Every 30 seconds (throttled)
- **Category**: `environmental` with critical severity
- **Visual**: 🚨 emoji, red border in activity feed

### Fresh Start System

**Always offered** after every rescue, regardless of balance

**✅ Preserved:**
- **First 3 favorite guinea pigs** (free slots 1-3)
- **Total game sessions** (statistics)
- **Total play time** (statistics)

**❌ Lost:**
- **Money reset to $1,000** (fresh start amount)
- **All owned items** (cleared)
- **All consumables** (cleared)
- **All achievements** (cleared)
- **Favorite slots 4-10** (if purchased)
- **⚠️ Guinea pigs in slots 4-10** (permanently lost!)

**Economic Impact:**
Losing purchased favorite slots represents significant investment:
- Slot 4: $50
- Slot 5: $100
- Slot 6: $200
- Slot 7: $400
- Slot 8: $800
- Slot 9: $1,600
- Slot 10: $3,200
- **Total potential loss**: $6,350

**Player Choice:**
- **Continue with penalty**: Pay $200 (or max available), keep all progress
- **Fresh Start**: Reset to $1,000, lose items/slots, keep first 3 favorites

---

## Component 3: Enhanced Activity Messages
_(From Phase 2.5 System 10.5)_

### Feature 1: Guinea Pig Reactions to User Interactions

**Implementation:**
- Reaction messages appear AFTER player action messages
- Reactions vary based on guinea pig preferences
- Uses `loggingStore.addGuineaPigReaction()` for proper categorization

**Examples:**
- After feeding favorite food: "Guinea pig popcorns with excitement! ✨"
- After feeding disliked food: "Guinea pig sniffs cautiously but eats reluctantly"
- After playing with favorite activity: "Guinea pig squeaks with delight!"
- After grooming: "Guinea pig feels fresh and clean!"

### Feature 2: Need Warning System

**Warning Levels:**
- **Warning** (needs 20-30): Gentle reminders every 60 seconds
- **Critical** (needs ≤15): Urgent alerts every 30 seconds

**Need-Specific Messages (11 needs):**
- **Hunger**: Warning: "Guinea pig sniffs around for food" | Critical: "Guinea pig is desperately hungry!"
- **Thirst**: Warning: "Guinea pig licks the water bottle spout" | Critical: "Guinea pig needs water urgently!"
- **Energy**: Warning: "Guinea pig yawns sleepily" | Critical: "Guinea pig is completely exhausted!"
- **Shelter**: Warning: "Guinea pig seeks a safe hiding spot" | Critical: "Guinea pig is anxiously looking for shelter!"
- **Play**: Warning: "Guinea pig seems restless and bored" | Critical: "Guinea pig is extremely bored!"
- **Social**: Warning: "Guinea pig wheeks softly for attention" | Critical: "Guinea pig feels very lonely!"
- **Comfort**: Warning: "Guinea pig adjusts bedding uncomfortably" | Critical: "Guinea pig is very uncomfortable!"
- **Hygiene**: Warning: "Guinea pig tries to groom itself" | Critical: "Guinea pig urgently needs cleaning!"
- **Nails**: Warning: "Guinea pig's nails are getting long" | Critical: "Guinea pig's nails are overgrown!"
- **Health**: Warning: "Guinea pig seems a bit under the weather" | Critical: "Guinea pig needs medical attention!"
- **Chew**: Warning: "Guinea pig looks for something to chew" | Critical: "Guinea pig's teeth need attention!"

**Throttling Logic:**
```typescript
// Warning threshold: needs <= 30, check every 60 seconds
// Critical threshold: needs <= 15, check every 30 seconds
if (needValue <= 15 && timeSinceLastWarning >= 30000) {
  // Show critical warning
} else if (needValue <= 30 && timeSinceLastWarning >= 60000) {
  // Show warning
}
```

### Feature 3: General Wellness Messages

**Wellness Ranges:**
- **Excellent** (80-100): "Guinea pig couldn't be better!", "Guinea pig is thriving!"
- **Good** (60-79): "Guinea pig is doing well", "Guinea pig is content"
- **Fair** (40-59): "Guinea pig could use some care", "Guinea pig seems a bit off"
- **Poor** (<40): "Guinea pig needs urgent attention!", "Guinea pig is struggling"

**Timing & Throttling:**
- Only appear when activity feed is quiet (no messages in last 30 seconds)
- Random interval: 5-10 minutes between wellness messages
- Prevents feed flooding during active gameplay

### Feature 4: Preference Discovery Clues

**Preference Levels:**
- **Favorite**: "✨ Guinea pig's eyes light up! They love this!", "Guinea pig does an excited popcorn!"
- **Neutral**: "Guinea pig munches contentedly", "Guinea pig accepts the food"
- **Disliked**: "Guinea pig sniffs cautiously", "Guinea pig eats reluctantly", "Guinea pig turns away"

**Discovery Mechanic:**
- Players learn preferences through observation
- No explicit "this is their favorite" indicators
- Natural language clues in activity feed
- Builds over time through repeated interactions

### Feature 5: Friendship Milestone Tracking

**6 Friendship Tiers:**
1. **Distant** (0-25%): "Guinea pig is wary of you", "Guinea pig keeps their distance"
2. **Acquainted** (25-40%): "Guinea pig is getting used to you", "Guinea pig watches you curiously"
3. **Comfortable** (40-60%): "Guinea pig trusts you", "Guinea pig comes when called"
4. **Friendly** (60-75%): "Guinea pig greets you warmly", "Guinea pig enjoys your company"
5. **Close Friends** (75-90%): "Guinea pig loves spending time with you", "Guinea pig seeks you out"
6. **Best Friends** (90-100%): "Guinea pig adores you!", "Guinea pig and you are inseparable!"

**Milestone Messages:**
- Appear when crossing tier thresholds
- Special celebration messages at major milestones
- Activity feed logs achievement

---

## Integration with Existing Systems

### Personality Modifiers

**Friendliness + Wellness:**
```typescript
// High friendliness provides resilience against wellness rejection
const friendlinessBonus = (personality.friendliness - 5) * 2
finalSuccessRate = wellnessBaseRate + friendlinessBonus

// Example: Friendliness 9, Wellness 35% (poor)
// Base: 40% + Personality: 8% = 48%
// Friendly guinea pig still trusts player despite feeling unwell
```

**Boldness + Wellness:**
```typescript
// High boldness: MORE withdrawn at low wellness
if (personality.boldness >= 7 && wellness < 40) {
  hideoutPreference += 25% // Seeks isolation
  socialRejectionBonus += 10% // Rejects more interactions
}

// Low boldness: SEEKS comfort at low wellness
if (personality.boldness <= 3 && wellness < 40) {
  comfortInteractionBonus += 15% // More likely to accept soothing
  socialRejectionPenalty -= 10% // Rejects fewer interactions
}
```

### Friendship Impact

**Friendship Moderates Wellness Effects:**
```typescript
// High friendship provides buffer
if (friendship >= 80) wellnessSuccessBonus += 10%
if (friendship >= 90) wellnessSuccessBonus += 15%

// Low friendship + low wellness compound penalty
if (friendship < 30 && wellness < 40) {
  interactionSuccessRate *= 0.7 // 30% additional reduction
}
```

---

## Implementation Examples

### Enhanced feedGuineaPig()

```typescript
function feedGuineaPig(
  guineaPigId: string,
  foodType: 'pellets' | 'hay' | 'vegetables' | 'treats'
): InteractionResult {
  const guineaPig = getGuineaPig(guineaPigId)
  if (!guineaPig) return { success: false }

  const wellness = needsController.calculateWellness(guineaPigId)

  // Check cooldown from previous rejection
  if (!canAttemptInteraction(guineaPigId, 'feed')) {
    return {
      success: false,
      message: `${guineaPig.name} is still recovering from earlier stress`,
      cooldownRemaining: getCooldownRemaining(guineaPigId, 'feed')
    }
  }

  // Calculate success rate (essential care +15% bonus)
  const baseRate = getInteractionSuccessRate(wellness, 'feed')
  const successRate = Math.min(100, baseRate + 15)

  const roll = Math.random() * 100

  if (roll < successRate) {
    // Full success
    satisfyNeed(guineaPigId, 'hunger', hungerReduction)

    // Check preferences for happiness bonus
    if (guineaPig.preferences.favoriteFood.includes(foodType)) {
      adjustNeed(guineaPigId, 'happiness', 10)
    }

    const { message, emoji } = generateWellnessReaction(
      guineaPig.name,
      wellness,
      'feed',
      'success'
    )

    loggingStore.addPlayerAction(message, emoji)
    return { success: true }
  } else {
    // Rejection (rare for feeding)
    const { message, emoji } = generateWellnessReaction(
      guineaPig.name,
      wellness,
      'feed',
      'rejection'
    )

    loggingStore.addGuineaPigReaction(message, emoji)
    setInteractionCooldown(guineaPigId, 'feed', wellness)

    return { success: false }
  }
}
```

---

## Testing Scenarios

### Wellness Decline Testing
1. **Start**: Healthy guinea pig (wellness 90%)
2. **Action**: Stop all care, let needs decay
3. **Track**: Success rates at each tier (80%, 60%, 40%, 20%)
4. **Verify**: Messages reflect wellness accurately, cooldowns apply correctly

### Rescue System Testing
1. **Action**: Let wellness drop below 15%
2. **Verify**: Rescue triggers, both guinea pigs rescued, $200 penalty applied
3. **Test**: Fresh Start dialog appears, options work correctly
4. **Verify**: First 3 favorites preserved, slots 4-10 lost

### Activity Message Throttling
1. **Action**: Let multiple needs drop below 30%
2. **Verify**: Warning messages appear every 60 seconds (not spamming)
3. **Action**: Let need drop below 15%
4. **Verify**: Critical warnings appear every 30 seconds
5. **Verify**: No message spam, clear urgency escalation

---

## Success Criteria

**Player Understanding:**
- ✅ Players recognize wellness impact through rejection feedback
- ✅ Players adjust care strategy when guinea pig becomes withdrawn
- ✅ Players understand wellness recovery improves interaction

**System Balance:**
- ✅ Interaction rejection feels fair, not punishing
- ✅ Recovery path is clear and achievable
- ✅ Excellent care rewarded with enthusiastic interactions
- ✅ Poor care has meaningful consequences

**Emotional Impact:**
- ✅ Players care about guinea pig wellness beyond mechanics
- ✅ Rejection messages motivate better care
- ✅ Recovery feels satisfying and rewarding
- ✅ Guinea pig feels alive with believable responses

---

## References

**Phase 2.5 Detailed Specifications:**
- [System 10.3: Wellness-Based Interaction Reactions](../../phase2.5/system-10.3-wellness-interaction-reactions.md) - Complete wellness tier mechanics
- [System 10.4: Guinea Pig Rescue](../../phase2.5/system-10.4-guinea-pig-rescue.md) - Rescue system details and Fresh Start mechanics
- [System 10.5: Enhanced Activity Messages](../../phase2.5/system-10.5-enhanced-activity-messages.md) - Message generation and throttling

**Related Systems:**
- [System 10.1: Personality Trait Influences](../../phase2.5/system-10.1-personality-trait-influences.md) - Personality modifiers
- [System 10.2: Preferences](../../phase2.5/system-10.2-preferences-likes-dislikes.md) - Preference discovery
- [Wellness System Design](../../../game-design/wellness-system.md) - Hidden wellness mechanics
- [System 21: Social Bonding](../../phase4/system-21-social-bonding-system.md) - Pair interaction foundation
