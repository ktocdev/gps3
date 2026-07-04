---
source: src/components/chrome/HabitatStatusPanel.vue
source_hash: 1d969650c8c0ad5fcbdd4b15c0a06ceb59ee3232eeb1d28fc3d3075476a9363f
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# HabitatStatusPanel.vue

`src/components/chrome/HabitatStatusPanel.vue`

> A Vue chrome component that displays a set of habitat condition meters (water, hay, cleanliness, bedding, and overall) sourced from the habitat conditions store, each rendered as a labeled progress bar with color-coded styling based on its value.

## Data source
Uses the `useHabitatConditions` Pinia store to read reactive values: `waterLevel`, `hayFreshness`, `cleanliness`, `beddingFreshness`, and `overallCondition`.

## Rendering
A `meters` computed builds an array of five meter descriptors, each with a `key`, `label`, `emoji`, `value` (from the store), and a fixed CSS-variable `color` for the fill. The template `v-for`s over `meters`, rendering each as a `.chrome-meter` block containing a head (emoji + label + rounded percentage value) and a track with a `.chrome-meter__fill` whose width is set to `${value}%`.

## Color palette
The `palette(value)` function returns `bg`, `border`, and `text` colors based on thresholds: ≤20 (red), ≤40 (gold/amber), ≤70 (neutral), otherwise green. These are applied per-meter via inline CSS custom properties (`--meter-bg`, `--meter-border`, `--meter-text`).

## Styling
The scoped-style block only defines `.habitat-status-panel` as a grid with gap. The `.chrome-meter*` classes and CSS variables are expected to be defined elsewhere (global chrome styles).

## Exports

- **HabitatStatusPanel** (component) — `<HabitatStatusPanel />`: Vue SFC (script setup) with no props or emits. Renders five habitat condition meters read from the habitat conditions store.

## Internal dependencies

- `../../stores/habitatConditions`

## Notes

- Relies on global CSS classes (`.chrome-meter`, `.chrome-meter__*`) and many CSS custom properties (e.g. `--chrome-entry-bg`, `--color-*`, `--space-2`) that are not defined in this file.
- Meter `value`s are assumed to be 0-100 percentages; values outside that range would produce fill widths beyond 100%.
