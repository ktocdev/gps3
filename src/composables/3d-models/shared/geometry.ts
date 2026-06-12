import * as THREE from 'three'

/**
 * Displace vertices of a geometry for organic/natural appearance
 * Uses a displacement map to keep shared vertices consistent
 *
 * @param geometry - BufferGeometry to modify
 * @param magnitude - Amount of random displacement
 * @param twist - Amount of twist effect (optional)
 */
export function displaceVertices(
  geometry: THREE.BufferGeometry,
  magnitude: number,
  twist: number = 0
): void {
  const posAttr = geometry.attributes.position
  const vertex = new THREE.Vector3()

  // Map to store displacements for shared vertices
  const displacementMap: Record<string, { dx: number; dz: number }> = {}

  for (let i = 0; i < posAttr.count; i++) {
    vertex.fromBufferAttribute(posAttr, i)

    // Create key for vertex position (4 decimal places for precision)
    const key = `${vertex.x.toFixed(4)},${vertex.y.toFixed(4)},${vertex.z.toFixed(4)}`

    let dx: number, dz: number

    if (displacementMap[key]) {
      // Use existing displacement for this position
      dx = displacementMap[key].dx
      dz = displacementMap[key].dz
    } else {
      // Generate new displacement
      dx = (Math.random() - 0.5) * magnitude
      dz = (Math.random() - 0.5) * magnitude

      // Add twist effect if specified
      if (twist) {
        dx += Math.sin(vertex.y * 3.0) * twist
        dz += Math.cos(vertex.y * 3.0) * twist
      }

      // Store for other vertices at same position
      displacementMap[key] = { dx, dz }
    }

    // Apply displacement
    vertex.x += dx
    vertex.z += dz

    posAttr.setXYZ(i, vertex.x, vertex.y, vertex.z)
  }

  // Recompute normals for proper lighting
  geometry.computeVertexNormals()
}
