# Guinea Pig Simulation Game - Project Documentation

## Overview
Comprehensive virtual guinea pig care simulator featuring individual personality discovery, environmental management, and friendship development through attentive care. Built with Vue 3, TypeScript, and Pinia for a responsive, mobile-first experience.

## Documentation Navigation

### Primary Documentation Files
- **[Development Phases](DEVELOPMENT_PHASES.md)** - Implementation roadmap and phase summaries
- **[System Integration](SYSTEM_INTEGRATION.md)** - Architecture, dependencies, and data flow details

### Documentation Directories

#### Core Game Design
**[game-design/](game-design/)** - Fundamental mechanics and design philosophy
- **[Wellness System](game-design/wellness-system.md)** - Hidden wellness calculation and friendship penalties
- **[Preferences System](game-design/preferences-system.md)** - Individual guinea pig personality through discovery
- **[Habitat Conditions](game-design/habitat-conditions.md)** - Environmental management separate from needs
- **[Activity Feed Design](game-design/activity-feed-design.md)** - Text-based communication before animations

#### System Implementation Details
**[systems/](systems/)** - Detailed system specifications organized by development phase

##### Phase 1: Foundation & Infrastructure
- **[Game Controller Store](systems/phase1/system-1-game-controller-store.md)** - Central control system with save/load ✅ **Completed** (September 17, 2025 | Branch: GPS2-3)
- **[Layout Component Framework](systems/phase1/system-2-layout-component-framework.md)** - Region-based development with responsive UI
- **[Logging Activity Feed](systems/phase1/system-3-logging-activity-feed.md)** - Centralized logging and natural language activity generation

##### Phase 1.5: Developer Tools
- **[Error Tracking System](systems/phase1/system-4-error-tracking.md)** - Professional debugging interface with system monitoring, error analysis, and developer tools ✅ **Completed** (September 20, 2025 | Branch: GPS2-7)

**Note:** Debug Menu panels for specific game systems (Needs, Wellness, Habitat, etc.) are built incrementally alongside each system in subsequent phases, with final consolidation into a unified Debug Menu tab in Phase 5.

##### Phase 2: Core Entities & Timing
- **[System 6: Guinea Pig Store](systems/phase2/system-6-guinea-pig-store.md)** - Central guinea pig state management ✅ **Core Completed** (September 22, 2025 | Branch: GPS2-7)
- **[System 6.5: Pet Store & Game Session Manager](systems/phase2/system-6.5-pet-store-manager.md)** - Single-session system with active/favorite preservation, 30% American breed spawn rate, 24-hour auto-refresh enabled by default, weighted rarity, smart genetics ✅ **Completed** (October 5, 2025 | Branch: GPS2-18)
- **[System 6.9: Guinea Pig Favorites](systems/phase2/system-6.9-guinea-pig-favorites.md)** - Save beloved guinea pigs permanently with purchasable slots and store refresh protection ✅ **Completed** (October 5, 2025 | Branch: GPS2-18)
- **[System 6.95: Permanent Adoption & Natural Store Churn - REDESIGN](systems/phase2/system-6.95-REDESIGN-permanent-adoption.md)** - Complete system redesign: permanent adoption (no returns ever), friendship-gated favorites (85% threshold), natural store churn via adoption timers (2-5 days), store access gating (all active must be favorited), pairing rules (New+New ✅, Favorite+Favorite ✅, New+Favorite ❌), bond preservation, removes ALL refresh mechanics 📋 **Planned** (Prerequisite: Friendship System Enhancement)
- **[System 7: Needs System](systems/phase2/system-7-needs-system.md)** - 10 needs categories with quick actions, smart disable states (game pause, needs pause, 100% saturation), informative tooltips ✅ **Completed** (October 5, 2025 | Branch: GPS2-18)
- **[System 8: Needs Controller Store](systems/phase2/system-8-needs-controller-store.md)** - Centralized management with manual pause tracking, auto-reset on session end, System Controls panel ✅ **Completed** (October 5, 2025 | Branch: GPS2-18)
- **[Systems 9-10: Game Timing](systems/phase2/system-9-10-game-timing.md)** - Unified tick system with pause/resume, automatic pause on navigation, Game State & Controls panel ✅ **Completed** (October 5, 2025 | Branch: GPS2-18)

