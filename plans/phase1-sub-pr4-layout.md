# Phase 1, Sub-PR 4: Layout

## Scope

React layout shell that mounts the CanvasEngine, responsive breakpoint detection, desktop sidebar, toolbar with tool buttons, auto-save wiring. Mobile layout is a basic full-canvas view with compact toolbar. No keyboard shortcuts (Phase 3), no panel content (future PRs).

## Files to Create

### Layout Components (`src/components/layout/`)
- `AppLayout.tsx` — Breakpoint detection, renders DesktopLayout or MobileLayout
- `DesktopLayout.tsx` — Sidebar + canvas container + toolbar
- `MobileLayout.tsx` — Full-screen canvas + compact toolbar
- `Sidebar.tsx` — Collapsible sidebar with panel tabs
- `Toolbar.tsx` — Tool buttons (shared between layouts)
- `CanvasContainer.tsx` — Mounts CanvasEngine into a div, wires auto-save

### Styles (`src/components/layout/`)
- Co-located CSS Modules for each component

### Update
- `App.tsx` — Replace hello world with AppLayout + store providers

### Tests (`src/components/layout/__tests__/`)
- `AppLayout.test.tsx` — Renders desktop/mobile based on breakpoint
- `Toolbar.test.tsx` — Tool button clicks update uiStore

## Relevant Specs
- LLD-12 Part A (Responsive Layout)
- BEAM-CE-001, BEAM-CE-018
