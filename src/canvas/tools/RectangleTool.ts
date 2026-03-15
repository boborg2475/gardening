import type { Point, Zone } from '../../types/garden';
import { nanoid } from 'nanoid';

/** Create 4 corner points from two diagonal corners (start and end of drag) */
export function createRectanglePoints(start: Point, end: Point): Point[] {
  return [
    { x: start.x, y: start.y },
    { x: end.x, y: start.y },
    { x: end.x, y: end.y },
    { x: start.x, y: end.y },
  ];
}

/** Create a new zone from a rectangle drag */
export function createRectangleZone(start: Point, end: Point): Zone {
  return {
    id: nanoid(),
    type: 'zone',
    points: createRectanglePoints(start, end),
    name: 'New Zone',
    color: '#4CAF50',
    sunExposure: 'full',
    soilType: '',
    notes: '',
  };
}
