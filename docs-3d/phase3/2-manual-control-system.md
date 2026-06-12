# Phase 3: Manual Control System for Free Movement

**Status:** 📋 Planning
**Priority:** HIGH - Essential for free movement integration
**Created:** December 6, 2025
**Goal:** Allow players to temporarily control guinea pig movement while maintaining autonomous behavior

---

## 📋 Overview

In free movement mode, the habitat should function normally with autonomous guinea pigs. When a player wants direct control, they can select a guinea pig and enable "Control Guinea Pig Movements" to override autonomy temporarily. This creates an engaging, optional interaction layer without disrupting the simulation's natural flow.

---

## 🎯 Design Principles

1. **Non-Intrusive**: Default behavior is autonomous - control is opt-in
2. **Contextual**: Control option only appears when relevant (guinea pig selected)
3. **Temporary**: Control automatically releases after inactivity or deselection
4. **Visual Feedback**: Clear indication when in control mode
5. **Smooth Transition**: Seamless switch between autonomous and controlled states

---

## 🎮 User Flow

### Normal Mode (Default)
```
1. Habitat displays with autonomous guinea pigs
2. Click on habitat → Standard interactions (place items, clean, etc.)
3. Click on guinea pig → Shows guinea pig info panel
4. Guinea pigs move autonomously based on needs/behaviors
```

### Control Mode (Opt-in)
```
1. Click on guinea pig → Shows guinea pig info panel
2. New button appears: "🎮 Control Movement"
3. Click button → Enters control mode
4. Click anywhere in habitat → Guinea pig moves to location
5. Control mode ends when:
   - Click "Stop Controlling" button
   - Select different guinea pig
   - Click outside habitat
   - 30 seconds of inactivity
```

---

## 🏗️ Technical Architecture

### State Management

```typescript
interface GuineaPigControlState {
  // Control mode state
  controlMode: {
    enabled: boolean
    controlledGuineaPigId: string | null
    startTime: number
    lastActivityTime: number
  }

  // Movement state
  movement: {
    type: 'autonomous' | 'manual'
    targetPosition?: { x: number; y: number }
    pathPoints?: Vector2D[]
  }

  // Visual feedback
  ui: {
    showControlButton: boolean
    showTargetMarker: boolean
    showPathPreview: boolean
    controlModeIndicator: boolean
  }
}
```

### Component Structure

```typescript
// New composable for control system
composables/game/useManualControl.ts
- Manages control state
- Handles input events
- Coordinates with movement system
- Auto-timeout logic

// Updated movement system
composables/game/useMovementSystem.ts
- Checks control state before autonomous movement
- Applies manual movement when controlled
- Smooth transition between modes

// UI Components
components/game/habitat/ControlModeOverlay.vue
- Visual indicators for control mode
- Target markers and path preview
- Control mode timer/status

components/game/habitat/GuineaPigControlPanel.vue
- "Control Movement" button
- "Stop Controlling" button
- Control mode instructions
```

---

## 🔄 Control Mode Features

### 1. Movement Control
- **Click-to-Move**: Click anywhere in habitat to set destination
- **Path Preview**: Show dotted line from guinea pig to target
- **Obstacle Avoidance**: Automatic pathfinding around items
- **Speed Control**: Optional speed adjustment while controlling

### 2. Visual Feedback
```typescript
// Control mode indicators
- Guinea pig outline/glow effect
- "CONTROLLED" badge above guinea pig
- Target marker at click position
- Path trail visualization
- Control timer countdown
```

### 3. Interaction Overrides
While in control mode:
- ✅ Can still interact with items (eat, drink, play)
- ❌ Autonomous behaviors paused
- ❌ Social interactions limited (other pigs avoid controlled pig)
- ✅ Manual interactions still work (pet, hold, feed)

### 4. Auto-Release Conditions
Control automatically releases when:
```typescript
const shouldReleaseControl = () => {
  return (
    // Inactivity timeout (30 seconds)
    Date.now() - lastActivityTime > 30000 ||

    // Guinea pig reaches destination and stops
    (reachedTarget && velocity === 0) ||

    // Player deselects guinea pig
    selectedGuineaPigId !== controlledGuineaPigId ||

    // Player leaves habitat view
    currentView !== 'habitat' ||

    // Emergency/stress (guinea pig needs urgent care)
    guineaPig.stress > 80
  )
}
```

---

## 🎨 UI/UX Design

### Control Button States

```typescript
// Button appearances
interface ControlButtonState {
  default: {
    text: "🎮 Control Movement"
    variant: "secondary"
    tooltip: "Take control of guinea pig movement"
  }
  active: {
    text: "🛑 Stop Controlling"
    variant: "danger"
    tooltip: "Release control (ESC)"
  }
  disabled: {
    text: "🎮 Control Movement"
    variant: "disabled"
    tooltip: "Cannot control during [reason]"
  }
}
```

### Visual Indicators

1. **Guinea Pig Highlight**
   - Soft glow around controlled guinea pig
   - Color: Player's theme color or blue
   - Pulsing animation

2. **Target Marker**
   - Appears at click position
   - Animated ripple effect
   - Disappears on arrival

3. **Path Visualization**
   - Dotted line from pig to target
   - Updates in real-time
   - Fades as guinea pig moves

4. **Control Mode HUD**
   ```
   ┌─────────────────────────┐
   │ 🎮 CONTROLLING: Fluffy  │
   │ Click to move • ESC to stop │
   │ Time: 0:25              │
   └─────────────────────────┘
   ```

