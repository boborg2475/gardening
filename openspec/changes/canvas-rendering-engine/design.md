## Context

The Garden Yard Planner uses a custom HTML Canvas 2D rendering engine (`CanvasEngine`) instead of a library like Konva or Fabric. Phase 1 delivered the engine core: lifecycle, render loop, coordinate transforms, pan/zoom, grid renderer, and responsive/HiDPI sizing. Detailed LLD and BEAM behavioral specs already exist in `plans/`. Phase 2+ requires domain renderers (zones, features, property boundary, house, measurements) and interaction tools (select, draw, place, measure), but no OpenSpec capability specs exist to formally drive TDD implementation.

## Goals / Non-Goals

**Goals:**
- Define formal OpenSpec specs for all four canvas subsystems: engine core, renderers, interaction tools, and hit testing
- Align specs with existing BEAM docs (`plans/specs/BEAM-canvas-engine.md`) and LLD (`plans/low-level-design-docs/01-canvas-engine-rendering.md`)
- Each spec produces testable scenarios that guide red/green TDD cycles

**Non-Goals:**
- Rewriting or replacing the existing plans documentation
- Changing any runtime code as part of this change
- Covering non-canvas subsystems (state management, persistence, UI panels)

## Decisions

### D1: One spec per major subsystem (not per renderer or per tool)
**Decision**: Four capability specs rather than one per renderer or one per tool.
**Rationale**: Each subsystem has a coherent set of concerns and a natural test boundary. Splitting further (e.g., one spec per renderer) creates too many tiny specs with high cross-reference noise. Merging all into one is too coarse for independent implementation.
**Alternatives considered**: Single monolithic spec — rejected because it conflates testability of unrelated behaviors; per-renderer specs — rejected because renderers share viewport/layerVisibility contracts.

### D2: Specs align with existing BEAM scenarios
**Decision**: Spec scenarios are derived from the BEAM behavioral specs and numbered accordingly (e.g., BEAM-CE-001).
**Rationale**: The BEAM docs represent already-agreed behavioral contracts. Deriving specs from them avoids re-litigating design decisions and ensures test tagging remains consistent with the existing `describe('... [BEAM-CE-001]', ...)` convention.
**Alternatives considered**: Write specs independently of BEAM — rejected because it risks divergence.

### D3: Interaction tools live in `src/canvas/tools/`
**Decision**: Each tool (select, draw, place, measure) is a class implementing a `Tool` interface; the active tool is held in `uiStore.activeTool`.
**Rationale**: Isolates tool logic from the engine core. CanvasEngine dispatches pointer events to `activeTool` without knowing tool internals. Matches existing architectural documentation.
**Alternatives considered**: Inline tool logic in CanvasEngine — rejected because it creates a monolithic class.

### D4: Hit testing is a CanvasEngine method, not a renderer concern
**Decision**: `hitTest(sx, sy): HitResult | null` lives on `CanvasEngine`.
**Rationale**: The engine has the authoritative viewport transform needed to convert screen → world coordinates. Hit testing against domain shapes requires reading from `projectStore`, which the engine already holds. Adding it to a renderer would invert the dependency.

## Risks / Trade-offs

- **[Risk] Spec drift from BEAM docs** → Mitigation: spec scenarios explicitly reference BEAM IDs; any BEAM doc update should trigger a spec delta.
- **[Risk] Tool pointer event handling differs across mouse/touch** → Mitigation: `canvas-interaction-tools` spec covers both mouse and touch paths separately.
- **[Risk] Domain renderer specs are too prescriptive about visual style** → Mitigation: specs use WHEN/THEN behavioral language; pixel-level appearance is left to the LLD.
- **[Risk] Hit testing order sensitivity** → Mitigation: spec defines explicit precedence order (features > zones > property vertices > house > empty).
