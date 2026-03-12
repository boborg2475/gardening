## 1. Offscreen Renderer

- [ ] 1.1 Implement bounding box computation across all project objects with 50-unit padding
- [ ] 1.2 Create offscreen canvas with configurable scale/DPI
- [ ] 1.3 Set up coordinate transforms for offscreen rendering
- [ ] 1.4 Render all layers using existing renderer functions
- [ ] 1.5 Write tests for offscreen renderer

## 2. PNG Export

- [ ] 2.1 Create PngOptionsDialog component (grid, background, scale)
- [ ] 2.2 Implement PNG export pipeline (offscreen render → toBlob → download)
- [ ] 2.3 Implement canvas size clamping with warning
- [ ] 2.4 Write tests for PNG export

## 3. PDF Export

- [ ] 3.1 Create PdfOptionsDialog component (page size, orientation, legend, grid)
- [ ] 3.2 Implement PDF export pipeline (offscreen render → dataURL → jsPDF addImage)
- [ ] 3.3 Implement project title and date header
- [ ] 3.4 Implement zone legend rendering (colored squares, two columns if >6)
- [ ] 3.5 Implement auto-orientation based on map aspect ratio
- [ ] 3.6 Write tests for PDF export

## 4. Export Menu Integration

- [ ] 4.1 Add Export PNG and Export PDF options to export menu
- [ ] 4.2 Add loading spinner during export processing
- [ ] 4.3 Add success/error toast notifications
- [ ] 4.4 Write tests for export menu integration
