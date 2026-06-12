# Game Timing Systems - Systems 9 & 10

**Phase 2: Core Game Entities & State**

## ✅ Implementation Status

**Status:** **COMPLETED** - Core implementation finished
**Implementation:** `src/stores/gameTimingStore.ts`
**Date Completed:** September 28, 2025
**Remaining Work:** Validation testing and debug integration

### What's Implemented
- ✅ Complete interval management system with configurable timing (1-60 seconds)
- ✅ Game loop integration with needs controller batch processing
- ✅ Performance monitoring with delta time clamping and slow tick warnings
- ✅ Pause/resume functionality with game state coordination
- ✅ Error handling and recovery mechanisms
- ✅ Activity feed integration through logging system
- ✅ Session storage persistence for timing statistics

### Validation Needed
- [ ] Pause/resume coordination with Game Controller Store
- [ ] Background tab handling and orientation pause integration
- [ ] Cross-system synchronization testing
- [ ] Debug panel integration validation
- [ ] Performance testing with multiple guinea pigs

---

## System 9: Interval Management System

### Overview
Core timing system managing game ticks, pause/resume functionality, and coordinating timing across all game systems.

### Main Game Tick System
- **Tick frequency:** Every 1-5 seconds (configurable based on performance)
- **Consistent timing:** Reliable intervals for predictable gameplay
- **Performance scaling:** Adaptive tick rates based on system performance
- **Battery optimization:** Reduced frequency during low activity periods

### Multiple Interval Speeds
- **System-specific timing:** Different systems update at appropriate frequencies
- **Critical systems:** Needs decay, friendship penalties (frequent updates)
- **Moderate systems:** Habitat conditions, resource consumption (medium frequency)
- **Background systems:** Save operations, analytics (low frequency)
- **Performance coordination:** Stagger updates to prevent processing spikes

### Enhanced Pause/Resume Functionality

#### Dual Pause State Management
- **Manual user pause state:** Player-initiated pause controls
- **Automatic orientation pause state:** System pause when OrientationModal is active
- **Combined pause logic:** Game paused if either condition is true
- **Priority handling:** Manual pause overrides automatic pause behaviors

#### Pause State Coordination
- **Seamless resume:** Automatic resume when orientation modal dismisses
- **User intent preservation:** Manual pause persists across orientation changes
- **State recovery:** Reliable pause/resume across system interruptions
- **Background handling:** Pause during browser tab inactivity

### Background Tab Handling
- **Tab visibility detection:** Monitor browser focus and tab switching
- **Performance optimization:** Reduce processing when tab is inactive
- **State preservation:** Maintain game state during background periods
- **Resume synchronization:** Smooth transition when tab becomes active again

### Logging Integration
- **Timing event logging:** Track pause/resume events and durations
- **Performance monitoring:** Log tick processing times and bottlenecks
- **System coordination:** Monitor cross-system timing synchronization
- **Debug information:** Timing data for development and optimization

---

## System 10: Game Loop Integration

### Overview
Central coordination system connecting timing with all game systems, ensuring synchronized updates and cross-system integration.

### Core System Integration

#### Needs System Connection
- **Synchronized needs decay:** Align needs processing with game tick system
- **Consistent timing:** Predictable need changes based on reliable intervals
- **Performance optimization:** Batch needs processing during tick cycles
- **State coordination:** Synchronized needs updates with other systems

#### Future Phase 3 Integration (Habitat Conditions)
- **Environmental integration:** Habitat conditions will be integrated in Phase 3
- **Timing foundation:** Current timing system provides infrastructure for future habitat features
- **Extensible architecture:** Timing system designed to support additional systems

### Cross-System Integration

#### Phase 2 Core Integration
- **Needs system coordination:** Timing system drives needs decay and processing
- **Wellness system integration:** Real-time wellness calculation during game ticks
- **Game state synchronization:** Coordinated updates across core Phase 2 systems

#### Wellness-to-Friendship Integration
- **Real-time wellness calculation:** Continuous monitoring during game ticks
- **Friendship penalty application:** Synchronized penalties based on wellness thresholds
- **Immediate feedback:** Instant friendship meter updates during game loop
- **Recovery rewards:** Quick friendship improvement when wellness increases

### Game Loop Architecture