##### Phase 2.5: Interactive Feedback Enhancement
- **[System 10.1: Personality Trait Influences](systems/phase2.5/system-10.1-personality-trait-influences.md)** - How Friendliness, Playfulness, Curiosity, Boldness affect need decay, interaction effectiveness, and reactions ✅ **Completed** (October 7, 2025 | Branch: GPS2-20) - Testing Needed
- **[System 10.2: Preferences: Likes & Dislikes](systems/phase2.5/system-10.2-preferences-likes-dislikes.md)** - Individual guinea pig preferences with hidden discovery mechanics (favorites/neutral/disliked) ✅ **Completed** (October 7, 2025 | Branch: GPS2-20) - Testing Needed
- **[System 10.2.5: Fulfillment Limitation System](systems/phase2.5/system-10.2.5-fulfillment-limitation.md)** - ➡️ **Moved to Phase 5 as [System 23.5](systems/phase5/system-23.5-fulfillment-limitation.md)** - Strategic resource management
- **[System 10.3: Wellness-Based Interaction Reactions](systems/phase2.5/system-10.3-wellness-interaction-reactions.md)** - ➡️ **Moved to Phase 5 [System 22](systems/phase5/system-22-interaction-enhancement.md)** - Wellness tiers and behavioral states
- **[System 10.4: Guinea Pig Rescue](systems/phase2.5/system-10.4-guinea-pig-rescue.md)** - ➡️ **Moved to Phase 5 [System 22](systems/phase5/system-22-interaction-enhancement.md)** - Rescue safety net
- **[System 10.5: Enhanced Activity Messages](systems/phase2.5/system-10.5-enhanced-activity-messages.md)** - ➡️ **Moved to Phase 5 [System 22](systems/phase5/system-22-interaction-enhancement.md)** - Context-aware reactions

##### Phase 3: Game World & Environment
- **[System 11: Supplies Store System](systems/phase3/system-11-supplies-store.md)** - Central catalog of all purchasable items (bedding, hay, habitat items, food, treats) ✅ **Completed** (October 15, 2025 | Branch: GPS2-26)
- **[System 12: Inventory Management System](systems/phase3/inventory-management-system.md)** - Track owned items, quantities, and consumption ✅ **Completed** (October 15, 2025 | Branch: GPS2-26)
- **[System 13: Habitat Conditions](systems/phase3/system-13-habitat-conditions.md)** - Environmental state tracking consuming inventory resources ✅ **Foundation Complete** - Awaiting integration
- **[System 14: Habitat Item System](systems/phase3/habitat-item-system.md)** - Interactive environment objects using inventory data
- **[System 15: Habitat Maintenance Hygiene](systems/phase3/habitat-maintenance-hygiene-system.md)** - Environmental care and cleanliness

##### Phase 4: Interactions & Behaviors (Guinea Pig Integration)
✅ **Complete** - All systems implemented including social interactions enhancement

**Status Update (November 16, 2025):**
- ✅ **System 17: Visual Presence & Positioning** - Complete (GuineaPigSprite, grid positioning, selection state)
- ✅ **System 18: Pathfinding & Movement** - Complete (A* pathfinding, movement controller, CSS animations)
- ✅ **System 19: Autonomous AI Behaviors** - Complete (AI decision matrix, all autonomous behaviors)
- ✅ **System 20: Direct Interaction System** - Complete (manual socialize trigger, dual movement, wiggle animations)
- ✅ **System 21: Social Bonding System** - Complete (bond management, bonding progression, social need modifiers)
- ✅ **System 21.5: Social Interactions Enhancement** - Complete (10 total interactions, player triggering, chat bubbles)
- ✅ **Bug Fixes & Code Quality** - Complete (critical bugs fixed, code review completed, production-ready)

**Social Interactions Enhancement (GPS2-50):**
- ✅ **10 Total Interactions:** Greet, Inspect, Play, Explore, Groom, Follow, Sleep Together, Share Food, Kick (+ original interactions)
- ✅ **Bonding Tier Restrictions:** Grooming requires Friends/Bonded tier, Kick only in Neutral tier
- ✅ **Personality Integration:** Curiosity affects Inspect, Friendliness affects Follow, Boldness affects Kick
- ✅ **Player-Triggered Testing:** Bonding sidebar with guinea pig toggle and 7 interaction buttons
- ✅ **Chat Bubbles:** Tier-specific messages (bonded/friends/neutral) for all interactions
- ✅ **Activity Messages:** Immediate feedback when interactions start
- 📋 **Future Enhancement:** Context-aware messages with friendship/wellness/habitat conditions (Phase 5 System 22)

**Master Plan:**
- **[Phase 4 Guinea Pig Integration Plan](systems/phase4/phase-4-guinea-pig-integration-plan-full.md)** - Complete overview with dependencies, timeline, and success criteria

