---
source: src/components/basic/ToggleGroup.vue
source_hash: f3cb80113bb2f6af0320cbd3c0a36de53667b320fedb99895b323524566fbe34
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# ToggleGroup.vue

`src/components/basic/ToggleGroup.vue`

> A segmented toggle button group component that renders a set of mutually exclusive options and emits selection changes via v-model. Used for choosing a single value from a small list of options.

## Structure
The component renders a `div.toggle-group` containing one `button.toggle-group__option` per entry in the `options` array. Each button displays the option's `label` and is marked selected (`toggle-group__option--selected`) when its `value` matches the `modelValue` prop.

## State & Data Flow
There is no internal state. Clicking a button calls `selectOption(value)`, which emits `update:modelValue` with the option's value, supporting `v-model` binding. Selection highlighting is driven purely by comparing `modelValue` to each option's value.

## Styling
The `toggleGroupClasses` computed property adds a size modifier class (`toggle-group--sm` or `toggle-group--md`) based on the `size` prop (defaults to `sm`). Styles use CSS custom properties for theming, include focus-visible outlines, and disable transitions under `prefers-reduced-motion`.

## Exports

- **ToggleGroup** (component) — `<ToggleGroup v-model="string" :options="ToggleOption[]" :size="'sm'|'md'" />`: Segmented toggle button group. Props: `modelValue: string` (currently selected value), `options: ToggleOption[]` (array of `{ value: string; label: string }`), `size?: 'sm' | 'md'` (defaults to 'sm'). Emits: `update:modelValue` with the selected value string.

## Internal dependencies

- `vue`
