export type Point = {
  x: number;
  y: number;
};

export type ShapeType = 'property' | 'house' | 'zone';

export type SunExposure = 'full' | 'partial' | 'shade';

export type ToolType = 'select' | 'property' | 'house' | 'zoneRect' | 'zonePoly';

export type Shape = {
  id: string;
  type: ShapeType;
  points: Point[];
  name: string;
  color: string;
  sunExposure?: SunExposure;
  soilType?: string;
  notes?: string;
};

export type Project = {
  id: string;
  name: string;
  shapes: Shape[];
  createdAt: number;
  updatedAt: number;
};
