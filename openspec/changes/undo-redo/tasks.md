## 1. Undo/Redo Wiring

- [ ] 1.1 Verify temporal middleware is correctly wired on projectStore with limit: 50
- [ ] 1.2 Implement undo/redo keyboard shortcut handlers (Ctrl+Z, Ctrl+Shift+Z, Ctrl+Y)
- [ ] 1.3 Add input guard to skip shortcuts when focus is in text input/textarea/contentEditable
- [ ] 1.4 Add modal guard to skip undo/redo when a dialog is open
- [ ] 1.5 Write tests for undo/redo shortcut handlers

## 2. Drag Batching

- [ ] 2.1 Implement pause/resume calls in drag handlers for features
- [ ] 2.2 Implement pause/resume calls in drag handlers for zone vertices and interior
- [ ] 2.3 Implement pause/resume calls in drag handlers for property/house vertices
- [ ] 2.4 Force snapshot after resume on drag end
- [ ] 2.5 Write tests verifying drag produces exactly one undo step

## 3. Undo/Redo Toolbar Buttons

- [ ] 3.1 Add undo and redo buttons to toolbar with curved arrow icons
- [ ] 3.2 Wire buttons to temporalStore.undo() and temporalStore.redo()
- [ ] 3.3 Implement disabled state (opacity 0.4) when pastStates/futureStates empty
- [ ] 3.4 Add tooltips with keyboard shortcut hints (platform-aware: Ctrl vs Cmd)
- [ ] 3.5 Write tests for button states and click handlers

## 4. Keyboard Shortcut System

- [ ] 4.1 Create useKeyboardShortcuts hook with global keydown listener on window
- [ ] 4.2 Implement shortcut map: V/P/H/Z/F/M for tool switching (no modifiers)
- [ ] 4.3 Implement G for grid toggle
- [ ] 4.4 Implement Delete/Backspace for deleting selected object
- [ ] 4.5 Implement Escape with cascading behavior (deselect → cancel tool → cancel drawing)
- [ ] 4.6 Implement Ctrl+S to prevent browser save dialog
- [ ] 4.7 Implement preventDefault for all handled shortcuts
- [ ] 4.8 Write tests for all keyboard shortcuts including input guard
