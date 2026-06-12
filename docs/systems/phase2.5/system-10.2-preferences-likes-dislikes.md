# Preferences: Likes & Dislikes System - System 5

**Phase 2.5: Interactive Feedback Enhancement**

## Overview
Comprehensive system defining how guinea pig individual preferences (likes and dislikes) affect interaction benefits, behavioral reactions, and player discovery mechanics. Each guinea pig has unique favorite and disliked items across food, activities, and habitat features, creating genuine individual personalities that players learn through observation and experimentation.

## Core Philosophy
- **Hidden discovery**: Preferences not shown to player, must be learned through observation
- **Observable reactions**: Clear behavioral differences between liked, neutral, and disliked items
- **Meaningful benefits**: Liked items provide significant bonuses, dislikes create penalties
- **Individual uniqueness**: Each guinea pig feels genuinely different
- **Player skill reward**: Attentive players benefit from learning preferences
- **Natural learning**: Discovery happens organically through gameplay

## Preference Structure

### Current Data Structure
From `guineaPigStore.ts`:
```typescript
export interface GuineaPigPreferences {
  favoriteFood: string[]      // Up to 2 per category (6 total)
  dislikedFood: string[]      // Up to 2 per category (6 total)
  favoriteActivity: string[]  // Up to 2 activities
  dislikedActivity: string[]  // Up to 2 activities
  habitatPreference: string[] // Up to 2 habitat features
  dislikedHabitat: string[]   // Up to 2 habitat features
}
```

### Preference Categories

#### Food Preferences (6 favorites, 6 dislikes)
**Hay (2 favorites, 2 dislikes)** - 8 types available:
- Timothy Hay, Orchard Grass, Meadow Hay, Alfalfa Hay
- Botanical Hay, Oat Hay, Bermuda Grass, Western Timothy

**Vegetables (2 favorites, 2 dislikes)** - 12 types available:
- Bell Peppers, Carrots, Leafy Greens, Cucumber
- Cherry Tomatoes, Broccoli, Celery, Zucchini
- Parsley, Cilantro, Sweet Potato, Snap Peas

**Fruits (2 favorites, 2 dislikes)** - 10 types available:
- Apple, Banana, Strawberry, Blueberry, Orange
- Grape, Pear, Melon, Kiwi, Raspberry

#### Activity Preferences (2 favorites, 2 dislikes)
**Play Styles** - 7 types:
- Tunnels, Climbing, Hiding Games, Chewing
- Exploring, Puzzle-solving, Foraging

**Interaction Types** - 5 types:
- Gentle Petting, Active Play, Quiet Companionship
- Training Sessions, Grooming

#### Habitat Preferences (2 favorites, 2 dislikes)
**Environmental Features** - Future Phase 3/4:
- Hideouts (covered vs. open), Bedding types (fleece, paper, wood shavings)
- Multi-level platforms, Floor space layouts
- Hay racks (ball vs. wall-mounted), Water bottles vs. bowls

## Three-Tier Response System

### Tier 1: Favorite Items (Loved)

**Benefit Modifiers**:
- **Food**: +50% hunger satisfaction, +15 happiness bonus
- **Activities**: +50% need satisfaction, +10 happiness bonus
- **Habitat**: +30% comfort satisfaction, +5 happiness bonus

**Behavioral Reactions**:
- Big popcorns (enthusiastic jumps)
- Excited wheeks and chirps
- Eyes light up / dilated pupils (future visual)
- Rushes toward item immediately
- Enthusiastic eating/interaction
- Prolonged engagement

**Activity Feed Messages**:
- "✨ {name}'s eyes light up! They absolutely love this!"
- "{name} does excited popcorns - this is their favorite!"
- "{name} devours the {food} with enthusiasm!"
- "{name} can't get enough of this!"

**Discovery Clues**:
- Extreme enthusiasm makes favorites obvious after 1-2 exposures
- Players quickly learn what guinea pig loves
- Strong positive reinforcement

### Tier 2: Neutral Items (Accepted)

**Benefit Modifiers**:
- **Food**: Standard hunger satisfaction, no happiness bonus/penalty
- **Activities**: Standard need satisfaction
- **Habitat**: Standard comfort

