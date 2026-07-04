---
source: src/composables/3d-models/food/held-food.ts
source_hash: effeb744329e757b21c2691a08a9bab0f42a01c96e1eca71f7b66eeef02ee5df
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Held Food Ball Model

`src/composables/3d-models/food/held-food.ts`

> A composable helper that builds a simple Three.js sphere representing food held in a hand during a feeding animation. It maps food categories to representative colors and produces a reusable THREE.Group for placement at a hand's fingertips.

### Data
Defines `FOOD_CATEGORY_COLORS`, a constant map of six food categories (vegetables, greens, herbs, fruits, pellets, treats) to hex color numbers. `FoodCategory` is derived as the union of its keys.

### Logic
`createHeldFoodBall(colorOrCategory?, category = 'vegetables')` resolves a color using the following precedence:
1. If `colorOrCategory` is a string starting with `#`, it is used directly as the color.
2. Else if `colorOrCategory` is a string that is a key in `FOOD_CATEGORY_COLORS`, the mapped color is used.
3. Otherwise it falls back to the color for the `category` argument, defaulting to vegetables.

It then creates a `SphereGeometry` (radius 0.4, 16x12 segments) with a `MeshStandardMaterial` (roughness 0.6, metalness 0.1), enables shadow casting on the mesh, adds it to a new `THREE.Group`, and returns the group.

## Exports

- **FoodCategory** (type) — `type FoodCategory = 'vegetables' | 'greens' | 'herbs' | 'fruits' | 'pellets' | 'treats'`: Union type of valid food category keys derived from FOOD_CATEGORY_COLORS.
- **createHeldFoodBall** (function) — `createHeldFoodBall(colorOrCategory?: string | FoodCategory, category?: FoodCategory): THREE.Group`: Creates a THREE.Group containing a single shadow-casting sphere mesh colored by an explicit hex string, a category name, or a fallback category.

## Internal dependencies

- `three`

## Notes

- FOOD_CATEGORY_COLORS is not exported, so callers can only reference categories via the FoodCategory type or string keys.
- Geometry and material are created fresh on each call and are not disposed here; callers are responsible for cleanup to avoid GPU memory leaks.
