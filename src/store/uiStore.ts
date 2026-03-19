import { create } from 'zustand';
import type { Tool, ViewTransform } from '../types/garden';

interface UiState {
  activeTool: Tool;
  selectedShapeId: string | null;
  view: ViewTransform;
  sidePanelOpen: boolean;
  setTool: (tool: Tool) => void;
  selectShape: (id: string | null) => void;
  setView: (view: Partial<ViewTransform>) => void;
  setSidePanelOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>()((set) => ({
  activeTool: 'select',
  selectedShapeId: null,
  view: { offsetX: 0, offsetY: 0, scale: 20 },
  sidePanelOpen: true,

  setTool: (tool) => set({ activeTool: tool, selectedShapeId: null }),
  selectShape: (id) => set({ selectedShapeId: id, sidePanelOpen: id !== null }),
  setView: (patch) => set((s) => ({ view: { ...s.view, ...patch } })),
  setSidePanelOpen: (open) => set({ sidePanelOpen: open }),
}));
