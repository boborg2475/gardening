## Context

Garden Yard Planner currently stores project data in IndexedDB via Dexie, and the persistence layer (`projectRepo`) already supports multiple records with `listProjects`, `deleteProject`, `loadProject`, `saveProject`, and last-used tracking via a `meta` table. The `projectStore` (Zustand + zundo) has `loadProject` and `resetProject` actions. However, no UI exists for users to manage multiple projects -- the app simply auto-loads the last-used project on startup and auto-saves to it.

This change adds the user-facing UI and supporting logic to create, switch between, rename, and delete projects.

## Goals / Non-Goals

**Goals:**
- Allow users to create new projects from a fresh default state
- Allow users to switch between existing projects with automatic save of the current project before loading another
- Allow users to rename projects inline
- Allow users to delete projects with a confirmation step to prevent accidental data loss
- Auto-load the last-used project on app startup; show the project list if no projects exist
- Display a project list sorted by last-modified date with project name and date metadata

**Non-Goals:**
- Project duplication or cloning (can be added later)
- Project templates or starter layouts
- Cloud sync or multi-device support (app remains client-side only)
- Project sharing between users (JSON import/export already exists separately)
- Tagging, searching, or filtering projects (premature for initial release)
- Thumbnail previews of project canvases

## Decisions

### 1. Project list as a sidebar panel

The project list will be a new sidebar panel (`ProjectListPanel`) accessed via a new `PanelType` value `'projects'`. This is consistent with the existing panel-based navigation (project, zones, features, plantings, layers) and avoids introducing a new layout paradigm like a modal or separate page. The existing `'project'` panel continues to show the current project's settings; the new `'projects'` panel shows the list of all projects.

### 2. Save-before-switch with synchronous gating

When switching projects, the current project must be saved before loading the new one. This will be handled by an explicit `await projectRepo.saveProject(currentState)` call in the switch action rather than relying on the debounced auto-save timer. This prevents data loss if the user switches projects faster than the 1-second debounce window.

### 3. Confirmation dialog for delete only

Deletion is destructive and irreversible, so it requires a confirmation dialog. Create, rename, and switch operations are non-destructive or reversible and do not require confirmation. The confirmation dialog will be a simple React component rendered conditionally, not a browser `confirm()` call, to maintain consistent styling.

### 4. Rename via inline editing

Project rename will use inline text editing directly in the project list row rather than a separate dialog. This provides a lightweight, familiar interaction pattern. Pressing Enter or blurring the input commits the rename; pressing Escape cancels.

### 5. Project switching state on uiStore

A `projectSwitching` boolean flag will be added to `uiStore` to indicate when a project switch is in progress. This prevents user interactions (canvas events, panel changes) during the async save-then-load transition and allows the UI to show a brief loading indicator. The flag is transient and not persisted.

### 6. Undo history cleared on project switch

When loading a different project, the zundo temporal history must be cleared. Undo/redo history belongs to a single editing session on a single project. Carrying history across projects would cause data corruption. The temporal store's `clear()` method will be called after `loadProject`.

### 7. Empty state when no projects exist

On first launch or after deleting all projects, the app will automatically create a new default project and load it, matching current behavior. The project list panel will show this single project.

## Risks / Trade-offs

- **Data loss on failed save-before-switch:** If IndexedDB write fails during a project switch, the current project's unsaved changes could be lost. Mitigation: catch errors during save and abort the switch, showing an error message to the user.
- **PanelType proliferation:** Adding `'projects'` increases the panel enum. This is manageable now but may need grouping or categorization if many more panels are added in the future.
- **No undo for delete:** Once a project is deleted from IndexedDB, it cannot be recovered. The confirmation dialog is the sole safeguard. A future enhancement could implement soft-delete or a recycle bin.
- **Blocking UI during switch:** The `projectSwitching` flag blocks all interaction during the save/load cycle. If IndexedDB operations are slow (large projects, slow devices), this could feel sluggish. In practice, IndexedDB operations on single records are fast (< 50ms typically).
