# Preference Randomization System - Implementation Plan

**Phase:** Phase 2 (Pet Store & Preferences)
**System Number:** 6.8
**Status:** ✅ Complete
**Prerequisites:** Pet Store Manager (6.5) ✅, Guinea Pig Preferences Interface ✅
**Created:** September 28, 2025
**Completed:** September 28, 2025

## Overview

Enhance guinea pig preference generation to create natural personality variation by randomizing the number of likes and dislikes in each preference category. Currently, all guinea pigs follow fixed patterns (always 1 like/dislike per food category, always 2 activity likes, etc.), making them predictable. This system introduces true randomization while ensuring every guinea pig has strong opinions.

## Current Problem

**Fixed preference patterns** - All guinea pigs follow identical structures:
- **Foods:** Always exactly 1 like + 1 dislike per category (3 likes, 3 dislikes total)
- **Activities:** Always exactly 2 likes + 1 dislike
- **Habitat:** Always exactly 2 likes + 1 dislike

**Result:** Predictable, unnatural patterns. Every guinea pig has nearly identical preference structures with only the specific items varying.

## Requirements

Each guinea pig must have **strong opinions** in every category:
- **Minimum:** 1 like + 1 dislike per category
- **Maximum:** 2 likes + 2 dislikes per category
- **Random:** Each category independently decides 1 or 2 for likes and dislikes (50/50 chance)
- **No overlap:** A guinea pig cannot like AND dislike the same item

## Proposed Solution

### 1. Helper Function for Random Selection

Create a helper function that picks 1 or 2 items randomly:

```typescript
// Randomly pick 1 or 2 items from array (guaranteed at least 1)
function pickRandomPreferences(items: string[], alreadyPicked: string[] = []): string[] {
  // Filter out already picked items (avoid overlap with likes/dislikes)
  const available = items.filter(item => !alreadyPicked.includes(item))

  if (available.length === 0) return []

  // Randomly decide: 1 or 2 items (50/50 chance)
  const count = Math.random() < 0.5 ? 1 : 2

  // Shuffle and take first N items
  const shuffled = [...available].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, available.length))
}
```

### 2. Update generateRandomPreferences() Function

Replace fixed preference picking with randomized selection:

```typescript
function generateRandomPreferences() {
  const shuffleArray = (array: string[]) => [...array].sort(() => Math.random() - 0.5)

  // === FOOD PREFERENCES ===

  // Vegetables: Pick 1-2 likes, then 1-2 dislikes (no overlap)
  const shuffledVegetables = shuffleArray(vegetables)
  const vegLikes = pickRandomPreferences(shuffledVegetables)
  const vegDislikes = pickRandomPreferences(shuffledVegetables, vegLikes)

  // Fruits: Pick 1-2 likes, then 1-2 dislikes (no overlap)
  const shuffledFruits = shuffleArray(fruits)
  const fruitLikes = pickRandomPreferences(shuffledFruits)
  const fruitDislikes = pickRandomPreferences(shuffledFruits, fruitLikes)

  // Hay: Pick 1-2 likes, then 1-2 dislikes (no overlap)
  const shuffledHay = shuffleArray(hayTypes)
  const hayLikes = pickRandomPreferences(shuffledHay)
  const hayDislikes = pickRandomPreferences(shuffledHay, hayLikes)

  // Combine all food preferences
  const favoriteFood = [...vegLikes, ...fruitLikes, ...hayLikes]
  const dislikedFood = [...vegDislikes, ...fruitDislikes, ...hayDislikes]

  // === ACTIVITY PREFERENCES ===

  // Pick 1-2 likes, then 1-2 dislikes (no overlap)
  const shuffledActivities = shuffleArray(activities)
  const favoriteActivity = pickRandomPreferences(shuffledActivities)
  const dislikedActivity = pickRandomPreferences(shuffledActivities, favoriteActivity)

  // === HABITAT PREFERENCES ===

  // Pick 1-2 likes, then 1-2 dislikes (no overlap)
  const shuffledHabitat = shuffleArray(habitatFeatures)
  const habitatPreference = pickRandomPreferences(shuffledHabitat)
  const dislikedHabitat = pickRandomPreferences(shuffledHabitat, habitatPreference)

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

## Example Generated Preferences

### Example Guinea Pig #1 (Moderate Opinions)
```
Vegetables: 1 like (bell_pepper), 2 dislikes (broccoli, celery)
Fruits: 2 likes (apple, strawberry), 1 dislike (banana)
Hay: 1 like (timothy), 1 dislike (alfalfa)
Activities: 2 likes (tunnels, foraging), 1 dislike (climbing)
Habitat: 1 like (quiet_spaces), 2 dislikes (multi_level, viewing_platforms)

