import * as THREE from 'three'

export function createShelterModel(): THREE.Group {
  const group = new THREE.Group()

  // Floor clipping plane to prevent geometry showing below ground
  const floorClipPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)

  // Material for shelter (pink transparent plastic)
  const shelterMat = new THREE.MeshPhysicalMaterial({
    color: 0xFF69B4,
    opacity: 0.5,
    transparent: true,
    roughness: 0.2,
    metalness: 0.0,
    side: THREE.DoubleSide,
    depthWrite: false,
    clippingPlanes: [floorClipPlane],
  })

  // Create dome with entrance cutout
  // Ultra-high resolution for smooth entrance cutout
  const domeGeo = new THREE.SphereGeometry(3.5, 256, 128, 0, Math.PI * 2, 0, Math.PI / 2)
  const posAttr = domeGeo.attributes.position
  const indexAttr = domeGeo.index

  if (indexAttr) {
    const newIndices: number[] = []
    const cutoutRadiusSq = 1.85 * 1.85 // Slightly larger for smoother edge

    // Filter triangles to create entrance cutout
    for (let i = 0; i < indexAttr.count; i += 3) {
      const a = indexAttr.getX(i)
      const b = indexAttr.getX(i + 1)
      const c = indexAttr.getX(i + 2)

      // Get triangle vertices
      const vA = new THREE.Vector3().fromBufferAttribute(posAttr, a)
      const vB = new THREE.Vector3().fromBufferAttribute(posAttr, b)
      const vC = new THREE.Vector3().fromBufferAttribute(posAttr, c)

      // Check if ALL vertices are in the cutout area (smoother edge)
      const distASq = vA.x * vA.x + vA.y * vA.y
      const distBSq = vB.x * vB.x + vB.y * vB.y
      const distCSq = vC.x * vC.x + vC.y * vC.y

      // Skip triangles where all vertices are in entrance area
      if (vA.z > 2.2 && vB.z > 2.2 && vC.z > 2.2 &&
          distASq < cutoutRadiusSq && distBSq < cutoutRadiusSq && distCSq < cutoutRadiusSq) {
        continue
      }

      newIndices.push(a, b, c)
    }

    domeGeo.setIndex(newIndices)
  }

  const dome = new THREE.Mesh(domeGeo, shelterMat)
  dome.castShadow = false
  dome.receiveShadow = false
  group.add(dome)

  // Add entrance tunnel - positioned to start at dome entrance and extend outward
  // Slightly larger radius to overlap and hide jagged dome edge
  const tunnelGeo = new THREE.CylinderGeometry(2.0, 2.0, 1.6, 64, 1, true)
  const tunnel = new THREE.Mesh(tunnelGeo, shelterMat)
  tunnel.rotation.set(-Math.PI / 2, 0, 0) // Rotate to horizontal
  tunnel.position.set(0, 0, 3.8) // Position to connect at entrance, extend outward
  group.add(tunnel)

  return group
}
