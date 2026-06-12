# 3D View UI Controls Implementation Plan

**Document Status:** Planning
**Phase:** Phase 3
**Created:** 2025-11-30
**Purpose:** Design floating action button (FAB) menu system for 3D habitat controls

---

## Overview

This document outlines the plan for implementing UI controls in the 3D habitat view ([Habitat3DDebug.vue](../../src/components/debug/environment/Habitat3DDebug.vue)). The controls will use a floating action button (FAB) menu system that reveals popout panels, adapted from the existing sidebar patterns in [HabitatDebug.vue](../../src/components/debug/environment/HabitatDebug.vue).

### Goals

1. **Provide full habitat control in 3D view** - Match functionality available in 2D debug view
2. **Maintain mobile-first design** - Ensure controls work on touch devices and small screens
3. **Minimize visual clutter** - Keep 3D view clear until controls are needed
4. **Reuse existing components** - Leverage sidebar components where possible

---

## Current State Analysis

### Existing 3D View Features

Currently implemented in Habitat3DDebug.vue:
- ✅ Guinea pig selection via raycasting (click to select)
- ✅ Selection visual feedback (pulsing green ring)
- ✅ Floating action buttons for selected guinea pig:
  - Feed, Water, Play, Pet, Deselect
- ✅ Poop cleanup interaction (click poop to remove)
- ✅ Debug water bottle rotation panel

### Existing 2D Sidebar Features

From HabitatDebug.vue sidebar tabs:

1. **Inventory Sidebar** ([InventorySidebar.vue](../../src/components/game/habitat/sidebars/InventorySidebar.vue))
   - Item grid display (serving-based items, regular items, bedding)
   - Drag-and-drop or select-to-place modes
   - Visual feedback for selected items
   - Touch device support

2. **Habitat Care Sidebar** ([HabitatCareSidebar.vue](../../src/components/game/habitat/sidebars/HabitatCareSidebar.vue))
   - Overall condition display
   - Care actions: Clean Habitat, Quick Clean, Refill Water, Fill All Hay Racks
   - Core conditions sliders: Cleanliness, Bedding Freshness, Water Level
   - Chew item durability tracking

3. **Guinea Pig Sidebar** ([GuineaPigSidebar.vue](../../src/components/game/habitat/sidebars/GuineaPigSidebar.vue))
   - Player friendship display
   - Companion bonds display (with bond tier and level)
   - Interaction buttons: Pet, Hold, Hand Feed, Gentle Wipe, Clip Nails
   - Social interactions: Talk To, Sing To, Call Name, Peek-a-Boo, Wave Hand, Show Toy

4. **Activity Feed Sidebar** ([ActivityFeedSidebar.vue](../../src/components/game/habitat/sidebars/ActivityFeedSidebar.vue))
   - Event log with filtering
   - Category-based message display
   - Auto-scroll functionality

5. **Other Sidebars** (lower priority for 3D view)
   - Bonding Sidebar
   - Chat Bubble Debug
   - Autonomy Sidebar

---

## Proposed UI Architecture

### Main Components Hierarchy

```
Habitat3DDebug.vue
├── ThreeCanvas (3D scene)
├── FloatingActionMenu (NEW)
│   ├── MainFAB (always visible)
│   └── MenuOptions (expand on click)
│       ├── HabitatControlsOption → HabitatControlsPanel
│       ├── InventoryOption → InventoryPanel
│       ├── GuineaPigOption → GuineaPigPanel
│       └── ActivityFeedOption → ActivityFeedPanel
└── WaterBottleDebugPanel (existing debug controls)
```

### Floating Action Menu System

**Component:** `FloatingActionMenu.vue` (NEW)

**Location:** Positioned in bottom-right corner (configurable)

**Behavior:**
1. **Collapsed state:** Shows only main FAB icon (e.g., ⚙️ or 🎮)
2. **Expanded state:** Shows menu of 4 options radiating outward
3. **Active panel state:** One panel visible as overlay, other FABs hidden or dimmed

