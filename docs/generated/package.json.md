---
source: package.json
source_hash: 2b148c50b2a0c7474091375ee060dd2254312b9eee0f88ebc927a3373f71e6a1
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# package.json

`package.json`

> The npm manifest for the gps3 project, a Vue 3 based Guinea Pig Simulation Game. It declares project metadata, build/dev scripts, and the runtime and development dependencies required to build and run the application.

## Metadata
Defines the package `gps3` (version 0.0.1), described as a "Guinea Pig Simulation Game - Virtual pet care simulator with personality discovery", authored by `ktocdev` under an `UNLICENSED` license. Uses ES modules (`"type": "module"`).

## Scripts
- `dev`: runs `vite` for local development.
- `build`: runs `vue-tsc -b` for type-checking/build then `vite build`.
- `preview`: runs `vite preview` to serve the production build.

## Dependencies
Runtime deps center on Vue 3 (`vue`, `vue-router`), state management via `pinia` with `pinia-plugin-persistedstate` for persistence, `three` for 3D rendering, `@floating-ui/vue` for positioning, and Iconify packages (`@iconify/vue`, `@iconify-json/flowbite`) for icons.

## Dev Dependencies
Tooling includes `vite` and `@vitejs/plugin-vue` for bundling, `typescript`, `vue-tsc`, and `@vue/tsconfig` for TypeScript support, plus `@types/three` type definitions.

## Notes

- Build script depends on `vue-tsc` type checking passing before Vite builds; type errors will fail the build.
- License is `UNLICENSED`, indicating this is a private/proprietary project.
