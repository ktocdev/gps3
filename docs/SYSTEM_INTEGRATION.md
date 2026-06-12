# System Integration & Architecture

## Overview
Comprehensive architecture documentation covering store communication patterns, component integration, data flow, and cross-system dependencies for the guinea pig simulation game.

## Store Communication Patterns

### Central Coordination
- **Game Controller Store** ✅ **Implemented** ↔ All other stores (game state, pause/resume, settings)
- **Game Timing Store** ✅ **Implemented** → All stores with time-based updates (unified tick system, pause/resume)

### Core Entity Management
- **Guinea Pig Store** ✅ **Implemented** ↔ Needs Controller Store (entity data, preference discovery, personality traits)
- **Guinea Pig Store** ↔ Habitat Conditions Store (habitat impact on guinea pig - Phase 3)
- **Needs Controller Store** ✅ **Implemented** ↔ Habitat Conditions Store (cross-condition effects - Phase 3 integration)
- **Needs Controller Store** ✅ **Implemented** → Guinea Pig Store (wellness calculation triggers friendship penalties)
- **Pet Store Manager Store** ✅ **Implemented** ↔ Guinea Pig Store (pet store inventory, active guinea pigs, session management, favorites system)
- **Player Progression Store** (persistent currency, items, achievements across sessions - Phase 3+)

### Supplies & Inventory Management (Phase 3)
- **Supplies Store** → Inventory Store (item catalog, pricing, availability)
- **Inventory Store** → Habitat Conditions Store (bedding, hay, water consumption)
- **Inventory Store** → Habitat Item System (placed items, item availability)
- **Inventory Store** → Needs Controller Store (food, treats consumption)
- **Inventory Store** ← Player Progression Store (persistent item ownership)

### Guinea Pig Integration (Phase 4)
- **Guinea Pig Movement Controller** ↔ Guinea Pig Store (position updates, state synchronization)
- **Pathfinding System** → Habitat Item System (obstacle detection, grid navigation)
- **AI Behavior System** ↔ Guinea Pig Store (need monitoring, personality-based decisions, state updates)
- **AI Behavior System** → Movement Controller (goal-based movement commands)
- **AI Behavior System** → Inventory Store (autonomous consumption: food, water, hay)
- **Direct Interaction System** ↔ Guinea Pig Store (interaction validation, preference discovery, friendship updates)
- **Direct Interaction System** → Needs Controller Store (need satisfaction from interactions)
- **Social Bonding System** ↔ Guinea Pig Store (compatibility calculation, bonding progression)
- **Social Bonding System** → AI Behavior System (social behavior triggers, proximity bonding)
- **Social Bonding System** → Needs Controller Store (social need bonuses from bonding)

### Data Flow Principles
- **Reactive updates** through Pinia store connections
- **Event-driven communication** for loosely coupled systems
- **Centralized state management** with distributed processing
- **Consistent update patterns** across all system interactions

## Component-Store Integration Map

### Information Display Components
- **ActivityFeed** ✅ **Implemented** ← All stores (activity message generation)
- **NeedBar** ✅ **Implemented** ← Needs Controller Store (10 needs display with quick actions)
- **FriendshipMeter** ✅ **Implemented** ← Guinea Pig Store (friendship + wellness penalties)
- **WellnessDisplay** ✅ **Implemented** ← Needs Controller Store (hidden wellness value, debug only)
- **HabitatStatusDisplay, ResourceCounter** ← Habitat Conditions Store (Phase 3)
- **PreferenceTracker** ✅ **Implemented** ← Guinea Pig Store (food preferences display)
- **PersonalityDisplay** ✅ **Implemented** ← Guinea Pig Store (5 personality traits)
- **SuppliesStoreUI, InventoryUI** ← Supplies Store + Inventory Store (Phase 3)

