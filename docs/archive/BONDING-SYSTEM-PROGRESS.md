# System 21: Social Bonding System - Implementation Progress

**Started:** October 26, 2025
**Status:** 🔄 IN PROGRESS - Phase 1 Complete (20%)
**Branch:** GPS2-38

---

## ✅ Completed Tasks

### Phase 1: Bond Creation & Compatibility (2-3 hours) - ✅ 60% COMPLETE

1. **✅ Compatibility Calculation System**
   - Created `src/utils/compatibility.ts` with full scoring logic
   - Gender compatibility: Male-female (25), Female-female (15), Male-male (5)
   - Personality factors:
     - Friendliness: Both outgoing (20), Complementary (10), Both shy (-5)
     - Independence: Balanced (15), Extreme mismatch (-10)
     - Playfulness: Similar (10), Very different (-5)
     - Curiosity: Both curious (10)
     - **Cleanliness: Balanced (10), Extreme mismatch (-5)** ← Added per user request
   - Breed compatibility: Same breed (10), Similar family (5)
   - Helper functions: `getCompatibilityDescription()`, `getCompatibilityBreakdown()`

2. **✅ Bond Data Structures**
   - Added `ActiveBond` interface to `guineaPigStore.ts`
   - Added `BondingEvent` interface for history tracking
   - Added `activeBonds` Map to store state
   - Interfaces support:
     - bondingLevel (0-100, hidden)
     - bondingTier (neutral/friends/bonded)
     - compatibilityScore
     - interaction tracking
     - proximity time tracking
     - bonding history

3. **🔄 Bond Management Functions** - IN PROGRESS
   - Need to add: `createBond()`, `getBond()`, `updateBondingLevel()`, `getBondingTier()`
   - Auto-creation when 2nd guinea pig added
   - Bond retrieval by guinea pig IDs

---

## 📋 Remaining Tasks

### Phase 1: Bond Creation & Compatibility (40% remaining)

**Next Steps:**
1. Add bond management functions to guineaPigStore.ts:
   ```typescript
   function createBond(gp1Id: string, gp2Id: string): ActiveBond
   function getBond(gp1Id: string, gp2Id: string): ActiveBond | null
   function getActiveBond(guineaPigId: string): ActiveBond | null
   function updateBondingLevel(bondId: string, increase: number): void
   function getBondingTier(bondingLevel: number): 'neutral' | 'friends' | 'bonded'
   function addBondingEvent(bondId: string, event: BondingEvent): void
   ```

2. Auto-create bond when 2nd guinea pig added:
   - Hook into existing guinea pig activation logic
   - Check if 2 active guinea pigs exist
   - Create bond if it doesn't exist
   - Calculate compatibility score on creation

3. Expose bond state to computed properties:
   ```typescript
   const allBonds = computed(() => Array.from(activeBonds.value.values()))
   const hasBondedGuineaPigs = computed(() => activeBonds.value.size > 0)
   ```

### Phase 2: Autonomous Social Behaviors (0% complete)

**Files to Create:**
1. `src/composables/game/useSocialBehaviors.ts` - Social interaction execution
   - approachCompanion()
   - groomPartner()
   - playTogether()
   - shareFood()
   - sleepTogether()
   - exploreTogether()

2. `src/composables/game/useBonding.ts` - Bond utilities
   - areGuineaPigsNear()
   - getPartnerGuineaPig()
   - calculateProximityBonus()

**Behavior Requirements:**
- Pathfinding to partner
- Synchronized states/animations
- Need satisfaction for both
- Bonding level increases
- Activity feed messages

### Phase 3: Bonding Progression & Social Needs (0% complete)

**Files to Create:**
1. `src/utils/bondingProgression.ts` - Progression mechanics
   - processBondingProgression()
   - updateBondingTier()
   - Tier advancement detection
   - Milestone messages

**Files to Modify:**
1. `src/stores/needsController.ts` - Enhanced social need processing
   - Apply bonding tier decay modifiers
   - Proximity bonus calculation
   - Single guinea pig penalty (30% faster decay)

**Bonding Tiers:**
- 🤝 Neutral (0-30%): 20% slower social decay, 10% proximity bonus
- 😊 Friends (31-70%): 30% slower social decay, 25% proximity bonus
- 💕 Bonded (71-100%): 50% slower social decay, 40% proximity bonus

### Phase 4: AI Integration & Polish (0% complete)

