import { describe, it, expect } from 'vitest';
import { shiftToViewport } from '../viewport';

describe('shiftToViewport', () => {
  const viewport = { width: 800, height: 600, scrollX: 0, scrollY: 0 };

  describe('no shift needed', () => {
    it('returns original position when element fits in viewport', () => {
      const result = shiftToViewport(100, 200, 100, 50, viewport);

      expect(result.top).toBe(100);
      expect(result.left).toBe(200);
      expect(result.shifted.x).toBe(false);
      expect(result.shifted.y).toBe(false);
    });
  });

  describe('horizontal shift', () => {
    it('shifts right when element overflows left edge', () => {
      const result = shiftToViewport(100, -20, 100, 50, viewport);

      expect(result.left).toBe(8); // padding
      expect(result.top).toBe(100); // unchanged
      expect(result.shifted.x).toBe(true);
      expect(result.shifted.y).toBe(false);
    });

    it('shifts left when element overflows right edge', () => {
      const result = shiftToViewport(100, 750, 100, 50, viewport);

      expect(result.left).toBe(692); // viewport.width - width - padding
      expect(result.top).toBe(100); // unchanged
      expect(result.shifted.x).toBe(true);
      expect(result.shifted.y).toBe(false);
    });
  });

  describe('vertical shift', () => {
    it('shifts down when element overflows top edge', () => {
      const result = shiftToViewport(-10, 200, 100, 50, viewport);

      expect(result.top).toBe(8); // padding
      expect(result.left).toBe(200); // unchanged
      expect(result.shifted.x).toBe(false);
      expect(result.shifted.y).toBe(true);
    });

    it('shifts up when element overflows bottom edge', () => {
      const result = shiftToViewport(580, 200, 100, 50, viewport);

      expect(result.top).toBe(542); // viewport.height - height - padding
      expect(result.left).toBe(200); // unchanged
      expect(result.shifted.x).toBe(false);
      expect(result.shifted.y).toBe(true);
    });
  });

  describe('both axes shift', () => {
    it('shifts both axes when element overflows top-left corner', () => {
      const result = shiftToViewport(-10, -20, 100, 50, viewport);

      expect(result.top).toBe(8);
      expect(result.left).toBe(8);
      expect(result.shifted.x).toBe(true);
      expect(result.shifted.y).toBe(true);
    });

    it('shifts both axes when element overflows bottom-right corner', () => {
      const result = shiftToViewport(580, 750, 100, 50, viewport);

      expect(result.top).toBe(542);
      expect(result.left).toBe(692);
      expect(result.shifted.x).toBe(true);
      expect(result.shifted.y).toBe(true);
    });
  });

  describe('custom padding', () => {
    it('respects custom padding value', () => {
      const result = shiftToViewport(-10, -20, 100, 50, viewport, 16);

      expect(result.top).toBe(16);
      expect(result.left).toBe(16);
    });

    it('uses custom padding for right edge calculation', () => {
      const result = shiftToViewport(100, 750, 100, 50, viewport, 16);

      expect(result.left).toBe(684); // viewport.width - width - 16
    });
  });

  describe('edge cases', () => {
    it('handles element exactly at padding boundary', () => {
      const result = shiftToViewport(8, 8, 100, 50, viewport);

      expect(result.top).toBe(8);
      expect(result.left).toBe(8);
      expect(result.shifted.x).toBe(false);
      expect(result.shifted.y).toBe(false);
    });

    it('handles element larger than viewport', () => {
      // Element 900px wide in 800px viewport
      const result = shiftToViewport(100, 100, 900, 50, viewport);

      // Should shift to padding, even though it won't fully fit
      expect(result.left).toBe(-108); // 800 - 900 - 8
      expect(result.shifted.x).toBe(true);
    });

    it('handles zero dimensions', () => {
      const result = shiftToViewport(100, 200, 0, 0, viewport);

      expect(result.top).toBe(100);
      expect(result.left).toBe(200);
      expect(result.shifted.x).toBe(false);
      expect(result.shifted.y).toBe(false);
    });
  });
});