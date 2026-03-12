## 1. Geometry Utilities

- [ ] 1.1 Implement grid snap function (snap point to nearest grid intersection within 0.5 world units threshold)
- [ ] 1.2 Implement point-in-polygon hit test using ray-casting algorithm (handles concave polygons, edge points treated as inside)
- [ ] 1.3 Implement segment-segment intersection test for self-intersection detection
- [ ] 1.4 Implement polygon self-intersection check (tests all non-adjacent edge pairs)
- [ ] 1.5 Implement centroid calculation with pole-of-inaccessibility fallback for concave polygons
- [ ] 1.6 Write tests for all geometry utilities

## 2. Store Updates

- [ ] 2.1 Add `drawingPoints`, `draggedVertexIndex`, and `cursorWorldPosition` fields to uiStore
- [ ] 2.2 Add `setPropertyBoundary` and `setHouseOutline` actions to projectStore
- [ ] 2.3 Add `selectedType` and `selectedId` selection fields to uiStore (if not already present)
- [ ] 2.4 Write tests for store actions and selectors

## 3. Draw Tool State Machine

- [ ] 3.1 Implement DrawTool class with IDLE → DRAWING → COMPLETE state machine
- [ ] 3.2 Implement vertex placement with screen-to-world conversion and grid snap
- [ ] 3.3 Implement double-click completion (3+ vertices, no duplicate vertex from second click)
- [ ] 3.4 Implement close-to-first-vertex completion (10px screen threshold, 3+ vertices)
- [ ] 3.5 Implement Escape key cancellation (clear drawingPoints, reset to select tool)
- [ ] 3.6 Implement tool activation/deactivation (set activeTool, clear state, clear selection)
- [ ] 3.7 Implement polygon save dispatch (route to setPropertyBoundary or setHouseOutline based on activeTool)
- [ ] 3.8 Write tests for draw tool state machine and all transitions

## 4. Preview Renderer

- [ ] 4.1 Implement draw preview renderer (solid edges between placed vertices, 2px stroke)
- [ ] 4.2 Implement rubber-band dashed line from last vertex to cursor (70% opacity)
- [ ] 4.3 Implement closing hint dashed line from cursor to first vertex (30% opacity, 3+ vertices)
- [ ] 4.4 Implement vertex circle rendering (first vertex 6px, others 4px, white fill with colored stroke)
- [ ] 4.5 Write tests for preview renderer

## 5. Property & House Renderers

- [ ] 5.1 Implement property renderer (blue stroke #3B82F6, 2px, 10% fill, closed path)
- [ ] 5.2 Implement property selected state (3px stroke, 6x6px vertex handle squares, selection glow)
- [ ] 5.3 Implement house renderer (gray stroke #374151, 2px, 50% fill, closed path)
- [ ] 5.4 Implement house "House" label at centroid (14px sans-serif, #1F2937, centered)
- [ ] 5.5 Implement house selected state (3px stroke, vertex handle squares)
- [ ] 5.6 Integrate renderers into CanvasEngine render loop in correct order (grid → property → zones → house)
- [ ] 5.7 Write tests for renderers

## 6. Selection & Vertex Editing

- [ ] 6.1 Implement hit testing for property/house polygon selection in select mode
- [ ] 6.2 Implement vertex hit testing (8px screen-space threshold)
- [ ] 6.3 Implement vertex dragging with real-time polygon update and grid snap
- [ ] 6.4 Implement self-intersection prevention on vertex drag (revert on mouseup if invalid)
- [ ] 6.5 Implement click-on-empty-canvas to clear selection
- [ ] 6.6 Write tests for selection and vertex editing

## 7. Toolbar Integration

- [ ] 7.1 Add "Draw Property" and "Draw House" buttons to toolbar
- [ ] 7.2 Implement active state styling for toolbar buttons
- [ ] 7.3 Implement toggle behavior (clicking active tool deactivates it)
- [ ] 7.4 Write tests for toolbar button interactions
