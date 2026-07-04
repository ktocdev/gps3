---
source: src/composables/game/useGuineaPigBehavior.ts
source_hash: 9b0fb5167d3be4ab94a8ba67b583b0105df47f9415824cf52475647431350c33
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# useGuineaPigBehavior

`src/composables/game/useGuineaPigBehavior.ts`

> This composable implements System 19 (Autonomous AI Behaviors), the core AI decision-making and behavior execution engine for a single guinea pig. It selects the highest-priority behavior based on the guinea pig's needs, friendship level, and personality, then executes navigation and activity sequences (eating, drinking, sleeping, grooming, chewing, playing, socializing, sheltering, and friendship-driven behaviors), while integrating with movement, pathfinding, habitat state, logging, and social systems.

### Setup
Given a `guineaPigId`, the composable pulls in numerous stores (guineaPig, habitatConditions, logging, behaviorState, supplies) and composables (useHabitatContainers, useMovement, usePathfinding, useSocialBehaviors). It initializes centralized behavior state via `behaviorStateStore` and exposes it as a computed getter/setter. A `guineaPig` computed reference tracks the current animal.

### Decision flow
`tick()` is the main entry point (intended to run every 3-5s). It first calls `checkAutonomousPooping()` (drops poop every `POOP_INTERVAL_MS`), handles manual-control movement (converting pixel targets to grid coords using a hardcoded cellSize of 60), skips if a goal is active or the decision cooldown (3s + random jitter) hasn't elapsed, then calls `selectBehaviorGoal()` and fires `executeBehavior()` non-blocking.

`selectBehaviorGoal()` builds a list of candidate `BehaviorGoal`s from needs vs `DEFAULT_THRESHOLDS` using `calculateNeedPriority()` (urgent needs 80-100, moderate 40-70), plus friendship-tier probabilistic behaviors (popcorn/zoomies/watch_player/hide) and a low-priority wander fallback. Goals are sorted by priority; if multiple are within 15 points of the top, one is picked randomly for variety.

### Item finding
`findNearestItemForNeed()` maps need types to item keywords (and subCategory checks for play/chew), computes Manhattan distance, and returns either the anchor position (`preferAnchor=true`, e.g. sleep on top) or a valid adjacent cell (hide inside), validating via `pathfinding.isValidPosition`.

### Execution
Each `execute*Behavior` function navigates via `movement.moveTo`, awaits `movement.onArrival`, sets `currentActivity`, dispatches `show-chat-bubble` CustomEvents, logs via `MessageGenerator` + `loggingStore`, waits a duration (some using `pausableDelay` or interruptible 250ms chunks that abort if the goal type changes), then adjusts needs via `guineaPigStore.adjustNeed` and sets a cooldown. Quality/effectiveness multipliers derive from food freshness, preferences, and personality traits (cleanliness, playfulness, boldness). `executeSocializeBehavior` supports player-requested interactions and weighted random selection across up to 10 social behaviors gated by bonding tier and personality. Sleep also grants a bonding bonus when a companion sleeps at the same cell (System 24).

## Exports

- **useGuineaPigBehavior** (composable) — `useGuineaPigBehavior(guineaPigId: string): { behaviorState, selectBehaviorGoal, executeBehavior, tick, isOnCooldown, stopMovement, resumeMovement }`: Main composable. Returns the centralized behavior state (computed), `selectBehaviorGoal(thresholds?)`, `executeBehavior(goal)`, `tick(thresholds?)` (the AI decision loop), `isOnCooldown(type)`, and movement passthroughs `stopMovement`/`resumeMovement`.
- **BehaviorType** (type) — `type BehaviorType = 'eat' | 'eat_hay' | 'drink' | 'sleep' | 'wander' | 'groom' | 'seek_shelter' | 'chew' | 'play' | 'socialize' | 'popcorn' | 'zoomies' | 'watch_player' | 'hide' | 'idle'`: Enumerates all supported autonomous behavior types.
- **BehaviorGoal** (type) — `interface BehaviorGoal { type: BehaviorType; target: GridPosition | null; priority: number; estimatedDuration: number; needSatisfied?: NeedType; targetItemId?: string; metadata?: any }`: Describes a selected behavior goal including navigation target, priority, duration, and contextual metadata (used for social partner/bond info).
- **BehaviorState** (type) — `interface BehaviorState { currentGoal: BehaviorGoal | null; currentActivity: 'idle' | 'walking' | 'eating' | 'drinking' | 'sleeping' | 'grooming' | 'hiding' | 'playing' | 'chewing' | 'interacting'; activityStartTime: number; lastDecisionTime: number; behaviorCooldowns: Map<BehaviorType, number> }`: Shape of the per-guinea-pig behavior state stored in the behaviorStateStore.

## Internal dependencies

- `../../stores/guineaPigStore`
- `../../stores/habitatConditions`
- `../../stores/loggingStore`
- `../../stores/behaviorStateStore`
- `../../composables/useHabitatContainers`
- `../../stores/suppliesStore`
- `./useMovement`
- `./usePathfinding`
- `./useSocialBehaviors`
- `../../utils/messageGenerator`
- `../../utils/locationDetection`
- `../../utils/pausableTimer`
- `../../data/guineaPigMessages`

## Notes

- Behavior state is centralized in behaviorStateStore keyed by guineaPigId, not local — multiple composable instances for the same ID share state.
- Interruptible behaviors (sleep, seek_shelter, hide) poll every 250ms and abort if `currentGoal.type` no longer matches, allowing external cancellation.
- Behaviors mutate DOM directly via `document.dispatchEvent(new CustomEvent('show-chat-bubble'))`, coupling AI logic to a UI listener.
- `cellSize = 60` in manual-control handling is hardcoded with a TODO to source it from habitat config.
- Item matching relies heavily on lowercase string keyword matching against item IDs (e.g. 'bowl', 'hay'+'rack', 'shelter'), which is fragile if IDs change.
- Friendship behaviors (popcorn/zoomies/watch_player/hide) use hardcoded Math.random() probabilities and only fire when the corresponding branch is evaluated per tick.
- `guineaPigStore` and `suppliesStore` are re-instantiated locally inside `selectBehaviorGoal` (social branch) and `checkAutonomousPooping` despite already being available in closure scope.
- `DEBUG_SOCIALIZE` and `DEBUG_BEHAVIOR` are compile-time constants; extensive console logging is gated behind them.
- Duration and need-restoration values (cooldowns, restore amounts, quality multipliers) are all hardcoded magic numbers throughout.
- `executeBehavior` is fired non-blocking from `tick`; errors reset the goal/activity to idle in a catch handler.