### System Control Components
- **OrientationModal, ResponsiveDetector** ✅ **Implemented** ← Game Controller Store (responsive state, pause control)
- **Debug Components** ✅ **Implemented** ↔ Respective system stores (bidirectional for testing)
  - **GameStateDebug** ✅ ← Game Controller Store + Game Timing Store
  - **GuineaPigsDebug** ✅ ← Guinea Pig Store (includes personality debugging)
  - **PetStoreDebug** ✅ ← Pet Store Manager Store
  - **HabitatDebug** ✅ ← Habitat Conditions Store (includes needs debugging)

### Guinea Pig Interaction Components (Phase 4) ✅ **Implemented**
- **GuineaPigSprite** ✅ ← Guinea Pig Store + Movement Controller (visual representation, position, state)
- **GuineaPigInteractionPanel** ✅ ↔ Direct Interaction System (socialize button, feedback display)
- **PathfindingDebug** ✅ ← Pathfinding System (path visualization, obstacle detection)
- **BehaviorDebug** ✅ ← AI Behavior System (decision matrix, priority weights, current goals)
- **BondingDebug** ✅ ← Social Bonding System (compatibility scores, bonding levels, social interactions)

### UI Framework Integration
- **Container-query components** adapt based on allocated space
- **Responsive layout controller** coordinates with Game Controller Store
- **Component library** provides consistent interfaces across all systems

## Event Flow & Dependencies

### 1. Game Initialization Flow
```
Game Controller → UI Framework → Component Library → Logging System
```
- Game state setup and responsive framework initialization
- Component library setup with debug system integration
- Logging system preparation for all subsequent events

### 2. Pet Store & Game Session Flow
```
Pet Store Generation → Pet Store Selection → Game Session Start → Guinea Pig Store → Activity Feed
```
- 10 random guinea pigs generated on first launch with hidden preferences
- Player selects 1-2 guinea pigs to start game session
- Session state initialized, persistent progression loaded
- Initial activity messages for session start

### 3. Game Loop Flow ✅ **Core Implemented**
```
Interval Management → Needs Controller → Habitat Conditions → Activity Generation → UI Updates
```
- Time-based processing coordination ✅ **Implemented** (gameTimingStore.ts)
- Batch needs processing and wellness calculation ✅ **Implemented**
- Habitat condition updates ✅ **Implemented** (awaiting Inventory integration for consumption)
- Activity feed message generation and UI synchronization ✅ **Implemented**

### 4. Guinea Pig Visual Presence Flow (Phase 4 - Stage 1)
```
Guinea Pig Store → GuineaPigSprite Component → Grid System → Habitat Container
```
- Visual representation of guinea pig in habitat
- Grid-based positioning and movement rendering
- Sprite selection and state-based visual updates
- Z-index layering with habitat items

### 5. Guinea Pig Movement Flow (Phase 4 - Stage 2)
```
Movement Controller → Pathfinding System → Grid System → GuineaPigSprite → Activity Feed
```
- A* pathfinding for navigation around habitat items
- Movement animation and position updates
- Wander behavior and goal-based movement
- Path validation and obstacle avoidance

### 6. Autonomous Behavior Flow (Phase 4 - Stage 3)
```
AI Decision System → Behavior Priority Matrix → Movement Controller → Guinea Pig Store → Activity Feed
```
- AI decision making based on needs, personality, and preferences (10 subsystems)
- Priority weighting: urgent needs (100), sleep (80), moderate needs (75), shelter (70), friendship (50), environmental (40), exploration (25)
- Movement and interaction execution (eating, drinking, sleeping, exploring, pooping)
- State updates and activity message generation
- Shelter-seeking and friendship behaviors

### 7. Player Interaction Flow (Phase 4 - Stage 4)
```
Direct Interaction System → Guinea Pig Selection → Interaction Validation → Guinea Pig Store → Activity Feed → Sound System
```
- User action processing and validation (40+ interactions across 7 categories)
- Guinea pig state updates and reaction generation
- Preference discovery through interaction feedback
- Natural language message creation and audio feedback
- Nail clipping complex success system

### 8. Guinea Pig Social Bonding Flow (Phase 4 - Stage 5)
```
Bonding System → Compatibility Calculation → Autonomous Social Behaviors → Guinea Pig Store → Activity Feed
```
- Hidden compatibility based on gender, personality, breed (research-based)
- Bonding progression: neutral (0-30) → friends (30-70) → bonded (70-100)
- Autonomous social behaviors: grooming, playing together, sharing food, sleeping together
- Proximity-based bonding opportunities and interaction bonuses
- Social need enhancement based on bonding tier

