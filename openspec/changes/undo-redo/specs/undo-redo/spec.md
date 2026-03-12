## ADDED Requirements

### Requirement: Ctrl+Z undoes last project state change
Pressing Ctrl+Z (Cmd+Z on macOS) SHALL revert projectStore to its previous state by calling `temporalStore.undo()`. The shortcut SHALL only fire when focus is not in a text input and no modal dialog is open.

#### Scenario: Undo reverts last action
- **WHEN** the user presses Ctrl+Z with undo history available
- **THEN** projectStore SHALL revert to the previous snapshot and the canvas SHALL re-render

#### Scenario: Undo with empty history is a no-op
- **WHEN** the user presses Ctrl+Z with pastStates.length === 0
- **THEN** nothing SHALL happen and no error SHALL occur

#### Scenario: Undo does not fire in text inputs
- **WHEN** the user presses Ctrl+Z while focus is in an input or textarea
- **THEN** the shortcut handler SHALL not intercept the event

### Requirement: Ctrl+Shift+Z redoes last undone change
Pressing Ctrl+Shift+Z (Cmd+Shift+Z on macOS) or Ctrl+Y SHALL re-apply the most recently undone change by calling `temporalStore.redo()`.

#### Scenario: Redo re-applies undone action
- **WHEN** the user presses Ctrl+Shift+Z with redo history available
- **THEN** projectStore SHALL advance to the next snapshot in the redo stack

#### Scenario: Redo with empty future is a no-op
- **WHEN** the user presses Ctrl+Shift+Z with futureStates.length === 0
- **THEN** nothing SHALL happen

### Requirement: New action after undo clears redo history
Any new projectStore mutation after an undo SHALL clear the futureStates stack. History SHALL NOT branch.

#### Scenario: New mutation clears redo stack
- **WHEN** a new projectStore mutation occurs while futureStates.length > 0
- **THEN** futureStates SHALL be emptied and the redo button SHALL become disabled

### Requirement: Drag operations count as single undo steps
Dragging a feature, zone, or boundary vertex SHALL produce exactly one undo step regardless of intermediate positions.

#### Scenario: Drag is batched into single undo step
- **WHEN** the user drags an element (pointerdown, multiple pointermove, pointerup)
- **THEN** temporalStore.pause() SHALL be called on drag start, temporalStore.resume() SHALL be called on drag end, and pastStates SHALL gain exactly one new entry

#### Scenario: One Ctrl+Z undoes entire drag
- **WHEN** the user presses Ctrl+Z after completing a drag
- **THEN** the element SHALL return to its pre-drag position in a single undo step

### Requirement: Undo history is limited to 50 states
The temporal middleware SHALL store a maximum of 50 past states. When the limit is exceeded, the oldest state SHALL be discarded.

#### Scenario: 51st action evicts oldest state
- **WHEN** a new mutation occurs with pastStates.length === 50
- **THEN** the oldest entry SHALL be removed and pastStates.length SHALL remain 50

### Requirement: UI state changes are not tracked in undo history
Changes to uiStore (tool switches, pan/zoom, selection, layer visibility) SHALL NOT be captured in the undo history.

#### Scenario: Tool switch is not undoable
- **WHEN** the user switches tools and then presses Ctrl+Z
- **THEN** the tool switch SHALL NOT be undone; instead the most recent projectStore change SHALL be undone

### Requirement: Undo/redo toolbar buttons reflect history state
The toolbar SHALL include undo and redo buttons that are disabled when their respective history stack is empty.

#### Scenario: Undo button disabled when no history
- **WHEN** pastStates.length === 0
- **THEN** the undo button SHALL be disabled with opacity 0.4

#### Scenario: Redo button disabled when no future
- **WHEN** futureStates.length === 0
- **THEN** the redo button SHALL be disabled with opacity 0.4

#### Scenario: Buttons show keyboard shortcut tooltips
- **WHEN** the user hovers over the undo or redo button
- **THEN** a tooltip SHALL show the keyboard shortcut (e.g., "Undo (Ctrl+Z)")
