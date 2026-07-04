---
source: src/components/game/shop/SupplyItemCard.vue
source_hash: ad315c4be89a6af4fd148e256f1e430e6ef758d20d492a440bdcc4ddb9636dae
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# SupplyItemCard.vue

`src/components/game/shop/SupplyItemCard.vue`

> A presentational Vue component that renders a single purchasable supply item in the game shop, showing its details, ownership status, a quantity selector, and buy/sell-back actions.

## Structure
The component displays a supply item card with a header (name, essential/seasonal/limited badges, emoji, and price), a description, an optional ownership section, and a purchase row with a quantity input and action buttons.

## Props & Data Flow
It receives an `item` (SuppliesItem), the current `quantity`, `currentBalance`, and optional `owned`, `returnable`, `isOpened`, and `placedCount` values (defaulted via `withDefaults`). Several computed values derive display state:
- `totalCost` = `item.basePrice * quantity`
- `canAfford` = balance covers total cost
- `sellBackTotal` = 100% refund (`basePrice * quantity`)
- `canSellBack` = `returnable >= quantity`
- `nonReturnableReason` returns 'Opened' for opened hay/bedding, 'Placed' if placed, else 'Non-returnable'

## Events
The Buy button emits `purchase` with the item id; the Sell button (shown only when `returnable > 0`) emits `sellback`. The quantity input's `handleQuantityChange` parses and clamps the value between 1 and 99, then emits `update:quantity` with the item id and clamped value.

## Ownership Section
Shown when `owned > 0`: displays an owned count badge, a returnable count badge (if any), or a non-returnable reason badge when owned but nothing returnable.

## Internal dependencies

- `../../../types/supplies`
- `../../basic/Button.vue`
- `../../basic/Badge.vue`

## Notes

- Sell-back refunds are hardcoded to 100% of base price.
- The quantity input uses `:value` (not v-model) and relies on the parent to feed back the clamped value via the `update:quantity` event.
- The `<style>` block is not scoped, so BEM-style class names are global.
- `update:quantity` emits with two args (itemId, quantity), which is a non-standard v-model signature.
