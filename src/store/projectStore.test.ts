import { describe, it, expect, beforeEach } from 'vitest';
import { useProjectStore } from './projectStore';
import type { Shape, Zone } from '../types/garden';

describe('projectStore [BMAD-project-store]', () => {
  beforeEach(() => {
    useProjectStore.getState().resetProject();
  });

  it('should have a default project with empty shapes', () => {
    const state = useProjectStore.getState();
    expect(state.project).toBeDefined();
    expect(state.project.id).toBeTruthy();
    expect(state.project.name).toBe('Untitled Project');
    expect(state.project.shapes).toEqual([]);
  });

  describe('addShape', () => {
    it('should add a shape to the project', () => {
      const shape: Shape = {
        id: 'test-shape-1',
        type: 'property',
        points: [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
          { x: 10, y: 10 },
          { x: 0, y: 10 },
        ],
        name: 'Property Boundary',
        color: '#00ff00',
      };

      useProjectStore.getState().addShape(shape);
      const state = useProjectStore.getState();
      expect(state.project.shapes).toHaveLength(1);
      expect(state.project.shapes[0]).toEqual(shape);
    });

    it('should add a zone with metadata', () => {
      const zone: Zone = {
        id: 'test-zone-1',
        type: 'zone',
        points: [
          { x: 0, y: 0 },
          { x: 5, y: 0 },
          { x: 5, y: 5 },
          { x: 0, y: 5 },
        ],
        name: 'Veggie Bed',
        color: '#8B4513',
        sunExposure: 'full',
        soilType: 'loam',
        notes: 'Raised bed, 12 inches deep',
      };

      useProjectStore.getState().addShape(zone);
      const state = useProjectStore.getState();
      expect(state.project.shapes).toHaveLength(1);
      expect(state.project.shapes[0]).toEqual(zone);
    });
  });

  describe('updateShape', () => {
    it('should update an existing shape by id', () => {
      const shape: Shape = {
        id: 'test-shape-1',
        type: 'house',
        points: [
          { x: 2, y: 2 },
          { x: 8, y: 2 },
          { x: 8, y: 6 },
          { x: 2, y: 6 },
        ],
        name: 'House',
        color: '#666666',
      };

      useProjectStore.getState().addShape(shape);
      useProjectStore.getState().updateShape('test-shape-1', { name: 'Main House', color: '#888888' });

      const updated = useProjectStore.getState().project.shapes[0];
      expect(updated.name).toBe('Main House');
      expect(updated.color).toBe('#888888');
      expect(updated.points).toEqual(shape.points);
    });

    it('should not modify other shapes', () => {
      const shape1: Shape = {
        id: 's1',
        type: 'property',
        points: [{ x: 0, y: 0 }],
        name: 'A',
        color: '#000',
      };
      const shape2: Shape = {
        id: 's2',
        type: 'house',
        points: [{ x: 1, y: 1 }],
        name: 'B',
        color: '#fff',
      };

      useProjectStore.getState().addShape(shape1);
      useProjectStore.getState().addShape(shape2);
      useProjectStore.getState().updateShape('s1', { name: 'Updated A' });

      const state = useProjectStore.getState();
      expect(state.project.shapes[0].name).toBe('Updated A');
      expect(state.project.shapes[1].name).toBe('B');
    });
  });

  describe('removeShape', () => {
    it('should remove a shape by id', () => {
      const shape: Shape = {
        id: 'to-remove',
        type: 'zone',
        points: [{ x: 0, y: 0 }],
        name: 'Remove me',
        color: '#f00',
      };

      useProjectStore.getState().addShape(shape);
      expect(useProjectStore.getState().project.shapes).toHaveLength(1);

      useProjectStore.getState().removeShape('to-remove');
      expect(useProjectStore.getState().project.shapes).toHaveLength(0);
    });
  });

  describe('setProject', () => {
    it('should replace the entire project', () => {
      const newProject = {
        id: 'new-proj',
        name: 'My Garden',
        shapes: [],
        createdAt: 1000,
        updatedAt: 2000,
      };

      useProjectStore.getState().setProject(newProject);
      expect(useProjectStore.getState().project).toEqual(newProject);
    });
  });

  describe('undo/redo [BMAD-project-store]', () => {
    it('should support undo after adding a shape', () => {
      const shape: Shape = {
        id: 'undo-test',
        type: 'property',
        points: [{ x: 0, y: 0 }],
        name: 'Undo test',
        color: '#000',
      };

      useProjectStore.getState().addShape(shape);
      expect(useProjectStore.getState().project.shapes).toHaveLength(1);

      useProjectStore.temporal.getState().undo();
      expect(useProjectStore.getState().project.shapes).toHaveLength(0);
    });

    it('should support redo after undo', () => {
      const shape: Shape = {
        id: 'redo-test',
        type: 'house',
        points: [{ x: 0, y: 0 }],
        name: 'Redo test',
        color: '#000',
      };

      useProjectStore.getState().addShape(shape);
      useProjectStore.temporal.getState().undo();
      expect(useProjectStore.getState().project.shapes).toHaveLength(0);

      useProjectStore.temporal.getState().redo();
      expect(useProjectStore.getState().project.shapes).toHaveLength(1);
    });
  });
});