Total: 4 food likes, 4 food dislikes, 2 activity likes, 1 activity dislike
```

### Example Guinea Pig #2 (Strong Opinions)
```
Vegetables: 2 likes (carrot, cucumber), 2 dislikes (zucchini, parsley)
Fruits: 2 likes (blueberry, melon), 2 dislikes (grape, orange)
Hay: 2 likes (orchard_grass, meadow), 2 dislikes (oat, bermuda_grass)
Activities: 2 likes (chewing, exploring), 2 dislikes (puzzle_solving, climbing)
Habitat: 2 likes (open_spaces, cozy_corners), 2 dislikes (quiet_spaces, multi_level)

Total: 6 food likes, 6 food dislikes, 2 activity likes, 2 activity dislikes
```

### Example Guinea Pig #3 (Mild Opinions)
```
Vegetables: 1 like (leafy_greens), 1 dislike (broccoli)
Fruits: 1 like (apple), 1 dislike (kiwi)
Hay: 1 like (timothy), 1 dislike (alfalfa)
Activities: 1 like (tunnels), 1 dislike (hiding_games)
Habitat: 1 like (quiet_spaces), 1 dislike (viewing_platforms)

Total: 3 food likes, 3 food dislikes, 1 activity like, 1 activity dislike
```

## Distribution Analysis

With 50/50 chance for 1 or 2 items per category:

**Food Preferences:**
- Minimum: 3 likes + 3 dislikes (all categories pick 1)
- Maximum: 6 likes + 6 dislikes (all categories pick 2)
- Average: 4-5 likes + 4-5 dislikes

**Activity Preferences:**
- Minimum: 1 like + 1 dislike
- Maximum: 2 likes + 2 dislikes

**Habitat Preferences:**
- Minimum: 1 like + 1 dislike
- Maximum: 2 likes + 2 dislikes

## Implementation Steps

### Step 1: Add Helper Function (5 min)

In `src/stores/petStoreManager.ts`, add the `pickRandomPreferences()` helper function before `generateRandomPreferences()`.

### Step 2: Replace generateRandomPreferences() (10 min)

Replace the entire function with the new randomized version that applies `pickRandomPreferences()` to all categories.

### Step 3: Test Generation (5 min)

1. Refresh pet store multiple times
2. Check guinea pig preferences in debug panel
3. Verify:
   - Each category has at least 1 like + 1 dislike
   - Some guinea pigs have 2 likes/dislikes in various categories
   - No guinea pig likes AND dislikes the same item
   - Natural variation across multiple guinea pigs

## Benefits

✅ **Guaranteed opinions** - Every guinea pig has preferences in all categories
✅ **Natural variation** - Some more opinionated (2 likes/dislikes) than others (1 like/dislike)
✅ **No neutral zones** - Ensures preference discovery is always rewarding
✅ **Balanced gameplay** - Always at least 1 like + 1 dislike gives strategic depth
✅ **Realistic personalities** - Matches how real guinea pigs have strong food opinions
✅ **Increased replayability** - Each guinea pig feels genuinely unique
✅ **Discovery depth** - More interesting to learn which items they prefer

## Game Design Impact

### Before (Fixed Patterns)
- Player quickly recognizes every guinea pig has 3 food likes
- Predictable: "They all like one veg, one fruit, one hay"
- Less personality distinction between guinea pigs
- Preference discovery feels formulaic

### After (Random Variation)
- Player discovers some guinea pigs are picky (fewer likes, more dislikes)
- Unpredictable: "This one only likes one vegetable but two fruits!"
- Strong personality distinction through preference patterns
- Preference discovery feels unique to each guinea pig
- Creates "personality types": picky eaters, adventurous eaters, opinionated guinea pigs

## Technical Details

### Randomization Logic

The `pickRandomPreferences()` function:
1. Filters out already picked items (prevents overlap)
2. Randomly chooses 1 or 2 items (50% chance each)
3. Shuffles available items
4. Returns the first N items from shuffled array

### No Overlap Guarantee

Dislikes are always picked AFTER likes with the likes passed as `alreadyPicked`:
```typescript
const vegLikes = pickRandomPreferences(shuffledVegetables)
const vegDislikes = pickRandomPreferences(shuffledVegetables, vegLikes)
// vegDislikes will never contain items from vegLikes
```

### Category Independence

Each preference category (vegetables, fruits, hay, activities, habitat) makes independent random decisions, creating natural personality variation.

## Files to Modify

**Modified Files:**
1. `src/stores/petStoreManager.ts`
   - Add `pickRandomPreferences()` helper function
   - Replace `generateRandomPreferences()` implementation

**No Interface Changes:**
- `GuineaPigPreferences` interface remains unchanged
- All existing code that reads preferences continues to work
- Debug panel already supports variable-length preference arrays

## Success Criteria

- [x] Each guinea pig has at least 1 like + 1 dislike in vegetables
- [x] Each guinea pig has at least 1 like + 1 dislike in fruits
- [x] Each guinea pig has at least 1 like + 1 dislike in hay
- [x] Each guinea pig has at least 1 like + 1 dislike in activities
- [x] Each guinea pig has at least 1 like + 1 dislike in habitat
- [x] Some guinea pigs have 2 likes/dislikes in various categories
- [x] No guinea pig has the same item in both likes and dislikes
- [x] Visible variation between different guinea pigs
- [x] Debug panel correctly displays all preference variations

## Future Enhancements

### Personality-Based Preferences (Future)

Could tie preference count to personality traits:
- **High Curiosity** → More diverse likes (more likely to get 2)
- **Low Curiosity** → Fewer likes (more likely to get 1)
- **High Independence** → More dislikes (pickier)
- **High Friendliness** → Fewer dislikes (less picky)

### Rarity System (Future)

Could create "special" guinea pigs with unusual preference patterns:
- **Foodie Guinea Pig** → 2 likes in all food categories
- **Picky Eater** → 1 like, 2 dislikes in all categories
- **Adventurous** → 2 likes in everything, 1 dislike in everything

### Preference Intensity (Future)

Could add intensity values to preferences:
- **Strong Like** (+15 happiness) vs **Mild Like** (+10 happiness)
- **Strong Dislike** (-8 happiness) vs **Mild Dislike** (-5 happiness)

## Testing Checklist

**Generation Testing:**
- [ ] Generate 10+ guinea pigs, verify all have valid preferences
- [ ] Check for likes/dislikes overlap (should be none)
- [ ] Verify minimum requirements (1 like + 1 dislike per category)

**UI Testing:**
- [ ] Debug panel correctly displays variable-length preference lists
- [ ] Dropdowns show correct preselected values
- [ ] Can manually edit preferences (add/remove likes/dislikes)

**Persistence Testing:**
- [ ] Preferences save correctly to localStorage
- [ ] Preferences load correctly on page refresh
- [ ] Old guinea pigs (from before change) still work

## Expected Outcomes

### Before Implementation:
- ❌ All guinea pigs have identical preference structures
- ❌ Predictable patterns reduce discovery excitement
- ❌ Lacks personality depth and variation

### After Implementation:
- ✅ Natural variation in preference patterns
- ✅ Each guinea pig feels genuinely unique
- ✅ Increased discovery depth and replayability
- ✅ Realistic personality representation
- ✅ Maintains gameplay balance (always has likes/dislikes)

This system creates meaningful personality variation while ensuring every guinea pig has discoverable preferences that impact gameplay.