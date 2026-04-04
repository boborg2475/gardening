---
stepsCompleted: [1, 2, 3, 4, 5, 6]
workflow_completed: true
inputDocuments: ['brainstorming-session-2026-03-19-1012.md']
date: 2026-03-19
author: Bob
---

# Product Brief: gardening

## Executive Summary

A privacy-first gardening app that maps your property, tracks your garden, and remembers what you won't — so you never waste another growing season repeating last year's mistakes.

The app runs on web, desktop, and mobile. It works fully offline. All data stays on the user's device — no accounts, no servers, no cloud. Between household members, data syncs over local networks or file transfer — never through the internet. When connected, optional integrations pull weather data, sun angles, and plant variety information with explicit user consent.

Setup is fast: trace your property over a satellite image with assisted feature detection, or draw it manually on a grid canvas. Within 30 minutes of installing, a user can have their property mapped, zones placed, and first plants tracked. From there, daily use is lightweight — log a harvest with a tap, snap a photo of a pest and tag it to a zone, check what needs watering this morning. The app adapts to the gardener: casual users track the basics, detail-oriented growers record soil amendments, fertilizer brands, costs, and yields. The depth of input determines the depth of the experience.

The app speaks plain language throughout — no jargon, no assumed expertise. A first-time gardener exploring their first raised bed and a twenty-year veteran managing a half-acre plot both find an interface that meets them where they are. For beginners, downloaded plant data and garden templates serve as a knowledge on-ramp — not just a data convenience, but a starting point for learning what to grow and how to care for it. For power users, bulk workflows and efficient data entry tools keep detailed tracking practical at scale.

Every change is preserved as an immutable event. The garden becomes a timeline — replayable, queryable, and comparable across seasons. A lightweight on-device LLM lets users ask natural language questions about their own data, answered transparently from local records.

The app is open source. Monetization is intentionally deferred — the priority is building a tool that genuinely helps people garden, not extracting revenue from them.

---

## Core Vision

### Problem Statement

Gardening knowledge lives in the gardener's memory. What variety was planted where, which fertilizer worked, when the last frost hit, what that pest was in July — none of it is written down. When memory fails, experiments get repeated and growing seasons are wasted. For households that garden together, the problem compounds — one person's observations never transfer to the other.

Most gardeners either track nothing or abandon tracking tools that demand too much time, too much data, or too much trust.

### Problem Impact

A gardener's scarcest resource is growing seasons — typically one per year for most crops. Lost knowledge means repeated mistakes, wasted money, and missed opportunities to build on what worked. Over years, the cumulative cost of forgotten lessons is significant — not just in dollars, but in the quiet frustration of knowing you solved this problem before and can't remember how.

### Proposed Solution

A self-contained gardening application that serves as a persistent, private, spatial record of everything that happens in your garden.

Users map their property visually — tracing over satellite imagery or drawing on a scaled grid canvas — then populate it with zones, structures, and plants. Zones nest to any depth, from yard sections down to individual planting positions. Every entity accepts as much or as little detail as the user wants to provide: a plant can be "tomato" or "Super Sweet 100 from Baker Creek, planted March 15, amended with 10-10-10."

The app tracks activities, schedules, costs, harvests, pests, diseases, and weather. An opt-in daily guide surfaces what needs attention without nagging. Quick capture tools let users log observations in seconds from the garden. Everything is stored as immutable events — creating a complete, replayable history that supports undo, seasonal comparison, and natural language queries through an on-device LLM.

Data syncs between household devices over Bluetooth, local network, or file transfer with idempotent merge and entity ownership. Optional online connectivity unlocks weather data, sun angles, plant databases, and garden templates — all with explicit consent and local-only storage. Plant variety data is sourced from public agricultural databases through an extensible adapter, keeping the app independent of any single data provider.

The sync model is designed for asynchronous household use — each person works independently and syncs when convenient. Real-time co-editing of the same entity from multiple devices simultaneously is not in initial scope but may be explored in the future.

