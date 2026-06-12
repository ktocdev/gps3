# Guinea Pig Bonding & Compatibility System

**Phase 4, System 17+ - Interactions & Behaviors**

## Overview

Create a realistic guinea pig bonding system that affects social interactions, happiness, and resource efficiency based on real guinea pig research and behavioral studies. **Compatibility is completely hidden** with natural discovery through gameplay to encourage authentic pet adoption experiences.

## Core System Philosophy

The bonding system prioritizes **natural relationship development** over optimization mechanics:
- No visible compatibility scores during selection
- Personality hints provide subtle guidance without revealing mechanics
- Bonding develops through positive interactions and time spent together
- All guinea pig pairs can eventually bond, with varying speeds based on hidden compatibility
- Focus on care and relationship building rather than min-maxing

## Current System Integration

### Existing Foundation
- **Gender:** Male/Female
- **Breed:** 13 breeds with rarity system (common to ultra-rare)
- **Personality:** 4 traits (friendliness, playfulness, curiosity, independence) on 1-10 scale
- **2 Guinea Pig Limit:** Current system supports up to 2 active guinea pigs
- **Social Need System:** Existing social need decay and satisfaction mechanics

## Bonding Level System

### Three Bonding Tiers (Hidden from Player)

#### 🤝 Neutral (0-30%)
**Status:** Guinea pigs tolerate each other
- Standard social need satisfaction rates
- Normal interaction frequency baseline
- Basic companionship benefits (20% slower social decay)
- No special bonuses or penalties

#### 😊 Friends (31-70%)
**Status:** Guinea pigs enjoy each other's company
- **Enhanced Social Satisfaction:** 15% bonus to social need satisfaction from interactions
- **Increased Interactions:** 20% higher interaction frequency
- **Proximity Bonus:** Small happiness bonus when near each other (25% bonus)
- **Activity Feed:** Friendship milestone messages appear

#### 💕 Bonded (71-100%)
**Status:** Deep partnership bond established
- **Significant Social Satisfaction:** 30% bonus to social need satisfaction from interactions
- **High Interaction Frequency:** 40% increase in interaction frequency
- **Strong Proximity Bonus:** Significant happiness bonus when together (40% bonus)
- **Synchronized Behaviors:** More likely to perform activities together
- **Activity Feed:** Bonding milestone messages and special interaction descriptions

## Hidden Compatibility Calculation

### Research-Based Compatibility Factors

#### Gender Compatibility
Based on real guinea pig social research:

**Male-Female Pairs:** +25 compatibility points
- Research shows mixed pairings work very well with less competitive dynamics
- Strongest bonding potential (real guinea pigs form specific male-female partnerships)
- Natural complementary behaviors

**Female-Female Pairs:** +15 compatibility points
- Research indicates females tend to get on very well together
- Easier to introduce and maintain stable relationships
- Less territorial behavior

**Male-Male Pairs:** +5 compatibility points
- Recent research shows males can form stable pairs when no females present
- Requires more time and careful introduction but achievable
- Possible with proper space and resources

#### Personality Compatibility Matrix

**Friendliness Interactions:**
- **High + High (7-10 + 7-10):** +20 points (both outgoing, natural social connection)
- **High + Low (7-10 + 1-3):** +10 points (complementary - outgoing helps shy guinea pig)
- **Medium + Any (4-6 + any):** +5 points (flexible personality adapts well)
- **Low + Low (1-3 + 1-3):** -5 points (both too shy to initiate bonding)

**Independence Balance:**
- **Balanced Independence (both 4-7):** +15 points (good balance of togetherness and space)
- **Complementary Independence (one high, one low):** +5 points (can work with adjustment)
- **Extreme Mismatch (8-10 with 1-3):** -10 points (very independent with very dependent)

**Playfulness Compatibility:**
- **Similar Playfulness (within 3 points):** +10 points (shared activity preferences)
- **Complementary Energy (high + medium):** +5 points (can balance each other)
- **Extreme Mismatch (9-10 with 1-2):** -5 points (very different activity needs)

**Curiosity Alignment:**
- **Both High Curiosity (7-10):** +10 points (explore together)
- **Mixed Curiosity:** +5 points (curious one leads, other follows)
- **Both Low Curiosity:** +0 points (content but less dynamic bonding)

