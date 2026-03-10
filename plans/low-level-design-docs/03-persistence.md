# LLD 03: Persistence

## Overview

All data persists client-side in IndexedDB via the Dexie library. There is no backend server. The persistence layer handles saving/loading projects, auto-save, project lifecycle management, and JSON import/export.

---

## 1. Dexie Database Schema

### Database Name

`GardenPlannerDB`

### Version 1 Schema

```
projects: id, name, data, createdAt, updatedAt
```

| Column      | Type     | Description                                         |
| ----------- | -------- | --------------------------------------------------- |
| `id`        | `string` | Primary key. Matches `ProjectState.id` (nanoid).    |
| `name`      | `string` | Indexed. Project display name for listing.          |
| `data`      | `string` | Full `ProjectState` serialized as JSON.             |
| `createdAt` | `string` | ISO datetime. Indexed for sort order.               |
| `updatedAt` | `string` | ISO datetime. Indexed for sort order.               |

### Indexes

- Primary key: `id`
- Index on `name` (for display/search in project list)
- Index on `updatedAt` (for sorting by last modified)

### Meta Table

A separate table stores application-level metadata (not per-project):

```
meta: key
```

| Column  | Type     | Description                        |
| ------- | -------- | ---------------------------------- |
| `key`   | `string` | Primary key (e.g., `'lastProjectId'`). |
| `value` | `any`    | Associated value.                  |

This table stores the `lastProjectId` so the app can reopen the most recent project on launch.

### Database Class

```typescript
class GardenPlannerDB extends Dexie {
  projects!: Table<ProjectRecord>;
  meta!: Table<MetaRecord>;

  constructor() {
    super('GardenPlannerDB');
    this.version(1).stores({
      projects: 'id, name, updatedAt',
      meta: 'key',
    });
  }
}
```

### Record Types

```typescript
interface ProjectRecord {
  id: string;
  name: string;
  data: string;       // JSON-serialized ProjectState
  createdAt: string;
  updatedAt: string;
}

interface MetaRecord {
  key: string;
  value: any;
}
```

---

## 2. projectRepo Module

The `projectRepo` module provides the interface between the application and the Dexie database. All functions are async and return Promises.

### Functions

#### `saveProject(state: ProjectState): Promise<void>`

Serializes the full `ProjectState` to JSON and upserts into the `projects` table. Uses Dexie's `put()` (insert or replace by primary key).

Steps:
1. Serialize `state` to JSON string (excluding action functions — only plain data).
2. Build a `ProjectRecord` with `id`, `name`, `data` (JSON string), `createdAt`, and `updatedAt` from the state.
3. Call `db.projects.put(record)`.

#### `loadProject(id: string): Promise<ProjectState | null>`

Retrieves a project by ID and deserializes it.

Steps:
1. Call `db.projects.get(id)`.
2. If not found, return `null`.
3. Parse `record.data` from JSON back into a `ProjectState` object.
4. Return the deserialized state.

#### `listProjects(): Promise<ProjectListItem[]>`

Returns a summary list of all projects for the project switcher UI.

```typescript
interface ProjectListItem {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}
```

Steps:
1. Call `db.projects.orderBy('updatedAt').reverse().toArray()`.
2. Map each record to `{ id, name, createdAt, updatedAt }` (omit `data` to avoid loading full state).

#### `deleteProject(id: string): Promise<void>`

Removes a project from the database.

Steps:
1. Call `db.projects.delete(id)`.

#### `getLastProjectId(): Promise<string | null>`

Retrieves the last-used project ID from the meta table.

Steps:
1. Call `db.meta.get('lastProjectId')`.
2. Return `record.value` if found, otherwise `null`.

#### `setLastProjectId(id: string): Promise<void>`

Stores the last-used project ID.

Steps:
1. Call `db.meta.put({ key: 'lastProjectId', value: id })`.

---

## 3. Auto-Save

### `useAutoSave` Hook

A React hook that subscribes to projectStore changes and debounces writes to IndexedDB.

#### Behavior

1. On mount, the hook calls `projectStore.subscribe()` to listen for state changes.
2. When the store state changes, a debounce timer (1000ms) starts or resets.
3. After 1000ms of no further changes, the current state is saved via `projectRepo.saveProject()`.
4. The hook also calls `projectRepo.setLastProjectId()` with the current project ID.
5. On unmount, the subscription is cleaned up and any pending debounce is flushed (to avoid losing the last edit).

#### Skip Conditions

The auto-save skips if:
- The store is in its initial loading state (a flag `_isLoading` is temporarily set during `loadProject` to prevent saving the partially-loaded state back).
- The project ID is empty or undefined (defensive guard).

#### Debounce Implementation

Uses a simple `setTimeout`/`clearTimeout` pattern. No external debounce library needed.

