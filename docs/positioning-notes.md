# Positioning Notes

Working notes on how the positioning engine works.

---

## The core problem

Given an anchor element and a floating element, figure out where the floating element should go so it:
1. Is next to the anchor (with some offset)
2. Stays within the viewport
3. Flips if needed

Sounds simple. It's not.

---

## Assumptions (these must be true)

- anchorRect comes from getBoundingClientRect() — viewport coordinates
- floatingRect needs the element in DOM first (can't measure what doesn't exist)
- We use position:fixed, so coordinates are relative to viewport
- Offset is the gap between anchor and floating, perpendicular to anchor edge

---

## Placement model
```
      top-start     top        top-end
           ┌──────────────────┐
left-start │                  │ right-start
left       │     ANCHOR       │ right
left-end   │                  │ right-end
           └──────────────────┘
   bottom-start   bottom   bottom-end
```

12 placements = 4 sides × 3 alignments (start/center/end)

---

## What we don't handle (yet)

- Arrows
- Custom boundaries (only viewport for now)
- Virtual anchors (anchor without DOM node)
- RTL layouts
- Coordinating with animations

## What we won't handle (intentional)

- Auto fallback chains (too magic)
- Style injection (consumer's job)
- Animation opinions