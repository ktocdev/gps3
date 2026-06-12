# System 19: Autonomous AI Behaviors

**Phase 4, Stage 3 - Intelligent Need-Based Autonomous Behaviors**

**Time Estimate:** 12-16 hours

## Goal

Implement full autonomous AI with need-based decision making, friendship-influenced behaviors, environmental interactions, and intelligent item usage. Guinea pigs should feel alive and autonomous through realistic behavior patterns.

## Dependencies

**Required Systems:**
- System 17: Visual Presence & Positioning
- System 18: Pathfinding & Movement
- Needs system (Phase 2)
- Habitat items with metadata (Phase 3)
- Friendship tracking (Phase 2)

**Provides Foundation For:**
- System 20: Direct Interaction System (reactions depend on AI state)
- System 21: Social Bonding System (social behaviors use AI decision framework)

## Design Reference

See [design-docs/guinea-pig-autonomy-system.md](design-docs/guinea-pig-autonomy-system.md) for comprehensive design specification including:
- Complete behavior catalog
- Detailed decision priority matrix
- Sleep behavior mechanics
- Shelter behavior mechanics
- Friendship-influenced behaviors
- Environmental interactions

## Implementation Overview

This system implements 10 major subsystems working together to create believable autonomous guinea pig behavior.

### Core Subsystems

1. **AI Decision Priority Matrix** - Intelligent behavior selection
2. **Need-Based Autonomous Behaviors** - Automatic need satisfaction
3. **Enhanced Sleep Behavior** - Bed selection and quality mechanics
4. **Proactive Shelter Behavior** - Security-seeking behaviors
5. **Friendship-Influenced Behaviors** - Behaviors that respond to friendship levels
6. **Environmental Interaction** - Realistic poop dropping
7. **Item Interaction Behaviors** - Specific behaviors for water, food, hay, chew items
8. **AI State Management** - Comprehensive state tracking
9. **Activity Feed Integration** - Rich descriptive messages
10. **Performance Optimization** - Decision throttling and caching

---

## Implementation Tasks

### Task 1: AI Decision Priority Matrix

Create intelligent behavior selection based on multiple factors.

#### Priority System

```typescript
interface BehaviorPriority {
  urgentNeeds: number         // Weight: 100 (needs < 30%)
  moderateNeeds: number       // Weight: 75  (needs 30-60%)
  sleepBehavior: number       // Weight: 80  (energy < 40%)
  shelterBehavior: number     // Weight: 70  (shelter < 60%)
  friendshipBehaviors: number // Weight: 50  (varies by friendship)
  exploration: number         // Weight: 25  (when content)
  environmental: number       // Weight: 40  (habitat conditions)
}

interface BehaviorGoal {
  type: 'satisfy_need' | 'explore' | 'friendship_behavior' | 'social_interaction'
  target: GridPosition | HabitatItem | null
  priority: number
  estimatedDuration: number
  needSatisfied?: NeedType
}
```

#### Decision Algorithm Flow

1. **Urgent Need Check** - Highest priority for critical needs (< 30%)
2. **Sleep Behavior Assessment** - High priority when energy low
3. **Shelter Behavior Assessment** - High priority when shelter need low
4. **Friendship State Assessment** - Determines interaction willingness
5. **Environmental Evaluation** - Habitat cleanliness and item availability
6. **Moderate Need Processing** - Secondary priority needs (30-60%)
7. **Exploration/Entertainment** - Lowest priority when all needs satisfied

**File:** `src/composables/game/useGuineaPigBehavior.ts`

---

### Task 2: Need-Based Autonomous Behaviors

Implement automatic need satisfaction behaviors for all need types.

#### Need Thresholds & Behaviors

**High Priority (0-30%):**
- Hunger < 30%: Navigate to food bowl, select preferred food, consume
- Thirst < 25%: Navigate to water bottle, drink water
- Health < 30%: Seek shelter, rest behaviors
- Energy < 30%: Seek bed or floor space, sleep

**Medium Priority (30-60%):**
- Happiness < 50%: Explore toys, use enrichment items
- Energy < 40%: Navigate to sleeping area, nap
- Cleanliness < 45%: Self-grooming, avoid dirty areas
- Shelter < 60%: Proactive shelter seeking

**Low Priority (60-80%):**
- Social < 70%: Watch player, seek companion
- Happiness < 75%: Investigate new items

#### Item Selection Logic

```typescript
function selectBestItem(guineaPigId: string, needType: NeedType): HabitatItem | null {
  const availableItems = getItemsByNeedType(needType)

  const validItems = availableItems.filter(item =>
    item.available && item.effectiveness > 0.3
  )

  const scoredItems = validItems.map(item => ({
    item,
    score: calculateItemScore(item, guineaPigId, needType)
  }))

  return scoredItems.sort((a, b) => b.score - a.score)[0]?.item ?? null
}
```

**File:** `src/utils/itemSelection.ts`

