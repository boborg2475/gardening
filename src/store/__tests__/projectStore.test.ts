import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createProjectStore } from '../projectStore';
import type { Zone, PlacedFeature, Planting, Measurement } from '../../types/project';
import { SoilType, SunExposure, PlantingStatus } from '../../types/project';

function makeZone(overrides: Partial<Zone> = {}): Zone {
  return {
    id: 'zone-1',
    name: 'Test Zone',
    points: [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ],
    color: '#00ff00',
    soilType: SoilType.Loam,
    sunExposure: SunExposure.FullSun,
    notes: '',
    ...overrides,
  };
}

function makeFeature(overrides: Partial<PlacedFeature> = {}): PlacedFeature {
  return {
    id: 'feat-1',
    templateId: 'tree-oak',
    name: 'Oak Tree',
    position: { x: 5, y: 5 },
    rotation: 0,
    scale: 1,
    ...overrides,
  };
}

function makePlanting(overrides: Partial<Planting> = {}): Planting {
  return {
    id: 'plant-1',
    zoneId: 'zone-1',
    plantId: 'tomato',
    name: 'Tomato',
    position: { x: 2, y: 3 },
    datePlanted: null,
    status: PlantingStatus.Planned,
    notes: '',
    ...overrides,
  };
}

function makeMeasurement(overrides: Partial<Measurement> = {}): Measurement {
  return {
    id: 'meas-1',
    startPoint: { x: 0, y: 0 },
    endPoint: { x: 10, y: 0 },
    label: '10 ft',
    ...overrides,
  };
}

