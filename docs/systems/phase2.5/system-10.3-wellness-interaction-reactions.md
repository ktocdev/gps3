# Wellness-Based Interaction Reactions - System 10.3

**Phase 2.5: Interactive Feedback Enhancement**
**Status:** ➡️ **Moved to Phase 5 [System 22](../phase5/system-22-interaction-enhancement.md)**

> **⚠️ Note:** This system has been consolidated into Phase 5 **[System 22: Interaction Enhancement System](../phase5/system-22-interaction-enhancement.md)** as Component 1 (Wellness-Based Interaction Reactions). Systems 10.3, 10.4, and 10.5 have been combined into System 22 for cohesive interaction feedback. Please refer to System 22 for the complete specification.

## Overview
Comprehensive system defining how wellness scores affect guinea pig responsiveness to both user interactions and guinea-pig-to-guinea-pig social behaviors. Creates meaningful consequences for poor care through behavioral changes, interaction rejection, and reduced effectiveness, making wellness tangible beyond friendship penalties alone.

## Core Philosophy
- **Visible consequences**: Low wellness creates observable behavioral changes
- **Realistic responses**: Unwell animals are less social and more withdrawn
- **Recovery motivation**: Players want to restore wellness to regain full interaction
- **Graduated severity**: Effects worsen progressively as wellness declines
- **Educational feedback**: Rejection messages teach players about wellness importance

## Wellness Tiers

### Current Wellness Calculation
From `needsController.ts`:
```typescript
Wellness = (Critical × 0.40) + (Environmental × 0.35) + (Maintenance × 0.25)

Where:
- Critical: (hunger + thirst + energy + shelter) / 4
- Environmental: (play + social + comfort) / 3
- Maintenance: (hygiene + nails + health + chew) / 4

Range: 0-100 (100 = perfect, 0 = critical)
```

### Interaction Response Tiers

#### 🌟 Excellent (80-100%)
**Behavioral State**: Thriving
- **Responsiveness**: Maximum, eager to interact
- **Approach**: Comes to player readily, initiates contact
- **Vocalizations**: Frequent wheeks, chirps, purrs
- **Social**: Actively seeks companion interactions
- **Exploration**: Full habitat exploration, curious

**Interaction Success**:
- Base success rate: **95%**
- Almost always accepts interactions
- Full benefit from all interactions
- Enthusiastic, positive reactions

#### 😊 Good (60-79%)
**Behavioral State**: Content
- **Responsiveness**: Normal baseline behavior
- **Approach**: Standard, neither eager nor reluctant
- **Vocalizations**: Moderate, situation-appropriate
- **Social**: Normal companion interaction frequency
- **Exploration**: Regular habitat movement

**Interaction Success**:
- Base success rate: **85%**
- Usually accepts interactions
- Standard interaction benefits
- Calm, accepting reactions

#### 😐 Fair (40-59%)
**Behavioral State**: Stressed
- **Responsiveness**: Subdued, cautious
- **Approach**: Hesitant, may retreat initially
- **Vocalizations**: Quiet, infrequent
- **Social**: Reduced companion seeking (30% less)
- **Exploration**: Limited to safe zones

**Interaction Success**:
- Base success rate: **65%**
- Sometimes rejects interactions (35% failure)
- Partial success possible (50% benefit)
- Reluctant, subdued reactions

#### 😟 Poor (20-39%)
**Behavioral State**: Withdrawn
- **Responsiveness**: Low, often avoids contact
- **Approach**: Retreats, stays in hiding spots
- **Vocalizations**: Rare, quiet distress sounds
- **Social**: Minimal companion interaction (60% less)
- **Exploration**: Stays in shelter, minimal movement

**Interaction Success**:
- Base success rate: **40%**
- Often rejects interactions (60% failure)
- Partial successes common
- Anxious, avoidant reactions
- **Rejection cooldown**: 30-60 seconds before retry

#### 😰 Critical (<20%)
**Behavioral State**: Survival Mode
- **Responsiveness**: Minimal, hiding constantly
- **Approach**: Avoids all contact, trembles
- **Vocalizations**: Silent or distressed squeaks
- **Social**: Isolates from companions (80% less)
- **Exploration**: None, remains in shelter

**Interaction Success**:
- Base success rate: **20%**
- Usually rejects interactions (80% failure)
- Only essential care sometimes accepted
- Fearful, stressed reactions
- **Rejection cooldown**: 60 seconds minimum
- **Warning**: Rescue system approaching (wellness < 15%)

## User Interaction Mechanics

### Base Success Rate Formula

