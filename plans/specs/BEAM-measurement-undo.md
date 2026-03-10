# BEAM Specs — Measurement Tool & Undo/Redo

Format: **B**ehavior, **E**vent, **A**ction, **M**odel

---

## Measurement Tool

### BEAM-MU-001: Activating measure tool sets active tool to 'measure'

- **Behavior**: When the user clicks the measurement tool button in the toolbar, the app enters measurement mode.
- **Event**: User clicks the "Measure" toolbar button (or presses the keyboard shortcut).
- **Action**: `uiStore.setActiveTool('measure')` is called. Cursor changes to crosshair. Any in-progress drawing or selection is canceled.
- **Model**: `uiStore.activeTool` changes from its previous value to `'measure'`. `uiStore.measureStart` is `null`.
- **Preconditions**: App is loaded with a project open.
- **Expected outcome**: Toolbar button shows active/selected state. Canvas cursor is crosshair. No measurement is in progress.

---

### BEAM-MU-002: First click sets measurement start point

- **Behavior**: The first click on the canvas while in measure mode establishes the starting point of the measurement.
- **Event**: User clicks (pointerdown + pointerup without significant movement) on the canvas while `uiStore.activeTool === 'measure'` and `uiStore.measureStart === null`.
- **Action**: The click position is converted from screen coordinates to world coordinates via `CanvasEngine.screenToWorld()`. If snap-to-grid is enabled, the point snaps to the nearest grid intersection. The resulting point is stored in `uiStore.measureStart`.
- **Model**: `uiStore.measureStart` changes from `null` to `{ x, y }` (world coordinates).
- **Preconditions**: Active tool is `'measure'`. No measurement is currently in progress (`measureStart` is null).
- **Expected outcome**: A start point marker (crosshair/dot) appears on the canvas. Live preview begins (see BEAM-MU-003).

---

### BEAM-MU-003: Live preview shows distance from start to cursor

- **Behavior**: After the first click, a dashed line and live distance label follow the cursor, updating in real-time.
- **Event**: `pointermove` events on the canvas while `uiStore.measureStart !== null` and active tool is `'measure'`.
- **Action**: On each pointermove, the cursor position is converted to world coordinates (snapped if applicable). The measurement renderer draws a dashed line from `measureStart` to the current cursor position at reduced opacity. The Euclidean distance is calculated and formatted per the project's unit system. A label with the distance is rendered at the midpoint of the line.
- **Model**: No store changes. Rendering is entirely transient, driven by the current pointer position each frame.
- **Preconditions**: `uiStore.measureStart` is set. Active tool is `'measure'`.
- **Expected outcome**: User sees a dashed orange-red line from the start point to their cursor, with a continuously updating distance label at the midpoint.
- **Edge cases**: If the cursor exits the canvas, the preview freezes at the last known position. When the cursor re-enters, the preview resumes.

---

### BEAM-MU-004: Second click completes and saves measurement

- **Behavior**: The second click on the canvas finalizes the measurement and persists it.
- **Event**: User clicks on the canvas while `uiStore.activeTool === 'measure'` and `uiStore.measureStart !== null`.
- **Action**: The click position is converted to world coordinates (snapped if applicable). A new `Measurement` object is created with a generated uuid, `startPoint = uiStore.measureStart`, and `endPoint = clicked position`. `projectStore.addMeasurement(measurement)` is called. `uiStore.measureStart` is reset to `null`.
- **Model**: `projectStore.measurements` gains a new entry. `uiStore.measureStart` returns to `null`. A zundo snapshot is captured for the new projectStore state.
- **Preconditions**: `uiStore.measureStart` is set. Active tool is `'measure'`.
- **Expected outcome**: The measurement appears as a persistent dashed line with endpoint markers and a distance label. The tool resets and is ready for another measurement. The live preview disappears.
- **Edge cases**: If the second click is on the exact same point as the first, the measurement is still saved with distance 0. The label displays `0"` or `0cm`.

---

### BEAM-MU-005: Distance calculated as Euclidean distance in world units

