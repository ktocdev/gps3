---
source: src/components/debug/prototypes/ModelViewerDebug.vue
source_hash: b94d5eae8bf94ff7138a8bd8bce2054868a51e4056f28779b7e0dab7bae292ac
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# ModelViewerDebug.vue

`src/components/debug/prototypes/ModelViewerDebug.vue`

> A debug/prototype Vue component that renders an interactive 3D viewer using THREE.js for previewing all the game's procedurally-generated 3D models (guinea pig, hands, food, containers, shelters, toys). It provides a categorized model selection panel, orbit-style camera controls, and per-model positioning so developers can inspect each model factory in isolation.

## Structure
The template wraps everything in a `DebugPanel` containing a canvas wrapper. A `SidePanel3D` on the right lists model categories via `Details` accordions, each rendering clickable buttons for its models. Overlays show current model info (top-left) and a controls help legend (bottom). The `<canvas>` is bound via `canvasRef`.

## Model registry
`modelRegistry` is a static array of `ModelCategory` objects, each holding `ModelDefinition`s with an `id`, `name`, optional `description`, and a `factory()` returning a `THREE.Group`. Factories delegate to imported 3D-model composables. Categories: characters, food, containers, shelters, toys.

## Reactive state
- `canvasRef` — canvas element ref
- `selectedModelId` — currently displayed model id (default `'guinea-pig'`)
- `showModelPanel` — side panel open toggle (default true)
- `currentModelInfo` — computed lookup of the selected model definition

THREE.js objects (`scene`, `camera`, `renderer`, `worldGroup`, `currentModel`, `animationFrameId`, `cleanupControls`) are module-scoped non-reactive `let` variables.

## Scene lifecycle
`onMounted` calls `initScene()`, which builds a sky-blue scene, a perspective camera positioned via `VIEWER_CONFIG`, a shadow-enabled WebGLRenderer, a `worldGroup`, lighting (`setupLighting`), a circular ground + grid helper (`setupGround`), camera controls (`setupCameraControls`), loads the default model, and starts `animate()`.

## Controls
`setupCameraControls` wires mouse (drag=rotate worldGroup, shift+drag=pan, wheel=zoom height clamped, R=reset) and touch gestures (one finger rotate, two finger pinch-zoom + pan). It returns a cleanup function stored in `cleanupControls`.

## Model loading
`loadModel(modelId)` disposes and removes the current model, finds its definition, runs the factory, applies per-model position/rotation overrides (special cases for hands, ball, stick, cucumber, carrot, pellets, lettuce), adds it to `worldGroup`, and updates `selectedModelId`. `selectModel` is the UI wrapper.

## Render & cleanup
`animate` runs a rAF loop, computes deltaTime, updates guinea pig animation when selected, calls `camera.lookAt`, and renders. `handleResize` updates aspect/size. `onUnmounted` cancels the loop, cleans controls, disposes the model and renderer, and removes the resize listener.

## Exports

- **ModelViewerDebug** (component) — `<ModelViewerDebug />`: Default SFC export. Takes no props and emits no events. Self-contained 3D model preview panel with internal state for selection and camera.

## Internal dependencies

- `../../basic/Details.vue`
- `../ui/DebugPanel.vue`
- `../../game/SidePanel3D.vue`
- `../../../composables/use3DGuineaPig`
- `../../../composables/3d-models/use3DHand`
- `../../../composables/3d-models/food/vegetables`
- `../../../composables/3d-models/food/pellets`
- `../../../composables/3d-models/food/greens`
- `../../../composables/3d-models/food/held-food`
- `../../../composables/3d-models/food/hay`
- `../../../composables/3d-models/containers/bowls`
- `../../../composables/3d-models/containers/water-bottles`
- `../../../composables/3d-models/containers/hay-racks`
- `../../../composables/3d-models/shelters/igloos`
- `../../../composables/3d-models/shelters/tunnels`
- `../../../composables/3d-models/toys/chew-toys`
- `three`

## Notes

- THREE.js state (scene/camera/renderer/etc.) is stored in module-level `let` variables rather than refs, so multiple simultaneous instances of this component would clash and overwrite each other's scene references.
- `mousemove`/`mouseup`/`keydown` listeners are attached to `document`, not the canvas; only removed via the returned cleanup function in `onUnmounted`.
- Per-model position/rotation overrides in `loadModel` are hardcoded by id; the `'ball'`/`'stick'` branches use raw ids but the toy factory ids are `'ball'`/`'stick'` (matching), while `disposeObject3D` only disposes meshes it can traverse.
- `animate` uses a module-scoped `lastTime` and only animates the guinea pig model; other models are static.
- Touch listeners are registered as `passive: true` but `handleTouchMove` performs camera manipulation without needing preventDefault; `touch-action: none` CSS handles scroll prevention. The wheel listener is `passive: false` to allow `preventDefault`.
- Model position offsets contain comments referencing bowl alignment even though bowls aren't shown alongside, indicating values copied from the main game scene.
