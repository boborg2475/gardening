## Why

Gardeners constantly need to answer spatial questions: "How wide is this bed?", "Is there enough room for a 4-foot path?", "How far is this tree from the fence?" Without measurement, the map is just a picture. The measurement tool transforms the canvas into a planning tool that answers real spatial questions in real-world units.

## What Changes

- Add Measurement data model (start point, end point) stored in projectStore.measurements
- Add measure tool with two-click flow: first click sets start, second click saves measurement
- Add Euclidean distance calculation with imperial (feet/inches) and metric (meters/cm) formatting
- Add measurement renderer with dashed line, crosshair endpoints, and midpoint distance label
- Add live preview during measurement (dashed line from start to cursor with real-time distance)
- Add measurement selection (perpendicular distance hit test) and deletion
- Add Escape to cancel in-progress measurement

## Capabilities

### New Capabilities
- `measurement-tool`: Distance measurement tool with two-click placement, dual-unit formatting, live preview, and persistent rendering

### Modified Capabilities

## Impact

- `src/types/` — Measurement type definition
- `src/store/` — projectStore.measurements array with addMeasurement, removeMeasurement; uiStore.measureStart field
- `src/canvas/` — Measurement renderer, live preview renderer, measurement hit testing
- `src/utils/` — Distance formatting functions (imperial and metric)
