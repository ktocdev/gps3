---
source: src/views/HomeView.vue
source_hash: 32b25b23afa520ed55cc68f4044c1632e00f774975a1639ae98e460167b10868
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# HomeView

`src/views/HomeView.vue`

> A placeholder view component for the future main game interface of the Guinea Pig Simulator. It currently displays a 'Coming Soon' hero section with a link to the debug dashboard, and manages game pause state on page entry/exit.

## Template
Renders a centered hero section with the game title, a 'Coming Soon!' subtitle, a description, and a `router-link` button pointing to `/` (labeled 'Debug Dashboard'). Below the hero is a placeholder preview area with a hamster emoji and placeholder text.

## Logic
The component obtains the `gameController` store via `useGameController()`. It uses two lifecycle hooks:
- `onMounted`: calls `gameController.pauseGame('navigation')` to auto-pause the game when entering this view.
- `onUnmounted`: if `gameController.isGameActive` is true, calls `gameController.pauseGame('navigation')` again when leaving.

The user must manually resume the game if desired. No local reactive state is maintained.

## Styles
Mobile-first scoped-less (global) CSS using BEM-style `home-view__*` class names and CSS custom properties (design tokens) for spacing, colors, fonts, and shadows. Includes responsive enhancements at `min-width: 769px` and a `prefers-reduced-motion` block to disable button transitions/transforms.

## Exports

- **HomeView** (component) — `Vue SFC (<script setup>, no props/emits)`: Placeholder home view for the future game interface. Takes no props and emits no events. On mount it pauses the game via gameController.pauseGame('navigation'); on unmount it pauses again if the game is active.

## Internal dependencies

- `../stores/gameController`
- `vue`

## Notes

- The 'Debug Dashboard' router-link points to '/', implying the debug dashboard is the root route rather than this HomeView.
- Uses global (non-scoped) styles, so class names could collide with other components.