#### Breed Compatibility

**Same Breed:** +10 points
- Familiar behaviors and characteristics
- Similar grooming needs and activity patterns
- Natural understanding of breed-specific behaviors

**Similar Breed Families:** +5 points
- **Long-haired breeds:** Peruvian, Silkie, Texel, Coronet, Alpaca
- **Short-haired breeds:** American, Abyssinian, Teddy, Rex
- **Hairless breeds:** Baldwin, Skinny Pig
- **Active breeds:** Abyssinian, Rex, Teddy
- **Calm breeds:** American, Peruvian, Silkie

**Different Breed Families:** +0 points
- No bonus or penalty for different breed types
- Compatibility depends more on personality than breed

### Compatibility Score Calculation

```typescript
function calculateCompatibility(guineaPig1: GuineaPig, guineaPig2: GuineaPig): number {
  let compatibilityScore = 0

  // Gender compatibility
  if (guineaPig1.gender !== guineaPig2.gender) {
    compatibilityScore += 25 // Male-Female
  } else if (guineaPig1.gender === 'female') {
    compatibilityScore += 15 // Female-Female
  } else {
    compatibilityScore += 5  // Male-Male
  }

  // Personality compatibility
  compatibilityScore += calculatePersonalityCompatibility(
    guineaPig1.personality,
    guineaPig2.personality
  )

  // Breed compatibility
  if (guineaPig1.breed === guineaPig2.breed) {
    compatibilityScore += 10
  } else if (isSimilarBreedFamily(guineaPig1.breed, guineaPig2.breed)) {
    compatibilityScore += 5
  }

  // Ensure score stays within bounds
  return Math.max(0, Math.min(100, compatibilityScore))
}
```

## Pet Store Selection Enhancement

### Personality Hint System

When players click on a guinea pig during selection, they see **one random hint** from that guinea pig's available hints. This provides subtle personality guidance without revealing compatibility mechanics.

#### Hint Categories by Personality Trait

**Friendliness Hints:**

*High Friendliness (7-10):*
- *"[Name] seems very interested in meeting you"*
- *"[Name] appears comfortable around others"*
- *"[Name] watches the other guinea pigs with curiosity"*

*Medium Friendliness (4-6):*
- *"[Name] is warming up to your presence"*
- *"[Name] seems cautiously optimistic about new friends"*
- *"[Name] observes others with quiet interest"*

*Low Friendliness (1-3):*
- *"[Name] seems a bit shy and stays in the corner"*
- *"[Name] prefers observing from a distance"*
- *"[Name] is quite reserved but alert"*

**Playfulness Hints:**

*High Playfulness (7-10):*
- *"[Name] bounces around when excited"*
- *"[Name] seems eager for some fun"*
- *"[Name] investigates every new thing with enthusiasm"*

*Medium Playfulness (4-6):*
- *"[Name] enjoys both active play and quiet time"*
- *"[Name] shows interest in activities at their own pace"*
- *"[Name] has a balanced approach to fun and rest"*

*Low Playfulness (1-3):*
- *"[Name] prefers calm, peaceful moments"*
- *"[Name] enjoys quiet contemplation"*
- *"[Name] has a gentle, laid-back nature"*

**Independence Hints:**

*High Independence (7-10):*
- *"[Name] confidently explores on their own"*
- *"[Name] seems quite self-sufficient"*
- *"[Name] does their own thing with confidence"*

*Medium Independence (4-6):*
- *"[Name] enjoys both independence and companionship"*
- *"[Name] seems adaptable to different situations"*
- *"[Name] balances alone time with social moments"*

*Low Independence (1-3):*
- *"[Name] stays close to familiar things"*
- *"[Name] seems to want companionship"*
- *"[Name] looks like they'd appreciate a friend"*

**Curiosity Hints:**

*High Curiosity (7-10):*
- *"[Name] notices everything happening around them"*
- *"[Name] sniffs and explores constantly"*
- *"[Name] seems fascinated by new sights and sounds"*

*Medium Curiosity (4-6):*
- *"[Name] shows selective interest in their surroundings"*
- *"[Name] explores at a thoughtful pace"*
- *"[Name] is observant in their own way"*

