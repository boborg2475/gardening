# Story 3.5: Plant Placement — Row & Grid Tools

Status: ready-for-dev

## Story

As a gardener,
I want to place multiple plants at once using row and grid tools with configurable spacing,
So that I can efficiently map beds with many plants without placing them one at a time.

## Acceptance Criteria

1. **Given** a zone exists on the canvas
   **When** the user activates the row placement tool (FR28)
   **Then** they define a start point, end point, and spacing distance
   **And** the tool previews plant positions along the row before confirmation

2. **Given** the row tool with configured spacing
   **When** the user confirms the row
   **Then** all plants in the row are created as individual entities, each with a UUID, position, and parent zone ID
   **And** individual `PlantCreated` events are committed for each plant

3. **Given** a zone exists on the canvas
   **When** the user activates the grid placement tool (FR28)
   **Then** they define an area (rectangle or polygon) and row/column spacing
   **And** the tool previews plant positions in a grid pattern before confirmation

4. **Given** the grid tool with configured spacing
   **When** the user confirms the grid
   **Then** all plants in the grid are created as individual entities with correct positions
   **And** each plant can have its name and detail set independently after placement

5. **Given** a row or grid of plants is placed
   **When** the user sets a name on the first plant (e.g., "Cherokee Purple")
   **Then** a prompt offers to apply the same name to all plants in the batch (efficiency for same-variety rows)
   **And** the user can decline and name each plant individually

## Tasks / Subtasks

