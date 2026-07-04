---
source: src/components/basic/CheckboxField.vue
source_hash: 3e3f5b1fcc0684c2ea4cf42154cfcfc14526f35dd00dd2804916b5b4406feee0
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# CheckboxField

`src/components/basic/CheckboxField.vue`

> A reusable checkbox form field Vue component that renders a labeled checkbox with v-model support, size variants, and disabled state. It exists to provide a consistent, accessible checkbox UI following BEM styling conventions across the app.

## Structure
The component renders a `<label>` wrapping a native `<input type="checkbox">` and a `<span>` label. The label's `for` and input's `id` are bound to a computed `checkboxId`.

## State & Logic
- `checkboxId` is a computed value that uses the provided `id` prop, or falls back to a generated id based on the Vue instance `uid` (via `getCurrentInstance()`), or a random string.
- `checkboxClasses` is a computed array-to-string of BEM classes: always `checkbox-field`, plus `checkbox-field--{size}` when size isn't `md`, plus `checkbox-field--disabled` when disabled.
- `handleChange` reads `event.target.checked` and emits both `update:modelValue` and `change` with the boolean value.

## Data Flow
The checkbox is controlled via `modelValue` (`:checked`) and emits `update:modelValue` on change, supporting `v-model`. It also emits a separate `change` event with the same value.

## Styling
Scoped-style-free (global `<style>`) CSS using BEM and CSS custom properties (design tokens). Includes size variants (sm/md/lg), disabled styles, focus/focus-visible outlines, high-contrast and reduced-motion media queries.

## Exports

- **CheckboxField** (component) — `<CheckboxField v-model="boolean" :label="string" :id?="string" :disabled?="boolean" :name?="string" :size?="'sm'|'md'|'lg'" />`: Labeled checkbox component. Props: modelValue (boolean, required), label (string, required), id (optional), disabled (optional, default false), name (optional), size (optional, default 'md'). Emits: 'update:modelValue' (boolean) and 'change' (boolean), both fired on input change.

## Internal dependencies

- `vue`

## Notes

- The global (non-scoped) <style> block relies on CSS custom properties (design tokens like --color-primary, --space-2, --font-size-base) that must be defined elsewhere.
- Auto-generated checkboxId uses the deprecated String.prototype.substr and Math.random as a fallback only when no instance uid is available.
