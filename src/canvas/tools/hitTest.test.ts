import { describe, it, expect } from 'vitest';
import { pointInPolygon } from './hitTest';

describe('pointInPolygon [BMAD-select-tool]', () => {
  const square = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 10 },
    { x: 0, y: 10 },
  ];

  it('should return true for a point inside the polygon', () => {
    expect(pointInPolygon({ x: 5, y: 5 }, square)).toBe(true);
  });

  it('should return false for a point outside the polygon', () => {
    expect(pointInPolygon({ x: 15, y: 5 }, square)).toBe(false);
  });

  it('should return false for a point above the polygon', () => {
    expect(pointInPolygon({ x: 5, y: -5 }, square)).toBe(false);
  });

  it('should work with triangles', () => {
    const triangle = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 5, y: 10 },
    ];
    expect(pointInPolygon({ x: 5, y: 3 }, triangle)).toBe(true);
    expect(pointInPolygon({ x: 0, y: 10 }, triangle)).toBe(false);
  });

  it('should handle concave polygons', () => {
    // L-shaped polygon
    const lShape = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 5 },
      { x: 5, y: 5 },
      { x: 5, y: 10 },
      { x: 0, y: 10 },
    ];
    expect(pointInPolygon({ x: 2, y: 2 }, lShape)).toBe(true); // inside bottom-left
    expect(pointInPolygon({ x: 8, y: 2 }, lShape)).toBe(true); // inside bottom-right
    expect(pointInPolygon({ x: 8, y: 8 }, lShape)).toBe(false); // in the cut-out
  });
});