**Implementation Plans:**
- **[System 17: Visual Presence & Positioning](systems/phase4/system-17-visual-presence-positioning.md)** - ✅ **Complete** - Guinea pig sprites and grid positioning
- **[System 18: Pathfinding & Movement](systems/phase4/system-18-pathfinding-movement.md)** - ✅ **Complete** - A* pathfinding and movement controller
- **[System 19: Autonomous AI Behaviors](systems/phase4/system-19-autonomous-ai-behaviors.md)** - ✅ **Complete** - Decision matrix and autonomous actions
- **[System 20: Direct Interaction System](systems/phase4/system-20-direct-interaction-system.md)** - ✅ **Complete** - Manual interaction triggers and social behaviors
- **[System 21: Social Bonding System](systems/phase4/system-21-social-bonding-system.md)** - ✅ **Complete** - Hidden compatibility and multi-pig bonding

**Design Documentation:**
- **[Direct Interaction Design](systems/phase4/design-docs/direct-interaction-system.md)** - Comprehensive interaction catalog and mechanics
- **[Autonomy Design](systems/phase4/design-docs/guinea-pig-autonomy-system.md)** - Complete behavior specifications and AI design
- **[Bonding Design](systems/phase4/design-docs/guinea-pig-bonding-system.md)** - Research-based bonding mechanics and compatibility

##### Phase 4.5: Polish, Testing & Balance
🚧 **In Progress** - Gameplay refinement through observation and iteration

**Status Update (November 3, 2025):**
Phase 4.5 focuses on polishing core gameplay mechanics and fixing bugs discovered through active playtesting. This phase emphasizes iterative improvements based on real gameplay observation rather than implementing new features.

**Sprint History:**
- **[SPRINT-2025-10-27](archive/SPRINT-2025-10-27.md)** - Pause state fixes, habitat behavior improvements, social sidebar, Pinia devtools
- **[SPRINT-2025-10-29](archive/SPRINT-2025-10-29.md)** - Bond initialization, habitat responsiveness, inventory purchase limits, visual tweaks
- **[SPRINT-2025-10-31](archive/SPRINT-2025-10-31.md)** - Code audits, CSS cleanup, navigation fixes, wellness penalties refined
- **[SPRINT-2025-11-02](archive/SPRINT-2025-11-02.md)** - Thirst scaling, nails need, bond display, friendship scaling, hand-feed system
- **[SPRINT-2025-11-03](archive/SPRINT-2025-11-03.md)** - Comprehensive audits, CSS optimizations, bond fixes
- **[SPRINT-2025-11-04](archive/SPRINT-2025-11-04.md)** - Sidebar redesign, activity feed styling, SubTab navigation enhancements
- **[SPRINT-2025-11-10](archive/SPRINT-2025-11-10.md)** - Touch device placement, mobile-first refactor, interaction rejection logic
- **[SPRINT-2025-11-11](SPRINT-2025-11-11.md)** - GPS2-46 audits, herbs multi-serving, GPS2-50 social interactions enhancement (active sprint)

**Key Accomplishments:**
- ✅ Pause state reliability across all systems
- ✅ Habitat responsiveness (mobile + desktop)
- ✅ Social sidebar with bond visualization
- ✅ Hand-feed dialog for direct feeding
- ✅ Bond initialization and persistence fixes
- ✅ Friendship scaling adjustments
- ✅ Thirst mechanic balancing
- ✅ Nails need implementation
- ✅ Code and CSS quality audits (9.8/10 final score)
- ✅ Panel utility standardization
- ✅ Touch device inventory placement
- ✅ Mobile-first CSS refactor
- ✅ Herbs multi-serving implementation
- ✅ Three-factor interaction rejection system
- ✅ Social interactions enhancement (10 total interactions)
- ✅ Player-triggered interaction testing (Bonding sidebar)
- ✅ Chat bubble visual feedback system

**Current Focus (SPRINT-2025-11-11):**
- 📋 Supplies Store responsive layout
- 📋 Simultaneous poop bug
- 📋 Guinea pigs resting on items without interacting
- 🎯 Phase 5 System 22 planning

##### Phase 5: Polish & Enhancements (Systems 22-29)
📋 **Planned** - Interaction enhancements, progression, audio, and settings

