# 12 - Responsive Layout, Layer Visibility, and Keyboard Shortcuts

## Overview

This document covers three interrelated UI concerns: the responsive layout system (desktop sidebar vs. mobile bottom sheets), the layer visibility model, and keyboard shortcuts for power users. These features are tied together by the `uiStore` and share interaction patterns with the canvas.

---

## Part A: Responsive Layout

### A1. Breakpoint Detection

A single breakpoint at **768px** divides desktop and mobile layouts.

- In the `App` component, on mount, create a `MediaQueryList` via `window.matchMedia('(max-width: 767px)')`.
- Set `uiStore.isMobile` based on the initial match.
- Attach a `change` listener to update `uiStore.isMobile` when the viewport crosses the threshold.
- Clean up the listener on unmount.

`uiStore` additions:

| Field | Type | Default |
|---|---|---|
| `isMobile` | `boolean` | `false` (set on mount) |
| `sidebarOpen` | `boolean` | `true` |
| `activePanel` | `string \| null` | `'project'` |
| `bottomSheetOpen` | `boolean` | `false` |
| `bottomSheetPanel` | `string \| null` | `null` |

### A2. Desktop Layout (>=768px)

```
+---------------------------+---------------------------------------------+
|        Sidebar            |              Canvas Area                    |
|        (280px)            |                                             |
|                           |  +---------------------------------------+  |
|  [Tab: Project ]          |  | Toolbar: [Select][Prop][House][Zone]  |  |
|  [Tab: Zones   ]          |  | [Feature][Measure] | [Undo][Redo]     |  |
|  [Tab: Features]          |  +---------------------------------------+  |
|  [Tab: Plantings]         |  |                                       |  |
|  [Tab: Layers  ]          |  |            <Canvas>                   |  |
|                           |  |                                       |  |
|  Panel content for        |  |                                       |  |
|  active tab               |  |                                       |  |
|                           |  |                                       |  |
+---------------------------+---------------------------------------------+
```

- **Sidebar**: fixed-width 280px on the left. Collapsible via a toggle button (chevron icon) at the top-right corner of the sidebar. When collapsed, sidebar shrinks to 0px and canvas expands to fill.
- **Sidebar tabs**: vertical tab bar or accordion-style headers. Clicking a tab sets `uiStore.activePanel`. Panel content renders below/beside the tab.
- **Toolbar**: horizontal strip at the top of the canvas area. Contains tool buttons (Select, Draw Property, Draw House, Draw Zone, Place Feature, Measure) and undo/redo buttons on the right side. Each button shows an icon and tooltip on hover.
- **Canvas**: fills remaining space. Resizes when sidebar collapses/expands (canvas engine listens for container resize via `ResizeObserver`).

### A3. Mobile Layout (<768px)

```
+---------------------------------------------+
|                                             |
|                                             |
|                <Canvas>                     |
|             (full screen)                   |
|                                             |
|                                             |
+---------------------------------------------+
|  Bottom Sheet (slides up, 60% height)       |
|  [Header with title + close button]         |
|  [Panel content, scrollable]                |
+---------------------------------------------+
|  Compact Toolbar                            |
|  [Select][Zone][Feature][More...][Panels]   |
+---------------------------------------------+
```

- **Canvas**: full viewport width and height, minus the compact toolbar at the bottom.
- **Compact toolbar**: fixed at the bottom, ~56px tall. Shows the most-used tool buttons. A "More" button opens an overflow menu for less-used tools. A "Panels" button (hamburger or list icon) opens the bottom sheet with panel selection.
- **Bottom sheet**: slides up from the bottom, covering approximately 60% of screen height.
  - **Backdrop**: semi-transparent overlay behind the sheet. Tapping it dismisses the sheet.
  - **Drag handle**: a small bar at the top of the sheet for swipe-down-to-dismiss gesture.
  - **Header**: panel title on the left, close (X) button on the right.
  - **Content**: scrollable panel content (same components as desktop sidebar panels).
  - **Dismiss**: swipe down gesture (track pointer/touch Y delta; if moved >100px down, dismiss) or tap backdrop.
  - State: `uiStore.bottomSheetOpen` and `uiStore.bottomSheetPanel`.

### A4. Touch Handling

