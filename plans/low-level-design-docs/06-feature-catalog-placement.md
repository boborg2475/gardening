# 06 - Feature Catalog & Placement

## 1. Feature Template Model

Every landscape feature available for placement is defined by a `FeatureTemplate`. Templates are static definitions that live in `src/data/featureCatalog.ts` and are never mutated at runtime.

```
FeatureTemplate {
  id: string                              // stable slug, e.g. "deciduous-tree"
  name: string                            // display name, e.g. "Deciduous Tree"
  category: 'trees' | 'shrubs' | 'structures' | 'hardscape' | 'water' | 'misc'
  defaultWidth: number                    // world units (feet or meters)
  defaultHeight: number                   // world units
  drawIcon: (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => void
  description: string                     // short tooltip/help text
}
```

### Field notes

- `id` is a human-readable slug used as a stable key. It never changes once shipped.
- `defaultWidth` / `defaultHeight` are the dimensions applied when a feature is first placed. The user may resize afterward.
- `drawIcon` receives the Canvas 2D context and a bounding rectangle in world coordinates. It must draw the entire icon within that rectangle. The engine handles coordinate transforms before calling this function, so the draw function works purely in world space.
- Templates carry no mutable state. All instance-level data lives in `PlacedFeature`.

---

## 2. Placed Feature Model

When a user places a feature on the map, a `PlacedFeature` record is created and stored in `projectStore.features`.

```
PlacedFeature {
  id: string            // uuid v4
  templateId: string    // references FeatureTemplate.id
  x: number             // center X, world coordinates
  y: number             // center Y, world coordinates
  width: number         // current width (initially from template default)
  height: number        // current height (initially from template default)
  rotation: number      // degrees clockwise, default 0 (reserved for future use)
  notes: string         // user-entered notes, default ""
}
```

### Field notes

- Position (`x`, `y`) represents the center of the feature's bounding rectangle. This simplifies rotation math and hit testing.
- `width` and `height` start as copies of `defaultWidth`/`defaultHeight` from the template but can be changed independently per instance.
- `rotation` is stored but not applied in the initial implementation. The field exists to avoid a schema migration later. Draw functions and hit tests should be written to accept rotation but may treat it as 0 for now.
- `notes` is free-form text the user can attach via the feature detail panel.

---

## 3. Feature Catalog

The catalog contains approximately 30 templates organized into six categories. All templates are defined in `src/data/featureCatalog.ts` as a flat exported array. Helper selectors group them by category at read time.

### Trees (5)

| id | name | Default size (w x h) | Icon description |
|----|------|----------------------|------------------|
| `deciduous-tree` | Deciduous Tree | 8 x 8 | Green filled circle (canopy) on a short brown rectangle (trunk) |
| `evergreen-tree` | Evergreen Tree | 6 x 10 | Dark green filled triangle on brown rectangle |
| `fruit-tree` | Fruit Tree | 7 x 7 | Green circle with small red dots (fruit) on brown trunk |
| `palm-tree` | Palm Tree | 5 x 12 | Curved brown trunk with radiating green arcs at top |
| `small-ornamental` | Small Ornamental Tree | 4 x 5 | Smaller green circle with a thin trunk |

### Shrubs (5)

| id | name | Default size (w x h) | Icon description |
|----|------|----------------------|------------------|
| `bush-shrub` | Bush / Shrub | 4 x 3 | Green filled ellipse |
| `hedge-row` | Hedge Row | 8 x 2 | Green filled rounded rectangle, elongated horizontally |
| `berry-bush` | Berry Bush | 4 x 3 | Green ellipse with small purple dots |
| `rose-bush` | Rose Bush | 3 x 3 | Green ellipse with small pink circles on top |
| `ornamental-grass` | Ornamental Grass | 3 x 4 | Cluster of thin green arcs radiating from a base point |

### Structures (6)

| id | name | Default size (w x h) | Icon description |
|----|------|----------------------|------------------|
| `shed` | Shed | 10 x 8 | Gray filled rectangle with a darker triangular roof |
| `greenhouse` | Greenhouse | 10 x 12 | Light-green translucent rectangle with internal grid lines |
| `pergola` | Pergola | 10 x 10 | Open rectangle with parallel dashed lines across the top |
| `trellis` | Trellis | 1 x 6 | Vertical rectangle with cross-hatch pattern |
| `raised-bed` | Raised Bed | 4 x 8 | Brown outlined rectangle with brown fill interior |
| `cold-frame` | Cold Frame | 3 x 6 | Low rectangle with angled transparent top |

### Hardscape (7)

