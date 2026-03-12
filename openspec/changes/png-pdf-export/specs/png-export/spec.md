## ADDED Requirements

### Requirement: PNG export renders visible layers to downloadable image
The system SHALL render all visible layers to an offscreen canvas, convert to PNG blob, and trigger a browser download.

#### Scenario: PNG export downloads correctly
- **WHEN** the user confirms PNG export options
- **THEN** a file named {sanitizedProjectName}.png SHALL download containing all visible layers rendered at the selected scale

#### Scenario: Hidden layers excluded from export
- **WHEN** a layer is hidden in the viewport
- **THEN** that layer SHALL NOT be rendered in the exported PNG

### Requirement: PNG export options dialog provides configuration
The options dialog SHALL offer include grid (checkbox), background (white/transparent), and scale (1x/2x/3x) settings.

#### Scenario: Include grid option controls grid rendering
- **WHEN** "Include grid" is checked
- **THEN** the grid SHALL be rendered in the export regardless of viewport layer state

#### Scenario: Transparent background option
- **WHEN** "Transparent" background is selected
- **THEN** the PNG SHALL have a transparent background

#### Scenario: Scale option controls resolution
- **WHEN** 2x scale is selected
- **THEN** the offscreen canvas SHALL be rendered at 2x pixel density

### Requirement: Large canvas is clamped to browser maximum
If the computed canvas size exceeds the browser's maximum (typically 16384px), the system SHALL clamp the size and adjust scale downward.

#### Scenario: Canvas clamped with warning
- **WHEN** the computed canvas exceeds browser limits
- **THEN** the size SHALL be clamped, scale adjusted, and a warning SHALL be shown
