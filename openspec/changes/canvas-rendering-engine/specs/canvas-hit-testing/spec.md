## ADDED Requirements

### Requirement: Hit test resolves a screen point to a domain object
The system SHALL provide a `hitTest(sx, sy): HitResult | null` method on `CanvasEngine` that converts the screen point to world coordinates and tests against all renderable objects, returning the topmost hit or `null`.

#### Scenario: Returns null on empty canvas
- **WHEN** `hitTest` is called at a position with no objects
- **THEN** it returns `null`

#### Scenario: Returns hit result for a zone
- **WHEN** the screen point maps to a world coordinate inside a zone polygon
- **THEN** `hitTest` returns `{ type: 'zone', id: zone.id, worldPoint: { x, y } }`

#### Scenario: Returns hit result for a placed feature
- **WHEN** the screen point maps to a world coordinate within a feature's bounding circle or rectangle
- **THEN** `hitTest` returns `{ type: 'feature', id: feature.id, worldPoint: { x, y } }`

---

### Requirement: Hit test precedence order is features > zones > property vertices > house > empty
The system SHALL test objects in precedence order and return the first match, so that smaller objects (features) take priority over larger containing shapes (zones).

#### Scenario: Feature wins over zone when both overlap
- **WHEN** a placed feature's bounds overlap a zone and the screen point hits both
- **THEN** `hitTest` returns a feature result, not a zone result

#### Scenario: Zone wins over house when both overlap
- **WHEN** a zone overlaps the house and the screen point hits both
- **THEN** `hitTest` returns a zone result, not a house result

---

### Requirement: Property boundary vertex hit detects within a tolerance radius
The system SHALL match a property boundary vertex when the screen point is within a configurable tolerance radius (default: 8 screen pixels) of the vertex's screen position.

#### Scenario: Vertex hit within tolerance
- **WHEN** the screen point is within 8px of a property boundary vertex's screen position
- **THEN** `hitTest` returns `{ type: 'propertyVertex', id: vertexIndex, worldPoint: { x, y } }`

#### Scenario: Vertex miss outside tolerance
- **WHEN** the screen point is more than 8px from the nearest property boundary vertex
- **THEN** the vertex is not returned as a hit

---

### Requirement: Hit test uses current viewport for coordinate conversion
The system SHALL use the current `panX`, `panY`, and `zoom` values from the viewport when converting screen to world coordinates for hit testing.

#### Scenario: Hit test is viewport-aware
- **WHEN** viewport is panned or zoomed
- **THEN** `hitTest` correctly identifies the object under the pointer at the new viewport state

---

### Requirement: Hit test only tests objects on visible layers
The system SHALL skip objects whose layer is toggled off in `uiStore.layerVisibility` when performing hit testing.

#### Scenario: Hidden zone is not hittable
- **WHEN** `layerVisibility.zones` is `false` and the pointer is over a zone
- **THEN** `hitTest` returns `null` (or the next match in precedence order)

#### Scenario: Visible feature is hittable even if zones are hidden
- **WHEN** `layerVisibility.zones` is `false` and `layerVisibility.features` is `true`
- **THEN** `hitTest` can still return a feature result
