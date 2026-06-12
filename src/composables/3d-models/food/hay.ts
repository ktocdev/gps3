import * as THREE from 'three'
import { ITEM_CONFIG } from '../../../constants/3d'
import { seededRandom } from '../shared/utils'

/**
 * Create a simplified hay pile for bowls
 * Wider strands like thin tape with bends and angles
 * @param servings - Number of hay servings (1 or 2+)
 * @param seed - Seed for deterministic random placement (prevents animation)
 */
export function createHayPile(servings: number = 2, seed: number = 12345): THREE.Group {
  const group = new THREE.Group()
  const { HAY } = ITEM_CONFIG

  // Use seeded random for deterministic placement
  const random = seededRandom(seed)

  // Calculate instance counts based on servings
  // 1 serving = 50%, 2+ servings = 100%
  const servingMultiplier = servings >= 2 ? 1.0 : 0.5
  const uprightCount = Math.floor(HAY.INSTANCES_UPRIGHT * servingMultiplier)
  const flatCount = Math.floor(HAY.INSTANCES_FLAT * servingMultiplier)

  // Create upright hay strands
  const uprightGeo = new THREE.BoxGeometry(HAY.STRAND_WIDTH, 1.0, HAY.STRAND_THICKNESS)
  uprightGeo.translate(0, 0.5, 0) // Pivot at bottom

  const uprightMat = new THREE.MeshStandardMaterial({
    roughness: 1.0,
    side: THREE.DoubleSide,
  })

  const uprightHay = new THREE.InstancedMesh(uprightGeo, uprightMat, uprightCount)
  uprightHay.castShadow = true
  uprightHay.receiveShadow = true
  uprightHay.matrixAutoUpdate = false // Disable auto-updates

  const dummy = new THREE.Object3D()

  // Place upright strands
  for (let i = 0; i < uprightCount; i++) {
    // Circular distribution
    const radius = Math.sqrt(random()) * 1.25
    const angle = random() * Math.PI * 2
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius

    // Position with height variation
    const y = radius > 0.7 ? 0 : (random() * 0.6)
    dummy.position.set(x, y, z)

    // Natural hay angles - varied lean in all directions
    // Lean outward from center for natural "exploding" look
    const leanAngle = Math.atan2(z, x) // Angle from center
    const leanAmount = 0.3 + random() * 0.6 // Random lean 0.3-0.9 radians (17-52 degrees)

    dummy.rotation.set(
      Math.sin(leanAngle) * leanAmount, // Lean along angle from center
      random() * Math.PI * 2, // Random spin
      Math.cos(leanAngle) * leanAmount  // Lean perpendicular to angle
    )

    // Length variation
    const lengthScale = 0.5 + random() * 0.5
    dummy.scale.set(1, lengthScale, 1)

    dummy.updateMatrix()
    uprightHay.setMatrixAt(i, dummy.matrix)

    // Random color from palette
    const color = new THREE.Color(HAY.COLORS[Math.floor(random() * HAY.COLORS.length)])
    uprightHay.setColorAt(i, color)
  }

  // Finalize instance matrices
  uprightHay.instanceMatrix.needsUpdate = true
  if (uprightHay.instanceColor) {
    uprightHay.instanceColor.needsUpdate = true
  }

  group.add(uprightHay)

  // Create flat hay strands
  const flatGeo = new THREE.BoxGeometry(HAY.STRAND_WIDTH * 1.25, 1.0, HAY.STRAND_THICKNESS * 0.8)

  const flatMat = new THREE.MeshStandardMaterial({
    roughness: 1.0,
    side: THREE.DoubleSide,
  })

  const flatHay = new THREE.InstancedMesh(flatGeo, flatMat, flatCount)
  flatHay.castShadow = true
  flatHay.receiveShadow = true
  flatHay.matrixAutoUpdate = false // Disable auto-updates

  // Place flat strands
  for (let i = 0; i < flatCount; i++) {
    // Slightly larger circular distribution
    const radius = Math.sqrt(random()) * 1.35
    const angle = random() * Math.PI * 2
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius

    // Height variation
    const y = 0.1 + random() * 1.2
    dummy.position.set(x, y, z)

    // Mostly horizontal with variation
    dummy.rotation.set(
      Math.PI / 2 + (random() - 0.5) * 0.4, // Near horizontal with variation
      random() * Math.PI * 2,               // Random spin
      (random() - 0.5) * 0.3                // Slight roll
    )

    // Length variation
    const lengthScale = 0.4 + random() * 0.4
    dummy.scale.set(1, lengthScale, 1)

    dummy.updateMatrix()
    flatHay.setMatrixAt(i, dummy.matrix)

    // Random color from palette
    const color = new THREE.Color(HAY.COLORS[Math.floor(random() * HAY.COLORS.length)])
    flatHay.setColorAt(i, color)
  }

  // Finalize instance matrices
  flatHay.instanceMatrix.needsUpdate = true
  if (flatHay.instanceColor) {
    flatHay.instanceColor.needsUpdate = true
  }

  group.add(flatHay)

  return group
}
