---
source: src/components/chrome/ActivityFeedPanel.vue
source_hash: 2e162ac9ba39a31680433687c25fb199ef414874a2e730e7d59dfd5b50435310
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# ActivityFeedPanel

`src/components/chrome/ActivityFeedPanel.vue`

> A Vue SFC that renders the in-app activity feed, displaying the most recent log messages from the logging store with timestamps, emojis, and category-based color accents.

## Rendering
The component reads `activityMessages` from `useLoggingStore` and exposes a `messages` computed that reverses the array (newest first) and slices to the first 50 entries for render performance.

When `messages` is empty, it shows a placeholder (`💭 No activity yet...`). Otherwise it renders one `.chrome-feed__entry` per message, keyed by `msg.id`. Each entry sets a CSS custom property `--entry-accent` from `categoryAccent(msg.category)`, displays a formatted timestamp, the message emoji (defaulting to `📝`), and the message text.

## Helpers
- `categoryAccent(category)` maps a `MessageCategory` to a CSS variable via the `CATEGORY_ACCENTS` lookup, falling back to `var(--color-wood-dark)`.
- `formatTime(timestamp)` formats a numeric timestamp as a 24-hour `HH:MM:SS` string using `toLocaleTimeString('en-US')`.

## Data flow
Data flows one way from the logging store into the computed list; the component is read-only and emits no events or props.

## Exports

- **ActivityFeedPanel** (component) — `<ActivityFeedPanel />`: Vue SFC (script setup). No props, no emits. Renders the reversed, capped-at-50 list of activity messages from useLoggingStore with per-category accent colors and formatted timestamps.

## Internal dependencies

- `../../stores/loggingStore`

## Notes

- Relies on CSS custom properties (e.g. --color-green, --color-wood-dark) being defined elsewhere; unknown categories fall back to --color-wood-dark.
- messages is capped at 50 entries and reversed on every recompute, creating a shallow copy of activityMessages each time.
