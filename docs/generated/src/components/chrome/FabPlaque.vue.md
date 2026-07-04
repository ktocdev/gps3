---
source: src/components/chrome/FabPlaque.vue
source_hash: aee4c4acb9737b833131bbcc56a4c01b9539d6c3f25bb8ef9e37bca83b8309dc
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# FabPlaque

`src/components/chrome/FabPlaque.vue`

> A Vue single-file component that renders a decorative, themed floating action button (FAB) styled like a hanging shop plaque, together with its expandable submenu. It presents a FAB config's icon and label and wires user interaction to toggle/action/close events consumed by a parent.

## Structure
The template renders a `.fab-plaque` container whose inline style is bound to `themeVars` (CSS custom properties). Inside are a decorative peg, a `<button>` (with awning, corner studs, grain, and an inner disc/label made from `fab.icon` and `fab.label`), and a `<FabSubmenu>` child.

## Props & data flow
Accepts two props: `fab` (a `FabConfig`) and `open` (boolean). The button's `@click` emits `toggle`. The `FabSubmenu` receives `show` (from `open`), plus `theme`, `actions`, and `emptyMessage` from the `fab` config; its `@select` re-emits as `action` with the action id, and its `@close` re-emits as `close`.

## Computed state
- `tilt`: looks up a per-theme rotation (in degrees) from the local `TILT_BY_THEME` map, defaulting to `0`; applied via the `--tilt` CSS variable on the button.
- `themeVars`: reads color values from `FAB_THEMES[fab.theme]` and exposes `--fab-stripe`, `--fab-deep`, and `--fab-soft` CSS variables on the root element.

All visual styling is driven by CSS classes and these theme-derived custom properties (the `<style>` block is not included in this file excerpt).

## Exports

- **FabPlaque** (component) — `<FabPlaque :fab="FabConfig" :open="boolean" @toggle @close @action="(actionId: string)" />`: Themed FAB button plus submenu. Props: `fab` (FabConfig), `open` (boolean). Emits: `toggle` (no payload), `close` (no payload), `action` (actionId string). Delegates submenu rendering to FabSubmenu.

## Internal dependencies

- `./FabSubmenu.vue`
- `./fabThemes`

## Notes

- `TILT_BY_THEME` only defines tilts for the theme keys pink/green/violet/orange/cyan; unknown themes fall back to 0.
- `themeVars` assumes `FAB_THEMES[fab.theme]` exists and has `stripe`, `deep`, and `soft` fields; an invalid theme would break the computed.
- The `<style>` block referenced by the many BEM classes is not present in this excerpt.
