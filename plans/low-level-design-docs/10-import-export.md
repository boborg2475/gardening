# 10 - Import / Export

## Overview

Client-side import and export of project data in three formats: JSON (lossless round-trip), PNG (raster image), and PDF (printable document with metadata). No server involvement; all processing happens in the browser using Blobs, offscreen canvases, and jsPDF.

---

## 1. JSON Export

### Data Shape

The exported JSON is the full `ProjectState` from `projectStore`, wrapped in an envelope:

```
{
  "version": 1,
  "exportedAt": "<ISO-8601 timestamp>",
  "project": { <ProjectState> }
}
```

- `version` is an integer that increments whenever the schema changes. This enables future migration logic on import.
- `exportedAt` is informational only; not used during import.
- `project` contains every field of `ProjectState`: `id`, `name`, `propertyBoundary`, `house`, `zones`, `features`, `plantings`, `settings`, etc.

### Flow

1. Read current state from `projectStore.getState()`.
2. Build envelope object with `version`, `exportedAt`, and `project`.
3. `JSON.stringify(envelope, null, 2)` for human-readable output.
4. Create `new Blob([jsonString], { type: 'application/json' })`.
5. Generate object URL via `URL.createObjectURL(blob)`.
6. Programmatically create an `<a>` element with `href` set to the object URL and `download` set to `{projectName}.garden.json` (sanitize project name: replace non-alphanumeric characters with hyphens).
7. Append to body, click, remove, revoke object URL.

### Edge Cases

- Empty project (no zones, no features): still exports successfully with empty arrays.
- Very large projects: `JSON.stringify` is synchronous and may block the main thread. For v1 this is acceptable; a future optimization could use a Web Worker.

---

## 2. JSON Import

### File Input

- A hidden `<input type="file" accept=".json,.garden.json">` element triggered by the Import menu item.
- On `change` event, read the selected file.

### Validation Pipeline

1. Read file contents via `FileReader.readAsText()`.
2. Parse with `JSON.parse()`. If parsing fails, show error: "The selected file is not valid JSON."
3. Validate envelope structure:
   - Must have `version` (number).
   - Must have `project` (object).
4. Validate required project fields:
   - `id` (string) -- will be regenerated to avoid collisions.
   - `name` (string, non-empty).
   - `zones` (array).
   - `features` (array).
   - `plantings` (array).
5. If any required field is missing, show error: "This file is missing required data: {fieldList}. It may not be a Garden Planner export."

### Schema Migration

- Check `version` field. If less than current version, run migration functions sequentially (e.g., `migrateV1toV2`, `migrateV2toV3`).
- Migration functions are pure: `(oldData) => newData`.
- If version is higher than the app supports, show error: "This file was created with a newer version of Garden Planner. Please update the app."

### Project Creation

1. Generate a new unique `id` (crypto.randomUUID()) to avoid collisions with existing projects.
2. Set `name` to `"{originalName} (imported)"` to distinguish from existing projects.
3. Save to IndexedDB via `projectRepo.save(project)`.
4. Load the new project into `projectStore`.
5. Show success toast: "Project imported successfully."

### Edge Cases

- Duplicate import of the same file: each import creates a new project with a new ID; no conflict.
- Corrupted or partially valid JSON: validation catches missing fields and reports them.
- User cancels file dialog: no action taken (input change event does not fire).

---

## 3. PNG Export

### Offscreen Canvas Setup

1. Compute the bounding box of all project objects (property boundary, house, zones, features). If no objects exist, use a default 800x600 area.
2. Add padding: 50 world-units on each side.
3. Create an `OffscreenCanvas` (or fallback `document.createElement('canvas')`) sized to fit the bounding box at a fixed DPI (default: 2x for retina clarity, configurable).
4. Set up a 2D rendering context with the appropriate transform (translate to offset the bounding box origin, scale for DPI).

### Rendering

1. Fill background based on user option:
   - **White**: `fillRect` with `#ffffff`.
   - **Transparent**: skip fill (PNG supports transparency).
