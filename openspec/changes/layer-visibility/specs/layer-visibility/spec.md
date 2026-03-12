## ADDED Requirements

### Requirement: All layers default to visible on app load
The uiStore.layers object SHALL initialize with all layer flags set to true.

#### Scenario: Initial layer state
- **WHEN** the app initializes
- **THEN** uiStore.layers SHALL be { grid: true, property: true, house: true, zones: true, features: true, measurements: true }

### Requirement: Toggle layer flips visibility
The toggleLayer action SHALL flip the boolean for the specified layer key.

#### Scenario: Toggle grid off then on
- **WHEN** toggleLayer('grid') is called twice
- **THEN** layers.grid SHALL change from true to false, then back to true

### Requirement: Hidden layers are not rendered
When a layer's flag is false, its renderer SHALL skip all drawing and produce no canvas output.

#### Scenario: Grid hidden stops grid rendering
- **WHEN** layers.grid is false
- **THEN** the grid renderer SHALL not execute any draw calls

#### Scenario: Zones hidden stops all zone rendering
- **WHEN** layers.zones is false
- **THEN** no zone polygons, fills, labels, or vertex handles SHALL be rendered

### Requirement: Hidden layer objects are not hit-testable
Objects on hidden layers SHALL be excluded from hit testing and cannot be selected.

#### Scenario: Hidden zone cannot be selected
- **WHEN** layers.zones is false and the user clicks where a zone polygon exists
- **THEN** the zone SHALL NOT be selected; if a visible object exists beneath it, that object SHALL be selected instead

#### Scenario: All layers hidden means no selection possible
- **WHEN** all layers are hidden and the user clicks on the canvas
- **THEN** no object SHALL be selected

### Requirement: Layer panel displays toggles for all layers
The layer panel SHALL show a row for each layer with an eye icon, layer name, and toggle switch.

#### Scenario: Layer panel shows all layers
- **WHEN** the layer panel is rendered
- **THEN** rows SHALL appear for Grid, Property, House, Zones, Features, and Measurements in render order (bottom to top)

#### Scenario: Clicking toggle changes layer visibility
- **WHEN** the user clicks a layer toggle in the panel
- **THEN** uiStore.toggleLayer SHALL be called for that layer and the toggle SHALL reflect the new state

#### Scenario: Eye icon reflects visibility state
- **WHEN** a layer is visible
- **THEN** the eye icon SHALL show as open; when hidden, it SHALL show as closed/crossed-out
