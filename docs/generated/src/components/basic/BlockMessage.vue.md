---
source: src/components/basic/BlockMessage.vue
source_hash: ebcaec59ce93b51b1664b2bbdb6288dd12b47de115a9c00b160df7b0ce1f4e1a
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# BlockMessage

`src/components/basic/BlockMessage.vue`

> A presentational Vue component that renders a styled message block for surfacing status or informational content. It wraps arbitrary slot content in a container styled according to a semantic or themed variant.

### Structure
The component renders a single `div` whose class list is computed from the `variant` prop, containing a default `<slot>` for the message content.

### Logic
`messageClasses` is a computed property that joins the base class `block-message` with a variant modifier class `block-message--{variant}`. It recalculates whenever the `variant` prop changes.

### Styling
Unscoped `<style>` defines the base `.block-message` styles (padding, border-radius, font, margin, transparent border) and per-variant modifier classes. Variants fall into semantic (`error`, `warning`, `success`, `info`) and themed (`pink`, `green`, `dark`, `light`) groups, each setting background, text color, and border color via CSS custom properties.

## Exports

- **BlockMessage** (component) — `<BlockMessage :variant="'error'|'warning'|'success'|'info'|'pink'|'green'|'dark'|'light'">slot</BlockMessage>`: Renders slotted content inside a styled message block. Props: `variant` (optional, defaults to `'info'`) controls the visual style. Exposes a default slot for message content. No emits.

## Internal dependencies

- `vue`

## Notes

- The `<style>` block is unscoped, so the `.block-message` classes are global and may collide with other stylesheets.
- All colors rely on CSS custom properties (e.g. `--color-error-bg`, `--space-3`) that must be defined elsewhere in the app for correct rendering.
