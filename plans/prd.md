# Garden Yard Planner — Product Requirements Document (PRD)

**Version:** 1.0 MVP
**Date:** 2026-03-15
**Status:** Approved

## 1. Overview

Garden Yard Planner is a free, offline-first Progressive Web App that enables homeowners and gardeners to visually map their yard, define garden zones, and track metadata about planting areas. The MVP focuses on core canvas interaction, zone management, and persistence.

## 2. Goals

- Provide an intuitive visual canvas for mapping yard layouts
- Support drawing property boundaries, house outlines, and garden zones
- Enable zone metadata editing (name, color, sun exposure, soil type, notes)
- Persist all data locally in IndexedDB with auto-save
- Support undo/redo for all map operations

## 3. Non-Goals (MVP)

- Feature catalog and placement (post-MVP)
- Plant database and planting tracker (post-MVP)
- Measurement tool (post-MVP)
- PNG/PDF export (post-MVP)
- PWA service worker / offline install (post-MVP)
- Multi-project support (post-MVP)

## 4. User Stories

### US-01: Canvas Navigation
As a user, I can pan the canvas by clicking and dragging, and zoom with the mouse wheel, so I can navigate my yard map at any scale.

### US-02: Property Boundary Drawing
As a user, I can draw my property boundary as a polygon by clicking to place vertices and closing the shape, so I can define the outline of my lot.

### US-03: House Outline Drawing
As a user, I can draw my house footprint as a polygon, so I can show where my house sits on the property.

### US-04: Zone Creation (Rectangle)
As a user, I can click and drag to create a rectangular garden zone, so I can quickly define regular garden beds.

### US-05: Zone Creation (Polygon)
As a user, I can click vertices to create irregularly-shaped garden zones, so I can define beds that match my yard's actual layout.

### US-06: Zone Metadata
As a user, I can edit a zone's name, color, sun exposure, soil type, and notes in a side panel, so I can track information about each garden area.

### US-07: Selection and Manipulation
As a user, I can click to select shapes, drag to move them, and press Delete to remove them, so I can refine my yard layout.

### US-08: Undo/Redo
As a user, I can press Ctrl+Z to undo and Ctrl+Shift+Z to redo, so I can experiment freely without fear of losing work.

### US-09: Auto-Save
As a user, my project is automatically saved to IndexedDB so I never lose work, and it reloads when I reopen the app.

### US-10: Tool Switching
As a user, I can switch between tools (Select, Rectangle, Polygon for property/house/zone) via a toolbar, so I can perform different actions on my map.

## 5. Acceptance Criteria

- Canvas renders with a visible grid at default zoom
- Pan/zoom operates smoothly with mouse
- All polygon/rectangle tools create valid shapes stored in project state
- Selected zones display their metadata in a side panel
- Metadata changes reflect immediately on the canvas (color, name)
- Undo/redo works for all shape operations (add, move, delete, edit)
- Data persists across page refreshes
- All tests pass, lint passes, build succeeds
