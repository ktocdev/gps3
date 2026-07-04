---
source: src/components/basic/Select.vue
source_hash: b365a535e762b0cbcdfcd8a0b5fe89f21b45d98fa4f5a09a22b64241e0616b4b
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Select.vue

`src/components/basic/Select.vue`

> A reusable Vue 3 select/dropdown component built with the composition API and BEM-styled CSS. It renders a native `<select>` element with optional label, placeholder, custom dropdown icon, error message, and supports multiple sizes and variants. It provides two-way binding via `v-model` and normalizes string/number/object option formats.

### Rendering
The template renders an optional `<label>`, a `.select__container` holding the native `<select>`, a custom SVG chevron icon (`.select__icon`), and an optional error message div. Options come from the `options` prop, which can be primitives (string/number) or objects with `label`, `value`, and optional `disabled`.

### State & Logic
- `selectId` is a computed unique id derived from the `id` prop, or falls back to the component instance `uid` (via `getCurrentInstance()`), or a random string.
- `selectWrapperClasses` builds the BEM class list from `size`, `variant`, `disabled`, and `error` props.
- `selectClasses` always returns `'select__input'`.
- Helper functions `getOptionValue`, `getOptionLabel`, and `getOptionDisabled` normalize each option regardless of whether it's a primitive or object.
- `handleChange` reads the target value, converts it to a number when it is numeric (via `isNaN(Number(value))` check), then emits both `update:modelValue` and `change` with the converted value.

### Data Flow
The native select's `value` is bound to `modelValue`. On change, the handler emits the (possibly number-converted) value for v-model support and a separate `change` event.

### Styling
Extensive scoped-less (global `<style>`) BEM CSS using CSS custom properties (design tokens). Includes size modifiers (sm/md/lg with iOS touch-target min heights), variants (default/bordered), error/disabled states, focus-visible outlines, and media queries for high-contrast and reduced-motion preferences.

## Exports

- **Select** (component) — `<Select v-model="value" :options="..." />`: Native select wrapper component. Props: modelValue (string|number, required), options (SelectOption[], required), id?, label?, ariaLabel?, placeholder?, disabled? (default false), error?, size? ('sm'|'md'|'lg', default 'md'), variant? ('default'|'bordered', default 'default'). Emits: 'update:modelValue' and 'change', both with the selected value (string|number).
- **SelectOption** (type) — `type SelectOption = string | number | { label: string; value: string | number; disabled?: boolean }`: Union type for accepted option items; defined locally in the script but not exported outside the SFC.

## Internal dependencies

- `vue`

## Notes

- handleChange coerces any numeric-looking string value to a Number via isNaN(Number(value)). An empty string ('') converts to 0 because Number('') === 0, which can be surprising for placeholder/empty selections.
- The placeholder option uses value="" and is disabled; selecting it isn't normally possible, but the numeric coercion behavior above still applies to any empty value.
- The `<style>` block is global (not scoped), so BEM class names like .select and .select__input are exposed application-wide.
- selectId falls back to Math.random when instance uid is unavailable, which is non-deterministic across renders.
