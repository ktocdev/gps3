---
source: src/components/chrome/ActivityFeedPanel.vue
source_hash: 59dbae22772de1909247148f8cd6d824aa976b208397e68fa9d4ec45b6738b30
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# ActivityFeedPanel

`src/components/chrome/ActivityFeedPanel.vue`

> A Vue SFC that renders the chrome activity feed, displaying recent log messages from the logging store with timestamps, emojis, and category-based color accents.

## Structure
The component reads `activityMessages` from `useLoggingStore` and derives a `messages` computed that reverses the list (newest first) and slices to the first 50 entries for render performance.

## Rendering
When there are no messages, it shows an empty state placeholder. Otherwise it iterates over `messages`, rendering each entry with a formatted time, the message's emoji (defaulting to 📝), and the message text. Each entry sets a `--entry-accent` CSS custom property derived from the message category.

## Helpers
- `categoryAccent(category)` maps a `MessageCategory` to a CSS color variable via the `CATEGORY_ACCENTS` lookup, falling back to `var(--color-wood-dark)`.
- `formatTime(timestamp)` formats a numeric timestamp as a 24-hour `HH:MM:SS` locale time string (en-US).

## Exports

- **ActivityFeedPanel** (component) — `<ActivityFeedPanel />`: Vue SFC displaying the newest 50 activity messages from the logging store. No props or emits. Reads reactive state from useLoggingStore.

## Internal dependencies

- `../../stores/loggingStore`

## Notes

- Renders only the newest 50 messages; older entries are not shown regardless of how many exist in the store.
- Relies on CSS custom properties (e.g. --color-green, --color-wood-dark) being defined elsewhere in the app's theme.