**Files to Modify:**
1. `src/composables/game/useGuineaPigBehavior.ts` - AI integration
   - checkSocialBehaviors()
   - getSocialBehaviorOptions()
   - selectBestSocialBehavior()

2. `src/utils/messageGenerator.ts` - Social messages
   - generateBondingMilestoneMessage()
   - generateSocialInteractionMessage()
   - Personality-aware variations

3. `src/components/game/habitat/GuineaPigSprite.vue` - Visual states
   - Add "grooming" state
   - Add "being_groomed" state

4. `src/stores/gameTimingStore.ts` - Progression tick
   - Process bonding progression each tick
   - Track proximity time

---

## Implementation Strategy

### Recommended Next Session Tasks

1. **Complete Phase 1 (30 min)**
   - Add bond management functions
   - Auto-create bonds
   - Test bond creation with 2 guinea pigs

2. **Start Phase 2 (2 hours)**
   - Create useSocialBehaviors.ts
   - Implement groomPartner() and playTogether()
   - Test basic social interactions

3. **Continue Phase 2 (1.5 hours)**
   - Implement remaining 4 social behaviors
   - Add proximity detection
   - Test all 6 behaviors

4. **Phase 3 (2 hours)**
   - Create bondingProgression.ts
   - Modify needsController.ts
   - Test bonding progression over time

5. **Phase 4 (1.5 hours)**
   - Integrate into AI decision system
   - Add activity feed messages
   - Add visual states
   - Final testing

---

## Files Modified So Far

### Created Files (2)
1. ✅ `src/utils/compatibility.ts` - 200 lines, full compatibility scoring
2. 🔄 `src/stores/guineaPigStore.ts` - Added ActiveBond interfaces and state

### Modified Files (1)
1. 🔄 `src/stores/guineaPigStore.ts` - Added bond interfaces, state, needs bond functions

---

## Testing Checklist

**Phase 1 Testing:**
- [ ] Compatibility scoring produces expected values
- [ ] Bond created automatically when 2nd guinea pig added
- [ ] Compatibility score calculated correctly
- [ ] Bond retrieval functions work
- [ ] Bonding tier calculation accurate

**Phase 2 Testing:**
- [ ] All 6 social behaviors execute correctly
- [ ] Pathfinding to partner works
- [ ] Need satisfaction applied to both guinea pigs
- [ ] Bonding level increases per interaction
- [ ] Activity feed messages appear

**Phase 3 Testing:**
- [ ] Bonding progression increases over time
- [ ] Proximity time tracked correctly
- [ ] Tier advancement triggers milestone messages
- [ ] Social decay modifiers apply correctly
- [ ] Proximity bonus provides satisfaction

**Phase 4 Testing:**
- [ ] AI triggers social behaviors autonomously
- [ ] Social behaviors prioritized correctly
- [ ] Random interactions occur for bonded pairs
- [ ] Visual states display correctly
- [ ] Performance acceptable with 2+ guinea pigs

---

## Success Criteria

**Core Functionality:**
- [ ] Bond created automatically when 2nd guinea pig added
- [ ] Compatibility score calculated correctly
- [ ] Bonding progression increases through interactions and proximity
- [ ] Bonding tier advancement triggers milestone messages
- [ ] Autonomous social interactions trigger appropriately
- [ ] All 6 social behaviors functional
- [ ] Social need decay modified by bonding level
- [ ] Proximity provides social satisfaction bonus
- [ ] Activity feed shows all social interactions

**Quality Standards:**
- [ ] Social behaviors feel natural and varied
- [ ] Bonding progression feels rewarding
- [ ] Compatibility system balanced (all pairs can eventually bond)
- [ ] Performance acceptable with 2 guinea pigs

---

## Related Documentation

- **System Spec:** [docs/systems/phase4/system-21-social-bonding-system.md](systems/phase4/system-21-social-bonding-system.md)
- **Design Spec:** [docs/game-design/guinea-pig-bonding-system.md](game-design/guinea-pig-bonding-system.md)
- **Project Plan:** [docs/PROJECT_PLAN.md](PROJECT_PLAN.md)
- **Sprint Doc:** [docs/SPRINT-2025-10-20.md](SPRINT-2025-10-20.md)

---

## Next Session Priority

**Start Here:**
1. Finish Phase 1 bond management functions (30 min)
2. Create useSocialBehaviors.ts with first 2 behaviors (1 hour)
3. Test basic social interactions with 2 guinea pigs (30 min)

**Estimated Time to Complete:** 6-8 hours remaining
