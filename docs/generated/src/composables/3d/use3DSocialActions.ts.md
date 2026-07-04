---
source: src/composables/3d/use3DSocialActions.ts
source_hash: 33339ea3bc7f225bb4cc95770adc2733c81c87ab188be8dc72bba33b3357e431
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# use3DSocialActions Composable

`src/composables/3d/use3DSocialActions.ts`

> A Vue composable that orchestrates animated social interactions between guinea pigs in a 3D scene. It bridges game-level social behavior logic with the 3D movement/animation system, currently implementing an "Approach Companion" action where one guinea pig walks up to another and both face each other before resuming autonomous behavior.

## State
The composable exposes a reactive `actionState` ref of type `SocialActionState` (`idle | approaching | waiting | interacting | complete`). It holds module-scoped (per-composable-instance) mutable references to two `use3DMovement` controllers (`initiatorMovement`, `partnerMovement`) and two optional `use3DBehavior` controllers (`initiatorBehavior`, `partnerBehavior`), all created/assigned per action and nulled on cleanup.

## Core flow (`executeApproach`)
1. Fetches both guinea pig states via `movement3DStore.getGuineaPigState`; aborts (returns `false`) if either is missing.
2. Stores optional behavior controllers, then creates fresh movement controllers via `use3DMovement(id)`.
3. Sets state to `approaching`, pauses the partner's behavior and stops its movement.
4. Computes an approach target with `getApproachTarget` (a point `APPROACH_OFFSET` = 3.0 units from the partner along the initiator→partner line; offsets sideways if already within 0.1 units), pauses the initiator behavior, and calls `moveTo`. If pathing fails, cleans up and returns `false`.
5. Awaits arrival via `initiatorMovement.onArrival`.
6. Sets state to `interacting`, computes facing rotations with `calculateFacingRotation` (`Math.atan2(dx, dz)`), and rotates both to face each other in parallel over 400ms.
7. Holds for `FACING_DURATION` (4000ms) via a `delay` promise.
8. Sets state `complete`, logs an autonomous behavior entry to `loggingStore`, cleans up, and returns `true`. Any thrown error is caught, logged, cleaned up, and returns `false`.

## Cleanup / control
`cleanup` resets state to `idle`, resumes and nulls behavior controllers, and cleans up and nulls movement controllers. `cancel` invokes cleanup only if an action is active. `isActionInProgress` returns true when state is neither `idle` nor `complete`.

## Exports

- **SocialActionState** (type) — `type SocialActionState = 'idle' | 'approaching' | 'waiting' | 'interacting' | 'complete'`: Union type enumerating the phases of a social action. Note 'waiting' is defined but never assigned in this file.
- **use3DSocialActions** (composable) — `use3DSocialActions(): { actionState: Ref<SocialActionState>, executeApproach, cancel, isActionInProgress }`: Main composable. Returns reactive `actionState`, `executeApproach(initiatorId, partnerId, initiatorName, partnerName, behaviorControllers?)` (Promise<boolean>), `cancel()`, and `isActionInProgress()`.

## Internal dependencies

- `vue`
- `../../stores/movement3DStore`
- `../../stores/loggingStore`
- `./use3DMovement`
- `../../types/movement3d`
- `./use3DBehavior`

## Notes

- `finalInitiatorPos`/`finalPartnerPos` reuse the same `worldPosition` object references captured earlier; since state objects are read live from the store this assumes those references reflect post-movement positions.
- The 'waiting' state in `SocialActionState` is never set anywhere in this file.
- Movement/behavior controller references are per-composable-instance closures, not reactive — running executeApproach twice concurrently would overwrite them and cause incorrect cleanup.
- Behavior controllers are optional; if omitted, no pause/resume occurs but movement still executes.
- Relies on `use3DMovement` exposing `moveTo`, `stopMovement`, `onArrival`, `rotateTo`, and `cleanup`, and `use3DBehavior` exposing `pause`/`resume`.
