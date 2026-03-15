/** 2D point in world coordinates (feet) */
export interface Point {
  x: number;
  y: number;
}

/** Sun exposure levels */
export type SunExposure = 'full' | 'partial' | 'shade';

/** Soil types */
export type SoilType = 'clay' | 'sandy' | 'loamy' | 'silty' | 'peaty' | 'chalky';

/** Drawing tool types */
export type ToolType =
  | 'select'
  | 'polygon-property'
  | 'polygon-house'
  | 'polygon-zone'
  | 'rectangle-zone';

/** Shape layer types */
export type ShapeLayer = 'property' | 'house' | 'zone';

/** Base shape interface */
export interface BaseShape {
  id: string;
  layer: ShapeLayer;
  vertices: Point[];
}

/** Property boundary polygon */
export interface PropertyBoundary extends BaseShape {
  layer: 'property';
}

/** House outline polygon */
export interface HouseOutline extends BaseShape {
  layer: 'house';
}

/** Zone metadata */
export interface ZoneMetadata {
  name: string;
  color: string;
  sunExposure: SunExposure;
  soilType: SoilType;
  notes: string;
}

/** Garden zone (rectangle or polygon) */
export interface Zone extends BaseShape {
  layer: 'zone';
  metadata: ZoneMetadata;
}

/** Any shape on the canvas */
export type Shape = PropertyBoundary | HouseOutline | Zone;

/** Project data (persisted) */
export interface ProjectData {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  shapes: Shape[];
}

/** Project store state */
export interface ProjectState {
  project: ProjectData;
  // Actions
  addShape: (shape: Shape) => void;
  removeShape: (id: string) => void;
  updateShape: (id: string, updates: Partial<Omit<Shape, 'id' | 'layer'>>) => void;
  updateZoneMetadata: (id: string, metadata: Partial<ZoneMetadata>) => void;
  moveShape: (id: string, dx: number, dy: number) => void;
  setProject: (project: ProjectData) => void;
  newProject: (name?: string) => void;
}

/** UI store state */
export interface UIState {
  activeTool: ToolType;
  selectedShapeId: string | null;
  panOffset: Point;
  zoom: number;
  showGrid: boolean;
  sidePanelOpen: boolean;
  // Actions
  setActiveTool: (tool: ToolType) => void;
  setSelectedShapeId: (id: string | null) => void;
  setPanOffset: (offset: Point) => void;
  setZoom: (zoom: number) => void;
  toggleGrid: () => void;
  setSidePanelOpen: (open: boolean) => void;
}