**Planned Systems:**
- **[System 22: Interaction Enhancement System](systems/phase5/system-22-interaction-enhancement.md)** - Wellness-based reactions (5 tiers), rescue safety net, enhanced activity messages, friendship milestones _(Consolidates Phase 2.5 Systems 10.3, 10.4, 10.5)_
- **System 23: Enrichment & Resource Management System** - Item effectiveness/rotation mechanics, strategic purchasing decisions, inventory planning
- **[System 23.5: Fulfillment Limitation System](systems/phase5/system-23.5-fulfillment-limitation.md)** - Consumption limits per hunger cycle, strategic feeding mechanics, cooldown system _(Moved from Phase 2.5 System 10.2.5)_
- **System 24: Progression & Economy System** - Currency earning mechanics, achievement/milestone tracking, level progression, supplies store item gating (level/achievement-based unlock requirements)
- **System 25: Game Tutorial System** - Interactive onboarding, contextual help tooltips, feature discovery, progressive tutorial unlocking
- **System 26: Performance Mode System** - Reduced performance mode toggle, optimized rendering, battery-saving options for mobile devices
- **System 27: Sound System** - Audio feedback and guinea pig vocalizations
- **System 28: Settings Preferences Enhancement** - User configuration management
- **System 29: Guinea Pig Animation System** - Visual animation enhancement (future)

**Key Deliverables:**
- **Context-aware interactions** with friendship, wellness, and habitat-based activity messages
- **Enrichment rotation system** with item effectiveness decay and strategic purchasing
- **Progression & economy** with currency earning, achievements, and store item gating
- **Game tutorial system** with interactive onboarding and contextual help
- **Performance mode** with reduced performance options for lower-end devices
- **Audio feedback system** with guinea pig vocalizations and interaction sounds
- **Expanded settings** with theme selection, sound controls, and advanced preferences
- **Optional animation system** enhancing visual presentation while preserving activity feed

**Debug Panel Consolidation:**
- **Debug Menu Tab Creation** - Consolidate all debug panels into unified Debug Menu interface
- **Advanced Debug Features** - Performance monitoring, stress testing, integration validation

#### Technical Guides
**[technical/](technical/)** - Implementation and platform considerations
- **[Performance Optimization](technical/performance-optimization.md)** - Game loop optimization and efficiency strategies
- **[Architecture Guidelines](technical/architecture-guidelines.md)** - TypeScript patterns and system design
- **[Mobile Cross Platform](technical/mobile-cross-platform.md)** - Mobile-first responsive design and PWA features
- **[Audio Media Implementation](technical/audio-media-implementation.md)** - Web Audio API and cross-platform audio
- **[Data Persistence](technical/data-persistence.md)** - Storage strategies and state management

#### Archive
**[archive/](archive/)** - Reference materials
- **[PROJECT_PLAN_FULL.md](archive/PROJECT_PLAN_FULL.md)** - Complete original monolithic documentation (archived 9/14/2025)
- **[system-5-guinea-pig-creation.md](archive/system-5-guinea-pig-creation.md)** - Character creation system documentation (archived 9/28/2025)

## Quick Start Guide

### For Developers
1. Start with **[Development Phases](DEVELOPMENT_PHASES.md)** for implementation roadmap
2. Review **[System Integration](SYSTEM_INTEGRATION.md)** for architecture overview
3. Follow phase-specific documentation in **[systems/](systems/)** directory
4. Reference **[technical/](technical/)** guides for implementation details

### For Game Designers
1. Explore **[game-design/](game-design/)** for core mechanics understanding
2. Review **[Preferences System](game-design/preferences-system.md)** for personality mechanics
3. Study **[Needs System](systems/phase2/system-7-needs-system.md)** for need mechanics including happiness

### For Understanding Project Structure
1. Begin with this **PROJECT_PLAN.md** for navigation overview
2. Check **[DEVELOPMENT_PHASES.md](DEVELOPMENT_PHASES.md)** for implementation sequence
3. Dive into specific system documentation as needed

## Current Development Status
**Latest:** Phase 4.5 In Progress - Polish & Social Interactions Complete | **Branch:** GPS2-50 | **Updated:** November 16, 2025

**Recent Accomplishments:**
- ✅ Phase 4 Complete: All 6 systems (17-21.5) implemented and production-ready
- ✅ GPS2-50: Social Interactions Enhancement - 10 total interactions with AI integration
- ✅ GPS2-49: Code and CSS audits completed (9.8/10 final quality score)
- ✅ GPS2-49: Mobile-first CSS refactor across all components
- ✅ Touch device inventory placement system
- ✅ Herbs multi-serving implementation
- ✅ Three-factor interaction rejection system
- ✅ Chat bubble visual feedback for all interactions
- ✅ Player-triggered interaction testing via Bonding sidebar
- 🎯 Current: Phase 5 System 22 planning, remaining Phase 4.5 polish items

For detailed implementation status and phase breakdowns, see **[DEVELOPMENT_PHASES.md](DEVELOPMENT_PHASES.md)**.

## Documentation Maintenance
- Update specific system files rather than monolithic documents
- Maintain cross-references between related systems
- Keep this PROJECT_PLAN.md navigation current
- Document architectural decisions in appropriate system files