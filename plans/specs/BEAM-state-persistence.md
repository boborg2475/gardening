# BEAM Specs: State Management and Persistence

Format per spec:
- **Behavior**: Observable behavior from the user/system perspective
- **Event**: What triggers the behavior
- **Action**: What the system does in response
- **Model**: What state changes occur

---

## BEAM-SP-001: projectStore initializes with default empty project

**Behavior**: When no saved project exists, the app starts with a blank project ready for editing.

**Event**: App launches with no `lastProjectId` in the meta table, or the stored last project ID references a deleted project.

**Action**: The projectStore initializes with its hardcoded default state.

**Model**:
- `id` = new nanoid
- `name` = `'Untitled Project'`
- `units` = `'imperial'`
- `propertyBoundary` = `null`
- `houseOutline` = `null`
- `zones` = `[]`
- `features` = `[]`
- `plantings` = `[]`
- `measurements` = `[]`
- `createdAt` = current ISO datetime
- `updatedAt` = current ISO datetime

**Preconditions**: None.

**Expected Outcome**: User sees an empty canvas with no property, zones, or features. The project name reads "Untitled Project".

**Edge Cases**:
- If IndexedDB is unavailable (e.g., private browsing in some browsers), the app still initializes with defaults but auto-save will fail silently with an error toast.

---

## BEAM-SP-002: Adding a zone updates zones array

**Behavior**: When the user completes drawing a zone polygon, the zone appears on the canvas and in the zones panel.

**Event**: User finishes drawing a zone (closes the polygon via the draw-zone tool).

**Action**:
1. A new `Zone` object is created with a unique `id`, the drawn `points`, and default properties.
2. `projectStore.addZone(zone)` is called.
3. `uiStore.clearDrawing()` and `uiStore.setTool('select')` are called.

**Model**:
- `zones` array length increases by 1.
- New zone is appended to the end of the array.
- `updatedAt` is set to current datetime.
- A snapshot is captured by zundo for undo.

**Preconditions**: `activeTool` is `'draw-zone'`. `drawingPoints` has at least 3 points.

**Expected Outcome**: The new zone renders on the canvas. It appears in the zones panel list. Undo is available.

**Edge Cases**:
- Fewer than 3 points: the zone creation should be rejected (a polygon requires at least 3 vertices).

---

## BEAM-SP-003: Updating a zone preserves other zones

**Behavior**: When a zone's properties are edited, only that zone changes; all other zones remain unmodified.

**Event**: User edits a zone's name, soil type, sun exposure, color, or vertices via the zone properties panel or by dragging vertices on the canvas.

**Action**: `projectStore.updateZone(id, updates)` is called with only the changed fields.

**Model**:
- The zone matching `id` is shallow-merged with `updates`.
- All other entries in the `zones` array are unchanged (same object references).
- `updatedAt` is set to current datetime.

**Preconditions**: A zone with the given `id` exists in the `zones` array.

**Expected Outcome**: Only the targeted zone reflects the changes. Other zones are visually and structurally identical to before.

**Edge Cases**:
- If `id` does not match any zone, the action is a no-op.

---

## BEAM-SP-004: Deleting a zone removes it and its plantings

**Behavior**: Deleting a zone also removes all plantings assigned to that zone.

**Event**: User clicks "Delete Zone" in the zone properties panel.

**Action**: `projectStore.deleteZone(id)` is called.

**Model**:
- The zone matching `id` is removed from `zones`.
- All entries in `plantings` where `zoneId === id` are removed.
- `updatedAt` is set to current datetime.
- A snapshot is captured by zundo (the full state before deletion is in the undo stack).

**Preconditions**: A zone with the given `id` exists.

**Expected Outcome**: The zone disappears from the canvas and zone list. Any plantings that belonged to that zone are also removed from the plantings list. Undo restores both the zone and its plantings.

**Edge Cases**:
- Zone has no plantings: only the zone is removed; plantings array is unchanged.
- Zone is currently selected: `uiStore.deselect()` should be called after deletion.

