import { ref } from 'vue'
import * as THREE from 'three'
import {
  createHandModel,
  setHandPose,
  updateHandAnimation,
  disposeHand,
  type Hand3DUserData
} from '../3d-models/use3DHand'
import { createHeldFoodBall } from '../3d-models/food/held-food'
import { disposeObject3D } from '../../utils/three-cleanup'
import { useGuineaPigStore } from '../../stores/guineaPigStore'
import { useSuppliesStore } from '../../stores/suppliesStore'
import { useInventoryStore } from '../../stores/inventoryStore'
import { useLoggingStore } from '../../stores/loggingStore'
import { useNeedsController } from '../../stores/needsController'
import type { ReactionMessage } from '../../data/guineaPigMessages'
import { guineaPigMessages } from '../../data/guineaPigMessages'

// Animation constants
const PETTING_DURATION = 3125 // ~3.1 seconds
const HAND_FEED_DURATION = 2500 // 2.5 seconds
const START_Y = 20 // Starting height above scene
const PET_Y_OFFSET = 2.5 // Height above guinea pig during interaction
const FOOD_BALL_POSITION = { x: 1.4, y: 1, z: 0.3 } // Position at fingertips

/**
 * Composable for managing 3D interaction animations (petting, hand feeding)
 */
/**
 * Get wellness tier from wellness value
 */
function getWellnessTier(wellness: number): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' {
  if (wellness >= 80) return 'excellent'
  if (wellness >= 60) return 'good'
  if (wellness >= 40) return 'fair'
  if (wellness >= 20) return 'poor'
  return 'critical'
}

/**
 * Dispatch a chat bubble event for a guinea pig
 */
function showChatBubble(guineaPigId: string, reaction: ReactionMessage): void {
  document.dispatchEvent(new CustomEvent('show-chat-bubble', {
    detail: { guineaPigId, reaction },
    bubbles: true
  }))
}

/**
 * Get a random message from an array
 */
function getRandomMessage(messages: readonly ReactionMessage[]): ReactionMessage {
  return messages[Math.floor(Math.random() * messages.length)]
}

