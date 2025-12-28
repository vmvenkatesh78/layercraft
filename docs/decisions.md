# Architecture Decisions

Notes on why things are built the way they are.

---

## Fixed positioning + portal pattern

Floating elements use `position: fixed`. We expect consumers to portal to document.body.

Why: Avoids z-index nightmares and overflow:hidden clipping. The DOM hierarchy shouldn't affect where a tooltip appears.

---

## Core is framework-agnostic

All positioning math lives in `src/core/` with zero dependencies. React stuff is in `src/react/`.

Why: 
- Core is just functions, easy to test
- Could add Vue/Svelte adapters later
- Smaller bundle if someone only needs the math

---

## Callback refs instead of object refs

React 19 broke our ref types. `RefObject<HTMLElement>` can't be assigned to a button ref anymore.

Fix: Switched to callback refs `(node) => { ref.current = node }`. Works with any element.

---

## Auto-flip on by default

If there's no space at the requested placement, we flip to the opposite side. This is on by default but configurable via `autoFlip: false`.

We also expose `actualPlacement` so consumers know when a flip happened. Useful for arrow positioning later.