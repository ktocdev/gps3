---
source: src/components/debug/ui/DebugStatRow.vue
source_hash: 688ad9effd3566e934b552ae76e841be5061e4d662d93591bf6245675d1e39ca
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# DebugStatRow

`src/components/debug/ui/DebugStatRow.vue`

> A small presentational Vue component that renders a single labeled statistic row for the debug UI, pairing a text label with a value that can optionally be styled as muted.

This is a stateless presentational SFC using `<script setup lang="ts">`. It renders a `.stat-item` container with two spans: a `.stat-label` displaying the `label` prop, and a `.stat-value` displaying the `value` prop. When the `muted` prop is truthy, the `stat-value--muted` class is conditionally bound to the value span. It defines no reactive state, emits no events, and contains no styles within the shown code (styling for the referenced classes must come from elsewhere).

## Exports

- **DebugStatRow** (component) — `<DebugStatRow :label="string" :value="string | number" :muted?="boolean" />`: Renders a label/value pair. Props: `label` (string, required), `value` (string | number, required), `muted` (boolean, optional) which toggles the `stat-value--muted` class on the value span. No emits.

## Notes

- The classes `.stat-item`, `.stat-label`, `.stat-value`, and `.stat-value--muted` are referenced but not defined in this file; styling relies on external/global CSS.
