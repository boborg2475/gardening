## ADDED Requirements

### Requirement: Draw tool state machine manages polygon creation
The draw tool SHALL implement a finite state machine with three states: IDLE (waiting for first click), DRAWING (vertices being placed), and COMPLETE (polygon finalized). State transitions SHALL be driven by canvas pointer events and keyboard input.

#### Scenario: First click transitions from IDLE to DRAWING
- **WHEN** the user clicks on the canvas while a draw tool is active and the state is IDLE
- **THEN** the click position is converted to world coordinates and stored as the first vertex in `uiStore.drawingPoints`, and the state transitions to DRAWING

#### Scenario: Subsequent clicks append vertices in DRAWING state
- **WHEN** the user clicks on the canvas while the state is DRAWING
- **THEN** the click position (world coordinates) is appended to `uiStore.drawingPoints` and the canvas re-renders showing the new vertex and connecting edge

#### Scenario: Escape cancels drawing and returns to IDLE
- **WHEN** the user presses Escape while a draw tool is active
- **THEN** `uiStore.drawingPoints` SHALL be cleared to `[]`, `uiStore.activeTool` SHALL be set to `'select'`, and all preview rendering SHALL be removed

### Requirement: Double-click completes polygon with 3+ vertices
The draw tool SHALL finalize the polygon when the user double-clicks and at least 3 vertices have been placed. The second click of the double-click SHALL NOT add a duplicate vertex.

#### Scenario: Double-click with 3+ vertices completes polygon
- **WHEN** the user double-clicks on the canvas while DRAWING and `drawingPoints.length >= 3`
- **THEN** the polygon is finalized from the current `drawingPoints`, saved to projectStore via the appropriate action, `drawingPoints` is cleared, and `activeTool` is set to `'select'`

#### Scenario: Double-click with fewer than 3 vertices continues drawing
- **WHEN** the user double-clicks while DRAWING and `drawingPoints.length < 3` (after the first click of the double-click)
- **THEN** the double-click is treated as a regular click (vertex may be added), and drawing continues without completing

### Requirement: Click near first vertex closes polygon
The draw tool SHALL complete the polygon when the user clicks within 10 screen pixels of the first vertex and at least 3 vertices exist. The closing click SHALL NOT be added as an additional vertex.

#### Scenario: Click within 10px of first vertex with 3+ vertices completes polygon
- **WHEN** the user clicks within 10 screen pixels of `drawingPoints[0]` and `drawingPoints.length >= 3`
- **THEN** the polygon is finalized and saved identically to double-click completion

#### Scenario: Click near first vertex with fewer than 3 vertices adds vertex normally
- **WHEN** the user clicks near the first vertex but `drawingPoints.length < 3`
- **THEN** the click is treated as a regular vertex placement

### Requirement: Vertices snap to grid when snap is enabled
When `uiStore.snapToGrid` is true, placed vertices SHALL snap to the nearest grid intersection if within 0.5 world units. If the distance exceeds 0.5 units, the raw world coordinate SHALL be used.

#### Scenario: Click within snap threshold snaps to grid
- **WHEN** a vertex is placed with `snapToGrid === true` and the nearest grid intersection is within 0.5 world units
- **THEN** the stored vertex position SHALL be the grid intersection coordinates

#### Scenario: Click outside snap threshold uses raw coordinates
- **WHEN** a vertex is placed with `snapToGrid === true` but the nearest grid intersection is farther than 0.5 world units
- **THEN** the stored vertex position SHALL be the raw world coordinates of the click

### Requirement: Draw preview renders live feedback during drawing
While the draw tool is in DRAWING state, the canvas SHALL render a live preview on every animation frame showing completed edges, a rubber-band line to the cursor, and a closing hint.

#### Scenario: Preview shows solid edges between placed vertices
- **WHEN** `drawingPoints` has 2 or more vertices
- **THEN** solid lines SHALL connect consecutive vertices with a 2px screen-width stroke

#### Scenario: Preview shows dashed rubber-band line to cursor
- **WHEN** `drawingPoints` has 1 or more vertices and the cursor is on the canvas
- **THEN** a dashed line SHALL extend from the last vertex to the current cursor position at 70% opacity

#### Scenario: Preview shows closing hint with 3+ vertices
- **WHEN** `drawingPoints` has 3 or more vertices
- **THEN** a dashed line at 30% opacity SHALL extend from the cursor position to the first vertex

#### Scenario: First vertex renders larger than subsequent vertices
- **WHEN** vertices are rendered during drawing preview
- **THEN** the first vertex SHALL have a 6px radius and subsequent vertices SHALL have a 4px radius, all rendered as white-filled circles with a colored stroke

### Requirement: Activating a draw tool sets UI state correctly
When the user activates a draw tool from the toolbar, `uiStore.activeTool` SHALL be set to the corresponding tool name, `drawingPoints` SHALL be cleared, and any prior selection SHALL be cleared.

#### Scenario: Activating draw-property tool
- **WHEN** the user clicks the "Draw Property" toolbar button
- **THEN** `uiStore.activeTool` SHALL be `'draw-property'`, `drawingPoints` SHALL be `[]`, and selection SHALL be cleared

#### Scenario: Toggling off an active draw tool
- **WHEN** the user clicks the toolbar button for the currently active draw tool
- **THEN** `uiStore.activeTool` SHALL be set to `'select'` and `drawingPoints` SHALL be cleared
