# BEAM Specs: Drawing & Zones

Behavioral specifications for property boundary drawing, house outline drawing, and garden zone management.

---

## Property & House Drawing

### BEAM-DZ-001: Activating draw-property tool sets active tool state

- **Behavior**: Selecting the "draw-property" tool from the toolbar activates property drawing mode.
- **Event**: User clicks the "Draw Property" toolbar button.
- **Action**: The UI store updates the active tool and resets any in-progress drawing state.
- **Model**: `uiStore.activeTool` set to `'draw-property'`. `uiStore.drawingPoints` cleared to `[]`. Any prior selection cleared (`selectedId = null`, `selectedType = null`).
- **Preconditions**: Any tool may be currently active.
- **Expected Outcome**: The cursor changes to a crosshair. The canvas is ready to accept vertex clicks. The toolbar button shows an active/pressed state.
- **Edge Cases**: If `draw-property` is already active, clicking the button again deactivates it (returns to `'select'`). If another drawing tool is active (e.g., `draw-house`), it is replaced.

---

### BEAM-DZ-002: Clicking on canvas adds vertex to drawing points

- **Behavior**: Each click on the canvas during drawing appends a new vertex to the in-progress polygon.
- **Event**: `mousedown` + `mouseup` (click) on the canvas while `activeTool` is `'draw-property'`, `'draw-house'`, or `'draw-zone'`.
- **Action**: Screen coordinates are converted to world coordinates. The resulting point is appended to the drawing points array.
- **Model**: `uiStore.drawingPoints` grows by one element. The new point is `{ x: worldX, y: worldY }`.
- **Preconditions**: A draw tool is active.
- **Expected Outcome**: A vertex circle appears at the click location. If this is the second or later vertex, a solid line connects it to the previous vertex. A dashed preview line extends from the new vertex to the cursor.
- **Edge Cases**: Clicking exactly on a previous vertex is allowed (though it creates a zero-length edge). Rapid clicks at the same position may trigger double-click detection instead (see BEAM-DZ-004).

---

### BEAM-DZ-003: Vertices snap to grid when snap is enabled

- **Behavior**: When grid snap is enabled, placed vertices align to the nearest grid intersection if close enough.
- **Event**: A vertex is placed (click during drawing, or vertex drag during editing) while `uiStore.snapToGrid === true`.
- **Action**: The world-coordinate click point is compared to the nearest grid intersection. If the distance is within the snap threshold, the vertex position is replaced with the grid intersection.
- **Model**: The point stored in `drawingPoints` (or updated in the polygon) uses the snapped coordinates instead of the raw click coordinates.
- **Preconditions**: `uiStore.snapToGrid` is `true`. A grid spacing is defined in the project settings.
- **Expected Outcome**: The vertex visually aligns to a grid intersection. The stored coordinates are exact multiples of the grid spacing.
- **Edge Cases**: If the click is farther than 0.5 world units from the nearest grid intersection, no snap occurs and the raw world coordinate is used. If the grid spacing is very large (e.g., 10 ft), snap behavior may feel unintuitive for small shapes; the threshold remains 0.5 units regardless.

---

### BEAM-DZ-004: Double-click completes polygon with 3+ vertices

- **Behavior**: Double-clicking finalizes the in-progress polygon when sufficient vertices exist.
- **Event**: `dblclick` on the canvas while a draw tool is active and `drawingPoints.length >= 3`.
- **Action**: The polygon is finalized from the current drawing points. The second click of the double-click does not add a duplicate vertex. The completed polygon is saved to the project store.
- **Model**: For `draw-property`: `projectStore.propertyBoundary` set to the polygon points. For `draw-house`: `projectStore.houseOutline` set to the polygon points. `uiStore.drawingPoints` cleared. `uiStore.activeTool` set to `'select'`.
- **Preconditions**: `drawingPoints.length >= 3`. A draw tool is active.
- **Expected Outcome**: The dashed preview lines disappear. The polygon renders with its final style (fill, stroke). The toolbar button returns to unselected state.
- **Edge Cases**: If `drawingPoints.length < 3`, the double-click is treated as a regular click (adds a vertex). See BEAM-DZ-006.

