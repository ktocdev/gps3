# Needs System Architecture - System 7

**Phase 2: Core Game Entities & State**

## Overview
Core game mechanics system managing guinea pig needs, wellness calculation, and friendship integration with complex interdependencies and feedback loops.

## Base Need Architecture

### Need Categories (0-100 Scale)
1. **Hunger** - Food consumption and satisfaction
2. **Thirst** - Water intake and hydration
3. **Happiness** - Entertainment, variety, and emotional well-being
4. **Cleanliness** - Personal hygiene and habitat cleanliness
5. **Health** - Physical condition and medical needs
6. **Energy** - Rest, sleep, and activity balance
7. **Social** - Interaction and companionship needs
8. **Nails** - Nail growth and trimming maintenance
9. **Chew** - Natural chewing instinct and dental health
10. **Shelter** - Security, hiding instincts, and environmental safety

### Need Value Ranges & Thresholds
- **Critical (0-25%):** Urgent attention required, severe penalties
- **Low (25-50%):** Needs attention, minor penalties and warnings
- **Moderate (50-75%):** Stable but could be improved
- **Good (75-90%):** Well-maintained, positive effects
- **Excellent (90-100%):** Optimal condition, maximum bonuses

### Decay Rate System
- **Variable decay rates** based on guinea pig age and health status
- **Base decay rates** for each need type with individual characteristics
- **Age influences:** Young and old guinea pigs have different needs patterns
- **Health multipliers:** Poor health accelerates certain need decays
- **Environmental modifiers:** Habitat conditions affect decay rates

## Need Interdependencies

### Cross-Need Effects
- **Low health affects other needs:** Sick guinea pigs have accelerated need decay
- **Happiness influences satisfaction:** Happy guinea pigs are more resilient to other need deficits
- **Energy affects activity:** Tired guinea pigs have reduced interaction effectiveness
- **Cleanliness impacts health:** Poor hygiene increases health decay rates

### Cascading Effects
- **Multiple need failures** create compound negative effects
- **Positive synergies** when multiple needs are well-maintained
- **Recovery bonuses** when addressing critical needs quickly
- **Preventive care** rewards for maintaining needs before they become critical

## Detailed Happiness Need System

### Natural Decay Mechanics
- **Baseline decay rate:** Happiness naturally decreases without play and enrichment
- **Time-based reduction:** Steady decline requiring regular attention
- **Individual variation:** Each guinea pig has unique happiness decay patterns

### Boredom System
- **Variety tracking:** Monitor diversity of interactions and toys over time
- **Accelerated decay:** Happiness drops faster with repetitive activities
- **Staleness penalties:** Same interactions become less effective over time
- **Novelty rewards:** New activities provide enhanced happiness benefits

### Play & Excitement
- **Excitement boost:** New toys/interactions provide temporary happiness surge (+15-25 points)
- **Duration effects:** Boosts fade over time, requiring sustained engagement
- **Diminishing returns:** Repeated use of same play activities reduces effectiveness
- **Peak management:** Balance between excitement and sustainable happiness

### Comfort & Maintenance
- **Familiar items:** Provide steady happiness baseline with slower decay
- **Comfort zones:** Established preferences that maintain happiness stability
- **Security factors:** Consistent care builds happiness resilience
- **Trust building:** Long-term relationship development affects happiness sustainability

### Environmental Happiness Factors
- **Fresh bedding:** Clean environment provides happiness bonus
- **Cleanliness effects:** Dirty habitat reduces happiness over time
- **Cage enrichment:** Toys, hiding places, and variety boost baseline happiness
- **Seasonal variations:** Environmental changes affect happiness needs

## Detailed Nails Need System

### Natural Growth Mechanics
- **Slow decay rate:** Nails grow gradually, requiring periodic attention (slower than most needs)
- **Age-based variation:** Young guinea pigs have faster nail growth than adults
- **Individual variation:** Each guinea pig has unique nail growth patterns
- **Critical threshold:** Overgrown nails (< 25%) cause discomfort and affect movement

