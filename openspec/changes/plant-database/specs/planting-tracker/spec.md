## ADDED Requirements

### Requirement: Adding planting requires a selected zone
The "Add Planting" button SHALL only be available when a zone is selected.

#### Scenario: Add Planting enabled with zone selected
- **WHEN** a zone is selected
- **THEN** the "Add Planting" button SHALL be enabled and clicking it SHALL open the plant browser dialog

#### Scenario: No zone selected shows prompt
- **WHEN** no zone is selected
- **THEN** the planting panel SHALL show "Select a zone on the map to manage its plantings"

#### Scenario: No zones exist shows different prompt
- **WHEN** no zones exist in the project
- **THEN** the planting panel SHALL show "Create a zone first to start tracking plantings"

### Requirement: Planting saves with all required fields
A new Planting SHALL be created with UUID, zoneId from selected zone, plantId from browser selection, quantity (min 1), optional planting date, status (default "planned"), and notes.

#### Scenario: Save creates planting record
- **WHEN** the user completes the planting form and clicks Save
- **THEN** a Planting SHALL be added to projectStore.plantings with all form values and a generated UUID

#### Scenario: Quantity validates minimum
- **WHEN** the user enters a quantity less than 1 or a non-integer
- **THEN** the input SHALL be rejected

### Requirement: Planting panel lists plantings for selected zone
The planting panel SHALL show all plantings with zoneId matching the selected zone, each displaying plant name, quantity, status badge, and date.

#### Scenario: Panel shows zone's plantings
- **WHEN** a zone is selected and has plantings
- **THEN** each planting SHALL be displayed with common name, "x N" quantity, color-coded status badge, and planting date

#### Scenario: Status badge colors
- **WHEN** planting status badges are rendered
- **THEN** planned SHALL be gray, planted SHALL be blue, growing SHALL be green, harvested SHALL be amber, removed SHALL be red

#### Scenario: Empty zone shows prompt
- **WHEN** a zone is selected but has no plantings
- **THEN** "No plantings in this zone yet. Click 'Add Planting' to get started." SHALL be displayed

### Requirement: Planting status can be changed freely
Users SHALL be able to set any status value at any time without enforced progression.

#### Scenario: Status change saves immediately
- **WHEN** the user changes a planting's status dropdown
- **THEN** the status SHALL update in projectStore immediately and an undo snapshot SHALL be captured

#### Scenario: Backwards status change is allowed
- **WHEN** the user changes status from "harvested" back to "growing"
- **THEN** the change SHALL be accepted without restriction

### Requirement: Planting deletion removes from project store
Deleting a planting SHALL remove it after confirmation.

#### Scenario: Delete planting with confirmation
- **WHEN** the user clicks Delete on a planting and confirms
- **THEN** the planting SHALL be removed from projectStore.plantings and an undo snapshot SHALL be captured

### Requirement: Zone deletion cascades to remove plantings
Deleting a zone SHALL also remove all plantings with matching zoneId in a single atomic store action.

#### Scenario: Zone deletion removes associated plantings
- **WHEN** a zone with plantings is deleted
- **THEN** all plantings with zoneId matching the deleted zone SHALL be removed and a single undo snapshot SHALL capture both removals

### Requirement: plantingsForZone selector returns filtered results
The plantingsForZone(state, zoneId) selector SHALL return only plantings with matching zoneId.

#### Scenario: Selector filters correctly
- **WHEN** plantingsForZone is called with a specific zoneId
- **THEN** only plantings with that zoneId SHALL be returned

#### Scenario: Invalid zoneId returns empty array
- **WHEN** plantingsForZone is called with a non-existent zoneId
- **THEN** an empty array SHALL be returned
