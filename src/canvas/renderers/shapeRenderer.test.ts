import { describe, it, expect } from 'vitest';
import { hexToRgba } from './shapeRenderer';

describe('shapeRenderer [R7]', () => {
  describe('hexToRgba [R7.4]', () => {
    it('converts hex color to rgba string', () => {
      expect(hexToRgba('#ff0000', 0.3)).toBe('rgba(255,0,0,0.3)');
    });

    it('handles green', () => {
      expect(hexToRgba('#22c55e', 0.5)).toBe('rgba(34,197,94,0.5)');
    });
  });
});
