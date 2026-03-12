## ADDED Requirements

### Requirement: Selecting template activates place-feature tool
Clicking a template in the catalog SHALL set activeTool to 'place-feature' and placingTemplateId to the template's id.

#### Scenario: Template click activates placement mode
- **WHEN** the user clicks a template in the catalog
- **THEN** uiStore.activeTool SHALL be 'place-feature' and uiStore.placingTemplateId SHALL be the template's id

### Requirement: Ghost preview follows cursor in placement mode
While place-feature is active, a semi-transparent preview of the feature SHALL follow the cursor on the canvas.

#### Scenario: Ghost renders at cursor position
- **WHEN** the cursor moves over the canvas in place-feature mode
- **THEN** the template's drawIcon SHALL render at the cursor's world position at ~50% opacity with default dimensions

### Requirement: Click places feature at world coordinates
Clicking the canvas in place-feature mode SHALL create a new PlacedFeature at the clicked world position.

#### Scenario: Click creates placed feature
- **WHEN** the user clicks on the canvas in place-feature mode
- **THEN** a new PlacedFeature SHALL be created with a UUID, the template's id, click world position as center, template default dimensions, rotation 0, and empty notes

#### Scenario: Tool stays active for multiple placements
- **WHEN** a feature is placed
- **THEN** the tool SHALL remain in place-feature mode with the same template for additional placements

### Requirement: Escape exits placement mode
Pressing Escape SHALL exit place-feature mode and return to select tool.

#### Scenario: Escape cancels placement
- **WHEN** the user presses Escape in place-feature mode
- **THEN** activeTool SHALL be set to 'select' and placingTemplateId SHALL be cleared to null

### Requirement: Feature renderer draws all placed features
Each placed feature SHALL be rendered by looking up its template and calling drawIcon with the feature's position and dimensions.

#### Scenario: Features render using template drawIcon
- **WHEN** placed features exist in projectStore.features
- **THEN** each SHALL be rendered by calling its template's drawIcon at full opacity

#### Scenario: Unknown templateId renders fallback
- **WHEN** a placed feature references a templateId not found in the catalog
- **THEN** a fallback rectangle with a question mark SHALL be rendered

### Requirement: Feature selection uses bounding rectangle hit test
Clicking on a feature in select mode SHALL select it using axis-aligned bounding rectangle hit testing in reverse z-order.

#### Scenario: Click inside bounding rect selects feature
- **WHEN** the user clicks within a feature's bounding rectangle in select mode
- **THEN** the feature SHALL be selected and show a selection rectangle with handles

#### Scenario: Overlapping features select topmost
- **WHEN** features overlap and the user clicks in the overlap area
- **THEN** the topmost feature (last in array) SHALL be selected

### Requirement: Selected feature can be dragged to move
Dragging a selected feature SHALL move it to a new position.

#### Scenario: Drag moves feature
- **WHEN** the user drags a selected feature
- **THEN** the feature's position SHALL update in real time and the final position SHALL be committed on mouseup

### Requirement: Delete key removes selected feature
Pressing Delete or Backspace SHALL remove the selected feature from projectStore.

#### Scenario: Delete removes feature
- **WHEN** the user presses Delete while a feature is selected
- **THEN** the feature SHALL be removed from projectStore.features and selection SHALL be cleared

### Requirement: Feature detail panel shows editable properties
When a feature is selected, the sidebar SHALL show its template info, position, editable size, notes, and a delete button.

#### Scenario: Detail panel shows feature properties
- **WHEN** a feature is selected
- **THEN** the panel SHALL display template icon, name, position (read-only), width/height (editable), notes (editable), and delete button

#### Scenario: Size changes update feature
- **WHEN** the user changes width or height in the detail panel
- **THEN** the feature's dimensions SHALL update in projectStore and the canvas SHALL re-render
