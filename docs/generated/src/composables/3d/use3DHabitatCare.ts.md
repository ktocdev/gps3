---
source: src/composables/3d/use3DHabitatCare.ts
source_hash: 210ec46b8f9b1a61f48935c93f40ebdeab67534c079683b54457870b4c728a0f
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# use3DHabitatCare composable

`src/composables/3d/use3DHabitatCare.ts`

> A Vue composable that manages habitat care actions (cleaning, quick clean, water refill, and hay management) for the 3D habitat view. It coordinates dialog visibility state, formats action-result content, logs player actions, and triggers guinea pig chat-bubble reactions.

## State
Manages reactive dialog flags (`showCleanCageDialog`, `showHayManagementDialog`, `showActionResultDialog`) and action-result content refs (`actionResultIcon`, `actionResultTitle`, `actionResultMessage`, `actionResultStats`). Computed properties (`habitatDirtiness`, `beddingNeeded`, `beddingAvailable`) proxy values from the `useHabitatConditions` store for the clean cage dialog.

## Data flow
Each FAB handler calls into the `useHabitatConditions` store to perform the actual care operation, then:
1. Logs the action via `loggingStore.addPlayerAction` with an emoji icon (on success).
2. Calls `showCareReaction(...)` to dispatch reactions.
3. Populates the action-result dialog refs and opens `showActionResultDialog` (for quick clean and water refill).

`fabCleanHabitat` and `fabFillHay` simply open their respective dialogs. `handleCleanCageConfirm(beddingType)` invokes `habitatConditions.cleanCage` and logs/reacts on success. `fabQuickClean` computes cleanliness boost stats based on poops removed. `fabRefillWater` computes the amount filled from the previous water level.

## Chat reactions
`showCareReaction(careType)` iterates over `guineaPigStore.activeGuineaPigs`, picks a random message from `guineaPigMessages.care[careType]`, and dispatches a bubbling `show-chat-bubble` CustomEvent on `document` with the guinea pig id and reaction.

## Exports

- **use3DHabitatCare** (composable) — `function use3DHabitatCare(): { showCleanCageDialog, showHayManagementDialog, showActionResultDialog, actionResultIcon, actionResultTitle, actionResultMessage, actionResultStats, habitatDirtiness, beddingNeeded, beddingAvailable, showCareReaction, fabCleanHabitat, handleCleanCageConfirm, fabQuickClean, fabRefillWater, fabFillHay }`: Main composable returning dialog state refs, action-result content refs, computed habitat values, the showCareReaction helper, and FAB action handlers.
- **ActionStat** (type) — `interface ActionStat { label: string; value: string | number }`: Shape of a single stat row displayed in the action result dialog.

## Internal dependencies

- `../../stores/habitatConditions`
- `../../stores/loggingStore`
- `../../stores/guineaPigStore`
- `../../data/guineaPigMessages`
- `vue`

## Notes

- showCareReaction dispatches a DOM CustomEvent ('show-chat-bubble') on document rather than using a store/event bus; a listener must exist elsewhere for reactions to appear.
- careType values accepted by showCareReaction include 'beddingRefresh', 'hayRackFill', and 'bowlFill', but the internal handlers only ever pass 'cageClean' and 'waterRefill'.
- fabRefillWater derives amountFilled from waterLevel captured before refillWater() is called; assumes the store fills to 100%.
