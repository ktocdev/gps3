# Unified 3D Behavior System

## Problem
Current 3D implementation has separate behavior composables (`use3DHungerBehavior.ts`, `use3DThirstBehavior.ts`) that each create their own `use3DMovement` instance. This causes conflicts when both behaviors try to control the same guinea pig's movement simultaneously.

## Solution
Create a unified `use3DBehavior.ts` that follows the 2D pattern from `useGuineaPigBehavior.ts`:
- Single behavior controller per guinea pig
- Single movement controller shared across all behaviors
- Priority-based goal selection
- Cooldown system to prevent behavior spamming

## Key 2D Patterns to Follow

### Priority Calculation
```typescript
function calculateNeedPriority(needValue: number, threshold: number, baseWeight: number): number {
  if (needValue >= threshold) return 0
  const urgency = (threshold - needValue) / threshold
  return baseWeight * urgency
}
```

### Goal Selection
1. Collect all possible goals (eat, drink, wander) into array
2. Calculate priority for each based on need urgency
3. Sort by priority descending
4. Add variation: if top goals within 15 points, pick randomly
5. Return highest priority goal

### Single Execution Flow
- One tick loop evaluates ALL needs
- Only ONE behavior executes at a time
- Uses callbacks for arrival, then executes action (eat/drink)
- Sets cooldown after completion

## Implementation Steps

### Step 1: Create use3DBehavior.ts
Location: `src/composables/3d/use3DBehavior.ts`

Structure:
```typescript
// Configuration
const BEHAVIOR_TICK_INTERVAL = 2000
const THRESHOLDS = {
  hunger: 70,
  thirst: 65
}
const COOLDOWNS = {
  eat: 10000,
  drink: 8000,
  wander: 3000
}

// Types
type Behavior3DType = 'eat' | 'drink' | 'wander'
interface Behavior3DGoal {
  type: Behavior3DType
  target: Vector3D | null
  priority: number
  needSatisfied?: 'hunger' | 'thirst'
}

export function use3DBehavior(guineaPigId: string) {
  // Single movement controller
  const movement = use3DMovement(guineaPigId)

  // State
  const currentActivity = ref<'idle'|'walking'|'eating'|'drinking'>('idle')
  const behaviorCooldowns = new Map<Behavior3DType, number>()

  // Priority calculation (like 2D)
  function calculateNeedPriority(...)

  // Goal collection & selection
  function selectBehaviorGoal(): Behavior3DGoal | null

  // Behavior execution
  function executeBehavior(goal: Behavior3DGoal)
  function executeEatBehavior(goal)
  function executeDrinkBehavior(goal)
  function executeWanderBehavior()

  // Tick loop
  function tick()

  // Lifecycle
  function start()
  function stop()
  function pause()
  function resume()
}
```

### Step 2: Update Habitat3DDebug.vue

Current code uses:
- `hungerBehaviors: Map<string, ReturnType<typeof use3DHungerBehavior>>`
- `thirstBehaviors: Map<string, ReturnType<typeof use3DThirstBehavior>>`
- Pauses hunger during thirst drinking callbacks
- Pauses both for Take Control mode

Changes:
1. Replace both Maps with single `behaviors: Map<string, ReturnType<typeof use3DBehavior>>`
2. Remove imports for `use3DHungerBehavior`, `use3DThirstBehavior`
3. Add import for `use3DBehavior`
4. In guinea pig creation: create single `use3DBehavior`, call `behavior.start()`
5. Pass bubble callbacks to behavior: `behavior.onDrinkingStart(...)`, `behavior.onDrinkingEnd(...)`
6. In Take Control mode: single `behavior.pause()` and `behavior.resume()` calls
7. In cleanup: single `behaviors.forEach(b => b.stop())`

### Step 3: Remove/Archive Separate Composables
After verifying unified system works:
- Remove `use3DHungerBehavior.ts`
- Remove `use3DThirstBehavior.ts`

## Files to Modify

| File | Action |
|------|--------|
| `src/composables/3d/use3DBehavior.ts` | CREATE - Unified behavior controller |
| `src/components/debug/environment/Habitat3DDebug.vue` | MODIFY - Use new unified system |
| `src/composables/3d/use3DHungerBehavior.ts` | DELETE after verification |
| `src/composables/3d/use3DThirstBehavior.ts` | DELETE after verification |

## Extensibility Design

The unified system matches the 2D pattern and is designed to support all guinea pig needs.

### All Needs (from 2D system)
```typescript
type Behavior3DType =
  | 'eat'          // hunger need
  | 'eat_hay'      // hunger need (hay rack)
  | 'drink'        // thirst need
  | 'sleep'        // energy need
  | 'groom'        // hygiene need (self-groom in place)
  | 'seek_shelter' // shelter need
  | 'chew'         // chew need
  | 'play'         // play need (toys)
  | 'socialize'    // social need (companion)
  | 'wander'       // default behavior
  | 'popcorn'      // excitement behavior
  | 'zoomies'      // excitement behavior
  | 'watch_player' // friendship behavior
  | 'hide'         // low friendship behavior
```

### Goal Structure (same as 2D)
```typescript
interface Behavior3DGoal {
  type: Behavior3DType
  target: Vector3D | null
  priority: number
  estimatedDuration: number
  needSatisfied?: NeedType
  targetItemId?: string
  metadata?: any // for social behaviors
}
```

### Adding New Behaviors
To add a new need (e.g., energy/sleep):
1. Add threshold in `THRESHOLDS` object
2. Add cooldown in `COOLDOWNS` object
3. Add goal collection in `selectBehaviorGoal()`
4. Add execution case in `executeBehavior()` switch
5. Implement `executeSleepBehavior()` function

The pattern is identical for all needs - only the specific logic differs.

## Initial Implementation (Phase 1)

Start with hunger + thirst to prove the pattern, then extend.

| Need | Threshold | Duration | Restore Amount |
|------|-----------|----------|----------------|
| Hunger | 70 | 3000ms | 50 |
| Thirst | 65 | 3000ms | 35 |

Future phases will add:
- Energy (sleep) - threshold 60
- Hygiene (groom) - threshold 70
- Shelter - threshold 60
- Play, Chew, Social - as items are available

## Testing Checklist
- [ ] Guinea pig wanders when not hungry/thirsty
- [ ] Guinea pig seeks food when hunger < 70
- [ ] Guinea pig seeks water when thirst < 65
- [ ] Priority correctly selects most urgent need (lower value = higher priority)
- [ ] Take Control mode pauses autonomous behavior
- [ ] Bubble animation appears during drinking
- [ ] Water level decreases when drinking
- [ ] Poop still spawns periodically
