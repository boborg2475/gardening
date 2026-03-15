## ADDED Requirements

### Requirement: Grid renders with adaptive minor spacing
The system SHALL render a grid overlay where minor line spacing doubles progressively until lines are at least 10 screen pixels apart at the current zoom level.

#### Scenario: Spacing adapts at low zoom
- **WHEN** zoom is low enough that base spacing (1 world unit) would produce lines closer than 10px on screen
- **THEN** spacing doubles until each interval is ≥ 10 screen pixels

#### Scenario: Spacing unchanged at high zoom
- **WHEN** zoom is high enough that base spacing already produces ≥ 10px separation
- **THEN** base spacing is used without doubling

---

### Requirement: Grid renders major lines at regular intervals
The system SHALL draw visually distinct major grid lines every `majorEvery` minor intervals (default: every 5).

#### Scenario: Major lines at correct intervals
- **WHEN** the grid is rendered with `majorEvery: 5`
- **THEN** a major line appears at every 5th minor grid line
- **THEN** major lines use a darker stroke than minor lines

---

### Requirement: Grid is only drawn within the visible viewport
The system SHALL cull grid lines that fall outside the current viewport bounds.

#### Scenario: Off-screen lines not drawn
- **WHEN** a grid line's world coordinate is outside the visible world area
- **THEN** that line is not drawn on the canvas

---

### Requirement: Grid visibility is controlled by layer toggle
The system SHALL not render the grid when `uiStore.layerVisibility.grid` is `false`.

#### Scenario: Grid hidden when layer off
- **WHEN** `layerVisibility.grid` is `false`
- **THEN** no grid lines are drawn

#### Scenario: Grid visible when layer on
- **WHEN** `layerVisibility.grid` is `true`
- **THEN** grid lines are drawn

---

### Requirement: Property boundary renders as a closed polygon
The system SHALL render the project's property boundary vertices as a closed polygon stroke in world coordinates.

#### Scenario: Boundary drawn with correct vertices
- **WHEN** `projectStore.propertyBoundary` contains vertices
- **THEN** a closed polygon is drawn connecting those vertices in order

#### Scenario: Boundary visibility controlled by layer toggle
- **WHEN** `layerVisibility.propertyBoundary` is `false`
- **THEN** no boundary polygon is drawn

---

### Requirement: House renders as a filled rectangle
The system SHALL render the house footprint as a filled, optionally rotated rectangle.

#### Scenario: House drawn at correct position and size
- **WHEN** `projectStore.house` is defined with position, width, height, and rotation
- **THEN** a rectangle of the specified dimensions is drawn at the specified world position, rotated by the specified angle

#### Scenario: House visibility controlled by layer toggle
- **WHEN** `layerVisibility.house` is `false`
- **THEN** no house rectangle is drawn

---

### Requirement: Zones render as filled, stroked polygons
The system SHALL render each zone as a filled and stroked polygon using the zone's color.

#### Scenario: Zone fills with zone color
- **WHEN** a zone has vertices and a color
- **THEN** the polygon is filled with the zone color at reduced opacity and stroked with the zone color at full opacity

#### Scenario: Zones visibility controlled by layer toggle
- **WHEN** `layerVisibility.zones` is `false`
- **THEN** no zone polygons are drawn

---

### Requirement: Placed features render as icons at world position
The system SHALL render each placed feature using a canvas draw function at its world position, scaled to its defined size.

#### Scenario: Feature drawn at correct position
- **WHEN** a placed feature has a world position and size
- **THEN** its icon is drawn centered on that world position at the correct scale

#### Scenario: Features visibility controlled by layer toggle
- **WHEN** `layerVisibility.features` is `false`
- **THEN** no feature icons are drawn

---

### Requirement: Measurements render as lines with distance labels
The system SHALL render each measurement as a line segment between two world points with a text label showing the computed distance.

#### Scenario: Measurement line and label drawn
- **WHEN** a measurement has two endpoints
- **THEN** a line is drawn between them
- **THEN** a text label showing the distance (in project units) is drawn near the midpoint

#### Scenario: Measurements visibility controlled by layer toggle
- **WHEN** `layerVisibility.measurements` is `false`
- **THEN** no measurement lines or labels are drawn

---

### Requirement: Drawing preview renders active tool's in-progress shape
The system SHALL render a transient preview shape while the user is mid-draw, using the geometry stored in `uiStore.drawingPreview`.

#### Scenario: Preview visible during draw
- **WHEN** `uiStore.drawingPreview` contains partial geometry
- **THEN** that shape is rendered in a distinct preview style (dashed stroke, semi-transparent fill)

#### Scenario: No preview when idle
- **WHEN** `uiStore.drawingPreview` is `null`
- **THEN** no preview shape is rendered

---

### Requirement: Selection highlights render over selected objects
The system SHALL render a highlight overlay on each object whose ID is in `uiStore.selectedIds`.

#### Scenario: Selected zone highlighted
- **WHEN** a zone's ID is in `selectedIds`
- **THEN** a highlight ring or overlay is drawn on that zone on top of normal rendering

#### Scenario: No highlight when nothing selected
- **WHEN** `selectedIds` is empty
- **THEN** no highlight overlays are drawn

---

### Requirement: Render order is back-to-front
The system SHALL draw layers in the following fixed order: grid → property boundary → house → zones → features → measurements → drawing preview → selection highlights.

#### Scenario: Later layers appear on top
- **WHEN** multiple layers overlap the same screen area
- **THEN** layers drawn later in the order visually appear above layers drawn earlier
