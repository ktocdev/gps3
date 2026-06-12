# Personality Trait Influence System - System 3

**Phase 2.5: Interactive Feedback Enhancement**

## Overview
Comprehensive system defining how the 4 core personality traits (Friendliness, Playfulness, Curiosity, Boldness) influence guinea pig behavior, needs, interactions, and all gameplay mechanics. Personality creates unique individual experiences, making each guinea pig genuinely different to care for.

## Core Philosophy
- **Individual uniqueness**: Each guinea pig feels distinctly different based on personality
- **Observable differences**: Personality effects are noticeable in gameplay
- **Natural discovery**: Players learn personality through observation, not stat sheets
- **Meaningful choices**: Personality influences which care strategies work best
- **Future-proof design**: Framework supports expansion as new systems are added

## The Five Personality Traits

### Trait Structure
Each guinea pig has 5 personality traits rated 1-10:
- **1-3**: Low (trait is weak or minimal)
- **4-6**: Moderate (balanced, middle-ground)
- **7-10**: High (trait is strong or dominant)

### Trait Definitions

#### Friendliness (1-10)
**Definition**: How social, outgoing, and responsive to interaction the guinea pig is

**High Friendliness (7-10)**:
- Eager to interact with player
- Enjoys being handled and pet
- Responsive to attention
- Forms strong bonds quickly
- Comfortable with frequent human interaction

**Low Friendliness (1-3)**:
- Reserved and independent
- Takes time to warm up
- Prefers observing from distance
- Bonds slowly but still capable
- Comfortable with minimal interaction

**Moderate Friendliness (4-6)**:
- Balanced social needs
- Adaptable to varying interaction levels
- Neither clingy nor distant
- Steady, predictable bonding

#### Playfulness (1-10)
**Definition**: Energy level, enthusiasm for activities, and engagement with enrichment

**High Playfulness (7-10)**:
- High energy and active
- Loves toys and activities
- Needs frequent enrichment
- Enjoys dynamic interactions
- Enthusiastic reactions

**Low Playfulness (1-3)**:
- Calm and relaxed
- Prefers quiet activities
- Content with simple environment
- Less play and enrichment needed
- Peaceful disposition

**Moderate Playfulness (4-6)**:
- Balanced energy levels
- Enjoys both active and calm time
- Flexible enrichment needs
- Adaptable play style

#### Curiosity (1-10)
**Definition**: Drive to explore, investigate, and engage with novelty

**High Curiosity (7-10)**:
- Investigates everything immediately
- Loves habitat changes
- Quickly bored without novelty
- Adventurous and brave
- First to explore new items

**Low Curiosity (1-3)**:
- Comfortable with routine
- Cautious about changes
- Prefers familiar items
- Takes time to investigate
- Values predictability

**Moderate Curiosity (4-6)**:
- Balanced exploration drive
- Investigates at own pace
- Comfortable with some novelty
- Neither fearful nor reckless

#### Boldness (1-10)
**Definition**: Confidence, bravery, and comfort with new experiences and changes

**High Boldness (7-10)**:
- Confident and brave
- Quick to explore new things
- Less stressed by changes
- First to investigate unfamiliar items
- Comfortable in new situations
- Resilient to environmental shifts

**Low Boldness (1-3)**:
- Cautious and timid
- Needs time to adjust
- Stressed by sudden changes
- Prefers familiar environments
- Hides when uncertain
- Sensitive to disruptions

**Moderate Boldness (4-6)**:
- Balanced confidence
- Adjusts to changes at own pace
- Neither fearful nor reckless
- Cautiously curious
- Steady adaptation

#### Cleanliness (1-10)
**Definition**: Sensitivity to habitat conditions - freshness of hay, bedding, and cage cleanliness

