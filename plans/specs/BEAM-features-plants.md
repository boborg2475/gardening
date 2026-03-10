# BEAM Specs: Features & Plants

Behavioral specifications for the Feature Catalog, Feature Placement, Plant Database, and Planting Tracker systems.

Each spec follows the BEAM format:
- **Behavior**: Observable behavior from the user's perspective
- **Event**: What triggers the behavior
- **Action**: What the system does in response
- **Model**: What state changes occur

---

## Feature Catalog & Placement

---

### BEAM-FP-001: Feature catalog displays all templates grouped by category

**Behavior**: The feature catalog panel displays all ~30 feature templates organized into their six categories (trees, shrubs, structures, hardscape, water, misc), each with an icon preview and name.

**Event**: User opens the feature panel in the sidebar.

**Action**: The panel renders the full list of templates from `featureCatalog`, grouped by category with category headers. Each template row shows a small canvas-rendered icon preview and the template name.

**Model**: No state change. Read-only display of the static `featureCatalog` array.

**Preconditions**: None. The catalog is always available.

**Expected outcome**: All ~30 templates are visible, grouped under six category headings, each with a recognizable icon.

**Edge cases**:
- Panel renders correctly even if catalog array is reordered or templates are added in a future update.

---

### BEAM-FP-002: Searching catalog filters templates by name

**Behavior**: Typing in the catalog search bar filters the visible templates to those whose name contains the search string.

**Event**: User types into the search input field in the feature panel.

**Action**: The template list is filtered in real time. Only templates whose `name` includes the search string (case-insensitive) are displayed. Category groups with no matching templates are hidden.

**Model**: No persistent state change. The search string is local component state.

**Preconditions**: Feature panel is open.

**Expected outcome**: Typing "tree" shows Deciduous Tree, Evergreen Tree, Fruit Tree, Palm Tree, Small Ornamental Tree. Typing "xyz" shows "No matching features" empty state.

**Edge cases**:
- Empty search string shows all templates.
- Search combined with category filter applies both: template must match the search string AND belong to an active category.

---

### BEAM-FP-003: Selecting template activates place-feature tool

**Behavior**: Clicking a template in the catalog switches the active tool to place-feature mode with that template.

**Event**: User clicks a template entry in the feature catalog panel.

**Action**: `uiStore.activeTool` is set to `'place-feature'`. `uiStore.placingTemplateId` is set to the clicked template's `id`. The cursor changes to indicate placement mode.

**Model**:
- `uiStore.activeTool` = `'place-feature'`
- `uiStore.placingTemplateId` = selected template id
- Any existing selection is cleared (`uiStore.selectedFeatureId` = null)

**Preconditions**: Feature panel is open and catalog is displayed.

**Expected outcome**: The active tool indicator shows place-feature mode. The canvas is ready to display a ghost preview on mouse enter.

**Edge cases**:
- Clicking the same template that is already active is a no-op (tool stays in place mode with that template).
- Clicking a different template while already in place mode switches to the new template without exiting placement.

---

### BEAM-FP-004: Ghost preview follows cursor in place mode

**Behavior**: While in place-feature mode, a semi-transparent preview of the feature icon follows the cursor over the canvas.

**Event**: Cursor moves over the canvas while `uiStore.activeTool === 'place-feature'`.

**Action**: On each render frame, the engine draws the template's icon at the cursor's world position using `drawIcon`, with reduced opacity (alpha ~0.5). The ghost is drawn at the template's `defaultWidth` and `defaultHeight`, centered on the cursor.

**Model**: No state change. The ghost is purely a render-time effect driven by the current cursor position and active template.

**Preconditions**: `uiStore.activeTool === 'place-feature'` and `uiStore.placingTemplateId` is non-null.

**Expected outcome**: The preview moves smoothly with the cursor and accurately represents the feature's appearance and size.

**Edge cases**:
- Ghost does not appear when cursor is outside the canvas bounds.
- Ghost respects current zoom level (renders at correct world-unit size).
- Pan/zoom while in place mode continues to work normally; ghost tracks cursor world position correctly.

