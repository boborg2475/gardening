# Phase 1, Sub-PR 3: Persistence

## Scope

Dexie IndexedDB schema, projectRepo CRUD module, debounced auto-save hook. No JSON import/export validation — that comes in Phase 3.

## Dependencies to Install

- `dexie` — IndexedDB wrapper
- `fake-indexeddb` (dev) — IndexedDB polyfill for tests

## Files to Create

### Persistence (`src/persistence/`)
- `db.ts` — Dexie database class with projects + meta tables
- `projectRepo.ts` — saveProject, loadProject, listProjects, deleteProject, getLastProjectId, setLastProjectId
- `useAutoSave.ts` — React hook: debounced save on projectStore changes, flush on unmount

### Tests (`src/persistence/__tests__/`)
- `projectRepo.test.ts` — All CRUD operations against fake-indexeddb
- `useAutoSave.test.ts` — Debounce behavior, flush on unmount

## Relevant Specs
- LLD-03 (Persistence)
- BEAM-SP-010 through BEAM-SP-015
