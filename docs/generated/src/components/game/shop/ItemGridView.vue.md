---
source: src/components/game/shop/ItemGridView.vue
source_hash: ee3371de3eec58ce3d7fd3a1921859839bcf413e9c2be1d38a8fc850d5539bda
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# ItemGridView

`src/components/game/shop/ItemGridView.vue`

> A presentational Vue SFC that provides a responsive CSS grid layout wrapper for shop item content. It exists purely to supply consistent grid structure and spacing, delegating all content to a default slot.

This is a minimal layout component with no props, emits, or script logic. The template renders a single `div.item-grid-view` containing a default `<slot>`, so any child content passed in is laid out within the grid.

### Styling
The `.item-grid-view` class uses `display: grid` with `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))`, a `gap` of `var(--space-4)`, and full `inline-size`. Responsive media queries increase the minimum column width to 300px at ≥640px and 320px at ≥1024px. Equivalent container queries (`@container`) apply the same 300px/320px breakpoints for nested/container-based contexts. Note the `<style>` block is not scoped, so these class rules are global.

## Exports

- **ItemGridView** (component) — `<ItemGridView><!-- slot content --></ItemGridView>`: Layout-only component with no props or emits. Wraps default slot content in a responsive CSS grid.

## Notes

- The `<style>` block is not scoped, so `.item-grid-view` rules leak globally.
- Relies on the `--space-4` CSS custom property being defined by an ancestor/global scope for its gap.