---

## 🔧 Implementation Phases

### Phase 1: Basic Control System
- [ ] Add control state to guinea pig store
- [ ] Create useManualControl composable
- [ ] Add control button to guinea pig panel
- [ ] Implement click-to-move in free movement mode
- [ ] Add basic visual feedback (highlight)

### Phase 2: Visual Polish
- [ ] Add target markers
- [ ] Implement path preview
- [ ] Create control mode overlay
- [ ] Add animation effects
- [ ] Implement control timer

### Phase 3: Integration
- [ ] Pause autonomous behaviors during control
- [ ] Handle control mode transitions smoothly
- [ ] Add keyboard shortcuts (ESC to stop)
- [ ] Implement auto-release conditions
- [ ] Save control preferences

### Phase 4: Advanced Features
- [ ] Speed adjustment while controlling
- [ ] Waypoint system (queue multiple destinations)
- [ ] Follow mode (guinea pig follows mouse)
- [ ] Record and replay movements
- [ ] Multiplayer control sharing

---

## 🎮 Control Schemes

### Mouse/Touch Controls
```
- Left Click on guinea pig: Select
- Left Click on habitat: Move to position (if controlling)
- Right Click: Cancel current movement
- ESC key: Stop controlling
- Shift + Click: Add waypoint (future)
```

### Keyboard Controls (Future)
```
- WASD/Arrows: Direct movement
- Shift: Run faster
- Ctrl: Walk slower
- Space: Stop moving
- Tab: Switch guinea pigs
```

### Gamepad Controls (Future)
```
- Left Stick: Movement
- A Button: Confirm/Interact
- B Button: Cancel/Stop control
- Bumpers: Switch guinea pigs
```

---

## 🤝 Interaction with Other Systems

### Behavior System
```typescript
// In useGuineaPigBehavior.ts
function updateBehavior(guineaPig: GuineaPig) {
  // Check if manually controlled
  if (manualControl.isControlled(guineaPig.id)) {
    // Skip autonomous behavior
    return manualControl.getManualBehavior(guineaPig.id)
  }

  // Normal autonomous behavior
  return calculateAutonomousBehavior(guineaPig)
}
```

### Movement System
```typescript
// In useMovementSystem.ts
function getNextPosition(guineaPig: GuineaPig) {
  const control = useManualControl()

  if (control.isControlled(guineaPig.id)) {
    // Use manual target position
    return control.getTargetPosition()
  }

  // Use autonomous pathfinding
  return autonomousPathfinding.getNextPosition()
}
```

### Activity Feed
```typescript
// New activity messages
"You took control of Fluffy's movement"
"Fluffy reached the destination you set"
"Control released - Fluffy is autonomous again"
"Fluffy is following your commands"
```

---

## ⚙️ Configuration Options

### User Preferences
```typescript
interface ControlPreferences {
  // Control behavior
  autoReleaseOnArrival: boolean      // Stop control when destination reached
  showPathPreview: boolean           // Display movement path
  controlTimeout: number              // Seconds before auto-release (0 = never)

  // Visual settings
  highlightIntensity: 'subtle' | 'normal' | 'bright'
  showControlHUD: boolean
  targetMarkerStyle: 'circle' | 'arrow' | 'crosshair'

  // Advanced
  allowMultipleWaypoints: boolean    // Queue destinations
  pauseOtherPigs: boolean           // Freeze other guinea pigs
  cinematicMode: boolean            // Camera follows controlled pig
}
```

---

## 📊 Success Metrics

1. **Usability**
   - Players can easily understand how to control guinea pigs
   - Control mode activation is discoverable
   - Transitions are smooth and intuitive

2. **Performance**
   - No lag when switching modes
   - Smooth movement at 60 FPS
   - Instant response to clicks

3. **Integration**
   - Works seamlessly with existing systems
   - Doesn't break autonomous behaviors
   - Compatible with both grid and free movement

4. **Player Satisfaction**
   - Fun to control guinea pigs directly
   - Doesn't feel mandatory
   - Enhances rather than replaces simulation

---

## 🚧 Edge Cases to Handle

1. **Multiple Players** (Future)
   - Who gets control priority?
   - Can multiple pigs be controlled?
   - Control handoff mechanism

2. **Pathfinding Failures**
   - Target unreachable
   - Guinea pig gets stuck
   - Items blocking path

3. **State Conflicts**
   - Guinea pig needs urgent care during control
   - Multiple selection changes
   - Save/load during control mode

4. **Performance**
   - Many waypoints queued
   - Rapid clicking
   - Large habitats

---

## 🔗 References

- [Free Movement Prototype](./free-movement-prototype.md) - Base movement system
- [Hybrid Pathfinding System](./hybrid-pathfinding-system.md) - Pathfinding approach
- [Guinea Pig Behavior System](../../docs/systems/phase4/guinea-pig-behaviors.md) - Autonomous behaviors

---

## 📝 Notes

The manual control system should feel like a natural extension of the game, not a separate mode. Players should be able to seamlessly switch between watching their guinea pigs live autonomously and taking direct control for specific moments.

Key considerations:
- Make it optional and non-intrusive
- Provide clear visual feedback
- Ensure smooth transitions
- Don't break the simulation feel
- Keep it fun and responsive

---

**Last Updated:** December 6, 2025