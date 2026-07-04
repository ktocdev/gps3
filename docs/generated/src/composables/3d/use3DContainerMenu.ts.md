---
source: src/composables/3d/use3DContainerMenu.ts
source_hash: 69674375757dc6ce40a7e3d4728a699ac34db172ed6391d681c1b5f0bb08cf47
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# use3DContainerMenu

`src/composables/3d/use3DContainerMenu.ts`

> A Vue composable that manages the state and interactions for container menus in the 3D habitat view — specifically food bowls and hay racks. It handles opening/closing menus, filling and clearing containers, adding/removing individual items, and removing containers from the habitat, coordinating between multiple Pinia stores.

## State
Exposes reactive refs: `selectedContainerId`, `selectedContainerType` (`'bowl' | 'hay_rack'`), `showContainerMenu`, `showInventoryMenu`, and `menuPosition` ({x, y}).

## Computed
- `availableFoodItems` / `availableHayItems`: build `InventoryMenuItem[]` by scanning inventory quantities/servings and enriching with supplies-store metadata (name, emoji). Hay uses `getTotalServings`.
- `currentMenuItems`, `menuTitle`, `menuEmptyMessage`: switch output based on `selectedContainerType`.
- `currentBowlContents`, `currentBowlCapacity` (defaults to 3, read from item stats), `currentContainerName`, `currentHayServings`, `currentHayFreshness` (defaults 100): read from `habitatConditions` keyed by the selected container id.

## Functions
- `openContainerMenu` / `closeContainerMenu` / `closeInventoryMenu` / `closeAllMenus`: manage which menu is visible and reset selection.
- `handleContainerFill`: for hay racks, fills directly up to `CONSUMPTION.HAY_RACK_MAX_CAPACITY` using the first available hay item (`getFirstAvailableHayItemId`), logs and triggers a care reaction; for bowls, swaps to the inventory menu to pick a food type.
- `handleContainerClear`: empties the bowl or hay rack, logs, and closes the menu.
- `handleRemoveFood(index)`: removes a single food item from the bowl.
- `handleAddItemToContainer(itemId)`: adds food/hay to the selected container, logs a player action, triggers a care reaction, then closes the inventory menu.
- `handleRemoveContainer`: clears contents, removes the placement from the habitat (inventory unmark handled internally), and logs.
- `showCareReaction(careType)`: for each active guinea pig, dispatches a `show-chat-bubble` CustomEvent on `document` with a random reaction message.
- `isAnyMenuOpen()`: returns whether either menu is showing.

## Data flow
Container placement ids are converted to base item ids via `getBaseItemId` to look up supplies metadata. All mutations funnel through `habitatConditions`, with side logging via `loggingStore`.

## Exports

- **use3DContainerMenu** (composable) — `function use3DContainerMenu(): { selectedContainerId, selectedContainerType, showContainerMenu, showInventoryMenu, menuPosition, currentMenuItems, menuTitle, menuEmptyMessage, currentContainerName, currentBowlContents, currentBowlCapacity, currentHayServings, currentHayFreshness, openContainerMenu, closeContainerMenu, closeInventoryMenu, closeAllMenus, handleContainerFill, handleContainerClear, handleRemoveFood, handleAddItemToContainer, handleRemoveContainer, isAnyMenuOpen }`: Composable returning reactive state, computed props, and handler functions for managing food bowl and hay rack menus in the 3D habitat.
- **ContainerType** (type) — `type ContainerType = 'bowl' | 'hay_rack'`: Union type identifying the two supported container kinds.

## Internal dependencies

- `../../stores/habitatConditions`
- `../../stores/loggingStore`
- `../../stores/suppliesStore`
- `../../stores/inventoryStore`
- `../../stores/guineaPigStore`
- `../../constants/supplies`
- `../../utils/placementId`
- `../../components/basic/InventoryItemMenu.vue`
- `../../data/guineaPigMessages`

## Notes

- `showCareReaction` dispatches a global `show-chat-bubble` CustomEvent on `document`, coupling this composable to a DOM event listener elsewhere.
- Food bowl item ids are hardcoded in `availableFoodItems` ('hay_timothy', 'food_pellets_standard', 'food_green_leaf_lettuce', 'food_carrot'); hay rack fill only uses hay-category items.
- `handleContainerFill` for hay racks does NOT close the menu (intentional, to show updated state), unlike other handlers.
- `currentBowlCapacity` defaults to 3 and `currentHayFreshness` defaults to 100 as placeholders when data is unavailable.
- Emits console.log/warn side effects throughout.
