---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-02b-vision', 'step-02c-executive-summary', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish', 'step-12-complete']
workflow_completed: true
classification:
  projectType: 'web_app'
  domain: 'general'
  complexity: 'medium'
  projectContext: 'greenfield'
inputDocuments: ['product-brief-gardening-2026-03-19.md', 'brainstorming-session-2026-03-19-1012.md']
workflowType: 'prd'
documentCounts:
  briefs: 1
  research: 0
  brainstorming: 1
  projectDocs: 0
  projectContext: 0
---

# Product Requirements Document - gardening

**Author:** Bob
**Date:** 2026-03-22

## Executive Summary

A privacy-first, offline-first web application for mapping, tracking, and managing home gardens. Users trace their property over satellite imagery — or draw it manually on a scaled grid — then populate it with nested garden zones, structures, and plants. Every interaction follows a progressive detail model: a plant can be "tomato" or "Super Sweet 100 from Baker Creek, planted March 15, amended with 10-10-10." The depth of input determines the depth of the experience.

The app stores all data locally on the user's device. There are no accounts, no servers, and no cloud storage. Privacy is enforced by architecture, not by policy — the application physically cannot transmit user data because it has no server to transmit it to. This is the core trust proposition: the app exists to help people garden, and the architecture guarantees that is all it does.

An event-sourced data model preserves every change as an immutable record. This enables universal undo, seasonal comparison, time period planning, and a complete replayable history of the garden across years. An opt-in daily guide surfaces watering schedules, fertilizer reminders, and journal follow-ups with a three-tier severity model. Quick capture tools allow logging pest sightings, harvests, and observations in under 15 seconds from the garden.

The MVP targets web browsers (desktop and mobile). Future phases add multi-device sync over local networks, online plant databases, weather integration, an on-device LLM for natural language data queries, and native mobile/desktop apps.

### What Makes This Special

**Satellite-assisted property setup in under 30 minutes.** The onboarding experience is the first differentiator. Users see their actual property from satellite view, trace the boundary, and the app assists with detecting structures and features. Within a single session, a user has a visual map that looks like their garden — not a generic template. This moment of recognition ("that's my yard") is what earns continued use.

**Privacy through architecture, not promises.** Every competing tool either requires an account, stores data in the cloud, or both. This app cannot access user data because it never leaves the device. The open source codebase is the proof. Users who distrust data-collecting apps — a growing segment — have no alternative that offers this level of architectural guarantee combined with a rich feature set.

**Progressive detail without modes or settings.** The app adapts to the user's investment level invisibly. There is no beginner mode or expert mode. A casual gardener who logs "tomato, bed 2, done" and a meticulous tracker who records variety, source, soil amendment, fertilizer brand, cost, and yield both use the same interface. The difference is entirely in how much they choose to enter.

## Project Classification

- **Project Type:** Web Application (PWA potential)
- **Domain:** General — gardening/agriculture, no regulatory requirements
- **Complexity:** Medium — technically ambitious (event sourcing, offline-first, satellite integration) but no compliance burden
- **Project Context:** Greenfield — new product, no existing codebase

## Success Criteria

### User Success

- **30-minute onboarding** — a new user completes property setup with satellite detection, places at least one zone and one plant, in a single session under 30 minutes
- **15-second quick capture** — logging a pest sighting, harvest, or observation from the garden takes under 15 seconds including entity tagging
- **Seasonal return** — users return the following growing season and build on their existing data rather than starting over or abandoning the app
- **Household adoption** — when one person sets up a property, at least one household member actively uses the app alongside them (post-MVP, once sync is available)
- **Progressive depth adoption** — users who start with minimal input (name-only plants, no schedules) gradually add more detail as they experience the value of richer data

### Business Success

- **Open source community health** — active contributors, meaningful issue engagement, and pull requests from outside the core team within the first 12 months
- **Cross-season retention** — users active in season N return in season N+1, indicating the app's value compounds over time
- **Onboarding completion rate** — majority of users who start property setup finish it in their first session
- **Export adoption** — users export their data at least once, indicating awareness of and trust in the data portability model

