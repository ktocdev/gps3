---
source: src/components/basic/BlockMessage.vue
source_hash: 5a9861fd90a303c0b1bf3e43f2f3de961de05ecdeb15a9e4208a99b36dac23a3
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# BlockMessage

`src/components/basic/BlockMessage.vue`

> A presentational Vue SFC that renders a styled message block with a variant-based color scheme. It wraps slotted content in a div whose CSS classes are derived from a `variant` prop, providing consistent semantic and themed message styling across the app.

## Structure
The template renders a single `<div>` bound to a computed class list, with a default `<slot>` for arbitrary content.

## Logic
The component accepts one optional prop `variant` (defaulting to `'info'`). A `messageClasses` computed property joins the base class `block-message` with a modifier class `block-message--{variant}`. There is no reactive state beyond the prop and no emitted events.

## Styling
Global (non-scoped) CSS defines the `.block-message` base (padding, radius, font size/weight, bottom margin, transparent border) and eight variant modifier classes. Semantic variants (`error`, `warning`, `success`, `info`) and themed variants (`pink`, `green`, `dark`, `light`) each set background, text color, and border color via CSS custom properties (design tokens).

## Exports

- **BlockMessage** (component) — `<BlockMessage :variant="'error'|'warning'|'success'|'info'|'pink'|'green'|'dark'|'light'">slot</BlockMessage>`: Default component export. Props: `variant` (optional, one of 'error' | 'warning' | 'success' | 'info' | 'pink' | 'green' | 'dark' | 'light', defaults to 'info'). Renders slotted content inside a styled div. No emits.

## Internal dependencies

- `vue`

## Notes

- The `<style>` block is not scoped, so the `.block-message` classes are global and could collide with other stylesheets.
- Relies on externally defined CSS custom properties (e.g. --color-error-bg, --space-3, --radius-md); styling will break if these tokens are not provided by a parent/global stylesheet.
- The `green` variant reuses success tokens and is visually identical to `success`.