*Low Curiosity (1-3):*
- *"[Name] sticks to familiar routines"*
- *"[Name] prefers known comforts"*
- *"[Name] is content with simple pleasures"*

### Hint Rotation Mechanics

**Per Guinea Pig:**
- Each guinea pig has exactly **3 hints** selected based on their personality traits
- Hints chosen from most prominent personality traits (highest scores)
- Clicking shows a random hint from their available set
- Players can discover all hints by clicking multiple times
- No explicit indication of how many hints exist (natural discovery)

**Technical Implementation:**
```typescript
interface GuineaPigHints {
  personalityHints: string[]  // 3 hints per guinea pig
  usedHints: string[]        // Track which hints have been shown
  currentHintIndex: number   // For rotation tracking
}

function getRandomHint(guineaPigId: string): string {
  const guinea_pig = getGuineaPig(guineaPigId)
  const availableHints = guinea_pig.hints.personalityHints
  const randomIndex = Math.floor(Math.random() * availableHints.length)
  return availableHints[randomIndex]
}
```

## Bonding Progression System

### Positive-Only Progression

The bonding system focuses on **positive reinforcement** - bonding levels only increase through good experiences, never decrease through negative interactions.

#### Bonding Increase Factors

**Social Interactions:** +2-5 points each
- Grooming interactions: +5 points
- Playing together: +4 points
- Sharing food: +3 points
- Sleeping together: +3 points
- Exploring together: +2 points

**Proximity Time:** +1 point per hour
- Guinea pigs positioned near each other
- Passive bonding through shared space
- Accumulates during active gameplay

**Shared Positive Experiences:** +3-7 points
- Both guinea pigs eating preferred food together: +7 points
- Both guinea pigs playing with favorite toys: +5 points
- Both guinea pigs in good health simultaneously: +3 points

**Wellness Bonus:** +1 point per day
- Both guinea pigs maintaining good wellness (above 70%)
- Rewards consistent care and maintenance
- Long-term relationship building

### Bonding Progression Formula

```typescript
function processBondingProgression(bond: GuineaPigBond): void {
  const gp1 = getGuineaPig(bond.guineaPig1Id)
  const gp2 = getGuineaPig(bond.guineaPig2Id)

  let bonding_increase = 0

  // Check for recent interactions
  const recentInteractions = getRecentSocialInteractions(bond, 24) // Last 24 hours
  bonding_increase += recentInteractions * 3

  // Check proximity time
  const proximityHours = calculateProximityTime(bond, 24)
  bonding_increase += proximityHours * 1

  // Wellness bonus
  if (gp1.wellness > 70 && gp2.wellness > 70) {
    bonding_increase += 1
  }

  // Apply compatibility modifier
  const compatibilityMultiplier = bond.compatibilityScore / 100
  bonding_increase *= compatibilityMultiplier

  // Update bonding level
  bond.bondingLevel = Math.min(100, bond.bondingLevel + bonding_increase)

  // Check for tier advancement
  updateBondingTier(bond)
}
```

## Social Need Processing Enhancement

### Bonding-Based Social Need Modifiers

The existing social need system is enhanced with bonding-level modifiers that provide increasingly better social need satisfaction as guinea pigs bond.

```typescript
function processEnhancedSocialNeed(guineaPigId: string, deltaTime: number): void {
  const guineaPig = getGuineaPig(guineaPigId)
  const bond = getActiveBond(guineaPigId)

  let socialDecayRate = baseSocialDecayRate
  let proximityBonus = 0

  if (bond) {
    // Apply bonding level modifiers
    if (bond.bondingLevel >= 71) {        // Bonded
      socialDecayRate *= 0.5  // 50% slower decay
      proximityBonus = 0.4    // 40% bonus when near
    } else if (bond.bondingLevel >= 31) { // Friends
      socialDecayRate *= 0.7  // 30% slower decay
      proximityBonus = 0.25   // 25% bonus when near
    } else {                             // Neutral
      socialDecayRate *= 0.8  // 20% slower decay (basic companionship)
      proximityBonus = 0.1    // 10% bonus when near
    }

    // Apply proximity bonus if guinea pigs are near each other
    if (areGuineaPigsNearEachOther(bond.guineaPig1Id, bond.guineaPig2Id)) {
      const proximityBenefit = proximityBonus * baseSocialSatisfaction
      satisfyNeed(guineaPigId, 'social', proximityBenefit)
    }
  } else {
    // Single guinea pig - faster social decay
    socialDecayRate *= 1.3 // 30% faster decay when alone
  }

  // Apply enhanced social decay processing
  const decayAmount = socialDecayRate * (deltaTime / (1000 * 60 * 60))
  adjustNeed(guineaPigId, 'social', decayAmount)
}
```

