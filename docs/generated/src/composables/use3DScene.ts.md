---
source: src/composables/use3DScene.ts
source_hash: 2a9fd1b94fedb1b3f59f167776513a3c890182efd55827df296f651c51c560bf
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# use3DScene composable

`src/composables/use3DScene.ts`

> A Vue composable that constructs and manages a Three.js scene, camera, lighting, world group, and WebGL renderer bound to a canvas element. It centralizes the setup of a 3D scene graph and provides lifecycle helpers for rendering, resizing, and disposing resources.

On invocation, the composable immediately creates a `THREE.Scene` with a sky-colored background and fog, a `PerspectiveCamera` positioned per `CAMERA_CONFIG` and looking at the origin, and an empty `worldGroup` (`THREE.Group`) added to the scene to allow rotating world content independently.

Three lights are added: an `AmbientLight`, a shadow-casting `DirectionalLight` (with configured shadow map size and orthographic shadow-camera bounds), and a non-shadow `backLight`. All values come from `SCENE_COLORS` and `LIGHTING_CONFIG` constants.

The renderer is created lazily via `initRenderer()`, which reads the canvas from `canvasRef`, sizes the renderer to the canvas client dimensions (without setting CSS style), enables PCF soft shadow mapping and local clipping, and updates the camera aspect. `handleResize()` recomputes camera aspect and renderer size from current canvas dimensions. `cleanup()` disposes the scene and renderer via the imported cleanup utilities and nulls the renderer reference. The renderer is held in a closure variable and exposed through `getRenderer()`.

## Exports

- **use3DScene** (composable) — `use3DScene(canvasRef: Ref<HTMLCanvasElement | null>): { scene, camera, worldGroup, initRenderer, handleResize, cleanup, getRenderer }`: Sets up a Three.js scene and returns: `scene` (THREE.Scene), `camera` (PerspectiveCamera), `worldGroup` (THREE.Group added to scene), `initRenderer()` (creates and returns the WebGLRenderer or null if no canvas), `handleResize()` (updates camera aspect and renderer size), `cleanup()` (disposes scene and renderer), and `getRenderer()` (returns the current renderer or null).

## Internal dependencies

- `three`
- `../constants/3d`
- `../utils/three-cleanup`

## Notes

- The renderer is not created until `initRenderer()` is called; `getRenderer()` returns null before then and after `cleanup()`.
- `initRenderer()` and `handleResize()` return/no-op silently if `canvasRef.value` is null.
- Camera aspect is initialized to 1 and only corrected once `initRenderer()` runs.
- `setSize(..., false)` avoids updating the canvas CSS style, so canvas sizing is expected to be controlled externally.
- No animation/render loop is provided here; callers must invoke rendering themselves.
