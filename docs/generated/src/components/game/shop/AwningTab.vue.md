---
source: src/components/game/shop/AwningTab.vue
source_hash: d1a5f9756b6eef0194a2314fe334b5e9b426cef01ded3fd9c7155643920b9531
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# AwningTab.vue

`src/components/game/shop/AwningTab.vue`

> A presentational Vue button component styled as a striped shop awning tab, used to render a single selectable category tab in the game's shop UI.

### Structure
Renders a `<button>` with a decorative awning canopy `div`, an SVG scallop edge (a fixed decorative path), and a label span containing an icon and text.

### Props & styling
The `accent` and `soft` color props are injected as CSS custom properties (`--awning-accent`, `--awning-soft`) via inline `:style`, allowing the scoped CSS to theme each tab. The `active` prop toggles the `awning-tab--active` class and sets the `aria-pressed` attribute for accessibility.

### Interaction
Clicking the button emits a parameterless `click` event to the parent. The component holds no internal state — it is purely driven by props and delegates selection logic upward.

## Exports

- **AwningTab** (component) — `<AwningTab :label :icon :accent :soft :active @click />`: Button-based shop category tab. Props: `label: string`, `icon: string`, `accent: string`, `soft: string`, `active: boolean`. Emits: `click` (no payload). Uses `accent`/`soft` as CSS variables and `active` for the active class and `aria-pressed`.

## Notes

- The scallop SVG path is hard-coded and sized for a 180-wide viewBox with `preserveAspectRatio="none"`, so it stretches to the button width.
- Themed colors rely on scoped CSS (not shown) consuming the `--awning-accent` and `--awning-soft` custom properties.
