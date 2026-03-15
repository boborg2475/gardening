import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from './uiStore';

describe('uiStore [R3]', () => {
  beforeEach(() => {
    useUIStore.setState({
      activeTool: 'select',
      selectedZoneId: null,
      panOffset: { x: 0, y: 0 },
      zoomLevel: 1,
      layerVisibility: {
        grid: true,
        property: true,
        house: true,
        zones: true,
        selection: true,
      },
    });
  });

  describe('initial state [R3.1]', () => {
    it('starts with select tool active', () => {
      expect(useUIStore.getState().activeTool).toBe('select');
    });

    it('starts with no selection', () => {
      expect(useUIStore.getState().selectedZoneId).toBeNull();
    });

    it('starts with zoom level 1', () => {
      expect(useUIStore.getState().zoomLevel).toBe(1);
    });

    it('starts with all layers visible', () => {
      const vis = useUIStore.getState().layerVisibility;
      expect(vis.grid).toBe(true);
      expect(vis.zones).toBe(true);
    });
  });

  describe('setActiveTool [R3.2]', () => {
    it('changes the active tool', () => {
      useUIStore.getState().setActiveTool('rectangle');
      expect(useUIStore.getState().activeTool).toBe('rectangle');
    });
  });

  describe('setSelectedZoneId [R3.3]', () => {
    it('sets selected zone id', () => {
      useUIStore.getState().setSelectedZoneId('zone-1');
      expect(useUIStore.getState().selectedZoneId).toBe('zone-1');
    });

    it('clears selection with null', () => {
      useUIStore.getState().setSelectedZoneId('zone-1');
      useUIStore.getState().setSelectedZoneId(null);
      expect(useUIStore.getState().selectedZoneId).toBeNull();
    });
  });

  describe('setPan [R3.4]', () => {
    it('updates pan offset', () => {
      useUIStore.getState().setPan({ x: 100, y: -50 });
      expect(useUIStore.getState().panOffset).toEqual({ x: 100, y: -50 });
    });
  });

  describe('setZoom [R3.4]', () => {
    it('updates zoom level', () => {
      useUIStore.getState().setZoom(2.5);
      expect(useUIStore.getState().zoomLevel).toBe(2.5);
    });
  });

  describe('toggleLayer [R3.5]', () => {
    it('toggles a layer off', () => {
      useUIStore.getState().toggleLayer('grid');
      expect(useUIStore.getState().layerVisibility.grid).toBe(false);
    });

    it('toggles a layer back on', () => {
      useUIStore.getState().toggleLayer('grid');
      useUIStore.getState().toggleLayer('grid');
      expect(useUIStore.getState().layerVisibility.grid).toBe(true);
    });
  });
});
