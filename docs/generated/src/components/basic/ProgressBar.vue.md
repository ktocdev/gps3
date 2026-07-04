---
source: src/components/basic/ProgressBar.vue
source_hash: e1a73714b73bd498d9cd637af8ada9b77ce05f88f66a0b223541ad7bfaa49c5e
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# ProgressBar

`src/components/basic/ProgressBar.vue`

> A reusable Vue SFC that renders an accessible horizontal progress bar with optional label, value display, size variants, and color variants (mapped to urgency levels like NeedRow). It clamps and normalizes a numeric value into a percentage fill.

### Template
Renders a `.progress-bar` container whose classes are driven by `variant` and `size`. It optionally shows a `.progress-bar__label`, a `.progress-bar__track` (with `role="progressbar"` and ARIA attributes `aria-valuenow`/`aria-valuemin`/`aria-valuemax`/`aria-label`) containing a `.progress-bar__fill` whose width is set inline from the computed `percentage`, and optionally a `.progress-bar__value` showing the rounded value plus `suffix`.

### Logic
- `percentage` computed: normalizes `value` within `[min, max]` to a 0–100 range and clamps it via `Math.min(100, Math.max(0, ...))`.
- `progressBarClasses` computed: returns `progress-bar--{variant}` and `progress-bar--{size}` class names.

### Props & defaults
`value` (required), `min` (0), `max` (100), `label`, `suffix` (''), `showValue` (false), `variant` ('default'), `size` ('md'), `ariaLabel`. The `aria-label` falls back to `ariaLabel || label || 'Progress'`.

### Styling
Global (non-scoped) `<style>` defines base layout (flex row), track/fill appearance using CSS custom properties, three size variants (sm/md/lg controlling track height and font sizes), and six color variants (satisfied/good/medium/warning/critical/default) that set the fill background color.

## Exports

- **ProgressBar** (component) — `<ProgressBar :value="number" :min? :max? :label? :suffix? :show-value? :variant? :size? :aria-label? />`: Vue SFC progress bar. Props: value:number (required), min:number=0, max:number=100, label?:string, suffix?:string='', showValue?:boolean=false, variant?:'critical'|'warning'|'medium'|'good'|'satisfied'|'default'='default', size?:'sm'|'md'|'lg'='md', ariaLabel?:string. Emits none.

## Internal dependencies

- `vue`

## Notes

- The `<style>` block is not scoped, so class names are global and could collide across the app.
- If `max === min`, `percentage` computes a division by zero (NaN/Infinity), which is then clamped—NaN would not clamp to a valid width.
