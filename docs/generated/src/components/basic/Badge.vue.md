---
source: src/components/basic/Badge.vue
source_hash: 9fd13a54a171e95bed34955c281864870d62c086dfec01a9f77e5af944b3fddb
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Badge.vue

`src/components/basic/Badge.vue`

> A small presentational Vue component that renders an inline badge/label with configurable color variant and size. It exists to provide a consistent, reusable styled tag element across the application.

This is a Vue 3 `<script setup>` SFC. It renders a single `<span>` wrapping default slot content, with dynamically computed CSS classes.

### Props & logic
The component accepts two props via `defineProps` with `withDefaults`: `variant` (defaults to `'secondary'`) and `size` (defaults to `'md'`). A `badgeClasses` computed property builds a space-separated class string from a base `badge` class plus `badge--{variant}` and `badge--{size}` modifiers.

### Styling
Scoped-free (global) `<style>` block defines the `.badge` base styles (inline-block, uppercase, small font, rounded corners) and modifier classes for each size (`sm`, `md`, `lg`) and each variant (`primary`, `secondary`, `success`, `info`, `warning`, `danger`, `seasonal`). Colors are driven by CSS custom properties (e.g. `--color-primary`, `--color-text-inverse`).

## Exports

- **Badge** (component) — `<Badge variant? size?>slot</Badge>`: Default export SFC rendering a styled span. Props: `variant` ('primary'|'secondary'|'success'|'info'|'warning'|'danger'|'seasonal', default 'secondary') and `size` ('sm'|'md'|'lg', default 'md'). Content is provided via the default slot. No emits.

## Internal dependencies

- `vue`

## Notes

- The `<style>` block is global (not scoped), so `.badge` and modifier classes leak into the global stylesheet.
- Relies on externally-defined CSS custom properties (e.g. --color-primary, --color-text-inverse, --color-need-play); missing variables will break coloring.
- The `.filter(Boolean)` in badgeClasses is redundant since all three class strings are always truthy.
