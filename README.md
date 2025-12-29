# Layercraft

A positioning engine for floating UI elements. Built to solve real problems with tooltips, dropdowns, and popovers — without the magic.

[![npm version](https://img.shields.io/npm/v/layercraft.svg)](https://www.npmjs.com/package/layercraft)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/layercraft)](https://bundlephobia.com/package/layercraft)
[![license](https://img.shields.io/npm/l/layercraft.svg)](https://github.com/vmvenkatesh78/layercraft/blob/main/LICENSE)

## Why this exists

Positioning floating elements sounds simple until you hit:
- `overflow: hidden` clipping your dropdown
- z-index wars across stacking contexts
- Tooltips getting cut off at viewport edges
- Mysterious jumps when content resizes

Existing solutions (Popper.js, Floating UI) work, but they're often opaque. When something breaks, good luck debugging.

Layercraft takes a different approach: explicit math, predictable behavior, no magic.

## Features

- 🎯 **12 placement options** - top, bottom, left, right with start/center/end alignment
- 🔄 **Auto-flip** - automatically flips when there's not enough space
- 📍 **Fallback placements** - custom flip order for complex layouts
- 🚀 **Portal support** - escape `overflow: hidden` containers
- ➡️ **Arrow positioning** - built-in arrow/caret support
- ⌨️ **Keyboard support** - Escape key to close
- 🖱️ **Multiple triggers** - click, hover with configurable delay
- 📏 **Auto-update** - responds to scroll, resize, and content changes
- 🪶 **Lightweight** - ~5KB minified + gzipped
- 📦 **Tree-shakeable** - only import what you use

## Install
```bash
npm install layercraft
```

## Quick Start
```tsx
import { useAnchor } from 'layercraft';

function Tooltip() {
  const { refCallbacks, floatingStyles, isOpen } = useAnchor({
    placement: 'top',
    trigger: 'hover',
  });

  return (
    <>
      <button ref={refCallbacks.anchor}>Hover me</button>
      {isOpen && (
        <div ref={refCallbacks.floating} style={floatingStyles}>
          Tooltip content
        </div>
      )}
    </>
  );
}
```

## Examples

### Click Trigger (Popover)
```tsx
const { refCallbacks, floatingStyles, isOpen } = useAnchor({
  placement: 'bottom-start',
  trigger: 'click',
  closeOnOutsideClick: true,
  closeOnEscape: true,
});
```

### With Portal (Escape overflow: hidden)
```tsx
import { useAnchor, Portal } from 'layercraft';

function PopoverWithPortal() {
  const { refCallbacks, floatingStyles, isOpen } = useAnchor({
    placement: 'bottom',
  });

  return (
    <div style={{ overflow: 'hidden' }}>
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

### With Arrow
```tsx
const { refCallbacks, floatingStyles, arrowStyles, isOpen } = useAnchor({
  placement: 'top',
  arrow: { size: 8 },
});

{isOpen && (
  <div ref={refCallbacks.floating} style={floatingStyles}>
    Content
    <div 
      ref={refCallbacks.arrow} 
      style={{
        ...arrowStyles,
        width: 0,
        height: 0,
        borderLeft: '8px solid transparent',
        borderRight: '8px solid transparent',
        borderTop: '8px solid #333',
      }} 
    />
  </div>
)}
```

### Fallback Placements
```tsx
const { actualPlacement } = useAnchor({
  placement: 'top',
  fallbackPlacements: ['right', 'bottom', 'left'],
});
// actualPlacement tells you which placement was used
```

### Vanilla JS
```ts
import { getPosition, getViewport, clampToViewport } from 'layercraft';

const anchorRect = anchorEl.getBoundingClientRect();
const floatingRect = floatingEl.getBoundingClientRect();

const pos = getPosition(anchorRect, floatingRect, {
  placement: 'bottom',
  offset: 8,
});

const viewport = getViewport();
const clamped = clampToViewport(
  pos.top, 
  pos.left, 
  floatingRect.width, 
  floatingRect.height, 
  viewport
);

floatingEl.style.top = `${clamped.top}px`;
floatingEl.style.left = `${clamped.left}px`;
```

## Placements
```
top-start      top       top-end
        ┌────────────┐
left-start    ANCHOR    right-start
left                    right
left-end                right-end
        └────────────┘
bottom-start  bottom   bottom-end
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
| `hoverDelay` | `number` | `100` | Delay before closing on hover (ms) |
| `autoFlip` | `boolean` | `true` | Flip to opposite side if no space |
| `fallbackPlacements` | `Placement[]` | `undefined` | Custom fallback placement order |
| `arrow` | `boolean \| { size: number }` | `false` | Enable arrow positioning |
| `zIndex` | `number` | `9999` | z-index for floating element |

#### Return Value

| Property | Type | Description |
|----------|------|-------------|
| `refCallbacks.anchor` | `function` | Attach to anchor element |
| `refCallbacks.floating` | `function` | Attach to floating element |
| `refCallbacks.arrow` | `function` | Attach to arrow element |
| `floatingStyles` | `CSSProperties` | Apply to floating element |
| `arrowStyles` | `CSSProperties` | Apply to arrow element |
| `isOpen` | `boolean` | Current open state |
| `setIsOpen` | `function` | Manually control open state |
| `actualPlacement` | `Placement` | The placement used (may differ if flipped) |
| `isReady` | `boolean` | True after position is calculated |

### Portal

Renders children into `document.body` to escape overflow containers.
```tsx
import { Portal } from 'layercraft';

<Portal>
  <div>This renders at document.body</div>
</Portal>

// With custom container
<Portal container={document.getElementById('portal-root')}>
  <div>This renders in #portal-root</div>
</Portal>
```

## Architecture
```
src/
├── core/           # Pure math, no dependencies
│   ├── getPosition.ts
│   └── viewport.ts
└── react/          # React adapter
    ├── useAnchor.ts
    └── Portal.tsx
```

The core is framework-agnostic. The React hook is a thin wrapper. You could build a Vue or Svelte adapter on the same core.

## Limitations

- Layercraft does not manage stacking between multiple floating elements by default. Use the `zIndex` option to control stacking order manually.
- No built-in animations (use CSS transitions or animation libraries)
- React 17+ required

## Demo

[Live Demo](https://layercraft-smoky.vercel.app)

## Local Development
```bash
npm install
npm run dev
```

## License

MIT © Venkatesh M