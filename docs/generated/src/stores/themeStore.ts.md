---
source: src/stores/themeStore.ts
source_hash: 1c8c306ba3a9c3c48ca7742f3226934e83e582b457db0da4d8dd1e0d7b5877b2
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Theme Store

`src/stores/themeStore.ts`

> A Pinia store that holds two independent theming axes for the application: a debug dashboard theme (light/dark) and a game chrome theme (default/low-stim). It centralizes theme state and provides mutators so components can toggle or set themes, with state persisted across sessions.

Defined via `defineStore('theme', ...)` using the setup-style store. It holds two reactive refs:

- `debugTheme` (`DebugTheme`, default `'light'`): controls the debug dashboard theme, intended to be applied as `data-theme` on `<html>` while DebugView is mounted.
- `chromeTheme` (`ChromeTheme`, default `'default'`): controls the game chrome theme, intended to be applied as `data-chrome-theme` on `<html>` (e.g. `'low-stim'`).

Two actions mutate state:
- `toggleDebugTheme()` flips `debugTheme` between `'light'` and `'dark'`.
- `setChromeTheme(theme)` assigns `chromeTheme` to the provided value.

The store is configured with `persist: true`, so its state is persisted (via a Pinia persistence plugin). The store only manages state values; the actual application of themes to the DOM is expected to occur elsewhere.

## Exports

- **DebugTheme** (type) — `type DebugTheme = 'light' | 'dark'`: Union type for the debug dashboard theme.
- **ChromeTheme** (type) — `type ChromeTheme = 'default' | 'low-stim'`: Union type for the game chrome theme.
- **useThemeStore** (store) — `useThemeStore(): { debugTheme: Ref<DebugTheme>; chromeTheme: Ref<ChromeTheme>; toggleDebugTheme(): void; setChromeTheme(theme: ChromeTheme): void }`: Pinia store 'theme' exposing reactive `debugTheme` and `chromeTheme` refs plus `toggleDebugTheme()` and `setChromeTheme()` actions. Persisted via `persist: true`.

## Internal dependencies

- `pinia`
- `vue`

## Notes

- Relies on a Pinia persistence plugin being installed for `persist: true` to take effect.
- The store only stores values; applying `data-theme`/`data-chrome-theme` attributes to `<html>` must be handled by consuming code.