**Behavioral Reactions**:
- Calm acceptance
- Normal munching/interaction
- Standard vocalizations
- Neither enthusiastic nor reluctant

**Activity Feed Messages**:
- "{name} eats the {food} contentedly"
- "{name} engages with the activity"
- "{name} uses the item comfortably"
- "{name} seems satisfied"

**Discovery Clues**:
- Neutral reactions provide no clear preference signal
- Players learn these are "safe" options
- No strong emotional response

### Tier 3: Disliked Items (Avoided)

**Benefit Modifiers**:
- **Food**: -30% hunger satisfaction, -8 happiness penalty, chance of rejection
- **Activities**: -40% need satisfaction, -5 happiness penalty, high rejection chance
- **Habitat**: -20% comfort, avoidance behavior

**Behavioral Reactions**:
- Turns up nose / head turn away
- Reluctant approach
- Minimal interaction time
- Avoidance behavior
- Rejection of offered item (50% chance)
- Negative vocalizations (teeth chattering, annoyed wheeks)

**Activity Feed Messages**:
- "{name} turns away from the {food} with disinterest"
- "{name} sniffs the {food} and refuses to eat it"
- "{name} shows no interest in this activity"
- "{name} avoids the {item} entirely"
- "😐 {name} clearly doesn't like this..."

**Discovery Clues**:
- Clear negative reactions make dislikes obvious
- Players learn to avoid these items
- Strong negative feedback

## Food System Mechanics

### feedGuineaPig() Enhancement

```typescript
function feedGuineaPig(
  guineaPigId: string,
  foodType: string // Specific type like 'bell_peppers' not just 'vegetables'
): InteractionResult {

  const guineaPig = getGuineaPig(guineaPigId)
  const wellness = calculateWellness(guineaPigId)

  // Wellness check (System 4 integration)
  const wellnessSuccess = checkWellnessInteraction(wellness, 'feed')
  if (!wellnessSuccess.canProceed) {
    return wellnessSuccess.result
  }

  // Base satisfaction amount
  const baseSatisfaction = getFoodSatisfaction(foodType)

  // Check preferences
  let finalSatisfaction = baseSatisfaction
  let happinessChange = 0
  let preferenceLevel = 'neutral'

  if (guineaPig.preferences.favoriteFood.includes(foodType)) {
    // FAVORITE FOOD
    preferenceLevel = 'favorite'
    finalSatisfaction = baseSatisfaction * 1.5 // +50% satisfaction
    happinessChange = 15 // Significant happiness boost

  } else if (guineaPig.preferences.dislikedFood.includes(foodType)) {
    // DISLIKED FOOD
    preferenceLevel = 'disliked'

    // 50% chance of complete rejection
    if (Math.random() < 0.5) {
      const { message, emoji } = MessageGenerator.generateDislikedFoodRejection(
        guineaPig.name,
        foodType
      )

      loggingStore.addGuineaPigReaction(message, emoji)

      // Set interaction cooldown
      setInteractionCooldown(guineaPigId, 'feed', 30000) // 30 seconds

      return {
        success: false,
        preferenceLevel: 'disliked',
        wasRejected: true,
        message: `${guineaPig.name} refuses to eat the ${foodType}`
      }
    }

    // 50% chance of reluctant acceptance
    finalSatisfaction = baseSatisfaction * 0.7 // -30% satisfaction
    happinessChange = -8 // Happiness penalty
  }

  // Apply effects
  satisfyNeed(guineaPigId, 'hunger', finalSatisfaction)
  if (happinessChange !== 0) {
    adjustNeed(guineaPigId, 'happiness', happinessChange)
  }

  // Generate preference-aware reaction
  const { message, emoji } = MessageGenerator.generateFoodReaction(
    guineaPig.name,
    foodType,
    preferenceLevel,
    wellness
  )

  loggingStore.addPlayerAction(message, emoji, {
    guineaPigId,
    foodType,
    preferenceLevel,
    satisfaction: finalSatisfaction,
    happinessChange
  })

  return {
    success: true,
    preferenceLevel,
    finalSatisfaction,
    happinessChange
  }
}
```

### Food Type Satisfaction Values

