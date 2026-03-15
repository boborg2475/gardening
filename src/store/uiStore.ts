import { create } from 'zustand';
import type { Point, ToolType } from '../types/garden';

interface UIState {
  activeTool: ToolType;
  selectedShapeId: string | null;
  pan: Point;
  zoom: number;
  isPanning: boolean;

  setTool: (tool: ToolType) => void;
  selectShape: (id: string | null) => void;
  setPan: (pan: Point) => void;
  setZoom: (zoom: number) => void;
  setIsPanning: (isPanning: boolean) => void;
  reset: () => void;
}

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 20;

export const useUIStore = create<UIState>()((set) => ({
  activeTool: 'select',
  selectedShapeId: null,
  pan: { x: 0, y: 0 },
  zoom: 1,
  isPanning: false,

  setTool: (tool: ToolType) =>
    set({ activeTool: tool, selectedShapeId: null }),

  selectShape: (id: string | null) =>
    set({ selectedShapeId: id }),

  setPan: (pan: Point) =>
    set({ pan }),

  setZoom: (zoom: number) =>
    set({ zoom: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom)) }),

  setIsPanning: (isPanning: boolean) =>
    set({ isPanning }),

  reset: () =>
    set({
      activeTool: 'select',
      selectedShapeId: null,
      pan: { x: 0, y: 0 },
      zoom: 1,
      isPanning: false,
    }),
}));
