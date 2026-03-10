# BEAM Specs: Export, PWA, Layout, Layers, and Keyboard Shortcuts

Format: **B**ehavior, **E**vent, **A**ction, **M**odel -- plus preconditions, expected outcome, and edge cases.

---

## Export Specs

### BEAM-EL-001: JSON export downloads project as .garden.json file

- **Behavior**: User can export the current project as a JSON file.
- **Event**: User clicks "Export JSON" in the export menu.
- **Action**: System serializes the full ProjectState, wraps it in a versioned envelope, creates a Blob, and triggers a browser download.
- **Model**: No state changes. Read-only operation on `projectStore`.
- **Preconditions**: A project is loaded.
- **Expected Outcome**: Browser downloads a file named `{projectName}.garden.json` containing valid JSON with the complete project data.
- **Edge Cases**:
  - Project name contains special characters: sanitized to alphanumeric and hyphens in the filename.
  - Empty project (no zones/features): exports successfully with empty arrays.

---

### BEAM-EL-002: JSON export includes version field for migrations

- **Behavior**: The exported JSON contains a schema version number.
- **Event**: JSON export is triggered (same as BEAM-EL-001).
- **Action**: System includes `"version": <current_schema_version>` at the top level of the JSON envelope.
- **Model**: Version number is a constant defined in the export module.
- **Preconditions**: None.
- **Expected Outcome**: The JSON file contains a `version` field with an integer value (e.g., `1`).
- **Edge Cases**: None.

---

### BEAM-EL-003: JSON import creates new project from valid file

- **Behavior**: User can import a previously exported JSON file to create a new project.
- **Event**: User clicks "Import JSON", selects a valid `.garden.json` file from the file picker.
- **Action**: System reads the file, validates the structure, generates a new project ID, saves to IndexedDB, and loads the project.
- **Model**: New project added to IndexedDB. `projectStore` updated with the imported project data.
- **Preconditions**: User selects a file that passes validation.
- **Expected Outcome**: A new project appears with the name `"{originalName} (imported)"`. All zones, features, and plantings from the file are present. A success toast is shown.
- **Edge Cases**:
  - Importing the same file twice: creates two separate projects with unique IDs.
  - File version is older than current: migration functions run before import.

---

### BEAM-EL-004: JSON import rejects file missing required fields

- **Behavior**: Invalid JSON files are rejected with a clear explanation.
- **Event**: User selects a JSON file that is missing required fields (e.g., no `zones` array).
- **Action**: System validates the parsed JSON against required field list. Validation fails. No project is created.
- **Model**: No state changes.
- **Preconditions**: File is valid JSON but missing required project fields.
- **Expected Outcome**: No project is created. Error message displayed listing the missing fields.
- **Edge Cases**:
  - File is not valid JSON at all: different error message ("not valid JSON").
  - File is valid JSON but not a Garden Planner export (e.g., a random JSON file): missing fields are listed.

---

### BEAM-EL-005: JSON import shows error message for invalid files

- **Behavior**: User-friendly error messages are shown for all import failure modes.
- **Event**: User selects an invalid file for import.
- **Action**: System displays a toast or dialog with a descriptive error message.
- **Model**: No state changes.
- **Preconditions**: File fails validation at any stage.
- **Expected Outcome**:
  - Non-JSON file: "The selected file is not valid JSON."
  - Missing required fields: "This file is missing required data: {fieldList}. It may not be a Garden Planner export."
  - Newer version: "This file was created with a newer version of Garden Planner. Please update the app."
- **Edge Cases**: File read error (e.g., file removed during read): "Could not read the selected file."

---

### BEAM-EL-006: PNG export renders visible layers to image

- **Behavior**: Exported PNG contains all currently visible layers.
- **Event**: User clicks "Export PNG" and confirms options.
- **Action**: System creates an offscreen canvas, renders all visible layers, converts to PNG blob, triggers download.
- **Model**: No state changes.
- **Preconditions**: A project is loaded.
- **Expected Outcome**: Browser downloads `{projectName}.png`. The image contains all objects from visible layers, properly positioned. Hidden layers are not rendered.
- **Edge Cases**:
  - All layers hidden: exports a blank canvas (with optional grid/background).
  - Very large project: canvas size clamped to browser maximum; scale adjusted down.