## Natural Bonding Discovery

### Player Discovery Methods

Players learn about bonding relationships through natural gameplay observation rather than explicit UI elements:

#### Activity Feed Messages

**Bonding Milestone Messages:**
- Neutral → Friends: *"[Name1] and [Name2] seem to be getting along well"*
- Friends → Bonded: *"[Name1] and [Name2] have become close friends"*
- Bonded Level: *"[Name1] and [Name2] have formed a strong bond"*

**Enhanced Interaction Messages:**
- *"[Name1] gently grooms [Name2] who seems very content"*
- *"[Name1] and [Name2] explore the habitat together, staying close"*
- *"[Name1] shares their favorite spot with [Name2]"*
- *"[Name1] and [Name2] munch happily side by side"*

#### Behavioral Indicators

**Increased Interaction Frequency:**
- Players notice more frequent social interactions
- Synchronized activities become more common
- Guinea pigs position themselves near each other more often

**Gameplay Benefits:**
- Improved social need satisfaction becomes apparent
- Less frequent social need warnings in activity feed
- Overall guinea pig happiness and wellness improvements

**Visual Cues (Future Enhancement):**
- Guinea pigs positioned closer together in habitat
- Synchronized animations and movements
- Shared activity behaviors

## Technical Implementation

### Data Structures

#### Core Bonding Interface
```typescript
interface GuineaPigBond {
  id: string                  // Unique bond identifier
  guineaPig1Id: string       // First guinea pig ID
  guineaPig2Id: string       // Second guinea pig ID
  bondingLevel: number       // 0-100 (hidden from player)
  bondingTier: 'neutral' | 'friends' | 'bonded' // Current tier (hidden)
  compatibilityScore: number // Base compatibility (hidden)
  createdAt: number          // When bond was established
  lastInteraction: number    // Timestamp of last social interaction
  totalInteractions: number  // Count of all social interactions
  proximityTime: number      // Total hours spent near each other
  bondingHistory: BondingEvent[]
}

interface BondingEvent {
  id: string
  timestamp: number
  type: 'interaction' | 'proximity' | 'shared_experience' | 'wellness_bonus'
  bondingChange: number      // Points gained (always positive)
  description: string        // Event description for debug/logging
  details?: any             // Additional event-specific data
}
```

#### Personality Hint System
```typescript
interface GuineaPigHints {
  personalityHints: string[] // 3 hints per guinea pig
  hintCategories: ('friendliness' | 'playfulness' | 'curiosity' | 'independence')[]
  lastShownHint: string     // Track last displayed hint
  hintViewCount: number     // How many times hints have been viewed
}

interface HintTemplate {
  trait: 'friendliness' | 'playfulness' | 'curiosity' | 'independence'
  scoreRange: 'low' | 'medium' | 'high'
  hints: string[]
}
```

### Store Integration

#### Guinea Pig Store Enhancements
```typescript
// Add to guinea pig store
const activeBonds = ref<Map<string, GuineaPigBond>>(new Map())

function createBond(guineaPig1Id: string, guineaPig2Id: string): GuineaPigBond {
  const gp1 = getGuineaPig(guineaPig1Id)
  const gp2 = getGuineaPig(guineaPig2Id)

  const bond: GuineaPigBond = {
    id: generateBondId(),
    guineaPig1Id,
    guineaPig2Id,
    bondingLevel: 0,
    bondingTier: 'neutral',
    compatibilityScore: calculateCompatibility(gp1, gp2),
    createdAt: Date.now(),
    lastInteraction: Date.now(),
    totalInteractions: 0,
    proximityTime: 0,
    bondingHistory: []
  }

  activeBonds.value.set(bond.id, bond)
  return bond
}

function getActiveBond(guineaPigId: string): GuineaPigBond | null {
  for (const bond of activeBonds.value.values()) {
    if (bond.guineaPig1Id === guineaPigId || bond.guineaPig2Id === guineaPigId) {
      return bond
    }
  }
  return null
}
```

