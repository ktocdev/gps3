---
source: src/components/basic/ProgressBar.vue
source_hash: dda345bcc5c2a371ecf7819f4801b567878b88495b5796e81560aa20e2d83289
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# ProgressBar.vue

`src/components/basic/ProgressBar.vue`

> A reusable presentational Vue component that renders an accessible horizontal progress bar with optional label, value readout, color variants, and sizes. It exists to provide a consistent progress visualization across the app, with color variants matching NeedRow urgency levels.

## Structure
The SFC renders a `.progress-bar` flex container holding an optional `.progress-bar__label`, a `.progress-bar__track` with an inner `.progress-bar__fill`, and an optional `.progress-bar__value`.

## Logic
Two computed properties drive rendering:
- `percentage` normalizes `value` into a 0–100 range based on `min`/`max` (`(value - min) / (max - min) * 100`), clamped between 0 and 100. This sets the fill's inline `width`.
- `progressBarClasses` produces `progress-bar--{variant}` and `progress-bar--{size}` modifier classes.

## Accessibility
The track has `role="progressbar"` with `aria-valuenow` (`value`), `aria-valuemin` (`min`), `aria-valuemax` (`max`), and `aria-label` falling back through `ariaLabel` → `label` → `'Progress'`.

## Display
The value readout shows `Math.round(value)` plus an optional `suffix`, only when `showValue` is true. The label is only shown when `label` is provided.

## Styling
Styles are global (non-scoped `<style>`) and rely on CSS custom properties (design tokens). Size variants adjust track height and font sizes; color variants set the fill background color.

## Exports

- **ProgressBar** (component) — `<ProgressBar :value="number" :min? :max? :label? :suffix? :show-value? :variant? :size? :aria-label? />`: Props: `value` (number, required); `min` (default 0); `max` (default 100); `label` (string); `suffix` (string, default ''); `showValue` (boolean, default false); `variant` ('critical'|'warning'|'medium'|'good'|'satisfied'|'default', default 'default'); `size` ('sm'|'md'|'lg', default 'md'); `ariaLabel` (string). No emits or slots.

## Internal dependencies

- `vue`

## Notes

- `percentage` will produce NaN/Infinity if `max === min` (division by zero); no guard exists.
- The `<style>` block is global (not scoped), so class names leak into the global stylesheet.
- Rendering depends on external CSS custom properties (e.g. --color-red-500, --space-2, --radius-full) being defined elsewhere.
