---
source: src/components/basic/ToggleGroup.vue
source_hash: 8ab6d213851ecc3267db36c80968bc8a18f315d19d8611d2ccf2df8f6efb3e16
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# ToggleGroup

`src/components/basic/ToggleGroup.vue`

> A reusable Vue 3 segmented toggle/button-group component that renders a horizontal set of selectable options and supports v-model binding for the currently selected value.

## Structure
The template renders a `div.toggle-group` containing a `<button>` for each entry in the `options` array. Each button displays `option.label`, is keyed by `option.value`, and receives a `--selected` modifier class when `modelValue` matches its value.

## Logic
The `<script setup>` defines typed `Props` (`modelValue`, `options`, optional `size`) and an `Emits` type for `update:modelValue`, enabling v-model support. `size` defaults to `'sm'` via `withDefaults`.

A computed `toggleGroupClasses` produces a size modifier class (`toggle-group--sm` or `toggle-group--md`) applied to the root element. Clicking a button calls `selectOption`, which emits `update:modelValue` with that option's value; the parent controls selection state.

## Styling
Scoped-less global `<style>` block styles the group as an inline-flex bar with rounded corners, dividers between options, a highlighted selected state using primary color, size variants (sm/md controlling padding and min height), focus-visible outlines, and reduced-motion support. Colors and spacing come from CSS custom properties (design tokens).

## Exports

- **ToggleGroup** (component) — `<ToggleGroup v-model="string" :options="ToggleOption[]" :size="'sm'|'md'" />`: Segmented button group. Props: `modelValue: string` (selected value), `options: {value:string,label:string}[]`, `size?: 'sm'|'md'` (default 'sm'). Emits `update:modelValue` with the clicked option's value.

## Internal dependencies

- `vue`

## Notes

- The `<style>` block is not scoped, so its class rules are global.
- Selection is fully controlled by the parent via v-model; the component holds no internal selection state.
