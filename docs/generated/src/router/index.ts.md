---
source: src/router/index.ts
source_hash: 6495c20468ec22ac2e7132d14197895d3511d552ed132b8c6756a1d79a5a473f
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Vue Router Configuration

`src/router/index.ts`

> This file defines and exports the Vue Router instance for the gps3 application, configuring all top-level routes and their nesting structure. It maps URL paths to view components and sets up the navigation shell used across the app.

Uses `createRouter` with `createWebHistory` (based on `import.meta.env.BASE_URL`) to build the router.

### Routes
- `/` renders `GameShellView` as a layout shell with two nested children:
  - `''` (default) → `play` route, renders `PlayView`
  - `store` → `store` route, renders `StoreView`
- `/debug` → `debug` route, renders `DebugView` (standalone, not under the shell)
- `/home` → redirects to `/`

The router instance is exported as the default export for registration in the app entry point.

A comment documents an intentional design decision: simulation play/pause state is not tied to routing; the sim retains its state as the player navigates between Live Mode, the Supplies Store, and Debug. Window-hidden/orientation auto-pauses are handled elsewhere and are not navigation-driven.

## Exports

- **default** (config) — `const router: Router`: The configured Vue Router instance with nested routes under GameShellView (play, store), a standalone debug route, and a /home → / redirect.

## Internal dependencies

- `../views/GameShellView.vue`
- `../views/PlayView.vue`
- `../views/StoreView.vue`
- `../views/DebugView.vue`
- `vue-router`

## Notes

- Play/pause state is deliberately decoupled from routing — the simulation persists its state across navigation; auto-pause logic (window-hidden/orientation) lives elsewhere.