### 9. Guinea Pig Favorites Flow
```
Pet Store Selection → Favorites Storage → Pet Store Manager → Player Progression → Persistence
```
- Heart/star button integration on guinea pig cards during selection
- Favorites storage with slot management (3 initial, up to 10 purchasable)
- Currency-based slot purchases with escalating costs (100, 250, 625...)
- Store refresh protection (favorites preserved during pet store refresh)
- Move favorites back to store for flexibility and experimentation

## Data Flow Architecture

### Pinia Store Management
- **Centralized state management** with reactive updates
- **Session-based state** with localStorage integration:
  - **Session State**: Resets each game (guinea pig needs, habitat conditions, activity feed history)
  - **Persistent State**: Survives sessions (currency, owned items, achievements, statistics)
  - **Pet Store State**: Fixed pool of 10 guinea pigs with swap cooldown (1 hour)
- **Type-safe interfaces** with TypeScript definitions
- **Performance optimization** through efficient state updates

### Event Bus System
- **Cross-system communication** for loosely coupled components
- **Event prioritization** for critical vs routine updates
- **Error handling** and event recovery mechanisms
- **Debug integration** for development monitoring

### Activity Feed Integration
- **Central messaging system** for all user-facing events
- **Real-time updates** with performance optimization
- **Message categorization** and filtering capabilities
- **Accessibility integration** with screen reader support

### Logging & Debug Systems
- **Comprehensive event tracking** for development and analytics
- **Debug system integration** with all store communications
- **Performance monitoring** and bottleneck identification
- **Error tracking** and recovery mechanisms

## Cross-System Dependencies

### Phase 1 Dependencies (Foundation)
- **No external dependencies** - foundational systems
- **Provides infrastructure** for all subsequent phases
- **Debug system** enables testing of future systems
- **UI framework** provides placeholders for all functionality

### Phase 2 Dependencies (Core Entities) ✅ **COMPLETED**
- **Requires:** Complete Phase 1 foundation
- **Depends on:** Game Controller Store, UI framework, debug systems
- **Provides:** Core game entities, pet store system, session management, and timing for subsequent phases
- **Session Model:** Single-session gameplay with pet store selection (1-2 guinea pigs from pool of 10)
- **Progression System:** Persistent player progression (currency, items) across game sessions
- **Favorites System:** Emotional attachment benefits with up to 10 purchasable slots for preserving beloved guinea pigs
- **Store Refresh Protection:** Favorites survive pet store refresh cycles, maintaining player investment while encouraging experimentation
- **Game Timing System:** Unified tick system with pause/resume, automatic pause on navigation, manual pause tracking ✅ **Implemented**
- **Needs System:** 11 needs categories (hunger, thirst, energy, shelter, play, social, comfort, hygiene, nails, health, chew) with quick actions and smart disable states ✅ **Implemented**
- **Wellness System:** Hidden wellness calculation (average of all needs) with friendship penalty when < 45% ✅ **Implemented**

### Phase 2.5 Dependencies (Interactive Feedback Enhancement) 🚧 **IN PROGRESS**
- **Requires:** Complete Phase 2 core entities and timing
- **Depends on:** Guinea Pig Store, Needs Controller Store, Game Timing Store
- **Provides:** Personality-based interactions, preference system, wellness-based reactions, and enhanced activity messaging
- **Personality System:** 5 traits (Friendliness, Playfulness, Curiosity, Boldness, Cleanliness) affecting need decay, interaction effectiveness, and habitat tolerance ✅ **Implemented**
- **Preference System:** Individual guinea pig likes/dislikes for food (hay, leafy greens, veggies) with hidden discovery mechanics ✅ **Implemented**
- **Fulfillment Limitations:** Consumption limits per hunger cycle and interaction rejection based on personality + friendship + wellness 🚧 **In Progress**
- **Wellness Reactions:** Interaction success rates and behavioral states affected by wellness levels
- **Enhanced Activity Messages:** Guinea pig reactions, need warnings, wellness messages, preference discovery clues, friendship milestones
- **Guinea Pig Rescue:** Safety net when wellness < 15% with $200 penalty and Fresh Start option

