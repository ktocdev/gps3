import * as THREE from 'three'
import { GRID_CONFIG } from '../../../constants/3d'

/**
 * Convert grid position to 3D world coordinates
 */
export function gridToWorld(x: number, y: number): THREE.Vector3 {
  const worldX = (x - GRID_CONFIG.COLS / 2) * GRID_CONFIG.CELL_SIZE
  const worldZ = (y - GRID_CONFIG.ROWS / 2) * GRID_CONFIG.CELL_SIZE
  return new THREE.Vector3(worldX, 0, worldZ)
}

/**
 * Convert 3D world coordinates to grid position
 */
export function worldToGrid(worldX: number, worldZ: number): { x: number; y: number } {
  const x = Math.round(worldX / GRID_CONFIG.CELL_SIZE + GRID_CONFIG.COLS / 2)
  const y = Math.round(worldZ / GRID_CONFIG.CELL_SIZE + GRID_CONFIG.ROWS / 2)
  return { x, y }
}

/**
 * Seeded random number generator for consistent randomness
 * Used to prevent model regeneration on each render
 */
export function seededRandom(seed: number): () => number {
  let state = seed
  return () => {
    state = (state * 9301 + 49297) % 233280
    return state / 233280
  }
}
