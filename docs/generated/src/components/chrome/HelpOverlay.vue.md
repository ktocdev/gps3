---
source: src/components/chrome/HelpOverlay.vue
source_hash: f33013928babe65aab4ae6208b96f72fac2c97d5525aebb4ffe8501474bad1f0
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# HelpOverlay.vue

`src/components/chrome/HelpOverlay.vue`

> A full-screen Live Mode help center overlay for the gps3 app. It presents a parchment notice-board dialog with a vertical topic rail and a scrollable content panel, rendering structured help content across multiple topics (getting started, guinea pigs, needs, actions, items, inventory, supplies, habitat status, activity feed, pause/time, and controls).

## Structure
The component teleports its markup to `<body>` and renders only when the `modelValue` prop is true. It shows a decorative board (awning, studs), a title bar with "Replay Tutorial" and "Close" buttons, and a body split into a left topic rail (`<nav>`) and a right content panel (`<section>`).

## Content model
Help content is defined statically in `HELP_TOPICS`, an array of `HelpTopic` objects, each with `id`, `title`, `emoji`, `accent` (CSS color token), and a `body` array of `HelpBlock`s. The template renders each block based on its `kind`: `lede`, `h`, `p`, `list`, `steps`, `grid`, `keys`, and `tip`, with typed item shapes (`HelpListItem`, `HelpGridItem`, `HelpKeyItem`) cast inline in the template.

The needs `grid` block reuses `NEED_GRID`, derived from `NEED_META` values, so the displayed 10 needs stay in sync with the rest of the app.

## State & interaction
- `activeId` (ref) tracks the selected topic; `topic` (computed) resolves it against `HELP_TOPICS`, falling back to the first.
- A watcher resets `activeId` to the first topic whenever the overlay opens.
- The active topic's `accent` is bound as a `--help-accent` CSS custom property on the board.
- `close()` emits `update:modelValue: false`. Clicking the backdrop closes; the board stops propagation.
- `replayTutorial()` closes the overlay, calls `tutorialStore.requestReplay()`, and navigates to `/` if not already there (GameShellView's watcher actually starts the tour).
- A global `keydown` listener (added on mount, removed on unmount) closes the overlay on Escape when open.

## Exports

- **HelpOverlay** (component) — `<HelpOverlay v-model="boolean" />`: Vue SFC (script setup). Props: `modelValue: boolean` (visibility). Emits: `update:modelValue: [value: boolean]`. Renders a teleported full-screen help dialog with topic navigation and structured content blocks.

## Internal dependencies

- `vue`
- `vue-router`
- `./needMeta (NEED_META)`
- `../../stores/tutorialStore (useTutorialStore)`

## Notes

- Uses `<Teleport to="body">`, so the overlay renders outside the component's DOM location.
- `replayTutorial` only flags the replay via the tutorial store and navigates to `/`; the actual tour launch is handled by GameShellView's watcher (coupling documented in comments).
- Both the backdrop click and a global Escape keydown listener trigger close, so behavior depends on the window-level listener being registered.
- Help content in `HELP_TOPICS` is hardcoded and must be manually kept accurate; only the needs grid auto-syncs via `NEED_META`.
- Template casts block `items` to specific interfaces inline (e.g. `block.items as HelpListItem[]`), relying on `kind` to guarantee the correct shape.
