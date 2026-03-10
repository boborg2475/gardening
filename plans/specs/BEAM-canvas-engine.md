# BEAM Specs: Canvas Engine

Behavior-Event-Action-Model specifications for the Canvas Engine and Rendering system. Each spec is detailed enough to derive unit and integration tests.

---

## BEAM-CE-001: Canvas initializes with default viewport

**Behavior:** When the application loads and the canvas engine mounts, the canvas displays with a default viewport showing the world origin at the top-left corner, at 1:1 zoom.

**Event:** `CanvasEngine.mount()` is called with a valid container element.

**Action:**
1. Create and append `<canvas>` element to the container.
2. Read container dimensions and `devicePixelRatio`.
3. Set canvas buffer size to `containerWidth * dpr` by `containerHeight * dpr`.
4. Set CSS size to match container dimensions.
5. Apply context scale transform for DPR.
6. Initialize camera state in uiStore to defaults.
7. Start the render loop.
8. Draw the first frame.

**Model:**
- `uiStore.panX` = `0`
- `uiStore.panY` = `0`
- `uiStore.zoom` = `1.0`
- Canvas `width` attribute = `containerWidth * dpr`
- Canvas `height` attribute = `containerHeight * dpr`

**Preconditions:** Container element exists in the DOM and has non-zero dimensions.

**Expected Outcome:** Canvas is visible, grid is rendered with world origin at screen top-left, zoom is 1.0.

**Edge Cases:**
- Container has zero width or height (canvas should still mount but render nothing visible).
- `devicePixelRatio` is not 1 (e.g., 2 or 3 on HiDPI displays).
- Mount is called twice without an intervening unmount (should be idempotent or throw).

---

## BEAM-CE-002: World-to-screen coordinate conversion

**Behavior:** Internal world coordinates (feet/meters) are correctly converted to screen pixel positions for rendering.

**Event:** Any renderer calls `worldToScreen(x, y)`.

**Action:** Apply the transform: `sx = (x - panX) * zoom`, `sy = (y - panY) * zoom`.

**Model:** No state change. Pure computation based on current `panX`, `panY`, `zoom`.

**Preconditions:** Camera state is initialized.

**Expected Outcome:**
- At default viewport (pan 0,0 zoom 1): `worldToScreen(5, 10)` returns `{ sx: 5, sy: 10 }`.
- At pan (10, 20) zoom 2: `worldToScreen(15, 25)` returns `{ sx: 10, sy: 10 }`.
- At zoom 0.5, pan (0,0): `worldToScreen(10, 10)` returns `{ sx: 5, sy: 5 }`.

**Edge Cases:**
- Negative world coordinates yield negative screen coordinates (off-screen to the left/top).
- Very large world coordinates at high zoom may exceed canvas bounds.
- Zoom of exactly 0.1 (minimum) and 10.0 (maximum).

---

## BEAM-CE-003: Screen-to-world coordinate conversion

**Behavior:** Screen pixel positions (e.g., from mouse clicks) are correctly converted back to world coordinates.

**Event:** A pointer event provides screen coordinates; the system calls `screenToWorld(sx, sy)`.

**Action:** Apply the inverse transform: `x = sx / zoom + panX`, `y = sy / zoom + panY`.

**Model:** No state change. Pure computation.

**Preconditions:** Camera state is initialized.

**Expected Outcome:**
- At default viewport: `screenToWorld(5, 10)` returns `{ x: 5, y: 10 }`.
- At pan (10, 20) zoom 2: `screenToWorld(10, 10)` returns `{ x: 15, y: 25 }`.
- Round-trip: `screenToWorld(worldToScreen(x, y))` returns `{ x, y }` (within floating-point tolerance).

**Edge Cases:**
- Screen coordinate (0, 0) always maps to `(panX, panY)`.
- Negative screen coordinates (possible if pointer is outside the canvas element).

---

## BEAM-CE-004: Zoom in/out centered on cursor

**Behavior:** When the user scrolls the mouse wheel, the canvas zooms in or out. The point under the mouse cursor remains fixed on screen (the world appears to expand/contract around the cursor).

