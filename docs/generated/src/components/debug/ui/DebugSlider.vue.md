---
source: src/components/debug/ui/DebugSlider.vue
source_hash: 31a979c0a45e9c4cf75eacc92fe6ac3eded3dd7950a60affc7bd77f156e14f53
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# DebugSlider

`src/components/debug/ui/DebugSlider.vue`

> A reusable debug-panel slider component that renders a labeled range input with a live value readout, optional min/max labels, and hint text. It supports v-model binding for a numeric value and configurable styling via an accent color.

This Vue SFC wraps a native `<input type="range">` with debug-UI styling. It uses `defineProps` for configuration and emits `update:modelValue` on input to support `v-model`.

### State & data flow
- The current value comes from the `modelValue` prop; on `input`, the handler parses the input value with `Number()` and emits `update:modelValue`.
- A `pct` computed property calculates the fill percentage as `((modelValue - min) / (max - min)) * 100`, defaulting `min` to 0 and `max` to 100.
- The root element exposes CSS custom properties `--accent` (from `accent` prop, defaulting to `var(--color-pink-500)`) and `--pct` (the computed percentage plus `%`) for styling.

### Template structure
- A head row shows the label (via `label` prop or a `label` named slot) and the current value with a `suffix` (default `%`).
- The range input applies `min`/`max`/`step` defaults (0/100/1) and a `disabled` state.
- An optional min/max row renders unless `showMinMax` is explicitly `false`.
- An optional hint line renders when `hint` is provided.

No scoped styles are defined in this file; styling relies on external `.dbg-slider` classes and the CSS variables set inline.

## Exports

- **DebugSlider** (component) — `<DebugSlider v-model="number" :label? :min? :max? :step? :suffix? :accent? :hint? :showMinMax? :disabled? />`: Slider component. Props: modelValue (number, required), label?, min?, max?, step?, suffix?, accent?, hint?, showMinMax? (boolean), disabled? (boolean). Emits: update:modelValue (number). Slots: `label` for custom label content.

## Internal dependencies

- `vue`

## Notes

- `showMinMax` gates the min/max row via `!== false`, so it renders by default unless explicitly set to false.
- No scoped `<style>` block is present; visual styling depends on externally defined `.dbg-slider*` classes and the `--accent`/`--pct` CSS variables.
