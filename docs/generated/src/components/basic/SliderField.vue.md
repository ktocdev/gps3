---
source: src/components/basic/SliderField.vue
source_hash: f3ddc75091237a7859fc21a77cfcd2bfab685cf8d3b37371124a239208b1296c
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# SliderField.vue

`src/components/basic/SliderField.vue`

> A reusable range slider input component with optional label, live value display, min/max range labels, size variants, and need-specific thumb coloring. It provides a two-way bindable numeric control via v-model.

## Structure
Renders a wrapper `div` containing an optional `label`, a native `<input type="range">`, and an optional min/max range display. The label shows the current value with optional `prefix`/`suffix` when `showValue` is true.

## State & Computed
- `sliderId`: computed unique id derived from `props.id`, or falls back to `slider-${instance.uid}` (or a random string) using `getCurrentInstance()`.
- `sliderWrapperClasses`: builds `slider`, `slider--{size}`, and conditional `slider--disabled` classes.
- `sliderClasses`: builds `slider__input` plus optional `slider__input--{needType}` modifier for need-specific coloring.

## Data Flow
The input's `value` is bound to `modelValue` (one-way binding, not `v-model` on the input). On `input`, `handleInput` reads `event.target.value`, converts it to a `Number`, and emits both `update:modelValue` and `change` with the numeric value.

## Styling
Extensive scoped-less (global) `<style>` block styling the range track and thumb across WebKit and Firefox, size variants (`sm`/`md`/`lg`), disabled state, focus rings, and per-need thumb colors (hunger, thirst, energy, shelter, play, social, comfort, hygiene, nails, chew) driven by CSS custom properties. Respects `prefers-reduced-motion`.

## Internal dependencies

- `vue`
