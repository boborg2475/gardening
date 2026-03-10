# Phase 1, Sub-PR 1: Types + Stores

## Scope

Domain type definitions, `projectStore` (with zundo temporal middleware), `uiStore`, and selectors. No persistence, no canvas, no UI components.

## Dependencies to Install

- `zustand` — state management
- `zundo` — temporal (undo/redo) middleware for zustand
- `nanoid` — ID generation

## Files to Create

### Types (`src/types/`)
- `project.ts` — `Point`, `UnitSystem`, `SoilType`, `SunExposure`, `PlantingStatus`, `Zone`, `PlacedFeature`, `Planting`, `Measurement`
- `ui.ts` — `ToolType`, `SelectedType`, `PanelType`, `LayerVisibility`

### Stores (`src/store/`)
- `projectStore.ts` — Zustand vanilla store with zundo temporal middleware, all actions per LLD-02
- `uiStore.ts` — Plain Zustand store, all actions per LLD-02
- `selectors.ts` — `selectedZone`, `selectedFeature`, `plantingsForZone`, `visibleZones`, `visibleFeatures`

### Tests (`src/store/__tests__/`)
- `projectStore.test.ts` — Default state, all actions, cascade delete, updatedAt behavior
- `uiStore.test.ts` — Default state, all actions, side effects (setTool clears selection, etc.)
- `selectors.test.ts` — All selector functions

## Relevant Specs
- LLD-02 (State Management)
- BEAM-SP-001 through BEAM-SP-009, BEAM-SP-020, BEAM-SP-021, BEAM-SP-022, BEAM-SP-023