**Menu Options:**
- 🏠 Habitat Controls
- 🎒 Inventory
- 🐹 Guinea Pig
- 📋 Activity Feed

---

## Panel Designs

### 1. Habitat Controls Panel

**Adapted from:** [HabitatCareSidebar.vue](../../src/components/game/habitat/sidebars/HabitatCareSidebar.vue)

**Component:** `HabitatControlsPanel.vue` (NEW - wrapper around HabitatCareSidebar)

**Layout:**
- Floating panel positioned to the left or top of FAB menu
- Scrollable content if needed on mobile
- Close button in header

**Content Sections:**

1. **Overall Condition** (from HabitatCareSidebar:9-14)
   - BlockMessage variant based on condition level
   - Large percentage display

2. **Care Actions** (from HabitatCareSidebar:17-67)
   - 🧽 Clean Habitat
   - 🧹 Quick Clean
   - 💧 Refill Water
   - 🌾 Fill All Hay Racks
   - All buttons with appropriate disabled states

3. **Core Conditions** (from HabitatCareSidebar:69-132)
   - Cleanliness slider (editable in debug mode)
   - Bedding Freshness slider
   - Water Level slider
   - Color-coded value labels

4. **Chew Items** (from HabitatCareSidebar:135-160)
   - Dynamic list of chew items in habitat
   - Durability sliders for each item
   - Usage count display

**Size:** Similar to sidebar width (~280-320px), height adapts to content (max 80vh)

**Positioning:**
- Desktop: Left of FAB menu, aligned to bottom
- Mobile: Full-width overlay at bottom, slide-up animation

---

### 2. Inventory Panel

**Adapted from:** [InventorySidebar.vue](../../src/components/game/habitat/sidebars/InventorySidebar.vue)

**Component:** `InventoryPanel.vue` (NEW - wrapper around InventorySidebar)

**Special Considerations for 3D:**

The inventory system will need integration with 3D raycasting for item placement:

1. **Placement Mode:**
   - Select item from inventory
   - Panel dims/collapses but remains visible with "Cancel" button
   - 3D scene highlights valid placement positions with raycasting
   - Click on floor to place item at that world position
   - Item snaps to grid position using existing `gridToWorld()` function

2. **Item Removal:**
   - Click placed item in 3D scene to select
   - Show removal option in context menu or FAB menu

**Layout:**
- Same as Habitat Controls Panel structure
- Header with mode toggle button (drag vs. select)
- Instruction banner
- Scrollable item grid

**Content Sections:**

1. **Mode Toggle** (from InventorySidebar:13-21)
   - Switch between drag-drop and tap-to-place
   - Hide on touch-only devices

2. **Placement Instructions** (from InventorySidebar:25-32)
   - Dynamic instruction text based on selected item
   - Cancel button when item selected

3. **Item Grid** (from InventorySidebar:33-90)
   - Serving-based consumables (hay, lettuce, carrots)
   - Regular habitat items
   - Bedding (read-only display)

**3D Integration Points:**
```typescript
// In Habitat3DDebug.vue
function handleItemPlacementClick(event: MouseEvent) {
  if (!selectedInventoryItem) return

  const intersects = raycaster.intersectObject(groundPlane)
  if (intersects.length > 0) {
    const worldPos = intersects[0].point
    // Convert world position to grid coordinates
    const gridPos = worldToGrid(worldPos)
    // Place item via store
    habitatConditions.addItemToHabitat(selectedInventoryItem.itemId, gridPos.col, gridPos.row)
    // Clear selection
    inventoryPanelRef.value?.onItemPlaced()
  }
}
```

---

### 3. Guinea Pig Panel

**Adapted from:** [GuineaPigSidebar.vue](../../src/components/game/habitat/sidebars/GuineaPigSidebar.vue)

**Component:** `GuineaPigPanel.vue` (NEW - wrapper around GuineaPigSidebar)

