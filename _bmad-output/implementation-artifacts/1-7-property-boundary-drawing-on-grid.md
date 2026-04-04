# Story 1.7: Property Boundary Drawing on Grid

Status: backlog

## Story

As a gardener,
I want to draw my property boundary on the scaled grid canvas and optionally set north orientation,
So that I have a visual representation of my actual property as the foundation for my garden map.

## Acceptance Criteria

1. **Given** a property exists without a boundary
   **When** the user activates the property boundary drawing mode
   **Then** the polygon drawing tool is available on the scaled grid canvas with all precision tools (snap, curves, loupe, confirmation)

2. **Given** the user has completed a polygon on the grid canvas
   **When** the polygon is finalized as the property boundary (FR4)
   **Then** the boundary is saved to the property entity via a `PropertyBoundarySet` event
   **And** the property's geometry is updated in the materialized state

3. **Given** a property boundary has been drawn
   **When** the user views the property
   **Then** the boundary polygon is rendered on the canvas with a distinct visual style (fill color, border)

4. **Given** the property setup flow
   **When** the user is offered the north orientation option (FR6)
   **Then** they can set north direction by rotating an indicator or selecting from a compass
   **And** they can skip this step entirely (orientation remains `undefined`)

5. **Given** a north orientation has been set
   **When** the property map is displayed
   **Then** a north indicator is visible on the canvas reflecting the configured orientation

6. **Given** a property with a boundary
   **When** the app is reloaded
   **Then** the property boundary is restored from events and rendered correctly on the canvas

## Tasks / Subtasks

