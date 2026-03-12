## 1. Type and Store Updates

- [ ] 1.1 Add `'projects'` to the `PanelType` union in `src/types/ui.ts`
- [ ] 1.2 Add `projectSwitching: boolean` state and `setProjectSwitching` action to `uiStore`
- [ ] 1.3 Add `renameProject(name: string)` action to `projectStore` that updates `name` and `updatedAt`

## 2. Persistence Layer Extensions

- [ ] 2.1 Add `renameProject(id: string, name: string)` method to `projectRepo` that updates the name and updatedAt fields of a project record directly in IndexedDB (for renaming non-active projects)
- [ ] 2.2 Add `clearLastProjectId()` method to `projectRepo` for cleanup when all projects are deleted

## 3. Project Switching Logic

- [ ] 3.1 Create `useProjectManager` hook in `src/persistence/` that exposes `createProject`, `switchProject`, `deleteProject`, and `renameProject` functions
- [ ] 3.2 Implement `switchProject`: save current project (explicit, non-debounced), load target project into store, clear undo history, update last-used ID, manage `projectSwitching` flag
- [ ] 3.3 Implement `createProject`: save current project, reset store to default state, save new project, update last-used ID
- [ ] 3.4 Implement `deleteProject`: delete from IndexedDB, switch to next project or create default if none remain
- [ ] 3.5 Implement `renameProject`: update name in store (if active) or IndexedDB (if inactive), refresh project list

## 4. Startup Auto-Load

- [ ] 4.1 Create `useStartupLoader` hook in `src/persistence/` that reads `lastProjectId`, loads the corresponding project, or creates a default project if none exists
- [ ] 4.2 Integrate `useStartupLoader` into `AppLayout` so it runs on mount before the canvas renders

## 5. ProjectListPanel Component

- [ ] 5.1 Create `ProjectListPanel` component in `src/components/panels/` with CSS Module
- [ ] 5.2 Render project rows with name, last-modified date, active indicator, and delete button
- [ ] 5.3 Implement "New Project" button at the top of the panel
- [ ] 5.4 Implement inline rename (double-click to edit, Enter to commit, Escape to cancel, blur to commit, empty validation)
- [ ] 5.5 Implement delete button per row that opens a confirmation dialog

## 6. Delete Confirmation Dialog

- [ ] 6.1 Create `DeleteConfirmDialog` component in `src/components/shared/` with CSS Module
- [ ] 6.2 Accept `projectName`, `onConfirm`, and `onCancel` props
- [ ] 6.3 Render modal overlay with project name, confirm button, and cancel button

## 7. Sidebar and Toolbar Integration

- [ ] 7.1 Add "Projects" navigation entry to the `Sidebar` component linking to the `'projects'` panel
- [ ] 7.2 Conditionally render `ProjectListPanel` when `activePanel === 'projects'`
- [ ] 7.3 Disable toolbar and sidebar interactions when `projectSwitching` is `true`

## 8. Canvas Interaction Guard

- [ ] 8.1 Add check in canvas pointer event handlers to skip processing when `uiStore.projectSwitching` is `true`

## 9. Tests

- [ ] 9.1 Write tests for `uiStore` additions (`projectSwitching` state and `setProjectSwitching` action, `'projects'` panel type)
- [ ] 9.2 Write tests for `projectStore` `renameProject` action
- [ ] 9.3 Write tests for `projectRepo.renameProject` method
- [ ] 9.4 Write tests for `useProjectManager` hook (create, switch, delete, rename flows)
- [ ] 9.5 Write tests for `useStartupLoader` hook (existing project, stale ID, first launch)
- [ ] 9.6 Write tests for `ProjectListPanel` component (rendering list, create, rename, delete trigger)
- [ ] 9.7 Write tests for `DeleteConfirmDialog` component (confirm and cancel actions)
