---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: ['product-brief-gardening-2026-03-19.md', 'prd.md', 'architecture.md']
---

# UX Design Specification gardening

**Author:** Bob
**Date:** 2026-03-22

---

<!-- UX design content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

### Project Vision

A privacy-first, offline-first gardening application that serves as a persistent spatial memory for everything that happens in your garden. Users map their actual property over satellite imagery — or draw it manually — then track plants, activities, harvests, pests, and schedules. Every change is preserved as an immutable event, creating a replayable, queryable timeline that compounds in value across growing seasons.

Privacy is enforced by architecture: no servers, no accounts, no data collection. The app physically cannot transmit user data. Progressive detail means the same interface serves casual trackers and obsessive record-keepers based purely on how much they choose to input.

### Target Users

**Primary Personas:**

- **The Builder-Gardener (Bob):** Intermediate gardener with technical background. Wants fast setup, quick daily logging, and depth when he chooses. Values data ownership, open source, and clean architecture. Success = property mapped in 30 minutes, harvest logged in 15 seconds, fiancee uses it too.

- **The First-Time Gardeners (Sarah & James):** No gardening experience, no terminology knowledge. Need the app to be a learning ramp — not just a tracker. Success = property mapped from satellite without measuring anything, simple plants placed without jargon, a record of their first season to build on.

- **The Detail-Oriented Tracker (Marcus):** Power user migrating from spreadsheets. Tracks varieties, sources, costs, yields, amendments. Needs bulk workflows and efficient data entry. Open source and local-only are requirements. Success = 40 plants with full detail entered efficiently, queryable history, data export.

