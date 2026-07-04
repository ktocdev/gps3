---
source: src/components/game/dialogs/FoodSelectionDialog.vue
source_hash: f77b5e12b24737498bca3ebaf5b2d7fcc76083492af6eaf354d0b470c52d0585
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# FoodSelectionDialog

`src/components/game/dialogs/FoodSelectionDialog.vue`

> A Vue SFC dialog that lets the player pick a food item from their inventory to hand-feed a guinea pig. It presents food categories and, within each, the owned consumables with their available quantities, emitting the chosen food's id when confirmed.

### Structure
Wraps `BaseDialog` (size `md`) and forwards `modelValue` two-way. The layout has a header (title + subtitle interpolating `guineaPigName`), a content area with category buttons and a food grid, and a footer with Cancel and Feed buttons.

### State
- `selectedCategory` (ref, default `'vegetables'`) — the active food subcategory.
- `selectedFoodId` (ref, default `null`) — currently selected food item id; the Feed button is disabled while null.
- A `watch` on `selectedCategory` resets `selectedFoodId` to null whenever the category changes.

### Data flow
`foodCategories` is a static list of six categories (vegetables, greens, fruits, herbs, pellets, treats). `filteredFoodItems` (computed) calls `suppliesStore.itemsBySubCategory(selectedCategory)` to get catalog items, then for each looks up a matching entry in `inventoryStore.consumables` by `itemId`, and only includes items with quantity > 0 — mapping to `{ id, name, emoji (fallback 🍽️), quantity }`. `selectedCategoryLabel` derives the display label for empty-state text.

### Interaction
Clicking a food calls `selectFood`, which ignores zero-quantity items and sets `selectedFoodId`. `confirmFeed` emits `select-food` with the id, closes the dialog via `update:modelValue`, and resets the selection. Cancel just emits `update:modelValue` false. CSS is global (unscoped) and uses design-token CSS variables; responsive rules collapse the grid to one column at ≤640px.

## Exports

- **FoodSelectionDialog** (component) — `<FoodSelectionDialog v-model="boolean" :guinea-pig-name="string" @select-food="(foodId: string) => void" />`: Props: `modelValue: boolean` (dialog open state), `guineaPigName: string`. Emits: `update:modelValue(value: boolean)` and `select-food(foodId: string)`.

## Internal dependencies

- `../../basic/dialogs/BaseDialog.vue`
- `../../basic/Button.vue`
- `../../../stores/inventoryStore`
- `../../../stores/suppliesStore`

## Notes

- Category ids must match the subcategory keys used by `suppliesStore.itemsBySubCategory`; a mismatch yields empty grids.
- Only inventory items with quantity > 0 are ever shown, so the `food-item--disabled`/quantity===0 branches in the template/`selectFood` are effectively unreachable given `filteredFoodItems` filtering.
- `<style>` is unscoped (global) — class names could collide with other components.