---

### BEAM-EL-007: PNG export respects "include grid" option

- **Behavior**: The grid is included or excluded from the PNG based on user choice.
- **Event**: User toggles the "Include grid" checkbox in the PNG export options dialog.
- **Action**: If checked, the grid renderer draws to the offscreen canvas before other layers. If unchecked, grid rendering is skipped.
- **Model**: Checkbox state is local to the dialog; not persisted.
- **Preconditions**: PNG export options dialog is open.
- **Expected Outcome**:
  - Checked: PNG shows grid lines behind the project content.
  - Unchecked: PNG shows no grid lines.
- **Edge Cases**: Grid layer is hidden in the main viewport but "include grid" is checked in export: grid is still rendered in the export (export option overrides viewport layer state for grid).

---

### BEAM-EL-008: PDF export generates downloadable PDF with map

- **Behavior**: User can export the project as a PDF document.
- **Event**: User clicks "Export PDF" and confirms options.
- **Action**: System renders map to offscreen canvas, creates a jsPDF document, adds the map image, triggers download.
- **Model**: No state changes.
- **Preconditions**: A project is loaded.
- **Expected Outcome**: Browser downloads `{projectName}.pdf`. The PDF contains the map image fitted within the page margins.
- **Edge Cases**:
  - Wide map with portrait orientation selected: map is scaled to fit width, potentially leaving vertical whitespace.
  - "Auto" orientation: landscape chosen if map width > height, portrait otherwise.

---

### BEAM-EL-009: PDF export includes project title and date

- **Behavior**: The PDF header shows the project name and export date.
- **Event**: PDF export completes (same as BEAM-EL-008).
- **Action**: System adds project name as a title (16pt bold) and the current date (10pt) above the map image on the PDF page.
- **Model**: Date is generated at export time using the locale date format.
- **Preconditions**: None.
- **Expected Outcome**: PDF first page shows the project name and date in the header area, above the map image.
- **Edge Cases**: Very long project name (>60 characters): truncated with ellipsis.

---

### BEAM-EL-010: Export filenames use project name

- **Behavior**: All exported files use the project name as the base filename.
- **Event**: Any export is triggered.
- **Action**: System sanitizes the project name (replace non-alphanumeric characters except hyphens and spaces with hyphens, trim) and uses it as the filename base.
- **Model**: Filename is derived from `projectStore.name`.
- **Preconditions**: Project has a name.
- **Expected Outcome**:
  - JSON: `My Garden.garden.json`
  - PNG: `My Garden.png`
  - PDF: `My Garden.pdf`
- **Edge Cases**:
  - Project name is empty string: fallback to `untitled`.
  - Project name contains only special characters: fallback to `untitled`.

---

## PWA Specs

### BEAM-EL-011: App registers service worker on load

- **Behavior**: A service worker is registered when the app first loads.
- **Event**: App mounts in the browser.
- **Action**: The PWA registration module (from vite-plugin-pwa) registers the generated service worker. The SW installs and precaches all static assets.
- **Model**: Service worker state managed by the browser. No app state changes.
- **Preconditions**: Browser supports service workers. App is served over HTTPS (or localhost).
- **Expected Outcome**: `navigator.serviceWorker.controller` is set after registration. All static assets are cached.
- **Edge Cases**:
  - Browser does not support service workers: registration silently skipped; app works normally without offline capability.
  - Registration fails (e.g., SW script error): error logged to console; app works normally.

---

### BEAM-EL-012: App works fully offline after first load

- **Behavior**: All app features function without a network connection after the initial visit.
- **Event**: User loads the app once (service worker installs), then goes offline.
- **Action**: All subsequent page loads and interactions are served from the service worker cache and IndexedDB.
- **Model**: No network requests needed. All data is local.
- **Preconditions**: Service worker has successfully installed and precached assets.
- **Expected Outcome**: User can create projects, draw, place features, export files, and perform all other operations without any network connectivity.
- **Edge Cases**:
  - Browser clears cache/storage: app must be reloaded online to re-cache.
  - IndexedDB quota exceeded: save operations fail with an error message.

---

### BEAM-EL-013: Install banner appears on supported browsers

