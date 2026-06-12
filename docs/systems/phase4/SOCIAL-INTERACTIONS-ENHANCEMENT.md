# Guinea Pig Social Interactions Enhancement Plan

**Phase 4 Enhancement - System 21 Extension**

**Time Estimate:** 6-8 hours

## Overview

Enhance the existing 6 social behaviors with 4 new interaction types and add bonding/personality restrictions to create more realistic and nuanced guinea pig social dynamics.

## Current State (System 21 - Implemented)

**Existing 6 Social Behaviors:**
1. ✅ **Approach Companion** - Move closer for social interaction
2. ✅ **Groom Partner** - Clean other guinea pig (cleanliness + social)
3. ✅ **Play Together** - Shared play (play + social)
4. ✅ **Share Food** - Eat together (hunger + social)
5. ✅ **Sleep Together** - Rest in proximity (energy + social)
6. ✅ **Explore Together** - Move around as pair (social)

**Current Implementation:**
- File: `src/composables/game/useSocialBehaviors.ts`
- All 6 behaviors functional
- No bonding tier restrictions
- No personality-based behaviors
- No negative interactions

## Proposed Enhancements

### Part 1: New Social Interactions (4 new behaviors)

#### 1. **Greet** - Initial Acknowledgment
**Type:** Neutral/Positive
**Trigger:** After separation or first meeting
**Duration:** 2 seconds
**Bonding Requirement:** None (all tiers)

**Behavior:**
- Guinea pigs approach each other
- Brief nose-to-nose contact (sniff animation state)
- Small social need satisfaction (5 points each)
- Small bonding increase (+1 point)

**Messages:**
- `"[Name1] and [Name2] greet each other with a friendly sniff 👃"`
- `"[Name1] chirps a hello to [Name2] 🔊"`

**Implementation:**
```typescript
async function greetCompanion(
  gp1: GuineaPig,
  gp2: GuineaPig,
  bond: ActiveBond
): Promise<boolean> {
  // Approach if not near
  if (!areGuineaPigsNear(gp1.id, gp2.id, 1.5)) {
    await approachCompanion(gp1, gp2, bond)
  }

  // Brief greeting duration
  await delay(2000)

  // Small social satisfaction
  guineaPigStore.satisfyNeed(gp1.id, 'social', 5)
  guineaPigStore.satisfyNeed(gp2.id, 'social', 5)

  // Small bonding increase
  guineaPigStore.increaseBonding(
    bond.id,
    1,
    'interaction',
    `${gp1.name} greets ${gp2.name}`
  )

  // Activity message (only show 30% of the time to avoid spam)
  if (Math.random() < 0.3) {
    loggingStore.addPlayerAction(
      `${gp1.name} and ${gp2.name} greet each other with a friendly sniff 👃`,
      '🐹'
    )
  }

  return true
}
```

---

#### 2. **Inspect** - Curiosity-Based Investigation
**Type:** Neutral
**Trigger:** Curiosity-based, autonomous AI decision
**Duration:** 3 seconds
**Bonding Requirement:** None (all tiers)
**Personality Requirement:** Curiosity ≥ 5

**Behavior:**
- Initiator approaches partner
- "Investigating" state - sniffing, checking companion
- Social need satisfaction (10 points for initiator, 5 for partner)
- Medium bonding increase (+2 points)
- More frequent in neutral/friends tiers (learning phase)

**Messages:**
- `"[Name1] curiously inspects [Name2] 🔍"`
- `"[Name1] sniffs around [Name2], checking them out"`

**Implementation:**
```typescript
async function inspectCompanion(
  inspector: GuineaPig,
  partner: GuineaPig,
  bond: ActiveBond
): Promise<boolean> {
  // Personality check: Requires curiosity ≥ 5
  if (inspector.personality.curiosity < 5) {
    return false
  }

  // Approach if not near
  if (!areGuineaPigsNear(inspector.id, partner.id, 1.5)) {
    await approachCompanion(inspector, partner, bond)
  }

  // Record activity
  habitatConditions.recordGuineaPigActivity('movement')

  // Wait for inspection duration
  await delay(3000)

  // Satisfy needs (inspector gets more satisfaction from curiosity)
  guineaPigStore.satisfyNeed(inspector.id, 'social', 10)
  guineaPigStore.satisfyNeed(partner.id, 'social', 5)

  // Increase bonding
  guineaPigStore.increaseBonding(
    bond.id,
    2,
    'interaction',
    `${inspector.name} inspects ${partner.name}`
  )

  // Activity feed message
  loggingStore.addPlayerAction(
    `${inspector.name} curiously inspects ${partner.name} 🔍`,
    '🐹'
  )

  return true
}
```

---

#### 3. **Follow** - Movement Synchronization
**Type:** Positive
**Trigger:** Partner starts moving, follower decides to follow
**Duration:** Continuous until partner stops
**Bonding Requirement:** Friends (31%+) or Bonded (71%+)
**Personality Requirement:** Friendliness ≥ 6 OR Bond tier = Bonded

