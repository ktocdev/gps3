import * as THREE from 'three'
import { useHabitatConditions } from '../../../stores/habitatConditions'
import { createWoodTexture } from '../shared/textures'
import { seededRandom } from '../shared/utils'
import { ITEM_CONFIG } from '../../../constants/3d'

/**
 * Create a cylindrical wooden hay rack model
 * Based on real hay racks with vertical dowels and wooden top/bottom
 */
export function createHayRackModel(hayRackItemId: string): THREE.Group {
  const group = new THREE.Group()
  const habitatConditions = useHabitatConditions()

  // Configuration
  const config = {
    baseRadius: 1.5,
    topRadius: 1.6,
    height: 3.0,
    baseThickness: 0.15,
    topRingThickness: 0.12,
    topRingWidth: 0.2,
    dowelRadius: 0.08,
    dowelCount: 10,
    woodColor: 0xDEB887, // Burlywood
  }

  // Create wood texture
  const woodTexture = createWoodTexture()

  // Wood material for all wooden parts
  const woodMaterial = new THREE.MeshStandardMaterial({
    map: woodTexture,
    color: config.woodColor,
    roughness: 0.8,
    metalness: 0.0,
  })

  // === Base Disc ===
  const baseGeo = new THREE.CylinderGeometry(
    config.baseRadius,
    config.baseRadius,
    config.baseThickness,
    32
  )
  const base = new THREE.Mesh(baseGeo, woodMaterial)
  base.position.y = config.baseThickness / 2
  base.castShadow = true
  base.receiveShadow = true
  group.add(base)

  // === Top Ring ===
  // Create a torus-like ring using a tube geometry following a circular path
  const topRingGeo = new THREE.TorusGeometry(
    config.topRadius - config.topRingWidth / 2,
    config.topRingWidth / 2,
    8,
    32
  )
  const topRing = new THREE.Mesh(topRingGeo, woodMaterial)
  topRing.position.y = config.height
  topRing.rotation.x = Math.PI / 2 // Rotate to horizontal
  topRing.castShadow = true
  topRing.receiveShadow = true
  group.add(topRing)

  // === Vertical Dowels ===
  const dowelGeo = new THREE.CylinderGeometry(
    config.dowelRadius,
    config.dowelRadius,
    config.height - config.baseThickness,
    8
  )

  for (let i = 0; i < config.dowelCount; i++) {
    const angle = (i / config.dowelCount) * Math.PI * 2
    const x = Math.cos(angle) * (config.baseRadius - config.dowelRadius * 2)
    const z = Math.sin(angle) * (config.baseRadius - config.dowelRadius * 2)

    const dowel = new THREE.Mesh(dowelGeo, woodMaterial)
    dowel.position.set(x, config.baseThickness + (config.height - config.baseThickness) / 2, z)
    dowel.castShadow = true
    dowel.receiveShadow = true
    group.add(dowel)
  }

  // === Hay Inside (if rack has contents) ===
  const hayServings = habitatConditions.getHayRackContents(hayRackItemId)
  const servingCount = hayServings.length

  if (servingCount > 0) {
    const hayGroup = createHayRackHay(servingCount, hayRackItemId, config)
    group.add(hayGroup)
  }

  return group
}

/**
 * Create hay strands specifically for the hay rack
 * Hay pokes through the dowels and fills the interior
 */