- **Behavior**: A banner prompts users to install the app on browsers that support PWA installation.
- **Event**: Browser fires the `beforeinstallprompt` event.
- **Action**: App captures the event, checks localStorage for prior dismissal. If not dismissed, shows the install banner.
- **Model**: `beforeinstallprompt` event stored in a ref. Banner visibility is component state.
- **Preconditions**: Browser supports `beforeinstallprompt` (Chromium-based browsers). App is not already installed. User has not previously dismissed the banner.
- **Expected Outcome**: A banner appears at the top of the screen with "Install Garden Planner for offline use" text and Install/Dismiss buttons.
- **Edge Cases**:
  - Firefox/Safari: event never fires; banner never shows.
  - App already installed in standalone mode: event does not fire.

---

### BEAM-EL-014: Dismissing install banner persists across sessions

- **Behavior**: Once dismissed, the install banner does not appear again.
- **Event**: User clicks "Dismiss" on the install banner.
- **Action**: System sets `localStorage.setItem('installBannerDismissed', 'true')` and hides the banner.
- **Model**: Dismissal persisted in localStorage.
- **Preconditions**: Install banner is visible.
- **Expected Outcome**: Banner disappears immediately. On subsequent visits, the banner does not reappear.
- **Edge Cases**:
  - localStorage cleared: banner will reappear on next qualifying visit.
  - localStorage unavailable (private browsing in some browsers): banner shows every session.

---

### BEAM-EL-015: Update toast appears when new version available

- **Behavior**: Users are notified when a new version of the app is available.
- **Event**: Service worker detects a new version is waiting to activate (`needRefresh` becomes true).
- **Action**: System displays a toast notification at the bottom of the screen.
- **Model**: `needRefresh` state from `useRegisterSW` hook.
- **Preconditions**: A service worker is registered and a newer version has been fetched.
- **Expected Outcome**: Toast appears with text "A new version is available" and an "Update" button.
- **Edge Cases**:
  - User ignores the toast: it remains visible but unobtrusive. App continues to work on the current version.
  - Toast dismissed via X button: user can update later by manually refreshing.

---

### BEAM-EL-016: Clicking update toast refreshes to new version

- **Behavior**: Clicking the update button activates the new service worker and reloads the app.
- **Event**: User clicks "Update" on the update toast.
- **Action**: System calls `updateServiceWorker(true)`, which posts `SKIP_WAITING` to the waiting service worker and triggers a page reload.
- **Model**: Service worker transitions from waiting to active. Page reloads with new assets.
- **Preconditions**: Update toast is visible. A new service worker is in the waiting state.
- **Expected Outcome**: Page reloads. After reload, the app runs the latest version. Toast no longer appears.
- **Edge Cases**:
  - User has unsaved changes: auto-save (debounced 1s) should have already persisted recent changes to IndexedDB. Data survives the reload.

---

### BEAM-EL-017: Web manifest provides correct app metadata

- **Behavior**: The web manifest provides metadata for app installation and display.
- **Event**: Browser reads `/manifest.json` (linked from `index.html`).
- **Action**: Browser uses manifest data for install prompts, splash screens, and standalone display.
- **Model**: Static file, no runtime state.
- **Preconditions**: `manifest.json` is present and linked in `index.html`.
- **Expected Outcome**: Installed app shows:
  - Name: "Garden Yard Planner"
  - Short name: "GardenPlan"
  - Display: standalone (no browser chrome)
  - Theme color: #2d7a3a (garden green)
  - Icons: 192x192 and 512x512 leaf/plant icons
- **Edge Cases**: Missing icon file: browser falls back to default icon or favicon.

---

## Layout and UI Specs

### BEAM-EL-018: Desktop shows sidebar layout above 768px

- **Behavior**: On viewports 768px wide or greater, the app uses a sidebar layout.
- **Event**: App renders or viewport resizes to >= 768px.
- **Action**: `uiStore.isMobile` is set to `false`. `DesktopLayout` component renders with a 280px sidebar on the left and the canvas filling the remaining space.
- **Model**: `uiStore.isMobile = false`.
- **Preconditions**: None.
- **Expected Outcome**: Sidebar is visible on the left with panel tabs. Canvas occupies the remaining viewport width. Toolbar is at the top of the canvas area.
- **Edge Cases**: Viewport is exactly 768px: desktop layout is used.

