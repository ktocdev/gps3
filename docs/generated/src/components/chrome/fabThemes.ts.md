---
source: src/components/chrome/fabThemes.ts
source_hash: 0d61a307f28a50d1f22e797c90b4ae8fa75aeece23d6bb65ff06daf361659368
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# FAB Themes & Config Types

`src/components/chrome/fabThemes.ts`

> Defines the color theme palette and TypeScript types used by the floating action button (FAB) menu chrome. It maps a set of named FAB themes to CSS custom-property-based color tokens and declares the shape of FAB actions and configuration objects consumed by the FabMenu component.

This is a pure data/types module with no runtime logic beyond a single exported constant map.

### Themes
`FAB_THEMES` is a `Record<FabTheme, FabThemeColors>` covering five named themes (`pink`, `green`, `violet`, `orange`, `cyan`). Each entry provides three color strings — `stripe`, `deep`, and `soft` — mostly referencing CSS variables (`var(--color-*)`) with a few hardcoded hex fallbacks (e.g. `#ecfccb`, `#fff1d6`, `#e0f7fa`).

### Types
- `FabTheme` — string union of the five theme names.
- `FabThemeColors` — the three-color shape for a theme.
- `FabAction` — a menu action with `id`, `icon`, `label`, and optional `disabled` flag (disabled actions are rendered greyed out with a "Soon" tag per the comment).
- `FabConfig` — a full FAB configuration: `theme`, `icon`, `label`, an array of `actions`, and an optional `emptyMessage`.

The file exists to centralize FAB theming/config contracts, ported from a prototype `FabMenu.jsx` `FAB_THEMES`.

## Exports

- **FabTheme** (type) — `type FabTheme = 'pink' | 'green' | 'violet' | 'orange' | 'cyan'`: String union of the available FAB theme names.
- **FabThemeColors** (type) — `interface FabThemeColors { stripe: string; deep: string; soft: string }`: Color triple for a FAB theme, values are CSS color strings or var() references.
- **FAB_THEMES** (constant) — `const FAB_THEMES: Record<FabTheme, FabThemeColors>`: Maps each theme name to its stripe/deep/soft color tokens.
- **FabAction** (type) — `interface FabAction { id: string; icon: string; label: string; disabled?: boolean }`: A single FAB menu action; `disabled` marks actions not yet wired to a game effect.
- **FabConfig** (type) — `interface FabConfig { theme: FabTheme; icon: string; label: string; actions: FabAction[]; emptyMessage?: string }`: Full configuration for a FAB menu, including its theme, icon, label, actions list, and optional empty-state message.

## Notes

- Color values mix CSS custom properties (var(--color-*)) with hardcoded hex fallbacks, so theming consistency depends on those CSS variables being defined elsewhere.
- `disabled` actions are expected by consumers to render greyed out with a "Soon" tag; this file only declares the flag, not the behavior.