---

### BEAM-FP-005: Click places feature at world coordinates

**Behavior**: Clicking on the canvas in place-feature mode creates a new placed feature at the clicked world position.

**Event**: User clicks (pointerdown + pointerup without significant drag) on the canvas while in place-feature mode.

**Action**: The click screen coordinates are converted to world coordinates via `CanvasEngine.screenToWorld()`. A new `PlacedFeature` is created with a uuid, the active template's id, the world position as center, the template's default dimensions, rotation 0, and empty notes. The feature is appended to `projectStore.features`.

**Model**:
- `projectStore.features` gains a new `PlacedFeature` entry.
- `zundo` captures an undo snapshot.

**Preconditions**: `uiStore.activeTool === 'place-feature'` and `uiStore.placingTemplateId` references a valid template.

**Expected outcome**: The feature appears on the canvas at the clicked location, rendered with its template's draw function at full opacity.

**Edge cases**:
- Placing at the very edge of the canvas/world boundary still works; no clamping is applied.
- Rapid clicks in succession create multiple features at each click location.

---

### BEAM-FP-006: Multiple features can be placed without reselecting template

**Behavior**: After placing a feature, the tool remains in place-feature mode with the same template, allowing additional placements.

**Event**: A feature is successfully placed (BEAM-FP-005 completes).

**Action**: The tool state is not changed. `uiStore.activeTool` remains `'place-feature'` and `uiStore.placingTemplateId` retains its value. The ghost preview continues to follow the cursor.

**Model**: No additional state change beyond the placement itself.

**Preconditions**: A feature was just placed via BEAM-FP-005.

**Expected outcome**: User can click again immediately to place another instance of the same feature.

**Edge cases**:
- Each placement creates a distinct `PlacedFeature` with its own uuid, even if all other fields are identical.
- Each placement is a separate undo step.

---

### BEAM-FP-007: Escape exits place-feature mode

**Behavior**: Pressing Escape while in place-feature mode returns to select mode.

**Event**: User presses the Escape key while `uiStore.activeTool === 'place-feature'`.

**Action**: `uiStore.activeTool` is set to `'select'`. `uiStore.placingTemplateId` is set to `null`. The ghost preview stops rendering.

**Model**:
- `uiStore.activeTool` = `'select'`
- `uiStore.placingTemplateId` = `null`

**Preconditions**: `uiStore.activeTool === 'place-feature'`.

**Expected outcome**: The cursor returns to default select behavior. No feature is placed.

**Edge cases**:
- Pressing Escape while not in place mode has no effect on tool state (may be handled by other tools).
- Clicking a different tool in the toolbar also exits place mode (same state transitions).

---

### BEAM-FP-008: Feature renders using its template's draw function

**Behavior**: Each placed feature on the canvas is rendered by calling its template's `drawIcon` function with the feature's position and dimensions.

**Event**: The render loop executes a frame while placed features exist in `projectStore.features`.

**Action**: The feature renderer iterates over `projectStore.features`. For each feature, it looks up the corresponding `FeatureTemplate` by `templateId`, computes the top-left corner from the center position and dimensions, and calls `template.drawIcon(ctx, topLeftX, topLeftY, width, height)`.

**Model**: No state change. This is a read-only render pass.

**Preconditions**: At least one `PlacedFeature` exists in `projectStore.features`.

**Expected outcome**: Each feature appears on the canvas at its stored position and size, drawn with the visual style defined by its template.

**Edge cases**:
- If a `templateId` does not match any template (e.g., template was removed in an update), the feature is rendered as a fallback rectangle with a question mark.
- Features outside the current viewport are culled and not drawn.

---

### BEAM-FP-009: Clicking feature in select mode selects it

**Behavior**: Clicking on a placed feature while in select mode selects that feature, showing a bounding rectangle with handles.

