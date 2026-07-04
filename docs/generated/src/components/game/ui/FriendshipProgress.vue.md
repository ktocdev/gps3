---
source: src/components/game/ui/FriendshipProgress.vue
source_hash: 895c5cc382d170b379b93365f6b3aeb6759490e232602b5047b2fd9e11faa820
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# FriendshipProgress.vue

`src/components/game/ui/FriendshipProgress.vue`

> A presentational Vue component that renders a friendship progress bar with a percentage value, a threshold marker, and a contextual message indicating progress toward the 'Stardust Sanctuary' unlock threshold.

### Structure
The component displays a header (label + rounded percentage), a progress bar container, and an optional message. The bar's width is bound to the rounded friendship percentage, and a threshold marker is positioned horizontally at the threshold percentage.

### Props & Computed State
- `friendship` (required number) is rounded via `friendshipPercentage`.
- `threshold` (default 85) is exposed as `thresholdPercentage`.
- `showMessage` (default true) toggles the message.

`friendshipBarClass` maps the percentage to one of five modifier classes (`--very-low`, `--low`, `--medium`, `--high`, `--complete`) based on thresholds (30/50/70 and the configurable threshold). Note that all five modifiers currently share the same gold gradient background in CSS; only `--complete` adds a pulsing glow animation.

`message` returns null when `showMessage` is false; otherwise it produces one of four strings depending on the remaining distance to the threshold: a ready message at/above threshold, an 'almost there' message within 5%, a countdown within 15%, or a generic build-friendship prompt.

### Styling
Uses global (non-scoped) CSS relying on CSS custom properties (e.g. `--color-primary`, `--color-gold-300`). Includes `shine` and `pulse-glow` keyframe animations for the bar shine effect and completion glow.

## Exports

- **FriendshipProgress** (component) — `<FriendshipProgress :friendship="number" :threshold?="number" :showMessage?="boolean" />`: Friendship progress bar component. Props: `friendship` (required number), `threshold` (number, default 85), `showMessage` (boolean, default true). Emits nothing.

## Internal dependencies

- `vue`

## Notes

- The `<style>` block is not scoped, so its BEM-style class names and keyframe animations are global.
- All five bar modifier classes render the same gold gradient; the color-tiering logic in `friendshipBarClass` has no distinct visual effect except `--complete`'s pulse-glow animation.
- Relies on externally defined CSS custom properties (e.g. --color-primary, --color-gold-300, --color-bg-tertiary); missing variables will break styling.
