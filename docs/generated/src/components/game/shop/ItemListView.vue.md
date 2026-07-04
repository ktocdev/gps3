---
source: src/components/game/shop/ItemListView.vue
source_hash: b21e6329d702ef167605b388811112c59be97e2f8f6cc5f81199a772d7c7a48a
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# ItemListView

`src/components/game/shop/ItemListView.vue`

> A presentational Vue component that renders a list of shop items in a tabular layout with optional columns for price, owned count, returnable count, status badges, and actions. It supports slots for custom status and action content and emits purchase/sellback events for item interactions.

## Structure
The component renders an HTML `<table>` wrapped in a scrollable container. The header row conditionally shows columns for Price, Owned, Returnable, Status, and Actions based on boolean props. The body iterates `items` with `v-for`, keyed by `item.id`.

## Column rendering
Each row always shows the item info cell (emoji, name, description) with inline `Badge` components: an `Essential` warning badge when `item.isEssential`, and a `Seasonal` or `Limited` badge based on `item.availability`. Other cells (`showPrice`, `showOwned`, `showReturnable`, `showStatus`, `showActions`) render conditionally. Price is formatted via `basePrice.toFixed(2)`; owned/returnable fall back to `0`.

## Slots & events
The `status` slot receives `{ item }` for custom status content. The `actions` slot also receives `{ item }` and defaults to a primary `Button` labeled "Buy" that emits `purchase` with the item id. The component declares `purchase` and `sellback` emits, though `sellback` is not fired by default markup (only available for slot consumers).

## Styling
Scoped-less (global) BEM-style CSS uses CSS custom properties for theming. A responsive `@media (max-width: 768px)` block collapses the table into stacked cards, hiding the header and using `data-label` pseudo-content (note: `data-label` attributes are not set in the template).

## Exports

- **ItemListView** (component) — `<ItemListView :items="Item[]" :showOwned :showStatus :showPrice :showReturnable :showActions @purchase @sellback />`: Table-based item list. Props: `items: Item[]` (required); `showOwned` (default false), `showStatus` (default false), `showPrice` (default true), `showReturnable` (default false), `showActions` (default true). Emits: `purchase: [itemId: string]`, `sellback: [itemId: string]`. Slots: `status` and `actions`, each scoped with `{ item }`.

## Internal dependencies

- `../../basic/Badge.vue`
- `../../basic/Button.vue`

## Notes

- The `sellback` emit is declared but never fired by the default template; it can only be triggered via the `actions` slot by consumers.
- The responsive mobile CSS relies on `data-label` attributes (`::before { content: attr(data-label) }`), but no `data-label` attributes are set on the `<td>` elements, so labels will be blank on small screens.
- The `Item` interface uses an index signature `[key: string]: any`, so arbitrary extra fields are permitted.
- Styles are global (no `scoped` attribute), so class names may collide with other components.
