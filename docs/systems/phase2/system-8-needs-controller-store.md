# Needs Controller Store (Pinia) - System 8

**Phase 2: Core Game Entities & State**

## ✅ Implementation Status

**Status:** **COMPLETED** - Core implementation finished
**Implementation:** `src/stores/needsController.ts`
**Date Completed:** September 28, 2025
**Remaining Work:** Integration validation and UI component connections

### What's Implemented
- ✅ Complete centralized needs management with batch processing
- ✅ Wellness calculation system (weighted: 40/25/20/15 distribution)
- ✅ Friendship penalty system with configurable thresholds and rates
- ✅ Performance monitoring and threshold management
- ✅ Pause/resume functionality for needs processing
- ✅ Session storage persistence and state management
- ✅ Activity logging integration for all needs events
- ✅ Integration with guinea pig store for batch updates

### Validation Needed
- [ ] UI component integration (wellness display, friendship meter)
- [ ] Debug panel integration validation
- [ ] Cross-system coordination testing
- [ ] Performance validation with multiple guinea pigs
- [ ] Threshold tuning and balance validation

---

## Overview
Central needs management system coordinating batch processing, wellness calculation, and friendship penalty system across all guinea pig needs.

## Core Functionality

### Central Needs Management
- **Centralized coordination** of all needs processing
- **Batch processing** all needs decay for performance optimization
- **State synchronization** across needs and related systems
- **Transaction-like updates** to maintain data consistency

### Batch Processing System
- **Simultaneous updates** of all 7 needs categories
- **Efficient calculation cycles** reducing computational overhead
- **Atomic operations** preventing partial need updates
- **Performance monitoring** for optimization opportunities

## Internal Wellness Rating System

### Wellness Calculation (Internal Only)
- **Real-time average** of all 7 needs (0-100 scale)
- **Not exposed to UI** - internal system calculation only
- **Continuous monitoring** for threshold detection
- **Weighted averaging** with configurable need importance factors

### Wellness Threshold Management
- **Penalty threshold:** < 45% triggers friendship penalties
- **Warning threshold:** < 50% provides contextual warnings
- **Recovery threshold:** > 55% stops penalties and begins recovery
- **Optimal bonus threshold:** > 75% provides friendship bonuses

## Friendship Penalty System

### Penalty Calculation
- **Graduated penalties** based on wellness levels:
  - 35-45%: -0.5 friendship points per game tick
  - 25-35%: -0.75 friendship points per game tick
  - Below 25%: -1.0 friendship points per game tick
- **Real-time application** during game tick processing
- **Immediate effect** on friendship meter display

### Penalty Prevention & Recovery
- **Early warning system** at < 50% wellness threshold
- **Quick recovery rewards** for rapid wellness improvement
- **Penalty suspension** immediately when wellness improves above 45%
- **Bonus application** for sustained high wellness (> 75%)

## Notification & Alert System

### Need State Change Notifications
- **Real-time notifications** for significant need changes
- **Threshold crossing alerts** when needs move between ranges
- **Critical need warnings** for needs below 25%
- **Recovery notifications** when needs improve significantly

### Contextual Wellness Warnings
- **Threshold-based warnings** only when approaching penalty range (< 50%)
- **Non-intrusive alerts** that don't overwhelm player
- **Actionable guidance** suggesting specific improvements
- **Warning escalation** as wellness approaches penalty threshold

### Enhanced Friendship Meter Integration
- **Real-time feedback** showing wellness penalty effects
- **Visual indicators** when penalties are active
- **Trend display** showing friendship direction and rate
- **Recovery progress** visualization during wellness improvement

## System Integration

### Game Tick Integration
- **Synchronized processing** with main game timing system
- **Consistent update intervals** for predictable need behavior
- **Performance-optimized** batch operations during game ticks
- **State persistence** coordination with save/load system

### Cross-System Communication
- **Guinea Pig Store** synchronization for need values and friendship
- **Habitat Conditions** integration for environmental need effects
- **Activity Feed** coordination for need-related messages
- **UI Components** real-time updates for need displays

## Technical Implementation

### Store Architecture
```typescript
interface NeedsControllerState {
  // Internal wellness calculation
  currentWellness: number
  wellnessHistory: number[]
  lastWellnessUpdate: number

  // Penalty system
  isPenaltyActive: boolean
  currentPenaltyRate: number
  penaltyStartTime: number

  // Processing control
  lastBatchUpdate: number
  processingEnabled: boolean
  batchSize: number
}

interface NeedsControllerActions {
  processBatchUpdate(): void
  calculateWellness(): number
  applyFriendshipPenalties(): void
  checkThresholds(): void
  emitNotifications(): void
}
```

### Performance Optimization
- **Batch operation efficiency** minimizing individual need calculations
- **Lazy evaluation** of complex interdependencies
- **Caching strategies** for frequently accessed calculations
- **Memory management** for wellness history and notification queues

## Debug Integration

### Development Tools
- **Need manipulation interface** for testing scenarios
- **Wellness calculation visualization** showing component breakdown
- **Threshold testing tools** for validating penalty triggers
- **Performance metrics** monitoring batch processing efficiency

### Testing Capabilities
- **Scenario simulation** for different wellness combinations
- **Penalty system validation** ensuring correct friendship effects
- **Notification testing** verifying appropriate warning triggers
- **Integration testing** across all connected systems

## Logging Integration

### Need Processing Events
- **Batch update logging** for performance analysis
- **Wellness calculation logs** for balancing validation
- **Penalty application tracking** for system monitoring
- **Threshold crossing events** for player behavior analysis

### Analytics & Monitoring
- **Player behavior patterns** related to need management
- **System performance metrics** for optimization guidance
- **Balance validation data** for gameplay tuning
- **Error tracking** for system reliability monitoring

## Configuration & Balancing

### Adjustable Parameters
- **Penalty thresholds** configurable for difficulty balancing
- **Penalty rates** adjustable based on player feedback
- **Wellness calculation weights** for need importance tuning
- **Notification timing** customizable for user experience optimization

### Balancing Tools
- **A/B testing support** for different penalty configurations
- **Player progression tracking** to optimize difficulty curves
- **Feedback integration** from player behavior analysis
- **Dynamic adjustment** capabilities for live balancing

## Future Enhancements
- **Advanced wellness algorithms** with more sophisticated calculations
- **Personalized penalty systems** adapting to individual player patterns
- **Predictive need management** suggesting optimal care timing
- **Machine learning integration** for dynamic balancing based on player behavior
- **Multi-guinea pig wellness** coordination for advanced gameplay