---

## BEAM-SP-005: Undo reverts last project state change

**Behavior**: Pressing Ctrl+Z (or tapping the undo button) reverts the most recent change to project data.

**Event**: User triggers undo via keyboard shortcut or UI button.

**Action**: `useTemporalStore().undo()` is called.

**Model**:
- `projectStore` state is replaced with the previous snapshot from `pastStates`.
- The current state (before undo) is pushed onto `futureStates`.
- `pastStates` length decreases by 1.
- `futureStates` length increases by 1.

**Preconditions**: `pastStates.length > 0`.

**Expected Outcome**: The canvas and all UI panels reflect the previous state. The redo button becomes enabled.

**Edge Cases**:
- If `pastStates` is empty, `undo()` is a no-op. The undo button should be disabled.

---

## BEAM-SP-006: Redo re-applies undone change

**Behavior**: Pressing Ctrl+Shift+Z (or tapping the redo button) re-applies a previously undone change.

**Event**: User triggers redo via keyboard shortcut or UI button.

**Action**: `useTemporalStore().redo()` is called.

**Model**:
- `projectStore` state is replaced with the next snapshot from `futureStates`.
- The current state (before redo) is pushed onto `pastStates`.
- `futureStates` length decreases by 1.
- `pastStates` length increases by 1.

**Preconditions**: `futureStates.length > 0`.

**Expected Outcome**: The canvas and UI reflect the re-applied state.

**Edge Cases**:
- If `futureStates` is empty, `redo()` is a no-op. The redo button should be disabled.
- If the user makes a new mutation after undoing, `futureStates` is cleared and redo becomes unavailable.

---

## BEAM-SP-007: Undo stack is empty on fresh project

**Behavior**: A newly created or freshly loaded project has no undo history.

**Event**: `resetProject()` or `loadProject()` is called.

**Action**: The temporal middleware's history is cleared.

**Model**:
- `pastStates` = `[]`
- `futureStates` = `[]`

**Preconditions**: None.

**Expected Outcome**: Undo and redo buttons are both disabled. No keyboard shortcut triggers a state change.

**Edge Cases**: None.

---

## BEAM-SP-008: Drag operation batches as single undo step

**Behavior**: Dragging a feature or zone vertex across the canvas, then releasing, counts as one undo step regardless of how many intermediate positions were computed.

**Event**: User begins dragging (mousedown/touchstart on a draggable element), moves (mousemove/touchmove), and releases (mouseup/touchend).

**Action**:
1. On drag start: `useTemporalStore().pause()`.
2. During drag: `projectStore.updateFeature()` or `projectStore.updateZone()` is called on each move event. No snapshots are captured.
3. On drag end: `useTemporalStore().resume()`. A single snapshot of the final state is captured.

**Model**:
- `pastStates` increases by exactly 1 after the full drag operation.
- The single undo step reverts from the drop position back to the pre-drag position.

**Preconditions**: A draggable element is under the pointer and `activeTool` is `'select'`.

**Expected Outcome**: After dragging a feature from point A to point B, a single Ctrl+Z moves it back to point A.

**Edge Cases**:
- If the user drags and releases at the same position (no actual movement), a snapshot may still be captured. This is acceptable as the state is identical.
- If the drag is cancelled (e.g., Escape key), `resume()` is still called to restore normal tracking, but the element is reverted to its pre-drag position programmatically.

---

## BEAM-SP-009: UI state changes do NOT appear in undo history

**Behavior**: Changing the active tool, selecting objects, panning, zooming, toggling layers, or toggling the sidebar does not create undo entries.

**Event**: Any uiStore action is called.

**Action**: uiStore state is updated directly. The zundo temporal middleware is only attached to projectStore and is unaware of uiStore.

**Model**:
- `pastStates` and `futureStates` on the temporal store are unchanged.
- Only uiStore fields change.

**Preconditions**: None.

**Expected Outcome**: Pressing Ctrl+Z after panning or changing tools does not revert the pan/tool change. It reverts the last project data change instead.

