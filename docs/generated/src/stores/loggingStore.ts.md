---
source: src/stores/loggingStore.ts
source_hash: f4ac88abb7de77540f775b6107c77a093a41b8c161f6a32017eb28beaaac98b2
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Logging Store

`src/stores/loggingStore.ts`

> A Pinia store that manages a centralized activity/logging system for the guinea pig simulation game. It records timestamped messages across various categories (player actions, guinea pig reactions, autonomous behaviors, environmental events, system logs, and achievements) with configurable retention, filtering, and persistence.

## State
The store holds a single reactive `state` object containing `messages` (an array of `ActivityMessage`), `isLoggingEnabled` (boolean), and `settings` (`maxMessages` default 200, `showDebugMessages` default false, `enableActivityFeed` default true, `messageRetentionHours` default 24).

## Computed views
- `activityMessages`: non-system messages, excluding debug unless `showDebugMessages` is on.
- `debugMessages`: only debug-level messages.
- `recentMessages`: messages newer than the retention cutoff.
- `messagesByCategory`: `activityMessages` bucketed into a record keyed by each `MessageCategory`.

## Adding messages
`addMessage` is the core function: it short-circuits (returns an empty object) when logging is disabled, otherwise builds an `ActivityMessage` with a generated ID (`generateId` uses timestamp + random string), pushes it, and trims the array to `maxMessages` via `slice(-maxMessages)`. Convenience wrappers `logDebug`/`logInfo`/`logWarn`/`logError` prepend level tags and emojis and log under the `system` category. Activity feed helpers (`addPlayerAction`, `addGuineaPigReaction`, `addAutonomousBehavior`, `addEnvironmentalEvent`, `addAchievement`) log info-level messages under their respective categories. `logActivity` accepts a `{category, action, details}` object and logs a formatted system message.

## Utilities & settings
`clearMessages`, `clearOldMessages` (prunes by retention window), `getMessagesByTimeRange`, and `exportMessages` (JSON string) provide management. `updateSettings` merges partial settings; `toggleLogging` and `toggleDebugMessages` flip flags and log the change.

## Persistence
`getState` returns only `recentMessages` plus flags/settings for saving; `loadState` restores from a saved object with defaults. On store creation, an init `logInfo('Logging system initialized')` is called.

## Exports

- **useLoggingStore** (store) — `useLoggingStore(): Store`: Pinia setup store ('loggingStore') exposing state (computed), computed views (activityMessages, debugMessages, recentMessages, messagesByCategory), core logging (addMessage, logDebug, logInfo, logWarn, logError), activity feed helpers (addPlayerAction, addGuineaPigReaction, addAutonomousBehavior, addEnvironmentalEvent, addAchievement, logActivity), utilities (clearMessages, clearOldMessages, getMessagesByTimeRange, exportMessages), settings (updateSettings, toggleLogging, toggleDebugMessages), and persistence (getState, loadState).
- **LogLevel** (type) — `type LogLevel = 'debug' | 'info' | 'warn' | 'error'`: Severity level of a log message.
- **MessageCategory** (type) — `type MessageCategory = 'player_action' | 'guinea_pig_reaction' | 'autonomous_behavior' | 'environmental' | 'system' | 'achievement'`: Category classifying a message's source/type.
- **ActivityMessage** (type) — `interface ActivityMessage { id, timestamp, level, category, message, emoji?, metadata? }`: A single logged message record.
- **LoggingSettings** (type) — `interface LoggingSettings { maxMessages, showDebugMessages, enableActivityFeed, messageRetentionHours }`: Configurable logging behavior settings.

## Internal dependencies

- `pinia`
- `vue`

## Notes

- `addMessage` returns an empty object cast as `ActivityMessage` when logging is disabled — callers assuming a valid message may get an object lacking real fields.
- `getState` intentionally saves only `recentMessages` (within retention window), so older messages are dropped on save/reload.
- The store logs an init message and side-effect logs on toggle actions, so message history is never truly empty right after creation.
- `enableActivityFeed` setting is stored but not referenced in any computed logic within this file.
