# MVP Implementation Plan

## Goal

Deliver a minimal viable Garden Yard Planner: a PWA where users can map their yard (property boundary + house), draw garden zones with metadata, and persist everything offline. No features, plants, or measurement tool in the MVP.

## Phases

### Phase 1 — Foundation

Set up the core rendering and state infrastructure.

- **CanvasEngine**: Custom Canvas 2D engine with requestAnimationFrame render loop, world-to-screen coordinate transforms, pan (middle-click drag + two-finger touch), zoom (scroll wheel + pinch, clamped 0.1–10x), HiDPI support, responsive resize
- **Grid renderer**: Adaptive grid spacing based on zoom level, toggleable via layer visibility
- **Zustand stores**: `projectStore` (persistent project data, wrapped with zundo) and `uiStore` (transient UI state — active tool, selection, pan/zoom, layer visibility)
- **Dexie persistence**: IndexedDB schema via Dexie, `projectRepo` with CRUD operations, debounced auto-save (1s) on store changes
- **Responsive layout**: Desktop sidebar (280px, collapsible) + canvas + toolbar; mobile full canvas with bottom sheets (60% height); touch targets 44x44px minimum

**Key LLDs**: 01-canvas-engine-rendering, 02-state-management, 03-persistence, 12-responsive-layout-layers-shortcuts

**Key BEAMs**: BEAM-canvas-engine, BEAM-state-persistence, BEAM-export-pwa-layout (layout specs only)

**Sub-PRs**:
1. **Types + Stores** — Domain types, projectStore (with zundo), uiStore, selectors
2. **Canvas Engine** — CanvasEngine class, render loop, world-to-screen transforms, pan/zoom, HiDPI, resize
3. **Persistence** — Dexie schema, projectRepo CRUD, debounced auto-save
4. **Layout** — Desktop sidebar + mobile bottom sheets, toolbar, responsive shell

### Phase 2 — Core Drawing

Enable users to draw property boundaries, house outlines, and garden zones.

- **Polygon drawing tool**: State machine (IDLE → DRAWING → COMPLETE), vertex placement with grid snapping, polygon completion (double-click or close-to-first-vertex), minimum 3 vertices enforcement
- **Property boundary**: Single closed polygon defining the yard perimeter
- **House outline**: Single closed polygon for the house footprint
- **Garden zones**: Multiple named polygons with metadata (name auto-incremented, color, soil type, sun exposure), metadata dialog shown on completion
- **Zone editing**: Vertex dragging, interior dragging (move whole zone), deletion with confirmation
- **Hit testing**: Point-in-polygon for zone/property/house selection, topmost zone wins on overlap
- **Renderers**: Layered rendering — grid → property → house → zones → selection overlay

**Key LLDs**: 04-property-house-drawing, 05-garden-zones

**Key BEAMs**: BEAM-drawing-zones

### Phase 3 — State & Undo

Add undo/redo and import/export for data safety.

- **Undo/redo**: zundo temporal middleware on projectStore, Ctrl+Z / Ctrl+Shift+Z, max 50 snapshots, drag batching via pause/resume (one undo = one complete drag)
- **Keyboard shortcuts**: Ctrl+Z undo, Ctrl+Shift+Z redo, Delete to remove selected, Escape to deselect/cancel, V/P/H/Z for tool switching, G for grid toggle
- **JSON export**: Versioned envelope with project data, downloadable as .json file
- **JSON import**: Validation, new ID generation, success/error feedback

**Key LLDs**: 09-undo-redo, 10-import-export (JSON only)

**Key BEAMs**: BEAM-measurement-undo (undo specs only), BEAM-state-persistence (export/import specs), BEAM-export-pwa-layout (keyboard shortcut specs)

### Phase 4 — PWA & Polish

Make the app installable and offline-capable.

- **PWA setup**: vite-plugin-pwa, web manifest (name, icons, theme color, display: standalone)
- **Service worker**: Precaching of app shell, offline capability
- **Install banner**: Prompt via beforeinstallprompt, dismissable (stored in localStorage)
- **Update toast**: Show notification when new version available, click to activate
- **Layer visibility toggles**: Grid, property, house, zones (features/measurements hidden until post-MVP)
- **Touch gestures**: Pinch-zoom, two-finger pan (already wired in Phase 1, polish here)

**Key LLDs**: 11-pwa-offline, 12-responsive-layout-layers-shortcuts

**Key BEAMs**: BEAM-export-pwa-layout (PWA specs)

## Out of Scope (Post-MVP)

These are fully designed in the LLDs and BEAMs but deferred:

- Zone navigation and sub-zones (see LLD-13-zone-navigation)
- Feature catalog and placement (LLD-06, BEAM-features-plants)
- Plant database and planting tracker (LLD-07, BEAM-features-plants)
- Measurement tool (LLD-08, BEAM-measurement-undo)
- PNG/PDF export (LLD-10, BEAM-export-pwa-layout)
- Multi-project support

## Implementation Rules

1. **TDD**: Write failing tests first, then implement (per CLAUDE.md)
2. **Small PRs**: Keep PRs under 500 lines when possible, never exceed 1000 lines
3. **Definition of Done**: Tests pass, linter passes, dev server starts, docs updated
4. **No direct pushes to main**: Always use feature branches and PRs
5. **Plans first**: Update this plan or write sub-plans before coding each phase
