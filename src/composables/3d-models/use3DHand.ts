import * as THREE from 'three'

/**
 * Simpsons-style yellow hand for user interactions
 * Cartoonish, bubbly, with short stubby fingers
 *
 * Dimensions (in world units):
 * - Guinea pig: ~2 units tall, ~4 units long
 * - Hand: ~5 units wide, chunky and cute
 */

// Simpsons yellow color
const SIMPSONS_YELLOW = 0xffd90f

export interface Hand3DParts {
  palm: THREE.Mesh
  thumb: THREE.Group
  indexFinger: THREE.Group
  middleFinger: THREE.Group
  ringFinger: THREE.Group
  pinkyFinger: THREE.Group
  wrist: THREE.Mesh
}

export interface Hand3DUserData {
  parts: Hand3DParts
  animation: {
    // Finger curl amounts (0 = straight, 1 = fully curled)
    thumbCurl: number
    indexCurl: number
    middleCurl: number
    ringCurl: number
    pinkyCurl: number
    // Finger spread (for waving, etc.)
    fingerSpread: number
  }
}

/**
 * Create a single stubby cartoon finger (2 segments - base and tip)
 */
function createFinger(
  baseRadius: number,
  material: THREE.Material
): THREE.Group {
  const finger = new THREE.Group()

  // Base segment - chunky sphere
  const joint0 = new THREE.Group()
  joint0.name = 'joint0'

  const baseGeo = new THREE.SphereGeometry(baseRadius, 16, 12)
  baseGeo.scale(1, 1, 1.3) // Slightly elongated
  const baseMesh = new THREE.Mesh(baseGeo, material)
  baseMesh.position.z = baseRadius * 0.8
  baseMesh.castShadow = true
  baseMesh.name = 'segment0'
  joint0.add(baseMesh)
  finger.add(joint0)

  // Tip segment - smaller rounded sphere
  const joint1 = new THREE.Group()
  joint1.name = 'joint1'
  joint1.position.z = baseRadius * 1.8

  const tipRadius = baseRadius * 0.85
  const tipGeo = new THREE.SphereGeometry(tipRadius, 16, 12)
  tipGeo.scale(1, 1, 1.2)
  const tipMesh = new THREE.Mesh(tipGeo, material)
  tipMesh.position.z = tipRadius * 0.7
  tipMesh.castShadow = true
  tipMesh.name = 'segment1'
  joint1.add(tipMesh)
  joint0.add(joint1)

  // Fingertip - round ball at the end
  const joint2 = new THREE.Group()
  joint2.name = 'joint2'
  joint2.position.z = tipRadius * 1.5

  const tipBallRadius = tipRadius * 0.75
  const tipBallGeo = new THREE.SphereGeometry(tipBallRadius, 12, 8)
  const tipBallMesh = new THREE.Mesh(tipBallGeo, material)
  tipBallMesh.position.z = tipBallRadius * 0.5
  tipBallMesh.castShadow = true
  tipBallMesh.name = 'segment2'
  joint2.add(tipBallMesh)
  joint1.add(joint2)

  return finger
}

/**
 * Create a stubby thumb (2 segments)
 */
function createThumb(material: THREE.Material): THREE.Group {
  const thumb = new THREE.Group()
  const radius = 0.45

  // Base segment
  const joint0 = new THREE.Group()
  joint0.name = 'joint0'

  const baseGeo = new THREE.SphereGeometry(radius, 16, 12)
  baseGeo.scale(1, 1, 1.2)
  const baseMesh = new THREE.Mesh(baseGeo, material)
  baseMesh.position.z = radius * 0.6
  baseMesh.castShadow = true
  joint0.add(baseMesh)
  thumb.add(joint0)

  // Tip segment
  const joint1 = new THREE.Group()
  joint1.name = 'joint1'
  joint1.position.z = radius * 1.4

  const tipRadius = radius * 0.8
  const tipGeo = new THREE.SphereGeometry(tipRadius, 16, 12)
  const tipMesh = new THREE.Mesh(tipGeo, material)
  tipMesh.position.z = tipRadius * 0.5
  tipMesh.castShadow = true
  joint1.add(tipMesh)
  joint0.add(joint1)

  return thumb
}

