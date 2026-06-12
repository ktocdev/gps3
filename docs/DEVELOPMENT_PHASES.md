# Development Phases - Implementation Roadmap

## Overview
Strategic development approach organizing 20 systems across 5 phases, with region-based development and early debug tools for efficient testing and validation.

## Phase 1: Foundation & Infrastructure (Systems 1-3)
**Duration:** 2-3 weeks
**Goal:** Establish core foundation with complete UI framework and essential development tools

### Systems
1. **[Game Controller Store](docs/systems/phase1/system-1-game-controller-store.md)** - Central control system with save/load ✅ **Completed** (September 17, 2025 | Branch: GPS2-3)
2. **[Unified Layout & Component Framework](docs/systems/phase1/system-2-layout-component-framework.md)** - Region-based development combining CSS foundation, component library, and responsive UI with adaptive FAB navigation
3. **[Logging System & Activity Feed](docs/systems/phase1/system-3-logging-activity-feed.md)** - Centralized logging and natural language activity generation (implement early!)

### Phase 1.5: Developer Tools
4. **[Error Tracking System](docs/systems/phase1/system-4-error-tracking.md)** - Professional debugging interface with system monitoring, error analysis, and developer tools ✅ **Completed** (September 20, 2025 | Branch: GPS2-7)

**Note:** Debug Menu panels for specific game systems (Needs, Wellness, Habitat, etc.) will be built incrementally alongside each system in subsequent phases, ensuring debug interfaces have complete knowledge of actual system implementations.

### Key Deliverables
- **Complete visual framework** using reusable component library
- **Responsive layout controller** with container-query integration
- **Mobile portrait handling** with OrientationModal and game pause
- **Adaptive navigation system** (bottom nav ↔ FAB based on screen height)
- **TextInfoPanel** for mobile landscape with activity feed integration
- **Error tracking system** with professional debugging interface ✅ **Completed**
- **Game state management** with four primary states (intro, playing, paused, stopped)
- **Settings foundation** with tutorial controls, auto-save, and error reporting

### Critical Success Factors
- **Error tracking foundation** enables professional debugging from development through production
- **Complete UI placeholders** allow immediate visual feedback for all future systems
- **Responsive framework** handles all device/orientation scenarios from start
- **Activity feed integration** provides immediate player feedback before animations

---

## Phase 2: Core Game Entities & Timing (Systems 6-10) ✅ **COMPLETE**
**Duration:** 3-4 weeks
**Status:** ✅ **Completed** October 5, 2025 | **Branch:** GPS2-18
**Goal:** Implement core guinea pig simulation with needs, preferences, and timing systems

### Systems
6. **[Guinea Pig Store](docs/systems/phase2/system-6-guinea-pig-store.md)** - Entity management with data persistence ✅ **Completed** (September 28, 2025 | Branch: GPS2-11)
6.5. **[Pet Store & Game Session Manager](docs/systems/phase2/system-6.5-pet-store-manager.md)** - Single-session game with weighted rarity, 30% American breed spawn, 24-hour auto-refresh, favorites preservation ✅ **Completed** (October 5, 2025 | Branch: GPS2-18)
6.9. **[Guinea Pig Favorites System](docs/systems/phase2/system-6.9-guinea-pig-favorites.md)** - Permanent favorites with store refresh protection, up to 10 purchasable slots ✅ **Completed** (October 5, 2025 | Branch: GPS2-18)
6.95. **[Permanent Adoption & Natural Store Churn - REDESIGN](docs/systems/phase2/system-6.95-REDESIGN-permanent-adoption.md)** - Complete system redesign with permanent adoption model (no returns), friendship-gated favorites (85% threshold), natural store churn (adoption timers 2-5 days), store access gating, pairing rules, bond preservation, removes ALL refresh mechanics 📋 **Planned** (Prerequisite: Friendship System Enhancement)
7. **[Needs System Architecture](docs/systems/phase2/system-7-needs-system.md)** - 11-need structure (Critical, Environmental, Maintenance) with weighted wellness ✅ **Completed** (October 5, 2025 | Branch: GPS2-18)
8. **[Needs Controller Store](docs/systems/phase2/system-8-needs-controller-store.md)** - Centralized processing, manual pause tracking, auto-reset on session end ✅ **Completed** (October 5, 2025 | Branch: GPS2-18)
9. **[Interval Management System](docs/systems/phase2/system-9-10-game-timing.md)** - Game timing with pause/resume and orientation handling ✅ **Completed** (October 5, 2025 | Branch: GPS2-18)
10. **[Game Loop Integration](docs/systems/phase2/system-9-10-game-timing.md)** - Complete timing integration with needs and wellness feedback ✅ **Completed** (October 5, 2025 | Branch: GPS2-18)

