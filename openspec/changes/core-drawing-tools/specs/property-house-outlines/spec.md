## ADDED Requirements

### Requirement: Property boundary saves as single polygon
Completing a polygon while `activeTool === 'draw-property'` SHALL save the points to `projectStore.propertyBoundary`. If a property boundary already exists, it SHALL be replaced.

#### Scenario: First property boundary is saved
- **WHEN** the user completes a polygon with the draw-property tool and no property boundary exists
- **THEN** `projectStore.propertyBoundary` SHALL be set to the completed `Point[]`

#### Scenario: Existing property boundary is replaced
- **WHEN** the user completes a new property polygon and a property boundary already exists
- **THEN** the old boundary SHALL be overwritten with the new polygon points

### Requirement: House outline saves as single polygon
Completing a polygon while `activeTool === 'draw-house'` SHALL save the points to `projectStore.houseOutline`. The house outline is independent of the property boundary.

#### Scenario: House outline saves independently
- **WHEN** the user completes a polygon with the draw-house tool
- **THEN** `projectStore.houseOutline` SHALL be set to the completed `Point[]`, regardless of whether a property boundary exists

#### Scenario: House outline can extend beyond property boundary
- **WHEN** the user draws a house outline that extends beyond the property boundary
- **THEN** the house outline SHALL be saved without validation against the property boundary

### Requirement: Property boundary renders with blue styling
The property renderer SHALL draw the property boundary as a closed polygon with blue stroke (`#3B82F6`, 2px), blue fill at 10% opacity, and render below all elements except the grid.

#### Scenario: Property boundary renders on canvas
- **WHEN** `projectStore.propertyBoundary` contains points and the property layer is visible
- **THEN** the polygon SHALL render with `#3B82F6` stroke (2px), `rgba(59, 130, 246, 0.10)` fill, as a closed path

#### Scenario: Selected property boundary shows enhanced styling
- **WHEN** `uiStore.selectedType === 'property'`
- **THEN** stroke width SHALL increase to 3px, vertex handles SHALL render as 6x6px white-filled squares with blue stroke, and a selection glow SHALL be visible

### Requirement: House outline renders with gray styling and label
The house renderer SHALL draw the house outline as a closed polygon with dark gray stroke (`#374151`, 2px), gray fill at 50% opacity, and a "House" text label at the polygon centroid.

#### Scenario: House outline renders on canvas
- **WHEN** `projectStore.houseOutline` contains points and the house layer is visible
- **THEN** the polygon SHALL render with `#374151` stroke (2px), `rgba(107, 114, 128, 0.50)` fill, as a closed path

#### Scenario: House label renders at centroid
- **WHEN** the house outline is rendered
- **THEN** the text "House" SHALL render at the polygon centroid in 14px sans-serif, `#1F2937`, centered horizontally and vertically

#### Scenario: Concave house polygon uses interior point for label
- **WHEN** the house outline is a concave polygon whose arithmetic centroid falls outside the polygon
- **THEN** the label SHALL be placed at a pole-of-inaccessibility point guaranteed to be inside the polygon

#### Scenario: Selected house outline shows enhanced styling
- **WHEN** `uiStore.selectedType === 'house'`
- **THEN** stroke width SHALL increase to 3px with vertex handles as 6x6px white-filled squares with dark gray stroke

### Requirement: Property and house rendering order is correct
The property boundary SHALL render above the grid but below zones and the house. The house SHALL render above zones but below features.

#### Scenario: Rendering order is maintained
- **WHEN** property boundary, house outline, and zones all exist
- **THEN** render order from bottom to top SHALL be: grid → property → zones → house → features

### Requirement: Property and house vertices are draggable in select mode
In select mode, clicking within 8 screen pixels of a vertex of the selected property boundary or house outline SHALL initiate a vertex drag. The vertex SHALL follow the cursor with grid snap applied if enabled.

#### Scenario: Vertex drag reshapes property boundary
- **WHEN** the user drags a property boundary vertex to a new position
- **THEN** `projectStore.propertyBoundary[vertexIndex]` SHALL update to the new world coordinates on each mousemove, and the polygon SHALL re-render in real time

#### Scenario: Vertex drag applies grid snap
- **WHEN** a vertex is dragged with `snapToGrid === true`
- **THEN** the vertex position SHALL snap to the nearest grid intersection if within 0.5 world units

#### Scenario: Self-intersecting drag is rejected
- **WHEN** a vertex drag would cause the polygon to self-intersect
- **THEN** the vertex SHALL revert to its pre-drag position on mouseup

### Requirement: Click on property or house polygon selects it
In select mode, clicking inside the property boundary or house outline polygon SHALL select it. Hit testing SHALL use ray-casting point-in-polygon.

#### Scenario: Click inside property boundary selects it
- **WHEN** the user clicks inside the property boundary polygon in select mode
- **THEN** `uiStore.selectedType` SHALL be set to `'property'` and `uiStore.selectedId` SHALL be `null`

#### Scenario: Click inside house outline selects it
- **WHEN** the user clicks inside the house outline polygon in select mode
- **THEN** `uiStore.selectedType` SHALL be set to `'house'` and `uiStore.selectedId` SHALL be `null`

#### Scenario: Click outside all polygons clears selection
- **WHEN** the user clicks on empty canvas area in select mode
- **THEN** `uiStore.selectedType` and `uiStore.selectedId` SHALL be set to `null`

### Requirement: Point-in-polygon hit testing works for concave polygons
The hit test algorithm SHALL use ray-casting and correctly handle concave polygons. Points on polygon edges SHALL be treated as inside.

#### Scenario: Concave polygon hit test is correct
- **WHEN** a point-in-polygon test is performed on a concave polygon (e.g., L-shape)
- **THEN** points in concave bays SHALL be correctly identified as outside, and points in the polygon interior SHALL be correctly identified as inside

#### Scenario: Edge points are treated as inside
- **WHEN** a click falls exactly on a polygon edge
- **THEN** the hit test SHALL return true (inside)

### Requirement: Toolbar provides draw-property and draw-house buttons
The toolbar SHALL include buttons to activate the draw-property and draw-house tools. Active tool buttons SHALL show a visually distinct pressed/active state.

#### Scenario: Draw property button activates drawing mode
- **WHEN** the user clicks the "Draw Property" toolbar button
- **THEN** `uiStore.activeTool` SHALL be set to `'draw-property'` and the button SHALL show an active state

#### Scenario: Draw house button activates drawing mode
- **WHEN** the user clicks the "Draw House" toolbar button
- **THEN** `uiStore.activeTool` SHALL be set to `'draw-house'` and the button SHALL show an active state
