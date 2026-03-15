# Beads MVP Spec — Garden Yard Planner

## Bead Dependency Graph

```
BEAD-001 Types
  └─► BEAD-002 ProjectStore
  └─► BEAD-003 UIStore
        └─► BEAD-005 CanvasEngine
  BEAD-002 ──► BEAD-004 Persistence (db + projectRepo)
  BEAD-002 ──► BEAD-005 CanvasEngine
  BEAD-005 ──► BEAD-006 GridRenderer
  BEAD-005 ──► BEAD-007 ShapeRenderer
  BEAD-005 ──► BEAD-008 SelectionRenderer
  BEAD-007 ──► BEAD-009 RectangleTool
  BEAD-007 ──► BEAD-010 PolygonTool
  BEAD-005 ──► BEAD-011 SelectTool
  BEAD-006..BEAD-011 ──► BEAD-012 CanvasView (React component)
  BEAD-003 ──► BEAD-013 Toolbar (React component)
  BEAD-002 ──► BEAD-014 ZonePanel (React component)
  BEAD-012..BEAD-014 ──► BEAD-015 App (React shell + wiring)
  BEAD-015 ──► BEAD-016 AutoSave + Undo/Redo shortcuts
  BEAD-016 ──► BEAD-017 Styling (CSS Modules)
```

## Bead Definitions

### BEAD-001: Domain Types (`types/garden.ts`)
- **Gate:** None (root bead)
- **Output:** Point, Polygon, Zone, PropertyBoundary, HouseOutline, Project, ToolType, SunExposure, SoilType
- **Tests:** Type compilation check (import and use types)

### BEAD-002: Project Store (`store/projectStore.ts`)
- **Gate:** BEAD-001
- **Output:** Zustand store with zundo undo/redo; actions: addZone, updateZone, removeZone, setPropertyBoundary, setHouseOutline, moveShape
- **Tests:** Store CRUD, undo/redo integration

### BEAD-003: UI Store (`store/uiStore.ts`)
- **Gate:** BEAD-001
- **Output:** Zustand store; state: activeTool, selectedId, pan, zoom, panelOpen; actions: setTool, select, deselect, setPan, setZoom
- **Tests:** Tool switching, selection state

### BEAD-004: Persistence (`persistence/db.ts`, `persistence/projectRepo.ts`)
- **Gate:** BEAD-002
- **Output:** Dexie DB schema, save/load/list/delete project functions
- **Tests:** Save + load round-trip with fake-indexeddb

### BEAD-005: Canvas Engine (`canvas/CanvasEngine.ts`)
- **Gate:** BEAD-002, BEAD-003
- **Output:** Class managing canvas, world-to-screen transform, render loop, pointer event dispatch
- **Tests:** Coordinate transform math, event dispatch

### BEAD-006: Grid Renderer (`canvas/renderers/gridRenderer.ts`)
- **Gate:** BEAD-005
- **Output:** Function drawing grid lines based on zoom/pan
- **Tests:** Renders without error at various zoom levels

### BEAD-007: Shape Renderer (`canvas/renderers/shapeRenderer.ts`)
- **Gate:** BEAD-005
- **Output:** Functions rendering polygons (property, house, zones) on canvas
- **Tests:** Correct path construction for known polygons

### BEAD-008: Selection Renderer (`canvas/renderers/selectionRenderer.ts`)
- **Gate:** BEAD-005
- **Output:** Highlight overlay for selected shapes
- **Tests:** Renders highlight for selected zone

### BEAD-009: Rectangle Tool (`canvas/tools/RectangleTool.ts`)
- **Gate:** BEAD-007
- **Output:** Click-drag to create rectangular zone
- **Tests:** mousedown+mousemove+mouseup produces correct rectangle

### BEAD-010: Polygon Tool (`canvas/tools/PolygonTool.ts`)
- **Gate:** BEAD-007
- **Output:** Click-to-add-vertex, close-on-first-vertex polygon tool
- **Tests:** Click sequence produces polygon, close detection works

### BEAD-011: Select Tool (`canvas/tools/SelectTool.ts`)
- **Gate:** BEAD-005
- **Output:** Click to select, drag to move, Delete to remove
- **Tests:** Hit-test logic, move updates store, delete removes

### BEAD-012: CanvasView (`components/CanvasView.tsx`)
- **Gate:** BEAD-006..BEAD-011
- **Output:** React component hosting canvas element, wires engine to DOM
- **Tests:** Renders canvas element, mounts engine

### BEAD-013: Toolbar (`components/Toolbar.tsx`)
- **Gate:** BEAD-003
- **Output:** Tool buttons that update uiStore.activeTool
- **Tests:** Button clicks switch active tool

### BEAD-014: ZonePanel (`components/ZonePanel.tsx`)
- **Gate:** BEAD-002
- **Output:** Side panel showing selected zone metadata, editable fields
- **Tests:** Displays zone name/color/sun/soil, edits update store

### BEAD-015: App Shell (`App.tsx`, `main.tsx`, `index.css`)
- **Gate:** BEAD-012..BEAD-014
- **Output:** Layout composing Toolbar + CanvasView + ZonePanel
- **Tests:** App renders all three sections

### BEAD-016: Auto-Save + Undo/Redo Shortcuts
- **Gate:** BEAD-015
- **Output:** Debounced save on store change, Ctrl+Z/Ctrl+Shift+Z, Delete/Escape handlers
- **Tests:** Keyboard events trigger undo/redo, auto-save fires after debounce

### BEAD-017: Styling (CSS Modules)
- **Gate:** BEAD-016
- **Output:** `App.module.css`, polished layout
- **Tests:** Visual — verified by dev server boot

## Verification

Per CLAUDE.md Definition of Done:
1. `npm run test -- --run` passes
2. `npm run lint` passes
3. `npm run build` passes
4. All plans up to date
