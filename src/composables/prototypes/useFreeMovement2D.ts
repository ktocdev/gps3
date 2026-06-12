/**
 * Free Movement 2D Prototype
 * Continuous positioning system for guinea pig movement
 */

import { ref, reactive } from 'vue'

// Types
interface Vector2D {
  x: number
  y: number
}

interface MovementState {
  position: Vector2D
  velocity: Vector2D
  rotation: number // radians
  targetPosition: Vector2D | null
}

interface CollisionCircle {
  center: Vector2D
  radius: number
}

interface Item {
  type: string
  position: Vector2D
  radius: number
  moveable?: boolean
  hasEntrance?: boolean
  entranceAngle?: number // radians, for igloo entrance direction
}

interface RenderOptions {
  showGrid?: boolean
  showPath?: boolean
  showCollisionCircles?: boolean
  showVelocityVector?: boolean
}

export interface FreeMovement2DOptions {
  canvas: HTMLCanvasElement
  speed?: number // pixels per second
  rotationSpeed?: number // radians per second
  friction?: number // 0-1, applied each frame
}

export function useFreeMovement2D(options: FreeMovement2DOptions) {
  const { canvas } = options

  // Movement settings (reactive so they can be updated)
  const settings = reactive({
    speed: options.speed ?? 500,
    rotationSpeed: options.rotationSpeed ?? 5,
    friction: options.friction ?? 0.95
  })

  // Movement state
  const state = reactive<MovementState>({
    position: { x: canvas.width / 2, y: canvas.height / 2 },
    velocity: { x: 0, y: 0 },
    rotation: 0,
    targetPosition: null
  })

  // Items and obstacles
  const items = ref<Item[]>([])

  // Path for visualization
  const pathPoints = ref<Vector2D[]>([])

  // Guinea pig properties
  const GUINEA_PIG_RADIUS = 15
  const GUINEA_PIG_COLOR = '#8B4513' // Brown
  const GUINEA_PIG_EYE_COLOR = '#000000'

  /**
   * Update movement settings
   */
  function updateSettings(newSettings: Partial<{ speed: number; rotationSpeed: number; friction: number }>) {
    if (newSettings.speed !== undefined) settings.speed = newSettings.speed
    if (newSettings.rotationSpeed !== undefined) settings.rotationSpeed = newSettings.rotationSpeed
    if (newSettings.friction !== undefined) settings.friction = newSettings.friction
  }

  /**
   * Set target position for movement
   */
  function setTarget(position: Vector2D) {
    state.targetPosition = { ...position }
    // Clear path and add starting point
    pathPoints.value = [{ ...state.position }]
  }

  /**
   * Reset guinea pig position
   */
  function resetPosition() {
    state.position = { x: canvas.width / 2, y: canvas.height / 2 }
    state.velocity = { x: 0, y: 0 }
    state.rotation = 0
    state.targetPosition = null
    pathPoints.value = []
  }

  /**
   * Add an item/obstacle
   */
  function addItem(item: Item) {
    items.value.push(item)
  }

  /**
   * Clear all items
   */
  function clearItems() {
    items.value = []
  }

  /**
   * Check collision between two circles
   */
  function checkCollision(a: CollisionCircle, b: CollisionCircle): boolean {
    const dx = a.center.x - b.center.x
    const dy = a.center.y - b.center.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    return distance < a.radius + b.radius
  }

  /**
   * Calculate collision response
   */
  function resolveCollision(guineaPig: CollisionCircle, obstacle: CollisionCircle): Vector2D {
    // Use checkCollision function for consistency
    if (checkCollision(guineaPig, obstacle)) {
      const dx = guineaPig.center.x - obstacle.center.x
      const dy = guineaPig.center.y - obstacle.center.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      // Calculate push direction
      const pushDistance = guineaPig.radius + obstacle.radius - distance
      const pushX = (dx / distance) * pushDistance
      const pushY = (dy / distance) * pushDistance
      return { x: pushX, y: pushY }
    }

    return { x: 0, y: 0 }
  }

  /**
   * Update movement physics
   */
  function update(deltaTime: number) {
    if (!state.targetPosition) return

    // Calculate direction to target
    const dx = state.targetPosition.x - state.position.x
    const dy = state.targetPosition.y - state.position.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    // Check if we've reached the target
    if (distance < 5) {
      state.velocity = { x: 0, y: 0 }
      state.targetPosition = null
      return
    }

    // Apply force towards target (scale with speed for consistent feel)
    const accelerationMultiplier = 2.5 // How quickly to reach target speed
    const force = settings.speed * accelerationMultiplier
    const fx = (dx / distance) * force * deltaTime
    const fy = (dy / distance) * force * deltaTime

    // Update velocity
    state.velocity.x += fx
    state.velocity.y += fy

    // Limit max speed
    const currentSpeed = Math.sqrt(state.velocity.x ** 2 + state.velocity.y ** 2)
    if (currentSpeed > settings.speed) {
      state.velocity.x = (state.velocity.x / currentSpeed) * settings.speed
      state.velocity.y = (state.velocity.y / currentSpeed) * settings.speed
    }

    // Apply friction
    state.velocity.x *= settings.friction
    state.velocity.y *= settings.friction

    // Update position
    const newX = state.position.x + state.velocity.x * deltaTime
    const newY = state.position.y + state.velocity.y * deltaTime

    // Check collisions
    const guineaPigCollider: CollisionCircle = {
      center: { x: newX, y: newY },
      radius: GUINEA_PIG_RADIUS
    }

    let collisionPush = { x: 0, y: 0 }
    for (const item of items.value) {
      const itemCollider: CollisionCircle = {
        center: item.position,
        radius: item.radius
      }

      // Special handling for igloos with entrances
      if (item.hasEntrance) {
        // Check if guinea pig is near entrance
        const entranceAngle = item.entranceAngle || Math.PI // Default entrance facing down
        const entranceX = item.position.x + Math.cos(entranceAngle) * item.radius
        const entranceY = item.position.y + Math.sin(entranceAngle) * item.radius
        const entranceDistance = Math.sqrt(
          (newX - entranceX) ** 2 + (newY - entranceY) ** 2
        )

        // If near entrance, don't collide
        if (entranceDistance < GUINEA_PIG_RADIUS * 2) {
          continue
        }
      }

      const push = resolveCollision(guineaPigCollider, itemCollider)
      collisionPush.x += push.x
      collisionPush.y += push.y

      // If item is moveable, push it
      if (item.moveable && (push.x !== 0 || push.y !== 0)) {
        item.position.x -= push.x * 0.5
        item.position.y -= push.y * 0.5
      }
    }

    // Apply collision response
    state.position.x = newX + collisionPush.x
    state.position.y = newY + collisionPush.y

    // Keep within canvas bounds
    state.position.x = Math.max(GUINEA_PIG_RADIUS, Math.min(canvas.width - GUINEA_PIG_RADIUS, state.position.x))
    state.position.y = Math.max(GUINEA_PIG_RADIUS, Math.min(canvas.height - GUINEA_PIG_RADIUS, state.position.y))

    // Update rotation to face movement direction
    if (currentSpeed > 1) {
      const targetRotation = Math.atan2(state.velocity.y, state.velocity.x)
      const rotationDiff = targetRotation - state.rotation

      // Normalize rotation difference to [-PI, PI]
      let normalizedDiff = rotationDiff
      while (normalizedDiff > Math.PI) normalizedDiff -= Math.PI * 2
      while (normalizedDiff < -Math.PI) normalizedDiff += Math.PI * 2

      // Smooth rotation
      state.rotation += normalizedDiff * settings.rotationSpeed * deltaTime
    }

    // Add to path (for visualization)
    if (pathPoints.value.length === 0 ||
        Math.abs(state.position.x - pathPoints.value[pathPoints.value.length - 1].x) > 5 ||
        Math.abs(state.position.y - pathPoints.value[pathPoints.value.length - 1].y) > 5) {
      pathPoints.value.push({ ...state.position })
      // Limit path length
      if (pathPoints.value.length > 100) {
        pathPoints.value.shift()
      }
    }
  }

  /**
   * Render the scene
   */
  function render(canvas: HTMLCanvasElement, options: RenderOptions = {}) {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = '#E8F5E9' // Light green background
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    if (options.showGrid) {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.lineWidth = 1
      const gridSize = 50

      for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }

      for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }
    }

    // Draw items
    for (const item of items.value) {
      // Item body
      ctx.fillStyle = item.type === 'bowl' ? '#4A5568' : '#8B7355'
      ctx.beginPath()
      ctx.arc(item.position.x, item.position.y, item.radius, 0, Math.PI * 2)
      ctx.fill()

      // Draw entrance for igloos
      if (item.hasEntrance) {
        ctx.fillStyle = '#FFFFFF'
        const entranceAngle = item.entranceAngle || Math.PI
        const entranceX = item.position.x + Math.cos(entranceAngle) * (item.radius - 10)
        const entranceY = item.position.y + Math.sin(entranceAngle) * (item.radius - 10)
        ctx.beginPath()
        ctx.arc(entranceX, entranceY, 15, 0, Math.PI * 2)
        ctx.fill()
      }

      // Draw collision circles
      if (options.showCollisionCircles) {
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(item.position.x, item.position.y, item.radius, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Label
      ctx.fillStyle = '#000000'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(item.type, item.position.x, item.position.y - item.radius - 5)
    }

    // Draw path
    if (options.showPath && pathPoints.value.length > 1) {
      ctx.strokeStyle = 'rgba(0, 100, 255, 0.3)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(pathPoints.value[0].x, pathPoints.value[0].y)
      for (let i = 1; i < pathPoints.value.length; i++) {
        ctx.lineTo(pathPoints.value[i].x, pathPoints.value[i].y)
      }
      ctx.stroke()
    }

    // Draw guinea pig
    ctx.save()
    ctx.translate(state.position.x, state.position.y)
    ctx.rotate(state.rotation)

    // Body
    ctx.fillStyle = GUINEA_PIG_COLOR
    ctx.beginPath()
    ctx.ellipse(0, 0, GUINEA_PIG_RADIUS * 1.2, GUINEA_PIG_RADIUS, 0, 0, Math.PI * 2)
    ctx.fill()

    // Head (front)
    ctx.beginPath()
    ctx.arc(GUINEA_PIG_RADIUS, 0, GUINEA_PIG_RADIUS * 0.7, 0, Math.PI * 2)
    ctx.fill()

    // Eyes
    ctx.fillStyle = GUINEA_PIG_EYE_COLOR
    ctx.beginPath()
    ctx.arc(GUINEA_PIG_RADIUS, -5, 2, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(GUINEA_PIG_RADIUS, 5, 2, 0, Math.PI * 2)
    ctx.fill()

    // Nose
    ctx.fillStyle = '#FF69B4'
    ctx.beginPath()
    ctx.arc(GUINEA_PIG_RADIUS + 7, 0, 2, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()

    // Draw guinea pig collision circle
    if (options.showCollisionCircles) {
      ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(state.position.x, state.position.y, GUINEA_PIG_RADIUS, 0, Math.PI * 2)
      ctx.stroke()
    }

    // Draw velocity vector
    if (options.showVelocityVector && (state.velocity.x !== 0 || state.velocity.y !== 0)) {
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(state.position.x, state.position.y)
      ctx.lineTo(
        state.position.x + state.velocity.x * 0.3,
        state.position.y + state.velocity.y * 0.3
      )
      ctx.stroke()

      // Arrowhead
      const angle = Math.atan2(state.velocity.y, state.velocity.x)
      const arrowLength = 10
      ctx.beginPath()
      ctx.moveTo(
        state.position.x + state.velocity.x * 0.3,
        state.position.y + state.velocity.y * 0.3
      )
      ctx.lineTo(
        state.position.x + state.velocity.x * 0.3 - arrowLength * Math.cos(angle - Math.PI / 6),
        state.position.y + state.velocity.y * 0.3 - arrowLength * Math.sin(angle - Math.PI / 6)
      )
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(
        state.position.x + state.velocity.x * 0.3,
        state.position.y + state.velocity.y * 0.3
      )
      ctx.lineTo(
        state.position.x + state.velocity.x * 0.3 - arrowLength * Math.cos(angle + Math.PI / 6),
        state.position.y + state.velocity.y * 0.3 - arrowLength * Math.sin(angle + Math.PI / 6)
      )
      ctx.stroke()
    }

    // Draw target
    if (state.targetPosition) {
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(state.targetPosition.x - 10, state.targetPosition.y)
      ctx.lineTo(state.targetPosition.x + 10, state.targetPosition.y)
      ctx.moveTo(state.targetPosition.x, state.targetPosition.y - 10)
      ctx.lineTo(state.targetPosition.x, state.targetPosition.y + 10)
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(state.targetPosition.x, state.targetPosition.y, 5, 0, Math.PI * 2)
      ctx.stroke()
    }
  }

  /**
   * Get current state
   */
  function getState() {
    return {
      position: { ...state.position },
      velocity: { ...state.velocity },
      rotation: state.rotation,
      targetPosition: state.targetPosition ? { ...state.targetPosition } : null
    }
  }

  /**
   * Cleanup
   */
  function cleanup() {
    // Reset state
    resetPosition()
    clearItems()
  }

  return {
    setTarget,
    resetPosition,
    addItem,
    clearItems,
    update,
    render,
    getState,
    cleanup,
    updateSettings
  }
}