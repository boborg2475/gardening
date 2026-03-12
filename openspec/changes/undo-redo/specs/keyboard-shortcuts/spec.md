## ADDED Requirements

### Requirement: Tool switching shortcuts activate corresponding tools
Single-letter keys without modifiers SHALL switch the active tool when focus is not in a text input.

#### Scenario: V activates select tool
- **WHEN** the user presses V with no modifier keys and focus not in text input
- **THEN** `uiStore.activeTool` SHALL be set to `'select'`

#### Scenario: P activates draw-property tool
- **WHEN** the user presses P with no modifier keys
- **THEN** `uiStore.activeTool` SHALL be set to `'draw-property'`

#### Scenario: Z with Ctrl held does not activate zone tool
- **WHEN** the user presses Ctrl+Z
- **THEN** the zone tool SHALL NOT activate; the undo shortcut SHALL fire instead

### Requirement: Delete key removes selected object
Pressing Delete or Backspace SHALL remove the currently selected object from projectStore and clear selection.

#### Scenario: Delete removes selected zone
- **WHEN** the user presses Delete while a zone is selected
- **THEN** the zone deletion flow SHALL be triggered (with confirmation if plantings exist)

#### Scenario: Delete in text input is not intercepted
- **WHEN** the user presses Delete while focus is in an input field
- **THEN** the shortcut handler SHALL not intercept the event

### Requirement: Escape deselects and cancels with cascading behavior
Escape SHALL cascade: first deselect, then cancel active tool, then cancel in-progress drawing.

#### Scenario: Escape deselects current selection
- **WHEN** the user presses Escape while an object is selected
- **THEN** selection SHALL be cleared

#### Scenario: Escape reverts non-select tool
- **WHEN** the user presses Escape with nothing selected and a non-select tool active
- **THEN** `uiStore.activeTool` SHALL be set to `'select'`

### Requirement: G toggles grid visibility
Pressing G without modifiers SHALL toggle `uiStore.layers.grid`.

#### Scenario: G toggles grid
- **WHEN** the user presses G with no modifiers and focus not in text input
- **THEN** `uiStore.layers.grid` SHALL be toggled

### Requirement: Shortcuts do not fire when text input is focused
The shortcut handler SHALL check `document.activeElement` and skip processing when focus is in an input, textarea, or contentEditable element.

#### Scenario: Letter key in text input types normally
- **WHEN** the user presses Z while typing in a zone name input
- **THEN** the letter SHALL be typed in the input and the zone tool SHALL NOT activate

### Requirement: Ctrl+S prevents browser save dialog
Pressing Ctrl+S SHALL call event.preventDefault() to suppress the browser's save dialog. No app action is needed since auto-save handles persistence.

#### Scenario: Ctrl+S is suppressed
- **WHEN** the user presses Ctrl+S
- **THEN** event.preventDefault() SHALL be called and no browser save dialog SHALL appear
