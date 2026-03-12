## Why

Users need to share their yard plans with people who won't use the app — landscapers, neighbors, garden forums. PNG provides a shareable image and PDF provides a printable document. Both are generated entirely client-side.

## What Changes

- Add PNG export with offscreen canvas rendering, configurable options (grid, background, scale), and download
- Add PDF export via jsPDF with map image, project header, optional legend, and configurable page size/orientation
- Add shared offscreen renderer for both PNG and PDF pipelines
- Add options dialogs for PNG and PDF export configuration
- Integrate into the export menu alongside JSON export/import

## Capabilities

### New Capabilities
- `png-export`: PNG image export with offscreen canvas rendering and configurable options
- `pdf-export`: PDF document export with jsPDF, map image, header, and optional legend

### Modified Capabilities

## Impact

- `src/export/` — exportPng.ts, exportPdf.ts, offscreenRenderer.ts
- `src/components/` — PngOptionsDialog, PdfOptionsDialog
- jsPDF dependency (already in project)
