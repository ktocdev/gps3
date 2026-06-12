# Wellness Rating System - Strategic Design

## Overview
Internal wellness calculation system that creates consequences for poor guinea pig care through friendship penalties, encouraging balanced holistic care without explicit wellness meters.

## Core Mechanics

### Weighted Care Requirement
- **Holistic care approach:** Players must maintain all 10 needs with understanding of priority levels
- **Realistic priorities:** Critical physical needs (hunger, thirst, energy) have highest impact on wellness
- **Weighted importance:** Need groups have different importance levels reflecting real guinea pig care
- **Strategic care decisions:** Players learn to prioritize appropriately during resource constraints

### Consequence Feedback Loop
- **Poor care damages relationship:** Overall neglect affects guinea pig friendship through wellness penalties
- **Invisible calculation:** Wellness calculated internally without direct player visibility
- **Friendship as indicator:** Friendship meter serves as primary feedback mechanism
- **Natural consequences:** Poor care leads to relationship deterioration

### Progressive Difficulty
- **Downward spiral mechanics:** As friendship decreases, interactions become less effective
- **Compounding problems:** Lower friendship makes it harder to satisfy needs effectively
- **Motivation for improvement:** Players naturally want to restore positive relationship
- **Escalating consequences:** Continued neglect accelerates relationship damage

### Recovery Opportunity
- **Improvement rewards:** Players can recover by improving overall wellness
- **Penalty cessation:** Wellness above threshold immediately stops friendship penalties
- **Rebuilding process:** Positive interactions more effective once baseline care restored
- **Hope and redemption:** Always possible to restore relationship through better care

## Mathematical Foundation

### Wellness Calculation
```
Wellness = (Critical_Physical × 0.40) + (External_Environment × 0.25) + (Maintenance × 0.20) + (Happiness × 0.15)

Where:
Critical_Physical = Average(hunger, thirst, energy)
External_Environment = Average(social, cleanliness, shelter)
Maintenance = Average(chew, nails, health)
Happiness = happiness (standalone)
```
- **Calculated internally** - never displayed to player
- **Real-time computation** during each game tick
- **Weighted importance** reflecting realistic care priorities
- **Range:** 0-100 scale matching individual need scales

### Weighted Group System

#### Need Group Classifications
- **Critical Physical (40% weight):** Hunger, Thirst, Energy - Essential survival needs
- **External Environment (25% weight):** Social, Cleanliness, Shelter - Environmental wellness
- **Maintenance (20% weight):** Chew, Nails, Health - Ongoing care needs
- **Happiness (15% weight):** Entertainment and emotional well-being (standalone)

#### Group Impact Analysis
- **Critical failure consequences:** Poor physical needs have severe wellness impact
- **Environmental stress effects:** External needs significantly affect stress and comfort
- **Maintenance neglect:** Long-term health impacts from poor maintenance care
- **Happiness balance:** Quality of life important but secondary to survival

### Penalty Thresholds
- **Penalty Threshold:** Wellness < 45% triggers friendship loss
- **Warning Threshold:** Wellness < 50% provides contextual warnings
- **Recovery Threshold:** Wellness > 55% stops penalties and enables recovery
- **Bonus Threshold:** Wellness > 75% provides friendship bonuses

### Weighted Penalty Considerations
- **Critical need emphasis:** Poor physical needs (hunger, thirst, energy) cause faster friendship loss
- **Graduated severity:** External environment needs create moderate penalties
- **Maintenance tolerance:** Maintenance needs have more forgiving penalty curves
- **Happiness buffer:** Poor happiness alone rarely triggers severe penalties

### Penalty Rates
- **Base Rate:** -0.5 to -1 friendship per game tick (may need adjustment for weighted system)
- **Group-sensitive scaling:** Critical physical failures may warrant higher penalty rates
- **Graduated penalties:** Worse wellness = faster friendship loss, with group weighting considered
- **Immediate application:** Real-time friendship impact during game loop

### Player Feedback
- **Contextual warnings:** Alerts when wellness < 50% (approaching penalty range)
- **Friendship meter integration:** Shows penalty effects with trend indicators
- **No direct wellness display:** Players infer wellness from friendship changes
- **Natural discovery:** Players learn care patterns through relationship feedback

## Gameplay Impact

### Strategic Depth
- **Priority-based care strategy:** Weighted system guides realistic care prioritization
- **Resource allocation:** Players must balance time and attention with understanding of need importance
- **Emergency triage:** Critical physical needs demand immediate attention during crises
- **Weighted decision making:** Players learn that hunger matters more than nail trimming

### Discovery-Based Learning
- **Observational learning:** Players discover care patterns through guinea pig responses
- **Contextual hints:** Subtle guidance through friendship changes and warnings
- **Natural intuition:** Develop understanding without explicit instruction
- **Personal mastery:** Each player discovers their own optimal care routines

### Emotional Investment
- **Relationship stakes:** Friendship damage creates genuine concern and motivation
- **Care motivation:** Players actively want to improve guinea pig happiness
- **Recovery satisfaction:** Rebuilding relationship provides meaningful accomplishment
- **Realistic bonding:** Mimics real pet relationship development