```typescript
function getInteractionSuccessRate(
  wellness: number,
  interactionType: string
): number {
  // Base rate by wellness tier
  let baseRate: number
  if (wellness >= 80) baseRate = 95
  else if (wellness >= 60) baseRate = 85
  else if (wellness >= 40) baseRate = 65
  else if (wellness >= 20) baseRate = 40
  else baseRate = 20

  // Apply interaction-specific modifiers
  baseRate += getInteractionModifier(interactionType, wellness)

  return Math.max(10, Math.min(100, baseRate))
}
```

### Interaction Type Modifiers

#### Essential Care (Higher Success Even at Low Wellness)

**feedGuineaPig()**: +15% bonus
- **Rationale**: Survival instinct, hungry animals eat
- **Minimum success**: 50% even at critical wellness
- **Partial success**: Reduced benefit if stressed

**giveWater()**: +15% bonus
- **Rationale**: Thirst drives acceptance
- **Minimum success**: 50% even at critical wellness
- **Partial success**: Drinks less when anxious

#### Physical Handling (Lower Success at Low Wellness)

**trimNails()**: No modifier (0%)
- **Current implementation**: Already uses friendship + wellness
- **Success formula**: `40 + (friendship * 0.3) + (wellness * 0.2)`
- **Rejection common**: At low wellness, guinea pig won't cooperate

**cleanGuineaPig()**: -10% penalty
- **Rationale**: Dislikes handling when feeling unwell
- **Rejection behavior**: Squirms, tries to escape

**performHealthCheck()**: -10% penalty
- **Rationale**: Stressful examination when already sick
- **Partial success**: Gets some information but incomplete

#### Social Interactions (Wellness-Dependent)

**socializeWithGuineaPig()**: Standard rate (0%)
- **Baseline wellness response**: Directly reflects wellness tier
- **High wellness**: Eager for attention
- **Low wellness**: Withdrawn, avoids contact

**playWithGuineaPig()**: -5% penalty
- **Rationale**: Play requires energy and good mood
- **Low wellness**: Too tired or stressed to play

#### Comfort Activities (Higher Success When Unwell)

**sootheToSleep()**: +10% bonus
- **Rationale**: Seeks comfort when stressed or tired
- **Low wellness**: Actually MORE likely to accept soothing
- **Benefit**: Helps with energy + comfort needs

**provideShelter()**: +10% bonus
- **Rationale**: Anxious animals seek hiding spots
- **Low wellness**: Grateful for safe space
- **Benefit**: Shelter need satisfaction + stress relief

#### Enrichment Activities (Moderate Success Impact)

**rearrangeCage()**: -8% penalty
- **Rationale**: Change is stressful when already stressed
- **High wellness**: Enjoys novelty
- **Low wellness**: Prefers familiar environment

**provideBedding()**: +5% bonus
- **Rationale**: Comfort-seeking when unwell
- **Benefit**: Comfort need + hygiene improvement

**provideChewToy()**: -5% penalty
- **Rationale**: Less interest in enrichment when stressed
- **Low wellness**: May ignore toys

### Interaction Outcomes

#### Full Success
**Conditions**: Random roll < success rate
**Effects**:
- 100% interaction benefit applied
- Full need satisfaction amount
- Positive friendship gain (if applicable)
- Enthusiastic reaction message
- No cooldown timer

**Example** (Excellent Wellness 90%):
```
Player: feedGuineaPig('cocoa', 'vegetables')
Roll: 45 < 95 (base) + 15 (essential) = 110 (capped at 100)
Result: SUCCESS

Effect: -30 hunger, +10 happiness (favorite food)
Message: "Cocoa eagerly munches on the fresh vegetables!"
Emoji: 😋
```

#### Partial Success
**Conditions**: Wellness 40-60%, failed primary roll but in partial window
**Effects**:
- 50% interaction benefit applied
- Reduced need satisfaction
- No friendship change
- Neutral/subdued reaction message
- No cooldown

**Example** (Fair Wellness 50%):
```
Player: playWithGuineaPig('mocha', 'tunnel')
Roll: 70 > 65 (base) - 5 (play penalty) = 60
Partial Window: 60-80 = PARTIAL SUCCESS

Effect: -10 play (50% of normal 20)
Message: "Mocha investigates the tunnel halfheartedly"
Emoji: 😐
```

#### Complete Rejection
**Conditions**: Failed roll, wellness < 60%
**Effects**:
- 0% interaction benefit
- No need satisfaction
- No friendship change
- Negative/avoidant reaction message
- **Cooldown timer**: 30-60 seconds before retry allowed

**Example** (Poor Wellness 30%):
```
Player: socializeWithGuineaPig('pepper')
Roll: 85 > 40 (base) = REJECTION

Effect: None (interaction failed)
Message: "Pepper retreats to the hideout and won't come out 😰"
Cooldown: 45 seconds
Hint: "Pepper seems stressed. Try improving basic needs first."
```

### Rejection Cooldown System

