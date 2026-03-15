# Garden Yard Planner — Epic & Story Breakdown

**Date:** 2026-03-15

## Epic 1: Foundation (Types, Stores, Persistence)

### Story 1.1: Type Definitions [BMAD-types]
Define all TypeScript types for the domain model (Point, Shape, Zone, Project, Tool, etc.)

### Story 1.2: Project Store [BMAD-project-store]
Implement zustand projectStore with zundo undo/redo middleware. Actions: addShape, updateShape, removeShape, setProject.

### Story 1.3: UI Store [BMAD-ui-store]
Implement zustand uiStore for transient UI state. Actions: setTool, selectShape, setPan, setZoom.

### Story 1.4: Persistence Layer [BMAD-persistence]
Implement Dexie database schema and projectRepo (save, load, loadLast). Wire auto-save with debounced store subscription.

## Epic 2: Canvas Engine & Rendering

### Story 2.1: Canvas Engine [BMAD-canvas-engine]
Implement CanvasEngine class with camera transform (pan/zoom), coordinate conversion (screenToWorld, worldToScreen), and requestAnimationFrame render loop.

### Story 2.2: Grid Renderer [BMAD-grid-renderer]
Render background grid lines based on world coordinates, adapting density to zoom level.

### Story 2.3: Shape Renderer [BMAD-shape-renderer]
Render polygons (property, house, zone) with fill, stroke, and labels. Zones use semi-transparent fill with their assigned color.

### Story 2.4: Selection Renderer [BMAD-selection-renderer]
Render selection highlight (dashed outline, vertex handles) on the currently selected shape.

## Epic 3: Canvas Tools

### Story 3.1: Select Tool [BMAD-select-tool]
Implement click-to-select (point-in-polygon hit testing), drag-to-move, and Delete key to remove shapes.

### Story 3.2: Rectangle Tool [BMAD-rectangle-tool]
Implement click-drag rectangle creation for zones. Preview during drag, commit on mouse up.

### Story 3.3: Polygon Tool [BMAD-polygon-tool]
Implement click-to-add-vertex polygon creation. Close on click near first vertex or double-click. Used for property, house, and polygon zones.

## Epic 4: React UI

### Story 4.1: App Layout & Toolbar [BMAD-app-layout]
Implement App component with toolbar, canvas area, and side panel layout using CSS Modules.

### Story 4.2: Canvas View Component [BMAD-canvas-view]
React component that mounts the CanvasEngine, handles resize, and wires pointer events.

### Story 4.3: Zone Panel [BMAD-zone-panel]
Side panel that displays and edits selected zone metadata (name, color, sun exposure, soil type, notes).

## Epic 5: Integration & Polish

### Story 5.1: Undo/Redo Keyboard Shortcuts [BMAD-undo-redo]
Wire Ctrl+Z / Ctrl+Shift+Z to zundo temporal actions. Wire Escape to cancel/deselect.

### Story 5.2: Auto-Save Integration [BMAD-auto-save]
Subscribe to projectStore, debounce 1s, save to IndexedDB. Load last project on app startup.

### Story 5.3: Styling [BMAD-styling]
CSS Modules for all components. Clean layout, responsive basics.

## Implementation Order

1. Epic 1 (Foundation) — Stories 1.1 → 1.2 → 1.3 → 1.4
2. Epic 2 (Canvas) — Stories 2.1 → 2.2 → 2.3 → 2.4
3. Epic 3 (Tools) — Stories 3.1, 3.2, 3.3
4. Epic 4 (UI) — Stories 4.1, 4.2, 4.3
5. Epic 5 (Integration) — Stories 5.1, 5.2, 5.3
