---
source: src/composables/3d/use3DChatBubbles.ts
source_hash: 8ee63b4079ff1c2cffa492b111f81d7e9545cde756b0350576805640740e655e
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# use3DChatBubbles

`src/composables/3d/use3DChatBubbles.ts`

> A Vue composable that manages chat bubble display for guinea pigs in the 3D view. It listens for custom chat-bubble events, tracks active bubbles per guinea pig, and projects their 3D world positions to 2D screen coordinates so an HTML overlay can render crisp text bubbles above each guinea pig's head.

## State
Maintains a reactive `activeBubbles` `Map<string, ChatBubble3D>` keyed by guinea pig ID. Module-scoped `camera`, `guineaPigModels`, and `canvas` references are set via `init()` (not reactive; stored as closure variables).

## Lifecycle
`init(camera, models, canvas)` stores the Three.js references and registers a document-level `show-chat-bubble` event listener. `dispose()` removes the listener, clears bubbles, and nulls out references.

## Data flow
The `show-chat-bubble` CustomEvent carries `{ guineaPigId, reaction }`. `handleShowChatBubble` delegates to `showBubble`, which builds a `ChatBubble3D` (message, emoji, variant, expiresAt), replaces any existing bubble for that guinea pig in the map, and schedules a `setTimeout` auto-dismiss after `reaction.duration` (or `DEFAULT_DURATION` of 3000ms).

## Positioning
`updatePositions()` is intended to run every animation frame. It removes expired bubbles, looks up each guinea pig's `THREE.Group` model, computes its world position with a `+3.5` Y offset (above the head), and calls `worldToScreen` to project into pixel coordinates. `worldToScreen` clones the vector, calls `project(camera)`, treats `z > 1` as behind-camera, and maps normalized device coordinates to canvas client pixels. Bubble `screenPosition` and `isVisible` (false when behind camera or model missing) are updated in place.

## Output
`getBubbles()` returns the bubbles as an array for rendering; `activeBubbles` is exposed as a readonly ref.

## Exports

- **use3DChatBubbles** (composable) — `use3DChatBubbles(): { activeBubbles, init, dispose, showBubble, dismissBubble, updatePositions, getBubbles }`: Main composable. Returns readonly `activeBubbles` ref plus `init(camera, models, canvas)`, `dispose()`, `showBubble(guineaPigId, reaction)`, `dismissBubble(guineaPigId)`, `updatePositions()`, and `getBubbles()`.
- **ChatBubble3D** (type) — `interface ChatBubble3D { guineaPigId, message, emoji?, variant, expiresAt, screenPosition: {x,y}, isVisible }`: Shape of an active chat bubble, including projected screen position and visibility flag. `variant` is one of 'positive' | 'neutral' | 'negative' | 'warning' | 'critical'.

## Internal dependencies

- `vue`
- `three`
- `../../data/guineaPigMessages`

## Notes

- `init()` registers a global document event listener for 'show-chat-bubble'; failing to call `dispose()` leaks the listener.
- `camera`, `guineaPigModels`, and `canvas` are plain closure variables set only by `init()`; calling projection functions before init returns default off-screen/behind-camera values.
- Bubbles are auto-dismissed via setTimeout in showBubble AND expired-checked in updatePositions, so expiry is handled by two independent mechanisms.
- Mutating `bubble.screenPosition`/`isVisible` in updatePositions mutates map values in place; because activeBubbles is exposed readonly, consumers should not mutate but can read reactive updates.
- `updatePositions` must be called each frame from the render loop for positions to stay accurate.
