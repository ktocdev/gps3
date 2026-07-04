---
source: src/components/basic/Details.vue
source_hash: 45d217d2fbf0bbf81f94fefb7160f1447eb55e4fa5723a51e30bf05199a5f421
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Details.vue

`src/components/basic/Details.vue`

> A reusable collapsible disclosure component built on the native HTML `<details>`/`<summary>` elements. It provides styled variants and a custom toggle icon that reflects open/closed state, allowing content to be shown or hidden by the user.

## Structure
Renders a native `<details>` element (referenced via `detailsRef`) with a `<summary>` containing a custom icon (`▼`/`▶`) and either a `summary` slot or the `summary` prop text. The default slot holds the collapsible content wrapped in `.details__content`.

## State & Logic
- `isOpen` is a ref initialized from the `defaultOpen` prop, driving which icon character is shown.
- The `<details>` `open` attribute is bound to `defaultOpen`.
- `handleToggle` runs on the native `toggle` event, syncing `isOpen` to the actual `detailsRef.value.open` state.
- `detailsClasses` computes `details` plus a variant class (`details--{variant}`).
- `summaryClasses` always returns `details__summary`.

## Styling
Scoped-less (global) styles using BEM naming and CSS custom properties. Three variants (`default`, `compact`, `bordered`) alter background/border. The native disclosure marker is hidden. Includes hover states and mobile-first responsive padding adjustments at the 768px breakpoint.

## Exports

- **Details** (component) — `<Details :summary? :defaultOpen? :variant? />`: Collapsible disclosure component. Props: `summary` (string, default ''), `defaultOpen` (boolean, default false), `variant` ('default' | 'compact' | 'bordered', default 'default'). Slots: `summary` (header content, falls back to `summary` prop) and default (collapsible body). Emits no custom events.

## Internal dependencies

- `vue`

## Notes

- The `.details[open] .details__icon` rule applies `transform: rotate(0deg)` which is a no-op; the visual open/closed indication comes from swapping the ▼/▶ characters via `isOpen`, not from icon rotation.
- Relies on global CSS custom properties (e.g. `--space-3`, `--color-bg-secondary`) being defined elsewhere; the `<style>` block is not scoped.