### Debug Panel Development (Phase 2)
- **Needs System Debug Panel** - ✅ **Completed** - Responsive layout (single column <1440px), need-specific colors, accessible contrast
- **Pet Store Debug Panel** - ✅ **Completed** - Details component (collapsible sections), panel reorganization, reusable patterns
- **Game Controller Panel** - ✅ **Enhanced** - System Controls panel, centralized management, auto-reset logic
- **Guinea Pig Debug Panel** - ✅ **Enhanced** - Accessibility improvements, fieldset/legend structure
- **Inventory Debug Panel** - ✅ **Partially Implemented** - Currency controls only, full implementation in Phase 3

**Testing Guide:** [NEEDS_SYSTEM_TESTING_GUIDE.md](testing/NEEDS_SYSTEM_TESTING_GUIDE.md)

### Key Deliverables - All Complete ✅
- **Guinea pig store** ✅ Complete data structure, CRUD operations, enhanced debug panel
- **Pet store** ✅ Weighted rarity (American 30%), smart genetics, 24-hour auto-refresh
- **Favorites system** ✅ Store refresh protection, slot purchase progression
- **11-need system** ✅ Critical/Environmental/Maintenance with weighted wellness (40%/35%/25%)
- **Need-specific interactions** ✅ playWithGuineaPig, socializeWithGuineaPig, rearrangeCage, provideBedding
- **System Controls** ✅ Centralized management, manual pause tracking, auto-reset
- **Wellness calculation** ✅ Weighted average with friendship penalties
- **Game timing** ✅ Pause/resume, orientation handling, interval management
- **Activity feed** ✅ Natural language messages for all actions
- **Responsive UI** ✅ Mobile-first, single column <1440px, accessible colors
- **Panel system** ✅ Accent, bordered, compact variants with reusable patterns

### Major Accomplishments
- **11-Need Refactor:** Separated play/social, added comfort, removed redundant happiness (stimulation later removed as redundant to play)
- **Descriptive Labels:** "Give Food", "Soothe to Sleep", "Clean & Groom", "Play Together"
- **Accessible Colors:** Need-specific button colors with WCAG AA contrast
- **Responsive Design:** All debug panels responsive, single column below 1440px
- **Details Component:** Reusable collapsible sections with 3 variants
- **Button Wrapping:** Full-width buttons wrap text with `white-space: break-spaces`

---

## Phase 2.5: Interactive Feedback Enhancement (Systems 10.1-10.5) 🚧 **IN PROGRESS**
**Duration:** 1-2 weeks
**Status:** 🚧 **In Progress** | **Branch:** GPS2-20 | **Started:** October 7, 2025
**Goal:** Enhance gameplay feedback through personality, preferences, wellness reactions, rescue system, and comprehensive activity messages

