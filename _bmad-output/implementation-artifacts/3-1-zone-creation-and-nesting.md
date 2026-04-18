# Story 3.1: Zone Creation & Nesting

Status: ready-for-dev

## Story

As a gardener,
I want to create zones within my property and nest zones within other zones,
So that I can organize my garden into logical areas like beds, rows, and sections.

## Acceptance Criteria

1. **Given** a property exists with a boundary
   **When** the user creates a new zone (FR22)
   **Then** they can draw a polygon on the canvas within the property boundary using the drawing tools
   **And** the zone is created with a UUID, name, and geometry via a `ZoneCreated` event

2. **Given** an existing zone
   **When** the user creates a zone within it (FR23)
   **Then** the child zone is created with `parentId` referencing the parent zone
   **And** the child zone renders visually inside the parent zone on the canvas

3. **Given** a zone at any nesting depth
   **When** the user creates another zone within it
   **Then** the nesting works at arbitrary depth — zones within zones within zones

4. **Given** the zone creation form
   **When** the user assigns a color and label to a zone (FR24)
   **Then** the zone renders on the canvas with the chosen color fill and label text
   **And** a `ZoneUpdated` event records the color and label

5. **Given** a zone was created with only a name (no color, no label detail)
   **When** the zone is displayed on the canvas
   **Then** it renders with a default color and the name as its label

## Tasks / Subtasks