**Event**: User clicks on the canvas at a point that falls within a placed feature's bounding rectangle, while `uiStore.activeTool === 'select'`.

**Action**: Hit test is performed against all placed features in reverse z-order. The first hit feature's id is assigned to `uiStore.selectedFeatureId`. The renderer draws a selection rectangle with handles around the feature.

**Model**:
- `uiStore.selectedFeatureId` = hit feature's id
- Any previously selected feature is deselected.

**Preconditions**: `uiStore.activeTool === 'select'`. At least one feature exists.

**Expected outcome**: The clicked feature shows a visible selection indicator (bounding rect with corner and midpoint handles). The feature panel sidebar shows the feature's details.

**Edge cases**:
- When features overlap, the topmost feature (last in the array / highest z-order) is selected.
- Clicking on a non-feature area clears the selection.

---

### BEAM-FP-010: Dragging selected feature moves it

**Behavior**: Pressing down on a selected feature and dragging moves the feature to a new position on the canvas.

**Event**: User performs a pointerdown on a selected feature, followed by pointermove events, followed by pointerup.

**Action**: On pointerdown, the offset between the cursor world position and the feature center is recorded. On each pointermove, the feature's `(x, y)` is updated to `cursorWorldPos - offset`. On pointerup, the final position is committed to `projectStore.features` and an undo snapshot is captured.

**Model**:
- During drag: feature `x` and `y` are continuously updated in the store.
- On drop: `zundo` captures a snapshot of the final state.

**Preconditions**: A feature is selected and the pointerdown lands within its bounds.

**Expected outcome**: The feature visually tracks the cursor during drag and settles at the release position.

**Edge cases**:
- Dragging beyond the canvas viewport triggers auto-pan if implemented, otherwise the feature position is set to wherever the cursor world position maps to.
- Very small drags (less than a few pixels) are not treated as moves to avoid accidental repositioning on click.

---

### BEAM-FP-011: Delete key removes selected feature

**Behavior**: Pressing the Delete or Backspace key while a feature is selected removes the feature from the project.

**Event**: User presses Delete or Backspace while `uiStore.selectedFeatureId` is non-null.

**Action**: The feature with the matching id is removed from `projectStore.features`. `uiStore.selectedFeatureId` is set to `null`. An undo snapshot is captured.

**Model**:
- `projectStore.features` is filtered to exclude the deleted feature.
- `uiStore.selectedFeatureId` = `null`
- `zundo` snapshot captured.

**Preconditions**: A feature is selected.

**Expected outcome**: The feature disappears from the canvas. The sidebar detail section reverts to its empty/hint state.

**Edge cases**:
- If the key event target is a text input or textarea, the key press is not intercepted (allows normal text editing).
- Undo (Ctrl+Z) restores the deleted feature.

---

### BEAM-FP-012: Feature hit test uses bounding rectangle

**Behavior**: Feature selection hit testing uses the axis-aligned bounding rectangle of each feature.

**Event**: A click or pointerdown occurs on the canvas in select mode.

**Action**: For each placed feature, the hit test checks whether the click world position falls within the rectangle defined by center `(x, y)` and half-extents `(width/2, height/2)`:
```
hit = |clickX - feature.x| <= feature.width / 2
  AND |clickY - feature.y| <= feature.height / 2
```
Features are tested in reverse array order (last placed tested first).

**Model**: No state change from the hit test itself. Selection state change follows per BEAM-FP-009.

**Preconditions**: At least one feature exists.

**Expected outcome**: Clicking inside the bounding rectangle of any feature reliably selects it. Clicking outside all bounding rectangles selects nothing.

**Edge cases**:
- Rotation is stored but not yet applied to hit testing. All hit tests use axis-aligned bounds (rotation treated as 0).
- Very small features (e.g., sprinkler head at 1x1 world unit) may have a minimum hit-test size enforced in screen pixels to remain clickable at typical zoom levels.

---

### BEAM-FP-013: Feature panel shows details of selected feature

