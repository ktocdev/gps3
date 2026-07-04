---
source: src/composables/useDebugTheme.ts
source_hash: 3fb0f83e14293f43a76ca831c557f682ce1bda790bf7adda23971d57cc4b7b15
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# useDebugTheme composable

`src/composables/useDebugTheme.ts`

> A Vue composable that applies the debug light/dark theme as a `data-theme` attribute on the `<html>` element while the consuming component (DebugView) is mounted, and cleans it up on unmount so game routes always render in the default light theme.

## How it works

The composable obtains the theme store via `useThemeStore()` and defines an `apply` function that reads `themeStore.debugTheme`. If the value is `'dark'`, it sets `document.documentElement.dataset.theme = 'dark'`; otherwise it deletes the `data-theme` attribute (reverting to default light).

### Reactivity & lifecycle
- A `watch` on `themeStore.debugTheme` re-runs `apply` whenever the debug theme changes.
- `onMounted` calls `apply` once so the correct theme is set when the consuming component mounts.
- `onUnmounted` deletes the `data-theme` attribute, ensuring the theme does not leak into other routes.

The composable returns `{ themeStore }` for the consumer to use directly.

## Exports

- **useDebugTheme** (composable) — `useDebugTheme(): { themeStore: ReturnType<typeof useThemeStore> }`: Wires up watchers and mount/unmount lifecycle hooks to sync `themeStore.debugTheme` to the `data-theme` attribute on `<html>`. Returns the theme store instance.

## Internal dependencies

- `vue`
- `../stores/themeStore`

## Notes

- Directly mutates `document.documentElement.dataset.theme` as a side effect; must be called within a component setup context because it relies on `onMounted`/`onUnmounted`.
- Removing the attribute on unmount is intentional so non-debug (game) routes always render the default light theme.