### Key Differentiators

- **Privacy as identity** — no accounts, no servers, no data collection. The architecture makes data exploitation impossible, not just improbable.
- **Fast, visual property setup** — satellite tracing with assisted detection or manual grid drawing. Install to fully populated map in 30 minutes.
- **Progressive detail without modes** — the same app serves a casual tracker and an obsessive record-keeper based purely on how much they choose to input.
- **Complete history as a first-class feature** — every change preserved, every season comparable, every question answerable from your own data.
- **True local-only sync** — household devices share data without any information ever traversing the internet.

## Target Users

### Primary Users

**Persona 1: Bob — The Builder-Gardener**
- **Context:** Intermediate gardener, shares a property with his fiancee. Grows vegetables and manages multiple garden zones. Technical background — values open source, data ownership, and clean architecture.
- **Current Experience:** Tracks everything in memory. Repeats experiments because he forgets what worked. Knowledge doesn't transfer to his fiancee unless they happen to talk about it.
- **Motivation:** Wants a tool he'd actually use — fast to set up, quick to log things, but capable of depth when he wants it. Cares more about building something trustworthy than copying what exists.
- **Success Looks Like:** Property mapped in under 30 minutes. Logging a harvest or pest sighting in under 15 seconds. Being able to ask "what did I plant in Bed 2 last spring?" and getting an answer. His fiancee uses it too without being overwhelmed.

**Persona 2: Sarah & James — The First-Time Gardeners**
- **Context:** Late 20s, just bought their first home. Excited to start a garden but have no experience. iPhone users. Don't know gardening terminology like "zone," "amendment," or "NPK."
- **Current Experience:** No gardening history to track. They need help getting started as much as they need help tracking what they do.
- **Motivation:** Want to plan where to put a garden, learn what to grow in their area, and feel a sense of accomplishment from their first season.
- **Success Looks Like:** Property mapped using satellite view without needing to measure anything. Garden templates and plant database give them a starting point. The app teaches through use — they learn what "full sun" means because the app shows sun exposure for their zones. By fall, they have a record of their first season they can build on next year.

**Persona 3: Marcus — The Detail-Oriented Tracker**
- **Context:** 34, software developer, intensive raised bed gardener on a quarter-acre urban lot. Currently tracks in spreadsheets. Android and Linux user.
- **Current Experience:** Already records varieties, planting dates, yields. Frustrated by the friction of spreadsheets — no spatial mapping, no photo attachment, no easy querying. Wants structure without lock-in.
- **Motivation:** Wants to track everything — varieties, sources, costs, yields, soil amendments, pest history — and query it all. Open source and local-only storage are requirements, not nice-to-haves.
- **Success Looks Like:** Enters 40 plants with full detail efficiently using bulk workflows. Asks the LLM "which tomato variety produced the most last year?" and gets a transparent answer. Exports his data whenever he wants in a format he can read. Compares this season to last season side by side.

**Persona 4: Bob's Fiancee — The Household Partner**
- **Context:** Gardens alongside Bob, shares the property. Less invested in the app itself — uses her phone for texting, photos, and recipes. Not technical.
- **Current Experience:** Does garden work but the knowledge stays in Bob's head or hers — they don't share it systematically. Has no interest in managing an app, just wants to do her part.
- **Motivation:** Wants to see what's hers, know what needs doing today, and log things quickly when she's in the garden. Doesn't want to see Bob's tomato experiments unless she asks.
- **Success Looks Like:** Receives the property via sync, gets a narrated tour that explains what's where. Daily guide filtered to "My Zones" shows only her tasks. Logs a harvest or observation with a few taps. Never has to think about sync, data formats, or architecture.

### Secondary Users

**Community Gardeners**
- People who garden in community plots or help manage a relative's garden. They benefit from multi-property support and file-based sharing but don't need social features or cross-property awareness. They coordinate through human conversation, not through the app.