```
let timer: ReturnType<typeof setTimeout> | null = null;

const debouncedSave = (state: ProjectState) => {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    projectRepo.saveProject(state);
    projectRepo.setLastProjectId(state.id);
  }, 1000);
};
```

#### Flush on Unmount

On component unmount (or before page unload), if there is a pending timer, it fires the save immediately to prevent data loss:

```
useEffect(() => {
  return () => {
    if (timer) {
      clearTimeout(timer);
      projectRepo.saveProject(projectStore.getState());
    }
  };
}, []);
```

---

## 4. Project Lifecycle

### App Startup

1. `useAutoSave` hook mounts.
2. Call `projectRepo.getLastProjectId()`.
3. If an ID is returned:
   a. Call `projectRepo.loadProject(id)`.
   b. If the project exists, call `projectStore.loadProject(state)`.
   c. If the project was deleted (returns null), fall through to step 4.
4. If no last project ID or project not found:
   a. The store remains at its default state (new empty project).
   b. The default project is auto-saved on the next debounce cycle.

### Create New Project

Triggered from the project panel UI.

1. Save the current project immediately: `projectRepo.saveProject(projectStore.getState())`.
2. Call `projectStore.resetProject()` to generate a new default project with a fresh ID.
3. The new project will be auto-saved by the debounce cycle.
4. `setLastProjectId` is updated by auto-save.

### Switch Project

Triggered from the project list UI.

1. Save the current project: `projectRepo.saveProject(projectStore.getState())`.
2. Load the target project: `projectRepo.loadProject(targetId)`.
3. Call `projectStore.loadProject(state)` with the loaded state.
4. Call `projectRepo.setLastProjectId(targetId)`.

### Delete Project

Triggered from the project list UI.

1. Call `projectRepo.deleteProject(id)`.
2. If the deleted project is the currently loaded project:
   a. Call `projectRepo.listProjects()`.
   b. If other projects exist, load the most recently updated one (switch project flow).
   c. If no other projects exist, call `projectStore.resetProject()` to start fresh.
3. If the deleted project is not the current project, no further action needed.

---

## 5. JSON Import/Export

### Export

Triggered from the project panel UI ("Export Project" button).

1. Read the current state from `projectStore.getState()`.
2. Extract only the data fields (strip action functions).
3. Serialize to a formatted JSON string: `JSON.stringify(data, null, 2)`.
4. Create a `Blob` with type `application/json`.
5. Create a temporary download link via `URL.createObjectURL`.
6. Set the filename to `{projectName}.garden.json` (sanitize name for filesystem safety).
7. Trigger the download by programmatically clicking the link.
8. Revoke the object URL.

### Import

Triggered from the project panel UI ("Import Project" button / file input).

1. User selects a `.json` file via a file input element.
2. Read the file contents via `FileReader` as text.
3. Parse the JSON string.
4. Validate the parsed object against the expected `ProjectState` shape:
   - Required fields: `id`, `name`, `units`, `zones`, `features`, `plantings`, `measurements`.
   - `zones` must be an array; each zone must have `id`, `name`, `points` (array of Point).
   - `features` must be an array; each feature must have `id`, `templateId`, `position`.
   - `plantings` must be an array; each planting must have `id`, `zoneId`, `plantId`.
   - `units` must be `'imperial'` or `'metric'`.
5. If validation fails, display an error message to the user. Do not load the data.
6. If validation succeeds:
   a. Generate a new `id` for the imported project (to avoid collision with existing projects).
   b. Set `createdAt` and `updatedAt` to the current datetime.
   c. Save the current project: `projectRepo.saveProject(projectStore.getState())`.
   d. Call `projectStore.loadProject(importedState)`.
   e. The imported project is auto-saved by the debounce cycle.

### Validation Helper

```typescript
function validateProjectData(data: unknown): { valid: boolean; errors: string[] }
```

Returns a list of specific validation errors for user feedback (e.g., "Missing required field: zones", "Invalid unit system: 'meters'").

---

## 6. Error Handling

### IndexedDB Errors

- **QuotaExceededError**: If the browser's storage quota is full, display a user-facing error message suggesting the user delete unused projects or export and clear data.
- **Database blocked**: If the database version upgrade is blocked by another open tab, display a message asking the user to close other tabs.
- **General read/write failures**: Caught with try/catch around all Dexie operations. Errors are logged to the console and a toast notification informs the user that the save failed.

### Data Integrity

- On load, if JSON parsing fails for a stored project, the record is considered corrupt. The user is notified and offered the option to delete the corrupt entry.
- The `data` field is always a complete snapshot of `ProjectState`. There are no partial updates or diffs — this simplifies recovery and avoids state corruption from interrupted writes.

---

## 7. File Organization

```
src/persistence/
  db.ts               — Dexie database class and schema definition
  projectRepo.ts      — CRUD functions for projects and meta
  useAutoSave.ts      — React hook for debounced auto-save
  validation.ts       — JSON import validation logic
```
