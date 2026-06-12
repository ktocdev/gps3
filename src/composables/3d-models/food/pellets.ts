import * as THREE from 'three'
import { seededRandom } from '../shared/utils'

/**
 * Create a pile of guinea pig food pellets
 * Small cylinders with flat ends in golden beige color
 * @param count - Number of pellets (default 15)
 * @param seed - Seed for deterministic random placement
 */
export function createPelletPile(count: number = 15, seed: number = 54321): THREE.Group {
  const group = new THREE.Group()

  // Use seeded random for deterministic placement
  const random = seededRandom(seed)

  // Pellet geometry - small cylinder with flat ends
  // Slightly smaller than poop pellets, more uniform
  const pelletGeo = new THREE.CylinderGeometry(
    0.08,  // radiusTop
    0.08,  // radiusBottom (same = flat ends)
    0.22,  // height
    8      // radialSegments (octagonal for performance)
  )

  // Golden beige color - warmer than poop brown
  const pelletMat = new THREE.MeshStandardMaterial({
    color: 0xC9A66B, // Golden beige/tan
    roughness: 0.7,
    metalness: 0.0,
  })

  const pellets = new THREE.InstancedMesh(pelletGeo, pelletMat, count)
  pellets.castShadow = true
  pellets.receiveShadow = true

  const dummy = new THREE.Object3D()

  // Place pellets in a scattered pile
  for (let i = 0; i < count; i++) {
    // Circular distribution with some clustering toward center
    const radius = Math.sqrt(random()) * 0.6 // Smaller pile than hay
    const angle = random() * Math.PI * 2
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius

    // Height - pellets stack slightly on each other
    // Lower pellets at base, higher ones stacked on top
    // Y offset of -0.5 to sit lower in bowl (like carrot at -0.6)
    const layer = Math.floor(i / 5) // Roughly 3 layers of 5
    const y = -0.5 + layer * 0.12 + random() * 0.08

    dummy.position.set(x, y, z)

    // Lay pellet flat with random horizontal direction
    // Each pellet points in a different direction when viewed from above
    const horizontalDirection = random() * Math.PI * 2  // 0 to 360 degrees
    const tiltVariation = (random() - 0.5) * 0.3        // Slight pitch variation
    const rollVariation = (random() - 0.5) * 0.4        // Slight roll variation

    // Use YXZ order: Y rotation (direction) applied first while upright,
    // then X rotation (lay flat), then Z (roll)
    dummy.rotation.order = 'YXZ'
    dummy.rotation.set(
      Math.PI / 2 + tiltVariation, // X: Lay horizontal (applied second)
      horizontalDirection,          // Y: Random direction (applied first)
      rollVariation                 // Z: Slight roll (applied third)
    )

    dummy.scale.set(1, 1, 1)
    dummy.updateMatrix()
    pellets.setMatrixAt(i, dummy.matrix)
  }

  pellets.instanceMatrix.needsUpdate = true
  group.add(pellets)

  return group
}