### Phase 3 Dependencies (Game World - Systems 11-15) ✅ **COMPLETE**
- **Requires:** Guinea pig entity and needs framework from Phase 2
- **Depends on:** Complete timing system and state management
- **Provides:** Interactive environment with supplies catalog, inventory management, habitat conditions, and resource systems for Phase 4 behaviors
- **Status:** All core systems complete (October 15, 2025) | **Branch:** GPS2-26
- **Supplies Store System:** Central catalog of all purchasable items (bedding, hay, habitat items, food, treats) with pricing and availability ✅ **Implemented**
- **Inventory Management:** Quantity tracking, consumption logic, and item organization bridging purchases to game mechanics ✅ **Implemented**
- **Habitat Conditions:** Environmental state tracking (cleanliness, bedding freshness, water level, hay freshness) consuming inventory resources ✅ **Implemented**
- **Habitat Item System:** Grid-based habitat layout with drag & drop item placement and guinea pig autonomous item usage ✅ **Implemented**
- **Habitat Maintenance & Hygiene:** Cleanliness tracking, bedding freshness, water level monitoring, and poop accumulation system ✅ **Implemented**

### Phase 4 Dependencies (Guinea Pig Integration - Systems 17-21) ✅ **COMPLETE**
- **Requires:** Complete game world and habitat system from Phase 3 (grid system, habitat items, inventory)
- **Depends on:** Guinea Pig Store, Needs Controller, Habitat Conditions, Inventory System
- **Provides:** Complete gameplay loop with visual guinea pigs, autonomous behaviors, player interactions, and social bonding
- **Status:** All 5 systems complete (October 27, 2025) | **Branch:** GPS2-38
- **Visual Presence & Positioning:** GuineaPigSprite component with breed-specific emoji, grid positioning, z-index layering, and selection state ✅ **Implemented**
- **Pathfinding & Movement:** A* pathfinding algorithm, movement controller, wander behavior, obstacle detection, and CSS animations ✅ **Implemented**
- **Autonomous AI Behaviors:** AI decision priority matrix with 10 subsystems, need-based actions, shelter-seeking, friendship behaviors, environmental interactions, and personality-driven variations ✅ **Implemented**
- **Direct Interaction System:** Manual socialize trigger, dual guinea pig movement, adjacent positioning, wiggle animations, and bond progression ✅ **Implemented**
- **Social Bonding System:** Bond management with Map-based storage, bonding progression (0-100), social need modifiers, and localStorage serialization ✅ **Implemented**

### Phase 4.5 (Polish, Testing & Balance) 🚧 **IN PROGRESS**
- **Requires:** Complete Phase 4 core gameplay loop
- **Approach:** Iterative refinement through active playtesting and observation
- **Focus:** Bug fixes, balance adjustments, UX improvements, code quality, and CSS optimization
- **No New Systems:** Enhances existing functionality without architectural changes
- **Status:** Ongoing since October 27, 2025 | **Current Branch:** GPS2-45
- **Sprint History:** See [PROJECT_PLAN.md](PROJECT_PLAN.md) Phase 4.5 section for detailed sprint breakdown