**3D Integration:**

The guinea pig panel should work seamlessly with the existing guinea pig selection system:

1. **Auto-sync with 3D selection:**
   - When user clicks guinea pig in 3D view, panel updates to show that guinea pig
   - Panel's toggle button switches between multiple guinea pigs
   - Clicking panel's toggle button highlights the corresponding guinea pig in 3D

2. **Interaction Feedback:**
   - When interaction button clicked (e.g., "Pet"), show visual feedback in 3D:
     - Animation on 3D model (future)
     - Particle effect at guinea pig position
     - Status text popup above guinea pig

**Layout:**
- Same panel structure as others
- Scrollable for mobile (many interaction buttons)

**Content Sections:**

1. **Header with Toggle** (from GuineaPigSidebar:3-20)
   - Guinea pig name and emoji
   - Toggle button for multiple guinea pigs

2. **Player Friendship** (from GuineaPigSidebar:23-45)
   - Friendship percentage display
   - Slider (disabled, visual only)
   - Friendship level message

3. **Companion Bonds** (from GuineaPigSidebar:48-76)
   - List of bonds with other guinea pigs
   - Bond tier badges (neutral, friends, bonded)
   - Bond level sliders
   - Interaction count

4. **Interaction Buttons** (from GuineaPigSidebar:79-183)
   - Physical: Pet, Hold, Hand Feed, Gentle Wipe, Clip Nails
   - Social: Talk To, Sing To, Call Name, Peek-a-Boo, Wave Hand, Show Toy
   - All with appropriate disabled states and cooldowns

**3D Integration Points:**
```typescript
// In Habitat3DDebug.vue
watch(() => selectedGuineaPig.value, (newGP) => {
  if (newGP && guineaPigPanelRef.value) {
    // Update panel to show this guinea pig
    guineaPigPanelRef.value.setDisplayedGuineaPig(newGP.id)
  }
})

function handleInteraction(action: string) {
  if (!selectedGuineaPig.value) return

  // Show visual feedback in 3D
  const gpModel = guineaPigModels.get(selectedGuineaPig.value.id)
  if (gpModel) {
    showInteractionFeedback(gpModel, action)
  }

  // Perform game logic
  gameController.performInteraction(selectedGuineaPig.value.id, action)
}
```

---

### 4. Activity Feed Panel

**Adapted from:** [ActivityFeedSidebar.vue](../../src/components/game/habitat/sidebars/ActivityFeedSidebar.vue)

**Component:** `ActivityFeedPanel.vue` (NEW - wrapper around ActivityFeedSidebar)

**Layout:**
- Taller than other panels (optimize for message list)
- Auto-scroll to newest messages
- Filter buttons at top

**Content:**
- Category filters (player_action, guinea_pig_reaction, autonomous_behavior, environmental, achievement)
- Scrollable message list
- Message limit (e.g., 100 most recent)

**Special Considerations:**
- This panel is read-only, no 3D integration needed
- Can remain open while interacting with 3D scene
- Consider semi-transparent background option

---

## Floating Action Button Menu Design

### Main FAB

**Component:** `FloatingActionButton.vue` (NEW)

**Props:**
```typescript
interface Props {
  icon: string          // Emoji or icon identifier
  label?: string        // Tooltip label
  variant?: 'primary' | 'secondary' | 'tertiary'
  size?: 'sm' | 'md' | 'lg'
  position?: { x: string; y: string }  // e.g., { x: '2rem', y: '2rem' }
  disabled?: boolean
}
```

**Styling:**
- Circular button using [panel.css](../../src/styles/panel.css) variables
- Box shadow for elevation
- Hover/active states
- Pulsing animation when important action available

