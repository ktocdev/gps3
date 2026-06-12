# Enhanced Activity Messages - System 10.5

**Phase 2.5: Interactive Feedback Enhancement**
**Status:** ➡️ **Moved to Phase 5 [System 22](../phase5/system-22-interaction-enhancement.md)**

> **⚠️ Note:** This system has been consolidated into Phase 5 **[System 22: Interaction Enhancement System](../phase5/system-22-interaction-enhancement.md)** as Component 3 (Enhanced Activity Messages). Systems 10.3, 10.4, and 10.5 have been combined into System 22 for cohesive interaction feedback. Please refer to System 22 for the complete specification.

## Overview
Intelligent, contextual activity log messages that enhance player feedback during gameplay. This system builds on the existing activity feed infrastructure to provide rich, non-intrusive communication between the game and player.

## Core Features

### Feature 1: Guinea Pig Reactions to User Interactions
**Purpose**: Provide immediate emotional feedback after player actions

**Implementation**:
- Reaction messages appear AFTER player action messages
- Reactions vary based on guinea pig preferences
- Uses `loggingStore.addGuineaPigReaction()` for proper categorization

**Examples**:
- After feeding pellets: "Guinea pig munches happily!"
- After feeding favorite food: "Guinea pig popcorns with excitement! ✨"
- After giving water: "Guinea pig drinks eagerly"
- After cleaning: "Guinea pig feels fresh and clean!"
- After playing: "Guinea pig squeaks with delight!"

**Integration Points**:
- `guineaPigStore.feedGuineaPig()` - Food reactions
- `guineaPigStore.giveWater()` - Drinking reactions
- `guineaPigStore.cleanGuineaPig()` - Grooming reactions
- `guineaPigStore.playWithGuineaPig()` - Play reactions
- All other interaction methods in guineaPigStore

### Feature 2: Need Warning System
**Purpose**: Alert players when guinea pig needs are getting low

**Warning Levels**:
- **Warning** (needs 20-30): Gentle reminders every 60 seconds
  - "Guinea pig sniffs around for food"
  - "Guinea pig looks a bit thirsty"
  - "Guinea pig yawns tiredly"
- **Critical** (needs ≤15): Urgent alerts every 30 seconds
  - "Guinea pig is desperately hungry!"
  - "Guinea pig needs water urgently!"
  - "Guinea pig is exhausted!"

**Implementation**:
- Per-need throttling prevents spam (map of needType → lastWarningTime)
- Integrated into `needsController.processBatchUpdate()`
- Checks all 10 needs: hunger, thirst, energy, shelter, play, social, comfort, hygiene, nails, health, chew

**Need-Specific Messages**:
Each of the 11 needs has unique warning and critical messages:
- **Hunger**: Warning: "Guinea pig sniffs around for food" | Critical: "Guinea pig is desperately hungry!"
- **Thirst**: Warning: "Guinea pig licks the water bottle spout" | Critical: "Guinea pig needs water urgently!"
- **Energy**: Warning: "Guinea pig yawns sleepily" | Critical: "Guinea pig is completely exhausted!"
- **Shelter**: Warning: "Guinea pig seeks a safe hiding spot" | Critical: "Guinea pig is anxiously looking for shelter!"
- **Play**: Warning: "Guinea pig seems restless and bored" | Critical: "Guinea pig is extremely bored!"
- **Social**: Warning: "Guinea pig wheeks softly for attention" | Critical: "Guinea pig feels very lonely!"
- **Stimulation**: Warning: "Guinea pig explores idly" | Critical: "Guinea pig desperately needs enrichment!"
- **Comfort**: Warning: "Guinea pig adjusts bedding uncomfortably" | Critical: "Guinea pig is very uncomfortable!"
- **Hygiene**: Warning: "Guinea pig tries to groom itself" | Critical: "Guinea pig urgently needs cleaning!"
- **Nails**: Warning: "Guinea pig's nails are getting long" | Critical: "Guinea pig's nails are overgrown!"
- **Health**: Warning: "Guinea pig seems a bit under the weather" | Critical: "Guinea pig needs medical attention!"
- **Chew**: Warning: "Guinea pig looks for something to chew" | Critical: "Guinea pig's teeth need attention!"

**Throttling Logic**:
```typescript
// Warning threshold: needs <= 30, check every 60 seconds
// Critical threshold: needs <= 15, check every 30 seconds
if (needValue <= 15 && timeSinceLastWarning >= 30000) {
  // Show critical warning
} else if (needValue <= 30 && timeSinceLastWarning >= 60000) {
  // Show warning
}
```

### Feature 3: General Wellness Messages
**Purpose**: Provide periodic status updates about overall guinea pig wellness