### Technical Success

- **Page load under 2 seconds** — for any garden size, including large properties with 50+ zones, hundreds of plants, and years of event history
- **Responsive drawing tools** — polygon drawing, snap, and zoom feel smooth on both desktop and mobile browsers with no perceptible lag
- **Event log integrity** — zero data loss under normal operation; committed events survive app crashes and restarts
- **Offline-first reliability** — all features function identically with no network connection; no degraded states, no loading spinners waiting for a server

### Measurable Outcomes

| Metric | Target | Measurement |
|--------|--------|-------------|
| Property setup time | < 30 minutes | Time from app open to first zone + plant placed |
| Quick capture time | < 15 seconds | Time from tapping quick capture to submission |
| Page load (large garden) | < 2 seconds | Time to interactive for property with 50+ zones |
| Drawing responsiveness | < 16ms frame time | Smooth 60fps during polygon drawing and pan/zoom |
| Event durability | 0 data loss | No committed events lost on crash or restart |
| Cross-season retention | > 50% | Users active in year 1 who return in year 2 |

## Design Principles

- **Tool, not coach** — The app records what the user tells it and surfaces what they ask to see. It does not diagnose plant problems, recommend actions, gamify usage, or nag for attention. The gardener is the expert; the app is the notebook.
- **Progressive detail** — Every entity and interaction accepts minimal input by default with optional depth available. No beginner/expert modes. The user's level of input naturally determines the app's level of output.
- **Privacy by architecture** — Privacy is not a policy or a setting. The app has no server, no accounts, and no network capability in its core. User data physically cannot leave the device. This is a structural guarantee, not a promise.
- **Respect the user's time and attention** — The app earns daily use by being genuinely useful, not by demanding engagement. No streaks, no badges, no "you haven't logged in 3 days" notifications. Features are available when sought, silent when not.

## User Journeys

### Journey 1: Bob Sets Up His Property (Setup — Happy Path)

**Opening Scene:** It's early March. Bob just installed the app on his laptop. He's been gardening for a few years but has never tracked anything — it's all in his head. Last year he planted three tomato varieties and can't remember which one produced well. He also forgot to fertilize the garlic bed and the harvest was disappointing. He's tired of repeating the same experiments.

**Rising Action:** Bob opens the app and creates a new property. He enters his address and the satellite view loads — he can see his house, the backyard, the shed, the fence line. He traces his property boundary in about 20 clicks, following the fence. The app highlights detected features: "Is this your house? This looks like a shed. This could be a driveway." He confirms the house and shed, dismisses the neighbor's tree that bled into the frame, and manually draws the garden beds the satellite can't distinguish from lawn.

He classifies each shape — the house becomes a structure, the four rectangles in the back become zones labeled "Raised Bed 1" through "Raised Bed 4," the area along the fence becomes "Garlic Bed." He sets soil type on the parent "Backyard Garden" zone and all the beds inherit it. He overrides Raised Bed 2 where he amended with compost last fall.

He adds his first plants — Cherokee Purple, Sun Gold, and Super Sweet 100 tomatoes in Bed 1, using the row tool to place six of each with proper spacing. For each, he types the variety name and source. It takes about 3 taps per plant after the first one.

**Climax:** Bob zooms out and sees his property on screen — his house, his beds, his plants, all in the right places. It looks like his yard. He's 22 minutes in. He sets a watering schedule on the backyard zone and a fertilizer reminder on the garlic bed. He didn't have to create an account, agree to terms, or give anyone his email.

**Resolution:** Bob closes the laptop. He has a complete map of his garden with 18 plants tracked, schedules set, and the beginning of a record he can build on all season. Next Saturday, he'll log his first activity.

---

### Journey 2: Sarah & James Start Their First Garden (Setup — Beginner Path)

