## ADDED Requirements

### Requirement: JSON export downloads project as versioned .garden.json file
The system SHALL serialize the full ProjectState, wrap it in a versioned envelope with version number and export timestamp, and trigger a browser download.

#### Scenario: Export creates valid JSON file
- **WHEN** the user clicks "Export JSON" in the export menu
- **THEN** a file named `{sanitizedProjectName}.garden.json` SHALL download containing `{version: 1, exportedAt: ISO-8601, project: ProjectState}` with 2-space indentation

#### Scenario: Project name is sanitized in filename
- **WHEN** the project name contains special characters
- **THEN** non-alphanumeric characters (except hyphens and spaces) SHALL be replaced with hyphens in the filename

#### Scenario: Empty project exports successfully
- **WHEN** the project has no zones, features, or plantings
- **THEN** the export SHALL succeed with empty arrays in the JSON

### Requirement: JSON import creates new project from valid file
The system SHALL read a selected JSON file, validate its structure, generate a new project ID, and load the imported project.

#### Scenario: Valid file creates new project
- **WHEN** the user selects a valid .garden.json file for import
- **THEN** a new project SHALL be created with a new UUID, name appended with " (imported)", saved to IndexedDB, and loaded into projectStore

#### Scenario: Success toast shown on import
- **WHEN** a project is successfully imported
- **THEN** a toast notification SHALL display "Project imported successfully"

#### Scenario: Duplicate import creates separate projects
- **WHEN** the same file is imported twice
- **THEN** two separate projects SHALL be created, each with a unique ID

### Requirement: JSON import validates file structure
The system SHALL validate that imported JSON has the required envelope structure and project fields before creating a project.

#### Scenario: Invalid JSON shows parse error
- **WHEN** the selected file is not valid JSON
- **THEN** an error SHALL display "The selected file is not valid JSON" and no project SHALL be created

#### Scenario: Missing required fields shows field list
- **WHEN** the JSON is valid but missing required project fields
- **THEN** an error SHALL display "This file is missing required data: {fieldList}. It may not be a Garden Planner export."

#### Scenario: Newer version shows update message
- **WHEN** the file version is higher than the app supports
- **THEN** an error SHALL display "This file was created with a newer version of Garden Planner. Please update the app."

### Requirement: JSON import supports schema migration
The system SHALL run sequential migration functions when importing files with older schema versions.

#### Scenario: Older version file is migrated
- **WHEN** a file with version less than current is imported
- **THEN** migration functions SHALL run sequentially from file version to current version before creating the project

### Requirement: Export menu provides JSON export and import options
The toolbar SHALL include an export menu with options for exporting and importing JSON.

#### Scenario: Export menu shows JSON options
- **WHEN** the user opens the export menu
- **THEN** "Export JSON" and "Import JSON" options SHALL be visible

#### Scenario: Import opens file picker
- **WHEN** the user clicks "Import JSON"
- **THEN** a file picker dialog SHALL open accepting .json and .garden.json files
