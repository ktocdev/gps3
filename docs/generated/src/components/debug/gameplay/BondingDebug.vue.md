---
source: src/components/debug/gameplay/BondingDebug.vue
source_hash: 569b6a60f765a44f1a86766cfe3e670c8b95b6734ba2fa6bc0494b1074654f81
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# BondingDebug.vue

`src/components/debug/gameplay/BondingDebug.vue`

> A debug panel component for inspecting and manually testing pig-to-pig social bonding in the gps3 game. It displays active bonds, their telemetry and tier benefits, recent bonding events, and compatibility breakdowns between guinea pigs, and provides buttons to trigger grooming, play, and explore interactions.

## Structure
The component renders one of three states based on `activeGuineaPigs.length`:
- **0 pigs**: an empty-state DebugPanel prompting to start a game.
- **1 pig**: a DebugPanel explaining bonding needs at least 2 pigs.
- **2+ pigs**: a three-column `DebugPanelRow` layout.

## Three-column layout
1. **Active Bonds Overview** — iterates `allBonds`, rendering a card per bond with names, a tier `DebugBadge`, a disabled `DebugSlider` for bond level, telemetry stats, tier benefits (via `getBenefits`), and manual interaction buttons (Groom/Play/Explore) with per-bond result messages.
2. **Recent Bonding Events** — shows the last 10 events across all bonds, sorted by timestamp descending, with formatted type, relative timestamp, description, and bonding change.
3. **Compatibility Analysis** — per-bond DebugSection listing compatibility factor scores from `getCompatibility`.

## Data flow & state
- Reads reactive data from `useGuineaPigStore` (`activeGuineaPigs`, `getAllBonds`, `getGuineaPig`).
- `pendingBondIds` (a `ref<Set<string>>`) tracks in-flight interactions to prevent rapid re-clicks from stacking concurrent async bonding sequences; `isPending` checks membership.
- `interactionResults` is a reactive record mapping bond id → success/message.
- `runInteraction` is the shared async wrapper: resolves both guinea pigs, self-heals habitat positions via `habitatConditions.initializeGuineaPigPosition`, marks the bond pending, awaits the action, records result, and always clears pending.
- `triggerGrooming`/`triggerPlayTogether`/`triggerExplore` delegate to `socialBehaviors` methods through `runInteraction`.

## Formatting helpers
Several local functions format display values: `formatTier`, `getTierVariant` (maps tier→badge variant), `formatEventType`, `formatTimestamp` (relative time), `formatFactorName`, `getGuineaPigName`, and `getCompatibilityFactors`.

## Exports

- **BondingDebug** (component) — `Vue SFC (script setup, no props/emits)`: Debug panel for pig-to-pig social bonding. Takes no props and emits no events; reads all state from stores/composables. Renders empty states or a three-column layout of bonds, events, and compatibility.

## Internal dependencies

- `../../../stores/guineaPigStore`
- `../../../stores/habitatConditions`
- `../../../composables/game/useSocialBehaviors`
- `../../../utils/bondingProgression`
- `../../../utils/compatibility`
- `../../basic/Button.vue`
- `../ui/DebugPanel.vue`
- `../ui/DebugPanelRow.vue`
- `../ui/DebugSection.vue`
- `../ui/DebugSlider.vue`
- `../ui/DebugStatRow.vue`
- `../ui/DebugBadge.vue`

## Notes

- Grooming button is disabled when `bond.bondingTier === 'neutral'` (requires Friends or Bonded tier).
- `runInteraction` calls `habitatConditions.initializeGuineaPigPosition` on both pigs as an idempotent self-heal for sessions/saves missing habitat positions (needed for position-dependent interactions like Play).
- `pendingBondIds` guards against re-clicking during multi-second async interaction sequences to prevent stacking concurrent bonding increases.
- Interaction actions are typed loosely (`bond: any`, `gp: any`), bypassing type safety.
- Recent events are aggregated across all bonds' `bondingHistory`, sorted descending, and capped at 10.
