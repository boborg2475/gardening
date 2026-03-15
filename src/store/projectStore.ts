import { create } from 'zustand';
import { temporal } from 'zundo';
import type { Project, Zone, Point } from '../types/garden';
import { createDefaultProject } from '../types/garden';

interface ProjectState {
  project: Project;
  addZone: (zone: Zone) => void;
  updateZone: (id: string, updates: Partial<Zone>) => void;
  removeZone: (id: string) => void;
  setPropertyBoundary: (points: Point[] | null) => void;
  setHouseOutline: (points: Point[] | null) => void;
  moveZone: (id: string, dx: number, dy: number) => void;
  loadProject: (project: Project) => void;
  reset: () => void;
}

const initialProject = createDefaultProject('default', 'My Garden');

export const useProjectStore = create<ProjectState>()(
  temporal(
    (set) => ({
      project: { ...initialProject, zones: [] },

      addZone: (zone: Zone) =>
        set((state) => ({
          project: {
            ...state.project,
            zones: [...state.project.zones, zone],
            updatedAt: Date.now(),
          },
        })),

      updateZone: (id: string, updates: Partial<Zone>) =>
        set((state) => ({
          project: {
            ...state.project,
            zones: state.project.zones.map((z) =>
              z.id === id ? { ...z, ...updates } : z
            ),
            updatedAt: Date.now(),
          },
        })),

      removeZone: (id: string) =>
        set((state) => ({
          project: {
            ...state.project,
            zones: state.project.zones.filter((z) => z.id !== id),
            updatedAt: Date.now(),
          },
        })),

      setPropertyBoundary: (points: Point[] | null) =>
        set((state) => ({
          project: {
            ...state.project,
            propertyBoundary: points,
            updatedAt: Date.now(),
          },
        })),

      setHouseOutline: (points: Point[] | null) =>
        set((state) => ({
          project: {
            ...state.project,
            houseOutline: points,
            updatedAt: Date.now(),
          },
        })),

      moveZone: (id: string, dx: number, dy: number) =>
        set((state) => ({
          project: {
            ...state.project,
            zones: state.project.zones.map((z) =>
              z.id === id
                ? {
                    ...z,
                    points: z.points.map((p) => ({
                      x: p.x + dx,
                      y: p.y + dy,
                    })),
                  }
                : z
            ),
            updatedAt: Date.now(),
          },
        })),

      loadProject: (project: Project) =>
        set({ project }),

      reset: () =>
        set({
          project: {
            ...createDefaultProject('default', 'My Garden'),
          },
        }),
    }),
    {
      limit: 50,
      equality: (pastState, currentState) =>
        JSON.stringify(pastState.project) === JSON.stringify(currentState.project),
    }
  )
);