export function use3DInteractions() {
  // Stores
  const guineaPigStore = useGuineaPigStore()
  const suppliesStore = useSuppliesStore()
  const inventoryStore = useInventoryStore()
  const loggingStore = useLoggingStore()
  const needsController = useNeedsController()

  // State refs (reactive for UI)
  const isPetting = ref(false)
  const isHandFeeding = ref(false)
  const targetGuineaPigId = ref<string | null>(null)

  // Internal state (non-reactive)
  let scene: THREE.Scene | null = null
  let guineaPigModels: Map<string, THREE.Group> | null = null
  let interactionHand: THREE.Group | null = null

  // Petting animation state
  let pettingStartTime = 0

  // Hand feed animation state
  let handFeedStartTime = 0
  let handFeedFoodId: string | null = null
  let handFeedFoodMesh: THREE.Group | null = null

  // Callbacks for clearing pending interaction
  let onAnimationComplete: (() => void) | null = null

  /**
   * Initialize the interaction system
   */
  function init(
    sceneRef: THREE.Scene,
    gpModels: Map<string, THREE.Group>,
    onComplete?: () => void
  ) {
    scene = sceneRef
    guineaPigModels = gpModels
    onAnimationComplete = onComplete || null

    // Create interaction hand
    interactionHand = createHandModel()
    setHandPose(interactionHand, 'petting')
    interactionHand.position.set(0, 25, 0)
    interactionHand.rotation.x = Math.PI // Palm faces down for petting
    interactionHand.visible = false
    scene.add(interactionHand)

    console.log('[use3DInteractions] Initialized')
  }

  /**
   * Dispose the interaction system
   */
  function dispose() {
    // Dispose food mesh if present
    if (handFeedFoodMesh && interactionHand) {
      interactionHand.remove(handFeedFoodMesh)
      disposeObject3D(handFeedFoodMesh)
      handFeedFoodMesh = null
    }

    // Dispose interaction hand
    if (interactionHand && scene) {
      scene.remove(interactionHand)
      disposeHand(interactionHand)
      interactionHand = null
    }

    scene = null
    guineaPigModels = null
    onAnimationComplete = null

    console.log('[use3DInteractions] Disposed')
  }

  /**
   * Check if any animation is active
   */
  function isAnimating(): boolean {
    return isPetting.value || isHandFeeding.value
  }

  /**
   * Get the current target guinea pig ID
   */
  function getTargetId(): string | null {
    return targetGuineaPigId.value
  }

  // ============================================================================
  // Petting Animation
  // ============================================================================

  /**
   * Start petting animation on a guinea pig
   */
  function startPetting(guineaPigId: string): boolean {
    if (!interactionHand || !guineaPigModels || isAnimating()) return false

    const gpModel = guineaPigModels.get(guineaPigId)
    if (!gpModel) return false

    // Get guinea pig world position
    const gpWorldPos = new THREE.Vector3()
    gpModel.getWorldPosition(gpWorldPos)

    // Set hand starting position and pose
    interactionHand.position.set(gpWorldPos.x, START_Y, gpWorldPos.z)
    interactionHand.rotation.x = Math.PI // Palm faces down
    interactionHand.rotation.y = 0
    interactionHand.rotation.z = 0
    setHandPose(interactionHand, 'petting')
    interactionHand.visible = true

    // Start animation
    isPetting.value = true
    pettingStartTime = Date.now()
    targetGuineaPigId.value = guineaPigId

    console.log(`[use3DInteractions] Started petting: ${guineaPigId}`)
    return true
  }

  /**
   * Update petting animation (call each frame)
   */
  function updatePetting(): void {
    if (!isPetting.value || !interactionHand || !guineaPigModels) return

    const elapsed = Date.now() - pettingStartTime
    const progress = Math.min(elapsed / PETTING_DURATION, 1)

    const gpModel = targetGuineaPigId.value ? guineaPigModels.get(targetGuineaPigId.value) : null
    if (!gpModel) {
      finishPetting()
      return
    }

    // Get guinea pig world position (it may be moving)
    const gpWorldPos = new THREE.Vector3()
    gpModel.getWorldPosition(gpWorldPos)

    const petY = gpWorldPos.y + PET_Y_OFFSET

    if (progress < 0.3) {
      // Descend phase (ease out)
      const descendProgress = progress / 0.3
      const eased = 1 - Math.pow(1 - descendProgress, 2)
      interactionHand.position.y = START_Y - (START_Y - petY) * eased
      interactionHand.position.x = gpWorldPos.x
      interactionHand.position.z = gpWorldPos.z
    } else if (progress < 0.8) {
      // Petting phase - back and forth motion
      const petProgress = (progress - 0.3) / 0.5
      const strokeOffset = Math.sin(petProgress * Math.PI * 4) * 0.8 // 4 strokes
      const bobOffset = Math.sin(petProgress * Math.PI * 8) * 0.15 // Gentle bob

      interactionHand.position.x = gpWorldPos.x
      interactionHand.position.y = petY + bobOffset
      interactionHand.position.z = gpWorldPos.z + strokeOffset

      // Gentle finger movement
      const userData = interactionHand.userData as Hand3DUserData
      if (userData?.animation) {
        userData.animation.indexCurl = 0.3 + Math.sin(petProgress * Math.PI * 8) * 0.1
        userData.animation.middleCurl = 0.25 + Math.sin(petProgress * Math.PI * 8 + 0.5) * 0.1
        userData.animation.ringCurl = 0.2 + Math.sin(petProgress * Math.PI * 8 + 1) * 0.1
        userData.animation.pinkyCurl = 0.2 + Math.sin(petProgress * Math.PI * 8 + 1.5) * 0.1
        updateHandAnimation(interactionHand)
      }
    } else {
      // Rise phase (ease in)
      const riseProgress = (progress - 0.8) / 0.2
      const eased = riseProgress * riseProgress
      interactionHand.position.y = petY + (START_Y - petY) * eased
      interactionHand.position.x = gpWorldPos.x
      interactionHand.position.z = gpWorldPos.z
    }

    // Animation complete
    if (progress >= 1) {
      finishPetting()
    }
  }

  /**
   * Finish petting animation and apply effects
   */
  function finishPetting(): void {
    if (!interactionHand) return

    interactionHand.visible = false
    interactionHand.position.set(0, 25, 0)

    // Apply petting effects
    if (targetGuineaPigId.value) {
      const gp = guineaPigStore.getGuineaPig(targetGuineaPigId.value)
      if (gp) {
        // Satisfy social need (+25)
        guineaPigStore.satisfyNeed(targetGuineaPigId.value, 'social', 25)

        // Additional friendship gain (+2)
        guineaPigStore.adjustFriendship(targetGuineaPigId.value, 2)

        // Update interaction tracking
        gp.lastInteraction = Date.now()
        gp.totalInteractions += 1

        // Show chat bubble reaction (socialize success based on wellness)
        const wellness = needsController.calculateWellness(targetGuineaPigId.value)
        const tier = getWellnessTier(wellness)
        const messages = guineaPigMessages.socialize.success[tier]
        if (messages && messages.length > 0) {
          showChatBubble(targetGuineaPigId.value, getRandomMessage(messages))
        }

        // Log activity
        loggingStore.addPlayerAction(
          `Petted ${gp.name} - Social +25, Friendship +2`,
          '🫳',
          {
            guineaPigId: targetGuineaPigId.value,
            socialGain: 25,
            friendshipGain: 2
          }
        )
      }
    }

    isPetting.value = false
    targetGuineaPigId.value = null
    onAnimationComplete?.()

    console.log('[use3DInteractions] Petting complete')
  }

  // ============================================================================
  // Hand Feed Animation
  // ============================================================================

  /**
   * Start hand feed animation on a guinea pig
   */
  function startHandFeed(guineaPigId: string, foodId: string): boolean {
    if (!interactionHand || !guineaPigModels || isAnimating()) return false

    const gpModel = guineaPigModels.get(guineaPigId)
    if (!gpModel) return false

    // Get guinea pig world position
    const gpWorldPos = new THREE.Vector3()
    gpModel.getWorldPosition(gpWorldPos)

    // Create food ball with color from food item metadata
    const foodItem = suppliesStore.getItemById(foodId)
    const foodBallColor = foodItem?.stats?.foodBallColor
    handFeedFoodMesh = createHeldFoodBall(foodBallColor || foodItem?.subCategory || 'vegetables')
    handFeedFoodMesh.position.set(FOOD_BALL_POSITION.x, FOOD_BALL_POSITION.y, FOOD_BALL_POSITION.z)
    interactionHand.add(handFeedFoodMesh)

    // Position hand above guinea pig with gripping rotation
    interactionHand.position.set(gpWorldPos.x, START_Y, gpWorldPos.z)
    interactionHand.rotation.x = 0
    interactionHand.rotation.y = 0
    interactionHand.rotation.z = Math.PI // Finger curves face down
    setHandPose(interactionHand, 'gripping')
    interactionHand.visible = true

    // Start animation
    isHandFeeding.value = true
    handFeedStartTime = Date.now()
    handFeedFoodId = foodId
    targetGuineaPigId.value = guineaPigId

    console.log(`[use3DInteractions] Started hand feed: ${foodId} to ${guineaPigId}`)
    return true
  }

  /**
   * Update hand feed animation (call each frame)
   */
  function updateHandFeed(): void {
    if (!isHandFeeding.value || !interactionHand || !guineaPigModels) return

    const elapsed = Date.now() - handFeedStartTime
    const progress = Math.min(elapsed / HAND_FEED_DURATION, 1)

    if (progress >= 1) {
      finishHandFeed()
      return
    }

    const gpModel = targetGuineaPigId.value ? guineaPigModels.get(targetGuineaPigId.value) : null
    if (!gpModel) {
      finishHandFeed()
      return
    }

    const gpWorldPos = new THREE.Vector3()
    gpModel.getWorldPosition(gpWorldPos)

    const feedY = gpWorldPos.y + PET_Y_OFFSET

    if (progress < 0.35) {
      // Descend phase (ease out)
      const descendProgress = progress / 0.35
      const eased = 1 - Math.pow(1 - descendProgress, 2)
      interactionHand.position.y = START_Y - (START_Y - feedY) * eased
    } else if (progress < 0.75) {
      // Linger phase - gentle bob while GP accepts
      const lingerProgress = (progress - 0.35) / 0.4
      const bob = Math.sin(lingerProgress * Math.PI * 2) * 0.1
      interactionHand.position.y = feedY + bob
    } else {
      // Food disappears at 0.75
      if (handFeedFoodMesh?.visible) {
        handFeedFoodMesh.visible = false
      }
      // Rise phase (ease in)
      const riseProgress = (progress - 0.75) / 0.25
      const eased = riseProgress * riseProgress
      interactionHand.position.y = feedY + (START_Y - feedY) * eased
    }

    // Follow guinea pig X/Z position
    interactionHand.position.x = gpWorldPos.x
    interactionHand.position.z = gpWorldPos.z
  }

  /**
   * Finish hand feed animation and apply effects
   */
  function finishHandFeed(): void {
    if (!interactionHand) return

    // Hide hand
    interactionHand.visible = false
    interactionHand.position.set(0, 25, 0)

    // Remove and dispose food mesh
    if (handFeedFoodMesh) {
      interactionHand.remove(handFeedFoodMesh)
      disposeObject3D(handFeedFoodMesh)
      handFeedFoodMesh = null
    }

    // Apply effects
    if (targetGuineaPigId.value && handFeedFoodId) {
      const gp = guineaPigStore.getGuineaPig(targetGuineaPigId.value)
      if (gp) {
        const foodItem = suppliesStore.getItemById(handFeedFoodId)
        const gpName = gp.name || 'Guinea pig'
        const foodName = foodItem?.name || 'food'
        const foodEmoji = foodItem?.emoji || '🥕'

        // Apply need effects (matching 2D game: hunger +10, social +15)
        guineaPigStore.satisfyNeed(targetGuineaPigId.value, 'hunger', 10)
        guineaPigStore.satisfyNeed(targetGuineaPigId.value, 'social', 15)

        // Add friendship (+3)
        guineaPigStore.adjustFriendship(targetGuineaPigId.value, 3)

        // Update interaction tracking
        gp.lastInteraction = Date.now()
        gp.totalInteractions += 1

        // Consume food from inventory
        const inventoryItem = inventoryStore.consumables.find(c => c.itemId === handFeedFoodId)
        if (inventoryItem) {
          const hasServings = inventoryItem.instances[0]?.servingsRemaining !== undefined
          if (hasServings) {
            inventoryStore.consumeServing(handFeedFoodId)
          } else {
            inventoryStore.removeItem(handFeedFoodId, 1)
          }
        }

        // Show chat bubble reaction (feeding neutral based on wellness)
        const wellness = needsController.calculateWellness(targetGuineaPigId.value)
        const tier = getWellnessTier(wellness)
        const messages = guineaPigMessages.feeding.neutral[tier]
        if (messages && messages.length > 0) {
          showChatBubble(targetGuineaPigId.value, getRandomMessage(messages))
        }

        // Log activity
        loggingStore.addPlayerAction(`Hand fed ${foodName} to ${gpName}`, foodEmoji)
      }
    }

    // Clear state
    isHandFeeding.value = false
    handFeedFoodId = null
    targetGuineaPigId.value = null
    onAnimationComplete?.()

    console.log('[use3DInteractions] Hand feed complete')
  }

  // ============================================================================
  // Combined Update
  // ============================================================================

  /**
   * Update all interaction animations (call each frame)
   */
  function update(): void {
    if (isPetting.value) {
      updatePetting()
    }
    if (isHandFeeding.value) {
      updateHandFeed()
    }
  }

  return {
    // State
    isPetting,
    isHandFeeding,
    targetGuineaPigId,

    // Lifecycle
    init,
    dispose,

    // Queries
    isAnimating,
    getTargetId,

    // Petting
    startPetting,

    // Hand Feed
    startHandFeed,

    // Update (call each frame)
    update
  }
}
