# System 17: Visual Presence & Positioning

**Phase 4, Stage 1 - Guinea Pig Visual Integration**

**Time Estimate:** 2-3 hours

## Goal

Get guinea pigs rendering on the habitat grid with selection functionality for choosing which guinea pig to interact with. Guinea pigs are fully autonomous - the player cannot control their movement, only select them for interactions (pet, play, feed, etc.).

## Dependencies

**Required Systems (Already Complete):**
- Position tracking (`habitatConditions.guineaPigPositions`)
- Guinea pig store (`guineaPigStore.activeGuineaPigs`)
- Habitat grid system

**Provides Foundation For:**
- System 18: Pathfinding & Movement
- System 19: Autonomous AI Behaviors
- System 20: Direct Interaction System
- System 21: Social Bonding System

## Implementation Tasks

### Task 1: GuineaPigSprite Component

Create the visual representation component for guinea pigs in the habitat.

#### Component Interface

```typescript
interface GuineaPigSpriteProps {
  guineaPig: GuineaPig
  gridPosition: { row: number; col: number }
  isInteractingWithDepthItem: boolean // True when using shelter/tunnel/hideaway
  isSelected: boolean // Visual selection state for interaction
}

interface GuineaPigSpriteEmits {
  (e: 'select', guineaPigId: string): void // Selects guinea pig for interaction
}
```

#### Features

**Visual Rendering:**
- Breed-specific emoji rendering (use `guineaPig.emoji` from existing guinea pig data)
- Grid-based positioning using CSS transforms
- Dynamic z-index layering based on interaction state:
  - Default: z-index 10 (above habitat items)
  - Interacting with depth items: z-index 3 (below habitat items)

**Interaction:**
- Click to select guinea pig for interaction (System 20 will show interaction menu)
- Selection is for **choosing which guinea pig to interact with**, not movement control
- Guinea pigs are fully autonomous (no player movement control)
- Hover state for visual clickability feedback

**Visual States:**
- `idle` - Default stationary state
- `hovering` - Subtle effect on mouse over
- `selected` - Visual highlight indicating this guinea pig is selected for interaction

#### Component Structure

```vue
<script setup lang="ts">
import { computed } from 'vue'
import type { GuineaPig } from '@/types/guineaPig'

interface Props {
  guineaPig: GuineaPig
  gridPosition: { row: number; col: number }
  isInteractingWithDepthItem: boolean
  isSelected: boolean
}

interface Emits {
  (e: 'select', guineaPigId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Calculate CSS transform for grid position
const spriteStyle = computed(() => ({
  transform: `translate(${props.gridPosition.col * CELL_SIZE}px, ${props.gridPosition.row * CELL_SIZE}px)`,
  zIndex: props.isInteractingWithDepthItem ? 3 : 10
}))

function handleClick() {
  emit('select', props.guineaPig.id)
}
</script>

<template>
  <div
    class="guinea-pig-sprite"
    :class="{ 'guinea-pig-sprite--selected': isSelected }"
    :style="spriteStyle"
    @click="handleClick"
  >
    <div class="guinea-pig-sprite__emoji">
      {{ guineaPig.emoji }}
    </div>
  </div>
</template>
```

#### CSS Styling

```css
.guinea-pig-sprite {
  position: absolute;
  inline-size: var(--cell-size);
  block-size: var(--cell-size);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer; /* Indicates guinea pig is clickable for selection */
  /* z-index set dynamically via inline style: 3 or 10 */
  transition: transform 0.3s ease-in-out, z-index 0s;
}

.guinea-pig-sprite__emoji {
  font-size: 2rem;
  line-height: 1;
}

/* Selection visual - indicates which guinea pig is selected for interaction */
.guinea-pig-sprite--selected {
  filter: brightness(1.2);
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: 50%;
}

/* Hover feedback indicates guinea pig is clickable */
.guinea-pig-sprite:hover {
  filter: brightness(1.1);
}
```

---

### Task 2: HabitatVisual Integration

Integrate guinea pig rendering into the existing habitat display component.

#### Rendering Logic

