## Why

Users can draw and edit shapes on the canvas, but mistakes are permanent — there is no way to undo an action or redo it. Without undo/redo, every action is high-stakes and the tool becomes stressful rather than playful. Additionally, power users expect keyboard shortcuts for common actions in any editor-like tool.

## What Changes

- Wire zundo temporal middleware on projectStore for undo/redo with 50-snapshot history limit
- Add Ctrl+Z / Cmd+Z for undo, Ctrl+Shift+Z / Cmd+Shift+Z / Ctrl+Y for redo
- Implement drag batching via pause/resume so drag operations are single undo steps
- Add undo/redo toolbar buttons with disabled states when history is empty
- Add global keyboard shortcut system with input guards (skip when focus is in text fields)
- Add tool switching shortcuts: V (select), P (draw-property), H (draw-house), Z (draw-zone), F (place-feature), M (measure)
- Add utility shortcuts: G (toggle grid), Delete/Backspace (delete selected), Escape (deselect/cancel), Ctrl+S (prevent browser save)

## Capabilities

### New Capabilities
- `undo-redo`: Undo/redo system with zundo temporal middleware, drag batching, toolbar buttons, and history limits
- `keyboard-shortcuts`: Global keyboard shortcut system with tool switching, edit commands, and input guards

### Modified Capabilities

## Impact

- `src/store/` — Wire temporal middleware on projectStore (may already be wrapped), expose undo/redo via temporal store
- `src/hooks/` — useKeyboardShortcuts hook with global keydown listener
- `src/components/layout/` — Undo/redo buttons in toolbar with disabled states and tooltips
- `src/canvas/` — Drag batching integration (pause/resume in drag handlers)
