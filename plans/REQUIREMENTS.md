# Garden Yard Planner MVP — Requirements

## Must-Have Requirements

### R1: Type System
- R1.1: Define Point, Polygon, BoundingBox types with world-coordinate (feet) values
- R1.2: Define Zone type with id, name, color, sunExposure, soilType, notes, polygon vertices
- R1.3: Define PropertyBoundary and HouseOutline types as named polygons
- R1.4: Define Project type aggregating all domain objects
- R1.5: Define Tool enum (select, rectangle, polygon_zone, property_boundary, house_outline)
- R1.6: Define SunExposure and SoilType enums

### R2: Project Store (Zustand + zundo)
- R2.1: Store holds Project state (propertyBoundary, houseOutline, zones array)
- R2.2: addZone action creates a new zone with generated id
- R2.3: updateZone action merges partial zone data by id
- R2.4: removeZone action deletes zone by id
- R2.5: setPropertyBoundary action replaces property boundary polygon
- R2.6: setHouseOutline action replaces house outline polygon
- R2.7: clearProject action resets to empty state
- R2.8: zundo middleware enables undo/redo via temporal store

### R3: UI Store (Zustand)
- R3.1: Store holds activeTool, selectedZoneId, panOffset, zoomLevel, layerVisibility
- R3.2: setActiveTool action changes current tool
- R3.3: setSelectedZoneId action changes selection (or null to deselect)
- R3.4: setPan/setZoom actions update viewport transform
- R3.5: toggleLayer action flips layer visibility

### R4: Persistence (Dexie/IndexedDB)
- R4.1: Dexie database with projects table (id, name, data, updatedAt)
- R4.2: saveProject serializes and writes project store to IndexedDB
- R4.3: loadProject reads from IndexedDB and hydrates project store
- R4.4: listProjects returns all saved project summaries
- R4.5: deleteProject removes a project by id

### R5: Canvas Engine
- R5.1: CanvasEngine manages canvas element, render loop (requestAnimationFrame)
- R5.2: World-to-screen coordinate transform using pan offset and zoom level
- R5.3: Screen-to-world inverse transform for pointer events
- R5.4: Render loop calls registered renderers in order each frame
- R5.5: Pan via middle-mouse-drag or two-finger touch
- R5.6: Zoom via scroll wheel, centered on cursor position

### R6: Grid Renderer
- R6.1: Draws grid lines at 1-foot intervals in world space
- R6.2: Grid scales with zoom (shows major/minor lines at different zoom levels)
- R6.3: Grid respects layer visibility toggle

### R7: Shape Renderer
- R7.1: Renders property boundary as a closed polygon with stroke
- R7.2: Renders house outline as a filled polygon
- R7.3: Renders zones as semi-transparent filled polygons with labels
- R7.4: Each zone uses its assigned color

### R8: Selection Renderer
- R8.1: Draws highlight border around selected zone
- R8.2: Draws vertex handles on selected polygon for future editing

### R9: Rectangle Tool
- R9.1: Click-drag creates a rectangle zone (two opposite corners)
- R9.2: Preview rectangle shown while dragging
- R9.3: On mouse-up, zone is added to project store
- R9.4: Tool resets to select after placing

### R10: Polygon Tool
- R10.1: Each click adds a vertex to the in-progress polygon
- R10.2: Double-click or click near first vertex closes the polygon
- R10.3: Preview lines shown while drawing
- R10.4: Used for property boundary, house outline, and polygon zones (mode param)
- R10.5: On close, shape is added to appropriate store field

### R11: Select Tool
- R11.1: Click on a zone selects it (point-in-polygon hit test)
- R11.2: Click on empty space deselects
- R11.3: Drag on selected zone moves it (translates all vertices)
- R11.4: Delete key removes selected zone
- R11.5: Escape key deselects

### R12: React Components
- R12.1: App component renders Toolbar, CanvasView, and ZonePanel in a flex layout
- R12.2: Toolbar has buttons for each tool, highlighting active tool
- R12.3: CanvasView hosts the canvas element and initializes CanvasEngine
- R12.4: ZonePanel shows editable fields for selected zone (name, color, sun, soil, notes)
- R12.5: ZonePanel updates project store on field changes

### R13: Auto-Save & Load
- R13.1: Subscribe to project store changes and auto-save (debounced 1s)
- R13.2: On app startup, load last project from IndexedDB

### R14: Undo/Redo Keyboard Shortcuts
- R14.1: Ctrl+Z triggers undo on project store
- R14.2: Ctrl+Shift+Z triggers redo on project store

## Nice-to-Have (Post-MVP)
- Feature catalog and placement
- Plant database and planting tracker
- Measurement tool
- PNG/PDF export
- PWA service worker
- Responsive mobile layout
