---
source: src/components/chrome/HabitatStatusPanel.vue
source_hash: 0453789257818826c8b18289e54b2200e7cbc473dcb5f911f853a79b0384ad82
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# HabitatStatusPanel.vue

`src/components/chrome/HabitatStatusPanel.vue`

> A Vue chrome component that renders a set of progress meters showing the current state of the habitat (water, hay freshness, cleanliness, bedding, and overall condition), pulling live values from the habitat conditions store and color-coding each meter based on its level.

## Structure
The component reads reactive habitat values via `useHabitatConditions()` and exposes a computed `meters` array. Each meter entry defines a `key`, `label`, `emoji`, a `value` bound to a store property, and a fixed CSS-variable `color` for its fill bar.

## Rendering
The template iterates over `meters` with `v-for`, rendering a `.chrome-meter` block for each. Each block shows an emoji + label, the rounded percentage value, and a track whose fill width is set to `${meter.value}%`. Meter values map to store fields: `waterLevel`, `hayFreshness`, `cleanliness`, `beddingFreshness`, and `overallCondition`.

## Color palette logic
The `palette(value)` function returns `bg`, `border`, and `text` colors based on value thresholds (≤20 red, ≤40 gold/amber, ≤70 neutral, otherwise green). These are applied via inline CSS custom properties (`--meter-bg`, `--meter-border`, `--meter-text`) on each meter element, while the fill bar uses the meter's own fixed `color`.

## State/data flow
All values are derived reactively from the habitat conditions store; the component holds no local mutable state and emits no events.

## Exports

- **HabitatStatusPanel** (component) — `Vue SFC <script setup>`: Renders habitat condition meters. No props, no emits. Consumes the habitat conditions store internally.

## Internal dependencies

- `vue`
- `../../stores/habitatConditions`

## Notes

- The CSS-variable palette (--meter-bg/border/text) is applied to the meter container, but the fill bar uses the meter's own hardcoded `color` var, not the threshold-based palette.
- Meter values are assumed to be 0–100 since width and rounding treat them as percentages.
