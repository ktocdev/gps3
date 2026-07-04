---
source: vite.config.ts
source_hash: fc05f5581b4d780ba79282bcf17cad5609b4047c25b81352eb0d82fb7eeab240
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Vite Config

`vite.config.ts`

> Vite build and dev server configuration for the gps3 Vue application. It registers the Vue plugin, sets the deployment base path, and configures the dev server port.

This file exports the Vite configuration created via `defineConfig`. It enables Vue single-file component support through the `@vitejs/plugin-vue` plugin. The `base` option is set to `/gps3/`, meaning built asset URLs are prefixed with this path (typical for subpath deployment such as GitHub Pages). The dev server is configured to run on port `5174`.

## Exports

- **default** (config) — `export default defineConfig({...})`: The Vite configuration object: `plugins: [vue()]`, `base: '/gps3/'`, and `server.port: 5174`.

## Internal dependencies

- `vite`
- `@vitejs/plugin-vue`

## Notes

- `base: '/gps3/'` affects asset paths in production builds; assets are served under the `/gps3/` subpath.
- Dev server port is fixed at 5174.
