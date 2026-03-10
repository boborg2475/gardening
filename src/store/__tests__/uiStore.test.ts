import { describe, it, expect, beforeEach } from 'vitest';
import { createUIStore } from '../uiStore';

describe('uiStore [LLD-02]', () => {
  let store: ReturnType<typeof createUIStore>;

  beforeEach(() => {
    store = createUIStore();
  });

  describe('default state [LLD-02]', () => {
    it('initializes with select tool', () => {
      expect(store.getState().activeTool).toBe('select');
    });

    it('initializes with no selection', () => {
      expect(store.getState().selectedId).toBeNull();
      expect(store.getState().selectedType).toBeNull();
    });

    it('initializes with empty drawingPoints', () => {
      expect(store.getState().drawingPoints).toEqual([]);
    });

    it('initializes with null placingFeatureTemplate', () => {
      expect(store.getState().placingFeatureTemplate).toBeNull();
    });

    it('initializes with pan at origin and zoom at 1', () => {
      expect(store.getState().panX).toBe(0);
      expect(store.getState().panY).toBe(0);
      expect(store.getState().zoom).toBe(1);
    });

    it('initializes with all layers visible', () => {
      const layers = store.getState().layers;
      expect(layers.grid).toBe(true);
      expect(layers.property).toBe(true);
      expect(layers.house).toBe(true);
      expect(layers.zones).toBe(true);
      expect(layers.features).toBe(true);
      expect(layers.measurements).toBe(true);
    });

    it('initializes with sidebar open and project panel', () => {
      expect(store.getState().sidebarOpen).toBe(true);
      expect(store.getState().activePanel).toBe('project');
    });

    it('initializes with isMobile false', () => {
      expect(store.getState().isMobile).toBe(false);
    });
  });

  describe('setTool [LLD-02]', () => {
    it('sets the active tool', () => {
      store.getState().setTool('draw-zone');
      expect(store.getState().activeTool).toBe('draw-zone');
    });

    it('clears selection when changing tool', () => {
      store.getState().select('some-id', 'zone');
      store.getState().setTool('draw-property');
      expect(store.getState().selectedId).toBeNull();
      expect(store.getState().selectedType).toBeNull();
    });

    it('clears drawingPoints when changing tool', () => {
      store.getState().addDrawingPoint({ x: 1, y: 2 });
      store.getState().setTool('select');
      expect(store.getState().drawingPoints).toEqual([]);
    });
  });

  describe('select / deselect [LLD-02]', () => {
    it('sets selectedId and selectedType', () => {
      store.getState().select('zone-1', 'zone');
      expect(store.getState().selectedId).toBe('zone-1');
      expect(store.getState().selectedType).toBe('zone');
    });

    it('switches to select tool if currently a drawing tool', () => {
      store.getState().setTool('draw-zone');
      store.getState().select('zone-1', 'zone');
      expect(store.getState().activeTool).toBe('select');
    });

    it('deselect clears selection', () => {
      store.getState().select('zone-1', 'zone');
      store.getState().deselect();
      expect(store.getState().selectedId).toBeNull();
      expect(store.getState().selectedType).toBeNull();
    });
  });

  describe('addDrawingPoint / clearDrawing [LLD-02]', () => {
    it('appends points to drawingPoints', () => {
      store.getState().addDrawingPoint({ x: 0, y: 0 });
      store.getState().addDrawingPoint({ x: 5, y: 5 });
      expect(store.getState().drawingPoints).toHaveLength(2);
    });

    it('clears drawingPoints', () => {
      store.getState().addDrawingPoint({ x: 0, y: 0 });
      store.getState().clearDrawing();
      expect(store.getState().drawingPoints).toEqual([]);
    });
  });

  describe('setPlacingFeature [LLD-02]', () => {
    it('sets template and switches to place-feature tool', () => {
      store.getState().setPlacingFeature('tree-oak');
      expect(store.getState().placingFeatureTemplate).toBe('tree-oak');
      expect(store.getState().activeTool).toBe('place-feature');
    });

    it('setting null reverts to select tool', () => {
      store.getState().setPlacingFeature('tree-oak');
      store.getState().setPlacingFeature(null);
      expect(store.getState().placingFeatureTemplate).toBeNull();
      expect(store.getState().activeTool).toBe('select');
    });
  });

  describe('setPan / setZoom [LLD-02]', () => {
    it('sets pan coordinates', () => {
      store.getState().setPan(100, -50);
      expect(store.getState().panX).toBe(100);
      expect(store.getState().panY).toBe(-50);
    });

    it('sets zoom level', () => {
      store.getState().setZoom(2.5);
      expect(store.getState().zoom).toBe(2.5);
    });

    it('clamps zoom to minimum 0.1', () => {
      store.getState().setZoom(0.01);
      expect(store.getState().zoom).toBe(0.1);
    });

    it('clamps zoom to maximum 10', () => {
      store.getState().setZoom(15);
      expect(store.getState().zoom).toBe(10);
    });
  });

  describe('toggleLayer [LLD-02]', () => {
    it('flips a layer visibility', () => {
      store.getState().toggleLayer('grid');
      expect(store.getState().layers.grid).toBe(false);
      store.getState().toggleLayer('grid');
      expect(store.getState().layers.grid).toBe(true);
    });
  });

  describe('toggleSidebar [LLD-02]', () => {
    it('flips sidebarOpen', () => {
      store.getState().toggleSidebar();
      expect(store.getState().sidebarOpen).toBe(false);
      store.getState().toggleSidebar();
      expect(store.getState().sidebarOpen).toBe(true);
    });
  });

  describe('setActivePanel [LLD-02]', () => {
    it('sets the active panel', () => {
      store.getState().setActivePanel('zones');
      expect(store.getState().activePanel).toBe('zones');
    });

    it('opens sidebar if closed', () => {
      store.getState().toggleSidebar(); // close
      store.getState().setActivePanel('zones');
      expect(store.getState().sidebarOpen).toBe(true);
    });
  });

  describe('setIsMobile [LLD-02]', () => {
    it('sets isMobile', () => {
      store.getState().setIsMobile(true);
      expect(store.getState().isMobile).toBe(true);
    });

    it('closes sidebar when switching to mobile', () => {
      store.getState().setIsMobile(true);
      expect(store.getState().sidebarOpen).toBe(false);
    });
  });
});
