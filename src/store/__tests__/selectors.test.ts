import { describe, it, expect } from 'vitest';
import {
  selectedZone,
  selectedFeature,
  plantingsForZone,
  visibleZones,
  visibleFeatures,
} from '../selectors';
import { SoilType, SunExposure, PlantingStatus } from '../../types/project';
import type { Zone, PlacedFeature, Planting } from '../../types/project';
import type { ProjectData } from '../projectStore';
import type { UIData } from '../uiStore';

function makeProjectData(overrides: Partial<ProjectData> = {}): ProjectData {
  return {
    id: 'proj-1',
    name: 'Test',
    units: 'imperial',
    propertyBoundary: null,
    houseOutline: null,
    zones: [],
    features: [],
    plantings: [],
    measurements: [],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function makeUIData(overrides: Partial<UIData> = {}): UIData {
  return {
    activeTool: 'select',
    selectedId: null,
    selectedType: null,
    drawingPoints: [],
    placingFeatureTemplate: null,
    panX: 0,
    panY: 0,
    zoom: 1,
    layers: {
      grid: true,
      property: true,
      house: true,
      zones: true,
      features: true,
      measurements: true,
    },
    sidebarOpen: true,
    activePanel: 'project',
    isMobile: false,
    ...overrides,
  };
}

const zone1: Zone = {
  id: 'z1',
  name: 'Zone 1',
  points: [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }],
  color: '#ff0000',
  soilType: SoilType.Loam,
  sunExposure: SunExposure.FullSun,
  notes: '',
};

const zone2: Zone = {
  id: 'z2',
  name: 'Zone 2',
  points: [{ x: 20, y: 20 }, { x: 30, y: 20 }, { x: 30, y: 30 }],
  color: '#0000ff',
  soilType: SoilType.Sandy,
  sunExposure: SunExposure.PartialShade,
  notes: '',
};

const feat1: PlacedFeature = {
  id: 'f1',
  templateId: 'tree-oak',
  name: 'Oak',
  position: { x: 5, y: 5 },
  rotation: 0,
  scale: 1,
};

describe('selectedZone [BEAM-SP-020]', () => {
  it('returns the zone when selectedType is zone and id matches', () => {
    const proj = makeProjectData({ zones: [zone1, zone2] });
    const ui = makeUIData({ selectedId: 'z1', selectedType: 'zone' });
    expect(selectedZone(proj, ui)).toEqual(zone1);
  });

  it('returns undefined when selectedType is not zone', () => {
    const proj = makeProjectData({ zones: [zone1] });
    const ui = makeUIData({ selectedId: 'z1', selectedType: 'feature' });
    expect(selectedZone(proj, ui)).toBeUndefined();
  });

  it('returns undefined when no selection', () => {
    const proj = makeProjectData({ zones: [zone1] });
    const ui = makeUIData();
    expect(selectedZone(proj, ui)).toBeUndefined();
  });

  it('returns undefined when id does not match any zone', () => {
    const proj = makeProjectData({ zones: [zone1] });
    const ui = makeUIData({ selectedId: 'nonexistent', selectedType: 'zone' });
    expect(selectedZone(proj, ui)).toBeUndefined();
  });
});

describe('selectedFeature [BEAM-SP-020]', () => {
  it('returns the feature when selectedType is feature and id matches', () => {
    const proj = makeProjectData({ features: [feat1] });
    const ui = makeUIData({ selectedId: 'f1', selectedType: 'feature' });
    expect(selectedFeature(proj, ui)).toEqual(feat1);
  });

  it('returns undefined when selectedType is not feature', () => {
    const proj = makeProjectData({ features: [feat1] });
    const ui = makeUIData({ selectedId: 'f1', selectedType: 'zone' });
    expect(selectedFeature(proj, ui)).toBeUndefined();
  });
});

describe('plantingsForZone [BEAM-SP-021]', () => {
  const p1: Planting = {
    id: 'p1',
    zoneId: 'z1',
    plantId: 'tomato',
    name: 'Tomato',
    position: { x: 1, y: 1 },
    datePlanted: null,
    status: PlantingStatus.Planned,
    notes: '',
  };
  const p2: Planting = {
    id: 'p2',
    zoneId: 'z1',
    plantId: 'basil',
    name: 'Basil',
    position: { x: 2, y: 2 },
    datePlanted: null,
    status: PlantingStatus.Planned,
    notes: '',
  };
  const p3: Planting = {
    id: 'p3',
    zoneId: 'z2',
    plantId: 'rose',
    name: 'Rose',
    position: { x: 3, y: 3 },
    datePlanted: null,
    status: PlantingStatus.Planned,
    notes: '',
  };

  it('returns only plantings for the given zone', () => {
    const proj = makeProjectData({ plantings: [p1, p2, p3] });
    expect(plantingsForZone(proj, 'z1')).toEqual([p1, p2]);
  });

  it('returns empty array when zone has no plantings', () => {
    const proj = makeProjectData({ plantings: [p3] });
    expect(plantingsForZone(proj, 'z1')).toEqual([]);
  });

  it('returns empty array for nonexistent zone id', () => {
    const proj = makeProjectData({ plantings: [p1] });
    expect(plantingsForZone(proj, 'nonexistent')).toEqual([]);
  });
});

describe('visibleZones [LLD-02]', () => {
  it('returns zones when layer is visible', () => {
    const proj = makeProjectData({ zones: [zone1, zone2] });
    const ui = makeUIData();
    expect(visibleZones(proj, ui)).toEqual([zone1, zone2]);
  });

  it('returns empty array when zones layer is hidden', () => {
    const proj = makeProjectData({ zones: [zone1] });
    const ui = makeUIData({
      layers: { grid: true, property: true, house: true, zones: false, features: true, measurements: true },
    });
    expect(visibleZones(proj, ui)).toEqual([]);
  });
});

describe('visibleFeatures [LLD-02]', () => {
  it('returns features when layer is visible', () => {
    const proj = makeProjectData({ features: [feat1] });
    const ui = makeUIData();
    expect(visibleFeatures(proj, ui)).toEqual([feat1]);
  });

  it('returns empty array when features layer is hidden', () => {
    const proj = makeProjectData({ features: [feat1] });
    const ui = makeUIData({
      layers: { grid: true, property: true, house: true, zones: true, features: false, measurements: true },
    });
    expect(visibleFeatures(proj, ui)).toEqual([]);
  });
});
