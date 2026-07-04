---
source: src/main.ts
source_hash: 64e7be4bebfbf250ee23122e31629044cd82fbfceee0f94501601c730e8c303e
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Application Entry Point

`src/main.ts`

> This is the Vue application bootstrap file. It creates the root Vue app instance, configures Pinia state management (with persistence), wires up the router, imports all global stylesheets, and mounts the app to the DOM.

## Setup flow

1. Creates a Pinia instance and registers `pinia-plugin-persistedstate` so stores can persist state (e.g. to localStorage).
2. Imports a large set of global CSS files covering base/utility styles, panels, stats, dialogs, forms, alerts, game view, storefront, activity feed, debug, and a `chrome/` subset (primitives, bars, panels, fab, tutorial, help).
3. Creates the Vue app from the root `App.vue` component.
4. Registers Pinia and the router as plugins via `app.use(...)`.
5. Mounts the app to the `#app` DOM element.

## Internal dependencies

- `./router`
- `./App.vue`
- `./styles/base.css`
- `./styles/utilities.css`
- `./styles/panel.css`
- `./styles/stats.css`
- `./styles/dialogs.css`
- `./styles/forms.css`
- `./styles/alerts.css`
- `./styles/game-view.css`
- `./styles/storefront.css`
- `./styles/activity-feed.css`
- `./styles/debug.css`
- `./styles/chrome/primitives.css`
- `./styles/chrome/bars.css`
- `./styles/chrome/panels.css`
- `./styles/chrome/fab.css`
- `./styles/chrome/tutorial.css`
- `./styles/chrome/help.css`

## Notes

- CSS import order here defines global cascade order; reordering imports can change style precedence.
- Persisted state is enabled globally via the Pinia plugin, so individual stores opting into persistence rely on this registration.
