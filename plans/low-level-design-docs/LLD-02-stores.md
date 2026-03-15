# LLD-02: Zustand Stores

## projectStore
- Zustand store with zundo middleware for undo/redo
- State shape matches ProjectState from LLD-01
- Actions: addShape, updateShape, removeShape, loadProject, setProjectName
- zundo provides `undo()` and `redo()` via temporal store

## uiStore
- Zustand store (no middleware)
- State shape matches UIState from LLD-01
- Not persisted, no undo history
