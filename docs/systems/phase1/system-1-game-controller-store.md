# Game Controller Store (Pinia) - System 1

**Phase 1: Foundation & Infrastructure**

## Implementation Status
✅ **Completed** - September 17, 2025 | Branch: GPS2-3

**Files Created:**
- `src/stores/gameController.ts` - Main Pinia store implementation
- `src/components/GameControllerTest.vue` - Test interface for validation

**Key Features Implemented:**
- Four game states with validation (intro, playing, paused, stopped)
- Pause priority system (manual overrides orientation)
- Complete save/load functionality with localStorage
- Settings foundation (auto-save, tutorial, performance, error reporting)
- Error handling and state recovery
- Auto-save system with configurable intervals
- TypeScript interfaces for type safety
- Comprehensive test interface for validation

## Overview
Central control system managing game state, save/load functionality, settings, and error handling. Acts as the primary coordinator for all game systems.

## Game State Management (Four Primary States)

### INTRO State
- **When:** App first loads, no guinea pig exists, or after "New Game"
- **UI:** Guinea pig creation form displayed
- **Behavior:** Game loop inactive, no needs decay, no autonomous behaviors
- **Transitions:** `intro` → `playing` (after guinea pig creation)

### PLAYING State
- **When:** Guinea pig exists and user is actively playing
- **UI:** Full game interface visible (habitat, needs bars, interactions)
- **Behavior:** Game loop active, needs decay, autonomous behaviors, all interactions enabled
- **Transitions:** `playing` → `paused` (user pause/orientation), `playing` → `stopped` (user quit)

### PAUSED State
- **When:** User manual pause OR OrientationModal active (mobile portrait)
- **UI:** Pause overlay or orientation prompt, game visually frozen
- **Behavior:** Game loop suspended, no needs decay, no autonomous behaviors, limited interactions
- **Transitions:** `paused` → `playing` (resume/orientation fix), `paused` → `stopped` (quit while paused)

### STOPPED State
- **When:** User explicitly quits/closes game (future state for cleanup)
- **UI:** Optional goodbye screen or immediate app close
- **Behavior:** Save final state, cleanup resources, prepare for next session
- **Transitions:** `stopped` → `intro` (restart app) or app termination

## State Transition Logic & Pause Priority

- **Pause Priority System:** Manual pause overrides orientation pause
- **State Persistence:** Current state saved to localStorage for recovery
- **Resume Logic:** Preserve user intent (if manually paused, don't auto-resume on orientation change)
- **Transition Validation:** Ensure only valid state transitions are allowed
- **State Recovery:** Detect and handle invalid state combinations on app startup

## State Management Structure (TypeScript Interface)

```typescript
interface GameState {
  currentState: 'intro' | 'playing' | 'paused' | 'stopped'
  pauseReason?: 'manual' | 'orientation' | null
  hasGuineaPig: boolean
  isFirstTimeUser: boolean
  lastSaveTimestamp: number
}
```

## Auto-Save Integration with State Management

- **Save Triggers:** State changes, periodic intervals (30s/1m/2m based on settings)
- **Save Content:** Current state + guinea pig data + needs + preferences + settings
- **Load on Startup:** Detect existing save → skip intro if guinea pig exists
- **State-Aware Persistence:** Different save strategies for different states

## Core Functionality

- Save/load game functionality with browser persistence
- New game functionality with data reset
- Auto-save and auto-load on browser open
- Settings management foundation (expandable structure for all game preferences)

## Initial Settings (Phase 1.1)

### Auto-Save Configuration
- **Auto-save enabled/disabled** (default: enabled)
- **Save frequency** (30 seconds, 1 minute, 2 minutes)

### Tutorial Controls
Global user preferences that persist across games:
- Tutorial mode: 'auto' | 'always_show' | 'never_show' (default: 'auto')
- Global first-time user detection
- Manual override controls for tutorial display

### Performance & Diagnostics
- **Performance mode** (standard/reduced for older devices)
- **Error reporting enabled/disabled** (default: enabled in development, disabled in production)
  - Captures JavaScript errors, failed save/load operations, performance issues
  - Stores error data locally: timestamp, error type, message, game state summary
  - User privacy control with clear explanation of data collection

## Error Handling & State Recovery

- **Corrupted Save Detection:** Fallback to intro state with user notification
- **State Recovery:** Log state transitions for debugging save/load issues
- **Error Reporting Integration:** Capture state-related errors with context (current state, transition attempted)
- **Tutorial System Integration:** State-aware tutorials, persistence across game sessions
- **First-Time Detection:** Track across all game sessions, not just current guinea pig

## Future Expansions

- **Settings Added Later:** Theme selection (after CSS Framework), sound controls (after Sound System), etc.
- Game session tracking (play time, statistics)

## Integration Points

- **All Systems:** State management and persistence coordination
- **UI Framework:** Responsive state and pause control
- **Logging System:** Error capture and debugging data
- **Debug Menu:** State manipulation and testing tools