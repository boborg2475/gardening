import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from './uiStore';

describe('uiStore [SPEC-01-F1,F4,F8]', () => {
  beforeEach(() => {
    // Reset to defaults
    useUIStore.setState({
      activeTool: 'select',
      selectedShapeId: null,
      panOffset: { x: 0, y: 0 },
      zoom: 1,
      showGrid: true,
      sidePanelOpen: true,
    });
  });

  it('starts with select tool active', () => {
    expect(useUIStore.getState().activeTool).toBe('select');
  });

  it('starts with no selection', () => {
    expect(useUIStore.getState().selectedShapeId).toBeNull();
  });

  it('starts with default pan offset and zoom', () => {
    expect(useUIStore.getState().panOffset).toEqual({ x: 0, y: 0 });
    expect(useUIStore.getState().zoom).toBe(1);
  });

  it('changes the active tool', () => {
    useUIStore.getState().setActiveTool('polygon-property');
    expect(useUIStore.getState().activeTool).toBe('polygon-property');
  });

  it('sets selected shape id', () => {
    useUIStore.getState().setSelectedShapeId('shape-1');
    expect(useUIStore.getState().selectedShapeId).toBe('shape-1');
  });

  it('clears selection', () => {
    useUIStore.getState().setSelectedShapeId('shape-1');
    useUIStore.getState().setSelectedShapeId(null);
    expect(useUIStore.getState().selectedShapeId).toBeNull();
  });

  it('sets pan offset', () => {
    useUIStore.getState().setPanOffset({ x: 100, y: 50 });
    expect(useUIStore.getState().panOffset).toEqual({ x: 100, y: 50 });
  });

  it('sets zoom level', () => {
    useUIStore.getState().setZoom(2.5);
    expect(useUIStore.getState().zoom).toBe(2.5);
  });

  it('toggles grid visibility', () => {
    expect(useUIStore.getState().showGrid).toBe(true);
    useUIStore.getState().toggleGrid();
    expect(useUIStore.getState().showGrid).toBe(false);
    useUIStore.getState().toggleGrid();
    expect(useUIStore.getState().showGrid).toBe(true);
  });

  it('sets side panel open state', () => {
    useUIStore.getState().setSidePanelOpen(false);
    expect(useUIStore.getState().sidePanelOpen).toBe(false);
  });
});
