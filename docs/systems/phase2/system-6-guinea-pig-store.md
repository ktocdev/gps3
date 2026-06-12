# Guinea Pig Store (Pinia) - System 6

**Phase 2: Core Game Entities & State**

## Overview
Central Pinia store managing guinea pig entity data, individual preferences, reaction system, and core game statistics.

## Core Guinea Pig Entity

### Basic Properties
- **Guinea pig entity** with customizable properties:
  - **Name:** Player-assigned name with character validation
  - **Gender:** Sow or boar with appropriate pronouns and behaviors
  - **Coat type:** Visual variety affecting appearance and some preferences
  - **Birthdate:** Used for age calculation and development stages
- **Age calculation** based on birthdate with real-time updates
- **Core stats/needs structure** integration with needs system

## Individual Preference System

### Food Preferences
- **Category-based preferences:** One preferred and one disliked for each category
  - **Hay varieties** (8 types): Timothy, Orchard grass, Meadow hay, Alfalfa, etc.
  - **Vegetables** (12 types): Bell peppers, carrots, leafy greens, cucumber, etc.
  - **Fruits** (10 types): Apple, banana, strawberry, blueberry, etc.
- **Preference effects on gameplay:**
  - **Preferred items:** +10-15 happiness bonus when consumed
  - **Disliked items:** -5-8 happiness penalty when consumed
  - **Neutral items:** Standard happiness effects

### Activity & Interaction Preferences
- **Play activity preferences:** Preferred and disliked play styles
- **Interaction preferences:** Petting, brushing, holding, talking preferences
- **Environmental preferences:** Toy types, shelter preferences, activity levels
- **Social preferences:** Cuddling vs independence, vocal interactions

### Hidden Discovery System
- **Preferences not revealed** to player initially
- **Discovery through gameplay:** Player learns through experimentation
- **Preference hints:** Subtle visual and behavioral cues
- **Discovery rewards:** Special messages and friendship bonuses for learning preferences

## Guinea Pig Reaction System

### Reaction State Management
- **Current Reaction State:** Tracks active reaction animation and duration
- **Reaction Queue:** Manages multiple reactions and smooth transitions
- **Reaction Priority:** Important reactions can interrupt less critical ones
- **State Persistence:** Reactions continue across brief interruptions

### Reaction Triggers
- **Interaction-based:** Responses to player actions (petting, feeding, etc.)
- **Preference-based:** Strong reactions to preferred/disliked items
- **Needs-based:** Reactions influenced by current need levels
- **Friendship-based:** Reaction intensity scales with relationship quality
- **Environmental:** Responses to habitat conditions and changes

### Reaction Types & Intensity

#### Positive Reactions
- **Popcorning:** Excited jumping for favorite foods or great care
- **Wheeking:** Vocal excitement for treats or attention
- **Purring:** Contentment during gentle interactions
- **Nose nudging:** Seeking more attention or treats
- **Happy eating:** Enthusiastic consumption of preferred foods

#### Negative Reactions
- **Hiding:** Withdrawal when stressed or given disliked items
- **Teeth chattering:** Displeasure or warning signals
- **Freezing:** Stress response to overwhelming situations
- **Head tossing:** Rejection of unwanted food or interactions
- **Backing away:** Avoidance of disliked activities

### Reaction Intensity Scaling
- **Friendship influence:** Higher friendship = more expressive reactions
- **Care quality influence:** Better overall care = more positive reactions
- **Context sensitivity:** Same stimulus produces different reactions based on timing
- **Habituation effects:** Repeated interactions may reduce reaction intensity

## Activity Message Generation

### Natural Language Conversion
- **Reaction-to-message translation:** Convert reaction states into readable text
- **Context-aware messaging:** Include relevant details about triggers and circumstances
- **Personality reflection:** Messages reflect individual guinea pig's unique traits
- **Timing coordination:** Sync messages with reaction animations and duration

### Message Categories
- **Reaction announcements:** "Guinea pig popcorns excitedly!"
- **Preference discoveries:** "Guinea pig seems to love timothy hay!"
- **Mood updates:** "Guinea pig appears content and relaxed"
- **Behavior descriptions:** "Guinea pig investigates the new toy curiously"

## Data Management & Persistence

### Store State Structure
```typescript
interface GuineaPigState {
  // Basic properties
  id: string
  name: string
  gender: 'sow' | 'boar'
  coatType: string
  birthdate: Date

  // Preferences (hidden from UI)
  foodPreferences: {
    hay: { preferred: string, disliked: string }
    vegetables: { preferred: string, disliked: string }
    fruits: { preferred: string, disliked: string }
  }
  activityPreferences: {
    interactions: string[]
    toys: string[]
    environments: string[]
  }

  // Current state
  currentReaction?: ReactionState
  reactionQueue: ReactionState[]
  discoveredPreferences: string[]

  // Stats integration
  needsLevels: NeedsState
  friendshipLevel: number
  wellness: number
}
```

### Persistence Configuration
- **localStorage integration** for save/load functionality
- **Incremental saves** for performance optimization
- **Data validation** on load with corruption recovery
- **Backup strategies** for critical guinea pig data

## Integration Points

### Needs System Connection
- **Needs state synchronization** with current guinea pig condition
- **Reaction influences** based on needs satisfaction levels
- **Wellness calculation** input from overall guinea pig state
- **Friendship system integration** with needs-based penalties

### Activity Feed Integration
- **Real-time message generation** from reaction system
- **Preference discovery announcements** for player learning
- **Behavior description** for autonomous guinea pig actions
- **Event logging** for all significant guinea pig state changes

### UI Component Integration
- **StatsDisplay component** shows basic guinea pig information
- **PreferenceTracker component** reveals discovered preferences
- **FriendshipMeter component** displays relationship status
- **GuineaPigSprite component** reflects current reaction state

## Logging & Development Integration

### State Change Logging
- **Preference discoveries** logged for analytics and debugging
- **Reaction triggers** tracked for balancing and testing
- **Friendship changes** monitored for progression tuning
- **Performance metrics** for store operation efficiency

### Debug Integration
- **Preference manipulation** tools for testing
- **Reaction triggering** capabilities for validation
- **State inspection** tools for development
- **Save/load testing** utilities for data integrity

## Future Enhancements
- **Advanced personality traits** beyond basic preferences
- **Learning and adaptation** - preferences that evolve over time
- **Breeding system integration** with inherited traits and preferences
- **Social system expansion** for multiple guinea pig interactions