### Nail Clipping Interaction
- **Primary satisfaction method:** "Clip Nails" direct interaction
- **Friendship dependency:** Success rate affected by current friendship level
- **Wellness dependency:** Guinea pig cooperation affected by overall wellness
- **Partial success mechanics:** Low friendship/wellness may prevent complete nail trimming

### Success Rate Calculation
```typescript
successRate = baseSuccessRate + (friendship * 0.3) + (wellness * 0.2)
partialSuccess = successRate < 70% // Some nails remain unclipped
completeSuccess = successRate >= 70% // All nails successfully trimmed
```

### Nail Clipping Outcomes
- **Complete success:** Full nail need restoration (+40-50 points)
- **Partial success:** Moderate improvement (+20-30 points)
- **Minimal success:** Small improvement (+10-15 points)
- **Failure:** No improvement, possible stress reaction

## Detailed Chew Need System

### Natural Chewing Instinct
- **Moderate decay rate:** Steady decline requiring regular chew item provision
- **Dental health connection:** Affects overall health need when neglected
- **Individual preferences:** Each guinea pig prefers certain chew types
- **Variety benefits:** Different chew items provide varied satisfaction levels

### Chew Item Categories
- **Wooden chews:** Natural wood items for gnawing
- **Edible chews:** Consumable items providing nutrition and chewing
- **Textural chews:** Different materials for varied chewing experiences
- **Interactive chews:** Puzzle-like chewing challenges

### Chew Effectiveness System
- **Base effectiveness:** All chew items provide standard satisfaction
- **Preference bonuses:** Preferred chew types provide enhanced benefits (+25% effectiveness)
- **Novelty bonuses:** New chew types provide temporary excitement (+15 points)
- **Familiarity decay:** Overused chew types become less effective over time

## Detailed Shelter Need System

### Security Instinct Mechanics
- **Prey animal behavior:** Guinea pigs have natural hiding and security instincts separate from happiness
- **Environmental anxiety:** Gradual decay when guinea pig feels exposed or unsafe
- **Stress acceleration:** Faster decay during loud noises, sudden movements, or environmental changes
- **Individual sensitivity:** Each guinea pig has unique shelter preferences and anxiety thresholds

### Shelter Satisfaction Methods
- **Shelter usage:** Primary satisfaction through hiding in shelter items
- **Secure locations:** Comfort zones near walls, corners, or enclosed areas
- **Bed-shelter combinations:** Enhanced security when resting areas are near hiding spots
- **Environmental familiarity:** Established territory areas provide passive shelter satisfaction

### Shelter Decay Triggers
- **Exposure time:** Extended periods without shelter access increase anxiety
- **Environmental disturbances:** New items, cage cleaning, or layout changes accelerate decay
- **Friendship correlation:** Low friendship amplifies shelter need decay rate
- **Wellness interaction:** Poor overall wellness increases shelter-seeking behavior

### Shelter Preference System
- **Enclosed vs open:** Individual preferences for fully enclosed shelters vs partial coverage
- **Elevation preference:** Some guinea pigs prefer ground-level vs elevated hiding spots
- **Size preference:** Comfort with tight spaces vs spacious shelters
- **Material preference:** Different shelter materials (wood, plastic, fabric) appeal differently

### Shelter Effectiveness Scaling
- **Basic satisfaction:** All shelter items provide standard security benefits
- **Preference bonuses:** Preferred shelter types provide +25% enhanced effectiveness
- **Combination synergy:** Shelter + bed pairings provide +30% bonus to both shelter and energy needs
- **Familiarity bonus:** Regular shelter usage creates comfort zones with +15% effectiveness

### Proactive Shelter Behavior
- **Anxiety prevention:** Guinea pig seeks shelter when need drops below 60%
- **Stress response:** Immediate shelter-seeking during environmental disturbances
- **Comfort checking:** Regular visits to preferred shelters for security reassurance
- **Territory establishment:** Creates secure zones around frequently used shelters

## Weighted Need Groups System