---

### BEAM-DZ-005: Click near first vertex closes polygon

- **Behavior**: Clicking within 10 screen pixels of the first vertex completes the polygon, as an alternative to double-click.
- **Event**: `click` on the canvas while drawing, where the click location is within 10px (screen space) of `drawingPoints[0]`, and `drawingPoints.length >= 3`.
- **Action**: The polygon is finalized. The click point is not appended as a new vertex; the polygon implicitly closes to the first point.
- **Model**: Same as BEAM-DZ-004 — polygon saved, drawing state cleared, tool reset.
- **Preconditions**: `drawingPoints.length >= 3`. Click is within 10px screen distance of the first vertex.
- **Expected Outcome**: Same as BEAM-DZ-004. The first vertex may show a visual hover indicator (enlarged circle or highlight) when the cursor is within the 10px threshold to hint that closing is possible.
- **Edge Cases**: If `drawingPoints.length < 3`, the click near the first vertex is treated as a regular vertex placement. The 10px threshold is in screen space, so it scales inversely with zoom (at higher zoom levels, the user must be more precise in world-space terms).

---

### BEAM-DZ-006: Cannot complete polygon with fewer than 3 vertices

- **Behavior**: The system prevents polygon completion when fewer than 3 vertices exist.
- **Event**: Double-click or click near first vertex while `drawingPoints.length < 3`.
- **Action**: The completion attempt is ignored. Drawing continues normally. No error message is displayed.
- **Model**: No change to `projectStore`. `uiStore.drawingPoints` may grow (if the double-click first click adds a vertex) but the polygon is not finalized.
- **Preconditions**: `drawingPoints.length` is 0, 1, or 2.
- **Expected Outcome**: Drawing remains in the DRAWING state. The user can continue adding vertices.
- **Edge Cases**: With 0 vertices, double-click adds 1 vertex (the first click) and stays in DRAWING. With 1 vertex, double-click adds 1 more vertex (total 2) and stays in DRAWING. With 2 vertices, double-click adds 1 more (total 3) — but since the third vertex comes from the first click of the double-click and the dblclick fires after, the handler checks the count at dblclick time and completes with 3 vertices if the first click brought the count to 3.

---

### BEAM-DZ-007: Completed property boundary saves to project store

- **Behavior**: A completed property boundary polygon is persisted in the project store and triggers auto-save.
- **Event**: Polygon completion (BEAM-DZ-004 or BEAM-DZ-005) while `activeTool === 'draw-property'`.
- **Action**: The polygon points are saved to the project store. A zundo snapshot is captured. Auto-save is triggered (debounced 1s).
- **Model**: `projectStore.propertyBoundary` set to `Point[]`. If a property boundary already existed, it is replaced.
- **Preconditions**: Polygon completion conditions are met.
- **Expected Outcome**: The property boundary is visible on the canvas with its final rendering style (blue stroke, 10% blue fill). The boundary persists across page reloads (after auto-save completes). Undo reverts to the previous boundary (or no boundary).
- **Edge Cases**: If a property boundary already existed, the new one replaces it entirely. There is no merge or union operation. The old boundary is recoverable via undo.

---

### BEAM-DZ-008: Drawing preview shows dashed line to cursor

- **Behavior**: While drawing, a dashed line extends from the last placed vertex to the current cursor position.
- **Event**: `mousemove` on the canvas while `activeTool` is a draw tool and `drawingPoints.length >= 1`.
- **Action**: The canvas re-renders the preview layer on the next animation frame. A dashed line connects the last vertex to the cursor's world-coordinate position.
- **Model**: No store changes. The cursor position is tracked transiently by the draw tool handler.
- **Preconditions**: At least one vertex has been placed. The draw tool is active.
- **Expected Outcome**: A dashed line follows the cursor in real time. When `drawingPoints.length >= 3`, a secondary dashed line at lower opacity connects the cursor to the first vertex to hint at polygon closure.
- **Edge Cases**: If the cursor leaves the canvas, the preview line extends to the last known cursor position at the canvas edge. On re-entry, the line resumes following the cursor.