**Base CSS:**
```css
.fab {
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  inline-size: 56px;
  block-size: 56px;
  border-radius: var(--radius-full);
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  box-shadow: var(--shadow-lg);
  cursor: pointer;
  transition: all var(--transition-normal);
  border: none;
  font-size: var(--font-size-xl);
  z-index: 1000;
}

.fab:hover {
  transform: scale(1.1);
  box-shadow: var(--shadow-xl);
}

.fab--sm {
  inline-size: 40px;
  block-size: 40px;
  font-size: var(--font-size-base);
}

.fab--lg {
  inline-size: 72px;
  block-size: 72px;
  font-size: var(--font-size-2xl);
}
```

### Menu Expansion Animation

**Menu Options Layout:**

When main FAB is clicked, menu options appear in a radial pattern:

```
        [🐹]
          |
[🎒] - [⚙️] - [🏠]
          |
        [📋]
```

**Animation:**
- Stagger animation (each option appears sequentially)
- Scale + fade in
- Spring physics for natural feel

**Implementation Approach:**
```typescript
// In FloatingActionMenu.vue
const menuOptions = [
  { icon: '🏠', label: 'Habitat Controls', panel: 'habitat' },
  { icon: '🎒', label: 'Inventory', panel: 'inventory' },
  { icon: '🐹', label: 'Guinea Pig', panel: 'guineapig' },
  { icon: '📋', label: 'Activity Feed', panel: 'activity' }
]

const isExpanded = ref(false)
const activePanel = ref<string | null>(null)

function toggleMenu() {
  isExpanded.value = !isExpanded.value
  if (!isExpanded.value) {
    activePanel.value = null
  }
}

function openPanel(panelId: string) {
  activePanel.value = panelId
  isExpanded.value = false  // Collapse menu when panel opens
}
```

---

## Panel Positioning System

### Desktop Layout (>768px width)

**Main FAB Position:** Bottom-right corner (2rem from edges)

**Panel Positions:**
- Habitat Controls: Left of FAB menu, bottom-aligned
- Inventory: Left of FAB menu, bottom-aligned
- Guinea Pig: Left of FAB menu, bottom-aligned
- Activity Feed: Right side of screen, full height (alternative: left of FAB like others)

**Panel Sizing:**
- Width: 320px (habitat, inventory, guinea pig)
- Width: 280px (activity feed - narrower for messages)
- Height: max 80vh, scrollable content

### Mobile Layout (<768px width)

**Main FAB Position:** Bottom-right corner (1rem from edges)

**Panel Positions:**
- All panels: Full-width overlay at bottom
- Slide-up animation from bottom
- Semi-transparent backdrop
- Close button in top-right of panel

**Panel Sizing:**
- Width: 100vw
- Height: max 70vh, scrollable content
- Modal-style presentation

---

## Component Structure

### New Components to Create

1. **`FloatingActionButton.vue`** - Base FAB component
   - Location: `src/components/basic/`
   - Reusable circular button with icon
   - Variant support (primary, secondary, tertiary)

2. **`FloatingActionMenu.vue`** - FAB menu orchestrator
   - Location: `src/components/game/habitat/`
   - Manages menu expansion/collapse
   - Handles panel visibility
   - Coordinates positions

3. **`HabitatControlsPanel.vue`** - Wrapper for habitat care
   - Location: `src/components/game/habitat/panels/`
   - Wraps HabitatCareSidebar with panel chrome
   - Close button, positioning

4. **`InventoryPanel.vue`** - Wrapper for inventory
   - Location: `src/components/game/habitat/panels/`
   - Wraps InventorySidebar with panel chrome
   - 3D placement mode integration

5. **`GuineaPigPanel.vue`** - Wrapper for guinea pig info
   - Location: `src/components/game/habitat/panels/`
   - Wraps GuineaPigSidebar with panel chrome
   - Syncs with 3D selection

6. **`ActivityFeedPanel.vue`** - Wrapper for activity feed
   - Location: `src/components/game/habitat/panels/`
   - Wraps ActivityFeedSidebar with panel chrome
   - Read-only, can stay open

### Shared Panel Chrome

