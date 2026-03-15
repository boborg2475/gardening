## ADDED Requirements

### Requirement: Pointer events are dispatched to the active tool
The system SHALL route all canvas pointer events (mousedown, mousemove, mouseup, touchstart, touchmove, touchend) to the currently active tool as defined by `uiStore.activeTool`.

#### Scenario: Active tool receives pointer events
- **WHEN** the user presses down on the canvas
- **THEN** the active tool's `onPointerDown` handler is called with the event's world coordinates

#### Scenario: Changing active tool routes subsequent events to new tool
- **WHEN** `uiStore.activeTool` changes from `'select'` to `'draw'`
- **THEN** the next pointer event is dispatched to the draw tool, not the select tool

#### Scenario: Switching tools clears in-progress work
- **WHEN** `uiStore.activeTool` changes while a tool has in-progress state (e.g., partial polygon vertices, measurement start point, placement preview)
- **THEN** `uiStore.drawingPreview` is cleared without committing
- **THEN** no partial data is written to `projectStore`

---

### Requirement: Middle-mouse and two-finger drag pan the viewport
The system SHALL pan the viewport when the user drags with the middle mouse button or a two-finger touch gesture, regardless of the active tool.

#### Scenario: Middle-mouse pan
- **WHEN** the user holds middle mouse button and drags `(dx, dy)` screen pixels
- **THEN** the viewport pans by converting `(dx, dy)` to world units at current zoom

#### Scenario: Two-finger drag pan
- **WHEN** two touch points move together by `(dx, dy)` screen pixels
- **THEN** the viewport pans by the midpoint delta converted to world units

---

### Requirement: Scroll wheel and pinch-to-zoom change zoom level
The system SHALL zoom the viewport on scroll wheel events and pinch gestures, anchored to the pointer's world position.

#### Scenario: Scroll wheel zoom in
- **WHEN** the user scrolls up over the canvas
- **THEN** zoom increases, anchored to the world point under the cursor

#### Scenario: Pinch-to-zoom
- **WHEN** two touch points move apart (pinch out)
- **THEN** zoom increases, anchored to the midpoint of the two fingers in world coordinates

---

### Requirement: Select tool selects objects by click
The system SHALL, when the select tool is active, identify the object under the pointer on click and set it as the sole selection in `uiStore.selectedIds`.

#### Scenario: Click selects an object
- **WHEN** select tool is active and user clicks on a zone
- **THEN** `uiStore.selectedIds` is set to `[zone.id]`

#### Scenario: Click on empty space clears selection
- **WHEN** select tool is active and user clicks on empty canvas
- **THEN** `uiStore.selectedIds` is set to `[]`

#### Scenario: Selected object can be dragged to new position
- **WHEN** select tool is active, an object is selected, and the user drags it
- **THEN** the object's world position updates in `projectStore` to reflect the drag delta

---

### Requirement: Draw tool creates polygon shapes by clicking vertices
The system SHALL, when the draw tool is active, accumulate clicked world points as polygon vertices, storing them in `uiStore.drawingPreview`, and commit the polygon to `projectStore` on double-click or close.

#### Scenario: Each click adds a vertex to the preview
- **WHEN** draw tool is active and user clicks on the canvas
- **THEN** the world point is appended to `uiStore.drawingPreview.vertices`

#### Scenario: Double-click closes and commits the polygon
- **WHEN** draw tool is active and user double-clicks
- **THEN** the accumulated polygon is added to `projectStore` (as a zone or property boundary based on context)
- **THEN** `uiStore.drawingPreview` is cleared

#### Scenario: Click near first vertex closes and commits the polygon
- **WHEN** draw tool is active and user clicks within close-threshold of the first vertex
- **THEN** the polygon is committed and preview is cleared

#### Scenario: Escape cancels drawing in progress
- **WHEN** draw tool is active and user presses Escape
- **THEN** `uiStore.drawingPreview` is cleared without committing

---

### Requirement: Place tool places a feature at a clicked world position
The system SHALL, when the place tool is active, add a `PlacedFeature` to `projectStore` at the world position of the pointer click.

#### Scenario: Click places feature
- **WHEN** place tool is active with a selected feature template and user clicks the canvas
- **THEN** a new `PlacedFeature` is added to `projectStore.features` at the clicked world position

#### Scenario: Mouse move shows placement preview
- **WHEN** place tool is active and mouse moves over the canvas
- **THEN** `uiStore.drawingPreview` contains the feature icon position at the current cursor world position

---

### Requirement: Measure tool records a distance between two clicked world points
The system SHALL, when the measure tool is active, capture two world points on successive clicks and add a `Measurement` to `projectStore`.

#### Scenario: First click sets measurement start
- **WHEN** measure tool is active and user clicks
- **THEN** the clicked world point is stored as the measurement start in `uiStore.drawingPreview`

#### Scenario: Second click commits the measurement
- **WHEN** measure tool is active, a start point exists, and user clicks a second point
- **THEN** a `Measurement` with both endpoints is added to `projectStore.measurements`
- **THEN** `uiStore.drawingPreview` is cleared

#### Scenario: Mouse move between clicks shows live distance preview
- **WHEN** measure tool is active and a start point exists
- **THEN** `uiStore.drawingPreview` updates with the current cursor position so the renderer can show a live distance line