---

### BEAM-DZ-009: Escape cancels current drawing

- **Behavior**: Pressing Escape abandons the in-progress drawing without saving.
- **Event**: `keydown` with `key === 'Escape'` while a draw tool is active and `drawingPoints.length >= 0`.
- **Action**: All drawing state is cleared. The tool is deactivated.
- **Model**: `uiStore.drawingPoints` cleared to `[]`. `uiStore.activeTool` set to `'select'`.
- **Preconditions**: A draw tool is active.
- **Expected Outcome**: All preview lines and vertex circles disappear. The toolbar button returns to unselected state. No polygon is saved.
- **Edge Cases**: If no vertices have been placed yet (IDLE state), Escape still deactivates the tool. If the user had a previous selection before activating the draw tool, it is not restored.

---

### BEAM-DZ-010: Property vertex is draggable in select mode

- **Behavior**: When the property boundary is selected, its vertices can be dragged to reshape the polygon.
- **Event**: `mousedown` on a vertex handle of the selected property boundary, followed by `mousemove`.
- **Action**: The vertex follows the cursor in real time. The polygon shape updates on each frame.
- **Model**: The corresponding point in `projectStore.propertyBoundary` is updated with the new world coordinates on each move. `uiStore.draggedVertexIndex` tracks which vertex is being dragged.
- **Preconditions**: `uiStore.activeTool === 'select'`. `uiStore.selectedType === 'property'`. The mousedown is within 8px (screen) of a vertex.
- **Expected Outcome**: The vertex handle follows the cursor. All edges connected to this vertex update in real time. Grid snap applies if enabled.
- **Edge Cases**: If dragging would create a self-intersecting polygon, the drag is rejected on mouseup (vertex reverts to its pre-drag position).

---

### BEAM-DZ-011: Moving property vertex updates boundary in store

- **Behavior**: When a vertex drag ends, the new polygon shape is committed to the project store.
- **Event**: `mouseup` after dragging a property boundary vertex.
- **Action**: The final vertex position is written to the store. A zundo snapshot is captured. Auto-save triggers.
- **Model**: `projectStore.propertyBoundary[vertexIndex]` contains the final position. `uiStore.draggedVertexIndex` cleared to `null`.
- **Preconditions**: A vertex drag is in progress.
- **Expected Outcome**: The polygon retains its new shape. The change is undoable. The change persists after auto-save.
- **Edge Cases**: If the vertex was dragged and released at its original position (no net movement), no snapshot is captured (optimization to avoid no-op undo entries).

---

### BEAM-DZ-012: House outline draws and saves independently from property

- **Behavior**: The house outline is a separate polygon that can be drawn regardless of whether a property boundary exists.
- **Event**: User activates `draw-house` and completes a polygon.
- **Action**: The polygon is saved to `projectStore.houseOutline`. Drawing and saving follows the same flow as property drawing.
- **Model**: `projectStore.houseOutline` set to `Point[]`. `projectStore.propertyBoundary` is unaffected.
- **Preconditions**: None. A property boundary is not required.
- **Expected Outcome**: The house outline renders with its own style (gray fill at 50% opacity, dark stroke, "House" label at centroid). It can coexist with or exist without a property boundary.
- **Edge Cases**: The house outline can extend beyond the property boundary. No validation is performed to enforce containment. The house can overlap with zones.

---

## Zones

### BEAM-DZ-013: Drawing zone polygon opens metadata dialog on complete

- **Behavior**: Completing a zone polygon does not immediately save it; instead, a metadata dialog opens for the user to configure zone properties.
- **Event**: Polygon completion (double-click or close-to-first-vertex) while `activeTool === 'draw-zone'`.
- **Action**: The completed polygon points are stored in a temporary buffer. A modal dialog opens with fields for name, color, soil type, sun exposure, and notes.
- **Model**: `uiStore.drawingPoints` cleared. The temporary polygon is held in component state (not in `projectStore` yet). `uiStore.activeTool` remains `'draw-zone'` until the dialog is resolved.
- **Preconditions**: `drawingPoints.length >= 3`. `activeTool === 'draw-zone'`.
- **Expected Outcome**: A modal dialog appears over the canvas. The drawn polygon is visible behind the dialog with a preview style. The canvas does not accept further clicks while the dialog is open.
- **Edge Cases**: If the user closes the browser tab while the dialog is open, the zone is lost (it was never saved). Pressing Escape while the dialog is open cancels zone creation (same as clicking Cancel).

