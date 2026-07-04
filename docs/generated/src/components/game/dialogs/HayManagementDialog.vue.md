---
source: src/components/game/dialogs/HayManagementDialog.vue
source_hash: c0bf4bd0fbabd3c37a1e024931b5dffece7915fe9deff5b120f856460d423a4d
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# HayManagementDialog.vue

`src/components/game/dialogs/HayManagementDialog.vue`

> A Vue SFC dialog component for managing hay racks in the guinea pig habitat. It displays overall hay freshness and available inventory servings, lists each placed hay rack with its fill level and freshness, and provides controls to add hay, clear racks, and replace all hay at once.

## Structure
Renders inside a `BaseDialog` (size `sm`) with a header, content section, and footer. The dialog visibility is controlled via the `modelValue` prop and `update:modelValue` emit.

## Data Flow
Data comes primarily from `useHabitatConditions` (placed items and hay rack contents) and `useInventoryStore`/`useSuppliesStore` (available hay servings).

- `hayRacks` (computed): filters `habitatConditions.habitatItems` for IDs containing `hay_rack`, then builds display objects `{ id, name, servings, capacity, freshness }` using `hayRackContents.get(rackId)`. Capacity comes from `CONSUMPTION.HAY_RACK_MAX_CAPACITY`; freshness defaults to 100 when no contents exist. Racks are named sequentially `Hay Rack #N`.
- `allRacksFullAndFresh` (computed): true when every rack is at capacity and freshness ≥ 100.
- `overallFreshness` (computed): average freshness across racks that have hay; defaults to 100 if none.
- `totalHayServings` (computed): sums inventory servings across all items whose supply category is `hay`.

## Handlers
- `handleAddServing(rackId)`: finds first available hay item via `getFirstHayItemId()`, calls `habitatConditions.addHayToRack`, logs a player action, and triggers `showCareReaction`.
- `handleClearRack(rackId)`: calls `habitatConditions.clearHayRack` and logs.
- `handleReplaceAll()`: clears all non-empty racks then calls `habitatConditions.fillAllHayRacks(rackIds)`, logging results with pluralized counts and showing a care reaction.
- `showCareReaction()`: for each active guinea pig, picks a random message from `guineaPigMessages.care.hayRackFill` and dispatches a `show-chat-bubble` CustomEvent on `document`.

## UI Helpers
`getFreshnessClass`, `overallFreshnessClass`, and `getBarClass` return CSS modifier class names based on freshness/fill thresholds. Empty state and no-hay warnings are shown via `BlockMessage`.

## Exports

- **HayManagementDialog** (component) — `<HayManagementDialog v-model="boolean" />`: Dialog for managing habitat hay racks. Props: `modelValue: boolean` (dialog open state). Emits: `update:modelValue` with a boolean. No slots.

## Internal dependencies

- `../../basic/dialogs/BaseDialog.vue`
- `../../basic/Button.vue`
- `../../basic/BlockMessage.vue`
- `../../../stores/habitatConditions`
- `../../../stores/inventoryStore`
- `../../../stores/suppliesStore`
- `../../../stores/loggingStore`
- `../../../stores/guineaPigStore`
- `../../../data/guineaPigMessages`
- `../../../constants/supplies`

## Notes

- Communicates guinea pig reactions by dispatching a global `show-chat-bubble` CustomEvent on `document` — relies on an external listener elsewhere in the app.
- Hay racks are discovered by string matching `itemId.includes('hay_rack')` against `habitatItems`, so ID naming conventions are coupled to this filter.
- `handleAddServing` and `handleReplaceAll` always use the FIRST available hay item (`getFirstHayItemId`), not a user-selected type.
- The `<style>` block is not scoped, so all `.hay-rack-item__*` and `.hay-management-dialog__*` classes are global.
