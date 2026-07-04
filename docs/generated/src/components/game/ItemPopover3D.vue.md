---
source: src/components/game/ItemPopover3D.vue
source_hash: 04d5958f7a4be05b699810a9a49e42a145a9c9d92883632ad1549de529e1f448
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# ItemPopover3D.vue

`src/components/game/ItemPopover3D.vue`

> A Vue SFC that renders a teleported popover for a 3D-placed item, showing the item's emoji and name with a single action to move the item back to inventory. It uses Floating UI (via a composable) for smart positioning near a screen coordinate.

## Rendering
The component teleports its content to `<body>` and only renders when the `show` prop is true. It displays a header with the item's emoji (`itemData?.itemEmoji`), name (`itemData?.itemName`), and a close button, plus an actions section with a single "Move to Inventory" button.

## Positioning
It calls `usePopover({ offset: 10 })` to obtain `floatingEl` (bound as a template ref on the popover div), `floatingStyles` (bound to the div's inline style), and `updatePosition`. A `watch` on the `position` prop (with `immediate: true`) calls `updatePosition(pos.x, pos.y)` whenever the coordinate changes. The `void floatingEl` line suppresses an unused-variable lint warning since the ref is used in the template.

## Events
The close button emits `close`; the "Move to Inventory" button emits `remove`. The parent is responsible for reacting to these.

## Styling
Scoped-less (`<style>` without `scoped`) CSS defines a themed "notice-board" appearance using CSS custom properties, including a striped awning pseudo-element (`::before`) and hover transitions on buttons.

## Exports

- **ItemPopover3D** (component) — `<ItemPopover3D :show="boolean" :position="{x,y}" :item-data="ItemPopoverData | null" @close @remove />`: Popover component for a 3D item. Props: `show` (boolean, controls visibility), `position` ({x,y} screen coordinates), `itemData` (ItemPopoverData | null, provides emoji/name). Emits: `close` (close button clicked) and `remove` (Move to Inventory clicked).

## Internal dependencies

- `../../composables/ui/usePopover`
- `../../composables/3d/use3DItemPopover (type ItemPopoverData)`

## Notes

- The `<style>` block is not scoped, so its class names (e.g. `.item-popover`) are global and could collide with other components.
- Content is teleported to `<body>`, so it renders outside the component's DOM subtree.
- Relies on numerous CSS custom properties (e.g. `--panel-bg-top`, `--color-gold-800`) being defined globally; missing variables will break styling.
