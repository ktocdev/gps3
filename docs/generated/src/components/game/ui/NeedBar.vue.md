---
source: src/components/game/ui/NeedBar.vue
source_hash: 2bfb3989f164c461ed0e3912f54e96fa2da8073e60b5a70c4a0e1036ad3c187c
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# NeedBar.vue

`src/components/game/ui/NeedBar.vue`

> A presentational Vue component that renders a single pet/entity need as a labeled progress bar with a percentage value, color-coded status level, textual status, and an urgency icon. It exists to visualize how satisfied a given need is (0-100%) in the game UI.

## Structure
The component displays a header (formatted need name + percentage), a track containing a width-driven fill bar with a gradient overlay and three fixed threshold indicator lines (at 25%, 50%, 75%), and a status row (status text + optional urgency icon).

## Props & Reactivity
Accepts `needType` (string), `value` (number, 0-100), plus optional `showThresholds`, `size` ('sm'|'md'|'lg'), and `variant` ('default'|'compact'|'detailed'). Defaults are set via `withDefaults`.

## Status logic
The core computed `statusLevel` maps `value` to one of four levels: `critical` (<30), `warning` (<40), `moderate` (<60), `good` (>=60). This drives multiple derived computeds:
- `needBarClasses`, `fillClasses`, `valueClasses`, `statusClasses` — build BEM modifier class arrays combining size/variant and status level.
- `statusText` — 'Low' / 'Getting Low' / 'Okay' / 'Satisfied'.
- `urgencyIcon` — emoji per level.
- `showUrgency` — true only for `critical` and `warning`.

The fill width is clamped inline to `Math.min(100, Math.max(0, value))%`.

## Formatting
`formatNeedName` maps known need keys (hunger, thirst, happiness, cleanliness, energy, social, nails, chew, shelter) to display labels, falling back to capitalizing the first letter for unknown keys.

## Styling
Scoped CSS defines size/variant/status modifiers, color-coded fills and text (green/grey/yellow/red), pulsing/bounce animations, container-query responsive layout at max-width 300px, reduced-motion, and high-contrast support. Relies heavily on CSS custom properties (`--color-*`, `--radius-*`, `--transition-*`, `--shadow-*`).

## Exports

- **NeedBar** (component) — `<NeedBar :needType="string" :value="number" :showThresholds?="boolean" :size?="'sm'|'md'|'lg'" :variant?="'default'|'compact'|'detailed'" />`: Vue SFC (script setup, TS). Props: needType, value (required); showThresholds (default true), size (default 'md'), variant (default 'default'). Emits nothing. Purely presentational, deriving all display state from the value prop.

## Internal dependencies

- `vue`

## Notes

- The `showThresholds` prop is declared and defaulted but never referenced in the template or logic — threshold indicators always render (their visibility is controlled purely by CSS opacity and the `detailed` variant).
- Status thresholds in JS (30/40/60) do not line up with the visual threshold indicator lines rendered at 25%/50%/75%.
- Responsive layout uses a CSS container query (`@container`) but no `container-type` is defined in this scoped stylesheet, so it depends on an ancestor establishing a container context.
- Relies on externally defined CSS custom properties; colors/spacing will break if those variables are absent.
