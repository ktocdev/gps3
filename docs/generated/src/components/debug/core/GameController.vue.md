---
source: src/components/debug/core/GameController.vue
source_hash: 21aec71df7a8d6979aeb9e3f3f559b957ecd5684898ae9c9957da0769fa68e9e
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# GameController Debug Panel

`src/components/debug/core/GameController.vue`

> A debug UI component that surfaces game session state and system settings for guinea pig gameplay. It lets developers view and manage active guinea pig selection, inspect session/game state, toggle performance and error reporting settings, and control tutorial behavior.

## Structure
The template is composed of debug UI primitives (`DebugPanel`, `DebugPanelRow`, `DebugStatRow`, `DebugBadge`) arranged in two rows. The first row shows guinea pig selection and session status; the second row (3 columns) shows game state/controls, system settings, and tutorial controls.

## State & Data Flow
Two local refs `selectedGuineaPig1` and `selectedGuineaPig2` hold the currently chosen guinea pig IDs. A `watch` on `petStoreManager.activeGameSession` (immediate) restores these selections from `session.guineaPigIds` when a session exists, or clears them when none. When a session is active and there are active guinea pigs, the selection UI renders read-only text inputs (via `getGuineaPigName`); otherwise it renders editable `Select` dropdowns.

The `guineaPigOptions` and `guineaPig2Options` computeds merge available, sanctuary, and active-session guinea pigs into option lists, prefixing labels with ✨ (sanctuary), 🎮 (active), and gender emojis. `guineaPig2Options` additionally filters out the guinea pig chosen for slot 1.

## Settings
`tutorialMode` and `performanceMode` are writable computeds bound to `gameController.settings`, delegating writes to `setTutorialMode`/`setPerformanceMode`. `updateTutorialMode`/`updatePerformanceMode` are no-op handlers (the computed setter does the work). `resetFirstTimeUser` calls `updateSettings` to set `tutorial.isGlobalFirstTime` true. `replayTutorial` marks the tutorial incomplete, calls `tutorialStore.requestReplay()`, and navigates to `/` via the router. Error reporting is toggled via `gameController.toggleErrorReporting()`.

## Exports

- **GameController** (component) — `<GameController />`: Vue SFC (script setup) debug panel. No props or emits. Reads/writes from gameController, petStoreManager, guineaPigStore, playerProgression, and tutorialStore stores; uses vue-router for navigation.

## Internal dependencies

- `../../../stores/gameController`
- `../../../stores/petStoreManager`
- `../../../stores/guineaPigStore`
- `../../../stores/playerProgression`
- `../../../stores/tutorialStore`
- `../../basic/Button.vue`
- `../../basic/Select.vue`
- `../ui/DebugPanel.vue`
- `../ui/DebugPanelRow.vue`
- `../ui/DebugStatRow.vue`
- `../ui/DebugBadge.vue`
- `vue-router`

## Notes

- `getGenderEmoji` only handles 'male'/'female'; any other value falls through to the female emoji.
- `updateTutorialMode` and `updatePerformanceMode` are intentional no-ops — the actual state change happens through the writable computed setters; the `@change` handlers are redundant.
- `getGuineaPigName` looks up by `String(id)` in `guineaPigStore.collection.guineaPigs` and returns 'Unknown' if missing, relying on active guinea pigs always existing in the collection.
- The watch restore logic depends on `session.guineaPigIds` ordering to assign slot 1 and slot 2.
- Uses global (non-scoped) `<style>`, so its class rules affect the whole app.
