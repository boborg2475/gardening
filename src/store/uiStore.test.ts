import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from './uiStore';

describe('uiStore [LLD-02]', () => {
  beforeEach(() => {
    useUIStore.setState(useUIStore.getInitialState());
  });

  it('should default to select tool', () => {
    expect(useUIStore.getState().activeTool).toBe('select');
  });

  it('should default to no selection', () => {
    expect(useUIStore.getState().selectedShapeId).toBeNull();
  });

  it('should default pan offset to origin', () => {
    expect(useUIStore.getState().panOffset).toEqual({ x: 0, y: 0 });
  });

  it('should default zoom to 1', () => {
    expect(useUIStore.getState().zoom).toBe(1);
  });

  it('should set active tool', () => {
    useUIStore.getState().setActiveTool('property');
    expect(useUIStore.getState().activeTool).toBe('property');
  });

  it('should set selected shape id', () => {
    useUIStore.getState().setSelectedShapeId('shape-1');
    expect(useUIStore.getState().selectedShapeId).toBe('shape-1');
  });

  it('should clear selection with null', () => {
    useUIStore.getState().setSelectedShapeId('shape-1');
    useUIStore.getState().setSelectedShapeId(null);
    expect(useUIStore.getState().selectedShapeId).toBeNull();
  });

  it('should set pan offset', () => {
    useUIStore.getState().setPanOffset({ x: 100, y: 200 });
    expect(useUIStore.getState().panOffset).toEqual({ x: 100, y: 200 });
  });

  it('should set zoom', () => {
    useUIStore.getState().setZoom(2.5);
    expect(useUIStore.getState().zoom).toBe(2.5);
  });
});
