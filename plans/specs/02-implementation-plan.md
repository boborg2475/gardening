# Implementation Plan — MVP

## Phase 1: Foundation (Types + Stores)
1. Define domain types (`types/garden.ts`)
2. Implement `projectStore` with zundo middleware
3. Implement `uiStore`
4. Write tests for both stores

## Phase 2: Persistence
5. Define Dexie database schema (`persistence/db.ts`)
6. Implement `projectRepo` (save/load/list)
7. Write tests for persistence layer

## Phase 3: Canvas Engine
8. Implement `CanvasEngine` (coordinate transforms, pan/zoom, render loop)
9. Implement `gridRenderer`
10. Implement `shapeRenderer` (polygons, rectangles, with fill/stroke)
11. Implement `selectionRenderer` (highlight, handles)

## Phase 4: Interaction Tools
12. Implement `PolygonTool` (property boundary, house, zone polygon)
13. Implement `RectangleTool` (zone rectangle)
14. Implement `SelectTool` (click select, drag move, delete)
15. Write tests for tool state machines

## Phase 5: React Components
16. `App.tsx` — layout shell
17. `Toolbar.tsx` — tool buttons
18. `CanvasView.tsx` — canvas element + engine lifecycle
19. `ZonePanel.tsx` — zone metadata editor

## Phase 6: Integration
20. Wire auto-save (subscribe to store, debounce, save)
21. Wire undo/redo keyboard shortcuts
22. Wire tool keyboard shortcuts (Escape to deselect)
23. Styling with CSS Modules

## Phase 7: Verification
24. All tests pass
25. Lint clean
26. Build succeeds
27. Dev server starts
