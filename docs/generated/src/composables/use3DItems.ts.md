---
source: src/composables/use3DItems.ts
source_hash: 3ca2e96a53df7afb794823e6c0f7b78288b06c716355eaee671d1e61ce626157
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# use3DItems

`src/composables/use3DItems.ts`

> A Vue composable that synchronizes the habitat's placed items (from the habitat conditions store) with a Three.js 3D scene. It creates, positions, updates, and disposes item models within a given world group, and wires up physics for applicable items.

## Setup
Called with a `THREE.Group` (`worldGroup`). Instantiates the `useHabitatConditions` store and `use3DPhysics`. Maintains an internal `itemModels` `Map<string, THREE.Group>` registry keyed by placement ID, and an array of watcher stop handles (`stopWatchers`).

## Physics detection
`shouldHavePhysics(placementId)` lowercases the base item ID and returns `'ball'`, `'stick'` (for stick/chew), or `null`. `initializePhysicsForItem` calls this and, when a preset exists, finds the first Mesh child as the visual and registers it with `physics3D.initializePhysicsItem`.

## Position watcher (immediate, deep)
Watches `habitatConditions.itemPositions`. For each positioned placement ID not already in the registry, it creates a model via `createItemModel`, stores its creation-time offsets and base itemId in `userData`, adds it to `worldGroup`, and initializes physics. It then updates positions using `gridToWorld` plus the stored creation offsets (Y is set absolutely, X/Z are additive) to avoid compounding offsets across watcher runs. Water bottles (base ID contains 'bottle') get a smart Y rotation via `getWaterBottleRotation`. Models whose IDs are no longer positioned are removed: physics removed, object disposed, removed from group and registry.

## Content watchers (deep)
Two watchers observe `bowlContents` and `hayRackContents`. On change, they iterate the registry, find matching models (base ID contains 'bowl', or contains both 'hay' and 'rack'), dispose the old model, recreate it with updated contents via `createItemModel`, reapply offsets/position, and re-add to the scene and registry.

## Cleanup
`cleanup()` stops all watchers, calls `physics3D.cleanup()`, disposes all models, removes them from the group, and clears the registry.

## Exports

- **use3DItems** (composable) — `use3DItems(worldGroup: THREE.Group): { itemModels: Map<string, THREE.Group>, physics3D, cleanup: () => void }`: Composable that syncs habitat store items with the 3D scene. Returns the model registry (`itemModels`), the physics instance (`physics3D`), and a `cleanup` function to stop watchers and dispose all models/physics.

## Internal dependencies

- `vue`
- `three`
- `../stores/habitatConditions`
- `../utils/three-cleanup`
- `./3d-models`
- `./3d/use3DPhysics`
- `../utils/placementId`

## Notes

- Creation-time position offsets are cached in `model.userData` (creationOffsetX/Y/Z) so repeated watcher runs don't compound; Y is applied absolutely while X/Z are added to world position.
- Item type detection relies on string matching against the lowercased/base placement ID (e.g., contains 'ball', 'bottle', 'bowl', 'hay'+'rack'), which is fragile to naming changes.
- Bowl and hay rack content changes fully dispose and recreate models rather than mutating them.
- `cleanup` must be called by the caller to avoid leaked watchers and undisposed Three.js resources.
