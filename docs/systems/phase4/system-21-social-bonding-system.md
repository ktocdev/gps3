# System 21: Social Bonding System

**Phase 4, Stage 5 - Multi-Guinea Pig Social Interactions & Bonding**

**Time Estimate:** 8-12 hours

## Goal

Implement social interactions and bonding system for 2 guinea pigs, including autonomous social behaviors (grooming, playing, sharing food, sleeping together), bonding progression, compatibility calculation, and enhanced social need processing.

## Dependencies

**Required Systems:**
- System 17: Visual Presence & Positioning
- System 18: Pathfinding & Movement
- System 19: Autonomous AI Behaviors (social behaviors use AI framework)
- Needs system (Phase 2)
- Personality & preferences (Phase 2)

**Final System:**
- No systems depend on this one (can be enhanced in Phase 5)

## Design Reference

See [design-docs/guinea-pig-bonding-system.md](design-docs/guinea-pig-bonding-system.md) for comprehensive design specification including:
- Complete compatibility calculation system
- Detailed bonding progression mechanics
- Autonomous social behavior catalog
- Bonding tier benefits
- Personality hint system (for pet store selection)

## Implementation Overview

This system implements 7 major subsystems for realistic multi-guinea pig social dynamics.

### Core Subsystems

1. **Bond Creation & Management** - Relationship tracking
2. **Compatibility Calculation System** - Hidden scoring based on gender, personality, breed
3. **Autonomous Social Behaviors** - Grooming, playing, sharing food, sleeping together
4. **Bonding Progression System** - Positive-only progression
5. **Enhanced Social Need System** - Bonding modifiers for social decay
6. **Social AI Decision Integration** - Social behaviors in AI framework
7. **Activity Feed Social Messages** - Rich relationship messages

---

## Implementation Tasks

### Task 1: Bond Creation & Management

Implement bonding relationship tracking system.

#### Data Structures

```typescript
interface GuineaPigBond {
  id: string
  guineaPig1Id: string
  guineaPig2Id: string
  bondingLevel: number // 0-100 (hidden from player)
  bondingTier: 'neutral' | 'friends' | 'bonded'
  compatibilityScore: number // Base compatibility (hidden)
  createdAt: number
  lastInteraction: number
  totalInteractions: number
  proximityTime: number // hours
  bondingHistory: BondingEvent[]
}

interface BondingEvent {
  id: string
  timestamp: number
  type: 'interaction' | 'proximity' | 'shared_experience' | 'wellness_bonus'
  bondingChange: number // Always positive
  description: string
  details?: any
}

function createBond(gp1Id: string, gp2Id: string): GuineaPigBond {
  const gp1 = getGuineaPig(gp1Id)
  const gp2 = getGuineaPig(gp2Id)

  return {
    id: generateBondId(),
    guineaPig1Id: gp1Id,
    guineaPig2Id: gp2Id,
    bondingLevel: 0,
    bondingTier: 'neutral',
    compatibilityScore: calculateCompatibility(gp1, gp2),
    createdAt: Date.now(),
    lastInteraction: Date.now(),
    totalInteractions: 0,
    proximityTime: 0,
    bondingHistory: []
  }
}
```

**File:** `src/stores/guineaPigStore.ts` (modify)

---

### Task 2: Compatibility Calculation System

Implement hidden compatibility scoring based on research.

#### Compatibility Factors

```typescript
function calculateCompatibility(gp1: GuineaPig, gp2: GuineaPig): number {
  let score = 0

  // Gender compatibility (research-based)
  if (gp1.gender !== gp2.gender) {
    score += 25 // Male-Female (strongest bonding potential)
  } else if (gp1.gender === 'female') {
    score += 15 // Female-Female (get on very well together)
  } else {
    score += 5  // Male-Male (achievable with proper space)
  }

  // Friendliness compatibility
  const f1 = gp1.personality.friendliness
  const f2 = gp2.personality.friendliness

  if (f1 >= 7 && f2 >= 7) {
    score += 20 // Both outgoing
  } else if ((f1 >= 7 && f2 <= 3) || (f2 >= 7 && f1 <= 3)) {
    score += 10 // Complementary
  } else if (f1 <= 3 && f2 <= 3) {
    score -= 5  // Both too shy
  }

  // Independence balance
  const i1 = gp1.personality.independence
  const i2 = gp2.personality.independence

  if (i1 >= 4 && i1 <= 7 && i2 >= 4 && i2 <= 7) {
    score += 15 // Balanced
  } else if ((i1 >= 8 && i2 <= 3) || (i2 >= 8 && i1 <= 3)) {
    score -= 10 // Extreme mismatch
  }

  // Playfulness compatibility
  const playDiff = Math.abs(gp1.personality.playfulness - gp2.personality.playfulness)
  if (playDiff <= 3) score += 10
  else if (playDiff >= 7) score -= 5

  // Curiosity alignment
  if (gp1.personality.curiosity >= 7 && gp2.personality.curiosity >= 7) {
    score += 10 // Both curious
  }

  // Breed compatibility
  if (gp1.breed === gp2.breed) score += 10
  else if (isSimilarBreedFamily(gp1.breed, gp2.breed)) score += 5

  return Math.max(0, Math.min(100, score))
}
```