**Event:** `wheel` event on the canvas element. `deltaY < 0` = zoom in, `deltaY > 0` = zoom out.

**Action:**
1. Compute new zoom level: `newZoom = currentZoom * (1 - deltaY * 0.001)` (or similar factor).
2. Clamp to `[0.1, 10.0]`.
3. Compute the world point under the cursor using old zoom: `wx = sx / oldZoom + panX`.
4. Compute new pan so that `wx` maps back to the same `sx`: `newPanX = wx - sx / newZoom`.
5. Update uiStore with `{ panX: newPanX, panY: newPanY, zoom: newZoom }`.

**Model:**
- `uiStore.zoom` changes.
- `uiStore.panX` and `uiStore.panY` adjust to keep the focal point stable.

**Preconditions:** Canvas is mounted and receiving events.

**Expected Outcome:**
- After zooming in at cursor position (100, 100) on screen, converting `(100, 100)` back to world coords yields the same world point as before the zoom.
- Canvas re-renders at the new zoom level.

**Edge Cases:**
- Zooming at screen corner (0, 0) should keep the world origin fixed at the top-left.
- Zooming at canvas center vs. edge produces different pan offsets.
- Rapid successive wheel events (zoom should remain smooth and not overshoot).
- Trackpad smooth-scroll producing fractional `deltaY` values.

---

## BEAM-CE-005: Zoom clamped to min/max range

**Behavior:** Zoom level never goes below 0.1 or above 10.0, regardless of user input.

**Event:** `setZoom()` is called with a value outside `[0.1, 10.0]`.

**Action:** The requested zoom is clamped: `Math.min(10, Math.max(0.1, requestedZoom))`. The clamped value is stored. Pan adjustment still uses the clamped value for the focal-point calculation.

**Model:**
- `uiStore.zoom` is set to the clamped value, never exceeding bounds.

**Preconditions:** None beyond initialized state.

**Expected Outcome:**
- `setZoom(0.05, point)` results in `zoom = 0.1`.
- `setZoom(15.0, point)` results in `zoom = 10.0`.
- `setZoom(5.0, point)` results in `zoom = 5.0` (no clamping).
- Repeated scroll-down events at zoom 0.1 do not change zoom or pan.
- Repeated scroll-up events at zoom 10.0 do not change zoom or pan.

**Edge Cases:**
- `setZoom(NaN, point)` or `setZoom(Infinity, point)` should be handled gracefully (ignored or fallback to current zoom).
- `setZoom(0, point)` should clamp to 0.1 (zero zoom is undefined).
- Negative zoom values should clamp to 0.1.

---

## BEAM-CE-006: Pan via mouse drag

**Behavior:** The user holds the middle mouse button and drags to pan the canvas. The world appears to slide under the cursor, following the drag direction.

**Event:** `pointerdown` (button 1, middle mouse) followed by `pointermove` events, ending with `pointerup`.

**Action:**
1. On `pointerdown` with `button === 1`: record starting screen position, set panning mode.
2. On each `pointermove` while panning: compute `deltaX = currentScreenX - prevScreenX`, `deltaY = currentScreenY - prevScreenY`. Call `pan(deltaX, deltaY)` which updates `panX -= deltaX / zoom`, `panY -= deltaY / zoom`. Update `prevScreen` to current.
3. On `pointerup`: exit panning mode.

**Model:**
- `uiStore.panX` and `uiStore.panY` change by the accumulated drag delta (converted to world units).
- `uiStore.zoom` does not change.

**Preconditions:** Canvas is mounted. No other modal interaction (e.g., drawing) is consuming the pointer.

**Expected Outcome:**
- Dragging 100px to the right at zoom 2 changes `panX` by `-50` world units (viewport shifts right, so panX decreases by `100/2`).
- The canvas re-renders continuously during the drag, showing smooth panning.
- Releasing the button stops panning; subsequent mouse moves do not pan.

