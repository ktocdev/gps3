---
source: src/components/basic/Badge.vue
source_hash: 14ad00ae2169d21182bd75474e6568873d2c51cc7ed00ba04acbca10cb832730
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Badge.vue

`src/components/basic/Badge.vue`

> A small presentational Vue component that renders a styled inline badge/label. It provides consistent variant and size styling for short status or category text passed via the default slot.

This is a Vue 3 `<script setup>` SFC. It renders a single `<span>` containing the default slot content, with dynamically computed CSS classes.

### Props & logic
Two optional props are defined with defaults: `variant` (defaults to `'secondary'`) and `size` (defaults to `'md'`). A `badgeClasses` computed property builds a class list combining the base `badge` class with `badge--{variant}` and `badge--{size}` modifiers, joined into a space-separated string.

### Styling
The component ships scoped-less global `<style>` defining the base `.badge` appearance (inline-block, uppercase, letter-spacing, rounded corners) plus size modifiers (`--sm`, `--md`, `--lg`) and variant modifiers (`--primary`, `--secondary`, `--success`, `--info`, `--warning`, `--danger`, `--seasonal`). Colors are pulled from CSS custom properties (e.g. `--color-primary`, `--color-text-inverse`).

## Internal dependencies

- `vue`

## Notes

- The `<style>` block is not scoped, so `.badge` and its modifier classes are global and could collide with other components.
- Color styling relies entirely on external CSS custom properties (design tokens) such as `--color-primary`, `--color-text-inverse`, `--color-need-play`; the component will render without color if those variables are undefined.
- The `.filter(Boolean)` in badgeClasses is effectively a no-op since all three class strings are always truthy.