**Wellness Ranges**:
- **Excellent** (80-100): "Guinea pig couldn't be better!", "Guinea pig is thriving!", "Guinea pig is perfectly happy!"
- **Good** (60-79): "Guinea pig is doing well", "Guinea pig is content", "Guinea pig is happy"
- **Fair** (40-59): "Guinea pig could use some care", "Guinea pig seems a bit off", "Guinea pig needs attention"
- **Poor** (<40): "Guinea pig needs urgent attention!", "Guinea pig is struggling", "Guinea pig is in poor condition"

**Timing & Throttling**:
- Only appear when activity feed is quiet (no messages in last 30 seconds)
- Random interval: 5-10 minutes between wellness messages
- Prevents feed flooding during active gameplay
- Uses `activityMessageService` for quiet-time detection

**Implementation**:
- Integrated into `needsController.processBatchUpdate()`
- Checks wellness score from `calculateWellness()`
- Random message selection from wellness range templates

### Feature 4: Preference Discovery Clues
**Purpose**: Help players learn guinea pig preferences through contextual reactions

**Preference Levels**:
- **Favorite**: "✨ Guinea pig's eyes light up! They love this!", "Guinea pig does an excited popcorn!"
- **Liked**: "Guinea pig seems pleased", "Guinea pig enjoys this"
- **Neutral**: "Guinea pig accepts this cautiously", "Guinea pig sniffs thoughtfully"
- **Disliked**: "Guinea pig turns away reluctantly", "Guinea pig seems uninterested"

**Integration**:
- Enhances existing preference system in `guineaPigStore`
- Applies to food preferences (feedGuineaPig)
- Applies to activity preferences (playWithGuineaPig)
- Applies to habitat preferences (provideShelter, rearrangeCage)
- Uses `MessageGenerator.generatePreferenceReaction()`

**Examples**:
- Feeding favorite food: "✨ Guinea pig's eyes light up at the vegetables!"
- Playing favorite activity: "Guinea pig absolutely loves this game!"
- Disliked food: "Guinea pig turns away from the broccoli"

### Feature 5: Friendship Milestone Achievements
**Purpose**: Celebrate relationship progression with achievement messages

**Friendship System Refactor**:
- Current: Starts at 50, ranges 0-100
- New: Track milestones above and below starting point

**Milestones**:
1. **25 - Distant**: "🤝 Friendship: Distant" (relationship is deteriorating)
2. **40 - Wary**: "🤝 Friendship: Wary" (guinea pig is cautious)
3. **50 - New Friend**: Starting point (initial adoption)
4. **65 - Friendly**: "🎉 Friendship milestone: Friendly!"
5. **80 - Close Friend**: "🎉 Friendship milestone: Close Friend!"
6. **95 - Best Friend**: "🎉 Friendship milestone: Best Friend Forever!"

**Implementation**:
- Add `lastFriendshipMilestone: number` to `GuineaPig` interface (default: 50)
- Detect milestone crossings in `adjustFriendship()` (both upward and downward)
- Prevent duplicate messages by tracking last achieved milestone
- Use `loggingStore.addAchievement()` for special styling (pink border in activity feed)

**Logic**:
```typescript
// After adjusting friendship
const previousMilestone = guineaPig.lastFriendshipMilestone
const newMilestone = getCurrentMilestone(guineaPig.friendship)

if (newMilestone !== previousMilestone) {
  loggingStore.addAchievement(getMilestoneMessage(newMilestone))
  guineaPig.lastFriendshipMilestone = newMilestone
}
```

## Technical Architecture

### New Files
- **`src/utils/activityMessageService.ts`**: Centralized throttling and quiet-time detection service

### Modified Files
- **`src/utils/messageGenerator.ts`**: Extended with new message template generators
- **`src/stores/guineaPigStore.ts`**: Reaction messages, friendship milestones
- **`src/stores/needsController.ts`**: Warning system, wellness commentary

### Message Categories
All messages use existing `loggingStore` categories:
- `player_action`: User interactions (blue border)
- `guinea_pig_reaction`: Guinea pig responses (purple border)
- `autonomous_behavior`: Independent actions (cyan border)
- `environmental`: Habitat events (yellow border)
- `achievement`: Milestones and unlocks (pink border)

## Anti-Spam Mechanisms

### Throttling Strategy
1. **Need Warnings**: Per-need last warning timestamp
   - Warning (needs ≤30): 60-second intervals
   - Critical (needs ≤15): 30-second intervals

2. **Wellness Messages**: Global throttle with random interval
   - Minimum: 5 minutes between messages
   - Maximum: 10 minutes between messages
   - Only when feed is quiet (>30 seconds since last message)

