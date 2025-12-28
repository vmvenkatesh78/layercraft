/**
 * Auto-flip utilities for Layercraft
 */

import { getPosition } from './getPosition';
import type { Placement, PositionConfig, PositionResult } from './getPosition';
import type { Viewport } from './viewport';
import { isOutOfBounds } from './viewport';

const OPPOSITE_PLACEMENTS: Record<Placement, Placement> = {
  'top': 'bottom',
  'top-start': 'bottom-start',
  'top-end': 'bottom-end',
  'bottom': 'top',
  'bottom-start': 'top-start',
  'bottom-end': 'top-end',
  'left': 'right',
  'left-start': 'right-start',
  'left-end': 'right-end',
  'right': 'left',
  'right-start': 'left-start',
  'right-end': 'left-end',
};

/**
 * Get the opposite placement for flipping
 * 
 * @param placement - Current placement
 * @returns Opposite placement (top <-> bottom, left <-> right)
 */
export function getOppositePlacement(placement: Placement): Placement {
  return OPPOSITE_PLACEMENTS[placement];
}

/**
 * Get position with auto-flip if out of bounds
 *
 * @param anchorRect - Bounding rect of anchor element
 * @param floatingRect - Bounding rect of floating element
 * @param config - Position config with placement and offset
 * @param viewport - Viewport dimensions
 * @returns Position result with possibly flipped placement
 */
export function getPositionWithFlip(
  anchorRect: DOMRect,
  floatingRect: DOMRect,
  config: PositionConfig,
  viewport: Viewport
): PositionResult {
  const { placement, offset = 8 } = config;

  // 1. Try requested placement
  const position = getPosition(anchorRect, floatingRect, config);

  // 2. Check if out of bounds
  const bounds = isOutOfBounds(
    position.top,
    position.left,
    floatingRect.width,
    floatingRect.height,
    viewport
  );

  // 3. Determine if flip is needed based on placement side
  const side = placement.split('-')[0] as 'top' | 'bottom' | 'left' | 'right';

  const shouldFlip =
    (side === 'top' && bounds.top) ||
    (side === 'bottom' && bounds.bottom) ||
    (side === 'left' && bounds.left) ||
    (side === 'right' && bounds.right);

  // 4. If flip needed, try opposite placement
  if (shouldFlip) {
    const flippedPlacement = getOppositePlacement(placement);
    const flippedPosition = getPosition(anchorRect, floatingRect, {
      placement: flippedPlacement,
      offset,
    });

    // Return flipped position with updated placement
    return {
      ...flippedPosition,
      placement: flippedPlacement,
    };
  }

  return position;
}