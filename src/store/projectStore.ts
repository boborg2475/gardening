import { create } from 'zustand';
import { temporal } from 'zundo';
import { nanoid } from 'nanoid';
import type { Project, PropertyBoundary, HouseOutline, Zone, Point } from '../types/garden';

interface ProjectState {
  project: Project;
  setProperty: (vertices: Point[]) => void;
  setHouse: (vertices: Point[]) => void;
  addZone: (zone: Omit<Zone, 'id' | 'kind'>) => void;
  updateZone: (id: string, patch: Partial<Omit<Zone, 'id' | 'kind'>>) => void;
  deleteShape: (id: string) => void;
  moveShape: (id: string, dx: number, dy: number) => void;
  loadProject: (project: Project) => void;
}

const emptyProject = (): Project => ({
  id: nanoid(),
  name: 'My Garden',
  property: null,
  house: null,
  zones: [],
  updatedAt: Date.now(),
});

export const useProjectStore = create<ProjectState>()(
  temporal(
    (set) => ({
      project: emptyProject(),

      setProperty: (vertices) =>
        set((s) => ({
          project: {
            ...s.project,
            property: { id: s.project.property?.id ?? nanoid(), kind: 'property', vertices } as PropertyBoundary,
            updatedAt: Date.now(),
          },
        })),

      setHouse: (vertices) =>
        set((s) => ({
          project: {
            ...s.project,
            house: { id: s.project.house?.id ?? nanoid(), kind: 'house', vertices } as HouseOutline,
            updatedAt: Date.now(),
          },
        })),

      addZone: (zone) =>
        set((s) => ({
          project: {
            ...s.project,
            zones: [...s.project.zones, { ...zone, id: nanoid(), kind: 'zone' as const }],
            updatedAt: Date.now(),
          },
        })),

      updateZone: (id, patch) =>
        set((s) => ({
          project: {
            ...s.project,
            zones: s.project.zones.map((z) => (z.id === id ? { ...z, ...patch } : z)),
            updatedAt: Date.now(),
          },
        })),

      deleteShape: (id) =>
        set((s) => ({
          project: {
            ...s.project,
            property: s.project.property?.id === id ? null : s.project.property,
            house: s.project.house?.id === id ? null : s.project.house,
            zones: s.project.zones.filter((z) => z.id !== id),
            updatedAt: Date.now(),
          },
        })),

      moveShape: (id, dx, dy) =>
        set((s) => {
          const move = (vertices: Point[]) => vertices.map((v) => ({ x: v.x + dx, y: v.y + dy }));
          return {
            project: {
              ...s.project,
              property:
                s.project.property?.id === id
                  ? { ...s.project.property, vertices: move(s.project.property.vertices) }
                  : s.project.property,
              house:
                s.project.house?.id === id
                  ? { ...s.project.house, vertices: move(s.project.house.vertices) }
                  : s.project.house,
              zones: s.project.zones.map((z) =>
                z.id === id ? { ...z, vertices: move(z.vertices) } : z,
              ),
              updatedAt: Date.now(),
            },
          };
        }),

      loadProject: (project) => set({ project }),
    }),
    { limit: 50 },
  ),
);