**Opening Scene:** Sarah and James just bought their first house. The backyard is a blank slate — just lawn and a few trees. They want to grow vegetables but don't know where to start. Sarah downloaded the app after reading about it on a gardening forum. She's on her phone in the kitchen.

**Rising Action:** Sarah creates a property and uses the satellite view. She traces the yard boundary — it's rough, she misses a corner and drags it into place. The app detects the house and the two big trees. She confirms them. There are no garden beds yet because they haven't built any.

She taps "Add Zone" and draws a rectangle where they're thinking of putting a raised bed — between the trees where it gets afternoon sun. She names it "First Bed" and skips all the optional detail. She doesn't know the soil type and doesn't enter one. The app doesn't complain.

She adds "tomato" to the bed. Just "tomato" — no variety, no source, no date. The app creates it. She adds "basil" and "pepper" the same way. Three plants, three taps, no friction.

**Climax:** James looks over her shoulder. "That's our yard!" He can see the house, the trees, the bed she placed. It feels real even though it's simple. Sarah sets a watering reminder — every other day — because that's what the internet said tomatoes need. The daily guide will remind her starting tomorrow.

**Resolution:** Their garden plan exists for the first time outside their heads. It took 15 minutes. Next week, when they actually build the raised bed, they'll update the dimensions. When they learn their tomato is actually a "Better Boy," they'll add the variety. The app will grow with their knowledge.

---

### Journey 3: Bob Tracks a Saturday Morning (Daily Use — Mid-Season)

**Opening Scene:** It's June. Bob has been using the app for three months. He's got 30 plants across 6 zones, a fertilizer schedule, and a few weeks of journal entries. It's Saturday morning, coffee in hand, heading to the garden.

**Rising Action:** Bob opens the app. The daily guide shows:
- **HIGH:** Watering missed yesterday for Raised Bed 1 and 2 (escalated — second day missed)
- **MEDIUM:** Fertilizer due for Garlic Bed (one day overdue)
- **LOW:** Journal reminder — "Check tomato leaves for yellowing" (he logged this 5 days ago with a note to follow up)

He starts with watering. Walks to Bed 1, turns on the hose, taps "Done" on the watering task. Same for Bed 2. Four taps total.

He grabs the fertilizer, heads to the garlic bed, applies it. Taps "Done" — the app asks if he wants to add detail. He types "10-10-10, 2 cups" and taps save. Six seconds.

At the tomato bed, he checks the leaves. The follow-up reminder shows his original note from Tuesday. The yellowing has spread. He hits quick capture → Pest/Disease → Disease → "Possible early blight" → tags it to Cherokee Purple in Bed 1. He adds "yellowing spreading to lower leaves, removing affected foliage." Twelve seconds.

**Climax:** Walking back inside, he taps into zone focus mode for Bed 1. He sees the Cherokee Purple's full history — planted April 2, fertilized three times, this is the second disease note. He thinks "last year I had the same problem but I can't remember what I did." Except now, next year, he'll have this record.

**Resolution:** Saturday morning garden work: 25 minutes physical, 90 seconds in the app. Three tasks completed, one disease logged, everything timestamped and tagged to the right plants. The daily guide is clear for tomorrow.

---

### Journey 4: Marcus Enters a Full Season of Data (Power User — Bulk Workflow)

**Opening Scene:** Marcus has been tracking his garden in spreadsheets for two years. He just set up his property in the app — 12 raised beds on a quarter-acre lot. Now he wants to enter his 40 plants with full detail: variety, source, planting date, spacing, companion planting notes, and cost.

**Rising Action:** Marcus enters Bed 1 and uses the row tool — 8 tomato plants, 18-inch spacing. The app places them along the row. For the first plant, he enters full detail: "Cherokee Purple, Baker Creek Seeds, planted April 5, $3.50 per packet, 24-inch mature spread." He enters the rest quickly — same variety, same source, just placement changes.

He moves to Bed 2. Different varieties. He enters each with source, cost, and planting date. The two-phase creation lets him place plants quickly first, then circle back to add detail on the ones he cares about most. Some herbs he just enters as "basil" — he'll enrich later if he feels like it.

