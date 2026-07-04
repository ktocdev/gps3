---
source: src/components/basic/CheckboxField.vue
source_hash: 36c2ec6377415c86b9b57a807fd10273cfc1769ee2d05c129a7908d046449f78
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# CheckboxField

`src/components/basic/CheckboxField.vue`

> A reusable Vue 3 checkbox form control component with `v-model` support, an associated label, size variants, and accessibility styling. It exists to provide a consistent, styled checkbox input across the application following BEM CSS conventions.

## Structure
The component renders a `<label>` wrapping a native `<input type="checkbox">` and a `<span>` label. The label's `for` attribute and the input's `id` are bound to a computed `checkboxId`.

## State & Logic
- `checkboxId` is a computed value that uses the provided `id` prop, or falls back to `checkbox-${instance.uid}` (from `getCurrentInstance()`), or a random string.
- `checkboxClasses` is a computed array-to-string of BEM classes: always `checkbox-field`, plus `checkbox-field--{size}` when size is not `md`, plus `checkbox-field--disabled` when disabled.
- `handleChange` reads `target.checked` and emits both `update:modelValue` and `change` with the boolean value.

## Data Flow
The input's `:checked` is bound to `modelValue` (controlled). On `change`, it emits `update:modelValue` (enabling `v-model`) and a separate `change` event. Styling is defined inline in a non-scoped `<style>` block using CSS custom properties for theming, with size variants, disabled states, focus-visible, high-contrast, and reduced-motion support.

## Exports

- **CheckboxField** (component) — `<CheckboxField v-model="boolean" :label="string" :id?="string" :disabled?="boolean" :name?="string" :size?="'sm'|'md'|'lg'" />`: Checkbox component. Props: `modelValue` (boolean, required), `label` (string, required), `id` (string, optional), `disabled` (boolean, default false), `name` (string, optional), `size` ('sm'|'md'|'lg', default 'md'). Emits: `update:modelValue` (boolean) and `change` (boolean).

## Internal dependencies

- `vue`

## Notes

- The `<style>` block is not scoped, so its `.checkbox-field*` classes are global and rely on CSS custom properties (e.g. `--color-primary`) defined elsewhere.
- Uses `getCurrentInstance()` for the fallback id; the random-string fallback recomputes only within the computed, but is stable per component instance since `instance.uid` is normally available.