describe('projectStore [LLD-02, BEAM-SP-001]', () => {
  let store: ReturnType<typeof createProjectStore>;

  beforeEach(() => {
    store = createProjectStore();
  });

  describe('default state [BEAM-SP-001]', () => {
    it('initializes with a non-empty id', () => {
      expect(store.getState().id).toBeTruthy();
      expect(typeof store.getState().id).toBe('string');
    });

    it('initializes with name "Untitled Project"', () => {
      expect(store.getState().name).toBe('Untitled Project');
    });

    it('initializes with imperial units', () => {
      expect(store.getState().units).toBe('imperial');
    });

    it('initializes with null propertyBoundary and houseOutline', () => {
      expect(store.getState().propertyBoundary).toBeNull();
      expect(store.getState().houseOutline).toBeNull();
    });

    it('initializes with empty arrays for zones, features, plantings, measurements', () => {
      expect(store.getState().zones).toEqual([]);
      expect(store.getState().features).toEqual([]);
      expect(store.getState().plantings).toEqual([]);
      expect(store.getState().measurements).toEqual([]);
    });

    it('initializes with ISO datetime strings for createdAt and updatedAt', () => {
      const { createdAt, updatedAt } = store.getState();
      expect(new Date(createdAt).toISOString()).toBe(createdAt);
      expect(new Date(updatedAt).toISOString()).toBe(updatedAt);
    });
  });

  describe('setPropertyBoundary [LLD-02]', () => {
    it('sets the property boundary points', () => {
      const points = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 80 },
        { x: 0, y: 80 },
      ];
      store.getState().setPropertyBoundary(points);
      expect(store.getState().propertyBoundary).toEqual(points);
    });

    it('updates updatedAt', () => {
      vi.useFakeTimers();
      const store2 = createProjectStore();
      vi.advanceTimersByTime(10);
      store2.getState().setPropertyBoundary([{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 0 }]);
      expect(store2.getState().updatedAt).not.toBe(store2.getState().createdAt);
      vi.useRealTimers();
    });
  });

  describe('setHouseOutline [LLD-02]', () => {
    it('sets the house outline points', () => {
      const points = [
        { x: 20, y: 20 },
        { x: 60, y: 20 },
        { x: 60, y: 50 },
        { x: 20, y: 50 },
      ];
      store.getState().setHouseOutline(points);
      expect(store.getState().houseOutline).toEqual(points);
    });
  });

  describe('addZone [BEAM-SP-002]', () => {
    it('appends a zone to the zones array', () => {
      const zone = makeZone();
      store.getState().addZone(zone);
      expect(store.getState().zones).toHaveLength(1);
      expect(store.getState().zones[0]).toEqual(zone);
    });

    it('updates updatedAt', () => {
      vi.useFakeTimers();
      const store2 = createProjectStore();
      vi.advanceTimersByTime(10);
      store2.getState().addZone(makeZone());
      expect(store2.getState().updatedAt).not.toBe(store2.getState().createdAt);
      vi.useRealTimers();
    });
  });

  describe('updateZone [BEAM-SP-003]', () => {
    it('shallow-merges updates into the matching zone', () => {
      store.getState().addZone(makeZone({ id: 'z1', name: 'Original' }));
      store.getState().updateZone('z1', { name: 'Updated' });
      expect(store.getState().zones[0].name).toBe('Updated');
      expect(store.getState().zones[0].color).toBe('#00ff00'); // unchanged
    });

    it('is a no-op if zone id not found', () => {
      store.getState().addZone(makeZone({ id: 'z1' }));
      const before = store.getState().zones;
      store.getState().updateZone('nonexistent', { name: 'Nope' });
      expect(store.getState().zones).toEqual(before);
    });

    it('preserves other zones', () => {
      store.getState().addZone(makeZone({ id: 'z1', name: 'Zone 1' }));
      store.getState().addZone(makeZone({ id: 'z2', name: 'Zone 2' }));
      store.getState().updateZone('z1', { name: 'Updated' });
      expect(store.getState().zones[1].name).toBe('Zone 2');
    });
  });

  describe('deleteZone [BEAM-SP-004]', () => {
    it('removes the zone matching the id', () => {
      store.getState().addZone(makeZone({ id: 'z1' }));
      store.getState().deleteZone('z1');
      expect(store.getState().zones).toHaveLength(0);
    });

    it('cascade deletes plantings belonging to the zone', () => {
      store.getState().addZone(makeZone({ id: 'z1' }));
      store.getState().addPlanting(makePlanting({ id: 'p1', zoneId: 'z1' }));
      store.getState().addPlanting(makePlanting({ id: 'p2', zoneId: 'z1' }));
      store.getState().addPlanting(makePlanting({ id: 'p3', zoneId: 'z2' }));
      store.getState().deleteZone('z1');
      expect(store.getState().plantings).toHaveLength(1);
      expect(store.getState().plantings[0].id).toBe('p3');
    });

    it('does not affect plantings of other zones', () => {
      store.getState().addZone(makeZone({ id: 'z1' }));
      store.getState().addZone(makeZone({ id: 'z2' }));
      store.getState().addPlanting(makePlanting({ id: 'p1', zoneId: 'z2' }));
      store.getState().deleteZone('z1');
      expect(store.getState().plantings).toHaveLength(1);
    });
  });

  describe('addFeature / updateFeature / deleteFeature [LLD-02]', () => {
    it('adds a feature', () => {
      store.getState().addFeature(makeFeature());
      expect(store.getState().features).toHaveLength(1);
    });

    it('updates a feature by id', () => {
      store.getState().addFeature(makeFeature({ id: 'f1' }));
      store.getState().updateFeature('f1', { rotation: 45 });
      expect(store.getState().features[0].rotation).toBe(45);
    });

    it('deletes a feature by id', () => {
      store.getState().addFeature(makeFeature({ id: 'f1' }));
      store.getState().deleteFeature('f1');
      expect(store.getState().features).toHaveLength(0);
    });
  });

  describe('addPlanting / updatePlanting / deletePlanting [LLD-02]', () => {
    it('adds a planting', () => {
      store.getState().addPlanting(makePlanting());
      expect(store.getState().plantings).toHaveLength(1);
    });

    it('updates a planting by id', () => {
      store.getState().addPlanting(makePlanting({ id: 'p1' }));
      store.getState().updatePlanting('p1', { status: PlantingStatus.Planted });
      expect(store.getState().plantings[0].status).toBe(PlantingStatus.Planted);
    });

    it('deletes a planting by id', () => {
      store.getState().addPlanting(makePlanting({ id: 'p1' }));
      store.getState().deletePlanting('p1');
      expect(store.getState().plantings).toHaveLength(0);
    });
  });

  describe('addMeasurement / deleteMeasurement [LLD-02]', () => {
    it('adds a measurement', () => {
      store.getState().addMeasurement(makeMeasurement());
      expect(store.getState().measurements).toHaveLength(1);
    });

    it('deletes a measurement by id', () => {
      store.getState().addMeasurement(makeMeasurement({ id: 'm1' }));
      store.getState().deleteMeasurement('m1');
      expect(store.getState().measurements).toHaveLength(0);
    });
  });

  describe('loadProject [BEAM-SP-022]', () => {
    it('replaces entire store state', () => {
      store.getState().addZone(makeZone({ id: 'z1' }));

      const newState = {
        id: 'loaded-id',
        name: 'Loaded Project',
        units: 'metric' as const,
        propertyBoundary: [{ x: 0, y: 0 }, { x: 50, y: 0 }, { x: 50, y: 50 }],
        houseOutline: null,
        zones: [makeZone({ id: 'z-loaded' })],
        features: [],
        plantings: [],
        measurements: [],
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-06-01T00:00:00.000Z',
      };

      store.getState().loadProject(newState);

      expect(store.getState().id).toBe('loaded-id');
      expect(store.getState().name).toBe('Loaded Project');
      expect(store.getState().units).toBe('metric');
      expect(store.getState().zones).toHaveLength(1);
      expect(store.getState().zones[0].id).toBe('z-loaded');
    });
  });

  describe('resetProject [BEAM-SP-001, BEAM-SP-007]', () => {
    it('resets to default state with a new id', () => {
      store.getState().addZone(makeZone());
      const oldId = store.getState().id;

      store.getState().resetProject();

      expect(store.getState().id).not.toBe(oldId);
      expect(store.getState().name).toBe('Untitled Project');
      expect(store.getState().zones).toEqual([]);
      expect(store.getState().propertyBoundary).toBeNull();
    });
  });

  describe('unit system [BEAM-SP-023]', () => {
    it('persists units with project state via loadProject', () => {
      store.getState().loadProject({
        ...store.getState(),
        units: 'metric',
      });
      expect(store.getState().units).toBe('metric');
    });
  });
});
