# Garden Yard Planner — High-Level Design

## Problem Statement

Home gardeners lack a simple, visual tool to plan their outdoor space. Existing options are either expensive landscape architecture software (SketchUp, SmartDraw), oversimplified drag-and-drop toys, or pen-and-paper sketches that can't be edited. Gardeners need something in between: a free, visual map of their yard where they can define garden beds, place features like trees and fences, track what's planted where, and measure distances — all without creating an account or paying for software.

## Product Vision

A **free, offline-first Progressive Web App** (React 18 + TypeScript + Vite) that lets homeowners visually map their yard, plan garden zones, place landscape features, and track plantings — all from a phone or desktop browser with zero setup.

## Target Users

- Home gardeners planning seasonal plantings
- Homeowners mapping their property for landscaping projects
- Community garden coordinators organizing plot layouts
- Hobbyist gardeners tracking what's planted where and when

---

## Features

### 1. Interactive Canvas Map

**What it does:** Provides an infinite, pannable, zoomable 2D canvas where users draw and arrange everything. A configurable grid overlays the canvas for spatial reference. All content is rendered in real-world units (feet or meters).

**Why it's here:** The core of the app. A spatial map is the most natural way to plan a physical outdoor space. Users think in terms of "where things go," not lists or forms. The canvas gives them a direct-manipulation surface that mirrors their actual yard.

**Why Canvas 2D (not SVG, not a library like Konva):** The map is a single unified scene with layered rendering (grid → property → zones → features → measurements → selection highlights). Raw Canvas gives full control over the render pipeline, compositing order, and coordinate transforms. The shape set is simple (polygons, circles, lines, text) so a canvas abstraction library adds bundle size (~40KB for Konva) without meaningful productivity gains.

### 2. Property & House Outline

**What it does:** Users draw their property boundary and house footprint as polygons by clicking to place vertices. These outlines define the spatial frame of reference for everything else. Vertices snap to the grid and can be moved after placement.

**Why it's here:** Every yard plan starts with "here's my lot, here's my house." Without property boundaries, zones and features float in abstract space. The property outline anchors the plan to reality and helps users reason about available space, setbacks, and proportions.

### 3. Garden Zones

**What it does:** Users create named zones (garden beds, lawn areas, patios, etc.) as colored, semi-transparent polygons or rectangles. Each zone carries metadata: name, soil type, sun exposure (full sun / partial / shade), color, and notes. Zones are the organizational containers for plantings.

**Why it's here:** Gardeners think in terms of beds and areas, not individual plants scattered across a map. Zones let users define "the raised bed by the fence" or "the shady corner" as first-class objects, then fill them with plantings. Soil type and sun exposure metadata directly inform what can be planted where — this is how gardeners actually make decisions.

### 4. Feature Catalog & Placement

**What it does:** A searchable catalog of ~30 landscape feature templates (trees, shrubs, fences, paths, sheds, water spigots, compost bins, raised beds, etc.), grouped by category. Users select a feature from the catalog and click the map to place it. Placed features can be moved and deleted. Features are rendered as vector icons drawn directly on the canvas (no image files).

**Why it's here:** A yard plan isn't just zones — it includes permanent and semi-permanent structures that constrain where gardens can go. A tree casts shade that affects planting choices. A fence defines a microclimate. A water source determines irrigation reach. The catalog gives users a quick way to populate their map with real-world objects without having to draw everything freehand.

**Why vector canvas icons (not PNGs/SVGs):** Icons drawn as canvas paths are resolution-independent (crisp at any zoom level), require no asset loading, and keep the bundle small.

### 5. Plant Database & Planting Tracker

**What it does:** A database of ~150 common garden plants with metadata: hardiness zones, sun requirements, water needs, spacing, and mature size. Users add plantings to zones — selecting a plant from the database, setting a planting date, status (planned / planted / harvested / removed), and notes. Each zone displays its planting list with plant details.

**Why it's here:** The whole point of mapping zones is to plan what grows in them. The plant database provides the reference information gardeners need to make good planting decisions (Will this tomato variety survive my zone? Does it need full sun? How far apart should I space them?). The planting tracker turns a static map into a living record of what's in the ground, when it went in, and how it's doing.

### 6. Measurement Tool

**What it does:** Click two points on the map to see the real-world distance between them, displayed in the user's chosen unit system (feet with inches like `12' 6"`, or meters). A dashed line with a distance label is drawn between the points.

**Why it's here:** Gardeners constantly need to answer spatial questions: "How wide is this bed?", "Is there enough room for a 4-foot path?", "How far is this tree from the fence?" Without measurement, the map is just a picture. With it, the map becomes a planning tool that answers real questions.

### 7. Undo/Redo

**What it does:** Full undo/redo history for all map modifications. Ctrl+Z to undo, Ctrl+Shift+Z to redo. Drag operations are batched so moving a feature is a single undo step, not dozens of intermediate positions.

