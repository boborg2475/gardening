# Story 1.6: Drawing Precision Tools

Status: backlog

## Story

As a gardener,
I want precision aids like curves, snap-to-grid, edge snapping, a magnifier loupe, and drawing confirmation,
So that I can draw accurate boundaries that match my actual property layout.

## Acceptance Criteria

1. **Given** a polygon segment exists between two points
   **When** the user toggles the segment to curve mode (FR14)
   **Then** the straight segment becomes a bezier curve with a draggable midpoint control handle

2. **Given** a curved segment
   **When** the user drags the midpoint handle (FR15)
   **Then** the curve reshapes in real-time following the handle position
   **And** the canvas maintains 60fps during the interaction

3. **Given** the snap-to-grid option is enabled
   **When** the user places a point near a grid intersection (FR16)
   **Then** the point snaps to the nearest grid intersection based on the selected snap scale (1ft, 6in, 1in, or freehand)

4. **Given** snap assist is enabled and existing shapes are on the canvas
   **When** the user places a point near an existing edge, corner, or boundary (FR17)
   **Then** the point snaps to the nearest edge, corner, or boundary with a visual indicator showing the snap target

5. **Given** the loupe tool is active
   **When** the user touches and holds the canvas (FR18)
   **Then** a magnified view appears above the touch point, allowing precise point placement via drag

6. **Given** two-stage confirmation is enabled
   **When** the user completes a polygon (FR19)
   **Then** the polygon enters preview mode with draggable handles on each point
   **And** the user must confirm or cancel before the polygon is finalized

7. **Given** two-stage confirmation preview mode
   **When** the user drags a handle to adjust a point
   **Then** the polygon shape updates in real-time reflecting the adjustment

## Tasks / Subtasks

