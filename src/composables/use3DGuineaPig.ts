import * as THREE from 'three'
import { disposeObject3D } from '../utils/three-cleanup'
import { DEFAULT_GUINEA_PIG_COLORS, type GuineaPig3DColors } from '../constants/guineaPigColors'

// Re-export for convenience
export type { GuineaPig3DColors as GuineaPigColors }

export function createGuineaPigModel(colors?: Partial<GuineaPig3DColors>): THREE.Group {
  // Use provided colors or fall back to defaults
  const furColor = colors?.fur ?? DEFAULT_GUINEA_PIG_COLORS.fur
  const earColor = colors?.ear ?? DEFAULT_GUINEA_PIG_COLORS.ear
  const skinColor = colors?.skin ?? DEFAULT_GUINEA_PIG_COLORS.skin
  const eyeColor = colors?.eye ?? DEFAULT_GUINEA_PIG_COLORS.eye

  // Materials
  const furMat = new THREE.MeshStandardMaterial({
    color: furColor,
    roughness: 0.9,
    flatShading: false,
  })

  const earMat = new THREE.MeshStandardMaterial({
    color: earColor,
    roughness: 0.8,
  })

  const skinMat = new THREE.MeshStandardMaterial({
    color: skinColor,
    roughness: 0.5,
  })

  const eyeMat = new THREE.MeshPhysicalMaterial({
    color: eyeColor,
    roughness: 0.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
  })

  const guineaPig = new THREE.Group()

  // Body
  const bodyGeo = new THREE.SphereGeometry(1, 32, 32)
  bodyGeo.applyMatrix4(new THREE.Matrix4().makeScale(1.1, 1.0, 1.8))
  const body = new THREE.Mesh(bodyGeo, furMat)
  body.position.y = 1.0
  body.castShadow = true
  body.receiveShadow = true
  guineaPig.add(body)

  // Head
  const headGeo = new THREE.SphereGeometry(0.85, 32, 32)
  headGeo.applyMatrix4(new THREE.Matrix4().makeScale(1, 0.95, 1.2))
  const head = new THREE.Mesh(headGeo, furMat)
  head.position.set(0, 1.0, 1.3)
  head.castShadow = true
  guineaPig.add(head)

  // Ears
  const earGeo = new THREE.SphereGeometry(0.35, 32, 16)
  earGeo.applyMatrix4(new THREE.Matrix4().makeScale(1, 1, 0.2))

  const leftEar = new THREE.Mesh(earGeo, earMat)
  leftEar.position.set(0.6, 1.5, 1.1)
  leftEar.rotation.set(0.5, -0.5, -0.5)
  leftEar.castShadow = true
  guineaPig.add(leftEar)

  const rightEar = new THREE.Mesh(earGeo, earMat)
  rightEar.position.set(-0.6, 1.5, 1.1)
  rightEar.rotation.set(0.5, 0.5, 0.5)
  rightEar.castShadow = true
  guineaPig.add(rightEar)

  // Eyes
  const eyeGeo = new THREE.SphereGeometry(0.12, 32, 32)

  const leftEye = new THREE.Mesh(eyeGeo, eyeMat)
  leftEye.position.set(0.65, 1.2, 1.7)
  guineaPig.add(leftEye)

  const rightEye = new THREE.Mesh(eyeGeo, eyeMat)
  rightEye.position.set(-0.65, 1.2, 1.7)
  guineaPig.add(rightEye)

  // Nose/Snout
  const noseGeo = new THREE.SphereGeometry(0.15, 16, 16)
  noseGeo.applyMatrix4(new THREE.Matrix4().makeScale(1, 0.6, 0.5))
  const nose = new THREE.Mesh(noseGeo, skinMat)
  nose.position.set(0, 0.9, 2.35)
  guineaPig.add(nose)

  // Mouth parts
  const mouthPartGeo = new THREE.SphereGeometry(0.1, 16, 16)

  const mouthLeft = new THREE.Mesh(mouthPartGeo, furMat)
  mouthLeft.position.set(0.1, 0.75, 2.25)
  guineaPig.add(mouthLeft)

  const mouthRight = new THREE.Mesh(mouthPartGeo, furMat)
  mouthRight.position.set(-0.1, 0.75, 2.25)
  guineaPig.add(mouthRight)

  // Feet
  const footGeo = new THREE.CapsuleGeometry(0.12, 0.3, 4, 8)
  footGeo.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2))

  const flFoot = new THREE.Mesh(footGeo, skinMat)
  flFoot.position.set(0.4, 0.1, 1.5)
  flFoot.castShadow = true
  guineaPig.add(flFoot)

  const frFoot = new THREE.Mesh(footGeo, skinMat)
  frFoot.position.set(-0.4, 0.1, 1.5)
  frFoot.castShadow = true
  guineaPig.add(frFoot)

  const blFoot = new THREE.Mesh(footGeo, skinMat)
  blFoot.position.set(0.5, 0.1, -0.8)
  blFoot.rotation.y = 0.5
  blFoot.castShadow = true
  guineaPig.add(blFoot)

  const brFoot = new THREE.Mesh(footGeo, skinMat)
  brFoot.position.set(-0.5, 0.1, -0.8)
  brFoot.rotation.y = -0.5
  brFoot.castShadow = true
  guineaPig.add(brFoot)

  // Store references for animations
  guineaPig.userData = {
    body,
    head,
    leftEye,
    rightEye,
    nose,
    feet: { flFoot, frFoot, blFoot, brFoot },
    // Animation state
    animation: {
      isBlinking: false,
      blinkEndTime: 0,
      nextBlinkTime: Date.now() + Math.random() * 3000 + 2000, // 2-5 seconds
      walkPhase: 0,
      isWalking: false,
      breathPhase: Math.random() * Math.PI * 2, // Random start phase for variety
      // Store original foot positions for animation
      footRestPositions: {
        fl: { y: flFoot.position.y, z: flFoot.position.z },
        fr: { y: frFoot.position.y, z: frFoot.position.z },
        bl: { y: blFoot.position.y, z: blFoot.position.z },
        br: { y: brFoot.position.y, z: brFoot.position.z },
      },
    },
  }

  return guineaPig
}