**Edge Cases**: None.

---

## BEAM-SP-010: Auto-save triggers after 1s of inactivity

**Behavior**: After the user makes a change and stops editing for 1 second, the project is saved to IndexedDB.

**Event**: A projectStore state change occurs, followed by 1000ms with no further changes.

**Action**: `projectRepo.saveProject(state)` and `projectRepo.setLastProjectId(state.id)` are called.

**Model**:
- The `projects` table row for the current project is upserted with the latest state.
- The `meta` table row for `lastProjectId` is updated.

**Preconditions**: The store is not in its initial loading state.

**Expected Outcome**: The project data in IndexedDB matches the current store state. Refreshing the page restores the saved state.

**Edge Cases**:
- If the save fails (e.g., quota exceeded), a toast notification informs the user.
- If the component unmounts (e.g., page navigation), the pending save is flushed immediately.

---

## BEAM-SP-011: Rapid changes debounce to single save

**Behavior**: Making many changes in quick succession results in only one IndexedDB write, not one per change.

**Event**: Multiple projectStore mutations occur within 1000ms of each other.

**Action**: Each mutation resets the debounce timer. Only when the timer expires (1000ms after the last mutation) does the save execute.

**Model**:
- IndexedDB is written to once with the final state, not once per intermediate state.

**Preconditions**: Auto-save hook is mounted.

**Expected Outcome**: During a burst of edits (e.g., typing a zone name character by character), IndexedDB sees a single write with the final value.

**Edge Cases**:
- Extremely long continuous editing (e.g., holding down a key): the save only triggers after the user pauses. Data is at risk if the browser crashes during the editing burst, but this is an acceptable tradeoff for performance.

---

## BEAM-SP-012: Project loads from IndexedDB on startup

**Behavior**: When the app launches, the last-used project is automatically loaded.

**Event**: App mounts and `useAutoSave` hook initializes.

**Action**:
1. `projectRepo.getLastProjectId()` is called.
2. If an ID is returned, `projectRepo.loadProject(id)` is called.
3. If the project exists, `projectStore.loadProject(state)` replaces the store state.

**Model**:
- projectStore state is fully replaced with the loaded project data.
- Undo/redo history is cleared.

**Preconditions**: IndexedDB is accessible. A project was previously saved.

**Expected Outcome**: The user sees their previous project exactly as they left it.

**Edge Cases**:
- If the last project ID points to a deleted project, fall through to default empty project.
- If IndexedDB is cleared (user cleared browser data), start with default empty project.
- If the stored JSON is corrupt, display an error and start with default empty project.

---

## BEAM-SP-013: Last-used project ID persists across sessions

**Behavior**: Closing and reopening the app returns the user to the same project they were working on.

**Event**: Auto-save writes the current project ID to the meta table after each save.

**Action**: `projectRepo.setLastProjectId(state.id)` is called alongside each auto-save.

**Model**:
- `meta` table row with key `'lastProjectId'` is updated to the current project's ID.

**Preconditions**: Auto-save has executed at least once.

**Expected Outcome**: On next app launch, `getLastProjectId()` returns the correct ID, and that project is loaded.

**Edge Cases**:
- If the user has never saved (brand new install), `getLastProjectId()` returns `null` and a default project is created.

---

## BEAM-SP-014: Creating new project saves and switches

**Behavior**: When the user creates a new project, the current project is saved first, then a blank project is loaded.

**Event**: User clicks "New Project" in the project panel.

**Action**:
1. `projectRepo.saveProject(currentState)` to persist the current project.
2. `projectStore.resetProject()` to initialize a new empty project.
3. The new project is auto-saved by the next debounce cycle.

**Model**:
- The old project is saved to IndexedDB (upsert).
- projectStore state is replaced with default values and a new `id`.
- Undo/redo history is cleared.

**Preconditions**: None.

**Expected Outcome**: The canvas is empty. The project name is "Untitled Project". The previous project is still accessible from the project list.