| id | name | Default size (w x h) | Icon description |
|----|------|----------------------|------------------|
| `fence-section` | Fence Section | 8 x 0.5 | Series of evenly spaced vertical lines connected by two horizontal rails |
| `gate` | Gate | 4 x 0.5 | Fence-style lines with a gap and small arc indicating swing |
| `path-walkway` | Path / Walkway | 3 x 10 | Tan/beige filled rounded rectangle with subtle dashed center line |
| `patio-area` | Patio Area | 12 x 10 | Gray rectangle with a subtle grid pattern (pavers) |
| `retaining-wall` | Retaining Wall | 10 x 1 | Dark gray thick line with hatch marks on one side |
| `stepping-stones` | Stepping Stones | 2 x 8 | Series of small gray circles in a line |
| `deck` | Deck | 12 x 10 | Tan rectangle with parallel horizontal lines (planks) |

### Water (5)

| id | name | Default size (w x h) | Icon description |
|----|------|----------------------|------------------|
| `water-spigot` | Water Spigot | 1 x 1 | Blue filled circle with a small perpendicular handle line |
| `rain-barrel` | Rain Barrel | 2 x 3 | Blue-gray filled rounded rectangle (barrel shape) |
| `pond` | Pond | 8 x 6 | Blue filled ellipse with wavy internal line |
| `irrigation-line` | Irrigation Line | 1 x 10 | Dashed blue line |
| `sprinkler-head` | Sprinkler Head | 1 x 1 | Small blue circle with radiating dashed arcs (spray pattern) |

### Misc (6)

| id | name | Default size (w x h) | Icon description |
|----|------|----------------------|------------------|
| `compost-bin` | Compost Bin | 3 x 3 | Brown filled trapezoid (wider at top) |
| `fire-pit` | Fire Pit | 4 x 4 | Gray circle outline with orange/red flame shapes inside |
| `bench` | Bench | 4 x 1.5 | Brown rectangle with short legs and a back rest line |
| `bird-bath` | Bird Bath | 2 x 2 | Gray pedestal with blue-filled bowl on top |
| `garden-statue` | Garden Statue | 2 x 3 | Gray silhouette shape on a small pedestal rectangle |
| `planter-pot` | Planter Pot | 2 x 2 | Brown/terracotta trapezoid (wider at top) with green arc (plant) |

---

## 4. Canvas Icon Draw Functions

Each template's `drawIcon` function renders a simple, recognizable icon using only Canvas 2D primitives: `arc`, `lineTo`, `moveTo`, `fillRect`, `strokeRect`, `fill`, `stroke`, `beginPath`, `closePath`. No image assets are loaded.

### Design constraints

- **No external assets.** Icons are pure canvas draw calls so they render crisply at any zoom level and require no network requests.
- **Consistent palette.** A shared color constants object (`FEATURE_COLORS`) defines the palette: trunk brown, canopy green, water blue, stone gray, etc. Templates reference these constants, not hard-coded hex values.
- **Bounding rectangle contract.** Every draw function receives `(ctx, x, y, w, h)` where `(x, y)` is the top-left corner and `(w, h)` is the bounding size in world units. The function must confine all drawing within this rectangle.
- **No ctx state leakage.** Each draw function calls `ctx.save()` at entry and `ctx.restore()` at exit. It may freely change fill style, stroke style, line width, and transforms within that scope.
- **Legibility at small sizes.** Icons are designed to remain recognizable when the bounding rect is as small as 20x20 screen pixels. Fine detail is avoided; bold shapes and high-contrast fills are preferred.

### Example: Deciduous Tree

```
drawIcon(ctx, x, y, w, h):
  ctx.save()
  trunkW = w * 0.15
  trunkH = h * 0.35
  trunkX = x + (w - trunkW) / 2
  trunkY = y + h - trunkH
  ctx.fillStyle = FEATURE_COLORS.trunk       // brown
  ctx.fillRect(trunkX, trunkY, trunkW, trunkH)

  canopyRadius = Math.min(w, h * 0.65) / 2
  canopyCX = x + w / 2
  canopyCY = y + canopyRadius
  ctx.fillStyle = FEATURE_COLORS.canopy      // green
  ctx.beginPath()
  ctx.arc(canopyCX, canopyCY, canopyRadius, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
```

### Example: Fence Section

```
drawIcon(ctx, x, y, w, h):
  ctx.save()
  postCount = 5
  spacing = w / (postCount - 1)
  ctx.strokeStyle = FEATURE_COLORS.wood
  ctx.lineWidth = worldToLineWidth(0.05)

  // Horizontal rails
  for railY of [y + h * 0.25, y + h * 0.75]:
    ctx.beginPath()
    ctx.moveTo(x, railY)
    ctx.lineTo(x + w, railY)
    ctx.stroke()

  // Vertical posts
  for i in 0..postCount-1:
    postX = x + i * spacing
    ctx.beginPath()
    ctx.moveTo(postX, y)
    ctx.lineTo(postX, y + h)
    ctx.stroke()

  ctx.restore()
```

