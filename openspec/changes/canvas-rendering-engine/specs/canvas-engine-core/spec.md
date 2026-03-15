## ADDED Requirements

### Requirement: Canvas initializes with default viewport
The system SHALL create and attach a `<canvas>` element to the provided container with default viewport state (`panX: 0`, `panY: 0`, `zoom: 1.0`) when `mount()` is called.

#### Scenario: Mount attaches canvas to container
- **WHEN** `engine.mount()` is called on a container element
- **THEN** a `<canvas>` child element is present in the container
- **THEN** the canvas occupies the full layout dimensions of the container

#### Scenario: Default viewport state
- **WHEN** `engine.mount()` is called
- **THEN** `engine.getViewport()` returns `{ panX: 0, panY: 0, zoom: 1.0 }`

---

### Requirement: World-to-screen coordinate conversion
The system SHALL convert a world coordinate `(x, y)` to screen pixels using `sx = (x - panX) * zoom`, `sy = (y - panY) * zoom`.

#### Scenario: Origin at default viewport
- **WHEN** viewport is `{ panX: 0, panY: 0, zoom: 1.0 }`
- **THEN** `worldToScreen(5, 10)` returns `{ sx: 5, sy: 10 }`

#### Scenario: Pan offset
- **WHEN** viewport is `{ panX: 10, panY: 5, zoom: 1.0 }`
- **THEN** `worldToScreen(10, 5)` returns `{ sx: 0, sy: 0 }`

#### Scenario: Zoom scaling
- **WHEN** viewport is `{ panX: 0, panY: 0, zoom: 2.0 }`
- **THEN** `worldToScreen(5, 0)` returns `{ sx: 10, sy: 0 }`

---

### Requirement: Screen-to-world coordinate conversion
The system SHALL convert screen pixels `(sx, sy)` back to world coordinates using `x = sx / zoom + panX`, `y = sy / zoom + panY`.

#### Scenario: Round-trip accuracy
- **WHEN** an arbitrary world point is converted to screen and back
- **THEN** the result matches the original world point within floating-point precision

#### Scenario: Inverse of world-to-screen
- **WHEN** viewport is `{ panX: 5, panY: 3, zoom: 2.0 }`
- **THEN** `screenToWorld(worldToScreen(7, 4))` returns `{ x: 7, y: 4 }`

---

### Requirement: Zoom with focal-point anchoring
The system SHALL zoom the viewport such that the world point under the focal screen coordinate remains fixed on screen after the zoom.

#### Scenario: Focal point stays fixed
- **WHEN** user zooms in at screen position `(sx, sy)`
- **THEN** the world point previously at `(sx, sy)` remains at `(sx, sy)` after zoom

#### Scenario: Zoom clamped to minimum
- **WHEN** `setZoom` is called with a value below `0.1`
- **THEN** zoom is set to `0.1` and does not go lower

#### Scenario: Zoom clamped to maximum
- **WHEN** `setZoom` is called with a value above `10.0`
- **THEN** zoom is set to `10.0` and does not go higher

---

### Requirement: Pan by screen delta
The system SHALL shift the viewport when `pan(dxScreen, dyScreen)` is called, converting the screen delta to world units.

#### Scenario: Pan right
- **WHEN** `pan(50, 0)` is called with zoom `2.0`
- **THEN** `panX` decreases by `25` (50 screen px / zoom 2)

#### Scenario: Pan down
- **WHEN** `pan(0, 30)` is called with zoom `1.0`
- **THEN** `panY` decreases by `30`

---

### Requirement: Responsive canvas sizing with HiDPI support
The system SHALL resize the canvas buffer and CSS dimensions to match the container, scaled by the device pixel ratio, whenever the container dimensions change.

#### Scenario: Resize updates canvas dimensions
- **WHEN** the container element is resized
- **THEN** the canvas CSS dimensions match the new container size
- **THEN** the canvas buffer dimensions equal CSS dimensions multiplied by device pixel ratio

#### Scenario: Context transform accounts for device pixel ratio
- **WHEN** device pixel ratio is `2`
- **THEN** `ctx.setTransform(2, 0, 0, 2, 0, 0)` is applied so CSS-pixel drawing coordinates produce sharp output

---

### Requirement: Render loop with dirty-flag efficiency
The system SHALL drive rendering via `requestAnimationFrame`, only issuing a draw call when state has changed (tracked via a `needsRender` flag).

#### Scenario: No redundant draws
- **WHEN** no store state has changed since the last frame
- **THEN** no draw call is made on the next animation frame

#### Scenario: Renders on store change
- **WHEN** `projectStore` or `uiStore` state changes
- **THEN** `needsRender` is set to `true` and a draw occurs on the next frame

---

### Requirement: Mount/unmount lifecycle is idempotent
The system SHALL allow calling `mount()` or `unmount()` multiple times without side effects.

#### Scenario: Double mount is safe
- **WHEN** `mount()` is called twice
- **THEN** only one `<canvas>` element is attached to the container

#### Scenario: Unmount cleans up
- **WHEN** `unmount()` is called
- **THEN** the canvas is removed from the container
- **THEN** store subscriptions and animation frame requests are cancelled

#### Scenario: Double unmount is safe
- **WHEN** `unmount()` is called twice
- **THEN** no error is thrown
