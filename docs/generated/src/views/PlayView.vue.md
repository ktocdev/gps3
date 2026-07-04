---
source: src/views/PlayView.vue
source_hash: e5ba04c443ef57fb80cbf6678b9024897c2c47411466662bdc7e024982feabf8
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# PlayView

`src/views/PlayView.vue`

> Top-level route view that decides between showing the active game session and the pet-store onboarding flow. It renders the game when a bonded pair exists, otherwise shows the pet store picker with a one-time intro splash overlay.

This is a thin routing/presentation view driven by two computed flags.

### State & data flow
- `hasActiveSession` is true when `petStoreManager.activeGameSession` exists AND `guineaPigStore.activeGuineaPigs` is non-empty.
- When `hasActiveSession` is true, renders `<GameView :is-fullscreen="false" />`.
- Otherwise renders the onboarding branch: `<PetStorePicker />` plus a conditional `<IntroLoadingScreen>` overlay.
- `showIntro` is `!introSeen.value` (from `useIntroFlow`); the intro plays until dismissed. `IntroLoadingScreen`'s `@done` event calls `markIntroSeen` to hide it.

The component holds no local mutable state of its own; all state comes from Pinia stores and the `useIntroFlow` composable.

## Exports

- **PlayView** (component) — `<PlayView />`: Default Vue SFC export. Takes no props and emits no events. Switches between GameView (when an active session with active guinea pigs exists) and the PetStorePicker + IntroLoadingScreen onboarding branch.

## Internal dependencies

- `../components/game/GameView.vue`
- `../components/chrome/PetStorePicker.vue`
- `../components/chrome/IntroLoadingScreen.vue`
- `../composables/useIntroFlow`
- `../stores/petStoreManager`
- `../stores/guineaPigStore`

## Notes

- The intro splash is only relevant in the no-session branch and, per the comment, plays once per page load (its persistence depends on useIntroFlow's implementation).
