# Layercraft

A positioning engine for floating UI elements. Built to solve real problems with tooltips, dropdowns, and popovers — without the magic.

## Why this exists

Positioning floating elements sounds simple until you hit:
- `overflow: hidden` clipping your dropdown
- z-index wars across stacking contexts
- Tooltips getting cut off at viewport edges
- Mysterious jumps when content resizes

Existing solutions (Popper.js, Floating UI) work, but they're often opaque. When something breaks, good luck debugging.

Layercraft takes a different approach: explicit math, predictable behavior, no magic.

## What it does

- Positions floating elements relative to an anchor (12 placement options)
- Flips automatically when there's no space
- Clamps to viewport so nothing gets cut off
- Handles scroll, resize, and dynamic content

## Install
```bash
npm install layercraft
```

## Usage

### React
```tsx
import { useAnchor } from 'layercraft/react';

function Dropdown() {
  const { refCallbacks, floatingStyles, isOpen } = useAnchor({
    placement: 'bottom-start',
    trigger: 'click',
  });

  return (
    <>
      <button ref={refCallbacks.anchor}>Open menu</button>
      {isOpen && (
        <div ref={refCallbacks.floating} style={floatingStyles}>
          Dropdown content
        </div>
      )}
    </>
  );
}
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
const clamped = clampToViewport(pos.top, pos.left, floatingRect.width, floatingRect.height, viewport);

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

## Hook Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `placement` | Placement | `'bottom'` | Where to position the floating element |
| `offset` | number | `8` | Gap between anchor and floating element |
| `trigger` | `'click'` \| `'hover'` | `'click'` | How to open the floating element |
| `closeOnOutsideClick` | boolean | `true` | Close when clicking outside |
| `hoverDelay` | number | `100` | Delay before closing on hover (ms) |
| `autoFlip` | boolean | `true` | Flip to opposite side if no space |

## Hook Return

| Property | Type | Description |
|----------|------|-------------|
| `refCallbacks.anchor` | function | Attach to anchor element |
| `refCallbacks.floating` | function | Attach to floating element |
| `floatingStyles` | CSSProperties | Apply to floating element |
| `isOpen` | boolean | Current open state |
| `setIsOpen` | function | Manually control open state |
| `actualPlacement` | Placement | The placement used (may differ if flipped) |
| `isReady` | boolean | True after position is calculated |

## Architecture
```
src/
├── core/           # Pure math, no dependencies
│   ├── getPosition.ts
│   ├── viewport.ts
│   └── flip.ts
└── react/          # React adapter
    └── useAnchor.ts
```

The core is framework-agnostic. The React hook is a thin wrapper. You could build a Vue or Svelte adapter on the same core.

## Known Issues

There's a minor flicker when opening after a flip scenario. See [CHALLENGES.md](docs/CHALLENGES.md) for details and what we tried.

## Local Development
```bash
npm install
npm run dev
```

## License

MIT