- **Behavior**: The distance between two measurement points is the straight-line Euclidean distance in the project's world unit.
- **Event**: A measurement is created or a live preview is rendered.
- **Action**: `distance = sqrt((endPoint.x - startPoint.x)^2 + (endPoint.y - startPoint.y)^2)`. The result is in feet (imperial) or meters (metric).
- **Model**: The distance is a derived value, not stored. It is computed at render time from the stored points.
- **Preconditions**: Two valid points exist (either both stored or one stored and one from cursor).
- **Expected outcome**: The distance is geometrically correct for the given coordinate system.
- **Edge cases**: Very large distances (spanning the full canvas) and very small distances (sub-inch/sub-centimeter) both calculate correctly. Floating-point precision is sufficient for practical garden-scale measurements.

---

### BEAM-MU-006: Imperial formatting shows feet and inches (12' 6")

- **Behavior**: When the project uses imperial units, distances are displayed as feet and inches.
- **Event**: A distance value needs to be formatted and `projectStore.settings.unitSystem === 'imperial'`.
- **Action**: Whole feet are extracted via `Math.floor(distance)`. Remaining inches are `Math.round((distance - wholeFeet) * 12)`. If inches round to 12, feet increments by 1 and inches becomes 0.
- **Model**: No state change; this is a pure formatting function.
- **Preconditions**: Unit system is imperial. Distance is in feet.
- **Expected outcome**:
  - 12.5 feet displays as `12' 6"`.
  - 0.667 feet displays as `8"`.
  - 3.0 feet displays as `3' 0"`.
  - 0 feet displays as `0"`.
- **Edge cases**: Rounding: 2.9958 feet (2 feet, 11.95 inches) rounds to `3' 0"` (inches rounds to 12, triggering the overflow logic).

---

### BEAM-MU-007: Metric formatting shows meters (3.81m) or cm (45cm)

- **Behavior**: When the project uses metric units, distances are displayed in meters or centimeters.
- **Event**: A distance value needs to be formatted and `projectStore.settings.unitSystem === 'metric'`.
- **Action**: If distance >= 1.0m, format as `{distance.toFixed(2)}m`. If distance < 1.0m and > 0, convert to cm (`distance * 100`), round to nearest integer, format as `{cm}cm`.
- **Model**: No state change; this is a pure formatting function.
- **Preconditions**: Unit system is metric. Distance is in meters.
- **Expected outcome**:
  - 3.812 meters displays as `3.81m`.
  - 0.45 meters displays as `45cm`.
  - 0 meters displays as `0cm`.
  - 1.0 meters displays as `1.00m`.
- **Edge cases**: 0.999 meters displays as `100cm` (rounds up from 99.9cm). Threshold is strictly < 1.0m for cm display.

---

### BEAM-MU-008: Measurement renders as dashed line with label

- **Behavior**: Each saved measurement is rendered as a dashed line between its endpoints, with a formatted distance label at the midpoint.
- **Event**: Canvas render loop executes (every frame via requestAnimationFrame).
- **Action**: For each measurement in `projectStore.measurements`: (1) Transform start and end points to screen coordinates. (2) Draw a dashed line (stroke: `#E65100`, lineWidth: 2, dash pattern: `[8, 4]`). (3) Draw crosshair markers at each endpoint. (4) Calculate midpoint in screen coords. (5) Measure text width, draw a dark rounded-rect background, draw white distance text centered in it.
- **Model**: Read-only access to `projectStore.measurements` and `projectStore.settings.unitSystem`.
- **Preconditions**: At least one measurement exists in the project.
- **Expected outcome**: All measurements are visible on the canvas with clear, readable labels. Labels do not overlap with each other (no collision resolution in v1 — accepted limitation).

---

### BEAM-MU-009: Measurement is selectable in select mode

- **Behavior**: In select mode, clicking near a measurement line selects that measurement.
- **Event**: User clicks on the canvas while `uiStore.activeTool === 'select'`. The click position is near an existing measurement line.
- **Action**: Hit testing runs against all measurements. For each, the perpendicular distance from the click point to the line segment is computed. If within threshold (5px at current zoom, converted to world units), the measurement is a candidate. The closest candidate (by midpoint distance to click) wins. `uiStore.selectedId` is set to the measurement's id. `uiStore.selectedType` is set to `'measurement'`.
- **Model**: `uiStore.selectedId` and `uiStore.selectedType` change to reflect the selected measurement.
- **Preconditions**: Active tool is `'select'`. At least one measurement exists.
- **Expected outcome**: The selected measurement renders with a highlight effect (thicker line, glow). Properties panel may show measurement details.
- **Edge cases**: Clicking exactly on an endpoint counts as a hit. Clicking on the label background also counts as a hit.

