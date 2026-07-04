---
source: src/composables/3d-models/containers/water-bottles.ts
source_hash: c166df4c300d15eb619fa2157c681c1030073a09fc474218a6063fdb917a794e
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Water Bottle 3D Model

`src/composables/3d-models/containers/water-bottles.ts`

> A composable module for creating and animating water bottle 3D models placed on habitat cage walls using Three.js. It builds the bottle geometry, computes wall/corner-aware rotations so the nozzle points inward, and provides bubble particle animations plus dynamic water-level updates.

## Rotation
`getWaterBottleRotation(gridX, gridY)` determines a bottle's Y-rotation from its grid position. It detects edges via `GRID_CONFIG.COLS`/`ROWS`. For corners it uses `atan2` toward world center (0,0); for straight edges it returns fixed angles (`-PI/2` top, `PI/2` bottom, `0` left, `PI` right).

## Model construction
`createWaterBottleModel()` returns a `THREE.Group` containing: a transparent bottle cylinder, an inner water cylinder (emissive glow), a green base bracket, and a horizontal metal nozzle. References for dynamic updates (`waterMesh`, `waterFullHeight`, `waterBaseY`) are stored in `group.userData`. It sets a default rotation (`-PI/4`) and offsets `position.x/z` to move the bottle inside the cage.

## Bubbles
Bubble state lives entirely in `group.userData` (`bubbles` array, `bubblesActive` flag). `createWaterBottleBubbles` lazily creates `BUBBLE_CONFIG.COUNT` sphere meshes with random size/position/speed, initially invisible. `startWaterBottleBubbles`/`stopWaterBottleBubbles` toggle visibility and the active flag. `updateWaterBottleBubbles(group, deltaTime)` rises bubbles per frame with sine/cosine wobble (driven by `Date.now()`), recycling them to `MIN_Y` when they exceed `MAX_Y`. Updates are skipped unless `bubblesActive`.

## Water level
`updateWaterBottleLevel(group, level)` clamps level 0–100, scales the water mesh height (`scale.y`, min 0.01 to avoid render issues), and repositions it so water stays anchored at the bottle bottom using stored `waterBaseY`/`waterFullHeight`.

## Exports

- **getWaterBottleRotation** (function) — `(gridX: number, gridY: number) => number`: Returns the Y-axis rotation (radians) for a water bottle so its nozzle points toward the habitat center, based on grid edge/corner position.
- **createWaterBottleModel** (function) — `() => THREE.Group`: Builds and returns the water bottle model group (bottle, water, bracket, nozzle) with water references and default rotation/position offsets stored.
- **createWaterBottleBubbles** (function) — `(waterBottleGroup: THREE.Group) => void`: Lazily creates hidden bubble particle meshes and stores them in group.userData; no-op if bubbles already exist.
- **startWaterBottleBubbles** (function) — `(waterBottleGroup: THREE.Group) => void`: Makes bubbles visible and sets bubblesActive true; creates bubbles first if none exist.
- **stopWaterBottleBubbles** (function) — `(waterBottleGroup: THREE.Group) => void`: Hides all bubbles and sets bubblesActive false; no-op if no bubbles.
- **updateWaterBottleBubbles** (function) — `(waterBottleGroup: THREE.Group, deltaTime: number) => void`: Per-frame update that rises and wobbles bubbles, recycling them at the top; skips when bubbles inactive or absent.
- **updateWaterBottleLevel** (function) — `(waterBottleGroup: THREE.Group, level: number) => void`: Scales and repositions the water mesh to display a 0-100 water level, clamped, keeping water anchored at the bottle base.

## Internal dependencies

- `three`
- `../../../constants/3d`

## Notes

- State (waterMesh, bubbles, bubblesActive, waterFullHeight, waterBaseY) is stored on the mutable THREE.Group.userData rather than typed fields; callers must pass the same group produced by createWaterBottleModel.
- Hardcoded edge indices in comments (13 cols, 9 rows) assume specific GRID_CONFIG values.
- Bubble wobble uses Date.now() directly, so motion is wall-clock dependent rather than deltaTime-scaled for the horizontal jitter.
- water mesh scale.y is floored at 0.01 to avoid rendering artifacts, so an empty bottle still shows a sliver of water.
- startWaterBottleBubbles re-reads userData.bubbles after potential creation; relies on createWaterBottleBubbles populating it synchronously.
