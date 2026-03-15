import { describe, it, expect, beforeEach } from 'vitest';
import { useProjectStore } from './projectStore';
import type { Zone, PropertyBoundary } from '../types/garden';

describe('projectStore [SPEC-01-F2,F3,F4,F7]', () => {
  beforeEach(() => {
    // Reset store to initial state
    useProjectStore.getState().newProject('Test Project');
  });

  it('starts with an empty project', () => {
    const state = useProjectStore.getState();
    expect(state.project.shapes).toEqual([]);
    expect(state.project.name).toBe('Test Project');
  });

  it('adds a shape to the project', () => {
    const shape: PropertyBoundary = {
      id: 'prop-1',
      layer: 'property',
      vertices: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
        { x: 0, y: 100 },
      ],
    };

    useProjectStore.getState().addShape(shape);
    const state = useProjectStore.getState();
    expect(state.project.shapes).toHaveLength(1);
    expect(state.project.shapes[0]).toEqual(shape);
  });

  it('removes a shape by id', () => {
    const shape: PropertyBoundary = {
      id: 'prop-1',
      layer: 'property',
      vertices: [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }],
    };

    useProjectStore.getState().addShape(shape);
    useProjectStore.getState().removeShape('prop-1');
    expect(useProjectStore.getState().project.shapes).toHaveLength(0);
  });

  it('updates zone metadata', () => {
    const zone: Zone = {
      id: 'zone-1',
      layer: 'zone',
      vertices: [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }],
      metadata: {
        name: 'Bed A',
        color: '#4CAF50',
        sunExposure: 'full',
        soilType: 'loamy',
        notes: '',
      },
    };

    useProjectStore.getState().addShape(zone);
    useProjectStore.getState().updateZoneMetadata('zone-1', { name: 'Rose Garden', sunExposure: 'partial' });

    const updated = useProjectStore.getState().project.shapes[0] as Zone;
    expect(updated.metadata.name).toBe('Rose Garden');
    expect(updated.metadata.sunExposure).toBe('partial');
    expect(updated.metadata.color).toBe('#4CAF50'); // unchanged
  });

  it('moves a shape by delta', () => {
    const shape: PropertyBoundary = {
      id: 'prop-1',
      layer: 'property',
      vertices: [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }],
    };

    useProjectStore.getState().addShape(shape);
    useProjectStore.getState().moveShape('prop-1', 5, 3);

    const moved = useProjectStore.getState().project.shapes[0];
    expect(moved.vertices[0]).toEqual({ x: 5, y: 3 });
    expect(moved.vertices[1]).toEqual({ x: 15, y: 3 });
    expect(moved.vertices[2]).toEqual({ x: 15, y: 13 });
  });

  it('updates shape vertices', () => {
    const shape: PropertyBoundary = {
      id: 'prop-1',
      layer: 'property',
      vertices: [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }],
    };

    useProjectStore.getState().addShape(shape);
    useProjectStore.getState().updateShape('prop-1', {
      vertices: [{ x: 0, y: 0 }, { x: 20, y: 0 }, { x: 20, y: 20 }],
    });

    const updated = useProjectStore.getState().project.shapes[0];
    expect(updated.vertices[1]).toEqual({ x: 20, y: 0 });
  });

  it('sets a full project', () => {
    const project = {
      id: 'proj-2',
      name: 'Loaded Project',
      createdAt: 1000,
      updatedAt: 2000,
      shapes: [],
    };

    useProjectStore.getState().setProject(project);
    expect(useProjectStore.getState().project.name).toBe('Loaded Project');
    expect(useProjectStore.getState().project.id).toBe('proj-2');
  });

  it('creates a new project', () => {
    useProjectStore.getState().addShape({
      id: 'x',
      layer: 'property',
      vertices: [{ x: 0, y: 0 }],
    });
    useProjectStore.getState().newProject('Fresh');
    expect(useProjectStore.getState().project.shapes).toEqual([]);
    expect(useProjectStore.getState().project.name).toBe('Fresh');
  });

  it('supports undo/redo via temporal store', () => {
    const zone: Zone = {
      id: 'zone-1',
      layer: 'zone',
      vertices: [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }],
      metadata: {
        name: 'Bed A',
        color: '#4CAF50',
        sunExposure: 'full',
        soilType: 'loamy',
        notes: '',
      },
    };

    useProjectStore.getState().addShape(zone);
    expect(useProjectStore.getState().project.shapes).toHaveLength(1);

    // Undo
    useProjectStore.temporal.getState().undo();
    expect(useProjectStore.getState().project.shapes).toHaveLength(0);

    // Redo
    useProjectStore.temporal.getState().redo();
    expect(useProjectStore.getState().project.shapes).toHaveLength(1);
  });
});
