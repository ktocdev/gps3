---
source: src/components/debug/ui/DebugPanel.vue
source_hash: b7400477b9a65601ac5c616e1487509ee50e43918a35a85664938f895f601252
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# DebugPanel.vue

`src/components/debug/ui/DebugPanel.vue`

> A presentational Vue SFC that renders a titled panel container used within the debug UI. It provides a consistent header/content layout with optional accent-edge styling and an anchor label, and exposes slots for custom content.

## Structure
The component renders a root `.panel` div containing a `.panel__header` (with an `<h3>` title and a `header-extra` named slot) and a `.panel__content` area (with a default slot for arbitrary child content).

## Behavior
- When the `accent` prop is provided, the root element receives the `panel--accent-edge` class and sets a CSS custom property `--accent` to the prop value via inline style.
- The `header-extra` slot has default fallback content: when no slot content is supplied and the `anchor` prop is set, it renders a `<span class="dbg-anchor">` showing the anchor text.
- The default slot renders whatever child content is passed in the `.panel__content` region.

The component is purely presentational with no reactive state, no emits, and no lifecycle logic.

## Exports

- **DebugPanel** (component) — `<DebugPanel title="..." :anchor? :accent? />`: Panel wrapper component. Props: `title: string` (required, shown in header h3), `anchor?: string` (optional, shown as default header-extra content), `accent?: string` (optional CSS color; when set applies the `panel--accent-edge` class and `--accent` CSS variable). Slots: default (panel content) and `header-extra` (header add-on, defaults to the anchor span).

## Notes

- Styling for `.panel`, `.panel--accent-edge`, `.dbg-anchor`, and the `--accent` variable is not defined in this file (no scoped style block); it relies on external/global CSS.
