import * as THREE from 'three'
import { createWoodTexture } from '../shared/textures'

/**
 * Create wooden archway tunnel (purchasable item)
 */
export function createWoodenTunnelModel(): THREE.Group {
  const group = new THREE.Group()
  const woodTexture = createWoodTexture()

  // Create arch shape (hollow, no floor - matches demo pattern)
  const tunnelShape = new THREE.Shape()
  const legHeight = 1.785 // Reduced 15% from 2.1
  const outerRadius = 3.4 // Reduced 15% from 4.0
  const innerRadius = 2.72 // Reduced 15% from 3.2

  // Start at outer bottom right
  tunnelShape.moveTo(outerRadius, -legHeight)
  // Up to outer arc start
  tunnelShape.lineTo(outerRadius, 0)
  // Outer arc (right to left)
  tunnelShape.absarc(0, 0, outerRadius, 0, Math.PI, false)
  // Down outer left leg
  tunnelShape.lineTo(-outerRadius, -legHeight)
  // Across to inner left leg (no floor - just the wall thickness)
  tunnelShape.lineTo(-innerRadius, -legHeight)
  // Up inner left leg
  tunnelShape.lineTo(-innerRadius, 0)
  // Inner arc (left to right, reversed)
  tunnelShape.absarc(0, 0, innerRadius, Math.PI, 0, true)
  // Down inner right leg
  tunnelShape.lineTo(innerRadius, -legHeight)
  // Close back to start
  tunnelShape.lineTo(outerRadius, -legHeight)

  // Extrude settings
  const extrudeSettings = {
    depth: 6.8, // Reduced 15% from 8.0
    bevelEnabled: true,
    bevelThickness: 0.085, // Reduced 15% from 0.1
    bevelSize: 0.085,      // Reduced 15% from 0.1
    bevelSegments: 2,
    curveSegments: 16,
    steps: 1,
  }

  const tunnelGeo = new THREE.ExtrudeGeometry(tunnelShape, extrudeSettings)

  // Wood materials (same as stick)
  const woodSideMat = new THREE.MeshStandardMaterial({
    color: 0x8B4513,
    map: woodTexture,
    bumpMap: woodTexture,
    bumpScale: 0.1,
    roughness: 0.9,
  })
  const woodEndMat = new THREE.MeshStandardMaterial({
    color: 0xDEB887,
    map: woodTexture,
    bumpMap: woodTexture,
    bumpScale: 0.05,
    roughness: 0.8,
  })

  const tunnel = new THREE.Mesh(tunnelGeo, [woodSideMat, woodEndMat])
  tunnel.position.y = 1.785 // Reduced 15% from 2.1, matches legHeight
  tunnel.rotation.y = Math.PI / 2
  tunnel.castShadow = true
  tunnel.receiveShadow = true
  group.add(tunnel)

  return group
}