**Educators and Garden Programs**
- Teachers, community garden coordinators, or master gardener programs who might use templates to share garden plans. They benefit from template export with auto-scrubbed private data.

### User Journey

**Discovery:** Users find the app through word of mouth, open source communities, or gardening forums. The privacy-first, no-account positioning is the hook that earns initial trust.

**Onboarding (First 30 Minutes):**
- Create property → satellite trace or manual grid drawing
- Assisted feature detection identifies structures → user classifies and adjusts
- Place first zones and plants with progressive detail
- The user ends their first session with a visual map that looks like *their* garden

**Daily Use (The Saturday Morning):**
- Open app → daily guide shows what needs attention (if opted in)
- Head to garden → zone focus mode for the area you're working in
- Quick capture a pest sighting, log a harvest, mark watering done
- Each interaction takes seconds, not minutes

**Success Moment (The "Aha!"):**
- First time the user asks "what did I do last year?" and the app answers
- First seasonal comparison showing how the garden evolved
- First sync with a household member where both see the shared property from their own perspective
- First time a beginner downloads a template and realizes they have a plan

**Long-Term (Seasons 2+):**
- The app becomes the garden's memory — richer every season
- Time periods let users plan next year while preserving this year's record
- Cost and harvest rollups reveal whether the garden pays for itself
- The event log is a living history of the property across years

## Success Metrics

### User Success Metrics

- **Property setup completion** — a new user can go from install to a fully mapped property with zones and plants in under 30 minutes
- **Quick capture speed** — logging a harvest, pest sighting, or observation takes under 15 seconds
- **Seasonal return** — users come back the following growing season and build on their previous data rather than starting over
- **Household adoption** — when one person sets up a property, the household partner actually uses it too
- **Data query usefulness** — the LLM returns accurate, verifiable answers to natural language questions about the user's own data
- **Progressive depth adoption** — users who start with minimal input gradually add more detail over time as they see the value

### Business Objectives

- **Open source community health** — active contributors, issue engagement, and pull requests indicate the project is sustainable
- **User retention across seasons** — the app's value compounds over time; multi-season retention is the strongest signal of product-market fit
- **Platform coverage** — the app runs reliably on web, desktop, and mobile with consistent experience across all three
- **Performance on target hardware** — the app and local LLM perform well on budget phones and 8GB laptops, not just flagship devices

### Key Performance Indicators

- **Onboarding completion rate** — percentage of new users who finish property setup in their first session
- **Weekly active usage during growing season** — percentage of users who log at least one activity per week during their local growing season
- **Cross-season retention** — percentage of users active in season N who return in season N+1
- **Sync adoption in multi-user properties** — percentage of properties with more than one device registered
- **Export/backup rate** — percentage of users who have exported their data at least once (indicates trust and data awareness)

## MVP Scope

### Core Features

**Platform:** Web application (desktop and mobile browsers)

**Property Management**
- Create and manage properties with name and dimensions
- Satellite image tracing with assisted feature detection for property setup
- Manual grid drawing as an alternative/fallback setup path
- Adaptive grid scale (feet/meters at property level, inches/centimeters when zoomed in)
- North orientation setting (optional, skippable)

**Drawing Tools**
- Point-to-point polygon drawing with straight and curved segment toggle
- Bezier-style curves with draggable midpoint handles
- Configurable snap-to-grid with selectable scale
- Toggleable snap assist to nearby edges and boundaries
- Place-and-drag with magnifier loupe for precision on small screens
- Optional two-stage drawing confirmation
- User-customizable zone colors and labels

**Entity Management**
- Hierarchical zone nesting to any depth
- Property as root container — all entities exist within the property boundary
- Structures (house, shed, greenhouse) and features (trees, fences, water, rocks, driveways)
- Plants with precise placement within zones
- Plant placement tools — single drop, row tool, grid tool
- Two-phase entity creation — quick create then optional detail
- Cascading inheritance with override indicators
- UUIDs on every entity

