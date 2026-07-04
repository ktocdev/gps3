---
source: src/composables/use3DGuineaPig.ts
source_hash: d750409c5f5830ace16b25d61ab8aa0dbd3c8579656c6e599c8a7bdd2398f3b9
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# use3DGuineaPig

`src/composables/use3DGuineaPig.ts`

> A Three.js helper module that procedurally builds a 3D guinea pig model from primitive geometries and drives its per-frame animations (breathing, blinking, walking, sleeping, grooming, playing, headbutting, chewing, and popcorning). It centralizes model construction, resource disposal, and animation state so scene code can create, animate, and clean up guinea pig meshes.

### Model construction
`createGuineaPigModel(colors?)` builds a `THREE.Group` composed of scaled sphere/capsule meshes: body, head, two ears, two eyes, nose, two mouth parts, and four feet. Colors come from the optional partial `GuineaPig3DColors` argument, falling back to `DEFAULT_GUINEA_PIG_COLORS`. Four shared materials are created (fur `MeshStandardMaterial`, ear, skin, and a glossy eye `MeshPhysicalMaterial`). Shadow flags are set on major parts.

References to key meshes and an `animation` state object are stashed on `group.userData`, including per-foot rest positions, blink timing seeded to a random 2–5s future time, and randomized `breathPhase`.

### Animation
`updateGuineaPigAnimation(...)` is called each frame with several boolean state flags and `deltaTime`. It reads meshes/state from `userData`, returns early if `animation` is missing or `isPaused` is true, and then handles mutually exclusive states via early returns in priority order: **sleeping → grooming → playing/headbutting → chewing → popcorning**. Each state manipulates eye scale, body/head rotation and scale, and foot positions (either driving custom motion or lerping feet back toward rest at `5 * deltaTime`).

If no special state applies, it smoothly resets any residual popcorn Y offset, applies subtle Y-axis breathing scale, eases body/head rotations back to zero, runs a time-based blink cycle (squash eyes for `BLINK_DURATION`, then schedule next blink), and runs a diagonal-pair ("trot") walk cycle when `isMoving`, otherwise lerps feet back to rest.

### Cleanup
`disposeGuineaPigModel(model)` delegates to `disposeObject3D` to free geometries/materials.

Module-level `const`s tune all animation magnitudes and speeds (blink, walk, breath, sleep, groom, play, chew, popcorn).

## Exports

- **GuineaPigColors** (type) — `type GuineaPigColors = GuineaPig3DColors`: Re-export alias of the `GuineaPig3DColors` type from constants for convenience.
- **createGuineaPigModel** (function) — `createGuineaPigModel(colors?: Partial<GuineaPig3DColors>): THREE.Group`: Builds and returns a guinea pig THREE.Group with mesh references and an animation state object stored on userData. Accepts optional partial color overrides (fur, ear, skin, eye).
- **disposeGuineaPigModel** (function) — `disposeGuineaPigModel(model: THREE.Group): void`: Disposes the model's geometries and materials via disposeObject3D.
- **updateGuineaPigAnimation** (function) — `updateGuineaPigAnimation(model: THREE.Group, isMoving: boolean, deltaTime: number, isPaused?: boolean, isSleeping?: boolean, isGrooming?: boolean, isPlaying?: boolean, isHeadbutting?: boolean, isChewing?: boolean, isPopcorning?: boolean): void`: Per-frame animation updater. Mutates the model's meshes based on the supplied state flags in a fixed priority order, driving breathing, blinking, walking, and specialized pose animations.

## Internal dependencies

- `three`
- `../utils/three-cleanup`
- `../constants/guineaPigColors`

## Notes

- Animation state and mesh references live entirely on `model.userData`; the group must be created by `createGuineaPigModel` or `updateGuineaPigAnimation` will silently no-op (returns if `animation` is falsy).
- State flags are mutually exclusive by early-return priority: sleeping > grooming > playing/headbutting > chewing > popcorning > normal. If multiple flags are true, only the highest-priority one runs.
- Blink timing uses `Date.now()` (wall clock), not `deltaTime`, so blink intervals are unaffected by frame rate but continue advancing even across pause gaps.
- When paused the function returns immediately, freezing all state without resetting poses.
- The four materials are shared across multiple meshes; disposing via `disposeObject3D` assumes it handles shared-material cleanup correctly.
- Popcorn animation writes to `model.position.y` directly and relies on the non-special-state branch to ease it back to ground.
