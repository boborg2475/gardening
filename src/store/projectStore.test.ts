import { describe, it, expect, beforeEach } from 'vitest';
import { useProjectStore } from './projectStore';
import type { Shape } from '../types/garden';

describe('projectStore [LLD-02]', () => {
  beforeEach(() => {
    useProjectStore.setState(useProjectStore.getInitialState());
  });

  it('should have a default project with empty shapes', () => {
    const state = useProjectStore.getState();
    expect(state.project.shapes).toEqual([]);
    expect(state.project.name).toBe('Untitled Project');
    expect(state.project.id).toBeTruthy();
  });

  it('should add a shape', () => {
    const shape: Shape = {
      id: 'shape-1',
      type: 'zone',
      points: [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }],
      name: 'Test Zone',
      color: '#00ff00',
    };
    useProjectStore.getState().addShape(shape);
    expect(useProjectStore.getState().project.shapes).toHaveLength(1);
    expect(useProjectStore.getState().project.shapes[0]).toEqual(shape);
  });

  it('should update a shape', () => {
    const shape: Shape = {
      id: 'shape-1',
      type: 'zone',
      points: [{ x: 0, y: 0 }],
      name: 'Old Name',
      color: '#00ff00',
    };
    useProjectStore.getState().addShape(shape);
    useProjectStore.getState().updateShape('shape-1', { name: 'New Name' });
    expect(useProjectStore.getState().project.shapes[0].name).toBe('New Name');
  });

  it('should remove a shape', () => {
    const shape: Shape = {
      id: 'shape-1',
      type: 'zone',
      points: [{ x: 0, y: 0 }],
      name: 'Test',
      color: '#00ff00',
    };
    useProjectStore.getState().addShape(shape);
    useProjectStore.getState().removeShape('shape-1');
    expect(useProjectStore.getState().project.shapes).toHaveLength(0);
  });

  it('should load a project', () => {
    const project = {
      id: 'proj-2',
      name: 'Loaded Project',
      shapes: [],
      createdAt: 1000,
      updatedAt: 2000,
    };
    useProjectStore.getState().loadProject(project);
    expect(useProjectStore.getState().project).toEqual(project);
  });

  it('should set project name', () => {
    useProjectStore.getState().setProjectName('My Garden');
    expect(useProjectStore.getState().project.name).toBe('My Garden');
  });

  it('should update the updatedAt timestamp on addShape', () => {
    const before = useProjectStore.getState().project.updatedAt;
    const shape: Shape = {
      id: 'shape-1',
      type: 'zone',
      points: [],
      name: 'Test',
      color: '#ff0000',
    };
    useProjectStore.getState().addShape(shape);
    expect(useProjectStore.getState().project.updatedAt).toBeGreaterThanOrEqual(before);
  });
});