Create a shared `BasePanel.vue` component to avoid duplication:

```vue
<!-- BasePanel.vue -->
<template>
  <div :class="panelClasses" :style="panelStyles">
    <div class="base-panel__header">
      <h3>{{ title }}</h3>
      <Button
        @click="$emit('close')"
        variant="tertiary"
        size="sm"
        class="base-panel__close"
      >
        ✕
      </Button>
    </div>
    <div class="base-panel__content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  position: 'left' | 'right' | 'bottom'
  width?: string
  maxHeight?: string
}

// Panel positioning and styling logic
</script>
```

---

## 3D Integration Requirements

### Raycasting for Item Placement

**Current Implementation:**
- Guinea pig selection already uses raycasting ([Habitat3DDebug.vue](../../src/components/debug/environment/Habitat3DDebug.vue))
- Poop cleanup uses raycasting

**New Requirements:**

1. **Ground plane raycasting** for item placement
   - Detect click on floor grid
   - Convert world coordinates to grid coordinates
   - Show placement preview at hover position

2. **Item raycasting** for removal/interaction
   - Detect click on placed items
   - Show context menu or highlight for removal
   - Integrate with inventory panel

3. **Visual feedback:**
   - Hover highlight on valid placement cells
   - Invalid placement feedback (red tint, shake animation)
   - Placement preview (semi-transparent item model)

**Implementation Approach:**

```typescript
// In Habitat3DDebug.vue

// Add ground plane raycasting
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)

function handleCanvasClick(event: MouseEvent) {
  if (inventoryPanel.value?.isInPlacementMode) {
    handleItemPlacement(event)
  } else if (/* ... existing guinea pig selection logic ... */) {
    // ... existing code ...
  }
}

function handleItemPlacement(event: MouseEvent) {
  // Raycast to ground plane
  const intersects = raycaster.intersectObject(groundPlane)
  if (intersects.length === 0) return

  const worldPos = intersects[0].point
  const gridPos = worldToGrid(worldPos)

  // Validate placement
  const isValid = validateItemPlacement(
    selectedInventoryItem.value,
    gridPos.col,
    gridPos.row
  )

  if (isValid) {
    placeItem(selectedInventoryItem.value, gridPos.col, gridPos.row)
  } else {
    showInvalidPlacementFeedback()
  }
}

function worldToGrid(worldPos: THREE.Vector3): { col: number; row: number } {
  // Inverse of gridToWorld from use3DSync.ts
  const col = Math.round(worldPos.x / GRID_CONFIG.CELL_SIZE + GRID_CONFIG.COLS / 2)
  const row = Math.round(worldPos.z / GRID_CONFIG.CELL_SIZE + GRID_CONFIG.ROWS / 2)
  return { col, row }
}
```

### Coordinate System Integration

**Existing Functions** (from [use3DSync.ts](../../src/composables/use3DSync.ts)):
- `gridToWorld(col, row)` - Convert 2D grid to 3D Vector3
- `gridToWorldWithOffset(pos)` - Convert with pixel offsets

**New Functions Needed:**
- `worldToGrid(worldPos)` - Convert 3D Vector3 to 2D grid
- `validateItemPlacement(item, col, row)` - Check if placement is valid
- `highlightGridCell(col, row, color)` - Visual feedback for placement

---

## Mobile Considerations

### Touch Device Optimizations

1. **Larger Touch Targets:**
   - FAB minimum size: 56px (meets accessibility standards)
   - Panel close buttons: minimum 44px
   - All interactive elements meet minimum touch target sizes

2. **Gesture Support:**
   - Swipe down to close panels
   - Long press for context menus
   - Pinch to zoom 3D view (if OrbitControls enabled)

3. **Responsive Panels:**
   - Full-width on mobile (<768px)
   - Slide-up animation
   - Backdrop dimming (semi-transparent overlay)

4. **Input Mode Detection:**
   - Use existing `isTouchDevice()` from [deviceDetection.ts](../../src/utils/deviceDetection.ts)
   - Adjust interaction patterns accordingly

