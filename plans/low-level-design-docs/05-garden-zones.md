# 05 — Garden Zones

## Overview

Garden zones are named polygonal areas within the property boundary that represent distinct planting regions (e.g., "Vegetable Bed", "Herb Garden", "Shade Border"). Each zone carries metadata about soil type and sun exposure that informs planting recommendations. Zones can overlap and are rendered in array order. Plantings are associated with zones.

---

## 1. Zone Data Model

```
Zone {
  id:          string                // UUID v4, generated on creation
  name:        string                // User-editable display name
  points:      Point[]               // Polygon vertices in world coords (feet/meters)
  color:       string                // Hex color, e.g. "#10B981"
  soilType:    'clay' | 'sandy' | 'loam' | 'silt' | 'peat' | 'chalk'
  sunExposure: 'full-sun' | 'partial-sun' | 'shade'
  notes:       string                // Free-form user notes
}
```

### Storage

- Zones are stored in `projectStore.zones: Zone[]`.
- Array order determines rendering order (index 0 is the bottom-most zone).
- All mutations go through `projectStore` actions: `addZone`, `updateZone`, `removeZone`, `reorderZones`.
- Each mutation triggers a `zundo` snapshot for undo/redo.

### Derived Data

- **Planting count**: Not stored on the zone. Computed by filtering `projectStore.plantings` where `planting.zoneId === zone.id`.
- **Area**: Computed on demand from `zone.points` using the shoelace formula. Displayed in the zone panel in square feet or square meters depending on the project's unit setting.

---

## 2. Drawing Zones

Zone drawing reuses the same polygon drawing flow described in `04-property-house-drawing.md` with the following differences.

### Activation

- The user clicks **"Add Zone"** in the zone panel or selects the **"draw-zone"** tool from the toolbar.
- Sets `uiStore.activeTool` to `'draw-zone'`.

### Drawing Behavior

- Identical state machine: IDLE -> DRAWING -> COMPLETE.
- Same vertex placement with grid snap.
- Same completion rules (double-click or click near first vertex, minimum 3 vertices).
- Preview lines use a **neutral green** color (`#10B981`) during drawing, since the final color is not yet chosen.

### Post-Completion: Metadata Dialog

On polygon completion, instead of immediately saving:

1. The completed polygon points are held in a temporary buffer (not yet in `projectStore`).
2. A **Zone Metadata Dialog** opens as a modal overlay.
3. The dialog contains the following fields:

| Field | Input Type | Default Value |
|---|---|---|
| Name | Text input | `"Zone N"` where N is `zones.length + 1` |
| Color | Color picker / palette | Next color from the rotation palette |
| Soil Type | Dropdown | `'loam'` |
| Sun Exposure | Radio group | `'full-sun'` |
| Notes | Textarea | `""` (empty) |

4. **Save** — Creates a `Zone` object with a generated UUID, the drawn points, and the dialog values. Calls `projectStore.addZone(zone)`. Closes the dialog. Sets `uiStore.activeTool` to `'select'` and selects the new zone.
5. **Cancel** — Discards the polygon. Closes the dialog. Sets `uiStore.activeTool` to `'select'`. No zone is created.

### Default Color Palette Rotation

The palette cycles through these colors in order, advancing each time a zone is created:

```
#10B981  (emerald)
#F59E0B  (amber)
#8B5CF6  (violet)
#EF4444  (red)
#3B82F6  (blue)
#EC4899  (pink)
#14B8A6  (teal)
#F97316  (orange)
```

The next color is determined by `zones.length % palette.length`.

---

## 3. Zone Renderer

Each zone in `projectStore.zones` is rendered as a filled polygon on the canvas.

### Rendering Details

| Attribute | Value |
|---|---|
| Fill color | `zone.color` at 25% opacity |
| Stroke color | `zone.color` darkened by 20% (mix toward black) |
| Stroke width | 2px (screen) |
| Close path | Yes |

### Zone Name Label

- The zone name is rendered at the polygon's centroid.
- Font: 13px sans-serif, bold.
- Color: `zone.color` darkened by 40% for legibility against the light fill.
- Centered horizontally and vertically.
- For non-convex polygons where the centroid falls outside the shape, use pole-of-inaccessibility to find an interior point.
- If the zone is too small (bounding box width or height < 40px on screen), the label is hidden to avoid clutter.

### Rendering Order

- Zones render in array order: `zones[0]` first (bottom), `zones[zones.length - 1]` last (top).
- All zones render above the property boundary but below the house outline, features, and plantings.

### Selected State

When `uiStore.selectedId` matches a zone's `id` and `uiStore.selectedType === 'zone'`:

