---
source: src/components/basic/ContainerContentsMenu.vue
source_hash: ae57a39f2b183b00150b463933c7cb2bdcc5b807578f9093fc82af16b450fc63
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# ContainerContentsMenu.vue

`src/components/basic/ContainerContentsMenu.vue`

> A floating popover component that displays and manages the contents of a food bowl or hay rack container placed in the game world. It shows item counts, freshness, individual food items (with per-item removal), and provides action buttons to fill, clear, or move the container to inventory.

### Rendering
The component `Teleport`s to `body` and conditionally renders (`v-if="show"`) a positioned popover. Positioning is handled by the `usePopover` composable, which supplies `floatingEl` (bound as template ref), `floatingStyles`, and `updatePosition`. A `watch` on `props.position` (immediate) calls `updatePosition(x, y)` whenever coordinates change.

### Two container modes
Behavior branches on `props.containerType`:
- **`bowl`**: renders a scrollable list of `foods`, each showing emoji, name, per-item freshness (color-coded), and a remove button that emits `remove-food` with the index. Stale foods (<40% freshness) get a highlighted remove button.
- **`hay_rack`**: renders a simple line showing the number of hay `servings` (pluralized).

### Computed state
- `title` — `containerName` or fallback `'Container'`.
- `itemCount`/`capacity` — resolve to bowl or hay values based on type.
- `isEmpty`, `canFill` — derived from count vs capacity.
- `freshness` — for hay uses `props.freshness`; for bowl computes the average of food freshness values.
- `isStale` — true when freshness < `STALE_THRESHOLD` (40).
- `showFreshness`, `emptyMessage`, `clearButtonLabel`, `freshnessClass` — display helpers.
- `getFreshnessClass(value)` — returns good/warning/critical CSS modifier by threshold (≥80/≥40/else).

### Actions
Buttons emit `fill` (shown when `canFill`), `clear` (shown when not empty, styled as warning when stale), `remove` (always, 'Move to Inventory'), and `close` (header ×).

### Styling
Extensive scoped-less (global) CSS using CSS custom properties, including a decorative striped awning via `::before`.

## Exports

- **ContainerContentsMenu** (component) — `<ContainerContentsMenu :show :position :containerType :containerName? :foods? :bowlCapacity? :hayServings? :hayCapacity? :freshness? @close @fill @clear @remove @remove-food />`: Floating popover for managing bowl/hay_rack contents. Props: `show: boolean`, `position: {x,y}`, `containerType: 'bowl'|'hay_rack'`, `containerName?: string|null`, `foods?: FoodItem[]` (default []), `bowlCapacity?: number` (3), `hayServings?: number` (0), `hayCapacity?: number` (4), `freshness?: number` (100). Emits: `close`, `fill`, `clear`, `remove`, and `remove-food: [index: number]`.

## Internal dependencies

- `../../composables/ui/usePopover`

## Notes

- The `FoodItem` interface includes `itemId` but only `emoji`, `name`, and `freshness` are used in the template.
- `void floatingEl` is present solely to suppress an unused-variable lint warning; the ref is actually consumed via the template `ref="floatingEl"`.
- Freshness thresholds are duplicated: `STALE_THRESHOLD` (40) governs stale styling/labels, while `getFreshnessClass` independently hardcodes the 80/40 boundaries.
- Styles are global (non-scoped `<style>`), so BEM class names must remain unique to avoid collisions across the app.
