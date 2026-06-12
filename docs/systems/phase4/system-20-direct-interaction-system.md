# System 20: Direct Interaction System

**Phase 4, Stage 4 - Player-to-Guinea Pig Interactions**

**Time Estimate:** 10-14 hours

## Goal

Implement comprehensive player-to-guinea pig interaction menu with 40+ interactions across 7 categories, including preference discovery, nail clipping success system, friendship-gated interactions, and reaction-based feedback.

## Dependencies

**Required Systems:**
- System 17: Visual Presence & Positioning
- System 19: Autonomous AI Behaviors (for reaction states)
- Needs system (Phase 2)
- Friendship tracking (Phase 2)
- Preferences system (Phase 2)

**Can Run In Parallel With:**
- System 21: Social Bonding System (independent implementation)

## Design Reference

See [design-docs/direct-interaction-system.md](design-docs/direct-interaction-system.md) for comprehensive design specification including:
- Complete interaction catalog (40+ interactions)
- Nail clipping complex success system
- Preference discovery mechanics
- Friendship-gated interaction unlocks
- Reaction types and feedback system

## Implementation Overview

This system implements 9 major subsystems for rich player-guinea pig interaction.

### Core Subsystems

1. **Interaction Menu Component** - UI for selecting interactions
2. **Interaction Effects System** - Need satisfaction and friendship gains
3. **Nail Clipping Complex Success System** - Advanced interaction with variable outcomes
4. **Preference Discovery System** - Learn guinea pig preferences through interaction
5. **Friendship-Gated Interactions** - Progressive unlock system
6. **Reaction-Based Feedback System** - Visual and textual feedback
7. **Cooldown System** - Prevent interaction spam
8. **Need Satisfaction Logic** - Smart need processing with diminishing returns
9. **Activity Feed Integration** - Rich interaction messages

---

## Implementation Tasks

### Task 1: Interaction Menu Component

Create the primary UI for player interactions.

#### Menu Structure

**7 Interaction Categories:**
1. **Basic Interactions** - Pet, hold, brush, clip nails, hand feed
2. **Communication** - Talk to, sing to, whistle, call name
3. **Play** - Peek-a-boo, wave hand, show toy, nose boop
4. **Entertainment** - Obstacle course, hide treats, rotate setup
5. **Care** - Check health, weigh, massage, examine ears
6. **Training** - Teach trick, practice command, reward with treat
7. **Bonding** - Share snack, read to, show photo

#### Component Interface

```typescript
interface InteractionMenuProps {
  guineaPig: GuineaPig
  isOpen: boolean
}

interface InteractionMenuEmits {
  (e: 'close'): void
  (e: 'interact', interactionType: string): void
}

interface InteractionOption {
  id: string
  name: string
  category: string
  icon: string
  cooldown: number
  requiredFriendshipLevel?: number
  isAvailable: boolean
  isOnCooldown: boolean
}
```

**File:** `src/components/game/interaction/InteractionMenu.vue`

---

### Task 2: Interaction Effects System

Define effects for all interactions.

```typescript
interface InteractionEffect {
  needsImpact: {
    hunger?: number
    thirst?: number
    happiness: number
    cleanliness?: number
    health?: number
    energy?: number
    social: number
    shelter?: number
  }
  friendshipGain: number
  cooldownTime: number // seconds
  requiredFriendshipLevel?: number
  duration?: number // interaction animation duration
}

const interactionEffects: Map<string, InteractionEffect> = new Map([
  ['pet', {
    needsImpact: { happiness: 10, social: 15 },
    friendshipGain: 2,
    cooldownTime: 30
  }],
  ['hold', {
    needsImpact: { happiness: 8, social: 20 },
    friendshipGain: 3,
    cooldownTime: 60
  }],
  // ... all 40+ interactions
])
```

**File:** `src/utils/interactionEffects.ts`

---

### Task 3: Nail Clipping Complex Success System

Implement advanced nail clipping mechanics with variable outcomes.

#### Success Rate Calculation

