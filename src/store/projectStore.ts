import { create } from 'zustand';
import { temporal } from 'zundo';
import { nanoid } from 'nanoid';
import type { ProjectData, ProjectState, Shape, Zone, ZoneMetadata } from '../types/garden';

function createEmptyProject(name = 'Untitled Project'): ProjectData {
  return {
    id: nanoid(),
    name,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    shapes: [],
  };
}

export const useProjectStore = create<ProjectState>()(
  temporal(
    (set) => ({
      project: createEmptyProject(),

      addShape: (shape: Shape) =>
        set((state) => ({
          project: {
            ...state.project,
            updatedAt: Date.now(),
            shapes: [...state.project.shapes, shape],
          },
        })),

      removeShape: (id: string) =>
        set((state) => ({
          project: {
            ...state.project,
            updatedAt: Date.now(),
            shapes: state.project.shapes.filter((s) => s.id !== id),
          },
        })),

      updateShape: (id: string, updates: Partial<Omit<Shape, 'id' | 'layer'>>) =>
        set((state) => ({
          project: {
            ...state.project,
            updatedAt: Date.now(),
            shapes: state.project.shapes.map((s) =>
              s.id === id ? { ...s, ...updates } : s
            ),
          },
        })),

      updateZoneMetadata: (id: string, metadata: Partial<ZoneMetadata>) =>
        set((state) => ({
          project: {
            ...state.project,
            updatedAt: Date.now(),
            shapes: state.project.shapes.map((s) =>
              s.id === id && s.layer === 'zone'
                ? { ...s, metadata: { ...(s as Zone).metadata, ...metadata } }
                : s
            ),
          },
        })),

      moveShape: (id: string, dx: number, dy: number) =>
        set((state) => ({
          project: {
            ...state.project,
            updatedAt: Date.now(),
            shapes: state.project.shapes.map((s) =>
              s.id === id
                ? {
                    ...s,
                    vertices: s.vertices.map((v) => ({
                      x: v.x + dx,
                      y: v.y + dy,
                    })),
                  }
                : s
            ),
          },
        })),

      setProject: (project: ProjectData) =>
        set({ project }),

      newProject: (name?: string) =>
        set({ project: createEmptyProject(name) }),
    }),
    {
      limit: 50,
      equality: (pastState, currentState) =>
        pastState.project === currentState.project,
    }
  )
);