### Systems
10.1. **[Personality Trait Influences](docs/systems/phase2.5/system-10.1-personality-trait-influences.md)** - How Friendliness, Playfulness, Curiosity, Boldness affect need decay rates, interaction effectiveness, and behavioral reactions ✅ **Completed** (October 7, 2025 | Branch: GPS2-20) - Testing Needed
10.2. **[Preferences: Likes & Dislikes](docs/systems/phase2.5/system-10.2-preferences-likes-dislikes.md)** - Individual guinea pig preferences system with hidden discovery mechanics (favorites +50% satisfaction, dislikes -30% with rejection chance) ✅ **Completed** (October 7, 2025 | Branch: GPS2-20) - Testing Needed
10.2.5. **[Fulfillment Limitation System](docs/systems/phase2.5/system-10.2.5-fulfillment-limitation.md)** - Consumption limits per hunger cycle, strategic resource management ➡️ **Moved to Phase 5 as System 23.5**
10.3. **[Wellness-Based Interaction Reactions](docs/systems/phase2.5/system-10.3-wellness-interaction-reactions.md)** - Wellness tiers, interaction success rates, behavioral states ➡️ **Moved to Phase 5 System 22**
10.4. **[Guinea Pig Rescue System](docs/systems/phase2.5/system-10.4-guinea-pig-rescue.md)** - Safety net, economic penalties, Fresh Start option ➡️ **Moved to Phase 5 System 22**
10.5. **[Enhanced Activity Messages](docs/systems/phase2.5/system-10.5-enhanced-activity-messages.md)** - Context-aware reactions, need warnings, friendship milestones ➡️ **Moved to Phase 5 System 22**

### Debug Panel Development (Phase 2.5)
- **Personality Debug Panel** - ✅ **Completed** (October 7, 2025) - PersonalityDebug.vue with trait sliders, decay rate preview, active guinea pigs only
- **Preferences Testing** - ✅ **Using Existing Panels** - Guinea Pig Editor (edit preferences) + NeedsDebug (test with food/activity dropdowns)
- **Feeding Debug Panel** - 🚧 **In Progress** (October 9, 2025) - FeedingDebug.vue with consumption limit tracking, servings remaining counters, fulfill session hunger button
- **Wellness Reaction Testing** - ✅ **Using Existing Panels** - NeedsDebug (adjust wellness) + Activity Feed (observe interaction success/rejection)
- **Rescue System Debug Panel** - Not Started - Rescue threshold adjustment, preview dialogs, test rescue trigger
- **Activity Message Testing** - ✅ **Using Existing Panels** - Activity Feed (observe message throttling, reactions, warnings)

### Completed Deliverables ✅
- ✅ **Personality trait system** - 4 traits with decay rate modifiers (0.68x-1.40x range)
  - Friendliness → Social need (high = faster decay, needs more interaction)
  - Playfulness → Play need (high = faster decay, needs more activities)
  - Curiosity → Stimulation need (high = faster decay, needs more variety)
  - Boldness → Comfort need (high = slower decay, more confident)
- ✅ **PersonalityDebug.vue** - Trait adjustment sliders with decay rate calculator
- ✅ **Boldness trait** - Replaced Independence (affects Comfort instead of Social)
- ✅ **Hidden preference system** - Food and activity preferences (favorites/neutral/dislikes)
  - Food: +50% favorites, -30% dislikes, 50% rejection chance
  - Activities: +50% favorites, -40% dislikes, 70% rejection chance
- ✅ **NeedsDebug enhancements** - Food/activity selection dropdowns for hunger/play needs
- ✅ **Preference-aware messages** - MessageGenerator updated with favorite/disliked/rejection messages
- ✅ **Game pause fix** - Connected game pause to needs pause/resume

### Remaining Deliverables - Moved to Phase 5

**➡️ Moved to Phase 5 System 22 (Interaction Enhancement System):**
- **System 10.3:** Wellness-based reactions (5 behavioral tiers: Excellent 95% → Critical 20%)
- **System 10.4:** Rescue safety net (wellness <15% trigger, $200 penalty, Fresh Start option)
- **System 10.5:** Enhanced activity messages (context-aware reactions, need warnings 60s/30s throttle, friendship milestones)
- All three systems consolidated under System 22 for cohesive interaction feedback

**➡️ Moved to Phase 5 System 23.5 (Fulfillment Limitation System):**
- **System 10.2.5:** Consumption limits per hunger cycle (fruit:1, veg:3, pellets:2, treats:1, hay:unlimited)
- Interaction rejection mechanics based on personality + friendship + wellness
- Cooldown system (30s-2min) with friendship penalties
- Strategic resource management gameplay

