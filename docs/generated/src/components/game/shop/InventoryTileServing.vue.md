---
source: src/components/game/shop/InventoryTileServing.vue
source_hash: 9dec5a000247bb9bdf1ed3ecacfc0d5173a2dfdac57903576ca538526d58d414
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# InventoryTileServing.vue

`src/components/game/shop/InventoryTileServing.vue`

> A presentational Vue SFC that renders a single serving-based inventory item tile in the shop, showing its emoji, name, remaining servings, and a color-coded depletion indicator. It supports drag-and-drop (mouse and touch), click selection, and disabled states, emitting corresponding events to a parent component.

## Rendering
Displays a tile with an optional drag handle (`⋮⋮`), the item emoji, a name, a `servingsRemaining/maxServings servings` label, and an optional instance count badge (`×N`) shown when `instanceCount > 1`. Root element receives dynamic classes for depletion level, disabled, and selected states, plus a computed `title` tooltip.

## Computed state
- `depletionPercentage`: rounded percentage depleted based on `servingsRemaining/maxServings` (100 if `maxServings === 0`).
- `depletionClass`: maps depletion percentage to one of five CSS modifier classes (`--fresh`, `--mostly-full`, `--half`, `--low`, `--depleted`).
- `tooltipText`: shows `tooltipMessage` when disabled and provided, otherwise a freshness summary string.

## Interaction / data flow
The component is stateless regarding game data — it emits events upward. `handleDragStart` builds a JSON drag payload `{ itemId, isServingBased: true }` into `text/plain`, adds a custom MIME type `application/x-item-category-<category>` for drop validation, creates a temporary emoji drag image appended to `document.body` (removed via `setTimeout`), and dims the tile via inline opacity. `handleDragEnd` restores opacity. Touch handlers (`start`/`move`/`end`) provide equivalent behavior for touch devices, calling `preventDefault` on move to block scrolling. `handleClick` emits `click` unless disabled. All handlers short-circuit when `isDisabled` (and touch handlers also when not `draggable`).

## Exports

- **InventoryTileServing** (component) — `<InventoryTileServing :itemId :name :emoji? :servingsRemaining :maxServings :instanceCount? :isDisabled? :tooltipMessage? :draggable? :isSelected? :category? />`: Serving-based inventory tile. Props: itemId (string), name (string), emoji (string, optional), servingsRemaining (number), maxServings (number), instanceCount (number, optional), isDisabled (default false), tooltipMessage (default ''), draggable (default true), isSelected (default false), category (string, optional). Emits: dragstart(itemId, DragEvent), dragend(DragEvent), touchstart(itemId, TouchEvent), touchmove(itemId, TouchEvent), touchend(itemId, TouchEvent), click(itemId, MouseEvent).

## Internal dependencies

- `vue`

## Notes

- handleDragStart mutates the DOM directly: creates a temporary drag-image element appended to document.body and removes it via setTimeout(0).
- Drag/touch handlers set inline opacity on event.currentTarget for visual feedback rather than via reactive state.
- Uses non-null assertions on event.dataTransfer, which can be null in some contexts.
- The category prop is encoded as a custom MIME type (application/x-item-category-<category>) expected by drop targets for validation.
- CSS is unscoped (plain <style>), so class names leak globally; relies on many CSS custom properties (design tokens) being defined elsewhere.
