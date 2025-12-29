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

export interface ShiftResult {
  top: number;
  left: number;
  shifted: {
    x: boolean;
    y: boolean;
  };
}

/**
 * Shifts the floating element to stay within viewport bounds.
 * Unlike clamp, shift only moves along the axis perpendicular to placement.
 * 
 * @param top - Current top position
 * @param left - Current left position  
 * @param width - Floating element width
 * @param height - Floating element height
 * @param viewport - Viewport dimensions
 * @param padding - Minimum distance from viewport edge (default: 8)
 */
export function shiftToViewport(
  top: number,
  left: number,
  width: number,
  height: number,
  viewport: Viewport,
  padding: number = 8
): ShiftResult {
  let shiftedX = false;
  let shiftedY = false;
  let newTop = top;
  let newLeft = left;

  // Shift horizontally if needed
  if (left < padding) {
    newLeft = padding;
    shiftedX = true;
  } else if (left + width > viewport.width - padding) {
    newLeft = viewport.width - width - padding;
    shiftedX = true;
  }

  // Shift vertically if needed
  if (top < padding) {
    newTop = padding;
    shiftedY = true;
  } else if (top + height > viewport.height - padding) {
    newTop = viewport.height - height - padding;
    shiftedY = true;
  }

  return {
    top: newTop,
    left: newLeft,
    shifted: {
      x: shiftedX,
      y: shiftedY,
    },
  };
}