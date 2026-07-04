---
source: src/components/basic/FloatingActionButton.vue
source_hash: 19ecf15d06a0e25a2dd7e419eccdf9ce3c93783a202dec93dce75dba241ce538
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# FloatingActionButton.vue

`src/components/basic/FloatingActionButton.vue`

> A reusable Vue 3 SFC that renders a fixed-position floating action button (FAB) with an optional icon and label. It supports multiple color variants, screen corner positions, sizes, an optional pulse animation, and a hover/always/never label display mode, emitting a click event when activated (unless disabled).

## Template
Renders a `<button>` (type="button") with dynamically computed classes, a `disabled` attribute, and an `aria-label`. An icon `<span>` shows when `icon` is provided; a label `<span>` shows when `label` is set and `showLabel` is not `'never'`.

## Script
Uses `<script setup lang="ts">` with typed `Props` and `Emits`. `withDefaults` sets defaults: `showLabel='hover'`, `variant='primary'`, `position='bottom-right'`, `size='md'`, `pulse=false`, `disabled=false`. `ariaLabel` is required.

- `buttonClasses` — computed array of BEM classes composed from base plus variant/position/size modifiers, with optional `--pulse` and `--disabled` modifiers, filtered and joined.
- `labelClasses` — computed BEM classes for the label, adding `--visible` only when `showLabel === 'always'`.
- `handleClick(event)` — emits `click` with the MouseEvent only if not disabled.

## Styles
Global (non-scoped) BEM CSS driven by CSS custom properties (design tokens). Button is `position: fixed` with `z-index: 9999`. Includes mobile-first position variants using logical `inset-*` properties with `env(safe-area-inset-*)` support, size variants, color variants, disabled state, and a keyframe pulse animation (`::before`). Labels are hidden by default and revealed on hover/focus or when `--visible`. Media queries enlarge sizes/spacing on screens ≥769px, respect `prefers-reduced-motion`, and force label visibility on touch/coarse-pointer devices.

## Exports

- **FloatingActionButton** (component) — `<FloatingActionButton :ariaLabel="string" ... @click />`: Vue SFC FAB. Props: `icon?: string`, `label?: string`, `showLabel?: 'always'|'hover'|'never'` (default 'hover'), `variant?: 'primary'|'secondary'|'warning'|'danger'|'info'` (default 'primary'), `position?: 'bottom-right'|'bottom-left'|'top-right'|'top-left'` (default 'bottom-right'), `size?: 'sm'|'md'|'lg'` (default 'md'), `pulse?: boolean` (default false), `ariaLabel: string` (required), `disabled?: boolean` (default false). Emits: `click` with the MouseEvent (suppressed when disabled).

## Internal dependencies

- `vue`

## Notes

- The `<style>` block is not scoped; class names are global and rely on externally defined CSS custom properties (design tokens like --color-primary, --space-4, --radius-full).
- Positioning is forced with `position: fixed !important` and a high z-index (9999), so the button always overlays page content regardless of parent layout.
- The touch-device media query targets `.floating-action-button__label--never`, but no such class is ever applied by the component (the label is not rendered at all when showLabel==='never'), so that selector guard is effectively dead.
- Sizes `sm` and `md` are identical at mobile widths (48px); they diverge only via desktop media query behavior for `md`.
