---
source: src/components/basic/FloatingActionButton.vue
source_hash: d0684f840f00ea93f842df37441a5098fe773efb421465e783cccf96c0c9c4c6
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# FloatingActionButton.vue

`src/components/basic/FloatingActionButton.vue`

> A reusable floating action button (FAB) component that renders a fixed-position circular button with an optional icon and label. It supports multiple visual variants, screen positions, sizes, an optional pulse animation, and configurable label visibility, emitting a click event when pressed and enabled.

## Template
Renders a `<button type="button">` with dynamically computed classes, an `:aria-label`, and a `:disabled` binding. Inside, an optional icon `<span>` is shown when `icon` is provided, and a label `<span>` is shown when `label` exists and `showLabel !== 'never'`. Click events go through `handleClick`.

## Script
Uses `<script setup lang="ts">`. Props are declared via `defineProps<Props>()` with `withDefaults` supplying defaults: `showLabel: 'hover'`, `variant: 'primary'`, `position: 'bottom-right'`, `size: 'md'`, `pulse: false`, `disabled: false`. `ariaLabel` is required.

Two computed properties build BEM-style class strings:
- `buttonClasses` combines base, variant, position, size, and conditional `--pulse`/`--disabled` modifiers.
- `labelClasses` combines base label class plus a `--visible` modifier when `showLabel === 'always'`.

`handleClick` emits `'click'` with the MouseEvent only when `disabled` is false.

## Styles
Unscoped global CSS using BEM methodology and CSS custom properties (design tokens). Key behaviors: `position: fixed !important` with high `z-index: 9999`; position variants use logical `inset-*` properties with `env()` safe-area insets; mobile-first sizing that scales up at `min-width: 769px`; a keyframe pulse animation via `::before`; label shown on hover/focus (or always via modifier), with a CSS arrow via `::after`. Respects `prefers-reduced-motion` and forces label visibility on touch/coarse-pointer devices.

## Internal dependencies

- `vue`

## Notes

- Styles are global (unscoped `<style>`), so the BEM class names leak into the global namespace and can collide.
- Positioning relies on CSS custom properties (e.g. `--color-primary`, `--space-4`, `--radius-full`, `--shadow-lg`) that must be defined elsewhere in the app.
- The touch-device rule targets `.floating-action-button__label:not(.floating-action-button__label--never)`, but the component never emits a `--never` modifier class, so the label is always forced visible on coarse-pointer devices when rendered.
- `pointer-events: auto` on base plus `pointer-events: none` on the `--disabled` modifier both suppress interaction; `handleClick` also guards against emitting when disabled.
