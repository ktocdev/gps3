import * as THREE from 'three'
import { seededRandom } from '../shared/utils'

/**
 * Create a pile of torn green leaf lettuce pieces
 * Ruffled leaf shapes with light green coloring
 * @param count - Number of lettuce pieces (default 12)
 * @param seed - Seed for deterministic random placement
 */
export function createLettucePile(count: number = 12, seed: number = 98765): THREE.Group {
  const group = new THREE.Group()

  // Use seeded random for deterministic placement
  const random = seededRandom(seed)

  // Create a wavy leaf geometry by displacing a plane
  const leafGeo = new THREE.PlaneGeometry(0.8, 0.6, 8, 6)

  // Displace vertices to create ruffled edges
  const positions = leafGeo.attributes.position
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i)
    const y = positions.getY(i)

    // Create wavy edges - more displacement at edges
    const edgeFactor = Math.abs(x) / 0.4 + Math.abs(y) / 0.3
    const wave = Math.sin(x * 8) * 0.05 + Math.sin(y * 6) * 0.04

    // Vertical displacement for 3D ruffled look
    const z = wave * edgeFactor * 0.8

    positions.setZ(i, z)
  }

  leafGeo.computeVertexNormals()

  // Light green lettuce colors (slight variation)
  const leafColors = [
    0x90EE90, // Light green
    0x7CCD7C, // Medium light green
    0x9ACD32, // Yellow-green
    0x8FBC8F, // Dark sea green (for depth)
    0xADFF2F, // Green-yellow (bright pieces)
  ]

  // Distribute pieces among color groups
  const piecesPerColor = Math.ceil(count / leafColors.length)

  leafColors.forEach((color, colorIndex) => {
    const piecesForThisColor = Math.min(
      piecesPerColor,
      count - colorIndex * piecesPerColor
    )
    if (piecesForThisColor <= 0) return

    const mat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.7,
      metalness: 0.0,
      side: THREE.DoubleSide,
    })

    const leaves = new THREE.InstancedMesh(leafGeo, mat, piecesForThisColor)
    leaves.castShadow = true
    leaves.receiveShadow = true

    const dummy = new THREE.Object3D()

    for (let i = 0; i < piecesForThisColor; i++) {
      // Circular distribution with clustering toward center
      const radius = Math.sqrt(random()) * 0.7
      const angle = random() * Math.PI * 2
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius

      // Height - pieces stack loosely on each other
      // Y offset of -0.4 to sit in bowl (similar to other foods)
      const layerHeight = (colorIndex * piecesPerColor + i) * 0.08
      const y = -0.4 + layerHeight + random() * 0.1

      dummy.position.set(x, y, z)

      // Random rotation - mostly flat but with tilt
      dummy.rotation.set(
        -Math.PI / 2 + (random() - 0.5) * 0.6, // Mostly horizontal
        random() * Math.PI * 2,                 // Random spin
        (random() - 0.5) * 0.4                  // Slight roll
      )

      // Slight scale variation for natural look
      const scale = 0.7 + random() * 0.6
      dummy.scale.set(scale, scale, 1)

      dummy.updateMatrix()
      leaves.setMatrixAt(i, dummy.matrix)
    }

    leaves.instanceMatrix.needsUpdate = true
    group.add(leaves)
  })

  return group
}
