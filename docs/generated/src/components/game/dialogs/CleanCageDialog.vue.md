---
source: src/components/game/dialogs/CleanCageDialog.vue
source_hash: 038c420f6a0334fbf58fdd2ad63873cb7fcc7b8b5c5af77ed9d566c12ee948ed
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# CleanCageDialog

`src/components/game/dialogs/CleanCageDialog.vue`

> A Vue SFC dialog for cleaning a pet's habitat. It shows habitat dirtiness and bedding requirements, lets the player pick a bedding type from their inventory, and emits a confirm event with the chosen bedding type so the parent can perform a full or partial clean.

### Structure
Wraps `BaseDialog` (size `sm`) and renders a game dialog with a header, content area, and footer.

### Data flow
- Receives props `modelValue` (visibility), `dirtiness`, `beddingNeeded`, and `beddingAvailable` (note: `beddingAvailable` is declared but not used).
- Reads from `useInventoryStore` to determine which bedding types the player owns and how much of each remains.
- `selectedBeddingType` is a local ref defaulting to `'average'`.

### Key logic
- `getBeddingAmountRemaining(beddingId)` sums `amountRemaining` (defaulting to 1 per instance) across all inventory instances of a bedding item.
- `beddingOptions` builds a static list of 7 bedding types (cheap, average, premium, and four colors) with labels showing remaining bags; each option is disabled if `inventoryStore.hasItem` returns false.
- `selectedBeddingAvailable` computes remaining bags for `bedding_${selectedBeddingType}`.
- `selectedBeddingLabel` capitalizes the selected type for the warning message.

### UI states
- Shows a warning `BlockMessage` when available is 0, a different warning when available < needed (partial clean), or a success message when enough is available.
- The confirm button is disabled when available is 0 and its label toggles between 'Clean Habitat' and 'Partial Clean'.
- `handleConfirm` emits `confirm` with the selected type then closes the dialog.

## Exports

- **CleanCageDialog** (component) — `<CleanCageDialog v-model="boolean" :dirtiness="number" :beddingNeeded="number" :beddingAvailable="number" @confirm="(beddingType: string) => void" />`: Habitat cleaning dialog. Props: `modelValue` (boolean, visibility), `dirtiness` (number, %), `beddingNeeded` (number, bags), `beddingAvailable` (number, declared but unused). Emits: `update:modelValue` (boolean) and `confirm` (selected bedding type string).

## Internal dependencies

- `../../basic/dialogs/BaseDialog.vue`
- `../../basic/Button.vue`
- `../../basic/BlockMessage.vue`
- `../../basic/Select.vue`
- `../../../stores/inventoryStore`

## Notes

- The `beddingAvailable` prop is declared but never referenced; availability is computed directly from the inventory store instead.
- Bedding type list is hardcoded to 7 values; the store item id is derived as `bedding_${selectedBeddingType}`.
- `amountRemaining` defaults to 1 (full bag) when an instance lacks the field.
- Styles are non-scoped (`<style>` without scoped), so `.bedding-selection` classes are global.