**Behavior**: When a feature is selected, the feature panel sidebar displays the feature's template name, icon, position, size, and notes.

**Event**: `uiStore.selectedFeatureId` changes to a non-null value.

**Action**: The feature detail section of the panel renders with:
- Template icon (large preview) and template name.
- Read-only position display: x and y in world units.
- Editable width and height fields.
- Editable notes textarea.
- Delete button.

**Model**: Edits to width, height, or notes immediately update the corresponding `PlacedFeature` in `projectStore.features`.

**Preconditions**: A feature is selected.

**Expected outcome**: The panel accurately reflects the selected feature's current state. Changing width/height in the panel updates the canvas rendering in real time.

**Edge cases**:
- Width and height inputs enforce a minimum value (e.g., 0.5 world units) to prevent zero-size features.
- If the selected feature is deleted by another action (e.g., undo), the panel reverts to empty state.

---

## Plant Database & Planting Tracker

---

### BEAM-FP-014: Plant database contains ~150 searchable plants

**Behavior**: The static plant database contains approximately 150 plant entries across eight categories, all available for search and browsing.

**Event**: Application loads.

**Action**: The `plantDatabase` array in `src/data/plantDatabase.ts` is available in memory. Each entry is a complete `Plant` record with all fields populated.

**Model**: No state change. The database is a static import.

**Preconditions**: None.

**Expected outcome**: `plantDatabase.length` is approximately 150. All eight categories are represented. Every entry has valid, non-empty `commonName`, `scientificName`, `category`, and numeric fields within expected ranges.

**Edge cases**:
- The database is read-only at runtime. No user action can modify it.
- Future updates may add or revise entries; existing `plantId` references in saved projects remain stable.

---

### BEAM-FP-015: Plant browser filters by category

**Behavior**: The plant browser dialog allows filtering plants by category using toggle buttons.

**Event**: User clicks one or more category toggle buttons in the plant browser.

**Action**: The displayed plant list is filtered to show only plants whose `category` matches one of the active filters. Multiple categories can be active simultaneously (OR logic). When no category is active, all plants are shown.

**Model**: Category filter state is local to the plant browser dialog component.

**Preconditions**: Plant browser dialog is open.

**Expected outcome**: Toggling "vegetable" shows only vegetable entries. Toggling "vegetable" and "herb" shows both. Toggling all off shows all plants.

**Edge cases**:
- Category filters combine with search text (BEAM-FP-016): a plant must match both the active categories AND the search query to appear.
- Results count label updates to reflect the current filter.

---

### BEAM-FP-016: Plant browser searches by common and scientific name

**Behavior**: Typing in the plant browser search bar filters plants whose common name or scientific name contains the search string.

**Event**: User types into the search input in the plant browser dialog.

**Action**: The plant list is filtered with a case-insensitive substring match against both `commonName` and `scientificName`. A plant appears if either field matches. Filtering is debounced at 150ms.

**Model**: Search string is local to the plant browser dialog component.

**Preconditions**: Plant browser dialog is open.

**Expected outcome**: Searching "basil" matches "Sweet Basil" (commonName) and also "Ocimum basilicum" (scientificName). Searching "lycopersicum" matches tomato varieties via scientific name.

**Edge cases**:
- Empty search string shows all plants (subject to category filters).
- Very short queries (1-2 characters) still filter; no minimum length is enforced.
- The search input is auto-focused when the dialog opens.

---

### BEAM-FP-017: Adding planting requires a selected zone

**Behavior**: The "Add Planting" button is only available when a zone is selected.

**Event**: User attempts to add a planting.

**Action**: If `uiStore.selectedZoneId` is non-null, the "Add Planting" button is enabled and clicking it opens the plant browser dialog. If no zone is selected, the planting panel shows a message directing the user to select a zone.

**Model**: No state change from this check alone.

**Preconditions**: At least one zone must exist in the project for a zone to be selectable.

**Expected outcome**: The button is interactive only when a zone is selected. The created planting's `zoneId` is set to the currently selected zone's id.

