// ── Primitives ──────────────────────────────────────────
export interface Point {
  x: number;
  y: number;
}

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

// ── Enums ───────────────────────────────────────────────
export type SunExposure = 'full' | 'partial' | 'shade';
export type SoilType = 'clay' | 'sandy' | 'loam' | 'silt' | 'peat' | 'chalk';

export type ToolType =
  | 'select'
  | 'rectangle'
  | 'polygon_zone'
  | 'property_boundary'
  | 'house_outline';

// ── Domain Objects ──────────────────────────────────────
export interface Zone {
  id: string;
  name: string;
  color: string;
  sunExposure: SunExposure;
  soilType: SoilType;
  notes: string;
  vertices: Point[];
}

export interface PropertyBoundary {
  vertices: Point[];
}

export interface HouseOutline {
  vertices: Point[];
}

// ── Project ─────────────────────────────────────────────
export interface Project {
  id: string;
  name: string;
  propertyBoundary: PropertyBoundary | null;
  houseOutline: HouseOutline | null;
  zones: Zone[];
}

// ── Persistence ─────────────────────────────────────────
export interface SavedProject {
  id: string;
  name: string;
  data: Project;
  updatedAt: number;
}

// ── Layer Visibility ────────────────────────────────────
export interface LayerVisibility {
  grid: boolean;
  property: boolean;
  house: boolean;
  zones: boolean;
  selection: boolean;
}
