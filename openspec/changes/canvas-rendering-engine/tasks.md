## 1. Canvas Engine Core Specs

- [ ] 1.1 Write failing tests for canvas initialization and mount/unmount lifecycle (`canvas-engine-core` spec)
- [ ] 1.2 Write failing tests for `worldToScreen` and `screenToWorld` coordinate transforms
- [ ] 1.3 Write failing tests for `setZoom` with focal-point anchoring and zoom clamping
- [ ] 1.4 Write failing tests for `pan` screen-delta-to-world-unit conversion
- [ ] 1.5 Write failing tests for responsive resize and HiDPI canvas sizing
- [ ] 1.6 Write failing tests for render loop dirty-flag (`needsRender`) efficiency
- [ ] 1.7 Implement or verify all engine core behaviors pass (TDD green phase)

## 2. Grid Renderer Specs

- [ ] 2.1 Write failing tests for adaptive minor spacing logic (doubles until ≥ 10px)
- [ ] 2.2 Write failing tests for major line intervals at `majorEvery` multiples
- [ ] 2.3 Write failing tests for viewport culling (off-screen lines not drawn)
- [ ] 2.4 Write failing tests for `layerVisibility.grid` toggle
- [ ] 2.5 Implement or verify all grid renderer behaviors pass

## 3. Domain Renderers

- [ ] 3.1 Write failing tests for property boundary polygon renderer
- [ ] 3.2 Write failing tests for house rectangle renderer (position, size, rotation)
- [ ] 3.3 Write failing tests for zone polygon renderer (fill, stroke, layer toggle)
- [ ] 3.4 Write failing tests for placed feature icon renderer (position, scale, layer toggle)
- [ ] 3.5 Write failing tests for measurement line + label renderer (distance label, layer toggle)
- [ ] 3.6 Write failing tests for drawing preview renderer (dashed/semi-transparent style, null case)
- [ ] 3.7 Write failing tests for selection highlight renderer (overlay on selected IDs, empty case)
- [ ] 3.8 Write failing tests for back-to-front render order
- [ ] 3.9 Implement property boundary renderer and make tests pass
- [ ] 3.10 Implement house renderer and make tests pass
- [ ] 3.11 Implement zone renderer and make tests pass
- [ ] 3.12 Implement feature icon renderer and make tests pass
- [ ] 3.13 Implement measurement renderer and make tests pass
- [ ] 3.14 Implement drawing preview renderer and make tests pass
- [ ] 3.15 Implement selection highlight renderer and make tests pass
- [ ] 3.16 Wire renderers into `CanvasEngine.render()` in correct order

## 4. Hit Testing

- [ ] 4.1 Write failing tests for `hitTest` returning `null` on empty canvas
- [ ] 4.2 Write failing tests for zone polygon hit detection
- [ ] 4.3 Write failing tests for feature bounding-area hit detection
- [ ] 4.4 Write failing tests for property vertex tolerance-radius hit detection
- [ ] 4.5 Write failing tests for hit precedence order (features > zones > property vertices > house)
- [ ] 4.6 Write failing tests for layer-visibility filtering in hit test
- [ ] 4.7 Write failing tests for viewport-aware coordinate conversion in hit test
- [ ] 4.8 Implement `hitTest` on `CanvasEngine` and make all tests pass

## 5. Interaction Tools

- [ ] 5.1 Create `Tool` interface and tool dispatch infrastructure in `src/canvas/tools/`
- [ ] 5.2 Write failing tests for pointer event routing to active tool
- [ ] 5.3 Write failing tests for middle-mouse pan and two-finger pan
- [ ] 5.4 Write failing tests for scroll-wheel zoom and pinch-to-zoom (focal-point anchoring)
- [ ] 5.5 Write failing tests for select tool: click selects, empty click clears, drag moves object
- [ ] 5.6 Write failing tests for draw tool: click adds vertex, double-click commits, Escape cancels
- [ ] 5.7 Write failing tests for place tool: click places feature, mouse move updates preview
- [ ] 5.8 Write failing tests for measure tool: two-click measurement commit, live preview on mouse move
- [ ] 5.9 Implement tool dispatch infrastructure and make routing tests pass
- [ ] 5.10 Implement select tool and make tests pass
- [ ] 5.11 Implement draw tool and make tests pass
- [ ] 5.12 Implement place tool and make tests pass
- [ ] 5.13 Implement measure tool and make tests pass
- [ ] 5.14 Wire pointer event handlers in `CanvasEngine` to dispatch to active tool

## 6. Definition of Done

- [ ] 6.1 Run `npm run test -- --run` and confirm all tests pass
- [ ] 6.2 Run `npm run lint` and confirm no errors
- [ ] 6.3 Run `npm run dev` and confirm dev server starts without errors
- [ ] 6.4 Update `plans/` docs if any design decisions changed during implementation
