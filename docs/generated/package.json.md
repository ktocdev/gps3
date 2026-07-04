---
source: package.json
source_hash: ffea75a2fe5db63bdbed18fe0ecced1b3715660be269a04f13a0c2ec9a1f01e3
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# package.json

`package.json`

> The npm package manifest for the gps3 project (Guinea Pig Simulation Game), a virtual pet care simulator. It defines project metadata, dependencies, and build scripts for a Vue 3 + Vite + TypeScript application.

## Project Metadata
Declares the package as `gps3` version `0.0.1`, authored by `ktocdev`, licensed as `UNLICENSED`, and using ES modules (`"type": "module"`).

## Scripts
- `dev`: runs the Vite dev server.
- `build`: type-checks with `vue-tsc -b` then bundles via `vite build`.
- `preview`: serves the production build locally with `vite preview`.

## Dependencies
Runtime libraries include Vue 3 (`vue`), routing (`vue-router`), state management (`pinia`) with persistence (`pinia-plugin-persistedstate`), 3D rendering (`three`), floating UI positioning (`@floating-ui/vue`), and Iconify icon tooling (`@iconify/vue`, `@iconify-json/flowbite`).

## Dev Dependencies
Tooling for the Vue/Vite/TypeScript stack: `vite`, `@vitejs/plugin-vue`, `typescript`, `vue-tsc`, `@vue/tsconfig`, and `@types/three` for Three.js type definitions.

## Notes

- License is UNLICENSED — the project is proprietary/not open-source.
- The build script enforces TypeScript type-checking (vue-tsc) before bundling, so type errors will fail the build.
- Uses Pinia with pinia-plugin-persistedstate, implying persisted store state (e.g., localStorage) elsewhere in the app.
- Includes Three.js, indicating 3D rendering is part of the application.