```typescript
function calculateNailClippingSuccess(guineaPig: GuineaPig): {
  successRate: number
  outcome: 'complete' | 'partial' | 'minimal' | 'failure'
  nailsSatisfaction: number
  reaction: string
  activityMessage: string
} {
  const friendship = guineaPig.friendship
  const wellness = guineaPig.wellness

  const baseRate = 0.4
  const friendshipBonus = (friendship / 100) * 0.3
  const wellnessBonus = (wellness / 100) * 0.2
  const successRate = Math.min(0.95, baseRate + friendshipBonus + wellnessBonus)

  if (successRate >= 0.7) {
    return {
      outcome: 'complete',
      satisfaction: 50,
      reaction: 'calm_cooperation',
      message: `You successfully trim all of ${guineaPig.name}'s nails. They sit calmly and trust you completely!`
    }
  }
  // ... other outcomes
}
```

**File:** `src/utils/nailClipping.ts`

---

### Task 4: Preference Discovery System

Implement preference learning through specific interactions.

#### Share Snack Interaction

```typescript
async function shareSnack(guineaPig: GuineaPig, foodItem: FoodItem): Promise<InteractionResult> {
  const preference = guineaPig.preferences.food.find(p => p.item === foodItem.id)

  let reaction: string
  let message: string

  if (preference && preference.level === 'love') {
    reaction = 'excited_popcorn'
    message = `${guineaPig.name} popcorns excitedly for ${foodItem.name} - a clear favorite! ✨`
  } else if (preference && preference.level === 'like') {
    reaction = 'happy_munching'
    message = `${guineaPig.name} munches happily on ${foodItem.name}`
  } else if (preference && preference.level === 'dislike') {
    reaction = 'turn_away'
    message = `${guineaPig.name} doesn't seem interested in ${foodItem.name}`
  }

  satisfyNeed(guineaPig.id, 'hunger', 10)
  satisfyNeed(guineaPig.id, 'social', 15)
  gainFriendship(guineaPig.id, 3)

  return {
    success: true,
    reactionType: reaction,
    activityMessage: message,
    preferenceDiscovered: preference
  }
}
```

**File:** `src/composables/game/usePreferenceDiscovery.ts`

---

### Task 5: Friendship-Gated Interactions

Implement progressive unlock system based on friendship levels.

#### Unlock Tiers

**High Friendship (70-85%):**
- Teach Advanced Tricks
- Special Cuddle Time
- Guinea Pig "Conversations"

**Maximum Friendship (90-100%):**
- Guinea Pig Responds to Specific Calls
- Performs Learned Behaviors on Command
- Exclusive Premium Interactions

#### Gating Logic

```typescript
function getAvailableInteractions(guineaPig: GuineaPig): InteractionOption[] {
  const allInteractions = getAllInteractions()
  const friendship = guineaPig.friendship

  return allInteractions.filter(interaction => {
    // Check friendship requirement
    if (interaction.requiredFriendshipLevel && friendship < interaction.requiredFriendshipLevel) {
      return false
    }

    // Check cooldown
    if (isInteractionOnCooldown(guineaPig.id, interaction.id)) {
      return false
    }

    // Check need saturation
    if (interaction.primaryNeed && isNeedFull(guineaPig, interaction.primaryNeed)) {
      return false
    }

    return true
  })
}
```

---

### Task 6: Reaction-Based Feedback System

Implement visual and textual feedback for interactions.

#### Reaction Types

```typescript
type GuineaPigReaction =
  | 'happy_purr'
  | 'excited_popcorn'
  | 'content_relaxed'
  | 'curious_sniff'
  | 'mild_resistance'
  | 'nervous_fidgeting'
  | 'stress_hide'
  | 'turn_away'
  | 'calm_cooperation'
  | 'playful_engagement'

function displayReaction(guineaPig: GuineaPig, reaction: GuineaPigReaction): void {
  const reactionDisplay = getReactionDisplay(reaction)

  setGuineaPigAnimation(guineaPig.id, reactionDisplay.animationClass)

  if (reactionDisplay.emoji) {
    showEmojiOverlay(guineaPig.position, reactionDisplay.emoji)
  }

  setTimeout(() => {
    clearGuineaPigAnimation(guineaPig.id)
  }, reactionDisplay.duration)
}
```

---

### Task 7: Cooldown System

Prevent interaction spam with cooldown tracking.

```typescript
interface InteractionCooldown {
  guineaPigId: string
  interactionType: string
  cooldownEnd: number
  totalCooldownTime: number
}

