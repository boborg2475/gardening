# Garden Yard Planner — Architecture Document

**Version:** 1.0 MVP
**Date:** 2026-03-15

## 1. System Architecture

```
┌─────────────────────────────────────────────────┐
│                  React UI Layer                  │
│  ┌──────────┐  ┌──────────────┐  ┌───────────┐  │
│  │ Toolbar  │  │  CanvasView  │  │ ZonePanel │  │
│  └──────────┘  └──────────────┘  └───────────┘  │
├─────────────────────────────────────────────────┤
│              State Management Layer              │
│  ┌───────────────┐    ┌──────────────┐          │
│  │ projectStore  │    │   uiStore    │          │
│  │ (zustand+zundo│    │  (zustand)   │          │
│  └───────────────┘    └──────────────┘          │
├─────────────────────────────────────────────────┤
│               Canvas Engine Layer                │
│  ┌────────────┐  ┌───────────┐  ┌────────────┐  │
│  │CanvasEngine│  │ Renderers │  │   Tools    │  │
│  └────────────┘  └───────────┘  └────────────┘  │
├─────────────────────────────────────────────────┤
│              Persistence Layer                   │
│  ┌───────────────┐    ┌──────────────┐          │
│  │   Dexie DB    │    │ projectRepo  │          │
│  └───────────────┘    └──────────────┘          │
└─────────────────────────────────────────────────┘
```

## 2. Data Model

### Point
```typescript
{ x: number; y: number }  // world coordinates in feet
```

### Shape (base)
```typescript
{
  id: string;          // nanoid
  type: 'property' | 'house' | 'zone';
  points: Point[];     // polygon vertices
  name: string;
  color: string;       // hex color
}
```

### Zone (extends Shape)
```typescript
{
  sunExposure: 'full' | 'partial' | 'shade';
  soilType: string;
  notes: string;
}
```

### Project
```typescript
{
  id: string;
  name: string;
  shapes: Shape[];
  createdAt: number;
  updatedAt: number;
}
```

## 3. State Stores

### projectStore (zustand + zundo)
- Holds: `project: Project`
- Actions: `addShape`, `updateShape`, `removeShape`, `setProject`, `loadProject`
- Middleware: zundo for temporal (undo/redo) history

### uiStore (zustand)
- Holds: `activeTool`, `selectedShapeId`, `pan`, `zoom`, `isPanning`
- Actions: `setTool`, `selectShape`, `setPan`, `setZoom`
- Not persisted, no undo

## 4. Canvas Engine

- Manages a `<canvas>` element
- Maintains camera transform (pan + zoom) mapping world coords to screen coords
- Render loop: `requestAnimationFrame` → clear → render grid → render shapes → render selection
- Exposes `screenToWorld(x, y)` and `worldToScreen(x, y)` coordinate transforms
- Dispatches pointer events to the active tool

## 5. Tools

### SelectTool
- Click: hit-test shapes, select nearest
- Drag on selected: move shape
- Delete key: remove selected shape

### RectangleTool
- Click+drag: preview rectangle → on release, create zone with 4 corner points

### PolygonTool
- Click: add vertex
- Close (click near first vertex or double-click): finalize polygon
- Escape: cancel current polygon
- Used for property boundary, house outline, and polygon zones

## 6. Persistence

- Dexie database `GardenPlannerDB` with `projects` table
- `projectRepo.save(project)` — upserts project
- `projectRepo.load(id)` — loads project by ID
- `projectRepo.loadLast()` — loads most recently updated project
- Auto-save: subscribe to projectStore changes, debounce 1s, call save

## 7. Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Raw Canvas 2D | Full control, small bundle, simple shape set |
| Two stores | Clean undo history (only project data), no transient UI in persistence |
| World coordinates (feet) | Zoom-independent positions, meaningful measurements |
| Dexie for IndexedDB | Schema versioning, promise-based API, good TypeScript support |
| CSS Modules | Zero-runtime styling, built into Vite |
