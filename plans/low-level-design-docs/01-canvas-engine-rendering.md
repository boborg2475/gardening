# Low-Level Design: Canvas Engine and Rendering

## 1. CanvasEngine Class

The `CanvasEngine` is the central orchestrator for all canvas rendering. It owns the `<canvas>` DOM element, drives the render loop, manages the camera/viewport transform, and delegates drawing to an ordered set of renderer functions.

### Class Outline

```ts
class CanvasEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationFrameId: number | null;
  private projectStore: ProjectStore;
  private uiStore: UIStore;

  // Lifecycle
  constructor(container: HTMLElement, projectStore: ProjectStore, uiStore: UIStore);
  mount(): void;          // Attach canvas to container, subscribe to stores, start loop
  unmount(): void;        // Stop loop, remove listeners, detach canvas

  // Coordinate transforms
  worldToScreen(x: number, y: number): { sx: number; sy: number };
  screenToWorld(sx: number, sy: number): { x: number; y: number };

  // Camera control
  setZoom(level: number, focalPoint: { sx: number; sy: number }): void;
  pan(dx: number, dy: number): void;

  // Rendering
  render(): void;         // Single frame draw — called by the loop and on-demand

  // Hit testing
  hitTest(sx: number, sy: number): HitResult | null;

  // Canvas sizing
  private resizeCanvas(): void;
  private getDevicePixelRatio(): number;
}
```

### Lifecycle

1. **`constructor`** -- Receives the parent `HTMLElement` container plus references to both Zustand stores. Creates the `<canvas>` element and obtains a `2d` context. Does not yet attach to the DOM or start rendering.

2. **`mount()`** -- Appends the canvas to the container. Calls `resizeCanvas()`. Subscribes to both stores via `store.subscribe()` so that any state change schedules a re-render. Adds event listeners for `resize` and `ResizeObserver` on the container. Starts the render loop.

3. **`unmount()`** -- Cancels the animation frame. Removes all event listeners and store subscriptions. Removes the canvas from the DOM.

### Store References

The engine holds read-only references to both stores. It never mutates store state directly; that is the responsibility of interaction tools. On each frame it reads:

- From `uiStore`: `panX`, `panY`, `zoom`, `activeTool`, `selectedIds`, `layerVisibility`, `drawingPreview`.
- From `projectStore`: `propertyBoundary`, `house`, `zones`, `features`, `measurements`.

---

## 2. Coordinate System

### World Coordinates

- Unit: feet (default) or meters, selectable per project via `projectStore.units`.
- Origin: `(0, 0)` at the logical top-left of the world plane.
- Axes: X increases to the right, Y increases downward.
- All domain objects (zone vertices, feature positions, property boundary points) are stored in world coordinates.

### Screen Transform

The camera is defined by three values stored in `uiStore`:

| Field  | Type   | Description                              |
|--------|--------|------------------------------------------|
| panX   | number | World X coordinate at the left edge of the viewport |
| panY   | number | World Y coordinate at the top edge of the viewport  |
| zoom   | number | Scale factor (screen pixels per world unit)          |

**World to Screen:**

```
screenX = (worldX - panX) * zoom
screenY = (worldY - panY) * zoom
```

**Screen to World:**

```
worldX = screenX / zoom + panX
worldY = screenY / zoom + panY
```

### Method Signatures

```ts
worldToScreen(x: number, y: number): { sx: number; sy: number } {
  const { panX, panY, zoom } = this.uiStore.getState();
  return {
    sx: (x - panX) * zoom,
    sy: (y - panY) * zoom,
  };
}

screenToWorld(sx: number, sy: number): { x: number; y: number } {
  const { panX, panY, zoom } = this.uiStore.getState();
  return {
    x: sx / zoom + panX,
    y: sy / zoom + panY,
  };
}
```

---

## 3. Renderer Pipeline

