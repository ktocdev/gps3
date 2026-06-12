import { ref } from 'vue'
import type * as THREE from 'three'
import { CAMERA_CONFIG } from '../constants/3d'

export interface CameraControls {
  isDragging: boolean
  previousMousePosition: { x: number; y: number }
  keysPressed: Record<string, boolean>
  isHovering: boolean
  // Two-finger gesture state (pinch-to-zoom + drag-to-pan)
  isTwoFingerGesture: boolean
  initialPinchDistance: number
  previousTouchCenter: { x: number; y: number }
}

export function use3DCamera(
  camera: THREE.PerspectiveCamera,
  worldGroup: THREE.Group,
  canvasElement: HTMLCanvasElement,
  options?: { disableArrowKeys?: () => boolean }
) {
  const controls = ref<CameraControls>({
    isDragging: false,
    previousMousePosition: { x: 0, y: 0 },
    keysPressed: {},
    isHovering: false,
    isTwoFingerGesture: false,
    initialPinchDistance: 0,
    previousTouchCenter: { x: 0, y: 0 },
  })

  // Mouse Rotation
  function handleMouseDown(e: MouseEvent) {
    controls.value.isDragging = true
    controls.value.previousMousePosition = { x: e.offsetX, y: e.offsetY }
  }

  function handleMouseMove(e: MouseEvent) {
    if (!controls.value.isDragging) return

    const deltaMove = {
      x: e.offsetX - controls.value.previousMousePosition.x,
      y: e.offsetY - controls.value.previousMousePosition.y,
    }

    if (e.shiftKey) {
      // Shift+drag = pan camera (move X/Z position)
      camera.position.x -= deltaMove.x * CAMERA_CONFIG.MOUSE_PAN_SPEED
      camera.position.z -= deltaMove.y * CAMERA_CONFIG.MOUSE_PAN_SPEED
      // Clamp to boundaries
      camera.position.x = Math.max(
        CAMERA_CONFIG.BOUND_X_MIN,
        Math.min(CAMERA_CONFIG.BOUND_X_MAX, camera.position.x)
      )
      camera.position.z = Math.max(
        CAMERA_CONFIG.BOUND_Z_MIN,
        Math.min(CAMERA_CONFIG.BOUND_Z_MAX, camera.position.z)
      )
    } else {
      // Regular drag = rotate world on Y-axis
      worldGroup.rotation.y += deltaMove.x * CAMERA_CONFIG.MOUSE_ROTATION_SPEED
    }

    controls.value.previousMousePosition = { x: e.offsetX, y: e.offsetY }
  }

  function handleMouseUp() {
    controls.value.isDragging = false
  }

  // Scroll Zoom
  function handleWheel(e: WheelEvent) {
    // Only zoom when hovering over canvas
    if (controls.value.isHovering) {
      e.preventDefault() // Prevent page scroll
      camera.position.y += e.deltaY * CAMERA_CONFIG.WHEEL_ZOOM_SPEED
      camera.position.y = Math.max(
        CAMERA_CONFIG.HEIGHT_MIN,
        Math.min(CAMERA_CONFIG.HEIGHT_MAX, camera.position.y)
      )
    }
  }

  // Mouse Hover Tracking
  function handleMouseEnter() {
    controls.value.isHovering = true
  }

  function handleMouseLeave() {
    controls.value.isHovering = false
  }

  // Keyboard Controls
  function handleKeyDown(e: KeyboardEvent) {
    // Prevent page scroll when hovering over canvas
    if (controls.value.isHovering) {
      const scrollKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'z', 'x', 'Z', 'X', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D', 'q', 'e', 'r', 'Q', 'E', 'R']
      if (scrollKeys.includes(e.key) || scrollKeys.includes(e.code)) {
        e.preventDefault()
      }
    }

    controls.value.keysPressed[e.key.toLowerCase()] = true
    controls.value.keysPressed[e.code] = true
  }

  function handleKeyUp(e: KeyboardEvent) {
    controls.value.keysPressed[e.key.toLowerCase()] = false
    controls.value.keysPressed[e.code] = false
  }

  // Touch Controls

  // Calculate distance between two touch points
  function getTouchDistance(touches: TouchList): number {
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  // Calculate center point between two touch points
  function getTouchCenter(touches: TouchList): { x: number; y: number } {
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2,
    }
  }

  function handleTouchStart(e: TouchEvent) {
    if (e.touches.length === 2) {
      // Two fingers: pinch-to-zoom + drag-to-pan
      controls.value.isTwoFingerGesture = true
      controls.value.isDragging = false
      controls.value.initialPinchDistance = getTouchDistance(e.touches)
      controls.value.previousTouchCenter = getTouchCenter(e.touches)
    } else if (e.touches.length === 1) {
      // Single finger: rotate
      controls.value.isDragging = true
      controls.value.isTwoFingerGesture = false
      controls.value.previousMousePosition = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      }
    }
  }

  function handleTouchMove(e: TouchEvent) {
    if (e.touches.length === 2 && controls.value.isTwoFingerGesture) {
      // Two-finger gesture: pinch-to-zoom + drag-to-pan
      const currentDistance = getTouchDistance(e.touches)
      const currentCenter = getTouchCenter(e.touches)

      // Pinch-to-zoom
      const deltaDistance = currentDistance - controls.value.initialPinchDistance
      // Pinch out (spread fingers) = zoom in (lower camera)
      // Pinch in (pinch fingers) = zoom out (raise camera)
      camera.position.y -= deltaDistance * CAMERA_CONFIG.PINCH_ZOOM_SPEED
      camera.position.y = Math.max(
        CAMERA_CONFIG.HEIGHT_MIN,
        Math.min(CAMERA_CONFIG.HEIGHT_MAX, camera.position.y)
      )

      // Drag-to-pan
      const deltaCenter = {
        x: currentCenter.x - controls.value.previousTouchCenter.x,
        y: currentCenter.y - controls.value.previousTouchCenter.y,
      }
      camera.position.x -= deltaCenter.x * CAMERA_CONFIG.MOUSE_PAN_SPEED
      camera.position.z -= deltaCenter.y * CAMERA_CONFIG.MOUSE_PAN_SPEED
      // Clamp to boundaries
      camera.position.x = Math.max(
        CAMERA_CONFIG.BOUND_X_MIN,
        Math.min(CAMERA_CONFIG.BOUND_X_MAX, camera.position.x)
      )
      camera.position.z = Math.max(
        CAMERA_CONFIG.BOUND_Z_MIN,
        Math.min(CAMERA_CONFIG.BOUND_Z_MAX, camera.position.z)
      )

      // Update previous values
      controls.value.initialPinchDistance = currentDistance
      controls.value.previousTouchCenter = currentCenter
    } else if (e.touches.length === 1 && controls.value.isDragging) {
      // Single finger rotate
      const currentX = e.touches[0].clientX
      const currentY = e.touches[0].clientY

      worldGroup.rotation.y +=
        (currentX - controls.value.previousMousePosition.x) * CAMERA_CONFIG.MOUSE_ROTATION_SPEED

      controls.value.previousMousePosition = { x: currentX, y: currentY }
    }
  }

  function handleTouchEnd(e: TouchEvent) {
    if (e.touches.length === 0) {
      // All fingers lifted
      controls.value.isDragging = false
      controls.value.isTwoFingerGesture = false
      controls.value.initialPinchDistance = 0
    } else if (e.touches.length === 1) {
      // One finger remaining - switch from two-finger gesture to rotate
      controls.value.isTwoFingerGesture = false
      controls.value.isDragging = true
      controls.value.previousMousePosition = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      }
    }
  }

  // Update camera position based on keyboard input
  function updateCameraPosition() {
    // Check if arrow keys should be disabled (e.g., during Take Control mode)
    const arrowsDisabled = options?.disableArrowKeys?.() ?? false

    // WASD always controls camera (A/D = left/right, W/S = forward/back)
    if (controls.value.keysPressed['a']) camera.position.x -= CAMERA_CONFIG.PAN_SPEED
    if (controls.value.keysPressed['d']) camera.position.x += CAMERA_CONFIG.PAN_SPEED
    if (controls.value.keysPressed['w']) camera.position.z -= CAMERA_CONFIG.PAN_SPEED
    if (controls.value.keysPressed['s']) camera.position.z += CAMERA_CONFIG.PAN_SPEED

    // Arrow keys control camera only when not disabled
    if (!arrowsDisabled) {
      if (controls.value.keysPressed['arrowleft']) camera.position.x -= CAMERA_CONFIG.PAN_SPEED
      if (controls.value.keysPressed['arrowright']) camera.position.x += CAMERA_CONFIG.PAN_SPEED
      if (controls.value.keysPressed['arrowup']) camera.position.z -= CAMERA_CONFIG.PAN_SPEED
      if (controls.value.keysPressed['arrowdown']) camera.position.z += CAMERA_CONFIG.PAN_SPEED
    }

    // Z/X for vertical movement (always available)
    if (controls.value.keysPressed['z']) camera.position.y += CAMERA_CONFIG.VERTICAL_SPEED
    if (controls.value.keysPressed['x']) camera.position.y -= CAMERA_CONFIG.VERTICAL_SPEED

    // Q/E for rotation (primary keys)
    if (controls.value.keysPressed['q']) {
      worldGroup.rotation.y -= CAMERA_CONFIG.KEYBOARD_ROTATION_SPEED
    }
    if (controls.value.keysPressed['e']) {
      worldGroup.rotation.y += CAMERA_CONFIG.KEYBOARD_ROTATION_SPEED
    }

    // Alternate rotation keys (comma/period)
    if (controls.value.keysPressed[','] || controls.value.keysPressed['<']) {
      worldGroup.rotation.y -= CAMERA_CONFIG.KEYBOARD_ROTATION_SPEED
    }
    if (controls.value.keysPressed['.'] || controls.value.keysPressed['>']) {
      worldGroup.rotation.y += CAMERA_CONFIG.KEYBOARD_ROTATION_SPEED
    }

    // R to reset camera to initial position
    if (controls.value.keysPressed['r']) {
      camera.position.set(
        CAMERA_CONFIG.INITIAL_POSITION.x,
        CAMERA_CONFIG.INITIAL_POSITION.y,
        CAMERA_CONFIG.INITIAL_POSITION.z
      )
      worldGroup.rotation.y = 0
      controls.value.keysPressed['r'] = false // Prevent continuous reset
    }

    // Clamp camera position to world boundaries
    camera.position.x = Math.max(
      CAMERA_CONFIG.BOUND_X_MIN,
      Math.min(CAMERA_CONFIG.BOUND_X_MAX, camera.position.x)
    )
    camera.position.y = Math.max(
      CAMERA_CONFIG.HEIGHT_MIN,
      Math.min(CAMERA_CONFIG.HEIGHT_MAX, camera.position.y)
    )
    camera.position.z = Math.max(
      CAMERA_CONFIG.BOUND_Z_MIN,
      Math.min(CAMERA_CONFIG.BOUND_Z_MAX, camera.position.z)
    )

    // Update camera look-at with tilt
    const tiltOffset = CAMERA_CONFIG.TILT_OFFSET_BASE + camera.position.y * CAMERA_CONFIG.TILT_OFFSET_MULTIPLIER
    camera.lookAt(camera.position.x, 2.0, camera.position.z - tiltOffset)
  }

  // Initialize event listeners
  function init() {
    // Mouse events
    canvasElement.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    // Mouse hover tracking
    canvasElement.addEventListener('mouseenter', handleMouseEnter)
    canvasElement.addEventListener('mouseleave', handleMouseLeave)

    // Scroll - non-passive so we can preventDefault when hovering
    canvasElement.addEventListener('wheel', handleWheel, { passive: false })

    // Keyboard
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)

    // Touch - use passive for better scroll performance
    canvasElement.addEventListener('touchstart', handleTouchStart, { passive: true })
    canvasElement.addEventListener('touchmove', handleTouchMove, { passive: true })
    canvasElement.addEventListener('touchend', handleTouchEnd, { passive: true })
  }

  // Cleanup event listeners
  function cleanup() {
    canvasElement.removeEventListener('mousedown', handleMouseDown)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    canvasElement.removeEventListener('mouseenter', handleMouseEnter)
    canvasElement.removeEventListener('mouseleave', handleMouseLeave)
    canvasElement.removeEventListener('wheel', handleWheel)
    document.removeEventListener('keydown', handleKeyDown)
    document.removeEventListener('keyup', handleKeyUp)
    canvasElement.removeEventListener('touchstart', handleTouchStart)
    canvasElement.removeEventListener('touchmove', handleTouchMove)
    canvasElement.removeEventListener('touchend', handleTouchEnd)
  }

  // Auto-initialize
  init()

  return {
    controls,
    updateCameraPosition,
    cleanup,
  }
}
