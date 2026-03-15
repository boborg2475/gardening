# OpenSpec Change Proposal: MVP Foundation

## Proposal ID: CP-001
## Status: APPROVED
## Date: 2026-03-15

## Summary

Implement the foundational MVP of the Garden Yard Planner, covering types, stores, persistence, canvas engine, drawing tools, selection, UI components, and auto-save/undo wiring.

## Motivation

The project scaffold exists (React 19 + TS + Vite + Zustand + Dexie) but contains zero application code. This proposal delivers a working MVP that lets users draw property boundaries, house outlines, and garden zones on an interactive canvas, persist data to IndexedDB, and undo/redo changes.

## Artifacts

### ADDED
- `src/types/garden.ts` — Domain types (Point, Polygon, Zone, Project, Tool enums)
- `src/store/projectStore.ts` — Zustand store for persistent project data with zundo undo/redo
- `src/store/uiStore.ts` — Zustand store for transient UI state (active tool, selection, pan/zoom)
- `src/persistence/db.ts` — Dexie database schema
- `src/persistence/projectRepo.ts` — CRUD operations for projects in IndexedDB
- `src/canvas/CanvasEngine.ts` — Core engine: coordinate transforms, render loop, event dispatch
- `src/canvas/renderers/gridRenderer.ts` — Background grid rendering
- `src/canvas/renderers/shapeRenderer.ts` — Polygon/rectangle shape rendering
- `src/canvas/renderers/selectionRenderer.ts` — Selection highlight rendering
- `src/canvas/tools/SelectTool.ts` — Click-select, drag-move, delete-key tool
- `src/canvas/tools/RectangleTool.ts` — Click-drag rectangle creation
- `src/canvas/tools/PolygonTool.ts` — Click-vertex polygon creation
- `src/components/Toolbar.tsx` — Tool switching buttons
- `src/components/CanvasView.tsx` — Canvas React wrapper with event binding
- `src/components/ZonePanel.tsx` — Side panel for zone metadata editing
- `src/App.tsx` — Root layout component
- `src/App.module.css` — App layout styles
- `src/index.css` — Global styles / reset
- `src/main.tsx` — React entry point

### Dependencies
- All artifacts depend on `src/types/garden.ts`
- Stores depend on types
- Persistence depends on types and stores
- Canvas depends on types and stores
- Components depend on stores and canvas
- App depends on all components

## Implementation Order
1. Types
2. Stores
3. Persistence
4. Canvas engine + grid renderer
5. Shape renderer + tools (polygon, rectangle)
6. Select tool
7. React components
8. Wiring (auto-save, undo/redo shortcuts)
9. Styling

## Verification
- All tests pass (`npm run test -- --run`)
- Lint passes (`npm run lint`)
- Build compiles (`npm run build`)
