import { describe, it, expect } from 'vitest';
import { pointInPolygon, distance, translateVertices } from './geometry';
import type { Point } from '../types/garden';

describe('geometry [R11]', () => {
  const square: Point[] = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 10 },
    { x: 0, y: 10 },
  ];

  describe('pointInPolygon', () => {
    it('returns true for a point inside', () => {
      expect(pointInPolygon({ x: 5, y: 5 }, square)).toBe(true);
    });

    it('returns false for a point outside', () => {
      expect(pointInPolygon({ x: 15, y: 5 }, square)).toBe(false);
    });

    it('returns false for a point far outside', () => {
      expect(pointInPolygon({ x: -5, y: -5 }, square)).toBe(false);
    });
  });

  describe('distance', () => {
    it('computes distance between two points', () => {
      expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
    });
  });

  describe('translateVertices', () => {
    it('moves all vertices by delta', () => {
      const result = translateVertices(square, 5, 3);
      expect(result[0]).toEqual({ x: 5, y: 3 });
      expect(result[2]).toEqual({ x: 15, y: 13 });
    });
  });
});