```typescript
interface InteractionCooldown {
  guineaPigId: string
  interactionType: string
  rejectedAt: number
  cooldownMs: number
  consecutiveRejections: number
}

function canAttemptInteraction(
  guineaPigId: string,
  interactionType: string
): boolean {
  const cooldown = getCooldown(guineaPigId, interactionType)
  if (!cooldown) return true

  const elapsed = Date.now() - cooldown.rejectedAt
  return elapsed >= cooldown.cooldownMs
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

## Guinea Pig to Guinea Pig Interactions

### Pair Interaction Success

**Both Guinea Pigs' Wellness Matters**:
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
  // Healthy pig can't force interaction on unwell pig
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

### Social Interaction Types

#### Grooming Each Other
**Benefit**: Hygiene + Social needs for both

**Excellent Wellness** (both 80-100%):
- Success rate: **90%**
- Effect: +5 hygiene each, +3 social each
- Message: "Cocoa and Mocha groom each other affectionately 🥰"

**Good Wellness** (both 60-79%):
- Success rate: **75%**
- Effect: +3 hygiene each, +2 social each
- Message: "Cocoa and Mocha take turns grooming"

**Fair Wellness** (one 40-59%):
- Success rate: **50%**
- Effect: +2 hygiene each, +1 social each
- Message: "Mocha grooms Cocoa briefly before moving away"

**Poor Wellness** (one 20-39%):
- Success rate: **25%**
- Effect: +1 hygiene, minimal social
- Message: "Cocoa tries to groom Mocha but Mocha pulls away"
- **Note**: Unwell guinea pig rejects grooming attempt

**Critical** (either <20%):
- Success rate: **10%**
- Effect: None or minimal
- Message: "Pepper stays hidden while Truffle looks on concerned 😰"

#### Playing Together
**Benefit**: Play + Social needs for both

**Excellent Wellness**:
- Success: **85%**, Effect: +10 play each, +5 social
- "Cocoa and Mocha chase each other playfully!"

**Good Wellness**:
- Success: **70%**, Effect: +7 play, +3 social
- "Cocoa and Mocha play together contentedly"

**Fair Wellness**:
- Success: **40%**, Effect: +4 play, +2 social
- "Mocha plays briefly while Cocoa watches"

**Poor Wellness**:
- Success: **15%**, Effect: Minimal
- "Cocoa tries to engage Mocha but Mocha isn't interested"

**Critical**:
- Success: **5%**, Effect: None
- "Pepper is too stressed to play"
- **Behavior**: Healthy guinea pig may play alone

#### Sharing Food
**Benefit**: Hunger + Social needs

**Excellent Wellness**:
- Success: **95%** (hunger is strong motivator)
- Effect: +hunger (shared), +3 social each
- "Cocoa and Mocha eat side by side, sharing vegetables"

**Good Wellness**:
- Success: **85%**
- Effect: +hunger, +2 social
- "Cocoa and Mocha munch together peacefully"

**Fair Wellness**:
- Success: **70%** (some food competition emerges)
- Effect: +hunger, +1 social
- "Mocha eats cautiously near Cocoa"

**Poor Wellness**:
- Success: **50%** (stress creates food guarding)
- Effect: +hunger for one, minimal social
- "Cocoa guards the food dish from Mocha 😟"
- **Behavior**: May show territorial behavior

**Critical**:
- Success: **30%** (survival mode, less sharing)
- Effect: Minimal
- "Pepper eats alone in the corner"

#### Sleeping Together
**Benefit**: Energy + Comfort + Social

**Excellent Wellness**:
- Success: **90%**, Effect: +energy, +comfort bonus
- "Cocoa and Mocha snuggle together for a nap 💕"

**Good Wellness**:
- Success: **80%**, Effect: +energy, +comfort
- "Cocoa and Mocha rest peacefully side by side"

**Fair Wellness**:
- Success: **60%**, Effect: +energy (restless sleep)
- "Mocha sleeps near Cocoa but shifts uncomfortably"

**Poor Wellness**:
- Success: **35%**, Effect: Reduced benefit
- "Cocoa prefers to sleep alone in the hideout"
- **Behavior**: Unwell pig seeks isolation

**Critical**:
- Success: **15%**, Effect: Minimal
- "Pepper huddles alone, too stressed to rest with Truffle"

#### Exploring Together
**Benefit**: Play + Social

**Excellent Wellness**:
- Success: **80%**, Effect: +play, +social
- "Cocoa and Mocha explore the habitat together curiously"

**Good Wellness**:
- Success: **65%**, Effect: Standard benefits
- "Cocoa and Mocha wander around the cage"

**Fair Wellness**:
- Success: **45%**, Effect: Reduced (less curious when stressed)
- "Mocha follows Cocoa cautiously"

**Poor Wellness**:
- Success: **20%**, Effect: Minimal
- "Cocoa stays in the safe zone while Mocha explores alone"

**Critical**:
- Success: **5%**, Effect: None
- "Pepper remains hidden, not exploring"

### Autonomous Interaction Frequency

**Wellness Impact on Initiation Rate**:
```typescript
function getAutonomousInteractionFrequency(wellness: number): number {
  if (wellness >= 80) return 1.5   // 50% more frequent
  if (wellness >= 60) return 1.0   // Baseline (every X minutes)
  if (wellness >= 40) return 0.7   // 30% less frequent
  if (wellness >= 20) return 0.4   // 60% less frequent
  return 0.2                       // 80% less frequent (hiding)
}

