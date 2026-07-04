---
source: src/components/basic/NeedRow.vue
source_hash: 7b1d4636e1056f9b1a34977c0f12139cfb6175a9bd26b0013522074e228ca64c
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# NeedRow.vue

`src/components/basic/NeedRow.vue`

> A presentational Vue component that displays a single guinea pig need as a labeled row with a percentage value and a slider control. It computes an urgency level from the need's satisfaction value to drive styling.

## Structure
The component renders a `.need-row` container with a `data-need-urgency` attribute bound to the computed `urgency`. Inside, an info section shows a `<label>` (bound to `id`) and a `<span>` showing `value.toFixed(0)%`. Below that, it renders a `SliderField` configured with min 0, max 100, step 1, and a `%` suffix.

## Data flow
The component receives `value` as a prop and passes it to `SliderField` via `:modelValue`. When `SliderField` emits `update:modelValue`, this component re-emits `update:modelValue` upward, making it a pass-through/controlled input wrapper.

## Urgency computation
The `urgency` computed maps the satisfaction value to a level: `satisfied` (>=60), `good` (>=40), `medium` (>=30), otherwise `critical`. This drives the `data-need-urgency` attribute for styling (green/grey/yellow/red).

## Exports

- **NeedRow** (component) — `<NeedRow :id :label :value :needType? :showMinMax? @update:modelValue />`: Props: `id` (string), `label` (string), `value` (number, satisfaction percentage), `needType?` (NeedType, passed to SliderField), `showMinMax?` (boolean, default false). Emits: `update:modelValue` with a number when the slider value changes.

## Internal dependencies

- `./SliderField.vue`
- `../../stores/guineaPigStore (NeedType type)`

## Notes

- The `urgency` thresholds (60/40/30) are hardcoded and determine styling via the `data-need-urgency` attribute; the referenced color styles are not defined in this file.