```typescript
const foodSatisfactionValues = {
  // Hay (continuous availability, lower satisfaction per serving)
  'timothy_hay': 15,
  'orchard_grass': 15,
  'meadow_hay': 15,
  'alfalfa_hay': 18, // Higher calories
  'botanical_hay': 17,
  'oat_hay': 16,
  'bermuda_grass': 14,
  'western_timothy': 16,

  // Vegetables (main nutrition, moderate satisfaction)
  'bell_peppers': 25,
  'carrots': 23,
  'leafy_greens': 22,
  'cucumber': 20, // High water content
  'cherry_tomatoes': 24,
  'broccoli': 26, // Very nutritious
  'celery': 21,
  'zucchini': 22,
  'parsley': 20,
  'cilantro': 20,
  'sweet_potato': 27, // Dense nutrition
  'snap_peas': 23,

  // Fruits (treats, high satisfaction)
  'apple': 30,
  'banana': 32, // Very satisfying treat
  'strawberry': 30,
  'blueberry': 28,
  'orange': 29,
  'grape': 33, // Very sweet, high satisfaction
  'pear': 30,
  'melon': 31,
  'kiwi': 29,
  'raspberry': 28
}
```

### Favorite Food Examples

**Example 1: Loved Bell Peppers**
```
Input: feedGuineaPig('cocoa', 'bell_peppers')
Base Satisfaction: 25
Favorite Modifier: 25 * 1.5 = 37.5 (38)
Happiness Bonus: +15

Result:
- Hunger: -38 (excellent)
- Happiness: +15
- Message: "✨ Cocoa's eyes light up! They absolutely love bell peppers!"
- Emoji: 😋

Discovery: Player immediately knows Cocoa loves bell peppers
```

**Example 2: Disliked Broccoli - Rejection**
```
Input: feedGuineaPig('mocha', 'broccoli')
Preference Check: disliked
Rejection Roll: 45% < 50% = REJECTED

Result:
- Hunger: 0 (not fed)
- Happiness: 0 (no change, but rejection is stressful)
- Message: "Mocha sniffs the broccoli and turns away with disinterest"
- Emoji: 😐
- Cooldown: 30 seconds

Discovery: Player learns Mocha dislikes broccoli, won't try again
```

**Example 3: Disliked Broccoli - Reluctant Acceptance**
```
Input: feedGuineaPig('mocha', 'broccoli')
Preference Check: disliked
Rejection Roll: 65% > 50% = ACCEPTED RELUCTANTLY

Result:
- Hunger: -18 (26 * 0.7, reduced satisfaction)
- Happiness: -8 (penalty)
- Message: "Mocha eats the broccoli reluctantly, clearly not enjoying it"
- Emoji: 😕

Discovery: Player sees Mocha doesn't like it, but will eat if hungry
```

## Activity System Mechanics

### playWithGuineaPig() Enhancement

```typescript
function playWithGuineaPig(
  guineaPigId: string,
  activityType: string // Specific activity like 'tunnels' or 'gentle_petting'
): InteractionResult {

  const guineaPig = getGuineaPig(guineaPigId)
  const wellness = calculateWellness(guineaPigId)

  // Wellness check
  const wellnessSuccess = checkWellnessInteraction(wellness, 'play')
  if (!wellnessSuccess.canProceed) {
    return wellnessSuccess.result
  }

  const basePlayGain = 20
  const energyCost = 5

  let finalPlayGain = basePlayGain
  let happinessChange = 0
  let preferenceLevel = 'neutral'

  if (guineaPig.preferences.favoriteActivity.includes(activityType)) {
    // FAVORITE ACTIVITY
    preferenceLevel = 'favorite'
    finalPlayGain = basePlayGain * 1.5 // +50% play satisfaction
    happinessChange = 10 // Happiness bonus

  } else if (guineaPig.preferences.dislikedActivity.includes(activityType)) {
    // DISLIKED ACTIVITY
    preferenceLevel = 'disliked'

    // 70% chance of rejection for disliked activities (higher than food)
    if (Math.random() < 0.7) {
      const { message, emoji } = MessageGenerator.generateDislikedActivityRejection(
        guineaPig.name,
        activityType
      )

      loggingStore.addGuineaPigReaction(message, emoji)

      setInteractionCooldown(guineaPigId, 'play', 45000) // 45 seconds

      return {
        success: false,
        preferenceLevel: 'disliked',
        wasRejected: true
      }
    }

    // 30% chance of reluctant participation
    finalPlayGain = basePlayGain * 0.6 // -40% satisfaction
    happinessChange = -5 // Happiness penalty
  }

  // Apply effects
  satisfyNeed(guineaPigId, 'play', finalPlayGain)

  // Energy cost (only if not already tired)
  if (guineaPig.needs.energy < 70) {
    adjustNeed(guineaPigId, 'energy', energyCost)
  }

  if (happinessChange !== 0) {
    adjustNeed(guineaPigId, 'happiness', happinessChange)
  }

  // Generate reaction
  const { message, emoji } = MessageGenerator.generateActivityReaction(
    guineaPig.name,
    activityType,
    preferenceLevel,
    wellness
  )

  loggingStore.addPlayerAction(message, emoji)

  return {
    success: true,
    preferenceLevel,
    finalPlayGain,
    happinessChange
  }
}
```

