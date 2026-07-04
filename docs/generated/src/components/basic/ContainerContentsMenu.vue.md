---
source: src/components/basic/ContainerContentsMenu.vue
source_hash: 65f1460c7f585cdb2c6c718010a9eaaf5c17ce4a8dfc6fdb98e63693d141da57
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# ContainerContentsMenu.vue

`src/components/basic/ContainerContentsMenu.vue`

> A teleported floating popover that displays the contents of a food-related container (food bowl or hay rack) in the game, showing item counts, freshness, and per-item details, and emitting actions for filling, clearing, removing food, or moving the container to inventory.

### Rendering
The component teleports its content to `<body>` and conditionally renders when `show` is true. It uses `usePopover` (Floating UI wrapper) for smart positioning; `floatingEl` is bound as a template ref and `floatingStyles` applied inline. A `watch` on `props.position` (immediate) calls `updatePosition(x, y)` whenever the target position changes.

### Two container modes
Behavior branches on `containerType`:
- **`bowl`**: renders a scrollable list of `foods`, each with emoji, name, freshness percentage (color-classed), and a remove button that emits `remove-food` with the item index. Stale foods (freshness < 40) get a highlighted remove button.
- **`hay_rack`**: renders a simpler single-line summary of `hayServings` (with pluralization).

### Computed state
- `itemCount` / `capacity` pick bowl vs hay values.
- `isEmpty`, `canFill` derive from count vs capacity.
- `freshness`: for hay uses `props.freshness`; for bowl computes the average freshness across foods (100 if empty).
- `isStale`: freshness below `STALE_THRESHOLD` (40).
- `showFreshness`, `emptyMessage`, `clearButtonLabel`, `title`, `freshnessClass` adapt display text/classes to container type and staleness.
- `getFreshnessClass(value)` maps a number to good (≥80), warning (≥40), or critical CSS class.

### Actions
The footer conditionally shows a fill button (when `canFill`), a clear/empty button (when not empty, warning-styled if stale), and always a 'Move to Inventory' button, each emitting the corresponding event. The header close button emits `close`.

## Exports

- **ContainerContentsMenu** (component) — `<ContainerContentsMenu :show :position :container-type :container-name :foods :bowl-capacity :hay-servings :hay-capacity :freshness @close @fill @clear @remove @remove-food />`: Vue SFC popover. Props: `show: boolean`, `position: {x,y}`, `containerType: 'bowl'|'hay_rack'`, `containerName?: string|null`, `foods?: FoodItem[]` (default []), `bowlCapacity?: number` (default 3), `hayServings?: number` (default 0), `hayCapacity?: number` (default 4), `freshness?: number` (default 100). Emits: `close`, `fill`, `clear`, `remove`, `remove-food` (payload: index number).

## Internal dependencies

- `../../composables/ui/usePopover`

## Notes

- Content is teleported to `<body>`, so it escapes parent DOM/stacking contexts; relies on z-index 1000.
- `FoodItem` interface declares `itemId` but the template only uses `emoji`, `name`, and `freshness`; list keys use array index, not `itemId`.
- STALE_THRESHOLD is hardcoded to 40 and duplicated in the inline `food.freshness < 40` template check for the stale remove button.
- `void floatingEl` is present solely to suppress an unused-variable warning; the ref is actually consumed via `ref="floatingEl"` in the template.
- Styles are global (non-scoped `<style>`) and depend heavily on CSS custom properties (design tokens) defined elsewhere.
