---
source: src/components/basic/Icon.vue
source_hash: 4277b41445bea167eb7e3aedf51a33f55b04307542be719408d38eb0362b4f3d
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Icon Component

`src/components/basic/Icon.vue`

> A thin wrapper around @iconify/vue's Icon component that provides a consistent icon family default and size presets for the application. It exists to standardize icon usage by auto-prefixing icon names with a collection family and applying named size classes.

This SFC renders the `@iconify/vue` `Icon` component, passing a resolved icon name, computed CSS classes, and the `inline` flag.

### Props
- `icon` (string, required): the icon identifier.
- `family` (string, default `'flowbite'`): icon collection prefix.
- `size` (`'xs' | 'sm' | 'md' | 'lg' | 'xl'`, default `'md'`): size preset.
- `inline` (boolean, default `false`): passed through to Iconify's `inline`.

### Logic
- `iconName` computed: if `props.icon` already contains `':'` it is used as-is; otherwise it is prefixed with `${props.family}:`.
- `iconClasses` computed: builds a class string of `icon` plus `icon--{size}`.

### Styling
Global (non-scoped) `<style>` defines the base `.icon` class (inline-block, vertical-align middle) and five size modifier classes (`icon--xs` through `icon--xl`) each setting matching `font-size`, `inline-size`, and `block-size` from 12px to 32px.

## Internal dependencies

- `@iconify/vue`
- `vue`

## Notes

- The `<style>` block is not scoped, so `.icon` and its size modifiers are global.
- Icon names containing ':' bypass the `family` prefix entirely.