**Edge Cases:**
- Drag starts inside canvas but pointer moves outside the canvas (should continue panning via pointer capture).
- Very fast drags (large deltas in a single event) should not cause visual jumps beyond normal movement.
- Middle-click without drag (zero delta) should not change pan.

---

## BEAM-CE-007: Pan via touch gesture (two-finger)

**Behavior:** On touch devices, placing two fingers and dragging pans the canvas. The midpoint between the two fingers controls the pan direction.

**Event:** `touchstart` with 2 touches, followed by `touchmove` events, ending with `touchend` (one or both fingers lifted).

**Action:**
1. On `touchstart` with 2 touches: compute initial midpoint `mid0 = midpoint(touch0, touch1)`. Set touch-panning mode.
2. On `touchmove`: compute new midpoint. Delta = `newMid - prevMid`. Call `pan(deltaX, deltaY)`. Update `prevMid`.
3. On `touchend` reducing to fewer than 2 touches: exit touch-panning mode.

**Model:**
- `uiStore.panX` and `uiStore.panY` change.

**Preconditions:** Touch device. Canvas is mounted.

**Expected Outcome:**
- Two-finger drag of 50px down at zoom 1 changes `panY` by `-50`.
- Pan and pinch-to-zoom (BEAM-CE-008) can occur simultaneously in the same gesture.

**Edge Cases:**
- A third finger joins mid-gesture (should be ignored; use only the original two touches or re-baseline).
- One finger lifts and is replaced quickly (should end the gesture, not continue with a different finger pair).
- Touch events with `{passive: false}` to prevent default browser scroll/zoom.

---

## BEAM-CE-008: Pinch-to-zoom on touch devices

**Behavior:** Placing two fingers and pinching (moving them closer) zooms out; spreading (moving them apart) zooms in. Zoom centers on the midpoint between the two fingers.

**Event:** `touchmove` with 2 active touches where the distance between them changes.

**Action:**
1. Compute previous distance `prevDist` and current distance `newDist` between the two touch points.
2. Compute ratio `scale = newDist / prevDist`.
3. Compute midpoint in screen coordinates.
4. Call `setZoom(currentZoom * scale, midpoint)`.
5. Pan adjustment happens inside `setZoom` (focal-point stabilization).
6. Also apply the midpoint delta as a pan (BEAM-CE-007) so pan and zoom are simultaneous.

**Model:**
- `uiStore.zoom` changes (clamped to [0.1, 10.0]).
- `uiStore.panX` and `uiStore.panY` change (focal-point correction + pan gesture).

**Preconditions:** Two active touch points. Canvas is mounted.

**Expected Outcome:**
- Spreading fingers doubles the distance: zoom doubles (or gets clamped).
- The world point at the midpoint between fingers stays at the same screen position.
- Combining pinch with drag results in simultaneous zoom and pan.

**Edge Cases:**
- `prevDist` is zero (fingers at same point): skip zoom calculation to avoid division by zero.
- Very rapid pinch (scale factor > 2x in one frame): should be handled smoothly, clamping zoom as needed.
- Pinch that would exceed zoom bounds: zoom clamps and pan adjusts accordingly.

---

## BEAM-CE-009: Grid renders at correct spacing for zoom level

**Behavior:** Grid lines are always visually readable. When zoomed out far enough that 1-unit grid lines would be too dense, the grid automatically doubles its spacing so lines stay at least 10 screen pixels apart.

**Event:** The render loop calls `renderGrid()` on each frame.

**Action:**
1. Start with `effectiveSpacing = minorSpacing` (default 1).
2. While `effectiveSpacing * zoom < 10`: `effectiveSpacing *= 2`.
3. Draw vertical and horizontal lines at every `effectiveSpacing` world units within the visible bounds.
4. Style minor lines with light color and thin stroke.

**Model:** No state change. `effectiveSpacing` is computed transiently per frame.

**Preconditions:** Grid layer visibility is `true`.