---

### BEAM-EL-019: Mobile shows bottom sheet layout below 768px

- **Behavior**: On viewports below 768px, the app uses a full-screen canvas with bottom sheets.
- **Event**: App renders or viewport resizes to < 768px.
- **Action**: `uiStore.isMobile` is set to `true`. `MobileLayout` component renders with a full-screen canvas and a compact toolbar at the bottom.
- **Model**: `uiStore.isMobile = true`.
- **Preconditions**: None.
- **Expected Outcome**: Canvas fills the viewport. Compact toolbar fixed at the bottom. No sidebar visible. Panels accessible via bottom sheets.
- **Edge Cases**: Viewport is exactly 767px: mobile layout is used.

---

### BEAM-EL-020: Sidebar is collapsible on desktop

- **Behavior**: Users can collapse the sidebar to maximize canvas space.
- **Event**: User clicks the sidebar collapse toggle button.
- **Action**: `uiStore.sidebarOpen` is toggled. Sidebar animates to 0px width (collapsed) or 280px (expanded). Canvas resizes accordingly via ResizeObserver.
- **Model**: `uiStore.sidebarOpen` toggled.
- **Preconditions**: Desktop layout is active.
- **Expected Outcome**: Collapsed: sidebar hidden, canvas fills full width, toggle button remains visible (as a small tab on the left edge). Expanded: sidebar visible at 280px.
- **Edge Cases**: None.

---

### BEAM-EL-021: Bottom sheet dismisses on swipe down or backdrop tap

- **Behavior**: Bottom sheets can be dismissed by swiping down or tapping the backdrop.
- **Event**: User swipes down on the sheet (>100px Y delta) or taps the semi-transparent backdrop area.
- **Action**: `uiStore.bottomSheetOpen` set to `false`. Sheet slides down off-screen via CSS transform transition.
- **Model**: `uiStore.bottomSheetOpen = false`, `uiStore.bottomSheetPanel = null`.
- **Preconditions**: A bottom sheet is open (mobile layout).
- **Expected Outcome**: Sheet slides down and disappears. Backdrop fades out. Canvas is fully visible and interactive again.
- **Edge Cases**:
  - Small swipe (<100px): sheet snaps back to open position.
  - User swipes up on sheet: no effect (sheet is already at maximum height).

---

### BEAM-EL-022: Touch targets are minimum 44x44px on mobile

- **Behavior**: All interactive elements meet minimum touch target size on mobile.
- **Event**: N/A (design constraint).
- **Action**: All buttons, toggles, list items, and interactive controls are styled with minimum dimensions of 44x44 CSS pixels on mobile viewports.
- **Model**: CSS sizing rules in component modules.
- **Preconditions**: Mobile layout is active.
- **Expected Outcome**: Users can reliably tap any interactive element without accidental adjacent taps.
- **Edge Cases**: Dense lists (e.g., feature catalog): items have sufficient height with vertical padding to meet 44px minimum.

---

### BEAM-EL-023: Pinch-to-zoom works on touch devices

- **Behavior**: Users can zoom the canvas by pinching with two fingers.
- **Event**: Two touch pointers move simultaneously, changing distance between them.
- **Action**: System calculates the scale factor from the distance delta between frames. Updates `uiStore.zoom` centered on the midpoint of the two touches.
- **Model**: `uiStore.zoom` updated. `uiStore.panOffset` adjusted to keep the zoom centered on the pinch midpoint.
- **Preconditions**: Two pointers are active on the canvas.
- **Expected Outcome**: Spreading fingers zooms in; contracting zooms out. Zoom is centered on the point between the fingers.
- **Edge Cases**:
  - Zoom reaches min/max bounds: clamped, no further zoom in that direction.
  - One finger lifts during pinch: remaining finger transitions to single-finger behavior (pan or drag).

---

### BEAM-EL-024: Two-finger pan works on touch devices

- **Behavior**: Users can pan the canvas by dragging with two fingers.
- **Event**: Two touch pointers move simultaneously in the same direction.
- **Action**: System calculates the midpoint delta between frames and applies it to `uiStore.panOffset`.
- **Model**: `uiStore.panOffset` updated.
- **Preconditions**: Two pointers are active on the canvas.
- **Expected Outcome**: Canvas viewport moves with the two-finger drag direction, regardless of the active tool.
- **Edge Cases**:
  - Simultaneous pinch and pan: both zoom and pan deltas are applied in the same frame.
  - Two-finger drag on a UI element (not canvas): handled by the element's normal scroll/touch behavior, not canvas pan.

