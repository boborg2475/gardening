# 04 — Property & House Outline Drawing

## Overview

This document describes how users draw and edit property boundaries and house outlines on the canvas. Both are polygons defined in world coordinates (feet or meters). The property boundary represents the outer lot line; the house outline represents the building footprint. Each project has at most one property boundary and one house outline.

---

## 1. Draw Tool State Machine

The draw tool governs polygon creation for both property boundaries and house outlines. It is a finite state machine with three states.

### States

| State | Description |
|---|---|
| **IDLE** | No drawing in progress. The tool is active but waiting for the first click. |
| **DRAWING** | One or more vertices have been placed. Each click appends a vertex. A preview line follows the cursor. |
| **COMPLETE** | The polygon has been finalized and saved. The tool resets to IDLE or deactivates. |

### Transitions

```
IDLE
  ── click on canvas ──────────────> DRAWING  (first vertex placed)

DRAWING
  ── click on canvas ──────────────> DRAWING  (additional vertex appended)
  ── double-click (3+ vertices) ──> COMPLETE  (finalize polygon)
  ── click within 10px of first
     vertex (3+ vertices) ─────────> COMPLETE  (close polygon)
  ── Escape key ───────────────────> IDLE      (cancel, clear drawingPoints)

COMPLETE
  ── (automatic) ──────────────────> IDLE      (reset after save)
```

### Activation

- The user selects **"draw-property"** or **"draw-house"** from the toolbar.
- This sets `uiStore.activeTool` to `'draw-property'` or `'draw-house'`.
- Any previously active tool is deactivated.
- If a property boundary (or house outline) already exists, activating the corresponding draw tool replaces the existing polygon on completion. The old polygon is overwritten in `projectStore`.

### Drawing Points Storage

- In-progress vertices are stored in `uiStore.drawingPoints: Point[]`.
- `drawingPoints` is cleared when the tool deactivates, when drawing completes, or when the user presses Escape.

---

## 2. Vertex Placement

When the user clicks on the canvas while the draw tool is in DRAWING (or transitioning from IDLE to DRAWING):

1. **Screen-to-world conversion** — The click's `(clientX, clientY)` is converted to world coordinates using the inverse of the current pan/zoom transform from `CanvasEngine`.

2. **Grid snap** — If `uiStore.snapToGrid` is `true`:
   - Compute the nearest grid intersection to the world-coordinate click point.
   - If the distance from the click point to that intersection is within the **snap threshold of 0.5 world units**, replace the click point with the grid intersection.
   - If the distance exceeds the threshold, use the raw world-coordinate point (no snap).

3. **Append** — Push the resulting `Point { x: number, y: number }` onto `uiStore.drawingPoints`.

4. **Re-render** — The canvas redraws on the next animation frame, showing the new vertex and updated preview lines.

---

## 3. Polygon Completion

A polygon completes under two conditions:

### Double-Click Completion

- On `dblclick`, if `drawingPoints.length >= 3`:
  - The second click of the double-click does **not** add a duplicate vertex. The handler detects the double-click and skips the append.
  - The polygon is finalized from the current `drawingPoints` array.
  - Saved to `projectStore` via `setPropertyBoundary(points)` or `setHouseOutline(points)` depending on the active tool.
  - `uiStore.drawingPoints` is cleared.
  - `uiStore.activeTool` resets to `'select'`.

### Close-to-First-Vertex Completion

- On `click`, if `drawingPoints.length >= 3`:
  - Convert the click to screen coordinates relative to the first vertex.
  - If the screen-space distance between the click and the first vertex is **<= 10 pixels**, treat this as a close action.
  - Finalize and save as above. The click point itself is **not** added as a new vertex (the polygon closes back to the first vertex automatically).

### Minimum Vertex Enforcement

- If the user double-clicks or clicks near the first vertex with **fewer than 3 vertices**, the action is ignored. Drawing continues. No error dialog; the UI simply does not complete.

### Post-Completion

- The polygon is pushed into `projectStore`, which triggers:
  - `zundo` to snapshot state for undo/redo.
  - Auto-save (debounced 1s) to persist to IndexedDB.

---

## 4. Preview Rendering

