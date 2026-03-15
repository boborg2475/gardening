## Why

The Garden Yard Planner's canvas rendering engine has detailed implementation plans in `plans/` but lacks formal OpenSpec capability specs to drive TDD implementation and serve as the authoritative behavioral contract for future phases. Without these specs, Phase 2+ work (domain renderers, interaction tools, hit testing) has no structured, testable requirements to implement against.

## What Changes

- **New**: OpenSpec capability specs covering the four major canvas subsystems
- **New**: Formal behavioral contracts for each capability, aligned with existing BEAM and LLD docs
- No runtime code changes; this is a documentation/spec artifact creation effort

## Capabilities

### New Capabilities

- `canvas-engine-core`: CanvasEngine lifecycle (mount/unmount), render loop with `needsRender` flag, store subscriptions, viewport (pan/zoom with focal-point anchoring), HiDPI/responsive canvas sizing, and world↔screen coordinate transforms
- `canvas-renderers`: All rendering pass functions — grid (already implemented), plus planned domain renderers: property boundary, house outline, zones, placed features, measurements, drawing preview, and selection highlights
- `canvas-interaction-tools`: Tool infrastructure (active tool dispatch) and the four tools: select, draw (polygon), place (feature), and measure; including pointer event routing for both mouse and touch
- `canvas-hit-testing`: `hitTest(sx, sy)` implementation that resolves a screen point to a domain object (zone, feature, property vertex, house, or empty), used by the select and draw tools

### Modified Capabilities

<!-- No existing openspec specs to modify -->

## Impact

- `src/canvas/CanvasEngine.ts` — governs `canvas-engine-core` and `canvas-hit-testing`
- `src/canvas/renderers/` — governs `canvas-renderers`
- `src/canvas/tools/` (to be created) — governs `canvas-interaction-tools`
- `src/store/uiStore.ts` — `activeTool`, `selectedIds`, `drawingPreview`, `layerVisibility` fields
- `src/store/projectStore.ts` — zone/feature/planting/measurement mutations driven by tools
- Plans: `plans/low-level-design-docs/01-canvas-engine-rendering.md`, `plans/specs/BEAM-canvas-engine.md` serve as source of truth for spec content
