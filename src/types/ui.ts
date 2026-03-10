export type ToolType =
  | 'select'
  | 'draw-property'
  | 'draw-house'
  | 'draw-zone'
  | 'place-feature'
  | 'measure';

export type SelectedType =
  | 'zone'
  | 'feature'
  | 'property-vertex'
  | 'house-vertex'
  | null;

export type PanelType =
  | 'project'
  | 'zones'
  | 'features'
  | 'plantings'
  | 'layers'
  | null;

export interface LayerVisibility {
  grid: boolean;
  property: boolean;
  house: boolean;
  zones: boolean;
  features: boolean;
  measurements: boolean;
}
