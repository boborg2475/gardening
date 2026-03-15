import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from './uiStore';

describe('uiStore [BMAD-ui-store]', () => {
  beforeEach(() => {
    useUIStore.getState().reset();
  });

  it('should have default state', () => {
    const state = useUIStore.getState();
    expect(state.activeTool).toBe('select');
    expect(state.selectedShapeId).toBeNull();
    expect(state.pan).toEqual({ x: 0, y: 0 });
    expect(state.zoom).toBe(1);
    expect(state.isPanning).toBe(false);
  });

  describe('setTool', () => {
    it('should change the active tool', () => {
      useUIStore.getState().setTool('rectangle');
      expect(useUIStore.getState().activeTool).toBe('rectangle');
    });

    it('should clear selection when changing tool', () => {
      useUIStore.getState().selectShape('some-id');
      useUIStore.getState().setTool('rectangle');
      expect(useUIStore.getState().selectedShapeId).toBeNull();
    });
  });

  describe('selectShape', () => {
    it('should set selected shape id', () => {
      useUIStore.getState().selectShape('shape-1');
      expect(useUIStore.getState().selectedShapeId).toBe('shape-1');
    });

    it('should allow deselection with null', () => {
      useUIStore.getState().selectShape('shape-1');
      useUIStore.getState().selectShape(null);
      expect(useUIStore.getState().selectedShapeId).toBeNull();
    });
  });

  describe('pan and zoom', () => {
    it('should update pan', () => {
      useUIStore.getState().setPan({ x: 100, y: -50 });
      expect(useUIStore.getState().pan).toEqual({ x: 100, y: -50 });
    });

    it('should update zoom', () => {
      useUIStore.getState().setZoom(2.5);
      expect(useUIStore.getState().zoom).toBe(2.5);
    });

    it('should clamp zoom to min/max', () => {
      useUIStore.getState().setZoom(0.01);
      expect(useUIStore.getState().zoom).toBeGreaterThanOrEqual(0.1);

      useUIStore.getState().setZoom(100);
      expect(useUIStore.getState().zoom).toBeLessThanOrEqual(20);
    });

    it('should set isPanning', () => {
      useUIStore.getState().setIsPanning(true);
      expect(useUIStore.getState().isPanning).toBe(true);
    });
  });
});