---

## Layer Specs

### BEAM-EL-025: Toggling grid layer hides/shows grid

- **Behavior**: The grid can be toggled on and off.
- **Event**: User toggles the grid layer switch in the Layers panel, or presses `G`.
- **Action**: `uiStore.toggleLayer('grid')` flips `layers.grid`. On next render frame, grid renderer checks the flag and skips drawing if false.
- **Model**: `uiStore.layers.grid` toggled.
- **Preconditions**: None.
- **Expected Outcome**: Grid lines disappear immediately when toggled off; reappear when toggled on.
- **Edge Cases**: None.

---

### BEAM-EL-026: Toggling zones layer hides/shows all zones

- **Behavior**: All zones can be hidden or shown as a group.
- **Event**: User toggles the zones layer switch in the Layers panel.
- **Action**: `uiStore.toggleLayer('zones')` flips `layers.zones`. Zone renderer skips all zone drawing when false.
- **Model**: `uiStore.layers.zones` toggled.
- **Preconditions**: At least one zone exists (otherwise toggle has no visible effect).
- **Expected Outcome**: All zone polygons, fills, and labels disappear when toggled off; reappear when toggled on.
- **Edge Cases**: Individual zone visibility is not supported -- this is an all-or-nothing layer toggle.

---

### BEAM-EL-027: All layers default to visible

- **Behavior**: On app load, all layers are visible.
- **Event**: App initializes `uiStore`.
- **Action**: `uiStore.layers` is initialized with all values set to `true`.
- **Model**: `uiStore.layers = { grid: true, property: true, house: true, zones: true, features: true, measurements: true }`.
- **Preconditions**: None.
- **Expected Outcome**: All renderers draw their content on initial load. All layer toggles show as "on" in the Layers panel.
- **Edge Cases**: None.

---

### BEAM-EL-028: Hidden layer objects are not hit-testable

- **Behavior**: Objects on hidden layers cannot be selected or interacted with.
- **Event**: User clicks or taps on a location where a hidden-layer object exists.
- **Action**: Hit-test logic filters out objects whose layer is not visible. The click either selects a visible object at that location or results in no selection.
- **Model**: No change to selection if only hidden objects are under the pointer.
- **Preconditions**: At least one layer is hidden. An object exists on that hidden layer at the click location.
- **Expected Outcome**: The hidden object is not selected. If a visible object is beneath it, that object is selected instead.
- **Edge Cases**: All layers hidden: no object can be selected anywhere.

---

## Keyboard Shortcut Specs

### BEAM-EL-029: Ctrl+Z triggers undo

- **Behavior**: The standard undo shortcut undoes the last state change.
- **Event**: User presses `Ctrl+Z` (Windows/Linux) or `Cmd+Z` (macOS).
- **Action**: System calls `projectStore.temporal.undo()`. Canvas re-renders to reflect the previous state.
- **Model**: `projectStore` reverted to the previous snapshot in the zundo history.
- **Preconditions**: There is at least one action in the undo history. Focus is not in a text input.
- **Expected Outcome**: The last change is undone (e.g., a just-placed feature disappears, a just-moved zone returns to its previous position).
- **Edge Cases**:
  - No undo history: no-op, no error.
  - Focus in text input: shortcut is not intercepted; browser handles it for the text field.

---

### BEAM-EL-030: Ctrl+Shift+Z triggers redo

- **Behavior**: The standard redo shortcut reapplies the last undone action.
- **Event**: User presses `Ctrl+Shift+Z` (Windows/Linux) or `Cmd+Shift+Z` (macOS).
- **Action**: System calls `projectStore.temporal.redo()`. Canvas re-renders to reflect the re-applied state.
- **Model**: `projectStore` advanced to the next snapshot in the zundo redo history.
- **Preconditions**: There is at least one action in the redo history. Focus is not in a text input.
- **Expected Outcome**: The last undone change is reapplied.
- **Edge Cases**:
  - No redo history: no-op.
  - `Ctrl+Y` also triggers redo as an alternate binding.