---

### BEAM-DZ-014: Zone saves with name, color, soil, sun, notes

- **Behavior**: Clicking Save in the zone metadata dialog creates a zone with all configured properties.
- **Event**: User clicks "Save" in the zone metadata dialog.
- **Action**: A new Zone object is created with a generated UUID, the drawn polygon points, and the dialog field values. The zone is added to the project store.
- **Model**: `projectStore.zones` gains a new entry. `uiStore.activeTool` set to `'select'`. `uiStore.selectedId` set to the new zone's ID. `uiStore.selectedType` set to `'zone'`.
- **Preconditions**: The metadata dialog is open with a valid polygon in the temporary buffer.
- **Expected Outcome**: The zone appears on the canvas with its configured color and name label. It is automatically selected. The zone panel updates to show the new zone. Auto-save triggers.
- **Edge Cases**: If the user leaves the name field empty, the default auto-incremented name is used. All other fields have defaults so saving is always valid.

---

### BEAM-DZ-015: Default zone name auto-increments

- **Behavior**: The default zone name in the metadata dialog increments based on the number of existing zones.
- **Event**: The zone metadata dialog opens after polygon completion.
- **Action**: The name field is pre-populated with `"Zone N"` where N equals the current zone count plus one.
- **Model**: No store change. The default is computed from `projectStore.zones.length + 1`.
- **Preconditions**: The metadata dialog is being initialized.
- **Expected Outcome**: If there are 0 existing zones, the default is "Zone 1". If there are 2 existing zones, the default is "Zone 3".
- **Edge Cases**: If zones have been deleted (e.g., zones 1 and 2 existed, zone 1 was deleted), the default is based on current array length, not historical count. This means the default could be "Zone 2" even if "Zone 2" already exists. The user can manually rename to avoid duplicates. Duplicate zone names are allowed by the system.

---

### BEAM-DZ-016: Clicking inside zone selects it

- **Behavior**: In select mode, clicking inside a zone's polygon selects that zone.
- **Event**: `click` on the canvas while `activeTool === 'select'`, where the click point falls inside a zone polygon.
- **Action**: The zone is selected. The detail panel updates to show the zone's properties.
- **Model**: `uiStore.selectedId` set to the zone's `id`. `uiStore.selectedType` set to `'zone'`.
- **Preconditions**: `activeTool === 'select'`. The click point is inside at least one zone polygon (determined by ray-casting point-in-polygon test).
- **Expected Outcome**: The zone renders with its selected state (thicker border, vertex handles). The detail panel shows the zone's editable metadata. The zone panel highlights the corresponding row.
- **Edge Cases**: If the click is inside multiple overlapping zones, the topmost zone (highest array index) is selected. See BEAM-DZ-025. Clicking outside all zones (but on the canvas) clears the selection.

---

### BEAM-DZ-017: Selected zone shows vertex handles

- **Behavior**: When a zone is selected, draggable vertex handles appear at each polygon vertex.
- **Event**: A zone becomes selected (via canvas click or zone panel click).
- **Action**: The zone renderer draws vertex handles at each point in the zone's polygon.
- **Model**: No additional store state needed. The renderer checks `uiStore.selectedId` to determine which zone (if any) is selected.
- **Preconditions**: `uiStore.selectedType === 'zone'` and `uiStore.selectedId` matches a zone.
- **Expected Outcome**: White-filled squares (7x7 px) with a colored stroke appear at each vertex of the selected zone. Handles are rendered above the zone fill and stroke.
- **Edge Cases**: If the zone has many vertices close together (at the current zoom level), handles may overlap. No special handling; the user can zoom in to distinguish them.

---

