/**
 * Device Detection Utilities
 *
 * Provides functions to detect device capabilities and input methods.
 * Used to optimize UI/UX for different device types.
 */

/**
 * Detects if the device has touch capability
 * @returns true if touch events are supported
 */
export function isTouchDevice(): boolean {
  // Check for touch events support
  if ('ontouchstart' in window) {
    return true
  }

  // Check for touch points in navigator
  if (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) {
    return true
  }

  // Check for pointer with coarse accuracy (touch)
  if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
    return true
  }

  return false
}

/**
 * Detects if the primary input method is coarse (touch/stylus)
 * More accurate than isTouchDevice() as it identifies the PRIMARY input method.
 * A device can have both mouse and touch, this tells us which is primary.
 * @returns true if primary input is coarse (touch)
 */
export function hasCoarsePointer(): boolean {
  // Use pointer media query - checks the PRIMARY pointing device
  if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
    return true
  }

  return false
}

/**
 * Detects if the device is likely a mobile phone
 * @returns true if device is likely a mobile phone
 */
export function isMobilePhone(): boolean {
  // Check screen width (phones are typically < 640px)
  if (window.innerWidth < 640) {
    return true
  }

  // Check user agent for mobile indicators
  const userAgent = navigator.userAgent.toLowerCase()
  const mobileKeywords = ['android', 'iphone', 'ipod', 'blackberry', 'windows phone']

  return mobileKeywords.some(keyword => userAgent.includes(keyword))
}

/**
 * Detects if the device is likely a tablet
 * @returns true if device is likely a tablet
 */
export function isTablet(): boolean {
  // Tablets have touch AND medium-large screens (640-1024px typically)
  const hasTouch = isTouchDevice()
  const width = window.innerWidth
  const isMediumScreen = width >= 640 && width < 1024

  if (hasTouch && isMediumScreen) {
    return true
  }

  // Check user agent for tablet indicators
  const userAgent = navigator.userAgent.toLowerCase()
  const tabletKeywords = ['ipad', 'tablet', 'kindle']

  return tabletKeywords.some(keyword => userAgent.includes(keyword))
}

/**
 * Auto-detects the best placement mode for the current device
 * @returns 'select' for touch devices, 'drag' for mouse devices
 */
export function getDefaultPlacementMode(): 'drag' | 'select' {
  // If primary input is touch (coarse pointer), use select mode
  if (hasCoarsePointer()) {
    return 'select'
  }

  // If device has touch but also has fine pointer (mouse), prefer drag
  // This handles laptops with touchscreens
  if (window.matchMedia && window.matchMedia('(pointer: fine)').matches) {
    return 'drag'
  }

  // Fallback to drag mode for desktop
  return 'drag'
}
