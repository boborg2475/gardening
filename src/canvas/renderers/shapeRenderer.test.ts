import { describe, it, expect } from 'vitest';
import { pointInPolygon } from './shapeRenderer';
import type { Point } from '../../types/garden';

describe('shapeRenderer [BEAD-007]', () => {
  describe('pointInPolygon', () => {
    const square: Point[] = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
    ];

    it('should return true for point inside polygon', () => {
      expect(pointInPolygon({ x: 5, y: 5 }, square)).toBe(true);
    });

    it('should return false for point outside polygon', () => {
      expect(pointInPolygon({ x: 15, y: 5 }, square)).toBe(false);
    });

    it('should return false for point far outside', () => {
      expect(pointInPolygon({ x: -5, y: -5 }, square)).toBe(false);
    });

    it('should work with triangle', () => {
      const triangle: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 5, y: 10 },
      ];
      expect(pointInPolygon({ x: 5, y: 3 }, triangle)).toBe(true);
      expect(pointInPolygon({ x: 0, y: 10 }, triangle)).toBe(false);
    });

    it('should return false for empty polygon', () => {
      expect(pointInPolygon({ x: 5, y: 5 }, [])).toBe(false);
    });
  });
});
