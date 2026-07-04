---
source: src/components/chrome/AdoptionCertificate.vue
source_hash: fefc467866314d06a238235eb7c9ae8f2d6e894a4663c3d3f018424a9c809199
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# AdoptionCertificate.vue

`src/components/chrome/AdoptionCertificate.vue`

> A full-screen modal overlay that renders a decorative 'Certificate of Adoption' for a set of selected guinea pigs. It presents pig portraits and fun derived stats, then plays a two-stage 'ADOPTED' rubber-stamp animation when the user confirms, ultimately signaling the parent to commit the adoption and start play.

### Structure
The component teleports its dialog to `<body>` and renders a styled certificate 'paper' containing corner flourishes, a crest, title block, preamble, per-pig stat cards, endorsement signatures, footer meta, a wax seal, and a CTA row (Choose different pigs / Adopt).

### Props & Emits
Accepts a single prop `pigs: GuineaPig[]`. Emits `start` (adoption confirmed) and `cancel` (dismissed).

### Two-stage exit
Clicking Adopt calls `handleAdopt`, setting `stamped = true` (shows the animated ADOPTED stamp and disables all buttons). A timer at ~900ms sets `exiting = true` (fades the overlay), and a second at ~1400ms emits `start`. Timers are tracked in `exitTimers` and cleared on unmount. `cancel` emits `cancel` unless already stamped.

### Derived data
Uses an FNV-1a `hash` helper with `pickFrom` to deterministically derive stable fun facts per pig: `starSign` (from a 12-entry zodiac list). `disposition` maps the dominant personality trait (of five) to a word. `genderLabel` returns Boar/Sow. `coatNames` joins `pigColors`. Computed `date` formats today's date, `certNo` builds a serial like `GP-YEAR-NNNNN` seeded by pig names + date, and `namesPretty` joins names grammatically. Static arrays `signatures` and `corners` drive rendered rows.

### Pig rendering
Each card renders `PigSvg` hardcoded with `breed="American"` (breed art deferred) using `pigColors`, `pigSpots`, `pigSwatches`, and the pig's eye color.

### Lifecycle
On mount it locks body scroll (`overflow: hidden`, restoring previous value on unmount), autofocuses the Adopt button after 50ms, and attaches a `keydown` listener. `onKey` handles Escape → cancel and Enter → adopt (both no-ops once stamped). All timers and listeners are cleaned up in `onBeforeUnmount`. Respects `prefers-reduced-motion`.

## Exports

- **AdoptionCertificate** (component) — `<AdoptionCertificate :pigs="GuineaPig[]" @start @cancel />`: Modal certificate overlay. Prop: `pigs: GuineaPig[]`. Emits: `start` (adoption confirmed after stamp animation) and `cancel` (dismissed via close/choose-different/Escape).

## Internal dependencies

- `./PigSvg.vue`
- `./pigColor`
- `../../stores/guineaPigStore`

## Notes

- Timing is coupled: the stamp/exit animation durations (900ms/1400ms) must stay in sync with the CSS `ac-stamp`/`ac-fade-out` animations for a coherent exit.
- Once `stamped` is true, all interaction (buttons, Escape, Enter) is disabled — the only remaining path is the timed `start` emit.
- Mutates `document.body.style.overflow` to lock scroll; restores the prior value on unmount, so nested modals relying on the same technique could conflict.
- PigSvg breed is hardcoded to 'American' regardless of the pig's actual breed (breed art deferred), though the breed text stat still shows `pig.breed`.
- Uses the `Caveat` cursive font and CSS custom properties (`--z-index-modal`, `--font-family-heading`) expected from global styles.
