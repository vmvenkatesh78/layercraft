/**
 * Core positioning engine for Layercraft
 */

export type Placement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';

  export interface PositionConfig {
  placement: Placement; //Where to place the floating element relative to anchor
  offset?: number; // Gap between anchor and floating element in pixels
  fallbackPlacements?: Placement[]; // Additional placements to try if initial placement overflows viewport
}

export interface PositionResult {
  top: number; // CSS top value
  left: number; // CSS left value
  placement: Placement; // The actual placement used (may differ if flipped)
}

/**
 * Calculate aligned position along an axis
 * 
 * @param anchorStart - Start position of anchor (left or top)
 * @param anchorSize - Size of anchor (width or height)
 * @param floatingSize - Size of floating element (width or height)
 * @param alignment - 'start' | 'center' | 'end'
 */
function getAlignedPosition(
  anchorStart: number,
  anchorSize: number,
  floatingSize: number,
  alignment: string
): number {
  switch (alignment) {
    case 'start':
      return anchorStart;
    case 'end':
      return anchorStart + anchorSize - floatingSize;
    case 'center':
    default:
      return anchorStart + (anchorSize - floatingSize) / 2;
  }
}

/**
 * Get position for a floating element relative to an anchor element.
 *
 * @param anchorRect - Bounding rect of the anchor element
 * @param floatingRect - Bounding rect of the floating element
 * @param config - Positioning configuration
 * @returns Position coordinates and final placement
 */
export function getPosition(
  anchorRect: DOMRect,
  floatingRect: DOMRect,
  config: PositionConfig
): PositionResult {
    const { placement, offset = 8 } = config;

    let top = 0;
    let left = 0;

    const [side, alignment = 'center'] = placement.split('-');

    switch (side) {
    case 'top':
        top = anchorRect.top - floatingRect.height - offset;
        left = getAlignedPosition(anchorRect.left, anchorRect.width, floatingRect.width, alignment);
        break;
    case 'bottom':
        top = anchorRect.bottom + offset;
        left = getAlignedPosition(anchorRect.left, anchorRect.width, floatingRect.width, alignment);
        break;
    case 'left':
        left = anchorRect.left - floatingRect.width - offset;
        top = getAlignedPosition(anchorRect.top, anchorRect.height, floatingRect.height, alignment);
        break;
    case 'right':
        left = anchorRect.right + offset;
        top = getAlignedPosition(anchorRect.top, anchorRect.height, floatingRect.height, alignment);
        break;
    }

    return {
    top,
    left,
    placement,
    };
}

/**
 * Get position with auto-flip support and custom fallback placements.
 * Tries each placement in order until one fits within the viewport.
 * 
 * @param anchorRect - Bounding rect of the anchor element
 * @param floatingRect - Bounding rect of the floating element
 * @param config - Positioning configuration including fallback placements
 * @param viewport - Viewport dimensions
 * @returns Position coordinates and final placement used
 */
export function getPositionWithFlip(
  anchorRect: DOMRect,
  floatingRect: DOMRect,
  config: PositionConfig,
  viewport: { width: number; height: number }
): PositionResult {
  const { placement, fallbackPlacements } = config;

  // Build list of placements to try
  const placements: Placement[] = [
    placement,
    ...(fallbackPlacements ?? [getOppositePlacement(placement)]),
  ];

  // Try each placement until one fits
  for (const tryPlacement of placements) {
    const result = getPosition(anchorRect, floatingRect, {
      ...config,
      placement: tryPlacement,
    });

    if (fitsInViewport(result.top, result.left, floatingRect.width, floatingRect.height, viewport)) {
      return result;
    }
  }

  // None fit - return first placement (will be clamped later)
  return getPosition(anchorRect, floatingRect, config);
}

/**
 * Get the opposite placement for flipping
 * 
 * @param placement - The current placement
 * @returns The opposite placement (e.g., 'top' → 'bottom', 'left-start' → 'right-start')
 */
function getOppositePlacement(placement: Placement): Placement {
  const opposites: Record<string, string> = {
    top: 'bottom',
    bottom: 'top',
    left: 'right',
    right: 'left',
  };

  const [side, alignment] = placement.split('-');
  const oppositeSide = opposites[side] || side;

  return (alignment ? `${oppositeSide}-${alignment}` : oppositeSide) as Placement;
}

/**
 * Check if a position fits within the viewport
 * 
 * @param top - Top position of the floating element
 * @param left - Left position of the floating element
 * @param floatingWidth - Width of the floating element
 * @param floatingHeight - Height of the floating element
 * @param viewport - Viewport dimensions
 * @returns True if the element fits entirely within the viewport
 */
function fitsInViewport(
  top: number,
  left: number,
  floatingWidth: number,
  floatingHeight: number,
  viewport: { width: number; height: number }
): boolean {
  return (
    top >= 0 &&
    left >= 0 &&
    top + floatingHeight <= viewport.height &&
    left + floatingWidth <= viewport.width
  );
}