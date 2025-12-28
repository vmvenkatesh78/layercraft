# Challenges & Known Issues

## Open Issues

### Flicker on first open after flip

When the screen is small and the floating element needs to flip (e.g., from bottom to top), there's a brief flicker where it shows at the wrong position first.

We tried a bunch of things:
- `visibility: hidden` until position is calculated
- `opacity: 0` approach
- `useLayoutEffect` instead of `useEffect`
- Debouncing ResizeObserver
- Resetting position state on close

None fully solved it. The root cause is that we need the element in the DOM to measure it, but by then React has already painted once.

Might revisit with off-screen pre-rendering or look at how Floating UI handles this.

---

## Solved

### Position jump on first hover

First hover after changing placement had wrong spacing. Fixed with ResizeObserver + useLayoutEffect combo.

### React 19 ref types

React 19 is stricter about ref types. `RefObject<HTMLElement>` doesn't work for `<button>` refs anymore. Switched to callback refs.

### ESLint complaining about setState in effects

The `react-hooks/set-state-in-effect` rule doesn't like setState in useLayoutEffect. But that's exactly what we need for layout sync. Disabled with comment.

---

## Learnings

- Positioning is harder than it looks. Now I get why Popper.js exists.
- The gap between React render and browser paint causes real bugs.
- useLayoutEffect exists for a reason — use it for DOM measurements.
- ResizeObserver is essential for dynamic content.
- Sometimes documenting a limitation is better than hacking around it.