### Enhancement Focus
- **Personality-driven gameplay** making each guinea pig unique to care for ✅ **Implemented**
- **Natural discovery mechanics** through observation rather than explicit stat displays ✅ **Implemented**
- **Rich activity feed** providing continuous feedback on guinea pig state and reactions ✅ **Partially Implemented**
- **Wellness feedback loops** - Moved to Phase 5 System 22
- **Safety net with consequences** - Moved to Phase 5 System 22

---

## Phase 3: Game World & Environment (Systems 11-15)
**Duration:** 2-3 weeks
**Goal:** Build supplies store, inventory system, and habitat environmental management with proper data flow

### Systems
11. **[Supplies Store System](docs/systems/phase3/system-11-supplies-store.md)** - Central catalog of all purchasable items (bedding types, hay varieties, habitat items, food, treats) with pricing, descriptions, and availability ✅ **Completed** (October 15, 2025 | Branch: GPS2-26)
12. **Inventory Management System** - Track owned items, quantities, consumption tracking, and item usage across all game systems ✅ **Completed** (October 15, 2025 | Branch: GPS2-26)
13. **[Habitat Conditions Store](docs/systems/phase3/system-13-habitat-conditions.md)** - Environmental condition tracking (cleanliness, bedding freshness, water level, hay freshness) consuming inventory resources ✅ **Foundation Complete** - Awaiting Supplies Store integration
14. **[Habitat Item System](docs/systems/phase3/habitat-item-system.md)** - Grid-based item placement with drag & drop from inventory ✅ **Completed** (October 27, 2025 | Branch: GPS2-38)
15. **[Habitat Maintenance & Hygiene](docs/systems/phase3/system-15-habitat-maintenance-hygiene.md)** - Cleanliness tracking, bedding freshness, water level consumption, poop accumulation ✅ **Completed** (October 27, 2025 | Branch: GPS2-38)

### Debug Panel Development (Phase 3)
- **Supplies Store Debug Panel** - ✅ **Completed** (October 15, 2025 | Branch: GPS2-26) - Item catalog, department organization, purchase flow with SupplyItemCard component
- **Inventory Debug Panel** - ✅ **Completed** (October 15, 2025 | Branch: GPS2-26) - Currency controls + inventory display with consumables/habitat items separation
- **Habitat Debug Panel** - ✅ **Completed** (October 14, 2025 | Branch: GPS2-25) - Environmental conditions tracking, resource management, item placement testing

### Key Deliverables
- ✅ **Supplies store catalog** with 104+ purchasable items, pricing structure, and item metadata
- ✅ **Inventory management** with quantity tracking, item organization, and consumption logic
- ✅ **Purchase flow integration** connecting Supplies Store → Player Progression (currency) → Inventory Store
- ✅ **Habitat conditions tracking** integrated with inventory consumption (bedding, hay, water)
- ✅ **Grid-based habitat layout** with drag & drop item placement from inventory
- ✅ **Guinea pig autonomous item usage** with pathfinding and AI behaviors
- ✅ **Enhanced poop system** with autonomous dropping and visual feedback

### Economic Integration
- **Supplies store** as primary source for all purchasable items
- **Inventory system** bridging purchases to game mechanics
- **Resource consumption** creating ongoing economic gameplay (bedding, hay, food)

### Moved to Phase 5
- **Enrichment item rotation system** - Moved to Phase 5 System 27
- **Strategic resource management** - Moved to Phase 5 System 27
- **Currency earning** through guinea pig care and achievement milestones

---

## Phase 4: Interactions & Behaviors (Systems 17-21) ✅ **COMPLETE**
**Duration:** 5-7 weeks
**Status:** ✅ **Completed** November 16, 2025 | **Branch:** GPS2-50
**Goal:** Implement guinea pig visual presence, pathfinding, autonomous AI, player interactions, and multi-guinea pig social dynamics for complete gameplay loop

