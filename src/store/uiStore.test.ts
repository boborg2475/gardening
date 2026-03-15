import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from './uiStore';

describe('uiStore [BEAD-003]', () => {
  beforeEach(() => {
    useUIStore.getState().reset();
  });

  it('should start with select tool active', () => {
    expect(useUIStore.getState().activeTool).toBe('select');
  });

  it('should start with no selection', () => {
    expect(useUIStore.getState().selectedId).toBeNull();
  });

  it('should start with default pan and zoom', () => {
    const state = useUIStore.getState();
    expect(state.panX).toBe(0);
    expect(state.panY).toBe(0);
    expect(state.zoom).toBe(1);
  });

  it('should switch active tool', () => {
    useUIStore.getState().setTool('zone-rectangle');
    expect(useUIStore.getState().activeTool).toBe('zone-rectangle');
  });

  it('should select and deselect', () => {
    useUIStore.getState().select('z1');
    expect(useUIStore.getState().selectedId).toBe('z1');

    useUIStore.getState().deselect();
    expect(useUIStore.getState().selectedId).toBeNull();
  });

  it('should update pan', () => {
    useUIStore.getState().setPan(100, 200);
    expect(useUIStore.getState().panX).toBe(100);
    expect(useUIStore.getState().panY).toBe(200);
  });

  it('should update zoom', () => {
    useUIStore.getState().setZoom(2.5);
    expect(useUIStore.getState().zoom).toBe(2.5);
  });

  it('should clamp zoom to valid range', () => {
    useUIStore.getState().setZoom(0.01);
    expect(useUIStore.getState().zoom).toBeGreaterThanOrEqual(0.1);

    useUIStore.getState().setZoom(100);
    expect(useUIStore.getState().zoom).toBeLessThanOrEqual(10);
  });

  it('should deselect when switching tools', () => {
    useUIStore.getState().select('z1');
    useUIStore.getState().setTool('zone-rectangle');
    expect(useUIStore.getState().selectedId).toBeNull();
  });
});