**Edge Cases**:
- If saving the current project fails, the new project creation should still proceed (the old project may lose its latest changes, but the user should not be blocked).

---

## BEAM-SP-015: Deleting current project loads another

**Behavior**: If the user deletes the project they are currently viewing, the app automatically loads another project or creates a new one.

**Event**: User deletes the currently loaded project from the project list.

**Action**:
1. `projectRepo.deleteProject(currentId)`.
2. `projectRepo.listProjects()` to check for remaining projects.
3. If other projects exist, load the most recently updated one.
4. If no projects remain, call `projectStore.resetProject()`.

**Model**:
- The deleted project's row is removed from the `projects` table.
- projectStore is replaced with either a loaded project or a fresh default.
- Undo/redo history is cleared.

**Preconditions**: The project being deleted is the currently active project.

**Expected Outcome**: The user is never left in a state with no loaded project. Either another existing project is shown, or a new blank project is created.

**Edge Cases**:
- If the user deletes a project that is NOT the current project, no store changes occur; only the DB row is removed.

---

## BEAM-SP-016: JSON export produces valid importable file

**Behavior**: Exporting a project downloads a JSON file that can be re-imported on the same or different device.

**Event**: User clicks "Export Project".

**Action**:
1. Current `ProjectState` is extracted (data fields only, no functions).
2. Serialized to formatted JSON.
3. A file download is triggered with filename `{projectName}.garden.json`.

**Model**: No state changes. Read-only operation.

**Preconditions**: A project is loaded.

**Expected Outcome**: A valid JSON file is downloaded. The file contains all project data including zones, features, plantings, measurements, property boundary, and house outline.

**Edge Cases**:
- Project name contains characters invalid for filenames: sanitize by replacing invalid characters with underscores.
- Empty project: export still produces valid JSON with empty arrays and null boundaries.

---

## BEAM-SP-017: JSON import creates new project from file

**Behavior**: Importing a JSON file creates a new project entry without overwriting the current project.

**Event**: User selects a `.json` file via the import dialog.

**Action**:
1. File contents are read and parsed as JSON.
2. Data is validated against the `ProjectState` schema.
3. A new `id` is generated for the imported project.
4. Current project is saved.
5. Imported state is loaded via `projectStore.loadProject()`.

**Model**:
- A new project record is created in IndexedDB (via auto-save).
- projectStore is replaced with the imported data (with new ID).
- The previous project remains in the database.

**Preconditions**: The selected file is a valid `.garden.json` file.

**Expected Outcome**: The imported project is displayed. The previously active project is still accessible from the project list.

**Edge Cases**:
- Large files: no explicit size limit, but extremely large files may cause slow parsing. This is acceptable for a local-only app.

---

## BEAM-SP-018: JSON import rejects invalid/malformed data

**Behavior**: If the imported file is not valid JSON or does not match the expected schema, the import is rejected with a clear error message.

**Event**: User selects a file that fails validation.

**Action**:
1. File is read and parsing is attempted.
2. If JSON parsing fails, display error: "Invalid JSON file."
3. If parsing succeeds but validation fails, display specific errors (e.g., "Missing required field: zones").
4. No state changes occur.

**Model**: No changes to projectStore or IndexedDB.

**Preconditions**: None.

**Expected Outcome**: The user sees an error message explaining why the import failed. The current project remains loaded and unmodified.

**Edge Cases**:
- File is valid JSON but completely wrong shape (e.g., an array, a number): rejected with "Invalid project data format."
- File has the right top-level fields but nested data is malformed (e.g., a zone missing `points`): rejected with specific field-level errors.
- Non-JSON file selected (e.g., PNG image): JSON parsing fails; rejected.

---

## BEAM-SP-019: Multiple projects can coexist in DB

**Behavior**: Users can create, save, and switch between multiple independent projects.

**Event**: User creates additional projects or imports projects.

**Action**: Each project is stored as a separate row in the `projects` table with a unique `id`.

**Model**:
- The `projects` table contains one row per project.
- `listProjects()` returns all rows.
- Only one project is loaded into `projectStore` at a time.