**Edge cases**:
- If the selected zone is deleted while the plant browser is open, the dialog closes and the planting panel reverts to the no-zone-selected state.
- If no zones exist at all, the planting panel area shows "Create a zone first to start tracking plantings."

---

### BEAM-FP-018: Planting saves with zone reference, plant reference, quantity, date, status

**Behavior**: A new planting record is saved with all required fields: zone id, plant id, quantity, optional planting date, status, and notes.

**Event**: User completes the planting form and clicks "Save".

**Action**: A new `Planting` object is created:
- `id`: generated uuid v4
- `zoneId`: from `uiStore.selectedZoneId`
- `plantId`: from the selected plant in the browser
- `quantity`: from the form input (validated >= 1)
- `plantingDate`: from the date picker or null
- `status`: from the dropdown (default "planned")
- `notes`: from the textarea (default "")

The planting is appended to `projectStore.plantings`.

**Model**:
- `projectStore.plantings` gains a new entry.
- `zundo` captures an undo snapshot.

**Preconditions**: A zone is selected. A plant has been chosen from the browser. Quantity is valid.

**Expected outcome**: The planting appears in the planting panel list for the selected zone. Auto-save persists it to IndexedDB.

**Edge cases**:
- Saving with no date sets `plantingDate` to null (not an empty string).
- Quantity input rejects 0, negative numbers, and non-integer values.

---

### BEAM-FP-019: Planting panel lists all plantings for selected zone

**Behavior**: The planting panel shows all plantings that belong to the currently selected zone.

**Event**: A zone is selected (or the zone selection changes).

**Action**: The panel uses the `plantingsForZone` selector with the current `uiStore.selectedZoneId` to retrieve matching plantings. Each planting is displayed as a card with plant name, quantity, status badge, and date.

**Model**: No state change. Read-only display driven by `projectStore.plantings` filtered by `zoneId`.

**Preconditions**: A zone is selected.

**Expected outcome**: Only plantings with `zoneId` matching the selected zone are shown. Plantings from other zones are not visible.

**Edge cases**:
- Switching zones immediately updates the list to the new zone's plantings.
- A zone with zero plantings shows the empty state message.

---

### BEAM-FP-020: Editing planting updates in project store

**Behavior**: Editing a planting's quantity, date, status, or notes updates the record in the project store.

**Event**: User modifies a field in the planting detail view and the change is committed (blur, enter, or explicit save depending on the field).

**Action**: The corresponding `Planting` record in `projectStore.plantings` is updated with the new value. An undo snapshot is captured.

**Model**:
- The specific `Planting` in `projectStore.plantings` is mutated (via Zustand immer-style or replacement).
- `zundo` captures a snapshot.

**Preconditions**: A planting is expanded in the planting panel.

**Expected outcome**: The change is reflected immediately in the panel display and persisted via auto-save.

**Edge cases**:
- Status changes are saved immediately on dropdown change (no separate save button needed).
- Notes are saved on blur to avoid excessive store updates while typing.
- Validation prevents setting quantity below 1.

---

### BEAM-FP-021: Deleting planting removes from project store

**Behavior**: Deleting a planting removes it from the project store and the planting panel list.

**Event**: User clicks the "Delete" button on a planting entry and confirms.

**Action**: A confirmation prompt is shown. On confirmation, the planting is removed from `projectStore.plantings` by filtering out the matching id. An undo snapshot is captured.

**Model**:
- `projectStore.plantings` is filtered to exclude the deleted planting.
- `zundo` captures a snapshot.

**Preconditions**: A planting exists and is visible in the planting panel.

**Expected outcome**: The planting disappears from the list. The planting count badge updates. Undo restores it.

**Edge cases**:
- Canceling the confirmation prompt is a no-op.
- Deleting the last planting in a zone shows the empty state.

---

### BEAM-FP-022: Deleting zone cascades to remove its plantings

