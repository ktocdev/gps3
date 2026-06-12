/**
 * 3D Social Actions Composable
 * Handles animated social interactions between guinea pigs in 3D
 *
 * Bridges useSocialBehaviors game logic with use3DMovement animation system
 */

import { ref } from 'vue'
import { useMovement3DStore } from '../../stores/movement3DStore'
import { useLoggingStore } from '../../stores/loggingStore'
import { use3DMovement } from './use3DMovement'
import type { Vector3D } from '../../types/movement3d'
import type { use3DBehavior } from './use3DBehavior'

// Social action states
export type SocialActionState = 'idle' | 'approaching' | 'waiting' | 'interacting' | 'complete'

// Offset distance when approaching (units from partner)
const APPROACH_OFFSET = 3.0
// Duration to face each other after arrival (ms)
const FACING_DURATION = 4000

export function use3DSocialActions() {
  const movement3DStore = useMovement3DStore()
  const loggingStore = useLoggingStore()

  // Current action state
  const actionState = ref<SocialActionState>('idle')

  // Movement controllers (created per-action)
  let initiatorMovement: ReturnType<typeof use3DMovement> | null = null
  let partnerMovement: ReturnType<typeof use3DMovement> | null = null

  // Behavior controllers to pause/resume
  let initiatorBehavior: ReturnType<typeof use3DBehavior> | null = null
  let partnerBehavior: ReturnType<typeof use3DBehavior> | null = null

  /**
   * Calculate position in front of partner for approach
   */
  function getApproachTarget(initiatorPos: Vector3D, partnerPos: Vector3D): Vector3D {
    // Calculate direction from initiator to partner
    const dx = partnerPos.x - initiatorPos.x
    const dz = partnerPos.z - initiatorPos.z
    const distance = Math.sqrt(dx * dx + dz * dz)

    // Normalize and calculate offset position
    if (distance < 0.1) {
      // Already very close, offset to the side
      return {
        x: partnerPos.x + APPROACH_OFFSET,
        y: 0,
        z: partnerPos.z
      }
    }

    // Position APPROACH_OFFSET units away from partner, on the line from initiator to partner
    const ratio = (distance - APPROACH_OFFSET) / distance
    return {
      x: initiatorPos.x + dx * ratio,
      y: 0,
      z: initiatorPos.z + dz * ratio
    }
  }

  /**
   * Calculate rotation to face a target position
   */
  function calculateFacingRotation(from: Vector3D, to: Vector3D): number {
    const dx = to.x - from.x
    const dz = to.z - from.z
    return Math.atan2(dx, dz)
  }

  /**
   * Delay helper
   */
  function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Execute the "Approach Companion" social action with 3D animation
   *
   * Sequence:
   * 1. Partner stops current behavior and waits
   * 2. Initiator walks to partner
   * 3. Both face each other for a few seconds
   * 4. Action complete, behaviors resume
   */
  async function executeApproach(
    initiatorId: string,
    partnerId: string,
    initiatorName: string,
    partnerName: string,
    behaviorControllers?: {
      initiator: ReturnType<typeof use3DBehavior>
      partner: ReturnType<typeof use3DBehavior>
    }
  ): Promise<boolean> {
    // Get both guinea pig states
    const initiatorState = movement3DStore.getGuineaPigState(initiatorId)
    const partnerState = movement3DStore.getGuineaPigState(partnerId)

    if (!initiatorState || !partnerState) {
      console.warn('[3DSocialActions] Cannot execute approach: missing guinea pig state')
      return false
    }

    // Store behavior controllers for pausing/resuming
    if (behaviorControllers) {
      initiatorBehavior = behaviorControllers.initiator
      partnerBehavior = behaviorControllers.partner
    }

    // Create movement controllers
    initiatorMovement = use3DMovement(initiatorId)
    partnerMovement = use3DMovement(partnerId)

    try {
      actionState.value = 'approaching'

      // Step 1: Pause partner's behavior and stop movement (partner waits)
      if (partnerBehavior) {
        partnerBehavior.pause()
      }
      partnerMovement.stopMovement()

      console.log(`[3DSocialActions] ${initiatorName} approaching ${partnerName}`)

      // Step 2: Calculate approach target and move initiator
      const approachTarget = getApproachTarget(
        initiatorState.worldPosition,
        partnerState.worldPosition
      )

      // Pause initiator's autonomous behavior during social action
      if (initiatorBehavior) {
        initiatorBehavior.pause()
      }

      // Move initiator to approach target
      const moveSuccess = initiatorMovement.moveTo(approachTarget)
      if (!moveSuccess) {
        console.warn('[3DSocialActions] Failed to find path for approach')
        cleanup()
        return false
      }

      // Wait for arrival
      await new Promise<void>(resolve => {
        initiatorMovement!.onArrival(() => resolve())
      })

      // Step 3: Both face each other
      actionState.value = 'interacting'
      console.log(`[3DSocialActions] ${initiatorName} arrived, both facing each other`)

      // Get updated positions after movement
      const finalInitiatorPos = initiatorState.worldPosition
      const finalPartnerPos = partnerState.worldPosition

      // Calculate facing rotations
      const initiatorRotation = calculateFacingRotation(finalInitiatorPos, finalPartnerPos)
      const partnerRotation = calculateFacingRotation(finalPartnerPos, finalInitiatorPos)

      // Rotate both to face each other (in parallel)
      await Promise.all([
        initiatorMovement.rotateTo(initiatorRotation, 400),
        partnerMovement.rotateTo(partnerRotation, 400)
      ])

      // Hold facing for a moment
      await delay(FACING_DURATION)

      // Step 4: Complete
      actionState.value = 'complete'
      console.log(`[3DSocialActions] Approach complete: ${initiatorName} and ${partnerName}`)

      // Log activity
      loggingStore.addAutonomousBehavior(
        `${initiatorName} approached ${partnerName}`,
        '🚶',
        { guineaPigId: initiatorId, behavior: 'social_approach' }
      )

      cleanup()
      return true

    } catch (error) {
      console.error('[3DSocialActions] Approach failed:', error)
      cleanup()
      return false
    }
  }

  /**
   * Cleanup after social action
   */
  function cleanup(): void {
    actionState.value = 'idle'

    // Resume behaviors
    if (initiatorBehavior) {
      initiatorBehavior.resume()
      initiatorBehavior = null
    }
    if (partnerBehavior) {
      partnerBehavior.resume()
      partnerBehavior = null
    }

    // Cleanup movement controllers
    if (initiatorMovement) {
      initiatorMovement.cleanup()
      initiatorMovement = null
    }
    if (partnerMovement) {
      partnerMovement.cleanup()
      partnerMovement = null
    }
  }

  /**
   * Cancel any ongoing social action
   */
  function cancel(): void {
    if (actionState.value !== 'idle') {
      console.log('[3DSocialActions] Cancelling social action')
      cleanup()
    }
  }

  /**
   * Check if a social action is in progress
   */
  function isActionInProgress(): boolean {
    return actionState.value !== 'idle' && actionState.value !== 'complete'
  }

  return {
    actionState,
    executeApproach,
    cancel,
    isActionInProgress
  }
}
