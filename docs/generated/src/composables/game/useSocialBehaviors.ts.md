---
source: src/composables/game/useSocialBehaviors.ts
source_hash: 72ad71aef4c78f7fa281e194b9ff80eb1c699f6fe3f05923fd9f8e3810296043
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# useSocialBehaviors

`src/composables/game/useSocialBehaviors.ts`

> A Vue composable (System 21: Social Bonding System) that implements social interaction behaviors between two guinea pigs. Each behavior handles movement/pathfinding, animation timing via delays, chat bubble events, need satisfaction, and bonding adjustments, coordinating across the guinea pig, habitat, logging, and behavior state stores.

## Structure
The composable instantiates references to `useGuineaPigStore`, `useHabitatConditions`, `useLoggingStore`, `useBehaviorStateStore`, and `usePathfinding`, then defines helper functions and behavior functions before returning them.

## Helpers
- `areGuineaPigsNear` computes Euclidean distance between two guinea pig positions and compares to `maxDistance` (default 2).
- `getMidpoint` returns floored midpoint of two positions.
- `delay` wraps `setTimeout` in a promise for timing.
- `moveToPosition` converts x/y positions to row/col, runs `findPath`, and (currently) teleports the guinea pig by directly setting `habitatConditions.guineaPigPositions`, recording a 'movement' activity.

## Behaviors
Ten async behavior functions each: (1) optionally check tier/personality gates, (2) log a player-action or autonomous message, (3) move guinea pigs (often in parallel via `Promise.all`), (4) dynamically import `guineaPigMessages` and dispatch staggered `show-chat-bubble` CustomEvents on `document`, (5) `await delay` for pacing, (6) satisfy needs, and (7) call `increaseBonding` (or negative for kick). Gates: `groomPartner`/`followCompanion` require non-neutral tier (follow also checks friendliness for 'friends'); `inspectCompanion` requires curiosity ≥ 5; `kickCompanion` only runs in 'neutral' tier with boldness ≥ 8 or friendliness ≤ 3 and a probabilistic roll. `sleepTogether` moves both to the exact same position and holds a 'sleeping' state for 8s to allow autonomous sleep bonding. `exploreTogether` uses hardcoded 14x10 grid dimensions.

## Data flow
Behaviors read positions/items from `habitatConditions`, drive UI via DOM CustomEvents and `behaviorStateStore.updateBehaviorState`/`triggerPlayerInteraction`, mutate needs/bonds via `guineaPigStore`, and emit feed messages via `loggingStore`.

## Exports

- **useSocialBehaviors** (composable) — `useSocialBehaviors(): { areGuineaPigsNear, getMidpoint, approachCompanion, groomPartner, playTogether, shareFood, sleepTogether, exploreTogether, greetCompanion, inspectCompanion, followCompanion, kickCompanion }`: Returns proximity helpers and ten async social behavior functions. Behaviors take (initiator/gp1, partner/gp2, bond: ActiveBond) and some extra args (shareFood accepts optional foodItemId). Each returns Promise<boolean> indicating success/eligibility.

## Internal dependencies

- `../../stores/guineaPigStore`
- `../../stores/habitatConditions`
- `../../stores/loggingStore`
- `./usePathfinding`
- `../../stores/behaviorStateStore`
- `../../data/guineaPigMessages`

## Notes

- `moveToPosition` does not animate; it directly mutates `habitatConditions.guineaPigPositions` (teleport) — a TODO notes System 18 animated movement is not integrated.
- Chat bubbles rely on dispatching `show-chat-bubble` CustomEvents on `document`; consumers must listen on the DOM. This couples the composable to a browser environment.
- `guineaPigMessages` is dynamically imported inside nearly every behavior (repeated `await import`).
- `exploreTogether` hardcodes grid dimensions (14x10) rather than reading actual habitat size (TODO noted).
- Tier/personality gates cause early `return false` without any side effects; callers must handle the false case.
- `kickCompanion` is probabilistic and negative-bonding; it reduces the target's comfort via `adjustNeed`.
- The file header comments describe '9 social interactions' but the code implements ten behavior functions (numbered 1-10), including exploreTogether noted as autonomous-only.
