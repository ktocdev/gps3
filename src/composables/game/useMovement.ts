/**
 * System 18: Pathfinding & Movement
 * Movement controller for guinea pigs
 */

import { ref, computed } from 'vue'
import { useHabitatConditions } from '../../stores/habitatConditions'
import { useGuineaPigStore } from '../../stores/guineaPigStore'
import { useGameController } from '../../stores/gameController'
import { usePathfinding, type GridPosition } from './usePathfinding'

export type MovementState = 'idle' | 'walking' | 'arrived' | 'blocked'

interface MovementController {
  currentPath: GridPosition[]
  currentStep: number
  movementState: MovementState
  targetPosition: GridPosition | null
  movementSpeed: number
  facingDirection: 'left' | 'right'
}

export function useMovement(guineaPigId: string) {
  const habitatConditions = useHabitatConditions()
  const guineaPigStore = useGuineaPigStore()
  const gameController = useGameController()
  const pathfinding = usePathfinding()

  const controller = ref<MovementController>({
    currentPath: [],
    currentStep: 0,
    movementState: 'idle',
    targetPosition: null,
    movementSpeed: 2, // cells per second (base speed)
    facingDirection: 'right'
  })

  const isMoving = computed(() => controller.value.movementState === 'walking')
  const currentPosition = computed(() => {
    const positions = habitatConditions.guineaPigPositions
    const pos = positions.get(guineaPigId)
    if (!pos) {
      console.warn(`[useMovement] No position found for guinea pig ${guineaPigId}`)
      console.log('[useMovement] Available positions:', Array.from(positions.keys()))
      return { row: 0, col: 0 }
    }
    return { row: pos.y, col: pos.x }
  })

  // Arrival callbacks
  const arrivalCallbacks: Array<() => void> = []

  /**
   * Calculate movement speed based on guinea pig personality
   */
  function calculateMovementSpeed(): number {
    const guineaPig = guineaPigStore.getGuineaPig(guineaPigId)
    if (!guineaPig) return 2

    const baseSpeed = 2 // cells per second
    const curiosityBonus = (guineaPig.personality.curiosity / 10) * 0.5
    return baseSpeed + curiosityBonus
  }

  /**
   * Start movement along a path
   */
  function startMovement(path: GridPosition[]): void {
    if (path.length === 0) {
      console.warn(`[Movement] Empty path for guinea pig ${guineaPigId}`)
      controller.value.movementState = 'blocked'
      return
    }

    // Filter out current position if it's the first step
    const currentPos = currentPosition.value
    let startIndex = 0
    if (path[0].row === currentPos.row && path[0].col === currentPos.col) {
      startIndex = 1
    }

    controller.value.currentPath = path.slice(startIndex)
    controller.value.currentStep = 0
    controller.value.movementState = 'walking'
    controller.value.movementSpeed = calculateMovementSpeed()

    if (controller.value.currentPath.length > 0) {
      controller.value.targetPosition = controller.value.currentPath[0]
      moveToNextStep()
    } else {
      // Already at destination
      controller.value.movementState = 'arrived'
      triggerArrivalCallbacks()
    }
  }

  /**
   * Move to the next step in the path
   */
  function moveToNextStep(): void {
    if (controller.value.currentStep >= controller.value.currentPath.length) {
      // Reached end of path
      controller.value.movementState = 'arrived'
      controller.value.targetPosition = null
      triggerArrivalCallbacks()
      return
    }

    const nextPos = controller.value.currentPath[controller.value.currentStep]
    const currentPos = currentPosition.value

    // Update facing direction
    if (nextPos.col < currentPos.col) {
      controller.value.facingDirection = 'left'
    } else if (nextPos.col > currentPos.col) {
      controller.value.facingDirection = 'right'
    }

    // Check if another guinea pig is already at this position for offset calculation
    let offsetX = 0
    let offsetY = 0

    for (const [otherId, otherPos] of habitatConditions.guineaPigPositions.entries()) {
      if (otherId !== guineaPigId && otherPos.x === nextPos.col && otherPos.y === nextPos.row) {
        // Another guinea pig is at this position - apply offset for visual separation
        offsetX = 12
        offsetY = 8
        break
      }
    }

    // Update position in store with offset and facing direction
    habitatConditions.guineaPigPositions.set(guineaPigId, {
      x: nextPos.col,
      y: nextPos.row,
      lastMoved: Date.now(),
      isMoving: true,
      facingDirection: controller.value.facingDirection,
      offsetX,
      offsetY
    })

    // Calculate time to reach next cell based on speed
    const timeToMove = 1000 / controller.value.movementSpeed // milliseconds

    // Schedule next step
    setTimeout(() => {
      // Only continue movement if game is active (not paused) and still walking
      if (gameController.isGameActive && controller.value.movementState === 'walking') {
        controller.value.currentStep++
        moveToNextStep()
      }
      // If game is paused, movement will resume when game resumes (moveToNextStep will be called again)
    }, timeToMove)
  }

  /**
   * Stop current movement
   */
  function stopMovement(): void {
    controller.value.movementState = 'idle'
    controller.value.currentPath = []
    controller.value.currentStep = 0
    controller.value.targetPosition = null

    // Update position state
    const pos = habitatConditions.guineaPigPositions.get(guineaPigId)
    if (pos) {
      habitatConditions.guineaPigPositions.set(guineaPigId, {
        ...pos,
        isMoving: false
      })
    }
  }

  /**
   * Resume movement after pause (if was walking)
   */
  function resumeMovement(): void {
    if (controller.value.movementState === 'walking' && controller.value.currentPath.length > 0) {
      // Resume from current step
      moveToNextStep()
    }
  }

  /**
   * Register callback for arrival
   */
  function onArrival(callback: () => void): void {
    arrivalCallbacks.push(callback)
  }

  /**
   * Trigger all arrival callbacks
   */
  function triggerArrivalCallbacks(): void {
    // Mark as not moving
    const pos = habitatConditions.guineaPigPositions.get(guineaPigId)
    if (pos) {
      habitatConditions.guineaPigPositions.set(guineaPigId, {
        ...pos,
        isMoving: false
      })
    }

    // Execute callbacks
    arrivalCallbacks.forEach(callback => callback())
    arrivalCallbacks.length = 0 // Clear callbacks
  }

  /**
   * Move guinea pig to a specific destination
   */
  function moveTo(destination: GridPosition, options: { avoidOccupiedCells?: boolean } = {}): boolean {
    const start = currentPosition.value
    const result = pathfinding.findPath({
      start,
      goal: destination,
      avoidOccupiedCells: options.avoidOccupiedCells ?? false
    })

    if (result.success) {
      startMovement(result.path)
      return true
    } else {
      console.warn(`[Movement] No path found from (${start.row},${start.col}) to (${destination.row},${destination.col})`)
      controller.value.movementState = 'blocked'
      return false
    }
  }

  /**
   * Random wander to a nearby location
   */
  function wander(options: { maxDistance?: number; avoidRecent?: GridPosition[] } = {}): boolean {
    const { maxDistance = 5, avoidRecent = [] } = options
    const start = currentPosition.value
    const guineaPig = guineaPigStore.getGuineaPig(guineaPigId)

    // Adjust max distance based on curiosity
    let adjustedMaxDistance = maxDistance
    if (guineaPig) {
      const curiosity = guineaPig.personality.curiosity
      if (curiosity >= 7) {
        adjustedMaxDistance = maxDistance + 2 // High curiosity: wander farther
      } else if (curiosity <= 3) {
        adjustedMaxDistance = Math.max(2, maxDistance - 2) // Low curiosity: wander less
      }
    }

    // Try to find a valid random destination
    const maxAttempts = 10
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // Random direction and distance
      const distance = Math.floor(Math.random() * adjustedMaxDistance) + 1
      const angle = Math.random() * 2 * Math.PI
      const deltaRow = Math.round(Math.sin(angle) * distance)
      const deltaCol = Math.round(Math.cos(angle) * distance)

      const destination: GridPosition = {
        row: start.row + deltaRow,
        col: start.col + deltaCol
      }

      // Check if in bounds and not recently visited (pathfinding will handle blocked cells)
      if (!pathfinding.isInBounds(destination)) continue

      const isRecent = avoidRecent.some(pos =>
        pos.row === destination.row && pos.col === destination.col
      )
      if (isRecent) continue

      // Try to move there
      if (moveTo(destination, { avoidOccupiedCells: true })) {
        return true
      }
    }

    // Could not find a valid wander destination
    console.warn(`[Movement] Could not find wander destination for guinea pig ${guineaPigId}`)
    return false
  }

  return {
    controller,
    isMoving,
    currentPosition,
    startMovement,
    stopMovement,
    resumeMovement,
    moveTo,
    wander,
    onArrival
  }
}
