# Task List — MVP Implementation

## Phase 1: Types + Stores
- [x] T1: Create `src/types/garden.ts` with all domain types
- [x] T2: Create `src/store/projectStore.ts` with zundo
- [x] T3: Create `src/store/uiStore.ts`
- [x] T4: Write tests for projectStore
- [x] T5: Write tests for uiStore

## Phase 2: Persistence
- [x] T6: Create `src/persistence/db.ts` (Dexie schema)
- [x] T7: Create `src/persistence/projectRepo.ts`
- [x] T8: Write tests for projectRepo

## Phase 3: Canvas Engine
- [x] T9: Create `src/canvas/CanvasEngine.ts`
- [x] T10: Create `src/canvas/renderers/gridRenderer.ts`
- [x] T11: Create `src/canvas/renderers/shapeRenderer.ts`
- [x] T12: Create `src/canvas/renderers/selectionRenderer.ts`

## Phase 4: Interaction Tools
- [x] T13: Create `src/canvas/tools/PolygonTool.ts`
- [x] T14: Create `src/canvas/tools/RectangleTool.ts`
- [x] T15: Create `src/canvas/tools/SelectTool.ts`
- [x] T16: Write tests for tools

## Phase 5: React Components
- [x] T17: Create `src/App.tsx` + `src/App.module.css`
- [x] T18: Create `src/components/Toolbar.tsx`
- [x] T19: Create `src/components/CanvasView.tsx`
- [x] T20: Create `src/components/ZonePanel.tsx`

## Phase 6: Integration
- [x] T21: Create `src/main.tsx` with auto-save + keyboard shortcuts
- [x] T22: Create `src/index.css` (global styles)

## Phase 7: Verification
- [x] T23: All tests pass
- [x] T24: Lint clean
- [x] T25: Build succeeds
