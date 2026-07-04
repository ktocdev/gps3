---
source: src/components/debug/gameplay/FriendshipDebug.vue
source_hash: 8609d35dfb62a092409d6ec7b5aee15865e29b1cd73e148d5453695d9f66adbb
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# FriendshipDebug.vue

`src/components/debug/gameplay/FriendshipDebug.vue`

> A debug panel component for inspecting and manipulating guinea pig friendship data during gameplay. It lets developers view friendship levels, relationship tiers, telemetry, and cooldowns for each active guinea pig, and trigger interactions (play, social) or directly adjust friendship values. It also displays a static legend of friendship gains and losses.

## Structure
When there are no active guinea pigs, it renders a single empty-state `DebugPanel`. Otherwise it renders a two-column flex layout: a per-guinea-pig column on the left and a static legend panel on the right.

## Per-guinea-pig panel
For each guinea pig in `activeGuineaPigs` (from `guineaPigStore`), a `DebugPanel` shows:
- A `DebugSlider` bound to rounded `friendship` (0–100), writing back via `setFriendship`.
- A relationship tier `DebugBadge` computed by `getFriendshipTier` (Devoted/Friends/Acquainted/Wary).
- A `FriendshipProgress` bar with threshold 85.
- **Interaction Effects** section: buttons to add/subtract (±5, ±10) or set (0/50/85/100) friendship.
- **Player Interactions** section: Play and Social buttons, disabled while on cooldown, that trigger real store actions and show success/fail feedback via the reactive `interactionResults` map.
- **Telemetry** section: friendship %, wellness, penalty status/rate (from `needsController`), last interaction time, total interactions, and computed net change per tick.
- **Cooldowns** section: play/social cooldown status and calculated cooldown durations.

## Key logic
- `getNetChange` estimates per-tick friendship delta from wellness bands (>50 +0.1, <30 -2, <50 -1) minus 0.5 per critical need (need value <30).
- `getWellness` delegates to `needsController.calculateWellness`.
- Cooldown helpers read `guineaPigStore.checkInteractionCooldown`.
- `triggerPlay`/`triggerSocial` capture friendship before/after calling store actions to report the delta.
- `formatTimestamp` renders relative time (Just now / Xm / Xh / date).

## State
Local reactive `interactionResults` keyed by guinea pig id; all persistent data lives in the stores.

## Exports

- **default** (component) — `Vue SFC <FriendshipDebug>`: Debug component with no props or emits. Reads active guinea pigs from guineaPigStore and wellness/penalty data from needsController; mutates friendship and triggers interactions directly on the store.

## Internal dependencies

- `../../../stores/guineaPigStore`
- `../../../stores/needsController`
- `../../game/ui/FriendshipProgress.vue`
- `../../basic/Button.vue`
- `../ui/DebugPanel.vue`
- `../ui/DebugSection.vue`
- `../ui/DebugSlider.vue`
- `../ui/DebugStatRow.vue`
- `../ui/DebugBadge.vue`

## Notes

- `setFriendship` mutates `guineaPig.friendship` directly rather than going through a store action, bypassing any clamping/validation that `adjustFriendship` might perform.
- The 'Penalty Active' and 'Penalty Rate' telemetry read `needsController.isPenaltyActive`/`currentPenaltyRate`, which appear to be global (not per-guinea-pig) values, so they are identical across all rendered panels.
- `getNetChange` reimplements friendship gain/loss logic locally as an estimate; it may drift from the actual game tick logic if that logic changes.
- Play/social interaction results are stored per-guinea-pig id but never cleared, so the last result message persists until overwritten.
