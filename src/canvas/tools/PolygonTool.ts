import type { Point, Shape, ShapeType, Zone } from '../../types/garden';
import { nanoid } from 'nanoid';

/** Check if a point is close enough to the first vertex to close the polygon */
export function isCloseToFirstVertex(
  point: Point,
  vertices: Point[],
  threshold: number,
): boolean {
  if (vertices.length < 3) return false;
  const first = vertices[0];
  const dx = point.x - first.x;
  const dy = point.y - first.y;
  return Math.sqrt(dx * dx + dy * dy) <= threshold;
}

const SHAPE_DEFAULTS: Record<string, { name: string; color: string }> = {
  property: { name: 'Property Boundary', color: '#8BC34A' },
  house: { name: 'House', color: '#9E9E9E' },
  zone: { name: 'New Zone', color: '#4CAF50' },
};

/** Create a shape from polygon vertices */
export function createPolygonShape(
  points: Point[],
  shapeType: ShapeType,
): Shape | Zone {
  const defaults = SHAPE_DEFAULTS[shapeType] ?? SHAPE_DEFAULTS.zone;

  const base = {
    id: nanoid(),
    type: shapeType,
    points: [...points],
    name: defaults.name,
    color: defaults.color,
  };

  if (shapeType === 'zone') {
    return {
      ...base,
      type: 'zone' as const,
      sunExposure: 'full' as const,
      soilType: '',
      notes: '',
    };
  }

  return base;
}
