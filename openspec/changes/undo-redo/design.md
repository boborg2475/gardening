## Context

The projectStore is already wrapped with zundo's temporal middleware from Phase 1, providing automatic state snapshots on every mutation. However, the undo/redo functionality is not yet exposed to users — no keyboard shortcuts, no toolbar buttons, and no drag batching to prevent drag operations from flooding the history.

## Goals / Non-Goals

**Goals:**
- Expose undo/redo via keyboard shortcuts and toolbar buttons
- Implement drag batching so each drag is a single undo step
- Build a global keyboard shortcut system that handles all app shortcuts
- Add undo/redo toolbar buttons with reactive disabled states

**Non-Goals:**
- Branching undo history (standard linear undo only)
- Undo for UI state changes (tool switches, pan/zoom, selection)
- Custom undo descriptions or history panel

## Decisions

### 1. Single global keydown listener

All keyboard shortcuts are handled by one `keydown` listener on `window`, registered in a `useKeyboardShortcuts` hook. The handler matches against a shortcut map and dispatches to store actions.

**Why not per-component listeners?** A single listener is simpler to maintain, avoids registration/cleanup bugs, and ensures consistent priority ordering.

### 2. Input guard via activeElement check

Before processing any shortcut, the handler checks `document.activeElement.tagName` against INPUT, TEXTAREA, and elements with `contentEditable`. If matched, the handler returns early.

**Why:** Prevents shortcuts from interfering with text entry. Users typing "Z" in a zone name input should not trigger the zone tool.

### 3. Drag batching with pause/resume

On drag start (pointerdown on a draggable element): call `temporalStore.pause()`. During drag: mutations proceed but no snapshots captured. On drag end (pointerup): call `temporalStore.resume()` and force a snapshot.

**Why:** Without batching, a single drag generates 30-100 snapshots. With batching, one Ctrl+Z undoes the entire drag.

### 4. Reactive button disabled state via temporal store subscription

Toolbar undo/redo buttons subscribe to `pastStates.length` and `futureStates.length` from the temporal store. Buttons are disabled (dimmed, non-interactive) when their respective stack is empty.

## Risks / Trade-offs

- **Shortcut conflicts with browser defaults** → Call `event.preventDefault()` for all handled shortcuts to suppress browser behavior (Ctrl+Z browser undo, Ctrl+S save dialog, Backspace navigation).
- **Modal dialogs should block shortcuts** → Check `uiStore.activeDialog === null` before dispatching undo/redo to avoid undoing while a dialog is open.