### Systems
17. **[Visual Presence & Positioning](systems/phase4/system-17-visual-presence-positioning.md)** - GuineaPigSprite component with grid positioning and selection ✅ **Completed** (October 27, 2025 | Branch: GPS2-38)
18. **[Pathfinding & Movement](systems/phase4/system-18-pathfinding-movement.md)** - A* pathfinding with smooth CSS animations ✅ **Completed** (October 27, 2025 | Branch: GPS2-38)
19. **[Autonomous AI Behaviors](systems/phase4/system-19-autonomous-ai-behaviors.md)** - Decision matrix, need-based behaviors, item interactions ✅ **Completed** (October 21, 2025 | Branch: GPS2-34)
20. **[Direct Interaction System](systems/phase4/system-20-direct-interaction-system.md)** - Manual socialize trigger, dual movement, social animations ✅ **Completed** (October 27, 2025 | Branch: GPS2-38)
21. **[Social Bonding System](systems/phase4/system-21-social-bonding-system.md)** - Bond management, bonding progression, social need modifiers ✅ **Completed** (October 27, 2025 | Branch: GPS2-38)
21.5. **Social Interactions Enhancement** - 10 total interactions with AI integration, player-triggered testing, chat bubbles ✅ **Completed** (November 16, 2025 | Branch: GPS2-50)

### Debug Panel Development (Phase 4)
- **AutonomyDebug Panel** - ✅ **Enhanced** - Added socialize button, behavior triggers, AI decision visualization
- **Poop Debug Panel** - ✅ **Completed** - Poop system testing and coordinate validation

### Key Deliverables - All Complete ✅
- **Guinea pig rendering** ✅ Sprite component, grid positioning, selection state
- **A* pathfinding** ✅ Obstacle detection, path caching, movement controller
- **AI decision system** ✅ 10 subsystems, need-based behaviors, item interactions
- **Sleep behavior** ✅ Bed selection, quality mechanics, comfort zones
- **Shelter behavior** ✅ Proactive security seeking, shelter preferences
- **Friendship behaviors** ✅ Popcorning, zoomies, hiding based on friendship
- **Environmental interactions** ✅ Autonomous poop dropping every 30s
- **Social interactions** ✅ 10 total interactions with AI integration and player triggering
- **Bonding sidebar** ✅ Player-triggered interaction testing with 7 buttons
- **Chat bubbles** ✅ Visual feedback for all interactions with tier-specific messages
- **Wiggle animations** ✅ Playing state with adjacent cell positioning
- **Bond management** ✅ Bond creation, bonding progression (0-100 scale)
- **Social need modifiers** ✅ 50% slower decay when bonded
- **Activity feed integration** ✅ Messages for all autonomous and social behaviors

### Major Accomplishments
- **Production-ready AI system:** 1200+ lines with comprehensive error handling
- **10 social interactions:** Greet, Inspect, Play, Explore, Groom, Follow, Sleep Together, Share Food, Kick (+ original interactions)
- **Bonding tier restrictions:** Grooming requires Friends/Bonded tier, Kick only in Neutral tier
- **Personality-driven behaviors:** Curiosity affects Inspect, Friendliness affects Follow, Boldness affects Kick
- **Player-triggered interactions:** Bonding sidebar with guinea pig toggle and 7 interaction buttons
- **Chat bubble system:** Tier-specific messages (bonded/friends/neutral) for visual feedback
- **Adjacent positioning algorithm:** Fixed diagonal movement bug, position validation
- **Animation system:** Wiggle animations take priority over walking, no conflicts
- **Movement race condition fix:** Both guinea pigs use proper animation flags
- **Code quality improvements:** Named constants, debug flags, null safety checks
- **Map deserialization fix:** localStorage serialization handling for bonds
- **Performance optimization:** Cached composables, efficient pathfinding

---

## Phase 4.5: Polish, Testing & Balance 🚧 **IN PROGRESS**
**Duration:** 3-4 weeks (ongoing)
**Status:** 🚧 **In Progress** | **Branch:** GPS2-46 (current)
**Goal:** Manual gameplay testing, bug fixes, balance adjustments, and quality-of-life improvements to ensure polished core gameplay experience