**Expected Outcome:**
- At zoom 1.0: `effectiveSpacing = 1` (1 * 1 = 1, which is < 10, so double to 2; 2 * 1 = 2 < 10; double to 4; 4 < 10; double to 8; 8 < 10; double to 16; 16 >= 10; so effectiveSpacing = 16). Wait -- re-evaluating: at zoom 1, 1 pixel per world unit, lines would be 1px apart. Effective spacing becomes 16.
- At zoom 10: `effectiveSpacing = 1` (1 * 10 = 10, which is >= 10, so spacing stays at 1).
- At zoom 20 (hypothetical above max): spacing would be 1 still.
- At zoom 0.1: `1 * 0.1 = 0.1 < 10`, doubles repeatedly: 2, 4, 8, 16, 32, 64, 128 (128 * 0.1 = 12.8 >= 10). Effective spacing = 128.

**Edge Cases:**
- Zoom changes mid-render (should not happen due to single-threaded render, but spacing is computed per frame).
- Grid units switch from feet to meters: spacing recalculates based on new unit.

---

## BEAM-CE-010: Grid major lines appear every N units

**Behavior:** Among the drawn grid lines, every Nth line is drawn with a heavier, darker stroke to help users gauge distances at a glance. By default, N = 5.

**Event:** The render loop calls `renderGrid()`.

**Action:**
1. After determining `effectiveSpacing`, compute `majorSpacing = majorEvery * effectiveSpacing` (default: `5 * effectiveSpacing`).
2. For each grid line position: if `position % majorSpacing === 0`, draw with major style; otherwise draw with minor style.

**Model:** No state change.

**Preconditions:** Grid layer visibility is `true`.

**Expected Outcome:**
- At effective spacing 1, major lines at 0, 5, 10, 15, etc.
- At effective spacing 2, major lines at 0, 10, 20, 30, etc.
- Major lines are visually distinguishable (darker, thicker).

**Edge Cases:**
- Floating-point modulo: use a tolerance when checking `position % majorSpacing` to account for floating-point drift.
- World coordinates may be negative: major lines should still align to multiples of `majorSpacing` (e.g., -10, -5, 0, 5, 10).

---

## BEAM-CE-011: Canvas resizes responsively to container

**Behavior:** When the browser window resizes, or when a sidebar panel opens/closes changing the container dimensions, the canvas immediately adjusts to fill its container without distortion.

**Event:** `ResizeObserver` callback fires on the container element, or `window.resize` event.

**Action:**
1. Debounce to one animation frame.
2. Read new container dimensions via `getBoundingClientRect()`.
3. Update canvas `width` and `height` attributes (buffer size = CSS size * DPR).
4. Update canvas CSS `width` and `height` styles.
5. Reapply context DPR transform.
6. Trigger a re-render.

**Model:**
- Canvas element `width` and `height` attributes change.
- No store state changes (viewport pan/zoom remain the same).

**Preconditions:** Canvas is mounted.

**Expected Outcome:**
- After resize, the canvas fills the container with no scrollbars or overflow.
- The world content stays at the same pan/zoom position (no jump).
- Lines and text remain crisp (DPR is re-applied).

**Edge Cases:**
- Container shrinks to very small size (e.g., 50x50 pixels): canvas should still render correctly.
- Container size changes rapidly (window drag-resize): debouncing prevents excessive resize calls.
- Container is temporarily hidden (display: none) and then shown: resize should trigger on re-show.

---

## BEAM-CE-012: HiDPI rendering (devicePixelRatio scaling)

**Behavior:** On high-density displays (e.g., Retina at 2x), lines, text, and shapes render crisply without blurriness.

**Event:** Canvas mount or resize.

**Action:**
1. Read `window.devicePixelRatio` (e.g., 2).
2. Set canvas buffer dimensions: `canvas.width = cssWidth * dpr`, `canvas.height = cssHeight * dpr`.
3. Set CSS size to `cssWidth` x `cssHeight`.
4. Call `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)` so all drawing commands use CSS-pixel coordinates.
5. All renderers draw in CSS-pixel space; the browser composites the oversized buffer onto the CSS-sized element.

**Model:** Canvas buffer dimensions differ from CSS dimensions by a factor of DPR.

