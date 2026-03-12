## Context

JSON export provides lossless data portability. PNG and PDF serve the common need to share visual representations of the plan. Both use the same rendering pipeline — draw to an offscreen canvas, then convert to the target format.

## Goals / Non-Goals

**Goals:**
- Render the map to an offscreen canvas using the same renderers as the live canvas
- Export as PNG with configurable grid, background, and scale options
- Export as PDF with jsPDF including project title, date, and optional zone legend
- Share offscreen rendering logic between PNG and PDF pipelines

**Non-Goals:**
- SVG export
- Multi-page PDF with different views
- Export of individual layers as separate files

## Decisions

### 1. Shared offscreen renderer
Both PNG and PDF need a rendered image of the map. A shared `offscreenRenderer` computes the bounding box, creates an offscreen canvas, and runs all layer renderers. PNG converts to blob; PDF converts to data URL for jsPDF.

### 2. Bounding box with padding
The offscreen canvas is sized to fit all project objects plus 50 world units of padding. If no objects exist, a default 800x600 area is used.

### 3. Export options as modal dialogs
Simple options dialogs appear before export. Settings are not persisted — they reset to defaults each time.

## Risks / Trade-offs

- **Very large canvases may exceed browser limits** → Clamp to browser max canvas size (typically 16384px) and adjust scale down. Show warning if clamped.
- **PDF rendering quality depends on raster image** → The map is rasterized to PNG then embedded in PDF. At 2x scale this produces good print quality.
