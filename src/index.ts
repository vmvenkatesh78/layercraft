/**
 * Layercraft - A lightweight positioning library for floating elements
 */

// Core
export { 
  getPosition, 
  getPositionWithFlip, 
  getArrowPosition,
  getViewport,
  clampToViewport,
  shiftToViewport,
} from './core';

export type { 
  Placement, 
  PositionConfig, 
  PositionResult, 
  ArrowPosition,
  Viewport,
  BoundsCheck,
  ShiftResult,
} from './core';

// React
export { useAnchor } from './react/useAnchor';
export { Portal } from './react/Portal';
export type { UseAnchorOptions, UseAnchorReturn } from './react/useAnchor';