export interface Point {
  x: number;
  y: number;
}

export type UnitSystem = 'imperial' | 'metric';

export const SoilType = {
  Clay: 'clay',
  Sandy: 'sandy',
  Loam: 'loam',
  Silt: 'silt',
  Peat: 'peat',
  Chalk: 'chalk',
} as const;
export type SoilType = (typeof SoilType)[keyof typeof SoilType];

export const SunExposure = {
  FullSun: 'full-sun',
  PartialSun: 'partial-sun',
  PartialShade: 'partial-shade',
  FullShade: 'full-shade',
} as const;
export type SunExposure = (typeof SunExposure)[keyof typeof SunExposure];

export const PlantingStatus = {
  Planned: 'planned',
  Planted: 'planted',
  Growing: 'growing',
  Harvested: 'harvested',
  Removed: 'removed',
} as const;
export type PlantingStatus = (typeof PlantingStatus)[keyof typeof PlantingStatus];

export interface Zone {
  id: string;
  name: string;
  points: Point[];
  color: string;
  soilType: SoilType;
  sunExposure: SunExposure;
  notes: string;
}

export interface PlacedFeature {
  id: string;
  templateId: string;
  name: string;
  position: Point;
  rotation: number;
  scale: number;
}

export interface Planting {
  id: string;
  zoneId: string;
  plantId: string;
  name: string;
  position: Point;
  datePlanted: string | null;
  status: PlantingStatus;
  notes: string;
}

export interface Measurement {
  id: string;
  startPoint: Point;
  endPoint: Point;
  label: string;
}
