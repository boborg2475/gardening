import { create } from 'zustand';
import { temporal } from 'zundo';
import { nanoid } from 'nanoid';
import type { Project, Shape, Zone } from '../types/garden';

function createDefaultProject(): Project {
  return {
    id: nanoid(),
    name: 'Untitled Project',
    shapes: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

interface ProjectState {
  project: Project;
  addShape: (shape: Shape) => void;
  updateShape: (id: string, updates: Partial<Shape & Zone>) => void;
  removeShape: (id: string) => void;
  setProject: (project: Project) => void;
  resetProject: () => void;
}

export const useProjectStore = create<ProjectState>()(
  temporal(
    (set) => ({
      project: createDefaultProject(),

      addShape: (shape: Shape) =>
        set((state) => ({
          project: {
            ...state.project,
            shapes: [...state.project.shapes, shape],
            updatedAt: Date.now(),
          },
        })),

      updateShape: (id: string, updates: Partial<Shape & Zone>) =>
        set((state) => ({
          project: {
            ...state.project,
            shapes: state.project.shapes.map((s) =>
              s.id === id ? { ...s, ...updates } : s,
            ),
            updatedAt: Date.now(),
          },
        })),

      removeShape: (id: string) =>
        set((state) => ({
          project: {
            ...state.project,
            shapes: state.project.shapes.filter((s) => s.id !== id),
            updatedAt: Date.now(),
          },
        })),

      setProject: (project: Project) =>
        set({ project }),

      resetProject: () =>
        set({ project: createDefaultProject() }),
    }),
    {
      partialize: (state) => ({ project: state.project }),
    },
  ),
);