All pointer events are unified through the `PointerEvent` API, which normalizes mouse, touch, and pen input.

| Gesture | Behavior |
|---|---|
| Single tap | Select object under pointer / place object if placement tool active |
| Single finger drag (select tool, no object hit) | Pan the canvas |
| Single finger drag (on selected object) | Move the object |
| Single finger drag (draw tool active) | Draw shape points |
| Two-finger drag | Always pan the canvas (regardless of active tool) |
| Pinch (two fingers, spread/contract) | Zoom in/out, centered on midpoint of the two touches |

Implementation notes:
- Track active pointers in a `Map<pointerId, {x, y}>`.
- On `pointermove`, if two pointers are active, compute distance delta (pinch) and midpoint delta (pan).
- Pinch zoom: calculate scale factor from distance change, apply to `uiStore.zoom` centered on the midpoint.
- All interactive elements (buttons, toggles, list items) must have a minimum touch target of **44x44 CSS pixels**, per WCAG 2.5.8 / Apple HIG guidelines.

### A5. Component Structure

| Component | Responsibility |
|---|---|
| `AppLayout.tsx` | Reads `uiStore.isMobile`, renders `DesktopLayout` or `MobileLayout` |
| `DesktopLayout.tsx` | Sidebar + canvas area + toolbar |
| `MobileLayout.tsx` | Full-screen canvas + compact toolbar + bottom sheet |
| `Sidebar.tsx` | Tab bar + active panel content, collapse toggle |
| `BottomSheet.tsx` | Slide-up sheet with backdrop, drag handle, dismiss logic |
| `Toolbar.tsx` | Tool buttons, adapts icon set based on `isMobile` |
| `CompactToolbar.tsx` | Mobile-specific bottom toolbar with overflow menu |

### A6. CSS Modules

- Each layout component has a co-located `.module.css` file.
- Breakpoint-specific styles use `@media (max-width: 767px)` and `@media (min-width: 768px)` within the module where component-level media queries are needed.
- Shared variables (colors, spacing, z-index layers) defined in `src/styles/variables.css` and imported via `@import`.
- Bottom sheet uses CSS `transform: translateY()` for slide animation, with `transition: transform 0.3s ease`.

---

## Part B: Layer Visibility

### B1. Layer Model

`uiStore.layers` holds the visibility state for each renderable layer:

| Key | Type | Default | Controls |
|---|---|---|---|
| `grid` | `boolean` | `true` | Grid lines and origin marker |
| `property` | `boolean` | `true` | Property boundary polygon |
| `house` | `boolean` | `true` | House footprint polygon |
| `zones` | `boolean` | `true` | All zone polygons and labels |
| `features` | `boolean` | `true` | All placed feature icons and labels |
| `measurements` | `boolean` | `true` | Measurement lines and dimension text |

Actions on `uiStore`:

- `toggleLayer(layerName: string)`: flips the boolean for the given layer key.
- `setLayerVisibility(layerName: string, visible: boolean)`: sets a specific value.

### B2. Layer Panel

Displayed in the Layers tab (desktop sidebar) or Layers panel (mobile bottom sheet):

- A list of rows, one per layer.
- Each row contains:
  - An eye icon (open eye = visible, closed eye = hidden).
  - Layer name text.
  - A toggle switch aligned to the right.
- Clicking the row or the toggle calls `uiStore.toggleLayer(layerName)`.
- Layers are listed in render order (bottom to top): Grid, Property, House, Zones, Features, Measurements.

### B3. Render Integration

Each renderer function receives the full render context including a reference to `uiStore.layers`. Before drawing, it checks its corresponding flag:

```
// In the render loop:
if (layers.grid)         gridRenderer.draw(ctx, state, viewport);
if (layers.property)     propertyRenderer.draw(ctx, state, viewport);
if (layers.house)        houseRenderer.draw(ctx, state, viewport);
if (layers.zones)        zoneRenderer.draw(ctx, state, viewport);
if (layers.features)     featureRenderer.draw(ctx, state, viewport);
if (layers.measurements) measurementRenderer.draw(ctx, state, viewport);
```

If a layer is hidden, its renderer is skipped entirely -- no draw calls, no performance cost.

### B4. Hit Testing

Hidden layers are excluded from hit testing. When the select tool processes a click:

