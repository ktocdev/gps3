---
source: src/components/chrome/needMeta.ts
source_hash: 004bf5edb21ae078bdc9e45b0ac49186c613b8f19219a29c90699ac8b41373ff
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Need Metadata & Health Helpers

`src/components/chrome/needMeta.ts`

> Provides a single source of display metadata for the game's guinea pig needs and utility functions to compute urgency levels and summarize a pig's overall health for the game chrome UI. Centralizes labels, emojis, and theme color tokens so UI components stay consistent and themeable.

Defines `NEED_META`, a record mapping each of the 10 need keys (hunger, thirst, energy, shelter, play, social, comfort, hygiene, nails, chew) to a `NeedMeta` object containing a display `label`, an `emoji`, and a `color` referencing a `--color-need-*` CSS custom property. `NEED_KEYS` is derived from `NEED_META` keys for iteration.

The `urgencyOf(value)` function classifies a single need's satisfaction value (100 = good, low = urgent) into one of four `Urgency` levels: `critical` (≤20), `warning` (≤40), `moderate` (≤70), or `satisfied` (>70).

The `pigHealth(needs)` function iterates all `NEED_KEYS`, counting needs at 40 or below, tracking whether any is critical (≤20), and finding the single lowest-valued need. It returns a `PigHealth` object with `status` (`critical` if any need ≤20, `warning` if any need ≤40, otherwise `ok`), a `count` of needs at warning level or worse, and `worstNeed` (the key with the lowest value, or null). This summary feeds the SimTopBar pill badge.

## Exports

- **NeedKey** (type) — `type NeedKey = keyof GuineaPigNeeds`: Union type of valid need keys derived from the store's GuineaPigNeeds interface.
- **NeedMeta** (type) — `interface NeedMeta { label: string; emoji: string; color: string }`: Shape of per-need display metadata.
- **NEED_META** (constant) — `const NEED_META: Record<NeedKey, NeedMeta>`: Maps each of the 10 need keys to its label, emoji, and CSS color token.
- **NEED_KEYS** (constant) — `const NEED_KEYS: NeedKey[]`: Array of all need keys, derived from NEED_META for iteration.
- **Urgency** (type) — `type Urgency = 'critical' | 'warning' | 'moderate' | 'satisfied'`: Discrete urgency classification for a single need value.
- **urgencyOf** (function) — `urgencyOf(value: number): Urgency`: Classifies a need satisfaction value into an urgency level using thresholds 20/40/70.
- **PigHealth** (type) — `interface PigHealth { status: 'ok' | 'warning' | 'critical'; count: number; worstNeed: NeedKey | null }`: Summary of a pig's overall need state for badge display.
- **pigHealth** (function) — `pigHealth(needs: GuineaPigNeeds): PigHealth`: Aggregates all needs into a health summary: status, count of needs ≤40, and the worst need key.

## Internal dependencies

- `../../stores/guineaPigStore`

## Notes

- Need values are inverted-urgency: 100 = satisfied/good, low values = urgent.
- The prototype's 'stimulation' need is intentionally omitted; gps3 has exactly 10 needs.
- urgencyOf thresholds (20/40/70) and pigHealth thresholds (20/40) must stay aligned if changed together.
- Color values are CSS variable references (var(--color-need-*)), so actual colors depend on the active theme's token definitions.