- [ ] Task 1: Define event schemas and types for boundary and orientation events (AC: #2, #4)
  - [ ] Add `PropertyBoundarySet` Zod schema in `src/lib/types/events.ts` with payload `{ boundary: Polygon }` (array of points with optional curve data)
  - [ ] Add `NorthOrientationSet` Zod schema in `src/lib/types/events.ts` with payload `{ degrees: number }` (0-359, where 0 = north is up)
  - [ ] Update the event discriminated union type to include `PropertyBoundarySet` and `NorthOrientationSet`
  - [ ] Verify Zod validation passes for valid events and rejects malformed payloads
  - [ ] Write unit tests for both new event schemas

- [ ] Task 2: Add event reducers for boundary and orientation in the materialized state layer (AC: #2, #4, #6)
  - [ ] Add `PropertyBoundarySet` reducer logic that sets `property.geometry` from the event payload
  - [ ] Add `NorthOrientationSet` reducer logic that sets `property.northOrientation` from the event payload
  - [ ] Ensure reducers produce new state objects (no in-place mutation)
  - [ ] Write unit tests verifying state updates from both event types
  - [ ] Write unit tests verifying state rebuilds correctly from a sequence of events (create property, set boundary, set orientation)

- [ ] Task 3: Create the property boundary drawing mode and integration with polygon tool (AC: #1, #2)
  - [ ] Create `src/lib/domain/property-boundary.ts` — domain logic for boundary drawing mode
  - [ ] Implement `startBoundaryDrawing()` function that activates polygon tool with all precision tools enabled (snap, curves, loupe, two-stage confirmation from Stories 1.5/1.6)
  - [ ] Implement `finalizeBoundary(propertyId: string, polygon: Polygon)` function that commits a `PropertyBoundarySet` event via `commitEvent()`
  - [ ] Handle the callback from polygon tool finalization (after two-stage confirmation) to trigger event commit
  - [ ] Write unit tests for domain logic (event creation, validation)

- [ ] Task 4: Create the boundary rendering component on the canvas (AC: #3, #6)
  - [ ] Create `src/lib/canvas/map/PropertyBoundary.svelte` — Konva component for rendering the boundary polygon
  - [ ] Style the boundary with a semi-transparent fill color and a distinct border (dashed or solid with specific color) to differentiate from future zone polygons
  - [ ] Render the boundary on a dedicated Konva layer (above grid layer, below drawing layer)
  - [ ] Reactively bind to `property.geometry` from materialized state so changes reflect immediately
  - [ ] Handle the case where `property.geometry` is `undefined` (no boundary yet — render nothing)
  - [ ] Verify boundary renders correctly after page reload (state rebuilt from events)

- [ ] Task 5: Create the north orientation UI and canvas indicator (AC: #4, #5)
  - [ ] Create `src/lib/ui/onboarding/NorthOrientation.svelte` — UI component for setting north direction
  - [ ] Implement a compass rose or rotatable arrow indicator that allows the user to set degrees (0-359)
  - [ ] Include a clear "Skip" option that leaves `northOrientation` as `undefined`
  - [ ] Create `src/lib/domain/north-orientation.ts` — domain logic for committing `NorthOrientationSet` event
  - [ ] Create `src/lib/canvas/map/NorthIndicator.svelte` — small compass icon rendered in a corner of the canvas
  - [ ] Reactively bind the north indicator rotation to `property.northOrientation` from materialized state
  - [ ] Hide the north indicator when `property.northOrientation` is `undefined`
  - [ ] Write unit tests for north orientation domain logic

- [ ] Task 6: Build the property setup flow (onboarding integration) (AC: #1, #4)
  - [ ] Create `src/lib/ui/onboarding/PropertySetupFlow.svelte` — orchestrates the setup steps
  - [ ] Implement step progression: property creation (Story 1.3) -> boundary drawing -> north orientation -> done
  - [ ] Add a simple step indicator showing current position in the flow
  - [ ] Activate boundary drawing mode when entering the boundary step (for properties without a boundary)
  - [ ] Navigate to north orientation step after boundary is finalized
  - [ ] Navigate to completion (property view) after orientation is set or skipped
  - [ ] Handle re-entry: if property already has a boundary, allow re-drawing (replaces existing boundary via new event)
  - [ ] Create route or navigation logic for the onboarding flow (e.g., `/property/[id]/setup`)

- [ ] Task 7: Wire up the property view to show boundary and north indicator (AC: #3, #5, #6)
  - [ ] Update the property canvas view to include the `PropertyBoundary.svelte` component on the boundary layer
  - [ ] Update the property canvas view to include the `NorthIndicator.svelte` component
  - [ ] Add a "Draw Boundary" or "Edit Boundary" button when viewing a property (launches boundary drawing mode)
  - [ ] Verify the full loop: draw boundary -> event committed -> state updated -> boundary rendered on canvas
  - [ ] Verify restoration: reload app -> events replayed -> boundary and north indicator restored

- [ ] Task 8: Write integration and E2E tests (AC: #1-6)
  - [ ] Write integration test: commit `PropertyBoundarySet` event -> verify materialized state has `geometry`
  - [ ] Write integration test: commit `NorthOrientationSet` event -> verify materialized state has `northOrientation`
  - [ ] Write integration test: rebuild state from events sequence -> verify boundary and orientation restored
  - [ ] Write E2E test (Playwright): create property -> draw boundary -> verify boundary renders on canvas
  - [ ] Write E2E test (Playwright): set north orientation -> verify indicator appears -> skip and verify no indicator
  - [ ] Write E2E test (Playwright): reload page -> verify boundary and orientation persist

## Dev Notes

### End-to-End Canvas Story

This is the first "end-to-end" canvas story in the project. It ties together Stories 1.3 through 1.6 into a complete user flow: the user draws on the canvas, an event is committed to the event store, the materialized state updates, and the boundary renders on the canvas. This validates the full three-tier state architecture (Dexie persistence -> materialized state -> UI/Canvas) in a real user scenario.

### Property Boundary Drawing Mode

- Activated from the property view when no boundary exists (or when user chooses to re-draw)
- Uses the polygon drawing tool from Story 1.5 with all precision tools enabled from Story 1.6 (snap-to-grid, curves, loupe magnifier, two-stage confirmation)
- On finalization (after two-stage confirmation completes), the domain function commits a `PropertyBoundarySet` event via `commitEvent()`
- The event reducer in the materialized state layer handles `PropertyBoundarySet` to update `property.geometry`
- No business logic in the Svelte components — the domain layer in `src/lib/domain/property-boundary.ts` handles event creation and validation

### Boundary Visual Style

- The property boundary must be visually distinct from other polygon types (future zones, beds, etc.)
- Use a semi-transparent fill color and a distinct border style (dashed or solid with a specific color)
- Render on a dedicated boundary layer in Konva, positioned above the grid layer but below the active drawing layer
- The boundary layer ordering ensures the user can draw on top of the boundary without visual conflicts

### North Orientation (FR6)

- This is an entirely optional step in the property setup flow — can be skipped with no validation error
- The UI provides a compass rose or rotatable arrow indicator for intuitive direction setting
- Value is stored as degrees (0-359) where 0 means north is "up" on screen
- Commits a `NorthOrientationSet` event to the event store
- The north indicator is a small compass icon rendered in a corner of the canvas, reflecting the configured orientation
- When `northOrientation` is `undefined`, the indicator is not rendered at all
- Progressive detail principle: this feature adds value but is never required

### Event Handling

Both `PropertyBoundarySet` and `NorthOrientationSet` event types need:
- Zod schemas defined in `src/lib/types/events.ts`
- Event reducer logic added to the materialized state layer
- The event store's discriminated union updated to include these new event types

Event structures:

```typescript
// PropertyBoundarySet
{
  id: string,                    // crypto.randomUUID()
  type: 'PropertyBoundarySet',   // PascalCase discriminator
  entityId: string,              // property UUID
  entityType: 'property',
  timestamp: string,             // ISO 8601
  payload: {
    boundary: Polygon            // array of points (with optional curve data)
  }
}

// NorthOrientationSet
{
  id: string,
  type: 'NorthOrientationSet',
  entityId: string,              // property UUID
  entityType: 'property',
  timestamp: string,
  payload: {
    degrees: number              // 0-359, where 0 = up on screen
  }
}
```

### Restoration on Reload

- When the app loads, the materialized state layer rebuilds from persisted events in Dexie
- The boundary polygon must be re-rendered on the canvas from `property.geometry` — the reactive binding to materialized state handles this automatically
- The north indicator must reflect `property.northOrientation` from rebuilt state
- No special reload logic needed beyond ensuring reducers handle both event types and canvas components reactively bind to state

### Property Setup Flow Integration

The onboarding flow connects multiple stories:
1. Story 1.3: Create property (name + optional dimensions)
2. Story 1.7: Draw property boundary on the grid canvas
3. Story 1.7: Optionally set north orientation

This forms the initial onboarding experience. The `PropertySetupFlow.svelte` component orchestrates step progression with a simple step indicator. Navigation between steps should be straightforward — consider a route like `/property/[id]/setup` or a modal-based flow.

Re-entry is supported: if a property already has a boundary, the user can re-draw it, which commits a new `PropertyBoundarySet` event (the latest event wins when rebuilding state).

### File Naming and Architecture Conventions

- TypeScript files: `kebab-case.ts` (e.g., `property-boundary.ts`, `north-orientation.ts`)
- Svelte components: `PascalCase.svelte` (e.g., `PropertyBoundary.svelte`, `NorthIndicator.svelte`)
- Canvas components go in `src/lib/canvas/` (specifically `src/lib/canvas/map/`)
- UI components go in `src/lib/ui/` (specifically `src/lib/ui/onboarding/`)
- Domain logic goes in `src/lib/domain/`
- No business logic in Svelte components — extract to domain layer
- No `null` when `undefined` is semantically correct
- No in-place state mutation — always create new objects
- Use `crypto.randomUUID()` for IDs, ISO 8601 for timestamps

### What This Story Does NOT Include

- Zone or bed polygon drawing (future stories)
- Property dimension editing after creation (Story 1.3 handles initial dimensions)
- Map rotation based on north orientation (future enhancement — this story only stores and displays it)
- Multi-property support or property switching
- Undo/redo for boundary drawing (future story)

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — Three-Tier State Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md — Implementation Patterns & Consistency Rules]
- [Source: _bmad-output/planning-artifacts/epics.md — Story 1.7: Property Boundary Drawing on Grid]
- [Source: _bmad-output/planning-artifacts/epics.md — FR4: Property Boundary Drawing]
- [Source: _bmad-output/planning-artifacts/epics.md — FR6: North Orientation]
- [Source: _bmad-output/implementation-artifacts/1-1-project-scaffold-and-core-architecture.md — Project Structure]
