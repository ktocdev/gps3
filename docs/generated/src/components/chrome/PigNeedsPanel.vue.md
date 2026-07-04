---
source: src/components/chrome/PigNeedsPanel.vue
source_hash: 434c65b556b122b3867cddd7eb88085226948a822d6379fb73311379fb6bd98b
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# PigNeedsPanel

`src/components/chrome/PigNeedsPanel.vue`

> A presentational Vue component that renders a guinea pig's needs as a grid of labeled progress bars, color-coded by urgency level. It displays each need's emoji, label, percentage value, and a fill bar reflecting the current value.

## Rendering
Iterates over `NEED_KEYS` to render one `.need-row` per need. Each row shows the need's emoji and label (from `NEED_META[key]`), the rounded percentage (`Math.round(needs[key])`), and a track/fill bar whose width equals `needs[key]%` and background comes from `NEED_META[key].color`.

## Urgency styling
Each row receives inline CSS custom properties (`--need-bg`, `--need-border`, `--need-text`) computed by `urgencyVars(value)`, which maps the numeric need value through `urgencyOf()` to one of four urgency tiers (`critical`, `warning`, `moderate`, `satisfied`) defined in the local `URGENCY_VARS` constant.

## Layout
A two-column CSS grid that collapses to a single column below 480px width.

## Data flow
Pure props-driven; the sole input is the `needs` prop. No local reactive state or emits.

## Exports

- **PigNeedsPanel** (component) — `<PigNeedsPanel :needs="GuineaPigNeeds" />`: Vue SFC (script setup). Props: `needs: GuineaPigNeeds` (required). No emits. Renders needs as urgency-colored progress bars.

## Internal dependencies

- `./needMeta`
- `../../stores/guineaPigStore`

## Notes

- Style block is not scoped, so `.pig-needs-panel` and related class rules are global.
- Fill width binds directly to `needs[key]` assuming values are in the 0–100 range.