---

### BEAM-MU-010: Delete removes selected measurement

- **Behavior**: Pressing Delete or Backspace while a measurement is selected removes it from the project.
- **Event**: User presses `Delete` or `Backspace` key while `uiStore.selectedType === 'measurement'` and `uiStore.selectedId` is set.
- **Action**: `projectStore.removeMeasurement(uiStore.selectedId)` is called. `uiStore.selectedId` and `uiStore.selectedType` are cleared.
- **Model**: The measurement is removed from `projectStore.measurements`. A zundo snapshot is captured (deletion is undoable). Selection state in uiStore is cleared.
- **Preconditions**: A measurement is currently selected. Active tool is `'select'`.
- **Expected outcome**: The measurement disappears from the canvas. Selection is cleared. Ctrl+Z can restore it.

---

### BEAM-MU-011: Escape cancels in-progress measurement

- **Behavior**: Pressing Escape while a measurement is in progress (first point placed, awaiting second click) cancels the measurement without saving.
- **Event**: User presses `Escape` while `uiStore.activeTool === 'measure'` and `uiStore.measureStart !== null`.
- **Action**: `uiStore.measureStart` is set to `null`. The live preview disappears. The tool remains active in measure mode.
- **Model**: `uiStore.measureStart` changes from `{ x, y }` to `null`. No change to `projectStore`.
- **Preconditions**: Measure tool is active. First point has been placed.
- **Expected outcome**: The dashed preview line and live distance label disappear. The cursor remains as crosshair. User can start a new measurement with the next click.
- **Edge cases**: Pressing Escape when no measurement is in progress (`measureStart === null`) has no effect on the measurement tool. The app may handle Escape at a higher level (e.g., deselect or switch to select tool).

---

### BEAM-MU-012: Measurement snaps to grid when snap enabled

- **Behavior**: When snap-to-grid is enabled, measurement points snap to the nearest grid intersection.
- **Event**: User clicks to place a measurement point (start or end) while `uiStore.snapToGrid === true`.
- **Action**: The clicked world coordinate is rounded to the nearest grid line intersection. Grid spacing is determined by `projectStore.settings.gridSpacing` (e.g., 1 foot or 0.5 meters). The snapped point is used for both storage and live preview.
- **Model**: The stored `startPoint` / `endPoint` values reflect the snapped coordinates, not the raw click position.
- **Preconditions**: Snap-to-grid is enabled. Measure tool is active.
- **Expected outcome**: Measurement endpoints align precisely to grid intersections. The live preview line also snaps as the cursor moves near grid lines. Distances are "clean" numbers aligned to the grid.
- **Edge cases**: If grid spacing changes after a measurement is placed, the existing measurement retains its original snapped coordinates.

---

## Undo / Redo

### BEAM-MU-013: Ctrl+Z undoes last project state change

- **Behavior**: Pressing Ctrl+Z (Cmd+Z on Mac) reverts the project to its previous state.
- **Event**: User presses `Ctrl+Z` (or `Cmd+Z`). Focus is not in a text input or textarea. No modal dialog is open.
- **Action**: `projectStore.temporal.getState().undo()` is called. The current state is pushed onto `futureStates`. The most recent entry in `pastStates` becomes the current state.
- **Model**: `projectStore` state reverts to the previous snapshot. `pastStates` shrinks by one. `futureStates` grows by one.
- **Preconditions**: `pastStates.length > 0`. Focus is not in a text input. No modal is open.
- **Expected outcome**: The canvas re-renders showing the previous state. Whatever the last action was (add zone, move feature, delete measurement, etc.) is visually reversed.

---

### BEAM-MU-014: Ctrl+Shift+Z redoes last undone change

