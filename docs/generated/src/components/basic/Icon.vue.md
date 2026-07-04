---
source: src/components/basic/Icon.vue
source_hash: e43ccc022d1b99e16dc2b1e4ddb98ec9301b006a27faac2320f311c5f208ab90
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Icon Component

`src/components/basic/Icon.vue`

> A thin wrapper around the Iconify Vue component that renders an icon by name with a configurable icon family/collection and preset sizing. It exists to standardize icon usage across the app by defaulting to a family prefix and applying consistent size classes.

## Rendering
The component renders `@iconify/vue`'s `Icon` component, passing a computed `iconName`, a computed `iconClasses` string, and the `inline` prop.

## Props & defaults
Uses `withDefaults(defineProps<Props>())` with: `icon` (required string), `family` (default `'flowbite'`), `size` (`'xs'|'sm'|'md'|'lg'|'xl'`, default `'md'`), and `inline` (default `false`).

## Computed logic
- `iconName`: if the `icon` string already contains a `':'` it is used as-is; otherwise it is prefixed with `${family}:` (e.g. `flowbite:home`).
- `iconClasses`: combines the base `icon` class with a size modifier class `icon--{size}`.

## Styling
Scoped-less (global `<style>`) rules define `.icon` (inline-block, vertical-align middle) and per-size modifier classes setting `font-size`, `inline-size`, and `block-size` from 12px (xs) up to 32px (xl).

## Exports

- **Icon (default SFC)** (component) — `<Icon icon="string" :family? :size? :inline? />`: Wrapper icon component. Props: `icon` (required, icon name; may include a `family:` prefix), `family` (icon collection, default 'flowbite'), `size` ('xs'|'sm'|'md'|'lg'|'xl', default 'md'), `inline` (boolean, default false). No emits or slots.

## Internal dependencies

- `@iconify/vue`
- `vue`

## Notes

- The local component is also named `Icon`, same as the imported `@iconify/vue` Icon; the template references the imported one — no naming conflict occurs but the shadowing is easy to misread.
- The `<style>` block is global (not scoped), so `.icon` and `.icon--*` classes leak into the global stylesheet.
- Prefix detection is purely based on presence of a ':' character in the icon string.
