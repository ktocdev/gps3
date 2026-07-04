---
source: index.html
source_hash: 34696513b7394d84cc545a4f2a86198632624a4dc69b8dbb86c43272817dbc7f
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# index.html

`index.html`

> The HTML entry point for the GPS3 (Guinea Pig Simulation Game) Vite application. It provides the root DOM mount point and loads the application's main TypeScript entry module.

This is a standard Vite single-page application HTML shell. It declares the document with `lang="en"`, sets the character encoding to UTF-8, and references an SVG favicon at `/favicon.svg`. The viewport meta tag enables responsive scaling and uses `viewport-fit=cover` for edge-to-edge display on notched devices. The page title is set to "GPS3 - Guinea Pig Simulation Game".

The `<body>` contains a single `<div id="app"></div>` element that serves as the mount target for the application, and a module script tag that loads `/src/main.ts`, which bootstraps the app. A top comment declares proprietary copyright ownership by ktocdev (2025).

## Internal dependencies

- `/src/main.ts`
- `/favicon.svg`

## Notes

- The `#app` div id must match the mount selector used in src/main.ts.
- This is a proprietary/closed-source project per the copyright header.
