## ADDED Requirements

### Requirement: Measure tool uses two-click flow
The measure tool SHALL use a two-click flow: first click sets the start point, second click saves the measurement. The tool SHALL remain active after saving for additional measurements.

#### Scenario: First click sets start point
- **WHEN** the user clicks on the canvas in measure mode with no measurement in progress
- **THEN** uiStore.measureStart SHALL be set to the world coordinates of the click (with grid snap if enabled)

#### Scenario: Second click saves measurement
- **WHEN** the user clicks on the canvas with measureStart set
- **THEN** a new Measurement SHALL be created with startPoint from measureStart and endPoint from the click, added to projectStore.measurements, and measureStart SHALL be cleared to null

#### Scenario: Tool stays active after saving
- **WHEN** a measurement is saved
- **THEN** activeTool SHALL remain 'measure' and the tool SHALL be ready for another measurement

#### Scenario: Escape cancels in-progress measurement
- **WHEN** the user presses Escape with measureStart set
- **THEN** measureStart SHALL be cleared to null without saving, the tool SHALL remain active

### Requirement: Distance is calculated as Euclidean distance in world units
The distance SHALL be computed as sqrt((dx)^2 + (dy)^2) where dx and dy are the differences in world coordinates.

#### Scenario: Distance calculation is correct
- **WHEN** a measurement spans from (0,0) to (3,4)
- **THEN** the distance SHALL be 5.0 world units

### Requirement: Imperial formatting shows feet and inches
When the project uses imperial units, distances SHALL be formatted as feet and inches.

#### Scenario: Standard feet and inches
- **WHEN** distance is 12.5 feet in imperial mode
- **THEN** the formatted string SHALL be "12' 6\""

#### Scenario: Inches only for sub-foot distances
- **WHEN** distance is 0.667 feet
- **THEN** the formatted string SHALL be "8\""

#### Scenario: Zero distance
- **WHEN** distance is 0 feet
- **THEN** the formatted string SHALL be "0\""

#### Scenario: Rounding overflow
- **WHEN** inches round to 12
- **THEN** feet SHALL increment by 1 and inches SHALL display as 0

### Requirement: Metric formatting shows meters or centimeters
When the project uses metric units, distances SHALL be formatted in meters or centimeters.

#### Scenario: Meters for distances >= 1m
- **WHEN** distance is 3.812 meters
- **THEN** the formatted string SHALL be "3.81m"

#### Scenario: Centimeters for distances < 1m
- **WHEN** distance is 0.45 meters
- **THEN** the formatted string SHALL be "45cm"

#### Scenario: Zero distance in metric
- **WHEN** distance is 0 meters
- **THEN** the formatted string SHALL be "0cm"

### Requirement: Measurement renderer draws dashed line with label
Each saved measurement SHALL render as a dashed line with crosshair endpoints and a formatted distance label at the midpoint.

#### Scenario: Measurement renders with correct styling
- **WHEN** a measurement exists and the measurements layer is visible
- **THEN** a dashed line (#E65100, lineWidth 2, dash [8,4]) SHALL connect start and end points, crosshair markers (6px) SHALL appear at each endpoint, and a distance label SHALL render at the midpoint with dark background and white text

#### Scenario: Selected measurement shows highlight
- **WHEN** a measurement is selected
- **THEN** lineWidth SHALL increase to 3 and a shadow glow (#FF6D00, blur 6) SHALL be applied

### Requirement: Live preview shows distance from start to cursor
While measureStart is set, a dashed line at 70% opacity SHALL extend from the start point to the cursor with a real-time distance label.

#### Scenario: Preview follows cursor
- **WHEN** measureStart is set and the cursor moves
- **THEN** a dashed line at globalAlpha 0.7 SHALL extend from measureStart to the cursor position with a continuously updating distance label

#### Scenario: Preview applies grid snap
- **WHEN** snapToGrid is enabled during live preview
- **THEN** the cursor position SHALL snap to the nearest grid intersection for both the preview line and distance calculation

### Requirement: Measurements are selectable and deletable
Measurements SHALL be selectable in select mode via perpendicular distance hit testing (5px threshold) and deletable via Delete/Backspace.

#### Scenario: Click near measurement line selects it
- **WHEN** the user clicks within 5 screen pixels of a measurement line in select mode
- **THEN** the measurement SHALL be selected

#### Scenario: Delete removes selected measurement
- **WHEN** the user presses Delete while a measurement is selected
- **THEN** the measurement SHALL be removed from projectStore.measurements and an undo snapshot SHALL be captured
