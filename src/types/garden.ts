/** World-coordinate point in feet */
export interface Point {
  x: number;
  y: number;
}

export type ShapeType = 'property' | 'house' | 'zone';

export type SunExposure = 'full' | 'partial' | 'shade';

/** Base shape — a polygon defined by its vertices */
export interface Shape {
  id: string;
  type: ShapeType;
  points: Point[];
  name: string;
  color: string;
}

/** Zone extends Shape with garden-specific metadata */
export interface Zone extends Shape {
  type: 'zone';
  sunExposure: SunExposure;
  soilType: string;
  notes: string;
}

/** A project contains all shapes for one yard plan */
export interface Project {
  id: string;
  name: string;
  shapes: Shape[];
  createdAt: number;
  updatedAt: number;
}

/** Available drawing/interaction tools */
export type ToolType =
  | 'select'
  | 'rectangle'
  | 'polygon-property'
  | 'polygon-house'
  | 'polygon-zone';

/** Check if a shape is a Zone */
export function isZone(shape: Shape): shape is Zone {
  return shape.type === 'zone';
}