### Skill Development
- **Care intuition:** Players develop instinctive understanding of guinea pig needs
- **Pattern recognition:** Learn to identify needs through behavioral cues
- **Timing mastery:** Develop optimal care routines and timing
- **Efficiency improvement:** Learn to maintain wellness with minimal effort

### Realistic Simulation
- **Natural pet relationship:** No artificial wellness meters or explicit scoring
- **Behavioral feedback:** Relationship quality reflected in guinea pig behavior
- **Organic discovery:** Players learn care through observation and interaction
- **Intuitive understanding:** Care quality becomes instinctive rather than calculated

### Long-term Engagement
- **Relationship recovery:** Meaningful progression goals for improving friendship
- **Continuous improvement:** Always opportunities to optimize care patterns
- **Personal investment:** Strong emotional connection to guinea pig wellbeing
- **Mastery progression:** Advanced players develop expertise in guinea pig care

## Weighted System Gameplay Impact

### Priority Learning
- **Realistic care education:** Players learn that physical needs trump convenience preferences
- **Emergency decision making:** Crisis situations teach appropriate triage priorities
- **Resource optimization:** Limited time and currency force strategic need prioritization
- **Skill development:** Advanced players efficiently balance all groups while prioritizing critical needs

### Strategic Depth Enhancement
- **Multi-layered planning:** Players must consider both immediate crises and long-term maintenance
- **Risk assessment:** Understanding consequences of neglecting different need groups
- **Efficiency optimization:** Learning to maintain all needs while respecting priority hierarchy
- **Realistic simulation:** Mirrors real pet care where survival needs override preferences

### Balance Considerations
- **Critical need urgency:** Physical needs require immediate attention when low
- **Maintenance tolerance:** Nails, chew, and health can be managed over longer timeframes
- **Environmental impact:** Poor shelter, social, or cleanliness create stress affecting other needs
- **Happiness enhancement:** Good happiness supports resilience but can't substitute for physical care

## Need Group Integration Details

### Critical Physical Group (40% Weight)
- **Hunger impact:** Directly threatens guinea pig survival, highest decay penalties
- **Thirst urgency:** Essential for all biological functions, rapid wellness impact
- **Energy dependency:** Affects all other activities and need satisfaction efficiency

### External Environment Group (25% Weight)
- **Social comfort:** Interaction quality affects willingness to accept care
- **Cleanliness stress:** Poor hygiene creates anxiety affecting appetite and rest
- **Shelter security:** Inadequate security increases stress and accelerates other need decay

### Maintenance Group (20% Weight)
- **Health foundation:** Long-term wellness requiring consistent but not urgent attention
- **Chew necessity:** Dental health affecting eating and overall comfort
- **Nail management:** Periodic grooming preventing mobility and comfort issues

### Happiness Enhancement (15% Weight)
- **Quality of life:** Enrichment and entertainment for optimal guinea pig experience
- **Resilience boost:** High happiness provides buffer against other need impacts
- **Relationship building:** Entertainment strengthens player-guinea pig bond

### Shelter Need Impact
- **Security instinct:** Addresses guinea pig prey animal instincts separate from happiness
- **Environmental management:** Creates strategic decisions about shelter placement and types
- **Stress mitigation:** Poor shelter care accelerates other need decay through stress
- **Preference depth:** Individual shelter preferences add another layer of personality discovery

### Extended Wellness Calculation Benefits
- **Increased complexity:** 10 needs create more nuanced care requirements
- **Balanced importance:** All needs equally weighted prevents selective attention
- **Realistic simulation:** Mirrors real guinea pig care complexity including security needs
- **Enhanced difficulty:** More challenging to maintain high wellness with additional needs

## Design Philosophy

### Hidden Complexity
- **Simple interface:** No complex meters or explicit wellness tracking
- **Sophisticated backend:** Advanced calculations provide nuanced feedback
- **Natural presentation:** Wellness effects presented through behavior and relationship
- **Intuitive understanding:** Players understand system without seeing mechanics

### Positive Reinforcement
- **Improvement rewards:** Better care immediately improves relationship
- **Recovery possibility:** Always hope for relationship restoration
- **Achievement satisfaction:** Mastering care provides genuine accomplishment
- **Care motivation:** System encourages rather than punishes

### Realistic Pet Care
- **Holistic responsibility:** Mimics real pet care requirements
- **Relationship building:** Authentic pet bonding simulation
- **Consequence learning:** Natural cause-and-effect teaching
- **Care development:** Progressive learning of pet care skills

## Implementation Benefits

### Player Experience
- **Clean interface:** No cluttered meters or explicit wellness tracking
- **Natural learning:** Discover optimal care through play rather than instruction
- **Emotional engagement:** Genuine concern for guinea pig wellbeing
- **Long-term motivation:** Relationship building provides sustained engagement

### Development Advantages
- **Flexible balancing:** Adjust thresholds and penalties without UI changes
- **Analytics opportunities:** Track player care patterns for optimization
- **Difficulty scaling:** Modify challenge without changing core interface
- **Feature expansion:** Add new needs without UI complexity increase

### Educational Value
- **Real pet care skills:** Transfer learning to actual pet ownership
- **Responsibility development:** Teach consistent care habits
- **Empathy building:** Understand pet needs and emotions
- **Care technique:** Learn optimal pet care practices through simulation