**File:** `src/utils/compatibility.ts`

---

### Task 3: Autonomous Social Behaviors

Implement social interactions between guinea pigs.

#### Social Action Types

**6 Core Social Behaviors:**
1. **Approach Companion** - Move closer for social interaction
2. **Grooming Partner** - Clean other guinea pig (cleanliness + social)
3. **Playing Together** - Shared play (happiness + social)
4. **Sharing Food** - Eat together (hunger + social)
5. **Sleeping Together** - Rest in proximity (energy + social)
6. **Exploring Together** - Move around as pair (social)

#### Implementation Examples

**Grooming Partner:**
```typescript
async function groomPartner(groomer: GuineaPig, partner: GuineaPig, bond: GuineaPigBond): Promise<void> {
  const path = findPath({ start: groomer.position, goal: partner.position })
  await moveAlongPath(groomer, path)

  setGuineaPigState(groomer, 'grooming')
  setGuineaPigState(partner, 'being_groomed')
  await delay(4000)

  satisfyNeed(groomer.id, 'social', 20)
  satisfyNeed(partner.id, 'social', 20)
  satisfyNeed(partner.id, 'cleanliness', 15)

  increaseBonding(bond.id, 5)

  addActivityMessage(`${groomer.name} gently grooms ${partner.name} who seems very content 💕`)

  setGuineaPigState(groomer, 'idle')
  setGuineaPigState(partner, 'idle')
}
```

**Playing Together:**
```typescript
async function playTogether(gp1: GuineaPig, gp2: GuineaPig, bond: GuineaPigBond): Promise<void> {
  const meetingPoint = findMidpoint(gp1.position, gp2.position)
  await Promise.all([
    moveAlongPath(gp1, findPath({ start: gp1.position, goal: meetingPoint })),
    moveAlongPath(gp2, findPath({ start: gp2.position, goal: meetingPoint }))
  ])

  setGuineaPigState(gp1, 'playing')
  setGuineaPigState(gp2, 'playing')
  await delay(5000)

  satisfyNeed(gp1.id, 'happiness', 25)
  satisfyNeed(gp2.id, 'happiness', 25)
  satisfyNeed(gp1.id, 'social', 20)
  satisfyNeed(gp2.id, 'social', 20)

  increaseBonding(bond.id, 4)

  addActivityMessage(`${gp1.name} and ${gp2.name} play together happily! ✨`)

  setGuineaPigState(gp1, 'idle')
  setGuineaPigState(gp2, 'idle')
}
```

**File:** `src/composables/game/useSocialBehaviors.ts`

---

### Task 4: Bonding Progression System

Implement positive-only bonding progression.

#### Bonding Tiers

**🤝 Neutral (0-30%):** Basic companionship
- 20% slower social decay
- Standard interaction frequency
- 10% proximity bonus

**😊 Friends (31-70%):** Enjoyable companionship
- 30% slower social decay
- 20% higher interaction frequency
- 25% proximity bonus

**💕 Bonded (71-100%):** Deep partnership
- 50% slower social decay
- 40% higher interaction frequency
- 40% proximity bonus
- Synchronized behaviors

#### Progression Logic

