# Story 3.4: Plant Placement — Single Drop

Status: ready-for-dev

## Story

As a gardener,
I want to place individual plants at precise positions within a zone,
So that my garden map shows exactly where each plant lives.

## Acceptance Criteria

1. **Given** a zone exists on the canvas
   **When** the user activates single plant placement mode (FR27)
   **Then** they can tap/click within the zone to place a plant at that exact position

2. **Given** the user places a plant
   **When** they confirm the position
   **Then** a `PlantCreated` event is committed with the plant's UUID, position coordinates, and parent zone ID
   **And** the plant renders as a marker at the placed position on the canvas

3. **Given** a plant is being placed
   **When** snap-to-grid is enabled
   **Then** the plant position snaps to the grid like polygon points

4. **Given** the plant creation flow
   **When** the user places a plant
   **Then** they are prompted for a name (required) with optional detail available but not forced (progressive detail per FR29)

## Tasks / Subtasks

- [ ] Task 1: Define plant domain types and Zod schemas (AC: #2)
  - [ ] Ensure `Plant` interface exists in `src/lib/types/plant.ts` (may have been created in Story 3.3): `id: UUID`, `name: string`, `position: Point`, `parentZoneId: string`, plus optional fields
  - [ ] Create `PlantCreated` Zod schema in `src/lib/types/events.ts` with payload `{ name: string, position: Point, parentZoneId: string }`
  - [ ] Update the event discriminated union type to include `PlantCreated`
  - [ ] Write unit tests for Zod schema validation (valid plant, missing name rejected, missing position rejected)

- [ ] Task 2: Implement plant creation domain logic (AC: #2, #4)
  - [ ] Create `src/lib/domain/plant.ts` with `createPlant()` function that accepts name, position, and parentZoneId
  - [ ] `createPlant()` generates a UUID via `crypto.randomUUID()`, constructs the `PlantCreated` event, and calls `dispatchEvent()`
  - [ ] Validate that name is a non-empty string before dispatching
  - [ ] Validate that parentZoneId references an existing zone in materialized state
  - [ ] Validate that the position point falls within the parent zone's geometry
  - [ ] Write unit tests in `src/lib/domain/plant.test.ts` covering: create plant with valid data, empty name rejection, invalid zone rejection, position outside zone rejection

- [ ] Task 3: Add PlantCreated event reducer in the materialized state layer (AC: #2)
  - [ ] Add `PlantCreated` reducer that creates a new plant entity in the materialized state with the event payload
  - [ ] Store plant with position, parentZoneId, and name
  - [ ] Ensure reducer produces a new state object (no in-place mutation)
  - [ ] Write unit tests verifying state updates from `PlantCreated` events
  - [ ] Write unit tests verifying state rebuilds correctly from a sequence of events (create zone, place plant)

- [ ] Task 4: Implement plant placement mode and interaction logic (AC: #1, #3)
  - [ ] Create `src/lib/domain/plant-placement.ts` with placement state machine: `idle`, `placing`, `confirming`
  - [ ] Implement `startPlacement(parentZoneId: string)` — activates single plant placement mode for a specific zone
  - [ ] Implement `setPosition(point: Point, snapEnabled: boolean, gridScale: GridScale): Point` — returns the position, snapped to grid if snap is enabled (reuse snap logic from Story 1.6)
  - [ ] Implement `confirmPlacement(name: string, position: Point, parentZoneId: string)` — calls `createPlant()` and resets placement state
  - [ ] Implement `cancelPlacement()` — resets placement state to idle
  - [ ] Implement zone boundary detection: verify the placement point is within the target zone polygon
  - [ ] Write unit tests for placement state machine transitions and snap-to-grid behavior

- [ ] Task 5: Create plant placement canvas component (AC: #1, #3)
  - [ ] Create `src/lib/canvas/drawing/PlantPlacement.svelte` — Konva component for the plant placement interaction
  - [ ] Show a plant marker preview that follows the cursor/touch position within the target zone
  - [ ] Apply snap-to-grid to the preview marker when snap is enabled
  - [ ] On click/tap, set the plant position and transition to confirming state
  - [ ] Convert screen coordinates to canvas coordinates using `screenToCanvas()` (from Story 1.5)
  - [ ] Visually highlight the target zone boundary during placement mode
  - [ ] Constrain the preview marker to stay within the target zone boundary

- [ ] Task 6: Create plant rendering canvas components (AC: #2)
  - [ ] Create `src/lib/canvas/map/PlantLayer.svelte` — Konva layer for rendering all plants
  - [ ] Create `src/lib/canvas/map/PlantMarker.svelte` — renders a single plant as a distinct marker (e.g., small circle with icon or dot)
  - [ ] Display plant name as a small label near the marker
  - [ ] Style plant markers distinctly from zone polygons, structures, and features
  - [ ] Reactively bind to plants from materialized state
  - [ ] Render plants above zone polygons in the layer ordering

- [ ] Task 7: Create plant naming prompt UI (AC: #4)
  - [ ] Create `src/lib/ui/entities/PlantNamePrompt.svelte` — lightweight prompt that appears after position confirmation
  - [ ] Include a required name text input with placeholder (e.g., "Cherokee Purple", "Basil")
  - [ ] Include a "Create" button that calls `confirmPlacement()` with the name
  - [ ] Include a "Cancel" button that cancels placement
  - [ ] Do NOT show optional detail fields in the prompt — those are added later via progressive detail (Story 3.3)
  - [ ] Style as a floating panel near the placed position or as a bottom sheet on mobile

- [ ] Task 8: Create plant placement mode activation UI (AC: #1)
  - [ ] Add a "Place Plant" action to the zone context menu or toolbar
  - [ ] When activated, transition to plant placement mode for the selected zone
  - [ ] Show visual feedback indicating placement mode is active (e.g., cursor change, zone highlight)
  - [ ] Allow exiting placement mode via Escape key or cancel button

- [ ] Task 9: Write Playwright E2E tests (AC: #1, #2, #3, #4)
  - [ ] Create `tests/e2e/plant-placement-single.spec.ts`
  - [ ] Test: activate plant placement mode on a zone, click to place, verify preview marker appears
  - [ ] Test: enter name and confirm, verify `PlantCreated` event committed with correct position and zone ID
  - [ ] Test: verify plant marker renders on canvas at placed position
  - [ ] Test: enable snap-to-grid, place plant, verify position is snapped
  - [ ] Test: try to place plant outside zone boundary, verify it is constrained
  - [ ] Test: cancel placement, verify no plant is created
  - [ ] Test: reload app, verify plants restored from events

## Dev Notes

### Plant Placement Interaction Flow

```
1. User selects a zone on the canvas
2. User activates "Place Plant" action
3. Canvas enters placement mode — cursor shows plant preview marker
4. User taps/clicks within the zone
5. Plant marker locks to the tapped position
6. Name prompt appears — user enters plant name
7. User confirms → PlantCreated event committed, plant renders permanently
```

### Plant Marker Rendering

Plants should be visually distinct from all other entity types. Suggested marker style:

```typescript
const PLANT_MARKER_STYLE = {
  radius: 8,
  fill: '#66BB6A',
  stroke: '#2E7D32',
  strokeWidth: 2,
  shadowColor: '#000',
  shadowBlur: 2,
  shadowOpacity: 0.3
};
```

Plant markers are small and dense — they need to be visible but not overwhelming when many plants are placed in a zone.

### Snap-to-Grid Integration

Reuse the snap-to-grid logic from Story 1.6's precision tools. The snap function takes a raw position and returns the nearest grid point:

```typescript
function snapToGrid(point: Point, gridScale: GridScale): Point {
  const gridSize = getGridSizeInPixels(gridScale);
  return {
    x: Math.round(point.x / gridSize) * gridSize,
    y: Math.round(point.y / gridSize) * gridSize
  };
}
```

### Zone Boundary Detection

Use point-in-polygon detection to verify the plant is placed within the target zone:

```typescript
function isPointInPolygon(point: Point, polygon: Point[]): boolean {
  // Ray casting algorithm
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    const intersect = ((yi > point.y) !== (yj > point.y))
      && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}
```

This utility should live in `src/lib/domain/geometry.ts` (or a shared geometry utils module) for reuse by other features.

### Event Schema

```typescript
{
  id: crypto.randomUUID(),
  type: 'PlantCreated',
  entityId: '<plant-uuid>',
  entityType: 'plant',
  timestamp: new Date().toISOString(),
  payload: {
    name: 'Cherokee Purple',
    position: { x: 150, y: 275 },
    parentZoneId: '<zone-uuid>'
  }
}
```

### Architecture Compliance

- **No business logic in Svelte components** — all placement logic lives in `src/lib/domain/plant-placement.ts` and `src/lib/domain/plant.ts`
- **Immutable state transitions** — domain functions return new state objects, never mutate
- **No `null`** — use `undefined` for optional plant fields
- **No `Date.now()`** — use `new Date().toISOString()` for ISO 8601
- **No external UUID libraries** — use `crypto.randomUUID()`
- **File naming:** `kebab-case.ts` for TypeScript, `PascalCase.svelte` for components
- **Test co-location:** tests sit next to source files

### What This Story Does NOT Include

- No row or grid plant placement (Story 3.5)
- No plant editing or moving after placement
- No plant deletion
- No progressive detail UI for plants (Story 3.3 — reused)
- No plant icons or species-specific visuals
- No plant spacing recommendations or warnings

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — Canvas Component Strategy]
- [Source: _bmad-output/planning-artifacts/architecture.md — Three-Tier State Management]
- [Source: _bmad-output/planning-artifacts/architecture.md — Implementation Patterns & Consistency Rules]
- [Source: _bmad-output/planning-artifacts/epics.md — Story 3.4: Plant Placement — Single Drop]
