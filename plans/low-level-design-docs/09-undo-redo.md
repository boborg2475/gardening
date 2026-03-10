# 09 — Undo / Redo

## 1. zundo Integration

`projectStore` is wrapped with the `temporal` middleware from `zundo`. This middleware intercepts every state mutation and automatically captures a snapshot of the full store state before the mutation is applied.

### Store setup

```
projectStore = create(
  temporal(
    (set, get) => ({ ... }),
    { limit: 50 }
  )
)
```

The `temporal` middleware returns an associated temporal store accessible via `useTemporalStore()` (or `projectStore.temporal` outside React). The temporal store exposes:

- `undo()` — restore the most recent past state and push the current state onto the future stack.
- `redo()` — restore the most recent future state and push the current state onto the past stack.
- `pastStates: State[]` — stack of previous states (most recent last).
- `futureStates: State[]` — stack of undone states (most recent last).
- `pause()` — suspend snapshot capture. Mutations still apply but are not recorded.
- `resume()` — resume snapshot capture. The next mutation records a snapshot.

### History limit

The `limit` option is set to **50**. When the 51st snapshot would be pushed, the oldest snapshot is discarded. This prevents unbounded memory growth during long editing sessions. At typical project sizes (dozens of zones/features), 50 snapshots is roughly 1-3 MB, well within acceptable limits.

---

## 2. Keyboard Shortcuts

A global `keydown` event listener is registered in the root `App` component (or a dedicated `useUndoRedoShortcuts` hook) on mount.

### Undo

- **Windows/Linux**: `Ctrl+Z` — `event.ctrlKey && event.key === 'z' && !event.shiftKey`
- **macOS**: `Cmd+Z` — `event.metaKey && event.key === 'z' && !event.shiftKey`

Calls `projectStore.temporal.getState().undo()`.

### Redo

- **Windows/Linux**: `Ctrl+Shift+Z` — `event.ctrlKey && event.key === 'z' && event.shiftKey` (also support `Ctrl+Y` as an alternative: `event.ctrlKey && event.key === 'y'`)
- **macOS**: `Cmd+Shift+Z` — `event.metaKey && event.key === 'z' && event.shiftKey`

Calls `projectStore.temporal.getState().redo()`.

### Guard conditions

- Prevent default browser behavior (`event.preventDefault()`) to avoid the browser's own undo interfering with text inputs.
- Only fire when no modal dialog is open. Check `uiStore.activeDialog === null` before dispatching.
- Do not fire when focus is inside a text input or textarea — let the browser handle native undo for text fields. Check `document.activeElement.tagName` against `INPUT` and `TEXTAREA`.

---

## 3. Drag Batching

### Problem

When the user drags a feature (or zone vertex, or property boundary point), the `pointermove` handler fires on every mouse movement, calling `projectStore.updateFeature()` (or equivalent) each time. Without intervention, zundo captures a snapshot per move event. A single drag could produce 30-100 snapshots, bloating history and making the user press Ctrl+Z dozens of times to undo one drag.

### Solution: pause/resume

1. **Drag start** (`pointerdown` on a draggable element while in select mode):
   - Call `projectStore.temporal.getState().pause()` to suspend snapshot capture.
   - The state at this moment is already the most recent snapshot in `pastStates` (captured on the previous mutation), representing the pre-drag state.

2. **During drag** (`pointermove`):
   - Store mutations proceed normally (position updates), but no snapshots are captured because the temporal store is paused.

3. **Drag end** (`pointerup`):
   - Call `projectStore.temporal.getState().resume()` to re-enable snapshot capture.
   - Immediately trigger a no-op or trivial store write (e.g., `set(state => state)`) to force a snapshot of the post-drag state if zundo does not automatically capture on resume.

**Result**: The history contains exactly two relevant entries — the state before the drag and the state after the drag. One Ctrl+Z undoes the entire drag.

### Applies to

- Feature dragging
- Zone vertex dragging
- Property/house boundary point dragging
- Any future continuous-input operations (e.g., resizing)

---

## 4. What Is Tracked vs. Not Tracked

### Tracked (projectStore — persisted, undoable)

All mutations to project data flow through `projectStore` and are captured by zundo:

| Category | Operations |
|---|---|
| Property boundary | Set, update vertices, clear |
| House | Set, update vertices, clear |
| Zones | Add, update (move, resize, rename, change type), delete |
| Features | Add, update (move, rotate, scale, change properties), delete |
| Plantings | Add, update (change plant, change date, change status), delete |
| Measurements | Add, delete |
| Project settings | Change unit system, project name, etc. |

### Not tracked (uiStore — transient, no undo)

UI state changes are intentionally excluded from undo history:

- Active tool selection (switching between select, draw, measure, etc.)
- Pan and zoom (camera position and zoom level)
- Current selection (which element is selected)
- Layer visibility toggles
- Panel open/close state
- Snap-to-grid toggle
- Active dialog/modal state

**Rationale**: Undoing a tool switch or a pan would be confusing and annoying. Users expect undo to affect their data, not their viewport or tool state.

---

## 5. Undo/Redo UI

### Toolbar buttons

Two buttons in the main toolbar, typically placed together:

- **Undo button**: Left-facing curved arrow icon. Calls `undo()` on click.
- **Redo button**: Right-facing curved arrow icon. Calls `redo()` on click.

### Disabled state

- Undo button is disabled (`disabled` attribute + visually dimmed, `opacity: 0.4`) when `pastStates.length === 0`.
- Redo button is disabled when `futureStates.length === 0`.

The component subscribes to `useTemporalStore(state => state.pastStates.length)` and `useTemporalStore(state => state.futureStates.length)` to reactively enable/disable.

### Tooltips

- Undo: `"Undo (Ctrl+Z)"` (or `"Undo (Cmd+Z)"` on macOS, detected via `navigator.platform` or `navigator.userAgentData`).
- Redo: `"Redo (Ctrl+Shift+Z)"` (or `"Redo (Cmd+Shift+Z)"` on macOS).

---

## 6. History Limits

- **Maximum snapshots**: 50. Configured via the `limit` option in the `temporal()` middleware call.
- **Eviction**: Oldest-first. When the limit is reached, pushing a new snapshot discards the oldest entry from `pastStates`.
- **Redo stack**: The `futureStates` stack is unbounded in length but is capped in practice because it can never exceed the total number of undone steps, which is at most 50. Any new mutation clears `futureStates` entirely (standard undo behavior — branching history is not supported).
- **Memory estimate**: Each snapshot is a shallow clone of the projectStore state object. For a typical project with 20 zones, 50 features, 10 measurements, and 30 plantings, a single snapshot is approximately 20-60 KB serialized. At 50 snapshots, total history memory is roughly 1-3 MB.
