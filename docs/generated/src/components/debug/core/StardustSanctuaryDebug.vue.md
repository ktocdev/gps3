---
source: src/components/debug/core/StardustSanctuaryDebug.vue
source_hash: 2f0606461916d5613bc85d83bdeb41928af37f4ef34c9a173712278cd1469c2a
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# StardustSanctuaryDebug.vue

`src/components/debug/core/StardustSanctuaryDebug.vue`

> A debug panel component for viewing and managing the Stardust Sanctuary feature. It displays active guinea pigs, guinea pigs resting in the sanctuary, and sanctuary capacity stats, and provides controls to move guinea pigs to/from the sanctuary.

## Structure
The template renders a `ConfirmDialog` for confirming sanctuary moves and a three-column `DebugPanelRow` containing three panels:

1. **Active Guinea Pigs** — lists `activeGuineaPigs` with breed/gender, a `FriendshipProgress` bar (threshold 85), and a 'Move to Sanctuary' button disabled when friendship < 85 (tooltip shows how much more is needed).
2. **Stardust Sanctuary** — lists `petStoreManager.sanctuaryGuineaPigs` with frozen friendship display and an 'Activate' button disabled when 2 guinea pigs are already active.
3. **Sanctuary Capacity** — read-only stats (total, used, available slots) plus an informational `BlockMessage`.

## State & Logic
- `showSanctuaryDialog` (ref) toggles the confirmation dialog.
- `selectedGuineaPigForSanctuary` (ref<string|null>) holds the ID being moved.
- `activeGuineaPigs` (computed) proxies `guineaPigStore.activeGuineaPigs`.
- `sanctuaryDialogNames` (computed) builds a display string of the selected guinea pig plus its cagemate (the other active guinea pig).
- `handleMoveToSanctuary(id)` opens the dialog; `confirmMoveToSanctuary` calls `petStoreManager.moveToSanctuary`; `cancelMoveToSanctuary` clears selection; `handleMoveFromSanctuary(id)` calls `petStoreManager.moveFromSanctuary` directly (no confirmation).

## Data Flow
Reads from `usePetStoreManager` (sanctuary counts, slots, sanctuary guinea pigs) and `useGuineaPigStore` (active guinea pigs, collection). Mutations flow through petStoreManager actions.

## Exports

- **StardustSanctuaryDebug** (component) — `Vue SFC <script setup>, no props, no emits`: Debug UI for the Stardust Sanctuary system. Takes no props and emits no events; all state is derived from petStoreManager and guineaPigStore stores.

## Internal dependencies

- `../../../stores/petStoreManager`
- `../../../stores/guineaPigStore`
- `../../game/ui/FriendshipProgress.vue`
- `../../basic/Button.vue`
- `../../basic/BlockMessage.vue`
- `../../basic/InfoButton.vue`
- `../../basic/dialogs/ConfirmDialog.vue`
- `../ui/DebugPanel.vue`
- `../ui/DebugPanelRow.vue`
- `../ui/DebugStatRow.vue`
- `../ui/DebugBadge.vue`

## Notes

- The 85% friendship threshold is hardcoded in both the template (button disable/tooltip, FriendshipProgress) and messaging.
- Moving to sanctuary requires dialog confirmation, but moving from sanctuary (activate) executes immediately with no confirmation.
- The move-to-sanctuary action moves the guinea pig together with its cagemate (both active guinea pigs), as reflected in the dialog copy, though only the selected ID is passed to moveToSanctuary.