**Preconditions**: None.

**Expected Outcome**: The project list shows all saved projects. Switching between them loads the correct data each time.

**Edge Cases**:
- Theoretical limit is IndexedDB storage quota (typically 50%+ of available disk space). In practice, garden projects are small (KB range) so this is unlikely to be an issue.

---

## BEAM-SP-020: selectedZone selector returns correct zone

**Behavior**: When a zone is selected on the canvas, the `selectedZone` selector returns the matching zone object.

**Event**: Component reads the `selectedZone` derived state.

**Action**: The selector looks up `uiStore.selectedId` in `projectStore.zones`.

**Model**: No state changes. Pure derivation.

**Preconditions**: `uiStore.selectedType === 'zone'` and `uiStore.selectedId` matches a zone's `id`.

**Expected Outcome**: Returns the `Zone` object with the matching ID.

**Edge Cases**:
- `selectedType` is not `'zone'`: returns `undefined`.
- `selectedId` does not match any zone (e.g., zone was deleted while selected): returns `undefined`.
- No selection at all (`selectedId` is null): returns `undefined`.

---

## BEAM-SP-021: plantingsForZone selector filters correctly

**Behavior**: The `plantingsForZone(zoneId)` selector returns only the plantings assigned to the specified zone.

**Event**: Component reads plantings for a specific zone (e.g., zone detail panel).

**Action**: The selector filters `projectStore.plantings` where `planting.zoneId === zoneId`.

**Model**: No state changes. Pure derivation.

**Preconditions**: None.

**Expected Outcome**: Returns an array of `Planting` objects whose `zoneId` matches. Returns an empty array if no plantings belong to the zone.

**Edge Cases**:
- Zone has no plantings: returns `[]`.
- `zoneId` does not match any zone (orphan call): returns `[]` (no plantings can have that zoneId either).
- Multiple plantings in the same zone: all are returned.

---

## BEAM-SP-022: loadProject replaces entire project state

**Behavior**: When a project is loaded from the database, the entire projectStore state is replaced — no merging.

**Event**: `projectStore.loadProject(state)` is called.

**Action**: The store's state is fully replaced with the provided state object. Undo/redo history is cleared.

**Model**:
- Every field in projectStore is overwritten with the corresponding field from the loaded state.
- `pastStates` = `[]`, `futureStates` = `[]`.

**Preconditions**: The provided state is a valid `ProjectState`.

**Expected Outcome**: The canvas and all panels reflect the loaded project exactly. No remnants of the previous project remain in the store.

**Edge Cases**:
- Loading a project while in the middle of a drawing operation: `uiStore` should be reset (clear drawing points, switch to select tool) as a safety measure. This is the caller's responsibility, not `loadProject`'s.
- Loading the same project that is already loaded: state is replaced (effectively a no-op in terms of visible state), but undo history is still cleared.

---

## BEAM-SP-023: Unit system (imperial/metric) persists with project

**Behavior**: Each project stores its own unit system setting. Switching projects switches the displayed units accordingly.

**Event**: User changes the unit system in project settings, or loads a project that has a different unit system.

**Action**:
- Changing units: `projectStore` is updated with the new `units` value. All existing coordinate data remains unchanged (coordinates are unit-agnostic numbers; the `units` field determines how they are labeled and what conversion factors are used for display).
- Loading project: the loaded state's `units` field is used.

**Model**:
- `units` field is set to `'imperial'` or `'metric'`.
- `updatedAt` is set to current datetime (if changed by user action).

**Preconditions**: None.

**Expected Outcome**: Grid labels, measurement labels, and property panels show values in the correct unit system. Coordinates in the store are always stored as raw numbers; the `units` field only affects display formatting.

**Edge Cases**:
- Switching units does not convert existing coordinate values. A property drawn as 50 units wide stays 50 units wide regardless of whether those units are labeled as feet or meters. This is a deliberate simplification — unit conversion for existing geometry is out of scope.