3. **Friendship Milestones**: One-time per milestone
   - Track `lastFriendshipMilestone` to prevent duplicates
   - Trigger only on milestone crossing

4. **Reactions**: Once per interaction
   - Tied to user action, naturally rate-limited

### Quiet-Time Detection
```typescript
// ActivityMessageService
function isActivityFeedQuiet(logging: LoggingStore): boolean {
  const recentMessages = logging.activityMessages.slice(-5)
  if (recentMessages.length === 0) return true

  const lastMessageTime = recentMessages[recentMessages.length - 1].timestamp
  const timeSinceLastMessage = Date.now() - lastMessageTime

  return timeSinceLastMessage > 30000 // 30 seconds
}
```

## Message Examples by Category

### Player Actions (existing)
- "You offer Cocoa some vegetables"
- "You fill Cocoa's water bottle with fresh water"
- "You give Cocoa a gentle cleaning"

### Guinea Pig Reactions (NEW - Feature 1)
- "Cocoa eats happily!"
- "Cocoa drinks eagerly"
- "Cocoa feels fresh and clean!"
- "Cocoa squeaks with delight!"

### Need Warnings (NEW - Feature 2)
- Warning: "Cocoa sniffs around for food"
- Critical: "Cocoa is desperately hungry!"

### Wellness Messages (NEW - Feature 3)
- Excellent: "Cocoa couldn't be better!"
- Good: "Cocoa is doing well"
- Fair: "Cocoa could use some care"
- Poor: "Cocoa needs urgent attention!"

### Preference Clues (NEW - Feature 4)
- Favorite: "✨ Cocoa's eyes light up! They love this!"
- Disliked: "Cocoa turns away reluctantly"

### Friendship Milestones (NEW - Feature 5)
- "🎉 Friendship milestone: Friendly!"
- "🎉 Friendship milestone: Close Friend!"
- "🎉 Friendship milestone: Best Friend Forever!"

## Integration with Existing Systems

### Activity Feed Component
- Uses existing `ActivityFeed.vue` component
- No UI changes required
- Leverages existing message categorization and styling

### Logging Store
- Uses existing methods: `addGuineaPigReaction()`, `addAchievement()`, `addEnvironmentalEvent()`
- No new logging methods required
- Maintains existing message retention and filtering

### Needs System
- Integrates with `needsController.processBatchUpdate()`
- Uses existing `calculateWellness()` function
- Leverages existing threshold checking infrastructure

### Preference System
- Enhances existing preference detection in `guineaPigStore`
- Uses existing `preferences.favoriteFood`, `preferences.dislikedFood` arrays
- No changes to preference data structure

## Testing Guidelines

### Manual Testing Checklist
- [ ] Verify reaction messages appear after each interaction type
- [ ] Test need warnings at threshold values (30 and 15)
- [ ] Confirm warning throttling (60s warning, 30s critical)
- [ ] Test wellness messages appear only when feed is quiet
- [ ] Verify wellness message random interval (5-10 minutes)
- [ ] Test preference clues for favorite and disliked items
- [ ] Test friendship milestones at each threshold (25, 40, 50, 65, 80, 95)
- [ ] Verify no duplicate milestone messages
- [ ] Confirm milestone messages appear when going down (50→40→25)
- [ ] Check activity feed doesn't flood with messages

### Performance Testing
- Monitor message generation performance in `processBatchUpdate()`
- Verify throttling prevents excessive message creation
- Check memory usage with long gaming sessions (message retention limits)

## Future Enhancements

### Potential Additions
- **Personality-based message variations**: Different message styles for different personality types
- **Time-of-day awareness**: "Guinea pig is ready for breakfast!" vs "Guinea pig is settling down for the evening"
- **Multi-guinea pig interactions**: Messages when multiple guinea pigs interact
- **Seasonal messages**: Holiday-themed wellness messages
- **Player skill recognition**: Messages that acknowledge experienced vs. new players

### Animation Integration (Future Phase)
- Activity messages will complement visual animations
- Text provides context that animations cannot fully convey
- Maintains accessibility for screen readers
- Provides richer information density

## Success Metrics

### Player Engagement
- Reduced time to learn guinea pig preferences
- Increased player response to need warnings
- Higher friendship milestone achievement rate

### System Health
- No message spam complaints
- Throttling prevents performance issues
- Activity feed remains readable and useful

## References
- [Activity Feed Design](../../game-design/activity-feed-design.md)
- [Logging System](../phase1/system-3-logging-activity-feed.md)
- [Needs System](../phase2/needs-happiness-wellness.md)
- [Preference System](../../game-design/preferences-likes-dislikes.md)
