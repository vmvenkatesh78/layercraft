# Layercraft API Documentation

> A lightweight positioning engine for tooltips, popovers, and dropdowns in React.

---

## Table of Contents

1. [Installation](#installation)
2. [Quick Start](#quick-start)
3. [Core Concepts](#core-concepts)
4. [useAnchor Hook](#useanchor-hook)
5. [Portal Component](#portal-component)
6. [Core Functions](#core-functions)
7. [Types](#types)

---

## Installation

```bash
npm install layercraft
```

```bash
yarn add layercraft
```

---

## Quick Start

```tsx
import { useAnchor } from 'layercraft';

function Tooltip() {
  const { isOpen, floatingStyles, refCallbacks, isReady } = useAnchor({
    trigger: 'hover',
    placement: 'top',
    offset: 8,
  });

  return (
    <>
      <button ref={refCallbacks.anchor}>Hover me</button>
      {isOpen && (
        <div 
          ref={refCallbacks.floating} 
          style={{
            ...floatingStyles,
            visibility: isReady ? 'visible' : 'hidden',
          }}
        >
          Tooltip content
        </div>
      )}
    </>
  );
}
```

---

## Core Concepts

### Placements

Layercraft supports 12 placement options:

```
        top-start      top      top-end
            ┌───────────────────────┐
            │                       │
 left-start │                       │ right-start
            │                       │
       left │       ANCHOR          │ right
            │                       │
   left-end │                       │ right-end
            │                       │
            └───────────────────────┘
     bottom-start   bottom   bottom-end
```

| Placement | Description |
|-----------|-------------|
| `top` | Above anchor, horizontally centered |
| `top-start` | Above anchor, aligned to start (left) |
| `top-end` | Above anchor, aligned to end (right) |
| `bottom` | Below anchor, horizontally centered |
| `bottom-start` | Below anchor, aligned to start |
| `bottom-end` | Below anchor, aligned to end |
| `left` | Left of anchor, vertically centered |
| `left-start` | Left of anchor, aligned to top |
| `left-end` | Left of anchor, aligned to bottom |
| `right` | Right of anchor, vertically centered |
| `right-start` | Right of anchor, aligned to top |
| `right-end` | Right of anchor, aligned to bottom |

### Auto-Flip Behavior

When the floating element doesn't fit in the preferred placement, Layercraft automatically flips to the opposite side:

- `top` → `bottom`
- `left` → `right`
- `top-start` → `bottom-start`

You can customize this with the `fallbackPlacements` option.

### Shift Behavior

When the floating element would overflow the viewport edge, Layercraft shifts it along the axis to stay visible while keeping the same placement:

```
Without shift:              With shift:
┌─────────────────┐        ┌─────────────────┐
│            ┌────────     │         ┌──────┐│
│   Anchor   │Tooltip│     │ Anchor  │Tooltip│
│            └────────     │         └──────┘│
└─────────────────┘        └─────────────────┘
    (clips at edge)           (shifted to fit)
```

Shift is enabled by default. It works differently from flip:
- **Flip** changes the placement (top → bottom)
- **Shift** keeps the placement but moves the element to fit

### Viewport Clamping

Floating elements are automatically kept within viewport boundaries with configurable padding (default: 8px).

---

## useAnchor Hook

The main hook for positioning floating elements.

### Signature

```typescript
function useAnchor(options?: UseAnchorOptions): UseAnchorReturn;
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `placement` | `Placement` | `'bottom'` | Preferred placement of floating element |
| `offset` | `number` | `8` | Distance (px) between anchor and floating element |
| `trigger` | `'click' \| 'hover'` | `'click'` | How to open/close the floating element |
| `closeOnEscape` | `boolean` | `true` | Close when Escape key is pressed |
| `closeOnOutsideClick` | `boolean` | `true` | Close when clicking outside |
| `autoFlip` | `boolean` | `true` | Flip to opposite side if no space |
| `fallbackPlacements` | `Placement[]` | `undefined` | Custom fallback placements for auto-flip |
| `shift` | `boolean` | `true` | Keep floating element within viewport by shifting |
| `shiftPadding` | `number` | `8` | Padding from viewport edge when shifting (px) |
| `arrow` | `boolean \| { size: number }` | `false` | Enable arrow positioning |
| `zIndex` | `number` | `9999` | z-index of floating element |

### Return Value

| Property | Type | Description |
|----------|------|-------------|
| `isOpen` | `boolean` | Whether floating element is visible |
| `setIsOpen` | `function` | Manually control open state |
| `isReady` | `boolean` | True when position is calculated (prevents flicker) |
| `floatingStyles` | `CSSProperties` | Styles to apply to floating element |
| `arrowStyles` | `CSSProperties` | Styles for arrow element (if enabled) |
| `actualPlacement` | `Placement` | Actual placement (may differ due to flip) |
| `refCallbacks.anchor` | `function` | Ref callback for anchor element |
| `refCallbacks.floating` | `function` | Ref callback for floating element |
| `refCallbacks.arrow` | `function` | Ref callback for arrow element |

### Example: Click Trigger (Popover)

```tsx
function Popover() {
  const { isOpen, floatingStyles, refCallbacks } = useAnchor({
    trigger: 'click',
    placement: 'bottom-start',
    offset: 8,
    closeOnEscape: true,
    closeOnOutsideClick: true,
  });

  return (
    <>
      <button ref={refCallbacks.anchor}>Open Menu</button>
      {isOpen && (
        <div ref={refCallbacks.floating} style={floatingStyles}>
          <ul>
            <li>Option 1</li>
            <li>Option 2</li>
            <li>Option 3</li>
          </ul>
        </div>
      )}
    </>
  );
}
```

### Example: Hover Trigger (Tooltip)

```tsx
function Tooltip() {
  const { isOpen, floatingStyles, refCallbacks, isReady } = useAnchor({
    trigger: 'hover',
    placement: 'top',
    offset: 6,
  });

  return (
    <>
      <button ref={refCallbacks.anchor}>Hover for info</button>
      {isOpen && (
        <div
          ref={refCallbacks.floating}
          style={{
            ...floatingStyles,
            visibility: isReady ? 'visible' : 'hidden',
          }}
        >
          Helpful tooltip text
        </div>
      )}
    </>
  );
}
```

### Example: With Arrow

```tsx
function TooltipWithArrow() {
  const { isOpen, floatingStyles, arrowStyles, refCallbacks } = useAnchor({
    trigger: 'hover',
    placement: 'top',
    arrow: { size: 8 },
  });

  return (
    <>
      <button ref={refCallbacks.anchor}>Hover me</button>
      {isOpen && (
        <div ref={refCallbacks.floating} style={floatingStyles}>
          Tooltip with arrow
          <div
            ref={refCallbacks.arrow}
            style={{
              ...arrowStyles,
              width: 8,
              height: 8,
              background: 'inherit',
              transform: `${arrowStyles.transform} rotate(45deg)`,
            }}
          />
        </div>
      )}
    </>
  );
}
```

### Example: Fallback Placements

```tsx
function CustomFallback() {
  const { isOpen, floatingStyles, actualPlacement, refCallbacks } = useAnchor({
    trigger: 'click',
    placement: 'right',
    fallbackPlacements: ['left', 'bottom', 'top'],
  });

  return (
    <>
      <button ref={refCallbacks.anchor}>Click me</button>
      {isOpen && (
        <div ref={refCallbacks.floating} style={floatingStyles}>
          Actual placement: {actualPlacement}
        </div>
      )}
    </>
  );
}
```

### Example: With Shift

```tsx
function ShiftedTooltip() {
  const { isOpen, floatingStyles, refCallbacks } = useAnchor({
    trigger: 'hover',
    placement: 'right',
    shift: true,        // Enabled by default
    shiftPadding: 12,   // Custom padding from viewport edge
  });

  return (
    <>
      <button ref={refCallbacks.anchor}>Hover (near edge)</button>
      {isOpen && (
        <div ref={refCallbacks.floating} style={floatingStyles}>
          I stay within viewport!
        </div>
      )}
    </>
  );
}
```

### Example: Disable Shift

```tsx
// Disable shift if you want strict positioning
const { ... } = useAnchor({
  placement: 'right',
  shift: false,  // Allow overflow instead of shifting
});
```

---

## Portal Component

Renders children into `document.body` to escape overflow containers.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | required | Content to render in portal |
| `container` | `Element \| null` | `document.body` | Custom container element |

### Example

```tsx
import { useAnchor, Portal } from 'layercraft';

function PortalPopover() {
  const { isOpen, floatingStyles, refCallbacks } = useAnchor({
    trigger: 'click',
    placement: 'bottom',
  });

  return (
    <div style={{ overflow: 'hidden' }}>
      <button ref={refCallbacks.anchor}>Open</button>
      {isOpen && (
        <Portal>
          <div ref={refCallbacks.floating} style={floatingStyles}>
            This escapes overflow: hidden!
          </div>
        </Portal>
      )}
    </div>
  );
}
```

### When to Use Portal

Use Portal when:
- Anchor is inside `overflow: hidden` or `overflow: auto`
- Anchor is inside a scrollable container
- Floating element gets clipped by parent boundaries
- You need consistent z-index behavior

---

## Core Functions

These are the low-level positioning functions. Use these for vanilla JS or custom implementations.

### getPosition

Calculates position for a floating element.

```typescript
function getPosition(
  anchorRect: DOMRect,
  floatingRect: DOMRect,
  config: PositionConfig
): PositionResult;
```

### getPositionWithFlip

Calculates position with automatic flip when out of bounds.

```typescript
function getPositionWithFlip(
  anchorRect: DOMRect,
  floatingRect: DOMRect,
  config: PositionConfig,
  viewport: ViewportInfo
): PositionResult;
```

### shiftToViewport

Shifts position to keep floating element within viewport.

```typescript
function shiftToViewport(
  top: number,
  left: number,
  width: number,
  height: number,
  viewport: Viewport,
  padding?: number
): ShiftResult;
```

### getArrowPosition

Calculates arrow position and rotation.

```typescript
function getArrowPosition(
  placement: Placement,
  anchorRect: DOMRect,
  floatingRect: DOMRect,
  arrowSize: number
): ArrowPosition;
```

### Vanilla JS Example

```javascript
import { getPosition, getPositionWithFlip, shiftToViewport, getViewport } from 'layercraft';

const anchor = document.querySelector('#anchor');
const floating = document.querySelector('#floating');

const anchorRect = anchor.getBoundingClientRect();
const floatingRect = floating.getBoundingClientRect();
const viewport = getViewport();

// Step 1: Calculate position with flip
const result = getPositionWithFlip(
  anchorRect,
  floatingRect,
  { placement: 'bottom', offset: 8 },
  viewport
);

// Step 2: Apply shift to keep within viewport
const shifted = shiftToViewport(
  result.top,
  result.left,
  floatingRect.width,
  floatingRect.height,
  viewport,
  8 // padding
);

// Step 3: Apply styles
floating.style.position = 'fixed';
floating.style.top = `${shifted.top}px`;
floating.style.left = `${shifted.left}px`;
```

---

## Types

### Placement

```typescript
type Placement =
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
```

### PositionConfig

```typescript
interface PositionConfig {
  placement: Placement;
  offset?: number;
}
```

### PositionResult

```typescript
interface PositionResult {
  top: number;
  left: number;
  placement: Placement;
}
```

### ShiftResult

```typescript
interface ShiftResult {
  top: number;
  left: number;
  shifted: {
    x: boolean;
    y: boolean;
  };
}
```

### UseAnchorOptions

```typescript
interface UseAnchorOptions {
  placement?: Placement;
  offset?: number;
  trigger?: 'click' | 'hover';
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
  autoFlip?: boolean;
  fallbackPlacements?: Placement[];
  shift?: boolean;
  shiftPadding?: number;
  arrow?: boolean | { size: number };
  zIndex?: number;
}
```

### UseAnchorReturn

```typescript
interface UseAnchorReturn {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isReady: boolean;
  floatingStyles: React.CSSProperties;
  arrowStyles: React.CSSProperties;
  actualPlacement: Placement;
  refCallbacks: {
    anchor: (el: HTMLElement | null) => void;
    floating: (el: HTMLElement | null) => void;
    arrow: (el: HTMLElement | null) => void;
  };
}
```

---

## Limitations

- **No animations**: Add CSS transitions yourself
- **No virtual elements**: Only supports real DOM elements
- **React 17+**: Uses modern React features
- **No z-index coordination**: Multiple floating elements need manual z-index management

---

## Bundle Size

- Core: ~2KB gzipped
- React adapter: ~3KB gzipped
- Total: ~5KB gzipped
- Zero runtime dependencies

---

*Last updated: December 2024*