/**
 * Dispose a guinea pig model and all its resources
 */
export function disposeGuineaPigModel(model: THREE.Group): void {
  disposeObject3D(model)
}

// Animation constants
const BLINK_DURATION = 150 // ms
const BLINK_MIN_INTERVAL = 2000 // ms
const BLINK_MAX_INTERVAL = 6000 // ms
const WALK_SPEED = 12 // Animation speed multiplier
const FOOT_LIFT_HEIGHT = 0.08
const FOOT_STRIDE_LENGTH = 0.1
// Breathing animation
const BREATH_SPEED = 1.5 // Slow breathing cycle
const BREATH_SCALE_AMOUNT = 0.005 // Very subtle 0.5% scale variation (matches demo)

// Sleep pose constants
const SLEEP_BODY_SCALE_Y = 0.85 // Squished/curled up look

// Grooming animation constants
const GROOM_SPEED = 8 // Speed of paw movement
const GROOM_LIFT_HEIGHT = 0.15 // How high front legs lift
const GROOM_PAW_RANGE = 0.12 // Range of pawing motion
const GROOM_SIT_UP_ANGLE = -0.25 // Tilt back to sit up on haunches (radians)

// Playing animation constants
const PLAY_SHAKE_SPEED = 10 // Speed of head shake
const PLAY_SHAKE_AMOUNT = 0.4 // How much the head shakes side to side (pronounced)
const PLAY_NOD_SPEED = 6 // Speed of headbutt nod
const PLAY_NOD_AMOUNT = 0.3 // How far head nods forward for headbutt

// Chewing animation constants
const CHEW_SPEED = 8 // Speed of gnawing motion
const CHEW_SHAKE_AMOUNT = 0.15 // Subtle side-to-side head shake while chewing
const CHEW_NOD_AMOUNT = 0.08 // Small up-down gnawing motion