He sets up schedules: watering every 2 days for tomatoes, weekly for herbs, biweekly fertilizer across all beds. Each schedule is set at the zone level and inherits down. He overrides the watering schedule on the drought-tolerant bed.

**Climax:** After 45 minutes, Marcus has 40 plants with full provenance, cost tracking across all beds, and schedules that will feed his daily guide. He navigates to the property view and sees his entire garden laid out with precise plant placement. He realizes he can already answer "how much have I spent on seeds this season?" — the cost rollup shows $127 across 12 beds.

**Resolution:** Marcus will never go back to spreadsheets. The spatial mapping alone is worth the switch — he can see his companion planting layout, his crop rotation across time periods, and his cost breakdown by zone. When harvest season comes, he'll log yields and know exactly which varieties earned their keep.

---

### Journey 5: Bob Returns After Winter (Seasonal Return)

> **Note:** This journey uses time periods and period comparison, which are deferrable from MVP. The core seasonal return experience (reopening the app, reviewing history, making data-driven decisions) works without time periods. Time period features enhance the planning workflow when implemented.

**Opening Scene:** It's February. Bob hasn't opened the app since November. The garden was put to bed — garlic planted, beds mulched, everything dormant. He's starting to think about spring planning.

**Rising Action:** Bob opens the app. The daily guide is empty — nothing scheduled, nothing overdue. "Nothing scheduled for today." Clean slate, no guilt.

He navigates to the property map. Everything is where he left it — all six zones, all the plants from last season, every journal entry. He taps into the garlic bed and scrolls through the event history: planted October 15, mulched November 2, no issues logged. Good.

He creates a new time period — "Spring 2027." It inherits the current state: all zones and structures carry over. He starts modifying the plan: moving tomatoes from Bed 1 to Bed 3 for crop rotation, removing last year's spent annuals, adding new varieties he wants to try. None of this touches the 2026 record.

He opens the period comparison view. Side by side: 2026 actuals vs 2027 plan. Tomatoes moved, garlic bed unchanged, two new herb varieties added. The diff is clear.

**Climax:** Bob pulls up the 2026 event history for his tomato bed. Cherokee Purple: 12 harvests, first harvest July 28, last September 15, disease logged twice. Sun Gold: 18 harvests, no disease. Super Sweet 100: 8 harvests, pest issue in August. The data makes the decision for him — more Sun Gold this year, try a different cherry variety instead of Sweet 100.

**Resolution:** Spring planning done in one evening session. The 2026 record is preserved intact. The 2027 plan is ready to become the current period when planting starts. Bob's garden has a memory now — and it's helping him make better decisions.

---

### Journey 6: Error Recovery — Accidental Deletion

**Opening Scene:** Bob is reorganizing zones after building a new raised bed. He's moving plants around and accidentally deletes "Raised Bed 2" — the zone with 8 plants, 3 months of journal entries, harvest records, and cost data.

**Rising Action:** The zone disappears from the map. Bob's stomach drops. Three months of tracking, gone.

He navigates to Settings → Deleted Items. There it is: "Raised Bed 2, deleted 2 minutes ago." He taps it and sees a preview — all 8 plants, all events, all data intact. The soft delete preserved everything except photos (not applicable in MVP).

**Climax:** He taps "Restore." The zone reappears on the map, in its original position, with all plants, events, and history intact. A compensating event is written to the log: "Raised Bed 2 restored."

**Resolution:** Nothing was lost. The event-sourced architecture means deletion is just another event that can be countered. Bob's trust in the app increases — he can be bold with reorganization because mistakes are reversible.

### Journey Requirements Summary