function createHayRackHay(
  servings: number,
  hayRackItemId: string,
  config: { baseRadius: number; height: number; baseThickness: number }
): THREE.Group {
  const group = new THREE.Group()
  const { HAY } = ITEM_CONFIG

  // Generate consistent seed from hayRackItemId
  const seed = hayRackItemId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const random = seededRandom(seed)

  // Scale hay amount based on servings (max 5 servings for full rack)
  const fillLevel = Math.min(servings / 5, 1.0)
  const maxHeight = config.height * 0.85 * fillLevel

  // Interior hay strands (mostly vertical, poking up)
  const interiorCount = Math.floor(150 * fillLevel)
  const interiorGeo = new THREE.BoxGeometry(HAY.STRAND_WIDTH * 1.2, 1.0, HAY.STRAND_THICKNESS)
  interiorGeo.translate(0, 0.5, 0) // Pivot at bottom

  const interiorMat = new THREE.MeshStandardMaterial({
    roughness: 1.0,
    side: THREE.DoubleSide,
  })

  const interiorHay = new THREE.InstancedMesh(interiorGeo, interiorMat, interiorCount)
  interiorHay.castShadow = true
  interiorHay.receiveShadow = true

  const dummy = new THREE.Object3D()

  for (let i = 0; i < interiorCount; i++) {
    // Distribute within cylinder
    const radius = Math.sqrt(random()) * (config.baseRadius * 0.75)
    const angle = random() * Math.PI * 2
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius

    // Height from base
    const baseY = config.baseThickness + random() * maxHeight * 0.3
    dummy.position.set(x, baseY, z)

    // Mostly upright with some lean
    const leanAmount = 0.1 + random() * 0.4
    dummy.rotation.set(
      (random() - 0.5) * leanAmount,
      random() * Math.PI * 2,
      (random() - 0.5) * leanAmount
    )

    // Varying lengths
    const lengthScale = 0.4 + random() * 0.6
    dummy.scale.set(1, lengthScale * maxHeight * 0.5, 1)

    dummy.updateMatrix()
    interiorHay.setMatrixAt(i, dummy.matrix)

    // Random hay color
    const color = new THREE.Color(HAY.COLORS[Math.floor(random() * HAY.COLORS.length)])
    interiorHay.setColorAt(i, color)
  }

  interiorHay.instanceMatrix.needsUpdate = true
  if (interiorHay.instanceColor) {
    interiorHay.instanceColor.needsUpdate = true
  }
  group.add(interiorHay)

  // Poking-out hay strands (visible between dowels)
  const pokingCount = Math.floor(80 * fillLevel)
  const pokingGeo = new THREE.BoxGeometry(HAY.STRAND_WIDTH, 1.0, HAY.STRAND_THICKNESS)
  pokingGeo.translate(0, 0.5, 0)

  const pokingMat = new THREE.MeshStandardMaterial({
    roughness: 1.0,
    side: THREE.DoubleSide,
  })

  const pokingHay = new THREE.InstancedMesh(pokingGeo, pokingMat, pokingCount)
  pokingHay.castShadow = true
  pokingHay.receiveShadow = true

  for (let i = 0; i < pokingCount; i++) {
    // Position at edge of rack
    const angle = random() * Math.PI * 2
    const edgeRadius = config.baseRadius * (0.85 + random() * 0.3)
    const x = Math.cos(angle) * edgeRadius
    const z = Math.sin(angle) * edgeRadius

    // Random height along the rack
    const y = config.baseThickness + random() * maxHeight
    dummy.position.set(x, y, z)

    // Point outward and slightly up/down
    const outwardAngle = angle + Math.PI / 2 + (random() - 0.5) * 0.5
    dummy.rotation.set(
      (random() - 0.5) * 0.8,
      outwardAngle,
      Math.PI / 2 + (random() - 0.5) * 0.6
    )

    // Shorter strands poking out
    const lengthScale = 0.2 + random() * 0.3
    dummy.scale.set(1, lengthScale, 1)

    dummy.updateMatrix()
    pokingHay.setMatrixAt(i, dummy.matrix)

    // Random hay color
    const color = new THREE.Color(HAY.COLORS[Math.floor(random() * HAY.COLORS.length)])
    pokingHay.setColorAt(i, color)
  }

  pokingHay.instanceMatrix.needsUpdate = true
  if (pokingHay.instanceColor) {
    pokingHay.instanceColor.needsUpdate = true
  }
  group.add(pokingHay)

  // Top overflow hay (some strands stick out the top)
  if (fillLevel > 0.5) {
    const topCount = Math.floor(40 * (fillLevel - 0.5) * 2)
    const topGeo = new THREE.BoxGeometry(HAY.STRAND_WIDTH, 1.0, HAY.STRAND_THICKNESS)
    topGeo.translate(0, 0.5, 0)

    const topMat = new THREE.MeshStandardMaterial({
      roughness: 1.0,
      side: THREE.DoubleSide,
    })

    const topHay = new THREE.InstancedMesh(topGeo, topMat, topCount)
    topHay.castShadow = true

    for (let i = 0; i < topCount; i++) {
      const radius = random() * config.baseRadius * 0.7
      const angle = random() * Math.PI * 2
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius

      dummy.position.set(x, config.height * 0.9, z)

      // Various angles sticking up
      dummy.rotation.set(
        (random() - 0.5) * 0.6,
        random() * Math.PI * 2,
        (random() - 0.5) * 0.6
      )

      const lengthScale = 0.3 + random() * 0.4
      dummy.scale.set(1, lengthScale, 1)

      dummy.updateMatrix()
      topHay.setMatrixAt(i, dummy.matrix)

      const color = new THREE.Color(HAY.COLORS[Math.floor(random() * HAY.COLORS.length)])
      topHay.setColorAt(i, color)
    }

    topHay.instanceMatrix.needsUpdate = true
    if (topHay.instanceColor) {
      topHay.instanceColor.needsUpdate = true
    }
    group.add(topHay)
  }

  return group
}