---

## 5. Placement Flow

### State involved

- `uiStore.activeTool` set to `'place-feature'`
- `uiStore.placingTemplateId` set to the selected template's `id`
- `projectStore.features` array receives new `PlacedFeature` on placement

### Step-by-step

1. **User opens the feature panel** (sidebar) and browses or searches the catalog.
2. **User clicks a template** in the catalog list.
   - `uiStore.activeTool` is set to `'place-feature'`.
   - `uiStore.placingTemplateId` is set to the clicked template's `id`.
3. **Cursor enters the canvas.**
   - The render loop detects `activeTool === 'place-feature'` and draws a semi-transparent ghost preview of the feature icon at the current cursor world position every frame.
   - The ghost is drawn at the template's `defaultWidth` and `defaultHeight`, centered on the cursor.
4. **User clicks on the canvas.**
   - The pointer handler reads the click position, converts screen coords to world coords via `CanvasEngine.screenToWorld()`.
   - A new `PlacedFeature` is created:
     - `id`: new uuid
     - `templateId`: from `uiStore.placingTemplateId`
     - `x`, `y`: click world position (center)
     - `width`, `height`: copied from template defaults
     - `rotation`: 0
     - `notes`: ""
   - The new feature is appended to `projectStore.features`.
   - The tool remains in `'place-feature'` mode with the same template, allowing the user to place multiple instances without reselecting.
5. **User presses Escape or selects a different tool.**
   - `uiStore.activeTool` resets to `'select'`.
   - `uiStore.placingTemplateId` is cleared to `null`.
   - Ghost preview stops rendering.

### Undo behavior

Each placement is a discrete mutation to `projectStore`. The `zundo` middleware captures a snapshot after each placement. Ctrl+Z undoes the last placement by restoring the previous snapshot (which has one fewer feature in the array).

---

## 6. Feature Selection & Movement

All interaction below occurs when `uiStore.activeTool === 'select'`.

### Selecting a feature

1. User clicks on the canvas.
2. The select tool performs a hit test against all placed features (see section below).
3. If a feature is hit, `uiStore.selectedFeatureId` is set to that feature's `id`.
4. The renderer draws a bounding rectangle around the selected feature with small square handles at corners and edge midpoints.
5. If no feature is hit (and no zone/other object is hit), `selectedFeatureId` is cleared.

### Hit testing

Hit test uses the axis-aligned bounding rectangle of each feature. Given a click point `(px, py)` in world coords and a feature with center `(fx, fy)` and size `(fw, fh)`:

```
hit = |px - fx| <= fw/2  AND  |py - fy| <= fh/2
```

Features are tested in reverse z-order (last placed = on top = tested first) so the topmost feature is selected when overlapping.

### Moving a feature

1. User presses down on an already-selected feature.
2. The select tool enters drag mode, recording the offset between the cursor and the feature center.
3. On each pointer-move event, the feature's `(x, y)` is updated to `cursorWorld - offset`.
4. On pointer-up, the drag ends and the new position is committed to `projectStore`. This creates an undo snapshot.

### Deleting a feature

1. User selects a feature.
2. User presses Delete or Backspace.
3. The feature is removed from `projectStore.features` by `id`.
4. `uiStore.selectedFeatureId` is cleared.
5. An undo snapshot is captured.

---

## 7. Feature Panel (Sidebar)

The feature panel occupies a section of the right sidebar and has two sub-sections: the catalog browser and the selected feature detail.

### Catalog browser

- **Search bar** at the top. Filters templates whose `name` includes the search string (case-insensitive).
- **Category filter** — row of pill-shaped toggle buttons, one per category. Multiple categories can be active. When none are active, all categories are shown.
- **Template list** — displays matching templates grouped by category. Each entry shows:
  - A small square canvas preview of the icon (rendered via `drawIcon` into an offscreen canvas, cached as an `ImageBitmap`).
  - The template name.
  - Clicking the entry activates the place-feature tool with that template.
- Empty state: if search + filters yield no results, show "No matching features" message.

### Selected feature detail

Shown when `uiStore.selectedFeatureId` is non-null. Displays:

- Template icon (larger preview) and template name.
- Position: read-only display of `(x, y)` in world units.
- Size: editable `width` and `height` fields (number inputs). Changes update `projectStore` and trigger re-render.
- Notes: multiline text input bound to `PlacedFeature.notes`.
- **Delete** button that removes the feature (same as pressing Delete key).

When no feature is selected, this section collapses or shows a contextual hint ("Select a feature on the map to see details").

### Placed features list

Below the catalog, an expandable section titled "Placed Features" lists every `PlacedFeature` in the project. Each row shows the template name and a truncated coordinate. Clicking a row selects and pans-to that feature on the canvas.
