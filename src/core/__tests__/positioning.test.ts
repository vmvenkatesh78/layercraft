import { describe, it, expect } from 'vitest';
import { getPosition } from '../getPosition';
import { getPositionWithFlip, getOppositePlacement } from '../flip';
import { clampToViewport, isOutOfBounds } from '../viewport';

// Mock DOMRect helper
const createRect = (x: number, y: number, width: number, height: number): DOMRect => ({
    x,
    y,
    width,
    height,
    top: y,
    left: x,
    right: x + width,
    bottom: y + height,
    toJSON: () => ({}),
});

describe('getPosition', () => {
    const anchorRect = createRect(100, 100, 80, 40); // anchor at (100,100), 80x40
    const floatingRect = createRect(0, 0, 120, 50);  // floating is 120x50

    it('positions bottom placement correctly', () => {
        const result = getPosition(anchorRect, floatingRect, { placement: 'bottom', offset: 8 });

        expect(result.placement).toBe('bottom');
        expect(result.top).toBe(148); // anchor.bottom (140) + offset (8)
        expect(result.left).toBe(80); // anchor.left + (anchor.width - floating.width) / 2
    });

    it('positions top placement correctly', () => {
        const result = getPosition(anchorRect, floatingRect, { placement: 'top', offset: 8 });

        expect(result.placement).toBe('top');
        expect(result.top).toBe(42); // anchor.top (100) - floating.height (50) - offset (8)
    });

    it('positions bottom-start alignment correctly', () => {
        const result = getPosition(anchorRect, floatingRect, { placement: 'bottom-start', offset: 8 });

        expect(result.placement).toBe('bottom-start');
        expect(result.left).toBe(100); // aligned to anchor.left
    });

    it('applies offset correctly', () => {
        const withOffset = getPosition(anchorRect, floatingRect, { placement: 'bottom', offset: 16 });
        const withoutOffset = getPosition(anchorRect, floatingRect, { placement: 'bottom', offset: 0 });

        expect(withOffset.top - withoutOffset.top).toBe(16);
    });
});

describe('getOppositePlacement', () => {
    it('flips top to bottom', () => {
        expect(getOppositePlacement('top')).toBe('bottom');
    });

    it('flips bottom-start to top-start', () => {
        expect(getOppositePlacement('bottom-start')).toBe('top-start');
    });

    it('flips left to right', () => {
        expect(getOppositePlacement('left')).toBe('right');
    });

    it('flips right-end to left-end', () => {
        expect(getOppositePlacement('right-end')).toBe('left-end');
    });
});

describe('getPositionWithFlip', () => {
    const viewport = { width: 800, height: 600, scrollX: 0, scrollY: 0 };
    const floatingRect = createRect(0, 0, 100, 50);

    it('flips from bottom to top when no space below', () => {
        // Anchor near bottom of viewport
        const anchorRect = createRect(100, 560, 80, 30);

        const result = getPositionWithFlip(
            anchorRect,
            floatingRect,
            { placement: 'bottom', offset: 8 },
            viewport
        );

        expect(result.placement).toBe('top');
    });

    it('keeps placement when space is available', () => {
        // Anchor in middle of viewport
        const anchorRect = createRect(100, 200, 80, 30);

        const result = getPositionWithFlip(
            anchorRect,
            floatingRect,
            { placement: 'bottom', offset: 8 },
            viewport
        );

        expect(result.placement).toBe('bottom');
    });
});

describe('clampToViewport', () => {
    const viewport = { width: 800, height: 600, scrollX: 0, scrollY: 0 };

    it('clamps position when floating goes off left edge', () => {
        const result = clampToViewport(-20, -20, 100, 50, viewport);

        expect(result.left).toBe(8); // default padding
        expect(result.top).toBe(8);
    });

    it('clamps position when floating goes off right edge', () => {
        const result = clampToViewport(100, 750, 100, 50, viewport);

        expect(result.left).toBe(692); // viewport.width - floating.width - padding
    });

    it('does not clamp when position is within bounds', () => {
        const result = clampToViewport(100, 200, 100, 50, viewport);

        expect(result.top).toBe(100);
        expect(result.left).toBe(200);
    });
});

describe('isOutOfBounds', () => {
    const viewport = { width: 800, height: 600, scrollX: 0, scrollY: 0 };

    it('detects top overflow', () => {
        const result = isOutOfBounds(2, 100, 100, 50, viewport);

        expect(result.top).toBe(true);
        expect(result.bottom).toBe(false);
    });

    it('detects bottom overflow', () => {
        const result = isOutOfBounds(560, 100, 100, 50, viewport);

        expect(result.bottom).toBe(true);
        expect(result.top).toBe(false);
    });

    it('detects no overflow when within bounds', () => {
        const result = isOutOfBounds(100, 100, 100, 50, viewport);

        expect(result.top).toBe(false);
        expect(result.bottom).toBe(false);
        expect(result.left).toBe(false);
        expect(result.right).toBe(false);
    });
});