### Approach
This phase focuses on **playing the game and observing** to identify issues, refine mechanics, and enhance user experience through iterative testing and small incremental fixes.

### Key Focus Areas
- **Bug Fixes** - Critical gameplay issues, UI/UX problems, interaction bugs
- **Balance Adjustments** - Need decay rates, resource consumption, economic tuning
- **Quality-of-Life** - UI improvements, message clarity, visual feedback
- **Code Quality** - Cleanup, refactoring, performance optimization
- **Realism & Feel** - Ensuring guinea pig behavior feels natural and engaging

### Major Accomplishments (October 27 - November 10, 2025)
- ✅ **Smart Bedding System** - Proportional bedding consumption with fractional tracking
- ✅ **Hand-Feed Food Selection** - Dialog with category filtering and food selection
- ✅ **Food Serving Amounts** - Realistic serving sizes for all fruits and vegetables
- ✅ **Pellets Visual System** - Scattered pile display instead of single emoji
- ✅ **Activity Message Timing** - Messages appear immediately when activity starts
- ✅ **Poop System Enhancements** - Smart location detection, coordinate fixes, proper punctuation
- ✅ **Wellness Calculation Fix** - Dynamic calculation instead of stored 0% value
- ✅ **Pause Functionality** - Complete freeze of movement, animations, and behaviors
- ✅ **Tooltip System** - Teleport-based rendering prevents clipping, z-index fixes
- ✅ **Code Quality Audit** - Debug logs removed, duplication eliminated, magic numbers extracted
- ✅ **CSS Standards Audit** - 9 components audited, 9.6/10 average score, panel utilities applied
- ✅ **Bond Status Display** - Progress bars and tier badges in SocializeSidebar
- ✅ **Chomp & Wiggle Animations** - Guinea pig eating and interaction animations
- ✅ **Activity Feed Fixes** - Scroll to top for newest messages, proper ordering
- ✅ **UI/UX Polish (GPS2-45)** - Activity feed styling, SubTab navigation enhancements, component improvements

### Testing & Balance Work
- **Manual Gameplay Testing** - Extended play sessions to identify real-world issues
- **Need Decay Tuning** - Adjusting rates for realistic gameplay feel
- **Resource Consumption** - Balancing bedding, food, and water usage
- **Message Quality** - Improving grammar, context, and clarity of all activity messages
- **UI/UX Refinement** - Responsive layout, tooltips, empty states, visual feedback

### Recent Sprint Accomplishments (SPRINT-2025-11-11.md)
**Completed:**
- ✅ GPS2-49: Code audit of GPS2-46 work (8.8/10 production-ready)
- ✅ GPS2-49: CSS audit with mobile-first refactor (9.8/10)
- ✅ GPS2-49: Bug fixes (bedding inventory, hay drag-and-drop, chat bubble spacing)
- ✅ GPS2-49: Herbs multi-serving implementation
- ✅ GPS2-49: Interaction rejection logic with three-factor system
- ✅ GPS2-50: Social Interactions Enhancement - 10 total interactions with AI integration
  - 4 new interactions (Greet, Inspect, Follow, Kick)
  - Bonding tier restrictions (Grooming, Kick)
  - Personality integration (Curiosity, Friendliness, Boldness)
  - Player-triggered testing via Bonding sidebar
  - Chat bubbles for all interactions
  - Activity message timing fixes

**Remaining Items:**
- Supplies Store responsive layout
- Simultaneous poop bug
- Guinea pigs resting on items without interacting

**Phase 5 Systems:**
- System 22 Component 2: Guinea Pig Rescue System
- System 22 Component 3: Enhanced Activity Messages

### Success Criteria
- [ ] All critical bugs resolved
- [ ] Gameplay feels balanced and engaging
- [ ] Activity messages are clear and contextual
- [ ] Resource consumption feels realistic
- [ ] UI is polished and responsive
- [ ] Code quality meets production standards
- [ ] Extended play sessions (30+ minutes) feel smooth

