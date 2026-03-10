# LLD 02: State Management

## Overview

The Garden Yard Planner uses two Zustand stores to separate persistent project data from transient UI state. The project store is wrapped with zundo's `temporal` middleware for full undo/redo support. The UI store has no middleware and is never persisted.

---

## 1. Type Definitions

### Primitives and Enums

```typescript
interface Point {
  x: number; // world units (feet or meters)
  y: number;
}

type UnitSystem = 'imperial' | 'metric';

enum SoilType {
  Clay = 'clay',
  Sandy = 'sandy',
  Loam = 'loam',
  Silt = 'silt',
  Peat = 'peat',
  Chalk = 'chalk',
}

enum SunExposure {
  FullSun = 'full-sun',       // 6+ hours direct sun
  PartialSun = 'partial-sun', // 4-6 hours direct sun
  PartialShade = 'partial-shade', // 2-4 hours direct sun
  FullShade = 'full-shade',   // <2 hours direct sun
}

enum PlantingStatus {
  Planned = 'planned',
  Planted = 'planted',
  Growing = 'growing',
  Harvested = 'harvested',
  Removed = 'removed',
}
```

### Domain Objects

```typescript
interface Zone {
  id: string;           // nanoid
  name: string;
  points: Point[];      // closed polygon vertices (world units)
  color: string;        // hex color for rendering
  soilType: SoilType;
  sunExposure: SunExposure;
  notes: string;
}

interface PlacedFeature {
  id: string;           // nanoid
  templateId: string;   // references feature catalog
  name: string;
  position: Point;      // center point (world units)
  rotation: number;     // degrees
  scale: number;        // 1.0 = default size
}

interface Planting {
  id: string;           // nanoid
  zoneId: string;       // parent zone reference
  plantId: string;      // references plant database
  name: string;
  position: Point;      // position within the zone (world units)
  datePlanted: string | null;  // ISO date string
  status: PlantingStatus;
  notes: string;
}

interface Measurement {
  id: string;           // nanoid
  startPoint: Point;
  endPoint: Point;
  label: string;        // auto-computed or user-overridden
}
```

---

## 2. projectStore (Zustand + zundo)

### State Shape

```typescript
interface ProjectState {
  // --- Data ---
  id: string;
  name: string;
  units: UnitSystem;
  propertyBoundary: Point[] | null;
  houseOutline: Point[] | null;
  zones: Zone[];
  features: PlacedFeature[];
  plantings: Planting[];
  measurements: Measurement[];
  createdAt: string;   // ISO datetime
  updatedAt: string;   // ISO datetime

  // --- Actions ---
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

  loadProject: (state: ProjectState) => void;
  resetProject: () => void;
}
```

### Store Creation

The store is created with `zustand/vanilla` `createStore` and wrapped with zundo's `temporal` middleware:

```
createStore(temporal<ProjectState>((set) => ({ ... })))
```

A React hook `useProjectStore` is derived via `zustand`'s `useStore` for component consumption.

### Default State

When `resetProject` is called or no saved project exists, the store initializes with:

| Field              | Default Value                  |
| ------------------ | ------------------------------ |
| `id`               | new nanoid                     |
| `name`             | `'Untitled Project'`           |
| `units`            | `'imperial'`                   |
| `propertyBoundary` | `null`                         |
| `houseOutline`     | `null`                         |
| `zones`            | `[]`                           |
| `features`         | `[]`                           |
| `plantings`        | `[]`                           |
| `measurements`     | `[]`                           |
| `createdAt`        | current ISO datetime           |
| `updatedAt`        | current ISO datetime           |

### Action Behavior

Every mutating action sets `updatedAt` to the current ISO datetime.