- [ ] Task 1: Implement row placement calculation logic (AC: #1, #2)
  - [ ] Create `src/lib/domain/row-placement.ts` with pure functions for row position calculation
  - [ ] Implement `calculateRowPositions(start: Point, end: Point, spacing: number): Point[]` — returns evenly spaced positions along the line from start to end
  - [ ] Handle edge cases: spacing larger than row length (single plant at start), zero spacing (rejected), start equals end (single plant)
  - [ ] Implement `getRowLength(start: Point, end: Point): number` — returns the distance between start and end points
  - [ ] Implement `getPlantCount(rowLength: number, spacing: number): number` — returns the number of plants that fit in the row
  - [ ] Write unit tests covering: basic row, fractional spacing, single plant, diagonal rows, edge cases

- [ ] Task 2: Implement grid placement calculation logic (AC: #3, #4)
  - [ ] Create `src/lib/domain/grid-placement.ts` with pure functions for grid position calculation
  - [ ] Implement `calculateGridPositions(area: { topLeft: Point, bottomRight: Point }, rowSpacing: number, colSpacing: number): Point[]` — returns grid positions within a rectangular area
  - [ ] Implement `calculateGridInPolygon(polygon: Point[], rowSpacing: number, colSpacing: number): Point[]` — returns grid positions within an arbitrary polygon, filtering out positions outside the boundary
  - [ ] Handle edge cases: spacing larger than area (single plant), very small area with large spacing
  - [ ] Write unit tests covering: basic grid, non-square area, polygon-bounded grid, edge cases

- [ ] Task 3: Implement batch plant creation domain logic (AC: #2, #4, #5)
  - [ ] Create `src/lib/domain/batch-placement.ts` with batch creation functions
  - [ ] Implement `createPlantBatch(positions: Point[], parentZoneId: string, name?: string): PlantCreated[]` — generates individual `PlantCreated` events for each position
  - [ ] Each plant gets its own UUID via `crypto.randomUUID()`
  - [ ] If `name` is provided, apply it to all plants in the batch
  - [ ] If `name` is not provided, plants are created with a placeholder (e.g., "Plant 1", "Plant 2") or left for individual naming
  - [ ] Implement `commitBatch(events: PlantCreated[])` — commits all events to the event store sequentially
  - [ ] Write unit tests covering: batch with shared name, batch without name, single plant batch, event correctness

- [ ] Task 4: Create row placement state machine and interaction logic (AC: #1, #2)
  - [ ] Create `src/lib/domain/row-placement-mode.ts` with row tool state machine: `idle`, `settingStart`, `settingEnd`, `configuringSpacing`, `previewing`, `confirmed`
  - [ ] Implement `startRowPlacement(parentZoneId: string)` — activates row tool for a specific zone
  - [ ] Implement `setStartPoint(point: Point)` — records start position, transitions to setting end
  - [ ] Implement `setEndPoint(point: Point)` — records end position, transitions to spacing configuration
  - [ ] Implement `setSpacing(spacing: number)` — calculates preview positions, transitions to previewing
  - [ ] Implement `confirmRow(name?: string)` — creates plant batch and commits events
  - [ ] Implement `cancelRow()` — resets to idle
  - [ ] Write unit tests for state machine transitions

- [ ] Task 5: Create grid placement state machine and interaction logic (AC: #3, #4)
  - [ ] Create `src/lib/domain/grid-placement-mode.ts` with grid tool state machine: `idle`, `definingArea`, `configuringSpacing`, `previewing`, `confirmed`
  - [ ] Implement `startGridPlacement(parentZoneId: string)` — activates grid tool for a specific zone
  - [ ] Implement `defineArea(topLeft: Point, bottomRight: Point)` — records rectangular area, transitions to spacing config
  - [ ] Implement `setGridSpacing(rowSpacing: number, colSpacing: number)` — calculates preview positions, transitions to previewing
  - [ ] Implement `confirmGrid(name?: string)` — creates plant batch and commits events
  - [ ] Implement `cancelGrid()` — resets to idle
  - [ ] Write unit tests for state machine transitions

- [ ] Task 6: Create row placement canvas component (AC: #1, #2)
  - [ ] Create `src/lib/canvas/drawing/RowPlacement.svelte` — Konva component for row placement interaction
  - [ ] Show start point marker on first click
  - [ ] Show line preview from start to cursor/current touch position
  - [ ] On second click, lock end point and show spacing configuration UI
  - [ ] Render preview plant markers at calculated positions along the row
  - [ ] Apply snap-to-grid to start and end points when snap is enabled
  - [ ] Constrain points to within the target zone boundary

- [ ] Task 7: Create grid placement canvas component (AC: #3, #4)
  - [ ] Create `src/lib/canvas/drawing/GridPlacement.svelte` — Konva component for grid placement interaction
  - [ ] Show area selection via two corner clicks (top-left and bottom-right)
  - [ ] Render preview rectangle showing the defined area
  - [ ] After area is defined, show spacing configuration UI
  - [ ] Render preview plant markers at calculated grid positions within the area
  - [ ] Filter out preview markers that fall outside the target zone boundary
  - [ ] Apply snap-to-grid to area corners when snap is enabled

- [ ] Task 8: Create spacing configuration UI (AC: #1, #3)
  - [ ] Create `src/lib/ui/entities/SpacingConfig.svelte` — floating panel for configuring plant spacing
  - [ ] For row tool: single spacing input (distance between plants along the row)
  - [ ] For grid tool: row spacing and column spacing inputs
  - [ ] Display the unit (ft/in or m/cm) matching the property's unit system
  - [ ] Show plant count preview that updates as spacing changes
  - [ ] Include "Confirm" and "Cancel" buttons
  - [ ] Style with Tailwind CSS — compact floating panel design

- [ ] Task 9: Create batch naming prompt (AC: #5)
  - [ ] Create `src/lib/ui/entities/BatchNamePrompt.svelte` — prompt shown after batch placement confirmation
  - [ ] Include a name text input for the batch name
  - [ ] Include "Apply to All" button that names all plants in the batch
  - [ ] Include "Name Individually" button that skips batch naming (plants can be named later via progressive detail)
  - [ ] Include "Skip" option that creates plants with auto-generated names (e.g., "Plant 1", "Plant 2")
  - [ ] Style with Tailwind CSS — modal or bottom sheet design

- [ ] Task 10: Write Playwright E2E tests (AC: #1, #2, #3, #4, #5)
  - [ ] Create `tests/e2e/plant-placement-batch.spec.ts`
  - [ ] Test: activate row tool, click start and end points, set spacing, verify preview markers appear
  - [ ] Test: confirm row placement, verify individual `PlantCreated` events committed for each position
  - [ ] Test: activate grid tool, define area, set spacing, verify preview grid markers appear
  - [ ] Test: confirm grid placement, verify individual `PlantCreated` events committed
  - [ ] Test: set batch name "Tomato", apply to all, verify all plants have the same name
  - [ ] Test: decline batch naming, verify plants are individually nameable
  - [ ] Test: each plant in a batch is independently editable after placement
  - [ ] Test: reload app, verify batch-placed plants restored from events

## Dev Notes

### Row Placement Algorithm

The row tool calculates evenly spaced positions along a line segment:

```typescript
function calculateRowPositions(start: Point, end: Point, spacing: number): Point[] {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const count = Math.floor(length / spacing) + 1;
  const positions: Point[] = [];

  for (let i = 0; i < count; i++) {
    const t = (i * spacing) / length;
    if (t > 1) break;
    positions.push({
      x: start.x + dx * t,
      y: start.y + dy * t
    });
  }

  return positions;
}
```

### Grid Placement Algorithm

The grid tool fills a rectangular area with evenly spaced positions:

```typescript
function calculateGridPositions(
  area: { topLeft: Point, bottomRight: Point },
  rowSpacing: number,
  colSpacing: number
): Point[] {
  const positions: Point[] = [];
  for (let y = area.topLeft.y; y <= area.bottomRight.y; y += rowSpacing) {
    for (let x = area.topLeft.x; x <= area.bottomRight.x; x += colSpacing) {
      positions.push({ x, y });
    }
  }
  return positions;
}
```

For polygon-bounded grids, generate the full grid and then filter positions using point-in-polygon detection (from Story 3.4).

### Individual Plants, Not Groups

Each plant placed by row or grid tools is an independent entity with its own UUID and `PlantCreated` event. There is no "row" or "grid" group entity. This means:

- Plants can be individually edited, moved, or deleted after batch placement
- No special logic needed to "ungroup" batch-placed plants
- Event replay recreates each plant independently

### Batch Naming UX

The batch naming prompt provides an efficiency shortcut for common gardening patterns (e.g., a row of identical tomato plants). The flow:

1. Batch placement confirmed
2. Prompt: "Name these X plants?"
3. User enters "Cherokee Purple" and clicks "Apply to All" — all plants get the name
4. OR user clicks "Name Individually" — plants get placeholder names and can be renamed via progressive detail (Story 3.3)

### Architecture Compliance

- **No business logic in Svelte components** — all calculation logic lives in `src/lib/domain/` modules
- **Immutable state transitions** — all functions return new objects, never mutate
- **No `null`** — use `undefined` for optional fields
- **No `Date.now()`** — use `new Date().toISOString()` for ISO 8601
- **No external UUID libraries** — use `crypto.randomUUID()`
- **File naming:** `kebab-case.ts` for TypeScript, `PascalCase.svelte` for components
- **Test co-location:** tests sit next to source files

### What This Story Does NOT Include

- No curved row placement (only straight line rows)
- No irregular grid patterns (only rectangular grids)
- No automatic spacing recommendations based on plant type
- No drag-to-reposition of batch-placed plants
- No batch deletion of row/grid plants
- No visual grouping or batch selection of row/grid plants

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — Canvas Component Strategy]
- [Source: _bmad-output/planning-artifacts/architecture.md — Three-Tier State Management]
- [Source: _bmad-output/planning-artifacts/architecture.md — Implementation Patterns & Consistency Rules]
- [Source: _bmad-output/planning-artifacts/epics.md — Story 3.5: Plant Placement — Row & Grid Tools]