| Journey | Key Capabilities Revealed |
|---------|--------------------------|
| Bob Setup | Satellite tracing, feature detection, zone creation, plant placement tools, schedule creation, progressive detail |
| Sarah & James Setup | Minimal input path, skip-friendly flows, plain language, beginner-accessible entity creation |
| Bob Daily Use | Daily guide with severity, quick capture with classification, zone focus mode, journal reminders, completion logging |
| Marcus Bulk Entry | Row/grid placement tools, efficient multi-plant entry, cost tracking, schedule inheritance, hierarchy rollup |
| Bob Seasonal Return | Time period creation, plan inheritance, period comparison, event history review, seasonal decision-making |
| Error Recovery | Soft delete, deleted items view, restore with compensating events, event-sourced undo |

## Web Application Requirements

### Project-Type Overview

Single Page Application (SPA) built as a Progressive Web App (PWA). The entire application loads once and runs client-side in the browser. All navigation between views (map, daily guide, zone focus, settings) happens without page reloads. A service worker provides offline caching so the app functions identically with or without network connectivity. PWA capabilities enable install-to-homescreen on mobile devices, providing a native app feel without app store distribution.

No server-side rendering. No backend API. No database server. All data persists in browser-local storage (IndexedDB or equivalent). The app is a static asset bundle served from any web host or opened as a local file.

### Browser Support

| Browser | Support Level |
|---------|--------------|
| Chrome (desktop + mobile) | Full support — primary development target |
| Firefox (desktop + mobile) | Full support |
| Safari (desktop + iOS) | Full support — critical for iPhone/iPad PWA install |
| Edge (desktop) | Full support |

Legacy browsers (IE11, pre-Chromium Edge) are not supported. Minimum target: browsers supporting ES2020+, IndexedDB, Service Workers, and Canvas API.

### Technical Architecture Considerations

**Client-Side Only**
- Zero server dependencies — no API calls required for core functionality
- All computation (event replay, hierarchy rollup, schedule calculation) runs in the browser
- Static asset deployment — any CDN, static host, or local file server works

**Offline-First via PWA**
- Service worker caches all application assets on first load
- Subsequent loads work fully offline
- All data stored in IndexedDB (or equivalent local storage)
- No network-dependent loading states, spinners, or degraded modes

**Performance Constraints**
- Page load to interactive: < 2 seconds for any garden size
- Drawing canvas: 60fps (< 16ms frame time) during polygon drawing, pan, and zoom
- Event log queries: responsive with years of accumulated data
- Must perform well on 8GB RAM laptops and mid-range mobile devices

**Data Storage**
- IndexedDB as primary storage for event log and entity state
- Event-sourced model: append-only writes, computed reads
- UUIDs on all entities and events
- Storage must handle thousands of events without degradation

**Canvas and Drawing**
- HTML5 Canvas or WebGL for map rendering
- Must support: polygon drawing, bezier curves, pinch-to-zoom, touch events, mouse events
- Satellite imagery integration via mapping tile service (requires online connection for initial load, then cached)

### Implementation Considerations

**SEO**
- Not applicable for the application itself
- Landing page (future, not MVP) would be a separate static site with SEO optimization

**Real-Time**
- No real-time features — all data is local, no collaboration server
- No WebSocket or SSE requirements

**Accessibility**
- Deferred to post-MVP
- Architecture should not prevent future accessibility work (semantic HTML where practical, no canvas-only interaction for non-drawing features)

**PWA Installation**
- Web app manifest for install-to-homescreen
- Service worker for offline asset caching
- App icon and splash screen assets
- Targets mobile browsers for home screen installation as an alternative to native apps in MVP

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Experience MVP — deliver the core experience of mapping a property and tracking a garden well enough that a single user would choose this over memory or a notebook. The MVP proves that satellite-assisted setup, progressive detail, and event-sourced history create a meaningfully better gardening workflow.

**Resource Requirements:** Solo developer (Bob), building for personal use and fun. No timeline pressure. Quality over speed. Open source from the start, contributors welcome but not expected.

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**
- Property setup via satellite tracing or manual grid drawing (Journeys 1, 2)
- Daily garden tracking with quick capture and daily guide (Journey 3)
- Power user bulk entry with row/grid tools (Journey 4)
- Seasonal return with event history (Journey 5 — basic history view; time period planning deferred)
- Error recovery via soft delete and restore (Journey 6)