**Behavior**: When a zone is deleted, all plantings assigned to that zone are also deleted.

**Event**: User deletes a zone from the project.

**Action**: The zone deletion action in the project store removes the zone from `projectStore.zones` and filters `projectStore.plantings` to remove all entries where `zoneId` matches the deleted zone's id. Both operations occur in a single store action.

**Model**:
- `projectStore.zones` filtered to exclude the deleted zone.
- `projectStore.plantings` filtered to exclude all plantings referencing the deleted zone.
- Single `zundo` snapshot captures both changes.

**Preconditions**: A zone exists, potentially with associated plantings.

**Expected outcome**: The zone and all its plantings are removed. Undo restores the zone and all its plantings together.

**Edge cases**:
- Deleting a zone with zero plantings simply removes the zone; the plantings array is unchanged.
- If the deleted zone was selected, `uiStore.selectedZoneId` is cleared, and the planting panel reverts to the no-zone-selected state.

---

### BEAM-FP-023: Plant details show hardiness, sun, water, spacing info

**Behavior**: When viewing a plant (in the browser or in an expanded planting), the full plant metadata is displayed.

**Event**: User expands a planting in the planting panel, or views a plant entry in the plant browser.

**Action**: The following plant fields are rendered with appropriate icons and labels:
- Hardiness zones: "Zones {min}-{max}" (e.g., "Zones 5-9")
- Sun requirement: icon + label ("Full Sun", "Partial Sun", "Shade")
- Water needs: icon + label ("Low", "Moderate", "High")
- Spacing: "{spacingInches} inches apart"
- Mature size: "{width}' W x {height}' H"
- Days to maturity: "{days} days" or "Perennial" if null

**Model**: No state change. Read-only display from the static plant database.

**Preconditions**: A valid `plantId` references an existing plant in the database.

**Expected outcome**: All metadata fields are displayed in a readable, compact layout.

**Edge cases**:
- Plants with `daysToMaturity: null` display "Perennial" or "N/A" instead of a number.
- Hardiness zones where min equals max display as a single value (e.g., "Zone 10").

---

### BEAM-FP-024: Planting status can be changed (planned -> planted -> harvested)

**Behavior**: Users can change a planting's status through its lifecycle stages.

**Event**: User selects a new status from the status dropdown in the planting detail view.

**Action**: The planting's `status` field is updated in `projectStore.plantings`. The status badge color updates to reflect the new state. An undo snapshot is captured.

**Model**:
- `Planting.status` updated to the new value.
- `zundo` captures a snapshot.

**Preconditions**: A planting is expanded in the planting panel.

**Expected outcome**: The status badge immediately reflects the new status with the corresponding color.

**Edge cases**:
- Status transitions are not enforced in order. A user can change from "planned" directly to "harvested" or set "removed" at any time. The progression (planned -> planted -> growing -> harvested -> removed) is suggested by the dropdown order but not enforced.
- Changing status back to a previous state (e.g., "harvested" back to "growing") is allowed.

---

### BEAM-FP-025: plantingsForZone selector returns only that zone's plantings

**Behavior**: The `plantingsForZone` selector efficiently returns only the plantings belonging to a specific zone.

**Event**: Any component subscribes to `plantingsForZone(state, zoneId)`.

**Action**: The selector filters `state.plantings` to return only entries where `planting.zoneId === zoneId`. The result is a new array on every call (no memoization at the selector level; React component memoization handles re-render optimization).

**Model**: No state change. This is a read-only derived value.

**Preconditions**: `projectStore.plantings` exists (always true, may be an empty array).

**Expected outcome**: Returns an array of `Planting` objects, all with `zoneId` matching the argument. Returns an empty array if no plantings match.

**Edge cases**:
- Passing a `zoneId` that does not exist in `projectStore.zones` returns an empty array (no error thrown).
- Passing `null` or `undefined` as `zoneId` returns an empty array.
- Performance is O(n) over the plantings array. With typical project sizes (hundreds of plantings at most), this is negligible.