**High Cleanliness / Picky (7-10)**:
- Finicky about hay freshness (won't eat below 60% fresh)
- Uncomfortable with stale bedding (below 50%)
- Stressed by dirty cage (cleanliness below 50%)
- Higher standards for habitat maintenance
- Appreciates fresh, clean environment
- Comfort penalties when conditions deteriorate

**Low Cleanliness / Piggy (1-3)**:
- Unbothered by mess
- Will eat hay down to 20% freshness
- Tolerant of old bedding (fine until 25%)
- Unfazed by dirty cage (until below 30%)
- Content in any conditions
- Easy-going about habitat maintenance

**Moderate Cleanliness (4-6)**:
- Baseline sensitivity (40% thresholds)
- Standard comfort expectations
- Neither finicky nor unbothered
- Normal habitat maintenance needs

## Current System Influences (Phase 2)

### Needs Decay Rate Modifiers

**Friendliness → Social Need Decay**:
```typescript
// High friendliness = faster social need decay (needs more interaction)
socialDecayRate = baseDecayRate * (1 + (friendliness - 5) * 0.04)

// Examples:
// Friendliness 10: 1.20x decay rate (+20%, very social, gets lonely quickly)
// Friendliness 5: 1.0x decay rate (baseline)
// Friendliness 1: 0.84x decay rate (-16%, reserved, comfortable alone)
```

**Playfulness → Play Need Decay**:
```typescript
// High playfulness = faster play need decay (needs more enrichment)
playDecayRate = baseDecayRate * (1 + (playfulness - 5) * 0.06)

// Examples:
// Playfulness 10: 1.30x decay rate (+30%)
// Playfulness 5: 1.0x decay rate (baseline)
// Playfulness 1: 0.76x decay rate (-24%)
```

**Curiosity → Play Need Decay** (secondary modifier):
```typescript
// High curiosity also affects play decay (needs more mental enrichment)
// Note: Stimulation need was removed as redundant - curiosity now modifies play need
playDecaySecondary = baseDecayRate * (1 + (curiosity - 5) * 0.04)

// Examples:
// Curiosity 10: 1.20x decay rate (+20%)
// Curiosity 5: 1.0x decay rate (baseline)
// Curiosity 1: 0.68x decay rate (-32%)
```

**Boldness → Comfort Need Decay**:
```typescript
// High boldness = slower comfort decay (confident, less stressed)
comfortDecayRate = baseDecayRate * (1 - (boldness - 5) * 0.05)

// Examples:
// Boldness 10: 0.75x decay rate (-25%)
// Boldness 5: 1.0x decay rate (baseline)
// Boldness 1: 1.20x decay rate (+20%)
```

**Cleanliness → Comfort Need with Habitat Conditions (Phase 3)**:
```typescript
// Cleanliness trait affects comfort based on habitat conditions
if (habitatCleanliness < cleanlinessThreshold) {
  const cleanlinessPersonality = guineaPig.personality.cleanliness

  if (cleanlinessPersonality >= 7) {
    // Picky: Strict thresholds, higher penalties
    hayThreshold = 60
    beddingThreshold = 50
    cleanlinessThreshold = 50
    comfortPenalty = (cleanlinessThreshold - habitatCleanliness) * 0.3
  } else if (cleanlinessPersonality <= 3) {
    // Piggy: Lenient thresholds, lower penalties
    hayThreshold = 20
    beddingThreshold = 25
    cleanlinessThreshold = 30
    comfortPenalty = habitatCleanliness < 30 ? (30 - habitatCleanliness) * 0.1 : 0
  } else {
    // Moderate: Baseline thresholds
    hayThreshold = 40
    beddingThreshold = 40
    cleanlinessThreshold = 40
    comfortPenalty = (40 - habitatCleanliness) * 0.2
  }
}

// Examples:
// Cleanliness 10 (Picky Princess): Comfort penalty at 50% cleanliness, won't eat hay < 60%
// Cleanliness 5 (Balanced): Comfort penalty at 40% cleanliness, won't eat hay < 40%
// Cleanliness 1 (Total Piggy): Comfort penalty at 30% cleanliness, will eat hay at 20%
```

**Combined Example**:
```
Guinea Pig: High Curiosity (9) + Low Boldness (2) + High Cleanliness (8)
  Curiosity modifier: 1 + (9 - 5) * 0.04 = 1.16x (+16% play decay - needs mental enrichment)
  Boldness modifier: 1 - (2 - 5) * 0.05 = 1.15x (+15% comfort decay)
  Cleanliness: Won't eat hay below 60%, stressed by cage below 50%

Result: Curious, timid, picky guinea pig - loves to explore but gets stressed easily and needs pristine habitat
```

### Interaction Effectiveness Modifiers

**Friendliness → Social Interactions**:
```typescript
// socializeWithGuineaPig(), affection interactions
baseSatisfaction = 25
bonus = (friendliness - 5) * 3

effectiveSatisfaction = baseSatisfaction + bonus

// Examples:
// Friendliness 10: 25 + 15 = 40 (+60% effectiveness)
// Friendliness 5: 25 + 0 = 25 (baseline)
// Friendliness 1: 25 - 12 = 13 (-48% effectiveness)
```

**Playfulness → Play Interactions**:
```typescript
// playWithGuineaPig(), toy interactions
baseSatisfaction = 20
multiplier = 1 + (playfulness - 5) * 0.05

effectiveSatisfaction = baseSatisfaction * multiplier

// Examples:
// Playfulness 10: 20 * 1.25 = 25 (+25% effectiveness)
// Playfulness 5: 20 * 1.0 = 20 (baseline)
// Playfulness 1: 20 * 0.80 = 16 (-20% effectiveness)
```

**Curiosity → Stimulation Interactions**:
```typescript
// rearrangeCage(), new item introduction
baseSatisfaction = 30
newItemBonus = curiosity >= 7 ? 10 : 0
multiplier = 1 + (curiosity - 5) * 0.06

effectiveSatisfaction = (baseSatisfaction + newItemBonus) * multiplier

// Examples (new item):
// Curiosity 10: (30 + 10) * 1.30 = 52 (+73% effectiveness)
// Curiosity 5: 30 * 1.0 = 30 (baseline)
// Curiosity 1: 30 * 0.76 = 23 (-24% effectiveness)
```

**Boldness → Comfort from Environmental Changes**:
```typescript
// provideBedding(), rearrangeCage() when combined with habitat changes
baseComfort = 35
boldnessBonus = boldness >= 7 ? 8 : 0
timidPenalty = boldness <= 3 ? -5 : 0

effectiveComfort = baseComfort + boldnessBonus + timidPenalty

// Examples:
// Boldness 10: 35 + 8 = 43 (+23% from confident adaptation)
// Boldness 5: 35 (baseline)
// Boldness 1: 35 - 5 = 30 (-14% penalty, stressed by changes)
```

### Friendship Progression Modifiers

**Friendliness → Friendship Gain Rate**:
```typescript
// adjustFriendship() when called from positive interactions
baseFriendshipGain = 0.5 // Per interaction
multiplier = 1 + (friendliness - 5) * 0.03

actualGain = baseFriendshipGain * multiplier

// Examples:
// Friendliness 10: 0.5 * 1.15 = 0.575 (+15% faster bonding)
// Friendliness 5: 0.5 * 1.0 = 0.5 (baseline)
// Friendliness 1: 0.5 * 0.88 = 0.44 (-12% slower bonding)
```

**Boldness → Friendship Resilience**:
```typescript
// Bold guinea pigs maintain friendship better during low wellness
// Timid guinea pigs lose friendship faster when stressed

if (wellness < 40) {
  if (boldness >= 7) {
    friendshipDecayModifier = 0.75 // -25% friendship loss when unwell
  } else if (boldness <= 3) {
    friendshipDecayModifier = 1.25 // +25% friendship loss when stressed
  } else {
    friendshipDecayModifier = 1.0
  }
}
```

### Activity Feed Reaction Variations

**Friendliness → Interaction Reactions**:

**High Friendliness**:
- "Guinea pig purrs contentedly and nuzzles your hand!"
- "Guinea pig wheeks excitedly at your approach!"
- "Guinea pig runs up eagerly for attention!"

**Low Friendliness**:
- "Guinea pig accepts the interaction calmly"
- "Guinea pig observes from a distance"
- "Guinea pig warms up slowly to your presence"

**Playfulness → Activity Reactions**:

**High Playfulness**:
- "Guinea pig bounces with excitement! 🎉"
- "Guinea pig does energetic zoomies around the cage!"
- "Guinea pig plays enthusiastically with the toy!"

**Low Playfulness**:
- "Guinea pig investigates the toy at a leisurely pace"
- "Guinea pig rests peacefully in the hideout"
- "Guinea pig enjoys a calm moment of relaxation"

**Curiosity → New Item Reactions**:

**High Curiosity**:
- "Guinea pig immediately investigates the new item!"
- "Guinea pig sniffs every corner with fascination"
- "Guinea pig explores the rearranged cage excitedly"

**Low Curiosity**:
- "Guinea pig cautiously approaches the new item"
- "Guinea pig prefers the familiar corner of the cage"
- "Guinea pig takes time to adjust to the changes"

**Boldness → Stress/Change Reactions**:

**High Boldness**:
- "Guinea pig confidently investigates the change!"
- "Guinea pig seems unfazed by the disruption"
- "Guinea pig bravely approaches the new situation"

**Low Boldness**:
- "Guinea pig retreats to the hideout nervously"
- "Guinea pig watches cautiously from a safe distance"
- "Guinea pig needs time to adjust to the changes"

## Future System Influences (Phase 3-5)

### Autonomy System (Phase 4)

**Friendliness → Approach Behaviors**:
```typescript
// Likelihood of approaching player vs. hiding
approachChance = (friendliness * 10) + "%"

// High friendliness (10): 100% approach when player nearby
// Low friendliness (1): 10% approach, 90% observe from distance
```

**Playfulness → Activity Selection**:
```typescript
// Autonomous toy usage frequency
toyUsageFrequency = playfulness * 2 // Minutes between toy interactions

// High playfulness (10): Every 20 minutes
// Low playfulness (1): Every 2 minutes
```

**Curiosity → Exploration Patterns**:
```typescript
// How quickly guinea pig investigates new items
investigationDelay = (11 - curiosity) * 30 // Seconds before investigation

// High curiosity (10): 30 seconds (immediate)
// Low curiosity (1): 300 seconds (5 minutes, cautious)

// Habitat exploration radius
explorationRadius = curiosity * 10 // Percentage of habitat explored per cycle

// High curiosity: Explores 100% of accessible areas
// Low curiosity: Stays in 10% comfort zone
```

**Boldness → Hiding Behavior**:
```typescript
// Likelihood of hiding when wellness is low
hidingThreshold = 60 - (boldness * 3) // Wellness percentage when hiding starts

// High boldness (10): Hides only below 30% wellness (confident)
// Low boldness (1): Hides below 57% wellness (timid, hides easily)

// Duration of hiding behavior
hidingDuration = (11 - boldness) * 20 // Seconds before re-emerging

// High boldness: 20 seconds (brief hide)
// Low boldness: 200 seconds (extended hiding)
```

### Guinea Pig Bonding (Phase 4)

**Already Documented in [guinea-pig-bonding-system.md](../phase4/guinea-pig-bonding-system.md)**

Summary of personality compatibility:
- **Friendliness**: High+High = +20, High+Low = +10
- **Playfulness**: Similar levels bond better (within 3 points = +10)
- **Curiosity**: Complementary helps (High+Low = +5 for balance)
- **Boldness**: Similar levels preferred (within 3 points = +15, bold protects timid)

### Item Interaction Preferences (Phase 3-4)

**Playfulness → Toy Preference**:
- High playfulness: Prefers active toys (tunnels, balls, mazes)
- Low playfulness: Prefers passive comfort items (beds, hideouts)

**Curiosity → Enrichment Response**:
- High curiosity: Maximum benefit from puzzle feeders, new items
- Low curiosity: Consistent benefit from familiar enrichment

**Boldness → Hideout Usage**:
- High boldness: Uses hideouts mainly for sleep, spends time in open areas
- Low boldness: Retreats to hideouts frequently when uncertain or stressed
- Moderate boldness: Balanced use, hideouts as comfort zones

**Friendliness → Mirror/Social Toys**:
- High friendliness: Enjoys mirrors, "social" enrichment items
- Low friendliness: Neutral or slight discomfort with mirrors

### Habitat Maintenance (Phase 3)

**Playfulness → Mess Generation**:
```typescript
// Active guinea pigs scatter more bedding, move items
messMultiplier = 1 + (playfulness - 5) * 0.04

// High playfulness (10): 1.20x mess rate (more active = messier)
// Low playfulness (1): 0.84x mess rate
```

**Cleanliness → Habitat Condition Tolerance**:
```typescript
// Picky guinea pigs affected by poor habitat conditions
if (cleanlinessPersonality >= 7) {
  // Picky: Strict standards
  hayFreshnessMinimum = 60  // Won't eat below this
  beddingFreshnessComfort = 50  // Comfort penalty below this
  cageCleanlinessComfort = 50  // Stress penalty below this
} else if (cleanlinessPersonality <= 3) {
  // Piggy: Very tolerant
  hayFreshnessMinimum = 20
  beddingFreshnessComfort = 25
  cageCleanlinessComfort = 30
} else {
  // Moderate: Baseline
  hayFreshnessMinimum = 40
  beddingFreshnessComfort = 40
  cageCleanlinessComfort = 40
}

// Activity messages vary:
// Picky (8): "Guinea pig wrinkles nose at the stale hay"
// Piggy (2): "Guinea pig happily munches the hay without concern"
```

**Curiosity → Item Rearrangement**:
- High curiosity guinea pigs may autonomously move small items
- Adds gameplay variety and "personality" to habitat

## Personality Visualization & Communication

### Activity Feed Integration

**Personality Traits Should Influence**:
1. **Message Selection**: Different personality templates for same action
2. **Emoji Choice**: Energetic (🎉) vs. calm (😌) based on playfulness
3. **Frequency**: High playfulness = more frequent activity messages
4. **Tone**: Friendly vs. reserved language based on friendliness

### Debug Panel Display (Future Enhancement)

**Personality Panel**:
```
┌─ Personality Traits ──────────────┐
│ Friendliness:    ████████░░ 8/10  │
│ Playfulness:     ███░░░░░░░ 3/10  │
│ Curiosity:       ██████████ 10/10 │
│ Boldness:        ██░░░░░░░░ 2/10  │
│ Cleanliness:     █████████░ 9/10  │
│                                   │
│ Personality Type: Picky Explorer  │
│ - Curious but cautious            │
│ - Social but reserved             │
│ - Calm energy level               │
│ - Very particular about cleanliness│
└───────────────────────────────────┘
```

**Current Modifiers Display**:
```
┌─ Active Personality Modifiers ────┐
│ Social Need Decay:    0.96x ✓     │
│ Play Effectiveness:   0.85x       │
│ Stimulation Decay:    1.40x ⚠     │
│ Friendship Gain:      1.09x ✓     │
└───────────────────────────────────┘
```

### Personality Type Descriptions

**System generates personality summary based on trait combinations**:

**Combinations**:
- **Social Butterfly**: High Friendliness (8+), High Playfulness (7+)
- **Timid Explorer**: High Curiosity (8+), Low Boldness (1-3)
- **Brave Adventurer**: High Curiosity (8+), High Boldness (8+)
- **Calm Companion**: Low Playfulness (1-3), High Friendliness (7+)
- **Cautious Observer**: Low Curiosity (1-3), Low Boldness (1-3)
- **Balanced Buddy**: All traits 4-6 (moderate everything)

## Balancing Guidelines

### Design Principles

**1. No "Bad" Personalities**:
- All personality combinations are viable
- Trade-offs rather than disadvantages
- High maintenance in one area, low in another

**2. Observable Differences**:
- Personality effects should be noticeable (minimum 15-20% variation)
- Players should recognize personality through gameplay, not just stats
- Different strategies work for different personalities

**3. Consistent Scaling**:
- Each point of personality trait should have consistent value
- Linear scaling preferred for predictability
- Special breakpoints only for thematic reasons (e.g., independence 8+ for "loner" behaviors)

**4. Future-Proof Framework**:
- New systems should consider how personality influences them
- Trait effects should be documented when new mechanics are added
- Maintain coherent personality expression across all systems

### Balancing Targets

**Care Difficulty Balance**:
```
Easy Care:
  - Low playfulness (content with less)
  - High boldness (resilient to stress)
  - Low curiosity (routine is fine)

Challenging Care:
  - High playfulness (needs constant enrichment)
  - Low boldness (easily stressed, needs stability)
  - High curiosity (bores easily)
```

**Both Should Be Fun**:
- Easy care = relaxing, peaceful experience
- Challenging care = engaging, dynamic experience
- Neither is "better," just different play styles

## Implementation Notes

### Current Phase (2.5)

**Already Implemented**:
- Personality trait data structure (1-10 scale)
- Traits assigned during guinea pig generation
- Stored in GuineaPig interface

**Documentation Priority**:
- This document defines intended behavior
- Implementation in Phase 2 systems (needs, interactions)
- Framework for Phase 3-4 integration

**Debug Integration**:
- Add personality display to Guinea Pig Debug panel
- Show trait values and active modifiers
- Preview how personality affects specific interactions

### Code Integration Examples

**Needs Decay (needsController.ts)**:
```typescript
function calculatePersonalityNeedDecay(
  guineaPig: GuineaPig,
  needType: keyof GuineaPigNeeds
): number {
  const baseDecay = needsDecayRates[needType]
  let modifier = 1.0

  switch (needType) {
    case 'social':
      // Friendliness: higher = faster decay (needs more interaction)
      modifier = 1 + (guineaPig.personality.friendliness - 5) * 0.04
      break

    case 'play':
      // Playfulness: higher = faster decay
      modifier = 1 + (guineaPig.personality.playfulness - 5) * 0.06
      break

    // Note: Stimulation need was removed as redundant to play
    // Curiosity now provides secondary modifier to play need

    case 'comfort':
      // Boldness: higher = slower decay (less stressed)
      modifier = 1 - (guineaPig.personality.boldness - 5) * 0.05
      break
  }

  return baseDecay * modifier
}
```

**Interaction Benefits (guineaPigStore.ts)**:
```typescript
function socializeWithGuineaPig(guineaPigId: string): boolean {
  const guineaPig = getGuineaPig(guineaPigId)
  if (!guineaPig) return false

  // Base social gain
  let socialGain = 25

  // Friendliness bonus
  const friendlinessBonus = (guineaPig.personality.friendliness - 5) * 3
  socialGain += friendlinessBonus

  // Apply the benefit
  satisfyNeed(guineaPigId, 'social', socialGain)

  // Generate personality-appropriate reaction
  const reaction = generatePersonalityReaction(guineaPig, 'social_interaction')
  loggingStore.addGuineaPigReaction(reaction.message, reaction.emoji)

  return true
}
```

**Reaction Generation (messageGenerator.ts)**:
```typescript
function generatePersonalityReaction(
  guineaPig: GuineaPig,
  interactionType: string
): { message: string; emoji: string } {
  const { friendliness, playfulness, curiosity, boldness } = guineaPig.personality

  if (interactionType === 'social_interaction') {
    if (friendliness >= 8) {
      return {
        message: `${guineaPig.name} purrs contentedly and nuzzles your hand!`,
        emoji: '🥰'
      }
    } else if (friendliness <= 3) {
      return {
        message: `${guineaPig.name} accepts the interaction calmly`,
        emoji: '😌'
      }
    }
  }

  if (interactionType === 'play') {
    if (playfulness >= 8) {
      return {
        message: `${guineaPig.name} bounces with excitement!`,
        emoji: '🎉'
      }
    } else if (playfulness <= 3) {
      return {
        message: `${guineaPig.name} enjoys a calm moment of play`,
        emoji: '😊'
      }
    }
  }

  if (interactionType === 'habitat_change') {
    if (boldness >= 8) {
      return {
        message: `${guineaPig.name} confidently investigates the change!`,
        emoji: '😎'
      }
    } else if (boldness <= 3) {
      return {
        message: `${guineaPig.name} retreats to the hideout nervously`,
        emoji: '😰'
      }
    }
  }

  // Default reaction
  return {
    message: `${guineaPig.name} reacts to the interaction`,
    emoji: '🐹'
  }
}
```

## Testing Scenarios

### Personality Extremes Testing

**Test Guinea Pig Profiles**:

**1. Social Butterfly**:
- Friendliness: 10, Playfulness: 8, Curiosity: 6, Boldness: 7
- Expected: Needs lots of interaction, forms bonds quickly, social decay very slow, confident

**2. Timid Explorer**:
- Friendliness: 3, Playfulness: 5, Curiosity: 10, Boldness: 2
- Expected: Curious but cautious, needs enrichment, slow bonding, easily stressed by changes

**3. Energetic Player**:
- Friendliness: 7, Playfulness: 10, Curiosity: 9, Boldness: 8
- Expected: High energy, needs toys, friendly and bold, fast play decay, confident adventurer

**4. Calm Companion**:
- Friendliness: 9, Playfulness: 2, Curiosity: 3, Boldness: 6
- Expected: Loves attention, peaceful, routine-oriented, slow play decay, steady temperament

**5. Balanced Buddy**:
- All traits: 5-6
- Expected: Baseline behavior, adaptable, no extreme needs

### Verification Checklist
- [ ] Personality traits display correctly in debug panel
- [ ] Need decay rates visibly different between personalities
- [ ] Interaction effectiveness varies with personality
- [ ] Activity feed messages reflect personality
- [ ] Friendship progression shows personality influence
- [ ] No personality combination feels "broken" or unplayable
- [ ] Players can observe personality differences without checking stats

## Future Enhancements

### Personality Development (Phase 5+)
- **Personality drift**: Traits slowly shift based on player care style
- **Reinforcement**: Frequently used behaviors strengthen related traits
- **Age effects**: Young guinea pigs more curious, older ones more set in ways

### Advanced Interactions
- **Personality-specific achievements**: "Befriend a shy guinea pig"
- **Personality hints in store**: Subtle behavioral previews before adoption
- **Personality matching**: Suggest companions based on compatibility

### Player Feedback
- **Personality insights**: Periodic messages explaining personality effects
- **Care recommendations**: Suggestions tailored to personality
- **Milestone tracking**: Progress in understanding guinea pig's personality

## References
- [Guinea Pig Bonding System](../phase4/guinea-pig-bonding-system.md) - Personality compatibility
- [Guinea Pig Autonomy System](../phase4/guinea-pig-autonomy-system.md) - AI behavior influences
- [Preferences System](../../game-design/preferences-system.md) - Likes/dislikes separate from personality
- [Needs System](../phase2/system-7-needs-system.md) - Need categories and decay rates
