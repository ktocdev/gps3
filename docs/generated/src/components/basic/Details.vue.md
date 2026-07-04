---
source: src/components/basic/Details.vue
source_hash: 3f197b7b250ca2e86ed11261b0e4b265b369d87d8f4367e32997071df9ea92fe
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Details.vue

`src/components/basic/Details.vue`

> A reusable collapsible disclosure component wrapping the native HTML `<details>`/`<summary>` elements. It provides styled variants and a custom expand/collapse icon that reflects the open state, exposing slots for summary and content.

## Structure
Renders a native `<details>` element with `:open` bound to the `defaultOpen` prop and a `@toggle` handler. Inside, a `<summary>` shows a custom icon (`▼` when open, `▶` when closed) plus a named `summary` slot (falling back to the `summary` prop text). The default slot fills the `.details__content` area.

## State & Logic
- `isOpen` (ref) initialized from `props.defaultOpen`, drives the icon glyph.
- `detailsRef` template ref to the `<details>` DOM element.
- `handleToggle` reads `detailsRef.value.open` on the native toggle event and syncs `isOpen`.
- `detailsClasses` computed joins base `details` with a variant class (`details--{variant}`).
- `summaryClasses` computed returns the static `details__summary`.

## Styling
Scoped-less (`<style>` without scoped) BEM CSS defining three variants (`default`, `compact`, `bordered`), hover states, hidden native marker, and mobile-first responsive padding via a 768px media query. Relies on CSS custom properties (design tokens) for spacing, colors, radii, and typography.

## Exports

- **Details** (component) — `<Details :summary? :default-open? :variant? />`: Collapsible disclosure component. Props: `summary` (string, default ''), `defaultOpen` (boolean, default false), `variant` ('default' | 'compact' | 'bordered', default 'default'). Slots: `summary` (header content) and default (body content). No emits declared.

## Internal dependencies

- `vue`

## Notes

- The `<style>` block is global (not scoped), so BEM class definitions leak into the whole app.
- Requires CSS custom properties (--space-*, --color-*, --radius-*, --font-*) to be defined elsewhere; otherwise styling breaks.
- `isOpen` is only synced via the native `toggle` event, not by watching the `defaultOpen` prop, so changing `defaultOpen` after mount won't update `isOpen`.
- The `.details[open] .details__icon` rule sets `rotate(0deg)` which is effectively a no-op; the icon change is driven by the `isOpen` glyph swap, not CSS rotation.
