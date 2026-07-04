---
source: src/components/basic/SliderField.vue
source_hash: 1f398b7bcd2cf8458d72e726db3aecae2920da634866ed4529388bd84b57595f
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# SliderField.vue

`src/components/basic/SliderField.vue`

> A reusable range slider input component that wraps a native HTML `<input type="range">` with a label, optional current-value display, and optional min/max labels. It supports v-model binding, size variants, and need-specific thumb coloring for the game's need types.

## Template
Renders a wrapper `<div>` with dynamic classes, an optional `<label>` showing the label text plus an optional current value (`prefix` + `modelValue` + `suffix`), the range `<input>`, and an optional min/max range row.

## State & Logic
- **sliderId**: computed unique id, using `props.id` if provided, otherwise `slider-{instance.uid}` (falling back to a random string).
- **sliderWrapperClasses**: computed class string combining base `slider`, size modifier (`slider--{size}`), and `slider--disabled` when disabled.
- **sliderClasses**: computed classes for the input, adding `slider__input--{needType}` when `needType` is set to apply need-specific thumb colors.
- **handleInput**: on the native `input` event, converts the target value to a Number and emits both `update:modelValue` and `change` with that value.

## Styling
Extensive scoped-less `<style>` block styling the track and thumb across WebKit and Firefox, size variants (`sm`/`md`/`lg`), disabled states, focus ring, and per-need thumb colors (hunger, thirst, energy, shelter, play, social, comfort, hygiene, nails, chew) via CSS custom properties. Respects `prefers-reduced-motion`.

## Exports

- **SliderField** (component) — `<SliderField v-model="number" :min :max :step :label :needType ... />`: Range slider component. Props: modelValue (number, required), id?, min (default 0), max (default 100), step (default 1), label?, disabled (default false), showValue (default true), showMinMax (default false), size ('sm'|'md'|'lg', default 'md'), prefix (default ''), suffix (default ''), needType? (string appended as thumb-color modifier class). Emits: 'update:modelValue' (number) and 'change' (number).

## Internal dependencies

- `vue`

## Notes

- Relies on CSS custom properties (e.g. --color-primary, --color-need-* variables) defined elsewhere; needType must match a predefined need class (hunger, thirst, energy, shelter, play, social, comfort, hygiene, nails, chew) to color the thumb.
- The style block is global (not scoped), so class names like .slider__input leak across the app.
- Focus ring color is hardcoded rgba(236, 72, 153, 0.2) rather than a CSS variable.