- **The Household Partner (Bob's Fiancee):** Shares the property, not invested in the app itself. Wants to see her zones, know what needs doing today, and log quickly. The litmus test for simplicity. Success = synced property with narrated tour, daily guide scoped to her zones, never thinks about data or architecture.

### Key Design Challenges

1. **Canvas drawing tools on mobile:** Polygon drawing with bezier curves, snap-to-grid, and magnifier loupe must feel responsive and precise on phone screens where gardeners will actually be standing in their yard. Desktop precision must translate to thumb-friendly touch without losing capability.

2. **Progressive detail without cognitive overload:** Optional fields must feel inviting to power users but invisible to beginners. No empty form guilt, no beginner/expert modes — the interface adapts to input depth naturally.

3. **Onboarding that earns immediate trust:** The satellite trace + feature detection is the hero moment and the most complex interaction. If this feels janky or slow, the "that's my yard!" moment never lands. Manual grid drawing must feel like a first-class path, not a fallback.

4. **Daily guide calibration:** Defaults must feel right for casual gardeners out of the box. Three-tier severity needs to avoid becoming a nagging todo list while remaining genuinely useful for surfacing what matters.

### Design Opportunities

1. **The Saturday morning ritual:** The daily guide + quick capture loop can become a pleasant habitual routine — open, see what needs attention, head to garden, tap-tap-done. This effortless loop is where long-term retention lives.

2. **Seasonal storytelling:** Event-sourced history enables visual narratives across seasons — not just data tables, but "here's what your garden looked like last July" and "Sun Gold produced 18 harvests vs Sweet 100's 8." Making seasonal return emotionally delightful drives cross-season engagement.

3. **The "that's my yard!" setup moment:** Satellite trace with feature detection is a word-of-mouth moment. People will show their friends. Heavy polish investment here pays compound returns in organic adoption.

## Core User Experience

### Defining Experience

The core experience of the gardening app is the **daily capture loop** — the quick, lightweight interaction pattern that makes the app worth opening every day during growing season. While property setup and spatial mapping are essential foundations, the day-to-day value lives in the speed and simplicity of logging what's happening in the garden.

The defining interaction: a gardener standing in their yard, phone in one hand, logging a harvest, pest sighting, or watering completion in under 15 seconds. The app earns daily use by making this faster and more reliable than trying to remember it later.

Everything else in the app exists to support this loop: the spatial map provides navigation context for tagging captures to the right zone or plant. The daily guide surfaces what needs attention so the user doesn't have to scan all their zones. The event history is the compounding payoff — every quick capture becomes a data point that makes next season smarter.

### Platform Strategy

**Dual-context optimization, no feature gating:** All features are available on all platforms. However, each interaction context has a natural home where the experience is most polished:

- **Desktop (drawing-optimized):** Property setup, satellite tracing, zone drawing, bulk plant entry, seasonal review, schedule configuration. Mouse/keyboard precision enables fine-grained spatial work. Extended sessions (15-60 minutes). The drawing tools, canvas navigation, and detail panels are designed primarily for this context.

- **Mobile (capture-optimized):** Quick capture, daily guide review, activity logging, zone-scoped task completion. Touch-first, one-handed operation. Brief sessions (15-90 seconds). The capture flow, daily guide, and task completion are designed primarily for this context.

**No feature restrictions between platforms.** A user can draw a zone on their phone or log a quick capture on their laptop. The experience simply won't be *as refined* as on the primary platform for that task — drawing with a thumb is workable but not as precise as a mouse; quick capture with a keyboard works but doesn't have the same tap-and-done immediacy. The design invests its deepest polish where each interaction naturally happens most.

**PWA across both:** Single codebase, responsive design. The responsive strategy adapts layout and interaction priorities — mobile elevates capture entry points and daily guide visibility, desktop elevates the spatial canvas and detail panels — but never hides functionality.

**Offline-first on both:** Critical for mobile capture in the garden where connectivity is unreliable. The app must never show a spinner or degraded state when a gardener is standing at their tomato bed trying to log something.

### Effortless Interactions

**Quick capture must be effortless above all else.** This is the interaction that happens most frequently, in the least comfortable conditions (outdoors, one-handed, time-pressured). Design targets:

- **Zero navigation to capture:** Persistent floating action button accessible from any screen. One tap to begin, regardless of where the user is in the app.
- **Smart context inference:** If the user is viewing a zone, pre-select that zone for the capture. If they logged a pest yesterday, surface that category. Reduce taps by anticipating intent.
- **Minimal required fields:** Activity type + entity + timestamp is all that's required. Everything else is optional enrichment the user can add now or never.
- **Completion as reward:** Marking a daily guide item done should feel satisfying and immediate — the item clears, the list shortens, progress is visible.

**Daily guide must surface the right things without effort.** The user opens the app and immediately sees what needs attention — no scanning, no navigating, no figuring out what's overdue. The guide does the thinking; the gardener does the gardening.

**Zone navigation must be instant.** From the property map to a specific plant in a specific bed should take 2-3 taps maximum. Breadcrumbs and tap-to-zoom make the hierarchy feel flat even when it's deep.

### Critical Success Moments

1. **"That's my yard!" (Setup):** The satellite trace produces a map the user recognizes as their actual property. This moment earns trust and establishes the spatial foundation for everything that follows. Failure here means no daily use to optimize.

2. **"That was faster than remembering" (First capture):** The first time a user logs something from the garden and realizes the app took less effort than making a mental note. This is when the daily habit begins forming.

3. **"The app remembered what I forgot" (First history query):** The first time a user asks "what did I plant here?" or "when did I last fertilize?" and the answer is there. This is the compound payoff that drives seasonal return.

4. **"It knows what I need to do" (Daily guide trust):** The first morning where the daily guide surfaces exactly the right tasks — not too aggressive, not too passive. The moment the guide shifts from "a list I check" to "my garden's voice."

### Experience Principles

1. **Capture speed is sacred.** Every design decision for the daily loop is measured against the 15-second quick capture target. If a feature adds a tap to the capture flow, it must justify its existence. The gardener's time in the app should be measured in seconds, not minutes.

2. **The right context at the right time.** Desktop shows the full spatial picture for planning and precision work. Mobile shows what needs doing and makes logging instant. Don't force desktop complexity onto mobile; don't constrain desktop with mobile limitations.

3. **Progressive detail is invisible.** Optional fields are available but never visible until sought. The interface for "tomato" and "Cherokee Purple, Baker Creek, $3.50, April 5" is the same interface — the difference is entirely in what the user chooses to enter. No empty fields, no "complete your profile" prompts.

4. **Earn daily use, never demand it.** The app is useful when opened and silent when not. No streaks, no guilt, no "you haven't logged in 3 days." The daily guide shows what matters today; if nothing matters, it says "nothing scheduled" and that's perfectly fine.

5. **Every capture compounds.** Each quick log, each marked task, each harvest entry becomes a data point that makes the garden's history richer. The user may not feel this daily, but the seasonal return moment — when history answers a question memory can't — is the emotional payoff that justifies the habit.

## Desired Emotional Response

### Primary Emotional Goals

**Capable, not coached.** The app makes the gardener feel like the expert. It records what they tell it and surfaces what they ask to see. The gardener leads; the app follows. The emotional register is competence and ownership — "I'm tracking my garden well" rather than "the app is telling me what to do."

**Calm confidence.** The daily guide creates a sense of "I know what needs doing today" without anxiety about what might be missed. The app is a steady, quiet presence that earns trust through reliability and restraint. No notification pressure, no engagement manipulation, no guilt.

**Quiet pride over time.** The compounding emotional payoff — opening the app after a full season and seeing a complete record of everything that happened. Harvests logged, pests tracked, schedules kept. The feeling of being organized without having been obsessive. This pride is what drives seasonal return.

**Trust from day one.** No accounts, no permissions to wrestle, no "we value your privacy" doublespeak. The architecture is the trust. The emotional experience of first use should include a moment of relief — "I don't have to worry about what this app does with my data." This is especially powerful for users who've been burned by data-collecting apps before.

### Emotional Journey Mapping

| Stage | Desired Emotion | What Creates It |
|-------|----------------|-----------------|
| **First discovery** | Curiosity + relief | "No account needed? All local? This is different." |
| **Property setup** | Recognition + accomplishment | "That's my yard!" — the satellite trace produces something the user recognizes as theirs |
| **First daily use** | Ease + surprise | "That was faster than I expected" — quick capture takes seconds, not minutes |
| **Daily routine** | Calm confidence | The daily guide shows what matters; marking items done feels satisfying and complete |
| **Something goes wrong** | Reassurance | Accidental deletion → soft delete recovery. Missed a week → no guilt, no "you've been away" shaming. Everything is recoverable, nothing is punished |
| **Seasonal return** | Quiet pride + insight | A full season of data waiting, answering questions memory can't. The garden has a memory now |
| **Sharing with household** | Effortlessness | Sync just works. The partner sees their zones, their tasks, nothing overwhelming |

### Micro-Emotions

**Confidence over confusion:** Every interaction should reinforce that the user knows what they're doing. Labels use plain language. Inherited values are visually distinct from overridden ones. The hierarchy is navigable, never disorienting. If a user ever feels lost, the breadcrumb trail is one glance away.

**Trust over skepticism:** The privacy dashboard exists not because users need to configure it, but because transparency *is* the trust mechanism. Seeing "No network requests — all data on this device" is emotionally reassuring even if the user never changes a setting.

**Accomplishment over frustration:** Every completed action — a plant placed, a harvest logged, a daily guide item cleared — should provide a micro-moment of "done." Not gamified celebration, just clean visual confirmation. The list shortens. The check appears. The entry saves. Quiet accomplishment.

**Satisfaction over delight:** The app isn't trying to be delightful in a whimsical way. It's trying to be deeply satisfying in a workmanlike way — the feeling of a well-organized toolshed where everything is where you expect it. Delight emerges naturally from the "that's my yard!" moment and from seasonal insights, not from animations or easter eggs.

### Design Implications

- **"Capable, not coached" → No wizards, no tutorials, no tooltips that talk down.** Guided setup is available but skippable. The app is learnable through use, not through instruction. Help is discoverable when sought, invisible when not.

- **"Calm confidence" → Restrained visual language.** Muted earth tones, not bright gamified colors. Severity indicators in the daily guide use subtle differentiation (not red/yellow/green traffic lights). The interface is visually quiet so the garden data is what stands out.

- **"Quiet pride" → Surface history as narrative, not spreadsheet.** Entity history views should feel like reading a journal, not scanning a log table. "Cherokee Purple: planted April 2, first harvest July 28, 12 harvests total, disease logged twice." The story of a plant, told through its events.

- **"Trust from day one" → Privacy is visible architecture, not buried policy.** The privacy dashboard is accessible from settings, not hidden. The absence of network activity is a feature, not an omission. First-run experience should communicate "your data stays here" without making it feel like a warning.

- **"Reassurance on error" → Recovery is always one step away.** Soft delete with visible recovery path. Undo via compensating events. No confirmation dialogs that create anxiety — instead, easy reversal that creates confidence. "Go ahead, reorganize your zones. If you delete something by accident, it's in Deleted Items."

### Emotional Design Principles

1. **The app serves, it doesn't perform.** No animations for animation's sake. No loading screens with fun facts. No personality injected into error messages. The app is a tool — reliable, predictable, quietly excellent. Personality comes from the user's data, not from the interface.

2. **Silence is a feature.** When the daily guide is empty, "Nothing scheduled for today" is the right message — not "Great job!" or "Why not check on your tomatoes?" The app respects the gardener's time and attention by only speaking when it has something useful to say.

3. **Recovery beats prevention.** Rather than anxious confirmation dialogs ("Are you SURE you want to delete?"), the app makes recovery effortless. This shifts the emotional experience from "I'm afraid to make a mistake" to "I can be bold because nothing is permanent."

4. **Earned emotion, not manufactured.** The app doesn't try to make users feel good through gamification or praise. The good feelings come from the user's own data — a season of tracking, a harvest tally, a question answered by history. The app is the canvas; the gardener's work is the art.
