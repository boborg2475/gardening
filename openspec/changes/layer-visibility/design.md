## Context

The canvas engine renders layers in a fixed order: grid → property → house → zones → features → measurements. Currently all layers are always rendered. The uiStore already has a `layers` object with boolean flags (added in Phase 1 store setup), but the renderers and hit-test logic don't yet check these flags, and there's no UI to toggle them.

## Goals / Non-Goals

**Goals:**
- Wire layer visibility flags into every renderer's draw path
- Wire layer visibility into hit-test logic to prevent selection of hidden objects
- Provide a layer panel in the sidebar for toggling each layer

**Non-Goals:**
- Per-object visibility (only whole-layer toggles)
- Layer opacity control (binary on/off only)
- Layer locking (prevent editing without hiding)

## Decisions

### 1. Simple boolean flags per layer
Each layer has a single boolean. No complex visibility model. This is sufficient for the app's needs and keeps the implementation trivial.

### 2. Check at renderer entry point
Each renderer function checks `layers[layerName]` at entry and returns immediately if false. No draw calls, no performance cost for hidden layers.

### 3. Hit test filters candidates by visible layers
Before iterating candidates for hit testing, filter out objects whose layer is hidden. This prevents accidental selection of invisible objects.

## Risks / Trade-offs

- **Minimal risk** — This is a straightforward feature with clear boundaries. The main consideration is ensuring all renderers and hit-test paths consistently check the flags.
