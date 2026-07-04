---
source: src/components/game/shop/ItemViewToggle.vue
source_hash: 058b20e0f09d52814918d04e63f09f43fb4562eb9c3ec684735981dd6bd49118
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# ItemViewToggle

`src/components/game/shop/ItemViewToggle.vue`

> A Vue SFC that renders a two-button segmented toggle for switching between 'list' and 'card' item display modes in the shop UI. It uses the v-model pattern to synchronize the selected view with its parent.

## Structure
The template renders two `<button>` elements inside a `.item-view-toggle` container: one for 'list' view (☰ icon, "List" label) and one for 'card' view (▦ icon, "Cards" label).

## Behavior
Each button emits `update:modelValue` with its respective value (`'list'` or `'card'`) on click. The active button is styled via the `item-view-toggle__button--active` class, applied when `modelValue` matches that button's value. Accessibility attributes (`aria-label`, `aria-pressed`) reflect the current state.

## State
Stateless — the component is fully controlled by the parent through the `modelValue` prop and the `update:modelValue` emit (standard v-model contract).

## Styling
Scoped-like global `<style>` block uses CSS custom properties (design tokens) for colors, spacing, radius, and shadows. On screens ≤640px, text labels are hidden and buttons show only icons with reduced padding.

## Exports

- **ItemViewToggle** (component) — `<ItemViewToggle v-model="view: 'card' | 'list'" />`: Segmented toggle component. Props: `modelValue: 'card' | 'list'` (the currently selected view). Emits: `update:modelValue` with value `'card' | 'list'` when a button is clicked.

## Notes

- Relies on globally-defined CSS custom properties (--color-*, --space-*, --radius-*, --shadow-*, --font-*) being available; the <style> block is not scoped.
- Only supports two view modes ('card' and 'list'); the type union is enforced at compile time via TypeScript props/emits.