### Activity Examples

**Favorite Activity: Tunnels**
```
Input: playWithGuineaPig('pepper', 'tunnels')
Preference: favorite
Base: 20
Modified: 20 * 1.5 = 30
Happiness: +10

Result:
- Play need: -30 (excellent satisfaction)
- Energy: +5 (small cost)
- Happiness: +10
- Message: "Pepper zooms through the tunnel system with excitement! 🎉"
- Discovery: Player learns Pepper loves tunnels
```

**Disliked Activity: Grooming - Rejection**
```
Input: playWithGuineaPig('truffle', 'grooming')
Preference: disliked
Rejection Roll: 60% < 70% = REJECTED

Result:
- No effect
- Message: "Truffle squirms and won't cooperate with grooming"
- Emoji: 😐
- Cooldown: 45 seconds
- Discovery: Player learns Truffle hates being groomed
```

## Habitat System Mechanics (Future Phase 3)

### Habitat Item Preferences

```typescript
function provideShelter(
  guineaPigId: string,
  shelterType: string // 'covered_hideout', 'open_bed', 'fleece_tunnel', etc.
): InteractionResult {

  const guineaPig = getGuineaPig(guineaPigId)

  const baseShelterGain = 25
  let finalGain = baseShelterGain
  let comfortBonus = 0
  let preferenceLevel = 'neutral'

  if (guineaPig.preferences.habitatPreference.includes(shelterType)) {
    // FAVORITE HABITAT FEATURE
    preferenceLevel = 'favorite'
    finalGain = baseShelterGain * 1.3 // +30% shelter satisfaction
    comfortBonus = 5 // Comfort bonus

  } else if (guineaPig.preferences.dislikedHabitat.includes(shelterType)) {
    // DISLIKED HABITAT FEATURE
    preferenceLevel = 'disliked'

    // Guinea pig will use disliked habitat items if needed
    // But with reduced benefit and avoidance behavior
    finalGain = baseShelterGain * 0.8 // -20% satisfaction
    comfortBonus = -3 // Slight discomfort

    // Autonomous behavior: Will avoid this shelter in favor of others
  }

  satisfyNeed(guineaPigId, 'shelter', finalGain)
  if (comfortBonus !== 0) {
    adjustNeed(guineaPigId, 'comfort', comfortBonus)
  }

  const { message, emoji } = MessageGenerator.generateHabitatReaction(
    guineaPig.name,
    shelterType,
    preferenceLevel
  )

  loggingStore.addPlayerAction(message, emoji)

  return { success: true, preferenceLevel }
}
```

### Autonomous Habitat Usage (Phase 4)

**Favorite Habitat Items**:
- Guinea pig seeks out preferred items autonomously
- Spends more time near favorite features
- Activity feed: "{name} retreats happily to their favorite hideout"

**Disliked Habitat Items**:
- Avoids disliked items when alternatives available
- Only uses if no other option or need is critical
- Activity feed: "{name} reluctantly uses the {item}"

## Preference Discovery System

### Discovery Progression

**First Exposure**:
- Clear reactions make likes/dislikes immediately obvious
- Player learns favorite/disliked items after single use
- Neutral items provide no information

**Pattern Confirmation**:
- 2-3 exposures confirm initial observation
- Player becomes confident in preference knowledge
- Builds mental map of guinea pig personality

