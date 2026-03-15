import { describe, it, expect, beforeEach } from 'vitest';
import { useProjectStore } from './projectStore';
import type { Point } from '../types/garden';

describe('projectStore [R2]', () => {
  beforeEach(() => {
    useProjectStore.getState().clearProject();
    // Clear undo history
    useProjectStore.temporal.getState().clear();
  });

  describe('initial state [R2.1]', () => {
    it('starts with null property boundary', () => {
      const state = useProjectStore.getState();
      expect(state.project.propertyBoundary).toBeNull();
    });

    it('starts with null house outline', () => {
      const state = useProjectStore.getState();
      expect(state.project.houseOutline).toBeNull();
    });

    it('starts with empty zones array', () => {
      const state = useProjectStore.getState();
      expect(state.project.zones).toEqual([]);
    });
  });

  describe('addZone [R2.2]', () => {
    it('adds a zone with generated id', () => {
      const vertices: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
      ];
      useProjectStore.getState().addZone({
        name: 'Test Bed',
        color: '#22c55e',
        sunExposure: 'full',
        soilType: 'loam',
        notes: '',
        vertices,
      });

      const zones = useProjectStore.getState().project.zones;
      expect(zones).toHaveLength(1);
      expect(zones[0].id).toBeTruthy();
      expect(zones[0].name).toBe('Test Bed');
      expect(zones[0].vertices).toEqual(vertices);
    });

    it('adds multiple zones', () => {
      const v: Point[] = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }];
      useProjectStore.getState().addZone({
        name: 'A', color: '#ff0000', sunExposure: 'full', soilType: 'clay', notes: '', vertices: v,
      });
      useProjectStore.getState().addZone({
        name: 'B', color: '#00ff00', sunExposure: 'shade', soilType: 'sandy', notes: '', vertices: v,
      });

      expect(useProjectStore.getState().project.zones).toHaveLength(2);
    });
  });

  describe('updateZone [R2.3]', () => {
    it('updates zone fields by id', () => {
      const v: Point[] = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }];
      useProjectStore.getState().addZone({
        name: 'Old', color: '#ff0000', sunExposure: 'full', soilType: 'clay', notes: '', vertices: v,
      });

      const zoneId = useProjectStore.getState().project.zones[0].id;
      useProjectStore.getState().updateZone(zoneId, { name: 'New', sunExposure: 'shade' });

      const updated = useProjectStore.getState().project.zones[0];
      expect(updated.name).toBe('New');
      expect(updated.sunExposure).toBe('shade');
      expect(updated.color).toBe('#ff0000'); // unchanged
    });
  });

  describe('removeZone [R2.4]', () => {
    it('removes zone by id', () => {
      const v: Point[] = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }];
      useProjectStore.getState().addZone({
        name: 'A', color: '#ff0000', sunExposure: 'full', soilType: 'clay', notes: '', vertices: v,
      });
      const zoneId = useProjectStore.getState().project.zones[0].id;

      useProjectStore.getState().removeZone(zoneId);
      expect(useProjectStore.getState().project.zones).toHaveLength(0);
    });
  });

  describe('setPropertyBoundary [R2.5]', () => {
    it('sets property boundary vertices', () => {
      const vertices: Point[] = [
        { x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 80 }, { x: 0, y: 80 },
      ];
      useProjectStore.getState().setPropertyBoundary(vertices);

      expect(useProjectStore.getState().project.propertyBoundary).toEqual({ vertices });
    });
  });

  describe('setHouseOutline [R2.6]', () => {
    it('sets house outline vertices', () => {
      const vertices: Point[] = [
        { x: 20, y: 20 }, { x: 60, y: 20 }, { x: 60, y: 50 }, { x: 20, y: 50 },
      ];
      useProjectStore.getState().setHouseOutline(vertices);

      expect(useProjectStore.getState().project.houseOutline).toEqual({ vertices });
    });
  });

  describe('clearProject [R2.7]', () => {
    it('resets project to empty state', () => {
      const v: Point[] = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }];
      useProjectStore.getState().addZone({
        name: 'A', color: '#ff0000', sunExposure: 'full', soilType: 'clay', notes: '', vertices: v,
      });
      useProjectStore.getState().setPropertyBoundary(v);

      useProjectStore.getState().clearProject();

      const state = useProjectStore.getState();
      expect(state.project.zones).toEqual([]);
      expect(state.project.propertyBoundary).toBeNull();
      expect(state.project.houseOutline).toBeNull();
    });
  });

  describe('undo/redo [R2.8]', () => {
    it('undoes the last action', () => {
      const v: Point[] = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }];
      useProjectStore.getState().addZone({
        name: 'A', color: '#ff0000', sunExposure: 'full', soilType: 'clay', notes: '', vertices: v,
      });

      expect(useProjectStore.getState().project.zones).toHaveLength(1);

      useProjectStore.temporal.getState().undo();
      expect(useProjectStore.getState().project.zones).toHaveLength(0);
    });

    it('redoes after undo', () => {
      const v: Point[] = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }];
      useProjectStore.getState().addZone({
        name: 'A', color: '#ff0000', sunExposure: 'full', soilType: 'clay', notes: '', vertices: v,
      });

      useProjectStore.temporal.getState().undo();
      expect(useProjectStore.getState().project.zones).toHaveLength(0);

      useProjectStore.temporal.getState().redo();
      expect(useProjectStore.getState().project.zones).toHaveLength(1);
    });
  });
});
