## Why

The app stores all data in IndexedDB which is browser-local and can be cleared by the browser under storage pressure. Users need a way to back up their projects and transfer them between devices. Since there is no backend, JSON export/import is the primary data portability mechanism.

## What Changes

- Add JSON export that serializes the full ProjectState in a versioned envelope and downloads as a .garden.json file
- Add JSON import with file validation, schema migration support, and error handling
- Add export menu UI with Export JSON and Import JSON options
- Add success/error toast notifications for import results

## Capabilities

### New Capabilities
- `json-import-export`: JSON export with versioned envelope, import with validation and migration, export menu UI

### Modified Capabilities

## Impact

- `src/export/` — New directory with exportJson.ts, importJson.ts, migrations.ts modules
- `src/components/` — ExportMenu component, import file input
- `src/persistence/` — Integration with projectRepo for saving imported projects
