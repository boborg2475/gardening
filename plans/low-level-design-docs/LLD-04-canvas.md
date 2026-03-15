# LLD-04: Canvas Engine & Renderers

## CanvasEngine
- Manages canvas element reference, size, render loop
- World-to-screen transform: `screenX = (worldX + panOffset.x) * zoom`, same for Y
- Screen-to-world inverse transform for pointer events
- `requestAnimationFrame` render loop calling renderers in order
- Methods: `worldToScreen(p: Point)`, `screenToWorld(p: Point)`, `render(state)`

## Renderers (pure functions)
1. `gridRenderer(ctx, engine)` — draws dot grid at 1-foot intervals
2. `shapeRenderer(ctx, engine, shapes)` — fills/strokes polygons per shape type/color
3. `selectionRenderer(ctx, engine, shape)` — draws highlight + vertex handles on selected shape

## Tools (event handler objects)
- Each tool: `onPointerDown`, `onPointerMove`, `onPointerUp`, `onKeyDown`
- `PolygonTool` — accumulates vertices on click, closes on double-click or click near first point
- `RectangleTool` — records start point on mousedown, creates rect on mouseup
- `SelectTool` — hit-tests shapes on click, drags on move, deletes on Delete key
