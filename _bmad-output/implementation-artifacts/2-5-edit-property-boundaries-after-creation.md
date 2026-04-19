# Story 2.5: Edit Property Boundaries After Creation

Status: ready-for-dev

## Story

As a gardener,
I want to edit my property boundaries and dimensions after initial setup,
So that I can refine my map as I learn the exact measurements or make changes to my property.

## Acceptance Criteria

1. **Given** a property with an existing boundary
   **When** the user activates boundary editing mode (FR12)
   **Then** the boundary polygon becomes editable with draggable handles on each vertex
   **And** all precision tools are available (snap, curves, loupe)

2. **Given** the user is editing a boundary
   **When** they move a vertex, add a new point, or remove an existing point
   **Then** the polygon updates in real-time on the canvas

3. **Given** the user has modified the boundary
   **When** they confirm the changes
   **Then** a `PropertyBoundaryUpdated` event is committed with the new geometry
   **And** the materialized state reflects the updated boundary

4. **Given** a property with dimensions
   **When** the user edits the dimensions (width, length, unit)
   **Then** a `PropertyDimensionsUpdated` event is committed
   **And** the grid canvas scale adjusts to match the new dimensions

5. **Given** the user is editing a boundary
   **When** they cancel the edit
   **Then** the boundary reverts to its previous state with no events committed

## Tasks / Subtasks