- [ ] Task 1: Define zone domain types and Zod schemas (AC: #1, #2, #4)
  - [ ] Create `src/lib/types/zone.ts` with zone entity type: `Zone` interface with `id: UUID`, `name: string`, `parentId?: string`, `geometry: Polygon`, `color?: string`, `label?: string`
  - [ ] Create `ZoneCreated` Zod schema in `src/lib/types/events.ts` with payload `{ name: string, geometry: Polygon, parentId?: string }`
  - [ ] Create `ZoneUpdated` Zod schema in `src/lib/types/events.ts` with payload supporting partial updates (color, label, etc.)
  - [ ] Update the event discriminated union type to include `ZoneCreated` and `ZoneUpdated`
  - [ ] Write unit tests for Zod schema validation (valid zone, missing name rejected, valid nesting with parentId)

- [ ] Task 2: Implement zone domain logic (AC: #1, #2, #3, #5)
  - [ ] Create `src/lib/domain/zone.ts` with `createZone()` function that accepts name, geometry, and optional parentId
  - [ ] `createZone()` generates a UUID via `crypto.randomUUID()`, constructs the `ZoneCreated` event, and calls `dispatchEvent()` from the materialized state layer
  - [ ] Implement `updateZone()` function that accepts zone ID and partial update (color, label) and dispatches a `ZoneUpdated` event
  - [ ] Validate that zone name is a non-empty string before dispatching
  - [ ] Implement parent zone validation: if `parentId` is provided, verify parent zone exists in materialized state
  - [ ] Write unit tests in `src/lib/domain/zone.test.ts` covering: create root zone, create child zone, create deeply nested zone, update color/label, empty name rejection

- [ ] Task 3: Add zone event reducers in the materialized state layer (AC: #1, #2, #4, #5)
  - [ ] Add `ZoneCreated` reducer that creates a new zone entity in the materialized state with the event payload
  - [ ] Add `ZoneUpdated` reducer that merges partial updates into the existing zone entity
  - [ ] Assign a default color from a palette when no color is provided on creation
  - [ ] Use the zone name as the default label when no label is explicitly set
  - [ ] Ensure reducers produce new state objects (no in-place mutation)
  - [ ] Write unit tests verifying state updates from both event types
  - [ ] Write unit tests verifying state rebuilds correctly from a sequence of events (create zone, update color, create child zone)

- [ ] Task 4: Implement zone hierarchy logic (AC: #2, #3)
  - [ ] Create `src/lib/domain/hierarchy.ts` with `getChildren(parentId: string, zones: Zone[]): Zone[]` — returns direct children of a zone
  - [ ] Implement `getAncestors(zoneId: string, zones: Zone[]): Zone[]` — returns the ancestor chain from root to parent
  - [ ] Implement `getDescendants(zoneId: string, zones: Zone[]): Zone[]` — returns all descendants at any depth
  - [ ] Implement `getNestingDepth(zoneId: string, zones: Zone[]): number` — returns the depth level of a zone
  - [ ] Write unit tests with hierarchies of 1, 2, 3, and 4+ levels deep

- [ ] Task 5: Create zone drawing integration with polygon tool (AC: #1, #2)
  - [ ] Create `src/lib/domain/zone-drawing.ts` — domain logic for zone boundary drawing mode
  - [ ] Implement `startZoneDrawing(parentId?: string)` function that activates polygon tool with precision tools enabled
  - [ ] Implement `finalizeZone(name: string, polygon: Polygon, parentId?: string)` function that commits a `ZoneCreated` event
  - [ ] Constrain zone polygon to be within the parent boundary (property boundary for root zones, parent zone geometry for child zones)
  - [ ] Write unit tests for domain logic (event creation, parent validation)

- [ ] Task 6: Create zone rendering canvas components (AC: #1, #2, #4, #5)
  - [ ] Create `src/lib/canvas/map/ZoneLayer.svelte` — Konva layer for rendering all zones
  - [ ] Create `src/lib/canvas/map/ZonePolygon.svelte` — renders a single zone as a filled polygon with border, using the zone's color (or default)
  - [ ] Create `src/lib/canvas/map/ZoneLabel.svelte` — renders the zone label text (name or custom label) centered within the zone polygon
  - [ ] Render child zones above parent zones in the layer ordering
  - [ ] Reactively bind to zones from materialized state so changes reflect immediately
  - [ ] Style zones distinctly from the property boundary (different fill opacity, border style)

- [ ] Task 7: Create zone creation UI flow (AC: #1, #4, #5)
  - [ ] Create `src/lib/ui/zones/ZoneCreationForm.svelte` — minimal form with name input (required)
  - [ ] Add optional color picker for zone fill color
  - [ ] Add optional label text input (defaults to name if not provided)
  - [ ] On submit, call `createZone()` from domain logic with the drawn polygon and form data
  - [ ] Style with Tailwind CSS — mobile-first responsive layout

- [ ] Task 8: Write Playwright E2E tests (AC: #1, #2, #3, #4, #5)
  - [ ] Create `tests/e2e/zone-creation.spec.ts`
  - [ ] Test: create a root zone within property boundary, verify zone renders on canvas
  - [ ] Test: create a child zone within a parent zone, verify nesting relationship
  - [ ] Test: assign color and label to zone, verify visual update
  - [ ] Test: create zone with name only, verify default color and name-as-label
  - [ ] Test: create three levels of nested zones, verify hierarchy
  - [ ] Test: reload app, verify zones restored from events

## Dev Notes

### Zone Architecture

Zones are the primary organizational unit in the garden hierarchy. They use the same polygon drawing tool introduced in Story 1.5, but with additional constraints:

- Root zones must be drawn within the property boundary
- Child zones must be drawn within their parent zone's geometry
- Zones render on a dedicated Konva layer above the property boundary but below the drawing interaction layer

### Zone Hierarchy Model

The zone hierarchy uses a simple `parentId` pattern:

```typescript
interface Zone {
  id: string;          // UUID
  name: string;        // required
  parentId?: string;   // undefined for root zones
  geometry: Polygon;   // array of points from polygon tool
  color?: string;      // hex color, default assigned from palette
  label?: string;      // display label, defaults to name
}
```

Hierarchy traversal functions live in `src/lib/domain/hierarchy.ts` — a shared module that will be reused by inheritance (Story 3.6), navigation (Epic 4), and visualization features.

### Default Color Palette

When a zone is created without a color, assign one from a rotating palette to visually distinguish sibling zones. Suggested palette:

```typescript
const DEFAULT_ZONE_COLORS = [
  '#4CAF50', '#8BC34A', '#CDDC39', '#FFC107',
  '#FF9800', '#795548', '#607D8B', '#9C27B0'
];
```

The palette index can be based on the number of existing sibling zones.

### Event Schema

```typescript
// ZoneCreated event
{
  id: crypto.randomUUID(),
  type: 'ZoneCreated',
  entityId: '<zone-uuid>',
  entityType: 'zone',
  timestamp: new Date().toISOString(),
  payload: {
    name: 'Raised Bed 1',
    geometry: [{ x: 100, y: 200 }, { x: 300, y: 200 }, ...],
    parentId: '<parent-zone-uuid>'  // optional
  }
}

// ZoneUpdated event
{
  id: crypto.randomUUID(),
  type: 'ZoneUpdated',
  entityId: '<zone-uuid>',
  entityType: 'zone',
  timestamp: new Date().toISOString(),
  payload: {
    color: '#4CAF50',
    label: 'Tomato Bed'
  }
}
```

### Architecture Compliance

- **No business logic in Svelte components** — all zone logic lives in `src/lib/domain/zone.ts` and `src/lib/domain/hierarchy.ts`
- **Immutable state transitions** — domain functions return new state objects, never mutate
- **No `null`** — use `undefined` for optional fields (parentId, color, label)
- **No `Date.now()`** — use `new Date().toISOString()` for ISO 8601
- **No external UUID libraries** — use `crypto.randomUUID()`
- **File naming:** `kebab-case.ts` for TypeScript, `PascalCase.svelte` for components
- **Test co-location:** tests sit next to source files

### What This Story Does NOT Include

- No zone property inheritance (Story 3.6)
- No structures or features (Story 3.2)
- No plant placement (Stories 3.4, 3.5)
- No progressive detail editing (Story 3.3)
- No tap-to-zoom into zones (Story 4.1)
- No zone deletion or boundary editing
- No zone reordering or drag-to-reparent

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — Canvas Component Strategy]
- [Source: _bmad-output/planning-artifacts/architecture.md — Three-Tier State Management]
- [Source: _bmad-output/planning-artifacts/architecture.md — Implementation Patterns & Consistency Rules]
- [Source: _bmad-output/planning-artifacts/epics.md — Story 3.1: Zone Creation & Nesting]