**Behavior:**
- One guinea pig follows the other's movement path
- Maintains proximity (1-2 cells behind)
- Small social satisfaction over time (2 points per minute)
- Small bonding increase (+1 point per minute)
- Only bonded pairs follow frequently, friends follow occasionally

**Messages:**
- `"[Name1] follows [Name2] around the habitat"`
- `"[Name1] stays close to [Name2], following their lead"`

**Implementation:**
```typescript
async function followCompanion(
  follower: GuineaPig,
  leader: GuineaPig,
  bond: ActiveBond
): Promise<boolean> {
  // Bonding requirement: Friends or Bonded
  if (bond.bondingTier === 'neutral') {
    return false
  }

  // Personality check for Friends tier (Bonded always eligible)
  if (bond.bondingTier === 'friends' && follower.personality.friendliness < 6) {
    return false
  }

  const leaderPos = habitatConditions.getGuineaPigPosition(leader.id)
  if (!leaderPos) return false

  // Move to position near leader (1-2 cells away)
  const followDistance = bond.bondingTier === 'bonded' ? 1 : 2
  const targetPos = {
    x: leaderPos.x + (Math.random() > 0.5 ? followDistance : -followDistance),
    y: leaderPos.y
  }

  const success = await moveToPosition(follower.id, targetPos)
  if (!success) return false

  // Small social satisfaction
  guineaPigStore.satisfyNeed(follower.id, 'social', 3)
  guineaPigStore.satisfyNeed(leader.id, 'social', 2)

  // Small bonding increase
  guineaPigStore.increaseBonding(
    bond.id,
    1,
    'proximity',
    `${follower.name} follows ${leader.name}`
  )

  // Activity message (only for bonded, less spam)
  if (bond.bondingTier === 'bonded' && Math.random() < 0.2) {
    loggingStore.addPlayerAction(
      `${follower.name} follows ${leader.name} around the habitat`,
      '🐹'
    )
  }

  return true
}
```

---

#### 4. **Kick** - Dominant/Territorial Behavior
**Type:** Negative
**Trigger:** Personality-based, stress, low bonding
**Duration:** 1 second (quick action)
**Bonding Requirement:** Neutral (0-30%) ONLY
**Personality Requirement:** Boldness ≥ 8 OR Friendliness ≤ 3

**Behavior:**
- Brief aggressive action (kick/push)
- NEGATIVE bonding impact (-3 to -5 points)
- Small stress increase for kicked guinea pig
- More frequent in Neutral tier with incompatible personalities
- Never happens in Friends or Bonded tiers
- Increases cooldown before next social interaction

**Messages:**
- `"[Name1] gives [Name2] a warning kick! They need more time to bond 😬"`
- `"[Name1] asserts dominance with a territorial kick at [Name2]"`
- `"[Name1] and [Name2] have a brief territorial dispute"`

**Kicking Probability:**
- **Neutral + Bold (8-10) + Low Friendliness (1-3):** 15% chance during proximity
- **Neutral + Bold (8-10):** 8% chance
- **Neutral + Low Friendliness (1-3):** 5% chance
- **Friends or Bonded:** 0% chance (never kick)

**Implementation:**
```typescript
async function kickCompanion(
  aggressor: GuineaPig,
  target: GuineaPig,
  bond: ActiveBond
): Promise<boolean> {
  // ONLY happens in Neutral tier (0-30%)
  if (bond.bondingTier !== 'neutral') {
    return false
  }

  // Personality requirements
  const isBold = aggressor.personality.boldness >= 8
  const isUnfriendly = aggressor.personality.friendliness <= 3

  // Must meet at least one personality condition
  if (!isBold && !isUnfriendly) {
    return false
  }

  // Calculate kick probability
  let kickChance = 0
  if (isBold && isUnfriendly) {
    kickChance = 0.15 // 15% chance
  } else if (isBold) {
    kickChance = 0.08 // 8% chance
  } else if (isUnfriendly) {
    kickChance = 0.05 // 5% chance
  }

  // Roll for kick
  if (Math.random() > kickChance) {
    return false
  }

  // Approach if not near
  if (!areGuineaPigsNear(aggressor.id, target.id, 1.5)) {
    await approachCompanion(aggressor, target, bond)
  }

  // Brief kick action
  await delay(1000)

  // NEGATIVE bonding decrease
  const bondingPenalty = isBold && isUnfriendly ? -5 : -3
  guineaPigStore.increaseBonding(
    bond.id,
    bondingPenalty, // Negative value
    'interaction',
    `${aggressor.name} kicks ${target.name} (territorial)`
  )

  // Small stress increase for target (reduce comfort)
  guineaPigStore.adjustNeed(target.id, 'comfort', -10)

  // Activity feed message (always show - important player feedback)
  loggingStore.addPlayerAction(
    `${aggressor.name} gives ${target.name} a warning kick! They need more time to bond 😬`,
    '⚠️'
  )

  return true
}
```