- **`setPropertyBoundary(points)`** — Replaces `propertyBoundary` with the provided array.
- **`setHouseOutline(points)`** — Replaces `houseOutline` with the provided array.
- **`addZone(zone)`** — Appends `zone` to the `zones` array.
- **`updateZone(id, updates)`** — Shallow-merges `updates` into the zone matching `id`. No-op if zone not found.
- **`deleteZone(id)`** — Removes the zone matching `id` from `zones`. Also removes all entries in `plantings` where `zoneId === id` (cascade delete).
- **`addFeature(feature)`** — Appends `feature` to the `features` array.
- **`updateFeature(id, updates)`** — Shallow-merges `updates` into the feature matching `id`.
- **`deleteFeature(id)`** — Removes the feature matching `id` from `features`.
- **`addPlanting(planting)`** — Appends `planting` to the `plantings` array.
- **`updatePlanting(id, updates)`** — Shallow-merges `updates` into the planting matching `id`.
- **`deletePlanting(id)`** — Removes the planting matching `id` from `plantings`.
- **`addMeasurement(measurement)`** — Appends `measurement` to the `measurements` array.
- **`deleteMeasurement(id)`** — Removes the measurement matching `id` from `measurements`.
- **`loadProject(state)`** — Replaces the entire store state with the provided `state` object. Used when loading from IndexedDB or importing JSON.
- **`resetProject()`** — Replaces the entire store state with the default state (new `id`, empty arrays, current timestamps). Clears the undo/redo history.

### Undo/Redo via zundo

The `temporal` middleware from zundo wraps the store and automatically captures snapshots of the state (excluding action functions) on every `set()` call.

**Accessing undo/redo:**

```typescript
const { undo, redo, pastStates, futureStates } = useTemporalStore();
```

- `undo()` — Reverts to the previous state snapshot. The current state is pushed onto `futureStates`.
- `redo()` — Re-applies the next state from `futureStates`. The current state is pushed onto `pastStates`.
- `pastStates` — Array of previous snapshots (length indicates undo depth).
- `futureStates` — Array of undone snapshots (cleared when a new mutation occurs after undo).

**Drag batching:**

During drag operations (e.g., moving a feature or zone vertex), many intermediate `updateFeature`/`updateZone` calls fire. These must collapse into a single undo step.

Approach:
1. On drag start, call `useTemporalStore().pause()` to stop snapshot capture.
2. During drag, mutations proceed normally but no snapshots are recorded.
3. On drag end (drop), call `useTemporalStore().resume()` which captures a single snapshot of the final state.

This ensures the user can undo a drag operation in one step rather than reverting through every intermediate position.

**History clearing:**

The undo/redo history is cleared when:
- `resetProject()` is called.
- `loadProject()` is called (loading a different project).

---

## 3. uiStore (Zustand, no middleware)

### State Shape

```typescript
type ToolType =
  | 'select'
  | 'draw-property'
  | 'draw-house'
  | 'draw-zone'
  | 'place-feature'
  | 'measure';

type SelectedType =
  | 'zone'
  | 'feature'
  | 'property-vertex'
  | 'house-vertex'
  | null;

type PanelType =
  | 'project'
  | 'zones'
  | 'features'
  | 'plantings'
  | 'layers'
  | null;

interface LayerVisibility {
  grid: boolean;
  property: boolean;
  house: boolean;
  zones: boolean;
  features: boolean;
  measurements: boolean;
}

interface UIState {
  // --- Data ---
  activeTool: ToolType;
  selectedId: string | null;
  selectedType: SelectedType;
  drawingPoints: Point[];
  placingFeatureTemplate: string | null;
  panX: number;
  panY: number;
  zoom: number;
  layers: LayerVisibility;
  sidebarOpen: boolean;
  activePanel: PanelType;
  isMobile: boolean;

  // --- Actions ---
  setTool: (tool: ToolType) => void;
  select: (id: string, type: SelectedType) => void;
  deselect: () => void;
  addDrawingPoint: (point: Point) => void;
  clearDrawing: () => void;
  setPlacingFeature: (templateId: string | null) => void;
  setPan: (x: number, y: number) => void;
  setZoom: (zoom: number) => void;
  toggleLayer: (layer: keyof LayerVisibility) => void;
  toggleSidebar: () => void;
  setActivePanel: (panel: PanelType) => void;
  setIsMobile: (isMobile: boolean) => void;
}
```

### Default State

| Field                    | Default Value       |
| ------------------------ | ------------------- |
| `activeTool`             | `'select'`          |
| `selectedId`             | `null`              |
| `selectedType`           | `null`              |
| `drawingPoints`          | `[]`                |
| `placingFeatureTemplate` | `null`              |
| `panX`                   | `0`                 |
| `panY`                   | `0`                 |
| `zoom`                   | `1`                 |
| `layers`                 | all `true`          |
| `sidebarOpen`            | `true`              |
| `activePanel`            | `'project'`         |
| `isMobile`               | `false` (detected)  |

### Action Behavior