**Expertise Development**:
- Experienced players recognize preference patterns
- Can predict what other items guinea pig might like
- Develops intuition for guinea pig care

### Discovery Clues by Preference Category

#### Favorites (Easy to Discover)
**Immediate Signals**:
- Extreme enthusiasm (popcorns, wheeks)
- Eyes light up / excited behavior
- Rushes toward item
- Prolonged, happy engagement

**Activity Feed Markers**:
- ✨ sparkle emoji indicates favorite
- Explicit language: "absolutely loves", "favorite", "can't get enough"
- Emotional intensity in messages

**Player Takeaway**: "Cocoa LOVES bell peppers, I should give these often!"

#### Dislikes (Easy to Discover)
**Immediate Signals**:
- Rejection behavior (turns away, refuses)
- Negative vocalizations
- Minimal engagement
- Quick abandonment

**Activity Feed Markers**:
- 😐 neutral/disappointed emoji
- Clear language: "turns away", "refuses", "doesn't like"
- Rejection messages

**Player Takeaway**: "Mocha hates broccoli, never feeding that again"

#### Neutral (No Discovery Cues)
**Subtle Signals**:
- Calm, standard behavior
- No strong emotion either way
- Normal engagement duration

**Activity Feed Markers**:
- Standard emojis (😊)
- Matter-of-fact language: "eats contentedly", "uses comfortably"
- No preference indicators

**Player Takeaway**: "Carrots are fine, but nothing special"

### Hidden vs. Revealed Preferences

**Always Hidden**:
- Preferences never displayed in UI
- No stats panel showing favorites
- No "preference discovered!" achievements
- Pure observational learning

**Player Memory Tools** (Future Enhancement):
- Players can take notes outside game
- Community sharing of preference observations
- Player-created preference guides
- Mental mapping is the intended experience

## Integration with Existing Systems

### Personality Influence on Preferences

**Playfulness → Activity Preferences**:
```typescript
// High playfulness more likely to have energetic favorites
if (personality.playfulness >= 7) {
  favoriteActivityPool.addWeight('tunnels', 2.0)
  favoriteActivityPool.addWeight('climbing', 1.8)
  favoriteActivityPool.addWeight('exploring', 1.5)

  dislikedActivityPool.addWeight('quiet_companionship', 1.5)
}

// Low playfulness prefers calm activities
if (personality.playfulness <= 3) {
  favoriteActivityPool.addWeight('quiet_companionship', 2.0)
  favoriteActivityPool.addWeight('gentle_petting', 1.8)

  dislikedActivityPool.addWeight('active_play', 1.5)
}
```

**Curiosity → Food Preferences**:
```typescript
// High curiosity more likely to like varied/unusual foods
if (personality.curiosity >= 7) {
  favoritePool.addWeight('exotic_foods', 1.5)
  // Less likely to dislike new flavors
  dislikedFoodCount -= 1
}

// Low curiosity prefers familiar/safe foods
if (personality.curiosity <= 3) {
  favoritePool.addWeight('common_foods', 1.5)
  dislikedFoodCount += 1 // More picky
}
```

**Independence → Habitat Preferences**:
```typescript
// High independence prefers private spaces
if (personality.independence >= 7) {
  habitatPreferences.addWeight('covered_hideout', 2.0)
  habitatPreferences.addWeight('individual_spaces', 1.8)
}

// Low independence prefers open, social spaces
if (personality.independence <= 3) {
  habitatPreferences.addWeight('open_beds', 1.8)
  habitatPreferences.addWeight('communal_areas', 1.5)
}
```

### Wellness Impact on Preference Expression

**High Wellness (80-100%)**:
- Preferences expressed strongly
- Clear differentiation between liked/neutral/disliked
- Maximum happiness bonuses/penalties
- Enthusiastic reactions to favorites

**Low Wellness (<40%)**:
- Preferences less pronounced
- Survival needs override preferences
- Reduced happiness bonuses (still get satisfaction boost)
- Favorites still preferred, but less enthusiastically

```typescript
// Wellness modifier for preference effects
function getPreferenceMultiplier(wellness: number): number {
  if (wellness >= 80) return 1.0  // Full preference expression
  if (wellness >= 60) return 0.9  // Slight reduction
  if (wellness >= 40) return 0.7  // Moderate reduction
  return 0.5                      // Survival mode, preferences matter less
}

// Apply to happiness changes
happinessChange *= getPreferenceMultiplier(wellness)
```