1. Build the list of candidate objects from visible layers only.
2. Iterate candidates in reverse render order (top-most first).
3. Return the first object whose bounds contain the click point.

This ensures users cannot accidentally select or interact with objects on hidden layers.

---

## Part C: Keyboard Shortcuts

### C1. Shortcut Map

| Shortcut | Action | Category |
|---|---|---|
| `Ctrl+Z` / `Cmd+Z` | Undo | Edit |
| `Ctrl+Shift+Z` / `Cmd+Shift+Z` | Redo | Edit |
| `Ctrl+Y` / `Cmd+Y` | Redo (alternate) | Edit |
| `Delete` | Delete selected object | Edit |
| `Backspace` | Delete selected object | Edit |
| `Escape` | Deselect current selection; if no selection, revert to Select tool; if in drawing mode, cancel current shape | Navigation |
| `V` or `1` | Select tool | Tool |
| `P` | Draw Property tool | Tool |
| `H` | Draw House tool | Tool |
| `Z` | Draw Zone tool | Tool |
| `F` | Place Feature tool | Tool |
| `M` | Measure tool | Tool |
| `G` | Toggle grid visibility | View |
| `Ctrl+S` / `Cmd+S` | Manually save (prevent default browser save dialog) | File |
| `Ctrl+E` / `Cmd+E` | Open export menu | File |

### C2. Shortcut Handler

A global `keydown` event listener attached to `window` in the `App` component (or a `useKeyboardShortcuts` hook):

1. **Input guard**: if `document.activeElement` is an `<input>`, `<textarea>`, or element with `contentEditable`, return early without handling. This prevents shortcuts from interfering with text entry.

2. **Modifier detection**: read `event.ctrlKey`, `event.metaKey` (for macOS Cmd), `event.shiftKey`.

3. **Key matching**: normalize `event.key` to lowercase for letter keys. Match against the shortcut map.

4. **Action dispatch**: call the appropriate `uiStore` or `projectStore` action.

5. **Prevent default**: call `event.preventDefault()` for all handled shortcuts to suppress browser defaults (e.g., `Ctrl+Z` browser undo, `Ctrl+S` save dialog, `Backspace` browser navigation).

### C3. Shortcut Hints

- Desktop toolbar buttons show the keyboard shortcut in their tooltip (e.g., "Select Tool (V)").
- The shortcut text is part of the tooltip, not a separate UI element.
- A "Keyboard Shortcuts" help dialog (accessible from a `?` button or Help menu) lists all shortcuts in a formatted table, grouped by category.

### C4. Implementation Notes

- The shortcut handler is a single listener, not one per shortcut. This keeps event registration minimal.
- Tool shortcuts (single letter keys) only fire when no modifier keys are pressed, to avoid conflicts with browser shortcuts.
- `Ctrl+Z` / `Cmd+Z` calls `projectStore.temporal.undo()` (zundo API).
- `Ctrl+Shift+Z` / `Cmd+Shift+Z` calls `projectStore.temporal.redo()`.
- `Delete` / `Backspace` checks `uiStore.selectedObjectId`, calls the appropriate delete action on `projectStore`, then clears the selection.
- `Escape` behavior is cascading: first deselects, then on second press reverts tool to Select.

---

## Module Structure

| Module | Responsibility |
|---|---|
| `src/components/layout/AppLayout.tsx` | Breakpoint detection, layout switching |
| `src/components/layout/DesktopLayout.tsx` | Sidebar + canvas + toolbar composition |
| `src/components/layout/MobileLayout.tsx` | Full-screen canvas + compact toolbar + bottom sheet |
| `src/components/layout/Sidebar.tsx` | Collapsible sidebar with tabbed panels |
| `src/components/layout/BottomSheet.tsx` | Slide-up sheet with gestures |
| `src/components/layout/Toolbar.tsx` | Desktop toolbar |
| `src/components/layout/CompactToolbar.tsx` | Mobile compact toolbar |
| `src/components/panels/LayerPanel.tsx` | Layer visibility toggles |
| `src/hooks/useKeyboardShortcuts.ts` | Global keydown handler with shortcut map |
| `src/hooks/useInstallPrompt.ts` | PWA install prompt logic |
| `src/canvas/hitTest.ts` | Layer-aware hit testing |
