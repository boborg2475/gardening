import type { Zone, PlacedFeature, Planting } from '../types/project';
import type { ProjectData } from './projectStore';
import type { UIData } from './uiStore';

export function selectedZone(
  projectState: ProjectData,
  uiState: UIData
): Zone | undefined {
  return uiState.selectedType === 'zone'
    ? projectState.zones.find((z) => z.id === uiState.selectedId)
    : undefined;
}

export function selectedFeature(
  projectState: ProjectData,
  uiState: UIData
): PlacedFeature | undefined {
  return uiState.selectedType === 'feature'
    ? projectState.features.find((f) => f.id === uiState.selectedId)
    : undefined;
}

export function plantingsForZone(
  state: ProjectData,
  zoneId: string
): Planting[] {
  return state.plantings.filter((p) => p.zoneId === zoneId);
}

export function visibleZones(
  projectState: ProjectData,
  uiState: UIData
): Zone[] {
  return uiState.layers.zones ? projectState.zones : [];
}

export function visibleFeatures(
  projectState: ProjectData,
  uiState: UIData
): PlacedFeature[] {
  return uiState.layers.features ? projectState.features : [];
}
