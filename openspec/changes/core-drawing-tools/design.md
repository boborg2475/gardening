## Context

Phase 1 delivered the canvas engine with pan/zoom, Zustand stores (projectStore + uiStore), Dexie persistence, and the responsive layout shell. The canvas currently renders only a grid. Users need to draw polygons to define their property boundary and house footprint — the foundational spatial elements of every yard plan.

The existing CanvasEngine uses a requestAnimationFrame render loop with world-to-screen coordinate transforms. Interaction is handled through pointer events on the canvas element. The projectStore already has type definitions for `propertyBoundary` and `houseOutline` as `Point[]` arrays, and uiStore tracks `activeTool`.

## Goals / Non-Goals

**Goals:**
- Implement a reusable polygon draw tool state machine that will also serve zone drawing (next change)
- Enable drawing, rendering, and editing of property boundary and house outline polygons
- Provide live visual feedback during drawing (preview lines, vertex indicators, close hints)
- Support grid snapping for precise vertex placement
- Support vertex dragging to reshape saved polygons with self-intersection prevention
- Wire toolbar buttons for draw-property and draw-house modes

**Non-Goals:**
- Zone drawing (uses the same tool but has its own metadata dialog — handled in `garden-zones` change)
- Undo/redo integration (Phase 3 — zundo snapshots will work automatically once wired)
- Keyboard shortcuts beyond Escape to cancel (Phase 3)
- Touch-specific drawing gestures (tap works as click; no special touch handling needed)

## Decisions

### 1. Draw tool as a standalone interaction handler

The polygon draw tool will be implemented as a class/module (`DrawTool`) that receives canvas pointer events and manages its own state machine (IDLE → DRAWING → COMPLETE). It reads/writes uiStore (drawingPoints, activeTool) and writes to projectStore on completion.

**Why not embed in CanvasEngine?** The engine handles rendering and coordinate transforms. Interaction tools are a separate concern. Keeping them modular means each tool (draw, select, measure) can be swapped in/out cleanly based on `activeTool`.

**Alternative considered:** A single monolithic event handler with switch/case on activeTool. Rejected because it would grow unwieldy as tools are added.

### 2. Drawing state in uiStore, not component state

In-progress drawing vertices (`drawingPoints`) live in uiStore rather than React component state. This allows the CanvasEngine's render loop to access them directly for preview rendering without React re-renders on every vertex placement.

**Alternative considered:** React state with callback to engine. Rejected because it couples rendering to React's render cycle and adds unnecessary complexity.

### 3. Geometry utilities as pure functions

Point-in-polygon, segment intersection, grid snapping, and centroid calculation will be pure functions in `src/utils/geometry.ts`. These are used by multiple tools and renderers.

**Why pure functions?** Easy to test, no dependencies, reusable across draw tool, select tool, and renderers.

### 4. Renderers as separate modules per layer

Property and house renderers will be separate modules (`propertyRenderer.ts`, `houseRenderer.ts`) following the existing pattern established by the grid renderer. Each renderer receives the canvas context and current transform, reads from projectStore, and draws its layer.

### 5. Preview rendering integrated into draw tool renderer

The draw preview (dashed lines, vertex circles) will be rendered by a `drawPreviewRenderer` that runs during the draw tool's active state. It reads from uiStore.drawingPoints and the current cursor position.

## Risks / Trade-offs

- **Self-intersection detection adds complexity** → Keep the implementation simple with O(n²) segment-segment tests. Polygon vertex counts are small (typically <20), so performance is not a concern. If the drag would cause intersection, snap the vertex back on mouseup rather than preventing the drag in real time.

- **Double-click detection conflicts with single click** → Use a small delay or rely on the browser's native dblclick event. The click handler should not add a vertex if a dblclick is detected within the same event sequence. Implement by tracking timestamps or using a flag set by the dblclick handler.

- **Centroid calculation for concave polygons** → The arithmetic mean of vertices works for convex polygons but may fall outside concave ones. Implement a pole-of-inaccessibility algorithm as fallback for the house label. This is a known solved problem with compact implementations.
