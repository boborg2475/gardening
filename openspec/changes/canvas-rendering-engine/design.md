## Context

The Garden Yard Planner renders all map content via a custom `CanvasEngine` built on HTML Canvas 2D. Domain objects (property boundary, house, zones, placed features, measurements) are stored in world units (feet or meters) in `projectStore`. The engine transforms those world coordinates to screen pixels on every frame using the current viewport (pan + zoom). All transient UI state — active tool, selection, drawing preview, layer visibility — lives in `uiStore` and is never persisted.

Phase 1 delivered: `CanvasEngine` lifecycle, render loop, coordinate transforms, pan/zoom, grid renderer, and responsive/HiDPI sizing. Phase 2+ adds domain renderers, interaction tools, and hit testing.

## Goals / Non-Goals

**Goals:**
- A canvas engine that renders all project geometry at any zoom and pan without visual artifacts
- A tool system where each tool (select, draw, place, measure) is fully isolated from the engine core
- Hit testing that correctly resolves a screen point to the topmost interactive domain object
- Crisp rendering at any device pixel ratio via HiDPI scaling

**Non-Goals:**
- WebGL or GPU-accelerated rendering — Canvas 2D is sufficient for the shape complexity involved
- Server-side rendering — the canvas is client-only
- Animated transitions between states

## Decisions

### D1: Raw Canvas 2D over a retained-mode library (Konva, Fabric)
**Decision**: Use HTML Canvas 2D directly with a custom engine.
**Rationale**: The shape set (polygons, circles, rectangles, lines, text) is simple. A retained-mode library adds bundle weight and an object graph that would have to be kept in sync with the Zustand stores. Drawing functions for feature icons produce crisp vector output at any zoom without image assets. Full control over the render pipeline makes culling, ordering, and HiDPI handling straightforward.
**Alternatives considered**: Konva — rejected for bundle size and sync complexity; SVG — rejected because hit testing and zoom performance degrade at high object counts.

### D2: Coordinate system — world units stored, screen pixels computed
**Decision**: All domain geometry is stored in world units (feet/meters). Screen pixels are computed at draw time using `sx = (x - panX) * zoom`.
**Rationale**: Storing world units means the project data is display-agnostic. Any viewport change (pan, zoom, resize) is handled purely in the render pass — no stored coordinates need updating.

The viewport is defined by three values in `uiStore`:
- `panX`, `panY` — world coordinate at the top-left of the canvas (in world units)
- `zoom` — screen pixels per world unit, clamped to `[0.1, 10.0]`

Transform formulas:
```
world → screen:   sx = (x - panX) * zoom
                  sy = (y - panY) * zoom

screen → world:   x = sx / zoom + panX
                  y = sy / zoom + panY
```

Zoom anchors to the focal point (world point under the cursor stays fixed) by adjusting `panX`/`panY` at the same time as zoom changes.

### D3: Render loop with dirty-flag — store subscriptions trigger redraws
**Decision**: `CanvasEngine` runs a `requestAnimationFrame` loop. A `needsRender` boolean flag gates actual draw calls. Both `projectStore` and `uiStore` subscriptions set `needsRender = true` on any state change.
**Rationale**: Decouples React's render cycle from the canvas render cycle entirely. The canvas redraws when data changes, not when React decides to re-render. The dirty flag prevents wasted draw calls on frames where nothing changed.

### D4: Renderers are pure functions — `(ctx, viewport, data) → void`
**Decision**: Each renderer (grid, zones, features, etc.) is a standalone function that takes the canvas context, viewport, and relevant data slice, and draws. No renderer holds state.
**Rationale**: Pure functions are trivially testable and composable. The engine calls them in back-to-front order: grid → property boundary → house → zones → features → measurements → drawing preview → selection highlights. Each renderer uses `ctx.save()`/`ctx.restore()` to isolate style changes.

### D5: Tools are classes implementing a `Tool` interface, dispatched by `CanvasEngine`
**Decision**: Each tool (select, draw, place, measure) is a class implementing a shared `Tool` interface with `onPointerDown`, `onPointerMove`, `onPointerUp` methods. `CanvasEngine` reads `uiStore.activeTool` and routes pointer events to the active tool instance.
**Rationale**: Isolates tool logic completely from the engine. The engine knows nothing about what "drawing a zone" means — it just forwards events. Tools read from stores and write mutations back; store changes trigger the next render automatically. Middle-mouse pan and scroll/pinch zoom are handled by the engine directly, before tool dispatch, since they're always active regardless of tool.
**Alternatives considered**: Inline switch statement in `CanvasEngine` — rejected because it grows without bound as tools are added.

### D6: `hitTest` lives on `CanvasEngine`, not on a renderer
**Decision**: `hitTest(sx, sy): HitResult | null` is a method on `CanvasEngine`.
**Rationale**: Hit testing needs `screenToWorld` (owned by the engine) and access to `projectStore` geometry (also held by the engine). Placing it on a renderer would invert the dependency. The method tests objects in precedence order — features first (smallest targets), then zones, then property boundary vertices (within an 8px tolerance radius), then house — and returns the first match.

### D7: HiDPI handled via buffer scaling + context transform
**Decision**: On resize, the canvas buffer is set to `cssWidth * dpr` × `cssHeight * dpr`. A `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)` is applied so all drawing code uses CSS pixel coordinates naturally.
**Rationale**: Drawing code never needs to know the device pixel ratio. The transform handles it transparently. A `ResizeObserver` on the container triggers `resizeCanvas()` automatically.

## Risks / Trade-offs

- **[Risk] Tool pointer event handling diverges across mouse and touch** → Mitigation: middle-mouse pan and pinch-to-zoom are handled at the engine level before tool dispatch; tools only receive normalized pointer events.
- **[Risk] Hit test performance degrades with many objects** → Mitigation: objects are culled to the visible viewport before testing; precedence order means features exit early without testing all zones.
- **[Risk] Grid line count explodes at low zoom** → Mitigation: adaptive spacing doubles the interval until lines are ≥ 10px apart on screen, keeping line count bounded.
- **[Risk] Renderer pixel-level appearance drifts from design intent** → Mitigation: visual style (colors, line widths, opacity) is an implementation detail left to each renderer; specs only assert behavioral outcomes (visible/not visible, relative ordering).
