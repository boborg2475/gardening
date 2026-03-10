import { createStore } from 'zustand/vanilla';
import { temporal } from 'zundo';
import { nanoid } from 'nanoid';
import type { Point, UnitSystem, Zone, PlacedFeature, Planting, Measurement } from '../types/project';

export interface ProjectData {
  id: string;
  name: string;
  units: UnitSystem;
  propertyBoundary: Point[] | null;
  houseOutline: Point[] | null;
  zones: Zone[];
  features: PlacedFeature[];
  plantings: Planting[];
  measurements: Measurement[];
  createdAt: string;
  updatedAt: string;
}

interface ProjectActions {
  setPropertyBoundary: (points: Point[]) => void;
  setHouseOutline: (points: Point[]) => void;
  addZone: (zone: Zone) => void;
  updateZone: (id: string, updates: Partial<Omit<Zone, 'id'>>) => void;
  deleteZone: (id: string) => void;
  addFeature: (feature: PlacedFeature) => void;
  updateFeature: (id: string, updates: Partial<Omit<PlacedFeature, 'id'>>) => void;
  deleteFeature: (id: string) => void;
  addPlanting: (planting: Planting) => void;
  updatePlanting: (id: string, updates: Partial<Omit<Planting, 'id'>>) => void;
  deletePlanting: (id: string) => void;
  addMeasurement: (measurement: Measurement) => void;
  deleteMeasurement: (id: string) => void;
  loadProject: (state: ProjectData) => void;
  resetProject: () => void;
}

export type ProjectState = ProjectData & ProjectActions;

function createDefaultData(): ProjectData {
  const now = new Date().toISOString();
  return {
    id: nanoid(),
    name: 'Untitled Project',
    units: 'imperial',
    propertyBoundary: null,
    houseOutline: null,
    zones: [],
    features: [],
    plantings: [],
    measurements: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function createProjectStore() {
  return createStore<ProjectState>()(
    temporal(
      (set) => ({
        ...createDefaultData(),

        setPropertyBoundary: (points) =>
          set({ propertyBoundary: points, updatedAt: new Date().toISOString() }),

        setHouseOutline: (points) =>
          set({ houseOutline: points, updatedAt: new Date().toISOString() }),

        addZone: (zone) =>
          set((state) => ({
            zones: [...state.zones, zone],
            updatedAt: new Date().toISOString(),
          })),

        updateZone: (id, updates) =>
          set((state) => ({
            zones: state.zones.map((z) =>
              z.id === id ? { ...z, ...updates } : z
            ),
            updatedAt: new Date().toISOString(),
          })),

        deleteZone: (id) =>
          set((state) => ({
            zones: state.zones.filter((z) => z.id !== id),
            plantings: state.plantings.filter((p) => p.zoneId !== id),
            updatedAt: new Date().toISOString(),
          })),

        addFeature: (feature) =>
          set((state) => ({
            features: [...state.features, feature],
            updatedAt: new Date().toISOString(),
          })),

        updateFeature: (id, updates) =>
          set((state) => ({
            features: state.features.map((f) =>
              f.id === id ? { ...f, ...updates } : f
            ),
            updatedAt: new Date().toISOString(),
          })),

        deleteFeature: (id) =>
          set((state) => ({
            features: state.features.filter((f) => f.id !== id),
            updatedAt: new Date().toISOString(),
          })),

        addPlanting: (planting) =>
          set((state) => ({
            plantings: [...state.plantings, planting],
            updatedAt: new Date().toISOString(),
          })),

        updatePlanting: (id, updates) =>
          set((state) => ({
            plantings: state.plantings.map((p) =>
              p.id === id ? { ...p, ...updates } : p
            ),
            updatedAt: new Date().toISOString(),
          })),

        deletePlanting: (id) =>
          set((state) => ({
            plantings: state.plantings.filter((p) => p.id !== id),
            updatedAt: new Date().toISOString(),
          })),

        addMeasurement: (measurement) =>
          set((state) => ({
            measurements: [...state.measurements, measurement],
            updatedAt: new Date().toISOString(),
          })),

        deleteMeasurement: (id) =>
          set((state) => ({
            measurements: state.measurements.filter((m) => m.id !== id),
            updatedAt: new Date().toISOString(),
          })),

        loadProject: (data) =>
          set({ ...data }, true),

        resetProject: () =>
          set(createDefaultData(), true),
      }),
      {
        partialize: (state): ProjectData => ({
          id: state.id,
          name: state.name,
          units: state.units,
          propertyBoundary: state.propertyBoundary,
          houseOutline: state.houseOutline,
          zones: state.zones,
          features: state.features,
          plantings: state.plantings,
          measurements: state.measurements,
          createdAt: state.createdAt,
          updatedAt: state.updatedAt,
        }),
      }
    )
  );
}
