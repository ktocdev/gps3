/**
 * Social Behaviors Composable
 * System 21: Social Bonding System
 *
 * Implements 9 social interactions between guinea pigs:
 * 1. Approach Companion - Move closer for social interaction
 * 2. Groom Partner - Clean other guinea pig (cleanliness + social) [Friends/Bonded only]
 * 3. Play Together - Shared play (play + social)
 * 4. Share Food - Eat together (hunger + social)
 * 5. Sleep Together - Rest in proximity (energy + social)
 * 6. Greet - Initial acknowledgment (all tiers)
 * 7. Inspect - Curiosity-based investigation (curiosity ≥ 5)
 * 8. Follow - Movement synchronization (Friends/Bonded only)
 * 9. Kick - Dominant/territorial behavior (Neutral only, personality-based)
 */

import { useGuineaPigStore, type GuineaPig, type ActiveBond } from '../../stores/guineaPigStore'
import { useHabitatConditions } from '../../stores/habitatConditions'
import { useLoggingStore } from '../../stores/loggingStore'
import { usePathfinding } from './usePathfinding'
import { useBehaviorStateStore } from '../../stores/behaviorStateStore'

export function useSocialBehaviors() {
  const guineaPigStore = useGuineaPigStore()
  const habitatConditions = useHabitatConditions()
  const loggingStore = useLoggingStore()
  const behaviorStateStore = useBehaviorStateStore()
  const { findPath } = usePathfinding()

  /**
   * Check if two guinea pigs are near each other (within specified distance)
   */
  function areGuineaPigsNear(gp1Id: string, gp2Id: string, maxDistance: number = 2): boolean {
    const pos1 = habitatConditions.getGuineaPigPosition(gp1Id)
    const pos2 = habitatConditions.getGuineaPigPosition(gp2Id)

    if (!pos1 || !pos2) return false

    const distance = Math.sqrt(
      Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2)
    )

    return distance <= maxDistance
  }

  /**
   * Get midpoint between two positions
   */
  function getMidpoint(pos1: { x: number; y: number }, pos2: { x: number; y: number }): { x: number; y: number } {
    return {
      x: Math.floor((pos1.x + pos2.x) / 2),
      y: Math.floor((pos1.y + pos2.y) / 2)
    }
  }

  /**
   * Delay helper for behavior timing
   */
  function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Move guinea pig to target position using pathfinding
   * Returns true if successful
   */
  async function moveToPosition(guineaPigId: string, target: { x: number; y: number }): Promise<boolean> {
    const currentPos = habitatConditions.getGuineaPigPosition(guineaPigId)
    if (!currentPos) return false

    // Convert positions to GridPosition format (row/col instead of x/y)
    const start = { row: currentPos.y, col: currentPos.x }
    const goal = { row: target.y, col: target.x }

    // Find path to target
    const result = findPath({ start, goal })
    if (!result.success || result.path.length === 0) return false

    // Move to target position immediately (simplified for now)
    // TODO: Implement animated movement when System 18 movement is integrated
    habitatConditions.guineaPigPositions.set(guineaPigId, {
      x: target.x,
      y: target.y,
      lastMoved: Date.now(),
      isMoving: false
    })
    habitatConditions.recordGuineaPigActivity('movement')

    return true
  }

  /**
   * 1. Approach Companion
   * Guinea pig moves closer to their partner
   */
  async function approachCompanion(
    initiator: GuineaPig,
    partner: GuineaPig,
    bond: ActiveBond
  ): Promise<boolean> {
    const initiatorPos = habitatConditions.getGuineaPigPosition(initiator.id)
    const partnerPos = habitatConditions.getGuineaPigPosition(partner.id)

    if (!initiatorPos || !partnerPos) return false

    // Already near? No need to approach
    if (areGuineaPigsNear(initiator.id, partner.id, 1.5)) {
      return true
    }

    // Move toward partner (adjacent cell)
    const targetPos = {
      x: partnerPos.x + (Math.random() > 0.5 ? 1 : -1),
      y: partnerPos.y + (Math.random() > 0.5 ? 1 : -1)
    }

    const success = await moveToPosition(initiator.id, targetPos)
    if (!success) return false

    // Small bonding increase for approaching
    guineaPigStore.increaseBonding(bond.id, 1, 'proximity', `${initiator.name} approaches ${partner.name}`)

    return true
  }

  /**
   * 2. Groom Partner
   * One guinea pig grooms the other, cleaning and bonding
   * Requires Friends (31%+) or Bonded (71%+) tier
   */
  async function groomPartner(
    groomer: GuineaPig,
    partner: GuineaPig,
    bond: ActiveBond
  ): Promise<boolean> {
    // Bonding tier restriction: Grooming requires trust (Friends or Bonded)
    if (bond.bondingTier === 'neutral') {
      return false
    }

    // Activity feed message (show immediately)
    loggingStore.addPlayerAction(
      `${groomer.name} gently grooms ${partner.name} who seems very content 💕`,
      '🐹'
    )

    // Approach if not near
    if (!areGuineaPigsNear(groomer.id, partner.id, 1.5)) {
      await approachCompanion(groomer, partner, bond)
    }

    // Groomer wiggles first
    behaviorStateStore.triggerPlayerInteraction(groomer.id, 1500)

    // Show chat bubbles (STAGGERED)
    const { guineaPigMessages } = await import('../../data/guineaPigMessages')
    const tierMessages = guineaPigMessages.autonomous.social[bond.bondingTier]

    // Show groomer's bubble first
    const reaction1 = tierMessages[Math.floor(Math.random() * tierMessages.length)]
    document.dispatchEvent(new CustomEvent('show-chat-bubble', {
      detail: { guineaPigId: groomer.id, reaction: reaction1 },
      bubbles: true
    }))

    // Wait before showing partner's bubble
    await delay(1500)

    // Partner wiggles back
    behaviorStateStore.triggerPlayerInteraction(partner.id, 1500)

    // Show partner's bubble
    const reaction2 = tierMessages[Math.floor(Math.random() * tierMessages.length)]
    document.dispatchEvent(new CustomEvent('show-chat-bubble', {
      detail: { guineaPigId: partner.id, reaction: reaction2 },
      bubbles: true
    }))

    // Record activity for both (grooming counts as movement for now)
    habitatConditions.recordGuineaPigActivity('movement')

    // Wait for grooming duration
    await delay(2500)

    // Satisfy needs
    guineaPigStore.satisfyNeed(groomer.id, 'social', 20)
    guineaPigStore.satisfyNeed(partner.id, 'social', 20)
    guineaPigStore.satisfyNeed(partner.id, 'hygiene', 15) // Partner gets cleaner

    // Increase bonding
    guineaPigStore.increaseBonding(
      bond.id,
      5,
      'interaction',
      `${groomer.name} gently grooms ${partner.name}`
    )

    return true
  }

  /**
   * 3. Play Together
   * Both guinea pigs play together happily
   */
  async function playTogether(
    gp1: GuineaPig,
    gp2: GuineaPig,
    bond: ActiveBond
  ): Promise<boolean> {
    const pos1 = habitatConditions.getGuineaPigPosition(gp1.id)
    const pos2 = habitatConditions.getGuineaPigPosition(gp2.id)

    if (!pos1 || !pos2) return false

    // Find meeting point
    const meetingPoint = getMidpoint(pos1, pos2)

    // Both move to meeting point (in parallel)
    await Promise.all([
      moveToPosition(gp1.id, meetingPoint),
      moveToPosition(gp2.id, { x: meetingPoint.x + 1, y: meetingPoint.y })
    ])

    // Set both to 'playing' state
    behaviorStateStore.updateBehaviorState(gp1.id, { currentActivity: 'playing' })
    behaviorStateStore.updateBehaviorState(gp2.id, { currentActivity: 'playing' })

    // Record activity
    habitatConditions.recordGuineaPigActivity('movement')

    // Show chat bubbles (STAGGERED)
    const { guineaPigMessages } = await import('../../data/guineaPigMessages')
    const tierMessages = guineaPigMessages.autonomous.social[bond.bondingTier]

    // Show gp1's bubble first
    const reaction1 = tierMessages[Math.floor(Math.random() * tierMessages.length)]
    document.dispatchEvent(new CustomEvent('show-chat-bubble', {
      detail: { guineaPigId: gp1.id, reaction: reaction1 },
      bubbles: true
    }))

    // Wait before showing gp2's bubble
    await delay(1500)

    // Show gp2's bubble
    const reaction2 = tierMessages[Math.floor(Math.random() * tierMessages.length)]
    document.dispatchEvent(new CustomEvent('show-chat-bubble', {
      detail: { guineaPigId: gp2.id, reaction: reaction2 },
      bubbles: true
    }))

    // Wait for play duration
    await delay(3500)

    // Return to idle state
    behaviorStateStore.updateBehaviorState(gp1.id, { currentActivity: 'idle' })
    behaviorStateStore.updateBehaviorState(gp2.id, { currentActivity: 'idle' })

    // Satisfy needs - use 'play' instead of 'happiness'
    guineaPigStore.satisfyNeed(gp1.id, 'play', 25)
    guineaPigStore.satisfyNeed(gp2.id, 'play', 25)
    guineaPigStore.satisfyNeed(gp1.id, 'social', 20)
    guineaPigStore.satisfyNeed(gp2.id, 'social', 20)

    // Increase bonding
    guineaPigStore.increaseBonding(
      bond.id,
      4,
      'interaction',
      `${gp1.name} and ${gp2.name} play together`
    )

    // Activity feed message
    loggingStore.addPlayerAction(
      `${gp1.name} and ${gp2.name} play together happily! ✨`,
      '🎮'
    )

    return true
  }

  /**
   * 4. Share Food
   * Guinea pigs eat together side by side
   */
  async function shareFood(
    gp1: GuineaPig,
    gp2: GuineaPig,
    bond: ActiveBond,
    foodItemId?: string
  ): Promise<boolean> {
    // Find food bowl or hay rack position
    let foodPos: { x: number; y: number } | null = null

    if (foodItemId) {
      // Use specific food item
      foodPos = habitatConditions.itemPositions.get(foodItemId) || null
    } else {
      // Find nearest food source (bowl or hay rack)
      const foodItems = habitatConditions.habitatItems.filter(id =>
        id.includes('bowl') || id.includes('hay_rack')
      )
      if (foodItems.length > 0) {
        foodPos = habitatConditions.itemPositions.get(foodItems[0]) || null
      }
    }

    if (!foodPos) {
      // No food available
      return false
    }

    // Both move to food (in parallel)
    await Promise.all([
      moveToPosition(gp1.id, { x: foodPos.x, y: foodPos.y }),
      moveToPosition(gp2.id, { x: foodPos.x + 1, y: foodPos.y })
    ])

    // Activity feed message (show immediately)
    loggingStore.addPlayerAction(
      `${gp1.name} and ${gp2.name} munch happily side by side 🥬`,
      '🍽️'
    )

    // Show chat bubbles (STAGGERED)
    const { guineaPigMessages } = await import('../../data/guineaPigMessages')
    const tierMessages = guineaPigMessages.autonomous.social[bond.bondingTier]

    // Show gp1's bubble first
    const reaction1 = tierMessages[Math.floor(Math.random() * tierMessages.length)]
    document.dispatchEvent(new CustomEvent('show-chat-bubble', {
      detail: { guineaPigId: gp1.id, reaction: reaction1 },
      bubbles: true
    }))

    // Wait before showing gp2's bubble
    await delay(1500)

    // Show gp2's bubble
    const reaction2 = tierMessages[Math.floor(Math.random() * tierMessages.length)]
    document.dispatchEvent(new CustomEvent('show-chat-bubble', {
      detail: { guineaPigId: gp2.id, reaction: reaction2 },
      bubbles: true
    }))

    // Record eating activity
    habitatConditions.recordGuineaPigActivity('eating')

    // Wait for eating duration
    await delay(3000)

    // Satisfy needs (less hunger satisfaction than solo eating, but social bonus)
    guineaPigStore.satisfyNeed(gp1.id, 'hunger', 15)
    guineaPigStore.satisfyNeed(gp2.id, 'hunger', 15)
    guineaPigStore.satisfyNeed(gp1.id, 'social', 15)
    guineaPigStore.satisfyNeed(gp2.id, 'social', 15)

    // Increase bonding
    guineaPigStore.increaseBonding(
      bond.id,
      3,
      'shared_experience',
      `${gp1.name} and ${gp2.name} share a meal`
    )

    return true
  }

  /**
   * 5. Sleep Together
   * Guinea pigs rest together in the same shelter/bed, triggering autonomous sleep bonding
   */
  async function sleepTogether(
    gp1: GuineaPig,
    gp2: GuineaPig,
    bond: ActiveBond
  ): Promise<boolean> {
    // Activity feed message (show immediately)
    loggingStore.addPlayerAction(
      `${gp1.name} and ${gp2.name} settle in together for a nap 😴`,
      '💤'
    )

    // Find shelter or comfortable spot
    const shelters = habitatConditions.habitatItems.filter(id =>
      id.includes('hideaway') || id.includes('tunnel') || id.includes('house')
    )

    let sleepPos: { x: number; y: number }
    let shelterItemId: string | undefined

    if (shelters.length > 0) {
      // Use shelter
      shelterItemId = shelters[0]
      const shelterPos = habitatConditions.itemPositions.get(shelters[0])
      if (shelterPos) {
        sleepPos = shelterPos
      } else {
        // Default to current position of gp1
        const pos1 = habitatConditions.getGuineaPigPosition(gp1.id)
        if (!pos1) return false
        sleepPos = pos1
      }
    } else {
      // No shelter, sleep in open area
      const pos1 = habitatConditions.getGuineaPigPosition(gp1.id)
      if (!pos1) return false
      sleepPos = pos1
    }

    // Both move to the EXACT SAME position (so bonding check detects them together)
    await Promise.all([
      moveToPosition(gp1.id, sleepPos),
      moveToPosition(gp2.id, sleepPos)
    ])

    // Set both to 'sleeping' state with extended duration
    // This allows the autonomous sleep bonding check to run
    const sleepDuration = 8000 // 8 seconds to ensure bonding check triggers
    behaviorStateStore.updateBehaviorState(gp1.id, {
      currentActivity: 'sleeping',
      activityStartTime: Date.now()
    })
    behaviorStateStore.updateBehaviorState(gp2.id, {
      currentActivity: 'sleeping',
      activityStartTime: Date.now()
    })

    // Show chat bubbles (STAGGERED)
    const { guineaPigMessages } = await import('../../data/guineaPigMessages')
    const tierMessages = guineaPigMessages.autonomous.social[bond.bondingTier]

    // Show gp1's bubble first
    const reaction1 = tierMessages[Math.floor(Math.random() * tierMessages.length)]
    document.dispatchEvent(new CustomEvent('show-chat-bubble', {
      detail: { guineaPigId: gp1.id, reaction: reaction1 },
      bubbles: true
    }))

    // Wait before showing gp2's bubble
    await delay(1500)

    // Show gp2's bubble
    const reaction2 = tierMessages[Math.floor(Math.random() * tierMessages.length)]
    document.dispatchEvent(new CustomEvent('show-chat-bubble', {
      detail: { guineaPigId: gp2.id, reaction: reaction2 },
      bubbles: true
    }))

    // Record activity (use 'movement' since 'sleeping' is not a valid activity type for recording)
    habitatConditions.recordGuineaPigActivity('movement')

    // Wait for sleep duration
    await delay(sleepDuration)

    // Return to idle state
    behaviorStateStore.updateBehaviorState(gp1.id, { currentActivity: 'idle' })
    behaviorStateStore.updateBehaviorState(gp2.id, { currentActivity: 'idle' })

    // Satisfy needs
    guineaPigStore.satisfyNeed(gp1.id, 'energy', 30)
    guineaPigStore.satisfyNeed(gp2.id, 'energy', 30)
    guineaPigStore.satisfyNeed(gp1.id, 'social', 15)
    guineaPigStore.satisfyNeed(gp2.id, 'social', 15)
    guineaPigStore.satisfyNeed(gp1.id, 'comfort', 20)
    guineaPigStore.satisfyNeed(gp2.id, 'comfort', 20)

    // Sleeping together bonding (mimics autonomous sleep bonding behavior)
    const cuddleMsg = `${gp1.name} and ${gp2.name} cuddle together${shelterItemId ? ' in the ' + shelterItemId.split('_')[0] : ''} 💕`
    loggingStore.addAutonomousBehavior(cuddleMsg, '💤')

    guineaPigStore.increaseBonding(
      bond.id,
      2, // Same as autonomous sleep bonding
      'interaction',
      `${gp1.name} and ${gp2.name} cuddled together while sleeping`
    )

    return true
  }

  /**
   * 6. Explore Together
   * Guinea pigs move around the habitat together
   */
  async function exploreTogether(
    gp1: GuineaPig,
    gp2: GuineaPig,
    bond: ActiveBond
  ): Promise<boolean> {
    // Activity feed message (show immediately)
    loggingStore.addPlayerAction(
      `${gp1.name} and ${gp2.name} explore the habitat together 🔍`,
      '🐹'
    )

    // Pick random destination in habitat (using medium habitat size as default)
    // TODO: Get actual habitat size from settings when available
    const gridWidth = 14
    const gridHeight = 10

    const targetX = Math.floor(Math.random() * gridWidth)
    const targetY = Math.floor(Math.random() * gridHeight)

    // Both move to destination (in parallel, side by side)
    await Promise.all([
      moveToPosition(gp1.id, { x: targetX, y: targetY }),
      moveToPosition(gp2.id, { x: Math.min(targetX + 1, gridWidth - 1), y: targetY })
    ])

    // Show chat bubbles (STAGGERED)
    const { guineaPigMessages } = await import('../../data/guineaPigMessages')
    const tierMessages = guineaPigMessages.autonomous.social[bond.bondingTier]

    // Show gp1's bubble first
    const reaction1 = tierMessages[Math.floor(Math.random() * tierMessages.length)]
    document.dispatchEvent(new CustomEvent('show-chat-bubble', {
      detail: { guineaPigId: gp1.id, reaction: reaction1 },
      bubbles: true
    }))

    // Wait before showing gp2's bubble
    await delay(1500)

    // Show gp2's bubble
    const reaction2 = tierMessages[Math.floor(Math.random() * tierMessages.length)]
    document.dispatchEvent(new CustomEvent('show-chat-bubble', {
      detail: { guineaPigId: gp2.id, reaction: reaction2 },
      bubbles: true
    }))

    // Record activity
    habitatConditions.recordGuineaPigActivity('movement')

    // Small pause for exploration
    await delay(500)

    // Satisfy needs
    guineaPigStore.satisfyNeed(gp1.id, 'social', 10)
    guineaPigStore.satisfyNeed(gp2.id, 'social', 10)
    guineaPigStore.satisfyNeed(gp1.id, 'play', 10)
    guineaPigStore.satisfyNeed(gp2.id, 'play', 10)

    // Increase bonding
    guineaPigStore.increaseBonding(
      bond.id,
      2,
      'shared_experience',
      `${gp1.name} and ${gp2.name} explore together`
    )

    return true
  }

  /**
   * 7. Greet Companion
   * Brief friendly acknowledgment between guinea pigs
   * Trigger: After separation or first meeting
   * Bonding: All tiers
   * Animation: Initiator approaches, both wiggle, staggered chat bubbles
   */
  async function greetCompanion(
    gp1: GuineaPig,
    gp2: GuineaPig,
    bond: ActiveBond
  ): Promise<boolean> {
    // Activity message (show immediately)
    loggingStore.addPlayerAction(
      `${gp1.name} and ${gp2.name} greet each other with a friendly sniff 👃`,
      '🐹'
    )

    // Approach if not near
    if (!areGuineaPigsNear(gp1.id, gp2.id, 1.5)) {
      await approachCompanion(gp1, gp2, bond)
    }

    // Initiator wiggles first
    behaviorStateStore.triggerPlayerInteraction(gp1.id, 1500)

    // Show chat bubbles for both guinea pigs (STAGGERED)
    const { guineaPigMessages } = await import('../../data/guineaPigMessages')
    const tierMessages = guineaPigMessages.autonomous.social[bond.bondingTier]

    // Show bubble for initiator (gp1) first
    const reaction1 = tierMessages[Math.floor(Math.random() * tierMessages.length)]
    document.dispatchEvent(new CustomEvent('show-chat-bubble', {
      detail: { guineaPigId: gp1.id, reaction: reaction1 },
      bubbles: true
    }))

    // Wait before partner responds
    await delay(1500)

    // Partner wiggles back
    behaviorStateStore.triggerPlayerInteraction(gp2.id, 1500)

    // Show bubble for partner (gp2) after delay
    const reaction2 = tierMessages[Math.floor(Math.random() * tierMessages.length)]
    document.dispatchEvent(new CustomEvent('show-chat-bubble', {
      detail: { guineaPigId: gp2.id, reaction: reaction2 },
      bubbles: true
    }))

    // Wait for interaction to complete
    await delay(1000)

    // Small social satisfaction
    guineaPigStore.satisfyNeed(gp1.id, 'social', 5)
    guineaPigStore.satisfyNeed(gp2.id, 'social', 5)

    // Small bonding increase
    guineaPigStore.increaseBonding(
      bond.id,
      1,
      'interaction',
      `${gp1.name} greets ${gp2.name}`
    )

    return true
  }

  /**
   * 8. Inspect Companion
   * Curiosity-based investigation of another guinea pig
   * Requires: Curiosity ≥ 5
   * Bonding: All tiers (more frequent in Neutral/Friends)
   */
  async function inspectCompanion(
    inspector: GuineaPig,
    partner: GuineaPig,
    bond: ActiveBond
  ): Promise<boolean> {
    // Personality check: Requires curiosity ≥ 5
    if (inspector.personality.curiosity < 5) {
      return false
    }

    // Activity feed message (show immediately)
    loggingStore.addPlayerAction(
      `${inspector.name} curiously inspects ${partner.name} 🔍`,
      '🐹'
    )

    // Approach if not near
    if (!areGuineaPigsNear(inspector.id, partner.id, 1.5)) {
      await approachCompanion(inspector, partner, bond)
    }

    // Inspector wiggles first
    behaviorStateStore.triggerPlayerInteraction(inspector.id, 1500)

    // Show chat bubbles (STAGGERED)
    const { guineaPigMessages } = await import('../../data/guineaPigMessages')
    const tierMessages = guineaPigMessages.autonomous.social[bond.bondingTier]

    // Show inspector's bubble first
    const reaction1 = tierMessages[Math.floor(Math.random() * tierMessages.length)]
    document.dispatchEvent(new CustomEvent('show-chat-bubble', {
      detail: { guineaPigId: inspector.id, reaction: reaction1 },
      bubbles: true
    }))

    // Wait before showing partner's bubble
    await delay(1500)

    // Partner wiggles back
    behaviorStateStore.triggerPlayerInteraction(partner.id, 1500)

    // Show partner's bubble
    const reaction2 = tierMessages[Math.floor(Math.random() * tierMessages.length)]
    document.dispatchEvent(new CustomEvent('show-chat-bubble', {
      detail: { guineaPigId: partner.id, reaction: reaction2 },
      bubbles: true
    }))

    // Record activity
    habitatConditions.recordGuineaPigActivity('movement')

    // Wait for inspection duration
    await delay(1500)

    // Satisfy needs (inspector gets more satisfaction from curiosity)
    guineaPigStore.satisfyNeed(inspector.id, 'social', 10)
    guineaPigStore.satisfyNeed(partner.id, 'social', 5)

    // Increase bonding
    guineaPigStore.increaseBonding(
      bond.id,
      2,
      'interaction',
      `${inspector.name} inspects ${partner.name}`
    )

    return true
  }

  /**
   * 9. Follow Companion
   * One guinea pig follows the other's movement
   * Requires: Friends (31%+) or Bonded (71%+) tier
   * Personality: Friendliness ≥ 6 for Friends tier (Bonded always eligible)
   */
  async function followCompanion(
    follower: GuineaPig,
    leader: GuineaPig,
    bond: ActiveBond
  ): Promise<boolean> {
    // Bonding requirement: Friends or Bonded
    if (bond.bondingTier === 'neutral') {
      return false
    }

    // Personality check for Friends tier (Bonded always eligible)
    if (bond.bondingTier === 'friends' && follower.personality.friendliness < 6) {
      return false
    }

    // Activity message (show immediately)
    loggingStore.addPlayerAction(
      `${follower.name} follows ${leader.name} around the habitat`,
      '🐹'
    )

    const leaderPos = habitatConditions.getGuineaPigPosition(leader.id)
    if (!leaderPos) return false

    // Move to position near leader (1-2 cells away, side by side)
    const followDistance = bond.bondingTier === 'bonded' ? 1 : 2
    const targetPos = {
      x: leaderPos.x + followDistance,
      y: leaderPos.y
    }

    const success = await moveToPosition(follower.id, targetPos)
    if (!success) return false

    // Show chat bubbles (STAGGERED)
    const { guineaPigMessages } = await import('../../data/guineaPigMessages')
    const tierMessages = guineaPigMessages.autonomous.social[bond.bondingTier]

    // Show follower's bubble first
    const reaction1 = tierMessages[Math.floor(Math.random() * tierMessages.length)]
    document.dispatchEvent(new CustomEvent('show-chat-bubble', {
      detail: { guineaPigId: follower.id, reaction: reaction1 },
      bubbles: true
    }))

    // Wait before showing leader's bubble
    await delay(1500)

    // Show leader's bubble
    const reaction2 = tierMessages[Math.floor(Math.random() * tierMessages.length)]
    document.dispatchEvent(new CustomEvent('show-chat-bubble', {
      detail: { guineaPigId: leader.id, reaction: reaction2 },
      bubbles: true
    }))

    // Small social satisfaction
    guineaPigStore.satisfyNeed(follower.id, 'social', 3)
    guineaPigStore.satisfyNeed(leader.id, 'social', 2)

    // Small bonding increase
    guineaPigStore.increaseBonding(
      bond.id,
      1,
      'proximity',
      `${follower.name} follows ${leader.name}`
    )

    return true
  }

  /**
   * 10. Kick Companion
   * Dominant/territorial behavior (negative interaction)
   * Only occurs in Neutral tier (0-30%) with specific personalities
   * Requires: Boldness ≥ 8 OR Friendliness ≤ 3
   */
  async function kickCompanion(
    aggressor: GuineaPig,
    target: GuineaPig,
    bond: ActiveBond
  ): Promise<boolean> {
    // ONLY happens in Neutral tier (0-30%)
    if (bond.bondingTier !== 'neutral') {
      return false
    }

    // Personality requirements
    const isBold = aggressor.personality.boldness >= 8
    const isUnfriendly = aggressor.personality.friendliness <= 3

    // Must meet at least one personality condition
    if (!isBold && !isUnfriendly) {
      return false
    }

    // Calculate kick probability
    let kickChance = 0
    if (isBold && isUnfriendly) {
      kickChance = 0.15 // 15% chance
    } else if (isBold) {
      kickChance = 0.08 // 8% chance
    } else if (isUnfriendly) {
      kickChance = 0.05 // 5% chance
    }

    // Roll for kick
    if (Math.random() > kickChance) {
      return false
    }

    // Approach if not near
    if (!areGuineaPigsNear(aggressor.id, target.id, 1.5)) {
      await approachCompanion(aggressor, target, bond)
    }

    // Brief kick action
    await delay(1000)

    // NEGATIVE bonding decrease
    const bondingPenalty = isBold && isUnfriendly ? -5 : -3
    guineaPigStore.increaseBonding(
      bond.id,
      bondingPenalty, // Negative value
      'interaction',
      `${aggressor.name} kicks ${target.name} (territorial)`
    )

    // Small stress increase for target (reduce comfort)
    guineaPigStore.adjustNeed(target.id, 'comfort', -10)

    // Activity feed message (always show - important player feedback)
    loggingStore.addPlayerAction(
      `${aggressor.name} gives ${target.name} a warning kick! They need more time to bond 😬`,
      '⚠️'
    )

    return true
  }

  return {
    // Proximity helpers
    areGuineaPigsNear,
    getMidpoint,

    // 9 Social behaviors (6 original + 3 new)
    approachCompanion,
    groomPartner,
    playTogether,
    shareFood,
    sleepTogether,
    exploreTogether, // Still available for autonomous AI, not player-triggerable
    greetCompanion,
    inspectCompanion,
    followCompanion,
    kickCompanion
  }
}