/**
 * Create the 3D hand model - cartoonish, bubbly style
 * Returns a THREE.Group with the hand facing forward (fingers pointing +Z)
 */
export function createHandModel(): THREE.Group {
  const hand = new THREE.Group()

  // Material - Simpsons yellow, soft matte look
  const skinMat = new THREE.MeshStandardMaterial({
    color: SIMPSONS_YELLOW,
    roughness: 0.7,
    metalness: 0.0,
  })

  // Palm - big puffy rounded rectangle, like a cartoon mitten
  const palmWidth = 2.8
  const palmHeight = 1.2
  const palmDepth = 2.2

  // Use a sphere scaled into a puffy palm shape
  const palmGeo = new THREE.SphereGeometry(1, 24, 18)
  palmGeo.scale(palmWidth / 2, palmHeight / 2, palmDepth / 2)

  const palm = new THREE.Mesh(palmGeo, skinMat)
  palm.castShadow = true
  palm.receiveShadow = true
  palm.name = 'palm'
  hand.add(palm)

  // Wrist - chunky cylinder
  const wristGeo = new THREE.SphereGeometry(0.8, 16, 12)
  wristGeo.scale(1, 0.8, 1.2)
  const wrist = new THREE.Mesh(wristGeo, skinMat)
  wrist.position.z = -palmDepth / 2 - 0.3
  wrist.castShadow = true
  wrist.name = 'wrist'
  hand.add(wrist)

  // Finger positions - spread across the palm, stubby fingers
  const fingerXPositions = [0.85, 0.3, -0.3, -0.85]
  const fingerRadii = [0.38, 0.42, 0.40, 0.34] // Chunky!
  const fingerNames = ['indexFinger', 'middleFinger', 'ringFinger', 'pinkyFinger']

  const fingers: THREE.Group[] = []

  for (let i = 0; i < 4; i++) {
    const finger = createFinger(fingerRadii[i], skinMat)
    finger.position.set(fingerXPositions[i], 0.1, palmDepth / 2 - 0.2)
    finger.name = fingerNames[i]
    hand.add(finger)
    fingers.push(finger)
  }

  // Thumb - positioned on side of palm, angled outward
  const thumb = createThumb(skinMat)
  thumb.position.set(palmWidth / 2 - 0.1, 0, -0.3)
  thumb.rotation.y = Math.PI / 3.5 // Angle outward
  thumb.rotation.z = -Math.PI / 8 // Slight tilt
  thumb.name = 'thumb'
  hand.add(thumb)

  // Store references for animation
  hand.userData = {
    parts: {
      palm,
      wrist,
      thumb,
      indexFinger: fingers[0],
      middleFinger: fingers[1],
      ringFinger: fingers[2],
      pinkyFinger: fingers[3],
    },
    animation: {
      thumbCurl: 0,
      indexCurl: 0,
      middleCurl: 0,
      ringCurl: 0,
      pinkyCurl: 0,
      fingerSpread: 0,
    },
  } as Hand3DUserData

  return hand
}

/**
 * Curl a finger by rotating its joints
 * @param finger - The finger group to curl
 * @param amount - Curl amount from 0 (straight) to 1 (fully curled)
 */
export function curlFinger(finger: THREE.Group, amount: number): void {
  const maxCurl = Math.PI / 2.5 // Less curl for stubby fingers

  // Get all joints and curl them
  for (let i = 0; i < 3; i++) {
    const joint = finger.getObjectByName(`joint${i}`) as THREE.Group
    if (joint) {
      // Each joint curls slightly less than the previous
      const jointAmount = amount * (1 - i * 0.15)
      joint.rotation.x = -jointAmount * maxCurl
    }
  }
}

/**
 * Curl the thumb
 */