**Must-Have Capabilities:**
- Property creation with satellite image tracing and assisted feature detection
- Manual grid drawing as alternative/fallback
- Point-to-point polygon drawing with straight/curved segments, snap, loupe
- Hierarchical zone nesting with inheritance and overrides
- Structures, features, and plants with precise placement
- Two-phase entity creation (quick create then optional detail)
- Activity journal with progressive detail
- Quick capture with hierarchical classification
- Schedules (watering, fertilizing, recurring activities)
- Harvest logging with optional detail
- Outbreak tracking across entities
- Notes on every entity
- Opt-in daily guide with severity model, grouping, reminders, rollover
- Map navigation with breadcrumbs, two-level depth, zone focus mode
- Event-sourced architecture with universal undo and soft delete
- Privacy dashboard with permission toggles
- Guided onboarding with skip-friendly re-enterable flows
- UUIDs on every entity and event

**Deferrable from MVP if Needed:**
- Cost tracking with hierarchy rollup
- Time period layers (planning, comparison, seasonal snapshots)

### Post-MVP Features

**Phase 2 — Multi-Device & Sync:**
File-based export/import, Bluetooth and LAN sync with idempotent merge, entity ownership and conflict resolution, property comparison and diff view, sync approval with delete warnings, multi-property support

**Phase 3 — Online Features:**
Weather data pull with tiered consent, sun angle and seasonal exposure engine, plant knowledge base from public databases via extensible adapter, garden template library, auto-schedule population from plant data

**Phase 4 — Intelligence & Media:**
Lightweight on-device LLM for factual data queries and property tours, photo attachment with lazy-loaded references, natural language search across all data

**Phase 5 — Platform Expansion:**
Native mobile apps (iOS, Android), desktop apps (macOS, Windows, Linux), indoor gardening zones, zone-feature relationships, printable property maps, accessibility improvements

### Risk Mitigation Strategy

**Technical Risks:**

| Risk | Impact | Mitigation |
|------|--------|------------|
| Satellite tile provider licensing or cost | Onboarding experience degraded | Manual grid drawing as full fallback; evaluate OpenStreetMap, Mapbox free tier, and other open tile providers at implementation time |
| Feature detection quality on satellite images | Users spend more time correcting than saving | Detection is assistive only — users can dismiss all suggestions and draw manually; detection overlay is a convenience, not a dependency |
| Event log performance at scale (years of data) | Page load exceeds 2-second target | Materialized views / computed state snapshots; lazy event replay; performance testing with synthetic large datasets early |
| IndexedDB storage limits on mobile browsers | Data loss or inability to save | Monitor storage usage; warn users approaching limits; export as backup mechanism |
| Drawing canvas performance on mobile browsers | Laggy polygon drawing kills the experience | Canvas rendering optimization; test on low-end devices early; consider WebGL if Canvas underperforms |

**Market Risks:**
- Minimal — building for personal use first. Market validation is organic through open source community adoption.

**Resource Risks:**
- Solo developer, no timeline pressure. If scope needs cutting, cost tracking and time periods are the first deferrals. The core loop (map → track → history) ships without them.

## Functional Requirements

### Property Management

- FR1: User can create a new property with a name
- FR2: User can set property dimensions (known measurements or approximate)
- FR3: User can trace property boundaries over a satellite image
- FR4: User can draw property boundaries manually on a scaled grid canvas
- FR5: User can set the grid scale for the drawing canvas (feet/meters, inches/centimeters)
- FR6: User can set north orientation on their property (optional, skippable)
- FR7: User can view assisted feature detection suggestions overlaid on the satellite image
- FR8: User can accept, adjust, or dismiss each detected feature
- FR9: User can classify detected features by entity type (structure, zone, feature)
- FR10: User can browse detected features in an interactive catalog overlay
- FR11: User can re-enter any guided setup flow after initial onboarding
- FR12: User can edit property boundaries and dimensions after creation