function startInteractionCooldown(
  guineaPigId: string,
  interactionType: string,
  cooldownSeconds: number
): void {
  const key = `${guineaPigId}-${interactionType}`
  activeCooldowns.value.set(key, {
    guineaPigId,
    interactionType,
    cooldownEnd: Date.now() + (cooldownSeconds * 1000),
    totalCooldownTime: cooldownSeconds
  })
}
```

**File:** `src/composables/game/useInteractions.ts`

---

### Task 8: Need Satisfaction Logic

Implement smart need satisfaction with diminishing returns.

```typescript
function processInteractionNeedSatisfaction(
  guineaPig: GuineaPig,
  interaction: InteractionEffect
): NeedType[] {
  const needsChanged: NeedType[] = []

  for (const [need, amount] of Object.entries(interaction.needsImpact)) {
    const currentNeed = getNeedLevel(guineaPig.id, need as NeedType)

    // Won't accept if need is already full
    if (currentNeed >= 95) continue

    // Diminishing returns for high needs
    let adjustedAmount = amount
    if (currentNeed >= 80) adjustedAmount *= 0.5
    else if (currentNeed >= 70) adjustedAmount *= 0.75

    satisfyNeed(guineaPig.id, need as NeedType, adjustedAmount)
    needsChanged.push(need as NeedType)
  }

  return needsChanged
}
```

---

### Task 9: Activity Feed Integration

Generate rich, descriptive messages for all interactions.

**Player Action Messages:**
- "You gently pet your guinea pig behind the ears"
- "You offer a strawberry treat to your guinea pig"

**Guinea Pig Reaction Messages:**
- "Guinea pig purrs contentedly during petting! 💕"
- "Guinea pig popcorns excitedly for the strawberry! ✨"

**Preference Discovery Messages:**
- "Guinea pig seems to LOVE strawberries - a new favorite discovered!"

**File:** `src/utils/messageGenerator.ts` (modify)

---

## Files to Create/Modify

### New Files

```
src/components/game/interaction/InteractionMenu.vue - Main menu UI
src/components/game/interaction/InteractionButton.vue - Individual button
src/components/game/interaction/InteractionCooldownDisplay.vue - Cooldown timer
src/composables/game/useInteractions.ts - Interaction execution
src/composables/game/usePreferenceDiscovery.ts - Preference discovery
src/utils/interactionEffects.ts - Effect definitions
src/utils/nailClipping.ts - Nail clipping calculation
```

### Modified Files

```
src/components/game/habitat/GuineaPigSprite.vue - Add reaction animations
src/stores/guineaPigStore.ts - Track interaction cooldowns
src/utils/messageGenerator.ts - Add interaction messages
src/components/game/habitat/HabitatVisual.vue - Integrate interaction menu trigger
```

---

## Testing & Validation

### Interaction Menu Testing

- [x] All interaction categories display correctly
- [x] Friendship-gated interactions appear/disappear properly
- [x] Cooldowns prevent interaction spam
- [x] Need saturation blocks appropriate interactions

### Interaction Effects Testing

- [x] All interactions apply correct need satisfaction
- [x] Friendship gains work correctly
- [x] Nail clipping success varies with friendship/wellness
- [x] Preference discovery reveals correct information

### Feedback System Testing

- [x] Reactions display correctly for each interaction
- [x] Activity feed messages generate properly
- [x] Visual feedback clear and responsive
- [x] Cooldown indicators work correctly

---

## Success Criteria

**Core Functionality:**
- [x] Interaction menu displays all available interactions
- [x] Friendship-gated interactions unlock appropriately
- [x] All basic interactions apply correct effects
- [x] Nail clipping success system works correctly
- [x] Preference discovery interactions reveal preferences
- [x] Cooldown system prevents spam
- [x] Need saturation logic blocks unnecessary interactions
- [x] Reactions display for all interaction types
- [x] Activity feed shows all interactions
- [x] Friendship progression unlocks new interactions

**Quality Standards:**
- [x] Interaction response < 100ms
- [x] UI intuitive and easy to navigate
- [x] 40+ interactions implemented
- [x] All 7 categories functional

---

## Implementation Strategy

**Phase 1 (3-4 hours):** Interaction menu UI + basic interactions
**Phase 2 (2-3 hours):** Nail clipping + preference discovery
**Phase 3 (2-3 hours):** Friendship-gated interactions + reactions
**Phase 4 (3-4 hours):** Cooldowns + need logic + all remaining interactions

---

## Next Steps

After completing System 20:

1. **Test all 40+ interactions** individually
2. **Verify friendship-gated unlocks** work correctly
3. **Test preference discovery** with various foods
4. **Move to System 21:** [Social Bonding System](system-21-social-bonding-system.md)

System 21 implements multi-guinea pig social interactions and bonding.

---

## Related Documentation

- **Master Plan:** [phase-4-guinea-pig-integration-plan-full.md](phase-4-guinea-pig-integration-plan-full.md)
- **Design Spec:** [design-docs/direct-interaction-system.md](design-docs/direct-interaction-system.md)
- **Previous System:** [system-19-autonomous-ai-behaviors.md](system-19-autonomous-ai-behaviors.md)
- **Next System:** [system-21-social-bonding-system.md](system-21-social-bonding-system.md)
