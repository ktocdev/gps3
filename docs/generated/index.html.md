---
source: index.html
source_hash: 7b818cc80e3217f41c1be0b59d7880fb7b46a3fcacedf0d1904c9394ca66c934
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# index.html (App Entry HTML)

`index.html`

> The root HTML document for the GPS3 (Guinea Pig Simulation Game) Vite application. It provides the mount point for the Vue app and loads the application's entry TypeScript module.

This is a standard Vite/Vue single-page application host document.

### Structure
- Declares `<!doctype html>` with `lang="en"`.
- Sets `charset="UTF-8"` and an SVG favicon at `/favicon.svg`.
- Configures a responsive viewport with `viewport-fit=cover` for edge-to-edge display on notched devices.
- Sets the page title to `GPS3 - Guinea Pig Simulation Game`.

### Mount & bootstrap
- Contains a single `<div id="app"></div>` that serves as the Vue application mount target.
- Loads `/src/main.ts` as an ES module via `<script type="module">`, which bootstraps the Vue app.

A proprietary copyright comment is included at the top of the file.

## Internal dependencies

- `/src/main.ts`
- `/favicon.svg`

## Notes

- The element `#app` must match the mount selector used in src/main.ts.
- Script is loaded as a native ES module (type="module"), relying on Vite for module resolution/bundling.
