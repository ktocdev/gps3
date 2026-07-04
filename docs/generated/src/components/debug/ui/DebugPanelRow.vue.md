---
source: src/components/debug/ui/DebugPanelRow.vue
source_hash: 9ee1b630f7a34d745090263ac0fc632c26d6512eb85a756e321c70a86ef9cf79
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# DebugPanelRow

`src/components/debug/ui/DebugPanelRow.vue`

> A presentational layout component used within the debug UI to arrange its slotted children in a responsive CSS grid of either 2 or 3 equal-width columns.

## Structure
The component renders a single `div.dbg-panel-row` that wraps a default `<slot />`. It applies a modifier class `dbg-panel-row--{columns}` where `columns` comes from the prop, defaulting to `3` when not provided.

## Styling
The root element uses `display: grid` with a `var(--space-3)` gap. The `--2` and `--3` modifier classes set `grid-template-columns` to two or three equal `1fr` tracks respectively. A media query at `max-width: 880px` collapses both layouts to a single column for narrow viewports. Note the `<style>` block is not scoped, so these class rules are global.

## Exports

- **DebugPanelRow** (component) — `<DebugPanelRow :columns?="2 | 3">…</DebugPanelRow>`: Vue SFC (script setup). Props: `columns?` (2 | 3, defaults to 3 in template). Renders a responsive grid container with a default slot for its children. No emits.

## Notes

- The `<style>` block is global (not scoped), so `.dbg-panel-row` class rules apply application-wide.
- The default column count (3) is applied via template fallback `columns ?? 3`, not via a prop default in `defineProps`.
