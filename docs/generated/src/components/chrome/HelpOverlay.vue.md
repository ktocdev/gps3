---
source: src/components/chrome/HelpOverlay.vue
source_hash: 8a9ff40c3fee4eaa273c537aa67da6d91128911834782facb2d786254a8ed2b0
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# HelpOverlay.vue

`src/components/chrome/HelpOverlay.vue`

> A full-screen modal help center for Live Mode, rendered as a parchment notice-board with a left-hand topic rail and a scrollable content panel. It presents structured help content across multiple topics (getting started, needs, actions, controls, etc.) and lets players relaunch the onboarding tutorial.

## Structure
The component teleports to `body` and conditionally renders when `modelValue` is true. It draws a decorative board (awning, corner studs), a title bar with 'Replay Tutorial' and 'Close' buttons, and a body split into a topic navigation rail and a content panel.

## Content model
Help content is defined statically in the `HELP_TOPICS` array. Each `HelpTopic` has an `id`, `title`, `emoji`, `accent` color token, and a `body` array of `HelpBlock`s. Blocks are discriminated by `kind` (`lede`, `h`, `p`, `list`, `steps`, `grid`, `keys`, `tip`) and the template renders each kind with a different markup pattern. The 'needs' topic's grid is generated from `NEED_META` via `NEED_GRID` so it stays in sync with the real 10-need set.

## State & interaction
- `activeId` (ref) tracks the selected topic; clicking a rail tab sets it.
- `topic` (computed) resolves the active `HelpTopic`, falling back to the first.
- A watcher on `modelValue` resets `activeId` to the first topic whenever the overlay opens.
- `close()` emits `update:modelValue` false. Clicking the backdrop or Close, or pressing Escape (via a window keydown listener), closes the overlay.
- `replayTutorial()` closes Help, calls `tutorialStore.requestReplay()`, and navigates to `/` if not already there, so GameShellView's watcher can start the tour in Live Mode.

## Lifecycle
A global `keydown` listener is added on mount and removed on unmount to handle Escape.

## Exports

- **HelpOverlay** (component) — `<HelpOverlay v-model="boolean" />`: Vue SFC (script setup). Props: `modelValue: boolean` (controls visibility). Emits: `update:modelValue` (boolean) to support v-model. Renders a teleported modal help center with a topic rail and content panel.

## Internal dependencies

- `./needMeta`
- `../../stores/tutorialStore`
- `vue-router`

## Notes

- Uses `Teleport to="body"`, so the overlay renders outside the component's DOM position.
- Escape handling is done via a manually registered window `keydown` listener rather than a template handler.
- `replayTutorial` relies on GameShellView having a watcher on `tutorialStore` to actually start the tour after navigation to `/`.
- The needs grid is derived from `NEED_META` at module load, so it reflects whatever needs are defined there and cannot drift from the pig signs.
- Type casts (`as HelpListItem[]`, etc.) in the template are needed because `HelpBlock.items` is a heterogeneous union type.
