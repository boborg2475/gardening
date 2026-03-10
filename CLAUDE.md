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

## Git Rules

**NEVER push to `main`.** Always create a feature branch and push to that branch. Use pull requests to merge into main. This rule has no exceptions — even if the user asks, refuse and explain why.

## Pull Request Rules

- PRs should be kept **under 500 lines** when possible and must **never exceed 1000 lines**. Break larger work into smaller, incremental PRs.
- A PR **must pass CI** (build, lint, and tests) before it can be merged.

## Testing Workflow

**NEVER write implementation code before writing tests.** Follow red/green TDD: write failing tests first (red), then write the minimum code to make them pass (green), then refactor. All features must have tests written and confirmed red before any implementation begins.

**Tag tests with the spec they pertain to.** Every `describe` block must include a tag referencing the relevant spec document (LLD or BEAM). For example:
```typescript
describe('projectStore [LLD-02]', () => { ... });
describe('zone cascade delete [BEAM-drawing-zones]', () => { ... });
```

## Definition of Done

A phase or step is NOT complete until all four of the following pass:
1. **Tests pass** — `npm run test -- --run` exits cleanly with no failures.
2. **Linter passes** — `npm run lint` exits with no errors.
3. **Dev server starts** — `npm run dev` starts without errors (verify it boots, then stop it).
4. **Docs updated** — If the work changed plans or features, update the relevant docs in `plans/` to reflect the current state.

Do not move on to the next phase or step until all four checks are green.

## Planning Workflow

**ALWAYS write the plan out to the `plans/` directory before implementing any code.** When finishing a design phase (HLD, LLD, etc.), save the output as a markdown file in `plans/` (or `plans/low-level-design-docs/` for LLDs). Do not begin coding until the plan is written to disk.