### Friendship Progression Impact

**Respecting Preferences → Friendship Gain**:
```typescript
// Bonus friendship when giving favorite items
if (preferenceLevel === 'favorite') {
  adjustFriendship(guineaPigId, 0.3) // Small bonus
}

// Accumulated preference respect builds strong bond
// Over time, players who learn and respect preferences
// build higher friendship faster
```

**Ignoring Preferences → Friendship Penalty**:
```typescript
// Small penalty for repeatedly giving disliked items
if (preferenceLevel === 'disliked' && !wasRejected) {
  // Guinea pig tolerates it but doesn't like it
  adjustFriendship(guineaPigId, -0.1) // Minor penalty

  // Track disliked item frequency
  guineaPig.stats.dislikedItemsGiven += 1

  // If player consistently ignores preferences (>10 in session)
  if (guineaPig.stats.dislikedItemsGiven > 10) {
    // Stronger penalty, shows player doesn't care about preferences
    adjustFriendship(guineaPigId, -0.5)
  }
}
```

### Enhanced Activity Messages (System 1)

**Preference-Based Reactions**:
```typescript
// System 1 reaction generation should check preferences
function generateReactionMessage(
  guineaPig: GuineaPig,
  interactionType: string,
  item: string
): string {

  const preferenceLevel = getPreferenceLevel(guineaPig, item)
  const wellness = calculateWellness(guineaPig.id)
  const personality = guineaPig.personality

  // Combine all factors for rich, contextual reactions
  return MessageGenerator.generateComprehensiveReaction({
    guineaPigName: guineaPig.name,
    preferenceLevel,    // NEW: favorite/neutral/disliked
    wellness,           // System 4
    personality,        // System 3
    interactionType
  })
}
```

## Message Generation System

### Template Structure

```typescript
interface PreferenceMessageTemplates {
  [category: string]: {
    favorite: {
      food: string[]
      activity: string[]
      habitat: string[]
    }
    neutral: {
      food: string[]
      activity: string[]
      habitat: string[]
    }
    disliked: {
      food: string[]
      activity: string[]
      habitat: string[]
      rejection: string[]
    }
  }
}
```

### Food Message Templates

**Favorite Food**:
- "✨ {name}'s eyes light up! They absolutely love {food}!"
- "{name} does excited popcorns - {food} is their favorite!"
- "{name} devours the {food} with pure joy! 😋"
- "{name} can't get enough of {food}!"
- "{name} wheeks excitedly at the {food}!"

**Neutral Food**:
- "{name} eats the {food} contentedly 😊"
- "{name} munches on the {food}"
- "{name} accepts the {food} readily"
- "{name} seems satisfied with the {food}"

**Disliked Food - Rejection**:
- "{name} sniffs the {food} and turns away 😐"
- "{name} refuses to eat the {food}"
- "{name} shows no interest in the {food}"
- "{name} turns up their nose at the {food}"
- "{name} clearly doesn't like {food}"

**Disliked Food - Reluctant Acceptance**:
- "{name} eats the {food} reluctantly 😕"
- "{name} nibbles the {food} without enthusiasm"
- "{name} tolerates the {food} but doesn't enjoy it"
- "{name} eats some {food} but seems unhappy"

### Activity Message Templates

**Favorite Activity**:
- "{name} absolutely loves {activity}! 🎉"
- "{name} engages enthusiastically with {activity}!"
- "{name} zooms around during {activity} with pure joy!"
- "✨ {activity} is clearly {name}'s favorite thing!"

**Neutral Activity**:
- "{name} participates in {activity} comfortably"
- "{name} seems content with {activity}"
- "{name} engages with {activity} normally"

**Disliked Activity - Rejection**:
- "{name} has no interest in {activity} 😐"
- "{name} avoids {activity} entirely"
- "{name} refuses to participate in {activity}"
- "{name} clearly dislikes {activity}"

**Disliked Activity - Reluctant Participation**:
- "{name} participates in {activity} halfheartedly 😕"
- "{name} tolerates {activity} but seems uncomfortable"
- "{name} doesn't seem to enjoy {activity}"

