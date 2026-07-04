---
source: src/components/debug/ui/DebugBadge.vue
source_hash: dce3d6074726e125b65c29916a4b667ff2c708b09cba1cd6c14f60da73b08b09
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# DebugBadge

`src/components/debug/ui/DebugBadge.vue`

> A small presentational Vue component that renders a styled inline badge for debug UI, using a variant to control its visual appearance.

This is a minimal Vue 3 SFC using `<script setup>`. It renders a single `<span>` with the base class `dbg-badge` and a variant modifier class derived from the `variant` prop (e.g. `dbg-badge--ok`). The badge's content is supplied via the default slot. There is no reactive state, no emits, and no logic beyond binding the class. Styling for the classes is expected to come from external/global CSS (no `<style>` block is defined in this file).

## Exports

- **DebugBadge** (component) — `DebugBadge(props: { variant: 'ok' | 'warn' | 'err' | 'info' })`: Inline badge component. Prop: `variant` (required) — one of 'ok' | 'warn' | 'err' | 'info', which maps to the CSS class `dbg-badge--{variant}`. Renders default slot content. No emits.

## Notes

- The `dbg-badge` and `dbg-badge--*` classes are not defined in this file; styling relies on external CSS.
