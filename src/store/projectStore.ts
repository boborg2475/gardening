import { create } from 'zustand';
import { temporal } from 'zundo';
import { nanoid } from 'nanoid';
import type { Project, Point, Zone } from '../types/garden';

type ZoneInput = Omit<Zone, 'id'>;

interface ProjectState {
  project: Project;
  addZone: (input: ZoneInput) => void;
  updateZone: (id: string, patch: Partial<Omit<Zone, 'id'>>) => void;
  removeZone: (id: string) => void;
  setPropertyBoundary: (vertices: Point[]) => void;
  setHouseOutline: (vertices: Point[]) => void;
  clearProject: () => void;
  loadProject: (project: Project) => void;
}

const emptyProject = (): Project => ({
  id: nanoid(),
  name: 'Untitled Project',
  propertyBoundary: null,
  houseOutline: null,
  zones: [],
});

export const useProjectStore = create<ProjectState>()(
  temporal(
    (set) => ({
      project: emptyProject(),

      addZone: (input) =>
        set((state) => ({
          project: {
            ...state.project,
            zones: [...state.project.zones, { ...input, id: nanoid() }],
          },
        })),

      updateZone: (id, patch) =>
        set((state) => ({
          project: {
            ...state.project,
            zones: state.project.zones.map((z) =>
              z.id === id ? { ...z, ...patch } : z
            ),
          },
        })),

      removeZone: (id) =>
        set((state) => ({
          project: {
            ...state.project,
            zones: state.project.zones.filter((z) => z.id !== id),
          },
        })),

      setPropertyBoundary: (vertices) =>
        set((state) => ({
          project: {
            ...state.project,
            propertyBoundary: { vertices },
          },
        })),

      setHouseOutline: (vertices) =>
        set((state) => ({
          project: {
            ...state.project,
            houseOutline: { vertices },
          },
        })),

      clearProject: () =>
        set({ project: emptyProject() }),

      loadProject: (project) =>
        set({ project }),
    }),
    { limit: 50 }
  )
);