```typescript
// In HabitatVisual.vue
import { computed } from 'vue'
import { useGuineaPigStore } from '@/stores/guineaPigStore'
import { useHabitatConditionsStore } from '@/stores/habitatConditionsStore'
import { useHabitatItemsStore } from '@/stores/habitatItemsStore'
import GuineaPigSprite from './GuineaPigSprite.vue'

const guineaPigStore = useGuineaPigStore()
const habitatConditions = useHabitatConditionsStore()
const habitatItems = useHabitatItemsStore()

// Get active guinea pigs and their positions
const activeGuineaPigs = computed(() => guineaPigStore.activeGuineaPigs)
const guineaPigPositions = computed(() => habitatConditions.guineaPigPositions)
const selectedGuineaPigId = computed(() => guineaPigStore.selectedGuineaPigId)

function handleGuineaPigSelect(guineaPigId: string) {
  // Select guinea pig for interaction
  guineaPigStore.selectGuineaPig(guineaPigId)

  // System 20 will display interaction menu when guinea pig is selected
  // TODO: Connect to InteractionMenu component when System 20 is implemented
}

function getGuineaPigPosition(guineaPigId: string) {
  return guineaPigPositions.value[guineaPigId] || { row: 0, col: 0 }
}

function isInteractingWithDepthItem(guineaPigId: string): boolean {
  const position = getGuineaPigPosition(guineaPigId)

  // Check if there's a depth-triggering item at guinea pig's position
  const itemAtPosition = habitatItems.getItemAtPosition(position.row, position.col)

  if (!itemAtPosition) return false

  // Check if item type requires depth rendering (behind item)
  const depthItemTypes = ['shelter', 'tunnel', 'hideaway']
  return depthItemTypes.includes(itemAtPosition.stats?.itemType || '')
}
```

#### Template Integration

```vue
<template>
  <div class="habitat-visual">
    <!-- Existing habitat grid and items -->
    <div class="habitat-visual__grid">
      <!-- Grid cells -->
    </div>

    <div class="habitat-visual__items">
      <!-- Habitat items -->
    </div>

    <!-- Guinea pig sprites layer -->
    <div class="habitat-visual__guinea-pigs">
      <GuineaPigSprite
        v-for="guineaPig in activeGuineaPigs"
        :key="guineaPig.id"
        :guinea-pig="guineaPig"
        :grid-position="getGuineaPigPosition(guineaPig.id)"
        :is-interacting-with-depth-item="isInteractingWithDepthItem(guineaPig.id)"
        :is-selected="selectedGuineaPigId === guineaPig.id"
        @select="handleGuineaPigSelect"
      />
    </div>
  </div>
</template>
```

#### Z-Index Layering

Ensure proper rendering order with dynamic depth based on interaction state:

**Static Layers:**
1. **Grid background** - z-index: 1
2. **Habitat items** - z-index: 5
3. **UI overlays** - z-index: 100

**Dynamic Layer (Guinea Pigs):**
- **Above items (default)** - z-index: 10 (when moving around habitat)
- **Below items (interacting)** - z-index: 3 (when inside shelters, tunnels, hideaways)

**Interaction Detection:**
Guinea pigs render behind items when actively interacting with these item types:
- `shelter` - Igloos, houses, covered hideaways
- `tunnel` - Tubes, tunnels, passages
- `hideaway` - Basic hideaways, enclosed spaces

**Rationale:**
- Guinea pigs walk **around** items (pathfinding handles obstacle avoidance)
- Guinea pigs only appear **inside/behind** items when actively using them
- Provides visual feedback for interaction state
- Works with emoji sprites and future animated GIFs

---

### Task 3: Guinea Pig Store Selection

Add selection state management to guinea pig store.

**Purpose:** Selection allows the player to choose which guinea pig to interact with. This is **not** for controlling movement (guinea pigs are fully autonomous), but for choosing which one receives interactions (pet, play, feed, etc.).

```typescript
// In guineaPigStore.ts
export const useGuineaPigStore = defineStore('guineaPig', () => {
  // ... existing store state

  const selectedGuineaPigId = ref<string | null>(null)

  function selectGuineaPig(guineaPigId: string) {
    selectedGuineaPigId.value = guineaPigId
  }

  function clearSelection() {
    selectedGuineaPigId.value = null
  }

  return {
    // ... existing exports
    selectedGuineaPigId: readonly(selectedGuineaPigId),
    selectGuineaPig,
    clearSelection
  }
})
```

**Selection Flow:**
1. Player clicks guinea pig → `selectGuineaPig(id)` called
2. Visual selection highlight appears
3. System 20 displays interaction menu for selected guinea pig
4. Player chooses interaction (pet, play, feed, etc.)
5. Guinea pig reacts based on personality and friendship

---

### Task 4: Testing & Validation

#### Visual Testing

**Grid Position Accuracy:**
- [ ] Guinea pigs render at correct grid positions
- [ ] Position matches `guineaPigPositions` store data
- [ ] Position updates when store data changes

**Multi-Guinea Pig Rendering:**
- [ ] Multiple guinea pigs (up to 2) visible simultaneously
- [ ] Each guinea pig renders at different positions
- [ ] No visual overlap or collision issues

**Selection Interaction:**
- [ ] Clicking guinea pig selects it
- [ ] Selected guinea pig shows visual highlight
- [ ] Only one guinea pig can be selected at a time
- [ ] Selection visual feedback is clear and immediate

**Z-Index Layering:**
- [ ] Guinea pigs render above habitat items
- [ ] Guinea pigs render below UI overlays
- [ ] No z-index conflicts or visual glitches

#### Performance Testing