- **`setTool(tool)`** — Sets `activeTool`. Clears selection (`selectedId = null`, `selectedType = null`). Clears `drawingPoints`. If tool is `'place-feature'`, `placingFeatureTemplate` is expected to be set separately via `setPlacingFeature`.
- **`select(id, type)`** — Sets `selectedId` and `selectedType`. Switches `activeTool` to `'select'` if it was a drawing tool.
- **`deselect()`** — Sets `selectedId = null` and `selectedType = null`.
- **`addDrawingPoint(point)`** — Appends `point` to `drawingPoints`. Used by draw-property, draw-house, draw-zone tools to accumulate polygon vertices.
- **`clearDrawing()`** — Resets `drawingPoints` to `[]`.
- **`setPlacingFeature(templateId)`** — Sets `placingFeatureTemplate`. If non-null, also sets `activeTool` to `'place-feature'`. If null, reverts `activeTool` to `'select'`.
- **`setPan(x, y)`** — Sets `panX` and `panY`.
- **`setZoom(zoom)`** — Sets `zoom`, clamped to `[0.1, 10]`.
- **`toggleLayer(layer)`** — Flips the boolean for the named layer.
- **`toggleSidebar()`** — Flips `sidebarOpen`.
- **`setActivePanel(panel)`** — Sets `activePanel`. If sidebar is closed, also opens it.
- **`setIsMobile(isMobile)`** — Sets `isMobile`. If switching to mobile, closes sidebar.

### Interaction with projectStore

The uiStore never reads or writes projectStore directly. Components and canvas tools read from both stores independently. When a drawing tool completes (e.g., the user finishes drawing a zone polygon), the canvas interaction handler:
1. Reads `drawingPoints` from uiStore.
2. Calls the appropriate projectStore action (e.g., `addZone`).
3. Calls `clearDrawing()` and `setTool('select')` on uiStore.

This keeps the two stores decoupled.

---

## 4. Selectors

Selectors are standalone functions that derive state from one or both stores. They are used in components via Zustand's selector pattern to minimize re-renders.

### projectStore Selectors

```typescript
// Returns the zone matching the current selection, or undefined.
const selectedZone = (projectState: ProjectState, uiState: UIState): Zone | undefined =>
  uiState.selectedType === 'zone'
    ? projectState.zones.find(z => z.id === uiState.selectedId)
    : undefined;

// Returns the feature matching the current selection, or undefined.
const selectedFeature = (projectState: ProjectState, uiState: UIState): PlacedFeature | undefined =>
  uiState.selectedType === 'feature'
    ? projectState.features.find(f => f.id === uiState.selectedId)
    : undefined;

// Returns all plantings belonging to the given zone.
const plantingsForZone = (state: ProjectState, zoneId: string): Planting[] =>
  state.plantings.filter(p => p.zoneId === zoneId);

// Returns zones filtered by layer visibility.
const visibleZones = (projectState: ProjectState, uiState: UIState): Zone[] =>
  uiState.layers.zones ? projectState.zones : [];

// Returns features filtered by layer visibility.
const visibleFeatures = (projectState: ProjectState, uiState: UIState): PlacedFeature[] =>
  uiState.layers.features ? projectState.features : [];
```

### Usage Pattern

In components, selectors are used with Zustand's shallow equality to avoid unnecessary re-renders:

```
const zones = useProjectStore(state => state.zones);
const layerVisible = useUIStore(state => state.layers.zones);
const visible = layerVisible ? zones : [];
```

For cross-store selectors (e.g., `selectedZone`), components read from both stores and combine in the component body, or use a custom hook that subscribes to both.

---

## 5. Store Initialization Flow

1. App mounts.
2. `useAutoSave` hook initializes.
3. Persistence layer checks for `lastProjectId` in IndexedDB.
   - If found: loads that project via `projectRepo.loadProject(id)` and calls `projectStore.loadProject(state)`.
   - If not found: `projectStore` remains at its default state (new empty project).
4. `useAutoSave` begins subscribing to projectStore changes.
5. uiStore initializes with defaults. `isMobile` is detected from viewport width.

---

## 6. File Organization

```
src/types/
  project.ts          — Point, Zone, PlacedFeature, Planting, Measurement, enums
  ui.ts               — ToolType, SelectedType, PanelType, LayerVisibility

src/store/
  projectStore.ts     — Zustand store with temporal middleware
  uiStore.ts          — Zustand store (plain)
  selectors.ts        — Derived state selectors
```