**Documentation:** See [SPRINT-2025-11-10.md](SPRINT-2025-11-10.md) and [archive/SPRINT-2025-11-04.md](archive/SPRINT-2025-11-04.md) for detailed fixes and iterations.

---

## Phase 5: Polish & Enhancement (Systems 22-29)
**Duration:** 2-3 weeks
**Goal:** Add polish, progression systems, context-aware interactions, and optional animation enhancements

### Systems
22. **[Interaction Enhancement System](systems/phase5/system-22-interaction-enhancement.md)** - Context-aware activity messages and wellness-based reactions 📋 **Planned** _(Consolidates Phase 2.5 Systems 10.3, 10.4, 10.5)_
  - **Wellness-based reactions** (5 behavioral tiers: Excellent 95% → Critical 20% success rates)
  - **Interaction type modifiers** (essential care +15%, physical handling -10%, comfort +10%)
  - **Rejection cooldown system** (30s-2min based on wellness + personality)
  - **Guinea pig pair interactions** (grooming, playing, sleeping together with wellness impact)
  - **Rescue safety net** (wellness <15% trigger, $200 penalty, needs reset to 100%)
  - **Fresh Start option** (reset to $1000, lose purchased slots 4-10, preserve first 3 favorites)
  - **Enhanced activity messages** (context-aware reactions, need warnings with 60s/30s throttling)
  - **Preference discovery clues** (favorite/neutral/disliked food and activity hints)
  - **Friendship milestone tracking** (6 tiers: 25% Distant → 95% Best Friend)
  - **Behavioral state manifestations** (movement patterns, social behavior, positioning by wellness)
  - **Habitat condition influences** (cleanliness, enrichment affecting interactions)
  - **Recent interaction tracking** and guinea pig mood system
23. **[Enrichment & Resource Management System](systems/phase5/system-23-enrichment-resource-management.md)** - Item effectiveness, rotation mechanics, and strategic purchasing 📋 **Planned**
  - **Stimulation need re-introduction** (11th need: mental enrichment distinct from physical play)
    - Stimulation: Variety, novel experiences, exploration, mental engagement
    - Play: Physical activity, exercise, active toy usage
    - Satisfied through item rotation, habitat changes, new item introductions
  - Item effectiveness system with newness bonuses (+50% initial effectiveness)
  - Familiarity decay over time (diminishing returns on repeated use)
  - Rotation mechanics encouraging variety in toys and enrichment
  - Strategic purchasing decisions (balancing enrichment vs necessities)
  - Inventory planning and resource management gameplay
23.5. **[Fulfillment Limitation System](systems/phase5/system-23.5-fulfillment-limitation.md)** - Consumption limits and strategic feeding mechanics 📋 **Planned** _(Moved from Phase 2.5 System 10.2.5)_
  - **Consumption limits per hunger cycle** (fruit:1, veg:3, pellets:2, treats:1, hay:unlimited)
  - **Hunger cycle definition** (time for hunger 100% → 25%, ~3-5min based on personality)
  - **Limit reset triggers** (when hunger fulfilled back to 100%)
  - **Interaction rejection mechanics** (based on personality + friendship + wellness)
  - **Cooldown system** (30s-2min duration with friendship penalties -1% to -5%)
  - **Strategic gameplay** (timing matters, wellness management, build friendship first)
  - **FeedingDebug panel** (consumption tracking, servings remaining counters)
24. **Progression & Economy System** - Currency earning, achievement tracking, level progression, and supplies store gating 📋 **Planned**
  - Currency earning through care milestones and achievement rewards
  - Achievement/milestone tracking system with progression goals
  - Level progression mechanics
  - Supplies store item gating (level and achievement-based unlock requirements)
  - Strategic purchasing decisions and economic gameplay
25. **Game Tutorial System** - Interactive onboarding and feature discovery 📋 **Planned**
  - Step-by-step tutorial for new players
  - Contextual help tooltips and guided workflows
  - Feature discovery prompts for advanced mechanics
  - Progressive tutorial unlocking based on player progress