**Why it's here:** Direct-manipulation interfaces require forgiveness. Users experiment — draw a zone, decide it's too big, reshape it, move it. Without undo, every action is high-stakes and the tool becomes stressful rather than playful. Drag batching is critical because undoing a drag should jump back to where the object started, not step through every pixel of movement.

### 8. Project Persistence & Multiple Projects

**What it does:** Projects auto-save to the browser's IndexedDB every second (debounced). Users can create multiple projects, switch between them, and delete old ones. The app reloads the last-used project on startup.

**Why it's here:** Losing work is unacceptable. Auto-save means users never have to remember to save. Multiple projects support users with front yard / back yard plans, seasonal variations, or different properties. IndexedDB (via Dexie) provides structured storage with schema versioning — important as the data model evolves across app updates.

### 9. Import/Export (JSON, PNG, PDF)

**What it does:**
- **JSON export/import:** Download the full project as a JSON file; upload it later or on another device. This is the sharing and backup mechanism.
- **PNG export:** Render the current map view to an image file for sharing, printing, or embedding in documents.
- **PDF export:** Generate a printable PDF of the map via jsPDF. Useful for taking a printed plan to the garden center or sharing with a landscaper.

**Why it's here:** A client-side-only app has no cloud sync, so JSON export/import is how users back up data and move it between devices. PNG and PDF serve the common need to share plans with people who won't install the app — a landscaper, a neighbor, or a garden forum.

### 10. Offline-First PWA

**What it does:** The app installs as a Progressive Web App with a service worker that caches all assets. Once loaded, it works fully offline — no network connection needed for any feature. An install prompt encourages adding it to the home screen, and an update toast notifies when a new version is available.

**Why it's here:** Gardeners use this tool in the yard, where connectivity is unreliable. An offline-first architecture means the app is always available. PWA installation makes it feel native on phones and tablets without app store distribution. Zero backend means zero hosting cost and zero accounts to manage.

### 11. Responsive Layout

**What it does:** On desktop, the UI uses a sidebar layout with panels alongside the canvas. On mobile, panels appear as bottom sheets that slide up over the canvas. Touch gestures (pinch-to-zoom, two-finger pan) work natively on the canvas.

**Why it's here:** Many users will plan on their phone while standing in their yard. The app must be fully functional at any screen size. Bottom sheets are the standard mobile pattern for secondary content that doesn't permanently obscure the main view (the map).

### 12. Layer Visibility

**What it does:** Users can toggle visibility of different map layers (grid, property, zones, features, measurements) to reduce visual clutter when focusing on specific aspects of their plan.

**Why it's here:** A fully populated yard map can become visually dense. Layer toggling lets users focus — hide the grid when placing features, hide features when editing zone boundaries, show only measurements when checking dimensions.

### 13. Keyboard Shortcuts

**What it does:** Standard shortcuts for common actions: Ctrl+Z/Ctrl+Shift+Z (undo/redo), Delete (remove selected), Escape (deselect/cancel current tool).

**Why it's here:** Power users expect keyboard shortcuts in any editor-like tool. These specific shortcuts follow universal conventions — no learning curve.

---

## Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| **Client-side only (no backend)** | Zero hosting cost, zero accounts, works offline, no privacy concerns with garden data. JSON export handles sharing/backup. |
| **Two separate state stores** | Project data (zones, features, plantings) needs undo/redo and persistence. UI state (tool selection, pan/zoom, panel open/closed) does not. Separating them keeps undo history clean and avoids persisting transient state. |
| **Real-world coordinate system** | Storing positions in feet/meters (not pixels) means the map is zoom-independent and measurements are meaningful. Screen rendering applies a transform at draw time. |
| **Auto-save with debounce** | Eliminates "forgot to save" data loss. 1-second debounce prevents excessive writes during rapid editing (e.g., dragging). |
| **Canvas draw functions for icons** | No image loading, no asset pipeline, resolution-independent rendering, smaller bundle. |
| **CSS Modules over styled-components** | No JavaScript runtime cost for styling, scoped class names prevent conflicts, built into Vite with zero config. |

---

## Tech Stack

- **Framework:** React 18 + TypeScript
- **Build:** Vite
- **State:** Zustand + zundo (undo middleware)
- **Persistence:** Dexie (IndexedDB wrapper)
- **Rendering:** Raw HTML Canvas 2D API
- **PDF Export:** jsPDF
- **Styling:** CSS Modules
- **Testing:** Vitest
- **PWA:** vite-plugin-pwa (Workbox)

---

## Verification

1. **Dev server:** `npm run dev` — canvas renders, pan/zoom works
2. **Drawing:** Draw property boundary, house, zones — shapes persist in state
3. **Features:** Place features from catalog, move/resize them
4. **Plantings:** Add plantings to zones, view plant details
5. **Undo/Redo:** Ctrl+Z undoes last action, Ctrl+Shift+Z redoes
6. **Persistence:** Refresh page — project reloads from IndexedDB
7. **Export:** Export as PNG and PDF — files download correctly
8. **Mobile:** Open on phone — touch pan/zoom, responsive panels work
9. **Offline:** Disconnect network, app still fully functional
10. **Tests:** `npm run test` — all pass
