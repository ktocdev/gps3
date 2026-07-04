---
source: src/components/chrome/SimTopBar.vue
source_hash: 446beb12b3c070d7a9c41624ca1ac84e18b0fbbf2abc3ebab510ffdc369561de
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# SimTopBar.vue

`src/components/chrome/SimTopBar.vue`

> The top navigation bar for the simulation UI, styled as a wooden sign board. It renders clickable SignPill controls that open at most one PillDropdown panel at a time: Activity feed (left), Habitat status plus one pill per active guinea pig (center), and Inventory (right). It also bridges the guided tutorial to open/close these panels and relays inventory item selection to its parent.

### Layout
A wooden bar (`wood-bar`) with grain and corner rivets. Three regions: left Activity slot, a center region containing a Habitat pill followed by a `v-for` over `guineaPigStore.activeGuineaPigs` rendering a pig pill each, and a right Inventory slot. Each slot pairs a `SignPill` with a conditionally-rendered `PillDropdown` containing the relevant panel component.

### Panel state
`openPanel` (ref<string|null>) holds the single open panel id: `'activity' | 'habitat' | 'inventory' | <pigId>`. `togglePanel(id)` toggles it. A `closedByMousedown` module-scoped variable coordinates with the document `mousedown` handler so that clicking a pill that a mousedown just closed doesn't immediately reopen it.

### Outside-click dismissal
`onDocumentMouseDown` (registered on `document` in `onMounted`, removed in `onUnmounted`) closes the open panel unless the click lands inside `[data-sim-panel]` or `[data-tutorial-overlay]`. It intentionally does not stopPropagation so the same click still raycasts into the canvas.

### Derived display
`activityCount` = number of logging store activity messages (used as badge). `cleanlinessColor` maps habitat dirtiness to red/gold/green. `health(pig)` calls `pigHealth(pig.needs)`; the pig pill shows a plain dot when status is `ok`, otherwise a colored chip (red for critical, gold otherwise) with `worstNeedEmoji(pig)` and the count. `worstNeedEmoji` looks up `NEED_META[worstNeed].emoji`.

### Tutorial integration
On mount, registers panel handlers with `tutorialStore` for keys `activity`, `habitat-status`, `inventory`, and `pig-pill` (which targets the first active pig); `setPanelForTutorial` opens/closes accordingly. Handlers are unregistered on unmount.

### Parent communication
Emits `select-inventory-item` (closing the dropdown afterward via `onInventorySelect`) and `deselect-inventory-item`. Exposes `clearInventorySelection()` which delegates to the inventory panel ref.

## Exports

- **SimTopBar** (component) — `<SimTopBar @select-inventory-item @deselect-inventory-item ref />`: Vue SFC (script setup). Emits: `select-inventory-item` (itemId: string), `deselect-inventory-item` (). Exposes `clearInventorySelection()` which calls the child InventoryPanel's `clearSelection()`. Takes no props; reads guinea pig, habitat, logging, and tutorial stores directly.

## Internal dependencies

- `./SignPill.vue`
- `./PillDropdown.vue`
- `./ActivityFeedPanel.vue`
- `./HabitatStatusPanel.vue`
- `./InventoryPanel.vue`
- `./PigDrawer.vue`
- `./needMeta`
- `../../stores/guineaPigStore`
- `../../stores/habitatConditions`
- `../../stores/loggingStore`
- `../../stores/tutorialStore`

## Notes

- Only one panel can be open at a time (single `openPanel` ref); opening a pig drawer/panel closes any other.
- The `closedByMousedown` mechanism prevents a click from reopening a panel that the preceding mousedown just closed — critical to avoid flicker on pill re-click.
- `onDocumentMouseDown` deliberately does not stopPropagation, so the same click continues into the canvas raycast; panels stay open only when clicking inside `[data-sim-panel]` or `[data-tutorial-overlay]`.
- Tutorial `pig-pill` handler always targets `activeGuineaPigs[0]`; if there are no active pigs it passes null and does nothing.
- Panel components (ActivityFeedPanel, HabitatStatusPanel, PigDrawer, InventoryPanel) must reside within `[data-sim-panel]` (provided by PillDropdown) for outside-click dismissal to work correctly.