### Drawing & Map Tools

- FR13: User can draw polygons by placing points sequentially
- FR14: User can toggle any polygon segment between straight line and curve
- FR15: User can shape curves by dragging a midpoint handle (bezier-style)
- FR16: User can configure snap-to-grid with selectable scale (1ft, 6in, 1in, freehand)
- FR17: User can toggle snap assist to nearby edges, corners, and existing boundaries
- FR18: User can place points using place-and-drag with a magnifier loupe
- FR19: User can enable two-stage drawing confirmation (preview with draggable handles before finalizing)
- FR20: User can pan and zoom the map using pinch-to-zoom and scroll
- FR21: User can close a polygon by tapping the first point

### Zone & Entity Management

- FR22: User can create zones within the property at any nesting depth
- FR23: User can create zones within other zones (hierarchical nesting)
- FR24: User can assign colors and labels to zones
- FR25: User can create structures (house, shed, greenhouse) on the property
- FR26: User can create features (trees, fences, water bodies, rocks, driveways) on the property
- FR27: User can place plants at precise positions within zones
- FR28: User can place plants individually (single drop) or in bulk (row tool with start/end/spacing, grid tool with area/spacing)
- FR29: User can create any entity with minimal input (name only) and optionally add detail afterward
- FR30: User can add optional detail to any entity at any time after creation
- FR31: Child zones inherit parent zone properties (soil type, sun exposure, schedules) by default
- FR32: User can override inherited properties on child zones with locally set values
- FR33: User can clear an override to restore the inherited value
- FR34: User can see which values are inherited vs. locally overridden
- FR35: Every entity in the system has a UUID assigned at creation

### Map Navigation

- FR36: User can tap a parent zone to zoom into it and reveal child zones
- FR37: User can navigate using a breadcrumb trail showing the current hierarchy path
- FR38: User can view a side panel list of zone contents
- FR39: The map displays the current level plus one level deeper (two-level depth rule)
- FR40: Zones too small to render at the current zoom level display as miniature indicators
- FR41: Dense clusters of entities merge into numbered badges that expand on tap or zoom
- FR42: User can enter zone focus mode to see a scoped view of one zone's plants, activity, tasks, and features

### Activity Tracking

- FR43: User can log activities (watering, fertilizing, weeding, treating, planting, harvesting, observing) against zones or plants
- FR44: User can log activities with minimal input (activity type + entity + date) and optionally add detail
- FR45: User can use quick capture via a persistent floating action button accessible from any screen
- FR46: User can classify quick capture entries using a hierarchical category dropdown (pest → type, disease → type, harvest, observation, maintenance → type)
- FR47: Quick capture templates pre-load relevant fields based on the selected category
- FR48: User can log harvests with optional quantity, weight, and quality
- FR49: User can track pest or disease events across multiple plants and zones as a single outbreak
- FR50: User can add notes to any entity at any time

### Schedules & Daily Guide

- FR51: User can create recurring schedules (watering, fertilizing, custom) on any zone or plant
- FR52: Schedules on parent zones are inherited by child zones and plants
- FR53: User can override inherited schedules on child entities
- FR54: User can opt into a configurable daily guide
- FR55: The daily guide aggregates due schedules, overdue items, and journal reminders for the current day
- FR56: Daily guide items display with a three-tier severity model (Low, Medium, High)
- FR57: Severity escalates based on configurable rules (e.g., missed watering escalates after N days)
- FR58: User can view severity escalation rules and adjust them per-zone or globally
- FR59: User can group the daily guide by severity, by zone, or by activity type
- FR60: User can mark daily guide items as done with optional detail logging
- FR61: User can attach a reminder to any journal entry ("check back in N days")
- FR62: Journal-triggered reminders appear in the daily guide with the original entry's full context
- FR63: Incomplete daily guide items prompt the user to pull forward or dismiss the next day
- FR64: User can scope the daily guide to "My Zones" or "Full Property"
- FR65: An empty daily guide displays "Nothing scheduled" with a one-time tip about schedule features