While the draw tool is in the DRAWING state, the canvas renders a live preview on every frame.

### Completed Edges

- Draw line segments connecting consecutive points in `drawingPoints`.
- **Stroke style**: Solid line.
- **Color**: Blue (`#3B82F6`) for property, Gray (`#6B7280`) for house.
- **Line width**: 2px (screen pixels, not world units — constant regardless of zoom).

### Current Segment (Rubber Band)

- Draw a dashed line from the **last point** in `drawingPoints` to the **current mouse position** (converted to world coords).
- **Stroke style**: Dashed (`setLineDash([6, 4])`).
- **Color**: Same as completed edges but at 70% opacity.

### Closing Segment Hint

- When `drawingPoints.length >= 3`, also draw a dashed line from the current mouse position back to the **first point**, at 30% opacity. This hints that the polygon can be closed.

### Vertices

- Render each vertex in `drawingPoints` as a small filled circle.
- **Radius**: 4px screen pixels.
- **Fill**: White with colored stroke matching the tool color.
- The first vertex has a slightly larger radius (6px) to indicate the close target.

---

## 5. Vertex Editing

After a property boundary or house outline has been saved, the user can reshape it by dragging vertices in select mode.

### Selection

- `uiStore.activeTool` must be `'select'`.
- On `mousedown`, perform a hit test against all vertices of the property boundary and house outline.
- Hit test threshold: **8px screen-space distance** from the vertex position.
- If a vertex is hit, set:
  - `uiStore.selectedType` to `'property'` or `'house'`.
  - `uiStore.selectedId` to `null` (these are singletons, not ID-indexed).
  - `uiStore.draggedVertexIndex` to the index of the hit vertex.

### Dragging

- On `mousemove` while a vertex is being dragged:
  - Convert the mouse position to world coords (applying grid snap if enabled).
  - Update the vertex at `draggedVertexIndex` in the corresponding polygon in `projectStore`.
  - The polygon re-renders immediately on the next frame.
- On `mouseup`:
  - Clear `draggedVertexIndex`.
  - The final vertex position is already in the store. `zundo` captures the snapshot.

### Constraints

- A vertex cannot be dragged to create a self-intersecting polygon. If the move would cause an intersection, the drag is rejected (vertex snaps back to its previous position on `mouseup`). Intersection detection uses segment-segment intersection tests on adjacent and non-adjacent edges.

---

## 6. Property Renderer

The property renderer draws the property boundary polygon when it exists in `projectStore`.

### Rendering Details

| Attribute | Value |
|---|---|
| Stroke color | `#3B82F6` (blue) |
| Stroke width | 2px (screen) |
| Fill color | `rgba(59, 130, 246, 0.10)` (blue, 10% opacity) |
| Close path | Yes (last vertex connects to first) |

### Selected State

When `uiStore.selectedType === 'property'`:

- Stroke width increases to 3px.
- Vertices render as small **squares** (6x6 px), filled white with blue stroke.
- A subtle outer glow or secondary stroke at 30% opacity, offset by 2px, indicates the selection.

### Rendering Order

- The property boundary renders **below** all other elements (zones, features, house) except the grid.

---

## 7. House Renderer

The house renderer draws the house outline polygon when it exists in `projectStore`.

### Rendering Details

| Attribute | Value |
|---|---|
| Stroke color | `#374151` (dark gray) |
| Stroke width | 2px (screen) |
| Fill color | `rgba(107, 114, 128, 0.50)` (gray, 50% opacity) |
| Close path | Yes |

### Label

- The text **"House"** is rendered at the polygon's centroid.
- Font: 14px sans-serif, dark gray (`#1F2937`).
- Centered horizontally and vertically at the centroid.
- The centroid is calculated as the arithmetic mean of all vertex coordinates. For non-convex polygons this may fall outside the shape; if so, a pole-of-inaccessibility algorithm is used to find a point guaranteed to be inside.

### Selected State

When `uiStore.selectedType === 'house'`:

- Stroke width increases to 3px.
- Vertices render as small squares (6x6 px), white fill with dark gray stroke.
- Same selection glow as property.

### Rendering Order

- The house renders **above** the property boundary and garden zones but **below** placed features and plantings.