export function curlThumb(thumb: THREE.Group, amount: number): void {
  const maxCurl = Math.PI / 3 // 60 degrees per joint

  const joint0 = thumb.getObjectByName('joint0') as THREE.Group
  const joint1 = thumb.getObjectByName('joint1') as THREE.Group

  if (joint0) joint0.rotation.x = -amount * maxCurl
  if (joint1) joint1.rotation.x = -amount * maxCurl * 0.7
}

/**
 * Apply animation state to the hand
 */
export function updateHandAnimation(hand: THREE.Group): void {
  const userData = hand.userData as Hand3DUserData
  if (!userData?.parts) return

  const { parts, animation } = userData

  // Apply finger curls
  curlFinger(parts.indexFinger, animation.indexCurl)
  curlFinger(parts.middleFinger, animation.middleCurl)
  curlFinger(parts.ringFinger, animation.ringCurl)
  curlFinger(parts.pinkyFinger, animation.pinkyCurl)
  curlThumb(parts.thumb, animation.thumbCurl)

  // Apply finger spread
  const spreadAngle = animation.fingerSpread * 0.12 // Subtle spread for stubby fingers
  parts.indexFinger.rotation.y = spreadAngle * 1.2
  parts.middleFinger.rotation.y = spreadAngle * 0.4
  parts.ringFinger.rotation.y = -spreadAngle * 0.4
  parts.pinkyFinger.rotation.y = -spreadAngle * 1.2
}

/**
 * Set hand to a predefined pose
 */
export function setHandPose(
  hand: THREE.Group,
  pose: 'open' | 'closed' | 'pointing' | 'petting' | 'holding' | 'wave' | 'gripping'
): void {
  const userData = hand.userData as Hand3DUserData
  if (!userData?.animation) return

  const anim = userData.animation

  switch (pose) {
    case 'open':
      anim.thumbCurl = 0
      anim.indexCurl = 0
      anim.middleCurl = 0
      anim.ringCurl = 0
      anim.pinkyCurl = 0
      anim.fingerSpread = 0.5
      break

    case 'closed':
      anim.thumbCurl = 0.9
      anim.indexCurl = 1
      anim.middleCurl = 1
      anim.ringCurl = 1
      anim.pinkyCurl = 1
      anim.fingerSpread = 0
      break

    case 'pointing':
      anim.thumbCurl = 0.7
      anim.indexCurl = 0
      anim.middleCurl = 1
      anim.ringCurl = 1
      anim.pinkyCurl = 1
      anim.fingerSpread = 0
      break

    case 'petting':
      // Slightly curved fingers for gentle petting motion
      anim.thumbCurl = 0.25
      anim.indexCurl = 0.25
      anim.middleCurl = 0.2
      anim.ringCurl = 0.15
      anim.pinkyCurl = 0.15
      anim.fingerSpread = 0.25
      break

    case 'holding':
      // Cupped hand for holding guinea pig
      anim.thumbCurl = 0.5
      anim.indexCurl = 0.55
      anim.middleCurl = 0.55
      anim.ringCurl = 0.55
      anim.pinkyCurl = 0.55
      anim.fingerSpread = 0.15
      break

    case 'wave':
      // Open hand for waving
      anim.thumbCurl = 0.15
      anim.indexCurl = 0
      anim.middleCurl = 0
      anim.ringCurl = 0
      anim.pinkyCurl = 0
      anim.fingerSpread = 0.7
      break

    case 'gripping':
      // Pinched fingers pose (like 🤌 emoji)
      anim.thumbCurl = 0.85
      anim.indexCurl = 0.9
      anim.middleCurl = 0.9
      anim.ringCurl = 0.85
      anim.pinkyCurl = 0.8
      anim.fingerSpread = -0.2
      break
  }

  updateHandAnimation(hand)
}

/**
 * Cleanup hand resources
 */
export function disposeHand(hand: THREE.Group): void {
  hand.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose()
      if (child.material instanceof THREE.Material) {
        child.material.dispose()
      }
    }
  })
}
