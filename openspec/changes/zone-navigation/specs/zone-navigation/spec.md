## ADDED Requirements

### Requirement: Zones support hierarchical nesting via parentZoneId
Each Zone SHALL have an optional parentZoneId (null for top-level) and a children array of child zone IDs.

#### Scenario: Top-level zone has null parentZoneId
- **WHEN** a zone is created at the property level
- **THEN** its parentZoneId SHALL be null

#### Scenario: Sub-zone references parent
- **WHEN** a zone is created inside a zone view
- **THEN** its parentZoneId SHALL be set to the current view zone's id

### Requirement: Users can dive into a zone to view sub-zones
A "View Zone" action SHALL push the zone's id onto the navigation stack and re-render the canvas in zone view.

#### Scenario: View Zone enters zone view
- **WHEN** the user activates "View Zone" on a selected zone
- **THEN** the zone id SHALL be pushed onto zoneNavigationStack, the camera SHALL auto-fit to the zone's bounding box, and only sub-zones SHALL be rendered

#### Scenario: Parent renders as fixed frame
- **WHEN** inside a zone view
- **THEN** the parent zone's boundary SHALL render as a non-interactive border

### Requirement: Breadcrumb bar shows navigation path
A breadcrumb bar SHALL display the navigation path with clickable segments.

#### Scenario: Breadcrumb shows full path
- **WHEN** the user is 2 levels deep
- **THEN** the breadcrumb SHALL show "Property > Zone A > Zone B" with each segment clickable

#### Scenario: Clicking breadcrumb segment jumps to level
- **WHEN** the user clicks a breadcrumb segment
- **THEN** the navigation stack SHALL be truncated to that level and the canvas SHALL re-render

### Requirement: Back button navigates up one level
A back button SHALL be visible when inside a zone view and pop the navigation stack.

#### Scenario: Back button returns to parent
- **WHEN** the user clicks the back button
- **THEN** the top zone id SHALL be popped from the stack and the canvas SHALL re-render at the parent level

### Requirement: Sub-zone drawing is clipped to parent boundary
When drawing zones inside a zone view, the drawn polygon SHALL be fully contained within the parent zone's boundary.

#### Scenario: Vertex outside parent is rejected
- **WHEN** the user places a vertex outside the parent zone's boundary during sub-zone drawing
- **THEN** the vertex SHALL be clipped or rejected to ensure containment

### Requirement: Deleting a zone with sub-zones cascades
Deleting a zone that has descendants SHALL remove all descendant zones and their plantings.

#### Scenario: Delete with sub-zones shows confirmation
- **WHEN** the user deletes a zone that has sub-zones
- **THEN** a confirmation dialog SHALL appear mentioning the descendant count

#### Scenario: Confirmed deletion removes all descendants
- **WHEN** the user confirms deletion of a zone with sub-zones
- **THEN** all descendant zones and their plantings SHALL be removed in a single undo snapshot
