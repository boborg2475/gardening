# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Garden Yard Planner — a client-side-only Progressive Web App (React 18 + TypeScript + Vite) for mapping yards, planning planting areas, and tracking plantings. No backend; all data persists in IndexedDB.

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build
npm run test         # Run all tests (Vitest)
npm run test -- --run src/utils/geometry.test.ts  # Run a single test file
```

## Architecture

### Rendering: Raw HTML Canvas 2D
All map content is rendered via a custom `CanvasEngine` (not Konva/Fabric). Coordinates are stored in world units (feet/meters) and transformed to screen pixels by the engine. The render loop redraws every frame via `requestAnimationFrame`.

### State: Two Zustand Stores
- **`projectStore`** — All persistent project data (property boundary, house, zones, features, plantings). Wrapped with `zundo` middleware for undo/redo via state snapshots.
- **`uiStore`** — Transient UI state (active tool, selection, pan/zoom, layer visibility, panel state). Not persisted, no undo.

### Persistence: Dexie (IndexedDB)
Projects are saved/loaded via `projectRepo`. Auto-save is debounced (1s) on store changes. JSON import/export for sharing.

### Canvas Interaction Model
Pointer events flow through a unified handler (mouse + touch) → dispatched to the active tool (select, draw, place, measure). Tools mutate stores; store changes trigger re-render.

### Key Source Directories
- `src/canvas/` — CanvasEngine, renderers (grid, zone, feature, etc.), interaction tools
- `src/store/` — Zustand stores and selectors
- `src/components/` — React UI (layout, panels, dialogs, shared)
- `src/data/` — Feature catalog templates and plant database
- `src/persistence/` — Dexie schema, projectRepo, auto-save
- `src/types/` — TypeScript type definitions for all domain objects

### Design Decisions
- Raw Canvas over Konva: full control, smaller bundle, simple shape set
- Canvas draw functions for feature icons (no image assets — crisp at any zoom)
- CSS Modules for styling (no runtime CSS-in-JS)
- All export (PNG, PDF) happens client-side via offscreen canvas + jsPDF

## Planning Workflow

**ALWAYS write the plan out to the `plans/` directory before implementing any code.** When finishing a design phase (HLD, LLD, etc.), save the output as a markdown file in `plans/` (or `plans/low-level-design-docs/` for LLDs). Do not begin coding until the plan is written to disk.