### Phase 5 Dependencies (Polish & Enhancements - Systems 22-29) 📋 **Planned**
- **Requires:** Complete core gameplay from Phases 1-4
- **Enhances:** Existing functionality without breaking dependencies
- **Provides:** Enhanced player experience through context-aware interactions, progression systems, tutorials, and polish
- **Interaction Enhancement System:** Context-aware activity messages, wellness-based reactions (5 tiers), friendship milestones (6 tiers), and rescue safety net 📋 **Planned**
- **Enrichment & Resource Management:** Item effectiveness with newness bonuses, familiarity decay, rotation mechanics, and strategic purchasing 📋 **Planned**
- **Progression & Economy System:** Currency earning, achievement tracking, level progression, and supplies store item gating 📋 **Planned**
- **Game Tutorial System:** Step-by-step tutorial, contextual help tooltips, feature discovery prompts, and progressive unlocking 📋 **Planned**
- **Performance Mode System:** Full/reduced performance toggle, optimized rendering, and battery-saving options for mobile 📋 **Planned**
- **Sound System:** Audio manager, interaction sound feedback, guinea pig vocalizations, and ambient sounds 📋 **Planned**
- **Settings & Preferences:** User customization, theme selection, sound controls, and advanced preferences 📋 **Planned**
- **Guinea Pig Animation System:** Full animation framework replacing static emoji graphics (future enhancement) 📋 **Planned**

## Key Technical Considerations

### Performance Optimization

#### Game Loop Efficiency
- Use `setInterval` with proper cleanup for game loops
- Implement **efficient batch processing** for multiple needs, wellness calculations, and habitat conditions
- **Optimize habitat condition updates** - bedding decay, water consumption, cleanliness changes
- **Resource management efficiency** - track bedding inventory without excessive state updates

#### Responsive Performance
- **Throttle resize events** (100-200ms) to prevent excessive layout recalculations
- **Debounce orientation changes** (300ms) to avoid rapid modal show/hide
- **Container-query optimization** with performance-optimized observation
- **Smart rendering** to minimize unnecessary UI updates

### Architecture Design Principles

#### Extensibility
- **Design for extensibility** - easy to add new needs/features/habitat conditions
- **Modular system architecture** enabling independent system development
- **Plugin-like enhancement** capabilities for future features
- **Backward compatibility** maintenance across system updates

#### Type Safety & Development
- **TypeScript interfaces** for strong typing across all systems
- **Consistent API patterns** for store and component interactions
- **Comprehensive error handling** with graceful degradation
- **Development tool integration** for efficient debugging and testing

#### State Management Strategy
- **Session-based persistence model**:
  - **Session State**: Guinea pig needs, habitat conditions, activity feed (clears on game end)
  - **Persistent State**: Player currency, owned items, achievements, statistics (survives sessions)
  - **Pet Store State**: 10 guinea pig pool with swap cooldown management
  - **End Game Penalty**: Currency deduction when returning guinea pigs to store
- **Performance optimization for frequent updates** - The game's continuous loop creates multiple performance challenges:
  - **Wellness recalculation** happens every game tick (1-5 seconds) to check friendship penalties
  - **Habitat condition monitoring** tracks cleanliness decay, bedding freshness, and water consumption on different schedules
  - **Cross-system reactivity** where changes in one store trigger updates across multiple connected stores
  - **Mitigation strategies**: Batch calculations, throttle non-critical updates, cache frequently accessed values, optimize reactive subscriptions
- **Efficient reactivity** through targeted state observations
- **Memory management** for long-running game sessions

## Integration Testing Strategy

### Component Integration Testing
- **Store-component communication** validation
- **Event flow verification** across system boundaries
- **Performance testing** under various load conditions
- **Responsive behavior validation** across device constraints

### System Integration Testing
- **Cross-system data flow** verification
- **Error propagation** and recovery testing
- **Performance bottleneck** identification and resolution
- **Debug system validation** for all integration points

### User Experience Testing
- **Activity feed integration** with all systems
- **Responsive design** across all device types and orientations
- **Accessibility compliance** for screen readers and alternative interfaces
- **Performance validation** on lower-end devices

## Future Architecture Considerations

### Scalability Planning
- **Multi-guinea pig support** architecture preparation
- **Advanced AI systems** integration planning
- **Community features** architecture considerations
- **Performance scaling** for complex scenarios

### Enhancement Integration
- **Animation system** overlay architecture
- **Advanced physics** integration possibilities
- **AI/ML integration** for adaptive gameplay
- **External service integration** for community features

### Maintenance Strategy
- **Modular update** capabilities for individual systems
- **Backward compatibility** maintenance across updates
- **Data migration** strategies for save file evolution
- **Performance monitoring** and optimization over time