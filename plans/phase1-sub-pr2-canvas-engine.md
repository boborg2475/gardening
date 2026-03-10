# Phase 1, Sub-PR 2: Canvas Engine

## Scope

CanvasEngine class with render loop, world-to-screen/screen-to-world coordinate transforms, pan, zoom (cursor-centered), HiDPI support, responsive resize, grid renderer. No hit testing, no domain renderers (property/house/zones) — those come in Phase 2.

## Files to Create

### Types (`src/canvas/`)
- `types.ts` — `Viewport`, `HitResult` types

### Engine (`src/canvas/`)
- `CanvasEngine.ts` — Core class: constructor, mount/unmount, coordinate transforms, camera control, render loop with `needsRender` flag, responsive resize via ResizeObserver, HiDPI handling

### Renderers (`src/canvas/renderers/`)
- `grid.ts` — Grid renderer with adaptive spacing, major/minor lines

### Tests (`src/canvas/__tests__/`)
- `CanvasEngine.test.ts` — Coordinate transforms, zoom with focal point, pan, needsRender flag
- `grid.test.ts` — Adaptive spacing calculation, grid line generation

## Relevant Specs
- LLD-01 (Canvas Engine and Rendering)
- BEAM-CE-001 through BEAM-CE-013, BEAM-CE-017, BEAM-CE-018
