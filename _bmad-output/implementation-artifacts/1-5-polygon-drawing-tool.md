# Story 1.5: Polygon Drawing Tool

Status: backlog

## Story

As a gardener,
I want to draw polygon shapes on the canvas by placing points,
So that I can outline boundaries and areas in my garden.

## Acceptance Criteria

1. **Given** the drawing mode is active
   **When** the user taps/clicks on the canvas
   **Then** a point is placed at that position and a visual marker appears

2. **Given** two or more points have been placed
   **When** the user places additional points
   **Then** line segments connect the points in sequence, forming an open polygon outline

3. **Given** three or more points have been placed
   **When** the user taps/clicks the first point
   **Then** the polygon closes, connecting the last point back to the first
   **And** the completed polygon is rendered as a filled shape with a visible border

4. **Given** the user is drawing a polygon
   **When** the polygon is in progress (not yet closed)
   **Then** a preview line follows the cursor/touch from the last placed point to the current position

5. **Given** a completed polygon
   **When** it is finalized
   **Then** a polygon event is committed to the event store with the point coordinates

## Tasks / Subtasks

- [ ] Task 1: Define polygon drawing domain types and Zod schemas (AC: #5)
  - [ ] Create `src/lib/types/drawing.ts` with drawing-specific types: `DrawingMode` enum (`idle`, `placing`, `complete`, `finalized`), `DrawingState` interface (mode, points array, preview position) — import `Point` from `src/lib/types/geometry.ts` (created in Story 1.2), do NOT redefine it
  - [ ] Create Zod schema for `PolygonDrawn` event payload: `{ points: Point[] }` where each point has `x: number, y: number`
  - [ ] Register `PolygonDrawn` event type in the event store schema (extend existing Zod event union from Story 1.2)
  - [ ] Add unit tests for Zod schema validation (valid polygon, empty points, single point, duplicate points)

- [ ] Task 2: Implement polygon drawing state machine (AC: #1, #2, #3, #4)
  - [ ] Create `src/lib/domain/polygon-drawing.ts` with pure functions for the drawing state machine
  - [ ] Implement `startDrawing(): DrawingState` — transitions from idle to placing mode, initializes empty points array
  - [ ] Implement `addPoint(state: DrawingState, point: Point): DrawingState` — appends point, returns new state (immutable)
  - [ ] Implement `updatePreview(state: DrawingState, position: Point): DrawingState` — updates cursor preview position
  - [ ] Implement `isNearFirstPoint(state: DrawingState, position: Point, hitRadius: number): boolean` — checks if position is within closing distance of first point
  - [ ] Implement `closePolygon(state: DrawingState): DrawingState` — transitions to complete mode, validates minimum 3 points
  - [ ] Implement `cancelDrawing(): DrawingState` — resets to idle state
  - [ ] Add unit tests for each state transition: idle to placing, point accumulation, closing logic, edge cases (closing with < 3 points rejected), cancel mid-draw

- [ ] Task 3: Implement coordinate conversion utility (AC: #1, #4)
  - [ ] Create `src/lib/canvas/drawing/coordinate-utils.ts` with `screenToCanvas(screenPoint: Point, stage: Konva.Stage): Point` — converts screen coordinates to canvas coordinates accounting for pan (position) and zoom (scale) from Story 1.4
  - [ ] Implement `canvasToScreen(canvasPoint: Point, stage: Konva.Stage): Point` — inverse transform for hit detection
  - [ ] Implement `getHitRadius(baseRadius: number, stage: Konva.Stage): number` — returns a hit radius in canvas space that appears constant in screen space (divides by current zoom scale)
  - [ ] Add unit tests with mock stage at various pan/zoom levels

- [ ] Task 4: Create polygon drawing reactive store (AC: #1, #2, #3, #4)
  - [ ] Create `src/lib/stores/drawing-store.svelte.ts` using Svelte 5 runes (`$state`, `$derived`)
  - [ ] Expose reactive state: `mode`, `points`, `previewPosition`, `isCloseable` (derived: true when >= 3 points and cursor near first point)
  - [ ] Expose actions that delegate to domain functions: `start()`, `placePoint(point)`, `updatePreview(position)`, `close()`, `cancel()`, `finalize()` (commits event and resets)
  - [ ] The `finalize()` action accepts `entityId` and `entityType` as parameters, then calls `commitEvent()` from the event store (Story 1.2) with a `PolygonDrawn` event — keeping the drawing tool decoupled from any specific entity type
  - [ ] Add unit tests for store reactivity and action dispatching

- [ ] Task 5: Build polygon drawing canvas components (AC: #1, #2, #3, #4)
  - [ ] Create `src/lib/canvas/drawing/PolygonDrawingLayer.svelte` — top-level drawing layer component using svelte-konva `<Layer>`
  - [ ] Create `src/lib/canvas/drawing/DrawingPoints.svelte` — renders Konva `<Circle>` for each placed point; first point gets a distinct style (larger radius or different color) to indicate it is the closing target
  - [ ] Create `src/lib/canvas/drawing/DrawingLines.svelte` — renders Konva `<Line>` connecting placed points in sequence (open polyline)
  - [ ] Create `src/lib/canvas/drawing/PreviewLine.svelte` — renders a dashed Konva `<Line>` from the last placed point to the current cursor/touch position; hidden when no points placed
  - [ ] Create `src/lib/canvas/drawing/CompletedPolygon.svelte` — renders Konva `<Line>` with `closed: true`, semi-transparent fill color, and visible stroke border
  - [ ] All components read from the drawing store — no business logic in components

- [ ] Task 6: Wire up canvas event handlers (AC: #1, #3, #4)
  - [ ] In `PolygonDrawingLayer.svelte`, attach `on:click`/`on:tap` handler to the Konva stage or a transparent hit-detection rect
  - [ ] On click/tap: convert screen coordinates to canvas coordinates using `screenToCanvas()`, then check if near first point (closing detection); if closing, call `close()`; otherwise call `placePoint()`
  - [ ] Attach `on:mousemove`/`on:touchmove` handler to update preview position via `updatePreview()` with coordinate conversion
  - [ ] On first-point hover: visually indicate closability (e.g., enlarge first point circle, change cursor)
  - [ ] Ensure all event handlers are performant — no unnecessary allocations in the hot path (mousemove fires frequently)
  - [ ] Handle touch events correctly — use `evt.touches[0]` for position, prevent default scroll behavior during drawing mode

- [ ] Task 7: Implement polygon finalization and event commitment (AC: #5)
  - [ ] After polygon closes (mode = complete), trigger finalization either automatically or via a confirm action
  - [ ] In `finalize()`, construct the event: `{ id: crypto.randomUUID(), type: 'PolygonDrawn', entityId, entityType, timestamp: new Date().toISOString(), payload: { points } }` — `entityId` and `entityType` are passed in by the caller (e.g., Story 1.7 passes the property's ID and `'property'`)
  - [ ] Call `commitEvent()` from the event store to persist the polygon
  - [ ] After successful commit, reset drawing state to idle
  - [ ] Add integration test: draw polygon (place 4 points, close) and verify event is committed to the store with correct point coordinates

- [ ] Task 8: Performance validation and cross-device testing (AC: #1, #2, #3, #4)
  - [ ] Verify 60fps during drawing interactions using browser DevTools Performance tab — mousemove/touchmove handlers must not cause jank
  - [ ] Test on touch devices (or touch emulation): point placement, preview line, closing gesture all work via touch
  - [ ] Test with pan/zoom active from Story 1.4: points are placed in correct canvas coordinates regardless of current viewport
  - [ ] Test polygon rendering with many points (20+) to ensure no performance degradation
  - [ ] Verify preview line updates smoothly without flickering

## Dev Notes

### Drawing State Machine

This story introduces the core polygon drawing state machine with four states:

```
idle → placing points → polygon complete → finalized
  ↑         |                                  |
  |         ↓                                  |
  +---- cancel                                 |
  ←────────────────────────────────────────────+
```

- **idle**: No drawing in progress. Canvas interactions are normal (pan/zoom from Story 1.4).
- **placing**: User is actively placing points. Each click/tap adds a point. Preview line follows cursor.
- **complete**: Polygon has been closed (user clicked near first point). Shape is rendered as filled polygon.
- **finalized**: Event has been committed to the event store. State resets to idle.

### Coordinate Conversion (Critical)

All stored polygon points MUST be in canvas space, not screen space. The canvas from Story 1.4 supports pan and zoom, so screen coordinates must be transformed:

```typescript
function screenToCanvas(screenPoint: Point, stage: Konva.Stage): Point {
  const transform = stage.getAbsoluteTransform().copy().invert();
  const pos = transform.point(screenPoint);
  return { x: pos.x, y: pos.y };
}
```

Without this conversion, polygons would shift and scale incorrectly when the user pans or zooms after drawing.

### Hit Radius for Closing Detection

The closing hit radius must be constant in screen space so it feels consistent regardless of zoom level:

```typescript
function getHitRadius(baseRadiusPx: number, stage: Konva.Stage): number {
  return baseRadiusPx / stage.scaleX();
}
```

A suggested base radius is 15-20 pixels. This means the actual canvas-space hit radius gets larger when zoomed out and smaller when zoomed in, but the user always perceives the same clickable area.

### Konva Component Strategy

- **Placed points**: `Konva.Circle` — radius ~6px, fill color, stroke. First point should have a visually distinct style (e.g., slightly larger, different color, or ring indicator) so users know to click it to close.
- **Line segments**: `Konva.Line` — connects all placed points as an open polyline. Use `points` prop as flat array `[x1, y1, x2, y2, ...]`.
- **Preview line**: `Konva.Line` — dashed line from last placed point to current cursor position. Stroke dash pattern `[8, 4]` or similar.
- **Completed polygon**: `Konva.Line` with `closed: true` — semi-transparent fill (e.g., `rgba(76, 175, 80, 0.3)`), solid stroke border.

### Reusable Design

The polygon drawing tool is intentionally generic and reusable. It will be used by:
- **Story 1.7**: Property boundary drawing (uses `PropertyBoundarySet` event type, but the drawing interaction is identical)
- **Later stories**: Zone boundaries, garden bed outlines, etc.

The drawing tool itself emits a generic `PolygonDrawn` event. Story 1.7 will wrap this tool and map the result to a `PropertyBoundarySet` domain event. Keep the drawing tool decoupled from any specific entity type.

### Performance Considerations

- The `mousemove`/`touchmove` handler fires at high frequency. Keep the handler minimal: convert coordinates and update a single reactive value. Avoid creating new objects or triggering layout.
- Konva renders on a `<canvas>` element, which is inherently 60fps-capable. The bottleneck is the reactive update path from event handler to Konva props.
- Use `$state` for preview position to get fine-grained reactivity. Avoid re-rendering the entire point list when only the preview changes.

### What This Story Does NOT Include

- No curves or bezier paths (Story 1.6)
- No snap-to-grid or magnetic snapping (Story 1.6)
- No loupe/magnifier for precision placement (Story 1.6)
- No two-stage point placement / confirmation gesture (Story 1.6)
- No undo of last point during drawing (nice-to-have, not in AC — could be added as enhancement)
- No editing of completed polygons (moving points, adding/removing vertices)
- No multiple polygon drawing in a single session
- No property-specific semantics — this is a generic drawing tool

### Event Schema

The `PolygonDrawn` event follows the established event store pattern from Story 1.2:

```typescript
{
  id: crypto.randomUUID(),
  type: 'PolygonDrawn',
  entityId: '<passed by caller>',   // e.g., property UUID from Story 1.7
  entityType: '<passed by caller>',// e.g., 'property' — tool is entity-agnostic
  timestamp: new Date().toISOString(),  // ISO 8601
  payload: {
    points: [
      { x: 100, y: 200 },
      { x: 300, y: 200 },
      { x: 300, y: 400 },
      { x: 100, y: 400 }
    ]
  }
}
```

Story 1.7 will define `PropertyBoundarySet` as a more specific event type. This generic `PolygonDrawn` type serves as the foundation.

### File Naming Conventions

Following the project conventions established in Story 1.1:
- TypeScript files: `kebab-case.ts` (e.g., `polygon-drawing.ts`, `coordinate-utils.ts`, `drawing-store.svelte.ts`)
- Svelte components: `PascalCase.svelte` (e.g., `PolygonDrawingLayer.svelte`, `DrawingPoints.svelte`)
- Test files: co-located with source (e.g., `polygon-drawing.test.ts` next to `polygon-drawing.ts`)

### Architecture Compliance

- **No business logic in Svelte components** — all drawing logic lives in `src/lib/domain/polygon-drawing.ts`
- **Immutable state transitions** — domain functions return new state objects, never mutate
- **No `null`** — use `undefined` for optional preview position
- **No `Date.now()`** — use `new Date().toISOString()` for ISO 8601
- **No external UUID libraries** — use `crypto.randomUUID()`

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — Canvas Component Strategy]
- [Source: _bmad-output/planning-artifacts/architecture.md — Three-Tier State Management]
- [Source: _bmad-output/planning-artifacts/architecture.md — Implementation Patterns & Consistency Rules]
- [Source: _bmad-output/planning-artifacts/epics.md — Story 1.5: Polygon Drawing Tool]