- [ ] Task 1: Define event schemas for boundary and dimension updates (AC: #3, #4)
  - [ ] Add `PropertyBoundaryUpdated` Zod schema in `src/lib/types/events.ts` with payload: `{ boundary: Polygon; previousBoundary: Polygon }` — stores both new and previous geometry for auditability
  - [ ] Add `PropertyDimensionsUpdated` Zod schema in `src/lib/types/events.ts` with payload: `{ width: number; length: number; unit: 'ft' | 'm'; previousDimensions?: { width: number; length: number; unit: 'ft' | 'm' } }`
  - [ ] Update the event discriminated union to include both new event types
  - [ ] Write unit tests for schema validation (valid updates, missing fields, invalid units)

- [ ] Task 2: Add event reducers for boundary and dimension updates (AC: #3, #4)
  - [ ] Add `PropertyBoundaryUpdated` reducer logic in the materialized state layer — replaces `property.geometry` with the new boundary
  - [ ] Add `PropertyDimensionsUpdated` reducer logic — updates `property.dimensions` with new width/length/unit
  - [ ] On dimension update, trigger grid canvas recalculation (grid scale adjusts to new dimensions)
  - [ ] Ensure reducers produce new state objects (no in-place mutation)
  - [ ] Write unit tests verifying state updates from both event types
  - [ ] Write unit tests verifying correct state from event sequences: create → set boundary → update boundary → update dimensions

- [ ] Task 3: Implement boundary editing state machine (AC: #1, #2, #5)
  - [ ] Create `src/lib/domain/boundary-editing.ts` — pure functions for boundary editing state
  - [ ] Define `BoundaryEditState` type: `{ mode: 'idle' | 'editing' | 'confirming'; originalPolygon: Point[]; editedPolygon: Point[]; selectedVertexIndex: number | undefined; isDirty: boolean }`
  - [ ] Implement `startEditing(currentBoundary: Point[]): BoundaryEditState` — enters editing mode, stores original polygon for cancel/revert
  - [ ] Implement `moveVertex(state: BoundaryEditState, vertexIndex: number, newPosition: Point): BoundaryEditState` — returns new state with updated vertex position
  - [ ] Implement `addVertex(state: BoundaryEditState, afterIndex: number, position: Point): BoundaryEditState` — inserts a new vertex between existing vertices
  - [ ] Implement `removeVertex(state: BoundaryEditState, vertexIndex: number): BoundaryEditState` — removes a vertex (minimum 3 vertices enforced)
  - [ ] Implement `selectVertex(state: BoundaryEditState, vertexIndex: number | undefined): BoundaryEditState` — tracks which vertex is selected
  - [ ] Implement `confirmEdit(state: BoundaryEditState): { polygon: Point[]; previousPolygon: Point[] }` — returns the new and original polygons for event creation
  - [ ] Implement `cancelEdit(state: BoundaryEditState): BoundaryEditState` — reverts to original polygon, returns to idle mode
  - [ ] Write unit tests for all state transitions, edge cases (remove vertex at minimum count, move vertex out of bounds)

- [ ] Task 4: Create boundary editing reactive store (AC: #1, #2, #3, #5)
  - [ ] Create `src/lib/stores/boundary-edit-store.svelte.ts` using Svelte 5 runes
  - [ ] Expose reactive state: `mode`, `editedPolygon`, `selectedVertexIndex`, `isDirty`, `canConfirm` (derived: true when dirty and polygon is valid)
  - [ ] Expose actions that delegate to domain functions: `startEditing(polygon)`, `moveVertex(index, position)`, `addVertex(afterIndex, position)`, `removeVertex(index)`, `selectVertex(index)`, `confirm()`, `cancel()`
  - [ ] The `confirm()` action commits a `PropertyBoundaryUpdated` event via the event store and resets to idle
  - [ ] The `cancel()` action resets to idle with no events committed
  - [ ] Write unit tests for store reactivity and action dispatching

- [ ] Task 5: Create editable boundary canvas components (AC: #1, #2)
  - [ ] Create `src/lib/canvas/map/EditableBoundary.svelte` — Konva component rendering the boundary polygon in edit mode
  - [ ] Render the polygon outline with editable styling (distinct from view-only boundary)
  - [ ] Create `src/lib/canvas/map/VertexHandle.svelte` — draggable Konva `<Circle>` for each vertex
  - [ ] Style vertex handles: filled circles (~8px radius), distinct color (e.g., white fill with colored stroke), cursor changes to grab/grabbing on hover/drag
  - [ ] Highlight the selected vertex with a larger or brighter handle
  - [ ] Create `src/lib/canvas/map/MidpointHandle.svelte` — smaller circles at edge midpoints for adding new vertices
  - [ ] Style midpoint handles: smaller (~5px), semi-transparent, appear on hover over an edge
  - [ ] All components read from the boundary edit store — no business logic in components

- [ ] Task 6: Wire up vertex interaction handlers (AC: #1, #2)
  - [ ] In `VertexHandle.svelte`, attach `on:dragstart`, `on:dragmove`, `on:dragend` handlers
  - [ ] On drag: convert screen coordinates to canvas coordinates, call `moveVertex()` with the new position
  - [ ] Implement real-time polygon update during drag (not just on dragend) for smooth visual feedback
  - [ ] On click (without drag): select the vertex for potential deletion
  - [ ] In `MidpointHandle.svelte`, attach `on:click`/`on:tap` handler — calls `addVertex()` at the midpoint position
  - [ ] Implement vertex deletion: when a vertex is selected, show a "Delete Vertex" button or support a keyboard shortcut (Delete/Backspace)
  - [ ] Ensure precision tools are available during editing: snap-to-grid (Story 1.6), loupe (Story 1.6)
  - [ ] Prevent polygon from becoming invalid during edits (e.g., self-intersecting — warn or prevent)

- [ ] Task 7: Create boundary editing toolbar and confirmation UI (AC: #1, #3, #5)
  - [ ] Create `src/lib/ui/shared/BoundaryEditToolbar.svelte` — floating toolbar shown during boundary editing
  - [ ] Include buttons: "Confirm Changes" (primary), "Cancel" (secondary), "Delete Selected Vertex" (when vertex selected)
  - [ ] Show an indicator when changes are unsaved: "Unsaved changes" badge or dot
  - [ ] "Confirm Changes" button is disabled when no changes have been made (`!isDirty`)
  - [ ] On "Confirm": commit `PropertyBoundaryUpdated` event, exit editing mode, show success feedback
  - [ ] On "Cancel": show confirmation dialog if changes are unsaved ("Discard changes?"), revert boundary
  - [ ] Style with Tailwind CSS v4

- [ ] Task 8: Create dimension editing UI (AC: #4)
  - [ ] Create `src/lib/ui/property/DimensionEditor.svelte` — form for editing property dimensions
  - [ ] Include inputs for width, length, and unit (ft/m dropdown)
  - [ ] Pre-populate with current property dimensions from materialized state
  - [ ] Validate inputs: positive numbers, reasonable ranges
  - [ ] On submit: commit `PropertyDimensionsUpdated` event via event store
  - [ ] After successful commit, grid canvas recalculates scale based on new dimensions
  - [ ] Include cancel option that reverts to current values
  - [ ] Style with Tailwind CSS v4

- [ ] Task 9: Integrate editing mode into property map view (AC: #1, #3, #5)
  - [ ] Add an "Edit Boundary" button to the property map toolbar (visible when a boundary exists)
  - [ ] On click: activate boundary editing mode, switch canvas from view-only to editable
  - [ ] Disable pan/zoom via drag during editing (to avoid conflicting with vertex dragging) — zoom via scroll wheel remains available
  - [ ] Show the boundary edit toolbar (Task 7) when editing is active
  - [ ] Handle mode transitions cleanly: entering edit mode, confirming, canceling
  - [ ] Ensure satellite imagery remains visible beneath the editable boundary (if in satellite view)

- [ ] Task 10: Write Playwright E2E tests (AC: #1, #2, #3, #4, #5)
  - [ ] Create `tests/e2e/boundary-editing.spec.ts`
  - [ ] Test: activating edit mode shows draggable vertex handles on the boundary
  - [ ] Test: dragging a vertex updates the polygon in real-time
  - [ ] Test: clicking a midpoint handle adds a new vertex
  - [ ] Test: deleting a vertex removes it from the polygon (minimum 3 enforced)
  - [ ] Test: confirming changes commits a `PropertyBoundaryUpdated` event
  - [ ] Test: canceling reverts the boundary to its original state
  - [ ] Test: editing dimensions commits a `PropertyDimensionsUpdated` event and grid adjusts
  - [ ] Test: precision tools (snap, loupe) work during boundary editing
  - [ ] Create test fixtures with properties that have existing boundaries

## Dev Notes

### Boundary Editing State Machine

The boundary editing flow follows a clear state machine:

```
idle → editing (dragging vertices, adding/removing points) → confirming → idle
  ↑                        |
  +———— cancel (revert) ———+
```

- **idle**: Boundary displayed in view-only mode. "Edit Boundary" button visible.
- **editing**: Boundary vertices are draggable. Midpoint handles shown. Toolbar with Confirm/Cancel visible.
- **confirming**: Validation check, event committed, transition back to idle.

The original polygon is stored on entering edit mode so cancel can revert cleanly. No events are committed until the user explicitly confirms.

### Vertex Interaction Design

Three types of handles on the boundary:

1. **Vertex handles** — placed at each polygon vertex, draggable to move the vertex
2. **Midpoint handles** — placed at the midpoint of each edge, clickable to add a new vertex
3. **Selected vertex indicator** — the currently selected vertex has a distinct visual style

Vertex handles use Konva `draggable: true` on `<Circle>` nodes. The drag handler updates the edited polygon in real-time during drag, providing immediate visual feedback.

### Adding and Removing Vertices

**Adding**: Click a midpoint handle to insert a new vertex at that position. The new vertex splits the edge into two segments. After insertion, the new vertex can be dragged to its desired position.

**Removing**: Select a vertex (click without drag), then press Delete/Backspace or click "Delete Vertex" in the toolbar. Minimum 3 vertices enforced — the delete action is disabled when only 3 vertices remain.

### Conflict with Pan/Zoom

During boundary editing, vertex dragging and canvas panning both respond to drag gestures. To resolve:

- **Disable stage dragging** during edit mode — the stage `draggable` property is set to `false`
- **Zoom via scroll wheel** remains available — it does not conflict with vertex dragging
- **Pan alternative**: add pan buttons or allow pan via middle-click/two-finger drag on non-vertex areas

This is a temporary mode switch — exiting edit mode restores normal pan/zoom behavior.

### Precision Tools in Edit Mode

All precision tools from Story 1.6 should be available during boundary editing:

- **Snap-to-grid**: vertex positions snap to grid intersections when dragged near them
- **Curves**: edge segments between vertices can be curved (if supported by the polygon format)
- **Loupe/magnifier**: available for precise vertex placement

### Event Design

`PropertyBoundaryUpdated` stores both the new and previous boundary:

```typescript
{
  id: crypto.randomUUID(),
  type: 'PropertyBoundaryUpdated',
  entityId: propertyId,
  entityType: 'property',
  timestamp: new Date().toISOString(),
  payload: {
    boundary: [{ x: 100, y: 200 }, ...],
    previousBoundary: [{ x: 100, y: 195 }, ...]
  }
}
```

Storing the previous boundary supports undo via compensating events and provides an audit trail of boundary changes.

`PropertyDimensionsUpdated` follows the same pattern:

```typescript
{
  id: crypto.randomUUID(),
  type: 'PropertyDimensionsUpdated',
  entityId: propertyId,
  entityType: 'property',
  timestamp: new Date().toISOString(),
  payload: {
    width: 80,
    length: 120,
    unit: 'ft',
    previousDimensions: { width: 75, length: 110, unit: 'ft' }
  }
}
```

### Grid Adjustment on Dimension Change

When property dimensions are updated, the grid canvas from Story 1.4 must recalculate:

- Grid line spacing based on new dimensions
- Canvas default size if dimensions were previously undefined
- Property boundary rendering position (if boundary is scale-relative)

The grid re-renders reactively via the materialized state layer — the `PropertyDimensionsUpdated` reducer updates `property.dimensions`, and the grid renderer reads from materialized state.

### Architecture Compliance

- **No business logic in Svelte components** — editing logic in `src/lib/domain/boundary-editing.ts`, state in stores
- **Immutable state transitions** — all editing functions return new state objects
- **No `null`** — use `undefined` for `selectedVertexIndex` when no vertex is selected
- **No events on cancel** — cancel is a client-side state reset only
- **File naming:** `kebab-case.ts` for TypeScript files, `PascalCase.svelte` for Svelte components
- **Test co-location:** tests sit next to source files

### What This Story Does NOT Include

- No undo/redo for individual vertex moves during editing (only full cancel/confirm)
- No boundary merging or splitting
- No automatic boundary recalculation based on satellite imagery
- No multi-property boundary editing
- No boundary shape constraints (e.g., forcing rectangular boundaries)
- No measurement display during editing (future enhancement)

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — Event Store]
- [Source: _bmad-output/planning-artifacts/architecture.md — Canvas Component Strategy]
- [Source: _bmad-output/planning-artifacts/architecture.md — Implementation Patterns & Consistency Rules]
- [Source: _bmad-output/planning-artifacts/epics.md — Story 2.5: Edit Property Boundaries After Creation]
