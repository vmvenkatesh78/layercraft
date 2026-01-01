# Layercraft

A positioning engine for floating UI elements. Built to solve real problems with tooltips, dropdowns, and popovers — without the magic.

[![npm version](https://img.shields.io/npm/v/layercraft.svg)](https://www.npmjs.com/package/layercraft)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/layercraft)](https://bundlephobia.com/package/layercraft)
[![CI](https://github.com/vmvenkatesh78/layercraft/actions/workflows/ci.yml/badge.svg)](https://github.com/vmvenkatesh78/layercraft/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![license](https://img.shields.io/npm/l/layercraft.svg)](https://github.com/vmvenkatesh78/layercraft/blob/main/LICENSE)

## Why this exists

Positioning floating elements sounds simple until you hit:
- `overflow: hidden` clipping your dropdown
- z-index wars across stacking contexts
- Tooltips getting cut off at viewport edges
- Initial flicker before position is calculated
- Mysterious jumps when content resizes

Existing solutions (Popper.js, Floating UI) work, but they're often opaque. When something breaks, good luck debugging.

Layercraft takes a different approach: **explicit math, predictable behavior, no magic.**

## Features

- 🎯 **12 placement options** — top, bottom, left, right with start/center/end alignment
- 🔄 **Auto-flip** — automatically flips when there's not enough space
- 🔀 **Shift** — keeps element within viewport without changing placement
- 📍 **Fallback placements** — custom flip order for complex layouts
- 🚀 **Portal support** — escape `overflow: hidden` containers
- ➡️ **Arrow positioning** — built-in arrow/caret support
- ⌨️ **Keyboard support** — Escape key to close
- 🖱️ **Multiple triggers** — click, hover
- 📏 **Auto-update** — responds to scroll, resize, and content changes
- ✨ **Flicker-free** — `isReady` flag prevents initial position jump
- 🪶 **Lightweight** — ~5KB minified + gzipped
- 📦 **Tree-shakeable** — only import what you use
- 🔷 **TypeScript** — fully typed API

## Install
```bash
npm install layercraft
```

## Quick Start
```tsx
import { useAnchor } from 'layercraft';

function Tooltip() {
  const { refCallbacks, floatingStyles, isOpen, isReady } = useAnchor({
    placement: 'top',
    trigger: 'hover',
  });

  return (
    <>
      <button ref={refCallbacks.anchor}>Hover me</button>
      {isOpen && (
        <div 
          ref={refCallbacks.floating} 
          style={{
            ...floatingStyles,
            visibility: isReady ? 'visible' : 'hidden', // Prevents flicker
          }}
        >
          Tooltip content
        </div>
      )}
    </>
  );
}
```

## Placements
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

## Examples

### Click Trigger (Popover/Dropdown)
```tsx
function Dropdown() {
  const { refCallbacks, floatingStyles, isOpen } = useAnchor({
    placement: 'bottom-start',
    trigger: 'click',
    closeOnOutsideClick: true,
    closeOnEscape: true,
  });

  return (
    <>
      <button ref={refCallbacks.anchor}>Open Menu</button>
      {isOpen && (
        <ul ref={refCallbacks.floating} style={floatingStyles}>
          <li>Option 1</li>
          <li>Option 2</li>
          <li>Option 3</li>
        </ul>
      )}
    </>
  );
}
```

### Hover Trigger (Tooltip)
```tsx
function Tooltip() {
  const { refCallbacks, floatingStyles, isOpen, isReady } = useAnchor({
    placement: 'top',
    trigger: 'hover',
    offset: 6,
  });

  return (
    <>
      <span ref={refCallbacks.anchor}>Hover for info</span>
      {isOpen && (
        <div 
          ref={refCallbacks.floating} 
          style={{
            ...floatingStyles,
            visibility: isReady ? 'visible' : 'hidden',
            background: '#333',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        >
          Helpful tooltip text
        </div>
      )}
    </>
  );
}
```

### With Portal (Escape overflow: hidden)

Use Portal when your anchor is inside an `overflow: hidden` container:
```tsx
import { useAnchor, Portal } from 'layercraft';

function PopoverWithPortal() {
  const { refCallbacks, floatingStyles, isOpen } = useAnchor({
    placement: 'bottom',
    trigger: 'click',
  });

  return (
    <div style={{ overflow: 'hidden', position: 'relative' }}>
      <button ref={refCallbacks.anchor}>Click me</button>
      {isOpen && (
        <Portal>
          <div ref={refCallbacks.floating} style={floatingStyles}>
            I escape the overflow container!
          </div>
        </Portal>
      )}
    </div>
  );
}
```

**When to use Portal:**
- Anchor is inside `overflow: hidden` or `overflow: auto`
- Anchor is inside a scrollable container
- Floating element gets clipped by parent boundaries

### With Arrow
```tsx
function TooltipWithArrow() {
  const { refCallbacks, floatingStyles, arrowStyles, isOpen, isReady } = useAnchor({
    placement: 'top',
    trigger: 'hover',
    arrow: { size: 8 },
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
            background: '#333',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
          }}
        >
          Tooltip with arrow
          <div 
            ref={refCallbacks.arrow} 
            style={{
              ...arrowStyles,
              position: 'absolute',
              width: 8,
              height: 8,
              background: '#333',
              transform: `${arrowStyles.transform} rotate(45deg)`,
            }} 
          />
        </div>
      )}
    </>
  );
}
```

### Fallback Placements

Control the flip order when preferred placement doesn't fit:
```tsx
const { actualPlacement } = useAnchor({
  placement: 'right',
  fallbackPlacements: ['left', 'bottom', 'top'], // Try these in order
});

// actualPlacement tells you which placement was actually used
console.log(`Using: ${actualPlacement}`);
```

### Shift (Prevent Edge Clipping)

Shift keeps the floating element within viewport bounds without changing placement:
```tsx
const { refCallbacks, floatingStyles, isOpen } = useAnchor({
  placement: 'right',
  shift: true,        // Enabled by default
  shiftPadding: 8,    // Padding from viewport edge
});
```

```
Without shift:              With shift:
┌─────────────────┐        ┌─────────────────┐
│            ┌────────     │         ┌──────┐│
│   Anchor   │Tooltip│     │ Anchor  │Tooltip│
│            └────────     │         └──────┘│
└─────────────────┘        └─────────────────┘
    (clips at edge)           (shifted to fit)
```

To disable shift:
```tsx
const { ... } = useAnchor({
  placement: 'top',
  shift: false,  // Disable shifting
});
```

### Controlled Mode

Manage open state yourself:
```tsx
function ControlledPopover() {
  const [isOpen, setIsOpen] = useState(false);
  
  const { refCallbacks, floatingStyles } = useAnchor({
    placement: 'bottom',
    trigger: 'click',
  });

  return (
    <>
      <button 
        ref={refCallbacks.anchor}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? 'Close' : 'Open'}
      </button>
      {isOpen && (
        <div ref={refCallbacks.floating} style={floatingStyles}>
          Controlled content
          <button onClick={() => setIsOpen(false)}>Close</button>
        </div>
      )}
    </>
  );
}
```

### Vanilla JavaScript

Use the core functions without React:
```ts
import { getPosition, getPositionWithFlip, shiftToViewport, getViewport } from 'layercraft';

const anchor = document.querySelector('#anchor');
const floating = document.querySelector('#floating');

const anchorRect = anchor.getBoundingClientRect();
const floatingRect = floating.getBoundingClientRect();
const viewport = getViewport();

// Step 1: Calculate position with auto-flip
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

## API Reference

### useAnchor(options)

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `placement` | `Placement` | `'bottom'` | Where to position the floating element |
| `offset` | `number` | `8` | Gap between anchor and floating element (px) |
| `trigger` | `'click' \| 'hover'` | `'click'` | How to open the floating element |
| `closeOnOutsideClick` | `boolean` | `true` | Close when clicking outside |
| `closeOnEscape` | `boolean` | `true` | Close when pressing Escape |
| `autoFlip` | `boolean` | `true` | Flip to opposite side if no space |
| `fallbackPlacements` | `Placement[]` | `undefined` | Custom fallback placement order |
| `shift` | `boolean` | `true` | Keep floating element within viewport by shifting |
| `shiftPadding` | `number` | `8` | Padding from viewport edge when shifting (px) |
| `arrow` | `boolean \| { size: number }` | `false` | Enable arrow positioning |
| `zIndex` | `number` | `9999` | z-index for floating element |

#### Return Value

| Property | Type | Description |
|----------|------|-------------|
| `isOpen` | `boolean` | Current open state |
| `setIsOpen` | `function` | Manually control open state |
| `isReady` | `boolean` | `true` after position is calculated (use for visibility) |
| `floatingStyles` | `CSSProperties` | Apply to floating element |
| `arrowStyles` | `CSSProperties` | Apply to arrow element |
| `actualPlacement` | `Placement` | The placement used (may differ if flipped) |
| `refCallbacks.anchor` | `function` | Attach to anchor element |
| `refCallbacks.floating` | `function` | Attach to floating element |
| `refCallbacks.arrow` | `function` | Attach to arrow element |

### Portal

Renders children into `document.body` (or custom container) to escape overflow containers.
```tsx
import { Portal } from 'layercraft';

// Default: renders to document.body
<Portal>
  <div>Rendered at document.body</div>
</Portal>

// Custom container
<Portal container={document.getElementById('portal-root')}>
  <div>Rendered in #portal-root</div>
</Portal>
```

### Core Functions

For vanilla JS or custom implementations:
```ts
import { 
  getPosition,           // Basic positioning
  getPositionWithFlip,   // Positioning with auto-flip
  shiftToViewport,       // Keep within viewport by shifting
  getArrowPosition,      // Arrow positioning
  clampToViewport,       // Clamp to viewport bounds
  isOutOfBounds,         // Check if position overflows
  getViewport,           // Get viewport dimensions
} from 'layercraft';
```

## Architecture
```
src/
├── core/           # Pure positioning math, framework-agnostic
│   ├── getPosition.ts
│   ├── flip.ts
│   └── viewport.ts
└── react/          # React adapter
    ├── useAnchor.ts
    └── Portal.tsx
```

The core is framework-agnostic. The React hook is a thin wrapper. You could build Vue, Svelte, or vanilla adapters on the same core.

## Limitations

- **No z-index coordination** — Use the `zIndex` option to manually manage stacking order between multiple floating elements
- **No animations** — Use CSS transitions or animation libraries
- **React 17+** — Uses modern React features

## Demo

👉 [Live Demo](https://layercraft-smoky.vercel.app)

## Local Development
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm run test

# Build for production
npm run build

# Run Storybook
npm run storybook
```

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

## License

MIT © [Venkatesh M](https://github.com/vmvenkatesh78)