/**
 * System 18: Pathfinding & Movement
 * A* pathfinding for guinea pig navigation
 */

import { useHabitatConditions } from '../../stores/habitatConditions'

export interface GridPosition {
  row: number
  col: number
}

export interface PathfindingOptions {
  start: GridPosition
  goal: GridPosition
  avoidOccupiedCells?: boolean
  maxPathLength?: number
}

export interface PathfindingResult {
  path: GridPosition[]
  distance: number
  success: boolean
}

interface PathNode {
  position: GridPosition
  g: number // Cost from start to this node
  h: number // Heuristic cost from this node to goal
  f: number // Total cost (g + h)
  parent: PathNode | null
}

export function usePathfinding() {
  const habitatConditions = useHabitatConditions()

  // Grid dimensions (medium habitat default)
  const GRID_WIDTH = 14
  const GRID_HEIGHT = 10

  /**
   * Get item size in grid cells based on item ID
   * More reliable than using stats which might not be set correctly
   */
  function getItemSize(itemId: string): { width: number; height: number } {
    const idLower = itemId.toLowerCase()

    // Large items (2x2)
    if (idLower.includes('igloo') || idLower.includes('shelter')) {
      return { width: 2, height: 2 }
    }

    // Medium items (3x1 for tunnel)
    if (idLower.includes('tunnel')) {
      return { width: 3, height: 1 }
    }

    // Medium items (2x1)
    if (idLower.includes('bed') || idLower.includes('hideout')) {
      return { width: 2, height: 1 }
    }

    // Small items (1x1) - bowls, water bottles, toys, etc.
    return { width: 1, height: 1 }
  }

  /**
   * Check if item blocks movement based on item ID
   * Most items block movement except water bottles (wall-mounted) and shelters
   */
  function itemBlocksMovement(itemId: string): boolean {
    const idLower = itemId.toLowerCase()

    // Water bottles are wall-mounted and don't block movement
    if (idLower.includes('water') && idLower.includes('bottle')) {
      return false
    }

    // Shelters don't block movement - guinea pigs can be inside them
    // NOTE: This allows walking through shelters for now
    // TODO: Implement proper entrance-only access in Phase 3.2
    if (idLower.includes('igloo') || idLower.includes('shelter') || idLower.includes('tunnel')) {
      return false
    }

    // Everything else blocks movement by default
    return true
  }

  /**
   * Check if a position is a shelter entrance/exit cell
   * Shelters have designated openings guinea pigs can use
   */
  function isShelterEntrance(pos: GridPosition, itemId: string, itemPosition: { x: number; y: number }): boolean {
    const idLower = itemId.toLowerCase()

    if (idLower.includes('igloo') || idLower.includes('shelter')) {
      // Igloos: 2x2 item with front entrance (south side, middle column)
      // Entrance is the cell directly in front (south) of the igloo
      const entranceRow = itemPosition.y + 2
      const entranceCol = itemPosition.x
      return pos.row === entranceRow && pos.col === entranceCol
    }

    if (idLower.includes('tunnel')) {
      // Tunnels: 3x1 item with two openings (west and east sides)
      const tunnelRow = itemPosition.y
      // West entrance (one cell before tunnel starts)
      const westEntranceCol = itemPosition.x - 1
      // East entrance (one cell after tunnel ends)
      const eastEntranceCol = itemPosition.x + 3

      return pos.row === tunnelRow && (pos.col === westEntranceCol || pos.col === eastEntranceCol)
    }

    return false
  }

  /**
   * Check if a position is inside a shelter
   * Guinea pigs can be inside shelters, they just can't walk through the walls
   */
  function isInsideShelter(pos: GridPosition, itemId: string, itemPosition: { x: number; y: number }): boolean {
    const { width, height } = getItemSize(itemId)

    const isWithinX = pos.col >= itemPosition.x && pos.col < itemPosition.x + width
    const isWithinY = pos.row >= itemPosition.y && pos.row < itemPosition.y + height

    return isWithinX && isWithinY
  }

  /**
   * Calculate Manhattan distance heuristic
   */
  function manhattanDistance(a: GridPosition, b: GridPosition): number {
    return Math.abs(a.row - b.row) + Math.abs(a.col - b.col)
  }

  /**
   * Check if position is within grid boundaries
   */
  function isInBounds(pos: GridPosition): boolean {
    return pos.row >= 0 && pos.row < GRID_HEIGHT && pos.col >= 0 && pos.col < GRID_WIDTH
  }

  /**
   * Check if position is blocked by an obstacle
   */
  function isBlocked(pos: GridPosition): boolean {
    // Check habitat items for obstacles
    const items = habitatConditions.habitatItems
    const itemPositions = habitatConditions.itemPositions

    for (const itemId of items) {
      const itemPosition = itemPositions.get(itemId)
      if (!itemPosition) continue

      // Check if this item blocks movement
      if (!itemBlocksMovement(itemId)) continue

      const idLower = itemId.toLowerCase()
      const isShelter = idLower.includes('igloo') || idLower.includes('shelter') || idLower.includes('tunnel')

      // For shelters: check if position is an entrance or inside
      if (isShelter) {
        // If position is a designated entrance/exit, it's NOT blocked
        if (isShelterEntrance(pos, itemId, itemPosition)) {
          continue // Not blocked, can enter/exit here
        }

        // If position is inside the shelter footprint, it IS blocked (can't walk through walls)
        if (isInsideShelter(pos, itemId, itemPosition)) {
          return true // Blocked - can't walk through shelter walls
        }
      } else {
        // For non-shelter items: block if position overlaps
        const { width, height } = getItemSize(itemId)
        const isWithinX = pos.col >= itemPosition.x && pos.col < itemPosition.x + width
        const isWithinY = pos.row >= itemPosition.y && pos.row < itemPosition.y + height

        if (isWithinX && isWithinY) {
          return true
        }
      }
    }

    return false
  }

  /**
   * Check if position is occupied by another guinea pig
   */
  function isOccupiedByGuineaPig(pos: GridPosition, excludeGuineaPigId?: string): boolean {
    const positions = habitatConditions.guineaPigPositions

    for (const [guineaPigId, gpPos] of positions.entries()) {
      if (excludeGuineaPigId && guineaPigId === excludeGuineaPigId) continue
      if (gpPos.x === pos.col && gpPos.y === pos.row) {
        return true
      }
    }

    return false
  }

  /**
   * Check if position is valid for pathfinding
   */
  function isValidPosition(pos: GridPosition, options: { avoidOccupiedCells?: boolean; excludeGuineaPigId?: string } = {}): boolean {
    if (!isInBounds(pos)) return false
    if (isBlocked(pos)) return false
    if (options.avoidOccupiedCells && isOccupiedByGuineaPig(pos, options.excludeGuineaPigId)) return false
    return true
  }

  /**
   * Get neighboring positions (4 directions: up, down, left, right)
   */
  function getNeighbors(pos: GridPosition): GridPosition[] {
    return [
      { row: pos.row - 1, col: pos.col }, // Up
      { row: pos.row + 1, col: pos.col }, // Down
      { row: pos.row, col: pos.col - 1 }, // Left
      { row: pos.row, col: pos.col + 1 }  // Right
    ]
  }

  /**
   * Find path using A* algorithm
   */
  function findPath(options: PathfindingOptions): PathfindingResult {
    const { start, goal, avoidOccupiedCells = false, maxPathLength = 100 } = options

    // Early validation
    // Both start and goal can be on items (guinea pig can be standing on item and can walk TO items)
    // Just verify they are within grid bounds
    if (!isInBounds(start)) {
      console.warn('[Pathfinding] Start position out of bounds:', start)
      return { path: [], distance: 0, success: false }
    }

    if (!isInBounds(goal)) {
      console.warn('[Pathfinding] Goal position out of bounds:', goal)
      return { path: [], distance: 0, success: false }
    }

    // If start and goal are the same
    if (start.row === goal.row && start.col === goal.col) {
      return { path: [start], distance: 0, success: true }
    }

    const openSet: PathNode[] = []
    const closedSet = new Set<string>()

    // Helper to convert position to string key
    const posKey = (pos: GridPosition) => `${pos.row},${pos.col}`

    // Create start node
    const startNode: PathNode = {
      position: start,
      g: 0,
      h: manhattanDistance(start, goal),
      f: manhattanDistance(start, goal),
      parent: null
    }

    openSet.push(startNode)

    let iterations = 0
    while (openSet.length > 0) {
      iterations++
      if (iterations > 200) {
        console.warn('[Pathfinding] Too many iterations, abandoning search from', start, 'to', goal)
        return { path: [], distance: 0, success: false }
      }

      // Find node with lowest f score
      let currentIndex = 0
      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].f < openSet[currentIndex].f) {
          currentIndex = i
        }
      }

      const current = openSet[currentIndex]

      // Check if we reached the goal
      if (current.position.row === goal.row && current.position.col === goal.col) {
        // Reconstruct path
        const path: GridPosition[] = []
        let node: PathNode | null = current
        while (node) {
          path.unshift(node.position)
          node = node.parent
        }
        return { path, distance: current.g, success: true }
      }

      // Move current from open to closed
      openSet.splice(currentIndex, 1)
      closedSet.add(posKey(current.position))

      // Check neighbors
      const neighbors = getNeighbors(current.position)
      let validNeighbors = 0
      for (const neighborPos of neighbors) {
        // Allow neighbor if it's the goal, even if blocked (guinea pigs can walk TO items)
        const isGoalPosition = neighborPos.row === goal.row && neighborPos.col === goal.col

        // Skip if not valid (unless it's the goal)
        if (!isGoalPosition && !isValidPosition(neighborPos, { avoidOccupiedCells })) {
          if (iterations === 1) {
            console.log('[Pathfinding] Neighbor invalid:', neighborPos, 'blocked:', isBlocked(neighborPos))
          }
          continue
        }

        // Skip if already in closed set
        if (closedSet.has(posKey(neighborPos))) continue

        validNeighbors++

        // Calculate costs
        const g = current.g + 1
        const h = manhattanDistance(neighborPos, goal)
        const f = g + h

        // Check if path is too long
        if (g > maxPathLength) continue

        // Check if neighbor is in open set
        const existingIndex = openSet.findIndex(n =>
          n.position.row === neighborPos.row && n.position.col === neighborPos.col
        )

        if (existingIndex === -1) {
          // Add new node to open set
          openSet.push({
            position: neighborPos,
            g,
            h,
            f,
            parent: current
          })
        } else if (g < openSet[existingIndex].g) {
          // Update existing node if we found a better path
          openSet[existingIndex].g = g
          openSet[existingIndex].f = f
          openSet[existingIndex].parent = current
        }
      }

      if (iterations === 1 && validNeighbors === 0) {
        console.warn('[Pathfinding] No valid neighbors found from start position', start)
      }
    }

    // No path found
    console.warn('[Pathfinding] No path found after', iterations, 'iterations from', start, 'to', goal, 'openSet empty')
    return { path: [], distance: 0, success: false }
  }

  /**
   * Get all obstacle positions
   */
  function getObstacles(): GridPosition[] {
    const obstacles: GridPosition[] = []
    const items = habitatConditions.habitatItems
    const itemPositions = habitatConditions.itemPositions

    for (const itemId of items) {
      const itemPosition = itemPositions.get(itemId)
      if (!itemPosition) continue

      // Check if this item blocks movement
      if (!itemBlocksMovement(itemId)) continue

      // Get item size based on ID
      const { width, height } = getItemSize(itemId)

      // Add all cells occupied by this item
      for (let dy = 0; dy < height; dy++) {
        for (let dx = 0; dx < width; dx++) {
          obstacles.push({
            row: itemPosition.y + dy,
            col: itemPosition.x + dx
          })
        }
      }
    }

    return obstacles
  }

  return {
    findPath,
    isValidPosition,
    isInBounds,
    getObstacles,
    GRID_WIDTH,
    GRID_HEIGHT
  }
}
