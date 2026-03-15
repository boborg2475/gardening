import { describe, it, expect } from 'vitest';
import { createRectanglePoints } from './RectangleTool';

describe('RectangleTool [BMAD-rectangle-tool]', () => {
  it('should create 4 corner points from two diagonal points', () => {
    const points = createRectanglePoints({ x: 0, y: 0 }, { x: 10, y: 5 });
    expect(points).toHaveLength(4);
    expect(points[0]).toEqual({ x: 0, y: 0 });
    expect(points[1]).toEqual({ x: 10, y: 0 });
    expect(points[2]).toEqual({ x: 10, y: 5 });
    expect(points[3]).toEqual({ x: 0, y: 5 });
  });

  it('should handle reversed drag direction', () => {
    const points = createRectanglePoints({ x: 10, y: 5 }, { x: 0, y: 0 });
    expect(points).toHaveLength(4);
    // Should still produce a valid rectangle
    expect(points[0]).toEqual({ x: 10, y: 5 });
    expect(points[1]).toEqual({ x: 0, y: 5 });
    expect(points[2]).toEqual({ x: 0, y: 0 });
    expect(points[3]).toEqual({ x: 10, y: 0 });
  });
});
