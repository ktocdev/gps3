---
source: src/composables/3d-models/use3DHand.ts
source_hash: 27ba7fd37791ad57ab11693bf13175bdec14857bad7dc8858645c037b80dca9a
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# use3DHand

`src/composables/3d-models/use3DHand.ts`

> A Three.js helper module that procedurally builds a cartoonish, Simpsons-style yellow 3D hand model and provides functions to animate its fingers, apply predefined poses, and dispose of its resources. It exists to give the app an interactive hand for user interactions (petting, holding, waving, etc.) with a guinea pig scene.

## Structure
The module constructs a hand as a `THREE.Group` composed of a puffy scaled-sphere palm, a chunky wrist, four fingers, and an angled thumb, all sharing one `MeshStandardMaterial` in Simpsons yellow (`0xffd90f`).

### Finger construction
`createFinger` builds a 2-segment stubby finger using nested groups named `joint0`, `joint1`, `joint2`, each holding a scaled sphere segment. `createThumb` similarly builds a 2-joint thumb (`joint0`, `joint1`). Nesting the joints allows cumulative rotation for curling.

### Assembly
`createHandModel` positions four fingers along the palm front edge (with per-finger X positions and radii), names them, adds an angled thumb, and stores references plus an `animation` state object on `hand.userData` (typed as `Hand3DUserData`).

### Animation
Curl functions rotate joint groups around the X axis: `curlFinger` iterates joints 0–2 with decreasing curl per joint (`amount * (1 - i*0.15)`, max `PI/2.5`); `curlThumb` rotates its two joints (max `PI/3`, joint1 at 70%). `updateHandAnimation` reads `userData.animation` and applies all finger/thumb curls plus a subtle Y-axis finger spread. `setHandPose` mutates the animation state to one of seven named presets then calls `updateHandAnimation`.

### Cleanup
`disposeHand` traverses all meshes disposing geometries and materials.

## Data flow
State lives entirely on `hand.userData.animation`. Callers set poses or mutate curl values, then rendering reflects joint rotations after `updateHandAnimation` runs.

## Exports

- **Hand3DParts** (type) — `interface Hand3DParts { palm, thumb, indexFinger, middleFinger, ringFinger, pinkyFinger, wrist }`: References to the hand's mesh/group parts stored for animation.
- **Hand3DUserData** (type) — `interface Hand3DUserData { parts: Hand3DParts; animation: { thumbCurl, indexCurl, middleCurl, ringCurl, pinkyCurl, fingerSpread: number } }`: Shape of the object stored on the hand group's userData, containing part refs and mutable animation curl/spread values.
- **createHandModel** (function) — `createHandModel(): THREE.Group`: Builds and returns the complete hand group with fingers pointing +Z, part references and initial animation state on userData.
- **curlFinger** (function) — `curlFinger(finger: THREE.Group, amount: number): void`: Rotates a finger's joint0/1/2 to curl it; amount 0 (straight) to 1 (fully curled), max curl PI/2.5, decreasing per joint.
- **curlThumb** (function) — `curlThumb(thumb: THREE.Group, amount: number): void`: Rotates the thumb's joint0 and joint1 (joint1 at 70%) to curl it; max PI/3 per joint.
- **updateHandAnimation** (function) — `updateHandAnimation(hand: THREE.Group): void`: Reads hand.userData.animation and applies all finger/thumb curls plus Y-axis finger spread. No-op if userData.parts missing.
- **setHandPose** (function) — `setHandPose(hand: THREE.Group, pose: 'open' | 'closed' | 'pointing' | 'petting' | 'holding' | 'wave' | 'gripping'): void`: Sets animation state to a named preset and applies it via updateHandAnimation. No-op if userData.animation missing.
- **disposeHand** (function) — `disposeHand(hand: THREE.Group): void`: Traverses the hand and disposes all mesh geometries and materials.

## Internal dependencies

- `three`

## Notes

- The hand is a plain Three.js utility module, not a Vue composable, despite the `use3DHand`/composables path naming.
- All parts share a single MeshStandardMaterial instance; disposeHand disposes it per-mesh (dispose is idempotent so repeated calls are safe).
- Animation state is mutable and stored on hand.userData; callers must call updateHandAnimation (or setHandPose) after changing curl values to see changes.
- Joint group nesting means joint rotations accumulate hierarchically (joint1 inside joint0, etc.).
- Functions rely on named child objects (joint0/joint1/joint2, palm, wrist, finger names); renaming would break animation lookups.