### Habitat Message Templates (Future)

**Favorite Habitat Feature**:
- "{name} loves this {item}! ✨"
- "{name} retreats happily to their favorite {item}"
- "{name} settles into the {item} with contentment"

**Neutral Habitat Feature**:
- "{name} uses the {item} comfortably"
- "{name} rests in the {item}"

**Disliked Habitat Feature**:
- "{name} reluctantly uses the {item} 😕"
- "{name} prefers other hiding spots"
- "{name} avoids the {item} when possible"

## Balancing Guidelines

### Preference Distribution

**Favorites (2 per category)**:
- Ensure variety across guinea pigs
- Weighted random selection prevents duplicates
- Balance common vs. rare favorites
- Each guinea pig feels unique

**Dislikes (2 per category)**:
- Cannot overlap with favorites
- Should include at least one common item (creates challenge)
- Balance prevents "perfect" guinea pigs with no dislikes

**Neutral (Majority)**:
- Most items are neutral (60-70% of available options)
- Provides flexibility for player
- Safe fallback options always available

### Benefit Scaling

**Favorites**:
- +50% satisfaction (significant but not game-breaking)
- +10-15 happiness (meaningful emotional reward)
- Clear enough to incentivize learning preferences

**Dislikes**:
- -30-40% satisfaction (penalty but still provides some benefit)
- -5-8 happiness (noticeable but not devastating)
- Rejection chance (50-70%) creates risk
- Players learn to avoid, but occasional use won't ruin game

**Balance Goal**: Knowing preferences provides 20-30% efficiency improvement

### Rejection Rates

**Food Dislikes**: 50% rejection chance
- Food is essential, can't reject too often
- Survival instinct overrides preferences
- Players can still feed in emergencies

**Activity Dislikes**: 70% rejection chance
- Activities are optional, can be more picky
- Higher rejection teaches preferences faster
- Encourages trying different activities

**Habitat Dislikes**: No rejection (Phase 3/4)
- Habitat items are passive, always available
- Avoidance behavior instead of rejection
- Autonomous system shows preference through usage patterns

## Implementation Examples

### Preference Generation (Pet Store)

```typescript
function generateGuineaPigPreferences(
  personality: GuineaPigPersonality
): GuineaPigPreferences {

  // Weighted pools based on personality
  const favoritePool = createWeightedPool()
  const dislikePool = createWeightedPool()

  // Personality influences preference weights
  applyPersonalityWeights(favoritePool, dislikePool, personality)

  // Select preferences ensuring no overlap
  const favoriteFood = selectRandomUnique(favoritePool.food, 6) // 2 per category
  const dislikedFood = selectRandomUnique(
    dislikePool.food.filter(f => !favoriteFood.includes(f)),
    6
  )

  const favoriteActivity = selectRandomUnique(favoritePool.activity, 2)
  const dislikedActivity = selectRandomUnique(
    dislikePool.activity.filter(a => !favoriteActivity.includes(a)),
    2
  )

  const habitatPreference = selectRandomUnique(favoritePool.habitat, 2)
  const dislikedHabitat = selectRandomUnique(
    dislikePool.habitat.filter(h => !habitatPreference.includes(h)),
    2
  )

  return {
    favoriteFood,
    dislikedFood,
    favoriteActivity,
    dislikedActivity,
    habitatPreference,
    dislikedHabitat
  }
}
```

### Preference Check Utility

```typescript
function getPreferenceLevel(
  guineaPig: GuineaPig,
  item: string,
  category: 'food' | 'activity' | 'habitat'
): 'favorite' | 'neutral' | 'disliked' {

  const prefs = guineaPig.preferences

  switch (category) {
    case 'food':
      if (prefs.favoriteFood.includes(item)) return 'favorite'
      if (prefs.dislikedFood.includes(item)) return 'disliked'
      return 'neutral'

    case 'activity':
      if (prefs.favoriteActivity.includes(item)) return 'favorite'
      if (prefs.dislikedActivity.includes(item)) return 'disliked'
      return 'neutral'

    case 'habitat':
      if (prefs.habitatPreference.includes(item)) return 'favorite'
      if (prefs.dislikedHabitat.includes(item)) return 'disliked'
      return 'neutral'
  }
}
```

## Testing Scenarios