```typescript
function processBondingProgression(bond: GuineaPigBond, deltaTime: number): void {
  const gp1 = getGuineaPig(bond.guineaPig1Id)
  const gp2 = getGuineaPig(bond.guineaPig2Id)

  let bondingIncrease = 0

  // Recent social interactions (+2-5 points each)
  const recentInteractions = getRecentSocialInteractions(bond, 24)
  bondingIncrease += recentInteractions * 3

  // Proximity time (+1 point per hour)
  if (areGuineaPigsNear(bond.guineaPig1Id, bond.guineaPig2Id)) {
    const proximityHours = deltaTime / (1000 * 60 * 60)
    bondingIncrease += proximityHours * 1
    bond.proximityTime += proximityHours
  }

  // Wellness bonus (+1 point per day if both > 70%)
  if (gp1.wellness > 70 && gp2.wellness > 70) {
    const daysPassed = deltaTime / (1000 * 60 * 60 * 24)
    bondingIncrease += daysPassed * 1
  }

  // Apply compatibility multiplier
  const compatibilityMultiplier = bond.compatibilityScore / 100
  bondingIncrease *= compatibilityMultiplier

  // Update bonding level (positive only)
  bond.bondingLevel = Math.min(100, bond.bondingLevel + bondingIncrease)

  updateBondingTier(bond)
}

function updateBondingTier(bond: GuineaPigBond): void {
  const previousTier = bond.bondingTier

  if (bond.bondingLevel >= 71) bond.bondingTier = 'bonded'
  else if (bond.bondingLevel >= 31) bond.bondingTier = 'friends'
  else bond.bondingTier = 'neutral'

  // Generate milestone message
  if (bond.bondingTier !== previousTier) {
    const gp1 = getGuineaPig(bond.guineaPig1Id)
    const gp2 = getGuineaPig(bond.guineaPig2Id)

    if (bond.bondingTier === 'friends') {
      addActivityMessage(`${gp1.name} and ${gp2.name} seem to be getting along well 💚`)
    } else if (bond.bondingTier === 'bonded') {
      addActivityMessage(`${gp1.name} and ${gp2.name} have formed a strong bond! 💕`)
    }
  }
}
```

**File:** `src/utils/bondingProgression.ts`

---

### Task 5: Enhanced Social Need System

Modify social need processing with bonding modifiers.

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
    } else {                              // Neutral
      socialDecayRate *= 0.8  // 20% slower decay
      proximityBonus = 0.1    // 10% bonus when near
    }

    // Apply proximity bonus
    if (areGuineaPigsNear(bond.guineaPig1Id, bond.guineaPig2Id)) {
      const proximityBenefit = proximityBonus * baseSocialSatisfaction
      satisfyNeed(guineaPigId, 'social', proximityBenefit * (deltaTime / 1000 / 60))
    }
  } else {
    // Single guinea pig - faster social decay
    socialDecayRate *= 1.3 // 30% faster decay when alone
  }

  // Apply social decay
  const decayAmount = socialDecayRate * (deltaTime / (1000 * 60 * 60))
  adjustNeed(guineaPigId, 'social', -decayAmount)
}
```

**File:** `src/stores/needsControllerStore.ts` (modify)

---

### Task 6: Social AI Decision Integration

Integrate social behaviors into AI decision system.

```typescript
function checkSocialBehaviors(guineaPig: GuineaPig): BehaviorGoal | null {
  const bond = getActiveBond(guineaPig.id)
  if (!bond) return null

  const partner = getPartnerGuineaPig(guineaPig.id, bond)
  if (!partner) return null

  const socialNeed = getNeedLevel(guineaPig.id, 'social')

  // High social need priority
  if (socialNeed < 50) {
    const behaviors = getSocialBehaviorOptions(guineaPig, partner, bond)
    return selectBestSocialBehavior(behaviors)
  }

  // Random social interactions for bonded pairs
  if (bond.bondingLevel >= 71 && Math.random() < 0.1) {
    return {
      type: 'social_interaction',
      target: partner.position,
      priority: 60,
      estimatedDuration: 5000
    }
  }

  return null
}

