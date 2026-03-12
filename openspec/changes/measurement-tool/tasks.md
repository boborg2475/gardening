## 1. Measurement Data & Store

- [ ] 1.1 Define Measurement type with id, startPoint, endPoint
- [ ] 1.2 Add measurements array to projectStore
- [ ] 1.3 Implement addMeasurement and removeMeasurement actions
- [ ] 1.4 Add measureStart field to uiStore
- [ ] 1.5 Write tests for measurement store actions

## 2. Distance Formatting

- [ ] 2.1 Implement imperial distance formatting (feet'inches" with overflow handling)
- [ ] 2.2 Implement metric distance formatting (meters/centimeters with threshold)
- [ ] 2.3 Write tests for both formatting functions with edge cases

## 3. Measure Tool

- [ ] 3.1 Implement measure tool activation (set activeTool, cursor to crosshair)
- [ ] 3.2 Implement first click handler (set measureStart with grid snap)
- [ ] 3.3 Implement second click handler (create Measurement, add to store, clear measureStart)
- [ ] 3.4 Implement Escape to cancel in-progress measurement
- [ ] 3.5 Write tests for measure tool two-click flow

## 4. Measurement Renderer

- [ ] 4.1 Implement dashed line rendering (#E65100, lineWidth 2, dash [8,4])
- [ ] 4.2 Implement crosshair endpoint markers (6px)
- [ ] 4.3 Implement midpoint distance label (dark rounded-rect background, white bold 13px text)
- [ ] 4.4 Implement selected state (lineWidth 3, shadow glow)
- [ ] 4.5 Implement live preview renderer (0.7 opacity from measureStart to cursor)
- [ ] 4.6 Integrate measurement renderer into CanvasEngine render loop
- [ ] 4.7 Write tests for measurement renderer

## 5. Measurement Selection

- [ ] 5.1 Implement perpendicular distance hit testing for line segments
- [ ] 5.2 Implement 5px threshold with zoom-aware conversion to world units
- [ ] 5.3 Implement Delete/Backspace to remove selected measurement
- [ ] 5.4 Write tests for measurement hit testing and deletion