### Need Group Classifications

#### Critical Physical Needs (40% weight)
- **Hunger, Thirst, Energy** - Essential survival needs threatening life if neglected
- **Highest priority** in wellness calculation and gameplay importance
- **Immediate consequences** when these needs reach critical levels
- **Survival imperative** requiring urgent player attention

#### External Environment Needs (25% weight)
- **Social, Cleanliness, Shelter** - Environmental wellness and stress management
- **High importance** for psychological health and comfort
- **Stress amplification** when these needs are neglected affecting other needs
- **Security foundation** providing stability for other need satisfaction

#### Maintenance Needs (20% weight)
- **Chew, Nails, Health** - Ongoing care and long-term health requirements
- **Medium importance** for sustained health and wellness
- **Gradual consequences** with long-term impacts rather than immediate crises
- **Preventive care** focus requiring regular but not urgent attention

#### Happiness Need (15% weight)
- **Happiness** - Entertainment and emotional well-being (standalone)
- **Quality of life** importance but secondary to survival needs
- **Enhancement role** improving overall experience without threatening survival
- **Enrichment focus** for optimal guinea pig experience

### Weighted Calculation Formula
```typescript
wellness = (criticalPhysicalAverage * 0.40) +
          (externalEnvironmentAverage * 0.25) +
          (maintenanceAverage * 0.20) +
          (happiness * 0.15)

Where:
criticalPhysicalAverage = (hunger + thirst + energy) / 3
externalEnvironmentAverage = (social + cleanliness + shelter) / 3
maintenanceAverage = (chew + nails + health) / 3
```

### Group Priority Benefits
- **Realistic prioritization** reflecting actual guinea pig care importance
- **Strategic guidance** helping players understand which needs to address first
- **Emergency triage** clear direction during resource constraints
- **Educational value** teaching proper pet care priorities

## Internal Wellness Rating System

### Weighted Wellness Calculation
- **Weighted group system** reflecting realistic care priorities (0-100 scale)
- **Not displayed to player** - internal system only
- **Continuous monitoring** for threshold detection and penalty triggers
- **Priority-based weighting** emphasizing critical physical needs over maintenance

### Wellness Threshold System
- **Penalty threshold:** < 45% wellness triggers friendship penalties
- **Warning threshold:** < 50% wellness provides contextual warnings only
- **Recovery threshold:** > 55% wellness stops friendship penalties
- **Optimal range:** > 75% wellness provides friendship bonuses

### Friendship Penalty Mechanism
- **Penalty rate:** -0.5 to -1 friendship points per game tick when wellness < 45%
- **Graduated penalties:** More severe penalties for lower wellness levels
- **Immediate consequences:** Real-time feedback through friendship meter changes
- **Recovery incentives:** Quick wellness improvement stops penalties immediately

## Friendship System Integration

### Friendship Level Mechanics
- **Range:** 0-100 friendship scale
- **Positive growth:** Increases through positive interactions and good care
- **Negative impacts:** Decreases through wellness penalties and poor care
- **Stability factors:** Established friendship is more resilient but still vulnerable

### Friendship Effects on Gameplay
- **Interaction unlocks:** Higher friendship enables new interactions and items
- **Behavior influence:** Friendship affects guinea pig autonomous behavior patterns
- **Reaction intensity:** Higher friendship produces more expressive reactions
- **Need satisfaction rates:** Higher friendship makes interactions more effective

### Wellness-to-Friendship Feedback Loop
- **Care consequences:** Poor overall care results in friendship deterioration
- **Recovery rewards:** Improved care quickly restores friendship levels
- **Long-term relationship:** Consistent good care builds lasting friendship resilience
- **Neglect penalties:** Extended poor care has compound negative effects

## Advanced Need Features

### Seasonal & Time-Based Variations
- **Seasonal needs changes:** Different needs patterns throughout the year
- **Daily rhythm effects:** Energy needs vary based on time of day
- **Activity cycles:** Natural periods of higher/lower needs based on guinea pig behavior
- **Environmental adaptation:** Needs adjust to habitat conditions over time

