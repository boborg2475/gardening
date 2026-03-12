## Context

The canvas supports drawing polygons and placing features. Users need to measure distances between arbitrary points on the map to make planning decisions. Measurements are two-point line segments stored in world coordinates, rendered as dashed lines with formatted distance labels.

## Goals / Non-Goals

**Goals:**
- Implement a two-click measurement tool that stays active for multiple measurements
- Calculate and display Euclidean distances in the project's unit system
- Render measurements as persistent dashed lines with formatted labels
- Support measurement selection and deletion

**Non-Goals:**
- Area measurement (only point-to-point distance)
- Measurement editing (delete and re-measure to correct)
- Measurement along polygon edges or paths
- Measurement snapping to object vertices

## Decisions

### 1. Measurements are immutable once placed
No update action exists. Users delete and re-measure to correct. This keeps the interaction model simple and the measurement semantically tied to the exact points clicked.

### 2. Distance formatting as pure functions
Imperial and metric formatting are pure functions that take a distance number and return a formatted string. Easy to test, no dependencies.

### 3. Hit testing via perpendicular distance to line segment
Rather than a bounding box, measurement hit testing computes the perpendicular distance from click to the line segment. A 5-pixel threshold (converted to world units at current zoom) determines a hit. This is more precise for thin line elements.

### 4. Live preview shares renderer with saved measurements
The preview uses the same rendering style as saved measurements but at reduced opacity (0.7). This reuses code and gives users an accurate preview of the final result.

## Risks / Trade-offs

- **Distance label overlap** → No collision resolution in v1. Labels may overlap if measurements are close together. Accepted limitation.
- **Perpendicular distance hit testing is slightly more complex than AABB** → But necessary for accurate selection of line elements. The math is well-known (point-to-segment distance formula).