**Preconditions:** Browser supports `devicePixelRatio`.

**Expected Outcome:**
- On a 2x display with a 400x300 CSS container: canvas buffer is 800x600, CSS size is 400x300.
- 1-pixel-wide lines appear sharp (not blurry).
- Text rendered via `fillText` is crisp.

**Edge Cases:**
- `devicePixelRatio` changes at runtime (e.g., window dragged between monitors of different DPR): should re-read DPR on resize.
- DPR of 1.5 (common on some Windows laptops): fractional buffer sizes should be rounded (e.g., `Math.round(cssWidth * dpr)`).
- DPR of 1 (standard display): buffer size equals CSS size, no extra scaling.

---

## BEAM-CE-013: Render loop redraws on state change

**Behavior:** The canvas automatically redraws whenever relevant state changes in either Zustand store, without manual trigger. If no state changes, the canvas does not redraw unnecessarily.

**Event:** Any mutation to `projectStore` or `uiStore` that affects rendering.

**Action:**
1. Store subscriptions set a `needsRender` flag to `true`.
2. The `requestAnimationFrame` loop checks `needsRender` at the top of each frame.
3. If `true`, reset the flag and call `render()`.
4. If `false`, skip rendering (early return).

**Model:**
- Internal `needsRender` flag (not in any store).

**Preconditions:** Canvas is mounted and the render loop is running.

**Expected Outcome:**
- Adding a zone to `projectStore` triggers a redraw showing the new zone.
- Changing `uiStore.zoom` triggers a redraw at the new zoom level.
- Changing an unrelated uiStore field (e.g., active dialog) does not trigger a redraw if subscriptions use selective selectors.
- Multiple rapid state changes within a single frame result in only one redraw.

**Edge Cases:**
- State changes after `unmount()`: subscriptions should be cleaned up, no rendering attempted.
- State change during an active render call: the `needsRender` flag is set again, causing another render on the next frame (not re-entrant).
- No state changes for extended periods: no CPU usage from rendering (idle loop is nearly free due to the flag check).

---

## BEAM-CE-014: Hit test identifies topmost zone at point

**Behavior:** When the user clicks on a point that falls inside one or more zones, the hit test returns the topmost zone (highest in the rendering/z-order).

**Event:** `hitTest(sx, sy)` is called with screen coordinates inside a zone.

**Action:**
1. Convert `(sx, sy)` to world coordinates `(wx, wy)`.
2. Iterate zones in reverse z-order (topmost first).
3. For each zone, run point-in-polygon (ray-casting algorithm) on the zone's vertices.
4. Return the first zone that contains the point.

**Model:** No state change. Read-only access to `projectStore.zones`.

**Preconditions:** At least one zone exists in the project.

**Expected Outcome:**
- Click inside a single zone: returns `{ type: 'zone', id: '<zone-id>' }`.
- Click where two zones overlap: returns the one rendered on top (last in the zones array, or highest z-index).
- Click outside all zones (but possibly on another object type): zone hit test returns no match; other layers are tested.

**Edge Cases:**
- Click exactly on a zone edge: should count as inside (use inclusive boundary in ray-casting).
- Zone with only 2 vertices (degenerate polygon): should not match (or be treated as a line with a tolerance).
- Zone with collinear vertices: ray-casting should still work correctly.
- Very small zone (a few pixels on screen): tolerance adjustment so it remains clickable.

---

## BEAM-CE-015: Hit test identifies feature at point

**Behavior:** When the user clicks on a feature icon (tree, shrub, bed, etc.), the hit test returns that feature.

**Event:** `hitTest(sx, sy)` is called with screen coordinates over a feature.

**Action:**
1. Convert `(sx, sy)` to world coordinates `(wx, wy)`.
2. Iterate features in reverse z-order.
3. For circular features: check `distance((wx, wy), feature.position) <= feature.radius + tolerance`.
4. For rectangular features: check if `(wx, wy)` is inside the bounding rect (with optional rotation and tolerance).
5. Return the first match.

**Model:** No state change.

**Preconditions:** At least one feature exists.

