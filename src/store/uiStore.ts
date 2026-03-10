import { createStore } from 'zustand/vanilla';
import type { Point } from '../types/project';
import type { ToolType, SelectedType, PanelType, LayerVisibility } from '../types/ui';

export interface UIData {
  activeTool: ToolType;
  selectedId: string | null;
  selectedType: SelectedType;
  drawingPoints: Point[];
  placingFeatureTemplate: string | null;
  panX: number;
  panY: number;
  zoom: number;
  layers: LayerVisibility;
  sidebarOpen: boolean;
  activePanel: PanelType;
  isMobile: boolean;
}

interface UIActions {
  setTool: (tool: ToolType) => void;
  select: (id: string, type: SelectedType) => void;
  deselect: () => void;
  addDrawingPoint: (point: Point) => void;
  clearDrawing: () => void;
  setPlacingFeature: (templateId: string | null) => void;
  setPan: (x: number, y: number) => void;
  setZoom: (zoom: number) => void;
  toggleLayer: (layer: keyof LayerVisibility) => void;
  toggleSidebar: () => void;
  setActivePanel: (panel: PanelType) => void;
  setIsMobile: (isMobile: boolean) => void;
}

export type UIState = UIData & UIActions;

export function createUIStore() {
  return createStore<UIState>()((set) => ({
    activeTool: 'select',
    selectedId: null,
    selectedType: null,
    drawingPoints: [],
    placingFeatureTemplate: null,
    panX: 0,
    panY: 0,
    zoom: 1,
    layers: {
      grid: true,
      property: true,
      house: true,
      zones: true,
      features: true,
      measurements: true,
    },
    sidebarOpen: true,
    activePanel: 'project',
    isMobile: false,

    setTool: (tool) =>
      set({
        activeTool: tool,
        selectedId: null,
        selectedType: null,
        drawingPoints: [],
      }),

    select: (id, type) =>
      set((state) => ({
        selectedId: id,
        selectedType: type,
        activeTool:
          state.activeTool.startsWith('draw-') || state.activeTool === 'place-feature' || state.activeTool === 'measure'
            ? 'select'
            : state.activeTool,
      })),

    deselect: () =>
      set({ selectedId: null, selectedType: null }),

    addDrawingPoint: (point) =>
      set((state) => ({
        drawingPoints: [...state.drawingPoints, point],
      })),

    clearDrawing: () =>
      set({ drawingPoints: [] }),

    setPlacingFeature: (templateId) =>
      set({
        placingFeatureTemplate: templateId,
        activeTool: templateId !== null ? 'place-feature' : 'select',
      }),

    setPan: (x, y) =>
      set({ panX: x, panY: y }),

    setZoom: (zoom) =>
      set({ zoom: Math.min(10, Math.max(0.1, zoom)) }),

    toggleLayer: (layer) =>
      set((state) => ({
        layers: { ...state.layers, [layer]: !state.layers[layer] },
      })),

    toggleSidebar: () =>
      set((state) => ({ sidebarOpen: !state.sidebarOpen })),

    setActivePanel: (panel) =>
      set({ activePanel: panel, sidebarOpen: true }),

    setIsMobile: (isMobile) =>
      set({ isMobile, sidebarOpen: isMobile ? false : true }),
  }));
}
