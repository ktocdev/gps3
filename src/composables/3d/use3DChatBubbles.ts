/**
 * 3D Chat Bubbles Composable
 * Manages chat bubble display for guinea pigs in 3D view
 *
 * Uses HTML overlay approach with world-to-screen coordinate projection
 * for crisp text rendering and consistent UI patterns.
 */

import { ref, readonly } from 'vue'
import * as THREE from 'three'
import type { ReactionMessage } from '../../data/guineaPigMessages'

export interface ChatBubble3D {
  guineaPigId: string
  message: string
  emoji?: string
  variant: 'positive' | 'neutral' | 'negative' | 'warning' | 'critical'
  expiresAt: number
  screenPosition: { x: number; y: number }
  isVisible: boolean
}

const DEFAULT_DURATION = 3000

/**
 * Composable for managing 3D chat bubbles
 */
export function use3DChatBubbles() {
  const activeBubbles = ref<Map<string, ChatBubble3D>>(new Map())

  // References set by init()
  let camera: THREE.PerspectiveCamera | null = null
  let guineaPigModels: Map<string, THREE.Group> | null = null
  let canvas: HTMLCanvasElement | null = null

  /**
   * Initialize the chat bubbles system
   */
  function init(
    cameraRef: THREE.PerspectiveCamera,
    modelsRef: Map<string, THREE.Group>,
    canvasRef: HTMLCanvasElement
  ) {
    camera = cameraRef
    guineaPigModels = modelsRef
    canvas = canvasRef

    // Listen for chat bubble events
    document.addEventListener('show-chat-bubble', handleShowChatBubble as EventListener)
  }

  /**
   * Cleanup event listeners
   */
  function dispose() {
    document.removeEventListener('show-chat-bubble', handleShowChatBubble as EventListener)
    activeBubbles.value.clear()
    camera = null
    guineaPigModels = null
    canvas = null
  }

  /**
   * Handle show-chat-bubble custom event
   */
  function handleShowChatBubble(event: CustomEvent<{ guineaPigId: string; reaction: ReactionMessage }>) {
    const { guineaPigId, reaction } = event.detail
    showBubble(guineaPigId, reaction)
  }

  /**
   * Show a chat bubble for a guinea pig
   */
  function showBubble(guineaPigId: string, reaction: ReactionMessage) {
    const duration = reaction.duration || DEFAULT_DURATION
    const expiresAt = Date.now() + duration

    const bubble: ChatBubble3D = {
      guineaPigId,
      message: reaction.message,
      emoji: reaction.emoji,
      variant: reaction.variant,
      expiresAt,
      screenPosition: { x: 0, y: 0 },
      isVisible: false
    }

    // Replace any existing bubble for this guinea pig
    activeBubbles.value.set(guineaPigId, bubble)

    // Auto-dismiss after duration
    setTimeout(() => {
      dismissBubble(guineaPigId)
    }, duration)
  }

  /**
   * Dismiss a chat bubble
   */
  function dismissBubble(guineaPigId: string) {
    activeBubbles.value.delete(guineaPigId)
  }

  /**
   * Convert world position to screen coordinates
   */
  function worldToScreen(
    worldPos: THREE.Vector3
  ): { x: number; y: number; isBehindCamera: boolean } {
    if (!camera || !canvas) {
      return { x: 0, y: 0, isBehindCamera: true }
    }

    const vector = worldPos.clone()
    vector.project(camera)

    // Check if behind camera (z > 1 means behind)
    const isBehindCamera = vector.z > 1

    // Convert normalized device coordinates to screen pixels
    const x = (vector.x + 1) / 2 * canvas.clientWidth
    const y = (-vector.y + 1) / 2 * canvas.clientHeight

    return { x, y, isBehindCamera }
  }

  /**
   * Update screen positions for all active bubbles
   * Should be called every frame in the animation loop
   */
  function updatePositions() {
    if (!guineaPigModels) return

    const now = Date.now()
    const bubblesArray = Array.from(activeBubbles.value.entries())

    for (const [guineaPigId, bubble] of bubblesArray) {
      // Remove expired bubbles
      if (now >= bubble.expiresAt) {
        activeBubbles.value.delete(guineaPigId)
        continue
      }

      // Get guinea pig model
      const model = guineaPigModels.get(guineaPigId)
      if (!model) {
        bubble.isVisible = false
        continue
      }

      // Get world position with Y offset (above guinea pig's head)
      const worldPos = new THREE.Vector3()
      model.getWorldPosition(worldPos)
      worldPos.y += 3.5 // Offset above head

      // Project to screen coordinates
      const { x, y, isBehindCamera } = worldToScreen(worldPos)

      bubble.screenPosition = { x, y }
      bubble.isVisible = !isBehindCamera
    }
  }

  /**
   * Get all active bubbles as an array for rendering
   */
  function getBubbles(): ChatBubble3D[] {
    return Array.from(activeBubbles.value.values())
  }

  return {
    activeBubbles: readonly(activeBubbles),
    init,
    dispose,
    showBubble,
    dismissBubble,
    updatePositions,
    getBubbles
  }
}