---

### Part 2: Bonding Tier Restrictions

#### Grooming Restriction
**Current:** No restrictions - any bonding tier can groom
**Proposed:** Grooming requires Friends (31%+) or Bonded (71%+)

**Rationale:**
- Grooming is an intimate behavior in real guinea pigs
- Indicates trust and established relationship
- Neutral pairs (0-30%) are still establishing trust
- Makes bonding progression more meaningful

**Implementation:**
```typescript
async function groomPartner(
  groomer: GuineaPig,
  partner: GuineaPig,
  bond: ActiveBond
): Promise<boolean> {
  // NEW: Bonding tier restriction
  if (bond.bondingTier === 'neutral') {
    // Cannot groom in neutral tier
    return false
  }

  // Approach if not near
  if (!areGuineaPigsNear(groomer.id, partner.id, 1.5)) {
    await approachCompanion(groomer, partner, bond)
  }

  // ... rest of existing implementation
}
```

---

## Implementation Plan

### Phase 1: Add New Interaction Functions (4-5 hours)

**Tasks:**
1. Add `greetCompanion()` function to `useSocialBehaviors.ts`
2. Add `inspectCompanion()` function (with curiosity check)
3. Add `followCompanion()` function (with bonding tier check)
4. Add `kickCompanion()` function (with personality + tier checks)
5. Export all new functions

**Files Modified:**
- `src/composables/game/useSocialBehaviors.ts`

### Phase 2: Update Grooming Restriction (30 minutes)

**Tasks:**
1. Add bonding tier check to `groomPartner()` function
2. Return false if `bond.bondingTier === 'neutral'`
3. Test grooming with neutral, friends, and bonded pairs

**Files Modified:**
- `src/composables/game/useSocialBehaviors.ts`

### Phase 3: Integrate with AI Behavior System (2-3 hours)

**Tasks:**
1. Add new interaction types to behavior decision system
2. Weight behaviors based on personality and bonding tier
3. Add kick behavior to autonomous decisions (low probability)
4. Ensure greet happens after separation periods
5. Add follow behavior when companion is moving

**Files Modified:**
- `src/composables/game/useGuineaPigBehavior.ts` (AI decision system)

### Phase 4: Testing & Refinement (1-2 hours)

**Test Cases:**
1. ✅ Greet: Guinea pigs greet after being separated
2. ✅ Inspect: Curious guinea pigs (curiosity ≥ 5) inspect companion
3. ✅ Follow: Friends/Bonded pairs follow each other
4. ✅ Kick: Neutral tier with bold/unfriendly personality kicks occasionally
5. ✅ Kick Never: Friends/Bonded never kick
6. ✅ Groom Blocked: Neutral tier cannot groom
7. ✅ Groom Allowed: Friends/Bonded can groom

**Files Modified:**
- `src/components/debug/gameplay/BondingDebug.vue` (add test buttons)

---

## Summary of Changes

### New Interactions Added:
1. ✅ **Greet** - Friendly acknowledgment (all tiers)
2. ✅ **Inspect** - Curiosity-based investigation (curiosity ≥ 5)
3. ✅ **Follow** - Movement synchronization (Friends/Bonded only)
4. ✅ **Kick** - Dominant/territorial behavior (Neutral only, personality-based)

### Restrictions Added:
1. ✅ **Grooming** - Now requires Friends (31%+) or Bonded (71%+) tier
2. ✅ **Kick** - Only Neutral tier (0-30%), requires bold OR unfriendly personality

### Behavior Count:
- **Before:** 6 social interactions
- **After:** 10 social interactions (4 new)

### Realism Improvements:
- ✅ Bonding progression feels more meaningful (grooming unlocked)
- ✅ Negative interactions exist (kick) for realistic territorial dynamics
- ✅ Personality traits matter more (curiosity, boldness, friendliness)
- ✅ Movement synchronization for bonded pairs (follow)
- ✅ Natural greetings after separation

---

## Future Enhancements (Phase 5+)

1. **Popcorn Together** - Synchronized joy expression when both happy
2. **Share Hiding Spot** - Seek shelter together when stressed
3. **Alarm Call** - One guinea pig alerts the other to perceived danger
4. **Teeth Chattering** - Warning sound before kick (gives player heads up)
5. **Cuddle Pile** - Multiple guinea pigs sleep in a pile (3+ guinea pigs)
6. **Food Dispute** - Mild competition over favorite food (not aggressive)

---

## References

- **System 21 Documentation:** `docs/systems/phase4/system-21-social-bonding-system.md`
- **Bonding Design Doc:** `docs/systems/phase4/design-docs/guinea-pig-bonding-system.md`
- **Current Implementation:** `src/composables/game/useSocialBehaviors.ts`
- **AI Behavior System:** `src/composables/game/useGuineaPigBehavior.ts`
