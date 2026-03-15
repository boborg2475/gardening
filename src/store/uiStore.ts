import { create } from 'zustand';
import type { Point, ToolType, LayerVisibility } from '../types/garden';

interface UIState {
  activeTool: ToolType;
  selectedZoneId: string | null;
  panOffset: Point;
  zoomLevel: number;
  layerVisibility: LayerVisibility;
  setActiveTool: (tool: ToolType) => void;
  setSelectedZoneId: (id: string | null) => void;
  setPan: (offset: Point) => void;
  setZoom: (level: number) => void;
  toggleLayer: (layer: keyof LayerVisibility) => void;
}

export const useUIStore = create<UIState>()((set) => ({
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

  setActiveTool: (tool) => set({ activeTool: tool }),

  setSelectedZoneId: (id) => set({ selectedZoneId: id }),

  setPan: (offset) => set({ panOffset: offset }),

  setZoom: (level) => set({ zoomLevel: level }),

  toggleLayer: (layer) =>
    set((state) => ({
      layerVisibility: {
        ...state.layerVisibility,
        [layer]: !state.layerVisibility[layer],
      },
    })),
}));
