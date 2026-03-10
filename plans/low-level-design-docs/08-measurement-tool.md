# 08 — Measurement Tool

## 1. Measurement Data Model

```
Measurement {
  id: string              // uuid v4
  startPoint: Point       // { x: number, y: number } in world coordinates (feet or meters)
  endPoint: Point         // { x: number, y: number } in world coordinates (feet or meters)
}
```

`projectStore` gains a new top-level array:

```
measurements: Measurement[]
```

Store actions:

- `addMeasurement(m: Measurement)` — append to array
- `removeMeasurement(id: string)` — filter out by id

No update action. Measurements are immutable once placed; delete and re-measure to correct.

---

## 2. Measurement Flow

1. User activates the "measure" tool (toolbar button or keyboard shortcut).
   `uiStore.setActiveTool('measure')`.
2. Cursor changes to crosshair.
3. User clicks the first point on the canvas. The click position is converted from screen pixels to world coordinates via `CanvasEngine.screenToWorld()`. This point is stored as transient state in `uiStore.measureStart: Point | null`.
4. A dashed line follows the cursor from `measureStart` to the current pointer position. A live distance label updates on every pointer move (see section 7).
5. User clicks the second point. The position is converted to world coordinates. A new `Measurement` is created with a generated uuid, the stored `measureStart`, and the new point as `endPoint`.
6. `projectStore.addMeasurement()` is called. The measurement persists and renders on the canvas.
7. `uiStore.measureStart` is cleared back to `null`. The tool remains active and ready for the next measurement.
8. Pressing Escape at any point during step 4 cancels the in-progress measurement, clearing `measureStart` without saving anything.

---

## 3. Distance Calculation

Euclidean distance between two points in world coordinates:

```
distance = sqrt((endPoint.x - startPoint.x)^2 + (endPoint.y - startPoint.y)^2)
```

The result is a scalar in whatever world unit the project uses (feet for imperial, meters for metric). The project's unit system is read from `projectStore.settings.unitSystem` (`'imperial' | 'metric'`).

---

## 4. Distance Formatting

### Imperial (unit system = feet)

The raw distance is in feet (decimal).

- Extract whole feet: `wholeFeet = Math.floor(distance)`
- Extract inches: `inches = Math.round((distance - wholeFeet) * 12)`
- Handle rounding overflow: if `inches === 12`, increment `wholeFeet` by 1 and set `inches = 0`.
- If `wholeFeet >= 1`: display as `{wholeFeet}' {inches}"` (e.g., `12' 6"`). If `inches === 0`, display as `{wholeFeet}' 0"`.
- If `wholeFeet === 0`: display as `{inches}"` (e.g., `8"`).
- Special case: if distance is 0, display `0"`.

### Metric (unit system = meters)

The raw distance is in meters (decimal).

- If distance >= 1.0: display as `{distance.toFixed(2)}m` (e.g., `3.81m`).
- If distance < 1.0 and distance > 0: convert to centimeters (`distance * 100`), round to nearest integer, display as `{cm}cm` (e.g., `45cm`).
- Special case: if distance is 0, display `0cm`.

---

## 5. Measurement Renderer

The measurement renderer draws each `Measurement` from `projectStore.measurements` every frame. It also draws the live preview when `uiStore.measureStart` is set.

### Persisted measurement rendering

1. **Dashed line**: Draw a dashed line from `startPoint` to `endPoint` (both transformed to screen coordinates via `CanvasEngine.worldToScreen()`). Line style: `strokeStyle = '#E65100'` (deep orange-red), `lineWidth = 2`, `setLineDash([8, 4])`.

2. **Endpoint markers**: At each endpoint, draw a small crosshair — two short perpendicular lines (6px each direction) centered on the point. Same color as the line.

3. **Distance label at midpoint**:
   - Calculate midpoint: `mx = (sx + ex) / 2`, `my = (sy + ey) / 2` (screen coordinates).
   - Measure the formatted distance text width using `ctx.measureText()`.
   - Draw a rounded rectangle background: fill `rgba(33, 33, 33, 0.85)` (dark, semi-transparent), with 4px padding on each side, 3px border radius.
   - Draw the formatted distance string centered in the rectangle: `fillStyle = '#FFFFFF'`, `font = 'bold 13px sans-serif'`, `textAlign = 'center'`, `textBaseline = 'middle'`.

4. **Selection highlight**: If the measurement is currently selected (`uiStore.selectedId === measurement.id`), draw the line with increased `lineWidth = 3` and add a subtle glow effect (`shadowColor = '#FF6D00'`, `shadowBlur = 6`).

### Render order

Measurements render above zones and features but below the UI overlay layer. In the renderer stack: grid -> zones -> features -> plantings -> **measurements** -> selection handles.

---

## 6. Measurement Interaction

### Selection

Measurements are selectable when the active tool is `'select'`.

- On pointer down in select mode, run a hit test against all measurements.
- Hit test: compute the perpendicular distance from the click point (in world coords) to the line segment defined by `startPoint` and `endPoint`. If the distance is within a threshold (5 pixels converted to world units at current zoom), the measurement is a hit candidate.
- If multiple measurements overlap, pick the one whose line midpoint is closest to the click point.
- On hit, set `uiStore.selectedId = measurement.id` and `uiStore.selectedType = 'measurement'`.

### Deletion

- When a measurement is selected and the user presses `Delete` or `Backspace`, call `projectStore.removeMeasurement(selectedId)` and clear the selection.
- This mutation is captured by zundo and is undoable.

### No drag/edit

Measurements cannot be moved or have their endpoints edited. The user must delete and re-measure. This keeps the interaction model simple and the measurement semantically tied to the exact points clicked.

---

## 7. Live Preview

While the measure tool is active and `uiStore.measureStart` is set (first point placed, second not yet):

1. On every `pointermove` event, the current cursor position is converted to world coordinates.
2. If grid snapping is enabled (`uiStore.snapToGrid === true`), the cursor position snaps to the nearest grid intersection before distance calculation.
3. The renderer draws a dashed line from `measureStart` to the current (possibly snapped) cursor position using the same visual style as persisted measurements, but with a slightly lower opacity (`globalAlpha = 0.7`).
4. The distance label updates in real-time at the midpoint of this preview line, using the same formatting rules from section 4.
5. This preview rendering happens in the measurement renderer pass each frame and is entirely transient — no store mutation occurs until the second click.