---

### Task 3: Enhanced Sleep Behavior System

Implement intelligent bed selection and sleep quality mechanics.

#### Key Features

**Bed Selection:**
- Preference-based bed selection
- Energy level scaling (lower energy = higher bed usage)
- Comfort seeking when stressed
- Shelter proximity preference

**Sleep Quality:**
- Base effectiveness: 1.0x (floor)
- Bed multipliers: 1.25x - 1.5x
- Preference bonuses: +15-25%
- Shelter synergy: +30%

**Sleep Duration:**
- Based on energy level
- Lower energy = longer sleep (30-200 seconds)

See design doc for full implementation details.

---

### Task 4: Proactive Shelter Behavior System

Implement security-seeking shelter behaviors.

#### Key Features

**Shelter Seeking:**
- Proactive when shelter need < 60%
- Regular security checks
- Anxiety prevention
- Preference establishment

**Comfort Zone Development:**
- Preferred shelters tracked
- Security pathways established
- Shelter familiarity scores
- Multiple shelter usage patterns

---

### Task 5: Friendship-Influenced Behaviors

Implement behaviors that respond to friendship levels.

#### Behavior Tiers

**High Friendship (70-100%):**
- Spontaneous Popcorn
- Zoomies
- Watch Lovingly
- Investigate Player Cursor
- Approach Player Interactions

**Medium Friendship (40-70%):**
- Look at Player
- Chirp Greetings
- Comfortable Stretching
- Curious Investigation

**Low Friendship (0-40%):**
- Hide Behaviors
- Avoid Eye Contact
- Freeze When Approached
- Warning Reactions
- Reduced Exploration

**Trigger Mechanism:**
```typescript
function checkFriendshipBehaviors(guineaPig: GuineaPig): BehaviorGoal | null {
  const friendship = guineaPig.friendship

  if (friendship >= 70 && Math.random() < 0.05) {
    return createFriendshipBehaviorGoal('popcorn' | 'zoomies' | 'watch_lovingly')
  }

  if (friendship < 40 && isPlayerActive() && Math.random() < 0.1) {
    return createAvoidanceBehaviorGoal('hide_in_shelter')
  }

  return null
}
```

---

### Task 6: Environmental Interaction System

Implement realistic environmental behaviors.

#### Poop Dropping

```typescript
interface PoopBehavior {
  poopFrequency: number // every 10-20 minutes
  lastPoopTime: number
  poopWhileMoving: boolean
  poopWhileEating: boolean
}

function checkPoopBehavior(guineaPig: GuineaPig): void {
  const timeSinceLastPoop = Date.now() - guineaPig.lastPoopTime
  const poopInterval = 600000 + Math.random() * 600000 // 10-20 minutes

  if (timeSinceLastPoop > poopInterval) {
    dropPoop(guineaPig.position)
    guineaPig.lastPoopTime = Date.now()
    addActivityMessage(`${guineaPig.name} drops a poop near the ${getNearbyItemName(guineaPig.position)}`)
  }
}
```

**File:** `src/stores/habitatConditionsStore.ts` (modify)

---

### Task 7: Item Interaction Behaviors

Implement specific interaction behaviors for each item type.

#### Water Bottle Interaction

```typescript
async function drinkFromWaterBottle(guineaPig: GuineaPig, waterBottle: HabitatItem): Promise<void> {
  const path = findPath({ start: guineaPig.position, goal: waterBottle.position })
  await moveAlongPath(guineaPig, path)

  setGuineaPigState(guineaPig, 'drinking')
  await delay(2000)

  const waterConsumed = consumeWater(waterBottle.id)
  satisfyNeed(guineaPig.id, 'thirst', waterConsumed * 30)

  addActivityMessage(`${guineaPig.name} drinks deeply from the water bottle`)
  setGuineaPigState(guineaPig, 'idle')
}
```

#### Food Bowl Interaction

```typescript
async function eatFromFoodBowl(guineaPig: GuineaPig, foodBowl: HabitatItem): Promise<void> {
  const path = findPath({ start: guineaPig.position, goal: foodBowl.position })
  await moveAlongPath(guineaPig, path)

  const selectedFood = selectPreferredFood(guineaPig, foodBowl)

  setGuineaPigState(guineaPig, 'eating')
  await delay(3000)

  const effectiveness = calculateFoodEffectiveness(selectedFood, guineaPig)
  consumeFood(foodBowl.id, selectedFood.id)
  satisfyNeed(guineaPig.id, 'hunger', effectiveness)

  const reaction = getPreferenceReaction(guineaPig, selectedFood)
  addActivityMessage(`${guineaPig.name} ${reaction} ${selectedFood.name}`)

  setGuineaPigState(guineaPig, 'idle')
}
```

#### Hay Rack & Chew Item

Similar patterns for hay consumption and chew item usage.

---

### Task 8: AI State Management System

Track comprehensive state for autonomous behaviors.

