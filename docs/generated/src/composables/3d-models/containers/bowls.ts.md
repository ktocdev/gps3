---
source: src/composables/3d-models/containers/bowls.ts
source_hash: a95158e3386470cd79775872e240fc0b0c12b6e0fa8e4158d2979c18655123db
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Bowl 3D Model Builder

`src/composables/3d-models/containers/bowls.ts`

> This file constructs a Three.js 3D model of a food bowl for the habitat scene, populating it with food and hay contents based on the current bowl state from the habitat conditions store.

### Structure
The module exports `createBowlModel(bowlItemId)`, which builds a `THREE.Group` containing a bowl (a scaled-up open cylinder mesh in blue) and a circular base, both using a shared `MeshStandardMaterial`.

### Contents rendering
It queries `useHabitatConditions().getBowlContents(bowlItemId)` to get the items in the bowl. Contents are split into hay items (itemId includes `hay`) and food items (everything else).

- **Hay**: If present, a deterministic seed is derived from the character codes of `bowlItemId` (to keep the pile static/non-animating), and `createHayPile(count, seed)` is called. The pile is scaled taller for 2+ servings, smaller for one.
- **Food**: One food item is centered; two or more render only the first two, positioned left/right using `ITEM_CONFIG.FOOD_POSITION` constants.

### Food model dispatch
The private helper `createFoodModel(itemId)` maps an item ID to a specific model factory by substring match (carrot, cucumber, pellet, lettuce), defaulting to a cucumber slice for unrecognized items.

## Exports

- **createBowlModel** (function) — `createBowlModel(bowlItemId: string): THREE.Group`: Builds and returns a Three.js group containing a bowl mesh, base, and its rendered hay/food contents based on the habitat conditions store.

## Internal dependencies

- `three`
- `../../../stores/habitatConditions`
- `../food/hay`
- `../food/vegetables`
- `../food/pellets`
- `../food/greens`
- `../../../constants/3d`

## Notes

- `createFoodModel` matches by substring (`includes`) on itemId, so ID naming conventions directly determine which model is rendered; unmatched items silently fall back to a cucumber slice.
- Only the first two food items are rendered even if the bowl contains more.
- The hay pile seed is derived deterministically from bowlItemId specifically to prevent animation/randomness between renders.
- Calls useHabitatConditions() inside the function, so it must run within an active Pinia context.