### Performance Considerations

1. **Panel Lazy Loading:**
   - Only mount panel components when needed
   - Use `v-if` instead of `v-show` for panels

2. **Animation Performance:**
   - Use CSS transforms for animations (GPU-accelerated)
   - Avoid animating `width`, `height`, `top`, `left` (causes reflow)
   - Use `transform: translate()` and `scale()` instead

3. **3D Scene Performance:**
   - Pause render loop when panels are open and obscuring view
   - Resume rendering on panel close

---

## Implementation Phases

### Phase 1: Core FAB System (Priority: HIGH)
**Estimated Complexity:** Medium

1. Create `FloatingActionButton.vue` component
   - Basic styling and variants
   - Position props
   - Accessibility (ARIA labels)

2. Create `FloatingActionMenu.vue` component
   - Menu expansion logic
   - Radial positioning
   - Animation system

3. Create `BasePanel.vue` shared component
   - Panel chrome (header, close button)
   - Positioning system
   - Mobile responsiveness

4. Add to Habitat3DDebug.vue
   - Mount FloatingActionMenu
   - Wire up state management

**Deliverable:** Working FAB menu that expands/collapses

---

### Phase 2: Habitat Controls Panel (Priority: HIGH)
**Estimated Complexity:** Low (mostly reuse)

1. Create `HabitatControlsPanel.vue`
   - Wrap HabitatCareSidebar
   - Connect to BasePanel
   - Wire up all event handlers

2. Integrate with Habitat3DDebug.vue
   - Add to FloatingActionMenu options
   - Connect habitat conditions store

**Deliverable:** Habitat care functionality in 3D view

---

### Phase 3: Guinea Pig Panel (Priority: HIGH)
**Estimated Complexity:** Medium (3D sync required)

1. Create `GuineaPigPanel.vue`
   - Wrap GuineaPigSidebar
   - Connect to BasePanel

2. Sync with 3D selection
   - Watch selected guinea pig in 3D
   - Update panel when selection changes
   - Toggle button selects guinea pig in 3D

3. Visual feedback for interactions
   - Particle effects (future)
   - Status text popups (future)

**Deliverable:** Guinea pig interactions in 3D view

---

### Phase 4: Inventory Panel (Priority: MEDIUM)
**Estimated Complexity:** High (3D placement system)

1. Create `InventoryPanel.vue`
   - Wrap InventorySidebar
   - Connect to BasePanel

2. Implement 3D placement system
   - Ground plane raycasting
   - `worldToGrid()` conversion
   - Placement validation
   - Visual feedback (hover highlight)

3. Implement item removal
   - Click item to select
   - Show removal option
   - Handle container contents (bowls, hay racks)

**Deliverable:** Full inventory management in 3D view

---

### Phase 5: Activity Feed Panel (Priority: LOW)
**Estimated Complexity:** Low (mostly reuse)

1. Create `ActivityFeedPanel.vue`
   - Wrap ActivityFeedSidebar
   - Connect to BasePanel

2. Optimize for 3D view
   - Semi-transparent background option
   - Compact mode
   - Keep open while interacting

**Deliverable:** Activity feed visible in 3D view

---

### Phase 6: Polish & Refinement (Priority: MEDIUM)
**Estimated Complexity:** Medium

1. Animation polish
   - Smooth transitions
   - Spring physics
   - Loading states

2. Mobile optimization
   - Test on real devices
   - Gesture support
   - Performance tuning

3. Accessibility
   - Keyboard navigation
   - Screen reader support
   - Focus management

4. Settings/preferences
   - FAB position customization
   - Panel auto-close behavior
   - Default panel on open

**Deliverable:** Production-ready UI system

---

## Technical Considerations

### State Management