### History & Time Management

- FR66: Every change to any entity or event is stored as an immutable event in the event log
- FR67: User can undo any action via compensating events
- FR68: User can view the complete event history for any entity
- FR69: User can delete any entity (soft delete — essential data retained, recoverable)
- FR70: User can view and restore deleted entities from a deleted items recovery view
- FR71: User can move, resize, or reshape any entity without losing attached data
- FR72: User can create named time periods with start and end dates
- FR73: New time periods inherit the current state as a starting point (deferrable)
- FR74: User can compare two time periods side by side (deferrable)

### Privacy & Settings

- FR75: User can access a dedicated privacy dashboard showing all permission toggles
- FR76: User can independently toggle permissions for location, weather, and network access
- FR77: User can grant location permission and have the location stored locally for dependent features
- FR78: User can clear stored location at any time, which disables dependent features with clear messaging
- FR79: The app shows which features are available and which require additional permissions
- FR80: The app functions fully with all permissions denied — no degraded states
- FR81: No user data is transmitted to any server under any circumstances in MVP

### Data Export

- FR82: User can export the complete property data as a portable file
- FR83: The export file is self-contained and can be imported on another device (foundation for Phase 2 sync)

### Onboarding

- FR84: New users are guided through property creation with a step-by-step flow
- FR85: Every onboarding step can be skipped
- FR86: User is prompted to add their first zone after property setup (optional, skippable)
- FR87: All guided flows are accessible as tools from the main app after initial onboarding

## Non-Functional Requirements

### Performance

- NFR1: Page load to interactive state in under 2 seconds for any garden size, including properties with 50+ zones and years of event history
- NFR2: Drawing canvas maintains 60fps (< 16ms frame time) during polygon drawing, point placement, pan, and zoom on desktop and mobile browsers
- NFR3: Quick capture flow from button tap to submission completes in under 15 seconds of user time
- NFR4: Event log queries (entity history, daily guide aggregation, hierarchy rollup) return results without perceptible delay on datasets with thousands of events
- NFR5: Satellite image tiles load and render within 3 seconds on a standard broadband connection
- NFR6: App performs acceptably on devices with 8GB RAM and mid-range mobile processors

### Data Integrity & Local Security

- NFR7: Committed events in the event log survive app crashes, browser crashes, and unexpected tab closures — zero data loss for committed writes
- NFR8: IndexedDB transactions are atomic — partial writes do not corrupt the event log or entity state
- NFR9: UUIDs are globally unique with no collisions across devices (critical foundation for Phase 2 sync)
- NFR10: Soft-deleted data remains recoverable indefinitely until the user explicitly purges it
- NFR11: No user data is transmitted over the network under any circumstances in MVP — verifiable by absence of any outbound network requests from the application core

### Local Data Scalability

- NFR12: The event log and entity store handle 5+ years of continuous use (estimated 10,000+ events) without degradation below performance targets
- NFR13: IndexedDB storage usage is monitored and the user is warned when approaching browser storage limits
- NFR14: Computed state (current entity values derived from event replay) is cached or materialized to avoid full event replay on every page load
- NFR15: The two-level depth visibility rule and cluster badges prevent rendering performance degradation regardless of the number of entities on the property

### Integration

- NFR16: Satellite tile imagery loads from a third-party tile provider with graceful degradation if the provider is unavailable (manual grid drawing remains fully functional)
- NFR17: The app makes zero required network requests for core functionality — tile loading is the only network dependency and only during satellite-based property setup

### Offline Resilience

- NFR18: All application assets are cached via service worker after first load — subsequent loads work fully offline
- NFR19: No feature displays a loading spinner, error state, or degraded mode due to lack of network connectivity
- NFR20: The app is indistinguishable in behavior between online and offline states for all MVP features except satellite tile loading
