---
source: src/components/basic/Button.vue
source_hash: 2c4c468b444328efae7ebd2dd7967a3a6074744ae94a146903444499fba5eec4
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Button.vue

`src/components/basic/Button.vue`

> A reusable base button component using BEM CSS methodology. It renders a native button element with configurable variant, size, and state modifiers, and optionally wraps it in a container with a hover/focus tooltip. It is a foundational UI primitive for the application.

## Template
Renders one of two structures based on the `tooltip` prop. When `tooltip` is set, it wraps the `<button>` in a `.button-wrapper` div alongside a `<span>` tooltip; otherwise it renders a bare `<button>`. Both variants share the same bindings: `buttonClasses`, `disabled`, `type`, a `@click` handler, and a default `<slot>` for content.

## Logic
- `buttonClasses` (computed) builds a space-joined BEM class string from base `button` plus variant, size, and conditional modifiers (`--full-width`, `--disabled`, `--selected` only when variant is `segmented`, `--icon-only`). Falsy entries are filtered out.
- `tooltipClasses` (computed) combines `button__tooltip` with a position modifier from `tooltipPosition`.
- `handleClick` emits a `click` event with the MouseEvent only when not disabled.

## Styling
An extensive non-scoped `<style>` block implements all variants (primary, secondary, tertiary, danger, warning, segmented), sizes (sm/md/lg with iOS touch-target minimums), icon-only mode, full-width, focus/focus-visible states, high-contrast and reduced-motion media queries, and a complete tooltip system with directional arrows (top/bottom/left/right) shown on wrapper hover/focus-within. All colors, spacing, and radii come from CSS custom properties (design tokens).

## Exports

- **Button** (component) — `<Button variant size disabled type fullWidth selected iconOnly tooltip tooltipPosition @click />`: Props: `variant` ('primary'|'secondary'|'tertiary'|'danger'|'warning'|'segmented', default 'primary'), `size` ('sm'|'md'|'lg', default 'md'), `disabled` (boolean, default false), `type` ('button'|'submit'|'reset', default 'button'), `fullWidth` (boolean, default false), `selected` (boolean, default false; only affects styling when variant is 'segmented'), `iconOnly` (boolean, default false), `tooltip` (string, default ''; presence toggles the wrapper+tooltip render path), `tooltipPosition` ('top'|'bottom'|'left'|'right', default 'top'). Emits: `click` with the MouseEvent, suppressed when disabled. Has a default slot for button content.

## Internal dependencies

- `vue`

## Notes

- The `<style>` block is global (not scoped), so all `.button*` classes and CSS variables leak into the global scope.
- `selected` styling only applies when `variant === 'segmented'`; otherwise the `--selected` class is not added.
- The tooltip only renders when the `tooltip` prop is a non-empty string; the styles rely on the `.button-wrapper` and design-token CSS variables (e.g. `--z-index-tooltip`, `--color-neutral-900`) being defined elsewhere.
- `handleClick` guards against emitting when disabled, but the native disabled attribute already prevents clicks; this is a redundant safeguard.
