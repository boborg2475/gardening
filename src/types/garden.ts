export interface Point {
  x: number;
  y: number;
}

export type SunExposure = 'full' | 'partial' | 'shade';
export type SoilType = 'clay' | 'sandy' | 'loam' | 'silt' | 'peat' | 'chalk';

export interface ShapeBase {
  id: string;
  vertices: Point[];
}

export interface PropertyBoundary extends ShapeBase {
  kind: 'property';
}

export interface HouseOutline extends ShapeBase {
  kind: 'house';
}

export interface Zone extends ShapeBase {
  kind: 'zone';
  name: string;
  color: string;
  sunExposure: SunExposure;
  soilType: SoilType;
  notes: string;
}

export type Shape = PropertyBoundary | HouseOutline | Zone;

export interface Project {
  id: string;
  name: string;
  property: PropertyBoundary | null;
  house: HouseOutline | null;
  zones: Zone[];
  updatedAt: number;
}

export type Tool =
  | 'select'
  | 'draw-property'
  | 'draw-house'
  | 'draw-zone-rect'
  | 'draw-zone-poly';

export interface ViewTransform {
  offsetX: number;
  offsetY: number;
  scale: number;
}