- Stroke width increases to 3px.
- A secondary outer stroke at 40% opacity, offset by 2px, serves as a selection highlight.
- Vertex handles appear at each polygon vertex: 7x7 px squares, filled white with a stroke matching the zone color.

---

## 4. Zone Selection & Editing

### Selection via Canvas Click

- In select mode (`uiStore.activeTool === 'select'`), a click on the canvas triggers hit testing.
- Hit testing uses a **point-in-polygon** algorithm (ray casting) that works correctly for both convex and concave polygons.
- Zones are tested in **reverse array order** (topmost first). The first zone whose polygon contains the click point is selected.
- On selection:
  - `uiStore.selectedId` = `zone.id`
  - `uiStore.selectedType` = `'zone'`
  - The detail panel updates to show the zone's metadata.

### Selection via Zone Panel

- Clicking a zone row in the zone panel selects that zone.
- The canvas pans/zooms to center the selected zone in view if it is not currently visible.

### Vertex Dragging (Reshape)

- When a zone is selected, vertex handles are rendered.
- On `mousedown`, hit test vertex handles first (before polygon interior).
- Hit threshold: 8px screen-space distance from vertex center.
- On drag: update the vertex position in `projectStore` (with grid snap if enabled). The polygon re-renders in real time.
- On `mouseup`: finalize. `zundo` captures the snapshot.
- Self-intersection prevention: same constraint as property/house vertex editing.

### Interior Dragging (Move Entire Zone)

- If the `mousedown` hits the zone interior but **not** a vertex handle:
  - Begin a drag-move operation.
  - On `mousemove`: compute the world-space delta from the drag start and translate all vertices by that delta.
  - Update `projectStore` on each move frame for real-time feedback.
  - On `mouseup`: finalize. `zundo` captures the snapshot.
  - Grid snap applies to the delta (snap the total displacement, not individual vertices) to preserve the polygon's shape.

### Metadata Editing

- The detail panel (right sidebar) shows editable fields for the selected zone: name, color, soil type, sun exposure, notes.
- Changes are written to `projectStore.updateZone(id, changes)` on blur or on change (depending on field type).
- Each change triggers a `zundo` snapshot.

---

## 5. Zone Panel

The zone panel is a section in the left sidebar that provides an overview and management interface for all zones.

### Layout

```
+-------------------------------+
|  Zones                  [+ Add Zone]  |
+-------------------------------+
|  [color] Zone 1                      |
|  Loam | Full Sun | 12 plantings      |
+-------------------------------+
|  [color] Zone 2                      |
|  Clay | Partial Sun | 3 plantings    |
+-------------------------------+
|  [color] Zone 3                      |
|  Sandy | Shade | 0 plantings         |
+-------------------------------+
```

### Row Contents

Each zone row displays:

- **Color swatch**: A small square (16x16 px) filled with `zone.color`.
- **Zone name**: The zone's display name, truncated with ellipsis if too long.
- **Metadata summary**: Soil type and sun exposure as labels, planting count.

### Interactions

| Action | Behavior |
|---|---|
| Click row | Selects the zone on canvas and in detail panel. Canvas pans to center the zone if off-screen. |
| Double-click row | Opens the zone metadata dialog for editing. |
| Drag row | Reorders zones (changes rendering order). Updates `projectStore.reorderZones`. |
| "Add Zone" button | Activates `draw-zone` tool. |

### Empty State

When no zones exist, the panel shows a message: "No zones yet. Click 'Add Zone' to define a planting area." with the Add Zone button below.

---

## 6. Zone Deletion

### Trigger

- Press the **Delete** key while a zone is selected.
- Or click the **Delete** button in the zone detail panel.

### With Plantings (Confirmation Required)

If the zone has one or more associated plantings (`plantings.filter(p => p.zoneId === zone.id).length > 0`):

1. A confirmation dialog appears:
   - Title: "Delete Zone"
   - Message: `Delete "${zone.name}" and its N planting(s)?`
   - Buttons: **Cancel** (default focus), **Delete** (destructive style, red).
2. On **Cancel**: dialog closes, no changes.
3. On **Delete**:
   - Remove all plantings with `zoneId === zone.id` from `projectStore`.
   - Remove the zone from `projectStore.zones`.
   - Clear selection (`uiStore.selectedId = null`, `uiStore.selectedType = null`).
   - `zundo` captures a single snapshot encompassing both the planting removals and the zone removal (batched update).

### Without Plantings (No Confirmation)

If the zone has zero associated plantings:

- The zone is removed immediately from `projectStore.zones`.
- Selection is cleared.
- No confirmation dialog.

### Undo

- Since deletion is captured by `zundo`, the user can undo to restore both the zone and its plantings in a single undo step.