#### Pet Store Manager Enhancements
```typescript
// Add hint generation to pet store manager
function generatePersonalityHints(guineaPig: GuineaPig): string[] {
  const hints: string[] = []
  const personality = guineaPig.personality

  // Get top 3 personality traits
  const traits = [
    { name: 'friendliness', score: personality.friendliness },
    { name: 'playfulness', score: personality.playfulness },
    { name: 'curiosity', score: personality.curiosity },
    { name: 'independence', score: personality.independence }
  ].sort((a, b) => b.score - a.score).slice(0, 3)

  // Generate hints for top traits
  traits.forEach(trait => {
    const hintTemplate = getHintTemplate(trait.name, getScoreRange(trait.score))
    const randomHint = getRandomHint(hintTemplate, guineaPig.name)
    hints.push(randomHint)
  })

  return hints
}
```

## Debug and Testing Tools

### Bonding Debug Panel (Development Only)

#### Compatibility Testing Interface
```vue
<template>
  <div class="bonding-debug">
    <div class="compatibility-calculator">
      <h4>Compatibility Calculator</h4>
      <div class="guinea-pig-selectors">
        <select v-model="selectedGP1">
          <option v-for="gp in allGuineaPigs" :key="gp.id" :value="gp.id">
            {{ gp.name }} ({{ gp.gender }}, {{ gp.breed }})
          </option>
        </select>
        <select v-model="selectedGP2">
          <option v-for="gp in allGuineaPigs" :key="gp.id" :value="gp.id">
            {{ gp.name }} ({{ gp.gender }}, {{ gp.breed }})
          </option>
        </select>
      </div>
      <div v-if="compatibilityScore !== null" class="compatibility-result">
        <h5>Compatibility Score: {{ compatibilityScore }}/100</h5>
        <div class="compatibility-breakdown">
          <div>Gender Bonus: {{ genderBonus }}</div>
          <div>Personality Score: {{ personalityScore }}</div>
          <div>Breed Bonus: {{ breedBonus }}</div>
        </div>
      </div>
    </div>

    <div class="active-bonds">
      <h4>Active Bonds</h4>
      <div v-for="bond in activeBonds" :key="bond.id" class="bond-display">
        <div class="bond-header">
          {{ getGuineaPigName(bond.guineaPig1Id) }} & {{ getGuineaPigName(bond.guineaPig2Id) }}
        </div>
        <div class="bond-details">
          <div>Bonding Level: {{ bond.bondingLevel }}/100 ({{ bond.bondingTier }})</div>
          <div>Compatibility: {{ bond.compatibilityScore }}/100</div>
          <div>Total Interactions: {{ bond.totalInteractions }}</div>
          <div>Proximity Time: {{ bond.proximityTime.toFixed(1) }} hours</div>
        </div>
        <div class="bond-controls">
          <Button @click="adjustBonding(bond.id, 10)">+10 Bonding</Button>
          <Button @click="adjustBonding(bond.id, -10)">-10 Bonding</Button>
          <Button @click="simulateInteraction(bond.id)">Simulate Interaction</Button>
        </div>
      </div>
    </div>

    <div class="personality-hints">
      <h4>Personality Hints Testing</h4>
      <div v-for="gp in allGuineaPigs" :key="gp.id" class="guinea-pig-hints">
        <h5>{{ gp.name }}</h5>
        <div class="hint-display">
          <Button @click="showRandomHint(gp.id)">Show Random Hint</Button>
          <div v-if="currentHints[gp.id]" class="current-hint">
            "{{ currentHints[gp.id] }}"
          </div>
        </div>
        <div class="all-hints">
          <div v-for="hint in gp.hints" :key="hint" class="hint-item">
            {{ hint }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
```

#### Bonding Analytics Dashboard
- Real-time bonding level tracking
- Interaction frequency analysis
- Compatibility factor breakdown
- Bonding progression timeline
- Social need satisfaction correlation

## Gameplay Impact Analysis

### Resource Efficiency Trade-offs

