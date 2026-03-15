import { create } from 'zustand';
import type { ToolType } from '../types/garden';

interface UIState {
  activeTool: ToolType;
  selectedId: string | null;
  panX: number;
  panY: number;
  zoom: number;
  setTool: (tool: ToolType) => void;
  select: (id: string) => void;
  deselect: () => void;
  setPan: (x: number, y: number) => void;
  setZoom: (zoom: number) => void;
  reset: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  activeTool: 'select',
  selectedId: null,
  panX: 0,
  panY: 0,
  zoom: 1,

  setTool: (tool: ToolType) =>
    set({ activeTool: tool, selectedId: null }),

  select: (id: string) =>
    set({ selectedId: id }),

  deselect: () =>
    set({ selectedId: null }),

  setPan: (x: number, y: number) =>
    set({ panX: x, panY: y }),

  setZoom: (zoom: number) =>
    set({ zoom: Math.min(10, Math.max(0.1, zoom)) }),

  reset: () =>
    set({
      activeTool: 'select',
      selectedId: null,
      panX: 0,
      panY: 0,
      zoom: 1,
    }),
}));