### Individual Variation
- **Personality-based needs:** Some guinea pigs have unique needs patterns
- **Age-related changes:** Needs evolve as guinea pig ages
- **Health condition effects:** Chronic conditions alter needs requirements
- **Preference integration:** Individual preferences affect happiness, chew, and shelter needs specifically
- **Nail growth patterns:** Unique nail growth rates and clipping tolerance levels
- **Chewing preferences:** Individual preferences for different chew item types and textures
- **Shelter preferences:** Individual preferences for shelter types, sizes, and placement (enclosed vs open, elevated vs ground-level)
- **Security sensitivity:** Varying anxiety thresholds and environmental stress tolerance levels

## Technical Implementation

### Need Class Structure
```typescript
interface Need {
  id: string
  name: string
  value: number // 0-100
  decayRate: number
  lastUpdate: number
  modifiers: NeedModifier[]
  thresholds: NeedThreshold[]
}

interface NeedModifier {
  source: string
  effect: number
  duration?: number
  condition?: () => boolean
}
```

### Performance Optimization
- **Batch processing:** Update all needs simultaneously for efficiency
- **Smart intervals:** Different needs update at appropriate frequencies
- **Threshold caching:** Avoid recalculating thresholds on every update
- **Lazy evaluation:** Only calculate complex interdependencies when needed

## Integration Points

### Needs Controller Store Connection
- **Central processing:** Batch needs updates through controller
- **Wellness calculation coordination** with controller system
- **State synchronization** across all needs-related systems

### Guinea Pig Store Integration
- **Individual needs storage** within guinea pig entity
- **Preference effects** on needs satisfaction rates
- **Reaction system** responds to needs levels and changes

### Debug Integration
- **Need manipulation tools** for testing and balancing
- **Wellness calculation visualization** for development insight
- **Threshold testing** capabilities for validation
- **Performance monitoring** for optimization

## Social Need Enhancements (System 17)

### Guinea Pig to Guinea Pig Interactions
With the current system supporting 2 active guinea pigs, social need satisfaction is enhanced through guinea pig interactions:

#### Core Social Interactions
- **Grooming** - Guinea pigs clean each other (satisfies cleanliness + social needs)
- **Playing Together** - Shared play activities (satisfies happiness + social needs)
- **Sharing Food** - Guinea pigs eat together (satisfies hunger + social needs)
- **Sleeping Together** - Resting in close proximity (satisfies energy + social needs)
- **Exploring Together** - Moving around habitat as a pair (satisfies social need)

#### Enhanced Social Need Processing
- **Companionship Bonus:** 30% slower social decay when 2 guinea pigs are active
- **Proximity Bonus:** Additional 20% reduction when guinea pigs are near each other
- **Loneliness Penalty:** 30% faster social decay when guinea pig is alone
- **Interaction Satisfaction:** Enhanced social need satisfaction through guinea pig interactions

#### Interaction Triggers
- **Proximity-Based:** Guinea pigs near each other have increased interaction probability
- **Need-Based:** High social needs increase interaction likelihood
- **Time-Based:** Regular interaction intervals (every 10-15 minutes)
- **Activity-Based:** Triggered by specific activities (eating, resting, playing)

## Future Enhancements
- **Stimulation need addition** - Re-introduce stimulation as distinct from play (mental enrichment vs physical play)
  - Stimulation: Mental enrichment, variety, exploration, novel experiences
  - Play: Physical activity, toy usage, exercise, active engagement
  - Justification: Different satisfaction mechanics (variety/rotation vs frequency)
- **Advanced interdependencies** with more complex need relationships
- **Learning system** where guinea pig needs adapt to player care patterns
- **Health system expansion** with specific medical conditions affecting needs
- **Personality-based social interactions** with individual guinea pig preferences
- **Bonding levels** between specific guinea pig pairs ✅ Implemented in Phase 4 System 21
- **Group activities** involving all active guinea pigs simultaneously