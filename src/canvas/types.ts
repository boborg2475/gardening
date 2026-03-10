import type { UnitSystem } from '../types/project';

export interface Viewport {
  panX: number;
  panY: number;
  zoom: number;
  canvasWidth: number;
  canvasHeight: number;
}

export interface HitResult {
  type: 'zone' | 'feature' | 'propertyVertex' | 'house';
  id: string;
  worldPoint: { x: number; y: number };
}

export interface GridConfig {
  minorSpacing: number;
  majorEvery: number;
  units: UnitSystem;
}
