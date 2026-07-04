---
source: src/utils/deviceDetection.ts
source_hash: a4e2d737dfeebc9cda8f411ba49249080081d12931533698c0cbf327fca86058
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Device Detection Utilities

`src/utils/deviceDetection.ts`

> A collection of pure utility functions that detect device capabilities (touch support, primary pointer type, form factor) using browser APIs like `window.matchMedia`, `navigator.maxTouchPoints`, and `window.innerWidth`. It exists to let the app optimize UI/UX and choose sensible defaults (e.g. drag vs. select placement mode) based on the current device.

All functions read directly from the global `window` and `navigator` objects at call time (no caching). 

- `isTouchDevice()` returns true if any of: `ontouchstart` exists on window, `navigator.maxTouchPoints > 0`, or `(pointer: coarse)` media query matches.
- `hasCoarsePointer()` returns true only if the `(pointer: coarse)` media query matches, identifying the PRIMARY input as touch.
- `isMobilePhone()` returns true if `window.innerWidth < 640` or the lowercased user agent contains one of `android`, `iphone`, `ipod`, `blackberry`, `windows phone`.
- `isTablet()` returns true if the device has touch (`isTouchDevice()`) and width is 640–1023px, or if the user agent contains `ipad`, `tablet`, or `kindle`.
- `getDefaultPlacementMode()` returns `'select'` when `hasCoarsePointer()` is true; otherwise returns `'drag'` (both when `(pointer: fine)` matches and as the desktop fallback).

## Exports

- **isTouchDevice** (function) — `isTouchDevice(): boolean`: Detects whether the device supports touch via ontouchstart, maxTouchPoints, or coarse pointer media query.
- **hasCoarsePointer** (function) — `hasCoarsePointer(): boolean`: Detects whether the primary pointing device is coarse (touch) using the `(pointer: coarse)` media query.
- **isMobilePhone** (function) — `isMobilePhone(): boolean`: Heuristically detects a mobile phone by screen width (<640px) or user agent keywords.
- **isTablet** (function) — `isTablet(): boolean`: Heuristically detects a tablet via touch + medium screen width (640–1023px) or user agent keywords.
- **getDefaultPlacementMode** (function) — `getDefaultPlacementMode(): 'drag' | 'select'`: Returns the recommended placement mode: 'select' for coarse-pointer (touch) devices, 'drag' otherwise.

## Notes

- All functions depend on browser globals (`window`, `navigator`) and will throw in a non-browser/SSR environment.
- Detection is evaluated at call time, not memoized, so results reflect the current window size/media state.
- Width-based checks (640px/1024px breakpoints) are heuristics and may misclassify resized desktop windows or unusual devices.