---

### BEAM-EL-031: Delete key removes selected object

- **Behavior**: Pressing Delete removes the currently selected object.
- **Event**: User presses `Delete` or `Backspace` while an object is selected.
- **Action**: System identifies the selected object from `uiStore.selectedObjectId`, calls the appropriate delete action on `projectStore` (e.g., `removeZone`, `removeFeature`), and clears the selection.
- **Model**: Object removed from `projectStore`. `uiStore.selectedObjectId` set to `null`.
- **Preconditions**: An object is selected. Focus is not in a text input.
- **Expected Outcome**: The selected object is removed from the canvas. Selection is cleared.
- **Edge Cases**:
  - No object selected: no-op.
  - Backspace key: same behavior as Delete (both mapped).
  - Focus in text input: shortcut not intercepted; normal text editing behavior.

---

### BEAM-EL-032: Escape deselects and reverts to select tool

- **Behavior**: Escape cancels the current action or selection.
- **Event**: User presses `Escape`.
- **Action**: Cascading behavior:
  1. If an object is selected: deselect it (`uiStore.selectedObjectId = null`).
  2. If no object is selected and a non-select tool is active: switch to Select tool (`uiStore.activeTool = 'select'`).
  3. If currently drawing a shape (mid-draw): cancel the in-progress shape and revert to the tool's initial state.
- **Model**: `uiStore.selectedObjectId` cleared and/or `uiStore.activeTool` set to `'select'`.
- **Preconditions**: Focus is not in a text input.
- **Expected Outcome**: Current action is cancelled. Repeated presses of Escape eventually return to the default idle state (Select tool, nothing selected).
- **Edge Cases**:
  - Already in select tool with nothing selected: no-op.
  - Bottom sheet or dialog is open: Escape closes the dialog first (dialog handles its own Escape key).

---

### BEAM-EL-033: Shortcuts do not fire when input is focused

- **Behavior**: Keyboard shortcuts are suppressed when the user is typing in a text field.
- **Event**: User presses a shortcut key while focus is in an `<input>`, `<textarea>`, or `contentEditable` element.
- **Action**: The shortcut handler detects the active element type and returns early without handling the event.
- **Model**: No state changes.
- **Preconditions**: A text input element has focus.
- **Expected Outcome**: The key press is handled normally by the text input (e.g., typing "Z" in a zone name input does not switch to the Zone tool).
- **Edge Cases**:
  - Custom input components (e.g., color picker with text input): must use standard `<input>` elements or have `contentEditable` set to be detected.
  - Modifier shortcuts (`Ctrl+Z`) in text inputs: handled by the browser for text undo, not intercepted by the app.

---

### BEAM-EL-034: Tool shortcuts (V, P, H, Z, M) switch active tool

- **Behavior**: Single-letter keys switch the active drawing/interaction tool.
- **Event**: User presses `V`, `P`, `H`, `Z`, `F`, or `M` with no modifier keys.
- **Action**: `uiStore.setActiveTool(toolName)` is called with the corresponding tool. The toolbar visually updates to highlight the active tool.
- **Model**: `uiStore.activeTool` updated.
- **Preconditions**: Focus is not in a text input. No modifier keys (`Ctrl`, `Cmd`, `Shift`, `Alt`) are held.
- **Expected Outcome**:
  - `V` or `1`: Select tool
  - `P`: Draw Property
  - `H`: Draw House
  - `Z`: Draw Zone
  - `F`: Place Feature
  - `M`: Measure
- **Edge Cases**:
  - Tool already active: no-op (no state change, no side effects).
  - `Z` with Ctrl held: not intercepted (Ctrl+Z is undo, handled separately).

---

### BEAM-EL-035: G toggles grid visibility

- **Behavior**: Pressing `G` toggles the grid layer on and off.
- **Event**: User presses `G` with no modifier keys.
- **Action**: `uiStore.toggleLayer('grid')` is called. Grid visibility flips.
- **Model**: `uiStore.layers.grid` toggled.
- **Preconditions**: Focus is not in a text input. No modifier keys held.
- **Expected Outcome**: Grid lines appear or disappear on the canvas. The grid toggle in the Layers panel reflects the new state.
- **Edge Cases**: None.
