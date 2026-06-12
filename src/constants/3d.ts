/**
 * 3D Environment Shared Constants
 *
 * Centralizes all configuration values used across 3D composables
 * to ensure consistency and ease of maintenance.
 */

// Grid Configuration
export const GRID_CONFIG = {
  COLS: 14,
  ROWS: 10,
  CELL_SIZE: 3.0,
  PIXELS_PER_CELL: 64,
  get WIDTH() {
    return this.COLS * this.CELL_SIZE
  },
  get DEPTH() {
    return this.ROWS * this.CELL_SIZE
  },
} as const

// Camera Configuration
export const CAMERA_CONFIG = {
  FOV: 45,
  NEAR: 0.1,
  FAR: 1000,
  INITIAL_POSITION: { x: 0, y: 32, z: 22 } as const, // Centered view of habitat
  HEIGHT_MIN: 0.5,
  HEIGHT_MAX: 50, // Increased from 20 to allow viewing entire habitat
  // Camera X/Z boundaries - margin beyond habitat for viewing angles
  BOUND_X_MIN: -35,
  BOUND_X_MAX: 35,
  BOUND_Z_MIN: -30,
  BOUND_Z_MAX: 40, // Extra room in +Z since camera looks inward
  MOUSE_ROTATION_SPEED: 0.01,
  MOUSE_PAN_SPEED: 0.05, // Shift+drag panning speed
  WHEEL_ZOOM_SPEED: 0.01,
  PINCH_ZOOM_SPEED: 0.05, // Touch pinch-to-zoom sensitivity
  PAN_SPEED: 0.15,
  VERTICAL_SPEED: 0.1,
  KEYBOARD_ROTATION_SPEED: 0.03,
  TILT_OFFSET_BASE: 5,
  TILT_OFFSET_MULTIPLIER: 0.4, // Reduced slightly for better centering when zoomed out
} as const

// Scene Colors
export const SCENE_COLORS = {
  SKY: 0x87CEEB,
  AMBIENT_LIGHT: 0xffffff,
  DIRECTIONAL_LIGHT: 0xffffff,
  BACK_LIGHT: 0xccccff,
} as const

// Lighting Configuration
export const LIGHTING_CONFIG = {
  AMBIENT_INTENSITY: 0.5,
  DIRECTIONAL_INTENSITY: 0.8,
  BACK_LIGHT_INTENSITY: 0.4,
  SHADOW_MAP_SIZE: 2048,
  SHADOW_CAMERA_BOUNDS: 30,
} as const

// Environment Configuration
export const ENVIRONMENT_CONFIG = {
  WALL_HEIGHT: 2.0,
  WALL_THICKNESS: 0.5,
  BEDDING_TEXTURE_SIZE: 1024,
  BEDDING_PIECES: 5000,
} as const

// Guinea Pig Model Configuration
export const GUINEA_PIG_CONFIG = {
  DEFAULT_COLORS: {
    FUR: 0xd4a574,
    MARKINGS: 0xffffff,
    EAR_INNER: 0xffb6c1,
    EYE: 0x000000,
  } as const,
  MATERIAL: {
    FUR_ROUGHNESS: 0.9,
    EAR_ROUGHNESS: 0.8,
    SKIN_ROUGHNESS: 0.5,
    EYE_ROUGHNESS: 0.0,
    EYE_CLEARCOAT: 1.0,
    EYE_CLEARCOAT_ROUGHNESS: 0.1,
  } as const,
} as const

// Animation Configuration
export const ANIMATION_CONFIG = {
  MOVEMENT_THRESHOLD: 0.01,
  SELECTION_RING: {
    INNER_RADIUS: 0.8,
    OUTER_RADIUS: 1.0,
    Y_OFFSET: 0.05,
    COLOR: 0x00ff00,
    OPACITY: 0.6,
    PULSE_SPEED: 0.002,
    PULSE_AMPLITUDE: 0.1,
  } as const,
} as const

// Cloud Configuration - Two layers like the demo
export const CLOUD_CONFIG = {
  // High layer - further out and higher up
  HIGH_LAYER: {
    COUNT: 20,
    MIN_HEIGHT: 8,
    MAX_HEIGHT: 16,
    MIN_DISTANCE: 35,
    MAX_DISTANCE: 55,
    SCALE: 1.0,
  } as const,
  // Low layer - closer and lower (more visible)
  LOW_LAYER: {
    COUNT: 15,
    MIN_HEIGHT: 3,
    MAX_HEIGHT: 6,
    MIN_DISTANCE: 25,
    MAX_DISTANCE: 40,
    SCALE: 0.8,
  } as const,
  // Shared settings
  DRIFT_SPEED: 0.3,
  COLOR: 0xffffff,
  OPACITY: 0.8,
  // Cloud puff sizes (fluffier clouds)
  PUFF_COUNT_MIN: 6,
  PUFF_COUNT_MAX: 10,
  PUFF_RADIUS: 1.5,
  PUFF_SCALE_MIN: 1.0,
  PUFF_SCALE_MAX: 2.0,
  // Cluster spread for fluffiness
  CLUSTER_SPREAD_X: 5,
  CLUSTER_SPREAD_Y: 2,
  CLUSTER_SPREAD_Z: 3,
} as const

// Item Model Configuration
export const ITEM_CONFIG = {
  // Hay Configuration (Simplified for performance)
  HAY: {
    COLORS: [0xfffacd, 0xffe4b5, 0xdaa520, 0xc0d9af, 0xeedd82] as const,
    INSTANCES_UPRIGHT: 250,
    INSTANCES_FLAT: 250,
    STRAND_WIDTH: 0.08,
    STRAND_THICKNESS: 0.015,
  } as const,

  // Wood Texture
  WOOD_TEXTURE_SIZE: 512,

  // Food Positions in Bowl
  FOOD_POSITION: {
    SINGLE: { x: 0, y: 1.6, z: 0 } as const,
    LEFT: { x: -0.8, y: 1.6, z: 0.3 } as const,
    RIGHT: { x: 0.8, y: 1.6, z: -0.3 } as const,
  } as const,
} as const