- [ ] Task 1: Define precision tool types and data structures (AC: #1, #3, #4)
  - [ ] Create `src/lib/types/precision-tools.ts` with types for snap mode (`GridSnap`, `EdgeSnap`, `Freehand`), snap scale (`'1ft' | '6in' | '1in' | 'freehand'`), and snap result
  - [ ] Define `SegmentType` as `'line' | 'curve'` and `SegmentData` with optional `controlPoint: Point` for bezier segments
  - [ ] Define `SnapTarget` type with `{ point: Point; type: 'grid' | 'corner' | 'edge'; sourceId?: string }` for snap indicator rendering
  - [ ] Define `LoupeConfig` type with magnification factor, radius, and offset settings
  - [ ] Define `ConfirmationState` type: `'inactive' | 'preview' | 'confirmed' | 'cancelled'`
  - [ ] Validate all types with Zod schemas where they cross persistence boundaries

- [ ] Task 2: Implement snap-to-grid logic (AC: #3)
  - [ ] Create `src/lib/domain/snap-to-grid.ts` with pure function `snapToGrid(canvasPoint: Point, gridScale: SnapScale): SnapResult`
  - [ ] Implement grid intersection calculation for each snap scale (1ft, 6in, 1in)
  - [ ] Return the original point unchanged when scale is `'freehand'`
  - [ ] Add visual snap threshold constant (screen-space pixels, not canvas units)
  - [ ] Write unit tests in `src/lib/domain/snap-to-grid.test.ts` covering all four snap scales and edge cases (point exactly on grid, point equidistant between intersections)

- [ ] Task 3: Implement snap assist to edges and corners (AC: #4)
  - [ ] Create `src/lib/domain/snap-assist.ts` with function `snapToNearestFeature(canvasPoint: Point, existingShapes: Shape[], zoomLevel: number): SnapTarget | null`
  - [ ] Implement corner proximity detection: check distance to all vertices of existing shapes
  - [ ] Implement edge proximity detection: calculate perpendicular distance to each edge segment
  - [ ] Use screen-space snap radius (constant pixel distance divided by current zoom level) so snapping feels consistent regardless of zoom
  - [ ] Enforce snap priority: corner snap > edge snap > grid snap
  - [ ] Create `src/lib/domain/snap-coordinator.ts` that composes grid snap and edge/corner snap with priority resolution
  - [ ] Write unit tests in `src/lib/domain/snap-assist.test.ts` covering corner snap, edge snap, priority ordering, and zoom-independence of snap radius

- [ ] Task 4: Implement bezier curve segment toggling (AC: #1, #2)
  - [ ] Create `src/lib/domain/bezier-segment.ts` with functions for toggling segment type and calculating default control point (midpoint of the segment)
  - [ ] Implement `toggleSegmentType(segmentIndex: number, polygon: PolygonData): PolygonData` — toggles between line and curve, initializing control point at segment midpoint when switching to curve
  - [ ] Implement `updateControlPoint(segmentIndex: number, newControlPoint: Point, polygon: PolygonData): PolygonData` — updates the bezier control point for a curved segment
  - [ ] Implement `getQuadraticBezierPath(start: Point, end: Point, controlPoint: Point): string` — generates SVG/Konva path string for the quadratic bezier
  - [ ] Write unit tests in `src/lib/domain/bezier-segment.test.ts` covering toggle behavior, control point initialization, and path string generation

- [ ] Task 5: Create precision tools state store (AC: #1-#7)
  - [ ] Create `src/lib/stores/precision-tools-state.svelte.ts` using Svelte 5 runes (`$state`, `$derived`)
  - [ ] Expose reactive state for: active snap scale, snap assist enabled flag, loupe active flag, two-stage confirmation enabled flag
  - [ ] Expose derived snap function that composes grid snap and snap assist based on current settings
  - [ ] Expose reactive segment data (curve/line type and control points) for the active polygon
  - [ ] Expose confirmation state (`'inactive' | 'preview' | 'confirmed' | 'cancelled'`) for the active polygon
  - [ ] Ensure each precision tool can be toggled independently
  - [ ] Write unit tests in `src/lib/stores/precision-tools-state.test.ts` verifying independent toggling and state transitions

- [ ] Task 6: Build snap indicator canvas component (AC: #3, #4)
  - [ ] Create `src/lib/canvas/drawing/SnapIndicator.svelte` using svelte-konva
  - [ ] Render a crosshair or highlight circle at the current snap target position
  - [ ] Differentiate visual style by snap type: grid snap (subtle crosshair), corner snap (filled circle), edge snap (line highlight)
  - [ ] Show/hide indicator reactively based on whether a snap target is active
  - [ ] Ensure indicator renders on the drawing layer above the grid but below active drawing handles

- [ ] Task 7: Build bezier curve canvas components (AC: #1, #2)
  - [ ] Create `src/lib/canvas/drawing/BezierSegment.svelte` using svelte-konva to render a quadratic bezier curve via `Konva.Path` or `Konva.Shape` with `quadraticCurveTo`
  - [ ] Create `src/lib/canvas/drawing/ControlHandle.svelte` — a draggable Konva Circle for the bezier midpoint control handle
  - [ ] Wire handle drag events to `updateControlPoint` in the domain layer
  - [ ] Ensure real-time curve reshaping during drag maintains 60fps (avoid unnecessary re-renders; use Konva node direct manipulation if needed)
  - [ ] Add a segment toggle affordance (tap/click on a segment to toggle between line and curve mode)

- [ ] Task 8: Implement magnifier loupe (AC: #5)
  - [ ] Create `src/lib/canvas/drawing/MagnifierLoupe.svelte` as either a separate Konva layer or HTML overlay
  - [ ] On touch-and-hold (long press ~300ms): capture the canvas region around the touch point and render it magnified in a circular loupe above the finger
  - [ ] Position the loupe offset above the touch point so it is not obscured by the finger
  - [ ] During drag-while-holding: update the magnified region in real-time as the touch point moves
  - [ ] On release: place the point at the final touch position (after snap processing) and dismiss the loupe
  - [ ] Create `src/lib/domain/loupe-geometry.ts` with pure functions for calculating loupe position, magnified region bounds, and clipping
  - [ ] Write unit tests for loupe geometry calculations in `src/lib/domain/loupe-geometry.test.ts`

- [ ] Task 9: Implement two-stage polygon confirmation (AC: #6, #7)
  - [ ] Create `src/lib/canvas/drawing/ConfirmationOverlay.svelte` that renders the polygon in preview mode with draggable vertex handles
  - [ ] Each vertex rendered as a `Konva.Circle` handle; dragging updates the polygon vertex position in real-time
  - [ ] Apply snap processing (grid snap + snap assist) during handle dragging in preview mode
  - [ ] Create `src/lib/canvas/drawing/ConfirmationControls.svelte` with Confirm and Cancel buttons (positioned near the polygon or as a floating toolbar)
  - [ ] On Confirm: commit the finalized polygon as an event to the event store, transition confirmation state to `'confirmed'`, clear preview
  - [ ] On Cancel: discard the polygon, transition confirmation state to `'cancelled'`, return to drawing mode
  - [ ] Integrate with the polygon drawing state machine from Story 1.5 — replace immediate finalization with confirmation flow when two-stage confirmation is enabled

- [ ] Task 10: Build precision tools toolbar UI (AC: #1-#7)
  - [ ] Create `src/lib/canvas/drawing/PrecisionToolbar.svelte` with toggle controls for each precision tool
  - [ ] Include snap scale selector (1ft, 6in, 1in, freehand) as a segmented control or dropdown
  - [ ] Include toggles for: snap assist, loupe, two-stage confirmation, curve mode
  - [ ] Wire all toggles to the precision tools state store
  - [ ] Position toolbar contextually (e.g., bottom of canvas area or as a collapsible side panel)
  - [ ] Ensure toolbar is touch-friendly with adequate tap target sizes (minimum 44x44px)

- [ ] Task 11: Integration and performance testing (AC: #1-#7)
  - [ ] Write integration tests verifying snap-to-grid applies during point placement in the drawing flow
  - [ ] Write integration tests verifying snap assist prioritizes corner > edge > grid
  - [ ] Write integration tests verifying bezier toggle and control point drag update the polygon data correctly
  - [ ] Write integration tests verifying two-stage confirmation flow (complete polygon, preview, adjust, confirm/cancel)
  - [ ] Profile canvas performance during curve handle dragging — verify 60fps target with browser dev tools
  - [ ] Profile loupe rendering during drag — verify no frame drops
  - [ ] Test on touch device (or emulated touch) for loupe interaction

## Dev Notes

### Bezier Curves (FR14, FR15)

Each polygon segment can be toggled between straight line and curve mode independently. Curved segments use a quadratic bezier with a single control point (the midpoint handle).

Konva supports bezier rendering through:
- `Konva.Path` with SVG path data (`M x1 y1 Q cx cy x2 y2`)
- `Konva.Shape` with custom `sceneFunc` using `context.quadraticCurveTo()`

The polygon data model must be extended so each segment carries: `{ type: 'line' | 'curve', controlPoint?: Point }`. When toggling a segment to curve mode, initialize the control point at the geometric midpoint of the segment. The control point is then draggable.

Real-time curve reshaping during handle drag must maintain 60fps. To achieve this:
- Use Konva's built-in drag events on the control handle node directly
- Avoid full Svelte re-render cycles during drag — update the Konva node directly if needed
- Batch control point updates; do not trigger event store writes during drag (only on drag end)

### Snap-to-Grid (FR16)

The snap function takes a canvas point and the current grid scale, returning the nearest grid intersection. Grid scales:
- **1ft** — snaps to 1-foot grid intersections
- **6in** — snaps to 6-inch grid intersections
- **1in** — snaps to 1-inch grid intersections
- **freehand** — no snapping, point placed exactly where the user taps

Visual feedback: render a snap indicator (crosshair or highlight) at the snap target before the user commits the point. This gives the user confidence that snapping is active.

Snap must apply in two contexts:
1. During initial point placement in drawing mode
2. During vertex handle dragging in two-stage confirmation preview mode

### Snap Assist to Edges and Corners (FR17)

When placing a point, check proximity to existing shape edges, corners, and the property boundary. The snap radius must be a constant screen-space distance (e.g., 12px) so it feels consistent regardless of zoom level. At high zoom, the canvas-space snap radius shrinks; at low zoom, it grows.

Priority ordering prevents conflicting snaps:
1. **Corner snap** — highest priority; snaps to existing vertices
2. **Edge snap** — snaps to the nearest point on an existing edge
3. **Grid snap** — lowest priority; only applies if no corner or edge is in range

Visual indicator differentiates snap types: corners get a filled dot, edges get a line highlight, grid gets a subtle crosshair.

### Magnifier Loupe (FR18)

Mobile-focused precision tool that solves the "fat finger" problem on touch devices. Interaction flow:
1. User touches and holds the canvas (~300ms long press threshold)
2. A magnified circular view appears offset above the touch point
3. User drags while holding to position precisely — the loupe updates in real-time
4. On release, the point is placed at the final position (after snap processing)

Implementation options:
- **Separate Konva layer** — render a clipped, scaled copy of the canvas region
- **HTML overlay** — use a `<canvas>` element positioned absolutely over the Konva stage

The loupe should show the snap indicator within its magnified view so the user can see snap targets at high magnification.

Loupe geometry (position offset, magnified region bounds, clipping circle) should be extracted to pure domain functions for testability.

### Two-Stage Confirmation (FR19)

After the user closes a polygon (by connecting back to the first point or pressing a "close" action), the polygon enters preview/confirmation mode instead of being immediately finalized.

In preview mode:
- Each vertex is rendered as a draggable Konva Circle handle
- Dragging a handle updates the polygon shape in real-time
- Snap processing (grid + snap assist) applies during handle dragging
- Bezier control handles remain draggable if any segments are curved

Confirm/Cancel controls:
- **Confirm** — finalizes the polygon by committing the appropriate event to the event store
- **Cancel** — discards the polygon entirely and returns to drawing mode

This replaces the immediate finalization from Story 1.5's drawing flow. When two-stage confirmation is disabled, the polygon finalizes immediately as before (backward compatible).

### Modularity

All precision tools are independently toggleable. The system must work correctly with any combination of tools enabled or disabled:
- Snap-to-grid only
- Snap assist only
- Both snaps + loupe
- Two-stage confirmation without any snaps
- All tools enabled
- No tools enabled (baseline drawing from Story 1.5)

The precision tools state store manages all toggle states reactively. The snap coordinator composes active snap behaviors. UI components check tool state before rendering their precision affordances.

### Performance Considerations

- **60fps target** applies to: curve handle dragging, loupe rendering during drag, vertex handle dragging in confirmation mode
- Avoid triggering Svelte reactivity during high-frequency drag events — use Konva node direct manipulation where possible
- Do not write to the event store during drag operations — only on drag end
- Loupe rendering should use `requestAnimationFrame` if implemented as an HTML overlay
- Snap calculations should be fast (O(n) where n = existing vertices/edges); consider spatial indexing if shapes become numerous

### File Structure

```
src/lib/
├── domain/
│   ├── snap-to-grid.ts
│   ├── snap-to-grid.test.ts
│   ├── snap-assist.ts
│   ├── snap-assist.test.ts
│   ├── snap-coordinator.ts
│   ├── bezier-segment.ts
│   ├── bezier-segment.test.ts
│   ├── loupe-geometry.ts
│   └── loupe-geometry.test.ts
├── stores/
│   ├── precision-tools-state.svelte.ts
│   └── precision-tools-state.test.ts
├── types/
│   └── precision-tools.ts
└── canvas/
    └── drawing/
        ├── SnapIndicator.svelte
        ├── BezierSegment.svelte
        ├── ControlHandle.svelte
        ├── MagnifierLoupe.svelte
        ├── ConfirmationOverlay.svelte
        ├── ConfirmationControls.svelte
        └── PrecisionToolbar.svelte
```

### Architecture Compliance

- **No business logic in Svelte components** — all snap calculations, bezier math, loupe geometry, and confirmation state transitions live in `src/lib/domain/`
- **File naming:** `kebab-case.ts` for TypeScript, `PascalCase.svelte` for components
- **No in-place state mutation** — always create new objects when updating polygon data or snap state
- **No `Date.now()`** — use ISO 8601 for any timestamps
- **Test co-location:** `snap-to-grid.ts` and `snap-to-grid.test.ts` in the same directory

### Dependencies on Prior Stories

- **Story 1.4 (Canvas Foundation):** Provides Konva stage, layers, pan/zoom, and configurable grid — this story's snap-to-grid builds on that grid
- **Story 1.5 (Polygon Drawing Tool):** Provides the base polygon drawing state machine — this story extends that machine with curve segments and confirmation mode
- **Story 1.2 (Event Store):** Provides the event store for committing finalized polygons

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — Canvas & Rendering Layer]
- [Source: _bmad-output/planning-artifacts/architecture.md — Implementation Patterns & Consistency Rules]
- [Source: _bmad-output/planning-artifacts/architecture.md — Project Structure & Boundaries]
- [Source: _bmad-output/planning-artifacts/epics.md — Story 1.6: Drawing Precision Tools]
- [Source: _bmad-output/planning-artifacts/epics.md — FR14: Curve Mode Toggle]
- [Source: _bmad-output/planning-artifacts/epics.md — FR15: Bezier Midpoint Handle]
- [Source: _bmad-output/planning-artifacts/epics.md — FR16: Snap-to-Grid]
- [Source: _bmad-output/planning-artifacts/epics.md — FR17: Snap Assist to Edges/Corners]
- [Source: _bmad-output/planning-artifacts/epics.md — FR18: Magnifier Loupe]
- [Source: _bmad-output/planning-artifacts/epics.md — FR19: Two-Stage Confirmation]
