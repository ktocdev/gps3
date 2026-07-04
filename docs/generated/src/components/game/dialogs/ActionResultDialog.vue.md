---
source: src/components/game/dialogs/ActionResultDialog.vue
source_hash: 3c120f6e348d8396d3af3941c01763cfbf1bd1b9ea72feba65f3c59ff19e8f2e
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# ActionResultDialog

`src/components/game/dialogs/ActionResultDialog.vue`

> A presentational Vue SFC dialog that displays the outcome of a game action, showing an icon, title, an optional grid of stats, an optional message, and an OK button to dismiss. It wraps BaseDialog and is used to report results back to the player.

## Structure
The component renders a `BaseDialog` (size `sm`) whose visibility is controlled via the `modelValue` prop and forwarded `update:modelValue` events. Inside, it shows:

- An `icon` (emoji/glyph string) in a large header element.
- A `title` heading.
- A conditional `stats-grid` that iterates over the `stats` array, rendering each `label`/`value` pair as a `.stat-item` (keyed by `stat.label`). Only shown when `stats.length > 0`.
- An optional `message` paragraph, shown when non-empty.
- A footer with a primary `Button` labeled "OK" that emits `update:modelValue` with `false` to close.

## Data flow
All data is passed in via props; the component holds no internal state. Closing is achieved purely by emitting `update:modelValue` (from the OK button, or forwarded from BaseDialog). `stats` defaults to an empty array and `message` defaults to an empty string via `withDefaults`.

## Styling
Scoped-less global `<style>` block defines centered flex layout and CSS-variable-driven theming (fonts, gold/wood colors, spacing). Relies on `.stats-grid`, `.stat-item`, `.stat-label`, `.stat-value` classes presumably defined elsewhere globally for the stats rendering.

## Exports

- **ActionResultDialog** (component) — `<ActionResultDialog v-model="boolean" :icon :title :message? :stats? />`: Default SFC export. Props: `modelValue: boolean` (visibility), `icon: string`, `title: string`, `message?: string` (default ''), `stats?: ActionStat[]` (default []). Emits: `update:modelValue: [value: boolean]`.
- **ActionStat** (type) — `interface ActionStat { label: string; value: string | number }`: Exported interface describing a single stat row displayed in the stats grid.

## Internal dependencies

- `../../basic/dialogs/BaseDialog.vue`
- `../../basic/Button.vue`

## Notes

- The `.stats-grid`, `.stat-item`, `.stat-label`, and `.stat-value` classes are referenced but not defined in this file's `<style>` block; they must come from a global stylesheet.
- The `<style>` block is not scoped, so its class rules are global.