**Activity Tracking**
- Activity journal with progressive detail (what + where + when, optional enrichment)
- Quick capture with hierarchical classification (pest, disease, harvest, observation, maintenance)
- Category-driven quick capture templates with pre-loaded relevant fields
- Schedules for watering, fertilizing, and other recurring activities
- Cost tracking as entity metadata with hierarchy rollup
- Harvest logging with optional quantity, weight, and quality
- Outbreak tracking across multiple plants and zones
- Notes on every entity

**Daily Guide**
- Opt-in configurable daily guide
- Three-tier severity model (Low, Medium, High) with configurable escalation
- Flexible grouping — by severity, zone, or activity type
- Journal-triggered reminders with full context recall
- Rollover tasks with user control
- Scope selector — My Zones or Full Property
- Graceful empty state with one-time feature discovery tip

**Map Navigation**
- Tap-to-zoom navigation with breadcrumb trail
- Two-level depth visibility rule
- Progressive detail reveal with smooth animations
- Miniature zone indicators for too-small zones
- Cluster badges for dense areas
- Zone focus mode

**History & Time**
- Event-sourced architecture — every change is an immutable event
- Universal undo via compensating events
- Time period layers — current, planning, and historical
- Planning periods inherit current state
- Period comparison view
- Soft delete with recovery view
- Non-destructive entity repositioning

**Privacy Framework**
- Transparent opt-in/out privacy dashboard
- Permission toggles for location, weather, network (infrastructure ready for post-MVP online features)
- Graceful feature degradation with clear indicators
- Location-once-then-local pattern
- No accounts, no servers, no data collection

**Onboarding**
- Guided property setup with satellite trace
- Assisted feature detection from satellite image
- Detection overlay as interactive catalog
- Entity type assignment after detection
- Manual draw over satellite fallback
- Skip-friendly guided setup — every step skippable, re-enterable later
- Optional first zone prompt

### Out of Scope for MVP

- **Mobile and desktop native apps** — web-first; native apps follow after core is validated
- **Sync and multi-device** — no Bluetooth, LAN, or file-based sync in v1; single-device only
- **Local LLM** — no conversational data queries or narrated property tours
- **Online features** — no weather data pull, sun angle calculations, plant database, or garden templates
- **Photo attachment** — no media storage, thumbnails, or image management
- **Multi-property support** — single property per instance in MVP
- **Indoor gardening** — house as gardening zone with floors/rooms deferred
- **Printable maps** — export to PDF deferred
- **Accessibility features** — deferred to post-MVP
- **Auto-export to cloud storage** — backup via manual file export only in MVP

### MVP Success Criteria

- A user completes property setup with satellite detection in under 30 minutes
- Drawing tools feel responsive and precise on both desktop browsers and mobile browsers
- Activity logging via quick capture takes under 15 seconds
- The daily guide surfaces relevant tasks without manual review of all zones
- Event history enables undo and seasonal comparison without data loss
- The privacy dashboard is functional and clear even before online features exist
- The app runs performantly on an 8GB laptop in a modern browser

### Future Vision

**Phase 2 — Multi-Device & Sync**
- File-based export/import
- Bluetooth and LAN sync with idempotent merge
- Entity ownership and conflict resolution
- Property comparison and diff view
- Sync approval with delete warnings
- Multi-property support

**Phase 3 — Online Features**
- Weather data pull with tiered consent
- Sun angle and seasonal exposure engine
- Plant knowledge base from public databases via extensible adapter
- Garden template library
- Auto-schedule population from plant data

**Phase 4 — Intelligence & Media**
- Lightweight on-device LLM for factual data queries and property tours
- Photo attachment with lazy-loaded references
- Natural language search across all data

**Phase 5 — Platform Expansion**
- Native mobile apps (iOS, Android)
- Desktop apps (macOS, Windows, Linux)
- Indoor gardening zones
- Zone-feature relationships
- Printable property maps
- Accessibility improvements
