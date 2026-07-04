---
source: src/components/game/WaterBottleMenu.vue
source_hash: a616e220a337796c163834f1678ad056d5d290a8347a9b048a6105d8e3b50d3c
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# WaterBottleMenu.vue

`src/components/game/WaterBottleMenu.vue`

> A Vue SFC that renders a floating popover menu for a placed water bottle in the game. It displays the bottle's current water level and offers actions to refill the bottle or move it back to the inventory. It is teleported to the document body and positioned via Floating UI relative to a screen coordinate.

## Rendering
The template is wrapped in a `<Teleport to="body">` so the menu renders at the document root. The root element gets a template ref (`floatingEl`) and applies `floatingStyles` for positioning.

### Structure
- **Header**: shows `bottleName` (falls back to `'Water Bottle'`) and a close button emitting `close`.
- **Content**: a labeled water-level bar whose fill width equals `waterLevel + '%'`, colored by `getLevelColorClass`, plus a rounded percentage value.
- **Actions**: a "Refill Water" button (emits `refill`, disabled when `waterLevel >= 100`) and a "Move to Inventory" button (emits `remove`).

## Positioning
Uses the `usePopover({ offset: 10 })` composable, destructuring `floatingEl`, `floatingStyles`, and `updatePosition`. A `watch` on `props.position` (with `immediate: true`) calls `updatePosition(pos.x, pos.y)` whenever the position prop changes, so Floating UI recomputes placement. `void floatingEl` suppresses an unused-variable warning since the ref is only referenced in the template.

## Color logic
`getLevelColorClass(level)` returns `--high` (>=50), `--medium` (>=25), or `--low` (<25) modifier classes that map to blue/amber/red gradient fills.

## Styling
Global (non-scoped) `<style>` block with a wood/gold themed panel, striped awning `::before` accent, and CSS custom properties for theming.

## Exports

- **WaterBottleMenu** (component) — `<WaterBottleMenu :waterLevel="number" :position="{x,y}" :bottleName="string|null" @close @refill @remove />`: Default SFC export. Props: `waterLevel` (number, percentage 0-100), `position` ({x,y} screen coords driving Floating UI placement), `bottleName` (optional string|null, defaults display to 'Water Bottle'). Emits: `close`, `refill`, `remove` (all payload-less).

## Internal dependencies

- `../../composables/ui/usePopover`
- `vue`

## Notes

- Uses `<style>` (not scoped), so its class names are global; the `water-bottle-menu__` BEM prefix mitigates collisions.
- Relies entirely on CSS custom properties (e.g. --panel-bg-top, --color-item-water, --color-pink-500) that must be defined elsewhere.
- Refill button is disabled only when waterLevel >= 100; there is no client-side guard on remove.
- Positioning behavior is fully delegated to usePopover/Floating UI; the component sets no top/left/transform itself.