**Rendering Performance:**
- [ ] Smooth rendering with 2 guinea pigs + full habitat items
- [ ] No visual glitches during position updates
- [ ] Smooth transitions for depth changes (z-index switching)
- [ ] No frame rate drops

**Responsive Interaction:**
- [ ] Click detection works reliably
- [ ] No lag between click and selection
- [ ] Hover effects are smooth and responsive

---

## Files to Create/Modify

### New Files

```
src/components/game/habitat/GuineaPigSprite.vue
```

### Modified Files

```
src/components/game/habitat/HabitatVisual.vue - Integrate guinea pig rendering layer
src/stores/guineaPigStore.ts - Add selection state management
```

---

## Success Criteria

**Core Functionality:**
- [ ] Guinea pigs render at correct grid positions
- [ ] Multiple guinea pigs visible simultaneously
- [ ] Clicking guinea pig selects it (for choosing which one to interact with)
- [ ] Selected guinea pig shows visual highlight
- [ ] Dynamic z-index works (guinea pigs behind items when interacting)
- [ ] No visual rendering conflicts

**Selection for Interaction:**
- [ ] Selection allows choosing which guinea pig to interact with
- [ ] Selection does NOT control guinea pig movement (fully autonomous)
- [ ] Visual selection state clear and immediate
- [ ] Only one guinea pig selected at a time
- [ ] Ready for System 20 interaction menu integration

**Quality Standards:**
- [ ] Rendering performance acceptable (60fps)
- [ ] Selection interaction responsive (< 100ms)
- [ ] Visual feedback clear and intuitive
- [ ] Code follows project conventions (BEM CSS, TypeScript strict mode)

---

## Implementation Notes

### CSS Variables to Use

```css
--cell-size: /* Habitat grid cell size */
--color-primary: /* Selection highlight color */
--z-index-habitat-items: 5
--z-index-guinea-pigs-default: 10 /* Above items when moving around */
--z-index-guinea-pigs-interacting: 3 /* Below items when inside shelter/tunnel/hideaway */
--z-index-ui-overlay: 100
```

### Interaction State Detection

The `isInteractingWithDepthItem` function determines when a guinea pig should render behind items:

**Detection Logic:**
1. Get guinea pig's current grid position
2. Check if there's a habitat item at that exact position
3. Verify if item type is `shelter`, `tunnel`, or `hideaway`
4. Return true if all conditions met (triggers z-index: 3)

**Item Types That Trigger Depth:**
- **shelter** - Igloos (🏠), houses, covered hideaways
- **tunnel** - Tubes, tunnels, passages
- **hideaway** - Basic hideaways, enclosed spaces

**Pathfinding Integration:**
Guinea pigs only occupy these positions when actively using the item (via AI behavior system). The pathfinding system ensures guinea pigs walk around items rather than through them.

### Emoji Rendering

Use the existing `emoji` property from guinea pig data:
- Retrieved from breed data during guinea pig creation
- Already stored in `GuineaPig` interface
- Renders consistently across browsers

### Grid Position Calculation

Grid positions are already tracked in `habitatConditions.guineaPigPositions`:
```typescript
guineaPigPositions: {
  [guineaPigId: string]: { row: number; col: number }
}
```

No additional position calculation needed for Stage 1 (stationary rendering only).

### Selection vs Movement Control

**IMPORTANT DISTINCTION:**

**Selection (YES):**
- Player **can** click to select which guinea pig to interact with
- Selection shows visual highlight (outline)
- Selection opens interaction menu (System 20)
- Player chooses interaction: pet, play, feed, etc.
- **Purpose:** Choosing which guinea pig receives interactions

**Movement Control (NO):**
- Player **cannot** control guinea pig movement
- Guinea pigs are fully autonomous agents
- System 18 (Pathfinding) handles all movement
- System 19 (AI Behaviors) determines when/where to move
- **Purpose:** Guinea pigs are autonomous pets, not player-controlled units

**Interaction Flow:**
1. Player clicks guinea pig → Guinea pig is **selected** (visual highlight)
2. System 20 displays interaction menu for selected guinea pig
3. Player chooses interaction (pet, play, feed, etc.)
4. Guinea pig reacts based on personality and friendship
5. Guinea pig continues autonomous movement (player never controls movement)

---

## Next Steps

After completing System 17:

1. **Verify all success criteria** are met
2. **Test with 2 guinea pigs** thoroughly
3. **Move to System 18:** [Pathfinding & Movement](system-18-pathfinding-movement.md)

System 18 will add movement capabilities, which depend on the visual rendering established in this system.

---

## Related Documentation

- **Master Plan:** [phase-4-guinea-pig-integration-plan-full.md](phase-4-guinea-pig-integration-plan-full.md)
- **Next System:** [system-18-pathfinding-movement.md](system-18-pathfinding-movement.md)
- **Habitat Items Reference:** [system-14-habitat-items.md](../phase3/system-14-habitat-items.md)
