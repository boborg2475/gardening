import { describe, it, expect, beforeEach } from 'vitest';
import { useProjectStore } from './projectStore';
import type { Zone, Point } from '../types/garden';

describe('projectStore [BEAD-002]', () => {
  beforeEach(() => {
    useProjectStore.getState().reset();
  });

  it('should start with a default project', () => {
    const state = useProjectStore.getState();
    expect(state.project).toBeDefined();
    expect(state.project.zones).toEqual([]);
    expect(state.project.propertyBoundary).toBeNull();
    expect(state.project.houseOutline).toBeNull();
  });

  it('should add a zone', () => {
    const zone: Zone = {
      id: 'z1',
      name: 'Test Zone',
      points: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
      ],
      color: '#FF0000',
      sunExposure: 'full',
      soilType: 'loam',
      notes: '',
    };
    useProjectStore.getState().addZone(zone);
    expect(useProjectStore.getState().project.zones).toHaveLength(1);
    expect(useProjectStore.getState().project.zones[0].name).toBe('Test Zone');
  });

  it('should update a zone', () => {
    const zone: Zone = {
      id: 'z1',
      name: 'Original',
      points: [{ x: 0, y: 0 }],
      color: '#FF0000',
      sunExposure: 'full',
      soilType: 'loam',
      notes: '',
    };
    useProjectStore.getState().addZone(zone);
    useProjectStore.getState().updateZone('z1', { name: 'Updated', sunExposure: 'shade' });

    const updated = useProjectStore.getState().project.zones[0];
    expect(updated.name).toBe('Updated');
    expect(updated.sunExposure).toBe('shade');
    expect(updated.color).toBe('#FF0000'); // unchanged
  });

  it('should remove a zone', () => {
    const zone: Zone = {
      id: 'z1',
      name: 'To Remove',
      points: [],
      color: '#FF0000',
      sunExposure: 'full',
      soilType: 'loam',
      notes: '',
    };
    useProjectStore.getState().addZone(zone);
    expect(useProjectStore.getState().project.zones).toHaveLength(1);
    useProjectStore.getState().removeZone('z1');
    expect(useProjectStore.getState().project.zones).toHaveLength(0);
  });

  it('should set property boundary', () => {
    const boundary: Point[] = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 50 },
      { x: 0, y: 50 },
    ];
    useProjectStore.getState().setPropertyBoundary(boundary);
    expect(useProjectStore.getState().project.propertyBoundary).toEqual(boundary);
  });

  it('should set house outline', () => {
    const outline: Point[] = [
      { x: 20, y: 10 },
      { x: 60, y: 10 },
      { x: 60, y: 30 },
      { x: 20, y: 30 },
    ];
    useProjectStore.getState().setHouseOutline(outline);
    expect(useProjectStore.getState().project.houseOutline).toEqual(outline);
  });

  it('should move a zone by updating its points', () => {
    const zone: Zone = {
      id: 'z1',
      name: 'Movable',
      points: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
      ],
      color: '#FF0000',
      sunExposure: 'full',
      soilType: 'loam',
      notes: '',
    };
    useProjectStore.getState().addZone(zone);
    useProjectStore.getState().moveZone('z1', 5, 5);

    const moved = useProjectStore.getState().project.zones[0];
    expect(moved.points[0]).toEqual({ x: 5, y: 5 });
    expect(moved.points[1]).toEqual({ x: 15, y: 5 });
    expect(moved.points[2]).toEqual({ x: 15, y: 15 });
    expect(moved.points[3]).toEqual({ x: 5, y: 15 });
  });

  it('should support undo and redo', () => {
    const zone: Zone = {
      id: 'z1',
      name: 'Undo Test',
      points: [],
      color: '#FF0000',
      sunExposure: 'full',
      soilType: 'loam',
      notes: '',
    };
    useProjectStore.getState().addZone(zone);
    expect(useProjectStore.getState().project.zones).toHaveLength(1);

    useProjectStore.temporal.getState().undo();
    expect(useProjectStore.getState().project.zones).toHaveLength(0);

    useProjectStore.temporal.getState().redo();
    expect(useProjectStore.getState().project.zones).toHaveLength(1);
  });

  it('should load a project', () => {
    const project = {
      id: 'loaded',
      name: 'Loaded Project',
      propertyBoundary: [{ x: 0, y: 0 }],
      houseOutline: null,
      zones: [],
      createdAt: 1000,
      updatedAt: 2000,
    };
    useProjectStore.getState().loadProject(project);
    expect(useProjectStore.getState().project.id).toBe('loaded');
    expect(useProjectStore.getState().project.name).toBe('Loaded Project');
  });
});
