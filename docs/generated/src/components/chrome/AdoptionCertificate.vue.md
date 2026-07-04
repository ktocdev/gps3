---
source: src/components/chrome/AdoptionCertificate.vue
source_hash: 146d32a96c218b95078d4697658201f286078d1c06a4a46a5dcfd7ad781e5ef3
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# AdoptionCertificate.vue

`src/components/chrome/AdoptionCertificate.vue`

> A full-screen modal overlay that presents a decorative "Certificate of Adoption" for the selected guinea pigs. It confirms the adoption via a two-stage animated flow (an "ADOPTED" stamp slam followed by an overlay fade-out) before signaling the parent to commit the adoption and begin gameplay.

### Rendering
The component teleports its markup to `document.body` and renders a styled certificate "paper" containing corner flourishes, a crest, title block, a preamble sentence, one stat card per pig, endorsement signatures, footer meta, and a wax seal. Each pig card renders a `PigSvg` portrait (always hardcoded `breed="American"`, with colors/spots derived from `pigColor` helpers) plus derived stats.

### Two-stage exit flow
Clicking **Adopt** (or pressing Enter) calls `handleAdopt`, which sets `stamped=true` (triggering the CSS stamp animation), then schedules two timers: at ~900ms it sets `exiting=true` (fade-out class), and at ~1400ms it emits `start`. Once `stamped` is true, all buttons and keyboard shortcuts are disabled. `cancel` (Escape, close button, or "Choose different pigs") emits `cancel` only if not yet stamped.

### Derived data
A local FNV-1a `hash` function drives stable pseudo-random values: `starSign` picks from a zodiac list, `certNo` builds a serial from pig names + date, and disposition uses the pig's dominant personality trait. `namesPretty`, `date`, `coatNames`, `genderLabel` (Boar/Sow) format display text. `signatures` and `corners` are static config arrays.

### Lifecycle
`onMounted` locks `document.body` scroll, autofocuses the Adopt button after 50ms, and registers a global keydown listener. `onBeforeUnmount` restores scroll, clears all timers, and removes the listener.

## Exports

- **AdoptionCertificate** (component) — `<AdoptionCertificate :pigs="GuineaPig[]" @start @cancel />`: Vue SFC modal. Props: `pigs: GuineaPig[]` (pigs to display on the certificate). Emits: `start` (fired ~1400ms after the user confirms adoption) and `cancel` (fired when the user closes/dismisses before confirming).

## Internal dependencies

- `./PigSvg.vue`
- `./pigColor`
- `../../stores/guineaPigStore`

## Notes

- Portrait art is intentionally always the "American" breed regardless of the pig's actual breed (breed-specific art is deferred).
- `stamped=true` locks the whole UI — all buttons become disabled and keyboard handlers early-return, so once Adopt is pressed there is no way to cancel.
- Body scroll is locked globally via `document.body.style.overflow` and restored on unmount; the previous value is captured to avoid clobbering.
- Timing constants (900ms fade, 1400ms emit) are coupled to the CSS animation durations; changing one may desync the visual exit.
- Relies on external CSS variables (`--z-index-modal`, `--font-family-heading`) and the `'Caveat'` font being available.
- Star sign and certificate number are cosmetic and derived from a hash of names/breed/date — not persisted game data.
