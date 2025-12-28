/**
 * Viewport utilities for Layercraft
 */

export interface Viewport {
  width: number;
  height: number;
  scrollX: number;
  scrollY: number;
}

/**
 * Get current viewport dimensions and scroll position
 * 
 * @returns Current viewport dimensions and scroll offsets
 */
export function getViewport(): Viewport {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    scrollX: window.scrollX,
    scrollY: window.scrollY,
  };
}

/**
 * Clamp position to keep floating element within viewport bounds
 * 
 * @param top - Original top position
 * @param left - Original left position
 * @param floatingWidth - Width of the floating element
 * @param floatingHeight - Height of the floating element
 * @param viewport - Viewport dimensions
 * @param padding - Minimum distance from viewport edges (default: 8)
 * @returns Clamped top and left positions
 */
export function clampToViewport(
  top: number,
  left: number,
  floatingWidth: number,
  floatingHeight: number,
  viewport: Viewport,
  padding: number = 8
): { top: number; left: number } {
  const clampedLeft = Math.min(
    Math.max(left, padding),
    viewport.width - floatingWidth - padding
  );

  const clampedTop = Math.min(
    Math.max(top, padding),
    viewport.height - floatingHeight - padding
  );

  return {
    top: clampedTop,
    left: clampedLeft,
  };
}

export interface BoundsCheck {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
}

/**
 * Check which edges the floating element overflows
 * 
 * @param top - Top position of floating element
 * @param left - Left position of floating element
 * @param floatingWidth - Width of floating element
 * @param floatingHeight - Height of floating element
 * @param viewport - Viewport dimensions
 * @param padding - Minimum distance from edges (default: 8)
 * @returns Object indicating which edges overflow
 */
export function isOutOfBounds(
  top: number,
  left: number,
  floatingWidth: number,
  floatingHeight: number,
  viewport: Viewport,
  padding: number = 8
): BoundsCheck {
  return {
    top: top < padding,
    right: left + floatingWidth > viewport.width - padding,
    bottom: top + floatingHeight > viewport.height - padding,
    left: left < padding,
  };
}