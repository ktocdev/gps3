---
source: src/components/chrome/ParchmentBanner.vue
source_hash: 85e23accbc16099bfb1778d12b34e0a6a18b34498eaeab1e2f9cecb0aa20d03c
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# ParchmentBanner

`src/components/chrome/ParchmentBanner.vue`

> A small presentational Vue component that renders a themed banner using a ParchmentPanel wrapper, showing an optional icon, slotted content, and a cancel button that emits a cancel event.

This SFC wraps its content in a `ParchmentPanel`, forwarding the `accent` prop to control the panel styling. Inside, a row layout displays an optional `icon` (rendered as text when provided), a default `<slot />` for arbitrary banner content, and a fixed cancel button (✕). Clicking the cancel button emits the `cancel` event to the parent. The component is purely presentational with no internal state.

## Exports

- **ParchmentBanner** (component) — `<ParchmentBanner :accent? :icon? @cancel />`: Props: `accent?: string` (styling accent passed to ParchmentPanel), `icon?: string` (optional leading icon/text). Emits: `cancel` (fired when the ✕ button is clicked). Default slot renders the banner's main content.

## Internal dependencies

- `./ParchmentPanel.vue`
