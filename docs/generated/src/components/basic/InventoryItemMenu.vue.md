---
source: src/components/basic/InventoryItemMenu.vue
source_hash: 558b0bb62d89713f836f50cb635c93e7a599077437c747934891af8ee8a971fb
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# InventoryItemMenu.vue

`src/components/basic/InventoryItemMenu.vue`

> A Vue SFC that renders a floating popover menu listing selectable inventory items. It teleports to the document body and uses smart positioning to display a titled list of items (with emoji, name, and quantity) at a given screen coordinate, emitting events when an item is selected or the menu is closed.

## Rendering
The component uses `<Teleport to="body">` to render outside its parent DOM. The menu is conditionally shown via `v-if="show"`. It has a header (title + close button) and a list body that iterates over `items`, rendering each as a button showing emoji, name, and quantity. When `items` is empty, it displays `emptyMessage`.

## Positioning
Positioning is delegated to the `usePopover` composable (configured with `offset: 10`), which provides `floatingEl` (bound as a template ref), `floatingStyles` (applied via `:style`), and `updatePosition`. A `watch` on `props.position` (with `immediate: true`) calls `updatePosition(pos.x, pos.y)` whenever the position changes.

## Events
Clicking the close button emits `close`. Clicking an item button emits `select` with the item's `itemId`.

## Styling
Scoped-less (global) CSS defines the awning-striped, wood/gold themed panel styling using CSS custom properties (design tokens).

## Exports

- **InventoryItemMenu** (component) — `<InventoryItemMenu :show :position :title :items :emptyMessage? @close @select />`: Props: `show: boolean`, `position: { x: number; y: number }`, `title: string`, `items: InventoryMenuItem[]`, `emptyMessage?: string`. Emits: `close: []`, `select: [itemId: string]`.
- **InventoryMenuItem** (type) — `interface InventoryMenuItem { itemId: string; name: string; emoji: string; quantity: number }`: Shape of an item entry displayed in the menu list.

## Internal dependencies

- `../../composables/ui/usePopover`

## Notes

- The `void floatingEl` statement exists solely to suppress an unused-variable warning; the ref is actually consumed by the template via `ref="floatingEl"`.
- Positioning relies entirely on `usePopover`; the CSS intentionally omits position/transform properties as Floating UI applies them via `floatingStyles`.
- Styles are global (non-scoped) and depend on many CSS custom properties (--panel-*, --color-*, etc.) being defined elsewhere.