Each frame, the engine clears the canvas and calls renderer functions in a fixed order. Each renderer is a **pure function** that receives the 2D context, the current viewport, and the slice of state it needs. Renderers never read from stores directly.

### Layer Order (back to front)

| Order | Layer              | Renderer Function                                                      | State Dependency               |
|-------|--------------------|------------------------------------------------------------------------|--------------------------------|
| 1     | Grid               | `renderGrid(ctx, viewport, gridConfig)`                                | uiStore (zoom), projectStore (units) |
| 2     | Property boundary   | `renderPropertyBoundary(ctx, viewport, boundary)`                      | projectStore.propertyBoundary  |
| 3     | House outline       | `renderHouse(ctx, viewport, house)`                                    | projectStore.house             |
| 4     | Zones              | `renderZones(ctx, viewport, zones)`                                    | projectStore.zones             |
| 5     | Features           | `renderFeatures(ctx, viewport, features)`                              | projectStore.features          |
| 6     | Measurements       | `renderMeasurements(ctx, viewport, measurements)`                      | projectStore.measurements      |
| 7     | Drawing preview    | `renderDrawingPreview(ctx, viewport, preview)`                         | uiStore.drawingPreview         |
| 8     | Selection highlights | `renderSelectionHighlights(ctx, viewport, selectedIds, allObjects)`   | uiStore.selectedIds            |

### Renderer Function Signature

All renderers share a common pattern:

```ts
type Viewport = {
  panX: number;
  panY: number;
  zoom: number;
  canvasWidth: number;   // logical CSS pixels
  canvasHeight: number;
};

type RenderFn<S> = (
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  state: S,
) => void;
```

### Layer Visibility

Each layer has a boolean toggle in `uiStore.layerVisibility`:

```ts
type LayerVisibility = {
  grid: boolean;
  propertyBoundary: boolean;
  house: boolean;
  zones: boolean;
  features: boolean;
  measurements: boolean;
  drawingPreview: boolean;  // always true when a tool is active
  selectionHighlights: boolean;  // always true
};
```

In the render loop, a layer is only drawn when its visibility flag is `true`. Selection highlights and drawing preview are always rendered when relevant (they are controlled by tool state rather than user-toggled visibility).

---

## 4. Grid Renderer

### Configuration

```ts
type GridConfig = {
  minorSpacing: number;   // world units between minor lines (default: 1)
  majorEvery: number;     // major line every N minor lines (default: 5)
  units: 'ft' | 'm';
};
```

### Rendering Logic

1. **Determine visible world bounds** from the viewport:
   ```
   worldLeft   = panX
   worldTop    = panY
   worldRight  = panX + canvasWidth / zoom
   worldBottom = panY + canvasHeight / zoom
   ```

2. **Adaptive spacing based on zoom level.** When zoomed out far enough that minor grid lines would be fewer than 10 pixels apart on screen, double the effective minor spacing. Repeat until minor lines are at least 10 screen pixels apart. This prevents the grid from becoming a solid blur at low zoom.

   ```
   effectiveSpacing = minorSpacing
   while (effectiveSpacing * zoom < 10) {
     effectiveSpacing *= 2
   }
   ```

3. **Draw minor lines.** Iterate from the first grid line at or before `worldLeft` to the last at or after `worldRight` (and similarly vertically). Style: `strokeStyle = 'rgba(200, 200, 200, 0.4)'`, `lineWidth = 1 / zoom` (so it stays 1 device pixel regardless of zoom).

4. **Draw major lines.** Every `majorEvery * effectiveSpacing` world units. Style: `strokeStyle = 'rgba(160, 160, 160, 0.6)'`, `lineWidth = 1.5 / zoom`.

5. **Status bar** (rendered by the React UI, not the canvas) reads `effectiveSpacing` and `units` to display the current grid resolution, e.g., "Grid: 1 ft" or "Grid: 2 m".

---

## 5. Viewport / Camera

### State Shape

