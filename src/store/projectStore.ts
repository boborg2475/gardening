import { create } from 'zustand';
import { temporal } from 'zundo';
import { nanoid } from 'nanoid';
import type { Project, Shape } from '../types/garden';

type ProjectState = {
  project: Project;
  addShape: (shape: Shape) => void;
  updateShape: (id: string, updates: Partial<Shape>) => void;
  removeShape: (id: string) => void;
  loadProject: (project: Project) => void;
  setProjectName: (name: string) => void;
};

const createDefaultProject = (): Project => ({
  id: nanoid(),
  name: 'Untitled Project',
  shapes: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

export const useProjectStore = create<ProjectState>()(
  temporal(
    (set) => ({
      project: createDefaultProject(),

      addShape: (shape) =>
        set((state) => ({
          project: {
            ...state.project,
            shapes: [...state.project.shapes, shape],
            updatedAt: Date.now(),
          },
        })),

      updateShape: (id, updates) =>
        set((state) => ({
          project: {
            ...state.project,
            shapes: state.project.shapes.map((s) =>
              s.id === id ? { ...s, ...updates } : s
            ),
            updatedAt: Date.now(),
          },
        })),

      removeShape: (id) =>
        set((state) => ({
          project: {
            ...state.project,
            shapes: state.project.shapes.filter((s) => s.id !== id),
            updatedAt: Date.now(),
          },
        })),

      loadProject: (project) => set({ project }),

      setProjectName: (name) =>
        set((state) => ({
          project: {
            ...state.project,
            name,
            updatedAt: Date.now(),
          },
        })),
    }),
    { limit: 50 }
  )
);