26. **Performance Mode & Testing System** - Performance optimization and gameplay balance testing 📋 **Planned**
  - Toggle between full and reduced performance modes
  - Reduced animation frequency and complexity
  - Optimized rendering and game loop performance
  - Battery-saving options for mobile devices
  - **Gameplay Testing & Balance** - Extended play sessions, need decay tuning, resource consumption balance, message quality, UI/UX refinement
27. **Sound System** - Audio manager and interaction sound feedback 📋 **Planned**
28. **Settings & Preferences System** - User preferences and customization 📋 **Planned**
29. **Guinea Pig Animation System** - Full animation framework replacing static emoji graphics (future enhancement) 📋 **Planned**

### Additional Polish Features (Low Priority)
**Note:** Most gameplay enhancement features have been integrated into existing Phase 5 systems:
- **Multi-type guinea pig interactions** → System 22 (play, sniff/investigate, groom, huddle/cuddle)
- **Pushable toys system** → System 22 (guinea pigs move items across grid)
- **Special treat visual effects** → System 22 (glow effects, emoji transformations)
- **Pre-bonded pairs & solo guinea pigs** → System 22 (adoption constraints)
- **Realism guidelines documentation** → System 23.5 (guinea pig care guidelines for game balance)
- **Gameplay testing & balance** → System 26 (extended play sessions, need tuning, resource balance)

### Key Deliverables
- **Context-aware interactions** with friendship, wellness, and habitat-based activity messages
- **Enrichment rotation system** with item effectiveness decay and strategic purchasing
- **Progression & economy** with currency earning, achievements, and store item gating
- **Game tutorial system** with interactive onboarding and contextual help
- **Performance mode** with reduced performance options for lower-end devices
- **Audio feedback system** with guinea pig vocalizations and interaction sounds
- **Expanded settings** with theme selection, sound controls, and advanced preferences
- **Optional animation system** enhancing visual presentation while preserving activity feed

### Enhancement Focus
- **Performance optimization** and final polishing
- **Advanced customization options** for experienced players
- **Audio-visual polish** without sacrificing core gameplay accessibility
- **Long-term progression** systems for sustained engagement

---

## Cross-Phase Strategies

### Early Implementation Priorities
- **Error tracking system** - Professional debugging foundation for development and production
- **Activity feed integration** - Immediate feedback before animations are available
- **Responsive framework early** - Handle all device scenarios from the beginning
- **UI placeholders complete** - Enable immediate visual validation of backend systems

### Integration Approach
- **Connect to existing placeholders** - Each phase builds on Phase 1 UI framework
- **Progressive enhancement** - Core functionality first, polish later
- **Incremental debug development** - Build debug panels alongside each system for immediate testing
- **User feedback incorporation** - Activity feed provides immediate usability validation

### Risk Mitigation
- **Early foundation investment** - Comprehensive Phase 1 setup enables rapid subsequent development
- **Incremental debug validation** - Debug panels built with systems prevent integration issues
- **Responsive design priority** - Mobile constraints addressed from beginning, not retrofitted
- **Text-based feedback first** - Activity feed provides complete user experience before animations

### Success Metrics
- **Phase 1:** Complete UI framework with all placeholders and error tracking system
- **Phase 2:** Functional guinea pig simulation with core systems and their debug panels
- **Phase 2.5:** Rich interactive feedback with personality, preferences, wellness reactions, and rescue system
- **Phase 3:** Economic gameplay with habitat management and comprehensive debug tools
- **Phase 4:** Complete gameplay loop with AI behaviors and full debug coverage
- **Phase 4.5:** Polished core gameplay through testing, bug fixes, and balance adjustments
- **Phase 5:** Enhanced experience with context-aware interactions, progression systems, and optional enhancements

This phased approach ensures steady progress with continuous validation, early risk mitigation, and a complete playable game by Phase 4, with Phase 4.5 dedicated to polish and Phase 5 focused on enhancement features.