### BEAM-DZ-018: Dragging zone interior moves entire zone

- **Behavior**: Clicking and dragging inside a selected zone (away from vertex handles) translates the entire zone polygon.
- **Event**: `mousedown` inside the selected zone's polygon but not within 8px of any vertex handle, followed by `mousemove`.
- **Action**: All vertices are translated by the cursor's world-space delta on each frame. The zone moves as a rigid body.
- **Model**: Every point in `projectStore.zones[i].points` is updated by adding the delta `{ dx, dy }`. On `mouseup`, a zundo snapshot is captured.
- **Preconditions**: The zone is selected. The mousedown is inside the zone but not near a vertex. `activeTool === 'select'`.
- **Expected Outcome**: The entire zone polygon and its label follow the cursor smoothly. All edges and vertices move together.
- **Edge Cases**: Grid snap applies to the displacement delta (not to individual vertices), preserving the polygon's shape exactly. If the zone is moved partially outside the canvas viewport, it remains valid; the user can pan to see it.

---

### BEAM-DZ-019: Dragging zone vertex reshapes polygon

- **Behavior**: Dragging a vertex handle of a selected zone changes the polygon shape.
- **Event**: `mousedown` on a vertex handle of the selected zone, followed by `mousemove`.
- **Action**: The single vertex follows the cursor. The polygon shape updates in real time.
- **Model**: `projectStore.zones[i].points[vertexIndex]` is updated on each move. On `mouseup`, a zundo snapshot is captured.
- **Preconditions**: The zone is selected and vertex handles are visible. The mousedown is within 8px of a vertex handle.
- **Expected Outcome**: The dragged vertex moves. Edges connected to it update in real time. Other vertices remain fixed.
- **Edge Cases**: Self-intersection prevention applies (same as property/house). If the drag would create a self-intersecting polygon, the vertex reverts on mouseup.

---

### BEAM-DZ-020: Deleting zone removes associated plantings

- **Behavior**: When a zone is deleted, all plantings that belong to that zone are also removed.
- **Event**: Zone deletion is confirmed (or immediate for zones without plantings).
- **Action**: All plantings with `zoneId === zone.id` are removed from the project store, then the zone itself is removed. Both operations are batched into a single zundo snapshot.
- **Model**: `projectStore.plantings` filtered to exclude entries matching the zone. `projectStore.zones` filtered to exclude the deleted zone. Selection cleared.
- **Preconditions**: A zone is selected and deletion has been triggered.
- **Expected Outcome**: The zone and all its plantings disappear from both the canvas and all panels. A single undo step restores everything.
- **Edge Cases**: If the zone has 0 plantings, only the zone is removed. If the zone has plantings but deletion was triggered without confirmation (bug), the plantings are still removed. The batched snapshot ensures atomicity for undo.

---

### BEAM-DZ-021: Zone deletion shows confirmation when plantings exist

- **Behavior**: A confirmation dialog appears before deleting a zone that contains plantings.
- **Event**: Delete key or delete button pressed while a zone with associated plantings is selected.
- **Action**: A confirmation dialog opens showing the zone name and planting count. The user must confirm or cancel.
- **Model**: No store changes until the user confirms.
- **Preconditions**: `uiStore.selectedType === 'zone'`. The selected zone has `plantings.filter(p => p.zoneId === zone.id).length > 0`.
- **Expected Outcome**: Dialog with message: `Delete "Zone Name" and its N planting(s)?`. Cancel button has default focus. Delete button is styled destructively (red).
- **Edge Cases**: If the zone has 0 plantings, no confirmation dialog appears; deletion is immediate. If the user presses Delete again while the dialog is open, the second press is ignored. If the zone's plantings are deleted by another action while the dialog is open (impossible in single-user, but defensive), the deletion proceeds for the zone only.

---

### BEAM-DZ-022: Zone panel lists all zones with metadata