- **Behavior**: Pressing Ctrl+Shift+Z (Cmd+Shift+Z on Mac) re-applies the most recently undone change.
- **Event**: User presses `Ctrl+Shift+Z` (or `Cmd+Shift+Z`, or `Ctrl+Y` on Windows/Linux). Focus is not in a text input. No modal is open.
- **Action**: `projectStore.temporal.getState().redo()` is called. The current state is pushed onto `pastStates`. The most recent entry in `futureStates` becomes the current state.
- **Model**: `projectStore` state advances to the next snapshot in the redo stack. `futureStates` shrinks by one. `pastStates` grows by one.
- **Preconditions**: `futureStates.length > 0`. Focus is not in a text input. No modal is open.
- **Expected outcome**: The previously undone change is re-applied. The canvas re-renders accordingly.

---

### BEAM-MU-015: Undo with empty history does nothing

- **Behavior**: If there is no history to undo, the undo action is a no-op.
- **Event**: User presses `Ctrl+Z` while `pastStates.length === 0`.
- **Action**: `undo()` is called but has no effect. No state changes occur.
- **Model**: No change to any store.
- **Preconditions**: `pastStates` is empty (either fresh project or user has already undone everything).
- **Expected outcome**: Nothing happens. No error. No visual change. The undo toolbar button should already be disabled (see BEAM-MU-023).

---

### BEAM-MU-016: Redo with empty future does nothing

- **Behavior**: If there is no undone state to redo, the redo action is a no-op.
- **Event**: User presses `Ctrl+Shift+Z` while `futureStates.length === 0`.
- **Action**: `redo()` is called but has no effect. No state changes occur.
- **Model**: No change to any store.
- **Preconditions**: `futureStates` is empty (no undo has been performed, or a new action was taken after an undo).
- **Expected outcome**: Nothing happens. No error. No visual change. The redo toolbar button should already be disabled.

---

### BEAM-MU-017: New action after undo clears redo history

- **Behavior**: If the user undoes one or more actions and then performs a new action, the redo stack is cleared. History does not branch.
- **Event**: Any `projectStore` mutation occurs while `futureStates.length > 0`.
- **Action**: zundo automatically clears `futureStates` when a new snapshot is captured after an undo.
- **Model**: `futureStates` is emptied. The new state is pushed onto `pastStates`.
- **Preconditions**: At least one undo has been performed (futureStates is non-empty). A new mutation occurs.
- **Expected outcome**: Redo becomes unavailable. The redo toolbar button becomes disabled. The action that was undone is permanently lost from the redo stack.
- **Edge cases**: This is standard linear undo behavior. There is no branching or tree-based undo.

---

### BEAM-MU-018: Drag operation counts as single undo step

- **Behavior**: Dragging a feature, zone vertex, or boundary point creates exactly one undo step, regardless of how many intermediate positions were passed through.
- **Event**: User performs a drag operation (pointerdown, multiple pointermove, pointerup) on a draggable element.
- **Action**: On drag start: `temporalStore.pause()`. During drag: store mutations occur but no snapshots are captured. On drag end: `temporalStore.resume()`, then trigger a snapshot.
- **Model**: `pastStates` gains exactly one new entry representing the pre-drag state. The current state reflects the post-drag position.
- **Preconditions**: User is in select mode and initiates a drag on a movable element.
- **Expected outcome**: One Ctrl+Z after a drag returns the element to its pre-drag position. The intermediate positions are not part of the history.
- **Edge cases**: If the user drags an element and drops it back at its starting position, a snapshot is still captured. The undo step exists but undoing/redoing it produces no visible change.

---

### BEAM-MU-019: Undo reverts zone addition (zone disappears)

- **Behavior**: Undoing a zone creation removes the zone from the canvas.
- **Event**: User adds a zone, then presses Ctrl+Z.
- **Action**: `undo()` restores the projectStore state from before the zone was added. The zone is no longer in `projectStore.zones`.
- **Model**: `projectStore.zones` reverts to its previous contents (without the added zone).
- **Preconditions**: A zone was just added and is the most recent undoable action.
- **Expected outcome**: The zone disappears from the canvas. Ctrl+Shift+Z brings it back.

---

### BEAM-MU-020: Undo reverts feature move (feature returns to original position)