// Example: Normal interaction every 10 minutes
// Excellent wellness: Every 6.7 minutes
// Poor wellness: Every 25 minutes
// Critical wellness: Every 50 minutes (rare)
```

**Wellness Gap Impact**:
```typescript
// Healthy guinea pig notices unwell companion
if (wellness1 > 70 && wellness2 < 40) {
  // Healthy pig may show concern behaviors
  loggingStore.addAutonomousBehavior(
    `${name1} checks on ${name2} who seems unwell`,
    '🤔'
  )

  // Attempts gentler interactions (grooming, staying close)
  // Avoids play/energetic interactions
}
```

## Behavioral State Manifestations

### Thriving (80-100% Wellness)

**Movement Patterns**:
- Full habitat exploration
- Active, energetic movement
- Approaches player readily
- Investigates new items immediately

**Social Behavior**:
- Initiates interactions frequently
- Accepts all appropriate interactions
- Plays enthusiastically with companion
- Vocalizes happily

**Positional Preference**:
- Open areas, food dish, toy zones
- Minimal hiding spot usage
- Near player interaction areas

**Activity Feed Examples**:
- "Cocoa explores the habitat with curiosity"
- "Cocoa wheeks excitedly for vegetables"
- "Cocoa does happy popcorn jumps!"

### Content (60-79% Wellness)

**Movement Patterns**:
- Normal, balanced movement
- Regular habitat usage
- Standard player approach
- Moderate exploration

**Social Behavior**:
- Normal interaction frequency
- Accepts most interactions
- Plays normally with companion
- Moderate vocalizations

**Positional Preference**:
- Balanced between zones
- Normal hiding spot usage
- Comfortable throughout habitat

**Activity Feed Examples**:
- "Mocha munches on hay peacefully"
- "Mocha investigates the new toy"
- "Mocha rests in the cozy hideout"

### Stressed (40-59% Wellness)

**Movement Patterns**:
- Reduced exploration radius
- Stays in safe zones more
- Cautious player approach
- Hesitant movement

**Social Behavior**:
- 30% fewer interactions initiated
- 35% rejection rate for interactions
- Less playful with companion
- Quiet, subdued vocalizations

**Positional Preference**:
- Prefers corners, hideouts
- Near shelter areas
- Avoids open center

**Activity Feed Examples**:
- "Pepper seems subdued today"
- "Pepper stays close to the hideout"
- "Pepper watches cautiously from a distance"
- "Pepper seems stressed 😟"

### Withdrawn (20-39% Wellness)

**Movement Patterns**:
- Minimal movement
- Stays in hiding spots
- Avoids player proximity
- Retreats when approached

**Social Behavior**:
- 60% fewer interactions initiated
- 60% rejection rate
- Isolates from companion
- Rare, distressed vocalizations

**Positional Preference**:
- Almost always in hideout
- Darkest corner of shelter
- Faces away from activity

**Activity Feed Examples**:
- "Truffle is hiding and won't come out 😰"
- "Truffle flinches at movement nearby"
- "Truffle looks very stressed"
- "Truffle needs urgent care!"

### Critical (<20% Wellness)

**Movement Patterns**:
- Nearly motionless
- Constant hiding
- Freezes when approached
- Only moves for essential needs

**Social Behavior**:
- 80% fewer interactions
- 80% rejection rate
- Complete isolation
- Silent or distressed squeaks

**Positional Preference**:
- Deepest hiding spot
- Trembling in corner (future animation)
- Completely withdrawn

**Activity Feed Examples**:
- "Hazel is in critical condition 🚨"
- "Hazel trembles in the hideout"
- "Hazel barely moves - immediate care needed!"
- "Hazel is too unwell to interact"
- "⚠️ Warning: Wellness below rescue threshold!"

## Reaction Message Templates

### Message Generation System

```typescript
interface WellnessReactionTemplates {
  [interactionType: string]: {
    [wellnessTier: string]: {
      success: string[]
      partial: string[]
      rejection: string[]
    }
  }
}