```typescript
interface AutonomyState {
  currentGoal: BehaviorGoal | null
  pathToGoal: GridPosition[]
  lastDecisionTime: number
  behaviorCooldowns: Map<BehaviorType, number>
  explorationHistory: GridPosition[]
  preferredLocations: GridPosition[]
  comfortZone: ComfortZone
  currentActivity: 'idle' | 'walking' | 'eating' | 'drinking' | 'sleeping' | 'chewing' | 'grooming'
  activityStartTime: number
  lastPoopTime: number
}
```

**File:** `src/composables/game/useAutonomyState.ts`

---

### Task 9: Activity Feed Integration

Generate rich, descriptive messages for all autonomous actions.

#### Message Categories

**Movement:** "Guinea pig walks purposefully to the water bottle"
**Need Satisfaction:** "Guinea pig munches contentedly on timothy hay"
**Friendship:** "Guinea pig does excited zoomies around the cage!"
**Environmental:** "Guinea pig drops a poop near the hay rack"

**File:** `src/utils/messageGenerator.ts` (modify)

---

### Task 10: Performance Optimization

Implement decision throttling and caching.

**AI Decision Throttling:**
- Decisions every 2-5 seconds (not every frame)
- Stagger between multiple guinea pigs
- Cache behavior priorities

**File:** `src/stores/gameTimingStore.ts` (add AI tick)

---

## Files to Create/Modify

### New Files

```
src/composables/game/useGuineaPigBehavior.ts - AI decision making
src/composables/game/useAutonomyState.ts - State management
src/utils/behaviorPriority.ts - Priority calculations
src/utils/itemSelection.ts - Item selection logic
```

### Modified Files

```
src/components/game/habitat/GuineaPigSprite.vue - Animation states (eating, drinking, sleeping, etc.)
src/stores/gameTimingStore.ts - AI decision tick
src/stores/guineaPigStore.ts - Autonomy state tracking
src/utils/messageGenerator.ts - Autonomous action messages
src/stores/habitatConditionsStore.ts - Poop dropping
```

---

## Testing & Validation

### AI Decision Testing

- [x] Priority matrix selects urgent needs first
- [x] Friendship behaviors trigger appropriately
- [x] Environmental responses work correctly
- [x] Decision cooldowns prevent spam

### Autonomous Behavior Testing

- [x] Guinea pigs autonomously satisfy all need types
- [x] Sleep behavior selects appropriate beds
- [x] Shelter seeking works proactively (< 60%)
- [x] Friendship behaviors match friendship levels
- [x] Environmental poop dropping happens naturally

### Item Interaction Testing

- [x] Water bottle: navigation + consumption works
- [x] Food bowl: navigation + preference + consumption works
- [x] Hay rack: navigation + consumption works
- [x] Chew items: navigation + durability degradation works

### Integration Testing

- [x] Item interactions consume resources correctly
- [x] Activity feed messages generate for all actions
- [x] Need satisfaction updates wellness properly
- [x] Multiple guinea pigs coordinate without conflicts

---

## Success Criteria

**Core Functionality:**
- [x] Guinea pigs autonomously satisfy needs based on priority
- [x] Sleep behavior selects beds and provides bonuses
- [x] Shelter seeking works proactively
- [x] Friendship behaviors trigger appropriately
- [x] All item interactions functional
- [x] Environmental poop dropping works
- [x] Activity feed shows all autonomous actions
- [x] Decision priority matrix functions correctly
- [x] Multiple guinea pigs coordinate without conflicts

**Quality Standards:**
- [x] AI decisions < 10ms per decision
- [x] Behavior feels natural and varied
- [x] No repetitive loops or stuck states
- [x] Performance acceptable (60fps with 2 guinea pigs)

---

## Implementation Strategy

**Phase 1 (4-6 hours):** Core AI decision matrix + basic need behaviors
**Phase 2 (3-4 hours):** Sleep & shelter systems
**Phase 3 (2-3 hours):** Friendship behaviors + environmental interactions
**Phase 4 (3-4 hours):** Item interactions + activity feed + testing

---

## Next Steps

After completing System 19:

1. **Test AI decision making** with various need combinations
2. **Verify all item interactions** work correctly
3. **Test friendship behaviors** at different levels
4. **Move to System 20:** [Direct Interaction System](system-20-direct-interaction-system.md)

System 20 implements player-to-guinea pig interactions, which can run in parallel with System 21 if desired.

---

## Related Documentation

- **Master Plan:** [phase-4-guinea-pig-integration-plan-full.md](phase-4-guinea-pig-integration-plan-full.md)
- **Design Spec:** [design-docs/guinea-pig-autonomy-system.md](design-docs/guinea-pig-autonomy-system.md)
- **Previous System:** [system-18-pathfinding-movement.md](system-18-pathfinding-movement.md)
- **Next System:** [system-20-direct-interaction-system.md](system-20-direct-interaction-system.md)
