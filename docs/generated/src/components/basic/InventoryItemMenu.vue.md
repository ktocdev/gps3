---
source: src/components/basic/InventoryItemMenu.vue
source_hash: 85330c3b4e619f99b81e48bd3e21a54b215aca78cb51cd31e87f3d1e3f5dca35
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# InventoryItemMenu.vue

`src/components/basic/InventoryItemMenu.vue`

> A floating popover menu component that displays a list of inventory items at a given screen position, allowing the user to select an item or close the menu. It uses Floating UI (via a composable) for smart positioning and teleports itself to the document body.

### Structure
The component renders inside a `<Teleport to="body">` and is conditionally shown via the `show` prop. When visible, it displays a header with a `title` and a close button, followed by a scrollable list of items. Each item renders its emoji, name, and quantity, and emits `select` with the item's `itemId` on click. When `items` is empty, an `emptyMessage` is shown instead.

### Positioning
Positioning is delegated to the `usePopover` composable (configured with `offset: 10`), which provides `floatingEl` (bound as a template ref), `floatingStyles` (bound to the root div's style), and `updatePosition`. A `watch` on `props.position` (with `immediate: true`) calls `updatePosition(x, y)` whenever the position changes, so the menu re-anchors reactively. `void floatingEl` suppresses an unused-variable lint warning since the ref is only referenced in the template.

### Styling
Extensive scoped-less (global) CSS styles the menu as a themed panel with a striped awning pseudo-element, using CSS custom properties for colors, spacing, and shadows. The menu has `z-index: 1000`.

## Internal dependencies

- `../../composables/ui/usePopover`
