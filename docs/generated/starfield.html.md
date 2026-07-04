---
source: starfield.html
source_hash: e4efe763843330afcbc8672af7f8b849b8830393a6fe6e97c7b64e5708ffe8bf
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Celestial Meditation Starfield

`starfield.html`

> A standalone single-file HTML page that renders an animated night-sky starfield on a canvas, featuring twinkling ambient stars, named constellations (including a custom 'Starr the Magnificent' spelled out in stars), shooting stars, and interactive hover tooltips. It is styled as a nostalgic 90s museum exhibit with a moon, ornate frame, placard, corner brackets, and VHS scanline overlay.

## Structure
The page is pure HTML/CSS/vanilla JS with no dependencies. DOM decoration includes a `.moon`, `.exhibit-frame`, four `.corner-bracket` elements, an `.exhibit-placard`, a `.vhs-grain` scanline overlay (animated via `@keyframes vhsScroll`), a full-viewport `<canvas id="starfield">`, and a hidden `.tooltip`.

## Data
`constellations` is an array of objects with `name`, `description`, `stars` (arrays of `{x, y}` fractional coordinates 0–1), and optional `color`. 'Starr the Magnificent' encodes letters S-T-A-R-R as many star points. `ambientStars` is 1200 randomly generated background stars each with radius, opacity, twinkle speed/offset, and a white or bluish color prefix.

## Rendering pipeline
`constellationStars` maps fractional coordinates to pixel positions using current canvas size. `drawStar()` renders a star as a radial-gradient glow plus a solid core. `drawConstellation()` draws connecting lines between stars (skipped for 'Starr the Magnificent') and draws each star with an enhanced glow for Starr, deriving a color prefix from the constellation's `color`. `animate()` clears the canvas each frame, draws ambient stars with sinusoidal `time`-based twinkling, draws all constellations, increments `time`, and loops via `requestAnimationFrame`.

## Interaction & lifecycle
`createShootingStar()` creates a `.shooting-star` div animated across the screen with the Web Animations API, removing itself on finish; a `setInterval` fires one roughly every ~3s with 30% probability. A `mousemove` listener on the canvas measures distance to each constellation star (threshold 20px) and shows a positioned tooltip with the matched constellation's name/description; `mouseleave` hides it. A `resize` handler resizes the canvas, re-randomizes ambient star positions, and rebuilds `constellationStars`.

## Notes

- Entirely self-contained; no external libraries or imports and no module exports (a browser-run HTML document).
- Exhibit-frame/placard/corner-bracket positions are hardcoded percentages tuned to align with the 'Starr the Magnificent' star coordinates; changing one without the others breaks visual alignment.
- On window resize, ambient star positions are fully re-randomized (not proportionally scaled) and constellation star radii are regenerated, so the layout visibly changes.
- The color-prefix derivation relies on `constellation.color` ending exactly in `', 0.5)'`; the `.replace(', 0.5)', ', ')` will silently no-op if that literal format changes.
- Line connections are drawn in raw star-array order, so constellation shapes depend on point ordering; 'Starr the Magnificent' intentionally skips lines.
- Uses fixed pixel distance thresholds (20px) for hover detection independent of star glow size.
