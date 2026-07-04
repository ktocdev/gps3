---
source: src/components/debug/environment/PersonalityPanel.vue
source_hash: b9e6777a3270da65b6c23521a7a76319bf654267dabe7f08c12887a170625de8
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# PersonalityPanel.vue

`src/components/debug/environment/PersonalityPanel.vue`

> A debug UI component that displays a guinea pig's personality traits and preferences. It renders five personality trait bars (friendliness, playfulness, curiosity, boldness, cleanliness) and lists the guinea pig's food, activity, and habitat preferences in a formatted, human-readable way.

## Structure
The component wraps its content in a `DebugPanel` titled "🎭 Personality" with a purple accent. It contains two `DebugSection`s: "Traits" and "Preferences".

### Traits
The `personalityTraits` computed property maps the guinea pig's `personality` object into an array of `{ key, label, value }` entries for the five traits. Each is rendered as a labeled bar whose width is `value * 10 + '%'` (implying trait values range 0–10) plus a numeric value.

### Preferences
Four `DebugStatRow`s show favorite foods, disliked foods, favorite activities, and habitat preferences. Each row is muted when its underlying array is empty, and the disliked foods row carries a `stat-item--negative` class that colors non-muted values with `--color-error`.

## Formatting helpers
`formatPreferenceList` returns 'None' for empty/undefined arrays, otherwise joins formatted names with commas. `formatPreferenceName` strips common prefixes (`food_`, `hay_`, `toy_`, `item_`, `chew_`) and converts snake_case/kebab-case to Title Case.

## Data flow
Data comes entirely from the single `guineaPig` prop; the component is presentational with no internal state or emitted events. Styles use a CSS container query context (`container-type: inline-size`).

## Exports

- **PersonalityPanel** (component) — `<PersonalityPanel :guineaPig="GuineaPig" />`: Vue SFC (script setup). Props: `guineaPig: GuineaPig` (required). No emits. Displays personality trait bars and preference lists for the given guinea pig.

## Internal dependencies

- `../../../stores/guineaPigStore`
- `../ui/DebugPanel.vue`
- `../ui/DebugSection.vue`
- `../ui/DebugStatRow.vue`

## Notes

- Trait bar width assumes trait values are on a 0–10 scale (`value * 10 + '%'`); values outside this range would over/underflow the bar.
- The `stat-item--negative` class is applied to the DebugStatRow to style disliked foods with the error color, relying on the child component exposing `.stat-value` markup.
