/**
 * Popover positioning composable using Floating UI
 * Handles smart positioning with flip/shift to stay within viewport
 */

import { ref, computed, type Ref, type CSSProperties } from 'vue'
import { useFloating, offset, flip, shift, autoUpdate } from '@floating-ui/vue'

export interface UsePopoverOptions {
  /** Offset from the reference point in pixels */
  offset?: number
  /** Preferred placement */
  placement?: 'top' | 'bottom' | 'left' | 'right'
  /** Padding from viewport edges */
  padding?: number
}

export interface UsePopoverReturn {
  /** Ref to attach to the floating element */
  floatingEl: Ref<HTMLElement | null>
  /** Computed styles to apply to the floating element */
  floatingStyles: Ref<CSSProperties>
  /** Update the reference position (for virtual/click positioning) */
  updatePosition: (x: number, y: number) => void
}

/**
 * Creates a popover that positions itself smartly relative to click coordinates
 *
 * @example
 * ```ts
 * const { floatingEl, floatingStyles, updatePosition } = usePopover({ offset: 10 })
 *
 * // In click handler
 * updatePosition(event.clientX, event.clientY)
 *
 * // In template
 * <div ref="floatingEl" :style="floatingStyles">...</div>
 * ```
 */
export function usePopover(options: UsePopoverOptions = {}): UsePopoverReturn {
  const {
    offset: offsetValue = 10,
    placement = 'bottom',
    padding = 8
  } = options

  const floatingEl = ref<HTMLElement | null>(null)

  // Virtual reference point (click coordinates)
  const virtualReference = ref({ x: 0, y: 0 })

  // Create a virtual element that Floating UI can use as reference
  const virtualEl = computed(() => ({
    getBoundingClientRect() {
      return {
        x: virtualReference.value.x,
        y: virtualReference.value.y,
        width: 0,
        height: 0,
        top: virtualReference.value.y,
        left: virtualReference.value.x,
        right: virtualReference.value.x,
        bottom: virtualReference.value.y
      }
    }
  }))

  // Use Floating UI for positioning
  const { floatingStyles } = useFloating(virtualEl, floatingEl, {
    placement,
    middleware: [
      offset(offsetValue),
      flip(),
      shift({ padding })
    ],
    whileElementsMounted: autoUpdate
  })

  /**
   * Update the reference position for the popover
   * Call this with viewport coordinates (e.g., event.clientX, event.clientY)
   */
  function updatePosition(x: number, y: number) {
    virtualReference.value = { x, y }
  }

  return {
    floatingEl,
    floatingStyles,
    updatePosition
  }
}
