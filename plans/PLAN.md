---
must_haves:
  - R1: Type System
  - R2: Project Store
  - R3: UI Store
  - R4: Persistence
  - R5: Canvas Engine
  - R6: Grid Renderer
  - R7: Shape Renderer
  - R8: Selection Renderer
  - R9: Rectangle Tool
  - R10: Polygon Tool
  - R11: Select Tool
  - R12: React Components
  - R13: Auto-Save & Load
  - R14: Undo/Redo Shortcuts
waves:
  - wave: 1
    name: "Foundation"
    units: [R1, R2, R3]
    parallel: true
    description: "Types, project store, UI store — no dependencies between them"
  - wave: 2
    name: "Persistence"
    units: [R4]
    depends_on: [1]
    description: "Dexie DB depends on types from wave 1"
  - wave: 3
    name: "Canvas Core"
    units: [R5, R6]
    depends_on: [1]
    parallel: true
    description: "Canvas engine and grid renderer depend on types"
  - wave: 4
    name: "Rendering & Tools"
    units: [R7, R8, R9, R10, R11]
    depends_on: [2, 3]
    parallel: true
    description: "Shape/selection renderers and interaction tools"
  - wave: 5
    name: "React UI & Wiring"
    units: [R12, R13, R14]
    depends_on: [4]
    parallel: true
    description: "Components, auto-save, keyboard shortcuts"
nyquist: "Every R requirement maps to at least one test. Tests are tagged with requirement IDs."
---

# Garden Yard Planner MVP — Execution Plan

## Wave 1: Foundation (R1, R2, R3)
Types, project store, and UI store. These have no cross-dependencies and can be built in parallel.

### R1: Type System
- Create `src/types/garden.ts` with all domain types
- Test: type-level checks (compile-time), plus runtime shape validation tests

### R2: Project Store
- Create `src/store/projectStore.ts` with Zustand + zundo
- Test: all CRUD actions, undo/redo via temporal

### R3: UI Store
- Create `src/store/uiStore.ts` with Zustand (no persistence)
- Test: tool switching, selection, pan/zoom, layer toggles

## Wave 2: Persistence (R4)
Depends on Wave 1 types.

### R4: Persistence
- Create `src/persistence/db.ts` (Dexie schema)
- Create `src/persistence/projectRepo.ts` (CRUD operations)
- Test: save/load/list/delete with fake-indexeddb

## Wave 3: Canvas Core (R5, R6)
Depends on Wave 1 types for coordinates.

### R5: Canvas Engine
- Create `src/canvas/CanvasEngine.ts`
- Test: coordinate transforms, renderer registration

### R6: Grid Renderer
- Create `src/canvas/renderers/gridRenderer.ts`
- Test: grid line calculation at various zoom levels

## Wave 4: Rendering & Tools (R7, R8, R9, R10, R11)
Depends on Waves 2-3.

### R7-R8: Shape & Selection Renderers
- Create `src/canvas/renderers/shapeRenderer.ts`
- Create `src/canvas/renderers/selectionRenderer.ts`
- Test: correct draw calls for shapes/selection

### R9: Rectangle Tool
- Create `src/canvas/tools/RectangleTool.ts`
- Test: mousedown/mousemove/mouseup creates correct rectangle

### R10: Polygon Tool
- Create `src/canvas/tools/PolygonTool.ts`
- Test: click sequence creates polygon, close detection

### R11: Select Tool
- Create `src/canvas/tools/SelectTool.ts`
- Test: hit testing, drag-move, delete, deselect

## Wave 5: React UI & Wiring (R12, R13, R14)
Depends on Wave 4.

### R12: React Components
- Create App.tsx, Toolbar.tsx, CanvasView.tsx, ZonePanel.tsx
- Test: render, tool button clicks, zone panel edits

### R13: Auto-Save
- Wire store subscription with debounced save
- Test: store change triggers save after debounce

### R14: Undo/Redo Shortcuts
- Add keyboard event listener for Ctrl+Z / Ctrl+Shift+Z
- Test: keyboard events trigger undo/redo

## Deviation Rules
- If a wave takes more than expected, do NOT skip tests
- If a dependency is blocked, work on independent items in the same wave
- All code must compile (`tsc -b`) before moving to next wave