// Popcorn animation constants (happy jump after playing)
const POPCORN_JUMP_HEIGHT = 1.5 // How high the guinea pig jumps
const POPCORN_TWIST_AMOUNT = 0.4 // How much body twists during jump
const POPCORN_DURATION = 0.5 // Duration of one popcorn hop in seconds

/**
 * Update guinea pig animations (call every frame)
 * @param model - The guinea pig THREE.Group
 * @param isMoving - Whether the guinea pig is currently walking
 * @param deltaTime - Time since last frame in seconds
 * @param isPaused - Whether animations should be frozen (game paused)
 * @param isSleeping - Whether the guinea pig is sleeping (closed eyes, laying pose)
 * @param isGrooming - Whether the guinea pig is grooming (front leg pawing motion)
 * @param isPlaying - Whether the guinea pig is playing with a toy (head shake)
 * @param isHeadbutting - Whether the guinea pig is headbutting a toy (nod forward)
 * @param isChewing - Whether the guinea pig is chewing on an item (gnawing motion)
 * @param isPopcorning - Whether the guinea pig is doing a happy popcorn jump
 */
export function updateGuineaPigAnimation(
  model: THREE.Group,
  isMoving: boolean,
  deltaTime: number,
  isPaused: boolean = false,
  isSleeping: boolean = false,
  isGrooming: boolean = false,
  isPlaying: boolean = false,
  isHeadbutting: boolean = false,
  isChewing: boolean = false,
  isPopcorning: boolean = false
): void {
  const { body, head, leftEye, rightEye, feet, animation } = model.userData
  if (!animation) return

  // When paused, freeze all animations completely
  if (isPaused) {
    return
  }

  const now = Date.now()

  // === SLEEPING STATE ===
  if (isSleeping) {
    // Eyes closed (no blinking)
    leftEye.scale.y = 0.1
    rightEye.scale.y = 0.1

    // Laying pose - squished body
    if (body) {
      // Continue breathing but with laying scale
      animation.breathPhase += deltaTime * BREATH_SPEED
      const breathScale = SLEEP_BODY_SCALE_Y + Math.sin(animation.breathPhase) * BREATH_SCALE_AMOUNT
      body.scale.set(1, breathScale, 1)
    }

    // Return feet to rest position (no walking)
    const { flFoot, frFoot, blFoot, brFoot } = feet
    const rest = animation.footRestPositions
    const returnSpeed = 5 * deltaTime

    flFoot.position.y += (rest.fl.y - flFoot.position.y) * returnSpeed
    flFoot.position.z += (rest.fl.z - flFoot.position.z) * returnSpeed
    frFoot.position.y += (rest.fr.y - frFoot.position.y) * returnSpeed
    frFoot.position.z += (rest.fr.z - frFoot.position.z) * returnSpeed
    blFoot.position.y += (rest.bl.y - blFoot.position.y) * returnSpeed
    blFoot.position.z += (rest.bl.z - blFoot.position.z) * returnSpeed
    brFoot.position.y += (rest.br.y - brFoot.position.y) * returnSpeed
    brFoot.position.z += (rest.br.z - brFoot.position.z) * returnSpeed

    return // Skip normal animations
  }

  // === GROOMING STATE ===
  if (isGrooming) {
    const { flFoot, frFoot, blFoot, brFoot } = feet
    const rest = animation.footRestPositions

    // Advance groom phase
    animation.groomPhase = (animation.groomPhase || 0) + deltaTime * GROOM_SPEED

    // Sit up on haunches - tilt body back
    if (body) {
      // Smoothly transition to sit-up pose
      const targetRotation = GROOM_SIT_UP_ANGLE
      body.rotation.x += (targetRotation - body.rotation.x) * 5 * deltaTime

      // Continue breathing animation while sitting up
      animation.breathPhase += deltaTime * BREATH_SPEED
      const breathScale = 1 + Math.sin(animation.breathPhase) * BREATH_SCALE_AMOUNT
      body.scale.set(1, breathScale, 1)
    }

    // Front legs lift and paw at face (alternating motion)
    const pawMotion = Math.sin(animation.groomPhase)
    const pawMotion2 = Math.sin(animation.groomPhase + Math.PI * 0.5) // Offset for alternating

    // Front-left foot: lift up higher and move forward/back (paws at face)
    flFoot.position.y = rest.fl.y + GROOM_LIFT_HEIGHT * 1.5 + Math.abs(pawMotion) * 0.08
    flFoot.position.z = rest.fl.z + GROOM_PAW_RANGE + pawMotion * GROOM_PAW_RANGE

    // Front-right foot: slightly offset timing for natural look
    frFoot.position.y = rest.fr.y + GROOM_LIFT_HEIGHT * 1.5 + Math.abs(pawMotion2) * 0.08
    frFoot.position.z = rest.fr.z + GROOM_PAW_RANGE + pawMotion2 * GROOM_PAW_RANGE

    // Back legs stay planted (supporting the sit-up)
    const returnSpeed = 5 * deltaTime
    blFoot.position.y += (rest.bl.y - blFoot.position.y) * returnSpeed
    blFoot.position.z += (rest.bl.z - blFoot.position.z) * returnSpeed
    brFoot.position.y += (rest.br.y - brFoot.position.y) * returnSpeed
    brFoot.position.z += (rest.br.z - brFoot.position.z) * returnSpeed

    // Eyes slightly squinted during grooming (concentrating)
    leftEye.scale.y = 0.7
    rightEye.scale.y = 0.7

    return // Skip normal animations
  }

  // === PLAYING STATE ===
  if (isPlaying || isHeadbutting) {
    const { flFoot, frFoot, blFoot, brFoot } = feet
    const rest = animation.footRestPositions

    // Advance play phase
    animation.playPhase = (animation.playPhase || 0) + deltaTime * (isHeadbutting ? PLAY_NOD_SPEED : PLAY_SHAKE_SPEED)

    // Continue breathing animation
    animation.breathPhase += deltaTime * BREATH_SPEED
    const breathScale = 1 + Math.sin(animation.breathPhase) * BREATH_SCALE_AMOUNT
    if (body) {
      body.scale.set(1, breathScale, 1)
    }

    if (head) {
      if (isHeadbutting) {
        // Headbutt motion - strong nod forward
        const nodProgress = Math.sin(animation.playPhase)
        // Nod forward quickly then back
        head.rotation.x = nodProgress > 0 ? nodProgress * PLAY_NOD_AMOUNT : 0
        head.rotation.y = 0 // Reset horizontal rotation
      } else {
        // Shake head side to side (like shaking a toy)
        const shakeMotion = Math.sin(animation.playPhase)
        head.rotation.y = shakeMotion * PLAY_SHAKE_AMOUNT
        // Slight up-down motion too
        head.rotation.x = Math.abs(shakeMotion) * 0.05
      }
    }

    // Front legs slightly lifted (gripping toy)
    flFoot.position.y = rest.fl.y + 0.05
    frFoot.position.y = rest.fr.y + 0.05

    // Return back legs to rest
    const returnSpeed = 5 * deltaTime
    blFoot.position.y += (rest.bl.y - blFoot.position.y) * returnSpeed
    blFoot.position.z += (rest.bl.z - blFoot.position.z) * returnSpeed
    brFoot.position.y += (rest.br.y - brFoot.position.y) * returnSpeed
    brFoot.position.z += (rest.br.z - brFoot.position.z) * returnSpeed

    // Eyes wide open (excited)
    leftEye.scale.y = 1.1
    rightEye.scale.y = 1.1

    return // Skip normal animations
  }

  // === CHEWING STATE ===
  if (isChewing) {
    const { flFoot, frFoot, blFoot, brFoot } = feet
    const rest = animation.footRestPositions

    // Advance chew phase
    animation.chewPhase = (animation.chewPhase || 0) + deltaTime * CHEW_SPEED

    // Continue breathing animation
    animation.breathPhase += deltaTime * BREATH_SPEED
    const breathScale = 1 + Math.sin(animation.breathPhase) * BREATH_SCALE_AMOUNT
    if (body) {
      body.scale.set(1, breathScale, 1)
    }

    if (head) {
      // Gnawing motion - subtle head shake plus small up-down nodding
      const gnawMotion = Math.sin(animation.chewPhase)
      const gnawMotion2 = Math.sin(animation.chewPhase * 1.5) // Faster secondary motion

      // Side-to-side shake (like shaking a stick in mouth)
      head.rotation.y = gnawMotion * CHEW_SHAKE_AMOUNT
      // Small up-down gnawing motion
      head.rotation.x = Math.abs(gnawMotion2) * CHEW_NOD_AMOUNT
    }

    // Front legs slightly lifted (gripping chew item)
    flFoot.position.y = rest.fl.y + 0.03
    frFoot.position.y = rest.fr.y + 0.03

    // Return back legs to rest
    const returnSpeed = 5 * deltaTime
    blFoot.position.y += (rest.bl.y - blFoot.position.y) * returnSpeed
    blFoot.position.z += (rest.bl.z - blFoot.position.z) * returnSpeed
    brFoot.position.y += (rest.br.y - brFoot.position.y) * returnSpeed
    brFoot.position.z += (rest.br.z - brFoot.position.z) * returnSpeed

    // Eyes focused (concentrating on chewing)
    leftEye.scale.y = 0.9
    rightEye.scale.y = 0.9

    return // Skip normal animations
  }

  // === POPCORNING STATE (happy jump after playing) ===
  if (isPopcorning) {
    const { flFoot, frFoot, blFoot, brFoot } = feet
    const rest = animation.footRestPositions

    // Advance popcorn phase (0 to 1 over POPCORN_DURATION)
    animation.popcornPhase = (animation.popcornPhase || 0) + deltaTime / POPCORN_DURATION
    const phase = Math.min(animation.popcornPhase, 1)

    // Parabolic jump arc (0 at start/end, 1 at peak)
    const jumpArc = Math.sin(phase * Math.PI)
    model.position.y = jumpArc * POPCORN_JUMP_HEIGHT

    // Body twist during jump
    if (body) {
      body.rotation.z = Math.sin(phase * Math.PI * 2) * POPCORN_TWIST_AMOUNT
      // Slight forward tilt at peak
      body.rotation.x = -jumpArc * 0.15
    }

    // Legs kick out during jump
    const kickAmount = jumpArc * 0.3
    flFoot.position.y = rest.fl.y + kickAmount
    flFoot.position.z = rest.fl.z - kickAmount * 0.5
    frFoot.position.y = rest.fr.y + kickAmount
    frFoot.position.z = rest.fr.z - kickAmount * 0.5
    blFoot.position.y = rest.bl.y + kickAmount * 0.8
    blFoot.position.z = rest.bl.z + kickAmount * 0.5
    brFoot.position.y = rest.br.y + kickAmount * 0.8
    brFoot.position.z = rest.br.z + kickAmount * 0.5

    // Excited wide eyes
    leftEye.scale.y = 1.2
    rightEye.scale.y = 1.2

    return // Skip normal animations
  }

  // Reset model Y position if it was popcorning
  if (model.position.y > 0.01) {
    model.position.y *= 0.9 // Smooth return to ground
    if (model.position.y < 0.01) model.position.y = 0
  }

  // === BREATHING ANIMATION ===
  // Subtle body scale oscillation for lifelike appearance
  animation.breathPhase += deltaTime * BREATH_SPEED
  const breathScale = 1 + Math.sin(animation.breathPhase) * BREATH_SCALE_AMOUNT
  if (body) {
    body.scale.set(1, breathScale, 1) // Y-axis only (matches demo)
    // Reset body rotation if it was tilted (from grooming sit-up)
    if (Math.abs(body.rotation.x) > 0.001) {
      body.rotation.x += (0 - body.rotation.x) * 5 * deltaTime
    }
  }

  // Reset head rotation if it was tilted (from playing)
  if (head) {
    if (Math.abs(head.rotation.x) > 0.001) {
      head.rotation.x += (0 - head.rotation.x) * 5 * deltaTime
    }
    if (Math.abs(head.rotation.y) > 0.001) {
      head.rotation.y += (0 - head.rotation.y) * 5 * deltaTime
    }
  }

  // === BLINKING ANIMATION ===
  if (animation.isBlinking) {
    // Currently blinking - check if blink should end
    if (now >= animation.blinkEndTime) {
      // End blink - restore eye scale
      leftEye.scale.y = 1
      rightEye.scale.y = 1
      animation.isBlinking = false
      // Schedule next blink
      animation.nextBlinkTime = now + BLINK_MIN_INTERVAL + Math.random() * (BLINK_MAX_INTERVAL - BLINK_MIN_INTERVAL)
    }
  } else {
    // Not blinking - check if it's time to blink
    if (now >= animation.nextBlinkTime) {
      // Start blink - squash eyes
      leftEye.scale.y = 0.1
      rightEye.scale.y = 0.1
      animation.isBlinking = true
      animation.blinkEndTime = now + BLINK_DURATION
    }
  }

  // === WALKING ANIMATION ===
  animation.isWalking = isMoving

  if (isMoving) {
    // Advance walk phase
    animation.walkPhase += deltaTime * WALK_SPEED

    const { flFoot, frFoot, blFoot, brFoot } = feet
    const rest = animation.footRestPositions

    // Diagonal pairs move together (like a trot)
    // Front-left and back-right are one pair
    // Front-right and back-left are the other pair
    const phase1 = Math.sin(animation.walkPhase)
    const phase2 = Math.sin(animation.walkPhase + Math.PI) // Opposite phase

    // Front-left foot
    flFoot.position.y = rest.fl.y + Math.max(0, phase1) * FOOT_LIFT_HEIGHT
    flFoot.position.z = rest.fl.z + phase1 * FOOT_STRIDE_LENGTH

    // Back-right foot (same phase as front-left)
    brFoot.position.y = rest.br.y + Math.max(0, phase1) * FOOT_LIFT_HEIGHT
    brFoot.position.z = rest.br.z + phase1 * FOOT_STRIDE_LENGTH

    // Front-right foot (opposite phase)
    frFoot.position.y = rest.fr.y + Math.max(0, phase2) * FOOT_LIFT_HEIGHT
    frFoot.position.z = rest.fr.z + phase2 * FOOT_STRIDE_LENGTH

    // Back-left foot (same phase as front-right)
    blFoot.position.y = rest.bl.y + Math.max(0, phase2) * FOOT_LIFT_HEIGHT
    blFoot.position.z = rest.bl.z + phase2 * FOOT_STRIDE_LENGTH
  } else {
    // Not walking - smoothly return feet to rest position
    const { flFoot, frFoot, blFoot, brFoot } = feet
    const rest = animation.footRestPositions
    const returnSpeed = 5 * deltaTime

    flFoot.position.y += (rest.fl.y - flFoot.position.y) * returnSpeed
    flFoot.position.z += (rest.fl.z - flFoot.position.z) * returnSpeed
    frFoot.position.y += (rest.fr.y - frFoot.position.y) * returnSpeed
    frFoot.position.z += (rest.fr.z - frFoot.position.z) * returnSpeed
    blFoot.position.y += (rest.bl.y - blFoot.position.y) * returnSpeed
    blFoot.position.z += (rest.bl.z - blFoot.position.z) * returnSpeed
    brFoot.position.y += (rest.br.y - brFoot.position.y) * returnSpeed
    brFoot.position.z += (rest.br.z - brFoot.position.z) * returnSpeed
  }
}