- **Behavior**: The zone panel in the sidebar displays a list of all zones with summary information.
- **Event**: The zone panel is rendered (always visible when the sidebar is open).
- **Action**: The panel iterates over `projectStore.zones` and renders a row for each zone.
- **Model**: Reads from `projectStore.zones` and computes planting counts from `projectStore.plantings`.
- **Preconditions**: The sidebar is visible and the zones section is expanded.
- **Expected Outcome**: Each row shows: color swatch, zone name, soil type, sun exposure, and planting count. An "Add Zone" button is visible at the top.
- **Edge Cases**: When no zones exist, the panel shows an empty state message with an "Add Zone" prompt. Very long zone names are truncated with ellipsis. The panel scrolls if there are more zones than fit in the available space.

---

### BEAM-DZ-023: Zone color renders as semi-transparent fill

- **Behavior**: Each zone's polygon is filled with its configured color at reduced opacity.
- **Event**: Canvas render cycle.
- **Action**: The zone renderer draws a filled polygon using `zone.color` at 25% opacity.
- **Model**: Reads `zone.color` from `projectStore.zones[i]`.
- **Preconditions**: The zone exists and the zones layer is visible.
- **Expected Outcome**: The zone fill is semi-transparent, allowing the grid, property boundary, and overlapping zones beneath it to remain partially visible.
- **Edge Cases**: If two zones overlap, their semi-transparent fills combine visually (additive blending from default canvas compositing). A zone with a very dark color (e.g., black) at 25% opacity may obscure underlying content more than expected.

---

### BEAM-DZ-024: Zone name renders at polygon centroid

- **Behavior**: Each zone's name is displayed as a text label at the center of its polygon.
- **Event**: Canvas render cycle.
- **Action**: The centroid is computed from the zone's vertices. The zone name is drawn centered at that point.
- **Model**: Reads `zone.name` and `zone.points` from the store. Centroid computed as the arithmetic mean of vertices, with fallback to pole-of-inaccessibility for concave polygons.
- **Preconditions**: The zone exists and the zones layer is visible.
- **Expected Outcome**: The zone name appears visually centered within the polygon, in a color derived from (darker than) the zone's fill color.
- **Edge Cases**: For concave or L-shaped polygons, the arithmetic centroid may fall outside the polygon. In this case, the pole-of-inaccessibility algorithm finds an interior point. For very small zones (bounding box < 40px on screen), the label is hidden to avoid visual clutter.

---

### BEAM-DZ-025: Overlapping zones: click selects topmost

- **Behavior**: When zones overlap, clicking in the overlap area selects the zone that renders on top.
- **Event**: `click` on the canvas in an area where multiple zone polygons overlap.
- **Action**: Zones are hit-tested in reverse array order (last in array = topmost = tested first). The first zone whose polygon contains the click point is selected.
- **Model**: `uiStore.selectedId` set to the topmost zone's `id`.
- **Preconditions**: Multiple zones overlap at the click location. `activeTool === 'select'`.
- **Expected Outcome**: The topmost (visually frontmost) zone is selected. The user can reorder zones in the zone panel to change which zone is on top.
- **Edge Cases**: If the user wants to select a zone that is beneath another, they must either reorder the zones in the panel, click in a non-overlapping region of the desired zone, or select it directly from the zone panel.

---

### BEAM-DZ-026: Point-in-polygon hit test works for concave polygons

- **Behavior**: The hit test algorithm correctly determines whether a point is inside a polygon, including concave (non-convex) polygons.
- **Event**: Any canvas click that requires polygon containment testing (zone selection, zone interior drag detection).
- **Action**: A ray-casting algorithm is used. A horizontal ray is cast from the test point to infinity. The number of polygon edge crossings is counted. An odd count means the point is inside; even means outside.
- **Model**: No store changes. This is a pure geometric computation used by the interaction handler.
- **Preconditions**: A polygon with 3+ vertices exists.
- **Expected Outcome**: Concave polygons (e.g., L-shapes, star shapes) are correctly hit-tested. Points in concave "bays" are correctly identified as outside the polygon.
- **Edge Cases**: Points exactly on a polygon edge are treated as inside (avoids missing clicks on the boundary). Polygons with collinear vertices (three points on the same line) work correctly. Self-intersecting polygons produce undefined results (but the system prevents self-intersecting polygons from being created).
