## ADDED Requirements

### Requirement: Project list panel

The application SHALL provide a `ProjectListPanel` sidebar panel that displays all saved projects. The panel SHALL be accessible via a `'projects'` entry in the `PanelType` type and navigable from the sidebar.

#### Scenario: Viewing the project list

- **WHEN** the user activates the `'projects'` panel in the sidebar
- **THEN** the application SHALL display a list of all saved projects, ordered by `updatedAt` descending (most recently modified first)
- **AND** each project row SHALL display the project name and a human-readable last-modified date

#### Scenario: Current project indication

- **WHEN** the project list is displayed
- **THEN** the currently active project SHALL be visually distinguished from other projects (e.g., highlighted row or active indicator)

### Requirement: Create new project

The application SHALL allow users to create a new project from the project list panel.

#### Scenario: Creating a new project

- **WHEN** the user clicks the "New Project" button in the project list panel
- **THEN** the application SHALL save the current project to IndexedDB
- **AND** the application SHALL create a new project with default state (name "Untitled Project", empty boundary/house/zones/features/plantings/measurements, imperial units)
- **AND** the application SHALL load the new project into the `projectStore`
- **AND** the application SHALL clear the undo/redo history
- **AND** the application SHALL set the new project as the last-used project
- **AND** the project list SHALL update to include the new project

### Requirement: Switch project

The application SHALL allow users to switch between projects.

#### Scenario: Switching to a different project

- **WHEN** the user clicks on a project row that is not the currently active project
- **THEN** the application SHALL set `projectSwitching` to `true` on `uiStore`
- **AND** the application SHALL save the current project to IndexedDB (explicit save, not debounced)
- **AND** the application SHALL load the selected project data from IndexedDB into `projectStore`
- **AND** the application SHALL clear the undo/redo history
- **AND** the application SHALL update the last-used project ID to the selected project
- **AND** the application SHALL set `projectSwitching` to `false` on `uiStore`

#### Scenario: Switching to the already-active project

- **WHEN** the user clicks on the project row for the currently active project
- **THEN** the application SHALL NOT perform any save/load operations

#### Scenario: Save failure during switch

- **WHEN** a project switch is initiated and the save of the current project fails
- **THEN** the application SHALL abort the switch
- **AND** the application SHALL set `projectSwitching` to `false`
- **AND** the application SHALL display an error message to the user

### Requirement: Delete project

The application SHALL allow users to delete a project with a confirmation step.

#### Scenario: Initiating project deletion

- **WHEN** the user clicks the delete action on a project row
- **THEN** the application SHALL display a confirmation dialog asking the user to confirm deletion
- **AND** the dialog SHALL include the project name being deleted

#### Scenario: Confirming project deletion

- **WHEN** the user confirms the deletion in the confirmation dialog
- **THEN** the application SHALL remove the project from IndexedDB via `projectRepo.deleteProject`
- **AND** the project list SHALL update to remove the deleted project

#### Scenario: Deleting the currently active project

- **WHEN** the user confirms deletion of the currently active project
- **THEN** the application SHALL delete the project from IndexedDB
- **AND** if other projects exist, the application SHALL switch to the most recently modified remaining project
- **AND** if no other projects exist, the application SHALL create and load a new default project

#### Scenario: Canceling project deletion

- **WHEN** the user cancels the deletion in the confirmation dialog
- **THEN** the application SHALL dismiss the dialog and make no changes

### Requirement: Rename project

The application SHALL allow users to rename a project via inline editing in the project list.

#### Scenario: Initiating a rename

- **WHEN** the user double-clicks (or activates the rename action on) a project name in the project list
- **THEN** the project name SHALL become an editable text input pre-filled with the current name

#### Scenario: Committing a rename

- **WHEN** the user presses Enter or the rename input loses focus
- **THEN** the application SHALL update the project name in `projectStore` (if it is the active project) or directly in IndexedDB (if it is a different project)
- **AND** the application SHALL update the `updatedAt` timestamp
- **AND** the project list SHALL reflect the new name

#### Scenario: Canceling a rename

- **WHEN** the user presses Escape while the rename input is active
- **THEN** the application SHALL revert the input to the original name and exit edit mode

#### Scenario: Empty name validation

- **WHEN** the user attempts to commit a rename with an empty or whitespace-only name
- **THEN** the application SHALL revert to the original name and NOT save the change

### Requirement: Last-used project auto-load on startup

The application SHALL automatically load the last-used project when the app starts.

#### Scenario: Startup with existing last-used project

- **WHEN** the application starts and a `lastProjectId` exists in the meta table
- **AND** a project with that ID exists in IndexedDB
- **THEN** the application SHALL load that project into the `projectStore`

#### Scenario: Startup with stale last-used project

- **WHEN** the application starts and a `lastProjectId` exists in the meta table
- **AND** no project with that ID exists in IndexedDB
- **THEN** the application SHALL create and load a new default project
- **AND** the application SHALL set the new project as the last-used project

#### Scenario: First launch with no projects

- **WHEN** the application starts and no `lastProjectId` exists and no projects exist in IndexedDB
- **THEN** the application SHALL create and load a new default project
- **AND** the application SHALL set the new project as the last-used project

### Requirement: UI blocking during project switch

The application SHALL prevent user interactions during a project switch operation.

#### Scenario: Interactions while switching

- **WHEN** `projectSwitching` is `true` on `uiStore`
- **THEN** the canvas SHALL NOT process pointer events
- **AND** the sidebar panels SHALL be non-interactive or display a loading state
- **AND** the toolbar SHALL be non-interactive

### Requirement: uiStore extensions

The `uiStore` SHALL be extended with state and actions to support multi-project management.

#### Scenario: projectSwitching state

- **WHEN** the `uiStore` is initialized
- **THEN** `projectSwitching` SHALL default to `false`
- **AND** `setProjectSwitching(value: boolean)` SHALL be available as an action

#### Scenario: PanelType update

- **WHEN** the `PanelType` type is defined
- **THEN** it SHALL include `'projects'` as a valid value
