import type { Point, Shape } from '../../types/garden';
import { pointInPolygon } from './hitTest';

/**
 * Find the topmost shape at the given world coordinate.
 * Shapes later in the array are considered "on top".
 */
export function findShapeAtPoint(point: Point, shapes: Shape[]): Shape | undefined {
  // Iterate in reverse so topmost (last drawn) shape wins
  for (let i = shapes.length - 1; i >= 0; i--) {
    const shape = shapes[i];
    if (shape.points.length >= 3 && pointInPolygon(point, shape.points)) {
      return shape;
    }
  }
  return undefined;
}

/** Calculate the offset between a point and each vertex of a shape, for drag operations */
export function calculateDragOffsets(point: Point, shape: Shape): Point[] {
  return shape.points.map((p) => ({
    x: p.x - point.x,
    y: p.y - point.y,
  }));
}

/** Apply drag offsets to get new shape points */
export function applyDragOffsets(point: Point, offsets: Point[]): Point[] {
  return offsets.map((o) => ({
    x: point.x + o.x,
    y: point.y + o.y,
  }));
}
