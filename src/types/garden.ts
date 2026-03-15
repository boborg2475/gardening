export interface Point {
  x: number;
  y: number;
}

export type SunExposure = 'full' | 'partial' | 'shade';
export type SoilType = 'clay' | 'sandy' | 'loam' | 'silt' | 'peat' | 'chalk';

export type ToolType =
  | 'select'
  | 'property-boundary'
  | 'house-outline'
  | 'zone-rectangle'
  | 'zone-polygon';

export interface Polygon {
  id: string;
  points: Point[];
}

export interface Zone {
  id: string;
  name: string;
  points: Point[];
  color: string;
  sunExposure: SunExposure;
  soilType: SoilType;
  notes: string;
}

export interface Project {
  id: string;
  name: string;
  propertyBoundary: Point[] | null;
  houseOutline: Point[] | null;
  zones: Zone[];
  createdAt: number;
  updatedAt: number;
}

export function createDefaultProject(id: string, name: string): Project {
  return {
    id,
    name,
    propertyBoundary: null,
    houseOutline: null,
    zones: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