**Store Integration:**
- `useHabitatConditions()` - Habitat care, items, conditions
- `useGuineaPigStore()` - Guinea pig data, selection
- `useInventoryStore()` - Item inventory
- `useActivityFeedStore()` - Activity messages
- `useUiPreferencesStore()` - Panel positions, preferences

**Component State:**
```typescript
// In FloatingActionMenu.vue
const isMenuExpanded = ref(false)
const activePanel = ref<'habitat' | 'inventory' | 'guineapig' | 'activity' | null>(null)

// In each panel component
const isPanelOpen = defineModel<boolean>('open')
```

### Event Flow

**User clicks FAB:**
1. `FloatingActionMenu.vue` toggles `isMenuExpanded`
2. Menu options appear with animation

**User clicks menu option (e.g., "Inventory"):**
1. `openPanel('inventory')` called
2. `activePanel.value = 'inventory'`
3. `isMenuExpanded.value = false`
4. `InventoryPanel.vue` receives `open` prop change
5. Panel animates in

**User clicks panel close button:**
1. Panel emits `close` event
2. `activePanel.value = null`
3. Panel animates out
4. FAB menu returns to collapsed state

### Styling Strategy

**Global Styles:**
- Use [panel.css](../../src/styles/panel.css) for panel styling
- Use CSS variables from [variables.css](../../src/styles/variables.css)
- Follow BEM naming convention

**Component-Specific Styles:**
- FAB components: New `.fab` class in global CSS or component styles
- Panel wrappers: Minimal wrapper styles, defer to BasePanel
- Mobile overrides: `@media (max-width: 768px)` queries

**Dark Mode:**
- Respect `@media (prefers-color-scheme: dark)`
- Use CSS variables that adapt automatically

---

## Accessibility Requirements

### Keyboard Navigation

1. **FAB Menu:**
   - Tab to focus main FAB
   - Enter/Space to toggle menu
   - Arrow keys to navigate menu options
   - Enter to select option

2. **Panels:**
   - Tab through interactive elements
   - Escape to close panel
   - Focus trap when panel open

3. **3D View:**
   - Maintain keyboard access to 3D controls when panels open
   - Allow closing panel to restore 3D focus

### Screen Reader Support

1. **ARIA Labels:**
   ```html
   <button
     class="fab"
     aria-label="Open controls menu"
     aria-expanded="false"
     aria-controls="fab-menu"
   >
     ⚙️
   </button>
   ```

2. **Role Attributes:**
   ```html
   <div
     role="dialog"
     aria-labelledby="panel-title"
     aria-modal="true"
   >
     <!-- Panel content -->
   </div>
   ```

3. **Live Regions:**
   - Activity feed uses `aria-live="polite"`
   - Status updates announced to screen readers

### Focus Management

1. **Panel Opens:**
   - Save currently focused element
   - Move focus to panel close button
   - Trap focus within panel

2. **Panel Closes:**
   - Restore focus to previously focused element
   - If FAB triggered panel, return focus to FAB

---

## Testing Strategy

### Unit Tests

1. **FloatingActionButton.vue**
   - Renders with correct icon
   - Emits click events
   - Applies variant classes
   - Handles disabled state

2. **FloatingActionMenu.vue**
   - Expands/collapses menu
   - Opens correct panel on option click
   - Closes panel on backdrop click

3. **Panel Components**
   - Receives and renders sidebar content
   - Emits close event
   - Syncs with store state

### Integration Tests

1. **3D Placement:**
   - Select item from inventory
   - Click 3D floor
   - Item appears in habitat
   - Inventory count decrements

2. **Guinea Pig Selection:**
   - Click guinea pig in 3D
   - Panel updates to show that guinea pig
   - Interaction button triggers action
   - Visual feedback appears in 3D

3. **Habitat Care:**
   - Click clean button
   - Habitat cleanliness increases
   - Visual feedback in 3D (future)

### Manual Testing

1. **Mobile Devices:**
   - Test on real iOS and Android devices
   - Verify touch targets are large enough
   - Check panel slide-up animation
   - Test gesture support