function generateWellnessReaction(
  guineaPigName: string,
  wellness: number,
  interactionType: string,
  outcome: 'success' | 'partial' | 'rejection'
): { message: string; emoji: string } {

  const tier = getWellnessTier(wellness)
  const templates = wellnessReactionTemplates[interactionType][tier][outcome]
  const template = randomChoice(templates)
  const message = template.replace('{name}', guineaPigName)
  const emoji = getWellnessEmoji(wellness, outcome)

  return { message, emoji }
}
```

### Template Examples by Interaction

#### socializeWithGuineaPig()

**Excellent (80-100%)**:
- ✅ Success: "{name} purrs happily and nuzzles your hand! 🥰"
- ✅ Success: "{name} wheeks excitedly at your approach!"
- ✅ Success: "{name} does happy popcorns when you pet them!"

**Good (60-79%)**:
- ✅ Success: "{name} accepts your affection calmly 😊"
- ✅ Success: "{name} seems content with the interaction"
- ✅ Success: "{name} allows gentle petting"

**Fair (40-59%)**:
- ✅ Success: "{name} tolerates the interaction 😐"
- ⚠️ Partial: "{name} allows brief petting before moving away"
- ❌ Rejection: "{name} moves away, preferring to be left alone"

**Poor (20-39%)**:
- ❌ Rejection (60%): "{name} retreats to the hideout 😰"
- ❌ Rejection: "{name} flinches and won't come out"
- ⚠️ Partial (40%): "{name} accepts touch briefly but seems anxious"

**Critical (<20%)**:
- ❌ Rejection (80%): "{name} stays hidden and trembles 🚨"
- ❌ Rejection: "{name} is too stressed for interaction"
- ❌ Rejection: "{name} needs care, not socialization right now"

#### playWithGuineaPig()

**Excellent**:
- ✅ "Bounces excitedly and zooms around! 🎉"
- ✅ "Plays enthusiastically with the toy!"
- ✅ "Does energetic popcorns during playtime!"

**Good**:
- ✅ "Plays contentedly 😊"
- ✅ "Engages with the activity"
- ✅ "Enjoys the playtime"

**Fair**:
- ⚠️ "Shows little interest in playing 😐"
- ⚠️ "Plays halfheartedly"
- ❌ "Too stressed to play right now"

**Poor**:
- ❌ "Is too tired and stressed to play 😰"
- ❌ "Retreats instead of playing"
- ❌ "Needs rest more than play"

**Critical**:
- ❌ "Is far too unwell to engage 🚨"
- ❌ "Barely has energy to move"
- ❌ "Needs urgent care, not play"

#### feedGuineaPig()

**Excellent**:
- ✅ "Eagerly munches on the {food}! 😋"
- ✅ "Wheeks excitedly and devours the food!"
- ✅ "Eats enthusiastically!"

**Good**:
- ✅ "Eats the food offered 😊"
- ✅ "Munches contentedly"
- ✅ "Accepts the food readily"

**Fair**:
- ✅ "Eats hesitantly 😐"
- ⚠️ "Nibbles cautiously at the food"
- ✅ "Eats some but seems subdued"

**Poor**:
- ⚠️ "Nibbles cautiously, eating very little 😰"
- ⚠️ "Barely touches the food"
- ✅ "Eats a small amount" (survival instinct)

**Critical**:
- ⚠️ "Takes a few desperate bites 🚨"
- ⚠️ "Barely has appetite despite hunger"
- ⚠️ "Needs immediate wellness attention"

**Note**: Feeding rarely fully rejects due to survival instinct, but effectiveness reduces

#### sootheToSleep()

**Excellent**:
- ✅ "Settles down peacefully for a nap 😴"
- ✅ "Yawns and drifts off contentedly"

**Good**:
- ✅ "Accepts the comfort and rests 😊"
- ✅ "Relaxes and falls asleep"

**Fair**:
- ✅ "Settles uneasily but eventually rests 😐"
- ✅ "Takes a while to relax"

**Poor**:
- ✅ "Gratefully accepts comfort 🥺" (+10% bonus)
- ✅ "Seeks the soothing desperately"
- ✅ "Finally relaxes after gentle care"

**Critical**:
- ✅ "Trembles but eventually calms 😰" (+10% bonus)
- ✅ "Needs this comfort badly"
- ✅ "Gradually settles with soothing"

**Note**: Soothing has HIGHER success at low wellness (comfort-seeking)

## Integration with Existing Systems

### Personality Modifiers

**Friendliness + Wellness**:
```typescript
// High friendliness provides resilience against wellness rejection
const friendlinessBonus = (personality.friendliness - 5) * 2

finalSuccessRate = wellnessBaseRate + friendlinessBonus

