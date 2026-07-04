---
source: src/components/chrome/PigNeedsPanel.vue
source_hash: f2844715f9e25084cab5ce9259185be6586d50609aa311ea68c6001cb9d69088
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# PigNeedsPanel.vue

`src/components/chrome/PigNeedsPanel.vue`

> A presentational Vue component that renders a guinea pig's needs as a grid of labeled progress bars, color-coded by urgency level. It exists to visualize the current state of each need in the game's chrome/UI layer.

## Rendering
Iterates over `NEED_KEYS` and renders one `.need-row` per need. Each row shows the need's emoji and label (from `NEED_META[key]`), a rounded percentage value (`Math.round(needs[key])`), and a progress track whose fill width is `needs[key]%` with a color from `NEED_META[key].color`.

## Urgency styling
Each row's inline style is set via `urgencyVars(needs[key])`, which calls `urgencyOf(value)` to classify the value into `critical`, `warning`, `moderate`, or `satisfied`, then returns a matching set of CSS custom properties (`--need-bg`, `--need-border`, `--need-text`) drawn from the local `URGENCY_VARS` map. These reference theme color tokens.

## Props
Accepts a single `needs` prop typed as `GuineaPigNeeds`. The component is stateless and purely driven by this prop.

## Layout
A two-column CSS grid that collapses to a single column at viewport widths ≤ 480px.

## Exports

- **PigNeedsPanel** (component) — `defineProps<{ needs: GuineaPigNeeds }>()`: Vue SFC displaying guinea pig needs as urgency-colored progress bars. Prop: `needs` (GuineaPigNeeds). No emits. Uses NEED_KEYS/NEED_META for iteration and metadata, and urgencyOf for color classification.

## Internal dependencies

- `./needMeta`
- `../../stores/guineaPigStore`

## Notes

- The `<style>` block is not scoped, so `.pig-needs-panel` and `.need-row` classes are global.
- URGENCY_VARS keys must stay in sync with the return values of `urgencyOf`; an unmatched value would yield undefined styles.
- Assumes need values are 0–100 since they are used directly as percentage widths.
