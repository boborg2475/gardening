## Why

The canvas engine, stores, and persistence layer are in place (Phase 1), but users cannot yet draw anything on the map. Without a polygon drawing tool and property/house renderers, the app is an empty canvas with no interactive functionality. This is the first feature users need to start mapping their yard.

## What Changes

- Add a polygon draw tool with a finite state machine (IDLE → DRAWING → COMPLETE) supporting vertex placement, grid snapping, double-click completion, close-to-first-vertex completion, and Escape to cancel
- Add property boundary drawing mode (`draw-property`) that saves a single closed polygon to `projectStore.propertyBoundary`
- Add house outline drawing mode (`draw-house`) that saves a single closed polygon to `projectStore.houseOutline`
- Add live preview rendering during drawing (solid completed edges, dashed rubber-band line to cursor, closing hint line)
- Add vertex editing for saved property/house polygons (drag to reshape, self-intersection prevention)
- Add property renderer (blue stroke, 10% fill, selected state with vertex handles)
- Add house renderer (gray stroke, 50% fill, "House" label at centroid, selected state)
- Add hit testing for property/house selection in select mode
- Wire toolbar buttons for draw-property and draw-house tools

## Capabilities

### New Capabilities
- `polygon-draw-tool`: Reusable polygon drawing state machine with vertex placement, grid snapping, preview rendering, and completion logic
- `property-house-outlines`: Property boundary and house outline drawing, rendering, selection, and vertex editing

### Modified Capabilities

## Impact

- `src/canvas/` — New draw tool handler, property renderer, house renderer, preview renderer
- `src/store/` — New uiStore fields (drawingPoints, draggedVertexIndex), new projectStore actions (setPropertyBoundary, setHouseOutline)
- `src/components/layout/` — Toolbar updates to add draw-property and draw-house buttons
- `src/types/` — May need Point type and polygon-related type additions
- `src/utils/` — Geometry utilities (point-in-polygon, segment intersection, grid snapping, centroid calculation)