#### Phase 2 Tick Processing Order
1. **System state validation:** Ensure all systems are ready for update
2. **Time delta calculation:** Determine elapsed time since last tick
3. **Needs decay processing:** Update all needs based on time and current conditions
4. **Wellness calculation:** Compute current wellness from needs state
5. **Friendship adjustments:** Apply penalties or bonuses based on wellness
6. **Activity generation:** Create activity feed messages from changes
7. **UI updates:** Synchronize interface with current game state
8. **Save triggers:** Check for auto-save conditions and execute if needed

#### Future Phase 3+ Processing Extensions
- **Guinea pig autonomous actions:** AI behaviors (Phase 4)
- **Habitat condition updates:** Environmental changes and decay (Phase 3)
- **Item interactions:** Object usage and effects (Phase 3)

#### Performance Optimization
- **Batch processing:** Group related operations for efficiency
- **Lazy evaluation:** Only calculate complex values when needed
- **State caching:** Cache frequently accessed calculations
- **Update prioritization:** Critical updates processed before nice-to-have updates

### System Synchronization

#### State Consistency
- **Atomic updates:** Ensure all related systems update together
- **Transaction-like operations:** Prevent partial updates during tick processing
- **Rollback capabilities:** Handle errors without corrupting game state
- **Data integrity:** Validate state consistency across systems

#### Event Coordination
- **Event ordering:** Ensure events process in logical sequence
- **Cascade handling:** Manage chain reactions between system changes
- **Conflict resolution:** Handle competing system requirements gracefully
- **Priority management:** Critical events processed before routine updates

### Integration Points

#### Game Controller Store
- **Pause state coordination:** Respect pause states from game controller
- **Save/load integration:** Coordinate timing with persistence operations
- **Settings application:** Apply timing preferences and performance modes
- **State transition:** Manage timing during game state changes

#### Activity Feed System
- **Message generation:** Create activity messages from system changes
- **Timing coordination:** Sync activity messages with game events
- **Message queuing:** Handle multiple simultaneous events gracefully
- **Display synchronization:** Ensure activity feed matches current game state

#### Debug System Integration
- **Performance monitoring:** Track game loop efficiency and bottlenecks
- **System inspection:** Provide real-time view of game loop processing
- **Manual control:** Allow debug manipulation of timing and processing
- **Testing support:** Enable debugging of cross-system interactions

### Error Handling & Recovery

#### System Resilience
- **Error isolation:** Prevent single system failures from breaking game loop
- **Graceful degradation:** Continue operation when non-critical systems fail
- **Recovery mechanisms:** Automatic recovery from temporary system issues
- **Fallback behaviors:** Safe defaults when systems become unavailable

#### State Recovery
- **Checkpoint creation:** Regular game state snapshots for recovery
- **Corruption detection:** Identify and handle corrupted game states
- **Partial recovery:** Restore functional systems when others fail
- **User notification:** Inform players of recovery actions when necessary

## Technical Implementation

### Game Loop Structure
```typescript
interface GameLoop {
  tick(): Promise<void>
  pause(): void
  resume(): void
  getTickRate(): number
  setTickRate(rate: number): void
}

class GameLoopManager implements GameLoop {
  private tickInterval: number = 2000 // 2 seconds default
  private isPaused: boolean = false
  private isManualPaused: boolean = false
  private isOrientationPaused: boolean = false

  async tick(): Promise<void> {
    if (this.isPaused) return

    const deltaTime = this.calculateDeltaTime()

    // Phase 2 Core Processing
    await this.processNeedsDecay(deltaTime)
    await this.calculateWellness()
    await this.applyFriendshipEffects()
    await this.generateActivityMessages()
    await this.updateUI()
    await this.checkSaveConditions()

    // Future Phase Extensions:
    // await this.processHabitatConditions(deltaTime) // Phase 3
    // await this.processAutonomousBehaviors(deltaTime) // Phase 4
  }
}
```

### Performance Monitoring
- **Tick duration tracking:** Monitor time spent in each game loop cycle
- **System bottleneck identification:** Identify which systems consume most processing time
- **Memory usage monitoring:** Track memory allocation and garbage collection
- **Frame rate coordination:** Ensure smooth visual updates during game processing

## Future Enhancements
- **Dynamic tick rates:** Adaptive timing based on game activity and performance
- **Priority queuing:** More sophisticated event prioritization system
- **Multi-threaded processing:** Parallel processing of independent systems
- **Predictive processing:** Anticipate future states for smoother gameplay
- **Advanced scheduling:** Complex timing patterns for seasonal and special events