#### Single Guinea Pig Benefits
- **Lower Food Costs:** 50% consumption rate
- **Reduced Maintenance:** Less habitat cleaning, fewer toys needed
- **Independence Satisfaction:** Higher satisfaction for independent personality types
- **Focused Care:** Easier to monitor and care for individual needs
- **Lower Initial Cost:** One guinea pig purchase instead of two

#### Dual Guinea Pig Benefits
- **Social Need Satisfaction:** Significant improvement in social need management
- **Interaction Entertainment:** More varied and interesting activity feed content
- **Bonding Rewards:** Progressive gameplay benefits as relationship develops
- **Natural Behavior:** More realistic guinea pig social dynamics
- **Replay Value:** Different personality combinations create unique experiences

#### Bonding Level Progression Benefits

**Neutral Level (0-30%):**
- Basic companionship (20% slower social decay)
- Standard resource consumption
- Normal interaction frequency

**Friends Level (31-70%):**
- Improved social satisfaction (+15% bonus)
- Increased interaction frequency (+20%)
- Small proximity happiness bonus (+25%)
- Enhanced activity feed content

**Bonded Level (71-100%):**
- Significant social satisfaction (+30% bonus)
- High interaction frequency (+40%)
- Strong proximity happiness bonus (+40%)
- Synchronized behaviors and activities
- Resource efficiency through shared happiness

### Strategic Gameplay Considerations

#### Selection Strategy
- Players consider personality hints during selection
- Gender combinations affect bonding potential
- Breed similarities provide bonding advantages
- No min-maxing pressure due to hidden compatibility

#### Care Strategy
- Maintaining good wellness accelerates bonding
- Encouraging social interactions builds relationships
- Proximity management becomes important
- Long-term relationship investment is rewarded

#### Progression Strategy
- Natural tutorial progression: start with one, learn to manage two
- Relationship building becomes core gameplay loop
- Hidden bonding discovery creates surprise and delight
- Multiple playthroughs with different combinations provide variety

## Future Enhancement Opportunities

### Advanced Bonding Features (Post-Implementation)

#### Bonding Ceremonies
- Special milestone interactions unlocked at bonding level thresholds
- Unique activity feed messages for bonding achievements
- Celebration animations and visual effects
- Player recognition of relationship milestones

#### Synchronized Activities
- Bonded pairs more likely to perform activities simultaneously
- Shared preferences develop over time (limited, not overwhelming)
- Coordinated habitat exploration and item usage
- Matched sleep and activity cycles

#### Social Group Dynamics (Future Multi-Guinea Pig Support)
- Triangular relationships between 3+ guinea pigs
- Group bonding mechanics with hierarchy considerations
- Complex social dynamics based on multiple personality interactions
- Social group benefits and challenges

### Technical Enhancements

#### Advanced Compatibility Factors
- Seasonal bonding variations (guinea pigs bond differently in different seasons)
- Environmental stress impact on bonding development
- Health condition effects on relationship dynamics
- Habitat space and resource abundance effects

#### Enhanced Discovery Mechanics
- Subtle visual cues for bonding levels
- Environmental storytelling through guinea pig positioning
- Progressive revelation of personality traits through interaction
- Dynamic hint generation based on observed behaviors

## Success Metrics

### Player Engagement Metrics
- **Selection Time:** Average time spent evaluating guinea pig personalities
- **Hint Usage:** Number of hints viewed per guinea pig during selection
- **Bonding Discovery:** Time to first bonding milestone recognition
- **Relationship Investment:** Average session length with two guinea pigs vs. one

### Gameplay Balance Metrics
- **Resource Efficiency:** Comparison of single vs. dual guinea pig costs
- **Social Need Satisfaction:** Improvement rates with different bonding levels
- **Bonding Progression:** Average time to reach different bonding tiers
- **Personality Combination Success:** Distribution of successful bonding across personality types

### System Health Metrics
- **Compatibility Distribution:** Range of compatibility scores in actual gameplay
- **Bonding Rate Progression:** Consistency of bonding development across different pairs
- **Player Retention:** Engagement differences between single and dual guinea pig players
- **Discovery Satisfaction:** Player feedback on natural bonding discovery experience

This bonding system creates meaningful relationships that develop naturally through care and attention, providing depth and replayability while maintaining the authentic pet ownership experience that is central to the GPS2 game philosophy.