**Expected Outcome:**
- Click on a tree icon center: returns `{ type: 'feature', id: '<feature-id>' }`.
- Click just outside a feature's radius but within tolerance: still returns a hit.
- Click on overlapping features: returns the topmost one.

**Edge Cases:**
- Feature with zero radius: tolerance ensures it is still clickable.
- Rotated rectangular feature: hit test respects rotation (inverse-rotate the test point into the feature's local space).
- Feature at the edge of the visible viewport: still hittable if the click is within bounds.

---

## BEAM-CE-016: Hit test returns null for empty space

**Behavior:** When the user clicks on an area with no objects, the hit test returns `null`, indicating nothing was clicked.

**Event:** `hitTest(sx, sy)` is called with screen coordinates in empty space.

**Action:**
1. Convert to world coordinates.
2. Test all layers in reverse order.
3. No layer produces a match.
4. Return `null`.

**Model:** No state change.

**Preconditions:** Canvas is mounted with valid state.

**Expected Outcome:**
- Click on empty area far from any objects: returns `null`.
- Click on grid lines (grid is not interactive): returns `null`.
- Click on the canvas background: returns `null`.

**Edge Cases:**
- Project has no objects at all (empty project): always returns `null`.
- Click on a measurement line (measurements may or may not be interactive depending on design; if not interactive, returns `null`).
- All layers are hidden via visibility toggles: returns `null` even if objects exist at that position (hidden objects are not hittable).

---

## BEAM-CE-017: Rendering respects layer visibility toggles

**Behavior:** The user can toggle visibility of individual layers (grid, property boundary, house, zones, features, measurements). Hidden layers are neither rendered nor interactive.

**Event:** User toggles a layer in the UI, which sets `uiStore.layerVisibility.<layer>` to `false`.

**Action:**
1. On the next render frame, the render loop checks `layerVisibility` before calling each renderer.
2. If a layer's visibility is `false`, its renderer is skipped entirely.
3. Hit testing also skips hidden layers.

**Model:**
- `uiStore.layerVisibility.<layer>` = `false`.
- `projectStore` is unaffected (data is preserved, just not drawn).

**Preconditions:** Canvas is mounted. At least one layer has content.

**Expected Outcome:**
- Setting `layerVisibility.grid = false`: grid lines disappear; all other layers remain.
- Setting `layerVisibility.zones = false`: zones are not drawn and cannot be selected via hit test.
- Re-enabling a layer: it immediately reappears on the next frame.

**Edge Cases:**
- All layers set to `false`: canvas shows only the background color (clear canvas).
- Toggling a layer during an active drawing operation on that layer: the drawing preview layer should remain visible if the tool is active regardless of the base layer's visibility.
- Selection highlights for a hidden layer's objects: if a zone is selected and then the zones layer is hidden, the selection highlight should also disappear.

---

## BEAM-CE-018: Viewport state persists in uiStore (not project store)

**Behavior:** The camera position (pan and zoom) is transient UI state. It is not saved with the project data, not included in undo/redo, and not exported with JSON project files.

**Event:** Any viewport change (pan, zoom).

**Action:** Viewport values (`panX`, `panY`, `zoom`) are written to `uiStore`, which has no persistence layer and no undo middleware.

**Model:**
- `uiStore.panX`, `uiStore.panY`, `uiStore.zoom` are updated.
- `projectStore` is never touched by viewport changes.

**Preconditions:** Both stores are initialized.

**Expected Outcome:**
- Panning or zooming does not create an undo history entry.
- Pressing Ctrl+Z after a pan does not undo the pan; it undoes the last project mutation.
- Exporting the project to JSON does not include `panX`, `panY`, or `zoom`.
- Loading a saved project starts with default viewport (pan 0,0 zoom 1), not the viewport from when it was saved.

**Edge Cases:**
- Undo triggered immediately after pan+zoom and a project edit: the project edit is undone, but the viewport remains at its current position.
- Rapidly switching between projects: each project load resets the viewport to defaults.
- `uiStore` state is lost on page refresh (expected behavior for transient state).
