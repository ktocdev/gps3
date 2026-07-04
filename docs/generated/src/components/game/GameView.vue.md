---
source: src/components/game/GameView.vue
source_hash: 507f1094e9d00e05a2f422a1d436caf5dc8805db66de9a7cd39af46b3fb1d274
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# GameView.vue

`src/components/game/GameView.vue`

> The primary 3D game view component for the guinea pig simulator. It renders the Three.js canvas, orchestrates the 3D scene (guinea pig models, habitat items, environment, clouds), and wires together the many overlay UI menus/dialogs and interaction handlers (player→guinea-pig interactions, guinea-pig→guinea-pig social actions, container/water/chew/item management, habitat care, placement mode, and take-control mode).

## Rendering
The template mounts a `<canvas>` (with `data-tutorial="cage"`) inside `.game-view__canvas-wrapper`, optionally topped by `SimTopBar` (gated by the `chrome` prop). It overlays a `ParchmentBanner` for targeting/placement instructions, many popover/menu components (`GuineaPigInfoMenu`, `ContainerContentsMenu`, `InventoryItemMenu`, `ChewPopover3D`, `ItemPopover3D`, `WaterBottleMenu`, `ChatBubble3D`), several dialogs (`CleanCageDialog`, `HayManagementDialog`, `ActionResultDialog`, `FoodSelectionDialog`), and a bottom `FabCluster`.

## 3D lifecycle
`onMounted` initializes the renderer via `use3DScene`, sets up camera (`use3DCamera`), position sync (`use3DSync`), items+physics (`use3DItems`), poop (`use3DPoop`), the environment (floor/walls with a procedurally-drawn bedding `CanvasTexture`), clouds, selection/hover rings, and starts a `requestAnimationFrame` `animate()` loop. `onUnmounted` disposes everything.

## Behavior orchestration
`initializeGuineaPigBehaviors` watches `guineaPigStore.activeGuineaPigs` (immediate) to init/remove pigs in `movement3DStore` and create per-pig `use3DBehavior` controllers, wiring event callbacks (drinking→water bubbles, sheltering, sleeping, grooming, playing/headbutt, chewing, popcorn). Local `Map`s (`behaviors`, `playingState`, `chewingState`) track state; `animate()` reads them to drive `updateGuineaPigAnimation` and pin toy/chew meshes to the pig.

## Interaction flow
`handleCanvasClick` raycasts against `worldGroup`, checking (in order) poop, food/hay containers, water bottles, chews, general removable items, physics items, then guinea pigs, then floor (control-mode movement). Pending modes (`pendingInteraction`, `pendingSocialAction`, `containerFillMode`, `placement`) route clicks to petting/hand-feed/effect interactions, GP-to-GP social behaviors, or item placement. `applyPlayerInteraction` runs a wellness-gated success roll, dispatches a `show-chat-bubble` DOM event, applies positive need/friendship effects, and logs. `handleFabAction` maps the 5 themed FAB plaques (pink/green/violet/orange/cyan) onto interaction/care/social handlers. Take-control mode (`handleTakeControl`/`releaseControl`) pauses a pig's behavior, attaches `use3DMovement`, and auto-releases after 30s with a countdown.

## Exports

- **GameView** (component) — `<GameView :is-fullscreen="boolean" :chrome?="boolean" @toggle-fullscreen @toggle-pause="(silent?)" />`: Vue SFC (script setup). Props: `isFullscreen: boolean` (required), `chrome?: boolean` (default true, controls SimTopBar rendering). Emits: `toggle-fullscreen` (no payload) and `toggle-pause` (optional `silent?: boolean`). No exposed public methods; the component owns the entire 3D scene and interaction state internally.

## Internal dependencies

- `../../composables/use3DScene`
- `../../composables/use3DCamera`
- `../../composables/use3DSync`
- `../../composables/use3DGuineaPig`
- `../../composables/use3DItems`
- `../../composables/use3DPoop`
- `../../composables/3d/use3DBehavior`
- `../../composables/3d/use3DMovement`
- `../../composables/3d/use3DInteractions`
- `../../composables/3d/use3DContainerMenu`
- `../../composables/3d/use3DPlacement`
- `../../composables/3d/use3DHabitatCare`
- `../../composables/3d/use3DWaterBottle`
- `../../composables/3d/use3DChatBubbles`
- `../../composables/3d/use3DChewPopover`
- `../../composables/3d/use3DItemPopover`
- `../../composables/3d/use3DSocialActions`
- `../../composables/3d/use3DPhysics`
- `../../composables/3d-models/containers/water-bottles`
- `../../composables/useHabitatContainers`
- `../../composables/game/useSocialBehaviors`
- `./GuineaPigInfoMenu.vue`
- `./WaterBottleMenu.vue`
- `./ChatBubble3D.vue`
- `./ChewPopover3D.vue`
- `./ItemPopover3D.vue`
- `../basic/InventoryItemMenu.vue`
- `../basic/ContainerContentsMenu.vue`
- `./dialogs/CleanCageDialog.vue`
- `./dialogs/HayManagementDialog.vue`
- `./dialogs/ActionResultDialog.vue`
- `./dialogs/FoodSelectionDialog.vue`
- `../chrome/SimTopBar.vue`
- `../chrome/FabCluster.vue`
- `../chrome/ParchmentBanner.vue`
- `../chrome/fabThemes`
- `../../stores/guineaPigStore`
- `../../stores/habitatConditions`
- `../../stores/movement3DStore`
- `../../stores/inventoryStore`
- `../../stores/suppliesStore`
- `../../stores/gameController`
- `../../stores/loggingStore`
- `../../stores/needsController`
- `../../stores/behaviorStateStore`
- `../../constants/3d`
- `../../utils/three-cleanup`
- `../../utils/placementId`
- `../../utils/interactionEffects`
- `../../utils/interactionValidation`
- `three`

## Notes

- `chrome` prop needs the explicit `withDefaults` default of `true` — Vue casts absent Boolean props to false, which would otherwise hide the SimTopBar.
- `data-tutorial="cage"` is intentionally on the canvas, not the wrapper, so FabCluster/dialogs don't accidentally satisfy the tutorial's click-to-advance check.
- A `ResizeObserver` on the canvas supplements `window.resize` because layout-driven size changes (top bar mount, panel toggles) otherwise leave the renderer buffer and raycast picking stale.
- Many mutable non-reactive module-level `let` variables and `Map`s (guineaPigModels, itemModels, physics3D, behaviors, playingState, chewingState, rings, cleanup fns) hold 3D state; they must be nulled/cleared in onUnmounted to avoid leaks — `disposeObject3D` and composable cleanups are called there.
- Take-control mode auto-releases after `CONTROL_AUTO_RELEASE_MS` (30s) via both a timeout and a 1s countdown interval; both timers must be cleared on release/unmount.
- `applyPlayerInteraction` dispatches a global `show-chat-bubble` CustomEvent on `document` that `use3DChatBubbles` listens for — a loosely-coupled DOM-event channel rather than direct calls.
- Negative need impacts from interaction effects are deliberately skipped (cosmetic-only), mirroring gps2 behavior; only positive impacts and friendship gains are applied.
- Container/chew/removable-item click detection walks the Three.js parent chain to match against `itemModels` entries and uses `getBaseItemId` plus supplies-store metadata (itemType/subCategory) to classify the clicked object.
- Shift+click on chews/removable/physics items triggers a physics push instead of opening a popover.
