---
source: src/components/debug/core/GuineaPigEditor.vue
source_hash: 884d8ced418fb3cad88298d1b8b068935d085505f945ef60b8232801d0e2bfa0
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# GuineaPigEditor.vue

`src/components/debug/core/GuineaPigEditor.vue`

> A debug-panel Vue SFC that provides an editing UI for a single GuineaPig object, exposing its basic info, appearance, personality traits, need-decay-rate feedback, and food/activity/habitat preferences. It mutates the passed-in guinea pig prop directly so changes flow back to the store.

## Structure
The template is organized into four collapsible `Details` sections: Basic Info (name, gender, breed), Appearance (fur color/pattern, eye color, size), Personality (five `DebugSlider`s bound 1–10 plus a read-only Need Decay Rate Modifiers grid), and Preferences (vegetables/fruits/hay likes & dislikes, activities, habitat).

## Data flow
- Props are `guineaPig` (a `GuineaPig`) and optional `disabled` (default false). Most controls `v-model` directly into `props.guineaPig` fields, so the component mutates the prop object in place.
- Option lists for appearance/breed/activities/habitat come from `usePetStoreManager`; food/fruit/hay option ids come from `useSuppliesStore` via computed maps.
- `selectBreedOptions`/`selectFurColorOptions`/etc. build `{label,value}` lists and prepend the current value if it isn't in the store list, so custom values stay selectable.
- `formatPreferenceName` strips `food_/hay_/habitat_` prefixes and converts snake_case to Title Case for labels.

## Preference syncing
Because the data model stores `favoriteFood`/`dislikedFood` as flat arrays but the UI splits them by category, local `ref`s (vegFavorite1/2, fruitDislike1/2, etc.) act as intermediaries. One `watch` (immediate) on the guineaPig prop hydrates these refs by filtering the flat arrays through category option lists via `getPreferencesForCategory`. Separate `watch`es on grouped refs recombine values (filtering empties) back into `favoriteFood`, `dislikedFood`, `favoriteActivity`, and `habitatPreference`, initializing missing arrays for legacy guinea pigs.

## Decay display
The Need Decay Modifiers grid calls imported helper functions to compute per-trait multipliers, applies `getDecayModifierClass` for coloring, and shows `getDecayEffectText` descriptions.

## Exports

- **GuineaPigEditor** (component) — `<GuineaPigEditor :guinea-pig="GuineaPig" :disabled?="boolean" />`: Vue SFC editor for a single guinea pig. Props: `guineaPig: GuineaPig` (mutated in place), `disabled?: boolean` (default false). No emits; changes propagate through direct mutation of the passed prop object.

## Internal dependencies

- `../../../stores/petStoreManager`
- `../../../stores/suppliesStore`
- `../../../stores/guineaPigStore`
- `../../basic/Select.vue`
- `../../basic/Details.vue`
- `../ui/DebugSection.vue`
- `../ui/DebugSlider.vue`
- `../../../utils/personalityDecay`

## Notes

- The component mutates `props.guineaPig` directly (name, gender, appearance, personality, preferences) rather than emitting events — relies on the parent passing a reactive store-owned object.
- Watchers defensively initialize `dislikedFood`, `favoriteActivity`, and `habitatPreference` arrays on the prop for legacy guinea pigs that lack these fields.
- Preference UI splits the flat `favoriteFood`/`dislikedFood` arrays into veg/fruit/hay groups by filtering against store option lists; items not matching any category list will be dropped when recombined.
- Only two favorites/dislikes per category are supported by the UI; extra array entries beyond index 1 are not shown and will be lost on the next recombining watch.
- Store option arrays (furColors, breeds, activities, etc.) are used directly (non-computed) except food/fruit/hay which are computed from the supplies store.
