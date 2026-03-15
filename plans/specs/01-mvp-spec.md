# Spec 01: Garden Yard Planner MVP

## Overview
Implement the core canvas-based garden planning experience: an interactive map where users can draw property boundaries, house outlines, and garden zones, with persistence and undo/redo.

## Features

### F1: Interactive Canvas with Pan/Zoom
The app renders an HTML Canvas 2D element that fills available space. Users can pan (click-drag with middle mouse or two-finger touch) and zoom (scroll wheel or pinch). A configurable grid renders in world coordinates.

#### Scenarios

**F1-S1: Canvas renders with grid**
- Given: The app loads
- When: The canvas component mounts
- Then: A grid is visible on the canvas at the default zoom level

**F1-S2: Pan the canvas**
- Given: The canvas is rendered
- When: The user drags with middle mouse button (or two-finger touch)
- Then: The viewport pans, and all content shifts accordingly

**F1-S3: Zoom the canvas**
- Given: The canvas is rendered
- When: The user scrolls the mouse wheel
- Then: The viewport zooms in/out centered on the cursor position

### F2: Property Boundary Drawing
Users draw their property boundary as a polygon by clicking to place vertices. The polygon closes when the user clicks near the first vertex.

#### Scenarios

**F2-S1: Draw property boundary polygon**
- Given: The polygon tool is active with layer "property"
- When: The user clicks 4+ points and closes the shape
- Then: A closed polygon is added to the project store as the property boundary

**F2-S2: House outline drawing**
- Given: The polygon tool is active with layer "house"
- When: The user clicks points and closes the shape
- Then: A closed polygon is added to the project store as the house outline

### F3: Garden Zones (Rectangle and Polygon)
Users create garden zones as either rectangles (click-drag) or polygons (click vertices). Zones have metadata: name, color, sun exposure, soil type, notes.

#### Scenarios

**F3-S1: Create rectangular zone**
- Given: The rectangle tool is active
- When: The user clicks and drags on the canvas
- Then: A rectangular zone is created with the drag bounds as dimensions

**F3-S2: Create polygon zone**
- Given: The polygon zone tool is active
- When: The user clicks 3+ vertices and closes the shape
- Then: A polygon zone is created in the project store

**F3-S3: Edit zone metadata**
- Given: A zone is selected
- When: The user edits name, color, sun exposure, or soil type in the side panel
- Then: The zone metadata updates in the store and re-renders on canvas

### F4: Select Tool
Users can click shapes to select them, drag to move them, and press Delete to remove them.

#### Scenarios

**F4-S1: Select a shape by clicking**
- Given: The select tool is active and shapes exist on the canvas
- When: The user clicks on a shape
- Then: The shape is highlighted as selected and its details appear in the side panel

**F4-S2: Move a shape by dragging**
- Given: A shape is selected
- When: The user drags the selected shape
- Then: The shape moves to the new position (all vertices offset)

**F4-S3: Delete a shape**
- Given: A shape is selected
- When: The user presses the Delete key
- Then: The shape is removed from the project store

**F4-S4: Deselect with Escape**
- Given: A shape is selected
- When: The user presses Escape
- Then: Nothing is selected

### F5: Zone Side Panel
A side panel shows details of the selected zone and allows editing metadata.

#### Scenarios

**F5-S1: Panel shows zone details**
- Given: A zone is selected
- When: The side panel renders
- Then: It displays the zone's name, color, sun exposure, soil type, and notes

**F5-S2: Panel edits persist**
- Given: A zone is selected and the panel is visible
- When: The user changes the zone name
- Then: The store updates and the canvas re-renders with the new name

### F6: Persistence (IndexedDB)
Projects auto-save to IndexedDB on store changes (debounced 1s). The last project loads on startup.

#### Scenarios

**F6-S1: Auto-save on change**
- Given: A project is loaded
- When: The user creates a zone
- Then: Within 1 second, the project is saved to IndexedDB

**F6-S2: Load on startup**
- Given: A project was previously saved
- When: The app starts
- Then: The saved project loads automatically

### F7: Undo/Redo
Full undo/redo via Zustand + zundo. Ctrl+Z undoes, Ctrl+Shift+Z redoes.

#### Scenarios

**F7-S1: Undo a zone creation**
- Given: The user just created a zone
- When: The user presses Ctrl+Z
- Then: The zone is removed from the store

**F7-S2: Redo after undo**
- Given: The user just undid a zone creation
- When: The user presses Ctrl+Shift+Z
- Then: The zone reappears in the store

### F8: UI Layout
Toolbar on left/top, canvas center, side panel on right. Toolbar has buttons for each tool.

#### Scenarios

**F8-S1: Tool switching**
- Given: The app is loaded
- When: The user clicks a tool button in the toolbar
- Then: The active tool changes in the UI store

## Checklist
- [ ] Canvas renders and is interactive (pan/zoom)
- [ ] Grid draws in world coordinates
- [ ] Property boundary can be drawn as polygon
- [ ] House outline can be drawn as polygon
- [ ] Rectangular zones can be created via click-drag
- [ ] Polygon zones can be created via click-vertices
- [ ] Zones have editable metadata (name, color, sun, soil, notes)
- [ ] Select tool: click to select, drag to move, Delete to remove
- [ ] Side panel shows and edits selected zone details
- [ ] Auto-save to IndexedDB (debounced)
- [ ] Load last project on startup
- [ ] Undo/redo with keyboard shortcuts
- [ ] Toolbar switches between tools