function getSocialBehaviorOptions(
  guineaPig: GuineaPig,
  partner: GuineaPig,
  bond: GuineaPigBond
): SocialBehaviorOption[] {
  const options: SocialBehaviorOption[] = []

  // Grooming (if partner cleanliness low)
  if (getNeedLevel(partner.id, 'cleanliness') < 60) {
    options.push({
      type: 'groom_partner',
      priority: 70,
      socialSatisfaction: 20,
      bondingGain: 5
    })
  }

  // Playing (if both happiness moderate)
  if (getNeedLevel(guineaPig.id, 'happiness') < 75 && getNeedLevel(partner.id, 'happiness') < 75) {
    options.push({
      type: 'play_together',
      priority: 65,
      socialSatisfaction: 25,
      bondingGain: 4
    })
  }

  // ... other social behavior options

  return options
}
```

**File:** `src/composables/game/useGuineaPigBehavior.ts` (modify - integrate into existing AI)

---

### Task 7: Activity Feed Social Messages

Generate rich messages for social interactions.

**Bonding Milestone Messages:**
- "Guinea Pig 1 and Guinea Pig 2 seem to be getting along well"
- "Guinea Pig 1 and Guinea Pig 2 have become close friends"
- "Guinea Pig 1 and Guinea Pig 2 have formed a strong bond"

**Social Interaction Messages:**
- "Guinea Pig 1 gently grooms Guinea Pig 2 who seems very content 💕"
- "Guinea Pig 1 and Guinea Pig 2 explore the habitat together, staying close"
- "Guinea Pig 1 shares their favorite spot with Guinea Pig 2"
- "Guinea Pig 1 and Guinea Pig 2 munch happily side by side"
- "Guinea Pig 1 and Guinea Pig 2 play together happily! ✨"
- "Guinea Pig 1 and Guinea Pig 2 sleep peacefully together"

**File:** `src/utils/messageGenerator.ts` (modify)

---

## Files to Create/Modify

### New Files

```
src/composables/game/useBonding.ts - Bonding system logic
src/composables/game/useSocialBehaviors.ts - Social interaction execution
src/utils/compatibility.ts - Compatibility calculation
src/utils/bondingProgression.ts - Bonding progression mechanics
```

### Modified Files

```
src/stores/guineaPigStore.ts - Add bond tracking
src/composables/game/useGuineaPigBehavior.ts - Integrate social behaviors into AI
src/stores/needsControllerStore.ts - Enhanced social need processing
src/utils/messageGenerator.ts - Add social interaction messages
src/components/game/habitat/GuineaPigSprite.vue - Add social animation states (grooming, being_groomed)
```

---

## Testing & Validation

### Bonding System Testing

- [x] Bond created automatically when 2nd guinea pig added
- [x] Compatibility calculation produces expected scores
- [x] Bonding progression increases over time
- [x] Tier advancement triggers milestone messages

### Social Behavior Testing

- [x] Autonomous social interactions trigger appropriately
- [x] Grooming satisfies cleanliness + social for both
- [x] Playing together satisfies happiness + social
- [x] Sleeping together works with proximity
- [x] Sharing food coordinates both guinea pigs

### Social Need Testing

- [x] Bonding level affects social decay rate
- [x] Proximity provides social satisfaction bonus
- [x] Single guinea pig has faster social decay (30%)
- [x] Bonded pairs maintain social need better (50% slower decay)

---

## Success Criteria

**Core Functionality:**
- [x] Bond created automatically when 2nd guinea pig added
- [x] Compatibility score calculated correctly
- [x] Bonding progression increases through interactions and proximity
- [x] Bonding tier advancement triggers milestone messages
- [x] Autonomous social interactions trigger appropriately
- [x] All 6 social behaviors functional
- [x] Social need decay modified by bonding level
- [x] Proximity provides social satisfaction bonus
- [x] Activity feed shows all social interactions

**Quality Standards:**
- [x] Social behaviors feel natural and varied
- [x] Bonding progression feels rewarding
- [x] Compatibility system balanced (all pairs can eventually bond)
- [x] Performance acceptable with 2 guinea pigs

---

## Implementation Strategy

**Phase 1 (2-3 hours):** Bond creation + compatibility calculation
**Phase 2 (3-4 hours):** Autonomous social behaviors (grooming, playing, etc.)
**Phase 3 (2-3 hours):** Bonding progression + enhanced social needs
**Phase 4 (1-2 hours):** AI integration + activity feed messages + testing

---

## Completion

After completing System 21:

1. **Test all social behaviors** with 2 guinea pigs
2. **Verify bonding progression** works naturally
3. **Test compatibility system** with different personality combinations
4. **Phase 4 is complete!** All guinea pig integration systems implemented

---

## Related Documentation

- **Master Plan:** [phase-4-guinea-pig-integration-plan-full.md](phase-4-guinea-pig-integration-plan-full.md)
- **Design Spec:** [design-docs/guinea-pig-bonding-system.md](design-docs/guinea-pig-bonding-system.md)
- **Previous System:** [system-20-direct-interaction-system.md](system-20-direct-interaction-system.md)
- **Project Plan:** [../../PROJECT_PLAN.md](../../PROJECT_PLAN.md) - Update Phase 4 status to complete
