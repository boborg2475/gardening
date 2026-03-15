import { describe, it, expect } from 'vitest';
import { isCloseToFirstVertex } from './PolygonTool';

describe('PolygonTool [BMAD-polygon-tool]', () => {
  describe('isCloseToFirstVertex', () => {
    it('should return true when point is within threshold of first vertex', () => {
      const vertices = [{ x: 10, y: 10 }, { x: 20, y: 10 }, { x: 20, y: 20 }];
      expect(isCloseToFirstVertex({ x: 11, y: 11 }, vertices, 5)).toBe(true);
    });

    it('should return false when point is far from first vertex', () => {
      const vertices = [{ x: 10, y: 10 }, { x: 20, y: 10 }, { x: 20, y: 20 }];
      expect(isCloseToFirstVertex({ x: 25, y: 25 }, vertices, 5)).toBe(false);
    });

    it('should return false when fewer than 3 vertices', () => {
      const vertices = [{ x: 10, y: 10 }];
      expect(isCloseToFirstVertex({ x: 10, y: 10 }, vertices, 5)).toBe(false);
    });

    it('should use the distance threshold correctly', () => {
      const vertices = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }];
      expect(isCloseToFirstVertex({ x: 3, y: 4 }, vertices, 5)).toBe(true); // dist = 5
      expect(isCloseToFirstVertex({ x: 4, y: 4 }, vertices, 5)).toBe(false); // dist ~5.66 > 5
    });
  });
});
