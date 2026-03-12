## Context

Phase 1 delivered the canvas engine, stores, and persistence. The core-drawing-tools change provides the polygon draw tool state machine, property/house renderers, and geometry utilities (point-in-polygon, centroid, grid snap). Garden zones reuse the polygon draw tool but add a metadata dialog on completion, a dedicated renderer, and a sidebar panel for zone management.

## Goals / Non-Goals

**Goals:**
- Reuse the polygon draw tool for zone polygon creation (same state machine, same vertex placement/snap/completion logic)
- Add post-completion metadata dialog for configuring zone properties before saving
- Render zones with configurable colors, semi-transparent fills, and name labels
- Support zone selection, vertex editing, and whole-zone dragging
- Provide a zone panel in the sidebar for browsing, selecting, and reordering zones
- Handle zone deletion with cascade to associated plantings

**Non-Goals:**
- Sub-zones and zone navigation hierarchy (handled in zone-navigation change)
- Planting management within zones (handled in plant-database change)
- Zone area calculation display (future enhancement)

## Decisions

### 1. Zone drawing reuses polygon draw tool with post-completion hook

Rather than duplicating the draw tool logic, the existing DrawTool dispatches to different handlers based on activeTool. For `draw-zone`, instead of immediately saving to projectStore, it holds the completed points in a temporary buffer and opens the metadata dialog.

**Why:** DRY principle. The polygon state machine, vertex placement, grid snap, preview rendering, and completion logic are identical. Only the post-completion behavior differs.

### 2. Metadata dialog as a modal overlay

The zone metadata dialog is a React modal that overlays the canvas. The canvas remains visible behind it (showing the drawn polygon in preview style) but does not accept further interaction while the dialog is open.

**Alternative considered:** Inline form in the sidebar. Rejected because the sidebar may not be visible on mobile, and the modal ensures the user configures the zone before any further interaction.

### 3. Color palette rotation for defaults

Each new zone gets the next color from an 8-color palette, cycling based on `zones.length % 8`. This gives visual variety without requiring the user to choose a color every time.

### 4. Zone deletion cascade as a single batched store action

Deleting a zone with plantings removes both the zone and its plantings in a single projectStore action, ensuring zundo captures both as one snapshot. This makes undo restore everything atomically.

## Risks / Trade-offs

- **Metadata dialog interrupts drawing flow** → Mitigated by pre-populating sensible defaults (auto-name, auto-color, loam, full-sun). Users can click Save immediately without changing anything.
- **Zone reordering complexity** → Keep it simple with drag-to-reorder in the zone panel. Array index determines render order.