2. If "Include Grid" option is enabled, call the grid renderer.
3. Render layers in order: property boundary, house, zones, features, measurements (if visible). Use the same renderer functions as the live canvas, passing the offscreen context.
4. Skip any layer that is toggled off in `uiStore.layers`, unless the user explicitly chose "Export all layers" (future option).

### Download

1. Convert to blob: `canvas.toBlob(callback, 'image/png')`.
2. Generate object URL, trigger download as `{projectName}.png`.
3. Revoke object URL after download starts.

### Options UI

Presented in a small dialog/popover before export:
- **Include grid**: checkbox, default off.
- **Background**: radio buttons -- White (default) / Transparent.
- **Scale**: dropdown -- 1x, 2x (default), 3x.

### Edge Cases

- Very large canvas (>16384px on a side): clamp to browser max canvas size and adjust scale down. Show warning if clamped.
- Empty project: export a blank canvas with just the grid (if enabled) or a message watermark.

---

## 4. PDF Export

### Library

jsPDF (already a project dependency). No server-side rendering.

### Flow

1. Show options dialog:
   - **Page size**: Letter (8.5x11") or A4 (210x297mm). Default: Letter.
   - **Orientation**: Auto (landscape if map is wider than tall, portrait otherwise), Landscape, Portrait. Default: Auto.
   - **Include legend**: checkbox, default on.
   - **Include grid**: checkbox, default off.
2. Create jsPDF instance with chosen page size and orientation.
3. Render the map to an offscreen canvas (same process as PNG export), sized to fit the printable area of the page minus margins (0.5" margins on all sides).
4. Convert offscreen canvas to data URL (`canvas.toDataURL('image/png')`).
5. Add image to PDF page via `doc.addImage()`, positioned within margins.

### Header and Metadata

- **Title**: project name, top-left of page, 16pt bold.
- **Date**: export date formatted as locale string, below title, 10pt.
- **Page border**: light gray (#cccccc) rectangle around the map image area.

### Legend (Optional)

If "Include legend" is checked and zones exist:
- Rendered below the map image (or on a second page if space is insufficient).
- Each zone: colored square (20x20pt) + zone name + zone type in 10pt text.
- Arranged in two columns if more than 6 zones.

### Download

1. `doc.save('{projectName}.pdf')` triggers browser download.

### Edge Cases

- Map aspect ratio does not match page: center the map image within the printable area, leaving extra whitespace on shorter axis.
- No zones for legend: skip legend section entirely.
- Very long project name: truncate title to 60 characters with ellipsis.

---

## 5. Export Menu

### Location

- **Desktop**: dropdown menu button in the top toolbar, labeled "Export" with a download icon.
- **Mobile**: accessible from the project panel (hamburger menu or project settings section).

### Menu Items

| Item | Icon | Action |
|---|---|---|
| Export JSON | `{ }` icon | Immediately triggers JSON download |
| Export PNG | Image icon | Opens PNG options dialog, then exports |
| Export PDF | Document icon | Opens PDF options dialog, then exports |
| Import JSON | Upload icon | Opens file picker dialog |

### Behavior

- Menu closes after selecting an item.
- During export (PNG/PDF rendering), show a brief loading spinner overlay with "Exporting..." text.
- On success: toast notification "Exported {filename}".
- On error: toast notification with error description.

---

## Module Structure

| Module | Responsibility |
|---|---|
| `src/export/exportJson.ts` | JSON serialization, envelope creation, download trigger |
| `src/export/importJson.ts` | File reading, validation, migration, project creation |
| `src/export/exportPng.ts` | Offscreen canvas setup, rendering, PNG blob download |
| `src/export/exportPdf.ts` | jsPDF document creation, map rendering, metadata, download |
| `src/export/offscreenRenderer.ts` | Shared logic for rendering to an offscreen canvas (used by PNG and PDF) |
| `src/export/migrations.ts` | Schema migration functions keyed by version number |
| `src/components/ExportMenu.tsx` | Export dropdown menu component |
| `src/components/PngOptionsDialog.tsx` | PNG export options dialog |
| `src/components/PdfOptionsDialog.tsx` | PDF export options dialog |

---

## Dependencies

- **jsPDF**: PDF generation (already in project).
- **No other new dependencies** for JSON or PNG export -- all browser-native APIs.
