---
source: src/composables/3d/use3DInteractions.ts
source_hash: d88acb51e2e05009c7a02c8b4b9e12ac89af11dfe29f843bde72979426f6d78b
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# use3DInteractions

`src/composables/3d/use3DInteractions.ts`

> A Vue composable that manages 3D interaction animations (petting and hand feeding) for guinea pigs in the 3D scene. It creates and animates a 3D hand model that descends onto a guinea pig, performs the interaction, and applies gameplay effects (needs, friendship, inventory consumption, chat bubbles, and logging) upon completion.

### State
Uses reactive refs `isPetting`, `isHandFeeding`, and `targetGuineaPigId` for UI binding, plus non-reactive module-scoped state for the THREE.Scene reference, the guinea pig model map, the interaction hand `THREE.Group`, animation start timestamps, held food mesh/id, and an `onAnimationComplete` callback.

### Lifecycle
`init(sceneRef, gpModels, onComplete?)` stores references, creates the hand model via `createHandModel`, sets it to 'petting' pose, positions it offscreen (y=25) and hidden, and adds it to the scene. `dispose()` removes/disposes any held food mesh and the interaction hand, and nulls out references.

### Petting flow
`startPetting(id)` positions the hand above the target's world position and begins the timed animation (`PETTING_DURATION` ~3.1s). `updatePetting()` runs each frame with three phases based on progress: descend (0-0.3, ease out), petting stroke with sinusoidal back-and-forth + finger curl animation (0.3-0.8), and rise (0.8-1, ease in). `finishPetting()` applies effects: satisfies 'social' +25, friendship +2, updates interaction tracking, shows a wellness-tiered success chat bubble, and logs the action.

### Hand feed flow
`startHandFeed(id, foodId)` creates a colored food ball (via `createHeldFoodBall`, color from supplies metadata) attached to the hand at fingertips, sets 'gripping' pose, and begins the `HAND_FEED_DURATION` (2.5s) animation. `updateHandFeed()` phases: descend (0-0.35), linger/bob (0.35-0.75), then hides the food and rises (0.75-1). `finishHandFeed()` applies hunger +10, social +15, friendship +3, updates tracking, consumes the food from inventory (serving vs. whole item), shows a wellness-tiered neutral feeding chat bubble, and logs.

### Combined update
`update()` dispatches to `updatePetting`/`updateHandFeed` based on active state; it should be called each animation frame.

### Helpers
Module-level `getWellnessTier`, `showChatBubble` (dispatches a `show-chat-bubble` CustomEvent on `document`), and `getRandomMessage`.

## Exports

- **use3DInteractions** (composable) — `use3DInteractions(): { isPetting, isHandFeeding, targetGuineaPigId, init, dispose, isAnimating, getTargetId, startPetting, startHandFeed, update }`: Returns reactive state refs (isPetting, isHandFeeding, targetGuineaPigId), lifecycle methods init(scene, gpModels, onComplete?) and dispose(), query methods isAnimating() and getTargetId(), interaction starters startPetting(id) and startHandFeed(id, foodId) (both return boolean success), and update() to be called each frame.

## Internal dependencies

- `../3d-models/use3DHand`
- `../3d-models/food/held-food`
- `../../utils/three-cleanup`
- `../../stores/guineaPigStore`
- `../../stores/suppliesStore`
- `../../stores/inventoryStore`
- `../../stores/loggingStore`
- `../../stores/needsController`
- `../../data/guineaPigMessages`
- `three`
- `vue`

## Notes

- Only one animation can run at a time — startPetting/startHandFeed return false if isAnimating() is true.
- Communicates chat bubble reactions via a document-level CustomEvent ('show-chat-bubble'), coupling it to a listener elsewhere.
- init() must be called before starting animations; the hand, scene, and guineaPigModels references are required and otherwise starters bail out.
- Directly mutates guinea pig objects (lastInteraction, totalInteractions) in addition to using store methods.
- Uses Date.now() elapsed timing, not frame deltas, so animation speed is wall-clock based.
- Inventory consumption logic branches on whether the first instance has servingsRemaining defined.