```ts
// Stored in uiStore
type CameraState = {
  panX: number;   // default: 0
  panY: number;   // default: 0
  zoom: number;   // default: 1.0 (1 screen pixel = 1 world unit at base DPR)
};
```

### Zoom

- **Range:** 0.1 (very zoomed out) to 10.0 (very zoomed in).
- **Clamping:** `setZoom` clamps the requested level to `[0.1, 10]`.

**Zoom centered on cursor.** When the user scrolls the mouse wheel, the zoom should adjust such that the world point under the cursor stays fixed on screen.

```ts
setZoom(newZoom: number, focalPoint: { sx: number; sy: number }): void {
  const clamped = Math.min(10, Math.max(0.1, newZoom));
  const { panX, panY, zoom: oldZoom } = this.uiStore.getState();

  // World point under the cursor before zoom
  const wx = focalPoint.sx / oldZoom + panX;
  const wy = focalPoint.sy / oldZoom + panY;

  // Adjust pan so that (wx, wy) stays at the same screen position
  const newPanX = wx - focalPoint.sx / clamped;
  const newPanY = wy - focalPoint.sy / clamped;

  this.uiStore.setState({ panX: newPanX, panY: newPanY, zoom: clamped });
}
```

### Pan

- **Mouse:** Middle-mouse-button drag. On `pointerdown` (button 1), record the starting screen position. On `pointermove`, compute the delta in screen pixels and convert to world delta: `dx = deltaScreenX / zoom`, `dy = deltaScreenY / zoom`. Update `panX -= dx`, `panY -= dy` (subtracting so that dragging right moves the viewport right, i.e., the world moves left relative to the screen).

- **Touch:** Two-finger drag. Track the midpoint of two touches. Delta of midpoint drives panning. Simultaneously, the distance between the two touches drives pinch-to-zoom (see below).

```ts
pan(dxScreen: number, dyScreen: number): void {
  const { panX, panY, zoom } = this.uiStore.getState();
  this.uiStore.setState({
    panX: panX - dxScreen / zoom,
    panY: panY - dyScreen / zoom,
  });
}
```

### Pinch-to-Zoom (Touch)

On each touch move event with two active touches:

1. Compute the new distance between the two touch points.
2. Compute the ratio `newDist / prevDist`.
3. Compute the midpoint in screen coordinates.
4. Call `setZoom(currentZoom * ratio, midpoint)`.
5. Additionally pan by the midpoint delta (so pan and zoom happen together).

---

## 6. Canvas Sizing

### Responsive Resize

The canvas must always fill its parent container. On mount and on every resize event:

```ts
private resizeCanvas(): void {
  const container = this.canvas.parentElement!;
  const rect = container.getBoundingClientRect();
  const dpr = this.getDevicePixelRatio();

  // Set the drawing buffer to match device pixels
  this.canvas.width = rect.width * dpr;
  this.canvas.height = rect.height * dpr;

  // Set CSS size to match layout pixels
  this.canvas.style.width = `${rect.width}px`;
  this.canvas.style.height = `${rect.height}px`;

  // Scale the context so drawing commands use CSS-pixel coordinates
  this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Trigger re-render
  this.render();
}
```

### HiDPI Handling

`getDevicePixelRatio()` returns `window.devicePixelRatio` (typically 1 on standard displays, 2 on Retina/HiDPI). The canvas buffer is sized at `cssWidth * dpr` by `cssHeight * dpr`, then the context transform is set to scale by `dpr`. All subsequent drawing uses CSS-pixel values; the browser composites the larger buffer, producing crisp lines and text on high-density screens.

### Listeners

- A `ResizeObserver` on the container detects layout changes (panel open/close, window resize).
- On callback, debounce by one animation frame to avoid redundant resizes, then call `resizeCanvas()`.

---

## 7. Hit Testing

Hit testing converts a screen click into the identification of the topmost interactive object at that location. It is used by the Select tool, context menus, and hover tooltips.

### Data Structures

