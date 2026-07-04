---
source: src/components/game/shop/SupplyCrateCard.vue
source_hash: 063d9546e5fe805a907d73f39bfcbdff5642561ebf0a878e825b6df2b762899d
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# SupplyCrateCard

`src/components/game/shop/SupplyCrateCard.vue`

> A presentational Vue SFC that renders a single shop supply item styled as a wooden supply crate, showing its emoji, name, description, price, owned count, and buy/sell action buttons. It exists to display one purchasable supplies item within the game shop and to emit buy/sell intents to its parent.

## Template
Renders a `.supply-crate` root whose CSS custom property `--crate-tilt` is bound to the `tilt` prop (in degrees). Decorative slats and corner studs are rendered with `aria-hidden`.

An "Owned ×N" badge appears only when `owned > 0`. The crate face shows `item.emoji` (falling back to `fallbackEmoji` when empty) plus a pinned card with `item.name` and `item.description`.

The footer displays the price (`item.basePrice` with a coin emoji) and an actions area:
- A **Sell** button, shown only when `returnable > 0`, emits `sell` with the item on click.
- An **Add** (buy) button, disabled when `affordable` is false, emits `buy` with the item on click.

## Data flow
Purely props-in / events-out; the component holds no internal state and performs no logic beyond conditional rendering and the emoji fallback.

## Exports

- **SupplyCrateCard** (component) — `<SupplyCrateCard :item :owned :returnable :affordable :tilt :fallbackEmoji @buy @sell />`: Displays a single supplies shop item as a crate. Props: `item: SuppliesItem`, `owned: number`, `returnable: number`, `affordable: boolean`, `tilt: number` (degrees for crate rotation via CSS var), `fallbackEmoji: string`. Emits: `buy: [item: SuppliesItem]` and `sell: [item: SuppliesItem]`.

## Internal dependencies

- `../../../types/supplies (SuppliesItem type)`

## Notes

- No `<style>` block is defined in this file, so the many BEM classes (e.g. `.supply-crate`, `.supply-crate__slats`) rely on styles defined elsewhere (global or parent).
- The `--crate-tilt` CSS custom property is set inline but only takes effect if consumed by external CSS.
