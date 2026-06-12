/**
 * Type declarations for useFreeMovement2D composable
 */

export interface FreeMovement2DOptions {
  canvas: HTMLCanvasElement
  speed?: number
  rotationSpeed?: number
  friction?: number
}

export interface FreeMovement2DReturn {
  setTarget: (position: { x: number; y: number }) => void
  resetPosition: () => void
  addItem: (item: any) => void
  clearItems: () => void
  update: (deltaTime: number) => void
  render: (canvas: HTMLCanvasElement, options: any) => void
  getState: () => {
    position: { x: number; y: number }
    velocity: { x: number; y: number }
    rotation: number
    targetPosition: { x: number; y: number } | null
  }
  cleanup: () => void
  updateSettings: (settings: Partial<{ speed: number; rotationSpeed: number; friction: number }>) => void
}

export declare function useFreeMovement2D(options: FreeMovement2DOptions): FreeMovement2DReturn