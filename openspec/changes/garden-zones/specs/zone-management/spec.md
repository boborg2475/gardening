## ADDED Requirements

### Requirement: Zone drawing activates via draw-zone tool
The draw-zone tool SHALL use the same polygon state machine as draw-property/draw-house. Activating it SHALL set `uiStore.activeTool` to `'draw-zone'` and clear any existing selection and drawing points.

#### Scenario: Activating draw-zone from toolbar
- **WHEN** the user clicks the "Draw Zone" toolbar button or "Add Zone" in the zone panel
- **THEN** `uiStore.activeTool` SHALL be set to `'draw-zone'`, `drawingPoints` SHALL be cleared, and selection SHALL be cleared

#### Scenario: Zone drawing uses green preview color
- **WHEN** the draw-zone tool is active and vertices are being placed
- **THEN** preview lines and vertex indicators SHALL use green (#10B981) as the stroke color

### Requirement: Zone polygon completion opens metadata dialog
When a polygon is completed while `activeTool === 'draw-zone'`, the system SHALL hold the polygon points in a temporary buffer and open a metadata dialog instead of immediately saving to projectStore.

#### Scenario: Double-click completes zone polygon and opens dialog
- **WHEN** the user double-clicks with 3+ vertices while draw-zone is active
- **THEN** `drawingPoints` SHALL be cleared, the polygon points SHALL be held in a temporary buffer, and a modal metadata dialog SHALL open

#### Scenario: Cancel in metadata dialog discards zone
- **WHEN** the user clicks Cancel in the zone metadata dialog
- **THEN** the temporary polygon SHALL be discarded, no zone SHALL be created, and `activeTool` SHALL be set to `'select'`

### Requirement: Zone metadata dialog provides configuration fields
The metadata dialog SHALL contain fields for name, color, soil type, sun exposure, and notes with sensible defaults.

#### Scenario: Default name auto-increments
- **WHEN** the metadata dialog opens
- **THEN** the name field SHALL be pre-populated with "Zone N" where N equals `projectStore.zones.length + 1`

#### Scenario: Default color follows palette rotation
- **WHEN** the metadata dialog opens
- **THEN** the color field SHALL default to the palette color at index `zones.length % 8` from the rotation palette (#10B981, #F59E0B, #8B5CF6, #EF4444, #3B82F6, #EC4899, #14B8A6, #F97316)

#### Scenario: Save creates zone with all metadata
- **WHEN** the user clicks Save in the metadata dialog
- **THEN** a new Zone SHALL be created with a UUID, the drawn polygon points, and all dialog field values, added to `projectStore.zones`, and the zone SHALL be automatically selected

### Requirement: Zone renderer draws colored semi-transparent polygons
Each zone SHALL render as a filled polygon with its color at 25% opacity, a stroke darkened 20% from the zone color at 2px width, and a name label at the centroid.

#### Scenario: Zone renders with correct styling
- **WHEN** a zone exists in projectStore.zones and the zones layer is visible
- **THEN** the zone SHALL render with `zone.color` at 25% opacity fill, stroke darkened 20%, 2px stroke width, as a closed path

#### Scenario: Zone name renders at centroid
- **WHEN** a zone is rendered
- **THEN** the zone name SHALL render at the polygon centroid in 13px bold sans-serif, colored 40% darker than the zone color, centered horizontally and vertically

#### Scenario: Small zones hide label
- **WHEN** a zone's bounding box is less than 40px on screen in either dimension
- **THEN** the zone name label SHALL be hidden

#### Scenario: Zones render in array order
- **WHEN** multiple zones exist
- **THEN** zones SHALL render in array order (index 0 = bottom, last index = top), all above the property boundary but below the house outline

### Requirement: Zone selection uses point-in-polygon in reverse order
Clicking inside a zone polygon in select mode SHALL select that zone. When zones overlap, the topmost zone (highest array index) SHALL be selected.

#### Scenario: Click inside zone selects it
- **WHEN** the user clicks inside a zone polygon in select mode
- **THEN** `uiStore.selectedId` SHALL be set to the zone's id and `uiStore.selectedType` SHALL be `'zone'`

#### Scenario: Overlapping zones select topmost
- **WHEN** the user clicks in an area where multiple zones overlap
- **THEN** the zone with the highest array index (tested first in reverse order) SHALL be selected

#### Scenario: Click outside all zones clears selection
- **WHEN** the user clicks on empty canvas in select mode (outside all zone polygons)
- **THEN** selection SHALL be cleared

### Requirement: Selected zone shows vertex handles and supports editing
When a zone is selected, vertex handles SHALL appear at each polygon vertex. Vertices SHALL be draggable to reshape the zone, and dragging the interior SHALL move the entire zone.

#### Scenario: Selected zone shows vertex handles
- **WHEN** a zone is selected
- **THEN** 7x7px white-filled square handles with zone-colored stroke SHALL appear at each vertex, and stroke width SHALL increase to 3px with a 40% opacity selection highlight

#### Scenario: Dragging vertex reshapes zone
- **WHEN** the user drags a vertex handle of a selected zone
- **THEN** the vertex SHALL follow the cursor with grid snap applied, the polygon SHALL update in real time, and self-intersection SHALL be prevented

#### Scenario: Dragging zone interior moves entire zone
- **WHEN** the user drags inside a selected zone but not on a vertex handle
- **THEN** all vertices SHALL translate by the cursor's world-space delta, preserving polygon shape, with grid snap applied to the displacement delta

### Requirement: Zone panel lists all zones with metadata summary
The zone panel in the sidebar SHALL display all zones with color swatch, name, soil type, sun exposure, and planting count.

#### Scenario: Zone panel shows all zones
- **WHEN** the sidebar zone panel is rendered and zones exist
- **THEN** each zone SHALL be displayed as a row with a 16x16px color swatch, zone name, soil type, sun exposure, and planting count

#### Scenario: Empty state shows prompt
- **WHEN** no zones exist
- **THEN** the panel SHALL show "No zones yet. Click 'Add Zone' to define a planting area." with an Add Zone button

#### Scenario: Clicking zone row selects it
- **WHEN** the user clicks a zone row in the panel
- **THEN** the zone SHALL be selected on the canvas and the canvas SHALL pan to center the zone if off-screen

#### Scenario: Dragging zone rows reorders zones
- **WHEN** the user drags a zone row to a new position in the list
- **THEN** `projectStore.reorderZones` SHALL be called, changing the render order

### Requirement: Zone deletion cascades to remove associated plantings
Deleting a zone SHALL remove all plantings with matching zoneId. If plantings exist, a confirmation dialog SHALL appear first.

#### Scenario: Delete zone without plantings removes immediately
- **WHEN** the user deletes a zone that has zero associated plantings
- **THEN** the zone SHALL be removed from projectStore.zones immediately without confirmation, and selection SHALL be cleared

#### Scenario: Delete zone with plantings shows confirmation
- **WHEN** the user triggers deletion of a zone that has associated plantings
- **THEN** a confirmation dialog SHALL appear with message 'Delete "{zone.name}" and its N planting(s)?' with Cancel (default focus) and Delete (red) buttons

#### Scenario: Confirming deletion removes zone and plantings
- **WHEN** the user confirms zone deletion in the dialog
- **THEN** all plantings with matching zoneId SHALL be removed, the zone SHALL be removed, selection SHALL be cleared, and both operations SHALL be captured as a single undo snapshot
