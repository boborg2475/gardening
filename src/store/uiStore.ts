import { create } from 'zustand';
import type { UIState, Point, ToolType } from '../types/garden';

export const useUIStore = create<UIState>()((set) => ({
  activeTool: 'select' as ToolType,
  selectedShapeId: null,
  panOffset: { x: 0, y: 0 } as Point,
  zoom: 1,
  showGrid: true,
  sidePanelOpen: true,

  setActiveTool: (tool: ToolType) => set({ activeTool: tool }),
  setSelectedShapeId: (id: string | null) => set({ selectedShapeId: id }),
  setPanOffset: (offset: Point) => set({ panOffset: offset }),
  setZoom: (zoom: number) => set({ zoom }),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  setSidePanelOpen: (open: boolean) => set({ sidePanelOpen: open }),
}));