- **Behavior**: Undoing a feature move returns the feature to its position before the drag.
- **Event**: User drags a feature to a new position, then presses Ctrl+Z.
- **Action**: `undo()` restores the projectStore state from before the drag (thanks to drag batching per BEAM-MU-018). The feature's position reverts.
- **Model**: The feature's coordinates in `projectStore.features` revert to their pre-drag values.
- **Preconditions**: A feature was just dragged and the drag is the most recent undoable action.
- **Expected outcome**: The feature snaps back to its original position on the canvas. One Ctrl+Z is sufficient regardless of drag duration.

---

### BEAM-MU-021: Undo reverts property boundary change

- **Behavior**: Undoing a property boundary edit restores the previous boundary shape.
- **Event**: User modifies the property boundary (add/move/delete vertex), then presses Ctrl+Z.
- **Action**: `undo()` restores the projectStore state from before the boundary change.
- **Model**: `projectStore.propertyBoundary` reverts to its previous vertex set.
- **Preconditions**: A property boundary change was the most recent undoable action.
- **Expected outcome**: The property boundary on the canvas reverts to its previous shape.

---

### BEAM-MU-022: Multiple sequential undos walk back through history

- **Behavior**: Pressing Ctrl+Z multiple times in succession undoes multiple actions, one per keypress, in reverse chronological order.
- **Event**: User presses Ctrl+Z repeatedly.
- **Action**: Each press calls `undo()` once. Each call pops one entry from `pastStates` and pushes the current state onto `futureStates`.
- **Model**: `pastStates` shrinks by one and `futureStates` grows by one with each press.
- **Preconditions**: `pastStates` has multiple entries.
- **Expected outcome**: The project state walks backwards through history. The user sees each previous state in reverse order. Once `pastStates` is empty, further Ctrl+Z presses have no effect.
- **Edge cases**: Rapid key repeat (holding Ctrl+Z) fires multiple undo events. Each is processed independently in order.

---

### BEAM-MU-023: Undo/redo buttons disabled when history empty

- **Behavior**: The undo toolbar button is visually disabled and non-interactive when there is nothing to undo. Same for redo.
- **Event**: `pastStates.length` changes to 0 (undo) or `futureStates.length` changes to 0 (redo).
- **Action**: The React component subscribes to the temporal store's state lengths. When length is 0, the button renders with `disabled` attribute and reduced opacity (`opacity: 0.4`).
- **Model**: No store change. This is a derived UI state from the temporal store.
- **Preconditions**: The toolbar is visible.
- **Expected outcome**: Disabled buttons are visually distinct (dimmed). Clicking them has no effect. Tooltip still appears to show the shortcut key.

---

### BEAM-MU-024: History limited to 50 states

- **Behavior**: The undo history stores a maximum of 50 past states. When the limit is exceeded, the oldest state is discarded.
- **Event**: A new projectStore mutation occurs when `pastStates.length === 50`.
- **Action**: The new snapshot is added to `pastStates`. The oldest entry (index 0) is removed to maintain the limit.
- **Model**: `pastStates.length` remains at 50. The oldest state is permanently lost.
- **Preconditions**: The user has performed at least 50 mutations since the session started (or since the oldest retained state).
- **Expected outcome**: The user can undo up to 50 steps back. The 51st undo attempt does nothing (pastStates is empty after 50 undos). Memory usage stays bounded.
- **Edge cases**: The limit applies only to `pastStates`. `futureStates` is naturally bounded because it can only contain states that were undone from `pastStates`.

---

### BEAM-MU-025: UI state changes (tool, pan, zoom) NOT in undo history

- **Behavior**: Changes to UI-only state are never recorded in the undo history and cannot be undone.
- **Event**: User switches tools, pans the canvas, zooms in/out, toggles layer visibility, or changes any other uiStore value.
- **Action**: `uiStore` is modified directly. Since `uiStore` is not wrapped with `temporal` middleware, no snapshot is captured.
- **Model**: `uiStore` changes. `projectStore.temporal.pastStates` and `futureStates` are unaffected.
- **Preconditions**: None.
- **Expected outcome**: Pressing Ctrl+Z after panning, zooming, or switching tools does NOT undo the pan/zoom/tool switch. Instead, it undoes the most recent project data change. The user's viewport and tool state are preserved.
- **Edge cases**: If the user's only actions since the last project mutation have been UI changes (panning around), Ctrl+Z undoes whatever the last project mutation was, even though it may have happened minutes ago.
