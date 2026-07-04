---
source: src/composables/3d/use3DBehavior.ts
source_hash: ba5a60dc17912c66689d02e5f1c8f5a33b024ef1c7b00ffe27a166d09910910b
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# use3DBehavior

`src/composables/3d/use3DBehavior.ts`

> A composable that implements the priority-based autonomous behavior system for a single guinea pig in the 3D environment. It periodically evaluates all of the guinea pig's needs (hunger, thirst, shelter, energy, hygiene, play, chew, social), selects the highest-priority goal, and drives a single movement controller to execute the chosen behavior with animation callbacks and need restoration.

### Structure
The factory function `use3DBehavior(guineaPigId)` wires together multiple Pinia stores (movement3D, guineaPig, habitatConditions, supplies, gameController, logging), the `useHabitatContainers` composable, `use3DSocialActions`, and a per-guinea-pig `use3DMovement` controller.

### State
- `currentActivity` (ref): current animation/activity state (`idle`, `walking`, `eating`, etc.).
- `currentGoal` (ref): the active `Behavior3DGoal`.
- `behaviorCooldowns` (Map): tracks per-behavior cooldown expiry timestamps.
- Module-scoped locals for interval/timeout handles, shelter/sleep positions, current toy/chew item IDs, and numerous nullable callback references.

### Decision flow
`tick()` runs every `BEHAVIOR_TICK_INTERVAL` (2s). It skips when game is paused, handles autonomous pooping, refuses to interrupt in-progress non-interruptible activities, and returns early if the guinea pig is already moving. Otherwise `selectBehaviorGoal()` builds candidate goals for each need below its `THRESHOLDS` value (respecting cooldowns and item availability), computes urgency-weighted priorities via `calculateNeedPriority`, sorts descending, and adds randomness among goals within 15 priority points. Wander (priority 25) is the fallback.

### Execution
`executeBehavior` dispatches to per-behavior functions. Each behavior typically: sets activity to `walking`, calls `movement.moveTo`/`moveDirectTo`, registers `movement.onArrival`, then runs a timed action (`actionTimeout`) that restores the relevant need via `guineaPigStore.satisfyNeed`, sets a cooldown, logs via `loggingStore.addAutonomousBehavior`, fires callbacks, and re-triggers `tick()`. Special sequences include: eating/hay consumption from bowls/racks, water consumption, shelter enter/exit with left/right slot selection, sleep with quality/duration multipliers and shelter-sleep handling, play with headbutt physics then popcorning, chew with durability degradation, and socialize using async `socialActions.executeApproach`.

### Lifecycle
`start()`/`stop()` manage the interval and cleanup; `pause()`/`resume()` proxy to movement. `onUnmounted` auto-calls `stop()`. Many `on*` setters register external animation callbacks.

## Exports

- **use3DBehavior** (composable) — `use3DBehavior(guineaPigId: string): { start, stop, pause, resume, tick, currentActivity, currentGoal, ...on* callbacks }`: Main composable returning behavior loop controls (start/stop/pause/resume/tick), reactive refs (currentActivity, currentGoal), and a set of callback registration functions for animation/UI hooks (onEatingStart/End, onDrinkingStart/End, onShelteringStart/End, onSleepingStart/End, onGroomingStart/End, onPlayingStart/End, onHeadbutt, onPopcornStart/End, onChewingStart/End, onSocializingStart/End).
- **Behavior3DType** (type) — `type Behavior3DType = 'eat' | 'drink' | 'seek_shelter' | 'sleep' | 'groom' | 'play' | 'chew' | 'socialize' | 'wander'`: Union of supported behavior goal types.
- **Behavior3DGoal** (type) — `interface Behavior3DGoal { type; target; priority; estimatedDuration; needSatisfied?; targetItemId?; sourceType?; socialMetadata? }`: Structure describing a selected behavior goal including target position, priority, and optional metadata for food source, item, or social partner.
- **Activity3DType** (type) — `type Activity3DType = 'idle' | 'walking' | 'eating' | 'drinking' | 'sheltering' | 'sleeping' | 'grooming' | 'playing' | 'chewing' | 'popcorning' | 'socializing'`: Union of activity/animation states used for UI and animation.

## Internal dependencies

- `../../stores/movement3DStore`
- `../../stores/guineaPigStore`
- `../../stores/habitatConditions`
- `../../stores/suppliesStore`
- `../../stores/gameController`
- `../../stores/loggingStore`
- `../useHabitatContainers`
- `./use3DMovement`
- `./use3DSocialActions`
- `../../types/movement3d`

## Notes

- A single shared `actionTimeout` handle is reused across all timed behaviors; overlapping behaviors are prevented by the activity-guard in `tick()`, but only the most recently set timeout is tracked/cleared in `stop()`.
- Non-interruptible activities (eating, drinking, sheltering, sleeping, grooming, playing, chewing, popcorning, socializing) cause `tick()` to return early, so behaviors self-perpetuate by calling `tick()` on completion.
- Item detection relies heavily on string matching of item IDs (e.g. includes 'igloo', 'bed', 'ball', 'stick') in addition to `stats.itemType`/`subCategory`, which is fragile to naming.
- `checkAutonomousPooping` mutates `gp.lastPoopTime` directly and adds a negative random offset to desync multiple guinea pigs.
- Shelter side selection uses a fixed SHELTER_RADIUS (3.5) proximity check to decide left/right slots; module-level shelter/sleep position vars are shared and cleared after use.
- Social behavior is async via `socialActions.executeApproach` and does not pass behavior controllers (relies on currentActivity state to self-pause).
- Sleep quality/duration are computed via multipliers capped at 1.85x and 15s respectively; grooming duration/restore scale with the guinea pig's personality cleanliness trait.
- `onUnmounted` auto-stops the loop, so the composable must be used within a component setup context.
