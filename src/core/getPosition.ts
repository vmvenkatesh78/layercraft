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