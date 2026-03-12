## Context

Projects are persisted in IndexedDB via Dexie with auto-save. Users have no way to extract their data or load data from another source. JSON export/import provides lossless round-trip data portability using browser-native APIs (Blob, FileReader, URL.createObjectURL).

## Goals / Non-Goals

**Goals:**
- Export full project state as human-readable JSON with schema version for forward compatibility
- Import JSON files with validation, error reporting, and schema migration
- Provide simple export menu UI accessible from the toolbar

**Non-Goals:**
- PNG or PDF export (separate change: png-pdf-export)
- Cloud sync or sharing
- Partial import/merge of project data

## Decisions

### 1. Versioned envelope wrapping ProjectState
The exported JSON wraps the raw ProjectState in an envelope with `version` and `exportedAt` fields. This enables future schema migrations without breaking existing exports.

### 2. New project ID on import
Imported projects get a new UUID to avoid collisions with existing projects. The name is appended with " (imported)" to distinguish from the original.

### 3. Sequential migration functions
Migrations are pure functions keyed by version number: `migrateV1toV2(data) => data`. They run sequentially from the file's version to the current version.

### 4. File download via hidden anchor element
Export creates a Blob, generates an object URL, programmatically clicks a hidden `<a download>` element, then revokes the URL. This is the standard browser pattern for triggering downloads without a server.

## Risks / Trade-offs

- **Large projects may block main thread during JSON.stringify** → Acceptable for v1. Could move to Web Worker in future if needed.
- **No cloud backup** → JSON export is the only backup mechanism. Users should be encouraged to export periodically.