2. **Screen Sizes:**
   - Test on various desktop resolutions
   - Test on tablets (landscape and portrait)
   - Test on small phones (<375px width)

3. **Accessibility:**
   - Test with keyboard only (no mouse)
   - Test with VoiceOver (iOS) or TalkBack (Android)
   - Test with high contrast mode

---

## Future Enhancements

### Animation System

1. **3D Interaction Feedback:**
   - Particle effects for interactions (pet, feed, etc.)
   - Guinea pig animations (head turn, jump, etc.)
   - Item placement animation (drop from above)

2. **Panel Transitions:**
   - Morph between panels (e.g., Inventory → Habitat Care)
   - Contextual panel suggestions (e.g., low cleanliness → suggest Habitat Care)

### Advanced Features

1. **Quick Actions:**
   - Long-press FAB for quick action menu
   - Recent actions shortcuts
   - Customizable quick actions

2. **Panel Docking:**
   - Pin panel to stay open
   - Multi-panel support (e.g., Activity Feed + Inventory)
   - Minimize to header bar

3. **Context-Aware Panels:**
   - Auto-open relevant panel based on 3D interaction
   - Smart suggestions based on habitat state

4. **Panel Presets:**
   - Save panel layout preferences
   - Different layouts for different tasks (care mode, play mode, etc.)

---

## Open Questions

1. **Panel Overlap:**
   - Should multiple panels be able to open simultaneously?
   - If yes, how to manage z-index and positioning?
   - **Recommendation:** Start with single panel, add multi-panel later if needed

2. **FAB Position:**
   - Should position be configurable by user?
   - If yes, how to persist preference?
   - **Recommendation:** Fixed bottom-right initially, add customization in Phase 6

3. **3D View Interaction:**
   - Should 3D controls (OrbitControls) be disabled when panel is open?
   - **Recommendation:** Allow 3D interaction when panel is narrow, disable when full-screen (mobile)

4. **Inventory Placement Preview:**
   - Show 3D model preview at cursor position?
   - Show grid highlight only?
   - **Recommendation:** Grid highlight for Phase 4, 3D preview in future enhancement

5. **Activity Feed Integration:**
   - Should feed auto-open when important events occur?
   - Should feed be semi-transparent to not block 3D view?
   - **Recommendation:** Manual open only, optional transparency in settings

---

## Success Criteria

✅ **Phase 3 is complete when:**

1. All 4 panels are implemented and functional
2. FAB menu system works on desktop and mobile
3. 3D item placement works via Inventory panel
4. Guinea pig panel syncs with 3D selection
5. Habitat care actions work from panel
6. Activity feed displays in panel
7. Keyboard navigation works for all controls
8. Screen reader support is functional
9. Mobile touch interactions are smooth
10. No major performance regressions in 3D view

---

## References

**Related Files:**
- [HabitatDebug.vue](../../src/components/debug/environment/HabitatDebug.vue) - 2D sidebar reference
- [Habitat3DDebug.vue](../../src/components/debug/environment/Habitat3DDebug.vue) - 3D view implementation
- [HabitatCareSidebar.vue](../../src/components/game/habitat/sidebars/HabitatCareSidebar.vue)
- [InventorySidebar.vue](../../src/components/game/habitat/sidebars/InventorySidebar.vue)
- [GuineaPigSidebar.vue](../../src/components/game/habitat/sidebars/GuineaPigSidebar.vue)
- [ActivityFeedSidebar.vue](../../src/components/game/habitat/sidebars/ActivityFeedSidebar.vue)
- [use3DSync.ts](../../src/composables/use3DSync.ts) - Coordinate conversion
- [panel.css](../../src/styles/panel.css) - Panel styling

**Documentation:**
- [DEVELOPMENT_PHASES.md](../DEVELOPMENT_PHASES.md) - Overall project phases
- [item-models-refactoring.md](./item-models-refactoring.md) - Item system refactoring
