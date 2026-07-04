---
source: src/components/chrome/FabPlaque.vue
source_hash: 71c50138deb7fc391fe412c3f417ef975e873572ede3b0b55fba0c45f393a1a0
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# FabPlaque.vue

`src/components/chrome/FabPlaque.vue`

> A presentational Vue component rendering a decorative floating action button (FAB) styled as a 'plaque' with a peg, awning, studs, and grain, plus a toggleable submenu. It surfaces a configured FAB's icon and label and delegates open/close/action interactions to its parent.

## Structure
The template renders a `.fab-plaque` container whose inline style is driven by `themeVars`. Inside it: a decorative peg, a `<button>` with theme-based tilt, various aria-hidden decorative spans (awning, four studs, grain), and an inner block showing `fab.icon` (in `.fab-plaque__disc`) and `fab.label`. Below the button is a `FabSubmenu` child.

## Props & emits
Props: `fab` (a `FabConfig`) and `open` (boolean). Emits: `toggle` (button click), `close`, and `action` with an `actionId` string.

## Data flow
- Clicking the button emits `toggle`.
- `FabSubmenu` receives `show` bound to `open`, plus `fab.theme`, `fab.actions`, and `fab.emptyMessage`; its `select` event is forwarded as `action`, and its `close` event as `close`.
- `tilt` is a computed lookup in `TILT_BY_THEME` keyed by `fab.theme`, defaulting to 0, applied via the `--tilt` CSS custom property.
- `themeVars` computes CSS custom properties (`--fab-stripe`, `--fab-deep`, `--fab-soft`) from `FAB_THEMES[fab.theme]`.

The component contains no `<style>` block, so the numerous BEM class names rely on styles defined elsewhere (globally or by convention).

## Exports

- **FabPlaque** (component) — `<FabPlaque :fab="FabConfig" :open="boolean" @toggle @close @action="(actionId: string)" />`: Vue SFC (script setup). Props: `fab: FabConfig`, `open: boolean`. Emits: `toggle: []`, `close: []`, `action: [actionId: string]`. Renders a themed FAB button plus a FabSubmenu.

## Internal dependencies

- `./FabSubmenu.vue`
- `./fabThemes (FAB_THEMES, FabConfig)`
- `vue`

## Notes

- No `<style>` block exists in this file; the BEM class names (`.fab-plaque__*`) depend on styles defined elsewhere.
- `TILT_BY_THEME` only defines tilt values for themes pink/green/violet/orange/cyan; any other theme falls back to 0.
- `themeVars` assumes `FAB_THEMES[fab.theme]` is defined and exposes `stripe`, `deep`, and `soft`.
