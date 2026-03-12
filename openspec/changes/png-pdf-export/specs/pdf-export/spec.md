## ADDED Requirements

### Requirement: PDF export generates downloadable document with map
The system SHALL render the map to an offscreen canvas, create a jsPDF document, add the map image, and trigger download.

#### Scenario: PDF downloads with map image
- **WHEN** the user confirms PDF export options
- **THEN** a file named {sanitizedProjectName}.pdf SHALL download with the map fitted within page margins

### Requirement: PDF export options dialog provides configuration
The dialog SHALL offer page size (Letter/A4), orientation (Auto/Landscape/Portrait), include legend (checkbox), and include grid (checkbox).

#### Scenario: Auto orientation selects based on map aspect ratio
- **WHEN** "Auto" orientation is selected
- **THEN** landscape SHALL be used if map width > height, portrait otherwise

### Requirement: PDF includes project title and date header
The PDF SHALL include the project name as title (16pt bold) and export date (10pt) above the map image.

#### Scenario: Header renders correctly
- **WHEN** a PDF is exported
- **THEN** the project name and formatted date SHALL appear above the map image

#### Scenario: Long project name is truncated
- **WHEN** the project name exceeds 60 characters
- **THEN** it SHALL be truncated with ellipsis in the PDF title

### Requirement: PDF legend shows zone colors and names
When "Include legend" is checked and zones exist, a legend SHALL render below the map showing colored squares with zone names.

#### Scenario: Legend renders zone entries
- **WHEN** include legend is checked and zones exist
- **THEN** each zone SHALL appear with a colored square and name in the legend area

#### Scenario: No zones hides legend
- **WHEN** include legend is checked but no zones exist
- **THEN** the legend section SHALL be omitted
