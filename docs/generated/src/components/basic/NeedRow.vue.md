---
source: src/components/basic/NeedRow.vue
source_hash: 7cb0fd3993f072e5df07741e42ae615c26166113d8cfaacf87f4025fdf07195c
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# NeedRow.vue

`src/components/basic/NeedRow.vue`

> A presentational Vue component that displays a single guinea pig need as a labeled row containing a percentage value and a slider control. It derives an urgency level from the need's satisfaction value and exposes it for styling/theming.

## Structure
The component renders a `.need-row` container with a `data-need-urgency` attribute bound to the computed `urgency`. Inside, an info section shows a `label` (associated with the slider via `id`) and the current `value` formatted as a whole-number percentage (`value.toFixed(0)%`).

## Slider
It wraps `SliderField`, passing a fixed range (`min=0`, `max=100`, `step=1`), empty prefix, `%` suffix, and forwarding `showMinMax` and `needType`. The slider's `update:modelValue` event is re-emitted directly by this component.

## Urgency logic
The `urgency` computed maps the satisfaction `value` to one of four levels: `satisfied` (>=60), `good` (>=40), `medium` (>=30), and `critical` (below 30). This value only drives the `data-need-urgency` attribute for CSS styling.

## Props/emits
Props are typed via an interface with `showMinMax` defaulting to `false`. The single emit is `update:modelValue` carrying a number.

## Exports

- **NeedRow** (component) — `<NeedRow :id :label :value :needType? :showMinMax? @update:modelValue />`: Displays a need label, percentage value, and a 0–100 slider. Props: `id` (string), `label` (string), `value` (number), `needType?` (NeedType), `showMinMax?` (boolean, default false). Emits `update:modelValue` (number) when the slider changes.

## Internal dependencies

- `./SliderField.vue`
- `../../stores/guineaPigStore (NeedType type)`

## Notes

- The `data-need-urgency` attribute is the only consumer of the `urgency` computed; actual coloring depends on external CSS.
- No styles are defined in this SFC despite BEM-style class names; styling relies entirely on global/external CSS.