### Favorite Food Discovery
1. **Setup**: Guinea pig with bell peppers as favorite
2. **Action**: feedGuineaPig('cocoa', 'bell_peppers')
3. **Expected**:
   - Hunger: -38 (25 * 1.5)
   - Happiness: +15
   - Message: "✨ Cocoa's eyes light up! They absolutely love bell peppers!"
   - Player immediately recognizes favorite
4. **Confirmation**: Feed again, same enthusiastic reaction
5. **Learning**: Player gives bell peppers frequently

### Disliked Food Rejection
1. **Setup**: Guinea pig with broccoli as disliked
2. **Action**: feedGuineaPig('mocha', 'broccoli')
3. **Attempt 1**: 45% roll → Rejected
   - Message: "Mocha sniffs the broccoli and refuses to eat it"
   - No satisfaction gain
   - 30 second cooldown
4. **Attempt 2** (after cooldown): 70% roll → Reluctant acceptance
   - Hunger: -18 (26 * 0.7)
   - Happiness: -8
   - Message: "Mocha eats the broccoli reluctantly 😕"
5. **Learning**: Player avoids broccoli for Mocha

### Neutral Item Testing
1. **Setup**: Guinea pig with carrots as neutral
2. **Action**: feedGuineaPig('pepper', 'carrots')
3. **Expected**:
   - Hunger: -23 (standard)
   - Happiness: 0 (no bonus)
   - Message: "Pepper munches on the carrots contentedly"
   - No strong reaction either way
4. **Learning**: Player learns carrots are "safe" but unremarkable

### Preference Variety Across Guinea Pigs
1. **Setup**: Two guinea pigs
   - Cocoa: Loves bell peppers, hates broccoli
   - Mocha: Loves broccoli, hates bell peppers
2. **Action**: Feed same foods to both
3. **Expected**: Opposite reactions demonstrate individual uniqueness
4. **Learning**: Player must remember each guinea pig's preferences separately

### Wellness + Preference Interaction
1. **Setup**: Guinea pig with favorite food, poor wellness (30%)
2. **Action**: feedGuineaPig('truffle', 'favorite_strawberry')
3. **Expected**:
   - Wellness modifier: 0.5x happiness
   - Hunger: -45 (30 * 1.5, full satisfaction bonus still applies)
   - Happiness: +7 (15 * 0.5, reduced by wellness)
   - Message: "Truffle nibbles the strawberry gratefully but seems unwell"
4. **Learning**: Favorites still help at low wellness, but less dramatic

## Future Enhancements

### Preference Evolution
- Preferences slowly shift based on exposure
- Neutral items can become liked through positive association
- Prevents static, unchanging personalities

### Seasonal Preferences
- Certain foods become more preferred in different contexts
- Hot weather: Water-rich foods (cucumber, melon)
- Cold weather: Dense foods (sweet potato, alfalfa hay)

### Learned Associations
- Guinea pig associates specific foods with player kindness
- Preferences strengthen when given during low wellness recovery
- "Comfort food" concept based on positive memories

### Preference Hints (Optional Future Feature)
- After 10+ interactions, subtle hints appear
- "Seems to really enjoy vegetables" (category hint)
- Never explicit favorites, maintains discovery

### Community Sharing
- Players share discovered preferences (outside game)
- Community-created preference guides
- Social aspect of discovery learning

## Success Metrics

### Discovery Effectiveness
- Players recognize favorites within 1-2 exposures
- Players avoid dislikes after experiencing rejection
- Preference knowledge improves care efficiency by 20-30%

### Individual Uniqueness
- Each guinea pig feels genuinely different
- Players develop specific care routines per guinea pig
- Emotional attachment strengthened by personalization

### Gameplay Impact
- Attentive players rewarded with better results
- Casual players can succeed with neutral items
- Expert players optimize around preferences

## References
- [Preferences System (Game Design)](../../game-design/preferences-system.md) - Design philosophy and discovery mechanics
- [Personality Trait Influences](system-3-personality-trait-influences.md) - How personality affects preferences
- [Wellness Interaction Reactions](system-4-wellness-interaction-reactions.md) - How wellness modifies preference expression
- [Enhanced Activity Messages](system-1-enhanced-activity-messages.md) - Preference-aware message generation