// Example: Friendliness 9, Wellness 35% (poor)
// Base: 40% + Personality: 8% = 48%
// Friendly guinea pig still trusts player despite feeling unwell
```

**Independence + Wellness**:
```typescript
// High independence: MORE withdrawn at low wellness
if (personality.independence >= 7 && wellness < 40) {
  hideoutPreference += 25% // Seeks isolation
  socialRejectionBonus += 10% // Rejects more interactions
}

// Low independence: SEEKS comfort at low wellness
if (personality.independence <= 3 && wellness < 40) {
  comfortInteractionBonus += 15% // More likely to accept soothing
  socialRejectionPenalty -= 10% // Rejects fewer interactions
}
```

**Playfulness + Wellness**:
```typescript
// High playfulness: Faster play rejection decline
if (personality.playfulness >= 7) {
  playRejectionThreshold = 60 // Rejects play below 60% wellness
} else {
  playRejectionThreshold = 40 // Baseline
}

// Low playfulness already doesn't play much, less affected
```

**Curiosity + Wellness**:
```typescript
// High curiosity: More affected by wellness in exploration
if (personality.curiosity >= 7 && wellness < 50) {
  explorationRadius *= 0.5 // Dramatic reduction
  playSeekingReduction = 40%
}

// Low curiosity: Already cautious, less dramatic change
```

### Friendship Impact

**Friendship Moderates Wellness Effects**:
```typescript
// High friendship provides buffer
if (friendship >= 80) {
  wellnessSuccessBonus += 10%
}

if (friendship >= 90) {
  wellnessSuccessBonus += 15% // Strong bond helps
}

// Example: Wellness 30%, Friendship 95
// Base: 40% + Friendship: 15% = 55%
// Loyal guinea pig trusts despite being unwell
```

**Low Friendship + Low Wellness Compound**:
```typescript
// Double penalty for neglected, unwell guinea pig
if (friendship < 30 && wellness < 40) {
  interactionSuccessRate *= 0.7 // 30% additional reduction

  // Messages reflect both low wellness AND low friendship
  // "Pepper doesn't trust you and is too unwell to interact 💔"
}
```

### Rescue System Integration (System 2)

**Pre-Rescue Behavioral Escalation**:
```typescript
if (wellness < 20) {
  // Maximum hiding, minimum interaction
  // Clear signal rescue is imminent

  if (wellness < 18) {
    // Urgent warnings in activity feed
    loggingStore.addEnvironmentalEvent(
      "⚠️ {name} is in critical condition - immediate care needed!",
      "🚨"
    )
  }

  if (wellness < 15) {
    // Rescue threshold
    // See System 2 for rescue mechanics
  }
}
```

**Wellness Recovery Post-Rescue**:
```typescript
// After rescue, needs reset to 100%, wellness should be excellent
// Guinea pig should return to normal interaction behavior
// Activity feed should note improvement:

