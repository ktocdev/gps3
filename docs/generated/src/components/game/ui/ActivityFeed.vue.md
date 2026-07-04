---
source: src/components/game/ui/ActivityFeed.vue
source_hash: 6c3378b6718b1d0719cf094fb682c55c99a5747a6f1c2321c8c27e7fca1dbea9
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# ActivityFeed.vue

`src/components/game/ui/ActivityFeed.vue`

> A Vue SFC that renders a scrollable feed of activity messages sourced from the logging store. It displays categorized, timestamped messages (newest first), supports pause/clear actions (either internally or delegated to a parent), incremental loading via a 'Load more' button, and smart auto-scroll that pins to the top for new messages.

## State & data flow
The component reads `loggingStore.activityMessages` and derives three computed lists:
- `filteredMessages`: returns `[]` when paused; otherwise filters messages by `selectedCategories`, then keeps the last `maxMessages`.
- `visibleMessages`: takes the last `displayCount` (default 20) of filtered messages and reverses them so newest appear at the top.
- `showLoadMore`/`remainingCount`: control the 'Load more' button (loads 20 at a time, capped by remaining count).

## Pause behavior
Pause is dual-mode: if the `isPausedExternal` prop is provided, `isPaused` reflects it and `togglePause`/`clearFeed` emit `toggle-pause`/`clear` for parent control. Otherwise it uses internal `isPausedInternal` state and calls `loggingStore.clearMessages()` directly.

## Scrolling
`isPinnedToTop` tracks whether the view is pinned to the top. `handleScroll` re-pins when the user scrolls within 10px of the top and unpins otherwise. `scrollToTop` only scrolls when `autoScroll` is enabled and pinned. A watcher on `activityMessages.length` (flush: 'post') triggers `scrollToTop` when not paused; `onMounted` also scrolls to top.

## Rendering helpers
`formatTime` formats timestamps as 24-hour HH:MM:SS. `getMessageClasses` builds BEM classes combining base, category (`--{category}`), and level (`--{level}`) for per-category left-border styling. `loadMoreMessages` uses a 200ms setTimeout to simulate loading before increasing `displayCount`.

The header (with Clear All and pause/resume buttons) renders only when `showHeader` is true and `hideHeader` is false. Styles are global (non-scoped) and use CSS custom properties for theming.

## Exports

- **ActivityFeed** (component) — `<ActivityFeed :maxMessages :showHeader :hideHeader :showFilters :autoScroll :height :compact :categories :title :isPausedExternal @toggle-pause @clear />`: Props: maxMessages (default 50), showHeader (true), hideHeader (false), showFilters (true, unused in template), autoScroll (true), height (string, default '300px'), compact (false, unused), categories (MessageCategory[], defaults to five categories), title ('Activity Feed'), isPausedExternal (boolean|undefined). Emits: 'toggle-pause' and 'clear' (only fired when isPausedExternal is defined).

## Internal dependencies

- `../../../stores/loggingStore`
- `../../basic/Button.vue`

## Notes

- Pause behavior is bimodal: when `isPausedExternal` is undefined, pause/clear act locally on the store; when defined, actions are delegated to the parent via emits and no store mutation occurs.
- When paused, `filteredMessages` returns an empty array, so the entire feed content disappears (not merely frozen).
- `showFilters` and `compact` props are declared but not used anywhere in the template or logic.
- `selectedCategories` is initialized from `props.categories` but never mutated in this file (no filter UI is rendered), so category filtering is effectively fixed at mount.
- Styles are global (non-scoped `<style>`); class names could collide with other components.
- `loadMoreMessages` uses a hardcoded 200ms setTimeout purely for UX delay simulation.
