---
source: src/components/basic/Select.vue
source_hash: b8229dc16b6a6530909b28ededd9fa62a7c0d3cc2b4e957130c2aad70ff7e46f
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Select.vue

`src/components/basic/Select.vue`

> A reusable, accessible select/dropdown component built as a Vue 3 SFC using the composition API with TypeScript. It renders a native `<select>` element with support for label, placeholder, error messaging, size and variant styling, and handles v-model binding with automatic numeric type coercion.

## Template
Renders a `.select` wrapper containing an optional `<label>`, a `.select__container` with the native `<select>`, a custom chevron SVG icon, and an optional error message. Options are rendered via `v-for`, supporting an optional disabled placeholder option.

## Options handling
Options can be primitives (`string`/`number`) or objects (`{ label, value, disabled? }`). Three helpers normalize them: `getOptionValue`, `getOptionLabel`, and `getOptionDisabled` inspect whether the option is an object and extract accordingly.

## State & IDs
`selectId` is computed from the `id` prop, falling back to a generated id based on the component instance `uid` (via `getCurrentInstance()`) or a random string.

## Styling
`selectWrapperClasses` builds a BEM class list combining base, size (`select--{size}`), variant (`select--{variant}`), and conditional `select--disabled` / `select--error` modifiers. `selectClasses` is a static `select__input`. Extensive scoped-less (global) `<style>` block implements BEM styling with CSS custom properties, size/variant modifiers, error/disabled states, and accessibility media queries (high contrast, reduced motion).

## Change handling
`handleChange` reads the target value and coerces it to a number when `Number(value)` is not `NaN`, then emits both `update:modelValue` and `change` with the converted value.

## Internal dependencies

- `vue`
