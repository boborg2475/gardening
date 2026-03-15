import { create } from 'zustand';
import type { Point, ToolType } from '../types/garden';

type UIState = {
  activeTool: ToolType;
  selectedShapeId: string | null;
  panOffset: Point;
  zoom: number;
  setActiveTool: (tool: ToolType) => void;
  setSelectedShapeId: (id: string | null) => void;
  setPanOffset: (offset: Point) => void;
  setZoom: (zoom: number) => void;
};

export const useUIStore = create<UIState>()((set) => ({
  activeTool: 'select',
  selectedShapeId: null,
  panOffset: { x: 0, y: 0 },
  zoom: 1,
  setActiveTool: (tool) => set({ activeTool: tool }),
  setSelectedShapeId: (id) => set({ selectedShapeId: id }),
  setPanOffset: (offset) => set({ panOffset: offset }),
  setZoom: (zoom) => set({ zoom }),
}));