if (wasRescued && wellness > 80) {
  loggingStore.addEnvironmentalEvent(
    "{name} seems much healthier after being cared for! 🌟",
    "✨"
  )
}
```

### Enhanced Activity Messages (System 1)

**Wellness-Informed Reactions**:
```typescript
// System 1 reactions should consider wellness context
function generateReactionMessage(
  guineaPig: GuineaPig,
  interactionType: string
): string {
  const wellness = calculateWellness(guineaPig.id)
  const personality = guineaPig.personality

  // Combine wellness + personality for rich reactions
  if (wellness >= 80 && personality.friendliness >= 8) {
    return "Very enthusiastic, affectionate reaction"
  }

  if (wellness < 40 && personality.independence >= 8) {
    return "Withdrawn, isolated hiding behavior"
  }

  // Etc...
}
```

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
  const hungerReduction = feedingAmounts[foodType]

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

    return { success: true, effectiveAmount: hungerReduction }

  } else if (wellness < 60 && roll < successRate + 20) {
    // Partial success (stressed eating)
    const reducedAmount = hungerReduction * 0.5
    satisfyNeed(guineaPigId, 'hunger', reducedAmount)

    const { message, emoji } = generateWellnessReaction(
      guineaPig.name,
      wellness,
      'feed',
      'partial'
    )

    loggingStore.addGuineaPigReaction(message, emoji)

    return { success: false, effectiveAmount: reducedAmount }

  } else {
    // Rejection (rare for feeding, but possible)
    const { message, emoji } = generateWellnessReaction(
      guineaPig.name,
      wellness,
      'feed',
      'rejection'
    )

    loggingStore.addGuineaPigReaction(message, emoji)

    // Set cooldown
    setInteractionCooldown(guineaPigId, 'feed', wellness)

    // Provide hint
    loggingStore.addEnvironmentalEvent(
      `${guineaPig.name}'s wellness is very low. Try comfort interactions.`,
      '💡'
    )

    return { success: false, effectiveAmount: 0 }
  }
}
```

### Enhanced socializeWithGuineaPig()

```typescript
function socializeWithGuineaPig(guineaPigId: string): InteractionResult {
  const guineaPig = getGuineaPig(guineaPigId)
  if (!guineaPig) return { success: false }

  const wellness = needsController.calculateWellness(guineaPigId)

  // Check cooldown
  if (!canAttemptInteraction(guineaPigId, 'socialize')) {
    return {
      success: false,
      message: `${guineaPig.name} needs space right now`,
      cooldownRemaining: getCooldownRemaining(guineaPigId, 'socialize')
    }
  }

  // Calculate success with personality modifier
  let successRate = getInteractionSuccessRate(wellness, 'socialize')

  // Friendliness bonus
  const friendlinessBonus = (guineaPig.personality.friendliness - 5) * 2
  successRate += friendlinessBonus

  // Friendship bonus
  if (guineaPig.friendship >= 80) {
    successRate += 10
  }

  const roll = Math.random() * 100

  if (roll < successRate) {
    // Success
    const socialGain = 25
    satisfyNeed(guineaPigId, 'social', socialGain)

    // Friendship gain varies by wellness
    let friendshipGain = 0.5
    if (wellness >= 80) friendshipGain = 0.7 // Extra gain when happy

    adjustFriendship(guineaPigId, friendshipGain)

    const { message, emoji } = generateWellnessReaction(
      guineaPig.name,
      wellness,
      'socialize',
      'success'
    )

    loggingStore.addPlayerAction(message, emoji)

    return { success: true }

  } else if (wellness >= 40 && roll < successRate + 15) {
    // Partial success
    const reducedGain = 12
    satisfyNeed(guineaPigId, 'social', reducedGain)

    const { message, emoji } = generateWellnessReaction(
      guineaPig.name,
      wellness,
      'socialize',
      'partial'
    )

    loggingStore.addGuineaPigReaction(message, emoji)

    return { success: false }

  } else {
    // Rejection
    const { message, emoji } = generateWellnessReaction(
      guineaPig.name,
      wellness,
      'socialize',
      'rejection'
    )

    loggingStore.addGuineaPigReaction(message, emoji)

    setInteractionCooldown(guineaPigId, 'socialize', wellness)

    // Provide guidance
    if (wellness < 40) {
      loggingStore.addEnvironmentalEvent(
        `${guineaPig.name} is too stressed for social interaction. Focus on basic needs.`,
        '💡'
      )
    }

    return { success: false }
  }
}
```

### Guinea Pig Pair Grooming

```typescript
function attemptPairGrooming(
  guineaPig1Id: string,
  guineaPig2Id: string
): boolean {

  const gp1 = getGuineaPig(guineaPig1Id)
  const gp2 = getGuineaPig(guineaPig2Id)
  if (!gp1 || !gp2) return false

  const wellness1 = calculateWellness(guineaPig1Id)
  const wellness2 = calculateWellness(guineaPig2Id)

  const successRate = getPairInteractionSuccess(wellness1, wellness2, 'grooming')

  const roll = Math.random() * 100

  if (roll < successRate) {
    // Successful grooming
    const hygieneGain = getGroomingBenefit(wellness1, wellness2)
    const socialGain = getSocialBenefit(wellness1, wellness2)

    satisfyNeed(guineaPig1Id, 'hygiene', hygieneGain)
    satisfyNeed(guineaPig2Id, 'hygiene', hygieneGain)
    satisfyNeed(guineaPig1Id, 'social', socialGain)
    satisfyNeed(guineaPig2Id, 'social', socialGain)

    // Message varies by wellness
    const avgWellness = (wellness1 + wellness2) / 2
    let message: string

    if (avgWellness >= 80) {
      message = `${gp1.name} and ${gp2.name} groom each other affectionately 🥰`
    } else if (avgWellness >= 60) {
      message = `${gp1.name} and ${gp2.name} take turns grooming`
    } else if (avgWellness >= 40) {
      message = `${gp1.name} grooms ${gp2.name} briefly`
    } else {
      message = `${gp1.name} tries to groom ${gp2.name} who pulls away`
    }

    loggingStore.addAutonomousBehavior(message, '🧼')

    return true
  }

  // Failed interaction
  if (wellness1 < 40 || wellness2 < 40) {
    const unwellPig = wellness1 < wellness2 ? gp1.name : gp2.name
    loggingStore.addAutonomousBehavior(
      `${unwellPig} is too stressed for grooming interaction`,
      '😰'
    )
  }

  return false
}
```

## Testing Scenarios

### Wellness Decline Testing
1. **Start**: Healthy guinea pig (wellness 90%, all needs satisfied)
2. **Action**: Stop all care, let needs decay naturally
3. **Track**:
   - Interaction success rates at each tier (80%, 60%, 40%, 20%)
   - Rejection messages appropriateness
   - Behavioral state changes in activity feed
   - Guinea pig positional changes (moves to hiding)
4. **Verify**:
   - Success rates match tier definitions
   - Messages reflect wellness level accurately
   - Cooldowns apply correctly after rejections
   - Player receives helpful guidance

### Wellness Recovery Testing
1. **Start**: Critical wellness guinea pig (15%)
2. **Action**: Provide focused care (food, water, soothing)
3. **Track**:
   - Wellness progression: 15% → 30% → 50% → 70% → 90%
   - Interaction acceptance improving at each tier
   - Behavioral state transitions
   - Activity feed recovery messages
4. **Verify**:
   - Guinea pig becomes more responsive as wellness improves
   - Positive feedback messages appear
   - Full interaction restored at excellent wellness

### Pair Interaction Testing (Different Wellness Levels)
1. **Setup**: Two guinea pigs
   - Cocoa: Excellent wellness (90%)
   - Mocha: Poor wellness (30%)
2. **Action**: Monitor autonomous interactions
3. **Track**:
   - Interaction frequency (should be reduced)
   - Success rates (should be low due to wellness gap)
   - Healthy pig behavior (shows concern, gentle approaches)
   - Unwell pig behavior (isolation, rejection)
4. **Verify**:
   - Wellness gap penalty applies (-15%)
   - Healthy pig doesn't force interactions
   - Activity feed reflects wellness-appropriate interactions

### Personality + Wellness Interaction
1. **Setup**: Two guinea pigs, both poor wellness (35%)
   - Pepper: High friendliness (9), Low independence (2)
   - Truffle: Low friendliness (2), High independence (9)
2. **Action**: Attempt socializeWithGuineaPig() on both
3. **Track**:
   - Pepper: Base 40% + Friendliness 8% = 48% success
   - Truffle: Base 40% + Friendliness -6% = 34% success
4. **Verify**:
   - Pepper more receptive despite poor wellness (friendly nature)
   - Truffle very withdrawn (independent + unwell = isolation)
   - Messages reflect personality differences

### Cooldown System Testing
1. **Action**: Attempt interaction with poor wellness guinea pig
2. **Result**: Rejection
3. **Immediate retry**: Should be blocked with message
4. **Track cooldown**: 45 seconds (poor wellness)
5. **After cooldown**: Can retry
6. **Multiple rejections**: Cooldown increases
7. **Verify**:
   - Cooldown prevents spam
   - Duration scales with wellness
   - Consecutive rejections increase cooldown
   - Max cooldown capped at 2 minutes

## Future Enhancements

### Visual Indicators (Phase 5)
- **Guinea pig sprite changes**: Different expressions/postures by wellness
- **Animation states**: Energetic vs. lethargic movements
- **Position indicators**: Highlight hiding vs. active zones
- **Trembling effect**: Visible at critical wellness

### Audio Feedback (Phase 5)
- **Wellness-appropriate sounds**: Happy wheeks vs. distressed squeaks
- **Rejection audio**: Distinct sound when interaction rejected
- **Ambient sounds**: Silence at low wellness, active sounds at high

### Advanced Behavioral States
- **Sleep patterns**: Poor wellness = restless, frequent waking
- **Eating behavior**: Slow, picky eating when stressed
- **Grooming patterns**: Self-grooming frequency drops at low wellness
- **Territory behavior**: Smaller territory at low wellness

### Recovery Milestones
- **Wellness achievement**: "Restored {name} to excellent wellness!"
- **Behavioral recovery tracking**: "It's been 3 days since {name} had low wellness"
- **Long-term wellness stats**: Average wellness over session

## Success Metrics

### Player Understanding
- Players recognize wellness impact through rejection feedback
- Players adjust care strategy when guinea pig becomes withdrawn
- Players understand wellness recovery improves interaction

### System Balance
- Interaction rejection feels fair, not punishing
- Recovery path is clear and achievable
- Excellent care rewarded with enthusiastic interactions
- Poor care has meaningful consequences

### Emotional Impact
- Players care about guinea pig wellness beyond mechanics
- Rejection messages motivate better care
- Recovery feels satisfying and rewarding
- Guinea pig feels alive with believable responses

## References
- [Wellness System Design](../../game-design/wellness-system.md) - Hidden wellness mechanics
- [Personality Trait Influences](system-3-personality-trait-influences.md) - How personality affects behavior
- [Guinea Pig Rescue](system-2-guinea-pig-rescue.md) - Critical wellness consequences
- [Enhanced Activity Messages](system-1-enhanced-activity-messages.md) - Reaction messaging system
- [Guinea Pig Bonding System](../phase4/guinea-pig-bonding-system.md) - Pair interaction foundation