```ts
type HitResult = {
  type: 'zone' | 'feature' | 'propertyVertex' | 'house';
  id: string;            // unique ID of the hit object
  worldPoint: { x: number; y: number };  // click location in world coords
};
```

### Algorithm

Given a screen point `(sx, sy)`:

1. Convert to world coordinates: `(wx, wy) = screenToWorld(sx, sy)`.
2. Test layers in **reverse rendering order** (top to bottom) so the visually topmost object wins.
3. Return the first match, or `null` if nothing is hit.

#### Per-layer hit test methods

**Features (bounding circle/rect):**

```ts
function hitTestFeature(
  wx: number, wy: number, feature: Feature
): boolean;
```

- For circular features (trees, shrubs): test if `distance((wx, wy), feature.position) <= feature.radius`.
- For rectangular features (beds, structures): test if `(wx, wy)` is inside the axis-aligned bounding rect (accounting for rotation if applicable).
- A small hit tolerance (e.g., 4 world units / zoom) is added so small features are easier to click.

**Zones (point-in-polygon):**

```ts
function hitTestZone(
  wx: number, wy: number, zone: Zone
): boolean;
```

- Uses the ray-casting algorithm: cast a horizontal ray from `(wx, wy)` to the right and count edge crossings of the zone's polygon vertices. An odd count means the point is inside.
- Also test proximity to zone edges (within a tolerance) so users can select a zone by clicking near its border.

**Property boundary vertices:**

```ts
function hitTestPropertyVertex(
  wx: number, wy: number, vertices: Point[], tolerance: number
): number | null;  // returns vertex index or null
```

- Check distance to each vertex. Tolerance is `6 / zoom` pixels in world units (constant screen size regardless of zoom).

**House outline:**

- Same approach as zones: point-in-polygon on the house polygon.

### Hit Test Order (topmost first)

1. Selection handles (if any object is selected and has visible resize/move handles)
2. Drawing preview anchors
3. Features (iterated in reverse z-order)
4. Property boundary vertices
5. House outline
6. Zones (iterated in reverse z-order)

The first match is returned. If no object is hit, the result is `null`.

---

## 8. Render Loop

### Pseudocode

```
mount():
  subscribeToStores()
  startLoop()

startLoop():
  needsRender = true

  onStoreChange:
    needsRender = true

  loop():
    animationFrameId = requestAnimationFrame(loop)
    if not needsRender:
      return
    needsRender = false
    render()

render():
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)
  viewport = buildViewport()

  projectState = projectStore.getState()
  uiState = uiStore.getState()
  visibility = uiState.layerVisibility

  if visibility.grid:
    renderGrid(ctx, viewport, { minorSpacing: 1, majorEvery: 5, units: projectState.units })

  if visibility.propertyBoundary:
    renderPropertyBoundary(ctx, viewport, projectState.propertyBoundary)

  if visibility.house:
    renderHouse(ctx, viewport, projectState.house)

  if visibility.zones:
    renderZones(ctx, viewport, projectState.zones)

  if visibility.features:
    renderFeatures(ctx, viewport, projectState.features)

  if visibility.measurements:
    renderMeasurements(ctx, viewport, projectState.measurements)

  if uiState.drawingPreview:
    renderDrawingPreview(ctx, viewport, uiState.drawingPreview)

  if uiState.selectedIds.length > 0:
    renderSelectionHighlights(ctx, viewport, uiState.selectedIds, projectState)
```

### Performance Notes

- The `needsRender` flag avoids redundant draws when the stores have not changed between frames.
- Store subscriptions use Zustand's `subscribe` with a shallow equality selector so that unrelated state changes (e.g., a panel toggle that does not affect rendering) do not trigger redraws.
- For very large numbers of features or zones, the visible-bounds check in each renderer culls off-screen objects early to avoid unnecessary draw calls.
- Canvas state (`save`/`restore`) is used within each renderer to isolate style changes and clip regions.
