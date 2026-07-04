---
source: src/components/basic/Button.vue
source_hash: a6813dd7cf0cae3b5d0bf9d0bd5db1ec4e0e3049489905c0547cb5857a1d359d
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Button.vue

`src/components/basic/Button.vue`

> A reusable base button component following BEM CSS methodology. It renders a styled `<button>` element with configurable variant, size, and modifier props, and optionally wraps it with a hover/focus tooltip. It is a foundational UI primitive used across the application.

## Template
Renders one of two structures based on the `tooltip` prop. When `tooltip` is truthy, the button is wrapped in a `.button-wrapper` div alongside a `.button__tooltip` span. Otherwise a bare `<button>` is rendered. Both branches share the same bindings: `buttonClasses`, `disabled`, `type`, a `@click` handler, and a default `<slot>` for content.

## Script
Uses `<script setup>` with typed props via `withDefaults`. Two computed properties build class strings:
- `buttonClasses` combines the base `button` class with variant, size, and conditional modifiers (`full-width`, `disabled`, `selected` (only when variant is `segmented`), `icon-only`), filtering out empty strings.
- `tooltipClasses` combines the base tooltip class with a position modifier.

`handleClick` emits a `click` event with the MouseEvent, but only when the button is not disabled.

## Styling
A large unscoped `<style>` block implements the full BEM system: base styles, variants (primary, secondary, tertiary, danger, warning, segmented), sizes (sm/md/lg with iOS touch-target minimums), modifiers (full-width, icon-only), and a complete tooltip system with four directional positions (top/bottom/left/right) using arrow pseudo-elements. Includes accessibility support for focus-visible, high contrast, and reduced motion. Relies heavily on CSS custom properties (design tokens) for colors, spacing, radius, and transitions.

## Exports

- **Button** (component) — `<Button variant size disabled type fullWidth selected iconOnly tooltip tooltipPosition @click />`: Vue SFC button component. Props: `variant` ('primary'|'secondary'|'tertiary'|'danger'|'warning'|'segmented', default 'primary'), `size` ('sm'|'md'|'lg', default 'md'), `disabled` (boolean, default false), `type` ('button'|'submit'|'reset', default 'button'), `fullWidth` (boolean, default false), `selected` (boolean, default false; only applies styling when variant is 'segmented'), `iconOnly` (boolean, default false), `tooltip` (string, default ''; when set, renders wrapper + tooltip), `tooltipPosition` ('top'|'bottom'|'left'|'right', default 'top'). Emits: `click` with the MouseEvent (suppressed when disabled). Provides a default slot for button content.

## Internal dependencies

- `vue`

## Notes

- The `selected` modifier class is only applied when `variant === 'segmented'`; using `selected` with other variants has no visual effect.
- `handleClick` guards against emitting when disabled, in addition to the native `disabled` attribute on the button.
- The `<style>` block is global (unscoped) and depends on many external CSS custom properties (design tokens) being defined elsewhere.
- Tooltip visibility is CSS-driven via `:hover`/`:focus-within` on `.button-wrapper`, including a `:has()` selector to show tooltips even for disabled buttons.
