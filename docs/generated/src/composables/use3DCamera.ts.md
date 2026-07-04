---
source: src/composables/use3DCamera.ts
source_hash: 1cb9d70a5666f5fa07451144cff3a5b1dc5547f2bd396637eb6139a862f7a3fd
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# use3DCamera composable

`src/composables/use3DCamera.ts`

> A Vue composable that wires up interactive camera controls for a Three.js scene. It manages mouse drag/pan/rotate, scroll zoom, keyboard navigation (WASD/arrows/Z-X/Q-E/R), and touch gestures (single-finger rotate, two-finger pinch-zoom and pan), mutating a PerspectiveCamera's position and a world Group's rotation within configured boundaries.

## State
`controls` is a `ref<CameraControls>` tracking drag state, previous mouse position, pressed keys, hover state, and two-finger gesture data (pinch distance, touch center).

## Input handlers
- **Mouse**: `handleMouseDown/Move/Up` — regular drag rotates `worldGroup` on Y; Shift+drag pans camera X/Z (clamped to bounds).
- **Wheel**: `handleWheel` only zooms (adjusts `camera.position.y`) when `isHovering`, calling `preventDefault` to block page scroll.
- **Hover**: `handleMouseEnter/Leave` toggle `isHovering`.
- **Keyboard**: `handleKeyDown/Up` record pressed keys by both `key.toLowerCase()` and `code`; keydown prevents default for a set of scroll/navigation keys when hovering.
- **Touch**: `handleTouchStart/Move/End` distinguish single-finger rotate from two-finger pinch-zoom + drag-to-pan using `getTouchDistance` and `getTouchCenter` helpers.

## Per-frame update
`updateCameraPosition()` must be called each frame (e.g. render loop). It applies WASD movement (always), arrow-key movement (unless `options.disableArrowKeys()` returns true), Z/X vertical, Q/E and comma/period rotation, and R to reset camera to `INITIAL_POSITION` (self-clearing the 'r' key). It then clamps camera X/Y/Z to bounds and applies a `lookAt` with a height-dependent tilt offset.

## Lifecycle
`init()` is called automatically on creation, attaching listeners (mouse/wheel on canvas, mousemove/up and keyboard on document, touch on canvas). Wheel is non-passive; touch listeners are passive. `cleanup()` removes all listeners. All magic numbers come from `CAMERA_CONFIG`.

## Exports

- **CameraControls** (type) — `interface CameraControls { isDragging; previousMousePosition; keysPressed; isHovering; isTwoFingerGesture; initialPinchDistance; previousTouchCenter }`: Shape of the reactive control state managed by the composable.
- **use3DCamera** (composable) — `use3DCamera(camera: THREE.PerspectiveCamera, worldGroup: THREE.Group, canvasElement: HTMLCanvasElement, options?: { disableArrowKeys?: () => boolean }): { controls, updateCameraPosition, cleanup }`: Sets up and auto-initializes interactive camera controls. Returns the reactive `controls` ref, `updateCameraPosition` (call each frame), and `cleanup` to remove listeners. Optional `disableArrowKeys` callback gates arrow-key panning.

## Internal dependencies

- `vue`
- `three`
- `../constants/3d`

## Notes

- Calls `init()` automatically on invocation, immediately attaching global document listeners (mousemove, mouseup, keydown, keyup) — caller must invoke `cleanup()` to avoid leaks/duplicate listeners.
- `updateCameraPosition` is not called internally; the consumer must call it every animation frame for keyboard controls to take effect.
- Wheel listener is registered non-passive to allow `preventDefault`; touch listeners are passive, so touch handlers cannot preventDefault.
- Directly mutates the passed-in `camera` and `worldGroup` objects as side effects.
- Since touch is passive, page scrolling is not prevented during touch gestures.
- The 'r' reset key self-clears to prevent continuous reset while held.
